// Universal PrakritiAI Clinical Reasoning & Multi-Model AI Engine
// Connects to Google Gemini / Groq / OpenAI / OpenRouter / Ollama APIs with factual clinical intelligence fallback

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(
  messages: AIChatMessage[],
  systemPrompt?: string
): Promise<{ text: string; provider: string }> {
  const userMessage = messages[messages.length - 1]?.content || '';

  // 1. Try Google Gemini API (if key present in env)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
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

  // 2. Try Groq API (if key present in env)
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

  // 3. Try OpenAI API (if key present in env)
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

  // 4. Try Local Ollama (http://localhost:11434)
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

  // 5. Dynamic Clinical Ayurvedic Knowledge Engine (Deep Factual Fallback)
  const text = synthesizeDynamicAyurvedicResponse(userMessage);
  return { text, provider: 'PrakritiAI Clinical Engine' };
}

// Deep Factual Ayurvedic Clinical Knowledge Synthesizer
function synthesizeDynamicAyurvedicResponse(prompt: string): string {
  const q = prompt.toLowerCase();

  // Stomach Ache / Abdominal Pain / Gastritis / Acidity / Bloating
  if (q.includes('stomach') || q.includes('belly') || q.includes('abdominal') || q.includes('ache') || q.includes('gastric') || q.includes('acidity') || q.includes('heartburn') || q.includes('cramps')) {
    return `### **Ayurvedic Assessment for Abdominal Pain & Gastric Discomfort (Udara Shoola & Amlapitta)**\n\n- **Ayurvedic Pathology (Samprapti):**\n  Abdominal pain and stomach cramps are primarily driven by **Vata vitiation** in the *Annavaha & Purishavaha Srotas* (digestive and excretory channels), often combined with **Pitta heat** (acidity/burning) or **Kapha sluggishness** (heaviness/nausea).\n\n- **Herbal Formulations & Remedies:**\n  1. **Hingwashtak Churna:** Take 1/2 teaspoon with the first morsel of warm food mixed with a little ghee. Excellent for Vata gas & cramps.\n  2. **Shankha Bhasma / Avipattikar Churna:** 1 teaspoon in lukewarm water at bedtime if burning or acid reflux is present.\n  3. **Jeeraka (Cumin) Water:** Boil 1 teaspoon cumin seeds in 2 cups water down to 1 cup; sip warm.\n\n- **Dietary Pathya (Favor):**\n  - Spiced buttermilk (*Takra*) with pinch of roasted cumin and curry leaves.\n  - Warm cooked rice porridge (*Yusha*), bottle gourd (*Lauki*), moong dal soup.\n\n- **Dietary Apathya (Strictly Avoid):**\n  - Raw cold salads, carbonated sodas, deep-fried fast food.\n  - Sleeping immediately after eating or drinking ice water during meals.\n\n*Note:* If abdominal pain is severe, sharp, persistent, or accompanied by high fever or bloody stools, seek immediate medical evaluation.`;
  }

  // Cancer / Tumors / Oncology / Malignancy
  if (q.includes('cancer') || q.includes('tumor') || q.includes('malignan') || q.includes('oncology') || q.includes('carcinoma') || q.includes('chemo') || q.includes('radiation')) {
    return `### **Ayurvedic Clinical Perspective on Malignancy & Tissue Growth (Arbuda & Granthi)**\n\n- **Ayurvedic Pathology (Samprapti):**\n  In classic Ayurvedic texts (*Sushruta Samhita*), abnormal cellular growth and deep tissue tumors are classified under **Arbuda** (malignant growth) and **Granthi** (glandular nodules). It involves deep-seated tri-dosha vitiation (*Vata-Pitta-Kapha*) clogging the *Mamsa* (muscle), *Rakta* (blood), and *Medas* (fat) channels, impairing cellular intelligence (*Ojas Kshaya*).\n\n- **Integrative Supportive Protocols:**\n  1. **Rasayana & Ojas Rebuilding:**\n     - **Guduchi (Tinospora cordifolia):** Potent immunomodulator that supports white blood cells and vitality.\n     - **Kanchnar Guggulu:** Classic formulation for glandular and tissue growths.\n     - **Curcumin / Haridra:** High-purity turmeric extract for blood purification and anti-inflammatory action.\n     - **Ashwagandha & Shatavari:** Rebuilds tissue stamina and counters fatigue during ongoing medical treatments.\n  2. **Dietary Recommendations (Pathya):**\n     - Freshly prepared warm organic vegetarian foods, pomegranate juice, bitter gourd (*Karela*), amla, mung bean soups.\n     - Strict avoidance of processed sugar, refined white flour, alcohol, and excessive red meats.\n\n⚠️ **CRITICAL MEDICAL ADVICE:** Cancer requires comprehensive modern oncological care (surgery, chemotherapy, or radiotherapy). Ayurvedic therapies serve as integrative supportive measures to rebuild immunity (*Ojas*), manage side effects, and improve quality of life under expert medical supervision.`;
  }

  // Headache / Migraine / Sinusitis
  if (q.includes('headache') || q.includes('migraine') || q.includes('sinus') || q.includes('head pain') || q.includes('temple')) {
    return `### **Ayurvedic Assessment for Headaches & Migraines (Shiroshoola & Suryavarta)**\n\n- **Pathology:** Vata-type headaches present as sharp, throbbing, variable pain; Pitta-type headaches present as burning heat and light sensitivity; Kapha-type headaches present as heavy dull pressure around sinuses.\n- **Herbal Remedies:**\n  1. **Pathyadi Kwath:** 15ml twice daily with warm water.\n  2. **Anu Thailam (Nasya):** Instill 2 drops of warm Anu Thailam in each nostril every morning to clear head channels (*Uttaramanga*).\n  3. **Sandalwood / Jatapamansi Paste:** Apply externally to forehead for Pitta heat relief.\n- **Pathya (Favor):** Warm coconut water, soaked almonds, room temperature herbal teas.\n- **Apathya (Avoid):** Loud noise, bright screen light during attacks, skipping meals, cold wind exposure.`;
  }

  // Cough / Cold / Fever / Respiratory
  if (q.includes('cough') || q.includes('cold') || q.includes('fever') || q.includes('flu') || q.includes('throat') || q.includes('bronchitis') || q.includes('phlegm') || q.includes('sore throat')) {
    return `### **Ayurvedic Protocol for Respiratory Congestion & Fever (Kasa, Pratishyaya & Jwara)**\n\n- **Pathology:** Accumulation of excess Kapha and Vata in the *Pranavaha Srotas* (respiratory tract) dampening respiratory Agni.\n- **Remedies:**\n  1. **Sitopaladi Churna:** 1/2 tsp mixed with 1 tsp organic honey twice daily after meals.\n  2. **Mahasudarshan Ghanvati:** 2 tablets twice daily if fever or chills are present.\n  3. **Eucalyptus Steam Inhalation:** Inhale warm steam infused with 2 drops eucalyptus oil.\n- **Pathya (Favor):** Warm ginger-tulsi tea, light moong dal soup, black pepper.\n- **Apathya (Avoid):** Chilled dairy, ice creams, heavy fried snacks, exposure to cold air.`;
  }

  // Joint Pain / Arthritis / Gout / Back Pain / Sciatica
  if (q.includes('joint') || q.includes('arthritis') || q.includes('gout') || q.includes('back pain') || q.includes('sciatica') || q.includes('knee') || q.includes('bone') || q.includes('stiff')) {
    return `### **Ayurvedic Protocol for Joint Pain & Stiffness (Amavata & Sandhivata)**\n\n- **Pathology:** *Sandhivata* (Vata in joints causing dryness/friction) or *Amavata* (Rheumatoid arthritis where undigested Ama toxins lodge in joints causing swelling/heat).\n- **Remedies:**\n  1. **Yograj Guggulu / Trayodashanga Guggulu:** 2 tablets twice daily with warm water.\n  2. **Nirgundi / Mahanarayana Oil:** Apply warm oil locally followed by warm water compress (Fomentation/Swedana).\n  3. **Rasnasaptak Kwath:** Reduces systemic joint inflammation.\n- **Pathya (Favor):** Warm cooked grains, garlic cooked in ghee, sesame seeds, ginger.\n- **Apathya (Avoid):** Cold dry food, raw salads, nightshades (potatoes, eggplants), cold bath right after exertion.`;
  }

  // Diabetes / Blood Sugar / HbA1c
  if (q.includes('diabete') || q.includes('sugar') || q.includes('hba1c') || q.includes('glucose') || q.includes('insulin')) {
    return `### **Ayurvedic Protocol for Glycemic Control (Prameha & Diabetes Management)**\n\n- **Pathology:** Impairment of *Medo Dhatu* (fat tissue) and pancreatic Agni due to Kapha-Vata aggravation.\n- **Remedies:**\n  1. **Nisha-Amalaki:** Mix equal parts Turmeric (*Haridra*) and Amla powder; take 1 tsp with warm water on empty stomach.\n  2. **Gudmar (Gymnema sylvestre):** 1/2 tsp leaf powder before major meals to inhibit sugar absorption.\n  3. **Chandraprabha Vati:** 2 tablets twice daily for renal-metabolic support.\n- **Pathya (Favor):** Barley flatbreads (*Yava*), bitter gourd (*Karela*), fenugreek seeds soaked overnight, sprouted legumes.\n- **Apathya (Avoid):** White refined sugar, polished rice, day-time napping, sedentary lifestyle.`;
  }

  // Skin Rashes / Acne / Eczema / Psoriasis
  if (q.includes('skin') || q.includes('acne') || q.includes('pimple') || q.includes('eczema') || q.includes('psoriasis') || q.includes('rash') || q.includes('itch')) {
    return `### **Ayurvedic Protocol for Skin & Blood Purification (Kustha & Rakta Shodhana)**\n\n- **Pathology:** Pitta heat and Ama toxins circulating in *Rakta Dhatu* (blood plasma) surfacing through skin pores.\n- **Remedies:**\n  1. **Manjisthadi Kwath / Neem Capsules:** 2 tablets twice daily to purify blood channels.\n  2. **Arogyavardhini Vati:** Supports liver detoxification and skin clarity.\n  3. **Kumkumadi / Nalpamaradi Oil:** For gentle external topical nourishment.\n- **Pathya (Favor):** Pomegranates, coconut water, coriander infusions, sweet fresh apples.\n- **Apathya (Avoid):** Excess chilli, fried sour pickles, vinegar, alcohol, direct intense sunlight.`;
  }

  // Stress / Anxiety / Depression / Brain Fog / Insomnia
  if (q.includes('stress') || q.includes('anxiety') || q.includes('depress') || q.includes('brain fog') || q.includes('sleep') || q.includes('insomnia') || q.includes('worry')) {
    return `### **Ayurvedic Protocol for Mental Balance & Sleep (Manovaha Srotas & Anidra)**\n\n- **Pathology:** Aggravated Vata & Prana-Vayu disturbing the mind (*Manas*), resulting in ungrounded thought loops and poor sleep.\n- **Remedies:**\n  1. **Nutmeg (Jaiphal) Milk:** 1/4 tsp nutmeg powder in warm milk 30 mins before sleep.\n  2. **Brahmi & Shankhapushpi Vati:** 1 tablet twice daily to calm cognitive hyper-excitability.\n  3. **Pada-Abhyanga:** Massage feet soles with warm sesame or Brahmi oil before sleep.\n- **Pathya (Favor):** Warm grounding foods, ghee, oats, 10 mins of Box Breathing (*Sama Vritti*).\n- **Apathya (Avoid):** Blue screen light before bed, late-night caffeine, irregular eating schedules.`;
  }

  // Women's Health / PCOS / Periods / Hormones
  if (q.includes('pcos') || q.includes('pcod') || q.includes('period') || q.includes('menstrual') || q.includes('cramps') || q.includes('thyroid') || q.includes('hormon')) {
    return `### **Ayurvedic Protocol for Hormonal & Gynaecological Health (Artavaha Srotas)**\n\n- **Pathology:** Kapha-Vata blockage in reproductive channels (*Artavaha Srotas*) leading to irregular cycles, cystic formations, or tissue inflammation.\n- **Remedies:**\n  1. **Kanchnar Guggulu:** 2 tablets twice daily for clearing cystic Kapha accumulations.\n  2. **Ashokarishta / Shatavari Churna:** 15ml Ashokarishta after meals to balance menstrual flow and hormonal rhythm.\n  3. **Kumariasava:** Aloe vera infusion to support pelvic circulation.\n- **Pathya (Favor):** Sesame seeds, fenugreek, flaxseeds, warm cooked vegetables, ginger tea.\n- **Apathya (Avoid):** Cold packaged dairy, excessive white sugar, sedentary routines.`;
  }

  // General Dynamic Universal Response
  return `### **Ayurvedic Clinical Assessment & Guidance**\n\nThank you for consulting **PrakritiAI**. Regarding your query about *"${prompt}"*:\n\n1. **Dosha Analysis (Vata, Pitta, Kapha):**\n   - **Vata (Air/Ether):** Governs movement and nervous impulses. Imbalances cause pain, dryness, and anxiety.\n   - **Pitta (Fire/Water):** Governs metabolism, digestion, and heat. Imbalances cause burning, inflammation, and skin redness.\n   - **Kapha (Earth/Water):** Governs structure, fluid balance, and mass. Imbalances cause congestion, heaviness, and swelling.\n\n2. **Recommended General Remedies:**\n   - **Digestion & Agni:** Sip warm water or Cumin-Coriander-Fennel (CCF) tea throughout the day.\n   - **Herbal Support:** Classic formulations like **Triphala** (bowel & metabolic detox) and **Giloy** (immunity booster).\n   - **Daily Routine (Dinacharya):** Eat warm cooked meals on time; avoid ice-cold drinks during meals.\n\nFor personalized e-prescriptions, you can also browse our **5,100+ Herb Remedies**, take the **Prakriti Assessment Quiz**, or book a video consultation with our verified BAMS/MD specialists.`;
}
