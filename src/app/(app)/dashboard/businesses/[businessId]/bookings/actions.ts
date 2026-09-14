"use server";

import { createClient } from "@/lib/supabase/server";

export async function manageBookingStatus(
  bookingId: string,
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { error } = await supabase.rpc("manage_booking_status", {
    target_booking_id: bookingId,
    next_status: status,
  });

  if (error) {
    throw new Error(`Failed to update booking: ${error.message}`);
  }
}
