"use server";

import { createClient } from "@/lib/supabase/server";

type CreateResourceHourInput = {
  businessId: string;
  resourceId: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export async function createResourceHour(input: CreateResourceHourInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    !Number.isInteger(input.dayOfWeek) ||
    input.dayOfWeek < 0 ||
    input.dayOfWeek > 6
  ) {
    throw new Error("Invalid day of week");
  }

  if (input.opensAt >= input.closesAt) {
    throw new Error("Opening time must be before closing time");
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
    .from("resource_hours")
    .insert({
      resource_id: input.resourceId,
      day_of_week: input.dayOfWeek,
      opens_at: input.opensAt,
      closes_at: input.closesAt,
    })
    .select("id, resource_id, day_of_week, opens_at, closes_at")
    .single();

  if (error) {
    throw new Error(`Failed to create resource hours: ${error.message}`);
  }

  return data;
}
