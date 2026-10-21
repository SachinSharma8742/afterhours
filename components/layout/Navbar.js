"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide navbar on internal portal pages
  if (pathname?.startsWith("/portal-ops-x97")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = (path) =>
    `transition-colors py-1.5 px-3.5 tracking-[0.16em] font-medium text-xs rounded-md ${
      pathname === path
        ? "text-[#e5c997] bg-[#20151a] border border-[#e5c997]/25"
        : "text-[#d8cdbe] hover:text-[#e5c997] hover:bg-white/5"
    }`;

  const isHomePage = pathname === "/";
  const shouldHideAtTop = isHomePage && !scrolled && !mobileOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shouldHideAtTop
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      } ${
        scrolled
          ? "bg-[#0e0a0c]/95 border-b border-[#e5c997]/15 shadow-sm backdrop-blur-md"
          : "bg-[#0e0a0c]/85 border-b border-[#e5c997]/10 py-1 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Official Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img
                src="/images/logo.png?v=afterhours-v5"
                alt="AfterHours Official Logo"
                className="h-12 sm:h-13 w-12 sm:w-13 object-cover rounded-xl border border-[#e5c997]/50 shadow-sm transition-transform duration-200 group-hover:scale-102"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] text-[#e5c997] font-bold leading-none">
                AFTER HOURS
              </span>
              <span className="text-[8.5px] font-mono font-semibold uppercase tracking-[0.28em] text-[#9c8e82] mt-1">
                JAIPUR • 04 NOV 2026
              </span>
            </div>
          </Link>

          {/* Links - Centered */}
          <div className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={navLinkClass("/")}>
              HOME
            </Link>
            <Link href="/events" className={navLinkClass("/events")}>
              EVENTS
            </Link>
            <Link href="/about" className={navLinkClass("/about")}>
              ABOUT US
            </Link>
            <Link href="/contact" className={navLinkClass("/contact")}>
              CONTACT US
            </Link>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Desktop Action Button */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/events">
                <button className="btn-gold-luxury btn-gold-luxury--nav flex items-center gap-1.5 px-5 py-2 text-xs">
                  <span>BOOK TICKETS</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 text-[#e5c997] hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#070204]/95 backdrop-blur-2xl border-b border-[#e5c997]/30 px-6 py-6 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
          {/* Mobile Drawer Brand Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-white/10 mb-2">
            <img
              src="/images/logo.png?v=afterhours-v5"
              alt="AfterHours Official Logo"
              className="h-12 w-12 object-cover rounded-2xl border-2 border-[#e5c997]/70 shadow-[0_0_15px_rgba(229,201,151,0.3)]"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-[0.2em] text-[#e5c997] font-black leading-none">
                AFTER HOURS
              </span>
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-[0.25em] text-[#e5c997]/80 mt-1">
                JAIPUR OFFICIAL
              </span>
            </div>
          </div>
          <Link href="/" onClick={() => setMobileOpen(false)} className={pathname === "/" ? "text-[#e5c997]" : "text-gray-300"}>
            HOME
          </Link>
          <Link href="/events" onClick={() => setMobileOpen(false)} className={pathname === "/events" ? "text-[#e5c997]" : "text-gray-300"}>
            EVENTS
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className={pathname === "/about" ? "text-[#e5c997]" : "text-gray-300"}>
            ABOUT US
          </Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className={pathname === "/contact" ? "text-[#e5c997]" : "text-gray-300"}>
            CONTACT US
          </Link>
          <Link href="/events" onClick={() => setMobileOpen(false)} className="mt-2">
            <button className="w-full btn-gold-luxury py-3.5 text-xs font-extrabold tracking-widest uppercase">
              BOOK TICKETS NOW
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
