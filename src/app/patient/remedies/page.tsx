'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, AlertCircle, Heart, ArrowRight, X, MessageSquare, Sparkles, ShieldAlert, Pill, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Herb {
  name: string;
  hindiName: string;
  scientificName: string;
  sanskritName: string;
  desc: string;
  rasa: string;
  virya: string;
  vipaka: string;
  balances: ('Vata' | 'Pitta' | 'Kapha')[];
  benefits: string[];
  diseases: string[];
  consumption: string;
  precautions: string;
  color: string;
  category: string;
  formulations: string[];
}

const HERB_CATEGORIES = [
  'All',
  'Adaptogen',
  'Brain & Nerve',
  'Digestive',
  'Respiratory',
  'Skin & Blood',
  'Immunity',
  'Women\'s Health',
  'Men\'s Health',
  'Heart & Circulation',
  'Bone & Joint',
  'Liver & Detox',
  'Anti-Inflammatory',
] as const;

export default function HerbRemedies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDoshaFilter, setSelectedDoshaFilter] = useState<'All' | 'Vata' | 'Pitta' | 'Kapha'>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  
  // Pagination & Loading States
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeHerb, setActiveHerb] = useState<Herb | null>(null);

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch herbs when search, filters, or page changes
  useEffect(() => {
    const fetchHerbs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '15',
          query: debouncedSearch,
          dosha: selectedDoshaFilter,
          category: selectedCategoryFilter
        });
        
        const res = await fetch(`/api/patient/remedies?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setHerbs(data.herbs || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error('Error fetching herbs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHerbs();
  }, [currentPage, debouncedSearch, selectedDoshaFilter, selectedCategoryFilter]);

  // Reset page when filters change
  const handleFilterChange = (dosha: 'All' | 'Vata' | 'Pitta' | 'Kapha') => {
    setSelectedDoshaFilter(dosha);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategoryFilter(category);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans" id="herb-directory-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-600 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500 rounded-full opacity-20 filter blur-2xl"></div>
        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <BookOpen className="w-7 h-7 text-gold-100 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-250 font-bold uppercase tracking-widest block mb-0.5 font-mono">Pharmacopoeia</span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Herb Remedies Directory</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Explore the rich natural pharmacy of Ayurveda. Access clinical database of <strong className="text-white">5,000+</strong> herbs with Hindi terminology, therapeutic actions, and precautions.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search herb, Hindi terminology, benefit, disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 text-sm placeholder-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Dosha Filter Tabs */}
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/50 p-1.5 rounded-xl w-full lg:w-auto overflow-x-auto">
            {(['All', 'Vata', 'Pitta', 'Kapha'] as const).map((dosha) => (
              <button
                key={dosha}
                onClick={() => handleFilterChange(dosha)}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  selectedDoshaFilter === dosha
                    ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {dosha === 'All' ? 'All Doshas' : `${dosha} Balancer`}
              </button>
            ))}
          </div>
        </div>

        {/* Category horizontal scrolling selector */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Filter by Therapeutic Action</label>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {HERB_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? 'All Remedies' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Status Info */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <span>Found <strong className="text-slate-700 font-bold">{totalCount}</strong> matching herbs</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Herbs Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-xs text-slate-405 text-slate-500 font-medium">Loading catalog results...</span>
        </div>
      ) : herbs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 shadow-sm">
          <AlertCircle className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-800 font-bold text-lg">No Herbs Match Your Criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            We couldn't find any remedies matching your current keyword, dosha filter, or therapeutic category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {herbs.map((herb) => (
              <div
                key={herb.name + herb.scientificName}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {herb.category}
                      </span>
                      <h3 className="font-display font-extrabold text-xl text-slate-800 mt-2">{herb.name}</h3>
                      {herb.hindiName && (
                        <span className="text-xs text-slate-550 block mt-0.5 text-slate-500">
                          Hindi: <strong className="text-slate-700 font-semibold">{herb.hindiName.split(' (')[0]}</strong>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5 italic">{herb.scientificName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {herb.balances.map((d) => (
                        <span
                          key={d}
                          title={`Balances ${d}`}
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
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

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 mt-2">
                    {herb.desc}
                  </p>

                  {/* Target diseases badges */}
                  <div className="space-y-1 mb-6">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Indications:</span>
                    <div className="flex flex-wrap gap-1">
                      {herb.diseases.slice(0, 3).map((d) => (
                        <span key={d} className="bg-slate-100 text-slate-650 text-[10px] px-2.5 py-0.5 rounded-md font-medium">
                          {d}
                        </span>
                      ))}
                      {herb.diseases.length > 3 && (
                        <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-0.5 rounded-md font-medium">
                          +{herb.diseases.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveHerb(herb)}
                  className="w-full py-2.5 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-750 hover:border-emerald-200 text-xs font-bold text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
                >
                  View Full Benefits <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Simple Premium Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1 text-sm font-semibold">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-800">{currentPage}</span>
                <span className="text-slate-400">/</span>
                <span className="px-3 py-1 text-slate-650 text-slate-550">{totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
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

            {/* Header section with Sanskrit / Hindi names */}
            <div>
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block">Ayurvedic Materia Medica</span>
              <h2 className="font-display font-extrabold text-2xl text-slate-800 mt-1">{activeHerb.name}</h2>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <p>Scientific: <span className="italic font-medium">{activeHerb.scientificName}</span></p>
                {activeHerb.hindiName && (
                  <p>Hindi: <span className="font-semibold text-slate-850">{activeHerb.hindiName}</span></p>
                )}
                <p>Sanskrit: <span className="text-emerald-700 font-semibold">{activeHerb.sanskritName}</span></p>
              </div>
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

            {/* Description */}
            <p className="text-xs text-slate-650 leading-relaxed bg-emerald-50/20 border-l-4 border-emerald-500 p-4 rounded-r-xl font-medium">
              {activeHerb.desc}
            </p>

            {/* Detailed list split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b pb-1.5 mb-2 flex items-center">
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Key Health Benefits
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeHerb.benefits.map((b) => (
                    <li key={b} className="flex items-start">
                      <span className="text-emerald-600 mr-2 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b pb-1.5 mb-2 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Cures / Helps In
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeHerb.diseases.map((d) => (
                      <span key={d} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {activeHerb.formulations && activeHerb.formulations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b pb-1.5 mb-2 flex items-center">
                      <Pill className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Classical Formulations
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeHerb.formulations.map((f) => (
                        <span key={f} className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preparation/Dosage and Precautions */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-4 text-xs">
              <div>
                <strong className="text-slate-800 block font-bold mb-1">How to Consume:</strong>
                <p className="text-slate-600">{activeHerb.consumption}</p>
              </div>
              <div className="border-t pt-3 border-slate-200">
                <strong className="text-rose-700 block font-bold mb-1 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" /> Safety & Contraindications:
                </strong>
                <p className="text-slate-600">{activeHerb.precautions}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400 font-semibold">Source: Ayurvedic Pharmacopoeia of India</span>
              <Link
                href={`/patient/ai-chat?prompt=Tell me more about the benefits, consumption guidelines, and safety precautions of ${activeHerb.name}.`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center shadow-md cursor-pointer"
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
