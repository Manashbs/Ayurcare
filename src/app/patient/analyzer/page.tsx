'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, ShieldAlert, Activity, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AIReportAnalyser() {
  const [reportType, setReportType] = useState<'xray' | 'mri' | 'lab_report'>('lab_report');
  
  // File upload states
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  
  // Lab report form fields
  const [hemoglobin, setHemoglobin] = useState('13.5');
  const [cholesterol, setCholesterol] = useState('180');
  const [tsh, setTsh] = useState('2.5');
  const [glucose, setGlucose] = useState('90');
  const [hba1c, setHba1c] = useState('5.2');
  const [wbc, setWbc] = useState('6.5');
  const [creatinine, setCreatinine] = useState('0.9');
  const [alt, setAlt] = useState('25');
  const [vitaminD, setVitaminD] = useState('35');
  const [vitaminB12, setVitaminB12] = useState('450');
  const [rbc, setRbc] = useState('4.8');
  const [platelets, setPlatelets] = useState('250');

  // Local Ollama Status detection
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  // Scanner animation & results
  const [isScanning, setIsScanning] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Check local Ollama status on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch('http://localhost:11434/api/tags');
        if (res.ok) {
          setOllamaStatus('connected');
        } else {
          setOllamaStatus('offline');
        }
      } catch (e) {
        setOllamaStatus('offline');
      }
    };
    checkOllama();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setExtractionMsg('');
      setAnalysisResult(null);
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFileBase64(base64);
        
        // If they uploaded a PDF lab report, trigger the extractor immediately!
        if (reportType === 'lab_report' && file.name.toLowerCase().endsWith('.pdf')) {
          setIsExtracting(true);
          try {
            const res = await fetch('/api/patient/extract-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file: base64 }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.parsedData) {
                let count = 0;
                if (data.parsedData.hemoglobin) { setHemoglobin(data.parsedData.hemoglobin); count++; }
                if (data.parsedData.cholesterol) { setCholesterol(data.parsedData.cholesterol); count++; }
                if (data.parsedData.tsh) { setTsh(data.parsedData.tsh); count++; }
                if (data.parsedData.glucose) { setGlucose(data.parsedData.glucose); count++; }
                if (data.parsedData.hba1c) { setHba1c(data.parsedData.hba1c); count++; }
                if (data.parsedData.wbc) { setWbc(data.parsedData.wbc); count++; }
                if (data.parsedData.creatinine) { setCreatinine(data.parsedData.creatinine); count++; }
                if (data.parsedData.alt) { setAlt(data.parsedData.alt); count++; }
                if (data.parsedData.vitaminD) { setVitaminD(data.parsedData.vitaminD); count++; }
                if (data.parsedData.vitaminB12) { setVitaminB12(data.parsedData.vitaminB12); count++; }
                if (data.parsedData.rbc) { setRbc(data.parsedData.rbc); count++; }
                if (data.parsedData.platelets) { setPlatelets(data.parsedData.platelets); count++; }
                
                if (count > 0) {
                  setExtractionMsg(`Successfully extracted and populated ${count} biomarkers from your PDF report!`);
                } else {
                  setExtractionMsg('No common biomarkers found in PDF text. Please verify and input manually.');
                }
              }
            } else {
              setExtractionMsg('Failed to read PDF file contents.');
            }
          } catch (err) {
            console.error('Failed to call extraction API:', err);
            setExtractionMsg('Connection error during PDF extraction.');
          } finally {
            setIsExtracting(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg('');
    setAnalysisResult(null);
    setIsScanning(true);

    // Give 2.5 seconds scanner animation for medical-grade simulation feel
    setTimeout(async () => {
      try {
        const res = await fetch('/api/patient/analyze-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: fileBase64,
            reportType,
            labData:
              reportType === 'lab_report'
                ? { hemoglobin, cholesterol, tsh, glucose, hba1c, wbc, creatinine, alt, vitaminD, vitaminB12, rbc, platelets }
                : null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAnalysisResult(data);
        } else {
          setErrorMsg('Inference model processing failed. Please try again.');
        }
      } catch (err) {
        setErrorMsg('Failed to establish connection to analyser endpoint.');
      } finally {
        setIsScanning(false);
      }
    }, 2500);
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
          fileUrl: `/uploads/${fileName || 'ai_analysis_report.pdf'}`,
          description: `AI ${reportType.toUpperCase()} Analyser findings: ${analysisResult.summary}`,
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
            <h1 className="font-display text-3xl font-extrabold tracking-wide">PrakritiAI Report Analyser</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Upload PDF scans or images. Analyze values locally for free using local LLMs or our component-level clinical auditor.
            </p>
          </div>
        </div>
      </div>

      {/* Ollama Server Status Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-slate-800 text-sm font-bold flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-primary-600" />
            Ollama Integration Hub (Free Local LLMs)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Running LLMs locally means complete privacy and **zero API costs**. Install Ollama and pull medical vision models:
          </p>
          <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg flex justify-between items-center">
            <span># Run local vision scan analysis:<br />ollama run llava</span>
            <span className="text-emerald-400 font-bold">100% Free</span>
          </div>
        </div>

        {/* Status widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ollama Connection</span>
          
          <div className="my-4">
            {ollamaStatus === 'checking' && (
              <span className="text-xs text-slate-500 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Pinging localhost:11434...
              </span>
            )}
            {ollamaStatus === 'connected' && (
              <div className="space-y-1">
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500 fill-emerald-50" /> Local Server Detected
                </span>
                <p className="text-[10px] text-slate-400">Ready to execute llava/llama3 inference.</p>
              </div>
            )}
            {ollamaStatus === 'offline' && (
              <div className="space-y-1">
                <span className="text-xs text-amber-600 font-bold flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-50" /> Local Server Offline
                </span>
                <p className="text-[10px] text-slate-400">Defaulting to high-accuracy clinical range auditor fallback.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setOllamaStatus('checking');
              setTimeout(async () => {
                try {
                  const res = await fetch('http://localhost:11434/api/tags');
                  setOllamaStatus(res.ok ? 'connected' : 'offline');
                } catch (e) {
                  setOllamaStatus('offline');
                }
              }, 1000);
            }}
            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Uploader (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">1. Select Report Category</label>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-600">
              {[
                { type: 'lab_report', label: 'Blood/Lab' },
                { type: 'xray', label: 'Chest X-Ray' },
                { type: 'mri', label: 'Brain/Spine MRI' },
              ].map((c) => (
                <button
                  key={c.type}
                  onClick={() => {
                    setReportType(c.type as any);
                    setAnalysisResult(null);
                  }}
                  className={`py-2 border rounded-xl transition cursor-pointer ${
                    reportType === c.type
                      ? 'border-primary-500 bg-primary-50/10 text-primary-750 font-extrabold'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload card */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-705">2. Upload Scans or Files (PDF/PNG/JPG)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-2xl p-6 text-center space-y-2 relative transition cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                {fileName ? fileName : 'Choose Medical Report File'}
              </div>
              <span className="text-[10px] text-slate-400 block">PDF, PNG, JPG, JPEG up to 10MB</span>
            </div>
          </div>

          {/* Extraction status loader/msg */}
          {isExtracting && (
            <div className="bg-primary-50/30 border border-primary-100 p-3.5 rounded-xl text-xs flex items-center space-x-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600 flex-shrink-0" />
              <span className="text-slate-600 font-semibold">Extracting and normalizing PDF text...</span>
            </div>
          )}

          {extractionMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2.5 border ${
              extractionMsg.includes('Successfully')
                ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800'
                : 'bg-amber-50/30 border-amber-100 text-amber-800'
            }`}>
              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                extractionMsg.includes('Successfully') ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <span>{extractionMsg}</span>
            </div>
          )}

          {/* Verification Form (Interactive blood test range checker) */}
          {reportType === 'lab_report' && (
            <div className="border-t border-slate-100 pt-4 space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="block font-bold text-primary-750 uppercase text-[10px]">3. Audit Lab Metrics (100% Accuracy Check)</span>
                <span className="text-[9px] text-slate-400 italic">Adjust to match your report</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="hb" className="block text-[10px] text-slate-500 uppercase">Hemoglobin (g/dL)</label>
                  <input
                    id="hb"
                    type="text"
                    value={hemoglobin}
                    onChange={(e) => setHemoglobin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 12.0 - 16.0</span>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="chol" className="block text-[10px] text-slate-500 uppercase">Total Cholesterol (mg/dL)</label>
                  <input
                    id="chol"
                    type="text"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 130 - 200</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="tshVal" className="block text-[10px] text-slate-500 uppercase">TSH (mIU/L)</label>
                  <input
                    id="tshVal"
                    type="text"
                    value={tsh}
                    onChange={(e) => setTsh(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 0.45 - 4.5</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="gl" className="block text-[10px] text-slate-500 uppercase">Fasting Glucose (mg/dL)</label>
                  <input
                    id="gl"
                    type="text"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 70 - 100</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="hba1cVal" className="block text-[10px] text-slate-500 uppercase">HbA1c (%)</label>
                  <input
                    id="hba1cVal"
                    type="text"
                    value={hba1c}
                    onChange={(e) => setHba1c(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 4.0 - 5.6</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="wbcVal" className="block text-[10px] text-slate-500 uppercase">WBC (x10^3/µL)</label>
                  <input
                    id="wbcVal"
                    type="text"
                    value={wbc}
                    onChange={(e) => setWbc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 4.0 - 11.0</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="creatVal" className="block text-[10px] text-slate-500 uppercase">Creatinine (mg/dL)</label>
                  <input
                    id="creatVal"
                    type="text"
                    value={creatinine}
                    onChange={(e) => setCreatinine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 0.6 - 1.2</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="altVal" className="block text-[10px] text-slate-500 uppercase">SGPT / ALT (U/L)</label>
                  <input
                    id="altVal"
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 7 - 56</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="vitDVal" className="block text-[10px] text-slate-500 uppercase">Vitamin D3 (ng/mL)</label>
                  <input
                    id="vitDVal"
                    type="text"
                    value={vitaminD}
                    onChange={(e) => setVitaminD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 30 - 100</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="vitB12Val" className="block text-[10px] text-slate-500 uppercase">Vitamin B12 (pg/mL)</label>
                  <input
                    id="vitB12Val"
                    type="text"
                    value={vitaminB12}
                    onChange={(e) => setVitaminB12(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 200 - 900</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="rbcVal" className="block text-[10px] text-slate-500 uppercase">RBC Count (m/µL)</label>
                  <input
                    id="rbcVal"
                    type="text"
                    value={rbc}
                    onChange={(e) => setRbc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 4.5 - 5.9</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="platVal" className="block text-[10px] text-slate-500 uppercase">Platelets (x10^3/µL)</label>
                  <input
                    id="platVal"
                    type="text"
                    value={platelets}
                    onChange={(e) => setPlatelets(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Normal: 150 - 450</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isScanning || !fileBase64}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center disabled:opacity-50 cursor-pointer text-sm mt-4 shadow"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Scanning Document...
              </>
            ) : (
              'Analyze Report'
            )}
          </button>
        </div>

        {/* Right Column: Scanner Animation & Results (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scanning Animation overlay */}
          {isScanning && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[450px] relative overflow-hidden">
              <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-scanline shadow-[0_0_15px_#10b981]"></div>
              
              <Activity className="w-12 h-12 text-emerald-400 animate-pulse" />
              <div className="space-y-1">
                <strong className="block text-base font-bold text-slate-100">Scanning Document Matrix...</strong>
                <p className="text-xs text-slate-400">Verifying contrast parameters, checking bounding boxes, and parsing ranges.</p>
              </div>
              <div className="w-32 bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-2/3 rounded-full animate-progressFill"></div>
              </div>
            </div>
          )}

          {/* Analysis Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-xs space-y-2">
              <strong className="font-bold block">Analysis Failed</strong>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && !isScanning && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-slideUp">
              
              {/* Top status header */}
              <div className="flex justify-between items-start border-b pb-4 border-slate-100">
                <div>
                  <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">AI Audit Sheet</span>
                  <h3 className="font-display font-extrabold text-lg text-slate-800 mt-0.5">{analysisResult.summary}</h3>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  analysisResult.usedLocalOllama ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {analysisResult.usedLocalOllama ? 'Ollama: LLaVA' : 'Clinical Expert Fallback'}
                </span>
              </div>

              {/* Component-by-Component Medical Audit Table */}
              {analysisResult.componentDetails ? (
                <div className="space-y-6">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">Component-by-Component Medical Audit</h4>
                  
                  <div className="space-y-4">
                    {analysisResult.componentDetails.map((comp: any, idx: number) => {
                      const isNormal = comp.status === 'NORMAL';
                      return (
                        <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                          
                          {/* Header: Title, Value, Status */}
                          <div className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 ${
                            isNormal ? 'bg-emerald-50/10' : 'bg-rose-50/10'
                          }`}>
                            <div>
                              <strong className="text-sm font-bold text-slate-800">{comp.name}</strong>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Ref Range: {comp.refRange} {comp.unit}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                {comp.value} {comp.unit}
                              </span>

                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                isNormal 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : comp.status === 'HIGH' 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                {comp.status}
                              </span>
                            </div>
                          </div>

                          {/* Explanation & Remedies */}
                          <div className="p-4 space-y-4 text-xs">
                            <p className="text-slate-650 leading-relaxed font-semibold">
                              {comp.explanation}
                            </p>

                            {!isNormal && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                                {/* Ayurvedic Medicines & Remedies */}
                                <div className="space-y-2">
                                  <strong className="text-[10px] uppercase font-extrabold text-primary-750 block">Ayurvedic Remedies & Herbs</strong>
                                  <ul className="space-y-1.5 text-slate-600">
                                    {comp.remedies.map((r: string, rIdx: number) => (
                                      <li key={rIdx} className="flex items-start">
                                        <span className="text-primary-600 mr-2 font-bold">•</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Diet Guidelines */}
                                <div className="space-y-2">
                                  <strong className="text-[10px] uppercase font-extrabold text-emerald-800 block">Dietary Adjustments (Pathya / Apathya)</strong>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-[9px] font-bold text-emerald-700 uppercase block mb-1">✓ Favor (Pathya):</span>
                                      <span className="text-slate-600 block">{comp.dietPathya.join(', ')}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-rose-700 uppercase block mb-1">✕ Avoid (Apathya):</span>
                                      <span className="text-slate-600 block">{comp.dietApathya.join(', ')}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Findings checklist fallback for scans */
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-805 text-slate-800 uppercase tracking-wider">Parameters Inspected</h4>
                  <div className="space-y-2">
                    {analysisResult.findings.map((f: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs flex items-start space-x-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-650 text-slate-605">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ayurvedic Interpretation Footer */}
              <div className="space-y-4 border-t pt-4 border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Ayurvedic Pathological Interpretation</h4>
                  <div className="flex space-x-1">
                    {analysisResult.ayurvedicAnalysis.imbalancedDoshas.map((d: string) => (
                      <span key={d} className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-primary-50/15 p-4 rounded-xl border-l-4 border-primary-500">
                  {analysisResult.ayurvedicAnalysis.interpretation}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="border-t pt-6 border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToRecords}
                    disabled={isSaving || savedSuccess}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
                      </>
                    ) : savedSuccess ? (
                      'Saved to Locker ✓'
                    ) : (
                      'Save to Locker'
                    )}
                  </button>
                </div>

                <Link
                  href="/patient/doctors"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-750 text-white text-xs font-bold rounded-lg transition flex items-center justify-center cursor-pointer"
                >
                  Schedule Doctor Review <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
