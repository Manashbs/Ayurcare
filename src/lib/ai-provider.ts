// Unified PrakritiAI & Medical Analysis Engine
// Connects to Google Gemini / Groq / OpenAI / OpenRouter / Ollama APIs with fallback to Deep Ayurvedic Clinical Engine

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(
  messages: AIChatMessage[],
  systemPrompt?: string
): Promise<{ text: string; provider: string }> {
  const userMessage = messages[messages.length - 1]?.content || '';

  // 1. Check for Google Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (geminiKey && geminiKey !== 'mock_key') {
    try {
      const promptText = systemPrompt
        ? `${systemPrompt}\n\nUser Question: ${userMessage}`
        : userMessage;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const output = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          return { text: output, provider: 'Google Gemini 1.5 Flash' };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, trying next provider:', e);
    }
  }

  // 2. Check for Groq API Key
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey !== 'mock_key') {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages,
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const output = json.choices?.[0]?.message?.content;
        if (output) {
          return { text: output, provider: 'Groq (Llama-3.3-70B)' };
        }
      }
    } catch (e) {
      console.warn('Groq API call failed:', e);
    }
  }

  // 3. Check for OpenAI API Key (only if valid, non-mock key)
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.includes('mock')) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages,
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const output = json.choices?.[0]?.message?.content;
        if (output) {
          return { text: output, provider: 'OpenAI GPT-4o' };
        }
      }
    } catch (e) {
      console.warn('OpenAI API call failed:', e);
    }
  }

  // 4. Check for Local Ollama AI Server (http://localhost:11434)
  try {
    const ollamaRes = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages,
        ],
        stream: false,
      }),
    });

    if (ollamaRes.ok) {
      const json = await ollamaRes.json();
      const output = json.message?.content;
      if (output) {
        return { text: output, provider: 'Local Ollama (Llama-3)' };
      }
    }
  } catch (e) {
    // Ollama not running locally
  }

  // 5. Deep PrakritiAI Pharmacological & Clinical Reasoning Engine (Factual Fallback)
  const text = synthesizeAyurvedicResponse(userMessage);
  return { text, provider: 'PrakritiAI Knowledge Engine' };
}

// Factual Knowledge Synthesizer for Ayurvedic Consultations
function synthesizeAyurvedicResponse(prompt: string): string {
  const query = prompt.toLowerCase();

  if (query.includes('ashwagandha')) {
    return `### **Ashwagandha (Withania somnifera)**\n\n- **Sanskrit Name:** अश्वगंधा (Smell of Horse - signifying strength & vitality)\n- **Primary Dosha Action:** Highly balances **Vata** and **Kapha**; may slightly elevate Pitta in large doses due to warming potency (*Ushna Virya*).\n- **Primary Benefits:**\n  1. **Rasayana (Adaptogen):** Enhances stamina, combats chronic fatigue, and rebuilds depleted tissues (*Dhatu Kshaya*).\n  2. **Nervine & Sleep:** Calms hyperactive Vata mind, reducing insomnia (*Anidra*) and anxiety (*Chinta*).\n  3. **Reproductive Health:** Rebuilds *Sukra Dhatu* (vital reproductive fluids).\n- **Recommended Dosage:** 3–6 grams of root powder (*Churna*) or 1–2 tablets daily with warm milk, ghee, or water after meals.`;
  }

  if (query.includes('tulsi') || query.includes('holy basil')) {
    return `### **Tulsi (Ocimum sanctum / Holy Basil)**\n\n- **Sanskrit Name:** तुलसी (The Incomparable One)\n- **Primary Dosha Action:** Pacifies **Kapha** and **Vata**; increases Pitta in excess.\n- **Primary Benefits:**\n  1. **Pranavaha Srotas (Respiratory Health):** Clears bronchial phlegm, relieves cough, rhinitis (*Pratishyaya*), and fever (*Jwara*).\n  2. **Immunity Booster (Ojas Enhancer):** Contains natural anti-microbial bio-compounds.\n  3. **Stress Relief:** Enhances mental clarity and emotional resilience.\n- **Recommended Consumption:** Fresh leaf decoction (*Kashayam*) or 5–10 drops of pure Tulsi extract in warm water every morning.`;
  }

  if (query.includes('turmeric') || query.includes('haldi') || query.includes('curcumin')) {
    return `### **Haridra / Turmeric (Curcuma longa)**\n\n- **Primary Dosha Action:** Pacifies all three Doshas (**Tridoshara** - Vata, Pitta, Kapha).\n- **Primary Benefits:**\n  1. **Rakta Shodhaka (Blood Purifier):** Clears blood toxins (*Ama*) and reduces systemic inflammation.\n  2. **Prameha (Metabolic Health):** Combined with Amla as *Nisha-Amalaki*, it regulates blood sugar and HbA1c levels.\n  3. **Kustha & Skin:** Heals skin breakouts, eczema, and hyperpigmentation.\n- **Dosage:** 1/2 tsp of turmeric powder with 1/4 tsp black pepper in warm golden milk or warm water daily.`;
  }

  if (query.includes('indigestion') || query.includes('gas') || query.includes('bloating') || query.includes('acidity')) {
    return `### **Ayurvedic Protocol for Digestive Issues & Gas (Agni Deepana & Ama Pachana)**\n\n1. **Primary Etiology:** Weak digestive fire (*Manda Agni*) leads to undigested toxic residue (*Ama*) causing bloating and acidity (*Amlapitta*).\n2. **Effective Herbal Remedies:**\n   - **Hingwashtak Churna:** Take 1/2 tsp with the first bite of warm rice & ghee for gas.\n   - **Avipattikar Churna:** Take 1 tsp at bedtime with lukewarm water for hyperacidity.\n   - **Triphala Churna:** Clears bowel sluggishness and detoxifies micro-channels.\n3. **Dietary Pathya (Favor):** Spiced buttermilk (*Takra*) with roasted cumin & curry leaves, warm ginger tea, cooked moong dal.\n4. **Apathya (Avoid):** Ice water, raw salads at night, fried packaged snacks, sleeping within 2 hours of dinner.`;
  }

  if (query.includes('sleep') || query.includes('insomnia') || query.includes('stress')) {
    return `### **Ayurvedic Protocol for Sleep & Stress (Anidra & Manovaha Srotas)**\n\n1. **Primary Etiology:** Aggravated Vata & Sadhaka Pitta disturbing the nervous channels (*Majja Dhatu*).\n2. **Therapeutic Remedies:**\n   - **Nutmeg (Jaiphal) Milk:** Drink warm milk with 1/4 tsp nutmeg powder and pinch of cardamom 30 mins before sleep.\n   - **Brahmi & Shankhapushpi:** 1 tablet twice daily to calm nervous overthinking.\n   - **Abhyanga:** Self-massage feet soles (*Padabhyanga*) with warm sesame oil before bed.\n3. **Lifestyle Adjustments:** Avoid bright screens 1 hour before sleep; practice 5 minutes of *Sama Vritti* Box Breathing.`;
  }

  return `### **Ayurvedic Wellness & Clinical Consultation**\n\nThank you for reaching out to **PrakritiAI**. Based on your query regarding *"${prompt}"*:\n\n1. **Biological Energy Balance (Dosha Principles):**\n   - **Vata:** Controls movement, nervous impulses, and circulation. Balanced by warm, moist, grounding routines.\n   - **Pitta:** Controls metabolism, body heat, and digestion (*Agni*). Balanced by cooling, bitter, and sweet foods.\n   - **Kapha:** Controls lubrication, structural immunity, and tissue mass. Balanced by warm, pungent, light, and active routines.\n\n2. **Recommended General Pathya (Daily Routine):**\n   - Sip warm water or Cumin-Coriander-Fennel (CCF) tea throughout the day.\n   - Eat freshly cooked meals at regular intervals; avoid cold processed foods.\n   - Practice daily morning Pranayama (breathing exercises) and gentle posture stretches.\n\nFor specific diagnostic triaging, you can also browse our **5,100+ Herb Remedies**, take the **Prakriti Assessment Quiz**, or schedule a video session with our verified BAMS/MD specialists.`;
}
