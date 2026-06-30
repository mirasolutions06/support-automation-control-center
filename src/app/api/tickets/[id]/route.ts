import { handleRouteError, jsonError, jsonOk } from "@/lib/api-utils";
import { getTicket, updateTicket } from "@/lib/store";
import { updateTicketSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const payload = updateTicketSchema.parse(await request.json());
    const ticket = await getTicket(id);

    if (!ticket) {
      return jsonError("Ticket not found.", 404);
    }

    const updated = await updateTicket(
      id,
      {
        finalResponse: payload.finalResponse ?? ticket.finalResponse,
        status: "needs_review",
      },
      {
        action: "draft_edited",
        actor: "human-reviewer",
        message: "Human reviewer edited the response draft.",
      },
    );

    return jsonOk({ ticket: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
