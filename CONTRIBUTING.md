# Contributing

Thanks for taking a look at Support Automation Control Center. The repo should
stay easy for clients, recruiters, and builders to understand: it is an
AI-drafted, human-approved support workflow, not an unchecked support bot.

## Local checks

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm evals
```

The app can run locally without external service credentials by using the
in-memory store, deterministic fallback drafts, and staged delivery.

## What makes a good change

- Keep customer delivery human-approved by default.
- Keep n8n responsible for intake/orchestration and the app responsible for
  approval, safety, policy grounding, audit, and delivery state.
- Update `README.md`, `docs/setup.md`, or `docs/architecture.md` when setup,
  commands, environment variables, or workflow boundaries change.
- Add or update eval fixtures for classification, policy retrieval, safety
  behavior, and delivery controls.
- Keep examples sanitized: no customer data, inbox credentials, webhook secrets,
  API keys, passcodes, or private deployment URLs.

## Before opening a PR

1. Run the local checks above.
2. Confirm `.env`, `.next/`, generated Prisma artifacts, private screenshots,
   and credentials are not staged.
3. Explain the workflow changed and how it was verified.
