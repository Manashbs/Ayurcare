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

    const user = await prisma.user.findUnique({
      where: { id: doctor.userId },
      include: { doctorProfile: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const doctor = await verifyDoctor();
    if (!doctor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, phone, qualification, specializations, experienceYears, bio, feePerConsult, clinicAddress, languages, availability } = body;

    const updated = await prisma.$transaction(async (tx: any) => {
      // Update User details
      const userUpdate: any = {};
      if (name) userUpdate.name = name;
      if (phone !== undefined) userUpdate.phone = phone;

      await tx.user.update({
        where: { id: doctor.userId },
        data: userUpdate,
      });

      // Update Doctor Profile
      const profileUpdate: any = {};
      if (qualification) profileUpdate.qualification = qualification;
      if (specializations) profileUpdate.specializations = specializations;
      if (experienceYears !== undefined) profileUpdate.experienceYears = parseInt(experienceYears);
      if (bio !== undefined) profileUpdate.bio = bio;
      if (feePerConsult !== undefined) profileUpdate.feePerConsult = parseFloat(feePerConsult);
      if (clinicAddress !== undefined) profileUpdate.clinicAddress = clinicAddress;
      if (languages !== undefined) profileUpdate.languages = languages;
      if (availability !== undefined) profileUpdate.availability = JSON.stringify(availability);

      const profile = await tx.doctorProfile.update({
        where: { userId: doctor.userId },
        data: profileUpdate,
      });

      return profile;
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updated,
    });
  } catch (error: any) {
    console.error('Doctor profile update error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
