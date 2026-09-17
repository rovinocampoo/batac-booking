import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { MobileMenu } from "@/components/navigation/mobile-menu";

export async function PublicHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-black tracking-tight">
          Batac<span className="text-primary">Hub</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/businesses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Explore
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard/bookings"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                My bookings
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign in
                </Link>

                <div className="flex flex-col items-end leading-tight">
                  <Link
                    href="/signup"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </>
          )}
        </nav>

        <MobileMenu isAuthenticated={Boolean(user)} />
      </div>
    </header>
  );
}
