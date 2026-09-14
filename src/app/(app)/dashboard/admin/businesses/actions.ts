"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function moderateBusiness(
  businessId: string,
  status: "APPROVED" | "SUSPENDED",
) {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.rpc("moderate_business", {
    business_id: businessId,
    new_status: status,
  });

  if (error) {
    throw new Error(`Failed to moderate business: ${error.message}`);
  }
}
