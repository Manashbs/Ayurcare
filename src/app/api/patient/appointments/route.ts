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
    const { doctorId, scheduledAt, type, familyMemberId, feePaid } = body;

    if (!doctorId || !scheduledAt || !type || !feePaid) {
      return NextResponse.json({ error: 'Missing appointment scheduling parameters' }, { status: 400 });
    }

    // Double check doctor is approved
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile || !doctorProfile.isApproved) {
      return NextResponse.json({ error: 'This physician cannot accept consultations at this time.' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);

    // Book in transaction: create appointment and complete mock payment SUCCESS
    const newAppointment = await prisma.$transaction(async (tx: any) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.userId,
          doctorId,
          familyMemberId: familyMemberId || null,
          scheduledAt: scheduledDate,
          type,
          status: 'CONFIRMED', // Auto-confirmed on payment success
          feePaid: parseFloat(feePaid),
        },
      });

      // Calculate platform commission (e.g. 15% standard rate)
      const commission = parseFloat(feePaid) * 0.15;

      await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: parseFloat(feePaid),
          commission,
          status: 'SUCCESS',
          gatewayRefId: `ch_mock_${Math.random().toString(36).substring(7)}`,
        },
      });

      // Add doctor notification
      await tx.notification.create({
        data: {
          userId: doctorId,
          message: `New consultation booked by ${patient.name} for ${scheduledDate.toLocaleString()}`,
          type: 'APPOINTMENT',
        },
      });

      return appointment;
    });

    // Fetch Doctor and Patient details for confirmation email
    const docUser = await prisma.user.findUnique({
      where: { id: doctorId },
    });
    const patUser = await prisma.user.findUnique({
      where: { id: patient.userId },
    });

    if (docUser && patUser) {
      const meetUrl = `http://localhost:3000/meet/${newAppointment.id}`;
      
      // Send confirmation to Patient
      try {
        const { sendAppointmentConfirmationEmail } = require('@/lib/email');
        await sendAppointmentConfirmationEmail({
          toEmail: patUser.email,
          recipientName: patUser.name,
          doctorName: docUser.name,
          patientName: patUser.name,
          scheduledAt: scheduledDate,
          meetUrl,
          isDoctor: false
        });
      } catch (e) {
        console.error('Failed to send email to patient:', e);
      }

      // Send confirmation to Doctor
      try {
        const { sendAppointmentConfirmationEmail } = require('@/lib/email');
        await sendAppointmentConfirmationEmail({
          toEmail: docUser.email,
          recipientName: docUser.name,
          doctorName: docUser.name,
          patientName: patUser.name,
          scheduledAt: scheduledDate,
          meetUrl,
          isDoctor: true
        });
      } catch (e) {
        console.error('Failed to send email to doctor:', e);
      }
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: patient.userId,
        action: 'PATIENT_BOOK_APPOINTMENT',
        targetUserId: doctorId,
        metadata: JSON.stringify({ appointmentId: newAppointment.id, feePaid }),
      },
    });

    return NextResponse.json({
      message: 'Consultation booked and mock payment processed successfully!',
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error('Book appointment error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
