"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveImportCandidate,
  rejectImportCandidate,
} from "@/app/(app)/dashboard/admin/imports/actions";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImportCandidate = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  external_url: string | null;
};

type ImportReviewDialogProps = {
  candidate: ImportCandidate;
};

export function ImportReviewDialog({
  candidate,
}: ImportReviewDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  async function handleApprove() {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      await approveImportCandidate(candidate.id);

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      await rejectImportCandidate(candidate.id);

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Review
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Review Import Candidate
            </DialogTitle>

            <DialogDescription>
              Review this business before importing it into
              BatacHub.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Business
              </p>

              <p className="font-medium">
                {candidate.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Category
              </p>

              <p>{candidate.category}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Address
              </p>

              <p>
                {candidate.address ?? "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Coordinates
              </p>

              <p>
                {candidate.latitude ?? "Unknown"},{" "}
                {candidate.longitude ?? "Unknown"}
              </p>
            </div>

            {candidate.external_url && (
              <a
                href={candidate.external_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                View original source
              </a>
            )}

            {errorMessage && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>

            <Button
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : "Approve & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}