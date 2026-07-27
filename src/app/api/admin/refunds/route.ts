import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const refunds = await prisma.refundRecord.findMany({
      include: {
        payment: {
          include: {
            appointment: {
              include: {
                patient: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
                doctor: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ refunds });
  } catch (error: any) {
    console.error('Fetch refunds error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, amount, reason, refundType } = body;

    if (!paymentId || !amount || !reason || !refundType) {
      return NextResponse.json(
        { error: 'Missing required refund fields: paymentId, amount, reason, refundType' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        appointment: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (payment.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Only successful payments can be refunded' }, { status: 400 });
    }

    const refundAmount = parseFloat(amount);
    if (refundAmount <= 0 || refundAmount > payment.amount) {
      return NextResponse.json(
        { error: `Refund amount must be between ₹1 and ₹${payment.amount}` },
        { status: 400 }
      );
    }

    let stripeRefundId: string | null = null;

    if (refundType === 'FULL' || refundType === 'PARTIAL') {
      // Execute Stripe refund if gatewayRefId exists and is not a mock ID
      if (payment.gatewayRefId && payment.gatewayRefId.startsWith('pi_')) {
        try {
          const stripeRefund = await stripe.refunds.create({
            payment_intent: payment.gatewayRefId,
            amount: Math.round(refundAmount * 100), // convert to paisa
            reason: 'requested_by_customer',
          });
          stripeRefundId = stripeRefund.id;
        } catch (stripeError: any) {
          console.error('Stripe refund execution failed:', stripeError);
          return NextResponse.json(
            { error: `Stripe processing error: ${stripeError.message}` },
            { status: 500 }
          );
        }
      }
    } else if (refundType === 'WALLET_CREDIT') {
      // Credit patient's wallet balance
      const patientId = payment.appointment.patientId;
      await prisma.$transaction(async (tx: any) => {
        const wallet = await tx.wallet.upsert({
          where: { userId: patientId },
          update: { balance: { increment: refundAmount } },
          create: { userId: patientId, balance: refundAmount },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.userId,
            type: 'REFUND',
            amount: refundAmount,
            description: `Refund for Appointment #${payment.appointmentId}: ${reason}`,
            referenceId: payment.id,
          },
        });
      });
    }

    // Record refund in DB
    const refundRecord = await prisma.refundRecord.create({
      data: {
        paymentId: payment.id,
        amount: refundAmount,
        reason,
        refundType,
        processedBy: admin.userId,
        stripeRefundId,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_ISSUE_REFUND',
        targetUserId: payment.appointment.patientId,
        metadata: JSON.stringify({
          refundId: refundRecord.id,
          paymentId: payment.id,
          amount: refundAmount,
          reason,
          refundType,
        }),
      },
    });

    return NextResponse.json({
      message: 'Refund issued successfully!',
      refund: refundRecord,
    });
  } catch (error: any) {
    console.error('Issue refund error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
