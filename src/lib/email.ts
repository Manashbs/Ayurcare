import nodemailer from 'nodemailer';

const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'prakritiai.connect@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_FROM_EMAIL,
    pass: SMTP_PASSWORD || '',
  },
});

async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
  // If SMTP password is not set or is mock, log to console instead of failing
  if (!SMTP_PASSWORD || SMTP_PASSWORD === 'mock_app_password') {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`FROM: ${SMTP_FROM_EMAIL}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${html.replace(/<[^>]*>/g, ' ').substring(0, 500)}...`);
    console.log('=======================================================\n');
    return { messageId: 'mock-id-' + Math.random().toString(36).substring(7) };
  }

  try {
    const info = await transporter.sendMail({
      from: `"VedaSync AI" <${SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: text || subject,
      html,
    });
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email to:', to, error);
    throw error;
  }
}

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">Verify Your VedaSync Account</h2>
      <p style="font-size: 16px; color: #333;">Thank you for registering with VedaSync. Please use the following 6-digit One-Time Password (OTP) to verify your account. This code is valid for 10 minutes.</p>
      <div style="background-color: #f5f5f4; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">If you did not request this code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'Verify your VedaSync account', html });
}

export async function sendResetPasswordEmail(toEmail: string, resetLinkOrOtp: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #333;">We received a request to reset the password for your VedaSync account. Use the following OTP to reset your password. This code will expire in 15 minutes.</p>
      <div style="background-color: #f5f5f4; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534;">${resetLinkOrOtp}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">If you did not make this request, please change your password immediately to protect your account.</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'Reset your VedaSync password', html });
}

export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">Welcome to VedaSync!</h2>
      <p style="font-size: 16px; color: #333;">Namaste <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Welcome to VedaSync, your gateway to traditional Ayurvedic wisdom and modern telemedicine. Your account is now active!</p>
      <p style="font-size: 16px; color: #333;">You can now log in, schedule consultations with verified Ayurvedic physicians, assess your Prakriti (Dosha), and converse with our AI wellness assistant.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000" style="background-color: #166534; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'Welcome to VedaSync', html });
}

export async function sendDoctorApprovalEmail(toEmail: string, doctorName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">Application Verified Successfully</h2>
      <p style="font-size: 16px; color: #333;">Dear <strong>Dr. ${doctorName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Congratulations! Your credentials have been successfully reviewed and verified by our administrative team. Your VedaSync Doctor Portal is now fully unlocked.</p>
      <p style="font-size: 16px; color: #333;">You can now log in to set your weekly availability slots, view upcoming bookings, and consult patients.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/doctor/login" style="background-color: #166534; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Doctor Portal</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'VedaSync Doctor Profile Approved!', html });
}

export async function sendDoctorRejectionEmail(toEmail: string, doctorName: string, reason: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #c2410c; text-align: center;">Application Status Update</h2>
      <p style="font-size: 16px; color: #333;">Dear <strong>Dr. ${doctorName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">We regret to inform you that your application to practice on the VedaSync platform could not be approved at this time.</p>
      <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #991b1b;">Rejection Reason:</strong>
        <p style="margin: 5px 0 0 0; color: #7f1d1d;">${reason}</p>
      </div>
      <p style="font-size: 16px; color: #333;">You may re-submit your verification documents or contact support for further clarification.</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'VedaSync Application Update', html });
}

export async function sendPrescriptionReadyEmail(toEmail: string, patientName: string, doctorName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">E-Prescription Available</h2>
      <p style="font-size: 16px; color: #333;">Dear <strong>${patientName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Your consultation prescription is now ready. <strong>Dr. ${doctorName}</strong> has uploaded your e-prescription along with Ayurvedic dosage and lifestyle guidance.</p>
      <p style="font-size: 16px; color: #333;">You can view, manage, and download it from the "My Prescriptions" section on your dashboard.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/patient/dashboard" style="background-color: #166534; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Prescriptions</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;
  return sendEmail({ to: toEmail, subject: 'Your VedaSync Prescription is Ready', html });
}

export async function sendAppointmentConfirmationEmail({
  toEmail,
  recipientName,
  doctorName,
  patientName,
  scheduledAt,
  meetUrl,
  isDoctor
}: {
  toEmail: string;
  recipientName: string;
  doctorName: string;
  patientName: string;
  scheduledAt: Date;
  meetUrl: string;
  isDoctor: boolean;
}) {
  const dateStr = new Date(scheduledAt).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf7f0;">
      <h2 style="color: #166534; text-align: center;">VedaSync Consultation Confirmed</h2>
      <p style="font-size: 16px; color: #333;">Namaste <strong>${recipientName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">
        ${isDoctor 
          ? `A follow-up consultation with patient <strong>${patientName}</strong> has been scheduled.` 
          : `Your consultation request with <strong>Dr. ${doctorName}</strong> has been successfully booked.`}
      </p>
      
      <div style="background-color: #f5f5f4; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #166534; font-weight: bold; line-height: 1.6;">
        📅 Scheduled Time: ${dateStr}<br/>
        ⏱️ Duration: 1 Hour 30 Minutes (Strict 90 Mins)<br/>
        📹 Platform: VedaSync Encrypted Video Portal
      </div>

      <p style="font-size: 15px; color: #333;">
        This consultation room is encrypted and strictly restricted to authorized participants. Access will open exactly at the scheduled time and will remain active for 1:30 hours.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meetUrl}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Join Consultation Portal</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">VedaSync Telemedicine Portal &copy; 2026</p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `VedaSync Consultation Confirmed: ${new Date(scheduledAt).toLocaleDateString()}`,
    html
  });
}
