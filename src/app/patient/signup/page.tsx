'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function PatientSignup() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');

  // Password strength check hook
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (isLongEnough && hasNumber && hasSymbol) {
      setPasswordStrength('strong');
    } else if (password.length >= 6 && (hasNumber || hasSymbol)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field checks
    if (!name || !email || !password || !phone) {
      setError('All fields are mandatory');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength !== 'strong') {
      setError('Password must meet minimum strength requirements (8+ characters, at least one number and one symbol)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: 'PATIENT',
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // Redirect to OTP verification page
        router.push(`/patient/verify-otp?userId=${data.userId}`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (passwordStrength === 'weak') return 'bg-rose-500 w-1/3';
    if (passwordStrength === 'medium') return 'bg-amber-500 w-2/3';
    if (passwordStrength === 'strong') return 'bg-emerald-600 w-full';
    return 'bg-zinc-200 w-0';
  };

  const getStrengthText = () => {
    if (passwordStrength === 'weak') return 'Weak (needs numbers & symbols)';
    if (passwordStrength === 'medium') return 'Medium (needs both numbers & symbols)';
    if (passwordStrength === 'strong') return 'Strong & Secure!';
    return '';
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream text-slate-850 font-sans" id="patient-signup-page">
      
      {/* Visual Side */}
      <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600 rounded-full opacity-20 filter blur-3xl"></div>
        
        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 z-10 group">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-white shadow-sm">
            <LeafIcon className="w-4.5 h-4.5 text-gold-100" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">Ayur<span className="text-gold-100 font-medium">Care</span></span>
        </div>

        {/* Brand Quote */}
        <div className="my-auto z-10 max-w-md space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 text-gold-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold-100 animate-pulse" />
            <span>Join Prakriti Healing</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Unlock Personalized Ayurvedic Wellness.
            </h1>
            <p className="text-primary-100 text-base leading-relaxed">
              Create a secure account to discover your Dosha balance, book verified telemedicine sessions, and calculate wellness recommendations.
            </p>
          </div>
          <div className="pt-4 flex items-center space-x-6 text-xs text-primary-100/80 font-semibold border-t border-white/10">
            <span className="flex items-center"><ShieldCheck className="w-4.5 h-4.5 mr-2 text-gold-100" /> HIPAA Compliant</span>
            <span className="flex items-center"><HelpCircle className="w-4.5 h-4.5 mr-2 text-gold-100" /> 24/7 AI Triage</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] font-semibold text-primary-100/50 uppercase tracking-wider z-10">
          &copy; 2026 AyurCare Health. All rights reserved.
        </div>
      </section>

      {/* Form Side */}
      <section className="flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-zinc-200/60 rounded-2xl shadow-xl overflow-hidden relative p-8 my-6 hover-glow transition-premium">
          
          {/* Top border indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          {/* Heading */}
          <div className="mb-6 space-y-1">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-xs font-medium">Get started with online Ayurvedic consults today.</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 text-xs font-bold mb-4 flex items-start">
              <AlertCircle className="w-4.5 h-4.5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                id="name-field"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Verma"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input
                id="email-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input
                id="phone-field"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                id="password-field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars (1 number, 1 symbol)"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 text-sm transition"
              />
              
              {/* Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-350 ${getStrengthBarColor()}`}></div>
                  </div>
                  <span className={`text-[10px] font-extrabold block ${
                    passwordStrength === 'weak' ? 'text-rose-500' :
                    passwordStrength === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <input
                id="confirm-field"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md shadow-primary-600/10 text-xs mt-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Register & Send OTP
            </button>

            <div className="text-center text-xs font-bold text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/patient/login" className="text-primary-700 font-extrabold hover:text-primary-800 underline transition ml-1">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

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
