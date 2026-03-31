# Source Note

## Source

- title: How to Quit a Job You Hate. How to Build Your Own Trading Bot. A Complete Guide.
- author: unknown
- date: received March 26, 2026
- link: user-provided text
- source type: article / sales-style guide

## Summary

The article argues that manual trading is structurally inferior to automated trading, promotes a `Research -> Backtest -> Incubate` workflow, recommends building a Polymarket bot quickly with an AI coding agent, and presents starter strategies based on MACD, RSI plus VWAP, and CVD.

## Testable Claims

- explicit strategy rules outperform discretionary execution because they remove emotional interference
- a staged workflow from research to backtest to incubation is superior to immediate live trading
- CVD, VWAP, RSI, and MACD can produce viable automated strategies when formalized correctly
- small-size incubation reduces deployment risk

## Unsupported Or Weak Claims

- claim: Stanford research proves a `12 ms` amygdala response versus `500 ms` prefrontal response
- why it looks weak: no citation was provided and this exact claim was not verified from a credible Stanford source
- what would be needed to verify it: a primary neuroscience source with the actual timing claim

- claim: `99%` of manual traders lose money
- why it looks weak: the number is stated as universal fact without a source or market context
- what would be needed to verify it: market-specific primary research with exact methodology

- claim: successful funds do not trade by hand at all
- why it looks weak: this overgeneralizes from automated execution and systematic trading
- what would be needed to verify it: careful evidence on how discretionary and systematic processes are split at major funds

- claim: AI agents can build a robust trading bot in a day
- why it looks weak: this ignores validation, operational risk, data quality, and execution risk
- what would be needed to verify it: evidence of durable live performance, not just generated code

## Strategy Ideas Worth Formalizing

- idea: VWAP reclaim after a sharp intraday displacement
- market: liquid equities or crypto perps
- timeframe: 1m to 5m
- rough entry logic: reclaim above VWAP after failed downside extension with volume confirmation
- rough exit logic: target prior intraday structure, stop below reclaim failure

- idea: CVD divergence at structural support or resistance
- market: crypto perps
- timeframe: 1m to 5m
- rough entry logic: price makes a local push into level while CVD diverges
- rough exit logic: exit at mean reversion target or on invalidation of the level

- idea: RSI mean reversion gated by VWAP and regime filter
- market: range-bound instruments
- timeframe: 5m
- rough entry logic: fade extension only when regime filter says non-trending
- rough exit logic: exit back to VWAP or at momentum failure

## Operational Notes

- data needs: OHLCV is not enough for serious CVD work; trade or aggressor-side data is needed
- execution constraints: realistic fees, spread, slippage, and session rules must be modeled
- fees/slippage concerns: any short-hold strategy can look good before costs and collapse after them

## Verdict

- mine for ideas only

