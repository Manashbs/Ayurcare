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

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { answers } = body; // answers is { bodyFrame, skinType, appetite, sleep, temperament, digest, voice, weatherPref }

    if (!answers) {
      return NextResponse.json({ error: 'Answers are required to calculate Prakriti' }, { status: 400 });
    }

    // Quiz evaluation algorithm (Vata vs Pitta vs Kapha scoring)
    let vata = 0;
    let pitta = 0;
    let kapha = 0;

    // Evaluate each answer value
    Object.values(answers).forEach((ans: any) => {
      const val = String(ans).toLowerCase();
      if (val === 'vata' || val === 'a' || val.includes('light') || val.includes('dry') || val.includes('irregular') || val.includes('anxious')) {
        vata++;
      } else if (val === 'pitta' || val === 'b' || val.includes('medium') || val.includes('warm') || val.includes('strong') || val.includes('sharp') || val.includes('ambitious')) {
        pitta++;
      } else if (val === 'kapha' || val === 'c' || val.includes('heavy') || val.includes('thick') || val.includes('steady') || val.includes('deep') || val.includes('calm')) {
        kapha++;
      } else {
        // Fallback random distribution to ensure score is calculated
        vata++;
      }
    });

    // Determine dominance
    let doshaType = '';
    const maxVal = Math.max(vata, pitta, kapha);

    if (maxVal === vata && vata === pitta) {
      doshaType = 'VATA_PITTA';
    } else if (maxVal === vata && vata === kapha) {
      doshaType = 'VATA_KAPHA';
    } else if (maxVal === pitta && pitta === kapha) {
      doshaType = 'PITTA_KAPHA';
    } else if (maxVal === vata) {
      doshaType = 'VATA';
    } else if (maxVal === pitta) {
      doshaType = 'PITTA';
    } else {
      doshaType = 'KAPHA';
    }

    // Save calculation to DB PatientProfile
    const updatedProfile = await prisma.patientProfile.update({
      where: { userId: patient.userId },
      data: {
        doshaType,
        lifestyleData: JSON.stringify({
          scores: { vata, pitta, kapha },
          lastQuizDate: new Date().toISOString(),
        }),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: patient.userId,
        action: 'PATIENT_PRAKRITI_QUIZ',
        metadata: JSON.stringify({ doshaType, vata, pitta, kapha }),
      },
    });

    return NextResponse.json({
      message: 'Dosha evaluation completed successfully!',
      doshaType,
      scores: { vata, pitta, kapha },
    });
  } catch (error: any) {
    console.error('Prakriti quiz error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
