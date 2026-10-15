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

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, dosage, anupana, prescriptionOnly, description } = body;

    const existingMedicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    });

    if (!existingMedicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        dosage: dosage || undefined,
        anupana: anupana || undefined,
        prescriptionOnly: prescriptionOnly !== undefined ? !!prescriptionOnly : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'CATALOG_UPDATE_MEDICINE',
        metadata: JSON.stringify({ id: params.id, name: updatedMedicine.name }),
      },
    });

    return NextResponse.json({
      message: 'Medicine updated successfully',
      medicine: updatedMedicine,
    });
  } catch (error: any) {
    console.error('Catalog update error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existingMedicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    });

    if (!existingMedicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    await prisma.medicine.delete({
      where: { id: params.id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'CATALOG_DELETE_MEDICINE',
        metadata: JSON.stringify({ id: params.id, name: existingMedicine.name }),
      },
    });

    return NextResponse.json({
      message: 'Medicine deleted successfully from catalog',
    });
  } catch (error: any) {
    console.error('Catalog delete error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
