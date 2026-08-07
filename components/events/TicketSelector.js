"use client";

import { useState } from "react";
import { Ticket, ShieldCheck, ExternalLink } from "lucide-react";
import { formatCurrency } from "../../lib/utils/formatters";
import ConsentModal from "../ui/ConsentModal";

export default function TicketSelector({ event }) {
  const ticketTypes = event?.ticket_types || [];
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleProceedClick = () => {
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    if (typeof window !== "undefined") {
      window.open("https://go.allevents.in/sl6sa", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-black border-2 border-[#c8102e] rounded-3xl p-6 flex flex-col gap-6 box-red-glow">
      <div className="flex items-center justify-between pb-4 border-b border-gray-900">
        <div>
          <h3 className="font-bebas text-3xl tracking-wider text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#c8102e]" />
            ENTRY PASSES & PRICING
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            Official pass details & entry options
          </p>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-3.5">
        {ticketTypes.map((t) => {
          const formattedName = (t.name || "")
            .replace(/👨|👦/g, "♂")
            .replace(/👩|👧/g, "♀")
            .replace(/💑|👫/g, "⚢");

          return (
            <div
              key={t.id}
              className="p-4 border bg-[#0a0a0a] border-gray-800 hover:border-[#c8102e]/60 transition-all rounded-2xl flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-white text-sm uppercase tracking-wider">
                  {formattedName}
                </span>
                <span className="text-base font-black text-[#c8102e] font-mono-code">
                  {formatCurrency(t.price)}
                </span>
              </div>
              {t.description && (
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer & Action Button */}
      <div className="pt-2 border-t border-gray-900 flex flex-col gap-4">
        <button
          onClick={handleProceedClick}
          className="btn-sharp-red py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(200,16,46,0.4)]"
        >
          <span>BUY TICKET NOW</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Direct Entry Gate Passes</span>
        </div>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
      />
    </div>
  );
}
