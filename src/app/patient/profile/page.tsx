'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Camera, Check, UploadCloud, User, Activity, Clock, ShieldAlert, CheckSquare, Heart } from 'lucide-react';

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface Habit {
  id: string;
  name: string;
  sanskrit: string;
  benefit: string;
  done: boolean;
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'tongue', name: 'Tongue Scraping (Jihwa Nirlekhana)', sanskrit: 'जिह्वा निर्लेखन', benefit: 'Removes overnight toxins and stimulates digestion.', done: false },
  { id: 'oil', name: 'Oil Pulling (Gandusha)', sanskrit: 'गण्डूष', benefit: 'Strengthens teeth, gums, and oral immunity.', done: false },
  { id: 'water', name: 'Ushapan (Warm Water)', sanskrit: 'उषापान', benefit: 'Cleanses intestines and awakens metabolic fire.', done: false },
  { id: 'pranayama', name: 'Pranayama (Breathing)', sanskrit: 'प्राणायाम', benefit: 'Energizes tissues and balances mental prana.', done: false },
  { id: 'abhyanga', name: 'Abhyanga (Self-Massage)', sanskrit: 'अभ्यंग', benefit: 'Calms Vata nervous system and increases circulation.', done: false },
];

export default function PatientProfileDashboard() {
  const { user, refreshUser } = useAuth();
  
  // General Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Medical Profile
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  // Emergency Contact
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Avatar / Webcam states
  const [avatarImage, setAvatarImage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // UX states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Daily Habits state
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  // Biological Clock details
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeClockDosha, setActiveClockDosha] = useState<'Vata' | 'Pitta' | 'Kapha'>('Vata');
  const [clockTip, setClockTip] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Populate data when user loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarImage(user.avatarImage || '');
      
      const profile = user.patientProfile || {};
      if (profile.dob) {
        setDob(new Date(profile.dob).toISOString().split('T')[0]);
      }
      setGender(profile.gender || '');
      setBloodGroup(profile.bloodGroup || '');
      setAllergies(profile.allergies || '');
      setChronicConditions(profile.chronicConditions || '');

      // Parse emergency contact JSON
      if (profile.emergencyContact) {
        try {
          const contact = JSON.parse(profile.emergencyContact) as EmergencyContact;
          setContactName(contact.name || '');
          setContactRelation(contact.relation || '');
          setContactPhone(contact.phone || '');
        } catch (e) {
          // If it was stored as raw text string fallback
          setContactName(profile.emergencyContact);
        }
      }
    }
  }, [user]);

  // Clean camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Dinacharya Biological Clock live updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    
    // Ayurvedic Clock Rules:
    // 2:00 - 6:00 (AM/PM) : Vata active
    // 6:00 - 10:00 (AM/PM): Kapha active
    // 10:00 - 14:00 (AM/PM) / 22:00 - 2:00 (PM/AM) : Pitta active
    
    if ((hour >= 2 && hour < 6) || (hour >= 14 && hour < 18)) {
      setActiveClockDosha('Vata');
      setClockTip(hour >= 14 ? 'Vata time. Perfect for calm introspection, breathing exercises, or hot herbal tea to ground your mind.' : 'Early Vata morning. Great time to wake up, sit in silence, and meditate before sunrise.');
    } else if ((hour >= 6 && hour < 10) || (hour >= 18 && hour < 22)) {
      setActiveClockDosha('Kapha');
      setClockTip(hour >= 18 ? 'Evening Kapha hours. Have a light dinner and winding-down routine. Avoid heavy mental work.' : 'Morning Kapha time. Good hours for physical exercise to stimulate metabolism and clear body stagnation.');
    } else {
      setActiveClockDosha('Pitta');
      setClockTip(hour >= 22 ? 'Night Pitta time. Body is regenerating organs. You should be asleep to let liver detoxification execute correctly.' : 'Midday Pitta peak. Digestion (Agni) is at its strongest. Enjoy your largest meal of the day now!');
    }
  }, [currentTime]);

  const startCamera = async () => {
    setErrorMsg('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      setErrorMsg('Webcam permissions blocked or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureAvatar = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 250;
        canvas.height = 250;
        context.drawImage(video, 0, 0, 250, 250);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarImage(base64);
        stopCamera();
      }
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  const getHabitCompletionPercentage = () => {
    const done = habits.filter((h) => h.done).length;
    return Math.round((done / habits.length) * 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const emergencyContact = {
      name: contactName,
      relation: contactRelation,
      phone: contactPhone,
    };

    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          avatarImage,
          dob,
          gender,
          bloodGroup,
          allergies,
          chronicConditions,
          emergencyContact,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Profile changes saved successfully!');
        // Update user state globally in AuthContext
        refreshUser();
      } else {
        setErrorMsg(data.error || 'Failed to save changes');
      }
    } catch (e) {
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Mocked Prakriti quiz breakdown (default fallback)
  const userDosha = user?.patientProfile?.doshaType || 'Vata-Pitta';

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="patient-profile-dashboard">
      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Left Column Details Form, Right Column Wellness Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile form (lg:col-span-7) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-805 text-lg font-bold flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" /> Profile Information
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Portal</span>
          </div>

          {/* Avatar Cropper / Camera panel */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-550 bg-slate-100 flex-shrink-0 flex items-center justify-center">
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-xs font-bold text-slate-700">Change Profile Image</span>
              
              <div className="flex flex-wrap gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-750 text-white rounded-lg text-[10px] font-bold transition flex items-center shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" /> Snap Photo
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={captureAvatar}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* File picker */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatarImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5 mr-1 text-slate-500" /> Upload Image
                  </button>
                </div>
              </div>

              {cameraActive && (
                <div className="mt-2 w-48 h-48 bg-slate-900 border-2 border-dashed border-primary-500 rounded-lg overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 text-xs font-semibold">
            {/* Locked Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address (Read-only)</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manas Kumar"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-205 border-slate-205 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="dob" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-850 text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-850 text-slate-850 bg-white text-slate-800"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="blood" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Blood Group</label>
              <select
                id="blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-850 bg-white text-slate-800"
              >
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <span className="block text-xs font-bold text-primary-750 uppercase mb-3">Medical Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="allergies" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Allergies</label>
                  <input
                    id="allergies"
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Penicillin (leave blank if none)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="chronic" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Chronic Conditions</label>
                  <input
                    id="chronic"
                    type="text"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Asthma (leave blank if none)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
              <span className="block text-xs font-bold text-primary-750 uppercase">Emergency Contact Vetting</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="emName" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Contact Name</label>
                  <input
                    id="emName"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-205 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="emRel" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Relation</label>
                  <input
                    id="emRel"
                    type="text"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    placeholder="Spouse / Parent"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-805 text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="emPhone" className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Phone #</label>
                  <input
                    id="emPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-805 text-slate-850 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Save Profile Settings
          </button>
        </form>

        {/* Right Column: Wellness Hub (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Prakriti Dosha Breakdown Wheel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary-600" />
              Prakriti Constitution Breakdown
            </h3>

            <div className="flex items-center space-x-6">
              {/* Radial Pie-Circle Chart (simulated with layered gradients) */}
              <div className="relative w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-amber-500 to-emerald-500 shadow-md">
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Quiz Dominance</span>
                  <span className="text-base font-extrabold text-slate-800 leading-none">{userDosha}</span>
                </div>
              </div>

              {/* Legend with matching colors */}
              <div className="space-y-2 text-xs font-semibold text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded bg-indigo-500 block"></span>
                    <span>Vata Energy</span>
                  </div>
                  <span className="font-bold text-slate-800">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded bg-amber-500 block"></span>
                    <span>Pitta Energy</span>
                  </div>
                  <span className="font-bold text-slate-800">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded bg-emerald-500 block"></span>
                    <span>Kapha Energy</span>
                  </div>
                  <span className="font-bold text-slate-800">20%</span>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-450 text-slate-400 leading-relaxed mt-4 italic">
              *Breakdown derived from your quiz responses. Take the quiz again under dashboards if you feel your symptoms or energies have shifted.
            </p>
          </div>

          {/* 2. Dinacharya Live Biological Clock */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-600/35 rounded-full opacity-20 filter blur-xl"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <h3 className="font-bold text-sm flex items-center text-gold-100">
                <Clock className="w-4 h-4 mr-2" />
                Dinacharya Biological Dial
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-350 text-slate-300">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2 relative z-10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Active Universal Energy:</span>
                <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-extrabold ${
                  activeClockDosha === 'Vata' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' :
                  activeClockDosha === 'Pitta' ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50' :
                  'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                }`}>
                  {activeClockDosha} Time
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed mt-1 text-[11px]">{clockTip}</p>
            </div>
          </div>

          {/* 3. Dinacharya Habits Tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-slate-805 text-slate-850 font-bold text-sm flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-primary-600" />
                Daily Dinacharya Checklist
              </h3>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" className="stroke-slate-100 fill-transparent" strokeWidth="3" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    className="stroke-primary-500 fill-transparent transition-all duration-300"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - getHabitCompletionPercentage() / 100)}
                  />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-slate-700">{getHabitCompletionPercentage()}%</span>
              </div>
            </div>

            <div className="space-y-2">
              {habits.map((h) => (
                <div
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 select-none ${
                    h.done ? 'border-primary-200 bg-primary-50/20' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={h.done}
                    readOnly
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5 cursor-pointer"
                  />
                  <div className="text-xs">
                    <div className="flex items-center space-x-1.5">
                      <strong className="text-slate-800 font-bold">{h.name}</strong>
                      <span className="text-[9px] text-slate-450 font-bold font-sans bg-slate-200 px-1 py-0.2 rounded text-slate-450">
                        {h.sanskrit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{h.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
