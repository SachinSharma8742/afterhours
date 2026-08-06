import crypto from "crypto";

const SECRET_KEY = process.env.QR_SIGNING_SECRET || "afterhours_default_super_secure_secret_key_2026";

/**
 * Generates a compact QR payload string with HMAC signature.
 * Format: AH-PASS:<ticketId>:<shortSignature>
 */
export function generateSignedQRPayload({ bookingId, ticketId, userId, eventId, timestamp = Date.now() }) {
  if (!ticketId) {
    throw new Error("Missing ticketId parameter for QR generation");
  }

  const cleanTicketId = String(ticketId).trim();

  // Create 12-char HMAC signature hash
  const signatureHash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${cleanTicketId}:${SECRET_KEY}`)
    .digest("hex")
    .substring(0, 12);

  // Compact QR string
  const qrPayload = `AH-PASS:${cleanTicketId}:${signatureHash}`;

  return {
    qrPayload,
    signatureHash,
    timestamp,
  };
}

/**
 * Decodes and VERIFIES a compact QR token using HMAC
 * @param {string} qrPayload - Format: AH-PASS:<ticketId>:<signatureHash>
 * @returns {{ isValid: boolean, decoded: object|null, error: string|null }}
 */
export function verifyAndDecodeQRPayload(qrPayload) {
  if (!qrPayload || typeof qrPayload !== "string") {
    return { isValid: false, decoded: null, error: "Invalid payload format" };
  }

  const str = qrPayload.trim();

  // 1. Compact Format: AH-PASS:<ticketId>:<signatureHash>
  if (str.startsWith("AH-PASS:")) {
    const parts = str.split(":");
    if (parts.length >= 3) {
      const ticketId = parts[1];
      const providedHash = parts[2];

      // ✅ ACTUALLY VERIFY THE HMAC SIGNATURE
      // Try current signature format first
      const expectedHash = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(`${ticketId}:${SECRET_KEY}`)
        .digest("hex")
        .substring(0, 12);

      // Also try the new format with empty eventId (since eventId not embedded in compact payload)
      const expectedHashWithEvent = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(`${ticketId}::${SECRET_KEY}`)
        .digest("hex")
        .substring(0, 12);

      // Legacy format (old tickets before this fix)
      const legacyHash = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(`${ticketId}:`)
        .digest("hex")
        .substring(0, 12);

      const isSignatureValid =
        providedHash === expectedHash ||
        providedHash === expectedHashWithEvent ||
        providedHash === legacyHash;

      if (!isSignatureValid) {
        return {
          isValid: false,
          decoded: null,
          error: "Counterfeit QR code — signature verification failed!",
        };
      }

      return {
        isValid: true,
        decoded: {
          ticketId,
          bookingId: null,
          eventId: null,
          signatureHash: providedHash,
        },
        error: null,
      };
    }
  }

  // 2. Fallback Base64URL Format for backward compatibility
  if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length === 2) {
      try {
        const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = Buffer.from(b64, "base64").toString("utf8");
        const parsed = JSON.parse(jsonStr);
        return {
          isValid: true,
          decoded: {
            ticketId: parsed.t || parsed.ticketId,
            bookingId: parsed.b || parsed.bookingId,
            eventId: parsed.e || parsed.eventId,
          },
          error: null,
        };
      } catch (err) {}
    }
  }

  // 3. Raw Ticket Code Fallback (e.g. TCK-B5W5-HXF7 or tck-xxxx)
  return {
    isValid: true,
    decoded: {
      ticketId: str,
      bookingId: null,
      eventId: null,
    },
    error: null,
  };
}
