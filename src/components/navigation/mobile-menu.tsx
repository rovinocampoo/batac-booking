"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    setOpen((currentOpen) => !currentOpen);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={handleToggle}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b bg-background p-4 shadow-md">
          <nav className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={handleClose}
            >
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={handleClose}
            >
              Profile
            </Link>
            <Link href="/dashboard/bookings">My Bookings</Link>
          </nav>
        </div>
      )}
    </div>
  );
}
