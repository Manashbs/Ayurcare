import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
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
    const patient = verifyPatient();
    if (!patient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { temp, humidity, condition, city } = body;

    const promptText = `Provide a weather-aware Ayurvedic daily routine recommendation for a patient located in ${city || 'their current city'} based on the current weather:
Temperature: ${temp || 'N/A'}°C
Humidity: ${humidity || 'N/A'}%
Condition: ${condition || 'N/A'}

Format your response as a valid raw JSON matching these keys exactly:
{
  "summary": "One sentence summary of the weather's impact on their Doshas.",
  "imbalanceRisk": "Dosha(s) most vulnerable to aggravation under these conditions (e.g. Pitta, Vata, Kapha).",
  "aiAdvice": "Ayurvedic recommendations tailored to this weather (e.g. type of warm/cool water, spices to prefer, activities to avoid).",
  "suggestedMorningTask": "A specific weather-adapted morning task (e.g., Cool sheetali pranayama if hot, warming ginger water if cold)."
}

Do not include markdown or other text besides the raw JSON object.`;

    const aiResponse = await generateAIResponse(
      [{ role: 'user', content: promptText }],
      'You are PrakritiAI Weather-Aware Daily Wellness (Ritucharya & Dinacharya) Advisor.'
    );

    if (aiResponse && aiResponse.text) {
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: parsed, provider: aiResponse.provider });
        } catch (jsonErr) {
          console.warn('Failed to parse Weather AI JSON, falling back:', jsonErr);
        }
      }
    }

    // Fallback if AI fails or returns invalid JSON
    let summary = 'Optimal weather conditions observed.';
    let imbalanceRisk = 'No acute Dosha risk.';
    let aiAdvice = 'Practice normal daily routine (Dinacharya) including warm water and light yoga.';
    let suggestedMorningTask = 'Warm water sip and tongue scraping.';

    const temperature = parseFloat(temp || '25');
    if (temperature > 30) {
      summary = 'High temperature increases Pitta fire element, which can trigger acidity, inflammation, and irritability.';
      imbalanceRisk = 'Pitta (Fire & Water) Aggravation';
      aiAdvice = 'Sip room-temperature or coconut water. Avoid hot spices (chilli, garlic), dry snacks, and excessive sunlight exposure. Favor cool and sweet foods.';
      suggestedMorningTask = 'Practice 5 mins of Cooling Sheetali Pranayama.';
    } else if (temperature < 18) {
      summary = 'Chilly weather increases Vata dry/cold elements, causing dry skin, joint stiffness, and sluggish digestion.';
      imbalanceRisk = 'Vata (Air & Space) Aggravation';
      aiAdvice = 'Drink warm hot ginger-cinnamon tea, eat warm cooked oily soups (with ghee), and take warm baths. Keep warm and avoid cold drinks.';
      suggestedMorningTask = 'Sip warm lemon-ginger water and perform sesame oil pulling.';
    } else if ((humidity && parseFloat(humidity) > 75) || condition?.toLowerCase().includes('rain')) {
      summary = 'Damp, rainy weather elevates Kapha water/earth elements, leading to respiratory congestion and lethargy.';
      imbalanceRisk = 'Kapha (Earth & Water) Aggravation';
      aiAdvice = 'Favor light, dry, and warm foods. Drink warm water boiled with black pepper and ginger. Keep active to avoid stagnation.';
      suggestedMorningTask = 'Drink warm water with honey and do 10 Kapalbhati breath cycles.';
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        imbalanceRisk,
        aiAdvice,
        suggestedMorningTask
      },
      provider: 'PrakritiAI Fallback Engine'
    });

  } catch (error: any) {
    console.error('Weather AI recommendation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get recommendation' }, { status: 500 });
  }
}
