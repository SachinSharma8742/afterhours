"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Heart, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils/formatters";

export default function EventCard({ event, onWishlistToggle, isWishlisted = false }) {
  const [liked, setLiked] = useState(isWishlisted);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    if (onWishlistToggle) onWishlistToggle(event.id);
  };

  const minPrice = event.ticket_types?.length
    ? Math.min(...event.ticket_types.map((t) => t.price))
    : 49.0;

  return (
    <div className="sharp-card group relative flex flex-col justify-between overflow-hidden border border-[#c8102e]/30 rounded-2xl">
      <div>
        {/* Banner Image Container */}
        <div className="relative h-56 w-full overflow-hidden bg-black border-b border-gray-900">
          <img
            src={event.banner_url || "/images/event.jpeg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-3 py-1 bg-black border border-[#c8102e] rounded-full text-[10px] font-black uppercase tracking-widest text-[#c8102e]">
              {event.category_name || "NIGHTLIFE"}
            </span>

            <button
              onClick={handleHeartClick}
              className={`p-2 rounded-full transition-all ${
                liked
                  ? "bg-[#c8102e] text-white"
                  : "bg-black/80 border border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2.5">
          <Link href={`/events/${event.slug || event.id}`}>
            <h3 className="font-bebas text-2xl tracking-wider text-white group-hover:text-[#c8102e] transition-colors leading-tight line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">
            {event.short_description}
          </p>

          <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-900 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#c8102e] shrink-0" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#c8102e] shrink-0" />
              <span className="truncate text-gray-400">{event.venue_name}, {event.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 pt-3 border-t border-gray-900 flex items-center justify-between bg-black">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase text-gray-500 tracking-wider">STARTS AT</span>
          <span className="text-lg font-black text-white">
            {formatCurrency(minPrice)}
          </span>
        </div>

        <a
          href="https://go.allevents.in/sl6sa"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="btn-sharp-red px-4 py-2 text-xs flex items-center gap-2">
            <span>GET PASS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </a>
      </div>
    </div>
  );
}
