"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createResourcePricing } from "@/app/(app)/dashboard/businesses/[businessId]/resources/[resourceId]/pricing/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ResourcePricingDialog({
  businessId,
  resourceId,
}: {
  businessId: string;
  resourceId: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const parsedPrice = Number(price);
      const parsedDuration = Number(durationMinutes);

      if (!Number.isFinite(parsedPrice)) {
        throw new Error("Enter a valid price.");
      }

      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        throw new Error("Duration must be a positive whole number.");
      }

      await createResourcePricing({
        businessId,
        resourceId,
        name,
        price: parsedPrice,
        durationMinutes: parsedDuration,
      });

      setOpen(false);
      setName("");
      setPrice("");
      setDurationMinutes("60");

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
      <Button onClick={() => setOpen(true)}>Add pricing</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pricing</DialogTitle>

            <DialogDescription>
              Define how much this resource costs and how long each booking
              lasts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pricing-name" className="text-sm font-medium">
                Name
              </label>

              <input
                id="pricing-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="1 Hour"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pricing-price" className="text-sm font-medium">
                Price
              </label>

              <input
                id="pricing-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="300"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pricing-duration" className="text-sm font-medium">
                Duration (minutes)
              </label>

              <input
                id="pricing-duration"
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                placeholder="60"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
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
              {isSubmitting ? "Saving..." : "Add pricing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
