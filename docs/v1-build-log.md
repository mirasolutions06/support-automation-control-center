# V1 Build Log: Human-in-the-Loop Support Agent

Date: 2026-06-29  
Status: verified v1 implementation  
Primary buyer: Upwork clients who want safe AI automation for support or lead routing  
Secondary audience: technical reviewers, AI leads, recruiters, and engineering managers

## Executive Summary

V1 is a working human-in-the-loop support automation system.

The system receives an inbound customer message, routes it through n8n, stores it in Supabase, asks Z.ai to classify and draft a response, then stops at a human approval dashboard. A human can edit and approve the response. Delivery is staged locally until Resend and a verified sender domain are configured.

The main point of v1 is not full autonomy. The point is controlled automation:

```text
AI drafts. Humans approve. The system records every step.
```

This is the safe version of an AI support agent that a real business can understand.

## What V1 Does

V1 runs an end-to-end workflow:

1. A support or lead message enters through an n8n webhook.
2. n8n normalizes the payload into a clean ticket shape.
3. n8n sends the ticket to the Next.js app.
4. The app stores the ticket in Supabase Postgres.
5. n8n triggers the app's draft endpoint.
6. The app calls Z.ai GLM to classify and draft.
7. The dashboard shows the ticket, classification, draft, and audit trail.
8. A human edits and approves the response.
9. Delivery is staged locally until Resend is configured.

The current workflow proves that this is more than a static UI. n8n is actively orchestrating inbound automation, and Supabase persists the results.

## Architecture

```text
External message
  -> n8n webhook
  -> Normalize Payload node
  -> POST /api/tickets/ingest
  -> Supabase ticket
  -> POST /api/tickets/:id/draft
  -> Z.ai GLM-4.5 Flash
  -> dashboard review
  -> human approval
  -> staged delivery / future Resend send
```

### Components

| Component | Role in v1 |
| --- | --- |
| Next.js | Main app, dashboard, route handlers, approval workflow |
| React | Interactive approval UI |
| Tailwind CSS | Dashboard styling |
| Prisma | Type-safe database access |
| Supabase Postgres | Persistent storage for tickets and audit events |
| n8n | Workflow automation and external system connector |
| Z.ai GLM | AI classification and response drafting |
| Resend | Future live email delivery |
| Zod | API payload validation |

## n8n Workflow

The n8n workflow has five nodes:

1. **Inbound Support Ticket**  
   Receives a POST request at `/webhook/support-ticket`.

2. **Normalize Payload**  
   Converts varied incoming data into the app's expected ticket payload.

3. **Create Ticket In App**  
   Calls `POST /api/tickets/ingest`.

4. **Classify + Draft**  
   Calls `POST /api/tickets/:id/draft`, which runs the configured model.

5. **Return Ticket**  
   Returns the drafted ticket to the webhook caller.

n8n is not required for the dashboard to function, because the app can ingest tickets directly. n8n exists to prove and deliver workflow automation: Gmail, Zendesk, Intercom, web forms, Slack, and other systems can be connected here without changing the dashboard.

## App Workflow

The dashboard provides:

- Ticket queue
- Customer details
- Source, intent, sentiment, and priority
- Original customer message
- Metadata/context panel
- Editable AI draft
- Approval passcode
- Audit timeline
- Delivery state
- Sample ticket loading
- Webhook-style ingest control

The key product behavior is that AI-generated drafts do not send automatically.

## API Surface

| Endpoint | Purpose |
| --- | --- |
| `GET /api/tickets` | List tickets with audit events |
| `POST /api/tickets/ingest` | Create a ticket from n8n or another external system |
| `POST /api/tickets/:id/draft` | Classify and draft a response |
| `PATCH /api/tickets/:id` | Save a human-edited final response |
| `POST /api/tickets/:id/approve` | Approve and send live email or record staged delivery |
| `POST /api/samples/seed` | Load sample support and lead tickets |

## Data Model

### Ticket

Stores the support or lead request:

- Customer name and email
- Subject and message body
- Source system
- Status
- Intent
- Sentiment
- Priority
- AI draft
- Human final response
- AI provider and model
- Send provider and result
- Metadata
- Timestamps

### AuditEvent

Stores the timeline:

- Ticket created
- Sample ticket loaded
- AI drafted
- Human edited
- Approved
- Sent
- Staged delivery
- Send failed

This audit trail is important for trust. It lets a client see what the system did and where the human stepped in.

## Model Choice

Current local model:

```bash
AI_PROVIDER=zai
ZAI_MODEL=glm-4.5-flash
ZAI_THINKING=disabled
```

Why:

- V1 needs fast, short support drafting.
- `glm-4.5-flash` benchmarked fastest in local testing.
- `glm-4.7` worked but was slower.
- `glm-5.2` is likely overkill for this version.

Benchmark snapshot from local testing:

| Model | Result |
| --- | --- |
| `glm-4.5-flash` | Fastest tested, around 1.5s |
| `glm-4.5-airx` | Close second, around 1.8s |
| `glm-4.7-flash` | Worked, around 3.3s |
| `glm-4.7` | Worked, around 6.2s |

V2 should add formal cost tracking and model-routing logic instead of choosing one model by hand.

## Current Verification

V1 has been verified with:

- Prisma schema pushed to Supabase.
- Sample tickets loaded into Supabase.
- n8n workflow imported and activated.
- Webhook test successfully created and drafted a ticket.
- Newest Supabase ticket showed `status: drafted`, `provider: zai`, `model: glm-4.5-flash`.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- n8n workflow JSON validated.

## Recording Path

Recommended recording sequence:

1. Show n8n canvas for 10-15 seconds.
2. Explain that this is where Gmail, Zendesk, Intercom, or a form would connect.
3. Trigger the webhook.
4. Switch to the dashboard.
5. Show the new ticket already drafted.
6. Show intent, sentiment, priority, and audit trail.
7. Edit the response.
8. Approve it.
9. Point out that delivery is staged locally until Resend/domain is configured.
10. Close with the human-in-the-loop safety pitch.

## Known Limitations

V1 is intentionally simple. It proves the core workflow, but it is not yet a production helpdesk.

Current limitations:

- Simple passcode instead of full user auth.
- No team roles or per-agent permissions.
- No real email delivery until Resend and a verified domain are configured.
- No customer-specific policy knowledge base.
- No formal evaluation suite.
- No model cost logging.
- No model routing.
- No PII redaction layer.
- No rate limits or abuse controls.
- No Slack approval flow.
- No Gmail/Zendesk/Intercom OAuth connectors yet.
- Dashboard UI is functional but can be improved visually and ergonomically.

## What Employers And Technical Buyers Will Want

Technical reviewers will care about more than the UI.

They will likely ask:

- How do you know the model output is good?
- How do you prevent unsafe replies?
- How do you control cost?
- How do you protect customer data?
- How do you observe failures?
- How do you handle policy-specific answers?
- How do you deploy and operate this reliably?

That points directly to v2/v3.

## V2 Roadmap

V2 should make the system more credible for technical buyers.

Recommended v2 additions:

1. **Cost Logging**
   - Store model name, latency, prompt tokens, completion tokens, total cost estimate.
   - Show cost per ticket and monthly projection in the dashboard.

2. **Evaluation Suite**
   - Add a small dataset of support tickets and expected labels.
   - Score intent classification, priority classification, tone, policy compliance, and refusal behavior.
   - Add regression checks before changing prompts/models.

3. **Safety Checks**
   - Add a second-pass validator before a draft is shown.
   - Flag risky promises, legal admissions, refund guarantees, angry tone, or missing escalation.
   - Add a "needs manager review" state.

4. **Security**
   - Replace passcode with real auth.
   - Add role-based access control.
   - Add request rate limiting.
   - Add PII handling notes and optional redaction.
   - Add webhook secret verification for n8n calls.

5. **UI/UX Upgrade**
   - Improve queue filtering and search.
   - Add status tabs.
   - Add keyboard-friendly review flow.
   - Add clearer before/after draft comparison.
   - Improve mobile layout for real support workflows.

## V3 Roadmap

V3 should become a stronger production and employer-facing system.

Recommended v3 additions:

1. **RAG / Knowledge Base**
   - Store company policies, refund rules, escalation rules, and product docs.
   - Retrieve relevant policy snippets for each ticket.
   - Cite internal policy sources in the draft panel.

2. **Model Router**
   - Route simple classification to a cheaper model.
   - Route sensitive escalations to a stronger model.
   - Compare quality and cost by route.

3. **Advanced Approval Workflows**
   - Slack approval cards.
   - Manager escalation.
   - SLA timers.
   - Multi-step approvals for refunds, cancellations, and legal-sensitive replies.

4. **Observability**
   - Execution traces across n8n, API, model call, database, and delivery provider.
   - Error dashboard.
   - Dead-letter queue for failed sends or failed drafts.

5. **Production Integrations**
   - Gmail connector.
   - Zendesk connector.
   - Intercom connector.
   - Real Resend delivery.
   - Vercel deployment.

## Handoff To V2

V1 should be treated as the baseline artifact, not the main sales recording.

The stronger story is to keep V1 in GitHub with screenshots and a clear build log, then record the main Loom against V2 after the system is less sample-driven and more production-shaped.

V2 should focus on:

1. Configure Resend and a verified domain for live email sending.
2. Add cost logging for model calls.
3. Add a small eval suite for classification and draft quality.
4. Add stronger approval/auth and webhook security.
5. Add policy-grounded RAG so replies reference approved company rules.
6. Improve dashboard UI/UX for a more polished recruiter/client walkthrough.
7. Deploy to Vercel with Supabase and Z.ai env vars.

For client acquisition, V2 should be the public Loom.

For employer credibility, the README can show the V1 -> V2 progression: baseline workflow first, then hardening with cost, evals, RAG, and security.
