import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/security/razorpay";
import { createBookingOrder } from "@/lib/services/booking-service";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment signature fields" },
        { status: 400 }
      );
    }

    // Verify HMAC signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Razorpay payment signature. Tampered transaction rejected!" },
        { status: 400 }
      );
    }

    // Create admin client that bypasses RLS — used server-side only
    let supabaseClient = null;
    try {
      supabaseClient = createAdminClient();
    } catch (err) {
      console.error("[verify-payment] Could not create admin client:", err.message);
      // Continue without admin client — booking-service will try anon client
    }

    // Complete booking order and generate cryptographically signed QR codes
    const order = await createBookingOrder({
      supabaseClient,
      eventId: bookingDetails.eventId,
      userId: bookingDetails.userId || null,
      attendeeName: bookingDetails.attendeeName,
      attendeeEmail: bookingDetails.attendeeEmail,
      attendeePhone: bookingDetails.attendeePhone,
      items: bookingDetails.items,
      subtotal: bookingDetails.subtotal,
      discountAmount: bookingDetails.discountAmount || 0,
      finalAmount: bookingDetails.finalAmount,
      couponCode: bookingDetails.couponCode,
      paymentProviderId: razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      message: "Razorpay payment verified & e-tickets issued successfully!",
      paymentId: razorpay_payment_id,
      order: order,
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed verifying payment signature" },
      { status: 500 }
    );
  }
}
