"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on internal portal pages
  if (pathname?.startsWith("/portal-ops-x97")) return null;

  return (
    <footer className="w-full bg-[#0e0a0c] text-[#9c8e82] relative font-montserrat border-t border-[#e5c997]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#e5c997]/10">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="flex items-center gap-3.5 group">
              <img
                src="/images/logo.png?v=afterhours-v5"
                alt="AfterHours Logo"
                className="h-14 w-14 object-cover rounded-xl border border-[#e5c997]/40 transition-transform duration-200 group-hover:scale-102"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-[0.2em] text-[#e5c997] font-bold leading-none">
                  AFTER HOURS
                </span>
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.28em] text-[#9c8e82] font-mono mt-1">
                  JAIPUR EDITION
                </span>
              </div>
            </Link>
            <span className="text-[9.5px] font-semibold text-[#e5c997] uppercase tracking-[0.22em]">
              THE NIGHT YOU WISH WOULD NEVER END
            </span>
            <p className="text-xs text-[#9c8e82] leading-relaxed font-normal">
              Direct in-house festival production and private nightlife experiences. Guaranteed authentic encrypted gate passes.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bebas text-lg text-[#f7f1e5] tracking-widest uppercase mb-1">
              NAVIGATION
            </h4>
            <ul className="flex flex-col gap-2 text-xs uppercase tracking-wider">
              <li>
                <Link href="/" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>HOME</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>ALL EVENTS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>ABOUT US</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>CONTACT US</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Event Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bebas text-lg text-[#f7f1e5] tracking-widest uppercase mb-1">
              OFFICIAL PASSES
            </h4>
            <ul className="flex flex-col gap-2 text-xs uppercase tracking-wider">
              <li>
                <Link href="/events/glow-and-rave-2026" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>GLOW & RAVE 2026</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#e5c997] transition-colors flex items-center justify-between group text-[#d8cdbe]">
                  <span>BROWSE ALL EVENTS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5c997]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Next Live Event Info Box */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bebas text-lg text-[#f7f1e5] tracking-widest uppercase mb-1">
              UPCOMING EDITION
            </h4>

            <div className="p-4 bg-[#161013] border border-[#e5c997]/20 rounded-xl flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#e5c997] uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#e5c997]" />
                <span>4 NOVEMBER 2026</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#d8cdbe] font-normal">
                <Clock className="w-4 h-4 text-[#e5c997]" />
                <span>06:00 PM – 10:00 PM</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#d8cdbe] font-normal pt-2 border-t border-[#e5c997]/10">
                <MapPin className="w-4 h-4 text-[#e5c997] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#f7f1e5] block">THE ROYAL PALM</span>
                  <span className="text-[10px] text-[#9c8e82] font-mono">JAGATPURA, JAIPUR</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9c8e82]">
          <p>© {new Date().getFullYear()} AFTERHOURS PRODUCTIONS. All Rights Reserved.</p>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-[#181114] border border-[#e5c997]/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e5c997]" />
            <span className="text-[#e5c997] font-semibold tracking-wider uppercase text-[10px]">
              OFFICIAL PASS ISSUANCE PLATFORM
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
