'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, Stethoscope } from 'lucide-react';

function DoctorLoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Forgot password flow states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetUserId, setResetUserId] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    const errorQuery = searchParams.get('error');
    if (errorQuery === 'suspended') {
      setError('Your physician account has been suspended. Please contact the administrative support team.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Invalid email format');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'DOCTOR' }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user);
      } else {
        if (data.unverified) {
          router.push(`/patient/verify-otp?userId=${data.userId}`);
        } else if (data.pendingApproval) {
          // If medical license is pending review, show specific error
          setError(data.error);
        } else {
          setError(data.error || 'Incorrect email or password');
        }
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (resetStep === 1) {
      if (!resetEmail || !resetEmail.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail }),
        });
        const data = await res.json();
        if (res.ok) {
          setResetUserId(data.userId);
          setResetSuccess('Reset code sent! Check your inbox.');
          setResetStep(2);
        } else {
          setError(data.error || 'Error sending code.');
        }
      } catch (err) {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!resetCode || !newPassword) {
        setError('All fields are required');
        return;
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: resetUserId, code: resetCode, newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
          setResetSuccess('Password reset successfully! You can now log in.');
          setTimeout(() => {
            setForgotPasswordMode(false);
            setResetStep(1);
            setResetEmail('');
            setResetCode('');
            setNewPassword('');
            setResetSuccess('');
          }, 3000);
        } else {
          setError(data.error || 'Invalid reset code');
        }
      } catch (err) {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream" id="doctor-login-page">
      {/* Visual Side */}
      <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600 rounded-full opacity-20 filter blur-3xl"></div>
        
        <div className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center font-bold text-lg text-primary-800">
            A
          </div>
          <span className="font-display font-bold text-2xl tracking-wide">AyurCare</span>
        </div>

        <div className="my-auto z-10 max-w-md">
          <div className="flex items-center space-x-2 text-gold-100 font-semibold mb-3">
            <Stethoscope className="w-5 h-5 text-gold-600" />
            <span>Physician Portal</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Partner in Healing & Wellbeing.
          </h1>
          <p className="text-primary-100 text-lg">
            Consult patients, write structured Ayurvedic prescriptions, and view medical histories instantly inside the patient 360 viewer.
          </p>
        </div>

        <div className="text-sm text-primary-100 opacity-70 z-10">
          &copy; 2026 AyurCare Health. All rights reserved.
        </div>
      </section>

      {/* Form Side */}
      <section className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          <div className="mb-8">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-800 font-display">
              {forgotPasswordMode ? 'Reset Credentials' : 'Doctor Portal Login'}
            </h2>
            <p className="text-slate-500 mt-2">
              {forgotPasswordMode 
                ? 'Follow the steps to reset your medical practice credentials.' 
                : 'Welcome, Doctor. Access your clinic appointments queue.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-lg border border-red-200 text-sm mb-6 font-medium leading-relaxed">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm mb-6 font-medium">
              {resetSuccess}
            </div>
          )}

          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              {resetStep === 1 ? (
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-2">Registered Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="doctor@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reset-code" className="block text-sm font-semibold text-slate-700 mb-2">6-Digit OTP Code</label>
                    <input
                      id="reset-code"
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 tracking-widest text-center text-lg font-bold placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-2">New Secure Password</label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8+ chars (1 number, 1 symbol)"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {resetStep === 1 ? 'Send Verification OTP' : 'Reset My Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetStep(1);
                  setError('');
                }}
                className="w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700 cursor-pointer transition"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email-field" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  id="email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@ayurcare.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password-field" className="text-sm font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(true)}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 cursor-pointer transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password-field"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600 font-medium cursor-pointer selection:bg-transparent">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Login as Doctor
              </button>

              <div className="text-center text-sm font-medium text-slate-600 mt-6">
                Don't have a practice account?{' '}
                <Link href="/doctor/signup" className="text-primary-600 font-bold hover:text-primary-700 underline transition">
                  Apply to Consult
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function DoctorLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream text-primary-800 font-semibold">
        Loading form...
      </div>
    }>
      <DoctorLoginContent />
    </Suspense>
  );
}
