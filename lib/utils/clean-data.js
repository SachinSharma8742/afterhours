import { createClient } from "../supabase/client";

/**
 * Completely purges all customer, order, ticket, and scan log data from LocalStorage & Supabase DB
 */
export async function wipeAllSystemData() {
  if (typeof window !== "undefined") {
    // Clear all LocalStorage keys
    localStorage.removeItem("afterhours_orders");
    localStorage.removeItem("afterhours_used_tickets");
    localStorage.removeItem("afterhours_attendance_logs");
  }

  try {
    const supabase = createClient();
    // Delete Supabase records across logs, qr_codes, tickets, and orders
    await supabase.from("attendance_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("qr_codes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("tickets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (err) {
    console.warn("Supabase tables wipe error:", err);
  }

  return true;
}
