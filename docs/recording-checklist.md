# V2 Recording Checklist

Use this before recording the V2 Loom.

## Windows To Open

1. n8n workflow canvas  
   `http://localhost:5678/workflow/human-in-the-loop-support-agent`

2. Support dashboard  
   `http://localhost:3000` or `http://localhost:3001` if Next picked a fallback port

3. Terminal for webhook trigger

## Preflight

Run these checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm evals
```

Confirm both servers are running:

```bash
# app - use the actual port printed by `pnpm dev`
http://localhost:3000
http://localhost:3001

# n8n
http://localhost:5678
```

Confirm matching env values in the app and n8n:

```bash
APP_BASE_URL=http://localhost:3000
N8N_WEBHOOK_SECRET=...
REVIEWER_WEBHOOK_URL= # optional
```

If Next starts on `http://localhost:3001`, set n8n `APP_BASE_URL=http://localhost:3001` before recording.

Do not show the secret on screen.

## Trigger Command

Use this during the Loom to prove n8n is the automation layer:

```bash
curl -X POST http://localhost:5678/webhook/support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Workflow Proof Client",
    "customerEmail": "workflow-proof@example.com",
    "subject": "Refund request after duplicate charge",
    "body": "Hi, I was charged twice for my subscription this morning. I need the duplicate payment refunded before our finance close.",
    "source": "webhook"
  }'
```

Expected result:

- n8n workflow executes.
- n8n forwards the shared secret header to the app.
- Dashboard receives a new ticket.
- Ticket status is `drafted` or `needs_review`.
- n8n evaluates whether the draft should notify a reviewer based on priority and sentiment.
- Model run panel shows provider, model, latency, route, and token/cost fields when available.
- Policy grounding panel shows approved source citations.
- Safety gate shows the draft review result.
- Human approval is still required.

Use a fresh n8n-triggered ticket for the Loom. Older tickets created before V2 telemetry may not have latency, token, policy, or route metadata. If you accidentally select one, click `Draft` again before recording the evidence panels.

## Recording Beats

1. Start on n8n.
2. Explain the eight-node path and optional reviewer notification branch in one sentence each.
3. Run the trigger command.
4. Switch to the dashboard.
5. Refresh if needed.
6. Open the newest ticket.
7. Point out workflow run evidence and webhook verification.
8. Point out classification, draft, policy citations, model telemetry, and safety gate.
9. Edit one sentence.
10. Approve with passcode.
11. Show staged or live delivery result.

## Recruiter Signal

Say this near the end:

```text
The thing I care about here is operational control. The workflow is automated, but the model is measured, audited, safety-checked, and kept behind human approval.
```

## Client Signal

Say this near the end:

```text
You get the time savings of AI drafting without the risk of an autonomous bot sending unapproved customer messages.
```
