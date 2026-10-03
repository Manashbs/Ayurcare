import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { setAuthCookies } from '@/lib/jwt';
import { verifyAdminLoginChallengeToken } from '@/lib/admin-login-challenge';
import { verifyAdminLoginCode } from '@/lib/twilio-verify';

const CHALLENGE_COOKIE = 'adminLoginChallenge';
const MAX_CODE_ATTEMPTS = 5;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const challengeToken = cookieStore.get(CHALLENGE_COOKIE)?.value;
  const challengeClaims = challengeToken ? verifyAdminLoginChallengeToken(challengeToken) : null;
  if (!challengeClaims) {
    cookieStore.delete(CHALLENGE_COOKIE);
    return NextResponse.json({ error: 'Your login verification expired. Sign in again.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!/^\d{4,10}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the verification code from your SMS.' }, { status: 400 });
    }

    const challenge = await prisma.otpVerification.findFirst({
      where: {
        id: challengeClaims.challengeId,
        userId: challengeClaims.userId,
        purpose: 'ADMIN_SMS_LOGIN',
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true } } },
    });
    if (!challenge || challenge.user.role !== 'ADMIN' || challenge.user.status !== 'ACTIVE' || !challenge.user.emailVerified) {
      cookieStore.delete(CHALLENGE_COOKIE);
      return NextResponse.json({ error: 'Your login verification expired. Sign in again.' }, { status: 401 });
    }

    if (!verifyAdminLoginCode(code, challenge.code)) {
      const failedPurpose = `ADMIN_SMS_LOGIN_FAILED:${challenge.id}`;
      const failedAttempts = await prisma.otpVerification.count({
        where: {
          userId: challenge.userId,
          purpose: failedPurpose,
          createdAt: { gt: challenge.createdAt },
        },
      });
      if (failedAttempts + 1 >= MAX_CODE_ATTEMPTS) {
        await prisma.otpVerification.update({ where: { id: challenge.id }, data: { used: true } });
        cookieStore.delete(CHALLENGE_COOKIE);
        return NextResponse.json({ error: 'Too many incorrect codes. Sign in again.' }, { status: 400 });
      }
      await prisma.otpVerification.create({
        data: {
          userId: challenge.userId,
          code: 'failed',
          purpose: failedPurpose,
          expiresAt: challenge.expiresAt,
          used: true,
        },
      });
      return NextResponse.json({ error: 'That code is invalid or expired.' }, { status: 400 });
    }

    const completedAt = new Date();
    const completed = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentUser = await tx.user.findUnique({
        where: { id: challenge.user.id },
        select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true },
      });
      if (!currentUser || currentUser.role !== 'ADMIN' || currentUser.status !== 'ACTIVE' || !currentUser.emailVerified) return false;

      const claim = await tx.otpVerification.updateMany({
        where: {
          id: challenge.id,
          userId: challenge.userId,
          purpose: 'ADMIN_SMS_LOGIN',
          used: false,
          expiresAt: { gt: completedAt },
        },
        data: { used: true },
      });
      if (claim.count !== 1) return false;

      await tx.user.update({
        where: { id: challenge.user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null, lastLoginAt: completedAt },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: challenge.user.id,
          action: 'USER_LOGIN',
          metadata: JSON.stringify({ email: challenge.user.email, role: 'ADMIN', secondFactor: 'SMS' }),
        },
      });
      return true;
    });

    if (!completed) {
      cookieStore.delete(CHALLENGE_COOKIE);
      return NextResponse.json({ error: 'This login verification has already been used or expired.' }, { status: 409 });
    }

    await setAuthCookies({
      id: challenge.user.id,
      role: challenge.user.role,
      name: challenge.user.name,
    });
    cookieStore.delete(CHALLENGE_COOKIE);

    return NextResponse.json({
      message: 'Admin login verified.',
      user: {
        id: challenge.user.id,
        email: challenge.user.email,
        name: challenge.user.name,
        role: challenge.user.role,
        status: challenge.user.status,
      },
    });
  } catch (error) {
    console.error('Admin SMS login verification failed:', error);
    return NextResponse.json({ error: 'Could not complete admin verification.' }, { status: 500 });
  }
}