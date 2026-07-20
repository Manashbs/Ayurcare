'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, Bot, Calendar, FileText, LogOut, Wind, BookOpen, Utensils, Home as HomeIcon, Flame, User, Sparkles, Activity, Bell } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access to children for unauthenticated / routing pages
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!user || user.role !== 'PATIENT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4">
        <div className="bg-white border border-zinc-200/60 p-8 rounded-2xl shadow-xl text-center max-w-md space-y-4">
          <Heart className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Patient Access Required</h2>
          <p className="text-xs text-slate-500">You must log in to an active patient account to access these wellness resources.</p>
          <Link href="/patient/login" className="block w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  const sidebarLinks = [
    { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patient/ai-chat', label: 'PrakritiAI Bot', icon: Bot },
    { href: '/patient/doctors', label: 'Book Consultation', icon: Calendar },
    { href: '/patient/records', label: 'Medical Records', icon: FileText },
    { href: '/patient/analyzer', label: 'AI Report Analyser', icon: Activity },
    { href: '/patient/meditation', label: 'Meditation Space', icon: Sparkles },
    { href: '/patient/breathing', label: 'Breathing Space', icon: Wind },
    { href: '/patient/remedies', label: 'Herb Remedies', icon: BookOpen },
    { href: '/patient/diet', label: 'Ayurvedic Diet', icon: Utensils },
    { href: '/patient/home-remedies', label: 'Home Remedies', icon: HomeIcon },
    { href: '/patient/yoga', label: 'Yoga Guide', icon: Flame },
    { href: '/patient/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] flex text-slate-850">
      
      {/* Sidebar */}
      <aside className="w-68 bg-white border-r border-zinc-200/50 hidden md:flex flex-col justify-between p-6 shrink-0 sticky top-0 h-screen">
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-zinc-100 pb-5 px-1 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-700 to-primary-600 flex items-center justify-center font-bold text-white shadow-sm">
              <LeafIcon className="w-4.5 h-4.5" />
            </div>
            <span className="font-display font-extrabold text-base tracking-tight text-slate-900">
              Ayur<span className="text-gold-700 font-medium">Care</span>
            </span>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
                    active
                      ? 'bg-primary-50/70 text-primary-800 border-l-2 border-primary-600 rounded-l-none'
                      : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-5 border-t border-zinc-100 shrink-0 space-y-4">
          <div className="px-2 text-xs text-slate-700 font-bold uppercase tracking-wider block">
            <span className="block truncate text-slate-800">{user.name}</span>
            {user.status && (
              <span className="text-[10px] text-primary-700 block mt-0.5 font-bold uppercase">
                {user.status} account
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 hover:border-rose-200 border border-transparent font-bold rounded-xl transition-premium flex items-center justify-center text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area with header */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top workspace navbar */}
        <header className="h-16 border-b border-zinc-200/50 bg-white/70 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>AyurCare Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary-800 capitalize tracking-normal font-extrabold text-xs">
              {pathname.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative transition-colors cursor-pointer">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <Bell className="w-4 h-4" />
            </button>
            
            <div className="h-6 w-px bg-zinc-200"></div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-700 to-primary-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline-block truncate max-w-[120px]">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic page content container */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
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

