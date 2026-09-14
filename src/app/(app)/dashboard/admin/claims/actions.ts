"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function moderateBusinessClaim(
  claimId: string,
  decision: "APPROVED" | "REJECTED",
) {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.rpc("moderate_business_claim", {
    claim_id: claimId,
    decision,
  });

  if (error) {
    throw new Error(`Failed to moderate business claim: ${error.message}`);
  }
}
