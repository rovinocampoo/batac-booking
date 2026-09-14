import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Business } from "@/types/business";

type BusinessCardProps = {
  business: Business;
};

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-background transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0"
          alt={`${business.name} exterior`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {business.category}
        </p>

        <h3 className="mt-2 text-lg font-semibold">{business.name}</h3>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {business.description ?? "No description available."}
        </p>

        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />

          <span>{business.address ?? "Batac City, Ilocos Norte"}</span>
        </div>

        <Link
          href={`/businesses/${business.slug}`}
          className="mt-5 inline-block text-sm font-medium group-hover:underline"
        >
          View business →
        </Link>
      </div>
    </article>
  );
}
