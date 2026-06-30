# V2 Loom Script: Human-in-the-Loop Support Agent

Target length: 2 minutes  
Audience: Upwork clients, recruiters, AI leads, technical hiring managers  
Goal: show a shipped workflow automation product, not a sample app

## Recording Principle

Show V2 only. V1 is the baseline artifact; V2 is the credible walkthrough.

Use a fresh n8n-triggered ticket for the recording. Older tickets may have been created before V2 telemetry and policy grounding existed, so they can be useful for testing but should not be the main Loom ticket.

The strongest signal is controlled automation:

```text
n8n moves the work, AI drafts the response, and the human still owns the customer send.
```

## Primary Script

### 0:00 - 0:12: Hook

Most businesses want AI support automation, but they do not want an unsupervised bot emailing customers.

This is a human-in-the-loop support workflow. n8n receives the message, AI classifies and drafts, and the dashboard stops at human approval.

### 0:12 - 0:35: Show n8n Workflow

This is the automation layer.

The workflow receives a webhook, normalizes the payload, creates a ticket in the app, triggers classification and drafting, then routes high-priority or frustrated/angry tickets to an optional reviewer notification before returning the drafted ticket.

The app verifies the shared webhook secret before accepting the n8n call.

### 0:35 - 0:50: Trigger Inbound Message

I am sending a support message through the n8n webhook.

The important detail is that the dashboard is not creating the main ticket. The external workflow is.

### 0:50 - 1:22: Show Dashboard Result

Now the ticket is in the dashboard.

This ticket was created by n8n, drafted by the model, grounded in policy, safety-checked, and stopped for human approval.

You can see the workflow evidence, ticket state, intent, sentiment, priority, draft response, model provider, latency, token/cost fields, route reason, policy citations, and the audit trail.

The draft is grounded in approved policy sources, and the safety gate checks for refund promises, legal admissions, angry tone, and missing escalation.

### 1:22 - 1:42: Human Approval

The reviewer can edit the draft, save the edit, and approve with a passcode.

If Resend is configured with a verified sender and `RESEND_LIVE_SEND=true`, the final response sends. Otherwise, the delivery is staged and recorded.

### 1:42 - 2:00: Engineering Signal

This is built with Next.js, TypeScript, Prisma, Supabase Postgres, n8n, Z.ai or Claude, Resend, and a deterministic eval suite.

The system logs model cost and latency, records every workflow step, grounds the draft in policy, and keeps AI output behind human approval.

### 2:00 - 2:08: Close

The product is controlled automation: faster support operations without giving an autonomous model permission to damage customer relationships.

## Short Upwork Version

Most AI support bots are risky because they can hallucinate directly to customers.

I build human-in-the-loop automations instead. Here, a support message enters through n8n, gets classified and drafted by AI, and waits in a dashboard until a human approves it.

You get faster support workflows without giving a bot unchecked sending power.

## Technical Recruiter Version

This is a V2 human-in-the-loop support router.

n8n handles workflow orchestration, Next.js handles the dashboard and API routes, Supabase stores tickets and audit events, and the AI provider handles classification and drafting.

V2 adds webhook secret verification, policy-grounded drafting, model cost and latency logging, safety checks, status filters, reviewer notification routing, richer audit evidence, and deterministic evals.

## What To Show

1. n8n canvas with the eight-node workflow path and reviewer notification branch.
2. Webhook trigger.
3. Dashboard ticket queue and workflow strip.
4. New ticket already drafted.
5. Intent, sentiment, priority, and safety status.
6. Policy grounding panel with approved source citations.
7. Model run panel with provider, model, latency, tokens, cost, and route.
8. Audit trail with metadata pills.
9. Edit draft.
10. Approve with passcode.
11. Staged or live Resend delivery result.
