"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { manageBookingStatus } from "@/app/(app)/dashboard/businesses/[businessId]/bookings/actions";

import { Button } from "@/components/ui/button";

export function BusinessBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function updateStatus(
    nextStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED",
  ) {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      await manageBookingStatus(bookingId, nextStatus);

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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {status === "PENDING" && (
          <Button
            size="sm"
            onClick={() => updateStatus("CONFIRMED")}
            disabled={isProcessing}
          >
            Confirm
          </Button>
        )}

        {status === "CONFIRMED" && (
          <Button
            size="sm"
            onClick={() => updateStatus("COMPLETED")}
            disabled={isProcessing}
          >
            Complete
          </Button>
        )}

        {(status === "PENDING" || status === "CONFIRMED") && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => updateStatus("CANCELLED")}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
