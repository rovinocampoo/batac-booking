import Link from "next/link";
import { Search } from "lucide-react";

export function Hero() {
  return (
    <section className="rounded-2xl border bg-muted/40 px-6 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Discover Batac
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find your next place to play, eat, train, or explore.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Discover local businesses, book available spaces, and experience what
          Batac has to offer.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/businesses"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" />
            Explore places
          </Link>

          <Link
            href="/businesses"
            className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse businesses
          </Link>
        </div>
      </div>
    </section>
  );
}
