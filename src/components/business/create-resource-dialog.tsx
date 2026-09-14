"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createResource } from "@/app/(app)/dashboard/businesses/[businessId]/resources/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RESOURCE_TYPES = [
  "COURT",
  "GYM_AREA",
  "SEATING_AREA",
  "PRIVATE_ROOM",
  "EVENT_SPACE",
  "STUDIO",
  "OTHER",
] as const;

export function CreateResourceDialog({ businessId }: { businessId: string }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] =
    useState<(typeof RESOURCE_TYPES)[number]>("OTHER");
  const [capacity, setCapacity] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const parsedCapacity = capacity.trim() === "" ? null : Number(capacity);

      if (parsedCapacity !== null && !Number.isInteger(parsedCapacity)) {
        throw new Error("Capacity must be a whole number.");
      }

      await createResource({
        businessId,
        name,
        description,
        resourceType,
        capacity: parsedCapacity,
      });

      setOpen(false);
      setName("");
      setDescription("");
      setResourceType("OTHER");
      setCapacity("");

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
      <Button onClick={() => setOpen(true)}>Add resource</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>

            <DialogDescription>
              Create something customers can book at this business.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="resource-name" className="text-sm font-medium">
                Name
              </label>

              <input
                id="resource-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tennis Court 1"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resource-type" className="text-sm font-medium">
                Type
              </label>

              <select
                id="resource-type"
                value={resourceType}
                onChange={(event) =>
                  setResourceType(
                    event.target.value as (typeof RESOURCE_TYPES)[number],
                  )
                }
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resource-capacity"
                className="text-sm font-medium"
              >
                Capacity
              </label>

              <input
                id="resource-capacity"
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="4"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resource-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="resource-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the resource."
                disabled={isSubmitting}
                className="min-h-24 w-full rounded-md border bg-background p-3 text-sm outline-none"
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
              {isSubmitting ? "Creating..." : "Create resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
