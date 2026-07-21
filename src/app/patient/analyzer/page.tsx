'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, ShieldAlert, Activity, AlertCircle, RefreshCw, ChevronRight, Plus, Trash2, Check, X, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ExtractedMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  refRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL' | 'NEUTRAL';
  category: string;
}

interface MedicalAnalysisResult {
  summary: string;
  overallHealthStatus: 'Optimal' | 'Mild Issues Detected' | 'Attention Required';
  goods: { title: string; desc: string }[];
  bads: { title: string; desc: string; severity: 'High' | 'Moderate' | 'Mild' }[];
  neutrals: { title: string; desc: string }[];
  metrics: ExtractedMetric[];
  ayurvedicAnalysis: {
    doshaImbalance: ('Vata' | 'Pitta' | 'Kapha')[];
    affectedDhatus: string[];
    pathologyExplanation: string;
    remedies: string[];
    dietPathya: string[];
    dietApathya: string[];
  };
}

export default function AIReportAnalyser() {
  const [reportType, setReportType] = useState<'lab_report' | 'xray' | 'mri'>('lab_report');
  
  // File upload states
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  
  // Dynamic extracted metrics & scan findings
  const [metrics, setMetrics] = useState<ExtractedMetric[]>([]);
  const [rawText, setRawText] = useState('');
  const [textFindings, setTextFindings] = useState<string[]>([]);
  
  // Custom manual metric inputs
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('');
  const [newMetricRange, setNewMetricRange] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle File Upload & Trigger Immediate OCR / Text Extraction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setExtractionMsg('');
      setAnalysisResult(null);
      setErrorMsg('');
      setMetrics([]);
      setRawText('');
      setTextFindings([]);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFileBase64(base64);
        
        setIsExtracting(true);
        try {
          const res = await fetch('/api/patient/extract-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64, fileName: file.name }),
          });

          if (res.ok) {
            const data = await res.json();
            setRawText(data.extractedText || '');
            if (data.metrics && Array.isArray(data.metrics)) {
              setMetrics(data.metrics);
            }
            if (data.textFindings && Array.isArray(data.textFindings)) {
              setTextFindings(data.textFindings);
            }

            const totalFound = (data.metrics?.length || 0) + (data.textFindings?.length || 0);
            if (totalFound > 0) {
              setExtractionMsg(`Successfully extracted ${totalFound} clinical parameters and findings from your document!`);
            } else {
              setExtractionMsg('Report uploaded. Text matrix parsed; you can review or add custom parameters below.');
            }
          } else {
            setExtractionMsg('File uploaded successfully. You can review or manually enter parameters.');
          }
        } catch (err) {
          console.error('Extraction API error:', err);
          setExtractionMsg('Uploaded report ready for analysis.');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Custom Parameter to Dynamic Board
  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricName || !newMetricValue) return;

    const newMetric: ExtractedMetric = {
      id: `custom-${Date.now()}`,
      name: newMetricName,
      value: newMetricValue,
      unit: newMetricUnit || 'unit',
      refRange: newMetricRange || 'Standard',
      status: 'NORMAL',
      category: 'General',
    };

    setMetrics([...metrics, newMetric]);
    setNewMetricName('');
    setNewMetricValue('');
    setNewMetricUnit('');
    setNewMetricRange('');
    setShowAddForm(false);
  };

  // Remove Metric
  const handleRemoveMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  // Update Metric Value
  const handleUpdateMetricValue = (id: string, newVal: string) => {
    setMetrics(metrics.map(m => {
      if (m.id === id) {
        let status = m.status;
        const num = parseFloat(newVal);
        if (!isNaN(num) && m.refRange && m.refRange.includes('-')) {
          const [min, max] = m.refRange.split('-').map(x => parseFloat(x));
          if (!isNaN(min) && !isNaN(max)) {
            if (num < min) status = 'LOW';
            else if (num > max) status = 'HIGH';
            else status = 'NORMAL';
          }
        }
        return { ...m, value: newVal, status };
      }
      return m;
    }));
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    setErrorMsg('');
    setAnalysisResult(null);
    setIsScanning(true);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/patient/analyze-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: fileBase64,
            reportType,
            metrics,
            rawText,
            textFindings,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAnalysisResult(data);
        } else {
          setErrorMsg('Analysis failed. Please verify uploaded file or entered parameters.');
        }
      } catch (err) {
        setErrorMsg('Failed to establish connection to report analyser endpoint.');
      } finally {
        setIsScanning(false);
      }
    }, 2000);
  };

  const handleSaveToRecords = async () => {
    if (!analysisResult) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/patient/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: `/uploads/${fileName || 'medical_report.pdf'}`,
          description: `AI ${reportType.toUpperCase()} Analysis: ${analysisResult.summary}`,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="ai-report-analyser-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Activity className="w-6 h-6 text-gold-100" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">PrakritiAI Universal Medical Analyser</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Upload any PDF lab report, X-Ray, MRI, or scanned document. Our OCR & AI engine extracts findings, highlights healthy & out-of-range parameters, and maps Ayurvedic pathology.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: File Dropzone & Dynamic Metrics Board (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">1. Select Report Category</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { type: 'lab_report', label: 'Blood & Lab' },
                  { type: 'xray', label: 'Chest X-Ray' },
                  { type: 'mri', label: 'Spine & MRI' },
                ].map((c) => (
                  <button
                    key={c.type}
                    onClick={() => {
                      setReportType(c.type as any);
                      setAnalysisResult(null);
                    }}
                    className={`py-2.5 border rounded-xl transition cursor-pointer text-center ${
                      reportType === c.type
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold shadow-sm'
                        : 'border-slate-200 hover:border-slate-350 text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">2. Upload Medical Scan or Report (PDF/PNG/JPG)</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-2 relative transition cursor-pointer bg-slate-50/50 hover:bg-emerald-50/10">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {fileName ? fileName : 'Drag & drop or click to choose file'}
                </div>
                <span className="text-[10px] text-slate-400 block">PDF, Scanned Images, PNG, JPG up to 15MB</span>
              </div>
            </div>

            {/* Extraction Loader */}
            {isExtracting && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs flex items-center space-x-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-900 font-semibold">Running OCR & parsing document text matrix...</span>
              </div>
            )}

            {/* Extraction Status Message */}
            {extractionMsg && !isExtracting && (
              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{extractionMsg}</span>
              </div>
            )}

            {/* Dynamic Extracted Parameters Board */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="block font-bold text-slate-800 text-xs">3. Extracted Clinical Parameters ({metrics.length})</span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Parameter
                </button>
              </div>

              {/* Add Parameter Form */}
              {showAddForm && (
                <form onSubmit={handleAddMetric} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Parameter Name (e.g. TSH)"
                      value={newMetricName}
                      onChange={e => setNewMetricName(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 5.8)"
                      value={newMetricValue}
                      onChange={e => setNewMetricValue(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g. mIU/L)"
                      value={newMetricUnit}
                      onChange={e => setNewMetricUnit(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Ref Range (e.g. 0.45-4.5)"
                      value={newMetricRange}
                      onChange={e => setNewMetricRange(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-emerald-700"
                    >
                      Save Parameter
                    </button>
                  </div>
                </form>
              )}

              {/* Metrics List */}
              {metrics.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  No numerical parameters added yet. Upload a report or click "Add Parameter" to insert test values.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {metrics.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <strong className="block font-bold text-slate-800 truncate">{m.name}</strong>
                        <span className="text-[10px] text-slate-400 block">Ref: {m.refRange} {m.unit}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => handleUpdateMetricValue(m.id, e.target.value)}
                          className="w-16 px-2 py-1 rounded border border-slate-200 bg-white text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-slate-500 font-bold">{m.unit}</span>

                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          m.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.status}
                        </span>

                        <button
                          onClick={() => handleRemoveMetric(m.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isScanning || (!fileBase64 && metrics.length === 0)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center disabled:opacity-50 cursor-pointer text-sm shadow-md"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Conducting Medical & Ayurvedic Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Analyze Complete Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Results Dashboard (Goods, Bads, Ayurvedic Pathya) (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scanning Animation */}
          {isScanning && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[450px] relative overflow-hidden">
              <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-scanline shadow-[0_0_15px_#10b981]"></div>
              <Activity className="w-12 h-12 text-emerald-400 animate-pulse" />
              <div className="space-y-1">
                <strong className="block text-base font-bold text-slate-100">Scanning Document & Evaluating Clinical Findings...</strong>
                <p className="text-xs text-slate-400">Classifying normal parameters, isolating out-of-range metrics, and compiling Ayurvedic recommendations.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-xs space-y-2">
              <strong className="font-bold block">Analysis Error</strong>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Results View */}
          {analysisResult && !isScanning && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-slideUp">
              
              {/* Executive Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 border-slate-100">
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Comprehensive AI Medical Findings</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-800 mt-1">{analysisResult.summary}</h3>
                </div>

                <div className={`px-4 py-2 rounded-2xl border text-xs font-black tracking-wide uppercase ${
                  analysisResult.overallHealthStatus === 'Optimal' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : analysisResult.overallHealthStatus === 'Mild Issues Detected'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {analysisResult.overallHealthStatus}
                </div>
              </div>

              {/* 🟢 THE GOODS (Normal & Healthy Parameters) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  The Goods (Healthy & Normal Findings) ({analysisResult.goods.length})
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {analysisResult.goods.map((g, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-1 text-xs">
                      <strong className="font-bold text-emerald-950 block">{g.title}</strong>
                      <p className="text-slate-600 leading-relaxed">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔴 THE BADS (Issues & Out-of-Range Parameters) */}
              {analysisResult.bads.length > 0 && (
                <div className="space-y-3 border-t pt-6 border-slate-100">
                  <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-600" />
                    The Bads (Issues & Out-of-Range Parameters) ({analysisResult.bads.length})
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {analysisResult.bads.map((b, idx) => (
                      <div key={idx} className="p-4 bg-rose-50/40 border border-rose-200 rounded-2xl space-y-1 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="font-bold text-rose-950 text-sm">{b.title}</strong>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            {b.severity} Priority
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{b.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🌿 AYURVEDIC PATHOLOGY & DOSHA DIAGNOSIS */}
              <div className="space-y-4 border-t pt-6 border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center">
                    <Shield className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Ayurvedic Pathology & Dosha Diagnosis
                  </h4>
                  <div className="flex space-x-1.5">
                    {analysisResult.ayurvedicAnalysis.doshaImbalance.map((d) => (
                      <span key={d} className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                        {d} Vitiation
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/20 border-l-4 border-emerald-600 p-4 rounded-r-2xl font-medium">
                  {analysisResult.ayurvedicAnalysis.pathologyExplanation}
                </p>
              </div>

              {/* 💊 AYURVEDIC REMEDIES & DIET (PATHYA / APATHYA) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-slate-100 text-xs">
                {/* Herbal Remedies */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <strong className="text-xs uppercase font-extrabold text-emerald-900 block">Recommended Herbal Remedies</strong>
                  <ul className="space-y-2 text-slate-700">
                    {analysisResult.ayurvedicAnalysis.remedies.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start">
                        <span className="text-emerald-600 mr-2 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dietary Adjustments */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <strong className="text-xs uppercase font-extrabold text-slate-800 block">Dietary Guidelines</strong>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase block mb-1">✓ Favor (Pathya):</span>
                      <p className="text-slate-700 font-medium leading-relaxed">{analysisResult.ayurvedicAnalysis.dietPathya.join(', ')}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-extrabold text-rose-700 uppercase block mb-1">✕ Avoid (Apathya):</span>
                      <p className="text-slate-700 font-medium leading-relaxed">{analysisResult.ayurvedicAnalysis.dietApathya.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="border-t pt-6 border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={handleSaveToRecords}
                  disabled={isSaving || savedSuccess}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                    </>
                  ) : savedSuccess ? (
                    'Saved to Medical Locker ✓'
                  ) : (
                    'Save Findings to Health Locker'
                  )}
                </button>

                <Link
                  href="/patient/doctors"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center cursor-pointer shadow-md"
                >
                  Schedule Tele-Consultation <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
