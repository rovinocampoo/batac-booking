import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, platform_role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id);

  const businessIds =
    memberships?.map((membership) => membership.business_id) ?? [];

  const { data: businesses } =
    businessIds.length > 0
      ? await supabase
          .from("businesses")
          .select("id, name, slug, category, status")
          .in("id", businessIds)
          .order("name")
      : { data: [] };

  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("customer_id", user.id)
    .in("status", ["PENDING", "CONFIRMED"]);

  const isAdmin = profile?.platform_role === "ADMIN";

  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Welcome
          {profile?.full_name ? `, ${profile.full_name}` : ""}.
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your bookings, businesses, and BatacHub activity.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/bookings"
          className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-muted-foreground">Active bookings</p>

          <p className="mt-2 text-3xl font-black">{bookingCount ?? 0}</p>

          <p className="mt-3 text-sm font-semibold text-primary">
            View bookings →
          </p>
        </Link>

        <Link
          href="/dashboard/businesses"
          className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-muted-foreground">Businesses</p>

          <p className="mt-2 text-3xl font-black">{businesses?.length ?? 0}</p>

          <p className="mt-3 text-sm font-semibold text-primary">
            Manage businesses →
          </p>
        </Link>
      </section>

      {businesses && businesses.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Your businesses</h2>

            <p className="text-sm text-muted-foreground">
              Jump back into your business workspace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/dashboard/businesses/${business.id}`}
                className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{business.name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category}
                    </p>
                  </div>

                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {business.status}
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold text-primary">
                  Open workspace →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-bold">Need somewhere to go?</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Explore businesses and book local places in Batac.
        </p>

        <Link
          href="/businesses"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Explore Batac
        </Link>
      </section>

      {isAdmin && (
        <section className="rounded-2xl border bg-accent/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Administration
          </p>

          <h2 className="mt-2 text-xl font-bold">Platform controls</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Review businesses, imports, and ownership claims.
          </p>

          <Link
            href="/dashboard/admin"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full border bg-background px-5 text-sm font-semibold"
          >
            Open admin →
          </Link>
        </section>
      )}
    </div>
  );
}
