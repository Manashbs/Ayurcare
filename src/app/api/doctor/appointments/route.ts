import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyDoctor() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'DOCTOR') return null;
  return payload;
}

export async function GET() {
  try {
    const doctor = await verifyDoctor();
    if (!doctor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.userId },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
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
    console.error('Doctor appointments fetch error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const doctor = await verifyDoctor();
    if (!doctor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { patientId, scheduledAt, type } = body;

    if (!patientId || !scheduledAt) {
      return NextResponse.json({ error: 'Missing parameters: patientId and scheduledAt are required.' }, { status: 400 });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctor.userId },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);

    // Book follow-up consultation in transaction
    const newAppointment = await prisma.$transaction(async (tx: any) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId: doctor.userId,
          scheduledAt: scheduledDate,
          type: type || 'VIDEO',
          status: 'CONFIRMED',
          feePaid: doctorProfile.feePerConsult,
        },
      });

      // Platform commission 15%
      const commission = doctorProfile.feePerConsult * 0.15;

      await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: doctorProfile.feePerConsult,
          commission,
          status: 'SUCCESS',
          gatewayRefId: `ch_doc_manual_${Math.random().toString(36).substring(7)}`,
        },
      });

      // Patient notification
      await tx.notification.create({
        data: {
          userId: patientId,
          message: `Dr. ${doctor.name} scheduled a new follow-up consultation for you on ${scheduledDate.toLocaleString()}`,
          type: 'APPOINTMENT',
        },
      });

      return appointment;
    });

    // Fetch details to send email confirmations
    const docUser = await prisma.user.findUnique({
      where: { id: doctor.userId },
    });
    const patUser = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (docUser && patUser) {
      const meetUrl = `http://localhost:3000/meet/${newAppointment.id}`;
      
      // Email to Patient
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
        console.error('Failed to send mail to patient:', e);
      }

      // Email to Doctor
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
        console.error('Failed to send mail to doctor:', e);
      }
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: doctor.userId,
        action: 'DOCTOR_SCHEDULED_APPOINTMENT',
        targetUserId: patientId,
        metadata: JSON.stringify({ appointmentId: newAppointment.id }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Follow-up consultation manually scheduled successfully!',
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error('Manual booking error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
