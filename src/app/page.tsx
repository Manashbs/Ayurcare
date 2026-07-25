'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Stethoscope, Heart, Activity, ShieldCheck, ArrowRight, Star, Quote, ChevronRight, CheckCircle2, ChevronDown } from 'lucide-react';
import Fullscreen3DUniverse from '@/components/Fullscreen3DUniverse';

export default function Home() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    setDoctors([
      {
        id: '1',
        name: 'Dr. Ananya Sharma',
        qualification: 'BAMS, MD (Ayurveda)',
        specializations: 'Kayachikitsa, Panchakarma',
        experienceYears: 12,
        feePerConsult: 500,
        rating: 4.9,
        languages: 'English, Hindi, Kannada',
        bio: 'Specialist in traditional detoxification and chronic ailment management.',
      },
      {
        id: '2',
        name: 'Dr. Vikram Malhotra',
        qualification: 'BAMS',
        specializations: 'Shalya Tantra (Surgery)',
        experienceYears: 5,
        feePerConsult: 350,
        rating: 4.5,
        languages: 'Hindi, Punjabi, English',
        bio: 'Experienced in general Ayurvedic practice and traditional surgical protocols.',
      },
      {
        id: '3',
        name: 'Dr. Rahul Mehta',
        qualification: 'BAMS, PhD (Ayur)',
        specializations: 'Kaumarbhritya (Pediatrics)',
        experienceYears: 15,
        feePerConsult: 600,
        rating: 4.8,
        languages: 'English, Gujarati, Hindi',
        bio: 'Dedicated to children wellbeing through natural immunity boosters.',
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 relative overflow-hidden" id="vedasync-landing-page">
      {/* Immersive 3D Universe Background */}
      <Fullscreen3DUniverse />

      {/* Header Navbar */}
      <header className="sticky top-0 bg-slate-950/45 backdrop-blur-md border-b border-slate-900/60 z-50 py-4 px-6 md:px-12 flex items-center justify-between shadow-lg">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center font-display font-extrabold text-white text-lg shadow-md shadow-primary-950/20">
            VS
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            VedaSync<span className="text-primary-400">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors duration-200">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors duration-200">Our Method</Link>
          <Link href="#testimonials" className="hover:text-white transition-colors duration-200">Stories</Link>
          <Link href="#doctors" className="hover:text-white transition-colors duration-200">Physicians</Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm font-bold text-slate-300 hidden sm:inline-block">Namaste, {user.name}</span>
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md shadow-primary-950/40"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/patient/login"
                className="text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Sign In
              </Link>
              <Link
                href="/patient/signup"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md shadow-primary-950/40"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto py-16 md:py-24 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Call to Action */}
        <div className="lg:col-span-6 space-y-8 animate-fadeIn">
          <div className="inline-flex items-center space-x-2 bg-primary-950/40 border border-primary-800/40 text-primary-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
            <span>Immersive 3D Telemedicine Platform</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6.5xl font-extrabold leading-tight text-white tracking-tight">
            Sync Ancient Wisdom <br />
            With <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400 bg-clip-text text-transparent">Advanced AI.</span>
          </h1>

          <p className="text-slate-350 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
            Explore your biological Prakriti blueprint, consult verified Ayurvedic doctors over secure telemedicine, and align your health with Gemini report processing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/patient/signup"
              className="px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition duration-200 shadow-lg text-center flex items-center justify-center cursor-pointer shadow-primary-950/40"
            >
              Start Free Assessment <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/doctor/signup"
              className="px-7 py-4 border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 font-bold rounded-xl transition duration-200 text-center cursor-pointer backdrop-blur-sm"
            >
              Join as Practitioner
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-8 pt-6 border-t border-slate-900/80 max-w-lg">
            <div>
              <span className="block text-2xl font-extrabold text-white">4.9★</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patient Rating</span>
            </div>
            <div className="border-l border-slate-900 h-8"></div>
            <div>
              <span className="block text-2xl font-extrabold text-white">100%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Verified MDs</span>
            </div>
            <div className="border-l border-slate-900 h-8"></div>
            <div>
              <span className="block text-2xl font-extrabold text-white">20k+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dispatched Logs</span>
            </div>
          </div>
        </div>

        {/* Right column stacking Portal Cards with 3D guide */}
        <div className="lg:col-span-6 flex flex-col space-y-6 items-center w-full">
          {/* Scroll Guide Card */}
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex items-center justify-between group pointer-events-none">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gold-950/30 border border-gold-900/40 flex items-center justify-center text-gold-400 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Interactive Environment</span>
                <span className="text-xs text-slate-355 font-bold">Scroll down to morph the 3D particles</span>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-500 animate-bounce" />
          </div>

          {/* Core Access Portals Card */}
          <div className="w-full max-w-md bg-slate-900/55 rounded-3xl shadow-3xl border border-slate-800/80 overflow-hidden p-8 backdrop-blur-md shadow-black/40 relative">
            <div className="mb-6 text-center">
              <h3 className="font-display text-2xl font-extrabold text-white tracking-tight">Access Portals</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select your user role below to enter</p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-900 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('patient')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'patient' 
                    ? 'bg-slate-900 text-white shadow-lg border border-slate-800/50 font-bold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'doctor' 
                    ? 'bg-slate-900 text-white shadow-lg border border-slate-800/50 font-bold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Doctor Portal
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'patient' ? (
                <>
                  <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 text-xs font-semibold text-slate-300 flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Book verified Ayurvedic doctors, submit daily wellness logs, download active e-prescriptions, and calculate your Prakriti Doshas.</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition text-center block shadow-md shadow-primary-950/40 text-sm cursor-pointer"
                  >
                    Login as Patient
                  </Link>
                  <Link
                    href="/patient/signup"
                    className="w-full py-3.5 border border-slate-850 hover:bg-slate-900/50 text-slate-300 font-bold rounded-xl transition text-center block text-sm cursor-pointer"
                  >
                    Create Patient Account
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 text-xs font-semibold text-slate-300 flex items-start space-x-3">
                    <Stethoscope className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Manage calendar schedules, view patient 360 histories, build e-prescriptions, and interpret clinical health reports.</span>
                  </div>
                  <Link
                    href="/doctor/login"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl transition text-center block shadow-md shadow-black/35 text-sm cursor-pointer border border-slate-800"
                  >
                    Login as Practitioner
                  </Link>
                  <Link
                    href="/doctor/signup"
                    className="w-full py-3.5 border border-slate-850 hover:bg-slate-900/50 text-slate-300 font-bold rounded-xl transition text-center block text-sm cursor-pointer"
                  >
                    Apply for Vetting
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-transparent px-6 md:px-12 relative z-10" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 bg-cyan-950/45 border border-cyan-800/40 text-cyan-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm mb-4">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Ayurvedic Precision Medicine</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">Designed for Ayurvedic Precision</h2>
            <p className="text-slate-400 mt-4 text-base font-medium">Explore the key services that power our full-stack telemedicine framework.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/35 border border-slate-800/60 rounded-3xl p-8 hover:shadow-2xl hover:border-slate-700/80 transition duration-300 backdrop-blur-md relative group">
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition duration-300">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Physician Consultation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Vetted doctors consult patients via secure video, audio, or chat with instant access to full clinical history logs and digital prescription generation.
              </p>
            </div>

            <div className="bg-slate-900/35 border border-slate-800/60 rounded-3xl p-8 hover:shadow-2xl hover:border-slate-700/80 transition duration-300 backdrop-blur-md relative group">
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 transition duration-300">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Prakriti Quiz (Doshas)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Take an interactive metabolic questionnaire to evaluate Vata, Pitta, and Kapha dominance and map your dynamic mind-body constitution.
              </p>
            </div>

            <div className="bg-slate-900/35 border border-slate-800/60 rounded-3xl p-8 hover:shadow-2xl hover:border-slate-700/80 transition duration-300 backdrop-blur-md relative group">
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition duration-300">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">PrakritiAI Triage</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Consult our AI health assistant for preliminary Ayurvedic remedies, custom diet recommendations, and diagnostic report insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Metaphor Section */}
      <section className="py-24 bg-transparent px-6 md:px-12 relative z-10" id="how-it-works">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
              <span>Bio-Energetic Alignment</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">How VedaSync Optimizes Your Health</h2>
            <p className="text-slate-300 leading-relaxed font-medium">
              We leverage modern data mapping to bring centuries of clinical wisdom into the 21st century. Through report analysis and Prakriti evaluation, we align your path to health.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <strong className="text-white font-bold block">1. Assessment</strong>
                  <span className="text-slate-400 text-sm">Discover your unique Dosha balance with our clinical algorithm.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <strong className="text-white font-bold block">2. AI Diagnosis Assistance</strong>
                  <span className="text-slate-400 text-sm">Upload medical reports to gain Ayurvedic perspectives instantly.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <div>
                  <strong className="text-white font-bold block">3. Personalised Treatment</strong>
                  <span className="text-slate-400 text-sm">Consult our physicians for digital health plans and active guidance.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md bg-slate-900/45 border border-slate-800/80 rounded-3xl p-8 shadow-3xl overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full filter blur-xl"></div>
              
              <h4 className="font-display font-bold text-white text-lg border-b border-slate-800/60 pb-3 flex items-center justify-between">
                <span>Prakriti Balance Tracker</span>
                <span className="text-[10px] bg-gold-950/45 text-gold-400 border border-gold-900/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">LIVE AI</span>
              </h4>

              <div className="space-y-6 pt-6">
                <div>
                  <div className="flex justify-between text-xs text-slate-450 font-bold uppercase tracking-wider mb-2">
                    <span>Vata (Air & Space)</span>
                    <span className="text-primary-400 font-extrabold">35%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-455 font-bold uppercase tracking-wider mb-2">
                    <span>Pitta (Fire & Water)</span>
                    <span className="text-gold-400 font-extrabold">45%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-455 font-bold uppercase tracking-wider mb-2">
                    <span>Kapha (Earth & Water)</span>
                    <span className="text-slate-500 font-extrabold">20%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-650 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-4 mt-6 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-semibold">
                ✨ Pitta dominant balance identified. We recommend cooler herbs, sweet fruits, and calming yoga postures to maintain perfect rhythm.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-transparent px-6 md:px-12 relative z-10" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 bg-rose-950/40 border border-rose-900/40 text-rose-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm mb-4">
              <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Client Success Stories</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">Trusted by Verified Patients</h2>
            <p className="text-slate-400 mt-3 text-base font-medium">Real healing outcomes shared by our global startup community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-900/35 p-8 rounded-3xl border border-slate-800/60 shadow-xl backdrop-blur-md relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-800/40" />
              <p className="text-slate-350 text-sm italic mb-6 leading-relaxed font-medium">
                "The Prakriti quiz calculated my Pitta-Kapha dominance exactly. Dr. Ananya prescribed custom pathya-apathya and Triphala that cured my chronic digestion issue in 2 weeks!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-slate-200">S</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Suresh Kumar</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase">Verified Patient</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/35 p-8 rounded-3xl border border-slate-800/60 shadow-xl backdrop-blur-md relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-800/40" />
              <p className="text-slate-350 text-sm italic mb-6 leading-relaxed font-medium">
                "Being able to speak with PrakritiAI for quick home remedies is fantastic. When my chest pressure triggered, the AI immediately safety-warned me to consult a doctor. Brilliant safety logic!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-slate-200">M</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Meera Patel</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase">Verified Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Directory Section */}
      <section className="py-24 bg-transparent px-6 md:px-12 relative z-10" id="doctors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-900/40 text-purple-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm mb-4">
              <Stethoscope className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Ayurvedic Physicians Directory</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">Our Verified Specialists</h2>
            <p className="text-slate-400 mt-3 text-base font-medium">Consult seasoned BAMS/MD Ayurvedic physicians instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {doctors.map((doc: any) => (
              <div key={doc.id} className="bg-slate-900/35 border border-slate-800/60 shadow-xl rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-2xl hover:border-slate-700/80 transition duration-300 backdrop-blur-md">
                <div className="absolute top-6 right-6 bg-slate-950 border border-slate-850 text-green-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-400" /> Verified
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-white">{doc.name}</h3>
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{doc.qualification}</p>
                  <div className="flex items-center space-x-1 text-gold-500 mt-1">
                    <Star className="w-4 h-4 fill-gold-500" />
                    <span className="text-xs font-bold text-slate-300">{doc.rating}</span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-slate-455"><strong className="text-slate-300 font-bold">Speciality:</strong> {doc.specializations}</p>
                    <p className="text-xs text-slate-455"><strong className="text-slate-300 font-bold">Experience:</strong> {doc.experienceYears} Years</p>
                    <p className="text-xs text-slate-455"><strong className="text-slate-300 font-bold">Languages:</strong> {doc.languages}</p>
                  </div>
                  
                  <p className="text-xs text-slate-400 italic mt-3 line-clamp-2">"{doc.bio}"</p>
                </div>

                <div className="border-t border-slate-800/60 mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Fee Per Consult</span>
                    <span className="text-lg font-extrabold text-white">₹{doc.feePerConsult}</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-primary-950/40"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-955/80 text-slate-400 py-16 px-6 md:px-12 border-t border-slate-900/80 text-center md:text-left relative overflow-hidden z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              VedaSync<span className="text-primary-400">.ai</span>
            </span>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Bridging traditional Ayurvedic healthcare and modern software systems to deliver seamless, secure, and compliant telemedicine portals.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">For Patients</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/patient/login" className="hover:text-white transition">Consult Doctors</Link></li>
              <li><Link href="/patient/signup" className="hover:text-white transition">Create Account</Link></li>
              <li><Link href="/patient/login" className="hover:text-white transition">Assess Prakriti</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">For Physicians</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/doctor/login" className="hover:text-white transition">Doctor Login</Link></li>
              <li><Link href="/doctor/signup" className="hover:text-white transition">Apply for Vetting</Link></li>
              <li><Link href="/doctor/login" className="hover:text-white transition">Prescribe Online</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">Safety Disclaimer</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              VedaSync telemedicine consultations are brokered securely under India's DISHA health data principles. AI triage recommendations do not constitute official medical diagnoses.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-xs text-slate-600">
          &copy; 2026 VedaSync AI Health. All rights reserved. Built for modern clinical telemedicine.
        </div>
      </footer>
    </div>
  );
}
