'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecureMeetRedirect() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setErrorMsg('You must be logged in to join this secure meet room.');
      setLoading(false);
      return;
    }

    const verifyAccess = async () => {
      try {
        // Fetch appointment details using the doctor or patient consultation fetch (or appointments fetch)
        const endpoint = user.role === 'DOCTOR' 
          ? `/api/doctor/consultations/${appointmentId}` 
          : `/api/patient/appointments`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          let isParticipant = false;

          if (user.role === 'DOCTOR') {
            const docId = json.appointment?.doctorId;
            if (docId === user.id) {
              isParticipant = true;
              router.replace(`/doctor/consultations/${appointmentId}`);
            }
          } else if (user.role === 'PATIENT') {
            const foundAppt = json.appointments?.find((a: any) => a.id === appointmentId);
            if (foundAppt && foundAppt.patientId === user.id) {
              isParticipant = true;
              router.replace(`/patient/consultations/${appointmentId}`);
            }
          }

          if (!isParticipant) {
            setErrorMsg('Access Denied: You are not authorized to join this encrypted consultation room.');
            setAuthorized(false);
          } else {
            setAuthorized(true);
          }
        } else {
          setErrorMsg('Access Denied: Verification failed or consultation does not exist.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to establish secure handshake connection.');
      } finally {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [user, authLoading, appointmentId, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Establishing Encrypted Handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-100">Consultation Encryption Error</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMsg}
          </p>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/50 text-[10px] text-slate-500 font-mono text-left space-y-1">
          <div>Handshake status: FAILED</div>
          <div>Handshake verification: UNAUTHORIZED</div>
          <div>Tunnel: AES-256 encrypted link</div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-primary-400 hover:text-primary-300 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
