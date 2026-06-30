import { handleRouteError, jsonOk } from "@/lib/api-utils";
import { listTickets } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tickets = await listTickets();
    return jsonOk({ tickets });
  } catch (error) {
    return handleRouteError(error);
  }
}
