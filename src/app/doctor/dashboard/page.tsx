'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Calendar, Clock, Video, User, Star, CreditCard, ChevronRight, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Statistics
  const [todayBookings, setTodayBookings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [rating, setRating] = useState(4.9);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/appointments');
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.appointments);

        // Aggregate statistics
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppts = json.appointments.filter((appt: any) => {
          const apptDate = new Date(appt.scheduledAt).toISOString().split('T')[0];
          return apptDate === todayStr;
        });
        setTodayBookings(todayAppts.length);

        // Calculate earnings (sum of completed feePaid)
        const completed = json.appointments.filter((appt: any) => appt.status === 'COMPLETED');
        const earnings = completed.reduce((sum: number, appt: any) => sum + appt.feePaid, 0);
        setMonthEarnings(earnings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'CONFIRMED') return 'bg-emerald-50 border border-emerald-250 text-emerald-700';
    if (status === 'COMPLETED') return 'bg-blue-50 border border-blue-200 text-blue-700';
    if (status === 'CANCELLED') return 'bg-rose-50 border border-rose-200 text-rose-700';
    return 'bg-zinc-50 border border-zinc-200 text-zinc-650';
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-850 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Today's Practice</h1>
          <p className="text-slate-500 text-xs mt-1">Namaste, Dr. <strong className="text-slate-700 font-bold">{user?.name}</strong>. Review your consulting agenda and client records.</p>
        </div>
        <div className="bg-white border border-zinc-200/60 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 flex items-center space-x-4 premium-shadow hover-glow transition-premium">
          <div className="p-3.5 bg-primary-50 rounded-xl text-primary-700 border border-primary-100/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's Schedule</span>
            <span className="text-xl font-black text-slate-800">{todayBookings} Bookings</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 flex items-center space-x-4 premium-shadow hover-glow transition-premium">
          <div className="p-3.5 bg-gold-50 rounded-xl text-gold-700 border border-gold-100/50">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Earnings</span>
            <span className="text-xl font-black text-slate-800">₹{monthEarnings}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 flex items-center space-x-4 premium-shadow hover-glow transition-premium">
          <div className="p-3.5 bg-primary-50 rounded-xl text-primary-700 border border-primary-100/50">
            <Star className="w-5 h-5 fill-primary-600 text-primary-650" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Patient Rating</span>
            <span className="text-xl font-black text-slate-800">{rating} / 5.0</span>
          </div>
        </div>
      </section>

      {/* Consultation queue */}
      <section className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow">
        <div className="border-b border-zinc-100 pb-4 mb-6">
          <h3 className="font-display font-bold text-base text-slate-850">Patient Queue</h3>
          <p className="text-xs text-slate-400 mt-1">Select any confirmed patient session below to enter the live room.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 font-semibold flex items-center justify-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-sm font-medium">Syncing scheduler data...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-slate-405 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-200" />
            <h4 className="font-bold text-sm text-slate-700">No Consultations Set</h4>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">Update your calendar slots in Availability menu to receive booking alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {appointments.map((appt) => {
              const patientName = appt.patient?.user?.name || 'Patient';
              const patientGender = appt.patient?.gender || 'N/A';
              const dosha = appt.patient?.doshaType || 'Not Assessed';
              const time = new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={appt.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-premium">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 flex items-center">
                        {patientName}
                        {appt.familyMember && (
                          <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded ml-2">
                            Relation: {appt.familyMember.relation}
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-450 mt-1 font-medium items-center">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {time}</span>
                        <span>Gender: {patientGender}</span>
                        <span className="text-[10px] text-primary-700 font-extrabold bg-primary-50/70 border border-primary-100/50 px-2 py-0.5 rounded-full">Dosha: {dosha}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase ${getStatusBadgeClass(appt.status)}`}>
                      {appt.status}
                    </span>
                    
                    {appt.status === 'CONFIRMED' ? (
                      <Link
                        href={`/doctor/consultations/${appt.id}`}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-md shadow-primary-600/10 transition-premium flex items-center justify-center cursor-pointer"
                      >
                        Start Session <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    ) : appt.status === 'COMPLETED' ? (
                      <Link
                        href={`/doctor/consultations/${appt.id}`}
                        className="px-4 py-2 border border-zinc-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-lg transition-premium hover:border-slate-350"
                      >
                        Clinical Record
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-100 text-slate-405 text-xs font-bold rounded-lg cursor-not-allowed border border-slate-200/50"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
