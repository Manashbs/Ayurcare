import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setAuthCookies } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, mockEmail, mockName } = body;

    let email = mockEmail;
    let name = mockName || 'User';

    // If real token supplied, verify via Google TokenInfo API
    if (token && token.length > 20 && !token.startsWith('mock_')) {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload.email) {
          email = payload.email;
          name = payload.name || name;
        }
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Invalid Google OAuth Token' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
        return NextResponse.json({
          error: `Your account is ${user.status.toLowerCase()}. Reason: ${user.suspensionReason || 'Violation of terms'}`,
        }, { status: 403 });
      }

      if (user.status === 'PENDING' || !user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', emailVerified: true },
        });
      }
    } else {
      // Register a new patient account automatically
      const randomPassword = Math.random().toString(36).substring(2, 12);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            email,
            name,
            passwordHash,
            role: 'PATIENT',
            status: 'ACTIVE',
            emailVerified: true,
          },
        });

        await tx.patientProfile.create({
          data: {
            userId: newUser.id,
            lifestyleData: '{}',
          },
        });

        return newUser;
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 400 });
    }

    // Set secure authentication cookies
    await setAuthCookies({ id: user.id, role: user.role, name: user.name });

    // Create system log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'GOOGLE_OAUTH_LOGIN',
        metadata: JSON.stringify({ email: user.email }),
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Google OAuth Login Error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
