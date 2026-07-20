'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Stethoscope, Heart, Activity, ShieldCheck, ArrowRight, Star, Quote, ArrowUpRight, Award, ShieldAlert, Sparkle } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    // Load some mock doctor data for the landing page directory
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
        bio: 'Specialist in traditional detoxification, metabolic balance, and chronic ailment management.',
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
        bio: 'Dedicated to children wellness and pediatric care through natural immunity boosters.',
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream selection:bg-primary-100 selection:text-primary-900" id="ayurcare-landing-page">
      
      {/* Header Navbar */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-zinc-200/50 z-50 py-4 px-6 md:px-12 flex items-center justify-between transition-all duration-300">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-600 flex items-center justify-center font-bold text-white shadow-md shadow-primary-700/10 group-hover:scale-105 transition-all duration-300">
            <LeafIcon className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-primary-900">
            Ayur<span className="text-gold-700 font-medium">Care</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-primary-700 transition-colors">Features</Link>
          <Link href="#doctors" className="hover:text-primary-700 transition-colors">Physicians</Link>
          <Link href="#stats" className="hover:text-primary-700 transition-colors">Impact</Link>
          <Link href="#testimonials" className="hover:text-primary-700 transition-colors">Testimonials</Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">Namaste, <strong className="text-slate-800 font-bold">{user.name}</strong></span>
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition duration-200 shadow-md shadow-primary-600/10"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/patient/login"
                className="text-slate-600 hover:text-primary-800 text-sm font-bold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/patient/signup"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition duration-200 shadow-lg shadow-primary-600/15"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(18,92,58,0.08),rgba(255,255,255,0))] py-20 lg:py-28 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(18,92,58,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(18,92,58,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Call to Action */}
        <div className="lg:col-span-7 space-y-8 z-10">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-pulse" />
            <span>Ayurvedic Telemedicine Ecosystem</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 tracking-tight">
            Ancient Wisdom. <br />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-gold-700 bg-clip-text text-transparent">Modern Convenience.</span>
          </h1>

          <p className="text-slate-650 text-base sm:text-lg max-w-xl leading-relaxed">
            Consult verified Ayurvedic physicians via video, discover your unique Prakriti (Dosha) metabolic balance, and chat with PrakritiAI for daily wellness guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/patient/signup"
              className="px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-300 shadow-xl shadow-primary-600/20 text-center flex items-center justify-center cursor-pointer group"
            >
              Start Free Consultation 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/doctor/signup"
              className="px-6 py-4 border border-zinc-300/80 bg-white/50 backdrop-blur hover:bg-white text-slate-700 font-bold rounded-xl transition duration-300 text-center cursor-pointer hover:border-primary-600/30 flex items-center justify-center"
            >
              Join as Practitioner <ArrowUpRight className="w-4 h-4 ml-1.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Portal Switching Card */}
        <div className="lg:col-span-5 flex justify-center z-10">
          <div className="w-full max-w-md bg-white/80 backdrop-blur border border-zinc-200/50 rounded-2xl shadow-xl overflow-hidden relative p-8 hover-glow transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

            <div className="mb-6 text-center">
              <h3 className="font-display text-xl font-bold text-slate-800">Secure Access Portals</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Select your role to login</p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/85 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('patient')}
                className={`py-2.5 text-xs font-bold rounded-lg transition-premium ${
                  activeTab === 'patient' 
                    ? 'bg-white text-primary-700 shadow-md shadow-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`py-2.5 text-xs font-bold rounded-lg transition-premium ${
                  activeTab === 'doctor' 
                    ? 'bg-white text-primary-700 shadow-md shadow-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Doctor Portal
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'patient' ? (
                <>
                  <div className="bg-primary-50/50 border border-primary-100/50 rounded-xl p-4 text-xs font-medium text-primary-900 flex items-start">
                    <Heart className="w-4 h-4 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">Book verified doctors, submit daily wellness logs, download active e-prescriptions, and calculate your Prakriti Doshas.</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition text-center block shadow-md text-xs cursor-pointer shadow-primary-600/10"
                  >
                    Login as Patient
                  </Link>
                  <Link
                    href="/patient/signup"
                    className="w-full py-3.5 border border-zinc-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-center block text-xs cursor-pointer"
                  >
                    Create Patient Account
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-gold-50 border border-gold-100/50 rounded-xl p-4 text-xs font-medium text-gold-900 flex items-start">
                    <Stethoscope className="w-4 h-4 text-gold-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">Manage calendar schedules, view patient 360 histories, build e-prescriptions, and manage custom consultation rooms.</span>
                  </div>
                  <Link
                    href="/doctor/login"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl transition text-center block shadow-md text-xs cursor-pointer"
                  >
                    Login as Practitioner
                  </Link>
                  <Link
                    href="/doctor/signup"
                    className="w-full py-3.5 border border-zinc-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-center block text-xs cursor-pointer"
                  >
                    Apply for Verification
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Startup Credibility / Stats Section */}
      <section className="py-12 border-y border-zinc-200/50 bg-white" id="stats">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-primary-800">10k+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Patients Served</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-primary-800">150+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vetted Doctors</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-primary-800">99.2%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Accuracy Rating</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-primary-800">24/7</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Support</div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white/40 px-6 md:px-12 relative" id="features">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-primary-100/50 border border-primary-200/40 text-primary-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Smart Ecosystem Features</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Designed for Ayurvedic Precision</h2>
          <p className="text-slate-500 text-sm">Explore the key services that power our full-stack telemedicine framework.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-8 hover:shadow-xl transition-premium premium-shadow group hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-3">Physician Consultation</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Vetted doctors consult patients via high-fidelity video, audio, or chat with instant, secure access to full medical history logs.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-2xl p-8 hover:shadow-xl transition-premium premium-shadow group hover:-translate-y-1">
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center text-gold-700 mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-3">Prakriti Quiz (Doshas)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Take an interactive questionnaire to evaluate Vata, Pitta, and Kapha dominance and map your metabolic profile.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-2xl p-8 hover:shadow-xl transition-premium premium-shadow group hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-3">PrakritiAI Triage</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Consult our AI health assistant for preliminary Ayurvedic remedies, dietary guidance, and emergency symptom triage.
            </p>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white border-t border-zinc-200/50 px-6 md:px-12" id="testimonials">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <div className="inline-flex items-center space-x-1 bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkle className="w-3.5 h-3.5 fill-gold-600 text-gold-600" />
            <span>Success Stories</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">What Our Patients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-cream/40 p-8 rounded-2xl border border-zinc-200/60 relative premium-shadow">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-100 opacity-40" />
            <p className="text-slate-650 text-sm italic mb-6 leading-relaxed">
              "The Prakriti quiz calculated my Pitta-Kapha dominance exactly. Dr. Ananya prescribed custom pathya-apathya and Triphala that cured my chronic digestion issue in 2 weeks!"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-800 text-xs">SK</div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Suresh Kumar</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Patient</p>
              </div>
            </div>
          </div>
          <div className="bg-cream/40 p-8 rounded-2xl border border-zinc-200/60 relative premium-shadow">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-100 opacity-40" />
            <p className="text-slate-650 text-sm italic mb-6 leading-relaxed">
              "Being able to speak with PrakritiAI for quick home remedies is fantastic. When my chest pressure triggered, the AI immediately safety-warned me to consult a doctor. Brilliant safety logic!"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center font-bold text-gold-700 text-xs">MP</div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Meera Patel</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Directory Section */}
      <section className="py-24 bg-cream/35 px-6 md:px-12 border-t border-zinc-200/50" id="doctors">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Our Verified Specialists</h2>
          <p className="text-slate-500 text-sm">Consult seasoned BAMS/MD Ayurvedic physicians instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {doctors.map((doc: any) => (
            <div key={doc.id} className="bg-white border border-zinc-200/60 shadow-md rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-premium premium-shadow">
              <div className="absolute top-6 right-6 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-slate-800">{doc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.qualification}</p>
                  <div className="flex items-center space-x-1 text-gold-600 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-gold-600" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-zinc-100">
                  <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Speciality:</strong> {doc.specializations}</p>
                  <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Experience:</strong> {doc.experienceYears} Years</p>
                  <p className="text-xs text-slate-500"><strong className="text-slate-700 font-bold">Languages:</strong> {doc.languages}</p>
                </div>
                
                <p className="text-xs text-slate-550 italic bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed">"{doc.bio}"</p>
              </div>

              <div className="border-t border-zinc-100 mt-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Fee Per Consult</span>
                  <span className="text-base font-black text-slate-850">₹{doc.feePerConsult}</span>
                </div>
                <Link
                  href="/patient/login"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16 px-6 md:px-12 border-t border-slate-900 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <span className="font-display font-black text-2xl tracking-tight text-white flex items-center justify-center md:justify-start">
              <LeafIcon className="w-5 h-5 mr-2 text-primary-400" />
              Ayur<span className="text-gold-100 font-medium">Care</span>
            </span>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Bridging traditional Ayurvedic healthcare and modern software systems to deliver seamless, secure, and compliant telemedicine portals.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-200 mb-4 uppercase tracking-wider">For Patients</h4>
            <ul className="space-y-2.5 text-[11px] text-slate-450">
              <li><Link href="/patient/login" className="hover:text-white transition-colors">Consult Doctors</Link></li>
              <li><Link href="/patient/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/patient/login" className="hover:text-white transition-colors">Assess Prakriti</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-200 mb-4 uppercase tracking-wider">For Physicians</h4>
            <ul className="space-y-2.5 text-[11px] text-slate-450">
              <li><Link href="/doctor/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
              <li><Link href="/doctor/signup" className="hover:text-white transition-colors">Apply for Vetting</Link></li>
              <li><Link href="/doctor/login" className="hover:text-white transition-colors">Prescribe Online</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-200 mb-4 uppercase tracking-wider">Safety Disclaimer</h4>
            <p className="text-[10px] text-slate-450 leading-relaxed italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              AyurCare telemedicine consultations are brokered securely under India's DISHA health data principles. AI triage recommendations do not constitute official medical diagnoses.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          &copy; 2026 AyurCare Health. All rights reserved. Built for modern clinical telemedicine.
        </div>
      </footer>
    </div>
  );
}

// Custom Leaf SVG Logo
function LeafIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
      <path d="M9 22v-4h4" />
    </svg>
  );
}
