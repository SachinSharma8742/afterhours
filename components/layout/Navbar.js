"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            {user ? (
              <Link href="/dashboard/tickets" className={navLinkClass("/dashboard/tickets")}>
                MY PASSES
              </Link>
            ) : (
              <Link href="/login" className={navLinkClass("/login")}>
                LOGIN
              </Link>
            )}
          </div>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/tickets"
                  className="w-10 h-10 bg-[#6e0008] border border-[#c8102e] rounded-full flex items-center justify-center text-white font-black text-sm hover:bg-[#c8102e] transition-colors shadow-[0_0_15px_rgba(255,13,57,0.4)]"
                >
                  {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white/5"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#c8102e] transition-colors px-3 py-2">
                  LOGIN
                </Link>
                <Link href="/events">
                  <button className="btn-red-grunge btn-red-grunge--nav flex items-center gap-1.5 px-6 py-2.5 text-xs">
                    <span className="relative z-10">BOOK TICKETS</span>
                    <span className="grunge-arrow grunge-arrow--nav relative z-10">
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
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
          {user ? (
            <Link href="/dashboard/tickets" onClick={() => setMobileOpen(false)} className="text-red-400">
              MY PASSES
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className={pathname === "/login" ? "text-[#c8102e]" : "text-gray-300"}>
                LOGIN
              </Link>
              <Link href="/events" onClick={() => setMobileOpen(false)} className="mt-2">
                <button className="w-full py-3 bg-[#c8102e] text-white font-bold tracking-widest uppercase">
                  BOOK TICKETS NOW
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
