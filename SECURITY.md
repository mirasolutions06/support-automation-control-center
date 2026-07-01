# Security Policy

## Supported versions

The public `main` branch is the supported version for this demo/reference repo.

## Reporting a vulnerability

Please email `mira.solutions06@gmail.com` with:

- The affected repo and file or endpoint.
- Steps to reproduce.
- Impact and any suggested fix.

Please do not open a public issue for a vulnerability that exposes credentials,
customer data, webhook secrets, approval passcodes, auth bypasses, unsafe send
behavior, or private deployment details.

## Data handling expectations

- Do not commit `.env`, database dumps, customer messages, inbox credentials,
  webhook secrets, Resend keys, model provider keys, or approval passcodes.
- Keep local examples synthetic or explicitly sanitized.
- Keep live sending behind `RESEND_LIVE_SEND=true` and a verified sender domain.
- Keep the approval endpoint protected by `APPROVAL_PASSCODE`.
- Treat screenshots and workflow exports as public artifacts before committing.
