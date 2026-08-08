"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldAlert, CheckSquare, Square, ArrowRight } from "lucide-react";

export default function ConsentModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAgree = () => {
    if (!agreed) return;
    if (onAccept) onAccept();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Solid Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-[100000] w-full max-w-xl bg-[#09090b] border border-[#c8102e]/60 rounded-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(200,16,46,0.35)] overflow-hidden font-montserrat flex flex-col max-h-[88vh] my-auto"
          >
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c8102e] via-red-500 to-[#c8102e]" />

            {/* Header */}
            <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-gray-800/80 shrink-0 gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#6e0008] border border-[#c8102e] rounded-xl flex items-center justify-center text-[#c8102e] shrink-0 mt-0.5 shadow-[0_0_15px_rgba(200,16,46,0.4)]">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bebas text-xl sm:text-2xl text-white tracking-wider leading-none truncate">
                    ATTENDEE CONSENT & TERMS
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-1 truncate">
                    Freshers Party 2026 – Review & accept terms to proceed
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Scrollable Terms Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium border border-gray-800/80 rounded-xl p-3.5 sm:p-4 bg-black/90 scrollbar-thin scrollbar-thumb-[#c8102e]">
              <p className="text-gray-200 font-bold leading-snug">
                By purchasing a ticket and attending Freshers Party 2026, you acknowledge that you have read, understood, and agreed to the following terms and conditions:
              </p>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">1. Age Requirement</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Entry is strictly restricted to individuals 16 years of age or older.</li>
                  <li>A valid government-issued photo ID must be presented upon request.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">2. Code of Conduct</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>All attendees are expected to behave respectfully towards fellow guests, staff, performers, and venue personnel.</li>
                  <li>Any form of harassment, abusive language, violence, fighting, vandalism, or disruptive behavior will not be tolerated.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">3. Illegal Activities</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Any illegal activity, including but not limited to possession or use of prohibited substances, weapons, theft, or any unlawful conduct, is strictly prohibited.</li>
                  <li>Such incidents may result in immediate removal from the venue and may be reported to the appropriate authorities.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">4. Removal from the Event</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>The organizers reserve the right to deny entry or remove any attendee whose behavior is considered unsafe, disruptive, intoxicated, or in violation of these terms.</li>
                  <li>Any attendee removed from the event will not be entitled to a refund.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">5. Personal Responsibility</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Attendees are responsible for their own actions and conduct throughout the event.</li>
                  <li>The organizers are not responsible for disputes, arguments, or conflicts arising between attendees.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">6. Personal Belongings</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Attendees are responsible for the safety of their own personal belongings. The organizers and venue are not liable for any lost, stolen, or damaged items.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">7. Photography & Videography</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Photography and videography may take place during the event. By attending, you consent to the use of your image or likeness in event photos and videos for promotional purposes without additional compensation.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">8. Ticket Policy</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>All ticket sales are final.</li>
                  <li>Tickets are non-refundable, non-transferable (unless permitted by the organizers), and cannot be exchanged after purchase.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">9. Event Changes</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>The organizers reserve the right to modify the event schedule, activities, or venue if required due to unforeseen circumstances.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] sm:text-[11px] text-[#c8102e]">10. Acceptance</h4>
                <p className="mt-1 text-gray-300">
                  By purchasing a ticket and/or entering the venue, you confirm that you have read, understood, and agree to abide by these Terms & Conditions. Failure to comply may result in removal from the event without any refund.
                </p>
              </div>
            </div>

            {/* Checkbox and Action Button Footer */}
            <div className="pt-3.5 mt-3.5 border-t border-gray-800/80 flex flex-col gap-3 shrink-0">
              <label
                onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-2.5 cursor-pointer group select-none"
              >
                <div className="mt-0.5 text-[#c8102e] shrink-0">
                  {agreed ? (
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8102e]" />
                  ) : (
                    <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-gray-300" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-300 font-medium group-hover:text-white transition-colors leading-snug">
                  I confirm that I am 16+ years of age and accept all Freshers Party 2026 Terms & Conditions listed above.
                </span>
              </label>

              <button
                disabled={!agreed}
                onClick={handleAgree}
                className="btn-sharp-red py-3 sm:py-3.5 text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(200,16,46,0.3)]"
              >
                <span>AGREE & PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
