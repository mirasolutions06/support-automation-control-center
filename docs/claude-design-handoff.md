# Claude Design Handoff: V2 Dashboard

This handoff is for the visual and UX redesign pass. Backend and workflow hardening are already implemented on `codex/v2-workflow-hardening`.

## Goal

Redesign the dashboard so it feels like a shipped workflow automation product for a Loom/client walkthrough.

The product story is controlled automation:

1. n8n receives an inbound support or lead message.
2. The app verifies the webhook secret and stores the ticket.
3. AI classifies the ticket and drafts a response.
4. Policy sources are retrieved and attached as citations.
5. Safety checks and model telemetry are recorded.
6. A human edits and approves before anything is sent.
7. Resend sends live when configured, otherwise delivery is staged.

## Design Direction

Aim for an "operations control center" rather than a generic SaaS dashboard.

The visual direction should be:

- Dense but calm
- Workflow-first
- Evidence-heavy
- Low-drama, high-trust
- More like an internal operations console than a marketing product page

Good keywords for prompting:

- support operations console
- workflow automation dashboard
- human approval queue
- model observability panel
- policy citation panel
- audit trail workspace
- incident-safe customer support review
- AI operations cockpit

Bad directions to avoid:

- chatbot UI
- landing page hero
- CRM marketing dashboard
- decorative analytics mockup
- oversized empty cards
- gradient-heavy AI aesthetic

## Visual References

Use these as references for pattern language, not as things to clone exactly:

- Linear: modern dense product-tool feel, crisp typography, focused workflows  
  https://linear.app/

- Retool: internal-tool and workflow-automation credibility  
  https://retool.com/

- Stripe Dashboard: operational trust, financial/admin density, clear state handling  
  https://support.stripe.com/topics/dashboard

- Vercel dashboard redesign: developer-console layout, project/status overview patterns  
  https://vercel.com/blog/dashboard-redesign

- n8n: workflow automation mental model and node/run evidence  
  https://n8n.io/

Useful galleries for broader examples:

- Mobbin SaaS UI examples  
  https://mobbin.com/explore/web/app-categories/saas-ui

- SaaS Interface dashboard examples  
  https://saasinterface.com/pages/dashboard/

- Page Flows for UX flows and screen-by-screen product patterns  
  https://pageflows.com/

- Untitled UI dashboard examples for clean Figma dashboard patterns  
  https://www.untitledui.com/components/dashboards

## Files Claude Design Can Focus On

Primary UI file:

- `src/components/approval-dashboard.tsx`

Global styling:

- `src/app/globals.css`

Design source of truth:

- `DESIGN.md`

Claude Design can restructure the JSX inside `ApprovalDashboard` and helper components. Keep the same API calls and domain concepts unless the backend owner changes them later.

## Files To Avoid Changing In The Design Pass

Do not modify backend/API behavior during the design pass:

- `src/app/api/**`
- `src/lib/ai.ts`
- `src/lib/api-utils.ts`
- `src/lib/email.ts`
- `src/lib/safety.ts`
- `src/lib/store.ts`
- `src/lib/types.ts`
- `src/lib/validation.ts`
- `prisma/schema.prisma`
- `n8n/human-in-the-loop-support-agent.workflow.json`

## Current UI Responsibilities

The dashboard currently supports:

- Load tickets from `GET /api/tickets`
- Seed helper samples from `POST /api/samples/seed`
- Draft selected ticket from `POST /api/tickets/:id/draft`
- Save human edit with `PATCH /api/tickets/:id`
- Approve and deliver with `POST /api/tickets/:id/approve`
- Enter approval passcode
- Filter tickets by all, review, risk, and done
- Display workflow evidence
- Display policy citations
- Display model telemetry
- Display safety results
- Display audit trail and delivery result

## Data Contract

The dashboard receives `TicketRecord[]`.

Important fields:

- `id`
- `customerName`
- `customerEmail`
- `subject`
- `body`
- `source`: `demo`, `webhook`, `gmail`, `zendesk`, `intercom`, `lead_form`
- `status`: `new`, `drafted`, `needs_review`, `approved`, `sent`, `simulated`, `failed`
- `intent`: `refund_request`, `billing_issue`, `angry_complaint`, `lead_inquiry`, `technical_support`, `general_support`
- `sentiment`: `positive`, `neutral`, `frustrated`, `angry`
- `priority`: `low`, `normal`, `high`, `urgent`
- `aiDraft`
- `finalResponse`
- `aiProvider`
- `aiModel`
- `sendProvider`
- `sendResult`
- `metadata`
- `auditEvents`

Audit metadata can contain:

- `webhookSecurity`: `verified`, `not_configured`, or absent
- `n8nExecutionId`
- `provider`
- `model`
- `latencyMs`
- `routeReason`
- `estimatedCostUsd`
- `usage.inputTokens`
- `usage.outputTokens`
- `usage.totalTokens`
- `safety.passed`
- `safety.severity`
- `safety.summary`
- `safety.flags[]`
- `policyGrounding.version`
- `policyGrounding.routeReason`
- `policyGrounding.citations[]`

## Must-Preserve UX Evidence

The redesigned UI must keep these visible somewhere in the first practical workflow view:

- Queue state and selected ticket state
- n8n/webhook source evidence
- Webhook secret verification state
- AI provider and model
- Retrieved policy sources and citations
- Latency
- Token usage if available
- Estimated cost if configured
- Route reason
- Safety severity and safety flags
- Human approval passcode field
- Audit trail
- Delivery result

## Screen Layout Suggestion

Desktop:

- Top operational header
- Metric strip
- Workflow strip
- Three-column layout:
  - Queue and filters
  - Selected ticket and editable response
  - Workflow/policy/model/safety/audit side panel

Mobile:

- Stack header, metrics, queue, selected ticket, and evidence modules.
- Keep approve/save actions easy to find.
- Avoid fixed horizontal layouts that overflow.

## Empty, Loading, Error, And Edge States

Include explicit UI states for:

- Initial loading
- Empty ticket queue
- Filter with no matching tickets
- API load error
- No draft yet
- No model run recorded
- No policy source recorded
- Missing token usage
- Missing cost configuration
- Safety pass
- Safety warning
- Safety blocked
- Approval passcode error
- Delivery staged
- Delivery failed

## Interaction Rules

Keep these action semantics:

- `Refresh` reloads `/api/tickets`.
- `Samples` calls `/api/samples/seed`; label this as helper/dev, not the main workflow.
- `Draft` calls `/api/tickets/:id/draft`.
- `Save edit` calls `PATCH /api/tickets/:id`.
- `Approve` calls `/api/tickets/:id/approve` with `passcode` and `finalResponse`.
- Approval can fail if the safety check blocks the draft.

## Design Constraints

- Use the existing stack: Next.js, React, Tailwind CSS, lucide-react.
- Keep text compact and operational.
- Use real product labels, not explanatory tutorial copy.
- Do not make a hero page.
- Do not add decorative gradient blobs or stock imagery.
- Avoid nested cards.
- Cards should stay at 8px radius or less.
- Preserve accessibility: focus states, keyboard-usable controls, sufficient contrast.
- Text must not overflow buttons, badges, cards, or narrow mobile layouts.

## Acceptance Checklist

Before handing back from Claude Design, the UI should still pass:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm evals
```

Manual checks:

- Open the dashboard.
- Load or seed tickets.
- Select a ticket.
- Run draft.
- Confirm model telemetry appears.
- Confirm policy citations appear.
- Confirm safety result appears.
- Save an edit.
- Approve with passcode.
- Confirm staged/live delivery and audit trail update.

## Backend Owner Follow-Up

After Claude Design returns the redesigned UI, pass it back for backend integration review. The backend owner should verify:

- API calls still match the implemented routes.
- Safety and telemetry metadata are still parsed correctly.
- No secrets are exposed.
- The required verification commands still pass.
