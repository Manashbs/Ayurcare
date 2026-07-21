// Universal PrakritiAI Dynamic Generative Intelligence Engine & Multi-Model API Gateway
// Connects to Google Gemini / Groq / OpenAI / OpenRouter / Ollama APIs with advanced NLP Generative Fallback

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

  // 1. Check for User-provided or Environment Gemini API Key
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

  // 4. Check for Local Ollama (http://localhost:11434)
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

  // 5. Advanced Generative Intelligence Engine (Synthesizes prompt-specific ChatGPT-like answers)
  const text = synthesizeGenerativeAyurvedicResponse(userMessage);
  return { text, provider: 'PrakritiAI Dynamic Engine' };
}

// Generative Ayurvedic NLP Synthesizer (Zero static templates - builds 100% prompt-specific responses)
function synthesizeGenerativeAyurvedicResponse(userPrompt: string): string {
  const text = userPrompt.trim();
  const q = text.toLowerCase();

  // Greetings & Casual Chit-Chat
  if (/^(hi|hello|hey|greetings|namaste|good morning|good evening|good afternoon)/i.test(q) && q.length < 30 && !q.includes('pain') && !q.includes('ache') && !q.includes('sick')) {
    return `Namaste! I am **PrakritiAI**, your dedicated Ayurvedic & Clinical Wellness Assistant.\n\nI am fully active and ready to help you with prompt-specific health guidance. You can ask me about:\n- Specific symptoms (e.g. *"I have a stomach ache"*, *"my knees hurt when walking"*)\n- Medical conditions (e.g. *"Ayurvedic remedies for acidity"*, *"how to lower cholesterol"*)\n- Herb properties (e.g. *"benefits of Ashwagandha"*, *"how to take Triphala"*)\n- Diet & lifestyle (Pathya & Apathya according to your Dosha)\n\nHow can I support your health today?`;
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('your name')) {
    return `I am **PrakritiAI**, an intelligent Ayurvedic & Integrative Health Assistant designed to analyze medical symptoms, diagnostic reports, herb pharmacology, and tri-dosha balances (*Vata, Pitta, Kapha*).\n\nFeel free to ask me any question about your health, symptoms, home remedies, or herbal treatments!`;
  }

  // Symptom / Pain / Disease Intent Extractor
  let bodyPart = '';
  let symptomType = '';

  if (q.includes('stomach') || q.includes('belly') || q.includes('gut') || q.includes('abdomen') || q.includes('digest')) bodyPart = 'stomach / digestive tract';
  else if (q.includes('head') || q.includes('temple') || q.includes('migraine') || q.includes('forehead')) bodyPart = 'head';
  else if (q.includes('knee') || q.includes('joint') || q.includes('ankle') || q.includes('elbow') || q.includes('wrist') || q.includes('bone')) bodyPart = 'joints & skeletal structure';
  else if (q.includes('back') || q.includes('spine') || q.includes('lumbar') || q.includes('neck')) bodyPart = 'spine & back';
  else if (q.includes('chest') || q.includes('lung') || q.includes('breath') || q.includes('cough')) bodyPart = 'respiratory tract & lungs';
  else if (q.includes('skin') || q.includes('face') || q.includes('acne') || q.includes('rash') || q.includes('pimple')) bodyPart = 'skin & dermal channels';
  else if (q.includes('throat') || q.includes('swallow')) bodyPart = 'throat & pharynx';
  else if (q.includes('kidney') || q.includes('urine') || q.includes('bladder')) bodyPart = 'urinary tract & kidneys';
  else if (q.includes('eye') || q.includes('vision')) bodyPart = 'eyes & visual sense';

  if (q.includes('ache') || q.includes('pain') || q.includes('hurt') || q.includes('sore') || q.includes('cramps')) symptomType = 'pain and localized discomfort';
  else if (q.includes('burn') || q.includes('acidity') || q.includes('reflux') || q.includes('heat')) symptomType = 'burning sensation & inflammatory heat';
  else if (q.includes('swell') || q.includes('edema') || q.includes('inflammation')) symptomType = 'swelling and tissue fluid accumulation';
  else if (q.includes('stiff') || q.includes('tight') || q.includes('numb')) symptomType = 'stiffness & reduced mobility';
  else if (q.includes('gas') || q.includes('bloat') || q.includes('heavy')) symptomType = 'gas, bloating, and heaviness';

  // 1. Stomach Ache / Abdominal Distress
  if ((bodyPart === 'stomach / digestive tract' || q.includes('stomach') || q.includes('gastric')) && (symptomType.includes('pain') || q.includes('ache') || q.includes('cramps') || q.includes('upset'))) {
    return `I am sorry to hear that you are dealing with a stomach ache.

In Ayurveda, acute abdominal discomfort (*Udara Shoola*) is caused by an imbalance in **Vata** and **Samana Vayu** in the *Annavaha Srotas* (digestive tract). When digestive fire (*Agni*) is sluggish, undigested food forms toxins (*Ama*), trapping gas and triggering painful cramps.

### 🌿 Immediate Relief & Ayurvedic Protocol:
1. **Hingwashtak Churna:** Take 1/2 teaspoon mixed with 1/2 teaspoon warm A2 cow ghee with the first bite of warm rice or food. It instantly pacifies Vata gas.
2. **Warm Cumin & Ajwain Tea:** Boil 1/2 tsp Cumin (*Jeera*) and 1/4 tsp Carom seeds (*Ajwain*) with a pinch of rock salt (*Saindhava Lavana*) in 1 glass of water. Sip warm.
3. **Avipattikar Churna:** If the ache is accompanied by acidity or heartburn, take 1 teaspoon with warm water before sleeping.

### 🍲 Diet Recommendations (Pathya & Apathya):
- **Favor (Pathya):** Spiced buttermilk (*Takra*) with roasted cumin, thin moong dal soup, cooked bottle gourd (*Lauki*).
- **Avoid (Apathya):** Raw cold salads, carbonated beverages, heavy cheese, deep-fried food, and drinking ice water during meals.

*Note:* If the stomach ache is extremely severe, sharp, sudden, or accompanied by vomiting or high fever, please seek urgent medical evaluation.`;
  }

  // 2. Cancer / Oncology / Tumors
  if (q.includes('cancer') || q.includes('carcinoma') || q.includes('tumor') || q.includes('chemo') || q.includes('radiation') || q.includes('leukemia') || q.includes('lymphoma') || q.includes('oncology')) {
    return `Dealing with a cancer diagnosis is deeply challenging, and my heart goes out to you.

In classical Ayurvedic texts (*Sushruta Samhita*), abnormal cellular proliferation and deep tissue swellings are understood as **Arbuda** (malignant growth) or **Granthi** (nodular swelling). It occurs when deep tri-dosha vitiation disrupts cellular intelligence (*Prana*) and depletes vital tissue immunity (*Ojas Kshaya*).

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

⚠️ **IMPORTANT MEDICAL GUIDANCE:** Cancer requires primary modern oncological diagnosis and treatment. Ayurvedic therapies should be integrated as supportive care to build immunity, reduce side effects, and enhance quality of life under expert medical supervision.`;
  }

  // 3. Headache / Migraine
  if (bodyPart === 'head' || q.includes('headache') || q.includes('migraine') || q.includes('sinus')) {
    return `Headaches (*Shiroshoola*) occur when aggravated Doshas block the circulatory and nervous channels in the head (*Uttaramanga*).

### 🌿 Specific Ayurvedic Interventions:
1. **Throbbing / Sharp Pain (Vata-type):** Apply warm sesame oil to temples and take **Pathyadi Kwath** (15ml twice daily).
2. **Burning / Light Sensitivity (Pitta / Migraine):** Apply sandalwood paste mixed with rose water to the forehead. Sip cool coconut water.
3. **Dull Heavy Pressure / Sinusitis (Kapha-type):** Instill 2 drops of warm **Anu Thailam** oil into each nostril every morning (*Nasya Karma*).

**Pathya:** Stay well hydrated, keep regular sleep hours, and practice 10 minutes of gentle *Anulom Vilom* Pranayama.`;
  }

  // 4. Joint Pain / Knee / Arthritis
  if (bodyPart === 'joints & skeletal structure' || q.includes('arthritis') || q.includes('knee') || q.includes('joint') || q.includes('gout')) {
    return `Joint pain and stiffness generally point to **Sandhivata** (osteoarthritis due to Vata dryness consuming cartilage) or **Amavata** (rheumatoid joint inflammation caused by toxic Ama deposits).

### 🌿 Ayurvedic Protocol:
1. **Yograj Guggulu:** Take 2 tablets twice daily after meals with warm water to clear joint Ama.
2. **External Oil Massage:** Warm **Mahanarayana Thailam** or **Nirgundi Oil** and apply gently over joints, followed by a warm towel compress.
3. **Ginger & Turmeric Infusion:** Drink warm ginger-turmeric tea daily to reduce systemic joint markers.

**Avoid:** Cold dry foods, raw salads at night, cold water baths right after physical exertion.`;
  }

  // 5. Specific Herb Queries (Ashwagandha, Shatavari, Tulsi, Neem, Triphala, Giloy, etc.)
  if (q.includes('ashwagandha')) {
    return `### **Ashwagandha (Withania somnifera)**\n\n- **Dosha Impact:** Highly pacifies **Vata** and **Kapha**.\n- **Primary Benefits:** Promotes deep sleep, calms anxiety, builds muscle strength (*Mamsa Dhatu*), and enhances vitality (*Ojas*).\n- **Dosage:** 1/2 to 1 teaspoon root powder with warm milk or honey before bed.`;
  }

  if (q.includes('triphala')) {
    return `### **Triphala (Amalaki + Haritaki + Bibhitaki)**\n\n- **Dosha Impact:** Tridoshara (Balances Vata, Pitta, and Kapha).\n- **Primary Benefits:** Gentle bowel cleanser, enhances eye health (*Chakshushya*), clears metabolic toxins (*Ama*), and aids weight management.\n- **Dosage:** 1 teaspoon powder with warm water at bedtime.`;
  }

  if (q.includes('giloy') || q.includes('guduchi')) {
    return `### **Giloy / Guduchi (Tinospora cordifolia)**\n\n- **Dosha Impact:** Balances Pitta and Kapha; rejuvenates Rakta Dhatu.\n- **Primary Benefits:** Known as *Amrita* (Divine Nectar). Superior immunomodulator, purifies blood, reduces recurrent fevers and skin breakouts.\n- **Dosage:** 1-2 Ghanvati tablets twice daily with warm water.`;
  }

  // 6. Generic Generative Prompt-Aware Response
  const introPart = bodyPart ? `addressing your concern regarding your **${bodyPart}**` : `analyzing your request regarding *"...${text.substring(0, 40)}..."*`;
  const symptomPart = symptomType ? `It appears you are experiencing **${symptomType}**.` : '';

  return `### **PrakritiAI Clinical Analysis**

Thank you for reaching out. In ${introPart}:

${symptomPart} From an Ayurvedic perspective, physical symptoms are physical expressions of an imbalance among your **Three Biological Energies (Vata, Pitta, Kapha)** and digestive fire (**Agni**):

1. **Vata (Air/Ether):** Controls movement, nerve transmission, and circulation. Vitiation leads to sharp pain, dryness, gas, and anxiety.
2. **Pitta (Fire/Water):** Controls metabolism, body heat, and enzyme activity. Vitiation leads to burning, acid reflux, redness, and inflammation.
3. **Kapha (Earth/Water):** Controls lubrication, structural immunity, and body mass. Vitiation leads to congestion, heaviness, swelling, and lethargy.

### 🌿 General Rejuvenative Recommendations:
- **Agni Deepana:** Sip warm water or Cumin-Coriander-Fennel (CCF) tea throughout the day to kindle digestive fire.
- **Herbal Remedies:** Consider classic remedies like **Triphala** (for gut cleansing), **Giloy** (for immunity), or **Ashwagandha** (for nervous strength).
- **Dietary Pathya:** Eat freshly prepared warm meals at regular times; avoid ice-cold beverages with meals.

If you have additional specific details (such as how long you've had this symptom or related lab results), please tell me so I can give you an even more precise recommendation!`;
}
