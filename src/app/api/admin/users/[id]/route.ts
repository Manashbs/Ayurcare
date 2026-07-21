import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail } from '@/lib/email';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, status, suspensionReason, doctorProfile, approvalUpdate } = body;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { doctorProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      // 1. Update basic user fields
      const userUpdate: any = {};
      if (name) userUpdate.name = name;
      if (email) userUpdate.email = email;
      if (phone !== undefined) userUpdate.phone = phone;
      if (status) {
        userUpdate.status = status;
        if (status === 'SUSPENDED') {
          userUpdate.suspensionReason = suspensionReason || 'Violated terms';
        } else if (status === 'ACTIVE') {
          userUpdate.suspensionReason = null;
        }
      }

      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: userUpdate,
      });

      // 2. Update Doctor Profile (if applicable)
      if (user.role === 'DOCTOR' && doctorProfile) {
        const { qualification, regNumber, specializations, experienceYears, feePerConsult, clinicAddress, languages } = doctorProfile;
        const profileUpdate: any = {};
        if (qualification) profileUpdate.qualification = qualification;
        if (regNumber) profileUpdate.regNumber = regNumber;
        if (specializations) profileUpdate.specializations = specializations;
        if (experienceYears !== undefined) profileUpdate.experienceYears = parseInt(experienceYears);
        if (feePerConsult !== undefined) profileUpdate.feePerConsult = parseFloat(feePerConsult);
        if (clinicAddress !== undefined) profileUpdate.clinicAddress = clinicAddress;
        if (languages !== undefined) profileUpdate.languages = languages;

        await tx.doctorProfile.update({
          where: { userId: params.id },
          data: profileUpdate,
        });
      }

      // 3. Handle Doctor Approval Queue workflow
      if (user.role === 'DOCTOR' && approvalUpdate) {
        const { approvalStatus, rejectionReason } = approvalUpdate;
        
        const profileUpdate: any = { approvalStatus };
        const userStatusUpdate: any = {};

        if (approvalStatus === 'APPROVED') {
          profileUpdate.isApproved = true;
          profileUpdate.rejectionReason = null;
          userStatusUpdate.status = 'ACTIVE';
        } else if (approvalStatus === 'REJECTED') {
          profileUpdate.isApproved = false;
          profileUpdate.rejectionReason = rejectionReason || 'Documents mismatch';
          userStatusUpdate.status = 'PENDING';
        } else if (approvalStatus === 'MORE_INFO') {
          profileUpdate.isApproved = false;
          profileUpdate.rejectionReason = rejectionReason || 'More verification proof requested';
          userStatusUpdate.status = 'PENDING';
        }

        await tx.doctorProfile.update({
          where: { userId: params.id },
          data: profileUpdate,
        });

        await tx.user.update({
          where: { id: params.id },
          data: userStatusUpdate,
        });
      }

      return updatedUser;
    });

    // Send emails outside the transaction to avoid blocking DB connection
    if (user.role === 'DOCTOR' && approvalUpdate) {
      const { approvalStatus, rejectionReason } = approvalUpdate;
      if (approvalStatus === 'APPROVED') {
        try {
          await sendDoctorApprovalEmail(user.email, user.name);
        } catch (e) {
          console.error('Failed to send doctor approval email:', e);
        }
      } else if (approvalStatus === 'REJECTED') {
        try {
          await sendDoctorRejectionEmail(user.email, user.name, rejectionReason || 'Documents verification failed.');
        } catch (e) {
          console.error('Failed to send doctor rejection email:', e);
        }
      }
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_UPDATE_USER',
        targetUserId: params.id,
        metadata: JSON.stringify({
          statusChanged: status ? `To ${status}` : 'No',
          approvalChanged: approvalUpdate ? `To ${approvalUpdate.approvalStatus}` : 'No',
        }),
      },
    });

    return NextResponse.json({ message: 'User updated successfully', user: updated });
  } catch (error: any) {
    console.error('Admin user edit error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.id === admin.userId) {
      return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    // Permanently delete user (relations are set to cascade delete in Prisma)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_DELETE_USER',
        metadata: JSON.stringify({ email: user.email, name: user.name, role: user.role }),
      },
    });

    return NextResponse.json({ message: 'User deleted permanently.' });
  } catch (error: any) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
