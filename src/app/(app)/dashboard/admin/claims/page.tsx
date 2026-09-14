import { requireAdmin } from "@/lib/auth/require-admin";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ClaimReviewDialog } from "@/components/admin/claim-review-dialog";

export default async function AdminClaimsPage() {
  const { supabase } = await requireAdmin();

  const { data: claims, error } = await supabase
    .from("business_claim_requests")
    .select(
      `
        id,
        business_id,
        requester_id,
        message,
        status,
        created_at,
        business:businesses!business_claim_requests_business_id_fkey (
            name,
            category
        )
        `,
    )
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  const normalizedClaims = claims?.map((claim) => ({
    ...claim,
    business: Array.isArray(claim.business)
      ? (claim.business[0] ?? null)
      : claim.business,
  }));

  if (error) {
    throw new Error(`Failed to load business claims: ${error.message}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Business Claims</h1>

        <p className="text-muted-foreground">
          Review requests from users claiming ownership of businesses.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {normalizedClaims?.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-medium">
                  {claim.business?.name ?? "Unknown"}
                </TableCell>

                <TableCell>{claim.business?.category ?? "Unknown"}</TableCell>

                <TableCell className="font-mono text-xs">
                  {claim.requester_id}
                </TableCell>

                <TableCell className="max-w-xs">
                  {claim.message ?? "No message"}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{claim.status}</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <ClaimReviewDialog
                    claim={{
                      id: claim.id,
                      businessName: claim.business?.name ?? "Unknown",
                      message: claim.message,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
