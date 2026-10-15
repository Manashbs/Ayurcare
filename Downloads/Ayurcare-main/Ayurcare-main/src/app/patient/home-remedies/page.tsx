'use client';

import React, { useState, useEffect } from 'react';
import { Search, Home, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Remedy {
  id: string;
  symptom: string;
  name: string;
  desc: string;
  imageUrl?: string;
  ingredients: string[];
  preparation: string[];
  usage: string;
  warning: string;
}

export default function HomeRemedies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRemedy, setActiveRemedy] = useState<Remedy | null>(null);

  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRemedies = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        limit: '24',
      });
      const res = await fetch(`/api/patient/home-remedies?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setRemedies(json.remedies || []);
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
    fetchRemedies();
  }, [searchQuery, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans text-slate-800" id="home-remedies-page">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-850 via-primary-800 to-primary-650 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-550 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Home className="w-7 h-7 text-gold-200" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">5,100+ Kitchen Home Remedies (Ghar ke Nuskhe)</h1>
            <p className="text-primary-100 text-sm mt-1">Simple, safe, and effective kitchen recipes for mild everyday symptoms across 5,100+ verified Nuskhe.</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-950/60 border border-amber-900 text-amber-300 p-4 rounded-xl text-xs flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-250 font-bold mb-0.5">Vetting Disclaimer:</strong>
          These home remedies are for educational purposes and mild symptoms only. If you suffer from high fever, severe acute pain, or chronic conditions, please immediately book a consultation with our certified doctors.
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search across 5,100+ remedies by symptom or ingredient (e.g. cold, acidity, ginger, bloating)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
          />
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
        <span>Showing {remedies.length > 0 ? (page - 1) * 24 + 1 : 0} - {Math.min(page * 24, totalCount)} of {totalCount.toLocaleString()} Home Remedies</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Remedies Grid / Loading */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
          <span className="text-sm font-bold">Querying 5,100+ Kitchen Home Remedies...</span>
        </div>
      ) : remedies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <strong className="block text-slate-800 font-bold">No Remedies Found</strong>
          <span className="text-xs">Try searching for other symptoms like cold, gas, or insomnia.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remedies.map((remedy) => (
            <div
              key={remedy.id || remedy.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary-50 text-primary-750 uppercase tracking-wide">
                    {remedy.symptom}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-800">{remedy.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-4 line-clamp-3">{remedy.desc}</p>
              </div>

              <button
                onClick={() => setActiveRemedy(remedy)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white text-xs font-bold rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
              >
                View Recipe & Preparation <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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

      {/* Remedy Modal */}
      {activeRemedy && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative animate-slideUp">
            
            <button
              onClick={() => setActiveRemedy(null)}
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
                <strong className="text-rose-700 block font-bold mb-0.5">Precautionary Warning:</strong>
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
