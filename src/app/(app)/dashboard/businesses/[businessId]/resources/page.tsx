import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CreateResourceDialog } from "@/components/business/create-resource-dialog";

type ResourcesPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { businessId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Failed to verify business membership: ${membershipError.message}`,
    );
  }

  if (!membership) {
    notFound();
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, status")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Failed to load business: ${businessError.message}`);
  }

  if (!business) {
    notFound();
  }

  const { data: resources, error: resourceError } = await supabase
    .from("resources")
    .select("id, name, description, resource_type, capacity, status")
    .eq("business_id", businessId)
    .order("name");

  if (resourceError) {
    throw new Error(`Failed to load resources: ${resourceError.message}`);
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/dashboard/businesses"
            className="text-sm text-muted-foreground underline"
          >
            ← Back to businesses
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">{business.name}</h1>

          <p className="text-muted-foreground">Manage bookable resources.</p>
        </div>

        <CreateResourceDialog businessId={business.id} />
      </div>

      {resources.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            No resources have been created yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <div key={resource.id} className="space-y-4 rounded-lg border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{resource.name}</h2>

                  <p className="text-sm text-muted-foreground">
                    {resource.resource_type}
                  </p>
                </div>

                <Badge
                  variant={
                    resource.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {resource.status}
                </Badge>
              </div>

              {resource.description && (
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              )}

              {resource.capacity !== null && (
                <p className="text-sm">Capacity: {resource.capacity}</p>
              )}
              <div className="flex justify-end gap-4">
                <Link
                  href={`/dashboard/businesses/${businessId}/resources/${resource.id}/hours`}
                  className="text-sm underline"
                >
                  Operating hours
                </Link>

                <Link
                  href={`/dashboard/businesses/${businessId}/resources/${resource.id}/pricing`}
                  className="text-sm underline"
                >
                  Pricing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
