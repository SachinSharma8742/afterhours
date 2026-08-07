"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, LogOut, Menu, X, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
    `transition-all py-1.5 px-3 hover:text-[#c8102e] tracking-[0.15em] font-bold rounded-lg ${
      pathname === path
        ? "text-[#c8102e] bg-[#1a0006]"
        : "text-gray-300 hover:bg-white/5"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 border-b border-[#c8102e]/40 shadow-[0_4px_30px_rgba(255,13,57,0.2)]"
          : "bg-black/90 border-b border-white/10 py-1"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="AfterHours Logo"
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Links - Centered */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
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
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://go.allevents.in/sl6sa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-red-grunge btn-red-grunge--nav flex items-center gap-1.5 px-6 py-2.5 text-xs">
                  <span className="relative z-10">BUY PASSES</span>
                  <span className="grunge-arrow grunge-arrow--nav relative z-10">
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                </button>
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
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
        <div className="lg:hidden bg-black border-b border-[#c8102e]/40 px-6 py-6 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
          <Link href="/" onClick={() => setMobileOpen(false)} className={pathname === "/" ? "text-[#c8102e]" : "text-gray-300"}>
            HOME
          </Link>
          <Link href="/events" onClick={() => setMobileOpen(false)} className={pathname === "/events" ? "text-[#c8102e]" : "text-gray-300"}>
            EVENTS
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className={pathname === "/about" ? "text-[#c8102e]" : "text-gray-300"}>
            ABOUT US
          </Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className={pathname === "/contact" ? "text-[#c8102e]" : "text-gray-300"}>
            CONTACT US
          </Link>
          <a
            href="https://go.allevents.in/sl6sa"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="mt-2"
          >
            <button className="w-full py-3 bg-[#c8102e] text-[#ffffff] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
              <span>BUY PASSES NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </a>
        </div>
      )}
    </nav>
  );
}
