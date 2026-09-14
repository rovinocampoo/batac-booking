"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBooking } from "@/app/businesses/[slug]/resources/[resourceId]/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingDialogProps = {
  resourceId: string;
  pricingId: string;
  startsAt: string;
  endsAt: string;
  resourceName: string;
  price: number;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export function BookingDialog({
  resourceId,
  pricingId,
  startsAt,
  endsAt,
  resourceName,
  price,
}: BookingDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await createBooking(resourceId, pricingId, startsAt);

      setOpen(false);
      router.push("/dashboard/bookings");
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {formatTime(startsAt)}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm booking</DialogTitle>

            <DialogDescription>
              Review your booking before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Resource</p>

              <p className="font-medium">{resourceName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Time</p>

              <p className="font-medium">
                {formatTime(startsAt)} – {formatTime(endsAt)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Price</p>

              <p className="font-medium">{formatPrice(price)}</p>
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

            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Confirm booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
