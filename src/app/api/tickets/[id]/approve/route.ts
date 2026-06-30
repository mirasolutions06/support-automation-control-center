import {
  assertApprovalPasscode,
  handleRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-utils";
import { sendApprovedResponse } from "@/lib/email";
import { evaluateDraftSafety } from "@/lib/safety";
import { getTicket, updateTicket } from "@/lib/store";
import { approveTicketSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const payload = approveTicketSchema.parse(await request.json());
    const authError = assertApprovalPasscode(payload.passcode);

    if (authError) {
      return authError;
    }

    const ticket = await getTicket(id);

    if (!ticket) {
      return jsonError("Ticket not found.", 404);
    }

    const responseBody = payload.finalResponse ?? ticket.finalResponse ?? ticket.aiDraft;

    if (!responseBody) {
      return jsonError("No response draft is available for approval.", 409);
    }

    const safety = evaluateDraftSafety(ticket, responseBody);

    if (!safety.passed) {
      await updateTicket(
        id,
        {
          status: "needs_review",
          finalResponse: responseBody,
        },
        {
          action: "safety_flagged",
          actor: "safety-check",
          message: "Approval blocked because the response needs a safety edit.",
          metadata: { safety },
        },
      );

      return jsonError("Draft failed safety check. Edit before approval.", 409, { safety });
    }

    const approved = await updateTicket(
      id,
      {
        status: "approved",
        finalResponse: responseBody,
      },
      {
        action: "approved",
        actor: "human-reviewer",
        message: "Human reviewer approved the final response.",
        metadata: { safety },
      },
    );

    if (!approved) {
      return jsonError("Ticket not found.", 404);
    }

    const sendResult = await sendApprovedResponse(approved);
    const updated = await updateTicket(
      id,
      {
        status: sendResult.status,
        sendProvider: sendResult.provider,
        sendResult: sendResult.result,
      },
      {
        action:
          sendResult.status === "sent"
            ? "sent"
            : sendResult.status === "simulated"
              ? "send_simulated"
              : "send_failed",
        actor: sendResult.provider,
        message: sendResult.result,
      },
    );

    return jsonOk({ ticket: updated, sendResult });
  } catch (error) {
    return handleRouteError(error);
  }
}
