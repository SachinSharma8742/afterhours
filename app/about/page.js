"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen text-[#f7f1e5] pt-24 pb-20 font-montserrat">
      
      {/* Hero Header Banner */}
      <section className="relative py-16 sm:py-20 px-4 border-b border-[#e5c997]/15">
        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <img
            src="/images/logo.png?v=afterhours-v5"
            alt="AfterHours Official Logo"
            className="w-20 h-20 sm:w-22 sm:h-22 object-cover rounded-xl border border-[#e5c997]/40 shadow-sm"
          />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1c1418] border border-[#e5c997]/25 rounded-md text-[10px] font-semibold tracking-[0.25em] text-[#e5c997] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#e5c997]" />
            <span>DIRECT IN-HOUSE PRODUCTION</span>
          </div>

          <h1 className="font-bebas text-5xl sm:text-7xl tracking-wider select-none leading-none text-[#f7f1e5]">
            ABOUT <span className="text-[#e5c997]">AFTERHOURS</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#d8cdbe] max-w-xl leading-relaxed font-normal">
            We curate, produce, and manage premiere nightlife experiences, live concerts, and exclusive music festival productions in Jaipur.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-5xl mx-auto px-4 py-14 w-full">
        <div className="text-center mb-10 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e5c997] mb-1.5">
            // WHY WE ARE DIFFERENT
          </span>
          <h2 className="font-bebas text-3xl sm:text-5xl uppercase tracking-wider text-[#f7f1e5]">
            THE AFTERHOURS STANDARD
          </h2>
          <div className="w-16 h-px bg-[#e5c997]/40 mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#161013] border border-[#e5c997]/15 rounded-xl p-6 flex flex-col gap-3">
            <span className="font-mono-code text-xl font-bold text-[#e5c997]">01 //</span>
            <h3 className="font-bebas text-2xl tracking-wider text-[#f7f1e5] uppercase">CURATED LINEUPS</h3>
            <p className="text-xs text-[#9c8e82] leading-relaxed font-normal">
              Every DJ, artist, and performance is hand-picked to deliver high-energy soundscapes and unforgettable atmospheres.
            </p>
          </div>

          <div className="bg-[#161013] border border-[#e5c997]/15 rounded-xl p-6 flex flex-col gap-3">
            <span className="font-mono-code text-xl font-bold text-[#e5c997]">02 //</span>
            <h3 className="font-bebas text-2xl tracking-wider text-[#f7f1e5] uppercase">INSTANT QR ENTRY</h3>
            <p className="text-xs text-[#9c8e82] leading-relaxed font-normal">
              Fast digital pass scanning at the gate ensures zero line wait times so you spend more time inside the venue.
            </p>
          </div>

          <div className="bg-[#161013] border border-[#e5c997]/15 rounded-xl p-6 flex flex-col gap-3">
            <span className="font-mono-code text-xl font-bold text-[#e5c997]">03 //</span>
            <h3 className="font-bebas text-2xl tracking-wider text-[#f7f1e5] uppercase">DIRECT TICKETING</h3>
            <p className="text-xs text-[#9c8e82] leading-relaxed font-normal">
              No middleman markups or counterfeit resellers. You buy directly from the official event production team.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-3xl mx-auto px-4 py-6 w-full">
        <div className="bg-[#161013] border border-[#e5c997]/20 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center gap-5 shadow-sm">
          <h2 className="font-bebas text-3xl sm:text-5xl uppercase tracking-wider text-[#f7f1e5]">
            READY FOR THE NEXT EVENT?
          </h2>
          <p className="text-xs sm:text-sm text-[#d8cdbe] max-w-md leading-relaxed font-normal">
            Join thousands of nightlife lovers. Secure your pass for 4 November 2026 at The Royal Palm, Jagatpura, Jaipur.
          </p>
          <Link href="/events">
            <button className="btn-gold-luxury px-8 py-3 text-xs flex items-center gap-2">
              <span>GET YOUR PASS NOW</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
