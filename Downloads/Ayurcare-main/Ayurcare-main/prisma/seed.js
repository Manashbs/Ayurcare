const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.medicine.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.labReport.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.familyMember.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = bcrypt.hashSync('Password@123', 10);

  // 1. Seed Admin
  const adminUser = await prisma.user.create({
    data: {
      role: 'ADMIN',
      email: 'admin@ayurcare.com',
      emailVerified: true,
      name: 'AyurCare Super Admin',
      passwordHash: passwordHash,
      status: 'ACTIVE',
    },
  });
  console.log('Seeded Admin:', adminUser.email);

  // 2. Seed Approved Doctor
  const doctorUser1 = await prisma.user.create({
    data: {
      role: 'DOCTOR',
      email: 'doctor@ayurcare.com',
      emailVerified: true,
      name: 'Dr. Ananya Sharma',
      phone: '+919876543211',
      passwordHash: passwordHash,
      status: 'ACTIVE',
      doctorProfile: {
        create: {
          qualification: 'BAMS, MD (Ayurveda)',
          regNumber: 'AYUR-12345',
          specializations: 'Kayachikitsa, Panchakarma',
          experienceYears: 12,
          bio: 'Specialist in detoxification therapies and chronic ailment management using traditional Panchakarma protocols.',
          feePerConsult: 500.0,
          documents: 'degree_certificate.pdf, council_license.pdf',
          isApproved: true,
          approvalStatus: 'APPROVED',
          clinicAddress: '102 Ayur Health Clinic, Indiranagar, Bengaluru',
          languages: 'English, Hindi, Kannada',
          availability: JSON.stringify({
            recurring: {
              Monday: ['09:00-13:00', '14:00-18:00'],
              Wednesday: ['09:00-13:00', '14:00-18:00'],
              Friday: ['09:00-13:00', '14:00-18:00'],
            },
            exceptions: [],
          }),
        },
      },
    },
  });
  console.log('Seeded Approved Doctor:', doctorUser1.email);

  // 3. Seed Pending Doctor
  const doctorUser2 = await prisma.user.create({
    data: {
      role: 'DOCTOR',
      email: 'pending_doctor@ayurcare.com',
      emailVerified: true,
      name: 'Dr. Vikram Malhotra',
      phone: '+919876543212',
      passwordHash: passwordHash,
      status: 'PENDING',
      doctorProfile: {
        create: {
          qualification: 'BAMS',
          regNumber: 'AYUR-67890',
          specializations: 'Shalya Tantra (Surgery), General Medicine',
          experienceYears: 5,
          bio: 'Experienced in general Ayurvedic practice and traditional surgical protocols.',
          feePerConsult: 350.0,
          documents: 'license_proof.pdf',
          isApproved: false,
          approvalStatus: 'PENDING',
          clinicAddress: '45 Lotus Ayurveda Hub, Lajpat Nagar, Delhi',
          languages: 'Hindi, Punjabi, English',
          availability: JSON.stringify({
            recurring: {
              Tuesday: ['10:00-14:00'],
              Thursday: ['10:00-14:00'],
            },
            exceptions: [],
          }),
        },
      },
    },
  });
  console.log('Seeded Pending Doctor:', doctorUser2.email);

  // 4. Seed Patient
  const patientUser = await prisma.user.create({
    data: {
      role: 'PATIENT',
      email: 'patient@ayurcare.com',
      emailVerified: true,
      name: 'Rohan Verma',
      phone: '+919876543210',
      passwordHash: passwordHash,
      status: 'ACTIVE',
      patientProfile: {
        create: {
          dob: new Date('1992-06-20'),
          gender: 'Male',
          bloodGroup: 'O+',
          doshaType: 'PITTA',
          allergies: 'Dust, Peanuts',
          chronicConditions: 'Mild Gastritis',
          lifestyleData: JSON.stringify({
            diet: 'Vegetarian',
            exercise: 'Yoga 3x week',
            stress: 'Medium',
            sleepHours: 7,
            waterIntake: 2.5,
          }),
          emergencyContact: JSON.stringify({
            name: 'Sneha Verma',
            relation: 'Spouse',
            phone: '+919876543200',
          }),
        },
      },
    },
  });
  console.log('Seeded Patient:', patientUser.email);

  // 5. Seed Medicine Catalog
  await prisma.medicine.createMany({
    data: [
      { name: 'Ashwagandha Vati', dosage: '1-2 tablets twice daily', anupana: 'Warm milk or water', prescriptionOnly: false, description: 'Helps manage stress, anxiety, and fatigue; improves vitality.' },
      { name: 'Triphala Churna', dosage: '1 tsp at bedtime', anupana: 'Warm water', prescriptionOnly: false, description: 'Supports digestion, bowel regularity, and detoxification.' },
      { name: 'Brahmi Vati', dosage: '1 tablet twice daily', anupana: 'Honey or warm water', prescriptionOnly: false, description: 'Improves memory, focus, and reduces mental stress.' },
      { name: 'Chandraprabha Vati', dosage: '2 tablets twice daily', anupana: 'Warm milk or water', prescriptionOnly: true, description: 'Prescribed for urinary tract wellness and strength.' },
      { name: 'Shatavari Kalpa', dosage: '1-2 tsp twice daily', anupana: 'Warm milk', prescriptionOnly: false, description: 'Supports female reproductive system, lactation, and vitality.' },
      { name: 'Kaishore Guggulu', dosage: '2 tablets twice daily', anupana: 'Warm water', prescriptionOnly: true, description: 'Prescribed for inflammatory joint conditions and skin issues.' }
    ]
  });
  console.log('Seeded Ayurvedic Medicine Catalog.');

  // 6. Seed some initial audit logs
  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: 'SYSTEM_SEED',
      metadata: JSON.stringify({ message: 'Database initial seed execution' }),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
