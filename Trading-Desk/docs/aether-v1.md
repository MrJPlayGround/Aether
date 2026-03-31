# AetherV1

AetherV1 is the first executable version of the strategy lab.

Its job is narrow:

- ingest strategy specs
- run validation
- connect to one paper-trading venue
- execute paper orders
- enforce risk limits
- log everything needed for review

It is not a general AI trader and it is not a live multi-venue system.

## V1 Scope

- one venue: BloFin
- one market class: crypto perps
- one mode: paper or demo only
- first strategies: VWAP reclaim or rejection, CVD divergence
- no ML prediction layer
- no live capital

## Components

### Lead

Owns workflow orchestration:

- choose which strategy is active
- promote or reject strategies
- route tasks to validation, execution, risk, and ops

### Research

- convert source material into hypotheses
- maintain source notes

### Spec

- produce machine-testable strategy definitions
- reject vague rule sets

### Validator

- backtests
- walk-forward tests
- parameter sensitivity
- scorecards

### Execution

- venue adapter
- market data listeners
- signal-to-order translation
- order lifecycle tracking

### Risk

- max position limits
- max loss limits
- stale-data shutdown
- manual kill switch
- venue mismatch detection

### Ops

- health checks
- drift detection
- runtime state
- alerting hooks

## Promotion Path

`draft -> validating -> paper -> rejected`

V1 does not support promotion to live.

## Non-Negotiables

- no strategy runs without a strategy spec
- no paper execution starts without risk config
- no venue credentials are committed
- no shared account with manual trading
- no hidden state outside documented runtime files

