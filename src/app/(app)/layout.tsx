import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "My bookings",
    href: "/dashboard/bookings",
  },
  {
    label: "My businesses",
    href: "/dashboard/businesses",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
  },
];

const adminNavigation = [
  {
    label: "Admin",
    href: "/dashboard/admin",
  },
  {
    label: "Businesses",
    href: "/dashboard/admin/businesses",
  },
  {
    label: "Imports",
    href: "/dashboard/admin/imports",
  },
  {
    label: "Claims",
    href: "/dashboard/admin/claims",
  },
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("platform_role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.platform_role === "ADMIN";
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-black tracking-tight">
            Batac<span className="text-primary">Hub</span>
          </Link>

          <Link href="/" className="text-sm font-medium text-muted-foreground">
            View site
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r lg:block">
          <div className="sticky top-16 p-5">
            <div className="mb-8">
              <Link
                href="/dashboard"
                className="text-2xl font-black tracking-tight"
              >
                Batac<span className="text-primary">Hub</span>
              </Link>

              <p className="mt-1 text-sm text-muted-foreground">
                Your workspace
              </p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {isAdmin && (
              <div className="mt-8 border-t pt-6">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Administration
                </p>

                <nav className="space-y-1">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <Link
                href="/businesses"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Explore Batac
              </Link>

              <Link
                href="/"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Public homepage
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
