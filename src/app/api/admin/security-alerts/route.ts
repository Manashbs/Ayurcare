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
    const severity = searchParams.get('severity');
    const isResolved = searchParams.get('isResolved');

    const whereClause: any = {};
    if (severity) whereClause.severity = severity.toUpperCase();
    if (isResolved !== null && isResolved !== undefined) {
      whereClause.isResolved = isResolved === 'true';
    }

    const alerts = await prisma.securityAlert.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Fetch security alerts error:', error);
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
    const { alertId, isResolved } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 });
    }

    const updatedAlert = await prisma.securityAlert.update({
      where: { id: alertId },
      data: { isResolved: isResolved ?? true },
    });

    return NextResponse.json({
      message: 'Security alert updated successfully!',
      alert: updatedAlert,
    });
  } catch (error: any) {
    console.error('Update security alert error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
