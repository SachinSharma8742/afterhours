"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, Calendar, Clock } from "lucide-react";

// Event Target Date: November 4, 2026, 18:00 IST (6:00 PM)
const EVENT_DATE = new Date("2026-11-04T18:00:00+05:30");

function getTimeRemaining() {
  const target = new Date("2026-11-04T18:00:00+05:30").getTime();
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return mounted ? timeLeft : getTimeRemaining();
}

export default function HomePage() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "WHEN AND WHERE IS THE EVENT TAKING PLACE?",
      a: "AfterHours: Glow & Rave takes place on Wednesday, 4 November 2026, from 06:00 PM to 10:00 PM at The Royal Palm, Jagatpura, Jaipur.",
    },
    {
      q: "HOW DOES REGISTRATION AND APPROVAL WORK?",
      a: "Registration approval is required. The host reviews your booking request before confirming your spot. Once approved, you will receive your direct payment link and digital gate pass on WhatsApp.",
    },
    {
      q: "WHAT ARE THE PASS CATEGORIES & PRICING?",
      a: "Passes start from ₹499: Female Stag (₹499), Male Stag (₹699), Couple Pass (₹999), and Group of 5 [3 Girls & 2 Boys] (₹2,250). All tiers include complete venue admission and dance arena access.",
    },
    {
      q: "WHAT IS THE DRESS CODE & ENTRY POLICY?",
      a: "The theme is Glow & Rave — festive fits on point, smart casuals, or neon festival chic. Entry is strictly 16+ only with a valid photo ID and verified digital pass.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen text-[#f7f1e5] overflow-hidden font-montserrat">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Full-Bleed Luxury Background Showcase)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden flex flex-col items-center">
        {/* Full-Bleed Atmospheric Background Wrapper */}
        <div className="relative w-full aspect-[16/7.2] min-h-[440px] sm:min-h-[520px] max-h-[740px] overflow-hidden">
          <img
            src="/images/hero-banner.png?v=afterhours-2026"
            alt="AfterHours: Glow & Rave Pre Diwali Party | 4 Nov 2026"
            className="w-full h-full object-cover object-top sm:object-center block"
          />

          {/* Top seamless blend with fixed navbar */}
          <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#0e0a0c] via-[#0e0a0c]/60 to-transparent pointer-events-none" />

          {/* Bottom smooth ambient fade that blends the bottom edge cleanly into the page */}
          <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#0e0a0c] via-[#0e0a0c]/60 to-transparent pointer-events-none" />
        </div>

        {/* Foreground Action & Status Centerpiece - Positioned seamlessly at the base */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 -mt-8 sm:-mt-12 mb-10 flex flex-col items-center text-center">
          <Link href="/events/glow-and-rave-2026">
            <button className="btn-gold-luxury px-10 py-4 text-xs sm:text-sm tracking-[0.2em] font-semibold flex items-center gap-2 shadow-2xl">
              <span>BOOK TICKETS NOW</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </Link>

          {/* Understated Status Assurance */}
          <div className="mt-3.5 flex items-center gap-2 text-[10px] sm:text-xs font-medium tracking-[0.18em] uppercase text-[#d8cdbe]/90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5c997]" />
            <span>DIRECT IN-HOUSE PASSES • THE ROYAL PALM, JAIPUR</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. COUNTDOWN TIMER (Warm Architectural Luxury Display)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 w-full mt-2 mb-16">
        <div className="bg-[#161013] border border-[#e5c997]/20 rounded-2xl p-6 sm:p-8 text-center shadow-md">
          
          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#20151a] text-[#e5c997] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] mb-6 border border-[#e5c997]/25 rounded-md">
            <span>THE CELEBRATION COMMENCES IN // 04 NOV 2026 • 6:00 PM</span>
          </div>

          {/* Timer Digits Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 items-center">
            
            <div className="flex flex-col items-center justify-center bg-[#1c1418] border border-[#e5c997]/15 rounded-xl py-4 sm:py-6 px-2">
              <div
                suppressHydrationWarning
                className="text-4xl sm:text-6xl font-mono-code font-bold text-[#e5c997] leading-none"
              >
                {days}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9c8e82] mt-2">
                DAYS
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#1c1418] border border-[#e5c997]/15 rounded-xl py-4 sm:py-6 px-2">
              <div
                suppressHydrationWarning
                className="text-4xl sm:text-6xl font-mono-code font-bold text-[#e5c997] leading-none"
              >
                {hours}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9c8e82] mt-2">
                HOURS
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#1c1418] border border-[#e5c997]/15 rounded-xl py-4 sm:py-6 px-2">
              <div
                suppressHydrationWarning
                className="text-4xl sm:text-6xl font-mono-code font-bold text-[#e5c997] leading-none"
              >
                {minutes}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9c8e82] mt-2">
                MINUTES
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#1c1418] border border-[#e5c997]/15 rounded-xl py-4 sm:py-6 px-2">
              <div
                suppressHydrationWarning
                className="text-4xl sm:text-6xl font-mono-code font-bold text-[#e5c997] leading-none"
              >
                {seconds}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9c8e82] mt-2">
                SECONDS
              </span>
            </div>

          </div>
        </div>
      </section>



      {/* ─────────────────────────────────────────────────────────────
          3. ABOUT SECTION (Authentic Glow & Rave Event Copy)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 max-w-4xl mx-auto w-full">
        <div className="bg-[#161013] border border-[#e5c997]/20 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-md">
          
          <img
            src="/images/logo.png?v=afterhours-v5"
            alt="AfterHours Official Logo"
            className="w-20 h-20 sm:w-22 sm:h-22 object-cover rounded-xl border border-[#e5c997]/40 shadow-sm"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e5c997]">
              JAIPUR PREMIER NIGHTLIFE // PRE DIWALI PARTY
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl tracking-wider uppercase text-[#f7f1e5]">
              GLOW AND RAVE !!
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-[#d8cdbe] leading-relaxed max-w-2xl font-normal space-y-3">
            <p className="font-semibold text-[#f7f1e5] text-sm sm:text-base">
              Jaipur, this Diwali season, AFTER HOURS is where the real scene is. 🪩✨
            </p>
            <p>
              Big Bollywood energy, festive fits on point, crazy dance floors, and a night that’s about to make your Instagram stories look unreal. The lights, the music, the madness — we’re bringing the kind of pre-Diwali night you don’t want to hear about later.
            </p>
            <p className="text-[#e5c997] font-medium pt-1">
              So Jaipur, what’s it gonna be? Making memories with us or catching the FOMO on Instagram the next morning? 👀🔥
            </p>
            <p className="text-[11px] font-mono tracking-widest uppercase text-[#9c8e82]">
              AFTER HOURS — Your pre-Diwali plans, sorted.
            </p>
          </div>

          {/* Feature Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-2">
            <div className="bg-[#1c1418] border border-[#e5c997]/15 rounded-lg py-3 px-3">
              <span className="text-xs sm:text-sm font-bold text-[#e5c997] block">4 NOV 2026</span>
              <span className="text-[9px] uppercase tracking-wider text-[#9c8e82]">6:00 PM - 10:00 PM</span>
            </div>
            <div className="bg-[#1c1418] border border-[#e5c997]/15 rounded-lg py-3 px-3">
              <span className="text-xs sm:text-sm font-bold text-[#e5c997] block">ROYAL PALM</span>
              <span className="text-[9px] uppercase tracking-wider text-[#9c8e82]">Jagatpura, Jaipur</span>
            </div>
            <div className="bg-[#1c1418] border border-[#e5c997]/15 rounded-lg py-3 px-3">
              <span className="text-xs sm:text-sm font-bold text-[#e5c997] block">₹499 ONWARDS</span>
              <span className="text-[9px] uppercase tracking-wider text-[#9c8e82]">4 Pass Tiers</span>
            </div>
            <div className="bg-[#1c1418] border border-[#e5c997]/15 rounded-lg py-3 px-3">
              <span className="text-xs sm:text-sm font-bold text-[#e5c997] block">APPROVAL REQ.</span>
              <span className="text-[9px] uppercase tracking-wider text-[#9c8e82]">WhatsApp Payment</span>
            </div>
          </div>

          <Link href="/events/glow-and-rave-2026" className="mt-2">
            <button className="btn-gold-luxury px-8 py-3 text-xs tracking-[0.16em] flex items-center gap-2">
              <span>EXPLORE PASS OPTIONS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FAQS SECTION (Clean Minimalist Accordion)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 max-w-3xl mx-auto w-full mb-12">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e5c997] mb-1.5">
            // ESSENTIAL INFORMATION
          </span>
          <h2 className="font-bebas text-4xl sm:text-5xl tracking-wider uppercase text-[#f7f1e5]">
            FREQUENTLY ASKED
          </h2>
          <div className="w-16 h-px bg-[#e5c997]/40 mt-3" />
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className="bg-[#161013] border border-[#e5c997]/15 hover:border-[#e5c997]/30 rounded-xl p-5 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between font-semibold text-xs sm:text-sm text-[#f7f1e5] uppercase tracking-wider">
                <span className="pr-4">{faq.q}</span>
                <span className="text-[#e5c997] font-mono text-base font-bold shrink-0">
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </div>
              {activeFaq === idx && (
                <p className="mt-3 text-xs text-[#d8cdbe] leading-relaxed border-t border-[#e5c997]/10 pt-3 font-normal">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
