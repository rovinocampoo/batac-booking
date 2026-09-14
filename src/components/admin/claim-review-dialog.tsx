"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { moderateBusinessClaim } from "@/app/(app)/dashboard/admin/claims/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClaimReviewDialogProps = {
  claim: {
    id: string;
    businessName: string;
    message: string | null;
  };
};

export function ClaimReviewDialog({ claim }: ClaimReviewDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDecision(decision: "APPROVED" | "REJECTED") {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      await moderateBusinessClaim(claim.id, decision);

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
            <DialogTitle>Review Business Claim</DialogTitle>

            <DialogDescription>
              Verify the request before granting business ownership.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Business</p>

              <p className="font-medium">{claim.businessName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Claim message</p>

              <p>{claim.message ?? "No message provided."}</p>
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
              onClick={() => handleDecision("REJECTED")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>

            <Button
              onClick={() => handleDecision("APPROVED")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Approve & Assign Owner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
