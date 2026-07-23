'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Stethoscope, AlertCircle, UploadCloud, Camera, Check, User } from 'lucide-react';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file: File, maxWidth = 800, maxHeight = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      readFileAsDataUrl(file).then(resolve);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export default function DoctorSignup() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [qualification, setQualification] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [feePerConsult, setFeePerConsult] = useState('500');
  const [clinicAddress, setClinicAddress] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');

  const [uploadName, setUploadName] = useState('');
  const [uploadDataUrl, setUploadDataUrl] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  const [capturedImage, setCapturedImage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Ensure webcam stream is attached as soon as video element is rendered
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    setCapturedImage('');
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' },
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      setError('Could not access your webcam. Please allow camera permissions or upload your photo.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
    startCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = 360;
      const height = 450;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (context) {
        context.translate(width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        if (base64 && base64.length > 100) {
          setCapturedImage(base64);
        }
        stopCamera();
      }
    }
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');

  // Password strength check
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (isLongEnough && hasNumber && hasSymbol) {
      setPasswordStrength('strong');
    } else if (password.length >= 6 && (hasNumber || hasSymbol)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field checks
    if (!name || !email || !password || !phone || !regNumber || !specializations || !experienceYears) {
      setError('Please fill in all mandatory physician fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength !== 'strong') {
      setError('Password must meet minimum strength requirements (8+ characters, at least one number and one symbol)');
      return;
    }
    if (!uploadName) {
      setError('Please upload your license/degree credentials proof');
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
    }

    if (!capturedImage) {
      setError('Please capture or upload your Face ID photograph');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: 'DOCTOR',
          doctorDetails: {
            qualification,
            regNumber,
            specializations,
            experienceYears: parseInt(experienceYears),
            feePerConsult: parseFloat(feePerConsult),
            clinicAddress,
            languages,
            documents: uploadDataUrl || uploadName,
            aadhaarNumber: cleanAadhaar,
            faceIdImage: capturedImage,
          },
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (res.status === 413 || text.includes('Request Entity')) {
          setError('Registration failed: Uploaded file or photo size is too large (max 3MB). Please select a smaller file.');
          return;
        }
        setError(`Server returned an error (${res.status}). Please try again.`);
        return;
      }

      if (res.ok) {
        // Redirect to pending review holding page directly
        router.push('/doctor/pending');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration fetch error:', err);
      setError(err?.message || 'Registration failed. Network payload issue.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (passwordStrength === 'weak') return 'bg-red-500 w-1/3';
    if (passwordStrength === 'medium') return 'bg-yellow-500 w-2/3';
    if (passwordStrength === 'strong') return 'bg-green-600 w-full';
    return 'bg-slate-200 w-0';
  };

  const getStrengthText = () => {
    if (passwordStrength === 'weak') return 'Weak';
    if (passwordStrength === 'medium') return 'Medium';
    if (passwordStrength === 'strong') return 'Strong & Secure!';
    return '';
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cream font-sans" id="doctor-signup-page">
      {/* Visual Side */}
      <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600 rounded-full opacity-20 filter blur-3xl"></div>
        
        <div className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center font-bold text-lg text-primary-850">
            VS
          </div>
          <span className="font-display font-bold text-2xl tracking-wide">VedaSync</span>
        </div>

        <div className="my-auto z-10 max-w-md">
          <div className="flex items-center space-x-2 text-gold-100 font-semibold mb-3">
            <Stethoscope className="w-5 h-5 text-gold-600" />
            <span>Join Our Medical Network</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Practice Ayurveda Digitally.
          </h1>
          <p className="text-primary-100 text-lg">
            Register your credentials, define your consulting fees, and start conducting video consultations with patients worldwide upon Admin validation.
          </p>
        </div>

        <div className="text-sm text-primary-100 opacity-70 z-10">
          &copy; 2026 VedaSync AI Health. All rights reserved.
        </div>
      </section>

      {/* Form Side */}
      <section className="flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 my-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700"></div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-800 font-display">Apply as Physician</h2>
            <p className="text-slate-500 text-sm mt-1">Submit your medical license & qualifications for verification.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm mb-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest border-b border-slate-100 pb-1">1. Account Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.rajesh@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="languages" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Languages Spoken</label>
                <input
                  id="languages"
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Hindi, Sanskrit"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}></div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Security Check:</span>
                  <span className="font-bold uppercase tracking-wider text-slate-700">{getStrengthText()}</span>
                </div>
              </div>
            )}

            <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest border-b border-slate-100 pt-4 pb-1">2. Professional Medical Credentials</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="qualification" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Highest Degree / Qualification</label>
                <select
                  id="qualification"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                >
                  <option value="">Select Degree</option>
                  <option value="BAMS">BAMS (Bachelor of Ayurvedic Medicine and Surgery)</option>
                  <option value="MD (Ayurveda)">MD (Ayurveda)</option>
                  <option value="BAMS, PhD">BAMS, PhD (Ayurvedic Research)</option>
                  <option value="MS (Ayurveda)">MS (Ayurvedic Surgery)</option>
                </select>
              </div>
              <div>
                <label htmlFor="regNumber" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Medical Registration Number</label>
                <input
                  id="regNumber"
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g., AYUR-67890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="specializations" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Areas of Specialization</label>
                <input
                  id="specializations"
                  type="text"
                  required
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g., Panchakarma, Kayachikitsa, Shalya Tantra"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Years of Exp</label>
                <input
                  id="experience"
                  type="number"
                  required
                  min={0}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fee" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Fee per Consult (INR)</label>
                <input
                  id="fee"
                  type="number"
                  required
                  min={100}
                  value={feePerConsult}
                  onChange={(e) => setFeePerConsult(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clinic / Hospital Address</label>
                <input
                  id="address"
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="45 Lotus Ayurveda Hub, Lajpat Nagar, Delhi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Upload Medical Credentials (License / Degree)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadName(file.name);
                      if (file.size > 3.5 * 1024 * 1024) {
                        setError('Document size must be under 3.5MB. Please select a smaller scan or PDF.');
                        setUploadDataUrl('');
                        return;
                      }
                      setError('');
                      const compressed = await compressImageFile(file, 800, 1000, 0.7);
                      setUploadDataUrl(compressed);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-primary-600">Click to upload files</span>
                <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 3.5MB</p>
                {uploadName && (
                  <span className="text-xs font-bold text-green-600 block mt-2">✓ Selected: {uploadName}</span>
                )}
              </div>
            </div>

            <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest border-b border-slate-100 pt-4 pb-1">3. Identity Verification & KYC</h3>

            <div>
              <label htmlFor="aadhaar" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">12-Digit Aadhaar Number</label>
              <input
                id="aadhaar"
                type="text"
                required
                maxLength={14}
                value={aadhaarNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setAadhaarNumber(formatted.substring(0, 14));
                }}
                placeholder="1234 5678 9012"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800 text-sm"
              />
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Face ID Capture (Oval Camera Scan)</label>
              
              <div className="flex flex-col items-center space-y-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="relative w-44 h-56 bg-slate-900 rounded-[50%_/_60%_60%_40%_40%] overflow-hidden border-4 border-emerald-500 shadow-xl flex items-center justify-center">
                  {capturedImage ? (
                    <img src={capturedImage} alt="Captured Face ID" className="w-full h-full object-cover animate-fadeIn" />
                  ) : cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <User className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">No Photo Captured</span>
                    </div>
                  )}
                  <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-[50%] pointer-events-none"></div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {!cameraActive ? (
                    <>
                      <button
                        type="button"
                        onClick={capturedImage ? retakePhoto : startCamera}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-750 text-white rounded-lg text-xs font-bold transition flex items-center shadow-sm cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 mr-1.5" />
                        {capturedImage ? 'Retake Photo' : 'Start Camera'}
                      </button>

                      <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center shadow-sm cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
                        <span>Upload Face Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImageFile(file, 400, 500, 0.7);
                              setCapturedImage(compressed);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Capture Face
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-750 text-white font-bold rounded-lg transition duration-250 flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md text-sm mt-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Submit Practitioner Application
            </button>

            <div className="text-center text-sm font-medium text-slate-600 mt-6">
              Already have an account?{' '}
              <Link href="/doctor/login" className="text-primary-600 font-bold hover:text-primary-700 underline transition">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
