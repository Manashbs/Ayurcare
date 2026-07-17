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
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const auditLogs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: { name: true, email: true, role: true },
        },
        targetUser: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100, // Return the 100 most recent logs
    });

    return NextResponse.json({ auditLogs });
  } catch (error: any) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
