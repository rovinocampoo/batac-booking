import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedBusinesses } from "@/components/home/featured-businesses";
import { Hero } from "@/components/home/hero";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <Hero />
      <CategoryGrid />
      <FeaturedBusinesses />
    </div>
  );
}
