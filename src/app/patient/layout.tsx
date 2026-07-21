'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, Bot, Calendar, FileText, LogOut, Wind, BookOpen, Utensils, Home, Flame, User, Sparkles, Activity } from 'lucide-react';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  // Bypassing verification for auth routes in patient panel (e.g. login, signup, verify-otp)
  const isAuthRoute =
    pathname === '/patient/login' ||
    pathname === '/patient/signup' ||
    pathname === '/patient/verify-otp';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access to children for unauthenticated / routing pages
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!user || user.role !== 'PATIENT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-md space-y-4">
          <Heart className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-805">Patient Access Required</h2>
          <p className="text-xs text-slate-500">You must log in to an active patient account to access these wellness resources.</p>
          <Link href="/patient/login" className="block w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-lg text-xs font-bold transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Heart className="w-6 h-6 text-primary-600 fill-primary-600" />
            <span className="font-display font-black text-lg text-slate-800">AyurCare</span>
          </div>
          <nav className="space-y-1 flex flex-col text-xs font-bold text-slate-600 max-h-[62vh] overflow-y-auto pr-1">
            <Link
              href="/patient/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/patient/ai-chat"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Bot className="w-4 h-4" />
              <span>PrakritiAI Bot</span>
            </Link>
            <Link
              href="/patient/doctors"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </Link>
            <Link
              href="/patient/records"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <FileText className="w-4 h-4" />
              <span>Medical Records</span>
            </Link>
            <Link
              href="/patient/analyzer"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Activity className="w-4 h-4" />
              <span>AI Report Analyser</span>
            </Link>
            <Link
              href="/patient/meditation"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Meditation Space</span>
            </Link>
            <Link
              href="/patient/breathing"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Wind className="w-4 h-4" />
              <span>Breathing Space</span>
            </Link>
            <Link
              href="/patient/remedies"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Herb Remedies</span>
            </Link>
            <Link
              href="/patient/diet"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Utensils className="w-4 h-4" />
              <span>Ayurvedic Diet</span>
            </Link>
            <Link
              href="/patient/home-remedies"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Home className="w-4 h-4" />
              <span>Home Remedies</span>
            </Link>
            <Link
              href="/patient/yoga"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <Flame className="w-4 h-4" />
              <span>Yoga Guide</span>
            </Link>
            <Link
              href="/patient/profile"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
          <div className="text-xs text-slate-700 font-bold uppercase tracking-wider block">
            {user.name}
            {user.status && (
              <span className="text-[10px] text-primary-600 block mt-0.5 font-bold">
                Status: {user.status}
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold rounded-lg transition duration-200 flex items-center justify-center text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
