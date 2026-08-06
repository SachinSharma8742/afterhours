import QRCode from "qrcode";
import { generateSignedQRPayload } from "../security/qr-crypto";
import { generateOrderNumber, generateTicketNumber } from "../utils/formatters";
import { createClient as createBrowserClient } from "../supabase/client";
import { OFFICIAL_COMPANY_EVENTS } from "./event-service";

/**
 * Flat lookup map: ticket_type_id → ticket_type_name
 * Built from all static OFFICIAL_COMPANY_EVENTS so we can resolve names
 * even when the Supabase ticket_types FK join returns null (e.g. for
 * hardcoded static UUIDs that don't exist as DB rows).
 */
const STATIC_TICKET_TYPE_MAP = {};
for (const ev of OFFICIAL_COMPANY_EVENTS) {
  for (const tt of ev.ticket_types || []) {
    if (tt.id) STATIC_TICKET_TYPE_MAP[tt.id] = tt.name;
  }
}

/**
 * Validates and applies a coupon code directly against Supabase DB
 */
export async function applyCouponCode(code, subtotal) {
  if (!code) return { valid: false, discount: 0, message: "No coupon provided" };

  const cleanCode = code.trim().toUpperCase();

  // 1. Built-in Preset Coupons
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

  try {
    const supabase = createBrowserClient();

    const { data: coupon } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .single();

    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid or expired coupon code" };
    }

    if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`,
      };
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (subtotal * Number(coupon.discount_value)) / 100;
    } else if (coupon.discount_type === "fixed") {
      discount = Math.min(subtotal, Number(coupon.discount_value));
    } else if (coupon.discount_type === "override") {
      discount = Math.max(0, subtotal - Number(coupon.discount_value));
    }

    return {
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount,
      message: `Applied ${coupon.code}! Saved ₹${discount.toFixed(2)}`,
    };
  } catch (err) {
    return { valid: false, discount: 0, message: "Invalid or expired coupon code" };
  }
}

/**
 * Creates a complete booking order, ticket items, and cryptographically signed QR codes.
 * 
 * @param {object} options
 * @param {object} [options.supabaseClient] - Optional pre-created Supabase client (for server-side use).
 *   If not provided, creates a browser client (client-side use only).
 */
export async function createBookingOrder({
  supabaseClient = null,
  eventId,
  userId = null,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  items, // Array of { ticketTypeId, name, price, quantity }
  subtotal,
  discountAmount = 0,
  finalAmount,
  couponCode,
  paymentProviderId = null,
}) {
  const orderNumber = generateOrderNumber();

  const tickets = [];
  const qrCodes = [];

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = generateTicketNumber();

      // ticketId will be replaced by DB-generated UUID after insert
      // Use a temp placeholder for QR generation — will be regenerated with real DB id
      const tempTicketId = `tmp-${Math.random().toString(36).substring(2, 9)}`;

      const ticketObj = {
        tempId: tempTicketId,
        ticket_type_id: item.ticketTypeId,
        ticket_type_name: item.name,
        ticket_number: ticketNumber,
        price: item.price,
        status: "valid",
      };

      tickets.push(ticketObj);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 1. Persist to Supabase Database (primary source of truth)
  // ──────────────────────────────────────────────────────────
  let dbOrderId = null;
  let dbOrderNumber = orderNumber;
  const dbTicketResults = [];

  try {
    // Use provided client (server-side admin client) or fall back to browser client
    const supabase = supabaseClient || createBrowserClient();

    // Check UUID validity for eventId
    const isUuidEvent = eventId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(eventId);

    if (!isUuidEvent) {
      console.warn("[booking-service] eventId is not a UUID — skipping DB insert:", eventId);
    } else {
      const isValidUserUuid = userId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);

      // Insert order
      const orderPayload = {
        event_id: eventId,
        order_number: orderNumber,
        total_amount: subtotal,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        status: "paid",
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone || null,
        payment_provider_id: paymentProviderId || null,
      };
      if (isValidUserUuid) orderPayload.user_id = userId;

      const { data: dbOrder, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error("[booking-service] Order insert error:", orderError);
      } else if (dbOrder?.id) {
        dbOrderId = dbOrder.id;
        dbOrderNumber = dbOrder.order_number;

        // Insert each ticket and generate a real QR code with the DB UUID
        for (const t of tickets) {
          const isUuidTier =
            t.ticket_type_id &&
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(t.ticket_type_id);

          const ticketPayload = {
            order_id: dbOrder.id,
            event_id: eventId,
            ticket_type_id: isUuidTier ? t.ticket_type_id : null,
            ticket_number: t.ticket_number,
            status: "valid",
          };
          if (isValidUserUuid) ticketPayload.user_id = userId;

          const { data: dbTicket, error: ticketError } = await supabase
            .from("tickets")
            .insert(ticketPayload)
            .select()
            .single();

          if (ticketError) {
            console.error("[booking-service] Ticket insert error:", ticketError);
            continue;
          }

          if (dbTicket?.id) {
            // Generate QR with the REAL DB ticket UUID
            const { qrPayload, signatureHash } = generateSignedQRPayload({
              bookingId: dbOrder.id,
              ticketId: dbTicket.id,
              userId: userId || "guest",
              eventId: eventId,
            });

            const qrDataUrl = await QRCode.toDataURL(qrPayload, {
              errorCorrectionLevel: "M",
              margin: 1,
              width: 500,
              color: { dark: "#0F172A", light: "#FFFFFF" },
            });

            const qrPayload_obj = {
              ticket_id: dbTicket.id,
              order_id: dbOrder.id,
              event_id: eventId,
              qr_payload: qrPayload,
              qr_image_url: qrDataUrl,
              signature_hash: signatureHash,
              is_invalidated: false,
            };
            if (isValidUserUuid) qrPayload_obj.user_id = userId;

            const { data: dbQr, error: qrError } = await supabase
              .from("qr_codes")
              .insert(qrPayload_obj)
              .select()
              .single();

            if (qrError) {
              console.error("[booking-service] QR insert error:", qrError);
            }

            dbTicketResults.push({
              id: dbTicket.id,
              ticket_number: dbTicket.ticket_number,
              attendee_name: dbTicket.attendee_name,
              attendee_gender: dbTicket.attendee_gender,
              status: dbTicket.status,
              ticket_type_name: t.ticket_type_name,
              price: t.price,
              qr_code: {
                qr_payload: qrPayload,
                qr_image_url: qrDataUrl,
                signature_hash: signatureHash,
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("[booking-service] Supabase database insertion error:", err);
  }

  // ──────────────────────────────────────────────────────────
  // 2. Build fallback ticket objects for any tickets not saved to DB
  //    (also generate QR codes for them)
  // ──────────────────────────────────────────────────────────
  const fallbackTickets = [];
  for (const t of tickets) {
    // Skip if already persisted to DB
    if (dbTicketResults.some(dt => dt.ticket_number === t.ticket_number)) continue;

    const { qrPayload, signatureHash } = generateSignedQRPayload({
      bookingId: `local-${Date.now()}`,
      ticketId: t.tempId,
      userId: userId || "guest",
      eventId: eventId || "local",
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 500,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });

    fallbackTickets.push({
      id: t.tempId,
      ticket_number: t.ticket_number,
      attendee_name: attendeeName || "Guest Attendee",
      attendee_gender: t.attendee_gender,
      status: "valid",
      ticket_type_name: t.ticket_type_name,
      price: t.price,
      qr_code: {
        qr_payload: qrPayload,
        qr_image_url: qrDataUrl,
        signature_hash: signatureHash,
      },
    });
  }

  const allTickets = [...dbTicketResults, ...fallbackTickets];

  // ──────────────────────────────────────────────────────────
  // 3. Build final order result
  // ──────────────────────────────────────────────────────────
  const orderResult = {
    id: dbOrderId || `local-ord-${Date.now()}`,
    order_number: dbOrderNumber,
    event_id: eventId,
    user_id: userId,
    subtotal,
    discount_amount: discountAmount,
    final_amount: finalAmount,
    coupon_code: couponCode || null,
    attendee_name: attendeeName,
    attendee_email: attendeeEmail,
    attendee_phone: attendeePhone,
    status: "paid",
    payment_method: "razorpay",
    tickets: allTickets,
    created_at: new Date().toISOString(),
    _persisted_to_db: !!dbOrderId,
  };

  return orderResult;
}

/**
 * Retrieves customer tickets from Supabase DB & Local Storage fallback
 */
export async function getCustomerTickets(userParam = null) {
  let currentUser = userParam;

  // Resolve logged-in user from localStorage if not passed directly
  if (!currentUser && typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("afterhours_user");
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch {}
  }

  const targetUserId = typeof currentUser === "string" ? currentUser : currentUser?.id;
  const targetEmail = currentUser?.email ? currentUser.email.toLowerCase().trim() : null;

  const allTicketsMap = new Map();

  // 1. Fetch from Supabase DB
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        events ( title, venue_name, city, start_date, banner_url ),
        ticket_types ( name ),
        qr_codes ( qr_payload, qr_image_url ),
        orders ( order_number, attendee_name, attendee_email, user_id )
      `)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      data.forEach((t) => {
        const ticketEmail = (t.attendee_email || t.orders?.attendee_email || "").toLowerCase().trim();
        const ticketUserId = t.user_id || t.orders?.user_id;

        let isMatch = false;

        if (targetEmail || targetUserId) {
          // Logged-in user view: match if email matches, or user_id matches,
          // OR if ticket was issued on this system (guest/local) so we don't hide active passes
          const matchesEmail = Boolean(targetEmail && ticketEmail && ticketEmail === targetEmail);
          const matchesUser = Boolean(targetUserId && ticketUserId && ticketUserId === targetUserId);
          
          isMatch = matchesEmail || matchesUser;

          // If no direct email/userId match, but ticket has no user_id or empty email, show it as fallback
          if (!isMatch && (!ticketUserId || ticketUserId === "guest") && (!ticketEmail || ticketEmail === targetEmail)) {
            isMatch = true;
          }
        } else {
          // Guest view: unauthenticated visitors should not see DB tickets
          isMatch = false;
        }

        if (isMatch) {
          // Resolve ticket type name: prefer DB FK join, then static map fallback, then default
          const resolvedTypeName =
            t.ticket_types?.name ||
            (t.ticket_type_id && STATIC_TICKET_TYPE_MAP[t.ticket_type_id]) ||
            "General Admission Pass";

          // Parse qr_codes regardless of whether Supabase returned an array or a single object
          const rawQr = Array.isArray(t.qr_codes) ? t.qr_codes[0] : t.qr_codes;
          const qrObj = rawQr || {
            qr_payload: generateSignedQRPayload({ ticketId: t.id, eventId: t.event_id }).qrPayload,
            qr_image_url: null,
          };

          const formatted = {
            id: t.id,
            ticket_number: t.ticket_number,
            attendee_name: t.attendee_name || t.orders?.attendee_name || "Pass Holder",
            attendee_gender: t.attendee_gender,
            status: t.status,
            scanned_at: t.scanned_at,
            event_title: t.events?.title || "AfterHours Event Pass",
            venue_name: t.events?.venue_name || "Jaipur Venue",
            ticket_type_name: resolvedTypeName,
            ticket_type_id: t.ticket_type_id,
            order_number: t.orders?.order_number,
            attendee_email: ticketEmail,
            qr_code: qrObj,
          };
          allTicketsMap.set(t.ticket_number || t.id, formatted);
        }
      });
    }
  } catch (err) {
    console.warn("[booking-service] Supabase fetch tickets warning:", err);
  }

  // 2. Fetch from LocalStorage (afterhours_orders)
  try {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");

      orders.forEach((order) => {
        const orderEmail = (order.attendee_email || "").toLowerCase().trim();
        const orderUserId = order.user_id;

        let isMatch = false;
        if (targetEmail || targetUserId) {
          const matchesEmail = Boolean(targetEmail && orderEmail && orderEmail === targetEmail);
          const matchesUser = Boolean(targetUserId && orderUserId && orderUserId === targetUserId);
          // Match if email or user ID matches, or if order has no email/user attached yet
          isMatch = matchesEmail || matchesUser || (!orderEmail && !orderUserId);
        } else {
          isMatch = false; // Logged out users should not see previous local account orders
        }

        if (isMatch && Array.isArray(order.tickets)) {
          order.tickets.forEach((ticket) => {
            const ticketKey = ticket.ticket_number || ticket.id;
            if (!allTicketsMap.has(ticketKey)) {
              allTicketsMap.set(ticketKey, {
                ...ticket,
                order_number: order.order_number,
                attendee_name: ticket.attendee_name || order.attendee_name || "Pass Holder",
                attendee_email: order.attendee_email,
                event_title: ticket.event_title || "AfterHours Event Pass",
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
