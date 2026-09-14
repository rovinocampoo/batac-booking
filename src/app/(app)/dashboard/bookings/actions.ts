"use server";

import { createClient } from "@/lib/supabase/server";

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { error } = await supabase.rpc("cancel_booking", {
    target_booking_id: bookingId,
  });

  if (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
}
