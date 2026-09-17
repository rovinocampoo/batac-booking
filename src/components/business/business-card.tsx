import Image from "next/image";
import Link from "next/link";

import type { Business } from "@/types/business";

const categoryLabels: Record<string, string> = {
  SPORTS: "Sports",
  FITNESS: "Fitness",
  FOOD_AND_DRINK: "Food & Drink",
  EVENTS: "Events",
  CREATIVE: "Creative",
  OTHER: "Other",
};

export function BusinessCard({
  business,
}: {
  business: Business & {
    cover_image_path?: string | null;
  };
}) {
  const category = categoryLabels[business.category] ?? business.category;

  const imageUrl = business.cover_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-images/${business.cover_image_path}`
    : "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 pt-16">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">
            {category}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{business.name}</h2>

          {business.address && (
            <p className="mt-1 text-sm text-muted-foreground">
              📍 {business.address}
            </p>
          )}
        </div>

        {business.description && (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {business.description}
          </p>
        )}

        <div className="pt-1 text-sm font-bold text-primary">
          View business →
        </div>
      </div>
    </Link>
  );
}
