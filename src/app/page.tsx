'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Stethoscope, Heart, Activity, ShieldCheck, ArrowRight, Star, Quote, ChevronRight, CheckCircle2, Play } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col font-sans bg-cream relative overflow-hidden" id="vedasync-landing-page">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-100/30 rounded-full filter blur-[120px] pulse-glow-bg pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gold-100/20 rounded-full filter blur-[100px] pulse-glow-bg pointer-events-none -z-10" style={{ animationDelay: '2s' }}></div>

      {/* Header Navbar */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-slate-100 z-50 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-600 flex items-center justify-center font-display font-extrabold text-white text-lg shadow-md glow-green">
            VS
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            VedaSync<span className="text-primary-600">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-primary-700 transition">Features</Link>
          <Link href="#doctors" className="hover:text-primary-700 transition">Physicians</Link>
          <Link href="#how-it-works" className="hover:text-primary-700 transition">Our Method</Link>
          <Link href="#testimonials" className="hover:text-primary-700 transition">Stories</Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm font-bold text-slate-700 hidden sm:inline-block">Namaste, {user.name}</span>
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md glow-green btn-premium"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block text-slate-500 hover:text-slate-800 text-xs font-bold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/patient/login"
                className="text-slate-600 hover:text-primary-800 text-xs font-bold transition"
              >
                Sign In
              </Link>
              <Link
                href="/patient/signup"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md glow-green btn-premium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto py-16 md:py-24 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Call to Action */}
        <div className="lg:col-span-7 space-y-8 animate-fadeIn">
          <div className="inline-flex items-center space-x-2 bg-primary-100/50 border border-primary-200/50 text-primary-700 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-gold-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Ayurvedic Precision Medicine Platform</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
            Sync Ancient Wisdom <br />
            With <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-gold-600 bg-clip-text text-transparent">Advanced AI.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
            Discover your unique Prakriti (Dosha) metabolic blueprint, consult verified Ayurvedic physicians over secure HD video, and track your wellness with Gemini-powered health analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/patient/signup"
              className="px-7 py-4 bg-primary-600 hover:bg-primary-750 text-white font-bold rounded-xl transition duration-200 shadow-lg text-center flex items-center justify-center cursor-pointer btn-premium glow-green"
            >
              Start Free Assessment <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/doctor/signup"
              className="px-7 py-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition duration-200 text-center cursor-pointer bg-white"
            >
              Join as Practitioner
            </Link>
          </div>

          <div className="flex items-center space-x-8 pt-4 border-t border-slate-200/60 max-w-lg">
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">4.9★</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Patient Satisfaction</span>
            </div>
            <div className="border-l border-slate-200 h-8"></div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">100%</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Verified MD Physicians</span>
            </div>
            <div className="border-l border-slate-200 h-8"></div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">20k+</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Consultations Dispatched</span>
            </div>
          </div>
        </div>

        {/* Portal Switching Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden p-8 glass-premium glow-green">
            <div className="mb-6 text-center">
              <h3 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Access Portals</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Select your user role below to enter</p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('patient')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all duration-250 cursor-pointer ${
                  activeTab === 'patient' 
                    ? 'bg-white text-primary-700 shadow-md font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all duration-250 cursor-pointer ${
                  activeTab === 'doctor' 
                    ? 'bg-white text-primary-700 shadow-md font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Doctor Portal
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'patient' ? (
                <>
                  <div className="bg-primary-50/70 rounded-2xl p-4 text-xs font-semibold text-primary-800 flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Book verified Ayurvedic doctors, submit daily wellness logs, download active e-prescriptions, and calculate your Prakriti Doshas.</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition text-center block shadow-md text-sm cursor-pointer btn-premium glow-green"
                  >
                    Login as Patient
                  </Link>
                  <Link
                    href="/patient/signup"
                    className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-center block text-sm cursor-pointer bg-white"
                  >
                    Create Patient Account
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-gold-50/70 rounded-2xl p-4 text-xs font-semibold text-gold-900 flex items-start space-x-3">
                    <Stethoscope className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Manage calendar schedules, view patient 360 histories, build e-prescriptions, and interpret clinical health reports.</span>
                  </div>
                  <Link
                    href="/doctor/login"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl transition text-center block shadow-md text-sm cursor-pointer"
                  >
                    Login as Practitioner
                  </Link>
                  <Link
                    href="/doctor/signup"
                    className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-center block text-sm cursor-pointer bg-white"
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
      <section className="py-24 bg-white px-6 md:px-12 border-t border-slate-100" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Designed for Ayurvedic Precision</h2>
            <p className="text-slate-500 mt-4 text-base font-medium">Explore the key services that power our full-stack telemedicine framework.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream/40 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-primary-100 transition duration-300 relative group">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 mb-6 group-hover:scale-110 transition duration-300">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Physician Consultation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Vetted doctors consult patients via secure video, audio, or chat with instant access to full clinical history logs and digital prescription generation.
              </p>
            </div>

            <div className="bg-cream/40 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-gold-100 transition duration-300 relative group">
              <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center text-gold-700 mb-6 group-hover:scale-110 transition duration-300">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Prakriti Quiz (Doshas)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Take an interactive metabolic questionnaire to evaluate Vata, Pitta, and Kapha dominance and map your dynamic mind-body constitution.
              </p>
            </div>

            <div className="bg-cream/40 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-primary-100 transition duration-300 relative group">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 mb-6 group-hover:scale-110 transition duration-300">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">PrakritiAI Triage</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Consult our AI health assistant for preliminary Ayurvedic remedies, custom diet recommendations, and diagnostic report insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Metaphor Section */}
      <section className="py-24 bg-gradient-to-b from-white to-cream px-6 md:px-12 border-t border-slate-100" id="how-it-works">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">How VedaSync Optimizes Your Health</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              We leverage modern data mapping to bring centuries of clinical wisdom into the 21st century. Through report analysis and Prakriti evaluation, we align your path to health.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block">1. Assessment</strong>
                  <span className="text-slate-500 text-sm">Discover your unique Dosha balance with our clinical algorithm.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block">2. AI Diagnosis Assistance</strong>
                  <span className="text-slate-500 text-sm">Upload medical reports to gain Ayurvedic perspectives instantly.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block">3. Personalised Treatment</strong>
                  <span className="text-slate-500 text-sm">Consult our physicians for digital health plans and active guidance.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl overflow-hidden glass-premium glow-gold">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200/20 rounded-full filter blur-xl"></div>
              
              <h4 className="font-display font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Prakriti Balance Tracker</span>
                <span className="text-xs bg-gold-100 text-gold-700 px-2.5 py-0.5 rounded-full font-bold">LIVE AI</span>
              </h4>

              <div className="space-y-6 pt-6">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">
                    <span>Vata (Air & Space)</span>
                    <span className="text-primary-600">35%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">
                    <span>Pitta (Fire & Water)</span>
                    <span className="text-gold-600">45%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-600 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">
                    <span>Kapha (Earth & Water)</span>
                    <span className="text-slate-500">20%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50/50 rounded-2xl p-4 mt-6 border border-primary-100/50 text-xs text-primary-900 leading-relaxed font-semibold">
                ✨ Pitta dominant balance identified. We recommend cooler herbs, sweet fruits, and calming yoga postures to maintain perfect rhythm.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream/30 border-t border-slate-100 px-6 md:px-12" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Trusted by Verified Patients</h2>
            <p className="text-slate-500 mt-3 text-base font-medium">Real healing outcomes shared by our global startup community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-50/50" />
              <p className="text-slate-600 text-sm italic mb-6 leading-relaxed font-medium">
                "The Prakriti quiz calculated my Pitta-Kapha dominance exactly. Dr. Ananya prescribed custom pathya-apathya and Triphala that cured my chronic digestion issue in 2 weeks!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-850">S</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Suresh Kumar</h4>
                  <p className="text-xs text-slate-400">Verified Patient</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-50/50" />
              <p className="text-slate-600 text-sm italic mb-6 leading-relaxed font-medium">
                "Being able to speak with PrakritiAI for quick home remedies is fantastic. When my chest pressure triggered, the AI immediately safety-warned me to consult a doctor. Brilliant safety logic!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center font-bold text-gold-700">M</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Meera Patel</h4>
                  <p className="text-xs text-slate-400">Verified Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Directory Section */}
      <section className="py-24 bg-white px-6 md:px-12 border-t border-slate-100" id="doctors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Our Verified Specialists</h2>
            <p className="text-slate-500 mt-3 text-base font-medium">Consult seasoned BAMS/MD Ayurvedic physicians instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {doctors.map((doc: any) => (
              <div key={doc.id} className="bg-white border border-slate-100 shadow-lg rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-2xl transition duration-300 hover:border-primary-100">
                <div className="absolute top-6 right-6 bg-green-50 border border-green-200 text-green-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">{doc.qualification}</p>
                  <div className="flex items-center space-x-1 text-gold-600 mt-1">
                    <Star className="w-4 h-4 fill-gold-600" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Speciality:</strong> {doc.specializations}</p>
                    <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Experience:</strong> {doc.experienceYears} Years</p>
                    <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Languages:</strong> {doc.languages}</p>
                  </div>
                  
                  <p className="text-xs text-slate-500 italic mt-3 line-clamp-2">"{doc.bio}"</p>
                </div>

                <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Per Consult</span>
                    <span className="text-lg font-extrabold text-slate-800">₹{doc.feePerConsult}</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-750 text-white text-xs font-bold rounded-xl transition shadow-md btn-premium glow-green"
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
      <footer className="bg-slate-955 text-white py-16 px-6 md:px-12 border-t border-slate-900 text-center md:text-left relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-display font-extrabold text-2xl tracking-tight">
              VedaSync<span className="text-primary-500">.ai</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Bridging traditional Ayurvedic healthcare and modern software systems to deliver seamless, secure, and compliant telemedicine portals.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">For Patients</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/patient/login" className="hover:text-white transition">Consult Doctors</Link></li>
              <li><Link href="/patient/signup" className="hover:text-white transition">Create Account</Link></li>
              <li><Link href="/patient/login" className="hover:text-white transition">Assess Prakriti</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">For Physicians</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/doctor/login" className="hover:text-white transition">Doctor Login</Link></li>
              <li><Link href="/doctor/signup" className="hover:text-white transition">Apply for Vetting</Link></li>
              <li><Link href="/doctor/login" className="hover:text-white transition">Prescribe Online</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider">Safety Disclaimer</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              VedaSync telemedicine consultations are brokered securely under India's DISHA health data principles. AI triage recommendations do not constitute official medical diagnoses.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-xs text-slate-500">
          &copy; 2026 VedaSync AI Health. All rights reserved. Built for modern clinical telemedicine.
        </div>
      </footer>
    </div>
  );
}
