"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  CreditCard,
  Tag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { getEventByIdOrSlug } from "@/lib/services/event-service";
import { applyCouponCode, createBookingOrder } from "@/lib/services/booking-service";
import { formatCurrency } from "@/lib/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage({ params }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form State
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Success Modal State
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    async function loadCheckoutEvent() {
      setLoading(true);
      const found = await getEventByIdOrSlug(eventId);
      setEvent(found);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) setCurrentUserId(user.id);
      } catch {}

      try {
        const stored = sessionStorage.getItem(`checkout_selection_${eventId}`) || (found?.id && sessionStorage.getItem(`checkout_selection_${found.id}`));
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedItems(parsed.items || []);
          setSubtotal(parsed.subtotal || 0);
        } else if (found?.ticket_types?.[0]) {
          const firstTier = found.ticket_types[0];
          setSelectedItems([{ ticketTypeId: firstTier.id, name: firstTier.name, price: Number(firstTier.price), quantity: 1 }]);
          setSubtotal(Number(firstTier.price));
        } else {
          setSelectedItems([{ ticketTypeId: "general", name: "General Admission Pass", price: 49.0, quantity: 1 }]);
          setSubtotal(49.0);
        }
      } catch {}

      setLoading(false);
    }

    loadCheckoutEvent();
  }, [eventId]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = await applyCouponCode(couponCode, subtotal);
    setCouponMessage(res.message);
    if (res.valid) {
      setDiscountAmount(res.discount);
      setAppliedCoupon(res.code);
      toast({ title: "Coupon Applied", description: res.message, type: "success" });
    } else {
      toast({ title: "Invalid Coupon", description: res.message, type: "error" });
    }
  };

  const finalAmount = Math.max(0, subtotal - discountAmount);

  const saveOrderToLocalStorage = (order) => {
    try {
      const existing = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");
      if (!existing.some((o) => o.order_number === order.order_number)) {
        existing.unshift(order);
        localStorage.setItem("afterhours_orders", JSON.stringify(existing));
      }
    } catch (err) {
      console.warn("localStorage save warning:", err);
    }
  };

  const handleInitiateRazorpay = async (e) => {
    e.preventDefault();
    if (!attendeeName || !attendeeEmail) {
      toast({ title: "Missing Information", description: "Please provide attendee name & email.", type: "error" });
      return;
    }

    setIsProcessing(true);

    try {
      const orderRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          currency: "INR",
          eventId: event?.id,
          attendeeEmail,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        const order = await createBookingOrder({
          eventId: event?.id || eventId,
          userId: currentUserId,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          items: selectedItems,
          subtotal,
          discountAmount,
          finalAmount,
          couponCode: appliedCoupon,
        });

        saveOrderToLocalStorage(order);
        setCreatedOrder(order);
        setShowSuccessModal(true);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AfterHours Events",
        description: `Pass for ${event?.title || "Event"}`,
        image: event?.banner_url || "",
        order_id: orderData.orderId,
        prefill: {
          name: attendeeName,
          email: attendeeEmail,
          contact: attendeePhone,
        },
        theme: {
          color: "#c8102e",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  eventId: event?.id,
                  userId: currentUserId,
                  attendeeName,
                  attendeeEmail,
                  attendeePhone,
                  items: selectedItems,
                  subtotal,
                  discountAmount,
                  finalAmount,
                  couponCode: appliedCoupon,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              saveOrderToLocalStorage(verifyData.order);
              try { sessionStorage.removeItem(`checkout_selection_${eventId}`); } catch {}
              setCreatedOrder(verifyData.order);
              setShowSuccessModal(true);
              toast({
                title: "Payment Verified!",
                description: "Pass issued successfully.",
                type: "success",
              });
            } else {
              toast({ title: "Verification Failed", description: verifyData.error, type: "error" });
            }
          } catch (err) {
            toast({ title: "Error", description: err.message, type: "error" });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (err) {
      toast({ title: "Checkout Error", description: err.message, type: "error" });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white pt-32 text-center text-xs font-black uppercase tracking-widest">LOADING CHECKOUT...</div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 text-center flex flex-col items-center gap-4">
        <h2 className="font-bebas text-4xl text-white">EVENT NOT AVAILABLE</h2>
        <p className="text-xs text-gray-400">The event you selected for checkout is no longer active.</p>
        <button className="btn-sharp-red px-6 py-3 text-xs" onClick={() => router.push("/events")}>
          RETURN TO EVENTS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 font-montserrat">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e]">// CHECKOUT</span>
          <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider uppercase text-white">
            SECURE <span className="text-[#c8102e] red-text-glow">PASS BOOKING</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">Provide attendee details to generate your digital event pass.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Step 1 */}
            <div className="bg-black border border-[#c8102e]/40 p-6 sm:p-8 flex flex-col gap-5 box-red-glow">
              <h3 className="font-bebas text-3xl tracking-wider text-white flex items-center gap-2">
                <span className="w-8 h-8 bg-[#6e0008] border border-[#c8102e] text-white flex items-center justify-center font-mono text-sm">1</span>
                ATTENDEE DETAILS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PHONE NUMBER</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Step 2 */}
            <form onSubmit={handleInitiateRazorpay} className="bg-black border border-[#c8102e]/40 p-6 sm:p-8 flex flex-col gap-5 box-red-glow">
              <h3 className="font-bebas text-3xl tracking-wider text-white flex items-center gap-2">
                <span className="w-8 h-8 bg-[#6e0008] border border-[#c8102e] text-white flex items-center justify-center font-mono text-sm">2</span>
                PAYMENT METHOD
              </h3>

              <div className="p-4 bg-black border border-[#c8102e]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#c8102e]" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">UPI / CARDS / NETBANKING</h4>
                    <p className="text-[10px] text-gray-400 font-mono">Instant digital pass generation</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase">
                  SECURE
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-sharp-red py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
              >
                <span>{isProcessing ? "PROCESSING..." : `COMPLETE BOOKING (${formatCurrency(finalAmount)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-black border-2 border-[#c8102e] p-6 flex flex-col gap-6 box-red-glow">
              <h3 className="font-bebas text-3xl text-white pb-3 border-b border-gray-900 tracking-wider">ORDER SUMMARY</h3>

              <div className="flex items-center gap-3">
                {event.banner_url && (
                  <img src={event.banner_url} alt="Banner" className="w-14 h-14 object-cover border border-gray-800" />
                )}
                <div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{event.title}</h4>
                  <p className="text-[11px] text-gray-400">{event.venue_name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-900 text-xs">
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-bold text-white">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="pt-4 border-t border-gray-900 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#c8102e]" /> COUPON CODE
                </span>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PARTY2026"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#c8102e]"
                  />
                  <button type="submit" className="px-4 py-2 bg-black border border-gray-700 hover:border-[#c8102e] text-xs font-bold uppercase text-white transition-colors">
                    APPLY
                  </button>
                </form>
                {couponMessage && (
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${appliedCoupon ? "text-emerald-400" : "text-red-400"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-900 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-gray-900">
                  <span>Total</span>
                  <span className="text-[#c8102e] text-base font-mono-code">{formatCurrency(finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => router.push("/dashboard/tickets")}
        title="🎉 BOOKING COMPLETE!"
      >
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <div className="w-16 h-16 bg-[#160002] border border-[#c8102e] flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bebas text-3xl text-white">ORDER #{createdOrder?.order_number}</h4>
            <p className="text-xs text-gray-400 font-medium">
              Your event pass has been issued and saved to your account.
            </p>
          </div>

          <button
            className="btn-sharp-red py-3.5 px-6 text-xs font-bold uppercase tracking-widest text-white w-full"
            onClick={() => router.push("/dashboard/tickets")}
          >
            VIEW & DOWNLOAD PASS
          </button>
        </div>
      </Modal>
    </div>
  );
}
