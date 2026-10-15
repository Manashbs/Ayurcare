import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload || payload.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized: Patient credentials required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      avatarImage,
      dob,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContact,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is a mandatory field' }, { status: 400 });
    }

    const parsedDob = dob ? new Date(dob) : null;
    const stringifiedEmergencyContact = typeof emergencyContact === 'object' 
      ? JSON.stringify(emergencyContact) 
      : emergencyContact || null;

    // Perform atomic transaction updates
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update User Details
      const u = await tx.user.update({
        where: { id: payload.userId },
        data: {
          name,
          phone: phone || null,
          avatarImage: avatarImage || null,
        },
      });

      // 2. Upsert Patient Profile
      const p = await tx.patientProfile.upsert({
        where: { userId: payload.userId },
        create: {
          userId: payload.userId,
          dob: parsedDob,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          allergies: allergies || null,
          chronicConditions: chronicConditions || null,
          emergencyContact: stringifiedEmergencyContact,
          lifestyleData: '{}',
        },
        update: {
          dob: parsedDob,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          allergies: allergies || null,
          chronicConditions: chronicConditions || null,
          emergencyContact: stringifiedEmergencyContact,
        },
      });

      return {
        ...u,
        patientProfile: p,
      };
    });

    // Create system log
    await prisma.auditLog.create({
      data: {
        actorUserId: payload.userId,
        action: 'PATIENT_PROFILE_UPDATE',
        metadata: JSON.stringify({ email: updatedUser.email }),
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatarImage: updatedUser.avatarImage,
        patientProfile: updatedUser.patientProfile,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
