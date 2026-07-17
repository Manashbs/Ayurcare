'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Stethoscope, Heart, Activity, ShieldCheck, ArrowRight, Star, Quote } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col font-sans" id="ayurcare-landing-page">
      {/* Header Navbar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-100 z-50 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-primary-800">AyurCare</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-primary-700 transition">Features</Link>
          <Link href="#doctors" className="hover:text-primary-700 transition">Physicians</Link>
          <Link href="#how-it-works" className="hover:text-primary-700 transition">How it Works</Link>
          <Link href="#testimonials" className="hover:text-primary-700 transition">Testimonials</Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm font-bold text-slate-700">Namaste, {user.name}</span>
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition duration-200"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/patient/login"
                className="text-slate-600 hover:text-primary-800 text-sm font-bold transition"
              >
                Sign In
              </Link>
              <Link
                href="/patient/signup"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-primary-50/40 via-white to-transparent py-16 md:py-24 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Call to Action */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary-100/50 border border-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>Ayurvedic Telemedicine Ecosystem</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-800">
            Ancient Wisdom, <br />
            <span className="bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Modern Convenience.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed">
            Consult verified Ayurvedic physicians via video, discover your unique Prakriti (Dosha) balance, and chat with PrakritiAI for daily wellness guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/patient/signup"
              className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-200 shadow-lg text-center flex items-center justify-center cursor-pointer"
            >
              Start Free Consultation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/doctor/signup"
              className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition duration-200 text-center cursor-pointer"
            >
              Join as Practitioner
            </Link>
          </div>
        </div>

        {/* Portal Switching Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative p-8">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

            <div className="mb-6 text-center">
              <h3 className="font-display text-xl font-bold text-slate-800">Access Portals</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Select your user role switcher below</p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('patient')}
                className={`py-2 text-sm font-bold rounded-md transition ${
                  activeTab === 'patient' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`py-2 text-sm font-bold rounded-md transition ${
                  activeTab === 'doctor' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Doctor Portal
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'patient' ? (
                <>
                  <div className="bg-primary-50 rounded-xl p-4 text-xs font-semibold text-primary-800 flex items-start">
                    <Heart className="w-5 h-5 text-primary-600 mr-2.5 flex-shrink-0" />
                    <span>Book verified doctors, submit daily wellness logs, download active e-prescriptions, and calculate your Prakriti Doshas.</span>
                  </div>
                  <Link
                    href="/patient/login"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition text-center block shadow-md text-sm cursor-pointer"
                  >
                    Login as Patient
                  </Link>
                  <Link
                    href="/patient/signup"
                    className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition text-center block text-sm cursor-pointer"
                  >
                    Create Patient Account
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-gold-50 rounded-xl p-4 text-xs font-semibold text-gold-900 flex items-start">
                    <Stethoscope className="w-5 h-5 text-gold-600 mr-2.5 flex-shrink-0" />
                    <span>Manage calendar schedules, view patient 360 histories, build e-prescriptions, and interpretations interpretation files.</span>
                  </div>
                  <Link
                    href="/doctor/login"
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition text-center block shadow-md text-sm cursor-pointer"
                  >
                    Login as Practitioner
                  </Link>
                  <Link
                    href="/doctor/signup"
                    className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition text-center block text-sm cursor-pointer"
                  >
                    Apply for Verification
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 bg-white px-6 md:px-12 border-t border-slate-50" id="features">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800">Designed for Ayurvedic Precision</h2>
          <p className="text-slate-500 mt-3 text-base">Explore the key services that power our full-stack telemedicine framework.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-cream/40 border border-slate-100 rounded-2xl p-8 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 mb-6">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">Physician Consultation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Vetted doctors consult patients via video, audio, or chat with instant, read-only access to full medical history logs.
            </p>
          </div>

          <div className="bg-cream/40 border border-slate-100 rounded-2xl p-8 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center text-gold-700 mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">Prakriti Quiz (Doshas)</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Take an interactive questionnaire to evaluate Vata, Pitta, and Kapha dominance and map your metabolic profile.
            </p>
          </div>

          <div className="bg-cream/40 border border-slate-100 rounded-2xl p-8 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">PrakritiAI Triage</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Consult our AI health assistant for preliminary Ayurvedic remedies, dietary guidance, and emergency symptom triage.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream/30 border-t border-slate-50 px-6 md:px-12" id="testimonials">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-slate-800">What Our Patients Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-50/50" />
            <p className="text-slate-600 text-sm italic mb-6 leading-relaxed">
              "The Prakriti quiz calculated my Pitta-Kapha dominance exactly. Dr. Ananya prescribed custom pathya-apathya and Triphala that cured my chronic digestion issue in 2 weeks!"
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-800">S</div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Suresh Kumar</h4>
                <p className="text-xs text-slate-400">Verified Patient</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-50/50" />
            <p className="text-slate-600 text-sm italic mb-6 leading-relaxed">
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
      </section>

      {/* Doctor Directory Section */}
      <section className="py-20 bg-white px-6 md:px-12 border-t border-slate-50" id="doctors">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-slate-800">Our Verified Specialists</h2>
          <p className="text-slate-500 mt-2 text-sm">Consult seasoned BAMS/MD Ayurvedic physicians instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {doctors.map((doc: any) => (
            <div key={doc.id} className="bg-white border border-slate-100 shadow-md rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-xl transition duration-300">
              <div className="absolute top-6 right-6 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-slate-800">{doc.name}</h3>
                <p className="text-xs text-slate-400 font-semibold">{doc.qualification}</p>
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
      <footer className="bg-slate-900 text-white py-12 px-6 md:px-12 border-t border-slate-800 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-display font-bold text-2xl tracking-wide">AyurCare</span>
            <p className="text-xs text-slate-400 leading-relaxed">
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
              AyurCare telemedicine consultations are brokered securely under India's DISHA health data principles. AI triage recommendations do not constitute official diagnoses.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
          &copy; 2026 AyurCare Health. All rights reserved. Built for modern clinical telemedicine.
        </div>
      </footer>
    </div>
  );
}
