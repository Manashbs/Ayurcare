import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'SIGNUP',
        expiresAt,
      },
    });

    // Send email
    let emailSent = false;
    try {
      const emailRes = await sendOtpEmail(user.email, otpCode);
      emailSent = !!emailRes?.delivered;
    } catch (mailErr) {
      console.warn('[ResendOTP] sendOtpEmail warning:', mailErr);
    }

    return NextResponse.json({
      message: emailSent
        ? 'A new OTP verification code has been dispatched to your email.'
        : 'A new verification code has been generated.',
      emailSent,
      previewOtp: emailSent ? undefined : otpCode,
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
