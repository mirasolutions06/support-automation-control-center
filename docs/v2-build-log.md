# V2 Build Log: Human-in-the-Loop Support Agent

Date: 2026-06-29  
Status: verified V2 Loom implementation  
Primary buyer: clients who need safe AI support automation with approval control  
Secondary audience: recruiters, AI leads, technical reviewers, and automation buyers

## Executive Summary

V2 turns the V1 baseline into a stronger workflow automation product.

V1 proved the control loop: n8n ingestion, persistent tickets, AI drafting, human approval, and staged delivery. V2 hardens that loop with webhook security, model observability, deterministic evals, safety checks, policy-grounded drafting, and a dashboard that shows workflow evidence on-screen.

The V2 story is:

```text
n8n moves the work. AI drafts with policy context. Humans approve. The system records proof.
```

This is the version intended for Loom.

## What V2 Adds

V2 adds the production-shaped details that technical buyers expect:

1. **Webhook-first main path**  
   n8n remains the main ingestion route. Sample data is only a helper path.

2. **Webhook secret verification**  
   `/api/tickets/ingest` verifies `N8N_WEBHOOK_SECRET` when configured.

3. **Model observability**  
   Draft runs record provider, model, latency, token usage when available, estimated cost when rates are configured, and route reason.

4. **Safety checks**  
   Drafts are checked for refund promises, missing refund verification, legal admissions, angry tone, and missing escalation.

5. **Policy grounding**  
   The app retrieves approved local policy sources for each ticket and injects them into the draft prompt. The dashboard shows citations.

6. **Eval suite**  
   `pnpm evals` checks expected intent, priority, safety outcomes, and policy retrieval behavior.

7. **Workflow-first dashboard evidence**  
   The dashboard now shows queue filters, workflow run evidence, model telemetry, policy citations, safety results, audit trail, and delivery status.

8. **Recording and design handoff docs**  
   V2 includes updated Loom docs and Claude Design handoff docs for later visual polish.

## Architecture

```text
External message
  -> n8n webhook
  -> Normalize Payload node
  -> POST /api/tickets/ingest
  -> webhook secret verification
  -> Supabase ticket
  -> POST /api/tickets/:id/draft
  -> local policy retrieval
  -> Z.ai GLM or Claude draft
  -> safety check
  -> dashboard review
  -> human approval
  -> Resend live send or staged delivery
```

## Components

| Component | Role in V2 |
| --- | --- |
| Next.js | App, dashboard, API routes, approval workflow |
| Prisma + Supabase | Ticket and audit persistence |
| n8n | Workflow orchestration and external connector path |
| Z.ai GLM or Claude | Classification and response drafting |
| Local policy pack | Approved support/sales/ops guidance for grounding |
| Resend | Live email delivery when verified and enabled |
| Zod | API payload validation |
| Deterministic evals | Regression checks for routing, safety, and policy retrieval |

## n8n Workflow

The n8n workflow now has an eight-node production-style path:

1. **Inbound Support Ticket**
2. **Normalize Payload**
3. **Create Ticket In App**
4. **Classify + Draft**
5. **Prepare Reviewer Alert**
6. **Needs Reviewer Notification**
7. **Notify Reviewer** when configured
8. **Return Ticket**

V2 updates the app call so `Create Ticket In App` sends `x-n8n-webhook-secret` from `N8N_WEBHOOK_SECRET`.

For the Loom, the strongest proof is to trigger the n8n webhook and show the dashboard receiving a ticket that has already been classified, drafted, policy-grounded, safety-checked, optionally routed for reviewer notification, and stopped at human approval.

## Model Defaults

Current intended defaults:

```bash
AI_PROVIDER=zai
ZAI_MODEL=glm-4.7-flash
ZAI_THINKING=disabled
```

Claude remains available as the premium path:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Cost estimates use per-1M-token env vars when configured. For the Loom setup, `glm-4.7-flash` defaults to `$0.000000` when explicit Z.ai rates are absent because the selected Flash model is treated as the free path. If a paid provider does not return token usage, the dashboard says token data was not captured.

The AI layer also runs a deterministic classification sanity check after model output. This prevents obvious leads, duplicate-charge refunds, and angry incident messages from being recorded as neutral/default labels when the model under-classifies them.

## Policy Grounding

Policy file:

```text
data/policies/support-policies.json
```

Current policy sources:

- Duplicate charge refund verification
- Customer incident escalation response
- Safe automation lead discovery
- Technical support triage
- Human approval before customer delivery

The retrieval path is intentionally local and deterministic for the Loom. It is easy to explain, easy to eval, and does not require a separate vector database.

Production clients could replace the local JSON with Notion, Google Drive, a CMS, a help-center export, Supabase pgvector, or a managed vector database.

## Safety Rules

The V2 safety checker flags:

- Refund promises before verification
- Refund language missing verification
- Legal admissions or liability language
- Angry or dismissive tone
- Urgent/angry complaints missing escalation

High-severity safety failures block approval and move the ticket back to `needs_review`.

## Eval Coverage

Run:

```bash
pnpm evals
```

Current evals:

- Duplicate refund classification and policy retrieval
- Angry outage classification and policy retrieval
- Lead routing classification and policy retrieval
- Pricing lead sentiment and priority classification
- Neutral integration question sentiment classification
- Frustrated login issue sentiment and priority classification
- Refund promise block
- Legal admission block
- Angry tone block
- Missing escalation block
- Urgent positive lead allowed

Expected result:

```text
Passed 11 eval cases.
```

The eval runner forces deterministic fallback drafting so it does not call live providers or expose local secrets.

## Current Verification

V2 has been verified with:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm evals`
- `GET /api/tickets` returned live ticket data from the running app.
- Rendered dashboard check confirmed the UI loads at `http://localhost:3001`.

## Loom Recording Path

Use a fresh n8n-triggered ticket. Do not record an older ticket from before V2 telemetry was added.

Recommended sequence:

1. Start on the n8n canvas.
2. Explain the eight-node path: ingest, normalize, create, draft, prepare review alert, optional notify, return.
3. Trigger the webhook from terminal.
4. Switch to dashboard.
5. Open the newest ticket.
6. Show workflow run evidence and webhook verification.
7. Show classification and draft.
8. Show policy grounding citations.
9. Show model provider, latency, token/cost fields, and route.
10. Show safety gate.
11. Edit one sentence.
12. Approve with passcode.
13. Show staged or live Resend delivery.

## What Reads As Real For Loom

Good realism signals:

- Use a real n8n webhook execution.
- Use your own email address as the customer email if demonstrating live Resend.
- Use a verified sender domain if available.
- Show the policy citation panel, not just the draft.
- Show the audit trail after approval.
- Mention staged delivery honestly if live Resend is not configured.

Do not show secrets, `.env`, API keys, passcodes, or Resend tokens.

## Remaining Gaps

V2 is strong for Loom and client/recruiter proof, but it is not yet a self-serve SaaS.

Remaining productization work:

- Real auth and team roles instead of a shared passcode.
- Rate limiting and abuse controls.
- Client onboarding checklist.
- Fresh V2 screenshots in README.
- Vercel deployment guide with exact env names.
- Optional live Resend send proof.
- Better visual design pass after backend/product behavior is locked.
- Optional policy importer from Notion, Google Drive, Zendesk Guide, or a CMS.
- Optional Slack approval workflow.

## Plug-And-Play Assessment

This repo is now a strong purchasable implementation template.

It is plug-and-play for a technical buyer who can configure:

- Supabase
- n8n
- AI provider key
- Resend sender domain
- Environment variables
- Their own policy file

It is not yet one-click self-serve. To sell it as a client implementation, position it as a deployable automation package that gets configured to the client inbox, policy docs, approval owners, and sender domain.

The pitch:

```text
I can install this workflow into your support stack, connect your inbox or forms, load your policies, and give your team AI-drafted replies with human approval before send.
```
