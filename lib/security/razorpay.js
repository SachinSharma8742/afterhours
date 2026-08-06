import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

/**
 * Server-side Razorpay Client instance
 * NEVER expose keySecret to client.
 */
export const razorpayClient = new Razorpay({
  key_id: keyId || "placeholder_key",
  key_secret: keySecret || "placeholder_secret",
});

/**
 * Verifies Razorpay payment signature
 * HMAC SHA256 (order_id + "|" + payment_id, key_secret) === signature
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 * @returns {boolean}
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!keySecret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET environment variable");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
