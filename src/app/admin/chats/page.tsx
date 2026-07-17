'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, FileText, ArrowLeft, MessageSquare, Clock, User, Heart } from 'lucide-react';

export default function FlaggedChatsReviewer() {
  const [flaggedSessions, setFlaggedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const fetchFlaggedSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/chats');
      if (res.ok) {
        const json = await res.json();
        setFlaggedSessions(json.flaggedSessions);
      }
    } catch (e) {
      console.error('Failed to load flagged chats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedSessions();
  }, []);

  if (selectedSession) {
    const messages = JSON.parse(selectedSession.messages || '[]');
    const patientName = selectedSession.patient?.user?.name || 'Patient';
    const patientDosha = selectedSession.patient?.doshaType || 'Not Evaluated';

    return (
      <div className="space-y-6 animate-fadeIn text-slate-100">
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setSelectedSession(null)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">Review Flagged Conversation</h1>
            <p className="text-slate-400 text-xs mt-0.5">Session Ref ID: {selectedSession.id}</p>
          </div>
        </div>

        {/* Patient detail banner */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-red-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-xs uppercase">Subject</span>
              <strong className="text-white">{patientName}</strong>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-xs uppercase">Prakriti Dosha</span>
              <strong className="text-white">{patientDosha}</strong>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-xs uppercase font-sans">Flagged Time</span>
              <strong className="text-white">{new Date(selectedSession.createdAt).toLocaleString()}</strong>
            </div>
          </div>
        </section>

        {/* Chat History */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {messages.map((msg: any, idx: number) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl p-4 text-xs font-semibold leading-relaxed ${
                  isUser 
                    ? 'bg-red-950/40 border border-red-900/50 text-red-200 rounded-br-none' 
                    : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-bl-none'
                }`}>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    {isUser ? patientName : 'PrakritiAI (Bot)'}
                  </span>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Safety Disclaimer */}
        <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-5 text-xs font-semibold text-red-300 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>System Security Clearance Log</strong>
            <p className="leading-relaxed">
              This conversation was auto-flagged because the patient described acute symptoms or self-harm keywords. This log is reviewable by authorized administrative staff only for safety auditing and physician dispatch monitoring.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Flagged AI Conversations</h1>
        <p className="text-slate-400 text-sm mt-1">Audit logs of bot sessions flagged due to acute symptom or emergency triggers.</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Vetting chat indices...</span>
        </div>
      ) : flaggedSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="font-bold text-lg text-white">No Flagged Sessions</h3>
          <p className="text-sm mt-1">No AI chat logs flagged for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flaggedSessions.map((session) => (
            <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-200">{session.patient?.user?.name || 'Patient'}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{session.patient?.user?.email}</span>
                  </div>
                  <span className="bg-red-950 border border-red-900 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Flagged
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <p className="line-clamp-2 italic text-slate-400">
                    <strong className="text-slate-500 font-semibold not-italic">First Prompt Summary:</strong> "{session.summary || 'Describe query'}"
                  </p>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Triggered: {new Date(session.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-6 pt-4">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center justify-center cursor-pointer transition border border-slate-750"
                >
                  <FileText className="w-4 h-4 mr-2" /> Inspect Conversation Log
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
