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
    const { doctorId, scheduledAt, type, familyMemberId, couponCode } = body;

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

    let finalFee = doctorProfile.feePerConsult;
    let discountAmount = 0;
    let appliedCouponId: string | null = null;

    // Validate coupon code server-side if provided
    if (couponCode) {
      const codeUpper = String(couponCode).trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: codeUpper },
      });

      const now = new Date();
      if (
        coupon &&
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.expiryDate &&
        coupon.usedCount < coupon.maxUsesTotal &&
        (!coupon.applicableDoctorId || coupon.applicableDoctorId === doctorId) &&
        (!coupon.consultationType || coupon.consultationType === type) &&
        finalFee >= coupon.minOrderValue
      ) {
        // Check per-user limit
        const userUsageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId: patient.userId },
        });

        if (userUsageCount < coupon.perUserLimit) {
          if (coupon.discountType === 'FLAT') {
            discountAmount = Math.min(coupon.discountValue, finalFee);
          } else if (coupon.discountType === 'PERCENT') {
            const rawDiscount = finalFee * (coupon.discountValue / 100);
            discountAmount = coupon.maxDiscountAmount
              ? Math.min(rawDiscount, coupon.maxDiscountAmount)
              : rawDiscount;
          }

          discountAmount = Math.round(discountAmount * 100) / 100;
          finalFee = Math.max(0, finalFee - discountAmount);
          appliedCouponId = coupon.id;
        }
      }
    }

    const amountInPaisa = Math.round(finalFee * 100);

    // Create a Stripe PaymentIntent with the server-side authoritative discounted amount
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
        discountAmount: discountAmount.toString(),
        finalFee: finalFee.toString(),
        couponCode: couponCode || '',
        couponId: appliedCouponId || '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: finalFee,
      originalAmount: doctorProfile.feePerConsult,
      discountAmount,
      couponCode: couponCode || null,
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
