# Setup Guide

## 1. Install

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm dev
```

## 2. Supabase

1. Create a new Supabase project.
2. Copy the transaction-mode pooler into `DATABASE_URL`.
3. Copy the session-mode pooler into `DIRECT_URL`.
4. Run `pnpm db:push`.
5. Restart `pnpm dev`.

## 3. AI Provider

For Claude:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

For Z.ai GLM:

```bash
AI_PROVIDER=zai
ZAI_API_KEY=...
ZAI_MODEL=glm-4.7-flash
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_THINKING=disabled
```

If you are on Z.ai's GLM Coding Plan and their dashboard tells you to use the coding endpoint, set:

```bash
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
```

Optional cost estimates are shown in the dashboard when these env vars are set to the current provider price per 1M tokens:

```bash
ANTHROPIC_INPUT_COST_PER_1M=
ANTHROPIC_OUTPUT_COST_PER_1M=
ZAI_INPUT_COST_PER_1M=0
ZAI_OUTPUT_COST_PER_1M=0
```

The Z.ai Flash defaults are set to `0` for the Loom setup because public Z.ai pricing lists GLM-4.7-Flash as free. Update the values if your selected model or plan has non-zero token pricing.

## 4. Resend

1. Create a Resend API key.
2. Verify a sender domain or subdomain.
3. Set `RESEND_FROM_EMAIL`.
4. Set `RESEND_LIVE_SEND=true`.

Until all four are ready, approval records staged delivery.

## 5. n8n

Import `n8n/human-in-the-loop-support-agent.workflow.json`.

Set these n8n environment variables:

```bash
APP_BASE_URL=http://localhost:3000
N8N_WEBHOOK_SECRET=...
REVIEWER_WEBHOOK_URL=
```

Set the same `N8N_WEBHOOK_SECRET` in the app environment. The imported workflow sends it to `/api/tickets/ingest` as `x-n8n-webhook-secret`.

`REVIEWER_WEBHOOK_URL` is optional. Set it to a Slack, Discord, or internal webhook endpoint if you want n8n to notify a reviewer when the drafted ticket is high priority or has frustrated/angry sentiment.

Send this JSON to the n8n webhook:

```json
{
  "customerName": "Test Customer",
  "customerEmail": "customer@example.com",
  "subject": "Need help with a refund",
  "body": "I was charged twice. Can you help?",
  "source": "webhook"
}
```
