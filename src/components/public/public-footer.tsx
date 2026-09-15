import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-black">
            Batac<span className="text-primary">Hub</span>
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Discover Batac. Find your place.
          </p>
        </div>

        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/businesses">Explore</Link>

          <Link href="/login">Sign in</Link>

          <Link href="/signup">Get started</Link>
        </div>
      </div>
    </footer>
  );
}
