"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createResourceHour } from "@/app/(app)/dashboard/businesses/[businessId]/resources/[resourceId]/hours/actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function ResourceHoursDialog({
  businessId,
  resourceId,
}: {
  businessId: string;
  resourceId: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [opensAt, setOpensAt] = useState("09:00");
  const [closesAt, setClosesAt] = useState("21:00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await createResourceHour({
        businessId,
        resourceId,
        dayOfWeek,
        opensAt,
        closesAt,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add hours</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Operating Hours</DialogTitle>

            <DialogDescription>
              Add a schedule for this resource.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="day-of-week" className="text-sm font-medium">
                Day
              </label>

              <select
                id="day-of-week"
                value={dayOfWeek}
                onChange={(event) => setDayOfWeek(Number(event.target.value))}
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="opens-at" className="text-sm font-medium">
                  Opens
                </label>

                <input
                  id="opens-at"
                  type="time"
                  value={opensAt}
                  onChange={(event) => setOpensAt(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="closes-at" className="text-sm font-medium">
                  Closes
                </label>

                <input
                  id="closes-at"
                  type="time"
                  value={closesAt}
                  onChange={(event) => setClosesAt(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add hours"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
