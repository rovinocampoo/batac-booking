import dotenv from "dotenv";
import { importBusinessCandidate } from "../src/lib/businesses/import-service";

dotenv.config({ path: ".env.local" });

const candidateId = "cf30b99f-1c69-4203-b51a-204fe7e53c44";

async function main() {
  const businessId = await importBusinessCandidate(candidateId);

  console.log("BUSINESS IMPORTED");
  console.log("────────────────────────");
  console.log(`Candidate: ${candidateId}`);
  console.log(`Business:  ${businessId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
