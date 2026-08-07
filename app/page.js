"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

// Event Target Date: August 16, 2026, 18:00 IST (6:00 PM)
const EVENT_DATE = new Date("2026-08-16T18:00:00+05:30");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    function updateTimer() {
      const now = new Date().getTime();
      const diff = EVENT_DATE.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function HomePage() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [activeFaq, setActiveFaq] = useState(null);

  const highlights = [
    {
      code: "01",
      title: "DJ NIGHT",
      desc: "Top DJs spinning the hottest tracks all night long.",
      img: "/icons/1.png",
    },
    {
      code: "02",
      title: "LIVE MUSIC",
      desc: "Unplugged. Live. Unforgettable.",
      img: "/icons/2.png",
    },
    {
      code: "03",
      title: "DANCE FLOOR",
      desc: "Non-stop energy all night long.",
      img: "/icons/3.png",
    },
    {
      code: "04",
      title: "FOOD & DRINKS",
      desc: "Delicious bites & premium drinks.",
      img: "/icons/4.png",
    },
    {
      code: "05",
      title: "PHOTO BOOTH",
      desc: "Capture moments, take memories.",
      img: "/icons/5.png",
    },
  ];

  const faqs = [
    {
      q: "WHEN AND WHERE IS THE EVENT TAKING PLACE?",
      a: "AfterHours is taking place on 16 August 2026 from 06:00 PM onwards at The Royal Palm, Jagatpura, Jaipur.",
    },
    {
      q: "HOW DO I RECEIVE MY DIGITAL PASS?",
      a: "After completing your booking, your digital QR pass is generated immediately and stored under 'My Passes' in your account.",
    },
    {
      q: "IS FOOD AND BEVERAGE INCLUDED WITH THE PASS?",
      a: "Standard passes include access to all main stages and general food & beverage zones. VIP passes include complimentary premium drinks.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden font-montserrat">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Festival Aesthetic)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-28 sm:pt-20 pb-32 sm:pb-36 px-4 overflow-hidden border-b border-[#c8102e]/30">
        
        {/* Background Atmosphere - hero.jpeg clear and visible */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 scale-105"
            style={{
              backgroundImage: `url('/images/hero.jpeg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">

          {/* Main Title (Sleeker & Thinner Font Size, Extra top margin on mobile view) */}
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-widest select-none leading-none mb-3 mt-8 sm:mt-0">
            <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">AFTER</span>{" "}
            <span className="text-[#c8102e]">HOURS</span>
          </h1>

          {/* Tagline (Slightly smaller font size) */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-gray-300 mb-8">
            <span>PARTIES</span>
            <span className="text-[#c8102e] font-mono">//</span>
            <span className="text-[#c8102e]">VIBES</span>
            <span className="text-[#c8102e] font-mono">//</span>
            <span>MEMORIES</span>
          </div>

          {/* Event Meta Grid (Single row on all screens, compact font) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 w-full max-w-2xl mb-8">
            
            <div className="p-2 sm:p-3.5 bg-black/80 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-lg sm:rounded-r-xl rounded-l-sm sm:rounded-l-md flex items-center gap-1.5 sm:gap-3 text-left">
              <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-tight sm:tracking-wider truncate">16 AUG 2026</div>
                <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-tight sm:tracking-widest">SUNDAY</div>
              </div>
            </div>

            <div className="p-2 sm:p-3.5 bg-black/80 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-lg sm:rounded-r-xl rounded-l-sm sm:rounded-l-md flex items-center gap-1.5 sm:gap-3 text-left">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-tight sm:tracking-wider truncate">06:00 PM</div>
                <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-tight sm:tracking-widest">ONWARDS</div>
              </div>
            </div>

            <div className="p-2 sm:p-3.5 bg-black/80 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-lg sm:rounded-r-xl rounded-l-sm sm:rounded-l-md flex items-center gap-1.5 sm:gap-3 text-left">
              <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-tight sm:tracking-wider truncate">ROYAL PALM</div>
                <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-tight sm:tracking-widest truncate">JAIPUR</div>
              </div>
            </div>

          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 sm:mt-16">
            <Link href="/events/freshers-party-2026">
              <button className="flex items-center gap-2 px-8 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white bg-[#c8102e] border-2 border-[#c8102e] hover:bg-[#a80b24] hover:border-[#a80b24] transition-all duration-300 rounded-full shadow-[0_0_25px_rgba(200,16,46,0.5)]">
                <span>BOOK TICKETS NOW</span>
                <span className="inline-flex items-center justify-center w-8 h-8 border-2 border-white/60 rounded-full ml-1 transition-colors">
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. COUNTDOWN TIMER (Sharp Geometric Digital Display)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 w-full -mt-20 sm:-mt-32 mb-16">
        <div className="bg-black border-2 border-[#c8102e] rounded-3xl p-8 text-center shadow-[0_0_20px_rgba(200,16,46,0.15)]">
          
          <div className="inline-block px-5 py-1.5 bg-[#160002] text-[#c8102e] text-xs font-black uppercase tracking-[0.3em] mb-8 border border-[#c8102e]/40 rounded-full">
            THE PARTY STARTS IN
          </div>

          {/* Timer Digits */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 items-center">
            
            <div className="flex flex-col items-center bg-[#0d0305] border border-[#c8102e]/40 rounded-2xl py-4 sm:py-6">
              <div className="text-5xl sm:text-7xl font-mono-code font-black text-[#c8102e] leading-none">
                {days}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-2">
                DAYS
              </span>
            </div>

            <div className="flex flex-col items-center bg-[#0d0305] border border-[#c8102e]/40 rounded-2xl py-4 sm:py-6">
              <div className="text-5xl sm:text-7xl font-mono-code font-black text-[#c8102e] leading-none">
                {hours}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-2">
                HOURS
              </span>
            </div>

            <div className="flex flex-col items-center bg-[#0d0305] border border-[#c8102e]/40 rounded-2xl py-4 sm:py-6">
              <div className="text-5xl sm:text-7xl font-mono-code font-black text-[#c8102e] leading-none">
                {minutes}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-2">
                MINUTES
              </span>
            </div>

            <div className="flex flex-col items-center bg-[#0d0305] border border-[#c8102e]/40 rounded-2xl py-4 sm:py-6">
              <div className="text-5xl sm:text-7xl font-mono-code font-black text-[#c8102e] leading-none">
                {seconds}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-2">
                SECONDS
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. EVENT HIGHLIGHTS (Brutalist Sharp Numbered Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e] mb-2">// EXPERIENCE</span>
          <h2 className="font-bebas text-5xl sm:text-7xl tracking-wider uppercase text-white">
            EVENT HIGHLIGHTS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="sharp-card flex flex-col items-center group cursor-default overflow-hidden border border-[#c8102e]/30 hover:border-[#c8102e] transition-all duration-300"
            >
              {/* 1:1 square image — fully covered */}
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Center-aligned text */}
              <div className="w-full px-4 pb-6 pt-3 border-t border-[#c8102e]/20 flex flex-col items-center gap-1.5 text-center bg-[#0a0a0a]">
                <h3 className="font-bebas text-lg tracking-widest text-white uppercase group-hover:text-[#c8102e] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ABOUT SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full border-t border-gray-900">
        <div className="bg-black border border-[#c8102e]/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden box-red-glow">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <h2 className="font-bebas text-4xl sm:text-6xl tracking-wider uppercase text-white">
              ABOUT AFTERHOURS
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              AfterHours is an exclusive private festival and nightlife production experience in Jaipur.
              We bring together world-class line-ups, state-of-the-art stage audio, and immersive light shows for one unforgettable night.
            </p>
            <Link href="/about" className="mt-2">
              <button className="btn-sharp-red px-7 py-3.5 text-xs">
                READ MORE ABOUT US
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FAQS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 max-w-4xl mx-auto w-full mb-12">
        <div className="text-center mb-10">
          <h2 className="font-bebas text-5xl tracking-wider uppercase text-white">
            FREQUENTLY ASKED
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className="bg-black border border-gray-800 rounded-2xl p-5 cursor-pointer hover:border-[#c8102e] transition-colors"
            >
              <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                <span>{faq.q}</span>
                <span className="text-[#c8102e] font-mono text-xl">{activeFaq === idx ? "−" : "+"}</span>
              </div>
              {activeFaq === idx && (
                <p className="mt-3 text-xs text-gray-400 leading-relaxed border-t border-gray-900 pt-3">
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
