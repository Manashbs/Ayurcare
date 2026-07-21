'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Stethoscope, LayoutDashboard, Calendar, Users, User, LogOut, ShieldCheck } from 'lucide-react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  // Bypass checks for auth pages
  const isDoctorAuth =
    pathname === '/doctor/login' ||
    pathname === '/doctor/signup' ||
    pathname === '/doctor/pending' ||
    pathname === '/doctor/verify-otp' ||
    pathname === '/doctor/forgot-password' ||
    pathname === '/doctor/reset-password';

  if (isDoctorAuth) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-primary-800 font-semibold">
        Verifying Practitioner Credentials...
      </div>
    );
  }

  // Redirect to login if not logged in or not a doctor
  if (!user || user.role !== 'DOCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-red-600 font-bold p-6 text-center">
        Access Denied: Physician Credentials Required.
      </div>
    );
  }

  // If doctor is pending, they shouldn't access dashboard (middleware handles this too)
  if (user.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-yellow-800 font-semibold p-6 text-center">
        Your registration credentials vetting is in progress. Please check back shortly.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream text-foreground font-sans" id="doctor-workspace">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary-800 text-white flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 text-gold-100">
            <Stethoscope className="w-7 h-7" />
            <span className="font-display font-bold text-lg tracking-wide">AyurCare Clinic</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 flex flex-col text-sm font-semibold text-primary-100">
            <Link
              href="/doctor/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-700 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Today's Queue</span>
            </Link>
            <Link
              href="/doctor/schedule"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-700 hover:text-white transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Availability Slots</span>
            </Link>
            <Link
              href="/doctor/patients"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-700 hover:text-white transition"
            >
              <Users className="w-4 h-4" />
              <span>Patient Directory</span>
            </Link>
            <Link
              href="/doctor/profile"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-700 hover:text-white transition"
            >
              <User className="w-4 h-4" />
              <span>Practice Profile</span>
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-primary-700 mt-6 space-y-4">
          <div className="text-xs text-primary-200 font-semibold uppercase tracking-wider block">
            {user.name}
            <span className="text-[10px] text-gold-100 block mt-0.5 font-bold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Vetted Practitioner
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-primary-700 hover:bg-primary-900 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center text-sm cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-cream-dark/20 p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
