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

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const medicineQuery = searchParams.get('medicine');

    const whereClause: any = {};
    if (doctorId) whereClause.doctorId = doctorId;

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        doctor: {
          include: { user: { select: { name: true, email: true } } },
        },
        patient: {
          include: { user: { select: { name: true, email: true } } },
        },
        consultation: {
          select: { id: true, diagnosis: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 200,
    });

    // Filter by medicine name if provided
    let filtered = prescriptions;
    if (medicineQuery) {
      const q = medicineQuery.toLowerCase();
      filtered = prescriptions.filter((p) =>
        p.medicines.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      count: filtered.length,
      prescriptions: filtered,
    });
  } catch (error: any) {
    console.error('Fetch prescription audit error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
