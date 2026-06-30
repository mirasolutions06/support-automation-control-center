import { Resend } from "resend";
import type { SendResult, TicketRecord } from "./types";

function isLiveSendEnabled() {
  return process.env.RESEND_LIVE_SEND === "true";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessageHtml(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function buildEmailHtml(ticket: TicketRecord, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f8fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Reviewed response from Support Operations.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px 0;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f766e;">Support Operations</div>
                <div style="font-size:24px;line-height:1.25;font-weight:700;color:#0f172a;margin-top:6px;">${escapeHtml(ticket.subject)}</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #dbe4ef;border-radius:14px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.08);">
                <div style="font-size:16px;line-height:1.7;color:#1f2937;">
                  ${formatMessageHtml(body)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 2px 0 2px;color:#64748b;font-size:12px;line-height:1.6;">
                This response was reviewed and approved before delivery.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendApprovedResponse(ticket: TicketRecord): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const body = ticket.finalResponse || ticket.aiDraft;

  if (!body) {
    return {
      status: "failed",
      provider: "simulated",
      result: "No approved response body was available to send.",
    };
  }

  if (!apiKey || !from || !isLiveSendEnabled()) {
    return {
      status: "simulated",
      provider: "simulated",
      result:
        "Delivery staged locally. Configure RESEND_API_KEY, RESEND_FROM_EMAIL, verified sender domain, and RESEND_LIVE_SEND=true for live email.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from,
      to: ticket.customerEmail,
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      subject: `Re: ${ticket.subject}`,
      text: body,
      html: buildEmailHtml(ticket, body),
    });

    if (response.error) {
      return {
        status: "failed",
        provider: "resend",
        result: response.error.message,
      };
    }

    return {
      status: "sent",
      provider: "resend",
      result: `Resend email id: ${response.data?.id ?? "unknown"}`,
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "resend",
      result: error instanceof Error ? error.message : "Resend send failed.",
    };
  }
}
