import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setAuthCookies } from '@/lib/jwt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: 'Missing Google authentication credential' }, { status: 400 });
    }

    let email = '';
    let name = '';

    // Verify token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'mock_client_id') {
      // In development or when client ID is not configured, decode claims directly to allow easy offline testing
      const decoded = jwt.decode(credential) as any;
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || decoded.email.split('@')[0];
      } else {
        return NextResponse.json({ error: 'Invalid Google authentication token format' }, { status: 400 });
      }
    } else {
      // Real cryptographic OAuth verification
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return NextResponse.json({ error: 'Google authentication payload invalid' }, { status: 400 });
      }
      email = payload.email;
      name = payload.name || payload.email.split('@')[0];
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.role !== 'PATIENT') {
        return NextResponse.json(
          { error: 'Google authentication is only available for Patient portals' },
          { status: 403 }
        );
      }
      
      // Activate user if they were pending
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

      user = await prisma.$transaction(async (tx) => {
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
    console.error('Google login error:', error);
    return NextResponse.json({ error: error.message || 'Google verification failed' }, { status: 500 });
  }
}
