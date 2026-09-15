import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ResourceHoursDialog } from "@/components/business/resource-hours-dialog";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type ResourceHoursPageProps = {
  params: Promise<{
    businessId: string;
    resourceId: string;
  }>;
};

export default async function ResourceHoursPage({
  params,
}: ResourceHoursPageProps) {
  const { businessId, resourceId } = await params;

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

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id, name, resource_type")
    .eq("id", resourceId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (resourceError) {
    throw new Error(`Failed to load resource: ${resourceError.message}`);
  }

  if (!resource) {
    notFound();
  }

  const { data: hours, error: hoursError } = await supabase
    .from("resource_hours")
    .select("id, day_of_week, opens_at, closes_at")
    .eq("resource_id", resourceId)
    .order("day_of_week");

  if (hoursError) {
    throw new Error(`Failed to load resource hours: ${hoursError.message}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <Link
          href={`/dashboard/businesses/${businessId}/resources`}
          className="text-sm text-muted-foreground underline"
        >
          ← Back to resources
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">{resource.name}</h1>

        <p className="text-muted-foreground">
          {resource.resource_type} · Operating hours
        </p>
      </div>

      <div className="flex justify-end">
        <ResourceHoursDialog businessId={businessId} resourceId={resourceId} />
      </div>

      <div className="divide-y rounded-lg border">
        {DAYS.map((day, index) => {
          const dayHours =
            hours?.filter((hour) => hour.day_of_week === index) ?? [];

          return (
            <div
              key={day}
              className="flex items-center justify-between gap-4 p-4"
            >
              <span className="font-medium">{day}</span>

              {dayHours.length > 0 ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {dayHours.map((hour) => (
                    <p key={hour.id}>
                      {hour.opens_at.slice(0, 5)} – {hour.closes_at.slice(0, 5)}
                    </p>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
