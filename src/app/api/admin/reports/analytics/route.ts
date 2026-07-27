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
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    // 1. Total & Monthly Revenue
    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
    });
    const totalGrossRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalCommissionRevenue = payments.reduce((acc, p) => acc + p.commission, 0);

    // 2. Doctor-wise Revenue Ranking
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        appointments: {
          where: { status: 'CONFIRMED' },
          include: { payment: true },
        },
      },
    });

    const doctorRankings = doctors.map((doc) => {
      const confirmedCount = doc.appointments.length;
      const grossEarnings = doc.appointments.reduce((sum, app) => sum + (app.payment?.amount || doc.feePerConsult), 0);
      return {
        doctorId: doc.userId,
        name: doc.user.name,
        email: doc.user.email,
        qualification: doc.qualification,
        experienceYears: doc.experienceYears,
        confirmedConsultations: confirmedCount,
        grossEarnings,
        platformCommission: grossEarnings * 0.15,
        doctorPayout: grossEarnings * 0.85,
        rating: doc.avgRating,
      };
    }).sort((a, b) => b.grossEarnings - a.grossEarnings);

    // 3. Specialization Demand Heatmap
    const specializationsMap: Record<string, { doctorCount: number; appointmentCount: number }> = {};
    doctors.forEach((doc) => {
      const specs = doc.specializations.split(',').map((s) => s.trim());
      specs.forEach((s) => {
        if (!specializationsMap[s]) {
          specializationsMap[s] = { doctorCount: 0, appointmentCount: 0 };
        }
        specializationsMap[s].doctorCount += 1;
        specializationsMap[s].appointmentCount += doc.appointments.length;
      });
    });

    // 4. Coupon Usage Cost Analysis
    const couponUsages = await prisma.couponUsage.findMany({
      include: {
        coupon: { select: { code: true, discountType: true } },
      },
    });
    const totalDiscountCost = couponUsages.reduce((sum, cu) => sum + cu.discountAmount, 0);

    // 5. Patient Cohort & Total Counts
    const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.appointment.count(),
    ]);

    return NextResponse.json({
      summary: {
        totalGrossRevenue,
        totalCommissionRevenue,
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalDiscountCost,
        couponRedemptions: couponUsages.length,
      },
      doctorRankings,
      specializationHeatmap: specializationsMap,
    });
  } catch (error: any) {
    console.error('Fetch BI analytics error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
