import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload) return null;
  return payload;
}

export async function GET(request: Request) {
  try {
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patientId = user.role === 'PATIENT' ? user.userId : new URL(request.url).searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const items = await prisma.cartItem.findMany({
      where: { patientId },
      orderBy: { addedAt: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { patientId, appointmentId, name, dosage, price } = body;

    if (!patientId || !appointmentId || !name || !dosage) {
      return NextResponse.json({ error: 'Missing parameter details' }, { status: 400 });
    }

    // 1. Verify that the meeting is currently active (Consultation status must not be completed)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { consultation: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status === 'COMPLETED' || (appointment.consultation && appointment.consultation.endedAt)) {
      return NextResponse.json({ error: 'Consultation is already completed. Cart is locked and cannot be modified.' }, { status: 403 });
    }

    // 2. Add to cart
    const newItem = await prisma.cartItem.create({
      data: {
        patientId,
        name,
        dosage,
        price: parseFloat(price || '150.0'),
        quantity: 1,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patientId = user.role === 'PATIENT' ? user.userId : new URL(request.url).searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    // Clear patient's cart items
    await prisma.cartItem.deleteMany({
      where: { patientId },
    });

    return NextResponse.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
