import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { ResourcePricingDialog } from "@/components/business/resource-pricing-dialog";

type ResourcePricingPageProps = {
  params: Promise<{
    businessId: string;
    resourceId: string;
  }>;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export default async function ResourcePricingPage({
  params,
}: ResourcePricingPageProps) {
  const { businessId, resourceId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id, name, resource_type")
    .eq("id", resourceId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (resourceError) {
    throw new Error(`Failed to load resource: ${resourceError.message}`);
  }

  if (!resource) {
    notFound();
  }

  const { data: pricing, error: pricingError } = await supabase
    .from("resource_pricing")
    .select("id, name, price, duration_minutes")
    .eq("resource_id", resourceId)
    .order("duration_minutes");

  if (pricingError) {
    throw new Error(`Failed to load resource pricing: ${pricingError.message}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <Link
          href={`/dashboard/businesses/${businessId}/resources`}
          className="text-sm text-muted-foreground underline"
        >
          ← Back to resources
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">{resource.name}</h1>

        <p className="text-muted-foreground">
          {resource.resource_type} · Pricing
        </p>
      </div>

      <div className="flex justify-end">
        <ResourcePricingDialog
          businessId={businessId}
          resourceId={resourceId}
        />
      </div>

      {pricing.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            No pricing options have been created yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pricing.map((option) => (
            <div key={option.id} className="rounded-lg border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{option.name}</h2>

                  <p className="text-sm text-muted-foreground">
                    {formatDuration(option.duration_minutes)}
                  </p>
                </div>

                <Badge variant="secondary">
                  {formatPrice(Number(option.price))}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
