import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent enumeration attacks, we can say "If your email is registered, you will receive an OTP code."
    // But we still return the user ID in the API response if we find the user, to help the UI transition to the reset page.
    if (!user) {
      return NextResponse.json({
        message: 'If the email exists, a password reset code has been sent.',
      });
    }

    // Generate reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        code: resetOtp,
        purpose: 'RESET_PASSWORD',
        expiresAt,
      },
    });

    // Send email
    await sendResetPasswordEmail(user.email, resetOtp);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        metadata: JSON.stringify({ email: user.email }),
      },
    });

    return NextResponse.json({
      message: 'Password reset code sent to your email.',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
