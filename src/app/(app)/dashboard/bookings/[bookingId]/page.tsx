import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { BookingCancelDialog } from "@/components/booking/booking-cancel-dialog";

type BookingPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { bookingId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        starts_at,
        ends_at,
        status,
        total_amount,
        resource:resources (
          id,
          name,
          resource_type,
          business_id
        )
      `,
    )
    .eq("id", bookingId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load booking: ${error.message}`);
  }

  if (!booking) {
    notFound();
  }

  const resource = Array.isArray(booking.resource)
    ? (booking.resource[0] ?? null)
    : booking.resource;

  if (!resource) {
    notFound();
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, address")
    .eq("id", resource.business_id)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Failed to load business: ${businessError.message}`);
  }

  if (!business) {
    notFound();
  }

  const canCancel =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    new Date(booking.starts_at) > new Date();

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/bookings"
        className="text-sm text-muted-foreground underline"
      >
        ← My bookings
      </Link>

      <div className="rounded-xl border p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Booking confirmed</p>

          <h1 className="text-3xl font-bold">{business.name}</h1>

          <p className="text-muted-foreground">
            {resource.name} · {resource.resource_type}
          </p>
        </div>

        <div className="my-6 border-t" />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Date & time</p>

            <p className="mt-1 font-medium">
              {formatDateTime(booking.starts_at)}
            </p>

            <p className="text-sm text-muted-foreground">
              until{" "}
              {new Intl.DateTimeFormat("en-PH", {
                timeZone: "Asia/Manila",
                timeStyle: "short",
              }).format(new Date(booking.ends_at))}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Amount</p>

            <p className="mt-1 text-xl font-semibold">
              {formatPrice(Number(booking.total_amount))}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>

            <div className="mt-1">
              <Badge variant="secondary">{booking.status}</Badge>
            </div>
          </div>

          {business.address && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>

              <p className="mt-1">{business.address}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/businesses/${business.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium"
          >
            View business
          </Link>

          <Link
            href="/dashboard/bookings"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            My bookings
          </Link>

          {canCancel && (
            <BookingCancelDialog
              bookingId={booking.id}
              resourceName={resource.name}
            />
          )}
        </div>
      </div>
    </main>
  );
}
