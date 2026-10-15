'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock, Plus, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';

interface AvailabilitySlots {
  [day: string]: string[];
}

export default function DoctorScheduleManager() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Weekly availability slots
  const [schedule, setSchedule] = useState<AvailabilitySlots>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [activeDay, setActiveDay] = useState('Monday');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('13:00');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/profile');
      if (res.ok) {
        const json = await res.json();
        const profile = json.user?.doctorProfile || {};
        if (profile.availability) {
          const parsed = JSON.parse(profile.availability);
          if (parsed.recurring) {
            // Merge loaded schedule, ensuring all days exist
            const merged = {
              Monday: parsed.recurring.Monday || [],
              Tuesday: parsed.recurring.Tuesday || [],
              Wednesday: parsed.recurring.Wednesday || [],
              Thursday: parsed.recurring.Thursday || [],
              Friday: parsed.recurring.Friday || [],
              Saturday: parsed.recurring.Saturday || [],
              Sunday: parsed.recurring.Sunday || [],
            };
            setSchedule(merged);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load doctor schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = `${newSlotStart}-${newSlotEnd}`;
    
    // Check duplicates
    if (schedule[activeDay].includes(newSlot)) {
      setErrorMsg('This time slot is already added.');
      return;
    }

    const updated = { ...schedule };
    updated[activeDay] = [...updated[activeDay], newSlot].sort();
    setSchedule(updated);
    setSuccessMsg(`Added slot for ${activeDay}. Remember to Save Changes.`);
    setErrorMsg('');
  };

  const handleRemoveSlot = (day: string, slotIdx: number) => {
    const updated = { ...schedule };
    updated[day] = updated[day].filter((_, idx) => idx !== slotIdx);
    setSchedule(updated);
    setSuccessMsg(`Removed slot for ${day}. Remember to Save Changes.`);
  };

  const handleSaveSchedule = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: {
            recurring: schedule,
            exceptions: [],
          },
        }),
      });

      if (res.ok) {
        setSuccessMsg('Your weekly consulting slots have been saved successfully!');
      } else {
        setErrorMsg('Failed to save changes. Please try again.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">Availability Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Set your weekly recurring hours so patients can book you.</p>
        </div>
        <button
          onClick={handleSaveSchedule}
          disabled={actionLoading}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-200 flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 text-sm"
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Loading availability profiles...</span>
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Day Picker */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-3">Weekly Schedule</span>
            {Object.keys(schedule).map((day) => {
              const count = schedule[day].length;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setActiveDay(day);
                    setErrorMsg('');
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left text-sm font-bold flex justify-between items-center transition cursor-pointer ${
                    activeDay === day 
                      ? 'bg-primary-50 text-primary-800 border-l-4 border-primary-600' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    count > 0 ? 'bg-primary-600 text-white font-bold' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count} {count === 1 ? 'slot' : 'slots'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slots Configuration */}
          <div className="lg:col-span-8 space-y-6">
            {/* Add Slot Form */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Add Time Slot for {activeDay}</h3>
              <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <label htmlFor="slot-start" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                  <input
                    id="slot-start"
                    type="time"
                    required
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="slot-end" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                  <input
                    id="slot-end"
                    type="time"
                    required
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm flex items-center space-x-2 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Slot</span>
                </button>
              </form>
            </div>

            {/* List Active slots */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Active Slots on {activeDay}</h3>
              {schedule[activeDay].length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Clock className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  No consultation slots configured for {activeDay}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schedule[activeDay].map((slot, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/60 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" /> {slot}
                      </span>
                      <button
                        onClick={() => handleRemoveSlot(activeDay, idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
