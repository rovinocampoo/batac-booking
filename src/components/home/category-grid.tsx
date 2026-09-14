import Link from "next/link";
import {
  Dumbbell,
  Utensils,
  CalendarDays,
  Palette,
  CircleEllipsis,
  SportShoe,
} from "lucide-react";

type Category = {
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const categories: Category[] = [
  {
    name: "Sports",
    slug: "sports",
    description: "Courts, fields, and places to play.",
    icon: SportShoe,
  },
  {
    name: "Fitness",
    slug: "fitness",
    description: "Gyms, training spaces, and fitness studios.",
    icon: Dumbbell,
  },
  {
    name: "Food & Drink",
    slug: "food-and-drink",
    description: "Coffee shops, restaurants, and local spots.",
    icon: Utensils,
  },
  {
    name: "Events",
    slug: "events",
    description: "Venues and spaces for your next event.",
    icon: CalendarDays,
  },
  {
    name: "Creative",
    slug: "creative",
    description: "Studios, workshops, and creative spaces.",
    icon: Palette,
  },
  {
    name: "Other",
    slug: "other",
    description: "Discover more places around Batac.",
    icon: CircleEllipsis,
  },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Explore
        </p>

        <h2
          id="categories-heading"
          className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Explore by category
        </h2>

        <p className="mt-2 text-muted-foreground">
          Find places based on what you want to do.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.slug}
              href={`/businesses?category=${category.slug}`}
              className="group rounded-xl border bg-background p-5 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5" />
              </div>

              <h3 className="font-semibold">{category.name}</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>

              <span className="mt-4 inline-block text-sm font-medium group-hover:underline">
                Explore →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
