'use client';

import React, { useState } from 'react';
import { Search, Home, AlertCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface Remedy {
  symptom: string;
  name: string;
  desc: string;
  ingredients: string[];
  preparation: string[];
  usage: string;
  warning: string;
}

const REMEDIES: Remedy[] = [
  {
    symptom: 'Cold & Sore Throat',
    name: 'Ginger Tulsi Honey Decoction',
    desc: 'A warm, stimulating brew designed to burn away mucus (Kapha) and relieve raw irritation in the throat.',
    ingredients: [
      '1 inch fresh Ginger root (sliced)',
      '5-6 fresh Tulsi leaves',
      '3-4 black peppercorns (crushed)',
      '1.5 cups Water',
      '1 tsp Raw Honey',
    ],
    preparation: [
      'Add ginger, tulsi, and peppercorns to water and bring to a boil in a small pot.',
      'Reduce heat and simmer until the water is reduced to about 1 cup (approx. 8 minutes).',
      'Strain the brew into a cup and let it cool until warm.',
      'Stir in the honey and sip slowly.',
    ],
    usage: 'Drink 2-3 times daily. Best taken warm, especially in the morning or before sleeping.',
    warning: 'Do not boil honey directly or add to boiling hot liquid; in Ayurveda, heated honey generates internal toxins.',
  },
  {
    symptom: 'Acidity & Heartburn',
    name: 'Cooling Fennel Coriander Infusion',
    desc: 'An instantly cooling, sweet herbal infusion to calm burning Pitta energy in the stomach.',
    ingredients: [
      '1 tsp Fennel seeds',
      '1/2 tsp Coriander seeds (crushed)',
      '1.5 cups Water',
      '1/2 tsp rock candy (mishri) (optional)',
    ],
    preparation: [
      'Boil the water in a kettle or small pot.',
      'Place fennel and coriander seeds in a cup, and pour the boiling water over them.',
      'Cover the cup with a saucer and let it steep for 10-15 minutes.',
      'Strain the seeds, stir in mishri if desired, and let it cool to room temperature.',
    ],
    usage: 'Sip slowly when experiencing active burning sensations, or drink 30 minutes after spicy meals.',
    warning: 'Ensure the tea is not hot when consumed, as hot liquids further aggravate hyperacidity.',
  },
  {
    symptom: 'Bloating & Gas',
    name: 'Buttermilk Digestive Elixir (Takra)',
    desc: 'Ayurveda refers to spiced buttermilk as "heavenly nectar on earth" for weak digestion. Dispels Vata gas and rebuilds gut flora.',
    ingredients: [
      '1/4 cup plain organic Yogurt',
      '3/4 cup Water (room temperature)',
      '1 pinch roasted Cumin powder (Bhuna Jeera)',
      '1 pinch rock salt (Saindhav Namak)',
      '1 small pinch Hing (asafoetida) (roasted in tiny bit of ghee)',
    ],
    preparation: [
      'Place yogurt and water in a blender or use a hand whisk to blend until completely smooth and frothy.',
      'Skim off any thick fat foam that rises to the top (making it light and easy to digest).',
      'Whisk in the rock salt, roasted cumin powder, and roasted hing.',
    ],
    usage: 'Drink with or immediately after lunch. Avoid taking it at night.',
    warning: 'Do not use sour or expired yogurt. Always use room-temperature water; never consume ice-cold.',
  },
  {
    symptom: 'Insomnia & Anxiety',
    name: 'Spiced Nutmeg Bedtime Milk',
    desc: 'Nutmeg acts as a safe, natural sedative in Ayurvedic therapeutics, grounding active Vata thoughts.',
    ingredients: [
      '1 cup Milk (whole organic or almond milk)',
      '1/8 tsp grated Nutmeg powder (don\'t exceed)',
      '1/4 tsp Cardamom powder',
      '4-5 Almonds (soaked and peeled) (optional)',
    ],
    preparation: [
      'Boil the milk in a saucepan with nutmeg and cardamom.',
      'Simmer gently on low for 3-5 minutes.',
      'If using almonds, blend them with the warm milk before drinking.',
    ],
    usage: 'Drink warm 30-45 minutes before going to bed.',
    warning: 'Do not exceed 1/8 tsp of nutmeg, as higher doses can cause drowsiness or mild sluggishness the next morning.',
  },
  {
    symptom: 'Headache & Stress',
    name: 'Peppermint Coriander Steam & Compress',
    desc: 'Relieves vascular congestion and tension headaches caused by stress or sinus blockages.',
    ingredients: [
      '3-4 drops Peppermint oil (or fresh mint leaves)',
      '1 tsp Coriander seeds',
      '4 cups boiling Water',
    ],
    preparation: [
      'Add coriander seeds to boiling water and let simmer for 2 minutes.',
      'Turn off heat, add peppermint oil/mint leaves, and transfer water to a wide heatproof bowl.',
      'Drape a towel over your head and inhale steam for 5 minutes, keeping eyes closed.',
      'Alternatively, soak a cloth in the cooled herbal infusion and apply as compress on forehead.',
    ],
    usage: 'Use whenever experiencing tension headaches or sinus pressure.',
    warning: 'Keep face at a safe distance from hot water to prevent steam burns.',
  },
];

export default function HomeRemedies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRemedy, setActiveHerb] = useState<Remedy | null>(null);

  const filteredRemedies = REMEDIES.filter((r) =>
    r.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="home-remedies-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-550 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Home className="w-6 h-6 text-gold-100" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Home Remedies (Ghar ke Nuskhe)</h1>
            <p className="text-primary-100 text-sm mt-1">Simple, safe, and effective kitchen remedies for mild everyday symptoms. Harness the power of kitchen spices.</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-950/60 border border-amber-900 text-amber-300 p-4 rounded-xl text-xs flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-250 font-bold mb-0.5">Vetting Disclaimer:</strong>
          These home remedies are for educational purposes and mild symptoms only. If you suffer from high fever, severe acute pain, chronic conditions, or if symptoms persist beyond 48 hours, please immediately book a consultation with our certified doctors.
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search remedies by symptom or ingredient (e.g. cold, acidity, ginger, bloating)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
          />
        </div>
      </div>

      {/* Remedies List */}
      {filteredRemedies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <strong className="block text-slate-800 font-bold">No Remedies Found</strong>
          <span className="text-xs">Try searching for other symptoms like cold, gas, or insomnia.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRemedies.map((remedy) => (
            <div
              key={remedy.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary-50 text-primary-750 uppercase tracking-wide">
                    {remedy.symptom}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-800">{remedy.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-4">{remedy.desc}</p>
              </div>

              <button
                onClick={() => setActiveHerb(remedy)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white text-xs font-bold rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
              >
                View Recipe & Preparation <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Remedy modal */}
      {activeRemedy && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative animate-slideUp">
            
            <button
              onClick={() => setActiveHerb(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">Ghar ka Nuskha (Home Medicine)</span>
              <h2 className="font-display font-extrabold text-xl text-slate-800 mt-1">{activeRemedy.name}</h2>
              <span className="text-xs text-slate-400 font-medium mt-0.5 block">Target Symptom: <strong className="text-primary-700 font-bold">{activeRemedy.symptom}</strong></span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-primary-50/15 border-l-4 border-primary-500 p-4 rounded-r-xl">
              {activeRemedy.desc}
            </p>

            {/* Ingredients */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Kitchen Ingredients</h4>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                {activeRemedy.ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>

            {/* Preparation */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Preparation Steps</h4>
              <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                {activeRemedy.preparation.map((step, idx) => (
                  <li key={idx} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>

            {/* Usage */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs space-y-3">
              <div>
                <strong className="text-slate-800 block font-bold mb-0.5 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Usage Guidelines:
                </strong>
                <p className="text-slate-600">{activeRemedy.usage}</p>
              </div>
              <div className="border-t pt-2 border-slate-200">
                <strong className="text-rose-750 block font-bold mb-0.5">Precautionary Warning:</strong>
                <p className="text-slate-600">{activeRemedy.warning}</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 mr-1 text-primary-600 flex-shrink-0" />
              <span>For severe symptoms, schedule a consultation with an Ayurvedic physician.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
