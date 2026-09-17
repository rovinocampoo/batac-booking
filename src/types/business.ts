export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  address: string | null;
  cover_image_path?: string | null;
};