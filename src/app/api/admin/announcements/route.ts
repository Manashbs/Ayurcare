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
    const announcements = await prisma.systemAnnouncement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    console.error('Fetch announcements error:', error);
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
    const { title, message, targetRole, severity, isBanner } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const roleTarget = targetRole ? String(targetRole).toUpperCase() : 'ALL';

    const announcement = await prisma.systemAnnouncement.create({
      data: {
        title,
        message,
        targetRole: roleTarget,
        severity: severity ? String(severity).toUpperCase() : 'INFO',
        isBanner: isBanner !== undefined ? Boolean(isBanner) : false,
        sentBy: admin.userId,
      },
    });

    // Create notifications for targeted users
    let userWhere: any = {};
    if (roleTarget !== 'ALL') {
      userWhere.role = roleTarget;
    }

    const targetUsers = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((u) => ({
          userId: u.id,
          message: `📢 ${title}: ${message}`,
          type: 'SYSTEM',
        })),
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_BROADCAST_ANNOUNCEMENT',
        metadata: JSON.stringify({ announcementId: announcement.id, targetRole: roleTarget, userCount: targetUsers.length }),
      },
    });

    return NextResponse.json({
      message: `Announcement broadcast successfully to ${targetUsers.length} user(s)!`,
      announcement,
    });
  } catch (error: any) {
    console.error('Broadcast announcement error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
