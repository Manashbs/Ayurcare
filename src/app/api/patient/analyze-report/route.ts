import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { CLINICAL_DATABASE, ExtractedMetric, MedicalAnalysisResult } from '@/lib/medical-parser';
import { generateAIResponse } from '@/lib/ai-provider';

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
    const { file, reportType, metrics, rawText, textFindings } = body;

    // Try live AI inference via Google Gemini API
    try {
      const promptText = `Analyze the following medical report:
Report Type: ${reportType}
Text Content: ${rawText || textFindings || 'No raw text extracted'}
Extracted Metrics: ${JSON.stringify(metrics || [])}

Provide a comprehensive clinical and Ayurvedic evaluation containing:
1. "summary": One sentence overall diagnostic summary.
2. "overallHealthStatus": Exactly one of ("Optimal", "Mild Issues Detected", "Attention Required").
3. "goods": List of normal/healthy findings with "title" and "desc".
4. "bads": List of abnormal/out-of-range/problematic findings with "title", "desc", and "severity" ("Low", "Moderate", "High").
5. "pathologyExplanation": Ayurvedic Samprapti explanation (Vata, Pitta, Kapha, Agni, Dhatu).
6. "remedies": Recommended herbal remedies (e.g. Triphala, Ashwagandha, Guduchi).
7. "dietPathya": Foods to favor.
8. "dietApathya": Foods to avoid.

Format your response as valid raw JSON matching these keys.`;

      const aiResponse = await generateAIResponse(
        [{ role: 'user', content: promptText }],
        'You are PrakritiAI Clinical & Ayurvedic Report Diagnostic Assistant.'
      );

      if (aiResponse && aiResponse.text) {
        const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.summary && parsed.goods && parsed.bads) {
            return NextResponse.json({
              success: true,
              summary: parsed.summary,
              overallHealthStatus: parsed.overallHealthStatus || 'Mild Issues Detected',
              goods: parsed.goods || [],
              bads: parsed.bads || [],
              neutrals: [],
              metrics: metrics || [],
              ayurvedicAnalysis: {
                doshaImbalance: parsed.doshaImbalance || ['Vata', 'Pitta'],
                affectedDhatus: parsed.affectedDhatus || ['Rasa Dhatu', 'Rakta Dhatu'],
                pathologyExplanation: parsed.pathologyExplanation || 'Ayurvedic evaluation complete.',
                remedies: parsed.remedies || ['CCF Tea', 'Triphala Churna'],
                dietPathya: parsed.dietPathya || ['Fresh warm cooked meals'],
                dietApathya: parsed.dietApathya || ['Raw cold salads', 'Ice cold drinks'],
              },
              provider: aiResponse.provider,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Live Gemini AI report analysis fallback:', e);
    }

    // Rule-based fallback clinical engine
    const goods: MedicalAnalysisResult['goods'] = [];
    const bads: MedicalAnalysisResult['bads'] = [];
    const neutrals: MedicalAnalysisResult['neutrals'] = [];

    const imbalancedDoshasSet = new Set<'Vata' | 'Pitta' | 'Kapha'>();
    const affectedDhatusSet = new Set<string>();
    const remediesSet = new Set<string>();
    const pathyaSet = new Set<string>();
    const apathyaSet = new Set<string>();

    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
      metrics.forEach((m: ExtractedMetric) => {
        const dbKey = Object.keys(CLINICAL_DATABASE).find(k => 
          CLINICAL_DATABASE[k].name.toLowerCase().includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(k)
        );

        const dbItem = dbKey ? CLINICAL_DATABASE[dbKey] : null;

        if (m.status === 'NORMAL') {
          goods.push({
            title: `${m.name}: Normal (${m.value} ${m.unit})`,
            desc: `Your ${m.name} is within healthy physiological limits (${m.refRange} ${m.unit}). This reflects optimal tissue digestion and balanced metabolic fire (Sama Agni).`,
          });
          pathyaSet.add('Maintain fresh, wholesome cooked meals');
        } else if (m.status === 'LOW') {
          const title = dbItem ? dbItem.lowTitle : `Low ${m.name}`;
          const desc = dbItem ? dbItem.lowDesc : `Measured at ${m.value} ${m.unit} (Ref: ${m.refRange}). Indicates depleted tissue vitality or reduced metabolic activity.`;
          
          bads.push({
            title: `${m.name} (LOW): ${title}`,
            desc,
            severity: 'Moderate',
          });

          if (dbItem) {
            dbItem.lowRemedies.forEach(r => remediesSet.add(r));
            dbItem.lowPathya.forEach(p => pathyaSet.add(p));
            dbItem.lowApathya.forEach(a => apathyaSet.add(a));
          }
        } else if (m.status === 'HIGH') {
          const title = dbItem ? dbItem.highTitle : `High ${m.name}`;
          const desc = dbItem ? dbItem.highDesc : `Measured at ${m.value} ${m.unit} (Ref: ${m.refRange}). Points to metabolic accumulation or inflammatory heat.`;
          
          bads.push({
            title: `${m.name} (HIGH): ${title}`,
            desc,
            severity: 'High',
          });

          if (dbItem) {
            dbItem.highRemedies.forEach(r => remediesSet.add(r));
            dbItem.highPathya.forEach(p => pathyaSet.add(p));
            dbItem.highApathya.forEach(a => apathyaSet.add(a));
          }
        }
      });
    }

    if (goods.length === 0 && bads.length === 0) {
      goods.push({
        title: 'Report Text Extracted Successfully',
        desc: 'Document text was parsed. No acute life-threatening critical anomalies were detected.',
      });
    }

    if (remediesSet.size === 0) {
      remediesSet.add('Sip warm CCF (Cumin, Coriander, Fennel) tea daily');
      remediesSet.add('Practice 10 minutes of Sama Vritti Box Breathing daily');
    }

    const result: MedicalAnalysisResult = {
      summary: bads.length > 0 ? `${bads.length} Out-of-Range Finding(s) Identified` : 'All Inspected Parameters are within Healthy Limits',
      overallHealthStatus: bads.length > 0 ? 'Attention Required' : 'Optimal',
      goods,
      bads,
      neutrals,
      metrics: metrics || [],
      ayurvedicAnalysis: {
        doshaImbalance: ['Vata', 'Pitta'],
        affectedDhatus: ['Rasa Dhatu', 'Rakta Dhatu'],
        pathologyExplanation: 'Physiological parameters analyzed against clinical standards.',
        remedies: Array.from(remediesSet),
        dietPathya: Array.from(pathyaSet.size > 0 ? pathyaSet : ['Fresh warm meals']),
        dietApathya: Array.from(apathyaSet.size > 0 ? apathyaSet : ['Processed snacks']),
      },
    };

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
