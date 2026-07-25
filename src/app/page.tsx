'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Wind, Flame, Leaf, Sparkles, MessageCircle, FileText, Video, ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import ScrollReveal from '@/components/ui/ScrollReveal';
import MagneticButton from '@/components/ui/MagneticButton';
import Marquee from '@/components/ui/Marquee';
import CustomCursor from '@/components/ui/CustomCursor';

const HeroMandala = dynamic(() => import('@/components/HeroMandala'), { ssr: false });

export default function Home() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeDosha, setActiveDosha] = useState<'vata' | 'pitta' | 'kapha' | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const doshaData = {
    vata: {
      icon: Wind,
      element: 'Air & Space',
      color: '#8FA9B8',
      traits: ['Creative & Quick-thinking', 'Light & Energetic Build', 'Variable Appetite & Digestion', 'Enthusiastic & Adaptable'],
      description: 'Vata governs all movement in the body — from the blinking of your eyes to the flow of your thoughts. When balanced, it brings creativity and vitality.',
    },
    pitta: {
      icon: Flame,
      element: 'Fire & Water',
      color: '#C9683B',
      traits: ['Sharp Intellect & Focus', 'Medium Athletic Build', 'Strong Metabolism', 'Natural Leadership'],
      description: 'Pitta governs transformation — digestion, metabolism, and the processing of experiences. When balanced, it brings clarity, courage, and intelligence.',
    },
    kapha: {
      icon: Leaf,
      element: 'Earth & Water',
      color: '#6E8F6B',
      traits: ['Calm & Compassionate', 'Strong & Sturdy Build', 'Steady Energy & Stamina', 'Loyal & Nurturing'],
      description: 'Kapha provides structure and lubrication — the glue that holds body and mind together. When balanced, it brings strength, immunity, and emotional steadiness.',
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative" id="vedasync-landing-page">
      <CustomCursor />

      {/* ═══════════════ HEADER ═══════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-[#0F1210]/80 backdrop-blur-xl border-b border-[#2A2E2A]/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1" data-cursor="Home">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-ink">Veda</span>
              <span className="text-ink">Sync</span>
              <span className="text-turmeric">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {['Philosophy', 'Doshas', 'Features', 'Physicians'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[13px] font-medium tracking-wide text-ink-muted hover:text-ink transition-colors duration-300"
                data-cursor="View"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-ink-muted hidden sm:block">Namaste, {user.name}</span>
                <Link
                  href={
                    user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user.role === 'DOCTOR'
                      ? '/doctor/dashboard'
                      : '/patient/dashboard'
                  }
                  className="px-5 py-2.5 bg-turmeric text-bg text-xs font-semibold rounded-full transition-all duration-300 hover:opacity-90"
                  data-cursor="Go"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:block text-ink-muted hover:text-ink text-xs font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/patient/login"
                  className="text-ink-muted hover:text-ink text-[13px] font-medium transition-colors"
                  data-cursor="View"
                >
                  Sign In
                </Link>
                <MagneticButton dataCursor="Start" href="/patient/signup">
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-turmeric text-bg text-xs font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,162,75,0.2)]">
                    Get Started
                  </span>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════ SECTION 1 — HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(201,162,75,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center relative z-10">
          {/* Left — Copy */}
          <div className="space-y-8 lg:pr-12">
            <ScrollReveal delay={0.1}>
              <span className="eyebrow">Ayurvedic Telehealth, Reimagined</span>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1
                className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] font-bold tracking-[-0.03em]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="text-ink">Ancient wisdom,</span>
                <br />
                <span className="text-ink">delivered through</span>
                <br />
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #C9A24B, #B5654A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  modern care.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.35}>
              <p className="text-ink-muted text-lg md:text-xl max-w-lg leading-relaxed font-normal">
                Consult verified Ayurvedic physicians, decode your Prakriti with AI,
                and align your health with 5,000 years of clinical wisdom.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <MagneticButton dataCursor="Begin" href="/patient/signup">
                  <span className="inline-flex items-center gap-3 px-8 py-4 bg-turmeric text-bg font-semibold rounded-full text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,75,0.25)]">
                    Begin Your Assessment
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </MagneticButton>
                <MagneticButton dataCursor="Explore" href="#philosophy">
                  <span className="inline-flex items-center gap-3 px-8 py-4 border border-[#2A2E2A] text-ink-muted font-medium rounded-full text-sm transition-all duration-300 hover:border-tulsi hover:text-ink">
                    Explore Our Method
                  </span>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — 3D Mandala */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[600px]">
            <HeroMandala className="w-full h-full" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
          <span className="text-[10px] text-ink-muted tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-turmeric/50 to-transparent" />
        </div>
      </section>

      {/* ═══════════════ SECTION 2 — TRUST MARQUEE ═══════════════ */}
      <section className="border-y border-[#2A2E2A]/50 py-5 relative z-10">
        <Marquee speed={40} pauseOnHover>
          {[
            'BAMS CERTIFIED',
            'MD-AYURVEDA VERIFIED',
            'DISHA-ALIGNED DATA',
            '20,000+ CONSULTATIONS',
            'GEMINI AI-POWERED',
            'SECURE VIDEO CALLS',
            'E-PRESCRIPTIONS',
            'PRAKRITI ANALYSIS',
          ].map((item) => (
            <span
              key={item}
              className="mx-8 text-[11px] font-medium tracking-[0.2em] uppercase text-ink-muted whitespace-nowrap"
            >
              {item}
              <span className="ml-8 text-tulsi">·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ═══════════════ SECTION 3 — SERVICES MARQUEE ═══════════════ */}
      <section className="py-16 md:py-24 relative z-10 overflow-hidden">
        <Marquee speed={50} reverse>
          {[
            'Panchakarma',
            'Kayachikitsa',
            'Dosha Analysis',
            'Dermatology',
            "Women's Health",
            'Pediatric Ayurveda',
            'Diet & Nutrition',
            'Yoga Therapy',
          ].map((item) => (
            <span
              key={item}
              className="mx-6 md:mx-10 text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink/20 whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item}
              <span className="ml-6 md:ml-10 text-tulsi/30">—</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ═══════════════ SECTION 4 — PHILOSOPHY ═══════════════ */}
      <section className="py-24 md:py-40 px-6 md:px-12 relative z-10" id="philosophy">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <span className="eyebrow mb-8 block">Our Philosophy</span>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <h2
              className="text-[clamp(1.8rem,4vw,3.5rem)] leading-[1.15] font-bold tracking-[-0.02em] text-ink max-w-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Every body carries its own rhythm.{' '}
              <span className="text-ink-muted">
                We diagnose the pattern before we prescribe the cure.
              </span>
            </h2>
          </ScrollReveal>

          {/* 3-Step Process */}
          <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {[
              {
                step: '01',
                title: 'Assessment',
                desc: 'Discover your unique Dosha constitution through our AI-powered Prakriti questionnaire, refined by centuries of Ayurvedic clinical methodology.',
              },
              {
                step: '02',
                title: 'AI Analysis',
                desc: 'Upload medical reports and receive Ayurvedic interpretations powered by Gemini AI — bridging modern diagnostics with traditional wisdom.',
              },
              {
                step: '03',
                title: 'Personalized Treatment',
                desc: 'Consult verified BAMS/MD physicians who craft bespoke treatment plans — diet, herbs, lifestyle, and therapeutic protocols tailored to your Prakriti.',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.15}>
                <div className="space-y-4">
                  <span className="text-turmeric text-sm font-semibold tracking-wider">{item.step}</span>
                  <h3
                    className="text-xl md:text-2xl font-bold text-ink"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 5 — DOSHA SHOWCASE ═══════════════ */}
      <section className="py-24 md:py-32 px-6 md:px-12 relative z-10" id="doshas">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <span className="eyebrow mb-8 block text-center">The Three Doshas</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold tracking-[-0.02em] text-ink text-center mb-16 md:mb-20"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your constitution decoded.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {(Object.keys(doshaData) as Array<'vata' | 'pitta' | 'kapha'>).map((key, i) => {
              const dosha = doshaData[key];
              const Icon = dosha.icon;
              const isActive = activeDosha === key;

              return (
                <ScrollReveal key={key} delay={i * 0.1}>
                  <div
                    className="group relative rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden"
                    style={{
                      borderColor: isActive ? dosha.color : '#2A2E2A',
                      backgroundColor: isActive ? `${dosha.color}08` : '#171B17',
                      minHeight: isActive ? '420px' : '280px',
                    }}
                    onMouseEnter={() => setActiveDosha(key)}
                    onMouseLeave={() => setActiveDosha(null)}
                    data-cursor="Explore"
                  >
                    {/* Glow on active */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${dosha.color}10 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative p-8 md:p-10 h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: `${dosha.color}15`, color: dosha.color }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3
                            className="text-xl font-bold text-ink capitalize"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {key}
                          </h3>
                          <span className="text-xs text-ink-muted">{dosha.element}</span>
                        </div>
                      </div>

                      <p className="text-ink-muted text-sm leading-relaxed mb-6">{dosha.description}</p>

                      {/* Expanded traits */}
                      <div
                        className="space-y-2 overflow-hidden transition-all duration-500"
                        style={{
                          maxHeight: isActive ? '200px' : '0px',
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        {dosha.traits.map((trait) => (
                          <div key={trait} className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: dosha.color }}
                            />
                            <span className="text-sm text-ink/80">{trait}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-6">
                        <span
                          className="text-xs font-medium tracking-wider uppercase transition-colors duration-300"
                          style={{ color: isActive ? dosha.color : '#A8A296' }}
                        >
                          {isActive ? 'Discovering...' : 'Hover to explore'} →
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6 — TESTIMONIALS ═══════════════ */}
      <section className="py-24 md:py-32 px-6 md:px-12 relative z-10" id="testimonials">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <span className="eyebrow mb-8 block">Patient Stories</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold tracking-[-0.02em] text-ink mb-16"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Trusted by those who chose a different path.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  'The Prakriti quiz identified my Pitta-Kapha dominance perfectly. Dr. Ananya prescribed Triphala and custom pathya-apathya that resolved my chronic digestion issues in two weeks.',
                name: 'Suresh Kumar',
                role: 'Verified Patient',
                initial: 'S',
              },
              {
                quote:
                  'PrakritiAI\'s quick home remedies are brilliant. When my chest pressure triggered, the AI immediately safety-warned me to consult a physician. That level of responsibility is rare.',
                name: 'Meera Patel',
                role: 'Verified Patient',
                initial: 'M',
              },
            ].map((testimonial, i) => (
              <ScrollReveal key={testimonial.name} delay={i * 0.15}>
                <div className="bg-bg-card border border-[#2A2E2A] rounded-2xl p-8 md:p-10 relative group hover:border-tulsi/30 transition-colors duration-500">
                  {/* Quote mark */}
                  <div className="text-turmeric/20 text-6xl font-serif absolute top-6 right-8 leading-none">
                    &ldquo;
                  </div>

                  <p className="text-ink/80 text-[15px] leading-relaxed mb-8 relative z-10 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tulsi/20 border border-tulsi/30 flex items-center justify-center text-ink font-semibold text-sm">
                      {testimonial.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">{testimonial.name}</h4>
                      <p className="text-xs text-ink-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7 — FEATURES ═══════════════ */}
      <section className="py-24 md:py-32 px-6 md:px-12 relative z-10" id="features">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <span className="eyebrow mb-8 block text-center">Platform Capabilities</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold tracking-[-0.02em] text-ink text-center mb-16 md:mb-20"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Built for precision healing.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'PrakritiAI Chat',
                desc: 'Conversational AI trained on Ayurvedic texts — get instant remedies, diet suggestions, and safety-aware health guidance.',
                color: '#C9A24B',
              },
              {
                icon: FileText,
                title: 'Report Analyzer',
                desc: 'Upload blood work, scans, or prescriptions. Our Gemini-powered engine interprets results through both modern and Ayurvedic lenses.',
                color: '#B5654A',
              },
              {
                icon: Video,
                title: 'Video Consultation',
                desc: 'Secure, real-time video calls with BAMS/MD physicians. Full clinical history access, digital prescriptions, and follow-up scheduling.',
                color: '#6E8F6B',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 0.12}>
                  <div
                    className="group bg-bg-card border border-[#2A2E2A] rounded-2xl p-8 md:p-10 hover:border-tulsi/30 transition-all duration-500 h-full"
                    data-cursor="View"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3
                      className="text-lg font-bold text-ink mb-3"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-ink-muted text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 8 — FOOTER CTA + FOOTER ═══════════════ */}
      <section className="py-32 md:py-48 px-6 md:px-12 relative z-10">
        <div className="max-w-[1100px] mx-auto text-center">
          <ScrollReveal>
            <h2
              className="text-[clamp(1.8rem,4vw,3.5rem)] leading-[1.15] font-bold tracking-[-0.02em] text-ink max-w-3xl mx-auto"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your body already knows the answer.{' '}
              <span className="text-ink-muted italic">
                Let&apos;s find a doctor who speaks its language.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-10">
              <MagneticButton dataCursor="Book" href="/patient/signup">
                <span className="inline-flex items-center gap-3 px-10 py-5 bg-turmeric text-bg font-semibold rounded-full text-base transition-all duration-300 hover:shadow-[0_0_50px_rgba(201,162,75,0.3)]">
                  Book a Consultation
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2E2A]/50 py-16 px-6 md:px-12 relative z-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-ink">VedaSync</span>
              <span className="text-turmeric">.ai</span>
            </span>
            <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
              Bridging 5,000 years of Ayurvedic wisdom with modern telemedicine infrastructure — secure, compliant, and physician-verified.
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-5">For Patients</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li>
                <Link href="/patient/login" className="hover:text-ink transition-colors duration-200">
                  Consult a Physician
                </Link>
              </li>
              <li>
                <Link href="/patient/signup" className="hover:text-ink transition-colors duration-200">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/patient/login" className="hover:text-ink transition-colors duration-200">
                  Prakriti Assessment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5">For Physicians</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li>
                <Link href="/doctor/login" className="hover:text-ink transition-colors duration-200">
                  Doctor Portal
                </Link>
              </li>
              <li>
                <Link href="/doctor/signup" className="hover:text-ink transition-colors duration-200">
                  Apply for Verification
                </Link>
              </li>
              <li>
                <Link href="/doctor/login" className="hover:text-ink transition-colors duration-200">
                  Prescribe Online
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5">Legal & Safety</h4>
            <p className="text-[11px] text-ink-muted/60 leading-relaxed italic">
              VedaSync consultations operate under India&apos;s DISHA health data principles.
              AI triage recommendations are advisory and do not constitute official medical diagnoses.
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto border-t border-[#2A2E2A]/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-ink-muted/50">
            &copy; 2026 VedaSync AI Health. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span className="text-xs text-ink-muted/40">Privacy</span>
            <span className="text-xs text-ink-muted/40">Terms</span>
            <span className="text-xs text-ink-muted/40">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
