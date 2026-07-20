'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, AlertCircle, Heart, ArrowRight, X, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Herb {
  id: string;
  name: string;
  scientificName: string;
  sanskritName: string;
  desc: string;
  imageUrl?: string;
  rasa: string;
  virya: string;
  vipaka: string;
  balances: ('Vata' | 'Pitta' | 'Kapha')[];
  benefits: string[];
  diseases: string[];
  consumption: string;
  precautions: string;
  color: string;
}

import { useSearchParams } from 'next/navigation';

export default function HerbRemedies() {
  const searchParams = useSearchParams();
  const urlDosha = searchParams.get('dosha');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoshaFilter, setSelectedDoshaFilter] = useState<'All' | 'Vata' | 'Pitta' | 'Kapha'>(
    (urlDosha as any) || 'All'
  );
  const [activeHerb, setActiveHerb] = useState<Herb | null>(null);

  useEffect(() => {
    if (urlDosha && ['Vata', 'Pitta', 'Kapha'].includes(urlDosha)) {
      setSelectedDoshaFilter(urlDosha as any);
    }
  }, [urlDosha]);

  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHerbs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: searchQuery,
        dosha: selectedDoshaFilter,
        page: page.toString(),
        limit: '24',
      });
      const res = await fetch(`/api/patient/remedies?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setHerbs(json.herbs || []);
        setTotalPages(json.totalPages || 1);
        setTotalCount(json.totalCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHerbs();
  }, [searchQuery, selectedDoshaFilter, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleDoshaChange = (dosha: 'All' | 'Vata' | 'Pitta' | 'Kapha') => {
    setSelectedDoshaFilter(dosha);
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans text-slate-800" id="herb-directory-page">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500 rounded-full opacity-30 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <BookOpen className="w-7 h-7 text-gold-200" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">5,100+ Ayurvedic Herb Remedies Directory</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Explore 5,100+ genuine Ayurvedic pharmacopoeia preparations, botanical lineages, and Dosha-balancing matches.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-grow max-w-lg">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search across 5,100+ herbs, formulations, or ailments..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
          />
        </div>

        {/* Dosha Filter Tabs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
          {(['All', 'Vata', 'Pitta', 'Kapha'] as const).map((dosha) => (
            <button
              key={dosha}
              onClick={() => handleDoshaChange(dosha)}
              className={`px-4 py-2 rounded-lg cursor-pointer transition ${
                selectedDoshaFilter === dosha
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dosha === 'All' ? 'Show All (5,100+)' : `${dosha} Balancer`}
            </button>
          ))}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
        <span>Showing {herbs.length > 0 ? (page - 1) * 24 + 1 : 0} - {Math.min(page * 24, totalCount)} of {totalCount.toLocaleString()} Herb Remedies</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Loading indicator / Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-sm font-bold">Querying 5,100+ Ayurvedic Herb Remedies...</span>
        </div>
      ) : herbs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <strong className="block text-slate-800 text-base font-bold">No Herb Remedies Found</strong>
          <span className="text-sm">Try broadening your search term or altering your Dosha filter.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {herbs.map((herb) => (
            <div
              key={herb.id || herb.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800">{herb.name}</h3>
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

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
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
                className="w-full py-2.5 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-xs font-bold text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer"
              >
                View Full Benefits <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 flex items-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 flex items-center cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
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
                <ul className="space-y-1.5 text-xs text-slate-600">
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
              <span className="text-[10px] text-slate-400 font-semibold">Source: Ayurvedic Pharmacopoeia of India</span>
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
