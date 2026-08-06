"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-gray-400 relative overflow-hidden font-montserrat border-t border-gray-900">
      
      {/* Top Red Gradient Glow Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c8102e] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-900">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="AfterHours Logo"
                className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(200,16,46,0.3)]"
              />
            </Link>
            <span className="text-[10px] font-black text-[#c8102e] uppercase tracking-[0.25em]">
              THE NIGHT YOU WISH WOULD NEVER END
            </span>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              In-house direct festival production and private nightlife experiences. Guaranteed authentic digital gate passes.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bebas text-xl text-white tracking-widest uppercase mb-1">
              NAVIGATION
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider">
              <li>
                <Link href="/" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>HOME</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>ALL EVENTS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>ABOUT US</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>CONTACT US</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Account */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bebas text-xl text-white tracking-widest uppercase mb-1">
              CUSTOMER PASSES
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider">
              <li>
                <Link href="/dashboard/tickets" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>MY DIGITAL PASSES</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>CUSTOMER LOGIN</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#c8102e] transition-colors flex items-center justify-between group">
                  <span>REGISTER ACCOUNT</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#c8102e]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Next Live Event Info Box */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bebas text-xl text-white tracking-widest uppercase mb-1">
              UPCOMING EDITION
            </h4>

            <div className="p-4 bg-[#0a0a0a] border border-[#c8102e]/30 rounded-xl flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#c8102e]" />
                <span>16 AUGUST 2026</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                <Clock className="w-4 h-4 text-[#c8102e]" />
                <span>06:00 PM ONWARDS</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-300 font-medium pt-1 border-t border-gray-900">
                <MapPin className="w-4 h-4 text-[#c8102e] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">THE ROYAL PALM</span>
                  <span className="text-[10px] text-gray-400 font-mono">JAGATPURA, JAIPUR</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AFTERHOURS PRODUCTIONS. All Rights Reserved.</p>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#160002] border border-[#c8102e]/40 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#c8102e] animate-pulse" />
            <span className="text-gray-300 font-bold tracking-widest uppercase text-[10px]">
              OFFICIAL PASS ISSUANCE PLATFORM
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
