import { handleRouteError, jsonOk } from "@/lib/api-utils";
import { seedSampleTickets } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const tickets = await seedSampleTickets();
    return jsonOk({ tickets });
  } catch (error) {
    return handleRouteError(error);
  }
}
