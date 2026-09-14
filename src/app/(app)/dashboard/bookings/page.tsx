import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { BookingCancelDialog } from "@/components/booking/booking-cancel-dialog";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        resource_id,
        starts_at,
        ends_at,
        status,
        total_amount,
        created_at,
        resource:resources (
          id,
          name,
          resource_type,
          business_id
        )
      `,
    )
    .eq("customer_id", user.id)
    .order("starts_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  const normalizedBookings =
    bookings?.map((booking) => ({
      ...booking,
      resource: Array.isArray(booking.resource)
        ? (booking.resource[0] ?? null)
        : booking.resource,
    })) ?? [];

  const businessIds = [
    ...new Set(
      normalizedBookings
        .map((booking) => booking.resource?.business_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: businesses } =
    businessIds.length > 0
      ? await supabase
          .from("businesses")
          .select("id, name, slug")
          .in("id", businessIds)
      : { data: [] };

  const businessById = new Map(
    businesses?.map((business) => [business.id, business]),
  );

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bookings</h1>

        <p className="text-muted-foreground">
          View and manage your reservations.
        </p>
      </div>

      {normalizedBookings.length === 0 ? (
        <div className="rounded-lg border p-8">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any bookings yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {normalizedBookings.map((booking) => {
            const business = booking.resource?.business_id
              ? businessById.get(booking.resource.business_id)
              : undefined;

            const canCancel =
              (booking.status === "PENDING" ||
                booking.status === "CONFIRMED") &&
              new Date(booking.starts_at) > new Date();

            return (
              <div key={booking.id} className="rounded-lg border p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {business?.name ?? "Unknown business"}
                      </p>

                      <h2 className="font-semibold">
                        {booking.resource?.name ?? "Unknown resource"}
                      </h2>
                    </div>

                    <p className="text-sm">
                      {formatDateTime(booking.starts_at)} –{" "}
                      {new Intl.DateTimeFormat("en-PH", {
                        timeZone: "Asia/Manila",
                        timeStyle: "short",
                      }).format(new Date(booking.ends_at))}
                    </p>

                    <p className="font-medium">
                      {formatPrice(Number(booking.total_amount))}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="secondary">{booking.status}</Badge>

                    {canCancel && (
                      <BookingCancelDialog
                        bookingId={booking.id}
                        resourceName={booking.resource?.name ?? "this resource"}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
