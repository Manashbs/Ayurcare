import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

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

const pdf = require('pdf-parse');

async function verifyPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload || payload.role !== 'PATIENT') return null;
  return payload;
}

// Regex patterns to parse parameters from PDF extracted text
const PARSE_PATTERNS = [
  { key: 'hemoglobin', regex: /(?:hemoglobin|haemoglobin|hb|hgb)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:g\/dl|g\/l|%|gm)?/i },
  { key: 'cholesterol', regex: /(?:total cholesterol|cholesterol|tc|chol)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:mg\/dl|mmol\/l)?/i },
  { key: 'tsh', regex: /(?:tsh|thyroid stimulating hormone|thyroid)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:miu\/l|uIu\/ml)?/i },
  { key: 'glucose', regex: /(?:glucose|fasting glucose|fbs|fasting blood sugar|blood sugar|sugar)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:mg\/dl|mmol\/l)?/i },
  { key: 'hba1c', regex: /(?:hba1c|glycated hemoglobin|glycohemoglobin)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:%)?/i },
  { key: 'wbc', regex: /(?:wbc|white blood cells|leukocytes|total wbc)\s*      (?:count)?\s*[:=-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i },
  { key: 'creatinine', regex: /(?:creatinine|creat|serum creatinine)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:mg\/dl|umol\/l)?/i },
  { key: 'alt', regex: /(?:alt|sgpt|alanine aminotransferase)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:u\/l)?/i },
  { key: 'vitaminD', regex: /(?:vitamin d|vit d|25-hydroxy vitamin d|25-oh vit d)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:ng\/ml)?/i },
  { key: 'vitaminB12', regex: /(?:vitamin b12|vit b12|cobalamin|b12)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:pg\/ml|pmol\/l)?/i },
  { key: 'rbc', regex: /(?:rbc|red blood cells|erythrocytes|rbc count)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:million\/ul|m\/ul)?/i },
  { key: 'platelets', regex: /(?:platelet|platelets|plt|platelet count)\s*(?:count)?\s*[:=-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i },
];

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
    const parsedData: Record<string, string> = {};

    if (file.includes('data:application/pdf;base64,')) {
      const base64Data = file.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const pdfParser = typeof pdf === 'function' ? pdf : (pdf.default || pdf);
      const pdfData = await pdfParser(buffer);
      extractedText = pdfData.text || '';

      // Match values from the PDF text
      PARSE_PATTERNS.forEach((pattern) => {
        const match = extractedText.match(pattern.regex);
        if (match && match[1]) {
          let valueStr = match[1].replace(/,/g, ''); // Remove commas e.g. 14,800 -> 14800
          let val = parseFloat(valueStr);
          
          if (!isNaN(val)) {
            // Normalization check:
            // WBC: convert cells/µL to 10^3/µL (e.g. 14800 -> 14.8)
            if (pattern.key === 'wbc' && val > 250) {
              val = val / 1000;
            }
            // Platelets: convert cells/µL to 10^3/µL (e.g. 95000 -> 95)
            if (pattern.key === 'platelets' && val > 1000) {
              val = val / 1000;
            }
            parsedData[pattern.key] = val.toString();
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      extractedText,
      parsedData,
    });
  } catch (error: any) {
    console.error('PDF Extraction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract text' }, { status: 500 });
  }
}
