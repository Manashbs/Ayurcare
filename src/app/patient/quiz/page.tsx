'use client';

import React, { useState } from 'react';
import { Loader2, Heart, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; details: string }[];
}

export default function PrakritiQuiz() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const questions: QuizQuestion[] = [
    {
      id: 'bodyFrame',
      question: 'How would you describe your physical body frame and bone structure?',
      options: [
        { value: 'vata', label: 'Light & Slender', details: 'Thin bones, tall or short height, prominent joints, finds it hard to gain weight.' },
        { value: 'pitta', label: 'Medium & Proportionate', details: 'Moderate build, athletic, easy to build muscles, gains/loses weight easily.' },
        { value: 'kapha', label: 'Large & Sturdy', details: 'Broad shoulders, thick bones, gains weight easily and finds it hard to lose.' }
      ]
    },
    {
      id: 'skinType',
      question: 'What best describes the natural texture of your skin?',
      options: [
        { value: 'vata', label: 'Dry & Cool', details: 'Thin skin, prone to roughness, cracks, and cold extremities. Sensitive to dry weather.' },
        { value: 'pitta', label: 'Warm & Sensitive', details: 'Soft, pinkish/reddish tone, prone to acne, freckles, sun damage, and excessive sweat.' },
        { value: 'kapha', label: 'Thick & Oily', details: 'Soft, smooth, cool, pale, stays youthful longer with minimal wrinkles.' }
      ]
    },
    {
      id: 'appetite',
      question: 'What is your typical pattern of hunger and appetite?',
      options: [
        { value: 'vata', label: 'Variable & Irregular', details: 'Some days very hungry, other days easily skips meals. Prone to gas/bloating.' },
        { value: 'pitta', label: 'Strong & Sharp', details: 'Must eat on time. Becomes irritable or weak if meals are delayed. Good metabolism.' },
        { value: 'kapha', label: 'Slow but Steady', details: 'Can skip meals easily without discomfort, but digestion is slow. Prone to heaviness.' }
      ]
    },
    {
      id: 'sleepPattern',
      question: 'How is your typical sleep quality and duration?',
      options: [
        { value: 'vata', label: 'Light & Disturbed', details: 'Sleeps 5-7 hours. Wakes up easily by small sounds. Mind remains active with dreams.' },
        { value: 'pitta', label: 'Moderate & Dreamy', details: 'Sleeps 6-8 hours. Prone to vivid, colorful, or intense dreams. Can wake up warm.' },
        { value: 'kapha', label: 'Deep & Prolonged', details: 'Sleeps 8-10 hours easily. Heavy sleeper, hard to wake up. Feels groggy in mornings.' }
      ]
    },
    {
      id: 'temperament',
      question: 'How do you typically react to stressful situations?',
      options: [
        { value: 'vata', label: 'Anxious & Fearful', details: 'Prone to worry, nervousness, quick reactions, and overthinking.' },
        { value: 'pitta', label: 'Aggressive & Competitive', details: 'Prone to frustration, anger, impatience, and works hard to resolve issues.' },
        { value: 'kapha', label: 'Calm & Patient', details: 'Stays stable, serene, avoids conflict, slow to react, but highly compassionate.' }
      ]
    },
    {
      id: 'voice',
      question: 'What is the tone and speed of your speech/voice?',
      options: [
        { value: 'vata', label: 'Fast & High-pitched', details: 'Speaks rapidly, jumps between topics, voice can get hoarse easily.' },
        { value: 'pitta', label: 'Sharp & Convincing', details: 'Clear articulation, logical, authoritative tone, moderate speed.' },
        { value: 'kapha', label: 'Slow & Melodious', details: 'Gentle, soft, slow speech, deep or resonant tone.' }
      ]
    }
  ];

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value });
  };

  const handleNext = () => {
    if (!answers[questions[currentStep].id]) {
      setErrorMsg('Please select an option to proceed');
      return;
    }
    setErrorMsg('');
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculate = async () => {
    if (!answers[questions[currentStep].id]) {
      setErrorMsg('Please select an option to proceed');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/patient/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        refreshUser();
      } else {
        setErrorMsg(data.error || 'Failed to submit quiz results.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-slate-800 font-sans">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-display text-3xl font-extrabold text-slate-800">Your Prakriti Profile</h2>
          <span className="text-sm font-bold text-primary-700 uppercase tracking-widest mt-2 block">Calculated dominance</span>

          <div className="my-8">
            <span className="bg-primary-50 text-primary-800 font-display font-black text-4xl px-6 py-3.5 rounded-2xl shadow border border-primary-100 block max-w-sm mx-auto tracking-wide">
              {result.doshaType}
            </span>
          </div>

          {/* Scores details */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-100 py-6 my-6 text-sm">
            <div>
              <span className="text-slate-500 font-bold block">Vata Score</span>
              <span className="text-lg font-extrabold text-slate-850">{result.scores?.vata} / {questions.length}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">Pitta Score</span>
              <span className="text-lg font-extrabold text-slate-850">{result.scores?.pitta} / {questions.length}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">Kapha Score</span>
              <span className="text-lg font-extrabold text-slate-850">{result.scores?.kapha} / {questions.length}</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            Your dosha values have been synced to your medical profile. When you book a telemedicine appointment, consulting doctors will refer to this Prakriti baseline for herbal dosages and Pathya-Apathya.
          </p>

          <button
            onClick={() => router.push('/patient/dashboard')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm shadow cursor-pointer transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-slate-800 font-sans" id="prakriti-quiz-container">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-850">Prakriti (Dosha) Quiz</h1>
        <p className="text-slate-500 text-sm mt-1">Answer the questions based on your lifelong general tendencies, not temporary states.</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{progressPercent}% Mapped</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-3.5 rounded-lg text-xs font-bold flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-lg text-slate-800 leading-snug">
          {currentStep + 1}. {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-4 cursor-pointer ${
                  isSelected 
                    ? 'bg-primary-50/50 border-primary-600 shadow-sm' 
                    : 'border-slate-150 hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-primary-600' : 'border-slate-350'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}
                </div>
                <div>
                  <strong className={`block text-sm ${isSelected ? 'text-primary-800' : 'text-slate-850'}`}>
                    {opt.label}
                  </strong>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">{opt.details}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-4 py-2 border rounded-lg text-sm font-bold transition ${
            currentStep === 0 
              ? 'border-slate-150 text-slate-300 cursor-not-allowed' 
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Previous Question
        </button>

        {currentStep < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm shadow cursor-pointer transition flex items-center"
          >
            Next Question <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm shadow cursor-pointer transition flex items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Calculate Prakriti
          </button>
        )}
      </div>
    </div>
  );
}
