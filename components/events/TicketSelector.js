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
      window.open("https://aroundu.in/plan/jaipur-glow-and-A5F3B?ref=aroundu_app", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-[#161013] border border-[#e5c997]/25 rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-gray-900">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png?v=afterhours-v5"
            alt="AfterHours"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-[#ebd7b2]/60 shadow-[0_0_15px_rgba(88,24,38,0.8)] shrink-0"
          />
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wider text-white">
              ENTRY PASSES & PRICING
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Official pass details & entry options
            </p>
          </div>
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
              className="p-4 border bg-[#181115] border-[#e5c997]/15 hover:border-[#e5c997]/35 transition-colors rounded-xl flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-[#f7f1e5] text-sm uppercase tracking-wider">
                  {formattedName}
                </span>
                <span className="text-base font-bold text-[#e5c997] font-mono-code">
                  {formatCurrency(t.price)}
                </span>
              </div>
              {t.description && (
                <p className="text-xs text-[#9c8e82] font-normal leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer & Action Button */}
      <div className="pt-2 border-t border-[#e5c997]/15 flex flex-col gap-3">
        <button
          onClick={handleProceedClick}
          className="btn-gold-luxury py-3.5 text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2 w-full"
        >
          <span>BUY TICKET NOW</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#9c8e82] font-medium uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e5c997]" />
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
