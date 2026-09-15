import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { BusinessBookingActions } from "@/components/business/business-booking-actions";

type BusinessBookingsPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function BusinessBookingsPage({
  params,
}: BusinessBookingsPageProps) {
  const { businessId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Failed to verify business membership: ${membershipError.message}`,
    );
  }

  if (!membership) {
    notFound();
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, status")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Failed to load business: ${businessError.message}`);
  }

  if (!business) {
    notFound();
  }

  const { data: resources, error: resourcesError } = await supabase
    .from("resources")
    .select("id, name")
    .eq("business_id", businessId);

  if (resourcesError) {
    throw new Error(`Failed to load resources: ${resourcesError.message}`);
  }

  const resourceIds = resources?.map((resource) => resource.id) ?? [];

  const resourceById = new Map(
    resources?.map((resource) => [resource.id, resource]),
  );

  const { data: bookings, error: bookingsError } =
    resourceIds.length > 0
      ? await supabase
          .from("bookings")
          .select(
            "id, resource_id, customer_id, starts_at, ends_at, status, total_amount",
          )
          .in("resource_id", resourceIds)
          .order("starts_at", { ascending: true })
      : { data: [], error: null };

  if (bookingsError) {
    throw new Error(`Failed to load bookings: ${bookingsError.message}`);
  }

  const customerIds = [
    ...new Set(
      bookings
        ?.map((booking) => booking.customer_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    ),
  ];

  const { data: customers, error: customersError } =
    customerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", customerIds)
      : { data: [], error: null };

  if (customersError) {
    throw new Error(`Failed to load customers: ${customersError.message}`);
  }

  const customerById = new Map(
    customers?.map((customer) => [customer.id, customer]),
  );

  const upcomingBookings =
    bookings?.filter(
      (booking) =>
        new Date(booking.ends_at) > new Date() &&
        booking.status !== "CANCELLED",
    ) ?? [];

  const pastBookings =
    bookings?.filter(
      (booking) =>
        new Date(booking.ends_at) <= new Date() ||
        booking.status === "CANCELLED",
    ) ?? [];

  const pendingUpcomingCount = upcomingBookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const upcomingRevenue = upcomingBookings
    .filter(
      (booking) =>
        booking.status === "CONFIRMED" || booking.status === "PENDING",
    )
    .reduce((total, booking) => total + Number(booking.total_amount), 0);

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/dashboard/businesses"
          className="text-sm text-muted-foreground underline"
        >
          ← Back to businesses
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">{business.name}</h1>

        <p className="text-muted-foreground">Manage customer bookings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>

          <p className="mt-1 text-2xl font-semibold">
            {upcomingBookings.length}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending</p>

          <p className="mt-1 text-2xl font-semibold">{pendingUpcomingCount}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Upcoming value</p>

          <p className="mt-1 text-2xl font-semibold">
            {formatPrice(upcomingRevenue)}
          </p>
        </div>
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Upcoming bookings</h2>

          <p className="text-sm text-muted-foreground">
            Reservations that still require attention.
          </p>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              No upcoming bookings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const resource = resourceById.get(booking.resource_id);

              return (
                <div key={booking.id} className="rounded-lg border p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {resource?.name ?? "Unknown resource"}
                      </p>

                      <h3 className="font-semibold">
                        {formatDateTime(booking.starts_at)} –{" "}
                        {formatTime(booking.ends_at)}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Customer:{" "}
                        {customerById.get(booking.customer_id)?.full_name ??
                          "Unnamed customer"}
                      </p>

                      <p className="font-medium">
                        {formatPrice(Number(booking.total_amount))}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{booking.status}</Badge>

                      <BusinessBookingActions
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">History</h2>
        </div>

        {pastBookings.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              No booking history yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const resource = resourceById.get(booking.resource_id);

              return (
                <div key={booking.id} className="rounded-lg border p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {resource?.name ?? "Unknown resource"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(booking.starts_at)} –{" "}
                        {formatTime(booking.ends_at)}
                      </p>
                    </div>

                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
