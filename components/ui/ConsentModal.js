"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldAlert, CheckSquare, Square, ArrowRight } from "lucide-react";

export default function ConsentModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 w-full max-w-2xl bg-black border-2 border-[#c8102e] rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(200,16,46,0.3)] box-red-glow overflow-hidden font-montserrat flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6e0008] border border-[#c8102e] rounded-xl flex items-center justify-center text-[#c8102e] shrink-0">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider leading-none">
                    Freshers Party 2026 – Attendee Consent & Terms
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">
                    Please read and accept the terms before proceeding to checkout
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Terms Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-gray-300 leading-relaxed font-medium border border-gray-800 rounded-xl p-4 bg-[#0a0a0a]">
              <p className="text-gray-200 font-bold">
                By purchasing a ticket and attending Freshers Party 2026, you acknowledge that you have read, understood, and agreed to the following terms and conditions:
              </p>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">1. Age Requirement</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Entry is strictly restricted to individuals 18 years of age or older.</li>
                  <li>A valid government-issued photo ID must be presented upon request.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">2. Code of Conduct</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>All attendees are expected to behave respectfully towards fellow guests, staff, performers, and venue personnel.</li>
                  <li>Any form of harassment, abusive language, violence, fighting, vandalism, or disruptive behavior will not be tolerated.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">3. Illegal Activities</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Any illegal activity, including but not limited to possession or use of prohibited substances, weapons, theft, or any unlawful conduct, is strictly prohibited.</li>
                  <li>Such incidents may result in immediate removal from the venue and may be reported to the appropriate authorities.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">4. Removal from the Event</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>The organizers reserve the right to deny entry or remove any attendee whose behavior is considered unsafe, disruptive, intoxicated, or in violation of these terms.</li>
                  <li>Any attendee removed from the event will not be entitled to a refund.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">5. Personal Responsibility</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Attendees are responsible for their own actions and conduct throughout the event.</li>
                  <li>The organizers are not responsible for disputes, arguments, or conflicts arising between attendees.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">6. Personal Belongings</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Attendees are responsible for the safety of their own personal belongings. The organizers and venue are not liable for any lost, stolen, or damaged items.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">7. Photography & Videography</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>Photography and videography may take place during the event. By attending, you consent to the use of your image or likeness in event photos and videos for promotional purposes without additional compensation.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">8. Ticket Policy</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>All ticket sales are final.</li>
                  <li>Tickets are non-refundable, non-transferable (unless permitted by the organizers), and cannot be exchanged after purchase.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">9. Event Changes</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
                  <li>The organizers reserve the right to modify the event schedule, activities, or venue if required due to unforeseen circumstances.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-[#c8102e]">10. Acceptance</h4>
                <p className="mt-1 text-gray-300">
                  By purchasing a ticket and/or entering the venue, you confirm that you have read, understood, and agree to abide by these Terms & Conditions. Failure to comply may result in removal from the event without any refund.
                </p>
              </div>
            </div>

            {/* Checkbox and Action Button Footer */}
            <div className="pt-4 mt-4 border-t border-gray-800 flex flex-col gap-4 shrink-0">
              <label
                onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-3 cursor-pointer group select-none"
              >
                <div className="mt-0.5 text-[#c8102e]">
                  {agreed ? (
                    <CheckSquare className="w-5 h-5 text-[#c8102e]" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                  )}
                </div>
                <span className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">
                  I confirm that I am 18+ years of age and I accept all the Freshers Party 2026 Attendee Consent & Terms listed above.
                </span>
              </label>

              <button
                disabled={!agreed}
                onClick={handleAgree}
                className="btn-sharp-red py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>AGREE & PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
