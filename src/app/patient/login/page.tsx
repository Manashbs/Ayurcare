'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

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
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream" id="patient-login-page">
      {/* Visual Side */}
      <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600 rounded-full opacity-20 filter blur-3xl"></div>
        
        {/* Brand Header */}
        <div className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center font-bold text-lg text-primary-800">
            A
          </div>
          <span className="font-display font-bold text-2xl tracking-wide">AyurCare</span>
        </div>

        {/* Brand Quote */}
        <div className="my-auto z-10 max-w-md">
          <div className="flex items-center space-x-2 text-gold-100 font-semibold mb-3">
            <Sparkles className="w-5 h-5 text-gold-600" />
            <span>Ayurvedic Healing Portal</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Your Journey to True Balance Begins Here.
          </h1>
          <p className="text-primary-100 text-lg">
            Consult verified physicians, track your Prakriti (Dosha), and manage prescriptions online in a secure environment.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-sm text-primary-100 opacity-70 z-10">
          &copy; 2026 AyurCare Health. All rights reserved.
        </div>
      </section>

      {/* Form Side */}
      <section className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
          
          {/* Top border indicator */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-800">
              {forgotPasswordMode ? 'Reset Password' : 'Patient Portal Login'}
            </h2>
            <p className="text-slate-500 mt-2">
              {forgotPasswordMode 
                ? 'Follow the steps to securely reset your credentials.' 
                : 'Welcome back. Access your health records and doctors.'}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm mb-6 font-medium animate-pulse">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm mb-6 font-medium">
              {resetSuccess}
            </div>
          )}

          {/* Form */}
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              {resetStep === 1 ? (
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400"
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
                      placeholder="Enter 6-digit code"
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
                      placeholder="Minimum 8 characters (1 number, 1 symbol)"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md"
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
                  placeholder="patient@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400"
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
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 placeholder-slate-400 pr-10"
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
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Login to Portal
              </button>

              {/* Google OAuth */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {isMockGoogle ? (
                <button
                  type="button"
                  onClick={handleGoogleMockClick}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition duration-200 flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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

              <div className="text-center text-sm font-medium text-slate-600 mt-6">
                Don't have an account?{' '}
                <Link href="/patient/signup" className="text-primary-600 font-bold hover:text-primary-700 underline transition">
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
