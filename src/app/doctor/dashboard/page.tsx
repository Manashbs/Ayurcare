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
  const [rating, setRating] = useState(4.8);

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
    if (status === 'CONFIRMED') return 'bg-blue-50 border border-blue-200 text-blue-700';
    if (status === 'COMPLETED') return 'bg-green-50 border border-green-200 text-green-700';
    if (status === 'CANCELLED') return 'bg-red-50 border border-red-200 text-red-700';
    return 'bg-slate-50 border border-slate-200 text-slate-700';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">Doctor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user?.name}. Review today's queue and consulting metrics.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
          Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-primary-50 rounded-lg text-primary-700 border border-primary-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Today's Queue</span>
            <span className="text-2xl font-extrabold text-slate-800">{todayBookings} Bookings</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-gold-50 rounded-lg text-gold-700 border border-gold-100">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Practice Earnings</span>
            <span className="text-2xl font-extrabold text-slate-800">₹{monthEarnings}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-4 bg-primary-50 rounded-lg text-primary-700 border border-primary-100">
            <Star className="w-6 h-6 fill-primary-600" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Avg Patient Rating</span>
            <span className="text-2xl font-extrabold text-slate-800">{rating} / 5.0</span>
          </div>
        </div>
      </section>

      {/* Consultation queue */}
      <section className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="font-display font-bold text-lg text-slate-800">Today's Patient Consultations</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">Select a patient card to open the consultation room.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span>Syncing clinic schedules...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h4 className="font-bold text-slate-700">No Appointments Scheduled</h4>
            <p className="text-xs mt-1">Set recurring availability slots to receive consult requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((appt) => {
              const patientName = appt.patient?.user?.name || 'Patient';
              const patientGender = appt.patient?.gender || 'N/A';
              const dosha = appt.patient?.doshaType || 'Not Assessed';
              const time = new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={appt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm">
                      {patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center">
                        {patientName}
                        {appt.familyMember && (
                          <span className="text-[10px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded ml-2 border border-purple-200">
                            Family: {appt.familyMember.relation}
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {time}</span>
                        <span>Gender: {patientGender}</span>
                        <span className="text-primary-700 font-bold bg-primary-50 px-2 rounded">Dosha: {dosha}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${getStatusBadgeClass(appt.status)}`}>
                      {appt.status}
                    </span>
                    
                    {appt.status === 'CONFIRMED' ? (
                      <Link
                        href={`/doctor/consultations/${appt.id}`}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition duration-200 shadow flex items-center justify-center cursor-pointer"
                      >
                        Start Consultation <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    ) : appt.status === 'COMPLETED' ? (
                      <Link
                        href={`/doctor/consultations/${appt.id}`}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition text-center"
                      >
                        View Records
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed"
                      >
                        Inaccessible
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
