'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, Clock, Video, Heart, AlertCircle, FileText, Plus, BookOpen, Smile, Droplet, Coffee, Activity, Sparkles } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Wellness Tracker log states
  const [sleepHours, setSleepHours] = useState('7');
  const [waterIntake, setWaterIntake] = useState('2.5');
  const [mood, setMood] = useState('Good');
  const [digestion, setDigestion] = useState('Normal');
  const [trackerLogs, setTrackerLogs] = useState<any[]>([]);
  const [trackerSuccess, setTrackerSuccess] = useState('');
  const [trackerLoading, setTrackerLoading] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch appointments
      const apptRes = await fetch('/api/patient/appointments');
      if (apptRes.ok) {
        const json = await apptRes.json();
        setAppointments(json.appointments);
      }

      // 2. Fetch medical records (prescriptions + reports)
      const recordsRes = await fetch('/api/patient/records');
      if (recordsRes.ok) {
        const json = await recordsRes.json();
        setRecords(json);
      }

      // 3. Fetch wellness logs
      const logsRes = await fetch('/api/patient/wellness');
      if (logsRes.ok) {
        const json = await logsRes.json();
        setTrackerLogs(json.logs);
      }
    } catch (e) {
      console.error('Failed to sync patient dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWellnessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackerSuccess('');
    setTrackerLoading(true);

    try {
      const res = await fetch('/api/patient/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sleepHours, waterIntake, mood, digestion }),
      });

      if (res.ok) {
        setTrackerSuccess('Wellness log saved!');
        fetchData();
        setTimeout(() => setTrackerSuccess(''), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTrackerLoading(false);
    }
  };

  // Find the next upcoming appointment
  const nextAppt = appointments.find((appt) => appt.status === 'CONFIRMED');

  const activePrescriptions = records?.prescriptions?.filter((p: any) => p.status === 'ACTIVE') || [];
  const reports = records?.labReports || [];

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-slate-800">
      
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Health Overview</h1>
          <p className="text-slate-555 text-xs mt-1">Welcome back, <strong className="text-slate-800 font-bold">{user?.name}</strong>. Monitor your wellness logs, bookings, and active care recommendations.</p>
        </div>
        <Link
          href="/patient/doctors"
          className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center shadow-lg shadow-primary-600/15 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Ayurvedic Consult
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-sm font-medium">Syncing clinical records...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Left grid blocks (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Upcoming Consult */}
            {nextAppt ? (
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
                <div className="space-y-2.5 z-10">
                  <span className="text-[9px] font-bold bg-gold-600 text-primary-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Confirmed Appointment
                  </span>
                  <h3 className="font-display text-lg font-bold">Session with {nextAppt.doctor?.user?.name}</h3>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-primary-100">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Link
                  href={`/patient/consultations/${nextAppt.id}`}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-primary-850 font-bold rounded-xl transition duration-200 shadow-md text-xs flex items-center justify-center z-10 cursor-pointer text-slate-900 shrink-0"
                >
                  <Video className="w-4 h-4 mr-2 text-primary-700" /> Join Consultation Room
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow flex flex-col sm:flex-row items-center justify-between gap-6 hover-glow transition-premium">
                <div className="flex items-start space-x-4">
                  <div className="p-3.5 bg-slate-50 border border-zinc-100 rounded-xl text-slate-450">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-slate-800">No Consultations Confirmed</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">Need custom pathya-apathya or herbal prescriptions? Access our vetted telemedicine clinic.</p>
                  </div>
                </div>
                <Link
                  href="/patient/doctors"
                  className="px-4 py-2.5 border border-zinc-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer hover:border-primary-600/30"
                >
                  Schedule Appointment
                </Link>
              </div>
            )}

            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-br from-gold-50/50 to-gold-100/50 border border-gold-200/40 rounded-2xl p-6 premium-shadow grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div className="sm:col-span-3 space-y-2">
                <h3 className="font-display text-base font-bold text-slate-805 flex items-center">
                  <Activity className="w-4.5 h-4.5 mr-2 text-gold-700 animate-pulse" /> PrakritiAI Wellness Companion
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Experiencing health issues or need lifestyle dietary advice? Ask our Ayurvedic triage chatbot for home remedies and custom wellness suggestions.
                </p>
              </div>
              <Link
                href="/patient/ai-chat"
                className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs text-center block shadow cursor-pointer transition shrink-0"
              >
                Launch Bot Chat
              </Link>
            </div>

            {/* Active Prescriptions */}
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow">
              <div className="border-b border-zinc-100 pb-4 mb-4 flex justify-between items-center">
                <h3 className="font-display font-bold text-base text-slate-800">My Active Prescriptions</h3>
                <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Verified e-prescriptions
                </span>
              </div>
              {activePrescriptions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-200" />
                  <p>No active formulations found.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {activePrescriptions.map((pres: any) => {
                    const medicines = JSON.parse(pres.medicines || '[]');
                    return (
                      <div key={pres.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Formulated by Dr. {pres.doctor?.user?.name}</h4>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Assigned on {new Date(pres.assignedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                            {medicines.map((med: any, idx: number) => (
                              <div key={idx} className="text-xs text-slate-600">
                                • <strong className="text-primary-850 font-bold">{med.name}</strong> – {med.dosage} ({med.frequency}, Anupana: {med.anupana})
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Downloading PDF copy: ${pres.pdfUrl}`)}
                          className="px-3.5 py-2 border border-zinc-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl cursor-pointer hover:border-slate-350 shrink-0"
                        >
                          Download PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sidebar blocks (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Dosha Quiz Card */}
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow text-center relative overflow-hidden group">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">Prakriti Constitution</span>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-700 group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 fill-primary-50 text-primary-600" />
              </div>
              {records?.profile?.doshaType || (records?.pastConsultations && records.pastConsultations[0]?.patient?.doshaType) ? (
                <div>
                  <h4 className="font-display font-extrabold text-2xl text-primary-850 tracking-wide">
                    {records?.profile?.doshaType || records.pastConsultations[0].patient.doshaType} DOMINANT
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Your constitution has been mapped. Doctors can consult this profile instantly for personalized treatment plans.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <Link
                      href={`/patient/remedies?dosha=${(records?.profile?.doshaType || records.pastConsultations[0].patient.doshaType || '').split('_')[0]}`}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg block transition cursor-pointer"
                    >
                      Browse {(records?.profile?.doshaType || records.pastConsultations[0].patient.doshaType || '').split('_')[0]} Herbs
                    </Link>
                    <Link
                      href="/patient/quiz"
                      className="text-[11px] font-bold text-primary-600 hover:text-primary-700 underline block cursor-pointer pt-1"
                    >
                      Retake Prakriti Assessment Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-lg">Prakriti Unassessed</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Map your Vata, Pitta, and Kapha dominance to personalize your treatment plans.
                  </p>
                  <Link
                    href="/patient/quiz"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs mt-5 block shadow cursor-pointer transition"
                  >
                    Take Prakriti Assessment Quiz
                  </Link>
                </div>
              )}
            </div>

            {/* Wellness Log Tracker Widget */}
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow">
              <div className="border-b border-zinc-100 pb-3.5 mb-4 text-center">
                <h3 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-widest">Daily Wellness Log</h3>
              </div>

              {trackerSuccess && (
                <div className="bg-emerald-50 text-emerald-850 border border-emerald-100 p-2.5 rounded-xl text-xs font-bold text-center mb-4">
                  {trackerSuccess}
                </div>
              )}

              <form onSubmit={handleWellnessSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="sleep-inp" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sleep (Hrs)</label>
                    <input
                      id="sleep-inp"
                      type="number"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200/80 bg-white text-slate-805 text-xs focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600/35 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="water-inp" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Water (Litres)</label>
                    <input
                      id="water-inp"
                      type="number"
                      step="0.1"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200/80 bg-white text-slate-805 text-xs focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600/35 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="mood-inp" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mood Today</label>
                    <select
                      id="mood-inp"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200/80 bg-white text-slate-805 text-xs bg-white focus:border-primary-600 focus:outline-none"
                    >
                      <option value="Joyful">Joyful</option>
                      <option value="Good">Good</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Sluggish">Sluggish</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="digestion-inp" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Digestion</label>
                    <select
                      id="digestion-inp"
                      value={digestion}
                      onChange={(e) => setDigestion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200/80 bg-white text-slate-805 text-xs bg-white focus:border-primary-600 focus:outline-none"
                    >
                      <option value="Strong">Strong</option>
                      <option value="Normal">Normal</option>
                      <option value="Bloated">Bloated / Gas</option>
                      <option value="Weak">Weak</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackerLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center disabled:opacity-50 shadow-sm"
                >
                  {trackerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Submit Daily Log
                </button>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
