"use client";

import Link from "next/link";
import { Sparkles, Shield, Zap, Music, Ticket, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-24 pb-20 font-montserrat">
      
      {/* Hero Header Banner */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden border-b border-[#c8102e]/40">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-35 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#6e0008]/60 via-black/90 to-black" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-[#c8102e] text-xs font-black tracking-[0.3em] text-[#c8102e] uppercase shadow-[0_0_15px_rgba(255,13,57,0.3)]">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>DIRECT IN-HOUSE PRODUCTION</span>
          </div>

          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-wider select-none leading-none">
            ABOUT <span className="text-[#c8102e] red-text-glow">AFTERHOURS</span>
          </h1>

          <p className="text-xs sm:text-base text-gray-300 max-w-2xl leading-relaxed font-medium mt-2">
            We curate, produce, and manage premiere nightlife experiences, live concerts, and exclusive underground music festivals.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e]">// WHY WE ARE DIFFERENT</span>
          <h2 className="font-bebas text-4xl sm:text-6xl uppercase tracking-wider text-white mt-1">
            THE AFTERHOURS STANDARD
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="sharp-card p-8 flex flex-col gap-4 border-l-4 border-l-[#c8102e]">
            <span className="font-mono-code text-2xl font-black text-[#c8102e]">01 //</span>
            <h3 className="font-bebas text-3xl tracking-wider text-white uppercase">CURATED LINEUPS</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Every DJ, artist, and performance is hand-picked to deliver high-energy soundscapes and unforgettable atmospheres.
            </p>
          </div>

          <div className="sharp-card p-8 flex flex-col gap-4 border-l-4 border-l-[#c8102e]">
            <span className="font-mono-code text-2xl font-black text-[#c8102e]">02 //</span>
            <h3 className="font-bebas text-3xl tracking-wider text-white uppercase">INSTANT ENTRY</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Fast digital pass scanning at the gate ensures minimal line wait times so you spend more time inside the venue.
            </p>
          </div>

          <div className="sharp-card p-8 flex flex-col gap-4 border-l-4 border-l-[#c8102e]">
            <span className="font-mono-code text-2xl font-black text-[#c8102e]">03 //</span>
            <h3 className="font-bebas text-3xl tracking-wider text-white uppercase">DIRECT TICKETING</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              No middleman markups or counterfeit resellers. You buy directly from the official event production team.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="bg-black border-2 border-[#c8102e] p-10 text-center flex flex-col items-center gap-6 box-red-glow">
          <h2 className="font-bebas text-4xl sm:text-6xl uppercase tracking-wider text-white">
            READY FOR THE NEXT EVENT?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed font-medium">
            Join thousands of nightlife lovers. Secure your pass for 16 August 2026 at The Royal Palm, Jagatpura, Jaipur.
          </p>
          <Link href="/events">
            <button className="btn-sharp-red px-9 py-4 text-xs">
              <span>GET YOUR PASS NOW</span>
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
