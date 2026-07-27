import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

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

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
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
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      maxUsesTotal,
      perUserLimit,
      applicableDoctorId,
      consultationType,
      startDate,
      expiryDate,
    } = body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required coupon fields: code, discountType, discountValue, expiryDate' },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 400 });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType.toUpperCase(),
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal) : 100,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        applicableDoctorId: applicableDoctorId || null,
        consultationType: consultationType || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        expiryDate: new Date(expiryDate),
        isActive: true,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_CREATE_COUPON',
        metadata: JSON.stringify({ couponId: newCoupon.id, code: cleanCode, discountType, discountValue }),
      },
    });

    return NextResponse.json({
      message: 'Coupon created successfully!',
      coupon: newCoupon,
    });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive, maxUsesTotal, expiryDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (maxUsesTotal !== undefined) updateData.maxUsesTotal = parseInt(maxUsesTotal);
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Coupon updated successfully!',
      coupon: updatedCoupon,
    });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
