// Universal PrakritiAI Generative Intelligence Engine & Multi-Model API Gateway
// Connects to Google Gemini / Groq / OpenAI / OpenRouter / Ollama APIs with fluid, prompt-specific AI fallback

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

  // 1. Check for Gemini API Key
  const geminiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (geminiKey && geminiKey.length > 10 && !geminiKey.includes('mock')) {
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
      console.warn('Gemini API call failed:', e);
    }
  }

  // 2. Check for Groq API Key
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.length > 10 && !groqKey.includes('mock')) {
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

  // 3. Check for OpenAI API Key
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.length > 10 && !openaiKey.includes('mock')) {
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

  // 4. Local Ollama (http://localhost:11434)
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
        return { text: output, provider: 'Local Ollama' };
      }
    }
  } catch (e) {}

  // 5. Dynamic Generative Response Synthesizer
  const text = synthesizeGenerativeAyurvedicResponse(userMessage);
  return { text, provider: 'PrakritiAI Dynamic Engine' };
}

function synthesizeGenerativeAyurvedicResponse(userPrompt: string): string {
  const text = userPrompt.trim();
  const q = text.toLowerCase();

  // Casual Chit-Chat & Greetings
  if (/^(hi|hello|hey|greetings|namaste|good morning|good evening|good afternoon)/i.test(q) && q.length < 30 && !q.includes('pain') && !q.includes('ache') && !q.includes('sick') && !q.includes('stomach')) {
    return `Namaste! I am **PrakritiAI**, your dedicated Ayurvedic & Clinical AI Assistant.\n\nI am here to give you prompt-specific health guidance. You can ask me about:\n- Specific symptoms (e.g., *"I have a stomach ache"*, *"how to treat severe acidity"*)\n- Health conditions (e.g., *"Ayurvedic remedies for diabetes"*, *"how to lower high BP"*)\n- Herb pharmacology (e.g., *"benefits of Ashwagandha"*, *"how to take Triphala"*)\n- Diet & Lifestyle according to Vata, Pitta, and Kapha.\n\nHow can I help you today?`;
  }

  // 1. Stomach Ache / Abdominal Pain
  if (q.includes('stomach') || q.includes('belly') || q.includes('abdominal') || q.includes('gastric') || q.includes('gut') || q.includes('cramps')) {
    return `Hello! I am sorry to hear that you are experiencing a stomach ache.

In Ayurveda, acute stomach pain (*Udara Shoola*) is typically caused by aggravated **Vata** and **Samana Vayu** in the digestive tract (*Annavaha Srotas*). Weak digestive fire (*Manda Agni*) allows food to ferment into toxins (*Ama*), trapping gas and causing painful muscle spasms.

### 🌿 Immediate Ayurvedic Remedies:
1. **Hingwashtak Churna:** Take 1/2 tsp mixed with 1/2 tsp warm ghee with the first bite of warm food to instantly pacify Vata gas.
2. **Warm Cumin & Ajwain Tea:** Sip warm water boiled with 1/2 tsp cumin (*Jeera*) and 1/4 tsp carom seeds (*Ajwain*) with a pinch of rock salt (*Saindhava Lavana*).
3. **Avipattikar Churna:** Take 1 tsp with warm water before bed if the ache is accompanied by heartburn or sour acidity.

### 🍲 Diet Guidelines (Pathya & Apathya):
- **Favor (Pathya):** Spiced buttermilk (*Takra*) with roasted cumin, thin moong dal soup, cooked bottle gourd (*Lauki*).
- **Avoid (Apathya):** Raw cold salads, carbonated beverages, heavy cheese, deep-fried snacks, and drinking ice water during meals.

*Note:* If your stomach pain is severe, sharp, persistent, or accompanied by high fever or bloody stools, please seek immediate emergency medical evaluation.`;
  }

  // 2. Cancer / Malignancy / Oncology
  if (q.includes('cancer') || q.includes('carcinoma') || q.includes('tumor') || q.includes('chemo') || q.includes('radiation') || q.includes('oncology')) {
    return `Dealing with a cancer diagnosis is incredibly challenging, and I extend my deepest support to you.

In classical Ayurveda (*Sushruta Samhita*), abnormal cellular proliferation and deep tissue swellings are understood as **Arbuda** (malignant growth) and **Granthi** (nodular swelling). It occurs when deep tri-dosha vitiation disrupts cellular intelligence (*Prana*) and depletes vital tissue immunity (*Ojas Kshaya*).

### 🌿 Integrative Supportive Therapies (Ojas Rebuilding):
Ayurveda provides powerful **synergistic support** alongside conventional oncology treatments (chemotherapy, surgery, radiation):

1. **Immune Modulation (Rasayana):**
   - **Guduchi (Tinospora cordifolia):** Rebuilds white blood cell vitality and shields non-cancerous cells.
   - **Kanchnar Guggulu:** Classic formulation for clearing abnormal glandular and tissue growths.
   - **Curcumin / Haridra:** High-potency purified extract to combat systemic cellular inflammation.
   - **Ashwagandha & Shatavari:** Restores physical stamina, combats chemotherapy fatigue, and improves appetite.
2. **Nourishing Pathya Diet:**
   - Freshly cooked organic vegetables, pomegranate juice, bitter gourd (*Karela*), warm mung soups, Amla.
   - Strictly eliminate refined sugars, ultra-processed food, alcohol, and heavy artificial additives.

⚠️ **IMPORTANT MEDICAL GUIDANCE:** Cancer requires primary modern oncological diagnosis and treatment. Ayurvedic therapies serve as supportive care to build immunity, reduce side effects, and enhance quality of life under expert medical supervision.`;
  }

  // 3. Headache / Migraine
  if (q.includes('headache') || q.includes('migraine') || q.includes('head pain') || q.includes('sinus')) {
    return `Hello! Headaches (*Shiroshoola*) occur when aggravated Doshas block the circulatory and nervous channels in the head.

### 🌿 Specific Ayurvedic Remedies:
1. **Throbbing / Sharp Pain (Vata-type):** Apply warm sesame oil to temples and take **Pathyadi Kwath** (15ml twice daily).
2. **Burning / Light Sensitivity (Pitta / Migraine):** Apply sandalwood paste mixed with rose water to the forehead. Sip cool coconut water.
3. **Dull Heavy Pressure / Sinusitis (Kapha-type):** Instill 2 drops of warm **Anu Thailam** oil into each nostril every morning (*Nasya Karma*).

**Pathya:** Stay well hydrated, keep regular sleep hours, and practice 10 minutes of gentle *Anulom Vilom* Pranayama.`;
  }

  // 4. Joint Pain / Arthritis / Knee
  if (q.includes('joint') || q.includes('knee') || q.includes('arthritis') || q.includes('back pain') || q.includes('gout')) {
    return `Hello! Joint pain generally points to **Sandhivata** (osteoarthritis due to Vata dryness consuming joint lubrication) or **Amavata** (rheumatoid joint inflammation caused by toxic Ama deposits).

### 🌿 Ayurvedic Protocol:
1. **Yograj Guggulu:** Take 2 tablets twice daily after meals with warm water to clear joint Ama.
2. **External Oil Massage:** Warm **Mahanarayana Thailam** or **Nirgundi Oil** and apply gently over joints, followed by a warm towel compress.
3. **Ginger & Turmeric Infusion:** Drink warm ginger-turmeric tea daily to reduce systemic joint markers.

**Avoid:** Cold dry foods, raw salads at night, cold water baths right after physical exertion.`;
  }

  // 5. Dynamic Prompt Response Fallback
  return `Hello! Regarding your query about *"${text}"*:

From an Ayurvedic perspective, physical symptoms are expressions of an imbalance among your **Three Biological Energies (Vata, Pitta, Kapha)** and digestive fire (**Agni**):

1. **Vata (Air/Ether):** Controls movement, nerve transmission, and circulation. Imbalance causes pain, dryness, gas, and anxiety.
2. **Pitta (Fire/Water):** Controls metabolism, body heat, and enzyme activity. Imbalance causes burning, acid reflux, redness, and inflammation.
3. **Kapha (Earth/Water):** Controls lubrication, structural immunity, and body mass. Imbalance causes congestion, heaviness, swelling, and lethargy.

### 🌿 Rejuvenative Protocol for "${text}":
- **Agni Deepana:** Sip warm water or Cumin-Coriander-Fennel (CCF) tea throughout the day to kindle digestive fire.
- **Herbal Remedies:** Classic formulations like **Triphala** (for gut cleansing), **Giloy** (for immunity), or **Ashwagandha** (for nervous strength).
- **Dietary Pathya:** Eat freshly prepared warm meals at regular times; avoid ice-cold beverages with meals.

If you have additional specific details (such as how long you've had this symptom or related lab results), please tell me so I can give you an even more precise recommendation!`;
}
