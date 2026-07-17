import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and verification code are required' }, { status: 400 });
    }

    // Find valid OTP code
    const otp = await prisma.otpVerification.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Mark OTP as used and update user status
    await prisma.$transaction(async (tx) => {
      // Set OTP as used
      await tx.otpVerification.update({
        where: { id: otp.id },
        data: { used: true },
      });

      // Update user verification status
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          // Patients immediately active. Doctors remain PENDING until admin approves.
          status: otp.user.role === 'PATIENT' ? 'ACTIVE' : 'PENDING',
        },
      });

      // Log action
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'EMAIL_VERIFIED',
          metadata: JSON.stringify({ email: otp.user.email, role: otp.user.role }),
        },
      });
    });

    // Send welcome email if patient
    if (otp.user.role === 'PATIENT') {
      try {
        await sendWelcomeEmail(otp.user.email, otp.user.name);
      } catch (e) {
        console.error('Welcome email send failed:', e);
      }
    }

    return NextResponse.json({
      message: 'Email verified successfully!',
      role: otp.user.role,
      status: otp.user.role === 'PATIENT' ? 'ACTIVE' : 'PENDING',
    });
  } catch (error: any) {
    console.error('OTP Verification error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during verification' }, { status: 500 });
  }
}
