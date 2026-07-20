'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Loader2, Video, Send, FileText, ClipboardList, ShieldCheck, Heart, User, Clock, CheckCircle, Calendar, Plus, ExternalLink, Lock } from 'lucide-react';

interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  anupana: string;
  notes?: string;
  price?: number;
}

export default function DoctorConsultationRoom() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);

  // Google Meet & 1:30 hr Timer states
  const [googleMeetUrl, setGoogleMeetUrl] = useState('');
  const [timeLeftStr, setTimeLeftStr] = useState('1h 30m 00s');
  const [isExpired, setIsExpired] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  // Socket.io / Chat states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Tabs: 'history' (Patient 360), 'prescription' (E-Rx Builder), 'notes' (Clinical Notes & Followup)
  const [activeTab, setActiveTab] = useState<'history' | 'prescription' | 'notes'>('history');

  // E-Prescription Builder states
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<MedicineItem[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('7 days');
  const [anupana, setAnupana] = useState('Warm water');
  const [medNotes, setMedNotes] = useState('');

  const [dietInstructions, setDietInstructions] = useState('');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('');
  
  // Clinical Notes states
  const [notes, setNotes] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const [savingLoading, setSavingLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Follow-up meeting scheduling states
  const [followupDate, setFollowupDate] = useState('');
  const [followupType, setFollowupType] = useState('VIDEO');
  const [schedulingFollowup, setSchedulingFollowup] = useState(false);
  const [followupSuccess, setFollowupSuccess] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConsultationData = async () => {
    try {
      const res = await fetch(`/api/doctor/consultations/${appointmentId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setNotes(json.appointment.consultation?.notes || '');
        setPrivateNotes(json.appointment.consultation?.privateDoctorNotes || '');
        setDiagnosis(json.appointment.consultation?.diagnosis || '');

        // Construct unique Google Meet link for this session
        const meetCode = `ayur-meet-${appointmentId.substring(0, 8)}`;
        setGoogleMeetUrl(`https://meet.google.com/${meetCode}`);
      } else {
        router.push('/doctor/dashboard');
      }

      // Fetch medicine catalog for Rx builder
      const catalogRes = await fetch('/api/admin/catalog');
      if (catalogRes.ok) {
        const json = await catalogRes.json();
        setCatalog(json.medicines);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationData();
  }, [appointmentId]);

  // 1:30 Hr Strict Duration Timer Countdown
  useEffect(() => {
    if (!data?.appointment?.scheduledAt) return;

    const scheduledAt = new Date(data.appointment.scheduledAt).getTime();
    const endWindow = scheduledAt + 90 * 60 * 1000; // 90 minutes

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = endWindow - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeftStr('00h 00m 00s (Session Concluded)');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (!data) return;

    // Connect to Socket.io server for real-time sync
    const socketInstance = io();
    setSocket(socketInstance);

    const doctorName = data.appointment.doctor?.user?.name || 'Doctor';
    const userId = data.appointment.doctorId;

    socketInstance.emit('join-room', {
      roomId: appointmentId,
      userId,
      userName: doctorName,
    });

    setCallConnected(true);

    socketInstance.on('user-joined', ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `System: Patient ${userName} joined the Google Meet session.` }
      ]);
    });

    socketInstance.on('receive-message', (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    socketInstance.on('user-left', () => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `System: Patient left room.` }
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [data]);

  // Stream report edits live to the patient's screen
  useEffect(() => {
    if (socket && callConnected && !loading && !savingLoading) {
      socket.emit('update-report', {
        roomId: appointmentId,
        diagnosis,
        notes,
        dietInstructions,
        lifestyleAdvice,
      });
    }
  }, [diagnosis, notes, dietInstructions, lifestyleAdvice, socket, callConnected, loading, savingLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !data) return;

    socket.emit('send-message', {
      roomId: appointmentId,
      message: chatInput,
      senderId: data.appointment.doctorId,
      senderName: data.appointment.doctor?.user?.name || 'Doctor',
      senderRole: 'DOCTOR',
    });
    setChatInput('');
  };

  const handleAddMedicine = async () => {
    const medName = selectedMed ? selectedMed.name : medSearch;
    if (!medName) return;

    const price = selectedMed?.price || 150.0;

    const newItem: MedicineItem = {
      name: medName,
      dosage,
      frequency,
      duration,
      anupana,
      notes: medNotes,
      price,
    };

    // If meeting is active, add live to patient's cart!
    const isMeetingActive = data?.appointment?.status !== 'COMPLETED' && !isExpired;
    if (isMeetingActive) {
      try {
        const cartRes = await fetch('/api/patient/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: data.appointment.patientId,
            appointmentId,
            name: medName,
            dosage,
            price,
          }),
        });

        if (cartRes.ok) {
          if (socket) {
            socket.emit('add-to-cart', {
              roomId: appointmentId,
              item: newItem,
            });
          }
        }
      } catch (err) {
        console.error('Failed to add live to patient cart:', err);
      }
    }

    setPrescriptionMedicines([...prescriptionMedicines, newItem]);
    setMedSearch('');
    setSelectedMed(null);
    setMedNotes('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== idx));
  };

  const handleSaveConsultation = async () => {
    setSaveSuccess('');
    setSavingLoading(true);

    try {
      const payload: any = {
        notes,
        privateDoctorNotes: privateNotes,
        diagnosis,
      };

      if (prescriptionMedicines.length > 0) {
        payload.prescriptionData = {
          medicines: prescriptionMedicines,
          dietInstructions,
          lifestyleAdvice,
        };
      }

      const res = await fetch(`/api/doctor/consultations/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess('Consultation saved and e-prescription published successfully!');
        setTimeout(() => {
          router.push('/doctor/dashboard');
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLoading(false);
    }
  };

  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    setSchedulingFollowup(true);
    setFollowupSuccess('');

    try {
      const res = await fetch('/api/doctor/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data.appointment.patientId,
          scheduledAt: followupDate,
          type: followupType,
        }),
      });

      if (res.ok) {
        setFollowupSuccess('Follow-up consultation successfully booked! Email notifications dispatched.');
        setFollowupDate('');
      } else {
        const errJson = await res.json();
        setFollowupSuccess(`Error: ${errJson.error || 'Failed to schedule follow-up.'}`);
      }
    } catch (err) {
      setFollowupSuccess('Failed to connect to appointments scheduling API.');
    } finally {
      setSchedulingFollowup(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary-800 bg-cream">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Google Meet consultation workspace...
      </div>
    );
  }

  const patient = data.appointment.patient || {};
  const patientName = patient.user?.name || 'Patient';
  const history = data.patient360 || {};
  const isMeetingEnded = data?.appointment?.status === 'COMPLETED' || isExpired;

  const filteredCatalog = catalog.filter((m) =>
    m.name.toLowerCase().includes(medSearch.toLowerCase())
  );

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh] overflow-hidden font-sans text-slate-800" id="consultation-room">
      
      {/* Left Column: Google Meet Portal Container & Live Chat (7 cols) */}
      <section className="lg:col-span-7 flex flex-col justify-between h-full bg-slate-900 border border-slate-880 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-gold-600 z-10"></div>

        {/* Google Meet Container Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center text-white z-10">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-xs sm:text-sm">Google Meet Encrypted Portal</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gold-400 bg-gold-950/60 px-3 py-1 rounded-full border border-gold-800/40 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> Window: {timeLeftStr}
            </span>
          </div>
        </div>

        {/* Google Meet Embed & Action Box */}
        <div className="flex-1 p-5 bg-slate-950 flex flex-col justify-between relative">
          {!isExpired ? (
            <div className="h-full border border-slate-800 rounded-xl bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Video className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-base">Encrypted Google Meet Room Active</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Consultation with <strong>{patientName}</strong> is ready. Click below to launch your Google Meet video call.
                </p>
              </div>

              <div className="w-full max-w-md bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span className="truncate mr-2">{googleMeetUrl}</span>
                <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-950 px-2 py-0.5 rounded">AES-256</span>
              </div>

              <a
                href={googleMeetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition duration-200 flex items-center cursor-pointer"
              >
                Launch Encrypted Google Meet Room <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          ) : (
            <div className="h-full border border-slate-800 rounded-xl bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
              <Lock className="w-12 h-12 text-red-500" />
              <h4 className="font-bold text-white text-base">1:30 Hour Consultation Window Expired</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                The scheduled time limit for this consultation has concluded. Please save and publish your final report.
              </p>
            </div>
          )}
        </div>

        {/* Live Chat Panel */}
        <div className="h-[40%] flex flex-col justify-between bg-slate-900 border-t border-slate-850 p-4">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar">
            {messages.map((msg, idx) => {
              if (msg.system) {
                return (
                  <div key={idx} className="text-center text-[10px] text-slate-500 font-bold bg-slate-950/20 py-1 rounded">
                    {msg.message}
                  </div>
                );
              }
              const isDoctor = msg.senderRole === 'DOCTOR';
              return (
                <div key={idx} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-xs font-semibold leading-relaxed ${
                    isDoctor 
                      ? 'bg-primary-850 text-white rounded-tr-none border border-primary-800' 
                      : 'bg-slate-955 text-slate-300 rounded-tl-none border border-slate-850'
                  }`}>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-1">{msg.senderName}</span>
                    <p>{msg.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="flex items-center space-x-2 border-t border-slate-800 pt-3 mt-2">
            <input
              type="text"
              required
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send live chat to patient..."
              className="flex-grow px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-slate-500"
            />
            <button
              type="submit"
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* Right Column: Drawer tabs (5 cols) */}
      <section className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-full">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 flex items-center justify-center space-x-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'history' ? 'border-primary-600 text-primary-800 bg-white' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> <span>Patient 360</span>
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`py-3 flex items-center justify-center space-x-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'prescription' ? 'border-primary-600 text-primary-800 bg-white' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> <span>Prescribe & Cart</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 flex items-center justify-center space-x-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'notes' ? 'border-primary-600 text-primary-800 bg-white' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> <span>Report & Follow-up</span>
          </button>
        </div>

        {/* Tab contents (scrollable container) */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[75vh]">
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-bold text-center mb-4 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-1.5" /> {saveSuccess}
            </div>
          )}

          {/* TAB 1: Patient 360 View */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prakriti Analysis</h4>
                <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2.5 text-primary-900 font-bold">
                    <Heart className="w-5 h-5 text-primary-600 fill-primary-600" />
                    <span>Dominant Dosha Baseline</span>
                  </div>
                  <span className="bg-primary-600 text-white font-extrabold px-3 py-1 rounded-lg text-xs uppercase tracking-wide">
                    {history.profile?.doshaType || 'Not Evaluated'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medical Intake Details</h4>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2.5 text-xs">
                  <div><strong>Allergies:</strong> {history.profile?.allergies || 'None reported'}</div>
                  <div><strong>Chronic Conditions:</strong> {history.profile?.chronicConditions || 'None reported'}</div>
                  <div><strong>Gender:</strong> {history.profile?.gender || 'N/A'} | <strong>Blood Group:</strong> {history.profile?.bloodGroup || 'N/A'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symptom Summary (AI Bot)</h4>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs italic text-slate-550 leading-relaxed">
                  {history.aiSessions?.[0]?.summary 
                    ? `"${history.aiSessions[0].summary}"` 
                    : 'No preliminary symptom triage logged.'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Past Consultations</h4>
                {history.appointments?.length <= 1 ? (
                  <div className="text-[11px] text-slate-400 italic">First consult on this platform.</div>
                ) : (
                  <div className="space-y-3">
                    {history.appointments.map((appt: any, idx: number) => {
                      if (appt.id === appointmentId) return null;
                      return (
                        <div key={idx} className="border border-slate-100 rounded-lg p-3 text-xs hover:bg-slate-50">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Dr. {appt.doctor?.user?.name}</span>
                            <span>{new Date(appt.scheduledAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 italic">Diagnosis: {appt.consultation?.diagnosis || 'No record'}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: E-Prescription Builder & Live Cart Pusher */}
          {activeTab === 'prescription' && (
            <div className="space-y-6">
              {isMeetingEnded && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-xl flex items-center">
                  ⚠️ Cart changes locked (consultation ended).
                </div>
              )}

              {/* Added Medicines */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medicines</h4>
                {prescriptionMedicines.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">No medicines added to Rx. Use search below.</div>
                ) : (
                  <div className="space-y-2">
                    {prescriptionMedicines.map((med, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-lg p-3 flex justify-between items-start gap-4">
                        <div className="text-xs space-y-0.5 font-semibold">
                          <strong className="text-primary-850 font-bold block">{med.name}</strong>
                          <div className="text-slate-655">{med.dosage} • {med.frequency} • {med.duration}</div>
                          <div className="text-[10px] text-slate-500 font-bold">Anupana: {med.anupana}</div>
                          {med.notes && <p className="text-[10px] text-slate-400 mt-1 italic">"{med.notes}"</p>}
                        </div>
                        {!isMeetingEnded && (
                          <button
                            onClick={() => handleRemoveMedicine(idx)}
                            className="text-xs text-red-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Medicine form */}
              {!isMeetingEnded && (
                <div className="border border-slate-150 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <h5 className="text-xs font-bold text-primary-800 uppercase tracking-wider">Search & Add Herb</h5>
                  
                  {/* Catalog Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={medSearch}
                      onChange={(e) => {
                        setMedSearch(e.target.value);
                        setSelectedMed(null);
                      }}
                      placeholder="Search Ashwagandha, Triphala..."
                      className="w-full px-3 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                    {medSearch && !selectedMed && filteredCatalog.length > 0 && (
                      <div className="absolute left-0 right-0 bg-white border border-slate-200 mt-1 rounded shadow-lg z-20 max-h-[120px] overflow-y-auto divide-y divide-slate-100 text-xs">
                        {filteredCatalog.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedMed(item);
                              setMedSearch(item.name);
                              setDosage(item.dosage || '1 tablet');
                              setAnupana(item.anupana || 'Warm water');
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100"
                          >
                            {item.name} {item.prescriptionOnly ? '(Rx)' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label htmlFor="med-dose" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Dosage</label>
                      <input
                        id="med-dose"
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="med-anupana" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Anupana (Vehicle)</label>
                      <input
                        id="med-anupana"
                        type="text"
                        value={anupana}
                        onChange={(e) => setAnupana(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label htmlFor="med-freq" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Frequency</label>
                      <input
                        id="med-freq"
                        type="text"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="med-dur" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Duration</label>
                      <input
                        id="med-dur"
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label htmlFor="med-notes" className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Special Instructions</label>
                    <input
                      id="med-notes"
                      type="text"
                      value={medNotes}
                      onChange={(e) => setMedNotes(e.target.value)}
                      placeholder="Take after food..."
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition cursor-pointer flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Prescribe & Add to Patient's Cart Live
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="diet-inst" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dietary Advice (Pathya-Apathya)</label>
                  <textarea
                    id="diet-inst"
                    rows={2}
                    disabled={isMeetingEnded}
                    value={dietInstructions}
                    onChange={(e) => setDietInstructions(e.target.value)}
                    placeholder="Avoid cold/dry food, drink warm ginger tea..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="life-advice" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lifestyle Advice (Vihara)</label>
                  <textarea
                    id="life-advice"
                    rows={2}
                    disabled={isMeetingEnded}
                    value={lifestyleAdvice}
                    onChange={(e) => setLifestyleAdvice(e.target.value)}
                    placeholder="Yoga / Pranayama daily, avoid sleeping during day..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Clinical Notes & Follow-up Meet Scheduler */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Consultation report */}
              <div className="space-y-5 border-b pb-6 border-slate-100">
                <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider">Write Live Consultation Report</h4>
                
                <div>
                  <label htmlFor="diagn-inp" className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Primary Diagnosis / Ailment</label>
                  <input
                    id="diagn-inp"
                    type="text"
                    required
                    disabled={isMeetingEnded}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Gastritis (Amlapitta), Arthritis (Sandhivata)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="notes-inp" className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Patient Consultation Summary (Shared)</label>
                  <textarea
                    id="notes-inp"
                    rows={3}
                    disabled={isMeetingEnded}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Shared consultation summary notes..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="priv-notes-inp" className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Private Clinical Notes (Doctor Only)</label>
                  <textarea
                    id="priv-notes-inp"
                    rows={3}
                    disabled={isMeetingEnded}
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Hidden clinical notes not visible to patient..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Follow-up scheduler */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" /> Book Follow-up Consultation
                </h4>
                
                {followupSuccess && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                    followupSuccess.includes('Error') 
                      ? 'bg-red-50 border-red-150 text-red-800' 
                      : 'bg-emerald-50 border-emerald-150 text-emerald-800'
                  }`}>
                    {followupSuccess}
                  </div>
                )}

                <form onSubmit={handleScheduleFollowup} className="space-y-3.5 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <div>
                    <label htmlFor="followup-time" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Scheduled Day & Time</label>
                    <input
                      id="followup-time"
                      type="datetime-local"
                      required
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-250 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="followup-type" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Consultation Type</label>
                    <select
                      id="followup-type"
                      value={followupType}
                      onChange={(e) => setFollowupType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-250 bg-white text-xs font-semibold"
                    >
                      <option value="VIDEO">Google Meet Video</option>
                      <option value="AUDIO">Audio Call</option>
                      <option value="CHAT">Text Chat</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={schedulingFollowup || !followupDate}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {schedulingFollowup && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    Book Follow-up Meeting
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

        {/* Global Save action footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={handleSaveConsultation}
            disabled={savingLoading || !diagnosis || isMeetingEnded}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow-md transition disabled:opacity-50 flex items-center cursor-pointer"
          >
            {savingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            {isMeetingEnded ? 'Consultation Saved & Completed' : 'Publish Consultation & E-Rx'}
          </button>
        </div>
      </section>

    </div>
  );
}
