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
    <div className="bg-[#161013] border border-[#e5c997]/20 hover:border-[#e5c997]/40 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Banner Image Container */}
        <div className="relative h-52 w-full overflow-hidden bg-black border-b border-[#e5c997]/15">
          <img
            src={event.banner_url || "/images/hero-banner.png"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-2.5 py-1 bg-[#0e0a0c]/90 border border-[#e5c997]/30 rounded-md text-[10px] font-semibold uppercase tracking-wider text-[#e5c997]">
              {event.category_name || "NIGHTLIFE"}
            </span>

            <button
              onClick={handleHeartClick}
              className={`p-2 rounded-lg transition-colors ${
                liked
                  ? "bg-[#e5c997] text-[#14090c]"
                  : "bg-[#0e0a0c]/90 border border-[#e5c997]/25 text-[#e5c997] hover:bg-[#e5c997] hover:text-[#14090c]"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-[#14090c]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2">
          <Link href={`/events/${event.slug || event.id}`}>
            <h3 className="font-bebas text-xl tracking-wider text-[#f7f1e5] hover:text-[#e5c997] transition-colors leading-tight line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-[#9c8e82] line-clamp-2 leading-relaxed font-normal">
            {event.short_description}
          </p>

          <div className="flex flex-col gap-1.5 pt-3 border-t border-[#e5c997]/10 text-xs text-[#d8cdbe] font-normal">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#e5c997] shrink-0" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#e5c997] shrink-0" />
              <span className="truncate text-[#9c8e82]">{event.venue_name}, {event.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-3 border-t border-[#e5c997]/15 flex items-center justify-between bg-[#191216]">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase text-[#9c8e82] tracking-wider">STARTS AT</span>
          <span className="text-base font-bold text-[#e5c997]">
            {formatCurrency(minPrice)}
          </span>
        </div>

        <Link href={`/events/${event.slug || event.id}`}>
          <button className="btn-gold-luxury px-4 py-2 text-xs flex items-center gap-1.5">
            <span>GET PASS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
