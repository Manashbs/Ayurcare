import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { parseMedicalText } from '@/lib/medical-parser';
import { createWorker } from 'tesseract.js';

// DOM polyfills for pdf-parse in Next.js Server environments
if (typeof global !== 'undefined') {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (!(global as any).ImageData) {
    (global as any).ImageData = class ImageData {};
  }
  if (!(global as any).Path2D) {
    (global as any).Path2D = class Path2D {};
  }
}

const { PDFParse } = require('pdf-parse');

async function verifyPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'PATIENT') return null;
  return payload;
}

export async function POST(request: Request) {
  try {
    const patient = await verifyPatient();
    if (!patient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: 'File is required for extraction' }, { status: 400 });
    }

    let extractedText = '';

    // Case 1: PDF Document
    if (file.includes('data:application/pdf;base64,')) {
      try {
        const base64Data = file.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const pdfData = await parser.getText();
        extractedText = typeof pdfData === 'string' ? pdfData : (pdfData?.text || '');
      } catch (pdfErr: any) {
        console.error('PDF extraction failed:', pdfErr);
      }
    } 
    // Case 2: Image File (PNG/JPG/JPEG/Scans/X-Rays/MRIs)
    else if (file.startsWith('data:image/')) {
      try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        extractedText = ret.data.text || '';
        await worker.terminate();
      } catch (ocrErr: any) {
        console.error('OCR image extraction failed:', ocrErr);
      }
    }

    // Process extracted text through universal medical parser
    const { metrics, textFindings } = parseMedicalText(extractedText);

    return NextResponse.json({
      success: true,
      extractedText,
      metrics,
      textFindings,
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract text' }, { status: 500 });
  }
}
