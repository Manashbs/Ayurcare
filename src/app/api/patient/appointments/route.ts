import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'PATIENT') return null;
  return payload;
}

export async function GET() {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.userId },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        familyMember: true,
        consultation: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { doctorId, scheduledAt, type, familyMemberId, paymentIntentId } = body;

    if (!doctorId || !scheduledAt || !type || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, scheduledAt, type, paymentIntentId' },
        { status: 400 }
      );
    }

    // Verify doctor is approved
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile || !doctorProfile.isApproved) {
      return NextResponse.json(
        { error: 'This physician cannot accept consultations at this time.' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);

    // Create appointment as PENDING — it will be confirmed ONLY when the
    // Stripe webhook receives a payment_intent.succeeded event.
    const newAppointment = await prisma.$transaction(async (tx: any) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.userId,
          doctorId,
          familyMemberId: familyMemberId || null,
          scheduledAt: scheduledDate,
          type,
          status: 'PENDING',
          feePaid: doctorProfile.feePerConsult,
        },
      });

      // Create payment record as PENDING — will be updated by webhook
      const commission = doctorProfile.feePerConsult * 0.15;
      await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: doctorProfile.feePerConsult,
          commission,
          status: 'PENDING',
          gatewayRefId: paymentIntentId,
        },
      });

      return appointment;
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: patient.userId,
        action: 'PATIENT_BOOK_APPOINTMENT',
        targetUserId: doctorId,
        metadata: JSON.stringify({
          appointmentId: newAppointment.id,
          paymentIntentId,
          status: 'PENDING',
        }),
      },
    });

    return NextResponse.json({
      message: 'Appointment created. Awaiting payment confirmation.',
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error('Book appointment error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
