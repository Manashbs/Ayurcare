'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Users, Heart, Phone, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DoctorPatientsDirectory() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/appointments');
      if (res.ok) {
        const json = await res.json();
        // Extract unique patient profiles from appointments list
        const uniquePatientsMap: { [id: string]: any } = {};
        json.appointments.forEach((appt: any) => {
          const pat = appt.patient;
          if (pat && !uniquePatientsMap[pat.userId]) {
            uniquePatientsMap[pat.userId] = {
              id: pat.userId,
              name: pat.user?.name,
              email: pat.user?.email,
              phone: pat.user?.phone,
              doshaType: pat.doshaType || 'Not calculated',
              gender: pat.gender || 'N/A',
              allergies: pat.allergies || 'None',
              chronicConditions: pat.chronicConditions || 'None',
              lastAppointmentId: appt.id,
              lastAppointmentDate: appt.scheduledAt,
            };
          }
        });
        setPatients(Object.values(uniquePatientsMap));
      }
    } catch (e) {
      console.error('Failed to load patients list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((pat) => {
    const term = searchTerm.toLowerCase();
    const name = pat.name?.toLowerCase() || '';
    const email = pat.email?.toLowerCase() || '';
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">Patient Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Review profiles and consulting timelines of patients who have booked you.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Vetting patient directory records...</span>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-400 shadow-sm">
          <Users className="w-12 h-12 mx-auto text-slate-200 mb-4" />
          <h3 className="font-bold text-lg text-slate-700">No Patients Registered</h3>
          <p className="text-xs mt-1">Only patients who have scheduled bookings with you are shown in this roster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((pat) => (
            <div key={pat.id} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {pat.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{pat.name}</h4>
                    <span className="text-xs text-slate-400 font-semibold">{pat.email}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-50 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Prakriti Type</span>
                    <span className="text-primary-700 font-bold bg-primary-50 px-2 rounded uppercase">{pat.doshaType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Allergies</span>
                    <span className="text-slate-750 font-semibold truncate max-w-[150px]">{pat.allergies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Conditions</span>
                    <span className="text-slate-750 font-semibold truncate max-w-[150px]">{pat.chronicConditions}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-55 mt-6 pt-4 flex items-center justify-between border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-bold flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Last: {new Date(pat.lastAppointmentDate).toLocaleDateString()}
                </span>
                <Link
                  href={`/doctor/consultations/${pat.lastAppointmentId}`}
                  className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center"
                >
                  Open 360 Records <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
