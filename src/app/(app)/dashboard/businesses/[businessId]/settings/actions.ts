"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UpdateBusinessInput = {
  businessId: string;
  name: string;
  description: string;
  category:
    | "SPORTS"
    | "FITNESS"
    | "FOOD_AND_DRINK"
    | "EVENTS"
    | "CREATIVE"
    | "OTHER";
  address: string;
  phone: string;
};

async function requireBusinessMember(businessId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: membership, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify business membership: ${error.message}`);
  }

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return {
    supabase,
    user,
    membership,
  };
}

export async function updateBusiness(input: UpdateBusinessInput) {
  const { supabase } = await requireBusinessMember(input.businessId);

  const name = input.name.trim();

  if (!name) {
    throw new Error("Business name is required");
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      description: input.description.trim() || null,
      category: input.category,
      address: input.address.trim() || null,
      phone: input.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.businessId);

  if (error) {
    throw new Error(`Failed to update business: ${error.message}`);
  }
}

export async function uploadBusinessCoverImage(
  businessId: string,
  formData: FormData,
) {
  const { supabase } = await requireBusinessMember(businessId);

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No image file was provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  const path = `${businessId}/cover.${extension}`;

  const admin = createAdminClient();

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("business-images")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload business image: ${uploadError.message}`);
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      cover_image_path: path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  if (updateError) {
    throw new Error(`Failed to save business image: ${updateError.message}`);
  }
}
