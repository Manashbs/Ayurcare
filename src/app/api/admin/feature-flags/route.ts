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
    let flags = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });

    // Seed default feature flags if none exist
    if (flags.length === 0) {
      await prisma.featureFlag.createMany({
        data: [
          { key: 'ai_chat', name: 'AI Health Assistant', description: 'Enable Gemini-powered AI chat consultation', isEnabled: true, targetSegment: 'ALL' },
          { key: 'video_consultations', name: 'Video Consultations', description: 'Enable live WebRTC video consultation rooms', isEnabled: true, targetSegment: 'ALL' },
          { key: 'coupon_engine', name: 'Coupons & Discounts', description: 'Enable promotional coupon engine at booking', isEnabled: true, targetSegment: 'ALL' },
          { key: 'google_oauth', name: 'Google Single Sign-On', description: 'Enable Google OAuth login & signup', isEnabled: true, targetSegment: 'ALL' },
          { key: 'maintenance_mode', name: 'Platform Maintenance Mode', description: 'Show global maintenance banner to all non-admin users', isEnabled: false, targetSegment: 'ALL' },
        ],
      });
      flags = await prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
    }

    return NextResponse.json({ flags });
  } catch (error: any) {
    console.error('Fetch feature flags error:', error);
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
    const { key, name, description, isEnabled, targetSegment } = body;

    if (!key || !name) {
      return NextResponse.json({ error: 'Flag key and name are required' }, { status: 400 });
    }

    const cleanKey = String(key).trim().toLowerCase();

    const flag = await prisma.featureFlag.upsert({
      where: { key: cleanKey },
      update: {
        name,
        description: description || undefined,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
        targetSegment: targetSegment || undefined,
        updatedBy: admin.userId,
      },
      create: {
        key: cleanKey,
        name,
        description: description || `Feature flag for ${cleanKey}`,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        targetSegment: targetSegment || 'ALL',
        updatedBy: admin.userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_UPDATE_FEATURE_FLAG',
        metadata: JSON.stringify({ key: cleanKey, isEnabled: flag.isEnabled }),
      },
    });

    return NextResponse.json({
      message: `Feature flag ${cleanKey} updated successfully!`,
      flag,
    });
  } catch (error: any) {
    console.error('Update feature flag error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
