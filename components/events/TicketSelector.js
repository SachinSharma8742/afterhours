"use client";

import { Ticket, ShieldCheck, ExternalLink } from "lucide-react";
import { formatCurrency } from "../../lib/utils/formatters";

export default function TicketSelector({ event }) {
  const ticketTypes = event?.ticket_types || [];

  return (
    <div className="bg-black border-2 border-[#c8102e] rounded-3xl p-6 flex flex-col gap-6 box-red-glow">
      <div className="flex items-center justify-between pb-4 border-b border-gray-900">
        <div>
          <h3 className="font-bebas text-3xl tracking-wider text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#c8102e]" />
            OFFICIAL PASSES
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            Instant digital ticket & pass issuance
          </p>
        </div>
      </div>

      {/* Ticket List Preview */}
      <div className="flex flex-col gap-3">
        {ticketTypes.map((t) => {
          const formattedName = (t.name || "")
            .replace(/👨|👦/g, "♂")
            .replace(/👩|👧/g, "♀")
            .replace(/💑|👫/g, "⚢");

          return (
            <div
              key={t.id}
              className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl flex items-center justify-between gap-4 hover:border-[#c8102e]/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-black text-white text-sm uppercase tracking-wider">
                  {formattedName}
                </span>
                {t.description && (
                  <span className="text-[11px] text-gray-400 font-medium line-clamp-1">
                    {t.description}
                  </span>
                )}
              </div>

              <span className="text-base font-mono-code font-black text-[#c8102e] shrink-0">
                {formatCurrency(t.price)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action CTA */}
      <div className="pt-4 border-t border-gray-900 flex flex-col gap-4">
        <a
          href="https://go.allevents.in/sl6sa"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <button className="btn-sharp-red w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(200,16,46,0.4)]">
            <span>GET PASSES ON ALLEVENTS</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </a>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Direct Entry Gate Passes</span>
        </div>
      </div>
    </div>
  );
}
