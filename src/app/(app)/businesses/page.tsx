import { createClient } from "@/lib/supabase/server";
import { BusinessCard } from "@/components/business/business-card";
import type { Business } from "@/types/business";

export default async function BusinessesPage() {
  const supabase = await createClient();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, category, address")
    .eq("status", "APPROVED")
    .order("name");

  if (error) {
    throw new Error("Failed to load businesses.");
  }

  const typedBusinesses = businesses as Business[];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Discover
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Businesses in Batac
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discover local businesses, spaces, and places around Batac.
        </p>
      </header>

      {typedBusinesses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">No businesses yet</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon as more local businesses join BatacHub.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {typedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
