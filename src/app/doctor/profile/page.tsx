'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, ShieldAlert, Save, User } from 'lucide-react';

export default function DoctorProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [feePerConsult, setFeePerConsult] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [languages, setLanguages] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/profile');
      if (res.ok) {
        const json = await res.json();
        const user = json.user || {};
        const profile = user.doctorProfile || {};

        setName(user.name);
        setPhone(user.phone || '');
        setQualification(profile.qualification || '');
        setSpecializations(profile.specializations || '');
        setExperienceYears(String(profile.experienceYears || '0'));
        setFeePerConsult(String(profile.feePerConsult || '500'));
        setClinicAddress(profile.clinicAddress || '');
        setLanguages(profile.languages || 'English, Hindi');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          qualification,
          specializations,
          experienceYears: parseInt(experienceYears),
          feePerConsult: parseFloat(feePerConsult),
          clinicAddress,
          languages,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Your practice profile details updated successfully!');
        fetchProfile();
      } else {
        setErrorMsg('Failed to update details. Try again.');
      }
    } catch (err) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">Practice Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your clinic settings, consulting fees, and details displayed to patients.</p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Syncing practitioner profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm space-y-6 max-w-2xl">
          <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">Physician Credentials</h3>
              <p className="text-xs text-slate-400">Locked fields can be modified by contacting the system Admin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Name</label>
              <input
                id="name-inp"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone</label>
              <input
                id="phone-inp"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="qual-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Qualifications</label>
              <input
                id="qual-inp"
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fee-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Consultation Fee (INR)</label>
              <input
                id="fee-inp"
                type="number"
                required
                value={feePerConsult}
                onChange={(e) => setFeePerConsult(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-25 space-y-2 sm:col-span-2">
              <label htmlFor="spec-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Specializations</label>
              <input
                id="spec-inp"
                type="text"
                required
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="exp-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Experience Years</label>
              <input
                id="exp-inp"
                type="number"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Address</label>
            <input
              id="address-inp"
              type="text"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="langs-inp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Languages Spoken</label>
            <input
              id="langs-inp"
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center shadow-md text-sm cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Profile Settings
          </button>
        </form>
      )}
    </div>
  );
}
