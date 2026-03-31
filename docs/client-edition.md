# Client Edition

## Positioning

Aether is currently best sold as a **single-tenant client deployment**.

That means:

- one branded instance per client
- one memory surface per client
- separate data directory and environment per deployment
- no shared multi-user SaaS assumptions

This matches the architecture that exists today and avoids promising account,
auth, billing, or tenant isolation features that have not been built yet.

## What You Are Selling

The current client edition is:

- a private operator workspace
- a trading desk companion
- a memory-bearing decision-support surface

It includes:

- threaded chat
- desk state
- routines
- watchlist
- tasks
- journal
- chart capture
- Telegram-connected access

It does **not** currently include:

- user accounts
- multi-user team workspaces
- billing
- broker execution
- compliance workflows

## Recommended Packaging

Sell this as:

- a premium private deployment
- a white-labeled operator console
- a discretionary trading support system

Do not sell it yet as:

- a mass-market SaaS app
- a collaborative trading platform
- a trade automation engine

## Deployment Model

Each client should get their own deployment with their own:

- environment variables
- `data/` directory
- bot tokens if needed
- provider credentials

Suggested structure per client:

```text
/srv/aether-client-a/
  .env.local
  data/
  frontend/
  souls/
```

## Branding Hooks

Aether now supports product-level metadata via environment variables:

- `AETHER_PRODUCT_NAME`
- `AETHER_PRODUCT_TAGLINE`
- `AETHER_PRODUCT_AUDIENCE`
- `AETHER_DEPLOYMENT_MODE`
- `AETHER_SUPPORT_EMAIL`
- `AETHER_LEGAL_DISCLAIMER`

Example:

```bash
AETHER_PRODUCT_NAME="Atlas Desk"
AETHER_PRODUCT_TAGLINE="Private operator for discretionary traders"
AETHER_PRODUCT_AUDIENCE="High-touch trading clients"
AETHER_DEPLOYMENT_MODE=client-single-tenant
AETHER_SUPPORT_EMAIL=ops@example.com
AETHER_LEGAL_DISCLAIMER="Atlas Desk provides decision support and record-keeping. It does not execute trades or guarantee outcomes."
```

## Product Metadata Endpoint

Use:

```text
GET /product
```

This returns:

- product name
- assistant name
- tagline
- audience
- deployment mode
- support email
- legal disclaimer
- provider/model
- channel connection state
- capability list

This is intended for:

- branded wrappers
- onboarding shells
- sales/demo surfaces
- future client settings screens

## Safe Sales Narrative

The strongest honest pitch today is:

> Aether gives each client a private operator surface for market planning,
> ongoing thread continuity, journal capture, chart context, and disciplined
> desk management.

Good customer types:

- discretionary traders
- coaches or mentors managing high-touch client relationships
- research-driven traders who need continuity and journaling discipline

## What To Build Next Before Broad SaaS

If you want to move beyond single-tenant client deployments, the next real
platform features are:

1. authentication
2. workspace isolation
3. per-client storage boundaries
4. admin provisioning
5. billing
6. audit and compliance posture

Until those exist, the right commercial wrapper is **private client edition**.

## Commercial Materials

Supporting docs:

- [pricing-and-packaging.md](/Users/jay/Dev/personal/Aether/docs/pricing-and-packaging.md)
- [license-outline.md](/Users/jay/Dev/personal/Aether/docs/license-outline.md)
- [proposal-template.md](/Users/jay/Dev/personal/Aether/docs/proposal-template.md)
