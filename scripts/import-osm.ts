import dotenv from "dotenv";
import type { OverpassResponse } from "../src/lib/osm/types";
import { normalizeOsmBusiness } from "../src/lib/osm/normalize";
import {
  findExistingBusiness,
  upsertImportCandidate,
} from "../src/lib/businesses/import";
dotenv.config({ path: ".env.local" });

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const query = `
[out:json][timeout:15];

(
  nwr["amenity"="cafe"](18.035,120.545,18.075,120.585);
  nwr["amenity"="restaurant"](18.035,120.545,18.075,120.585);
  nwr["leisure"="fitness_centre"](18.035,120.545,18.075,120.585);
  nwr["leisure"="sports_centre"](18.035,120.545,18.075,120.585);
  nwr["leisure"="sports_hall"](18.035,120.545,18.075,120.585);
  nwr["sport"="tennis"](18.035,120.545,18.075,120.585);
  nwr["sport"="basketball"](18.035,120.545,18.075,120.585);
  nwr["sport"="volleyball"](18.035,120.545,18.075,120.585);
);

out center tags;
`;

async function main() {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "BatacHub/0.1 (local development)",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Overpass request failed: ${response.status} ${response.statusText}\n${errorBody}`,
    );
  }

  const data = (await response.json()) as OverpassResponse;

  for (const element of data.elements) {
    const business = normalizeOsmBusiness(element);

    if (!business) {
      continue;
    }

    const existingBusiness = await findExistingBusiness(
      business.source,
      business.externalId,
    );

    const candidate = await upsertImportCandidate(business);

    console.log(`
IMPORT CANDIDATE
────────────────────────
Status:      ${existingBusiness ? "EXISTING BUSINESS" : "STAGED"}
Candidate:   ${candidate.id}
Source:      ${business.source}
Name:        ${business.name}
Category:    ${business.category}
Location:    ${business.latitude}, ${business.longitude}
Address:     ${business.address ?? "Unknown"}
Website:     ${business.website ?? "None"}
External ID: ${business.externalId}
External URL: ${business.externalUrl}
`);

    if (existingBusiness) {
      console.log(
        `Possible existing BatacHub business: ${existingBusiness.name} (${existingBusiness.id})`,
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
