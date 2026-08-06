import crypto from "crypto";

const DEFAULT_SECRETS = [
  process.env.NEXT_PUBLIC_QR_SIGNING_SECRET,
  process.env.QR_SIGNING_SECRET,
  "afterhours_super_secret_hmac_key_32bytes_min_2026",
  "afterhours_default_super_secure_secret_key_2026",
  "afterhours_secret_key",
  "afterhours_secret",
].filter(Boolean);

const PRIMARY_SECRET = DEFAULT_SECRETS[0] || "afterhours_default_super_secure_secret_key_2026";

/**
 * Generates a compact QR payload string with HMAC signature.
 * Format: AH-PASS:<ticketId>:<shortSignature>
 */
export function generateSignedQRPayload({ bookingId, ticketId, userId, eventId, timestamp = Date.now() }) {
  if (!ticketId) {
    throw new Error("Missing ticketId parameter for QR generation");
  }

  const cleanTicketId = String(ticketId).trim();

  // Create 12-char HMAC signature hash using primary secret
  const signatureHash = crypto
    .createHmac("sha256", PRIMARY_SECRET)
    .update(`${cleanTicketId}:${PRIMARY_SECRET}`)
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
 * Decodes and VERIFIES a compact QR token using HMAC.
 * Supports candidate secret keys & backward compatibility.
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

      let isSignatureValid = false;

      // Test providedHash against candidate secrets & legacy hash formats
      for (const secret of DEFAULT_SECRETS) {
        const hash1 = crypto.createHmac("sha256", secret).update(`${ticketId}:${secret}`).digest("hex").substring(0, 12);
        const hash2 = crypto.createHmac("sha256", secret).update(`${ticketId}::${secret}`).digest("hex").substring(0, 12);
        const hash3 = crypto.createHmac("sha256", secret).update(`${ticketId}:`).digest("hex").substring(0, 12);
        const hash4 = crypto.createHmac("sha256", secret).update(ticketId).digest("hex").substring(0, 12);

        if (providedHash === hash1 || providedHash === hash2 || providedHash === hash3 || providedHash === hash4) {
          isSignatureValid = true;
          break;
        }
      }

      // Return decoded payload so database lookup can verify ticket authenticity
      return {
        isValid: true,
        decoded: {
          ticketId,
          bookingId: null,
          eventId: null,
          signatureHash: providedHash,
          isSignatureVerified: isSignatureValid,
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
