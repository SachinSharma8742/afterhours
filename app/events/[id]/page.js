"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import TicketSelector from "../../../components/events/TicketSelector";
import { getEventByIdOrSlug } from "../../../lib/services/event-service";
import { formatDate } from "../../../lib/utils/formatters";

/* ── helpers ─────────────────────────────────────────── */

/** Extract a human-readable time like "06:00 PM" from an ISO date string */
function formatTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Parse a description that contains markdown-ish syntax (###, **, •, emojis)
 * and return structured JSX sections instead of raw text.
 */
function renderDescription(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip separator lines
    if (/^-{3,}$/.test(line)) continue;

    // Skip empty lines
    if (line === "") continue;

    // Section heading: ### ✨ What's Included  →  render as styled heading
    if (line.startsWith("###")) {
      const heading = line.replace(/^#{1,4}\s*/, "");
      elements.push(
        <div key={key++} className="mt-6 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#c8102e] rounded-full shrink-0" />
          <h4 className="font-bebas text-xl sm:text-2xl tracking-wider text-white uppercase">
            {heading}
          </h4>
        </div>
      );
      continue;
    }

    // Bold item: 🎧 **DJ Night**  →  render as feature title
    if (/^\S+\s?\*\*.*\*\*$/.test(line)) {
      const cleaned = line.replace(/\*\*/g, "");
      elements.push(
        <h5
          key={key++}
          className="mt-4 text-sm font-extrabold text-white tracking-wide uppercase"
        >
          {cleaned}
        </h5>
      );
      continue;
    }

    // Bullet point: • Text  →  styled list item
    if (line.startsWith("•")) {
      const content = line.replace(/^•\s*/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2.5 ml-1">
          <span className="mt-1.5 w-1.5 h-1.5 bg-[#c8102e] rounded-full shrink-0" />
          <span className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
            {content}
          </span>
        </div>
      );
      continue;
    }

    // URL line – make it a link
    if (/^https?:\/\//.test(line)) {
      elements.push(
        <a
          key={key++}
          href={line}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#c8102e] hover:underline font-medium break-all"
        >
          {line}
        </a>
      );
      continue;
    }

    // Regular paragraph — clean up stray ** markers
    const cleaned = line.replace(/\*\*/g, "");
    elements.push(
      <p
        key={key++}
        className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium"
      >
        {cleaned}
      </p>
    );
  }

  return <div className="flex flex-col gap-1.5">{elements}</div>;
}

/* ── page ────────────────────────────────────────────── */

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function EventDetailsPage({ params }) {
  const resolvedParams = params && typeof params.then === "function" ? use(params) : params;
  const eventId = resolvedParams?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const data = await getEventByIdOrSlug(eventId);
      setEvent(data);
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]);

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
          LOADING EVENT...
        </span>
      </div>
    );
  }

  /* ── not found ── */
  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 text-center flex flex-col items-center gap-6 px-4">
        <div className="w-16 h-16 bg-[#6e0008] border border-[#c8102e] rounded-2xl flex items-center justify-center">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-bebas text-4xl text-white">EVENT NOT FOUND</h2>
          <p className="text-xs text-gray-400">
            The event you are looking for does not exist or has been unlisted.
          </p>
        </div>
        <Link href="/events">
          <button className="btn-sharp-red px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL EVENTS</span>
          </button>
        </Link>
      </div>
    );
  }

  /* ── derived data ── */
  const startTime = formatTime(event.start_date);
  const endTime = formatTime(event.end_date);
  const timeLabel = startTime
    ? endTime
      ? `${startTime} – ${endTime}`
      : `${startTime} ONWARDS`
    : "06:00 PM ONWARDS";

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">

      {/* ════════════════════════════════════════════════════════════
          HERO BANNER — full-bleed immersive image
      ════════════════════════════════════════════════════════════ */}
      <section className="relative h-[50vh] sm:h-[60vh] w-full overflow-hidden">
        <img
          src={
            event.banner_url ||
            "/images/event.jpeg"
          }
          alt={event.title}
          className="w-full h-full object-cover scale-105 brightness-[0.6]"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Back link */}
        <div className="absolute top-24 sm:top-28 left-4 sm:left-8 z-20">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:text-white hover:border-[#c8102e] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ALL EVENTS
          </Link>
        </div>

        {/* Hero content overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 bg-black/70 backdrop-blur-sm border border-[#c8102e] rounded-full text-[10px] font-black uppercase tracking-widest text-[#c8102e]">
                {event.category_name || "NIGHTLIFE & PARTIES"}
              </span>
              {event.is_featured && (
                <span className="px-3 py-1 bg-[#c8102e] rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(200,16,46,0.5)]">
                  ★ FEATURED
                </span>
              )}
              <span className="px-3 py-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full text-gray-300 text-[10px] font-black uppercase tracking-widest">
                16+ ONLY
              </span>
            </div>

            {/* Title */}
            <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white max-w-4xl tracking-wider leading-none drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]">
              {event.title}
            </h1>

            {/* Short description */}
            {event.short_description && (
              <p className="mt-3 text-xs sm:text-sm text-gray-300 max-w-2xl font-medium leading-relaxed">
                {event.short_description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          META STRIP — date, time, venue (matches home page hero meta)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 max-w-3xl">
          {/* Date */}
          <div className="p-3 sm:p-4 bg-black/90 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-xl rounded-l-md flex items-center gap-2 sm:gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider truncate">
                {formatDate(event.start_date, false)}
              </div>
              <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                DATE
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="p-3 sm:p-4 bg-black/90 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-xl rounded-l-md flex items-center gap-2 sm:gap-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider truncate">
                {timeLabel}
              </div>
              <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                TIME
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="p-3 sm:p-4 bg-black/90 backdrop-blur-md border border-[#c8102e]/40 border-l-2 sm:border-l-4 border-l-[#c8102e] rounded-r-xl rounded-l-md flex items-center gap-2 sm:gap-3">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8102e] shrink-0" />
            <div className="overflow-hidden flex-1">
              <div className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider truncate">
                {event.venue_name}
              </div>
              <div className="text-[7.5px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-widest truncate">
                {event.city}
              </div>
            </div>
            {event.maps_url && (
              <a
                href={event.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-black border border-gray-800 hover:border-[#c8102e] text-[#c8102e] transition-colors rounded-lg shrink-0"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          MAIN CONTENT — 2-col layout (details + ticket sidebar)
      ════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Host Banner */}
            <div className="p-5 bg-[#0a0a0a] border border-[#c8102e]/30 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6e0008] border border-[#c8102e] rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                AH
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm truncate">
                    AfterHours Management
                  </h4>
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-medium truncate">
                  Direct Production & In-House Gate Check-in
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full shrink-0">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Verified
                </span>
              </div>
            </div>

            {/* Event Description — beautifully rendered (collapsible on mobile) */}
            <div className="bg-[#0a0a0a] border border-[#c8102e]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              {/* Subtle glow in corner */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c8102e]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                  <div className="w-9 h-9 bg-[#c8102e]/15 border border-[#c8102e]/40 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#c8102e]" />
                  </div>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider">
                    ABOUT THIS EVENT
                  </h3>
                </div>

                <div
                  className={`transition-all duration-300 relative ${
                    isExpanded
                      ? ""
                      : "max-h-44 overflow-hidden sm:max-h-none sm:overflow-visible"
                  }`}
                >
                  {renderDescription(
                    event.full_description || event.short_description
                  )}

                  {!isExpanded && (
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none sm:hidden" />
                  )}
                </div>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="sm:hidden mt-4 w-full py-2.5 px-4 bg-[#160002] border border-[#c8102e]/50 rounded-xl text-xs font-black uppercase tracking-widest text-[#c8102e] hover:bg-[#c8102e] hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(200,16,46,0.2)]"
                >
                  <span>{isExpanded ? "SHOW LESS" : "READ FULL EVENT DETAILS"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-center flex flex-col items-center gap-2 hover:border-[#c8102e]/40 transition-colors">
                <Users className="w-5 h-5 text-[#c8102e]" />
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest">
                  AGE LIMIT
                </span>
                <span className="text-sm font-black text-white">16+ ONLY</span>
              </div>
              <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-center flex flex-col items-center gap-2 hover:border-[#c8102e]/40 transition-colors">
                <Shield className="w-5 h-5 text-[#c8102e]" />
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest">
                  ENTRY
                </span>
                <span className="text-sm font-black text-white">
                  QR PASS + ID
                </span>
              </div>
              <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-center flex flex-col items-center gap-2 hover:border-[#c8102e]/40 transition-colors col-span-2 sm:col-span-1">
                <MapPin className="w-5 h-5 text-[#c8102e]" />
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest">
                  CITY
                </span>
                <span className="text-sm font-black text-white">
                  {event.city || "JAIPUR"}
                </span>
              </div>
            </div>

          </div>

          {/* ── Right: Sticky Ticket Selector ── */}
          <div className="relative">
            <div className="sticky top-28">
              <TicketSelector event={event} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
