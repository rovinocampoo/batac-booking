import { BusinessCard } from "@/components/business/business-card";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types/business";

export async function FeaturedBusinesses() {
  const supabase = await createClient();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, category, address, cover_image_path")
    .eq("status", "APPROVED")
    .order("name")
    .limit(6);

  if (error) {
    throw new Error("Failed to load featured businesses.");
  }

  const typedBusinesses = businesses as Business[];

  return (
    <section aria-labelledby="featured-businesses-heading">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Local picks
        </p>

        <h2
          id="featured-businesses-heading"
          className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Featured businesses
        </h2>

        <p className="mt-2 text-muted-foreground">
          Discover some of the places around Batac.
        </p>
      </div>

      {typedBusinesses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h3 className="font-semibold">
            No featured businesses yet
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            More local businesses will appear here soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {typedBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
            />
          ))}
        </div>
      )}
    </section>
  );
}