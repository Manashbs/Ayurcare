const TARGET_ADMIN_EMAIL = 'admin@ayurcare.ac.in';
const LEGACY_ADMIN_EMAIL = 'admin@ayurcare.com';

function promptForPassword() {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    if (!input.isTTY || typeof input.setRawMode !== 'function') {
      reject(new Error('Run this script from an interactive terminal.'));
      return;
    }

    let password = '';
    process.stdout.write('New admin password (input hidden): ');
    input.setRawMode(true);
    input.resume();

    const finish = (error) => {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') {
          finish(new Error('Cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          if (password.length) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          continue;
        }
        if (character >= ' ' && character <= '~') {
          password += character;
          process.stdout.write('*');
        }
      }
    };

    input.on('data', onData);
  });
}

async function main() {
  await import('dotenv/config');
  const [{ PrismaClient }, { PrismaPg }, { Pool }, bcryptModule] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
    import('bcryptjs'),
  ]);
  const bcrypt = bcryptModule.default;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const matches = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        email: { in: [LEGACY_ADMIN_EMAIL, TARGET_ADMIN_EMAIL] },
      },
      select: { id: true, email: true },
    });

    if (matches.length !== 1) {
      throw new Error('Expected exactly one existing admin account matching the known admin emails. No changes were made.');
    }

    const admin = matches[0];
    const conflictingUser = await prisma.user.findUnique({ where: { email: TARGET_ADMIN_EMAIL } });
    if (conflictingUser && conflictingUser.id !== admin.id) {
      throw new Error('The target email belongs to another account. No changes were made.');
    }

    let password = await promptForPassword();
    if (password.length < 8) {
      throw new Error('Password must contain at least 8 characters. No changes were made.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    password = '';
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: admin.id },
        data: {
          email: TARGET_ADMIN_EMAIL,
          emailVerified: true,
          passwordHash,
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });
      await tx.refreshToken.updateMany({
        where: { userId: admin.id },
        data: { revoked: true },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: 'ADMIN_CREDENTIALS_ROTATED',
          metadata: JSON.stringify({ email: TARGET_ADMIN_EMAIL }),
        },
      });
    });

    console.log(`Updated the existing admin account to ${TARGET_ADMIN_EMAIL}.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(() => {
  console.error('Admin credential update failed. Check the account and database configuration; no password was logged.');
  process.exitCode = 1;
});