import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BookingDialog } from "@/components/booking/booking-dialog";

type ResourcePageProps = {
  params: Promise<{
    slug: string;
    resourceId: string;
  }>;
  searchParams: Promise<{
    date?: string;
    pricing?: string;
  }>;
};

function getTodayInManila() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}
function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function ResourcePage({
  params,
  searchParams,
}: ResourcePageProps) {
  const { slug, resourceId } = await params;
  const filters = await searchParams;

  const selectedDate = filters.date ?? getTodayInManila();

  const supabase = await createClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (businessError) {
    throw new Error(`Failed to load business: ${businessError.message}`);
  }

  if (!business) {
    notFound();
  }

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id, name, description, resource_type, capacity")
    .eq("id", resourceId)
    .eq("business_id", business.id)
    .eq("status", "ACTIVE")
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
    .eq("resource_id", resource.id)
    .order("duration_minutes");

  if (pricingError) {
    throw new Error(`Failed to load pricing: ${pricingError.message}`);
  }

  const selectedPricing =
    pricing?.find((option) => option.id === filters.pricing) ?? pricing?.[0];

  let availability: {
    starts_at: string;
    ends_at: string;
  }[] = [];

  if (selectedPricing) {
    const { data, error } = await supabase.rpc("get_resource_availability", {
      target_resource_id: resource.id,
      target_pricing_id: selectedPricing.id,
      target_date: selectedDate,
    });

    if (error) {
      throw new Error(`Failed to load availability: ${error.message}`);
    }

    availability = data ?? [];
  }

  return (
    <main className="space-y-8">
      <div>
        <Link
          href={`/businesses/${business.slug}`}
          className="text-sm text-muted-foreground underline"
        >
          ← Back to {business.name}
        </Link>

        <p className="mt-4 text-sm text-muted-foreground">
          {resource.resource_type}
        </p>

        <h1 className="text-3xl font-bold">{resource.name}</h1>

        {resource.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {resource.description}
          </p>
        )}

        {resource.capacity !== null && (
          <p className="mt-2 text-sm">Capacity: {resource.capacity}</p>
        )}
      </div>

      <form method="get" className="space-y-4 rounded-lg border p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              defaultValue={selectedDate}
              min={getTodayInManila()}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pricing" className="text-sm font-medium">
              Pricing
            </label>

            <select
              id="pricing"
              name="pricing"
              defaultValue={selectedPricing?.id ?? ""}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {pricing?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} — {formatPrice(Number(option.price))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Check availability
        </button>
      </form>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Available times</h2>

          {selectedPricing && (
            <p className="text-sm text-muted-foreground">
              {selectedPricing.name} ·{" "}
              {formatPrice(Number(selectedPricing.price))}
            </p>
          )}
        </div>

        {!selectedPricing ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              No pricing options are available yet.
            </p>
          </div>
        ) : availability.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              No available times for this date.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availability.map((slot) => (
              <BookingDialog
                key={slot.starts_at}
                resourceId={resource.id}
                pricingId={selectedPricing.id}
                startsAt={slot.starts_at}
                endsAt={slot.ends_at}
                resourceName={resource.name}
                price={Number(selectedPricing.price)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
