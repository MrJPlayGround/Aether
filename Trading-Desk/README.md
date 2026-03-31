# Trading Desk

Aether is the automation lead for this repo.

The goal is not to copy trading ideas from articles, podcasts, or social posts. The goal is to convert external claims into explicit hypotheses, test them under realistic assumptions, paper trade them, and only then consider live deployment.

## Workflow

1. Capture a claim in `research/inbox/`.
2. Convert it into a strict rule set in `strategy_specs/`.
3. Backtest with fees, slippage, and session rules.
4. Run walk-forward and out-of-sample validation.
5. Promote to paper trading only if the evidence is strong.
6. Promote to tiny live canary only after paper results are stable.

## Promotion Standard

A strategy is not eligible for paper trading unless:

- entry, exit, and risk rules are explicit
- the backtest includes realistic execution assumptions
- out-of-sample behavior is acceptable
- max drawdown is survivable
- trade count is large enough to matter
- the logic is simple enough to monitor and trust

A strategy is not eligible for live canary unless:

- paper trading behavior roughly matches expected behavior
- signal generation is stable
- broker/exchange integration is verified
- risk controls and kill switches are tested

## Current Direction

- normal trading only
- paper trading first
- likely focus areas: VWAP, CVD, opening range, momentum, mean reversion
- distrust marketing claims until they survive testing

Read [docs/aether-operating-model.md](/Users/jay/Dev/personal/Trading-Desk/docs/aether-operating-model.md) first.
Then read [docs/aether-v1.md](/Users/jay/Dev/personal/Trading-Desk/docs/aether-v1.md) and [docs/access-policy.md](/Users/jay/Dev/personal/Trading-Desk/docs/access-policy.md).
