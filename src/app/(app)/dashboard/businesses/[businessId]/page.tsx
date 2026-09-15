import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";

type BusinessDashboardProps = {
  params: Promise<{
    businessId: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function BusinessDashboard({
  params,
}: BusinessDashboardProps) {
  const { businessId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, category, address, status")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Failed to load business: ${businessError.message}`);
  }

  if (!business) {
    notFound();
  }

  const { data: resources, error: resourceError } = await supabase
    .from("resources")
    .select("id, name, resource_type, status")
    .eq("business_id", businessId)
    .order("name");

  if (resourceError) {
    throw new Error(`Failed to load resources: ${resourceError.message}`);
  }

  const resourceIds = resources?.map((resource) => resource.id) ?? [];

  const { data: bookings, error: bookingError } =
    resourceIds.length > 0
      ? await supabase
          .from("bookings")
          .select("id, resource_id, starts_at, ends_at, status, total_amount")
          .in("resource_id", resourceIds)
          .order("starts_at", {
            ascending: true,
          })
          .limit(50)
      : { data: [], error: null };

  if (bookingError) {
    throw new Error(`Failed to load bookings: ${bookingError.message}`);
  }

  const now = new Date();

  const upcomingBookings =
    bookings?.filter(
      (booking) =>
        new Date(booking.ends_at) > now && booking.status !== "CANCELLED",
    ) ?? [];

  const pendingBookings = upcomingBookings.filter(
    (booking) => booking.status === "PENDING",
  );

  const upcomingValue = upcomingBookings.reduce(
    (total, booking) => total + Number(booking.total_amount),
    0,
  );

  const resourceById = new Map(
    resources?.map((resource) => [resource.id, resource]),
  );

  return (
    <main className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/dashboard/businesses"
            className="text-sm text-muted-foreground underline"
          >
            ← My businesses
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{business.name}</h1>

            <Badge
              variant={business.status === "APPROVED" ? "default" : "secondary"}
            >
              {business.status}
            </Badge>

            <Badge variant="outline">{membership.role}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {business.category}
            {business.address ? ` · ${business.address}` : ""}
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-5">
          <p className="text-sm text-muted-foreground">Upcoming bookings</p>

          <p className="mt-2 text-3xl font-semibold">
            {upcomingBookings.length}
          </p>
        </div>

        <div className="rounded-lg border p-5">
          <p className="text-sm text-muted-foreground">Pending bookings</p>

          <p className="mt-2 text-3xl font-semibold">
            {pendingBookings.length}
          </p>
        </div>

        <div className="rounded-lg border p-5">
          <p className="text-sm text-muted-foreground">Upcoming value</p>

          <p className="mt-2 text-3xl font-semibold">
            {formatPrice(upcomingValue)}
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/businesses/${businessId}/bookings`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          View bookings
        </Link>

        <Link
          href={`/dashboard/businesses/${businessId}/resources`}
          className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium"
        >
          Manage resources
        </Link>

        <Link
          href={`/dashboard/businesses/${businessId}/settings`}
          className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium"
        >
          Settings
        </Link>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Upcoming bookings</h2>

          <p className="text-sm text-muted-foreground">
            Your next customer reservations.
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
            {upcomingBookings.slice(0, 5).map((booking) => {
              const resource = resourceById.get(booking.resource_id);

              return (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {resource?.name ?? "Unknown resource"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(booking.starts_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatPrice(Number(booking.total_amount))}
                    </span>

                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Resources</h2>

            <p className="text-sm text-muted-foreground">
              Things customers can book.
            </p>
          </div>

          <Link
            href={`/dashboard/businesses/${businessId}/resources`}
            className="text-sm underline"
          >
            Manage
          </Link>
        </div>

        {resources?.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">No resources yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources?.map((resource) => (
              <div key={resource.id} className="rounded-lg border p-4">
                <p className="font-medium">{resource.name}</p>

                <p className="text-sm text-muted-foreground">
                  {resource.resource_type}
                </p>

                <Badge
                  className="mt-3"
                  variant={
                    resource.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {resource.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
