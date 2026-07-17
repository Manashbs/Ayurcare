'use client';

import React, { useState } from 'react';
import { Search, BookOpen, AlertCircle, Heart, ArrowRight, X, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Herb {
  name: string;
  scientificName: string;
  sanskritName: string;
  desc: string;
  rasa: string; // Taste
  virya: string; // Potency
  vipaka: string; // Post-digestive effect
  balances: ('Vata' | 'Pitta' | 'Kapha')[];
  benefits: string[];
  diseases: string[];
  consumption: string;
  precautions: string;
  color: string;
}

const HERBS: Herb[] = [
  {
    name: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    sanskritName: 'अश्वगंधा (Strength of a Horse)',
    desc: 'One of the most vital adaptogenic herbs in Ayurveda. Known for combating stress, building physical endurance, and promoting restful sleep.',
    rasa: 'Bitter, Sweet, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Reduces stress and cortisol levels',
      'Enhances muscle strength and recovery',
      'Supports cognitive focus and memory',
      'Improves sleep quality and immune response',
    ],
    diseases: ['Insomnia', 'Chronic Stress', 'Anxiety', 'Fatigue', 'General Debility'],
    consumption: 'Take 1/2 teaspoon (3g) of Ashwagandha powder (Churna) with warm milk or honey before bed.',
    precautions: 'Avoid during active congestion or high toxic accumulation (Ama). Not recommended during pregnancy.',
    color: 'from-amber-600 to-amber-700',
  },
  {
    name: 'Tulsi (Holy Basil)',
    scientificName: 'Ocimum sanctum',
    sanskritName: 'तुलसी (The Incomparable One)',
    desc: 'Considered a sacred purifier and elixir of life. Excellent for clearing respiratory pathways and elevating mood.',
    rasa: 'Pungent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Relieves cough, cold, and respiratory issues',
      'Acts as a powerful antioxidant and antimicrobial',
      'Reduces physical and psychological stress',
      'Promotes healthy heart function',
    ],
    diseases: ['Asthma', 'Bronchitis', 'Fever', 'Sore Throat', 'Mild Indigestion'],
    consumption: 'Boil 5-10 fresh leaves or 1/2 tsp dried leaves in water to make a herbal tea. Drink twice daily.',
    precautions: 'Use with caution if suffering from high Pitta heat (acidity, burning sensations). Can thin blood slightly.',
    color: 'from-emerald-600 to-emerald-750',
  },
  {
    name: 'Turmeric (Haridra)',
    scientificName: 'Curcuma longa',
    sanskritName: 'हरिद्रा (Yellow Skin)',
    desc: 'The golden spice of wellness. Famous for its anti-inflammatory, blood-purifying, and skin-brightening properties.',
    rasa: 'Bitter, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata', 'Pitta'], // Balances all in moderation, can increase Pitta in excess
    benefits: [
      'Relieves joint pain and systemic inflammation',
      'Supports healthy liver and metabolic function',
      'Promotes glowing skin and wound healing',
      'Purifies blood and lymph systems',
    ],
    diseases: ['Arthritis', 'Skin Allergies', 'Indigestion', 'Sore Throat', 'Liver Congestion'],
    consumption: 'Stir 1/2 tsp powder in warm milk with a pinch of black pepper (Golden Milk) or brew as tea.',
    precautions: 'Avoid in extremely high doses if suffering from gallstones or active bile duct obstructions.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    name: 'Triphala',
    scientificName: 'Three Fruits (Amalaki, Bibhitaki, Haritaki)',
    sanskritName: 'त्रिफला (Three Fruits)',
    desc: 'Ayurverda\'s ultimate digestive cleanser. A compound formulation that gently purifies the GI tract and rejuvenates tissues.',
    rasa: 'Sweet, Sour, Pungent, Bitter, Astringent',
    virya: 'Neutral (Sama)',
    vipaka: 'Sweet/Pungent',
    balances: ['Vata', 'Pitta', 'Kapha'], // Tri-dosha balancing
    benefits: [
      'Regulates bowel movements and digestion',
      'Detoxifies the entire gastrointestinal tract',
      'Supports ocular health (eye strength)',
      'Acts as an internal antioxidant rejuvenator',
    ],
    diseases: ['Constipation', 'Bloating', 'Indigestion', 'Slow Metabolism', 'Low Immunity'],
    consumption: 'Mix 1/2 to 1 teaspoon in warm water. Let sit for 5 minutes and drink on an empty stomach at bedtime.',
    precautions: 'Do not use if suffering from severe diarrhea, acute dysentery, or dehydration.',
    color: 'from-amber-700 to-stone-700',
  },
  {
    name: 'Shatavari',
    scientificName: 'Asparagus racemosus',
    sanskritName: 'शतावरी (One Who Possesses 100 Husbands)',
    desc: 'The ultimate female tonic and hormonal rejuvenator. Known for its cooling energy, nutritive properties, and building stamina.',
    rasa: 'Sweet, Bitter',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Pitta', 'Vata'],
    benefits: [
      'Balances female reproductive hormones',
      'Soothes hyperacidity and stomach lining',
      'Increases vitality, stamina, and energy',
      'Supports lactation in nursing mothers',
    ],
    diseases: ['Acidity', 'Stomach Ulcers', 'Hormonal Imbalance', 'PMS', 'General Weakness'],
    consumption: 'Take 1/2 teaspoon with warm water, milk, or ghee twice daily after meals.',
    precautions: 'Use with caution if suffering from high Kapha fluid retention or heavy chest congestion (Ama).',
    color: 'from-rose-500 to-rose-600',
  },
  {
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    sanskritName: 'नीम (The Cure-All)',
    desc: 'One of the most potent detoxifiers and cooling agents in Ayurveda. Renowned for clarifying skin and purifying blood.',
    rasa: 'Bitter, Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Clears skin infections and acne',
      'Purifies toxic blood and liver stagnation',
      'Promotes excellent dental and gum health',
      'Regulates blood glucose levels',
    ],
    diseases: ['Acne', 'Eczema', 'Psoriasis', 'Liver Congestion', 'Gum Bleeding'],
    consumption: 'Take 1/4 to 1/2 tsp of Neem leaf powder with warm water once daily, or apply topically as paste.',
    precautions: 'Highly cooling and drying; can aggravate Vata in excess. Limit continuous intake to 4-6 weeks.',
    color: 'from-teal-600 to-teal-700',
  },
  {
    name: 'Brahmi',
    scientificName: 'Bacopa monnieri',
    sanskritName: 'ब्राह्मी (Cosmic Consciousness)',
    desc: 'The premier brain tonic of Ayurveda. Renowned for enhancing memory, focus, and inducing meditative calmness.',
    rasa: 'Bitter, Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'], // Tri-dosha balancer, especially pacifies Pitta and Vata mind
    benefits: [
      'Improves memory recall and processing speed',
      'Reduces anxiety and calms central nervous system',
      'Promotes deep sleep and mental clarity',
      'Helps alleviate stress and mental fatigue',
    ],
    diseases: ['Mental Fatigue', 'Memory Weakness', 'ADHD', 'Anxiety', 'Insomnia'],
    consumption: 'Mix 1/2 tsp in warm water or warm milk in the morning. Can also be taken as Brahmi Ghee.',
    precautions: 'May slow heart rate slightly in high doses. Consult physician if taking thyroid medications.',
    color: 'from-blue-600 to-blue-700',
  },
];

export default function HerbRemedies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoshaFilter, setSelectedDoshaFilter] = useState<'All' | 'Vata' | 'Pitta' | 'Kapha'>('All');
  const [activeHerb, setActiveHerb] = useState<Herb | null>(null);

  // Filter logic
  const filteredHerbs = HERBS.filter((herb) => {
    const matchesSearch =
      herb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      herb.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      herb.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      herb.diseases.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      herb.benefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDosha =
      selectedDoshaFilter === 'All' || herb.balances.includes(selectedDoshaFilter);

    return matchesSearch && matchesDosha;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="herb-directory-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500 rounded-full opacity-30 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <BookOpen className="w-6 h-6 text-gold-100" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Ayurvedic Herb Directory</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Explore natural Ayurvedic pharmacopoeia. Find health benefits, usage directions, and Dosha-balancing matches.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-grow max-w-lg">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by herb, benefit, or ailment (e.g. anxiety, skin, digestion)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
          />
        </div>

        {/* Dosha Filter Tabs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 p-1 rounded-xl">
          {(['All', 'Vata', 'Pitta', 'Kapha'] as const).map((dosha) => (
            <button
              key={dosha}
              onClick={() => setSelectedDoshaFilter(dosha)}
              className="px-4 py-2 rounded-lg cursor-pointer transition"
            >
              {dosha === 'All' ? 'Show All' : `${dosha} Balancer`}
            </button>
          ))}
        </div>
      </div>

      {/* Herbs Grid */}
      {filteredHerbs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <strong className="block text-slate-800 text-base font-bold">No Herbs Found</strong>
          <span className="text-sm">Try broadening your search term or altering your Dosha filter.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHerbs.map((herb) => (
            <div
              key={herb.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-800">{herb.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 italic">{herb.scientificName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {herb.balances.map((d) => (
                      <span
                        key={d}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          d === 'Vata' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          d === 'Pitta' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {d[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-650 text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {herb.desc}
                </p>

                {/* Target diseases badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {herb.diseases.slice(0, 3).map((d) => (
                    <span key={d} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {d}
                    </span>
                  ))}
                  {herb.diseases.length > 3 && (
                    <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      +{herb.diseases.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveHerb(herb)}
                className="w-full py-2.5 border border-slate-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 text-xs font-bold text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer"
              >
                View Full Benefits <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Herb Detail Modal */}
      {activeHerb && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative animate-slideUp">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveHerb(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header section with Sanskrit name */}
            <div>
              <span className="text-[10px] text-primary-650 font-bold uppercase tracking-wider block">Ayurvedic Materia Medica</span>
              <h2 className="font-display font-extrabold text-2xl text-slate-800 mt-1">{activeHerb.name}</h2>
              <span className="text-xs text-slate-400 font-medium italic block mt-0.5">
                Scientific: {activeHerb.scientificName} | Sanskrit: <strong className="text-primary-700 font-bold">{activeHerb.sanskritName}</strong>
              </span>
            </div>

            {/* Energy profile */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Rasa (Taste)</span>
                <strong className="text-slate-800 font-bold">{activeHerb.rasa}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Virya (Potency)</span>
                <strong className="text-slate-800 font-bold">{activeHerb.virya}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Vipaka (Post-Digestive)</span>
                <strong className="text-slate-800 font-bold">{activeHerb.vipaka}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-primary-50/20 border-l-4 border-primary-500 p-4 rounded-r-xl">
              {activeHerb.desc}
            </p>

            {/* Detailed list split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b pb-1 mb-2 flex items-center">
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Key Health Benefits
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-650 text-slate-600">
                  {activeHerb.benefits.map((b) => (
                    <li key={b} className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b pb-1 mb-2">
                  Targeted Ailments
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeHerb.diseases.map((d) => (
                    <span key={d} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation/Dosage and Precautions */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-4 text-xs">
              <div>
                <strong className="text-slate-800 block font-bold mb-1">How to Consume:</strong>
                <p className="text-slate-600">{activeHerb.consumption}</p>
              </div>
              <div className="border-t pt-3 border-slate-200">
                <strong className="text-rose-700 block font-bold mb-1">Safety & Contraindications:</strong>
                <p className="text-slate-600">{activeHerb.precautions}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-450 text-slate-400 font-semibold">Source: Ayurvedic Pharmacopoeia of India</span>
              <Link
                href={`/patient/ai-chat?prompt=Tell me more about the benefits, consumption guidelines, and safety precautions of ${activeHerb.name}.`}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition flex items-center shadow-md cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Ask PrakritiAI Bot about this
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
