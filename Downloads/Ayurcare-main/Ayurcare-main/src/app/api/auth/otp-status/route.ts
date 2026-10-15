import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ verified: true });
    }

    // Find the latest active OTP code
    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        userId,
        purpose: 'SIGNUP',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasSmtpPassword = !!process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD !== 'mock_app_password';

    return NextResponse.json({
      verified: false,
      email: user.email,
      emailConfigured: hasSmtpPassword,
      // Provide preview OTP if SMTP is unconfigured or in dev mode so the user can verify immediately
      previewOtp: (!hasSmtpPassword || process.env.NODE_ENV !== 'production') && latestOtp ? latestOtp.code : undefined,
    });
  } catch (error: any) {
    console.error('OTP status check error:', error);
    return NextResponse.json({ error: 'Failed to check OTP status' }, { status: 500 });
  }
}
