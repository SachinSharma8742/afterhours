import { NextResponse } from "next/server";
import { razorpayClient } from "@/lib/security/razorpay";

export async function POST(request) {
  try {
    const { amount, currency = "INR", receipt, eventId, attendeeEmail } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // Razorpay expects amount in smallest currency unit (paise/cents: amount * 100)
    const amountInSubunits = Math.round(amount * 100);

    const options = {
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        eventId: eventId || "",
        attendeeEmail: attendeeEmail || "",
        platform: "AfterHours",
      },
    };

    const razorpayOrder = await razorpayClient.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed creating Razorpay order" },
      { status: 500 }
    );
  }
}
