import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

async function verifyPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'PATIENT') return null;
  return payload;
}

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, scheduledAt, type, familyMemberId } = body;

    if (!doctorId || !scheduledAt || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, scheduledAt, type' },
        { status: 400 }
      );
    }

    // Look up the doctor's actual fee from the database — NEVER trust client-sent amounts
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile || !doctorProfile.isApproved) {
      return NextResponse.json(
        { error: 'This physician cannot accept consultations at this time.' },
        { status: 400 }
      );
    }

    const amountInPaisa = Math.round(doctorProfile.feePerConsult * 100);

    // Create a Stripe PaymentIntent with the server-side authoritative amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaisa,
      currency: 'inr',
      metadata: {
        patientId: patient.userId,
        doctorId,
        scheduledAt,
        type,
        familyMemberId: familyMemberId || '',
        feePerConsult: doctorProfile.feePerConsult.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: doctorProfile.feePerConsult,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
