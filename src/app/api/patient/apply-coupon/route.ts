import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

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
    const { code, doctorId, consultationType } = body;

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const couponCode = String(code).trim().toUpperCase();

    // Look up coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return NextResponse.json({ error: 'This coupon is not active yet' }, { status: 400 });
    }
    if (now > coupon.expiryDate) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUsesTotal) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Check per-user limit
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId: patient.userId,
      },
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
    }

    // Check doctor applicability
    if (coupon.applicableDoctorId && coupon.applicableDoctorId !== doctorId) {
      return NextResponse.json(
        { error: 'This coupon is not applicable for the selected doctor' },
        { status: 400 }
      );
    }

    // Check consultation type applicability
    if (coupon.consultationType && coupon.consultationType !== consultationType) {
      return NextResponse.json(
        { error: `This coupon is only applicable for ${coupon.consultationType} consultations` },
        { status: 400 }
      );
    }

    // Look up doctor fee for server-side subtotal calculation
    let subtotal = 0;
    if (doctorId) {
      const doc = await prisma.doctorProfile.findUnique({
        where: { userId: doctorId },
      });
      if (doc) {
        subtotal = doc.feePerConsult;
      }
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` },
        { status: 400 }
      );
    }

    // Calculate discount amount server-side
    let discountAmount = 0;
    if (coupon.discountType === 'FLAT') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'PERCENT') {
      const rawDiscount = subtotal * (coupon.discountValue / 100);
      discountAmount = coupon.maxDiscountAmount
        ? Math.min(rawDiscount, coupon.maxDiscountAmount)
        : rawDiscount;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      subtotal,
      finalAmount,
    });
  } catch (error: any) {
    console.error('Apply coupon error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}
