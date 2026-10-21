import QRCode from "qrcode";
import { generateSignedQRPayload } from "../security/qr-crypto";
import { generateOrderNumber, generateTicketNumber } from "../utils/formatters";
import { OFFICIAL_COMPANY_EVENTS } from "./event-service";

/**
 * Flat lookup map: ticket_type_id → ticket_type_name
 */
const STATIC_TICKET_TYPE_MAP = {};
for (const ev of OFFICIAL_COMPANY_EVENTS) {
  for (const tt of ev.ticket_types || []) {
    if (tt.id) STATIC_TICKET_TYPE_MAP[tt.id] = tt.name;
  }
}

/**
 * Validates and applies a coupon code locally
 */
export async function applyCouponCode(code, subtotal) {
  if (!code) return { valid: false, discount: 0, message: "No coupon provided" };

  const cleanCode = code.trim().toUpperCase();

  if (cleanCode === "RANDI") {
    const discount = Math.max(0, subtotal - 10);
    return {
      valid: true,
      code: "RANDI",
      discount_type: "override",
      discount_value: 10,
      discount,
      message: `Applied RANDI! Total price set to ₹10`,
    };
  }

  if (cleanCode === "FRIEND") {
    const discount = Math.min(subtotal, 200);
    return {
      valid: true,
      code: "FRIEND",
      discount_type: "fixed",
      discount_value: 200,
      discount,
      message: `Applied FRIEND! Saved ₹200`,
    };
  }

  if (cleanCode === "VIP2026") {
    const discount = (subtotal * 20) / 100;
    return {
      valid: true,
      code: "VIP2026",
      discount_type: "percentage",
      discount_value: 20,
      discount,
      message: `Applied VIP2026! Saved ₹${discount.toFixed(2)}`,
    };
  }

  return { valid: false, discount: 0, message: "Invalid or expired coupon code" };
}

/**
 * Creates a complete booking order, ticket items, and cryptographically signed QR codes.
 */
export async function createBookingOrder({
  eventId,
  userId = null,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  items,
  subtotal,
  discountAmount = 0,
  finalAmount,
  couponCode,
  paymentProviderId = null,
}) {
  const orderNumber = generateOrderNumber();
  const tickets = [];

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = generateTicketNumber();
      const ticketId = `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const { qrPayload, signatureHash } = generateSignedQRPayload({
        bookingId: orderNumber,
        ticketId: ticketId,
        userId: userId || "guest",
        eventId: eventId || "11111111-1111-1111-1111-111111111111",
      });

      let qrDataUrl = null;
      try {
        qrDataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 500,
          color: { dark: "#0F172A", light: "#FFFFFF" },
        });
      } catch (err) {
        console.warn("QR generation warning:", err);
      }

      tickets.push({
        id: ticketId,
        ticket_number: ticketNumber,
        attendee_name: attendeeName,
        attendee_gender: item.name?.includes("Girls") ? "female" : "male",
        ticket_type_id: item.ticketTypeId,
        ticket_type_name: item.name,
        price: item.price,
        status: "valid",
        event_title: "GLOW AND RAVE !!",
        qr_code: {
          qr_payload: qrPayload,
          qr_image_url: qrDataUrl,
          signature_hash: signatureHash,
        },
      });
    }
  }

  const orderRecord = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    event_id: eventId,
    user_id: userId,
    attendee_name: attendeeName,
    attendee_email: attendeeEmail,
    attendee_phone: attendeePhone,
    subtotal,
    discount_amount: discountAmount,
    final_amount: finalAmount,
    coupon_code: couponCode,
    payment_status: "paid",
    payment_method: "direct",
    payment_id: paymentProviderId || `pay-${Date.now()}`,
    created_at: new Date().toISOString(),
    tickets,
  };

  try {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");
      orders.unshift(orderRecord);
      localStorage.setItem("afterhours_orders", JSON.stringify(orders));
    }
  } catch (err) {
    console.warn("Error saving order to localStorage:", err);
  }

  return orderRecord;
}

/**
 * Retrieves all tickets for the currently logged in user or guest from local state
 */
export async function getCustomerTickets(user = null) {
  let currentUser = user;
  if (!currentUser && typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("afterhours_user");
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch {}
  }

  const allTicketsMap = new Map();

  try {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");

      orders.forEach((order) => {
        if (Array.isArray(order.tickets)) {
          order.tickets.forEach((ticket) => {
            const ticketKey = ticket.ticket_number || ticket.id;
            if (!allTicketsMap.has(ticketKey)) {
              allTicketsMap.set(ticketKey, {
                ...ticket,
                order_number: order.order_number,
                attendee_name: ticket.attendee_name || order.attendee_name || "Pass Holder",
                attendee_email: order.attendee_email,
                event_title: ticket.event_title || "GLOW AND RAVE !!",
              });
            }
          });
        }
      });
    }
  } catch (err) {
    console.warn("[booking-service] Failed reading local tickets:", err);
  }

  return Array.from(allTicketsMap.values());
}
