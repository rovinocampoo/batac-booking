import { requireAdmin } from "@/lib/auth/require-admin";
import { Badge } from "@/components/ui/badge";
import { ImportReviewDialog } from "@/components/admin/import-review-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminImportsPage() {
  const { supabase } = await requireAdmin();

  const { data: candidates, error } = await supabase
    .from("business_import_candidates")
    .select(
      "id, name, category, address, latitude, longitude, status, external_url, created_at",
    )
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load import candidates: ${error.message}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import Candidates</h1>

        <p className="text-muted-foreground">
          Review businesses discovered from external sources.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>

                <TableCell>{candidate.category}</TableCell>

                <TableCell>{candidate.address ?? "Unknown"}</TableCell>

                <TableCell>
                  <a
                    href={candidate.external_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    OpenStreetMap
                  </a>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{candidate.status}</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <ImportReviewDialog
                    candidate={{
                      id: candidate.id,
                      name: candidate.name,
                      category: candidate.category,
                      address: candidate.address,
                      latitude: candidate.latitude,
                      longitude: candidate.longitude,
                      external_url: candidate.external_url,
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
