"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  updateBusiness,
  uploadBusinessCoverImage,
} from "@/app/(app)/dashboard/businesses/[businessId]/settings/actions";

import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "SPORTS",
  "FITNESS",
  "FOOD_AND_DRINK",
  "EVENTS",
  "CREATIVE",
  "OTHER",
] as const;

type Business = {
  id: string;
  name: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  address: string;
  phone: string;
  coverImagePath: string | null;
};

export function BusinessSettingsForm({ business }: { business: Business }) {
  const router = useRouter();

  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description);
  const [category, setCategory] = useState<Business["category"]>(
    business.category,
  );
  const [address, setAddress] = useState(business.address);
  const [phone, setPhone] = useState(business.phone);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const coverImageUrl = business.coverImagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-images/${business.coverImagePath}`
    : null;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage(null);

      await updateBusiness({
        businessId: business.id,
        name,
        description,
        category,
        address,
        phone,
      });

      setMessage("Business profile updated.");
      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      await uploadBusinessCoverImage(business.id, formData);

      setMessage("Cover image uploaded.");
      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Cover image</p>
          {coverImageUrl && (
            <div className="overflow-hidden rounded-2xl border">
              <Image
                src={coverImageUrl}
                alt={`${business.name} cover`}
                width={1600}
                height={700}
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Upload a clear photo representing the business.
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={handleImageUpload}
          className="block w-full text-sm"
        />

        {isUploading && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Business name
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as Business["category"])
          }
          disabled={isSaving}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving}
          className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>

        <input
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={isSaving}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>

        <input
          id="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={isSaving}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button type="submit" disabled={isSaving || isUploading}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
