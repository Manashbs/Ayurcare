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
    const targetUserId = searchParams.get('userId');

    const whereClause: any = {};
    if (targetUserId) {
      whereClause.userId = targetUserId;
    }

    const sessions = await prisma.activeSession.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Fetch sessions error:', error);
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
    const { sessionId, userId, revokeAll } = body;

    if (revokeAll && userId) {
      // Force logout everywhere for target user
      await prisma.activeSession.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });

      // Revoke all refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: admin.userId,
          action: 'ADMIN_FORCE_LOGOUT_USER_EVERYWHERE',
          targetUserId: userId,
          metadata: JSON.stringify({ message: 'All active sessions revoked by admin' }),
        },
      });

      return NextResponse.json({ message: `All active sessions revoked for user ${userId}` });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId or userId + revokeAll is required' }, { status: 400 });
    }

    const session = await prisma.activeSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_REVOKE_SESSION',
        targetUserId: session.userId,
        metadata: JSON.stringify({ sessionId, ipAddress: session.ipAddress }),
      },
    });

    return NextResponse.json({ message: 'Session revoked successfully!', session });
  } catch (error: any) {
    console.error('Revoke session error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
