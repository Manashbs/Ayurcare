'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export default function DoctorPending() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not logged in or not a doctor, redirect
    if (!user) {
      router.push('/doctor/login');
      return;
    }
    if (user.role !== 'DOCTOR') {
      router.push('/');
      return;
    }
    // If approved, redirect to dashboard
    if (user.status === 'ACTIVE') {
      router.push('/doctor/dashboard');
    }
  }, [user, router]);

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream p-6" id="doctor-pending-page">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

        <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-600">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-800">Verification Pending</h2>
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-xs font-semibold my-6 flex items-start text-left">
          <ShieldAlert className="w-5 h-5 mr-2.5 flex-shrink-0 text-gold-600" />
          <span>
            Your medical license registration and credentials have been submitted for verification. Under VedaSync security guidelines, all practitioners must be vetted by our Admin team before consulting patients.
          </span>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          We will review your registration details and documents shortly. You will receive an email confirmation once your profile is approved.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-250 cursor-pointer shadow-md text-sm"
          >
            Check Status Now
          </button>
          
          <button
            onClick={logout}
            className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition duration-200 flex items-center justify-center cursor-pointer text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout from Portal
          </button>
        </div>
      </div>
    </main>
  );
}
