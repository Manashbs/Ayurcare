'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Download, UploadCloud, ShieldCheck, Plus, Inbox, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function MyHealthRecords() {
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Manual report upload states
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/records');
      if (res.ok) {
        const json = await res.json();
        setRecords(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUploadReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setErrorMsg('Please select a file to upload');
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');
    setUploadLoading(true);

    try {
      const res = await fetch('/api/patient/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: `/uploads/${fileName}`,
          description: description || 'Patient uploaded lab report',
        }),
      });

      if (res.ok) {
        setSuccessMsg('Medical document uploaded successfully!');
        setShowUploadModal(false);
        setDescription('');
        setFileName('');
        fetchRecords();
      } else {
        setErrorMsg('Upload failed. Try again.');
      }
    } catch (err) {
      setErrorMsg('Connection error.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 font-sans" id="patient-records-page">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-850">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-1">Access prescriptions, test reports, and past consult details in one place.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition duration-200 flex items-center shadow cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 mr-2" /> Upload Lab Report
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Syncing health logs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Prescriptions List (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-800 border-b border-slate-100 pb-3 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-primary-700" /> E-Prescription Ledger
            </h3>

            {!records?.prescriptions || records.prescriptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Inbox className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <h4 className="font-bold text-slate-700">No Prescriptions Available</h4>
                <p className="text-xs mt-1">Prescriptions will show up here as soon as they are assigned by consulting doctors.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {records.prescriptions.map((pres: any) => {
                  const medicines = JSON.parse(pres.medicines || '[]');
                  return (
                    <div key={pres.id} className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-850 text-sm">Formulated by Dr. {pres.doctor?.user?.name}</h4>
                        <span className="text-[10px] text-slate-450 font-bold block">Issued: {new Date(pres.assignedAt).toLocaleDateString()}</span>
                        <div className="space-y-1.5 mt-3">
                          {medicines.map((med: any, idx: number) => (
                            <div key={idx} className="text-xs font-semibold text-slate-600">
                              • <strong className="text-primary-800">{med.name}</strong> - {med.dosage} ({med.frequency}, Anupana: {med.anupana})
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading PDF e-prescription: ${pres.pdfUrl}`)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center cursor-pointer shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-2" /> PDF Copy
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lab Reports & Documents List (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-800 border-b border-slate-100 pb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-700" /> Lab Reports & Docs
            </h3>

            {!records?.labReports || records.labReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <h4 className="font-bold text-slate-700">No Documents Uploaded</h4>
                <p className="text-xs mt-1">Use the upload button above to save test panels or physical checkup files.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.labReports.map((report: any) => (
                  <div key={report.id} className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{report.description || 'Medical Report'}</h4>
                      <span className="text-[9px] text-slate-400 block font-bold">Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}</span>
                      <span className="text-[9px] bg-slate-200 text-slate-650 font-bold px-1.5 py-0.5 rounded inline-block uppercase mt-1">
                        Source: {report.uploadedBy}
                      </span>
                    </div>
                    <button
                      onClick={() => alert(`Opening report file: ${report.fileUrl}`)}
                      className="w-full py-2 border border-slate-200 hover:bg-white text-slate-700 text-[10px] font-bold rounded-lg transition text-center shadow-sm cursor-pointer"
                    >
                      View Attached File
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl border border-slate-100 max-w-md w-full p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

            <h3 className="font-display text-xl font-bold text-slate-850">Upload Medical Document</h3>

            {errorMsg && (
              <div className="bg-red-50 text-red-650 p-3 rounded-lg border border-red-200 text-xs font-bold text-center mt-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadReportSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="report-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Title</label>
                <input
                  id="report-desc"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Prakriti Blood Panel, Skin Rash Photo"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none placeholder-slate-350"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Report File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-primary-600">Select files to upload</span>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  {fileName && (
                    <span className="text-xs font-bold text-green-600 block mt-2">✓ Selected: {fileName}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setErrorMsg('');
                    setDescription('');
                    setFileName('');
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center cursor-pointer disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Complete Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
