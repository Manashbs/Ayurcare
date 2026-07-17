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

    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        status: 'ACTIVE',
        doctorProfile: {
          isApproved: true,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        doctorProfile: {
          select: {
            qualification: true,
            regNumber: true,
            specializations: true,
            experienceYears: true,
            bio: true,
            feePerConsult: true,
            avgRating: true,
            languages: true,
            clinicAddress: true,
            availability: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ doctors });
  } catch (error: any) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
