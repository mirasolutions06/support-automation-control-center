# Design System: Human-in-the-Loop Support Agent V2

## 1. Visual Theme & Atmosphere

The product should feel like a shipped workflow operations console: calm, dense, credible, and fast to scan. It is not a marketing landing page and should not feel like a sample demo.

The experience should communicate controlled automation. The main visual story is:

- External workflow intake from n8n
- AI classification and drafting
- Policy grounding and source citations
- Safety and cost visibility
- Human approval before delivery

The interface should feel operational and trustworthy, with restrained color, strong hierarchy, and visible evidence of automation. Avoid oversized hero treatments, decorative illustrations, gradient blobs, and empty marketing copy.

## 2. Color Palette & Roles

- Soft Console Background (`#f8faf9`): primary page background for the V2 dashboard.
- Warm Baseline Background (`#f6f4ef`): legacy app background retained in global CSS; can be replaced if the redesigned dashboard uses a stricter system.
- Deep Slate Text (`#0f172a`): primary text and strongest action color.
- Verified Teal (`#0f766e`): workflow trust, security, focus rings, primary draft action, and selected operational accents.
- White Surface (`#ffffff`): primary panels, ticket cards, toolbar, and side modules.
- Slate Borders (`#e2e8f0` / Tailwind `slate-200`): panel boundaries and quiet dividers.
- Blue Automation (`blue-50`, `blue-700`): AI draft and model-run evidence.
- Emerald Complete (`emerald-50`, `emerald-700`): approved, sent, or safety-pass states.
- Amber Review (`amber-50`, `amber-800`): needs-review and medium-risk states.
- Red Blocked (`red-50`, `red-700`): failed delivery, urgent risk, high-risk safety blocks.
- Violet Staged (`violet-50`, `violet-700`): staged delivery when Resend live send is not configured.

## 3. Typography Rules

Use Geist Sans for the dashboard. The typography should be compact and readable:

- Page title: 24 to 30px, semibold, normal tracking.
- Section titles: 14 to 16px, semibold.
- Ticket titles and important values: 14px, semibold.
- Body text and messages: 14px with generous line height for support-ticket readability.
- Metadata, timestamps, and labels: 12px, medium weight, muted slate.
- Do not use negative letter spacing.
- Do not scale font size with viewport width.

## 4. Component Stylings

**Buttons:** Subtly rounded corners, 40px height for primary toolbar and action buttons. Use icon plus concise label. Primary actions use Deep Slate or Verified Teal. Secondary actions use white fill, slate border, and quiet hover states.

**Cards and Panels:** Use 8px corner radius, white background, slate border, and whisper-soft shadows. Panels are functional containers, not decorative floating cards. Avoid cards inside cards except for repeated ticket items and compact safety details.

**Ticket Queue Items:** Dense, scannable rows with customer identity, status badge, subject, priority, safety signal, and timestamp. Selected state should be obvious through border and background change.

**Badges:** Pill-shaped status indicators. Each badge color must carry semantic meaning: blue for drafted, amber for review, emerald for complete, red for blocked, violet for staged.

**Inputs and Textareas:** White background, slate border, teal focus ring, readable line height. The response editor should feel like a review workspace, not a chat box.

**Audit Timeline:** Compact vertical list with action, message, actor, timestamp, and metadata pills. It should prove the system worked without overwhelming the reviewer.

## 5. Layout Principles

The first viewport should show the actual product, not explanatory content.

Recommended desktop structure:

- Header band with title, workflow identity, and basic actions.
- Metric strip with operational counts.
- Workflow strip showing webhook, normalize, AI draft, review, and delivery.
- Three-column work area:
  - Left: filterable queue
  - Center: selected ticket, incoming message, and editable response
  - Right: workflow run evidence, model telemetry, safety gate, audit trail, delivery result

Recommended mobile structure:

- Header and metric strip collapse into a single column.
- Queue, selected ticket, and right-side evidence stack vertically.
- Action buttons must remain visible and text must not overflow.

## 6. Required Product States

The redesigned UI must explicitly handle:

- Empty inbox
- Loading or syncing inbox
- Request error
- No ticket selected
- New ticket before draft
- Drafted ticket awaiting review
- Safety-warning ticket
- Safety-blocked approval
- Human edit saved
- Approved and staged delivery
- Approved and live sent delivery
- Failed delivery
- No model run recorded
- Model run with missing token usage
- Webhook secret verified, not configured, or not recorded

## 7. Claude Design Prompt Notes

When redesigning, preserve the product semantics:

- This is a workflow automation control center.
- n8n webhook ingestion is the main path.
- Samples are a helper/dev path only.
- The human approval gate is the core product decision.
- Model cost, latency, route, and safety evidence must be visible on-screen.
- Policy citations must be visible on-screen.
- Do not redesign it into a chatbot, CRM landing page, or decorative SaaS hero.
