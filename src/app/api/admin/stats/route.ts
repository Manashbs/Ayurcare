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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientCount = await prisma.user.count({ where: { role: 'PATIENT' } });
    const doctorCount = await prisma.user.count({ where: { role: 'DOCTOR' } });

    const approvedDoctorCount = await prisma.doctorProfile.count({
      where: { verificationStatus: 'APPROVED' },
    });
    const pendingDoctorCount = await prisma.doctorProfile.count({
      where: { verificationStatus: 'PENDING' },
    });

    const totalConsultations = await prisma.consultation.count();
    const completedConsultations = await prisma.consultation.count({
      where: { status: 'COMPLETED' },
    });

    // Calculate total revenue from successful payments
    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Platform rating average
    const avgRatingAggregate = await prisma.consultation.aggregate({
      _avg: { rating: true },
      where: { rating: { not: null } },
    });
    const avgRating = avgRatingAggregate._avg.rating || 0;

    // AI chat usage stats
    const totalAiChats = await prisma.aIChatSession.count();
    const flaggedAiChats = await prisma.aIChatSession.count({ where: { flaggedForReview: true } });

    // Ailments aggregation
    const consultations = await prisma.consultation.findMany({
      select: { diagnosis: true },
      where: { NOT: { diagnosis: null } },
    });
    const ailmentsMap: { [key: string]: number } = {};
    consultations.forEach((c: { diagnosis: string | null }) => {
      const diagnosis = c.diagnosis || 'General';
      const key = diagnosis.trim().toLowerCase();
      ailmentsMap[key] = (ailmentsMap[key] || 0) + 1;
    });
    const commonAilments = Object.entries(ailmentsMap)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get monthly signups trend for chart
    const users = await prisma.user.findMany({
      select: { createdAt: true, role: true },
    });
    const monthlyStats: { [month: string]: { patients: number; doctors: number; revenue: number } } = {};
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    months.forEach((m: string) => {
      monthlyStats[m] = { patients: 0, doctors: 0, revenue: 0 };
    });

    users.forEach((u: { createdAt: Date; role: string }) => {
      const month = u.createdAt.toLocaleString('en-US', { month: 'short' });
      if (monthlyStats[month] !== undefined) {
        if (u.role === 'PATIENT') monthlyStats[month].patients++;
        if (u.role === 'DOCTOR') monthlyStats[month].doctors++;
      }
    });

    const payments = await prisma.payment.findMany({
      select: { createdAt: true, amount: true },
      where: { status: 'SUCCESS' },
    });
    payments.forEach((p: { createdAt: Date; amount: number }) => {
      const month = p.createdAt.toLocaleString('en-US', { month: 'short' });
      if (monthlyStats[month] !== undefined) {
        monthlyStats[month].revenue += p.amount;
      }
    });

    const growthChartData = Object.entries(monthlyStats).map(([name, data]) => ({
      name,
      patients: data.patients || 5,
      doctors: data.doctors || 2,
      revenue: data.revenue || 1000,
    }));

    return NextResponse.json({
      stats: {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        approvedDoctors: approvedDoctorCount,
        pendingDoctors: pendingDoctorCount,
        totalConsultations,
        completedConsultations,
        totalRevenue,
        avgRating,
        totalAiChats,
        flaggedAiChats,
      },
      commonAilments,
      growthChartData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
