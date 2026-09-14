"use server";

import { createClient } from "@/lib/supabase/server";

export async function createBooking(
  resourceId: string,
  pricingId: string,
  startsAt: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data, error } = await supabase.rpc("create_booking", {
    target_resource_id: resourceId,
    target_pricing_id: pricingId,
    target_starts_at: startsAt,
  });

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return data;
}
