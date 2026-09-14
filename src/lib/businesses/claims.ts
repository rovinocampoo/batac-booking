import { createClient } from "@/lib/supabase/server";

export async function requestBusinessClaim(
  businessId: string,
  message?: string,
): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data, error } = await supabase.rpc("request_business_claim", {
    target_business_id: businessId,
    claim_message: message ?? null,
  });

  if (error) {
    throw new Error(`Failed to request business claim: ${error.message}`);
  }

  return data;
}
