'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronDown, Check } from 'lucide-react';

export default function GoogleMockLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('manashsri2@gmail.com');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');

  const preconfiguredEmails = [
    { email: 'manashsri2@gmail.com', name: 'Manash Srivastav' },
    { email: 'patient@ayurcare.com', name: 'Rohan Verma' },
  ];

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    // Derive name from email local part cleanly
    let name = '';
    const preconfig = preconfiguredEmails.find(x => x.email.toLowerCase() === selectedEmail.toLowerCase());
    if (preconfig) {
      name = preconfig.name;
    } else {
      // Split by dot, dash, underscore and capitalize each part
      const localPart = selectedEmail.split('@')[0];
      name = localPart
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail, name }),
      });
      const data = await res.json();

      if (res.ok) {
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS', user: data.user }, '*');
        }
        window.close();
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmailInput || !customEmailInput.includes('@')) {
      setError('Invalid email address');
      return;
    }
    setSelectedEmail(customEmailInput);
    setIsEditingEmail(false);
    setShowDropdown(false);
    setError('');
  };

  const handleCancel = () => {
    window.close();
  };

  // Get initial letter for avatar circle
  const initial = selectedEmail ? selectedEmail.charAt(0).toUpperCase() : 'G';

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-col justify-between p-6 font-sans antialiased">
      {/* Top Google Header bar */}
      <header className="flex items-center space-x-3 text-sm font-medium text-[#e3e3e3]">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto flex-grow flex flex-col justify-center py-10">
        <div className="space-y-8 text-left">
          {/* App Logo Emblem */}
          <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center border border-emerald-700 shadow-lg">
            <span className="text-white font-serif font-extrabold text-2xl tracking-tight">A</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-[32px] font-normal leading-[40px] text-white tracking-tight">
              You're signing back in to AyurCare
            </h1>

            {/* Email dropdown selector pill */}
            <div className="relative">
              {!isEditingEmail ? (
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-3 py-1.5 bg-[#1e1f20] border border-[#444746] hover:border-[#8e918f] rounded-full transition text-[#e3e3e3] cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    {initial}
                  </div>
                  <span className="text-sm font-semibold pr-1">{selectedEmail}</span>
                  <ChevronDown className="w-4 h-4 text-[#c4c7c5]" />
                </button>
              ) : (
                <form onSubmit={handleAddEmailSubmit} className="flex items-center space-x-2 w-full max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    className="flex-grow px-3 py-1.5 bg-[#131314] border border-[#8e918f] rounded-lg text-sm text-white focus:outline-none focus:border-[#8ab4f8]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs transition"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Custom Dropdown Dialog */}
              {showDropdown && !isEditingEmail && (
                <div className="absolute left-0 mt-2 w-72 bg-[#1e1f20] border border-[#444746] rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                  {preconfiguredEmails.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setSelectedEmail(acc.email);
                        setShowDropdown(false);
                        setError('');
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2d2e30] transition text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{acc.name}</div>
                        <div className="text-xs text-[#c4c7c5]">{acc.email}</div>
                      </div>
                      {selectedEmail === acc.email && <Check className="w-4 h-4 text-[#8ab4f8]" />}
                    </button>
                  ))}
                  <div className="h-px bg-[#444746] my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setCustomEmailInput('');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#8ab4f8] hover:bg-[#2d2e30] transition cursor-pointer"
                  >
                    + Use another account
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900 text-red-300 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Legal / Policy Disclaimer matching screenshot */}
          <div className="space-y-4 text-sm text-[#c4c7c5] leading-relaxed">
            <p>
              Review AyurCare's <span className="text-[#8ab4f8] cursor-pointer hover:underline">privacy policy</span> and <span className="text-[#8ab4f8] cursor-pointer hover:underline">Terms of Service</span> to understand how AyurCare will process and protect your data.
            </p>
            <p>
              To make changes at any time, go to your <span className="text-[#8ab4f8] cursor-pointer hover:underline">Google Account</span>.
            </p>
            <p>
              Learn more about <span className="text-[#8ab4f8] cursor-pointer hover:underline">Sign in with Google</span>.
            </p>
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-[#444746] hover:bg-[#2d2e30] text-[#8ab4f8] font-bold rounded-full transition text-sm cursor-pointer shadow-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleContinue}
              className="px-6 py-2 bg-[#8ab4f8] hover:bg-[#a8c7fa] disabled:bg-zinc-700 text-[#0f0f0f] font-bold rounded-full transition text-sm flex items-center justify-center cursor-pointer shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continue
            </button>
          </div>
        </div>
      </main>

      {/* Footer bar matching screenshot */}
      <footer className="w-full flex justify-between items-center text-xs text-[#c4c7c5] border-t border-[#444746]/50 pt-4">
        <div>
          <select className="bg-[#131314] text-[#c4c7c5] border-none focus:outline-none cursor-pointer">
            <option>English (United Kingdom)</option>
            <option>English (United States)</option>
            <option>Hindi</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <span className="cursor-pointer hover:underline">Help</span>
          <span className="cursor-pointer hover:underline">Privacy</span>
          <span className="cursor-pointer hover:underline">Terms</span>
        </div>
      </footer>
    </div>
  );
}
