# Venue Notes

This file records current venue conclusions for Aether.

The recommendation depends on what we want to trade, not on brand preference.

## Working Recommendation

### If we start with equities and liquid US instruments

Use `Alpaca` first.

Why:

- official paper trading environment
- separate paper credentials and paper endpoint
- clean API and websocket support
- lower operational complexity for a paper-first automation stack

Constraint:

- best fit for standard equities and simpler automation loops
- less aligned with crypto-perp microstructure research than a crypto-native venue

### If we start with crypto perps and want CVD-style orderflow work

Use `BloFin` as the main venue to evaluate first.

Why:

- official REST and WebSocket API
- explicit demo-trading REST and WebSocket endpoints
- demo-fund endpoint exists, which is useful for iterative testing
- supports order types that matter for automation, including `limit`, `post_only`, `ioc`, and `fok`

Risk:

- higher venue-specific execution and market-structure risk than a simpler broker paper environment
- we still need to verify data depth, historical access, and how well the demo environment mirrors live conditions

### If we later require an onchain DEX path

Evaluate `Hyperliquid`.

Why:

- official API docs
- testnet endpoint exists
- explicit support for API wallets and automation flows

Risk:

- more operational complexity
- more wallet and signing surface area
- not the cleanest first system if our immediate goal is fast strategy validation

## Recommendation Right Now

Because you want normal trading, paper first, and indicators like VWAP and CVD:

- if the first system is equity-focused, start with `Alpaca`
- if the first system is crypto-perp-focused, start with `BloFin`
- do not start on a DEX unless onchain execution is a hard requirement

My current bias is:

- `BloFin` for crypto-perp strategy research and paper execution
- `Alpaca` for a cleaner secondary path if we want a lower-friction US-equities lab

## Decision Heuristic

Use the venue that minimizes unknowns during validation.

Early-stage strategy testing should optimize for:

- clean market data
- reliable paper or demo environment
- simple authentication
- stable execution semantics
- good documentation
- low operational noise

Early-stage strategy testing should not optimize for novelty.

## Official Notes Used

- Alpaca paper trading docs confirm a real-time simulated paper environment, separate paper credentials, and a paper endpoint.
- BloFin docs expose dedicated demo-trading REST and WebSocket endpoints plus a demo-fund request endpoint.
- Hyperliquid docs expose official mainnet and testnet API endpoints and an API wallet approval flow.
