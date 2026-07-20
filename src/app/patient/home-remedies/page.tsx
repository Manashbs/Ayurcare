'use client';

import React, { useState, useEffect } from 'react';
import { Search, Home, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface Remedy {
  symptom: string;
  name: string;
  desc: string;
  ingredients: string[];
  preparation: string[];
  usage: string;
  warning: string;
}

const SYMPTOMS_LIST = [
  'All',
  'Cold & Sore Throat',
  'Acidity & Heartburn',
  'Bloating & Gas',
  'Insomnia & Anxiety',
  'Headache & Stress',
  'Joint Pain & Stiffness',
  'Indigestion & Slow Agni',
  'Skin Rash & Itching',
  'Hair Fall & Thinning',
  'Eye Strain & Burn',
  'Fatigue & Low Energy',
  'Constipation',
  'Diarrhea & Loose Motion',
  'Dry Cough',
  'Pimples & Acne',
  'Dandruff & Dry Scalp',
  'Mouth Ulcers',
  'Mild Fever',
  'Muscle Spasms',
  'Back Pain',
  'Nausea & Motion Sickness',
  'Bad Breath',
  'Sore Muscles',
  'Low Appetite',
  'Toothache',
  'Sunburn',
  'Dry Skin'
];

export default function HomeRemedies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('All');

  // Pagination & Loading States
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch remedies when search, filters, or page changes
  useEffect(() => {
    const fetchRemedies = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '15',
          query: debouncedSearch,
          symptom: selectedSymptom
        });

        const res = await fetch(`/api/patient/home-remedies?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRemedies(data.remedies || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error('Error fetching remedies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRemedies();
  }, [currentPage, debouncedSearch, selectedSymptom]);

  const handleSymptomChange = (symptom: string) => {
    setSelectedSymptom(symptom);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans" id="home-remedies-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-600 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500 rounded-full opacity-20 filter blur-2xl"></div>
        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Home className="w-7 h-7 text-gold-100 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-250 font-bold uppercase tracking-widest block mb-0.5 font-mono">Kitchen Pharmacy</span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Ayurvedic Home Remedies</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Discover the healing power of everyday household ingredients. Access a curated database of <strong className="text-white">2,000+</strong> remedies for common health issues.
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
              placeholder="Search by ingredient, preparation step, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 text-sm placeholder-slate-400 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Symptoms horizontal scrolling selector */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Filter by Symptom / Indication</label>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {SYMPTOMS_LIST.map((sym) => (
              <button
                key={sym}
                onClick={() => handleSymptomChange(sym)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedSymptom === sym
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                {sym === 'All' ? 'All Symptoms' : sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Status Info */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <span>Found <strong className="text-slate-700 font-bold">{totalCount}</strong> matching remedies</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Remedies List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading home remedies...</span>
        </div>
      ) : remedies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 shadow-sm">
          <AlertCircle className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-800 font-bold text-lg">No Remedies Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            We couldn't find any home remedies matching your current search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {remedies.map((remedy) => (
              <div
                key={remedy.name}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {remedy.symptom}
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-slate-800 pt-1">{remedy.name}</h3>
                    <p className="text-xs text-slate-650 leading-relaxed text-slate-600">{remedy.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {/* Left Column: Ingredients & Preparation */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Ingredients Required
                      </h4>
                      <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                        {remedy.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Step-by-Step Preparation
                      </h4>
                      <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-1">
                        {remedy.preparation.map((prep, idx) => (
                          <li key={idx}>{prep}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Right Column: Usage & Warnings */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Consumption Guidelines
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{remedy.usage}</p>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-rose-600" /> Precautions & Warnings
                      </h4>
                      <p className="text-xs text-rose-700 leading-relaxed">{remedy.warning}</p>
                    </div>
                  </div>
                </div>
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
                <span className="px-3 py-1 text-slate-550">{totalPages}</span>
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
    </div>
  );
}
