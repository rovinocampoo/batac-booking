import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function BusinessDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id);

  if (membershipError) {
    throw new Error(
      `Failed to load business memberships: ${membershipError.message}`,
    );
  }

  const businessIds =
    memberships?.map((membership) => membership.business_id) ?? [];

  if (businessIds.length === 0) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">My Businesses</h1>

          <p className="text-muted-foreground">
            Businesses you manage will appear here.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            You are not managing any businesses yet.
          </p>
        </div>
      </main>
    );
  }

  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, category, address, status")
    .in("id", businessIds)
    .order("name");

  if (businessError) {
    throw new Error(`Failed to load businesses: ${businessError.message}`);
  }

  const roleByBusinessId = new Map(
    memberships?.map((membership) => [membership.business_id, membership.role]),
  );

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Businesses</h1>

        <p className="text-muted-foreground">
          Manage the businesses you own or work for.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {businesses?.map((business) => (
          <div key={business.id} className="space-y-4 rounded-lg border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{business.name}</h2>

                <p className="text-sm text-muted-foreground">
                  {business.category}
                </p>
              </div>

              <Badge
                variant={
                  business.status === "APPROVED" ? "default" : "secondary"
                }
              >
                {business.status}
              </Badge>
            </div>

            {business.address && (
              <p className="text-sm text-muted-foreground">
                {business.address}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline">
                {roleByBusinessId.get(business.id)}
              </Badge>
              <Link
                href={`/dashboard/businesses/${business.id}/bookings`}
                className="text-sm underline"
              >
                Bookings
              </Link>
              <Link
                href={`/dashboard/businesses/${business.id}/resources`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Manage resources
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
