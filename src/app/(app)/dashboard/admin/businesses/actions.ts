"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function moderateBusiness(
  businessId: string,
  status: "APPROVED" | "SUSPENDED",
) {
  await requireAdmin();

  const supabase = await createClient();

  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select("id, status")
    .eq("id", businessId)
    .single();

  if (fetchError || !business) {
    throw new Error("Business not found.");
  }

  if (business.status !== "PENDING") {
    throw new Error(
      `Business is already ${business.status.toLowerCase()} and cannot be moderated.`,
    );
  }

  const { error } = await supabase.rpc("moderate_business", {
    business_id: businessId,
    new_status: status,
  });

  if (error) {
    throw new Error(`Failed to moderate business: ${error.message}`);
  }
}
