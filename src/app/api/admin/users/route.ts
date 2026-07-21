import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        doctorProfile: {
          select: {
            qualification: true,
            regNumber: true,
            specializations: true,
            experienceYears: true,
            feePerConsult: true,
            isApproved: true,
            approvalStatus: true,
          },
        },
        patientProfile: {
          select: {
            dob: true,
            gender: true,
            doshaType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin users get error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, role, doctorDetails } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          role,
          passwordHash,
          status: 'ACTIVE', // Admin-created accounts are active immediately
          emailVerified: true,
        },
      });

      if (role === 'PATIENT') {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
            lifestyleData: '{}',
          },
        });
      } else if (role === 'DOCTOR') {
        const q = doctorDetails?.qualification || 'BAMS';
        const reg = doctorDetails?.regNumber || `ADMIN-REG-${Math.floor(10000 + Math.random() * 90000)}`;
        const spec = doctorDetails?.specializations || 'General Medicine';
        const exp = parseInt(doctorDetails?.experienceYears || '0');
        const fee = parseFloat(doctorDetails?.feePerConsult || '0');

        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            qualification: q,
            regNumber: reg,
            specializations: spec,
            experienceYears: exp,
            feePerConsult: fee,
            documents: '',
            isApproved: true, // Manually created doctors by admin are auto-approved
            approvalStatus: 'APPROVED',
          },
        });
      }

      return user;
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.userId,
        action: 'ADMIN_CREATE_USER',
        targetUserId: newUser.id,
        metadata: JSON.stringify({ role: newUser.role, email: newUser.email }),
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Admin user create error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
