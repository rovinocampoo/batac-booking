"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { submitBusinessClaim } from "@/app/businesses/[slug]/actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClaimBusinessDialogProps = {
  businessId: string;
  businessName: string;
};

export function ClaimBusinessDialog({
  businessId,
  businessName,
}: ClaimBusinessDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await submitBusinessClaim(businessId, message);

      setOpen(false);
      setMessage("");
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
      setMessage("");
      setErrorMessage(null);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Claim this business</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim {businessName}</DialogTitle>

            <DialogDescription>
              Submit a request to become the owner of this business on BatacHub.
              An administrator will review your request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="claim-message" className="text-sm font-medium">
              Message
            </label>

            <textarea
              id="claim-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us why you should manage this business."
              className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none"
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
