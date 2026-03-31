# Risk Governor

The risk layer is mandatory for any Aether execution loop.

V1 guards:

- one open position at a time unless explicitly changed
- hard daily stop
- hard per-trade notional cap
- stale-data halt
- reconciliation mismatch halt
- manual kill switch

