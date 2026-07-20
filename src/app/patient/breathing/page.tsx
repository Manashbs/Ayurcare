'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Info, ShieldAlert, Award } from 'lucide-react';

interface BreathingPattern {
  name: string;
  sanskrit: string;
  desc: string;
  dosha: 'Vata' | 'Pitta' | 'Kapha' | 'All';
  phases: { name: 'Inhale' | 'Hold' | 'Exhale' | 'Hold'; duration: number; soundFreq: number }[];
}

const PATTERNS: BreathingPattern[] = [
  {
    name: 'Box Breathing (Sama Vritti)',
    sanskrit: 'Sama Vritti Pranayama',
    desc: 'Equal duration box breathing. Highly grounding, relieves acute anxiety, and balances Vata dosha.',
    dosha: 'Vata',
    phases: [
      { name: 'Inhale', duration: 4, soundFreq: 440 },
      { name: 'Hold', duration: 4, soundFreq: 554 },
      { name: 'Exhale', duration: 4, soundFreq: 330 },
      { name: 'Hold', duration: 4, soundFreq: 277 },
    ],
  },
  {
    name: 'Cooling Breath (Shheetali)',
    sanskrit: 'Shheetali Pranayama',
    desc: 'Inhale through the curled tongue (or pursed lips) and exhale through the nose. Instantly cools the body and pacifies Pitta anger.',
    dosha: 'Pitta',
    phases: [
      { name: 'Inhale', duration: 4, soundFreq: 523 },
      { name: 'Hold', duration: 2, soundFreq: 659 },
      { name: 'Exhale', duration: 6, soundFreq: 349 },
      { name: 'Hold', duration: 0, soundFreq: 0 },
    ],
  },
  {
    name: 'Stimulating Breath (Bhastrika)',
    sanskrit: 'Bhastrika Pranayama',
    desc: 'Rapid and forceful inhalation and exhalation. Energizes the system, clears congestion, and stimulates Kapha sluggishness.',
    dosha: 'Kapha',
    phases: [
      { name: 'Inhale', duration: 2, soundFreq: 587 },
      { name: 'Exhale', duration: 2, soundFreq: 440 },
    ],
  },
  {
    name: 'Calming Breath (Nadi Shodhana)',
    sanskrit: 'Nadi Shodhana Pranayama',
    desc: 'Alternate nostril breathing. Harmonizes the left and right hemispheres of the brain, balancing all three doshas.',
    dosha: 'All',
    phases: [
      { name: 'Inhale', duration: 4, soundFreq: 440 },
      { name: 'Hold', duration: 4, soundFreq: 554 },
      { name: 'Exhale', duration: 4, soundFreq: 330 },
      { name: 'Hold', duration: 4, soundFreq: 277 },
    ],
  },
];

export default function BreathingSpace() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(PATTERNS[0].phases[0].duration);
  const [isMuted, setIsMuted] = useState(false);

  // Statistics tracker
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalSecondsBreathed, setTotalSecondsBreathed] = useState(0);

  // Timer settings
  const [sessionMinutes, setSessionMinutes] = useState(2);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(120);

  const pattern = PATTERNS[selectedIdx];
  const phase = pattern.phases[currentPhaseIdx] || pattern.phases[0];

  // Ref to handle AudioContext safety
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on user interaction
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    return audioCtxRef.current;
  };

  const playSound = (freq: number, duration: number) => {
    if (isMuted || freq === 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      // Resume if suspended (browser security block)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio Playback blocked or failed:', e);
    }
  };

  // Reset pattern triggers
  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIdx(0);
    setPhaseSecondsLeft(pattern.phases[0].duration);
    setSessionSecondsLeft(sessionMinutes * 60);
  };

  // Trigger reset whenever pattern or duration settings change
  useEffect(() => {
    handleReset();
  }, [selectedIdx, sessionMinutes]);

  const handleTogglePlay = () => {
    // Directly resume AudioContext on user gesture (avoids security blocking)
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.warn('Could not initialize AudioContext on gesture:', e);
    }
    setIsActive(!isActive);
  };

  const handleToggleMute = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {}
    setIsMuted(!isMuted);
  };

  // Use refs for values needed inside the interval to avoid stale closures
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  // Main breathing loop ticker — only depends on isActive
  useEffect(() => {
    if (!isActive) return;

    // Play sound at the very start
    const currentPhase = patternRef.current.phases[currentPhaseIdx] || patternRef.current.phases[0];
    playSound(currentPhase.soundFreq, 0.4);

    const interval = setInterval(() => {
      // Decrease phase timer
      setPhaseSecondsLeft((prevPhase) => {
        if (prevPhase <= 1) {
          // Phase is finishing — transition to next
          setCurrentPhaseIdx((prevIdx) => {
            const pat = patternRef.current;
            let nextIdx = (prevIdx + 1) % pat.phases.length;
            let nextPhase = pat.phases[nextIdx];

            // Skip 0-duration phases
            if (nextPhase.duration === 0) {
              nextIdx = (nextIdx + 1) % pat.phases.length;
              nextPhase = pat.phases[nextIdx];
            }

            // Set the new phase duration
            setPhaseSecondsLeft(nextPhase.duration);

            // Play the phase transition sound
            if (!isMutedRef.current && nextPhase.soundFreq > 0) {
              playSound(nextPhase.soundFreq, 0.4);
            }

            return nextIdx;
          });

          // Return a high number temporarily; it will be overwritten by setPhaseSecondsLeft above
          return 999;
        }
        return prevPhase - 1;
      });

      // Decrease session timer
      setSessionSecondsLeft((prevSession) => {
        if (prevSession <= 1) {
          // Session complete!
          setIsActive(false);
          playSound(660, 0.6);
          setTimeout(() => playSound(880, 0.8), 200);
          setTimeout(() => {
            alert('Pranayama session completed! Peace and energy integrated.');
            setCurrentPhaseIdx(0);
            setPhaseSecondsLeft(patternRef.current.phases[0].duration);
            setSessionSecondsLeft(patternRef.current.phases[0].duration);
          }, 50);
          setCompletedSessions((prev) => prev + 1);
          return 0;
        }
        return prevSession - 1;
      });

      setTotalSecondsBreathed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]); // Only re-run when isActive changes

  // Calculate animated circle scale and label
  const getCircleScaleClass = () => {
    if (!isActive) return 'scale-90';
    if (phase.name === 'Inhale') return 'scale-125 duration-[1500ms]';
    if (phase.name === 'Exhale') return 'scale-75 duration-[1500ms]';
    return 'scale-100 duration-[1500ms]'; // Holds remain static
  };

  const getPhaseColorClass = () => {
    if (phase.name === 'Inhale') return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
    if (phase.name === 'Exhale') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    return 'border-primary-500 bg-primary-500/10 text-primary-400'; // Holds
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans" id="breathing-space-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-600 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Wind className="w-6 h-6 text-gold-100 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Breathing Space (Pranayama)</h1>
            <p className="text-primary-100 text-sm mt-1">Calm your mind, balance your Doshas, and ground your life force with rhythmic breaths.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Technique Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow">
            <h3 className="text-slate-800 font-bold text-base mb-4">
              Choose Pranayama
            </h3>
            <div className="space-y-3">
              {PATTERNS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-premium cursor-pointer ${
                    selectedIdx === idx
                      ? 'border-primary-600 bg-primary-50/50 shadow-sm font-bold'
                      : 'border-zinc-100 hover:border-zinc-300 bg-slate-50/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.dosha === 'Vata' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' :
                      p.dosha === 'Pitta' ? 'bg-amber-50 border border-amber-100 text-amber-700' :
                      p.dosha === 'Kapha' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                      'bg-slate-50 border border-slate-100 text-slate-700'
                    }`}>
                      {p.dosha === 'All' ? 'Tri-Dosha' : `${p.dosha} Balancer`}
                    </span>
                  </div>
                  <strong className="block text-slate-800 text-sm mt-2 font-bold">{p.name}</strong>
                  <span className="block text-[10px] text-slate-400 font-medium italic mt-0.5">{p.sanskrit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session settings */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow">
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-3">Session Length</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSessionMinutes(mins)}
                  disabled={isActive}
                  className={`py-2 rounded-lg text-xs font-bold border transition-premium cursor-pointer disabled:opacity-50 ${
                    sessionMinutes === mins
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm font-extrabold'
                      : 'border-zinc-200 hover:border-zinc-350 text-slate-655 bg-white'
                  }`}
                >
                  {mins} Min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Interactive Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center gap-6 min-h-[500px] relative overflow-hidden">
            {/* Guide Text */}
            <div className="text-center space-y-2 max-w-md relative z-10">
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest block">Active Exercise</span>
              <h2 className="text-white text-xl font-bold">{pattern.name}</h2>
              <p className="text-slate-450 text-xs leading-relaxed">{pattern.desc}</p>
            </div>

            {/* Interactive Breathing Sphere */}
            <div className="my-6 flex items-center justify-center relative" style={{ zIndex: 30 }}>
              {/* Outer halo pulsing glow */}
              <div className="absolute w-52 h-52 rounded-full border border-dashed border-slate-800 animate-spin-slow" style={{ pointerEvents: 'none' }}></div>
              
              {/* Actual breathing sphere - CLICKABLE */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                style={{ position: 'relative', zIndex: 50 }}
                className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all ease-in-out duration-[1500ms] shadow-2xl cursor-pointer focus:outline-none hover:opacity-80 active:scale-95 ${getCircleScaleClass()} ${getPhaseColorClass()}`}
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 pointer-events-none">
                  {isActive ? phase.name : 'Ready'}
                </span>
                <span className="text-3xl font-extrabold mt-1 pointer-events-none">
                  {isActive ? phaseSecondsLeft : 'GO'}
                </span>
                {phase.name === 'Hold' && isActive && (
                  <span className="text-[8px] uppercase font-bold tracking-wide mt-0.5 animate-pulse pointer-events-none">
                    Hold Breath
                  </span>
                )}
              </button>
            </div>

            {/* Controller Dashboard */}
            <div className="w-full max-w-sm flex flex-col items-center space-y-6 relative z-10">
              {/* Session completion info */}
              <div className="flex justify-between items-center w-full px-4 text-xs font-semibold text-slate-400">
                <span>Remaining: <strong className="text-white font-bold">{formatTime(sessionSecondsLeft)}</strong></span>
                <span>Phase Pattern: <strong className="text-white font-bold">{pattern.phases.map(p => p.duration === 0 ? '' : p.duration).filter(Boolean).join('-')}s</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleToggleMute}
                  className={`w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center transition hover:bg-slate-800 cursor-pointer`}
                  title={isMuted ? 'Unmute guide tones' : 'Mute guide tones'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-450" /> : <Volume2 className="w-4 h-4 text-gold-600" />}
                </button>

                <button
                  onClick={handleTogglePlay}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg hover:scale-105 ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-primary-600 text-slate-900'
                  }`}
                >
                  {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-slate-900 ml-1" />}
                </button>

                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center transition hover:bg-slate-800 text-slate-450 hover:text-white cursor-pointer"
                  title="Reset session"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's Progress</span>
                <strong className="text-slate-800 text-base font-bold">{completedSessions} Sessions</strong>
                <span className="text-[10px] text-slate-450 block mt-0.5">Total breathed: {totalSecondsBreathed}s</span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 premium-shadow flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-bold block mb-0.5">Ayurvedic Guideline</strong>
                Sit comfortably with spine straight. For Alternate Nostril (Nadi Shodhana), close right nostril on inhale, close left on exhale.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
