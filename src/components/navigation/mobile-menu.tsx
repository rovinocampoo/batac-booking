"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

type MobileMenuProps = {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
};

export function MobileMenu({
  isAuthenticated = false,
  isAdmin = false,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b bg-background shadow-lg">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            <Link
              href="/businesses"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
            >
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/bookings"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  My bookings
                </Link>

                <Link
                  href="/dashboard/businesses"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  My businesses
                </Link>

                {isAdmin && (
                  <>
                    <div className="my-3 border-t" />

                    <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Administration
                    </p>

                    <Link
                      href="/dashboard/admin"
                      onClick={closeMenu}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                    >
                      Admin
                    </Link>

                    <Link
                      href="/dashboard/admin/businesses"
                      onClick={closeMenu}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                    >
                      Businesses
                    </Link>

                    <Link
                      href="/dashboard/admin/imports"
                      onClick={closeMenu}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                    >
                      Imports
                    </Link>

                    <Link
                      href="/dashboard/admin/claims"
                      onClick={closeMenu}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                    >
                      Claims
                    </Link>
                    <div className="border-t pt-3">
                      <LogoutButton />
                    </div>
                  </>
                )}

                <div className="my-3 border-t" />

                <Link
                  href="/dashboard/profile"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="block rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
