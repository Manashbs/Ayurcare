'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

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
    if (passwordStrength === 'weak') return 'bg-red-500 w-1/3';
    if (passwordStrength === 'medium') return 'bg-yellow-500 w-2/3';
    if (passwordStrength === 'strong') return 'bg-green-600 w-full';
    return 'bg-slate-200 w-0';
  };

  const getStrengthText = () => {
    if (passwordStrength === 'weak') return 'Weak (needs numbers & symbols)';
    if (passwordStrength === 'medium') return 'Medium (needs both numbers & symbols)';
    if (passwordStrength === 'strong') return 'Strong & Secure!';
    return '';
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream" id="patient-signup-page">
      {/* Visual Side */}
      <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600 rounded-full opacity-20 filter blur-3xl"></div>
        
        <div className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center font-bold text-lg text-primary-850">
            VS
          </div>
          <span className="font-display font-bold text-2xl tracking-wide">VedaSync</span>
        </div>

        <div className="my-auto z-10 max-w-md">
          <div className="flex items-center space-x-2 text-gold-100 font-semibold mb-3">
            <Sparkles className="w-5 h-5 text-gold-600" />
            <span>Join Prakriti Healing</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Unlock Personalized Ayurvedic Wellness.
          </h1>
          <p className="text-primary-100 text-lg">
            Create an account to discover your Dosha balance, request consultations, and set medicine reminders.
          </p>
        </div>

        <div className="text-sm text-primary-100 opacity-70 z-10">
          &copy; 2026 VedaSync AI Health. All rights reserved.
        </div>
      </section>

      {/* Form Side */}
      <section className="flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 my-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-800">Create Patient Account</h2>
            <p className="text-slate-500 text-sm mt-1">Get started with online Ayurvedic consults today.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm mb-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Full Name</label>
              <input
                id="name-field"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Verma"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="email-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Email Address</label>
              <input
                id="email-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Phone Number</label>
              <input
                id="phone-field"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Password</label>
              <input
                id="password-field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars (1 number, 1 symbol)"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
              
              {/* Strength Meter */}
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${getStrengthBarColor()}`}></div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 block ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Confirm Password</label>
              <input
                id="confirm-field"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Register & Send OTP
            </button>

            <div className="text-center text-sm font-medium text-slate-600 mt-6">
              Already have an account?{' '}
              <Link href="/patient/login" className="text-primary-600 font-bold hover:text-primary-700 underline transition">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
