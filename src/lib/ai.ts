// AI Wellness service with mock fallback
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are PrakritiAI, a certified Ayurvedic Wellness Assistant. 
Your primary task is to provide general wellness guidance, diet recommendations (Pathya-Apathya), herbal remedies, and dosha balance guidelines based on traditional Ayurvedic principles.

CRITICAL INSTRUCTIONS:
1. You are NOT a doctor and cannot diagnose, cure, or treat any medical conditions.
2. Always append a clear disclaimer: "Disclaimer: This is for educational and wellness purposes only. It is not a medical diagnosis. Please consult a verified physician on AyurCare for any specific medical symptoms."
3. If the user asks about serious, acute, or emergency medical symptoms (e.g., chest pain, breathing difficulties, high fever, severe infections, sudden severe pain, poisoning), immediately stop giving remedies and instruct them to book a consultation with a verified physician on AyurCare or visit an emergency room.`;

const EMERGENCY_KEYWORDS = [
  'suicide', 'self harm', 'kill myself', 'die', 'chest pain', 'breathing difficulty', 
  'shortness of breath', 'severe bleeding', 'heart attack', 'poison', 'stroke', 
  'paralysis', 'unconscious', 'severe burn', 'heavy bleeding'
];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getAiResponse(messages: ChatMessage[]): Promise<{ text: string; flagged: boolean }> {
  const latestMessage = messages[messages.length - 1]?.content || '';
  const latestLower = latestMessage.toLowerCase();

  // 1. Triage: Check for emergency indicators
  const isEmergency = EMERGENCY_KEYWORDS.some(keyword => latestLower.includes(keyword));

  if (isEmergency) {
    return {
      text: '⚠️ EMERGENCY ALERT: You described symptoms that may require urgent medical attention (such as severe chest pain, breathing difficulty, or thoughts of self-harm). PrakritiAI cannot help with emergencies. Please dial your local emergency services (108 in India / 911 in US) immediately or visit the nearest hospital emergency department. Do not rely on AI or home remedies. If you wish to schedule a prompt consultation with our medical doctors, please visit the Doctor booking page.',
      flagged: true,
    };
  }

  // 2. Call OpenAI if API key is present and not mock
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'mock_openai_api_key') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.choices[0]?.message?.content || '';
        return { text, flagged: false };
      } else {
        console.error('OpenAI API returned an error:', await response.text());
      }
    } catch (e) {
      console.error('Failed to contact OpenAI API:', e);
    }
  }

  // 3. Fallback: Intelligent local Ayurvedic rule-based response engine
  let text = '';

  if (latestLower.includes('indigestion') || latestLower.includes('gas') || latestLower.includes('acidity') || latestLower.includes('digestion') || latestLower.includes('stomach')) {
    text = `For indigestion and digestive discomfort (known as Mandagni or weak digestive fire in Ayurveda), here is some wellness guidance:
- **Herbal Remedy**: Warm water with a pinch of Ginger powder and cumin seeds (Jeera) helps stimulate Agni.
- **Dietary Tip**: Sip warm water during meals. Avoid cold or carbonated beverages. Include spices like Fennel, Hing (asafetida), and Coriander in your food.
- **Lifestyle**: Take a short 100-step walk (Shatapadi) after lunch and dinner. Avoid sleeping immediately after meals.

*Prakriti Recommendation*: This condition is often associated with Vata or Kapha imbalance. Triphala Churna (1 tsp with warm water at bedtime) can help clean the bowel.`;
  } else if (latestLower.includes('sleep') || latestLower.includes('insomnia') || latestLower.includes('restless') || latestLower.includes('night')) {
    text = `For sleep difficulties (Anidra, typically caused by aggravated Vata and Rajas dosha):
- **Remedy**: Apply warm sesame oil or Brahmi oil to the soles of your feet (Pada-Abhyanga) before sleeping.
- **Diet**: A cup of warm milk with a pinch of Nutmeg (Jaiphal) and cardamom before bedtime acts as a natural relaxant.
- **Lifestyle**: Keep screens away 1 hour before sleeping. Practice deep abdominal breathing (Pranayama) for 10 minutes.

*Prakriti Recommendation*: Ashwagandha is highly recommended for calming Vata and nourishing the nervous system.`;
  } else if (latestLower.includes('stress') || latestLower.includes('anxiety') || latestLower.includes('worry') || latestLower.includes('depressed')) {
    text = `For managing stress and anxiety (Manovaha Srotas imbalance):
- **Remedy**: Brahmi tea or Shankhapushpi syrup supports cognitive strength and mental peace.
- **Diet**: Eat freshly cooked, warm foods. Avoid processed, dry, or excessively bitter items that increase Vata.
- **Lifestyle**: Practice Nadi Shodhana (Alternate Nostril Breathing) daily for 15 minutes. Consider daily meditation.

*Ayurvedic Concept*: High stress indicates Vata aggravation. Nourishing treatments (Snehana - oil massage) are excellent.`;
  } else if (latestLower.includes('skin') || latestLower.includes('acne') || latestLower.includes('pimple') || latestLower.includes('rash')) {
    text = `For skin issues and breakouts (indicative of Pitta aggravation and blood impurity - Rakta Dushi):
- **Remedy**: Neem tea or fresh Aloe Vera gel applied topically provides immediate cooling.
- **Diet**: Avoid oily, spicy, fried, and fermented foods. Increase sweet fruits, coconut water, and leafy greens.
- **Lifestyle**: Avoid direct midday sun exposure. Wash your face with lukewarm water.

*Prakriti Recommendation*: Herbs like turmeric (Haridra) and sandalwood (Chandana) help soothe Pitta breakouts.`;
  } else {
    text = `Greetings! I am PrakritiAI, your Ayurvedic Wellness Assistant. 
To help you achieve optimal balance, Ayurveda looks at your Vata, Pitta, and Kapha Doshas:
- **Vata** governs movement (remedy: warm, grounding foods, sesame oil).
- **Pitta** governs digestion and metabolism (remedy: cooling herbs like mint/coriander, sweet fruits).
- **Kapha** governs structure and lubrication (remedy: light, warm, spiced foods, regular active exercise).

Could you please describe your symptoms or wellness questions in more detail (e.g., digestion, sleep, stress, skin health)? I will provide customized Ayurvedic remedies, dietary Pathya-Apathya, and lifestyle tips.`;
  }

  // Add the disclaimer
  text += `\n\n***\nDisclaimer: This is for educational and wellness purposes only. It is not a medical diagnosis. Please consult a verified physician on AyurCare for any specific medical symptoms.`;

  return { text, flagged: false };
}
