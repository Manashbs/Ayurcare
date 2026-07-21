import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code, newPassword } = body;

    if (!userId || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check password strength
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one number and one symbol' },
        { status: 400 }
      );
    }

    // Verify OTP code
    const otp = await prisma.otpVerification.findFirst({
      where: {
        userId,
        code,
        purpose: 'RESET_PASSWORD',
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update in transaction: set password, mark OTP used, and revoke all active refresh tokens (logout all sessions)
    await prisma.$transaction(async (tx: any) => {
      // Update password
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Mark OTP as used
      await tx.otpVerification.update({
        where: { id: otp.id },
        data: { used: true },
      });

      // Revoke/Delete all refresh tokens (invalidates all other sessions)
      await tx.refreshToken.deleteMany({
        where: { userId },
      });

      // Log action
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'PASSWORD_RESET_COMPLETE',
          metadata: JSON.stringify({ email: otp.user.email }),
        },
      });
    });

    return NextResponse.json({
      message: 'Password has been reset successfully. All other active sessions have been signed out.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
