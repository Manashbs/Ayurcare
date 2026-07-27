import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { verifySync } from 'otplib';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || String(code).trim().length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit TOTP code is required' }, { status: 400 });
    }

    const profile = await prisma.adminSecurityProfile.findUnique({
      where: { userId: admin.userId },
    });

    if (!profile || !profile.totpSecret) {
      return NextResponse.json({ error: '2FA setup not initialized. Run setup first.' }, { status: 400 });
    }

    const result = verifySync({
      token: String(code).trim(),
      secret: profile.totpSecret,
    });

    if (!result || !result.valid) {
      return NextResponse.json({ error: 'Invalid 6-digit TOTP code' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.adminSecurityProfile.update({
      where: { userId: admin.userId },
      data: { totpEnabled: true },
    });

    // Log security event
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_ENABLE_2FA',
        metadata: JSON.stringify({ message: '2FA mandatory TOTP enabled for admin account' }),
      },
    });

    return NextResponse.json({
      message: 'Mandatory 2FA successfully enabled for your Admin account!',
      totpEnabled: true,
    });
  } catch (error: any) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: error.message || '2FA verification failed' }, { status: 500 });
  }
}
