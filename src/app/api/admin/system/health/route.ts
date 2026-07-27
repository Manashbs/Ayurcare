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

    const checks: any = {};
    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';

    // 1. Database Check
    const dbStartTime = Date.now();
    try {
      await prisma.user.count();
      const dbLatency = Date.now() - dbStartTime;
      checks.database = {
        status: 'UP',
        latencyMs: dbLatency,
        provider: 'Neon PostgreSQL',
      };
    } catch (e: any) {
      checks.database = { status: 'DOWN', error: e.message };
      overallStatus = 'DOWN';
    }

    // 2. Stripe API Check
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey.startsWith('sk_test_')) {
      checks.stripe = {
        status: 'UP',
        mode: 'TEST',
        configured: true,
      };
    } else if (stripeKey && stripeKey.startsWith('sk_live_')) {
      checks.stripe = {
        status: 'UP',
        mode: 'LIVE',
        configured: true,
      };
    } else {
      checks.stripe = {
        status: 'DEGRADED',
        error: 'Missing or mock Stripe key',
        configured: false,
      };
      if (overallStatus !== 'DOWN') overallStatus = 'DEGRADED';
    }

    // 3. Gemini AI Assistant Check
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.length > 10 && !geminiKey.includes('mock')) {
      checks.aiAssistant = {
        status: 'UP',
        provider: 'Google Gemini AI',
        configured: true,
      };
    } else {
      checks.aiAssistant = {
        status: 'DEGRADED',
        provider: 'Google Gemini AI',
        error: 'Gemini API key unconfigured or mock',
        configured: false,
      };
      if (overallStatus !== 'DOWN') overallStatus = 'DEGRADED';
    }

    // 4. SMTP Email Service Check
    const smtpEmail = process.env.SMTP_FROM_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;
    if (smtpEmail && smtpPass && smtpPass.length >= 8) {
      checks.email = {
        status: 'UP',
        sender: smtpEmail,
        configured: true,
      };
    } else {
      checks.email = {
        status: 'DEGRADED',
        error: 'SMTP credentials incomplete',
        configured: false,
      };
      if (overallStatus !== 'DOWN') overallStatus = 'DEGRADED';
    }

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error: any) {
    console.error('System health check error:', error);
    return NextResponse.json({ error: error.message || 'Health check failed' }, { status: 500 });
  }
}
