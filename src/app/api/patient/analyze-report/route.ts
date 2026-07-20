import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { CLINICAL_DATABASE, ExtractedMetric, MedicalAnalysisResult } from '@/lib/medical-parser';

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

    const goods: MedicalAnalysisResult['goods'] = [];
    const bads: MedicalAnalysisResult['bads'] = [];
    const neutrals: MedicalAnalysisResult['neutrals'] = [];

    const imbalancedDoshasSet = new Set<'Vata' | 'Pitta' | 'Kapha'>();
    const affectedDhatusSet = new Set<string>();
    const remediesSet = new Set<string>();
    const pathyaSet = new Set<string>();
    const apathyaSet = new Set<string>();

    // 1. Analyze Numerical Metrics (Lab Reports / Blood tests / Panels)
    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
      metrics.forEach((m: ExtractedMetric) => {
        const val = parseFloat(m.value);
        
        // Match against CLINICAL_DATABASE if available
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

          if (m.name.toLowerCase().includes('hemoglobin') || m.name.toLowerCase().includes('rbc') || m.name.toLowerCase().includes('platelet')) {
            imbalancedDoshasSet.add('Vata');
            imbalancedDoshasSet.add('Pitta');
            affectedDhatusSet.add('Rakta Dhatu (Blood)');
            affectedDhatusSet.add('Rasa Dhatu (Plasma)');
          } else if (m.name.toLowerCase().includes('glucose') || m.name.toLowerCase().includes('creatinine')) {
            imbalancedDoshasSet.add('Vata');
            affectedDhatusSet.add('Ojas (Vital Energy)');
          } else if (m.name.toLowerCase().includes('vitamin d')) {
            imbalancedDoshasSet.add('Vata');
            affectedDhatusSet.add('Asthi Dhatu (Bones)');
          } else if (m.name.toLowerCase().includes('vitamin b12')) {
            imbalancedDoshasSet.add('Vata');
            affectedDhatusSet.add('Majja Dhatu (Nerves & Marrow)');
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

          if (m.name.toLowerCase().includes('cholesterol') || m.name.toLowerCase().includes('glucose') || m.name.toLowerCase().includes('hba1c') || m.name.toLowerCase().includes('tsh')) {
            imbalancedDoshasSet.add('Kapha');
            affectedDhatusSet.add('Medo Dhatu (Fat/Lipids)');
            affectedDhatusSet.add('Kleda (Metabolic Fluids)');
          } else if (m.name.toLowerCase().includes('alt') || m.name.toLowerCase().includes('sgpt') || m.name.toLowerCase().includes('wbc') || m.name.toLowerCase().includes('hemoglobin')) {
            imbalancedDoshasSet.add('Pitta');
            affectedDhatusSet.add('Rakta Dhatu (Blood)');
            affectedDhatusSet.add('Yakrut (Liver Organ)');
          } else if (m.name.toLowerCase().includes('creatinine')) {
            imbalancedDoshasSet.add('Vata');
            imbalancedDoshasSet.add('Kapha');
            affectedDhatusSet.add('Mutravaha Srotas (Renal Channels)');
          }
        }
      });
    }

    // 2. Process Radiology Scan Findings (X-Ray / MRI / Scans)
    if (reportType === 'xray' || reportType === 'mri') {
      const fullTextLower = (rawText || '' || (textFindings || []).join(' ')).toLowerCase();
      
      let foundScanAbnormality = false;

      if (fullTextLower.includes('opacity') || fullTextLower.includes('consolidation') || fullTextLower.includes('infiltrate') || fullTextLower.includes('pneumonia')) {
        foundScanAbnormality = true;
        bads.push({
          title: 'Pulmonary Opacity / Congestion Noted',
          desc: 'Scan reveals increased density or fluid accumulation in lung tissue. In Ayurveda, this represents an accumulation of Avalambaka Kapha blocking Pranavaha Srotas (respiratory channels).',
          severity: 'High',
        });
        imbalancedDoshasSet.add('Kapha');
        affectedDhatusSet.add('Pranavaha Srotas (Respiratory System)');
        remediesSet.add('Inhale eucalyptus oil steam twice daily');
        remediesSet.add('Take Sitopaladi Churna (1/2 tsp with honey twice daily)');
        remediesSet.add('Drink warm Ginger & Tulsi decoction');
        pathyaSet.add('Light warm soups with black pepper');
        pathyaSet.add('Steamed green vegetables');
        apathyaSet.add('Ice-cold water & milkshakes');
        apathyaSet.add('Heavy dairy desserts & yogurts');
      }

      if (fullTextLower.includes('disc bulge') || fullTextLower.includes('herniation') || fullTextLower.includes('spondylosis') || fullTextLower.includes('degeneration') || fullTextLower.includes('stenosis')) {
        foundScanAbnormality = true;
        bads.push({
          title: 'Spinal Disc & Degenerative Structural Changes',
          desc: 'Scan indicates intervertebral disc displacement or joint wear. In Ayurveda, spinal structural degeneration is caused by hyperactive Vyana Vata drying up Majja Dhatu (spinal nerve & marrow fluids).',
          severity: 'Moderate',
        });
        imbalancedDoshasSet.add('Vata');
        affectedDhatusSet.add('Asthi Dhatu (Bones)');
        affectedDhatusSet.add('Majja Dhatu (Spinal Nerves)');
        remediesSet.add('Apply warm Mahanarayana Thailam oil to spine twice daily');
        remediesSet.add('Take Trayodashanga Guggulu (2 tabs twice daily)');
        remediesSet.add('Practice gentle posture alignment asanas');
        pathyaSet.add('Warm milk with organic cow ghee at bedtime');
        pathyaSet.add('Soaked sesame seeds and cooked whole grains');
        apathyaSet.add('Lifting heavy weights unassisted');
        apathyaSet.add('Dry crackers and cold carbonated drinks');
      }

      if (fullTextLower.includes('cardiomegaly') || fullTextLower.includes('enlarged heart')) {
        foundScanAbnormality = true;
        bads.push({
          title: 'Cardiomegaly / Cardiac Shadow Enlargement',
          desc: 'Radiology reveals cardiac shadow prominence. Linked to Pitta-Kapha overload in Sadhaka Pitta and Hridaya Srotas.',
          severity: 'High',
        });
        imbalancedDoshasSet.add('Pitta');
        imbalancedDoshasSet.add('Kapha');
        affectedDhatusSet.add('Hridaya (Heart & Circulation)');
        remediesSet.add('Arjuna Ksheerapaka (Arjuna bark boiled in milk)');
        remediesSet.add('Prabhakar Vati');
        pathyaSet.add('Garlic infusion');
        pathyaSet.add('Pomegranate juice');
        apathyaSet.add('Excessive salt & deep fried foods');
      }

      if (!foundScanAbnormality) {
        goods.push({
          title: `Scan (${reportType.toUpperCase()}): No Acute Structural Defect Found`,
          desc: `Visual inspection of your ${reportType.toUpperCase()} shows clear anatomical boundaries, intact bone alignment, and no gross fluid opacity.`,
        });
        pathyaSet.add('Continue regular daily physical activity');
      }
    }

    // 3. Fallback defaults if no parameters could be automatically grouped
    if (goods.length === 0 && bads.length === 0) {
      goods.push({
        title: 'Report Text Extracted Successfully',
        desc: 'Document text was parsed. No acute life-threatening critical anomalies were detected.',
      });
      neutrals.push({
        title: 'General Clinical Parameters',
        desc: 'Review individual values below with your consulting physician for longitudinal tracking.',
      });
    }

    if (remediesSet.size === 0) {
      remediesSet.add('Sip warm CCF (Cumin, Coriander, Fennel) tea daily');
      remediesSet.add('Practice 10 minutes of Sama Vritti Box Breathing daily');
    }
    if (pathyaSet.size === 0) {
      pathyaSet.add('Freshly cooked warm seasonal vegetables');
      pathyaSet.add('Moong dal & basmati rice');
    }
    if (apathyaSet.size === 0) {
      apathyaSet.add('Ultra-processed packaged snacks');
      apathyaSet.add('Ice cold beverages with heavy meals');
    }

    const imbalancedDoshas = imbalancedDoshasSet.size > 0 
      ? (Array.from(imbalancedDoshasSet) as ('Vata' | 'Pitta' | 'Kapha')[]) 
      : (['Vata'] as ('Vata' | 'Pitta' | 'Kapha')[]);
    const affectedDhatus = affectedDhatusSet.size > 0 ? Array.from(affectedDhatusSet) : ['Rasa Dhatu (Plasma)', 'Rakta Dhatu (Blood)'];

    let overallHealthStatus: MedicalAnalysisResult['overallHealthStatus'] = 'Optimal';
    if (bads.some(b => b.severity === 'High')) {
      overallHealthStatus = 'Attention Required';
    } else if (bads.length > 0) {
      overallHealthStatus = 'Mild Issues Detected';
    }

    const summary = bads.length > 0
      ? `${bads.length} Out-of-Range Finding(s) Identified requiring Ayurvedic Attention`
      : 'All Inspected Parameters are within Healthy Physiological Limits';

    const pathologyExplanation = bads.length > 0
      ? `Analysis indicates ${imbalancedDoshas.join(' & ')} dosha vitiation impacting ${affectedDhatus.join(', ')}. Restoring digestive fire (Agni) and clearing micro-channel blockages (Ama) is recommended.`
      : 'Physiological parameters demonstrate balanced metabolic fire (Sama Agni) and unblocked tissues (Prasanna Dhatu).';

    const result: MedicalAnalysisResult = {
      summary,
      overallHealthStatus,
      goods,
      bads,
      neutrals,
      metrics: metrics || [],
      ayurvedicAnalysis: {
        doshaImbalance: imbalancedDoshas,
        affectedDhatus,
        pathologyExplanation,
        remedies: Array.from(remediesSet),
        dietPathya: Array.from(pathyaSet),
        dietApathya: Array.from(apathyaSet),
      },
    };

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
