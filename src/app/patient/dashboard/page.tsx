'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, Clock, Video, Heart, AlertCircle, FileText, Plus, BookOpen, Smile, Droplet, Coffee, Activity } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">My Health Space</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user?.name}. Check your dosha status, bookings, and recommendations.</p>
        </div>
        <Link
          href="/patient/doctors"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition duration-200 flex items-center shadow cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Ayurvedic Consult
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Syncing health dashboard...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Left grid blocks (7 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Upcoming Consult */}
            {nextAppt ? (
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
                <div className="space-y-2 z-10">
                  <span className="text-[10px] font-bold bg-gold-600 text-primary-850 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Confirmed consultation
                  </span>
                  <h3 className="font-display text-xl font-bold">Upcoming: {nextAppt.doctor?.user?.name}</h3>
                  <div className="flex items-center space-x-4 text-xs font-semibold text-primary-100">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Link
                  href={`/patient/consultations/${nextAppt.id}`}
                  className="px-5 py-3 bg-gold-600 hover:bg-gold-700 text-primary-850 font-bold rounded-lg transition duration-200 shadow-md text-xs flex items-center justify-center z-10 cursor-pointer text-slate-900"
                >
                  <Video className="w-4 h-4 mr-2" /> Join Video Consultation Room
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">No Consultations Confirmed</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Need customized Ayurvedic prescription support? Book one of our vetted MD specialists.</p>
                  </div>
                </div>
                <Link
                  href="/patient/doctors"
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Schedule Appointment
                </Link>
              </div>
            )}

            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-br from-gold-50/50 to-gold-100/50 border border-gold-200/50 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div className="sm:col-span-3 space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gold-700" /> Consult PrakritiAI Wellness Bot
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Have symptoms or need dietary Pathya-Apathya guidance? Chat with our AI wellness assistant for preliminary recommendations, symptom triaging, and safety checks.
                </p>
              </div>
              <Link
                href="/patient/ai-chat"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs text-center block shadow cursor-pointer"
              >
                Launch Bot Chat
              </Link>
            </div>

            {/* Active Prescriptions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-display font-bold text-lg text-slate-800">My Active Prescriptions</h3>
              </div>
              {activePrescriptions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  No active e-prescriptions assigned.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {activePrescriptions.map((pres: any) => {
                    const medicines = JSON.parse(pres.medicines || '[]');
                    return (
                      <div key={pres.id} className="py-4 flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Formulated by Dr. {pres.doctor?.user?.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Assigned: {new Date(pres.assignedAt).toLocaleDateString()}</span>
                          <div className="mt-2.5 space-y-1">
                            {medicines.map((med: any, idx: number) => (
                              <div key={idx} className="text-xs font-semibold text-slate-600">
                                • <strong className="text-primary-800">{med.name}</strong> - {med.dosage} ({med.frequency}, Anupana: {med.anupana})
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Downloading PDF copy: ${pres.pdfUrl}`)}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg cursor-pointer"
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
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-3">Prakriti Constitution</span>
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-700">
                <Heart className="w-8 h-8 fill-primary-50" />
              </div>

              {records?.pastConsultations && records.pastConsultations[0]?.patient?.doshaType ? (
                <div>
                  <h4 className="font-display font-extrabold text-2xl text-primary-800 tracking-wide">
                    {records.pastConsultations[0].patient.doshaType} DOMINANT
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Your constitution has been mapped. Doctors can consult this profile instantly.
                  </p>
                  <Link
                    href="/patient/quiz"
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 underline mt-4 block cursor-pointer"
                  >
                    Retake Dosha Quiz
                  </Link>
                </div>
              ) : (
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-lg">Prakriti Unassessed</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Map your Vata, Pitta, and Kapha dominance to personalize your treatment plans.
                  </p>
                  <Link
                    href="/patient/quiz"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs mt-5 block shadow cursor-pointer"
                  >
                    Take Prakriti Assessment Quiz
                  </Link>
                </div>
              )}
            </div>

            {/* Wellness Log Tracker Widget */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider text-center">Daily Wellness Log</h3>
              </div>

              {trackerSuccess && (
                <div className="bg-green-50 text-green-700 border border-green-200 p-2.5 rounded-lg text-xs font-bold text-center mb-4">
                  {trackerSuccess}
                </div>
              )}

              <form onSubmit={handleWellnessSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="sleep-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sleep (Hrs)</label>
                    <input
                      id="sleep-inp"
                      type="number"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="water-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Water (Litres)</label>
                    <input
                      id="water-inp"
                      type="number"
                      step="0.1"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="mood-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mood Today</label>
                    <select
                      id="mood-inp"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs bg-white"
                    >
                      <option value="Joyful">Joyful</option>
                      <option value="Good">Good</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Sluggish">Sluggish</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="digestion-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digestion</label>
                    <select
                      id="digestion-inp"
                      value={digestion}
                      onChange={(e) => setDigestion(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs bg-white"
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
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {trackerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
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
