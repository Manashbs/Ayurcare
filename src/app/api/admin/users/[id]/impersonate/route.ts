import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken, setAuthCookies } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin permissions required.' }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot impersonate another administrator.' }, { status: 400 });
    }

    // Set cookies representing the target user's session
    await setAuthCookies({
      id: targetUser.id,
      role: targetUser.role,
      name: targetUser.name,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_IMPERSONATE_USER',
        targetUserId: targetUser.id,
        metadata: JSON.stringify({
          impersonatedRole: targetUser.role,
          impersonatedEmail: targetUser.email,
          impersonatedName: targetUser.name,
        }),
      },
    });

    return NextResponse.json({
      message: `Impersonation started successfully. You are now logged in as ${targetUser.name}.`,
      role: targetUser.role,
      name: targetUser.name,
    });
  } catch (error: any) {
    console.error('Impersonation API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
