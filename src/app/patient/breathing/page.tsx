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
  const phase = pattern.phases[currentPhaseIdx];

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

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
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

  // Main breathing loop ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      // Play sound at start of a phase
      if (phaseSecondsLeft === phase.duration) {
        playSound(phase.soundFreq, 0.4);
      }

      interval = setInterval(() => {
        // Decrease timers
        setPhaseSecondsLeft((prev) => prev - 1);
        setSessionSecondsLeft((prev) => Math.max(0, prev - 1));
        setTotalSecondsBreathed((prev) => prev + 1);

        // Check if session is completed
        if (sessionSecondsLeft <= 1) {
          setIsActive(false);
          setCompletedSessions((prev) => prev + 1);
          playSound(660, 0.6); // Bell sound
          setTimeout(() => playSound(880, 0.8), 200);
          alert('Pranayama session completed! Peace and energy integrated.');
          handleReset();
          return;
        }

        // Handle phase transition
        if (phaseSecondsLeft <= 1) {
          const nextIdx = (currentPhaseIdx + 1) % pattern.phases.length;
          // Skip phases with 0 duration (like Hold in Shheetali)
          const nextPhase = pattern.phases[nextIdx];
          if (nextPhase.duration === 0) {
            const wrapIdx = (nextIdx + 1) % pattern.phases.length;
            setCurrentPhaseIdx(wrapIdx);
            setPhaseSecondsLeft(pattern.phases[wrapIdx].duration);
          } else {
            setCurrentPhaseIdx(nextIdx);
            setPhaseSecondsLeft(nextPhase.duration);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseSecondsLeft, currentPhaseIdx, pattern, sessionSecondsLeft]);

  // Calculate animated circle scale and label
  const getCircleScaleClass = () => {
    if (!isActive) return 'scale-90';
    if (phase.name === 'Inhale') return 'scale-125 duration-1000';
    if (phase.name === 'Exhale') return 'scale-75 duration-1000';
    return 'scale-100 duration-1000'; // Holds remain static
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
    <div className="space-y-8 max-w-5xl mx-auto" id="breathing-space-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-550 rounded-full opacity-35 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Wind className="w-6 h-6 text-gold-100 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Breathing Space (Pranayama)</h1>
            <p className="text-primary-100 text-sm mt-1">Calm your mind, balance your Doshas, and ground your life force with rhythmic breaths.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Technique Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-slate-800 font-bold text-base mb-4 flex items-center">
              Choose Pranayama
            </h3>
            <div className="space-y-3">
              {PATTERNS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                    selectedIdx === idx
                      ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      p.dosha === 'Vata' ? 'bg-indigo-100 text-indigo-700' :
                      p.dosha === 'Pitta' ? 'bg-amber-100 text-amber-700' :
                      p.dosha === 'Kapha' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {p.dosha === 'All' ? 'Tri-Dosha' : `${p.dosha} Balancing`}
                    </span>
                  </div>
                  <strong className="block text-slate-800 text-sm mt-2 font-bold">{p.name}</strong>
                  <span className="block text-[11px] text-slate-500 font-medium italic mt-0.5">{p.sanskrit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm mb-3">Session Length</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSessionMinutes(mins)}
                  disabled={isActive}
                  className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer disabled:opacity-50 ${
                    sessionMinutes === mins
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
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
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-8 lg:p-12 shadow-xl flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden">
            {/* Guide Text */}
            <div className="text-center space-y-2 max-w-md relative z-10">
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest block">Active Exercise</span>
              <h2 className="text-white text-xl font-bold">{pattern.name}</h2>
              <p className="text-slate-400 text-xs leading-relaxed">{pattern.desc}</p>
            </div>

            {/* Interactive Breathing Sphere */}
            <div className="my-8 flex items-center justify-center relative">
              {/* Outer halo pulsing glow */}
              <div className={`absolute w-52 h-52 rounded-full border-2 border-dashed border-slate-800 animate-spin-slow`}></div>
              
              {/* Actual breathing sphere */}
              <div
                onClick={() => setIsActive(!isActive)}
                className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all ease-in-out duration-1000 shadow-2xl relative z-10 cursor-pointer hover:scale-105 select-none ${getCircleScaleClass()} ${getPhaseColorClass()}`}
                title={isActive ? 'Click to Pause exercise' : 'Click GO to Start exercise'}
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                  {isActive ? phase.name : 'Ready'}
                </span>
                <span className="text-3xl font-extrabold mt-1">
                  {isActive ? phaseSecondsLeft : 'GO'}
                </span>
                {phase.name === 'Hold' && isActive && (
                  <span className="text-[8px] uppercase font-bold tracking-wide mt-0.5 animate-pulse">
                    Hold Breath
                  </span>
                )}
              </div>
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
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center transition hover:bg-slate-850 cursor-pointer`}
                  title={isMuted ? 'Unmute guide tones' : 'Mute guide tones'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-gold-100" />}
                </button>

                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg hover:scale-105 ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-primary-500 text-slate-900'
                  }`}
                >
                  {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-slate-900 ml-1" />}
                </button>

                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center transition hover:bg-slate-850 text-slate-400 hover:text-white cursor-pointer"
                  title="Reset session"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Today's Progress</span>
                <strong className="text-slate-800 text-lg font-bold">{completedSessions} Sessions</strong>
                <span className="text-[11px] text-slate-400 block mt-0.5">Total breathed: {totalSecondsBreathed}s</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-55 bg-indigo-50 flex items-center justify-center">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800 font-bold block mb-0.5">Ayurvedic Practice Guideline</strong>
                Sit comfortably with spine straight. For Alternate Nostril (Nadi Shodhana), close right nostril on inhale, close left on exhale.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
