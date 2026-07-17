import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { setAuthCookies } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and portal role are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== role) {
      // Keep error message generic to prevent enumeration but help UI routing if portal role mismatches
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check Lockout Status
    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - now.getTime()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.` },
        { status: 403 }
      );
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      // Increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const dataUpdate: any = { failedLoginAttempts: newFailedAttempts };

      if (newFailedAttempts >= 5) {
        dataUpdate.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        dataUpdate.failedLoginAttempts = 0; // Reset count for after lockout ends
      }

      await prisma.user.update({
        where: { id: user.id },
        data: dataUpdate,
      });

      if (newFailedAttempts >= 5) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Your account has been locked for 15 minutes.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check email verification status
    if (!user.emailVerified) {
      // If OTP exists, we can resend or let them enter code
      return NextResponse.json({
        error: 'Account email is not verified yet.',
        unverified: true,
        userId: user.id,
      }, { status: 403 });
    }

    // Check User Status (Active, Suspended, Banned, Pending approval for doctor)
    if (user.status === 'PENDING' && user.role === 'DOCTOR') {
      return NextResponse.json({
        error: 'Your medical license verification is pending review. You cannot access the workspace until administrative approval is granted.',
        pendingApproval: true,
      }, { status: 403 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: `Account suspended: ${user.suspensionReason || 'contact support for help.'}` },
        { status: 403 }
      );
    }

    if (user.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Account banned. Access permanently revoked.' },
        { status: 403 }
      );
    }

    // Reset Login Attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Sign tokens & set secure cookies
    await setAuthCookies({
      id: user.id,
      role: user.role,
      name: user.name,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'USER_LOGIN',
        metadata: JSON.stringify({ email: user.email, role: user.role }),
      },
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during login' }, { status: 500 });
  }
}
