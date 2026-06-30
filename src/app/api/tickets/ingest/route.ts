import { assertWebhookSecret, handleRouteError, jsonOk } from "@/lib/api-utils";
import { createTicket } from "@/lib/store";
import { inboundTicketSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const secretCheck = assertWebhookSecret(request);

    if (!secretCheck.ok) {
      return secretCheck.response;
    }

    const payload = inboundTicketSchema.parse(await request.json());
    const auditMetadata: Record<string, unknown> = {
      source: payload.source,
      webhookSecurity: secretCheck.mode,
    };

    if (typeof payload.metadata?.n8nExecutionId === "string") {
      auditMetadata.n8nExecutionId = payload.metadata.n8nExecutionId;
    }

    const ticket = await createTicket(payload, {
      action: "ticket_created",
      actor: payload.source === "demo" ? "sample-loader" : "n8n-webhook",
      message: "Inbound message captured and queued for AI drafting.",
      metadata: auditMetadata,
    });

    return jsonOk({ ticket }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
