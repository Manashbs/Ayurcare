'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert, Clock, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SecureMeetRedirect() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [errorTitle, setErrorTitle] = useState('Consultation Encryption Error');
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduledTimeStr, setScheduledTimeStr] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setErrorMsg('You must be logged in to join this encrypted Google Meet room.');
      setLoading(false);
      return;
    }

    const verifyAccess = async () => {
      try {
        const endpoint = user.role === 'DOCTOR' 
          ? `/api/doctor/consultations/${appointmentId}` 
          : `/api/patient/appointments`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          let isParticipant = false;
          let scheduledAt: Date | null = null;

          if (user.role === 'DOCTOR') {
            const appt = json.appointment;
            if (appt?.doctorId === user.id) {
              isParticipant = true;
              scheduledAt = new Date(appt.scheduledAt);
            }
          } else if (user.role === 'PATIENT') {
            const foundAppt = json.appointments?.find((a: any) => a.id === appointmentId);
            if (foundAppt && foundAppt.patientId === user.id) {
              isParticipant = true;
              scheduledAt = new Date(foundAppt.scheduledAt);
            }
          }

          if (!isParticipant) {
            setErrorTitle('Access Denied');
            setErrorMsg('You are not authorized to join this encrypted consultation room.');
            setLoading(false);
            return;
          }

          // Enforce 1 hour 30 minute strict time window
          if (scheduledAt) {
            const now = new Date();
            const start = scheduledAt.getTime();
            const end = start + 90 * 60 * 1000; // 1 hour 30 minutes in ms

            setScheduledTimeStr(scheduledAt.toLocaleString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }));

            if (now.getTime() < start) {
              setErrorTitle('Meeting Room Locked');
              setErrorMsg(`This consultation opens strictly at its scheduled start time.`);
              setLoading(false);
              return;
            }

            if (now.getTime() > end) {
              setErrorTitle('Consultation Session Expired');
              setErrorMsg('The 1 hour 30 minute consultation window for this appointment has concluded.');
              setLoading(false);
              return;
            }
          }

          // Redirect to meeting interface
          if (user.role === 'DOCTOR') {
            router.replace(`/doctor/consultations/${appointmentId}`);
          } else {
            router.replace(`/patient/consultations/${appointmentId}`);
          }
        } else {
          setErrorMsg('Verification failed or consultation does not exist.');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to establish secure handshake connection.');
        setLoading(false);
      }
    };

    verifyAccess();
  }, [user, authLoading, appointmentId, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Validating Encrypted Time-Window & Handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        {errorTitle.includes('Locked') ? (
          <Lock className="w-12 h-12 text-gold-500 mx-auto animate-bounce" />
        ) : (
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        )}
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-100">{errorTitle}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMsg}
          </p>
          {scheduledTimeStr && (
            <div className="mt-3 inline-flex items-center text-xs font-bold text-gold-400 bg-gold-950/40 border border-gold-800/40 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Scheduled: {scheduledTimeStr} (1:30 Hr Window)
            </div>
          )}
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/50 text-[10px] text-slate-500 font-mono text-left space-y-1">
          <div>Handshake status: STRICT TIME LOCK ENFORCED</div>
          <div>Security protocol: AES-256 Google Meet Gateway</div>
          <div>Session Limit: Max 1h 30m</div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-primary-400 hover:text-primary-300 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
