'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, Sparkles, Heart, ShieldCheck, HelpCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

function PatientLoginContent() {
  const { login, user } = useAuth();
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
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter code & new pass
  const [resetUserId, setResetUserId] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Check for redirected errors (like suspension)
  useEffect(() => {
    const errorQuery = searchParams.get('error');
    if (errorQuery === 'suspended') {
      setError('Account suspended: Please contact AyurCare support for assistance.');
    }
  }, [searchParams]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isMockGoogle = !googleClientId || googleClientId === 'mock_client_id';

  // Load Google Identity Services script and render the button (only if client_id is real)
  useEffect(() => {
    if (isMockGoogle) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLoginSuccess,
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.clientWidth || 380,
          });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [isMockGoogle, googleClientId]);

  // Listen for Google Mock Login popups (only active if client_id is mock)
  useEffect(() => {
    if (!isMockGoogle) return;

    const handleGoogleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
        const { user: googleUser } = event.data;
        if (googleUser) {
          login(googleUser);
        }
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, [isMockGoogle, login]);

  const handleGoogleMockClick = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/auth/google-mock',
      'Google Login Selection',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user);
      } else {
        setError(data.error || 'Google login verification failed.');
      }
    } catch (err) {
      setError('Connection error during Google Authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
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
        body: JSON.stringify({ email, password, role: 'PATIENT' }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user);
      } else {
        if (data.unverified) {
          // If email is not verified, redirect to OTP verification
          router.push(`/patient/verify-otp?userId=${data.userId}`);
        } else {
          setError(data.error || 'Incorrect email or password');
        }
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
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
        setError('Server error. Please try again.');
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
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream text-slate-850 font-sans" id="patient-login-page">
      
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
            <span>Ayurvedic Healing Portal</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Your Journey to True Balance Begins Here.
            </h1>
            <p className="text-primary-100 text-base leading-relaxed">
              Consult verified physicians, track your Prakriti (Dosha), and manage prescriptions online in a secure, startup-grade digital clinic.
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
      <section className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md bg-white border border-zinc-200/60 rounded-2xl shadow-xl overflow-hidden relative p-8 lg:p-10 hover-glow transition-premium">
          
          {/* Top border indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          {/* Heading */}
          <div className="mb-8 space-y-1">
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {forgotPasswordMode ? 'Reset Credentials' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              {forgotPasswordMode 
                ? 'Follow the steps to securely recover your account access.' 
                : 'Access your health records and consult vetted specialists.'}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 text-xs font-bold mb-6 animate-pulse">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-emerald-50 text-emerald-850 p-3.5 rounded-xl border border-emerald-100 text-xs font-bold mb-6">
              {resetSuccess}
            </div>
          )}

          {/* Form */}
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              {resetStep === 1 ? (
                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter registered email"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-800 placeholder-slate-400 text-sm transition"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="reset-code" className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center">6-Digit OTP Code</label>
                    <input
                      id="reset-code"
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-800 tracking-widest text-center text-lg font-bold placeholder-slate-350 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="new-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-800 placeholder-slate-400 text-sm transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md shadow-primary-600/10 text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {resetStep === 1 ? 'Send Verification OTP' : 'Reset My Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetStep(1);
                  setError('');
                }}
                className="w-full text-center text-xs font-bold text-primary-700 hover:text-primary-800 cursor-pointer transition"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  id="email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 placeholder-slate-400 text-sm transition"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password-field" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(true)}
                    className="text-xs font-bold text-primary-700 hover:text-primary-800 cursor-pointer transition"
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
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600/35 focus:border-primary-600 text-slate-805 placeholder-slate-400 pr-10 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-zinc-300 rounded focus:ring-primary-500 cursor-pointer bg-white"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-500 font-bold cursor-pointer selection:bg-transparent uppercase tracking-wider">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md shadow-primary-600/10 text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Login to Portal
              </button>

              {/* Google OAuth */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-4 text-slate-450 text-[10px] font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>

              {isMockGoogle ? (
                <button
                  type="button"
                  onClick={handleGoogleMockClick}
                  className="w-full py-3.5 border border-zinc-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl transition duration-200 flex items-center justify-center cursor-pointer shadow-sm text-xs"
                >
                  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.29 7.74 8.92 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.67-5.01 3.67-8.65z" />
                    <path fill="#FBBC05" d="M5.36 14.5c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.5 6.8C.54 8.71 0 10.84 0 13s.54 4.29 1.5 6.2l3.86-3.7z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.76-2.92c-1.1.74-2.52 1.18-4.2 1.18-3.08 0-5.71-2.7-6.64-5.46L1.5 16.5C3.39 20.35 7.35 23 12 23z" />
                  </svg>
                  Continue with Google
                </button>
              ) : (
                <div id="google-signin-btn-container" className="w-full flex justify-center py-1"></div>
              )}

              <div className="text-center text-xs font-bold text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link href="/patient/signup" className="text-primary-700 font-extrabold hover:text-primary-800 underline transition ml-1">
                  Sign up
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function PatientLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream text-primary-850 font-semibold">
        Loading form...
      </div>
    }>
      <PatientLoginContent />
    </Suspense>
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
