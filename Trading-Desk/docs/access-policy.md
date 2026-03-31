# Aether Access Policy

This is the minimum access model for AetherV1.

## What Aether Should Have

### Exchange API

- `READ`
  - balances
  - positions
  - orders
  - fills
  - market metadata

- `TRADE`
  - place paper or demo orders
  - cancel paper or demo orders
  - amend or replace paper or demo orders if supported

### Local Repo

- full read and write access to this repo
- permission to write runtime state to local ignored files
- permission to write logs, reports, and paper-trade artifacts

## What Aether Should Not Have

- transfer or withdrawal permissions
- master-account permissions if a sub-account works
- access to unrelated exchange accounts
- access to personal wallets
- access to live capital during V1

## Recommended BloFin Setup

- dedicated sub-account only
- dedicated API key only
- `READ` and `TRADE` only
- no `TRANSFER`
- IP allowlist enabled if practical
- demo or paper environment first

## Operational Rules

- all credentials live in local env files only
- all order activity must be attributable to Aether
- no manual discretionary trading on the same sub-account during tests
- rotate keys if the machine or repo state is exposed

