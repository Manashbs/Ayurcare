'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/patient/login');
      return;
    }

    // Cooldown countdown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Email verified successfully! Loading your dashboard...');
        setTimeout(() => {
          if (data.role === 'DOCTOR') {
            router.push('/doctor/pending');
          } else {
            router.push('/patient/login?verified=true');
          }
        }, 2000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setSuccess('A new 6-digit code has been sent to your email.');
        setResendCooldown(30);
      } else {
        setError('Failed to resend code.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <h2 className="font-display text-2xl font-bold text-slate-800">Verify Your Account</h2>
      <p className="text-slate-500 mt-2 text-sm">
        We sent a 6-digit One-Time Password (OTP) to your registered email address. Please enter it below to activate your account.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm mt-6 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm mt-6 font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="0 0 0 0 0 0"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 tracking-widest text-center text-2xl font-bold placeholder-slate-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Verify & Activate
        </button>

        <div className="text-sm font-medium text-slate-500 pt-2">
          Didn't receive the email?{' '}
          <button
            type="button"
            disabled={resendCooldown > 0 || resendLoading}
            onClick={handleResend}
            className={`font-bold transition ${
              resendCooldown > 0 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-primary-600 hover:text-primary-700 cursor-pointer underline'
            }`}
          >
            {resendLoading ? 'Resending...' : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtp() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream p-6" id="verify-otp-page">
      <Suspense fallback={<div className="text-slate-500 font-medium">Loading verification content...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}
