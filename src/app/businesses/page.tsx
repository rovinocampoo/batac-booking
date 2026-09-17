import { createClient } from "@/lib/supabase/server";

import { BusinessCard } from "@/components/business/business-card";
import Link from "next/link";

const CATEGORIES = [
  "ALL",
  "SPORTS",
  "FITNESS",
  "FOOD_AND_DRINK",
  "EVENTS",
  "CREATIVE",
  "OTHER",
] as const;

type BusinessesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

function isCategory(value: string): value is (typeof CATEGORIES)[number] {
  return CATEGORIES.includes(value as (typeof CATEGORIES)[number]);
}

function formatCategory(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function BusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const params = await searchParams;

  const searchQuery = params.q?.trim() ?? "";

  const requestedCategory = params.category?.toUpperCase() ?? "ALL";

  const category = isCategory(requestedCategory) ? requestedCategory : "ALL";

  const supabase = await createClient();

  let query = supabase
    .from("businesses")
    .select("id, name, slug, description, category, address, cover_image_path")
    .eq("status", "APPROVED")
    .order("name");

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`,
    );
  }

  if (category !== "ALL") {
    query = query.eq("category", category);
  }

  const { data: businesses, error } = await query;

  if (error) {
    throw new Error(`Failed to load businesses: ${error.message}`);
  }

  const resultCount = businesses?.length ?? 0;

  return (
    <main>
      <section className="border-b bg-gradient-to-b from-accent/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-3xl font-bold">Explore Batac</h1>

          <p className="text-muted-foreground">
            Find places to play, eat, train, or explore.
          </p>
        </div>

        <form
          method="get"
          className="grid gap-3 rounded-2xl border bg-card p-3 shadow-sm md:grid-cols-[1fr_220px_auto]"
        >
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search businesses..."
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <select
            name="category"
            defaultValue={category}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value === "ALL" ? "All categories" : formatCategory(value)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? "business" : "businesses"} found
          </p>

          {(searchQuery || category !== "ALL") && (
            <Link href="/businesses" className="text-sm underline">
              Clear filters
            </Link>
          )}
        </div>

        {resultCount === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="font-semibold">No businesses found</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {businesses?.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
