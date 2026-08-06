"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Ticket, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../lib/utils/formatters";

export default function TicketSelector({ event }) {
  const router = useRouter();
  const ticketTypes = event?.ticket_types || [];

  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    ticketTypes.forEach((t) => {
      initial[t.id] = 0;
    });
    if (ticketTypes[0]) initial[ticketTypes[0].id] = 1;
    return initial;
  });

  const handleQuantityChange = (typeId, delta, maxPerUser = 10) => {
    setQuantities((prev) => {
      const current = prev[typeId] || 0;
      const next = Math.max(0, Math.min(maxPerUser, current + delta));
      return { ...prev, [typeId]: next };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const subtotal = ticketTypes.reduce((acc, t) => {
    const qty = quantities[t.id] || 0;
    return acc + t.price * qty;
  }, 0);

  const handleProceedCheckout = () => {
    if (totalTickets === 0) return;

    const selectedItems = ticketTypes
      .filter((t) => (quantities[t.id] || 0) > 0)
      .map((t) => ({
        ticketTypeId: t.id,
        name: t.name,
        price: t.price,
        quantity: quantities[t.id],
      }));

    sessionStorage.setItem(
      `checkout_selection_${event.id}`,
      JSON.stringify({
        items: selectedItems,
        subtotal: subtotal,
      })
    );

    router.push(`/checkout/${event.id}`);
  };

  return (
    <div className="bg-black border-2 border-[#c8102e] rounded-3xl p-6 flex flex-col gap-6 box-red-glow">
      <div className="flex items-center justify-between pb-4 border-b border-gray-900">
        <div>
          <h3 className="font-bebas text-3xl tracking-wider text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#c8102e]" />
            SELECT TICKETS & PASSES
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">Instant digital pass delivery to your account</p>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-4">
        {ticketTypes.map((t) => {
          const qty = quantities[t.id] || 0;
          const formattedName = (t.name || "")
            .replace(/👨|👦/g, "♂")
            .replace(/👩|👧/g, "♀")
            .replace(/💑|👫/g, "⚢");

          return (
            <div
              key={t.id}
              className={`p-4 border transition-all rounded-2xl ${
                qty > 0
                  ? "bg-[#1a0006] border-[#c8102e] shadow-[0_0_20px_rgba(255,13,57,0.4)]"
                  : "bg-[#0a0a0a] border-gray-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm uppercase tracking-wider">{formattedName}</span>
                  <span className="text-sm font-black text-[#c8102e]">
                    {formatCurrency(t.price)}
                  </span>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(t.id, -1, t.max_per_user)}
                    disabled={qty <= 0}
                    className="w-8 h-8 bg-black border border-gray-800 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-200 transition-colors rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center font-mono-code font-black text-white text-base">
                    {qty}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(t.id, 1, t.max_per_user)}
                    className="w-8 h-8 bg-[#c8102e] border border-[#e01838] hover:bg-[#a80b24] flex items-center justify-center text-white shadow-md transition-colors rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-4 border-t border-gray-900 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span className="text-gray-400">Selected Passes ({totalTickets}):</span>
          <span className="text-2xl font-mono-code font-black text-white">{formatCurrency(subtotal)}</span>
        </div>

        <button
          disabled={totalTickets === 0}
          onClick={handleProceedCheckout}
          className="btn-sharp-red py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>PROCEED TO CHECKOUT</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Guaranteed Authentic Gate Pass</span>
        </div>
      </div>
    </div>
  );
}
