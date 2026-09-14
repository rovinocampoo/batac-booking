import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ClaimBusinessDialog } from "@/components/business/claim-business-dialog";

type BusinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        description,
        category,
        address,
        phone,
        status,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load business: ${error.message}`);
  }

  if (!business) {
    notFound();
  }

  let pendingClaim = false;

  if (user) {
    const { data: claim } = await supabase
      .from("business_claim_requests")
      .select("id")
      .eq("business_id", business.id)
      .eq("requester_id", user.id)
      .eq("status", "PENDING")
      .maybeSingle();

    pendingClaim = Boolean(claim);
  }

  const isOwner = business.owner_id === user?.id;

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/businesses"
          className="text-sm text-muted-foreground underline"
        >
          ← Back to businesses
        </Link>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{business.category}</p>

          <h1 className="text-3xl font-bold">{business.name}</h1>
        </div>

        {business.description && (
          <p className="max-w-2xl text-muted-foreground">
            {business.description}
          </p>
        )}

        <div className="space-y-1 text-sm">
          {business.address && <p>{business.address}</p>}

          {business.phone && <p>{business.phone}</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Business ownership</h2>

        {isOwner ? (
          <p className="text-sm text-muted-foreground">
            You manage this business.
          </p>
        ) : business.owner_id ? (
          <p className="text-sm text-muted-foreground">
            This business is already claimed.
          </p>
        ) : pendingClaim ? (
          <p className="text-sm text-muted-foreground">
            Your claim request is pending review.
          </p>
        ) : user ? (
          <ClaimBusinessDialog
            businessId={business.id}
            businessName={business.name}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            to claim this business.
          </p>
        )}
      </section>
    </main>
  );
}
