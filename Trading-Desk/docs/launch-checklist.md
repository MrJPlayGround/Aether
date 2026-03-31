# Aether Launch Checklist

Fire up Aether when these are true:

- we have chosen the first venue branch
- we have chosen the first market focus
- we have chosen the first one or two strategy hypotheses
- we are ready to build paper-first infrastructure instead of debating ideas in the abstract

## Recommended First Launch

Start Aether on the `BloFin crypto-perp paper path` if the immediate goal is intraday VWAP and CVD research.

Start Aether on the `Alpaca equities paper path` if the immediate goal is lower-friction automation and cleaner broker tooling.

## BloFin Prep

If using a BloFin sub-account, prepare:

- a dedicated sub-account for automation only
- API key with the minimum required permissions for paper or demo testing
- IP allowlisting if enabled
- confirmation that demo trading is enabled on that sub-account
- no shared manual trading activity on the same account during testing

Keep live capital isolated from the first paper-trading workflow.

## First Sprint

1. Define the first market universe.
2. Pick two strategy candidates only.
3. Define exact strategy specs.
4. Build data ingestion and normalization.
5. Build the backtest harness.
6. Build the paper execution adapter.
7. Add risk controls and reconciliation.

## Suggested First Two Strategy Candidates

- VWAP reclaim or rejection with session and volume filters
- CVD divergence at structural levels

## Do Not Do On Sprint One

- multiple venues
- multiple asset classes
- live deployment
- ML prediction systems
- over-optimized indicator stacks
