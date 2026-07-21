'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, FileText, Check, X, Info, UserCheck, AlertTriangle, Camera, Eye, Download } from 'lucide-react';

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

  // Document Inspection Modal state
  const [selectedDocForView, setSelectedDocForView] = useState<any | null>(null);

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
        if (selectedDocForView?.id === id) setSelectedDocForView(null);
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
        if (selectedDocForView?.id === rejectingDocId) setSelectedDocForView(null);
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
            rejectionReason: infoRequestReason,
          },
        }),
      });

      if (res.ok) {
        setSuccessMsg('Information request dispatched to the practitioner.');
        setRequestingDocId(null);
        setInfoRequestReason('');
        if (selectedDocForView?.id === requestingDocId) setSelectedDocForView(null);
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
            const isBase64Doc = profile.documents && profile.documents.startsWith('data:');
            return (
              <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                
                {/* Column 1: Info */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center space-x-4">
                    {/* Face ID Avatar (Oval) */}
                    {profile.faceIdImage ? (
                      <div 
                        onClick={() => setSelectedDocForView(doc)}
                        className="w-16 h-20 bg-slate-950 rounded-[50%_/_60%_60%_40%_40%] overflow-hidden border-2 border-emerald-500 flex-shrink-0 shadow-lg cursor-pointer hover:opacity-85 transition"
                        title="Click to zoom Face ID"
                      >
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
                      <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-300 block font-semibold">Verification Proofs</strong>
                        <span>Attached file: {isBase64Doc ? 'Uploaded_License_Certificate' : (profile.documents || 'medical_license.pdf')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDocForView(doc)}
                      className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded flex items-center space-x-1.5 cursor-pointer transition shadow"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View & Download Document</span>
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

      {/* DOCUMENT & IDENTITY INSPECTION MODAL */}
      {selectedDocForView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedDocForView(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold text-white">Practitioner Identity & Credential Audit</h3>
                <p className="text-xs text-slate-400">{selectedDocForView.name} ({selectedDocForView.email})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Face ID Oval Scan */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Face ID Scan</span>
                {selectedDocForView.doctorProfile?.faceIdImage ? (
                  <div className="w-36 h-48 bg-slate-900 rounded-[50%_/_60%_60%_40%_40%] overflow-hidden border-4 border-emerald-500 shadow-xl mb-2">
                    <img src={selectedDocForView.doctorProfile.faceIdImage} alt="Face ID" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-36 h-48 bg-slate-900 rounded-[50%_/_60%_60%_40%_40%] flex flex-col items-center justify-center text-slate-600 mb-2 border border-slate-800">
                    <Camera className="w-10 h-10 mb-1 text-slate-500" />
                    <span className="text-[10px] text-slate-500">No Photo</span>
                  </div>
                )}
                <span className="text-[11px] font-bold text-emerald-400 mt-1">✓ Facial Identity Recorded</span>
              </div>

              {/* Verified Documents */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Uploaded Documents & Proofs
                </span>
                
                <div className="space-y-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <strong className="text-slate-200 block font-semibold">Degree & License Proof</strong>
                          <span className="text-[10px] text-slate-400">Medical Reg: {selectedDocForView.doctorProfile?.regNumber}</span>
                        </div>
                      </div>

                      {selectedDocForView.doctorProfile?.documents && (
                        <a 
                          href={selectedDocForView.doctorProfile.documents} 
                          download={`${selectedDocForView.name.replace(/\s+/g, '_')}_medical_license`}
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center space-x-1 shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </a>
                      )}
                    </div>

                    {/* Preview if document is image */}
                    {selectedDocForView.doctorProfile?.documents?.startsWith('data:image') && (
                      <div className="w-full h-32 rounded bg-slate-950 overflow-hidden border border-slate-800 mt-2">
                        <img src={selectedDocForView.doctorProfile.documents} alt="Degree document preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Aadhaar Card Identification</span>
                    <p className="font-mono text-slate-200 text-sm font-semibold tracking-widest">
                      {selectedDocForView.doctorProfile?.aadhaarNumber ? selectedDocForView.doctorProfile.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
              <button 
                onClick={() => setSelectedDocForView(null)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Audit
              </button>
              <button 
                onClick={() => handleApproval(selectedDocForView.id)} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Approve Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingDocId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejection} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Reject Application</h3>
            <p className="text-xs text-slate-400">Please provide a clear reason for the practitioner to rectify.</p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Registration number invalid or degree certificate unreadable."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setRejectingDocId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold">
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MORE INFO REQUEST MODAL */}
      {requestingDocId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleMoreInfoRequest} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Request Additional Information</h3>
            <p className="text-xs text-slate-400">Specify what additional documentation is required from the doctor.</p>
            <textarea
              required
              rows={3}
              value={infoRequestReason}
              onChange={(e) => setInfoRequestReason(e.target.value)}
              placeholder="e.g. Please re-upload a clearer high-res scan of your State Medical Registration Certificate."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setRequestingDocId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
