import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { BusinessSettingsForm } from "@/components/business/business-settings-form";

type Props = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function BusinessSettingsPage({ params }: Props) {
  const { businessId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, description, category, address, phone, cover_image_path")
    .eq("id", businessId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load business: ${error.message}`);
  }

  if (!business) {
    notFound();
  }

  return (
    <main className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/dashboard/businesses/${businessId}`}
          className="text-sm text-muted-foreground underline"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">Business settings</h1>

        <p className="text-muted-foreground">Manage what customers see.</p>
      </div>

      <BusinessSettingsForm
        business={{
          id: business.id,
          name: business.name,
          description: business.description ?? "",
          category: business.category,
          address: business.address ?? "",
          phone: business.phone ?? "",
          coverImagePath: business.cover_image_path,
        }}
      />
    </main>
  );
}
