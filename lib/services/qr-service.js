import { createClient } from "../supabase/client";
import { verifyAndDecodeQRPayload } from "../security/qr-crypto";
import { OFFICIAL_COMPANY_EVENTS } from "./event-service";

/**
 * Flat lookup map: ticket_type_id → ticket_type_name
 * Resolves names for hardcoded static event ticket types that don't
 * exist as real rows in the Supabase ticket_types table.
 */
const STATIC_TICKET_TYPE_MAP = {};
for (const ev of OFFICIAL_COMPANY_EVENTS) {
  for (const tt of ev.ticket_types || []) {
    if (tt.id) STATIC_TICKET_TYPE_MAP[tt.id] = tt.name;
  }
}

/**
 * Resolves a ticket type name with 3-tier fallback:
 * 1. DB FK join result (ticket_types.name)
 * 2. Static map by ticket_type_id
 * 3. Default "General Admission"
 */
function resolveTicketTypeName(ticketTypesJoin, ticketTypeId) {
  return (
    ticketTypesJoin?.name ||
    (ticketTypeId && STATIC_TICKET_TYPE_MAP[ticketTypeId]) ||
    "General Admission"
  );
}

/**
 * Step 1: VERIFIES a scanned QR payload WITHOUT marking it as used.
 * Allows staff to preview attendee details and confirm before granting entry.
 *
 * @param {string} qrPayload - Raw QR code string
 * @param {string} targetEventId - Active event ID
 * @returns {Object} { success: boolean, code: string, message: string, data: Object|null }
 */
export async function verifyScannedQROnly(qrPayload, targetEventId = null) {
  // Step 1: Decode & Verify Cryptographic HMAC Signature
  const verification = verifyAndDecodeQRPayload(qrPayload);

  if (!verification.isValid) {
    return {
      success: false,
      code: "INVALID_SIGNATURE",
      message: verification.error || "Counterfeit or tampered QR Code signature!",
      data: null,
    };
  }

  const { ticketId } = verification.decoded;
  const cleanTicketId = String(ticketId).trim();

  let foundTicket = null;
  let foundOrder = null;
  let dbQrCodeId = null;

  try {
    const supabase = createClient();

    // 1. First try lookup by qr_payload in qr_codes table
    const { data: dbQr, error: qrErr } = await supabase
      .from("qr_codes")
      .select(`
        id,
        qr_payload,
        is_invalidated,
        tickets (
          id, ticket_number, status, scanned_at, ticket_type_id,
          ticket_types ( name ),
          orders ( order_number, attendee_name, attendee_email, status ),
          events ( title, venue_name, city, start_date )
        )
      `)
      .eq("qr_payload", qrPayload)
      .maybeSingle();

    if (qrErr) {
      console.warn("[qr-service] qr_codes lookup query note:", qrErr.message);
    }

    if (dbQr && dbQr.tickets) {
      const t = dbQr.tickets;
      dbQrCodeId = dbQr.id;
      foundTicket = {
        id: t.id,
        ticket_number: t.ticket_number,
        status: t.status,
        scanned_at: t.scanned_at,
        ticket_type_id: t.ticket_type_id,
        attendee_name: t.orders?.attendee_name || "Verified Attendee",
        ticket_type_name: resolveTicketTypeName(t.ticket_types, t.ticket_type_id),
      };
      foundOrder = {
        order_number: t.orders?.order_number,
        attendee_name: t.orders?.attendee_name || "Verified Attendee",
        attendee_email: t.orders?.attendee_email,
        status: t.orders?.status || "paid",
      };
    } else {
      // 2. Fallback: look up directly in tickets table by UUID or ticket_number
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanTicketId);
      
      let query = supabase
        .from("tickets")
        .select(`
          id, ticket_number, status, scanned_at, ticket_type_id,
          ticket_types ( name ),
          orders ( order_number, attendee_name, attendee_email, status ),
          events ( title, venue_name, city, start_date ),
          qr_codes ( id, qr_payload )
        `);

      if (isUuid) {
        query = query.eq("id", cleanTicketId);
      } else {
        query = query.eq("ticket_number", cleanTicketId);
      }

      const { data: dbTicket, error: tErr } = await query.maybeSingle();

      if (tErr) {
        console.warn("[qr-service] tickets lookup query note:", tErr.message);
      }

      if (dbTicket) {
        dbQrCodeId = dbTicket.qr_codes?.[0]?.id || null;
        foundTicket = {
          id: dbTicket.id,
          ticket_number: dbTicket.ticket_number,
          status: dbTicket.status,
          scanned_at: dbTicket.scanned_at,
          ticket_type_id: dbTicket.ticket_type_id,
          attendee_name: dbTicket.orders?.attendee_name || "Verified Attendee",
          ticket_type_name: resolveTicketTypeName(dbTicket.ticket_types, dbTicket.ticket_type_id),
        };
        foundOrder = {
          order_number: dbTicket.orders?.order_number,
          attendee_name: dbTicket.orders?.attendee_name || "Verified Attendee",
          attendee_email: dbTicket.orders?.attendee_email,
          status: dbTicket.orders?.status || "paid",
        };
      }
    }
  } catch (err) {
    console.warn("[qr-service] Supabase lookup error:", err);
  }

  // 3. Fallback: check localStorage for offline / client orders
  if (!foundTicket) {
    try {
      if (typeof window !== "undefined") {
        const orders = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");
        for (const ord of orders) {
          if (ord.tickets) {
            const t = ord.tickets.find(
              (tk) => tk.qr_code?.qr_payload === qrPayload || tk.id === cleanTicketId || tk.ticket_number === cleanTicketId
            );
            if (t) {
              foundTicket = t;
              foundOrder = ord;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn("[qr-service] localStorage lookup error:", err);
    }
  }

  if (!foundTicket) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Ticket not found in system. Please verify this QR code is from AfterHours.",
      data: null,
    };
  }

  // Status checks
  if (foundTicket.status === "used" || foundTicket.status === "expired") {
    const timeFormatted = foundTicket.scanned_at
      ? new Date(foundTicket.scanned_at).toLocaleTimeString()
      : "earlier";
    return {
      success: false,
      code: "ALREADY_USED",
      message: `TICKET ALREADY USED! Previously scanned at ${timeFormatted}. Entry Denied.`,
      data: {
        ticketId: foundTicket.id,
        attendeeName: foundTicket.attendee_name || foundOrder?.attendee_name || "Verified Attendee",
        scannedAt: timeFormatted,
      },
    };
  }

  if (foundTicket.status === "refunded") {
    return {
      success: false,
      code: "REFUNDED",
      message: "TICKET REFUNDED! Access denied.",
      data: null,
    };
  }

  if (foundTicket.status === "cancelled") {
    return {
      success: false,
      code: "CANCELLED",
      message: "TICKET CANCELLED by organizer!",
      data: null,
    };
  }

  if (foundOrder && foundOrder.status && foundOrder.status !== "paid") {
    return {
      success: false,
      code: "UNPAID_ORDER",
      message: `Order status is ${String(foundOrder.status).toUpperCase()}. Payment incomplete.`,
      data: null,
    };
  }

  return {
    success: true,
    code: "VALIDATED",
    message: "✅ PASS VERIFIED! Click below to confirm entry.",
    data: {
      ticketId: foundTicket.id,
      ticketNumber: foundTicket.ticket_number,
      ticketType: foundTicket.ticket_type_name,
      attendeeName: foundTicket.attendee_name || foundOrder?.attendee_name || "Verified Attendee",
      attendeeEmail: foundOrder?.attendee_email,
      orderNumber: foundOrder?.order_number,
      dbQrCodeId,
      qrPayload,
      eventId: targetEventId,
    },
  };
}

/**
 * Step 2: MARKS a verified ticket as USED / ENTERED in Supabase DB & localStorage.
 * Triggered ONLY when gate staff explicitly clicks "Confirm & Mark as Entered".
 */
export async function markTicketAsEntered(ticketData, scannedByUserId = "org-scanner-01") {
  if (!ticketData || !ticketData.ticketId) {
    return { success: false, message: "Invalid ticket data provided." };
  }

  const scanTimestamp = new Date().toISOString();
  const timeFormatted = new Date(scanTimestamp).toLocaleTimeString();
  const { ticketId, dbQrCodeId, qrPayload, attendeeName, ticketType, eventId } = ticketData;

  // 1. Update Supabase Database
  try {
    const supabase = createClient();
    const isUuidTicket = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(ticketId);

    if (isUuidTicket) {
      await supabase
        .from("tickets")
        .update({ status: "used", scanned_at: scanTimestamp })
        .eq("id", ticketId);

      if (dbQrCodeId) {
        await supabase
          .from("qr_codes")
          .update({ is_invalidated: true })
          .eq("id", dbQrCodeId);
      }

      const attLog = {
        ticket_id: ticketId,
        scan_status: "success",
        scanned_at: scanTimestamp,
      };

      if (eventId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(eventId)) {
        attLog.event_id = eventId;
      }
      if (dbQrCodeId) attLog.qr_code_id = dbQrCodeId;

      await supabase.from("attendance_logs").insert(attLog);
    }
  } catch (err) {
    console.warn("[qr-service] Supabase mark as entered error:", err);
  }

  // 2. Update localStorage fallback cache
  try {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("afterhours_orders") || "[]");
      const updatedOrders = orders.map((ord) => {
        if (ord.tickets) {
          ord.tickets = ord.tickets.map((t) => {
            if (t.id === ticketId || t.ticket_number === ticketData.ticketNumber || t.qr_code?.qr_payload === qrPayload) {
              return { ...t, status: "used", scanned_at: scanTimestamp };
            }
            return t;
          });
        }
        return ord;
      });
      localStorage.setItem("afterhours_orders", JSON.stringify(updatedOrders));

      const logs = JSON.parse(localStorage.getItem("afterhours_attendance_logs") || "[]");
      logs.unshift({
        id: `att-${Date.now()}`,
        ticket_id: ticketId,
        scanned_by: scannedByUserId,
        scanned_at: scanTimestamp,
        attendee_name: attendeeName || "Verified Attendee",
        ticket_type: ticketType || "Pass",
        scan_status: "success",
      });
      localStorage.setItem("afterhours_attendance_logs", JSON.stringify(logs));
    }
  } catch (err) {
    console.warn("[qr-service] localStorage mark update error:", err);
  }

  return {
    success: true,
    message: "✓ ENTRY CONFIRMED & PASS MARKED AS ENTERED!",
    scannedAt: timeFormatted,
  };
}

/**
 * Legacy wrapper function — verifies and auto-marks ticket in a single call if needed
 */
export async function validateScannedQR(qrPayload, scannedByUserId = "org-demo-user", targetEventId = null) {
  const verification = await verifyScannedQROnly(qrPayload, targetEventId);

  if (!verification.success) {
    return verification;
  }

  const markResult = await markTicketAsEntered(verification.data, scannedByUserId);

  return {
    ...verification,
    message: markResult.message,
  };
}

/**
 * Gets attendance logs for organizer (from DB + localStorage)
 */
export async function getAttendanceLogs(eventId = null) {
  const dbLogs = [];

  try {
    const supabase = createClient();
    let query = supabase
      .from("attendance_logs")
      .select(`
        *,
        tickets ( ticket_number, ticket_types ( name ) )
      `)
      .order("scanned_at", { ascending: false });

    if (eventId) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(eventId);
      if (isUuid) query = query.eq("event_id", eventId);
    }

    const { data } = await query.limit(200);
    if (data) dbLogs.push(...data);
  } catch (err) {
    console.warn("[qr-service] Attendance log fetch error:", err);
  }

  try {
    if (typeof window !== "undefined") {
      const localLogs = JSON.parse(localStorage.getItem("afterhours_attendance_logs") || "[]");
      const filtered = eventId
        ? localLogs.filter((l) => l.event_id === eventId)
        : localLogs;
      return [...dbLogs, ...filtered];
    }
  } catch {}

  return dbLogs;
}
