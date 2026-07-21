import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  const dbFileName = 'dev.db';
  const rootDbPath = path.join(process.cwd(), dbFileName);
  const prismaDbPath = path.join(process.cwd(), 'prisma', dbFileName);

  let sourcePath = '';
  if (fs.existsSync(rootDbPath)) {
    sourcePath = rootDbPath;
  } else if (fs.existsSync(prismaDbPath)) {
    sourcePath = prismaDbPath;
  }

  // Handle Vercel / Serverless environment
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.IS_LOCAL)) {
    const targetDir = os.tmpdir();
    const tmpDbPath = path.join(targetDir, dbFileName);

    if (sourcePath && !fs.existsSync(tmpDbPath)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(sourcePath, tmpDbPath);
      } catch (e) {
        console.error('Failed to copy db to tmpdir:', e);
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  if (sourcePath) {
    return `file:${sourcePath}`;
  }

  return 'file:./dev.db';
}

const dbUrl = getDatabaseUrl();

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
