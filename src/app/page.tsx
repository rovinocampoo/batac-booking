import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { BusinessCard } from "@/components/business/business-card";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

const CATEGORIES = [
  {
    value: "SPORTS",
    label: "Sports",
  },
  {
    value: "FITNESS",
    label: "Fitness",
  },
  {
    value: "FOOD_AND_DRINK",
    label: "Food & Drink",
  },
  {
    value: "EVENTS",
    label: "Events",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, category, address")
    .eq("status", "APPROVED")
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    throw new Error(`Failed to load featured businesses: ${error.message}`);
  }

  const { data: bookableBusinesses, error: resourceError } = await supabase
    .from("resources")
    .select(
      `
          id,
          name,
          resource_type,
          business_id
        `,
    )
    .eq("status", "ACTIVE")
    .limit(6);

  if (resourceError) {
    throw new Error(
      `Failed to load bookable resources: ${resourceError.message}`,
    );
  }

  const resourceBusinessIds = [
    ...new Set(
      bookableBusinesses
        ?.map((resource) => resource.business_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    ),
  ];

  const { data: resourceBusinesses } =
    resourceBusinessIds.length > 0
      ? await supabase
          .from("businesses")
          .select("id, name, slug, status")
          .in("id", resourceBusinessIds)
          .eq("status", "APPROVED")
      : { data: [] };

  const businessById = new Map(
    resourceBusinesses?.map((business) => [business.id, business]),
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 sm:py-24">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Batac, Ilocos Norte
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Find your next place to play, eat, train, or explore.
              </h1>

              <p className="max-w-2xl text-lg text-muted-foreground">
                Discover local businesses and book the places you actually want
                to use.
              </p>
            </div>

            <form
              action="/businesses"
              method="get"
              className="flex max-w-3xl flex-col gap-3 sm:flex-row"
            >
              <input
                name="q"
                type="search"
                placeholder="Search tennis courts, gyms, coffee shops..."
                className="h-12 flex-1 rounded-md border bg-background px-4 text-sm"
              />

              <button
                type="submit"
                className="h-12 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
          <div>
            <h2 className="text-2xl font-semibold">Explore by category</h2>

            <p className="text-sm text-muted-foreground">
              Find something that matches what you&apos;re looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/businesses?category=${category.value}`}
                className="rounded-lg border p-5 transition-colors hover:bg-muted"
              >
                <p className="font-medium">{category.label}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Explore {category.label.toLowerCase()}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured businesses</h2>

              <p className="text-sm text-muted-foreground">
                Places currently available on BatacHub.
              </p>
            </div>

            <Link href="/businesses" className="text-sm underline">
              View all
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="rounded-lg border p-8">
              <p className="text-sm text-muted-foreground">
                Businesses are being added to BatacHub.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
          <div>
            <h2 className="text-2xl font-semibold">Bookable places</h2>

            <p className="text-sm text-muted-foreground">
              Resources you can book through BatacHub.
            </p>
          </div>

          {bookableBusinesses.length === 0 ? (
            <div className="rounded-lg border p-8">
              <p className="text-sm text-muted-foreground">
                No bookable resources are available yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookableBusinesses.map((resource) => {
                const business = businessById.get(resource.business_id);

                if (!business) {
                  return null;
                }

                return (
                  <Link
                    key={resource.id}
                    href={`/businesses/${business.slug}/resources/${resource.id}`}
                    className="rounded-lg border p-5 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm text-muted-foreground">
                      {business.name}
                    </p>

                    <h3 className="mt-1 font-semibold">{resource.name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {resource.resource_type}
                    </p>

                    <p className="mt-4 text-sm font-medium">
                      View availability →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="rounded-xl border p-8 sm:p-12">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-2xl font-semibold">
                  Own a business in Batac?
                </h2>

                <p className="text-muted-foreground">
                  Claim your business, manage your resources, publish your
                  schedule, and accept bookings.
                </p>

                <Link
                  href="/businesses"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Find your business
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
