import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function POST() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Generate TOTP secret & otpauth URI
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      secret,
      label: adminUser.email,
      issuer: 'AyurCare Admin',
    });

    // Generate QR code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Save secret to AdminSecurityProfile (totpEnabled remains false until verified)
    await prisma.adminSecurityProfile.upsert({
      where: { userId: admin.userId },
      update: { totpSecret: secret },
      create: {
        userId: admin.userId,
        totpSecret: secret,
        totpEnabled: false,
        adminRole: 'SUPER_ADMIN',
      },
    });

    return NextResponse.json({
      message: '2FA TOTP setup initialized. Scan the QR code with Google Authenticator.',
      secret,
      qrCodeDataUrl,
    });
  } catch (error: any) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: error.message || '2FA setup failed' }, { status: 500 });
  }
}
