import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.platform_role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [businessesResult, pendingImportsResult, pendingClaimsResult] =
    await Promise.all([
      supabase.from("businesses").select("id", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("business_import_candidates")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "PENDING"),

      supabase
        .from("business_claim_requests")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "PENDING"),
    ]);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          BatacHub control center
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review businesses, imports, and ownership claims.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/admin/businesses"
          className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-muted-foreground">Businesses</p>

          <p className="mt-2 text-3xl font-black">
            {businessesResult.count ?? 0}
          </p>

          <p className="mt-3 text-sm font-semibold text-primary">
            Manage businesses →
          </p>
        </Link>

        <Link
          href="/dashboard/admin/imports"
          className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-muted-foreground">Pending imports</p>

          <p className="mt-2 text-3xl font-black">
            {pendingImportsResult.count ?? 0}
          </p>

          <p className="mt-3 text-sm font-semibold text-primary">
            Review imports →
          </p>
        </Link>

        <Link
          href="/dashboard/admin/claims"
          className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-muted-foreground">Pending claims</p>

          <p className="mt-2 text-3xl font-black">
            {pendingClaimsResult.count ?? 0}
          </p>

          <p className="mt-3 text-sm font-semibold text-primary">
            Review claims →
          </p>
        </Link>
      </section>
    </div>
  );
}
