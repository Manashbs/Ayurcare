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

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter.toUpperCase();
    }

    const payouts = await prisma.payoutBatch.findMany({
      where: whereClause,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payouts });
  } catch (error: any) {
    console.error('Fetch payouts error:', error);
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
    const { doctorId, amount, payoutMethod } = body;

    if (!doctorId || !amount || !payoutMethod) {
      return NextResponse.json(
        { error: 'Missing required payout fields: doctorId, amount, payoutMethod' },
        { status: 400 }
      );
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    const newPayout = await prisma.payoutBatch.create({
      data: {
        doctorId,
        amount: parseFloat(amount),
        status: 'PENDING',
        payoutMethod: payoutMethod.toUpperCase(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_CREATE_PAYOUT_BATCH',
        targetUserId: doctorId,
        metadata: JSON.stringify({ payoutId: newPayout.id, amount, payoutMethod }),
      },
    });

    return NextResponse.json({
      message: 'Payout batch created successfully!',
      payout: newPayout,
    });
  } catch (error: any) {
    console.error('Create payout batch error:', error);
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
    const { id, status, payoutRef, holdReason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Payout ID and status are required' }, { status: 400 });
    }

    const updateData: any = {
      status: status.toUpperCase(),
    };

    if (status.toUpperCase() === 'COMPLETED') {
      updateData.processedAt = new Date();
      if (payoutRef) updateData.payoutRef = payoutRef;
    }

    if (status.toUpperCase() === 'HOLD' && holdReason) {
      updateData.holdReason = holdReason;
    }

    const updatedPayout = await prisma.payoutBatch.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: `ADMIN_UPDATE_PAYOUT_${status.toUpperCase()}`,
        targetUserId: updatedPayout.doctorId,
        metadata: JSON.stringify({ payoutId: id, status, payoutRef, holdReason }),
      },
    });

    return NextResponse.json({
      message: `Payout status updated to ${status}!`,
      payout: updatedPayout,
    });
  } catch (error: any) {
    console.error('Update payout status error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
