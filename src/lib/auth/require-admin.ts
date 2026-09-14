import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("platform_role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error("FAILED_TO_CHECK_PLATFORM_ROLE");
  }

  if (profile.platform_role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return {
    supabase,
    user,
    profile,
  };
}
