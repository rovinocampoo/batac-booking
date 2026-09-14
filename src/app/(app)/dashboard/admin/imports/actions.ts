"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveImportCandidate(
  candidateId: string,
) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    "import_business_candidate",
    {
      candidate_id: candidateId,
    },
  );

  if (error) {
    throw new Error(
      `Failed to approve import candidate: ${error.message}`,
    );
  }

  return data;
}

export async function rejectImportCandidate(
  candidateId: string,
) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase.rpc(
    "reject_business_import_candidate",
    {
      candidate_id: candidateId,
    },
  );

  if (error) {
    throw new Error(
      `Failed to reject import candidate: ${error.message}`,
    );
  }
}