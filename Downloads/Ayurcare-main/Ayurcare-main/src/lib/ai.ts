import { generateAIResponse, AIChatMessage } from './ai-provider';

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

  // 2. Delegate to Unified AI Provider (Gemini / Groq / OpenAI / Ollama / Deep Clinical Engine)
  const aiMessages: AIChatMessage[] = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const aiResult = await generateAIResponse(aiMessages, SYSTEM_PROMPT);
  
  let finalText = aiResult.text;
  if (!finalText.includes('Disclaimer')) {
    finalText += `\n\n***\nDisclaimer: This is for educational and wellness purposes only. It is not a medical diagnosis. Please consult a verified physician on AyurCare for any specific medical symptoms.`;
  }

  return { text: finalText, flagged: false };
}
