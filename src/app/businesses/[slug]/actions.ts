"use server";

import { requestBusinessClaim } from "@/lib/businesses/claims";

export async function submitBusinessClaim(businessId: string, message: string) {
  return requestBusinessClaim(businessId, message.trim() || undefined);
}
