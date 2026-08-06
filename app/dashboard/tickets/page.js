"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, QrCode, Calendar, User, LogOut } from "lucide-react";
import TicketPassCard from "@/components/ticket/TicketPassCard";
import { getCustomerTickets } from "@/lib/services/booking-service";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerTicketsPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTickets = async () => {
      const storedTickets = await getCustomerTickets(user);
      if (isMounted) {
        setTickets(storedTickets || []);
        setLoading(false);
      }
    };

    fetchTickets();

    const interval = setInterval(fetchTickets, 1000);
    window.addEventListener("storage", fetchTickets);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("storage", fetchTickets);
    };
  }, [user]);

  const openPassModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 text-center sm:text-left">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e]">// MY ACCOUNT</span>
            <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider uppercase text-white">
              MY DIGITAL <span className="text-[#c8102e] red-text-glow">EVENT PASSES</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              View, download, or present your digital QR pass at venue entry gates.
            </p>
          </div>
          {user && (
            <div className="flex items-center justify-center sm:justify-end gap-3 self-center sm:self-auto shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-[10px] text-gray-400 font-mono">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#160002] border border-[#c8102e]/50 hover:border-[#c8102e] text-xs font-bold uppercase tracking-wider text-red-400 hover:text-white flex items-center gap-2 rounded-lg transition-all shadow-[0_0_15px_rgba(200,16,46,0.2)]"
              >
                <LogOut className="w-4 h-4" />
                <span>LOGOUT</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-black border border-[#c8102e]/30">
            LOADING YOUR PASSES...
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((t) => {
              const isUsed = t.status === "used" || t.status === "expired";
              return (
                <div
                  key={t.id}
                  className={`sharp-card p-6 flex flex-col gap-4 border-t-2 border-t-[#c8102e] ${
                    isUsed ? "bg-[#160002] border-2 border-[#c8102e]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-[#c8102e] uppercase tracking-wider">
                      {t.ticket_number}
                    </span>
                    <span
                      className={`px-3 py-1 text-[10px] font-black font-mono tracking-wider uppercase border ${
                        isUsed
                          ? "bg-[#c8102e] text-white border-red-400 animate-pulse"
                          : "bg-[#0a200f] text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {isUsed ? "🔴 EXPIRED PASS" : "VALID GATE PASS"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center shrink-0 border ${
                      isUsed ? "bg-[#c8102e] text-white border-[#c8102e]" : "bg-[#6e0008] text-[#c8102e] border-[#c8102e]"
                    }`}>
                      <Ticket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bebas text-2xl text-white leading-none line-clamp-1">{t.event_title || "AfterHours Event Pass"}</h4>
                      <p className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider mt-1">{t.ticket_type_name}</p>
                    </div>
                  </div>

                  {t.attendee_name && (
                    <div className="p-3 bg-black border border-gray-900 text-xs flex justify-between text-gray-300 font-mono">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#c8102e]" /> Holder: {t.attendee_name}</span>
                    </div>
                  )}

                  <button
                    onClick={() => openPassModal(t)}
                    className={`btn-sharp-red py-3 text-xs flex items-center justify-center gap-2 mt-1 ${
                      isUsed ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isUsed ? "INVALIDATED PASS" : "VIEW QR PASS"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 bg-black border border-[#c8102e]/40 text-center flex flex-col items-center gap-4 box-red-glow">
            <div className="w-16 h-16 bg-[#6e0008] border border-[#c8102e] flex items-center justify-center text-[#c8102e]">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="font-bebas text-3xl text-white">NO ACTIVE PASSES FOUND</h3>
              <p className="text-xs text-gray-400 font-medium">
                You have not purchased any event passes yet. Explore upcoming events to reserve your pass.
              </p>
            </div>
            <Link href="/events">
              <button className="btn-sharp-red px-7 py-3.5 text-xs flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4" />
                <span>EXPLORE EVENTS</span>
              </button>
            </Link>
          </div>
        )}

        {/* Pass View Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="OFFICIAL EVENT PASS"
          className="max-w-2xl p-4 sm:p-6 bg-black border-2 border-[#c8102e]"
        >
          {selectedTicket && (
            <TicketPassCard ticket={selectedTicket} event={{ title: selectedTicket.event_title || "AfterHours Event", venue_name: "Venue Gate" }} />
          )}
        </Modal>
      </div>
    </div>
  );
}
