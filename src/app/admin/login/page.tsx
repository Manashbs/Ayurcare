'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter admin credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'ADMIN' }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to reach the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6" id="admin-login-page">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden border border-slate-800">
        
        {/* Admin top indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-800 border border-slate-200">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="font-display text-2xl font-bold text-center text-slate-800 tracking-wide font-display">VedaSync Control Panel</h2>
        <p className="text-center text-slate-400 mt-2 text-xs font-semibold uppercase tracking-widest">Administrator Login Only</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm mt-6 font-medium text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ayurcare.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800 text-sm placeholder-slate-300"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Admin Password</label>
            <div className="relative">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800 text-sm placeholder-slate-300 pr-10"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Authenticate God-Mode
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
          Access is monitored under system audit protocols. Authorized access attempts only. IP logged.
        </div>
      </div>
    </main>
  );
}
