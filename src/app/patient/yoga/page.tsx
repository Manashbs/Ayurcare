'use client';

import React, { useState } from 'react';
import { Search, Flame, ShieldAlert, CheckCircle, ArrowRight, Eye, Info, HelpCircle, X } from 'lucide-react';
import { YOGA_DB, Asana } from '@/lib/yoga-data';

export default function YogaGuide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [selectedDosha, setSelectedDosha] = useState<'All' | 'Vata' | 'Pitta' | 'Kapha'>('All');
  const [activeAsana, setActiveAsana] = useState<Asana | null>(null);

  // Pagination states to make browsing 100+ poses smooth
  const [visibleCount, setVisibleCount] = useState(15);

  const filteredAsanas = YOGA_DB.filter((asana) => {
    const matchesSearch =
      asana.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asana.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asana.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asana.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === 'All' || asana.level === selectedDifficulty;

    const matchesDosha =
      selectedDosha === 'All' || asana.balancing.includes(selectedDosha);

    return matchesSearch && matchesDifficulty && matchesDosha;
  });

  const displayedAsanas = filteredAsanas.slice(0, visibleCount);

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="yoga-guide-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-550 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Flame className="w-6 h-6 text-gold-100" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Ayurvedic Yoga & Asana Guide</h1>
            <p className="text-primary-100 text-sm mt-1">
              Explore our database of **{YOGA_DB.length}+ therapeutic yoga postures** paired with Sanskrit names, difficulty tiers, and biological energy targets.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search 100+ yoga poses by English/Sanskrit name or type (e.g. alignment, twist, restorative)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(15); // reset pagination
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          {/* Difficulty Tiers */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-655 text-slate-600">
            <span className="text-slate-400">Difficulty:</span>
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedDifficulty(lvl);
                  setVisibleCount(15);
                }}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  selectedDifficulty === lvl ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Dosha Filter */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-655 text-slate-600">
            <span className="text-slate-400">Dosha Target:</span>
            {(['All', 'Vata', 'Pitta', 'Kapha'] as const).map((dosha) => (
              <button
                key={dosha}
                onClick={() => {
                  setSelectedDosha(dosha);
                  setVisibleCount(15);
                }}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  selectedDosha === dosha ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {dosha === 'All' ? 'All' : `${dosha} Balancer`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* active filters status */}
      <div className="text-xs text-slate-500 font-bold flex justify-between items-center px-1">
        <span>Found {filteredAsanas.length} matching yoga postures</span>
        <span className="text-[10px] text-slate-400 italic">Showing {Math.min(visibleCount, filteredAsanas.length)} of {filteredAsanas.length}</span>
      </div>

      {/* Asana Grid */}
      {displayedAsanas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <strong className="block text-slate-800 text-base font-bold">No Postures Match</strong>
          <span className="text-sm">Try broadening your search term or changing the difficulty / dosha filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {displayedAsanas.map((asana) => (
            <div
              key={asana.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800 line-clamp-1">{asana.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 italic line-clamp-1">{asana.sanskrit}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {asana.balancing.map((d) => (
                      <span
                        key={d}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                          d === 'Vata' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                          d === 'Pitta' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}
                      >
                        {d[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-505 text-slate-500 mb-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{asana.level}</span>
                  <span>•</span>
                  <span className="text-primary-700">{asana.type}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">
                  {asana.desc}
                </p>
              </div>

              <button
                onClick={() => setActiveAsana(asana)}
                className="w-full py-2 bg-slate-50 border border-slate-150 hover:bg-primary-600 hover:text-white hover:border-transparent text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" /> View Posture Steps
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredAsanas.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 15)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Load More Postures
          </button>
        </div>
      )}

      {/* Asana Detail Modal */}
      {activeAsana && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative animate-slideUp">
            
            <button
              onClick={() => setActiveAsana(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] text-primary-655 text-primary-600 font-bold uppercase tracking-wider block">Yogic Asana Therapy</span>
              <h2 className="font-display font-extrabold text-xl text-slate-800 mt-1">{activeAsana.name}</h2>
              <span className="text-xs text-slate-400 font-medium mt-0.5 block">{activeAsana.sanskrit}</span>
            </div>

            <div className="flex space-x-3 text-[10px] font-bold text-slate-500 border-y py-2 border-slate-100">
              <span className="bg-slate-100 px-2.5 py-0.5 rounded">{activeAsana.level}</span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded text-primary-750">{activeAsana.type}</span>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-855 text-slate-800 uppercase tracking-wider">How to Practice (Step-by-Step)</h4>
              <ol className="list-decimal pl-4 text-xs text-slate-655 text-slate-605 text-slate-600 space-y-2 leading-relaxed">
                {activeAsana.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>

            {/* Breathing pattern */}
            <div className="p-4 bg-primary-50/20 border-l-4 border-primary-500 rounded-r-xl text-xs space-y-1">
              <strong className="text-primary-750 block font-bold">Breathing Coordination:</strong>
              <p className="text-slate-600">{activeAsana.breathing}</p>
            </div>

            {/* Health Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Anatomical & Mental Benefits</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeAsana.benefits.map((b) => (
                  <li key={b} className="flex items-start">
                    <span className="text-emerald-500 mr-2 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-center p-2 bg-slate-50 rounded-lg">
              <HelpCircle className="w-4 h-4 mr-1 text-primary-650 text-primary-600 flex-shrink-0" />
              <span>Ayurvedic Tip: Practice on an empty stomach. Focus on internal sensations rather than flexibility.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
