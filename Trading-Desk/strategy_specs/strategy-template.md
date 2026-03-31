# Strategy Template

## Identity

- name:
- status: draft | validating | paper | live-canary | rejected | archived
- owner: Aether

## Market Scope

- venue:
- asset class:
- symbols:
- session:
- timezone:
- timeframe:

## Setup Logic

- regime filter:
- long setup:
- short setup:

## Entry Rules

- long entry:
- short entry:

## Exit Rules

- stop-loss:
- take-profit:
- trailing logic:
- time stop:
- manual override conditions:

## Risk Rules

- sizing model:
- max risk per trade:
- max daily loss:
- max concurrent positions:
- cooldown after loss:

## Execution Assumptions

- order type:
- slippage model:
- fee model:
- fill assumptions:

## Validation Plan

- in-sample period:
- out-of-sample period:
- walk-forward design:
- robustness checks:

## Promotion Gates

- minimum trade count:
- maximum drawdown:
- minimum profit factor:
- paper-trade duration:

## Notes

- failure modes:
- monitoring requirements:

