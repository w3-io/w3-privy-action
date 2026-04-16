# E2E Test Results

> Last verified: 2026-04-15 -- PASS (8/8)

## Prerequisites

| Credential | Env var | Source |
|-----------|---------|--------|
| Privy app ID | `PRIVY_APP_ID` | Privy dashboard |
| Privy app secret | `PRIVY_APP_SECRET` | Privy dashboard |

## Results

| # | Step | Command | Status | Notes |
|---|------|---------|--------|-------|
| 1 | Create a user | `create-user` | PASS | |
| 2 | List users | `list-users` | PASS | |
| 3 | Extract user ID | (variable extraction) | PASS | |
| 4 | Get the user | `get-user` | PASS | |
| 5 | Set user custom metadata | `set-user-metadata` | PASS | |
| 6 | Get user by email | `get-user-by-email` | PASS | |
| 7 | List wallets | `list-wallets` | PASS | |
| 8 | Delete the user | `delete-user` | PASS | |

**Summary: 8/8 pass.**

## Skipped Commands

| Command | Reason |
|---------|--------|
| Custodial wallet commands (`create-custodial-wallet`, `create-wallet`, `batch-create-wallets`) | Requires elevated permissions |
| Signing commands (`personal-sign`, `eth-sign-typed-data`, `solana-sign-message`, `raw-sign`) | Requires wallets to be created first |
| Policy/rule/condition commands (`create-policy`, `create-rule`, `create-condition-set`, etc.) | API format differences |
| Social lookup commands (`get-user-by-phone`, `get-user-by-discord`, etc.) | Requires linked accounts |
| `link-account` / `unlink-account` | Requires specific linked_account format |
| `search-users` | Requires specific query format |
| `export-wallet` / `authenticate-wallet` | Requires feature config |
| `transfer` / `swap` / `get-swap-quote` | Requires funded wallet |
| Transaction commands (`eth-send-transaction`, `solana-send-transaction`) | Requires funded wallet |
| Quorum/intent commands | Requires policy/quorum-gated setup |
| Yield/fiat/KYC write commands | Requires provider config |

## How to run

```bash
# Export credentials
export PRIVY_APP_ID="your-app-id-here"
export PRIVY_APP_SECRET="your-app-secret-here"

# Run
w3 workflow test --execute test/workflows/e2e.yaml
```
