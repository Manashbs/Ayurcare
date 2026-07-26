import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { patientId, doctorId, scheduledAt } = paymentIntent.metadata;

  // Find the payment record by the Stripe PaymentIntent ID
  const payment = await prisma.payment.findFirst({
    where: { gatewayRefId: paymentIntent.id },
    include: { appointment: true },
  });

  if (!payment) {
    console.error(`No payment found for PaymentIntent ${paymentIntent.id}`);
    return;
  }

  if (payment.status === 'SUCCESS') {
    // Already processed (idempotency guard)
    return;
  }

  // Update payment and appointment in a transaction
  await prisma.$transaction(async (tx: any) => {
    // Mark payment as SUCCESS with the real Stripe amount
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        amount: paymentIntent.amount / 100, // Convert from paisa to rupees
        commission: (paymentIntent.amount / 100) * 0.15,
      },
    });

    // Confirm the appointment
    await tx.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: 'CONFIRMED' },
    });

    // Notify the doctor
    if (doctorId) {
      const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();
      await tx.notification.create({
        data: {
          userId: doctorId,
          message: `New consultation confirmed for ${scheduledDate.toLocaleString()}. Payment verified.`,
          type: 'APPOINTMENT',
        },
      });
    }
  });

  // Send confirmation emails
  try {
    if (patientId && doctorId) {
      const [patUser, docUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: patientId } }),
        prisma.user.findUnique({ where: { id: doctorId } }),
      ]);

      if (patUser && docUser) {
        const meetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayurcare-delta.vercel.app'}/meet/${payment.appointmentId}`;
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();

        try {
          const { sendAppointmentConfirmationEmail } = require('@/lib/email');
          await sendAppointmentConfirmationEmail({
            toEmail: patUser.email,
            recipientName: patUser.name,
            doctorName: docUser.name,
            patientName: patUser.name,
            scheduledAt: scheduledDate,
            meetUrl,
            isDoctor: false,
          });
          await sendAppointmentConfirmationEmail({
            toEmail: docUser.email,
            recipientName: docUser.name,
            doctorName: docUser.name,
            patientName: patUser.name,
            scheduledAt: scheduledDate,
            meetUrl,
            isDoctor: true,
          });
        } catch (emailError) {
          console.error('Failed to send confirmation emails:', emailError);
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to send confirmation emails:', emailError);
  }

  console.log(`Payment ${paymentIntent.id} succeeded — appointment ${payment.appointmentId} confirmed.`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { gatewayRefId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`No payment found for failed PaymentIntent ${paymentIntent.id}`);
    return;
  }

  if (payment.status === 'FAILED') {
    return; // Already processed
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    await tx.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: 'CANCELLED' },
    });
  });

  console.log(`Payment ${paymentIntent.id} failed — appointment ${payment.appointmentId} cancelled.`);
}
