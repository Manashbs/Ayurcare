import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ medicines });
  } catch (error: any) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, dosage, anupana, prescriptionOnly, description } = body;

    if (!name || !dosage || !anupana) {
      return NextResponse.json({ error: 'Name, dosage, and vehicle (Anupana) are required' }, { status: 400 });
    }

    const existing = await prisma.medicine.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'A medicine with this name already exists' }, { status: 400 });
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        dosage,
        anupana,
        prescriptionOnly: !!prescriptionOnly,
        description,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'CATALOG_ADD_MEDICINE',
        metadata: JSON.stringify({ name, prescriptionOnly }),
      },
    });

    return NextResponse.json({
      message: 'Medicine added to catalog successfully',
      medicine: newMedicine,
    });
  } catch (error: any) {
    console.error('Catalog add error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
