import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, doctorDetails } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    if (role !== 'PATIENT' && role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified === false) {
        // Clean up unverified, half-created registration from previous failed attempts
        await prisma.user.delete({
          where: { id: existingUser.id },
        });
      } else {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }
    }

    // Password strength check (8+ chars, at least one number and symbol)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one number and one symbol' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user & profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role,
          status: 'PENDING', // Start as pending (either pending OTP for patients or pending Admin vetting for doctors)
          emailVerified: role === 'DOCTOR' ? true : false,
        },
      });

      if (role === 'PATIENT') {
        await tx.patientProfile.create({
          data: {
            userId: newUser.id,
            lifestyleData: '{}',
          },
        });
      } else if (role === 'DOCTOR') {
        if (!doctorDetails) {
          throw new Error('Doctor qualifications and registration details are required');
        }
        const { qualification, regNumber, specializations, experienceYears, feePerConsult, documents, clinicAddress, languages, aadhaarNumber, faceIdImage } = doctorDetails;

        // Check unique license number
        const existingLicense = await tx.doctorProfile.findUnique({
          where: { regNumber },
        });
        if (existingLicense) {
          throw new Error('License registration number is already registered');
        }

        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            qualification,
            regNumber,
            specializations: specializations || 'General Ayurveda',
            experienceYears: parseInt(experienceYears || '0'),
            feePerConsult: parseFloat(feePerConsult || '0'),
            documents: documents || '',
            clinicAddress: clinicAddress || '',
            languages: languages || 'English, Hindi',
            isApproved: false,
            approvalStatus: 'PENDING',
            aadhaarNumber: aadhaarNumber || null,
            faceIdImage: faceIdImage || null,
          },
        });
      }

      return newUser;
    });

    if (role === 'DOCTOR') {
      // Create system log
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'USER_REGISTER',
          metadata: JSON.stringify({ role, email }),
        },
      });

      return NextResponse.json({
        message: 'Registration successful. Profile is pending admin vetting.',
        userId: user.id,
      });
    }

    // Generate 6-digit OTP (for PATIENTs)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP
    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'SIGNUP',
        expiresAt,
      },
    });

    // Send email
    let emailSent = false;
    try {
      const emailRes = await sendOtpEmail(email, otpCode);
      emailSent = !!emailRes?.delivered;
    } catch (mailErr) {
      console.warn('[Register] sendOtpEmail warning:', mailErr);
    }

    // Create system log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'USER_REGISTER',
        metadata: JSON.stringify({ role, email, emailSent }),
      },
    });

    return NextResponse.json({
      message: emailSent
        ? 'Registration successful. OTP sent to your email.'
        : 'Registration successful. Verification code generated.',
      userId: user.id,
      emailSent,
      // Provide previewOtp if email was not delivered so user can verify immediately
      previewOtp: emailSent ? undefined : otpCode,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during registration' }, { status: 500 });
  }
}
