import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { status, assignToMe } = body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignToMe) updateData.assignedAdminId = admin.userId;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: updateData,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'SUPPORT_TICKET_UPDATE',
        metadata: JSON.stringify({ ticketId: params.id, status, assignedToAdmin: assignToMe }),
      },
    });

    return NextResponse.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
