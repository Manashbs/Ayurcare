'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Star, ShieldCheck, Calendar, Clock, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FindAndBookDoctor() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  // Booking details modal
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [apptType, setApptType] = useState<'CHAT' | 'AUDIO' | 'VIDEO'>('VIDEO');
  
  // Create a calendar selector: today or next 3 days
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/doctors');
      if (res.ok) {
        const json = await res.json();
        setDoctors(json.doctors);
      }
    } catch (e) {
      console.error('Failed to load doctors directory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Set date choices: today + next 3 days
  const dateOptions = Array.from({ length: 4 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    return {
      isoString: d.toISOString().split('T')[0],
      displayString: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  useEffect(() => {
    if (selectedDoctor) {
      // Set default selected date
      setSelectedDate(dateOptions[0].isoString);

      // Parse availability slots if configured
      let slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      const profile = selectedDoctor.doctorProfile || {};
      if (profile.availability) {
        try {
          const parsed = JSON.parse(profile.availability);
          const recurring = parsed.recurring || {};
          // Get weekday name
          const dateObj = new Date(selectedDate || dateOptions[0].isoString);
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const daySlots = recurring[weekday];
          if (daySlots && daySlots.length > 0) {
            // daySlots is like ["09:00-13:00", "14:00-18:00"]
            // Split into hour intervals
            const compiled: string[] = [];
            daySlots.forEach((range: string) => {
              const [start, end] = range.split('-');
              const startHr = parseInt(start.split(':')[0]);
              const endHr = parseInt(end.split(':')[0]);
              for (let h = startHr; h < endHr; h++) {
                compiled.push(`${String(h).padStart(2, '0')}:00`);
              }
            });
            slots = compiled;
          }
        } catch (e) {}
      }
      setAvailableSlots(slots);
      setSelectedTimeSlot(slots[0] || '');
    }
  }, [selectedDoctor, selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot || !selectedDate) {
      setBookingError('Please choose a date and time slot.');
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    const scheduledAt = new Date(`${selectedDate}T${selectedTimeSlot}:00`).toISOString();

    try {
      const res = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          scheduledAt,
          type: apptType,
          feePaid: selectedDoctor.doctorProfile?.feePerConsult || 500,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setBookingSuccess('Checkout complete! Consultation scheduled.');
        setTimeout(() => {
          setSelectedDoctor(null);
          router.push('/patient/dashboard');
        }, 1500);
      } else {
        setBookingError(data.error || 'Failed to complete booking.');
      }
    } catch (err) {
      setBookingError('Connection error.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = doc.name?.toLowerCase().includes(term) || 
                          doc.doctorProfile?.specializations?.toLowerCase().includes(term);
    const matchesSpec = specFilter === '' || doc.doctorProfile?.specializations?.includes(specFilter);
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 font-sans" id="find-doctors-page">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-850">Book a Consultation</h1>
        <p className="text-slate-500 text-sm mt-1">Consult certified Ayurvedic physicians online via secure video call.</p>
      </div>

      {/* Filters */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-100 rounded-xl p-5 shadow-sm items-end">
        <div className="space-y-2">
          <label htmlFor="search-inp" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Doctor / Specialty</label>
          <div className="relative">
            <input
              id="search-inp"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dr. Sharma, Panchakarma..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="spec-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</label>
          <select
            id="spec-select"
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm bg-white"
          >
            <option value="">All Specialities</option>
            <option value="Kayachikitsa">Kayachikitsa (General Medicine)</option>
            <option value="Panchakarma">Panchakarma (Detoxification)</option>
            <option value="Shalya Tantra">Shalya Tantra (Surgery)</option>
          </select>
        </div>
      </section>

      {/* Doctor directory grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Vetting doctor database...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-400 shadow-sm">
          <h3 className="font-bold text-lg text-slate-700">No Doctors Found</h3>
          <p className="text-xs mt-1">Try relaxing your search terms or specialization filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const profile = doc.doctorProfile || {};
            return (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display font-bold text-lg text-slate-850">{doc.name}</h3>
                    <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{profile.qualification}</span>
                  
                  <div className="flex items-center space-x-1 text-gold-600 mt-1">
                    <Star className="w-4 h-4 fill-gold-600" />
                    <span className="text-xs font-bold text-slate-700">{profile.avgRating || '4.8'}</span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div>
                      <strong className="text-slate-800">Specialities:</strong> {profile.specializations}
                    </div>
                    <div>
                      <strong className="text-slate-800">Experience:</strong> {profile.experienceYears} Years
                    </div>
                    <div>
                      <strong className="text-slate-800">Languages:</strong> {profile.languages}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-[11px] text-slate-400 mt-3 italic line-clamp-3">"{profile.bio}"</p>
                  )}
                </div>

                <div className="border-t border-slate-50 mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee per consult</span>
                    <strong className="text-xl font-extrabold text-slate-800">₹{profile.feePerConsult}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Select Slots
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Scheduling Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl border border-slate-100 max-w-md w-full p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

            <h3 className="font-display text-xl font-bold text-slate-800">Schedule: {selectedDoctor.name}</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
              Consult Fee: ₹{selectedDoctor.doctorProfile?.feePerConsult || 500}
            </span>

            {bookingSuccess && (
              <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg text-xs font-bold text-center mt-4">
                {bookingSuccess}
              </div>
            )}
            {bookingError && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-bold text-center mt-4 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
              {/* Consult type */}
              <div>
                <label htmlFor="appt-type" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Consultation Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CHAT', 'AUDIO', 'VIDEO'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setApptType(type)}
                      className={`py-2 text-xs font-bold border rounded-lg transition cursor-pointer ${
                        apptType === type 
                          ? 'bg-primary-50 border-primary-600 text-primary-800 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label htmlFor="appt-date" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
                <div className="grid grid-cols-2 gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.isoString}
                      type="button"
                      onClick={() => setSelectedDate(opt.isoString)}
                      className={`py-2 px-1 text-xs font-bold border rounded-lg transition cursor-pointer ${
                        selectedDate === opt.isoString 
                          ? 'bg-primary-50 border-primary-600 text-primary-800 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.displayString}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label htmlFor="appt-slot" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Slots</label>
                {availableSlots.length === 0 ? (
                  <div className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                    No consulting hours slots available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 text-xs font-bold border rounded-lg transition cursor-pointer ${
                          selectedTimeSlot === slot 
                            ? 'bg-primary-50 border-primary-600 text-primary-800 shadow-sm' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment disclaimer */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                Stripe payment simulator will authorize <strong>₹{selectedDoctor.doctorProfile?.feePerConsult || 500}</strong>. All bookings are protected under the patient refund policies.
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || availableSlots.length === 0}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Authorize & Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
