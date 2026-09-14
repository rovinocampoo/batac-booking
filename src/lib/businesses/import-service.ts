import { createAdminClient } from "@/lib/supabase/admin";

export async function importBusinessCandidate(
  candidateId: string,
): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("import_business_candidate", {
    candidate_id: candidateId,
  });

  if (error) {
    throw new Error(`Failed to import business candidate: ${error.message}`);
  }

  return data;
}
