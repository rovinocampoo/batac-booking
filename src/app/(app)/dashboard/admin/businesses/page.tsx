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

import { BusinessModerationDialog } from "@/components/admin/business-moderation-dialog";

export default async function AdminBusinessesPage() {
  const { supabase } = await requireAdmin();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, category, address, status, source, owner_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load businesses: ${error.message}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Business Moderation</h1>

        <p className="text-muted-foreground">
          Review pending businesses and manage their publication status.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {businesses?.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">{business.name}</TableCell>

                <TableCell>{business.category}</TableCell>

                <TableCell>{business.source}</TableCell>

                <TableCell>
                  {business.owner_id ? "Claimed" : "Unclaimed"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      business.status === "APPROVED"
                        ? "default"
                        : business.status === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {business.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  {business.status === "PENDING" ? (
                    <BusinessModerationDialog
                      business={{
                        id: business.id,
                        name: business.name,
                        status: business.status,
                      }}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No action
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
