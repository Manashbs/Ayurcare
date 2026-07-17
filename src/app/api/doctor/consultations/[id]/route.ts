import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { sendPrescriptionReadyEmail } from '@/lib/email';

async function verifyDoctor() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'DOCTOR') return null;
  return payload;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const doctor = await verifyDoctor();
    if (!doctor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Find the appointment first to check permissions
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        consultation: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.doctorId !== doctor.userId) {
      return NextResponse.json({ error: 'Access Denied: You are not authorized to view this patient\'s records.' }, { status: 403 });
    }

    const patientId = appointment.patientId;

    // Fetch Patient 360 View:
    // 1. Full patient medical intake details
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        familyMembers: true,
      },
    });

    // 2. All past consultations across all doctors
    const pastAppointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        consultation: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // 3. All prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // 4. Lab reports
    const labReports = await prisma.labReport.findMany({
      where: { patientId },
      orderBy: { uploadedAt: 'desc' },
    });

    // 5. AI chats summary
    const aiSessions = await prisma.aIChatSession.findMany({
      where: { patientId },
      select: { summary: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // Log the doctor access (Strict HIPAA audit compliance requirement!)
    await prisma.auditLog.create({
      data: {
        actorUserId: doctor.userId,
        action: 'DOCTOR_VIEWED_PATIENT_360',
        targetPatientId: patientId,
        metadata: JSON.stringify({
          appointmentId: appointment.id,
          patientEmail: patientProfile?.user.email,
          patientName: patientProfile?.user.name,
        }),
      },
    });

    return NextResponse.json({
      appointment,
      patient360: {
        profile: patientProfile,
        appointments: pastAppointments,
        prescriptions,
        labReports,
        aiSessions,
      },
    });
  } catch (error: any) {
    console.error('Doctor consultation fetch error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const doctor = await verifyDoctor();
    if (!doctor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { notes, privateDoctorNotes, diagnosis, prescriptionData } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.doctorId !== doctor.userId) {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // Update or Create Consultation
    const consultation = await prisma.consultation.upsert({
      where: { appointmentId: params.id },
      update: {
        notes,
        privateDoctorNotes,
        diagnosis,
        endedAt: new Date(),
      },
      create: {
        appointmentId: params.id,
        notes,
        privateDoctorNotes,
        diagnosis,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });

    // Mark appointment as Completed
    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'COMPLETED' },
    });

    let prescription = null;
    // Create/update E-Prescription if supplied
    if (prescriptionData && prescriptionData.medicines) {
      const medicinesStr = typeof prescriptionData.medicines === 'string' 
        ? prescriptionData.medicines 
        : JSON.stringify(prescriptionData.medicines);

      prescription = await prisma.prescription.create({
        data: {
          consultationId: consultation.id,
          doctorId: doctor.userId,
          patientId: appointment.patientId,
          medicines: medicinesStr,
          dietInstructions: prescriptionData.dietInstructions || '',
          lifestyleAdvice: prescriptionData.lifestyleAdvice || '',
          status: 'ACTIVE',
          pdfUrl: `/uploads/prescription_${consultation.id}.pdf`, // Mock PDF location
        },
      });

      // Send Email alert
      try {
        await sendPrescriptionReadyEmail(
          appointment.patient.user.email,
          appointment.patient.user.name,
          doctor.name
        );
      } catch (e) {
        console.error('Email notify failed:', e);
      }

      // Add Notification
      await prisma.notification.create({
        data: {
          userId: appointment.patientId,
          message: `E-prescription uploaded by Dr. ${doctor.name}. View dosage schedules.`,
          type: 'PRESCRIPTION',
        },
      });
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: doctor.userId,
        action: 'DOCTOR_COMPLETED_CONSULTATION',
        targetPatientId: appointment.patientId,
        metadata: JSON.stringify({
          appointmentId: appointment.id,
          consultationId: consultation.id,
          hasPrescription: !!prescription,
        }),
      },
    });

    return NextResponse.json({
      message: 'Consultation record saved successfully!',
      consultation,
      prescription,
    });
  } catch (error: any) {
    console.error('Save consultation error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
