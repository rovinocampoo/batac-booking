"use server";

import { createClient } from "@/lib/supabase/server";

type CreateResourcePricingInput = {
  businessId: string;
  resourceId: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export async function createResourcePricing(input: CreateResourcePricingInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Pricing name is required");
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("Price must be zero or greater");
  }

  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("Duration must be a positive whole number");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", input.businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Failed to verify business membership: ${membershipError.message}`,
    );
  }

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id")
    .eq("id", input.resourceId)
    .eq("business_id", input.businessId)
    .maybeSingle();

  if (resourceError) {
    throw new Error(`Failed to verify resource: ${resourceError.message}`);
  }

  if (!resource) {
    throw new Error("Resource not found");
  }

  const { data, error } = await supabase
    .from("resource_pricing")
    .insert({
      resource_id: input.resourceId,
      name,
      price: input.price,
      duration_minutes: input.durationMinutes,
    })
    .select("id, name, price, duration_minutes")
    .single();

  if (error) {
    throw new Error(`Failed to create resource pricing: ${error.message}`);
  }

  return data;
}
