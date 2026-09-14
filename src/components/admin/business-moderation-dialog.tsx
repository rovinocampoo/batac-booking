"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { moderateBusiness } from "@/app/(app)/dashboard/admin/businesses/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BusinessModerationDialogProps = {
  business: {
    id: string;
    name: string;
    status: string;
  };
};

export function BusinessModerationDialog({
  business,
}: BusinessModerationDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleModerate(status: "APPROVED" | "SUSPENDED") {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      await moderateBusiness(business.id, status);

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsProcessing(false);
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
        Review
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderate Business</DialogTitle>

            <DialogDescription>
              Review the business and decide whether it should be publicly
              available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Business</p>

              <p className="font-medium">{business.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Current status</p>

              <p>{business.status}</p>
            </div>

            {errorMessage && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleModerate("SUSPENDED")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Suspend"}
            </Button>

            <Button
              onClick={() => handleModerate("APPROVED")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
