import { createAdminClient } from "@/lib/supabase/admin";

export type ExistingBusiness = {
  id: string;
  name: string;
  source: string;
  external_id: string | null;
};

export type ImportCandidate = {
  source: "OPENSTREETMAP";
  externalId: string;
  externalUrl: string;
  name: string;
  category:
    | "SPORTS"
    | "FITNESS"
    | "FOOD_AND_DRINK"
    | "EVENTS"
    | "CREATIVE"
    | "OTHER";
  latitude: number;
  longitude: number;
  address: string | null;
  website: string | null;
};

export async function findExistingBusiness(
  source: string,
  externalId: string,
): Promise<ExistingBusiness | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, source, external_id")
    .eq("source", source)
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find existing business: ${error.message}`,
    );
  }

  return data;
}

export async function upsertImportCandidate(
  candidate: ImportCandidate,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("business_import_candidates")
    .upsert(
      {
        source: candidate.source,
        external_id: candidate.externalId,
        external_url: candidate.externalUrl,
        name: candidate.name,
        category: candidate.category,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address: candidate.address,
        website: candidate.website,
      },
      {
        onConflict: "source,external_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to upsert import candidate: ${error.message}`,
    );
  }

  return data;
}