import { redirect } from "next/navigation";

export default async function CheckoutRedirect({ params }) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId || "glow-and-rave-2026";
  redirect(`/events/${eventId}`);
}
