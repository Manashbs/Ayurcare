// Universal PrakritiAI Live AI Engine & Multi-Model API Gateway
// Connects to Google Gemini API (using provided server key) with seamless fallback models

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(
  messages: AIChatMessage[],
  systemPrompt?: string,
  userApiKey?: string
): Promise<{ text: string; provider: string }> {
  const userMessage = messages[messages.length - 1]?.content || '';

  // 1. Live Google Gemini API with valid models (gemini-3.1-flash-lite, gemini-flash-lite-latest, gemini-flash-latest)
  const geminiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (geminiKey && geminiKey.length > 5 && !geminiKey.includes('mock')) {
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-flash-latest',
      'gemma-4-31b-it',
      'gemini-2.0-flash'
    ];

    const promptText = systemPrompt
      ? `${systemPrompt}\n\nUser Question: ${userMessage}`
      : userMessage;

    for (const model of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
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
            return { text: output, provider: `Google Gemini (${model})` };
          }
        }
      } catch (e) {
        console.warn(`Gemini API call failed for model ${model}:`, e);
      }
    }
  }

  // 2. Groq API
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.length > 5 && !groqKey.includes('mock')) {
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

  // 3. OpenAI API
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.length > 5 && !openaiKey.includes('mock')) {
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

  // 4. Fallback Generative Synthesizer
  const text = synthesizeGenerativeAyurvedicResponse(userMessage);
  return { text, provider: 'PrakritiAI Clinical Engine' };
}

function synthesizeGenerativeAyurvedicResponse(userPrompt: string): string {
  const text = userPrompt.trim();
  const q = text.toLowerCase();

  if (/^(hi|hello|hey|greetings|namaste)/i.test(q) && q.length < 30) {
    return `Namaste! I am **PrakritiAI**, your dedicated Ayurvedic & Clinical AI Assistant.\n\nHow can I help you today with health advice, remedies, or symptom analysis?`;
  }

  if (q.includes('stomach') || q.includes('belly') || q.includes('abdominal') || q.includes('gastric') || q.includes('gut') || q.includes('cramps')) {
    return `Hello! I am sorry to hear that you are experiencing a stomach ache.\n\nIn Ayurveda, acute stomach pain (*Udara Shoola*) is typically caused by aggravated **Vata** and **Samana Vayu** in the digestive tract (*Annavaha Srotas*). Weak digestive fire (*Manda Agni*) allows food to ferment into toxins (*Ama*), trapping gas and causing painful muscle spasms.\n\n### 🌿 Immediate Ayurvedic Remedies:\n1. **Hingwashtak Churna:** Take 1/2 tsp mixed with warm ghee with the first bite of warm food.\n2. **Warm Cumin & Ajwain Tea:** Sip warm water boiled with 1/2 tsp cumin (*Jeera*) and 1/4 tsp carom seeds (*Ajwain*).\n3. **Avipattikar Churna:** Take 1 tsp with warm water before bed if accompanied by acidity.\n\n### 🍲 Diet Guidelines (Pathya):\n- Sip warm spiced buttermilk (*Takra*).\n- Avoid cold raw foods, iced drinks, and deep fried items.`;
  }

  return `Hello! Regarding your query about *"${text}"*:\n\nPhysical symptoms reflect an imbalance among your **Three Biological Energies (Vata, Pitta, Kapha)**:\n1. **Vata:** Controls movement & nerve impulses.\n2. **Pitta:** Controls metabolism & body heat.\n3. **Kapha:** Controls lubrication & mass.\n\nRebalance digestive fire (*Agni*) with warm Cumin-Coriander-Fennel tea and light freshly cooked meals.`;
}
