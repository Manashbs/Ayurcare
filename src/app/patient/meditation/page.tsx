'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Award, Smile, Heart, Eye } from 'lucide-react';

interface MeditationTrack {
  id: string;
  name: string;
  sanskrit: string;
  level: 'Beginner' | 'Medium' | 'Advanced';
  desc: string;
  durationMin: number;
  instructions: string[];
}

const MEDITATION_TRACKS: MeditationTrack[] = [
  // Beginner
  {
    id: 'beg-1',
    name: 'Anapanasati (Breath Awareness)',
    sanskrit: 'आनापानसती',
    level: 'Beginner',
    desc: 'Focus solely on the touch of the breath at the tip of the nose or upper lip. Simples path to calm a scattered Vata mind.',
    durationMin: 5,
    instructions: [
      'Find a comfortable, erect sitting posture. Close your eyes softly.',
      'Bring all attention to the natural, unforced flow of breath entering and leaving your nostrils.',
      'Do not control the breath. Simply observe its temperature and speed.',
      'If thoughts wander, gently guide focus back to the breath without judgement.',
    ],
  },
  {
    id: 'beg-2',
    name: 'Basic Yoga Nidra (Body Scan)',
    sanskrit: 'योग निद्रा',
    level: 'Beginner',
    desc: 'Systematically rotate awareness through different body parts to release deep muscle tension and reset stress responses.',
    durationMin: 10,
    instructions: [
      'Lie flat on your back in Savasana. Let your limbs relax fully.',
      'Begin by noticing your toes, then move your awareness slowly to your ankles, shins, knees, and thighs.',
      'Gradually climb through the abdomen, chest, back, fingers, forearms, throat, and face.',
      'Relax every muscle group as your attention touches it, remaining awake but deeply rested.',
    ],
  },
  {
    id: 'beg-3',
    name: 'Soham Mantra Resonance',
    sanskrit: 'सोऽहम् ध्यान',
    level: 'Beginner',
    desc: 'Internally repeat the universal mantra: "So" on the inhale (meaning "That") and "Ham" on the exhale (meaning "I am").',
    durationMin: 5,
    instructions: [
      'Sit comfortably and relax your shoulders.',
      'As you inhale naturally, hear the sound "So" echoing in your mind.',
      'As you exhale naturally, hear the sound "Ham" releasing from your body.',
      'Melt into the vibration, feeling connected to the wider universe.',
    ],
  },
  
  // Medium (Intermediate)
  {
    id: 'med-1',
    name: 'Metta (Loving-Kindness)',
    sanskrit: 'मैत्री भावना',
    level: 'Medium',
    desc: 'Cultivate compassionate energy. Highly recommended to pacify angry or critical Pitta fires.',
    durationMin: 10,
    instructions: [
      'Sit with hand on heart. Breathe warmth into your chest.',
      'Direct loving thoughts to yourself: "May I be happy, may I be healthy, may I live with ease."',
      'Expand the circle: Send these wishes to loved ones, then to neutral people, and finally to those you find difficult.',
      'Bathe in the cooling, soothing feeling of boundless compassion.',
    ],
  },
  {
    id: 'med-2',
    name: 'Chakra Light Visualization',
    sanskrit: 'चक्र ध्यान',
    level: 'Medium',
    desc: 'Visualize energy vortices along your spine starting from the tailbone to the crown of your head to balance endocrine channels.',
    durationMin: 12,
    instructions: [
      'Keep your spine perfectly straight. Breathe slowly.',
      'Visualize a red light at the tailbone, shifting to orange below the navel, yellow at the solar plexus.',
      'Rise to green at the heart, blue at the throat, indigo at the third eye, and violet/white at the crown.',
      'Feel all energy centers spinning harmoniously and radiating clear light.',
    ],
  },

  // Advanced
  {
    id: 'adv-1',
    name: 'Mauna (Transcendental Silence)',
    sanskrit: 'मौन ध्यान',
    level: 'Advanced',
    desc: 'A practice of absolute quiet. Restrain the urge to comment, judge, or speak internally. Immerse in the silent void.',
    durationMin: 15,
    instructions: [
      'Adopt a steady meditation posture. Resolve to stay absolutely still.',
      'Observe the space between your thoughts, the silent backdrop of awareness.',
      'Do not follow any thoughts that arise. Let them pass like clouds in an empty sky.',
      'Sink deep into the silent, non-conceptual witness state (Sakshi Bhava).',
    ],
  },
  {
    id: 'adv-2',
    name: 'Shunya (Void Meditation)',
    sanskrit: 'शून्य समाधि',
    level: 'Advanced',
    desc: 'Dissolve all object awareness. Turn consciousness back upon itself, meditating on the vast emptiness of pure presence.',
    durationMin: 20,
    instructions: [
      'Settle into Lotus or Half-Lotus. Keep neck aligned and chin slightly tucked.',
      'Inhale deeply, exhale completely, and hold the breath out briefly to settle your energy.',
      'Drop all mental representations of form, body, space, and time.',
      'Abide as pure, contentless, spacious consciousness (Shunya).',
    ],
  },
];

export default function MeditationSpace() {
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Medium' | 'Advanced'>('Beginner');
  const [activeTrack, setActiveTrack] = useState<MeditationTrack>(MEDITATION_TRACKS[0]);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(activeTrack.durationMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Guide message states
  const [instructionIdx, setInstructionIdx] = useState(0);

  // Audio refs for Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Switch track updates timer
  useEffect(() => {
    setTimeLeft(activeTrack.durationMin * 60);
    setIsRunning(false);
    setInstructionIdx(0);
    stopAmbientHum();
  }, [activeTrack]);

  // Main countdown timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          
          // Rotate guide text based on elapsed time
          const totalSec = activeTrack.durationMin * 60;
          const segmentSec = totalSec / activeTrack.instructions.length;
          const currentSegment = Math.floor((totalSec - next) / segmentSec);
          if (currentSegment < activeTrack.instructions.length) {
            setInstructionIdx(currentSegment);
          }

          return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      stopAmbientHum();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeTrack]);

  const toggleTimer = () => {
    if (!isRunning) {
      startAmbientHum();
      setIsRunning(true);
    } else {
      pauseAmbientHum();
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(activeTrack.durationMin * 60);
    setInstructionIdx(0);
    stopAmbientHum();
  };

  // Synthesize soft ambient singing-bowl sound
  const startAmbientHum = () => {
    if (isMuted) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Recreate oscillator if needed
      if (!oscillatorRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 136.1 Hz (Ohm / Cosmic frequency in sound therapy)
        osc.frequency.setValueAtTime(136.1, ctx.currentTime);
        osc.type = 'sine';

        // Connect nodes
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Gentle volume
        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        // If already exists just ramp volume up
        gainNodeRef.current?.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1);
      }
    } catch (e) {
      console.warn('AudioContext failed to start', e);
    }
  };

  const pauseAmbientHum = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
    }
  };

  const stopAmbientHum = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      pauseAmbientHum();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (isRunning) {
        startAmbientHum();
      }
    }
  };

  // Clean audio context on unmount
  useEffect(() => {
    return () => {
      stopAmbientHum();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const filteredTracks = MEDITATION_TRACKS.filter((t) => t.level === selectedLevel);

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="meditation-space-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500 rounded-full opacity-30 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Dhyana (Meditation Space)</h1>
            <p className="text-indigo-100 text-sm mt-1">Quiet your mind and center your biological energies with level-appropriate meditation techniques.</p>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Level Select and Tracks List (lg:col-span-4) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Difficulty Tier</span>
            
            {/* Level Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs font-bold text-slate-650 bg-slate-50 text-slate-600">
              {(['Beginner', 'Medium', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    const matched = MEDITATION_TRACKS.find((t) => t.level === lvl);
                    if (matched) setActiveTrack(matched);
                  }}
                  className="py-2 rounded-lg transition cursor-pointer"
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks List */}
          <div className="space-y-3">
            <h3 className="text-slate-800 font-bold text-sm">Available Meditation Tracks</h3>
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setActiveTrack(track)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 select-none ${
                  activeTrack.id === track.id
                    ? 'border-indigo-300 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-bold">{track.name}</strong>
                    <span className="text-[9px] font-sans font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {track.sanskrit}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">{track.desc}</p>
                  <span className="text-[9px] text-indigo-600 font-bold block mt-2">{track.durationMin} Minutes Sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual player dashboard (lg:col-span-8) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-between min-h-[500px] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Active Meditation</span>
            <h2 className="font-display font-extrabold text-xl text-slate-800">{activeTrack.name}</h2>
            <span className="text-xs text-slate-400 font-medium italic block">Sanskrit: {activeTrack.sanskrit}</span>
          </div>

          {/* Pulsating Visual Focus Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer animated ripple */}
            <div className={`absolute inset-0 rounded-full bg-indigo-100/40 transition-all duration-[3000ms] ${
              isRunning ? 'animate-ping' : ''
            }`}></div>
            
            {/* Middle breathing sphere */}
            <div className={`absolute w-36 h-36 rounded-full border-2 border-indigo-200/50 bg-indigo-50/50 flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${
              isRunning ? 'scale-110' : 'scale-95'
            }`}>
              <div className="text-3xl font-mono font-bold text-slate-800 tracking-wider">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Guide Message Panel */}
          <div className="w-full text-center max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[85px] flex items-center justify-center">
            <p className="text-xs text-slate-650 text-slate-600 leading-relaxed font-semibold italic animate-fadeIn">
              {isRunning
                ? activeTrack.instructions[instructionIdx] || 'Maintain quiet silence. Remain centered.'
                : 'Tap Play below to begin your quiet session. Settle into a comfortable posture.'}
            </p>
          </div>

          {/* Player controls */}
          <div className="flex items-center space-x-6">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-full transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className="p-5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-full transition cursor-pointer shadow-md"
              title={isRunning ? 'Pause' : 'Play'}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition cursor-pointer ${
                isMuted ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
              }`}
              title={isMuted ? 'Unmute' : 'Mute Ambient Hum'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-medium flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tone Generator is calibrated at Ohm (136.1 Hz) to support cerebral peace.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
