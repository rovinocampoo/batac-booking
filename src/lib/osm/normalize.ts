import type { OsmElement } from "./types";

export type NormalizedBusiness = {
  source: "OPENSTREETMAP";
  externalId: string;
  externalUrl: string;
  name: string;
  category:
    | "SPORTS"
    | "FITNESS"
    | "FOOD_AND_DRINK"
    | "EVENTS"
    | "CREATIVE"
    | "OTHER";
  latitude: number;
  longitude: number;
  address: string | null;
  website: string | null;
};
export function normalizeOsmBusiness(
  element: OsmElement,
): NormalizedBusiness | null {
  const name = element.tags?.name;

  if (!name) {
    return null;
  }

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  const category = getBusinessCategory(element);

  if (!category) {
    return null;
  }

return {
  source: "OPENSTREETMAP",
  externalId: String(element.id),
  externalUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  name,
  category,
  latitude,
  longitude,
  address: element.tags?.["addr:street"] ?? null,
  website: element.tags?.website ?? null,
};

}

function getBusinessCategory(
  element: OsmElement,
): NormalizedBusiness["category"] | null {
  const tags = element.tags;

  if (!tags) {
    return null;
  }

  if (
    tags.amenity === "cafe" ||
    tags.amenity === "restaurant"
  ) {
    return "FOOD_AND_DRINK";
  }

  if (tags.leisure === "fitness_centre") {
    return "FITNESS";
  }

  if (
    tags.leisure === "sports_centre" ||
    tags.leisure === "sports_hall"
  ) {
    return "SPORTS";
  }

  if (tags.sport) {
    return "SPORTS";
  }

  return null;
}