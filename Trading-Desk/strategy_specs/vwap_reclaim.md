# VWAP Reclaim

## Identity

- name: vwap_reclaim
- status: draft
- owner: Aether

## Market Scope

- venue: blofin
- asset class: crypto perps
- symbols: BTC-USDT, ETH-USDT
- session: continuous
- timezone: UTC
- timeframe: 5m

## Setup Logic

- regime filter: intraday trend or recovery after displacement
- long setup: price reclaims session VWAP after trading below it and volume confirms the reclaim
- short setup: price rejects session VWAP after trading above it and volume confirms the rejection

## Entry Rules

- long entry: close above VWAP after downside extension, with reclaim candle volume above recent average
- short entry: close below VWAP after upside extension, with rejection candle volume above recent average

## Exit Rules

- stop-loss: beyond reclaim or rejection failure level
- take-profit: prior structure or fixed reward multiple
- trailing logic: optional after first target
- time stop: exit if setup does not progress within a fixed number of bars
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
- fill assumptions: no guaranteed full fill

## Validation Plan

- in-sample period: to be defined
- out-of-sample period: to be defined
- walk-forward design: rolling windows
- robustness checks: VWAP source, volume threshold, stop distance

## Promotion Gates

- minimum trade count: 100
- maximum drawdown: to be defined
- minimum profit factor: 1.5
- paper-trade duration: at least 2 weeks

## Notes

- failure modes: strong trend continuation against reclaim, low-liquidity chop, poor fills
- monitoring requirements: VWAP correctness, fill rate, slippage drift

