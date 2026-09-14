"use server";

import { createClient } from "@/lib/supabase/server";

const RESOURCE_TYPES = [
  "COURT",
  "GYM_AREA",
  "SEATING_AREA",
  "PRIVATE_ROOM",
  "EVENT_SPACE",
  "STUDIO",
  "OTHER",
] as const;

type ResourceType = (typeof RESOURCE_TYPES)[number];

type CreateResourceInput = {
  businessId: string;
  name: string;
  description: string;
  resourceType: ResourceType;
  capacity: number | null;
};

export async function createResource(input: CreateResourceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Resource name is required");
  }

  if (!RESOURCE_TYPES.includes(input.resourceType)) {
    throw new Error("Invalid resource type");
  }

  if (
    input.capacity !== null &&
    (!Number.isInteger(input.capacity) || input.capacity <= 0)
  ) {
    throw new Error("Capacity must be a positive whole number");
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

  const { data, error } = await supabase
    .from("resources")
    .insert({
      business_id: input.businessId,
      name,
      description: input.description.trim() || null,
      resource_type: input.resourceType,
      capacity: input.capacity,
    })
    .select("id, name, description, resource_type, capacity, status")
    .single();

  if (error) {
    throw new Error(`Failed to create resource: ${error.message}`);
  }

  return data;
}
