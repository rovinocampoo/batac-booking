import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ClaimBusinessDialog } from "@/components/business/claim-business-dialog";

type BusinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  SPORTS: "Sports",
  FITNESS: "Fitness",
  FOOD_AND_DRINK: "Food & Drink",
  EVENTS: "Events",
  CREATIVE: "Creative",
  OTHER: "Other",
};

function formatCategory(category: string) {
  return categoryLabels[category] ?? category.replaceAll("_", " ");
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}
export async function generateMetadata({ params }: BusinessPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, description")
    .eq("slug", slug)
    .eq("status", "APPROVED")
    .maybeSingle();

  return {
    title: business?.name ?? "Business",
    description:
      business?.description ??
      "Discover and book local businesses on BatacHub.",
  };
}
export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        description,
        category,
        address,
        phone,
        status,
        owner_id,
        latitude,
        longitude,
        cover_image_path
      `,
    )
    .eq("slug", slug)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load business: ${error.message}`);
  }

  if (!business) {
    notFound();
  }

  const { data: resources, error: resourcesError } = await supabase
    .from("resources")
    .select(
      `
          id,
          name,
          resource_type,
          description,
          capacity
        `,
    )
    .eq("business_id", business.id)
    .eq("status", "ACTIVE")
    .order("name");

  if (resourcesError) {
    throw new Error(`Failed to load resources: ${resourcesError.message}`);
  }

  const resourceIds = resources?.map((resource) => resource.id) ?? [];

  const { data: pricing } =
    resourceIds.length > 0
      ? await supabase
          .from("resource_pricing")
          .select("resource_id, price, duration_minutes")
          .in("resource_id", resourceIds)
          .order("price")
      : { data: [] };

  const lowestPriceByResource = new Map<string, number>();

  pricing?.forEach((option) => {
    const current = lowestPriceByResource.get(option.resource_id);

    const price = Number(option.price);

    if (current === undefined || price < current) {
      lowestPriceByResource.set(option.resource_id, price);
    }
  });

  let pendingClaim = false;

  if (user) {
    const { data: claim } = await supabase
      .from("business_claim_requests")
      .select("id")
      .eq("business_id", business.id)
      .eq("requester_id", user.id)
      .eq("status", "PENDING")
      .maybeSingle();

    pendingClaim = Boolean(claim);
  }

  const isOwner = business.owner_id === user?.id;

  const coverImageUrl = business.cover_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-images/${business.cover_image_path}`
    : null;

  return (
    <main className="pb-16">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            href="/businesses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Explore businesses
          </Link>
        </div>

        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/7] overflow-hidden rounded-3xl bg-muted">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-end bg-gradient-to-br from-primary/20 via-accent to-secondary p-8 sm:p-12">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {formatCategory(business.category)}
                  </p>

                  <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                    {business.name}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  {formatCategory(business.category)}
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                  {business.name}
                </h1>
              </div>

              {business.description && (
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {business.address && <span>📍 {business.address}</span>}

                {business.phone && <span>☎ {business.phone}</span>}
              </div>

              <div className="flex flex-wrap gap-3">
                {business.latitude !== null && business.longitude !== null && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold hover:bg-muted"
                  >
                    Open in Maps
                  </a>
                )}

                {isOwner ? (
                  <Link
                    href={`/dashboard/businesses/${business.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Manage business
                  </Link>
                ) : business.owner_id ? null : pendingClaim ? (
                  <span className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-semibold text-muted-foreground">
                    Claim request pending
                  </span>
                ) : user ? (
                  <ClaimBusinessDialog
                    businessId={business.id}
                    businessName={business.name}
                  />
                ) : null}
              </div>
            </div>

            <section className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Book
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Choose a resource
                </h2>

                <p className="mt-1 text-muted-foreground">
                  Pick what you want to use, then check available times.
                </p>
              </div>

              {resources.length === 0 ? (
                <div className="rounded-2xl border bg-card p-8">
                  <p className="font-semibold">No bookable resources yet</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This business hasn&apos;t published any bookable resources.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {resources.map((resource) => {
                    const lowestPrice = lowestPriceByResource.get(resource.id);

                    return (
                      <article
                        key={resource.id}
                        className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {resource.resource_type.replaceAll("_", " ")}
                            </p>

                            <h3 className="mt-1 text-xl font-bold">
                              {resource.name}
                            </h3>
                          </div>

                          {resource.capacity !== null && (
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                              Up to {resource.capacity}
                            </span>
                          )}
                        </div>

                        {resource.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {resource.description}
                          </p>
                        )}

                        <div className="mt-6 flex items-end justify-between gap-4">
                          <div>
                            {lowestPrice !== undefined ? (
                              <>
                                <p className="text-xs text-muted-foreground">
                                  From
                                </p>

                                <p className="text-lg font-bold">
                                  {formatPrice(lowestPrice)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Pricing not available
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/businesses/${business.slug}/resources/${resource.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            Check availability
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                BatacHub
              </p>

              <h2 className="mt-2 text-xl font-bold">Ready to book?</h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a resource and see available times instantly.
              </p>

              {resources.length > 0 && (
                <Link
                  href={`/businesses/${business.slug}/resources/${resources[0].id}`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Book now
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
