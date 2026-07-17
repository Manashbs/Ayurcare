'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, FileText, Check, X, Info, UserCheck, AlertTriangle, Camera } from 'lucide-react';

export default function DoctorApprovalsQueue() {
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Rejection state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Info Request state
  const [requestingDocId, setRequestingDocId] = useState<string | null>(null);
  const [infoRequestReason, setInfoRequestReason] = useState('');

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?role=DOCTOR');
      if (res.ok) {
        const json = await res.json();
        // Filter for doctors who are not APPROVED
        const pending = json.users.filter(
          (u: any) => u.doctorProfile && u.doctorProfile.approvalStatus !== 'APPROVED'
        );
        setPendingDoctors(pending);
      }
    } catch (e) {
      console.error('Failed to load pending doctors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const handleApproval = async (id: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalUpdate: {
            approvalStatus: 'APPROVED',
          },
        }),
      });

      if (res.ok) {
        setSuccessMsg('Doctor registration approved! Congratulatory email triggered.');
        fetchPendingDoctors();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to approve doctor.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId || !rejectionReason) return;

    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${rejectingDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalUpdate: {
            approvalStatus: 'REJECTED',
            rejectionReason,
          },
        }),
      });

      if (res.ok) {
        setSuccessMsg('Doctor application rejected. Rejection notice dispatched.');
        setRejectingDocId(null);
        setRejectionReason('');
        fetchPendingDoctors();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Rejection save failed.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoreInfoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingDocId || !infoRequestReason) return;

    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${requestingDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalUpdate: {
            approvalStatus: 'MORE_INFO',
            rejectionReason: infoRequestReason, // Use the same field for notes/reasons
          },
        }),
      });

      if (res.ok) {
        setSuccessMsg('Information request dispatched to the practitioner.');
        setRequestingDocId(null);
        setInfoRequestReason('');
        fetchPendingDoctors();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit request.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Practitioner Vetting Queue</h1>
        <p className="text-slate-400 text-sm mt-1">Review licenses and credentials before unlocking Doctor Dashboards.</p>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verification List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Vetting applications...</span>
        </div>
      ) : pendingDoctors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <UserCheck className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="font-bold text-lg text-white">Queue is Empty</h3>
          <p className="text-sm mt-1">No doctor profiles currently awaiting credentials review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingDoctors.map((doc) => {
            const profile = doc.doctorProfile || {};
            return (
              <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                
                {/* Column 1: Info */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center space-x-4">
                    {/* Face ID Avatar (Oval) */}
                    {profile.faceIdImage ? (
                      <div className="w-16 h-20 bg-slate-950 rounded-[50%_/_60%_60%_40%_40%] overflow-hidden border-2 border-primary-500 flex-shrink-0 shadow-lg">
                        <img src={profile.faceIdImage} alt="Face ID scan" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-20 bg-slate-950 rounded-[50%_/_60%_60%_40%_40%] overflow-hidden border-2 border-slate-850 flex-shrink-0 flex items-center justify-center text-slate-700">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-display font-bold text-xl text-white">{doc.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-500 uppercase">
                          {profile.approvalStatus}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1">{doc.email} | {doc.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Qualifications</span>
                      <span className="text-slate-200 font-semibold">{profile.qualification}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Medical Registration #</span>
                      <span className="text-slate-200 font-semibold">{profile.regNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Specializations</span>
                      <span className="text-slate-200 font-semibold">{profile.specializations}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Practice Experience</span>
                      <span className="text-slate-200 font-semibold">{profile.experienceYears} Years</span>
                    </div>
                    {/* Aadhaar Number */}
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Aadhaar Number</span>
                      <span className="text-slate-200 font-semibold tracking-wider font-mono">
                        {profile.aadhaarNumber ? profile.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Documents view */}
                  <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-300 block font-semibold">Verification Proofs</strong>
                        <span>Attached file: {profile.documents || 'medical_license.pdf'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening verification document zoom: ${profile.documents || 'medical_license.pdf'}`)}
                      className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded cursor-pointer"
                    >
                      View File
                    </button>
                  </div>
                </div>

                {/* Column 2: Vetting Actions */}
                <div className="lg:col-span-4 h-full flex flex-col justify-end space-y-3 lg:border-l lg:border-slate-800 lg:pl-6 lg:h-full">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Queue Actions</span>
                  <button
                    onClick={() => handleApproval(doc.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve & Activate
                  </button>
                  <button
                    onClick={() => setRejectingDocId(doc.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/50 font-bold rounded-lg text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" /> Reject Application
                  </button>
                  <button
                    onClick={() => setRequestingDocId(doc.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Info className="w-4 h-4 mr-2" /> Request More Info
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-white mb-4">Reject Medical Application</h3>
            <form onSubmit={handleRejection} className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rejection Reason (will be emailed to Doctor)</label>
                <textarea
                  id="rejection-reason"
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., The uploaded medical council certificate could not be validated. Please upload a clear scan of your state medical license..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-slate-900 bg-slate-950"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingDocId(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {requestingDocId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-white mb-4">Request Additional Information</h3>
            <form onSubmit={handleMoreInfoRequest} className="space-y-4">
              <div>
                <label htmlFor="info-reason" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Information Required Notes</label>
                <textarea
                  id="info-reason"
                  required
                  rows={4}
                  value={infoRequestReason}
                  onChange={(e) => setInfoRequestReason(e.target.value)}
                  placeholder="e.g., Please upload your post-graduate degree certificate (MD Ayurveda) to support your specialty claim..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-slate-900 bg-slate-950"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestingDocId(null);
                    setInfoRequestReason('');
                  }}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
