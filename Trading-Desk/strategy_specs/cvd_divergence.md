# CVD Divergence

## Identity

- name: cvd_divergence
- status: draft
- owner: Aether

## Market Scope

- venue: blofin
- asset class: crypto perps
- symbols: BTC-USDT, ETH-USDT
- session: continuous
- timezone: UTC
- timeframe: 1m to 5m

## Setup Logic

- regime filter: local structural support or resistance required
- long setup: price pushes lower into support while CVD improves or diverges positively
- short setup: price pushes higher into resistance while CVD weakens or diverges negatively

## Entry Rules

- long entry: structural support holds and positive divergence is confirmed
- short entry: structural resistance holds and negative divergence is confirmed

## Exit Rules

- stop-loss: break of structural invalidation
- take-profit: mean reversion target, VWAP, or prior local structure
- trailing logic: optional after first target
- time stop: exit if divergence fails to resolve promptly
- manual override conditions: venue or data fault only

## Risk Rules

- sizing model: fixed paper notional
- max risk per trade: to be set
- max daily loss: to be set
- max concurrent positions: 1
- cooldown after loss: to be set

## Execution Assumptions

- order type: limit
- slippage model: conservative estimate required
- fee model: venue-specific
- fill assumptions: realistic partial fills required

## Validation Plan

- in-sample period: to be defined
- out-of-sample period: to be defined
- walk-forward design: rolling windows
- robustness checks: divergence definition, level detection, hold time

## Promotion Gates

- minimum trade count: 100
- maximum drawdown: to be defined
- minimum profit factor: 1.5
- paper-trade duration: at least 2 weeks

## Notes

- failure modes: false divergence in momentum continuation, noisy trade classification, thin liquidity
- monitoring requirements: CVD data quality, structure detection quality, fill drift

