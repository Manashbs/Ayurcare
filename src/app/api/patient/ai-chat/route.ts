import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { getAiResponse } from '@/lib/ai';

async function verifyPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'PATIENT') return null;
  return payload;
}

export async function GET() {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await prisma.aIChatSession.findMany({
      where: { patientId: patient.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { sessionId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let session;
    if (sessionId) {
      session = await prisma.aIChatSession.findUnique({
        where: { id: sessionId },
      });
    }

    // Create session if it doesn't exist
    if (!session) {
      session = await prisma.aIChatSession.create({
        data: {
          patientId: patient.userId,
          messages: '[]',
          summary: message.substring(0, 60),
        },
      });
    }

    const messages = JSON.parse(session.messages || '[]');
    messages.push({ role: 'user', content: message });

    // Call AI service
    const aiResult = await getAiResponse(messages);
    messages.push({ role: 'assistant', content: aiResult.text });

    // Save back to DB
    const updatedSession = await prisma.aIChatSession.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(messages),
        flaggedForReview: aiResult.flagged || session.flaggedForReview,
      },
    });

    return NextResponse.json({
      sessionId: updatedSession.id,
      aiResponse: aiResult.text,
      flagged: aiResult.flagged,
      history: messages,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
