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

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patient.userId },
      select: { lifestyleData: true },
    });

    if (!profile || !profile.lifestyleData) {
      return NextResponse.json({ logs: [] });
    }

    const data = JSON.parse(profile.lifestyleData);
    const logs = data.wellnessLogs || [];

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { sleepHours, waterIntake, mood, digestion, date } = body;

    const logDate = date || new Date().toISOString().split('T')[0];

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patient.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const lifestyleData = profile.lifestyleData ? JSON.parse(profile.lifestyleData) : {};
    const logs = lifestyleData.wellnessLogs || [];

    const newLog = {
      date: logDate,
      sleepHours: parseFloat(sleepHours || '0'),
      waterIntake: parseFloat(waterIntake || '0'),
      mood: mood || 'Good',
      digestion: digestion || 'Normal',
      createdAt: new Date().toISOString(),
    };

    // Remove existing log for this date if it exists to prevent duplicates
    const filteredLogs = logs.filter((log: any) => log.date !== logDate);
    filteredLogs.push(newLog);

    lifestyleData.wellnessLogs = filteredLogs;

    // Update profile
    await prisma.patientProfile.update({
      where: { userId: patient.userId },
      data: {
        lifestyleData: JSON.stringify(lifestyleData),
      },
    });

    return NextResponse.json({
      message: 'Daily wellness log saved successfully!',
      log: newLog,
    });
  } catch (error: any) {
    console.error('Save wellness log error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
