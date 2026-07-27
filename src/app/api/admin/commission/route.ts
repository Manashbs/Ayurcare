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

    let configs = await prisma.commissionConfig.findMany({
      orderBy: { tierName: 'asc' },
    });

    // Seed default commission tiers if none exist
    if (configs.length === 0) {
      await prisma.commissionConfig.createMany({
        data: [
          { tierName: 'STANDARD', commissionRate: 0.15, description: 'Default platform commission (15%)', updatedBy: admin.userId },
          { tierName: 'GOLD', commissionRate: 0.10, description: 'High-volume doctor tier (10%)', updatedBy: admin.userId },
          { tierName: 'PLATINUM', commissionRate: 0.08, description: 'VIP / Exclusive doctor tier (8%)', updatedBy: admin.userId },
          { tierName: 'SPECIALIST', commissionRate: 0.12, description: 'Senior Ayurvedic specialists (12%)', updatedBy: admin.userId },
        ],
      });
      configs = await prisma.commissionConfig.findMany({ orderBy: { tierName: 'asc' } });
    }

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error('Fetch commission config error:', error);
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
    const { tierName, commissionRate, description } = body;

    if (!tierName || commissionRate === undefined) {
      return NextResponse.json(
        { error: 'tierName and commissionRate are required' },
        { status: 400 }
      );
    }

    const rate = parseFloat(commissionRate);
    if (rate < 0 || rate > 0.5) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0.00 (0%) and 0.50 (50%)' },
        { status: 400 }
      );
    }

    const tierUpper = String(tierName).trim().toUpperCase();

    const config = await prisma.commissionConfig.upsert({
      where: { tierName: tierUpper },
      update: {
        commissionRate: rate,
        description: description || undefined,
        updatedBy: admin.userId,
      },
      create: {
        tierName: tierUpper,
        commissionRate: rate,
        description: description || `Commission tier ${tierUpper}`,
        updatedBy: admin.userId,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_UPDATE_COMMISSION_TIER',
        metadata: JSON.stringify({ tierName: tierUpper, rate, description }),
      },
    });

    return NextResponse.json({
      message: `Commission tier ${tierUpper} saved successfully!`,
      config,
    });
  } catch (error: any) {
    console.error('Save commission tier error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
