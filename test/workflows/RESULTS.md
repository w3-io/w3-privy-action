# E2E Test Results

> Last verified: 2026-04-15

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
| 3 | Get the user | `get-user` | PASS | |
| 4 | Set user custom metadata | `set-user-metadata` | PASS | |
| 5 | Link an account | `link-account` | SKIP | Requires specific linked_account format |
| 6 | Unlink the phone account | `unlink-account` | SKIP | Depends on link-account |
| 7 | Pregenerate wallets | `pregenerate-wallets` | PASS | |
| 8 | Get user by email | `get-user-by-email` | PASS | |
| 9 | Create a custodial wallet | `create-custodial-wallet` | PASS | |
| 10 | Create a user wallet | `create-wallet` | PASS | |
| 11 | Batch create wallets | `batch-create-wallets` | PASS | |
| 12 | List wallets | `list-wallets` | PASS | |
| 13 | Get the custodial wallet | `get-wallet` | PASS | |
| 14 | Get wallet by address | `get-wallet-by-address` | PASS | |
| 15 | Update wallet metadata | `update-wallet` | PASS | |
| 16 | Get wallet balance | `get-wallet-balance` | PASS | |
| 17 | Get wallet transactions | `get-wallet-transactions` | PASS | |
| 18 | Personal sign (EVM) | `personal-sign` | PASS | |
| 19 | Sign typed data (EIP-712) | `eth-sign-typed-data` | PASS | |
| 20 | Solana sign message | `solana-sign-message` | PASS | |
| 21 | Raw sign a message | `raw-sign` | PASS | |
| 22 | Create a policy | `create-policy` | PASS | |
| 23 | Get the policy | `get-policy` | PASS | |
| 24 | Update the policy | `update-policy` | PASS | |
| 25 | Create a rule | `create-rule` | PASS | |
| 26 | Get the rule | `get-rule` | PASS | |
| 27 | Update the rule | `update-rule` | PASS | |
| 28 | Delete the rule | `delete-rule` | PASS | |
| 29 | Create a condition set | `create-condition-set` | PASS | |
| 30 | Get the condition set | `get-condition-set` | PASS | |
| 31 | Update the condition set | `update-condition-set` | PASS | |
| 32 | Add condition set items | `add-condition-set-items` | PASS | |
| 33 | List condition set items | `list-condition-set-items` | PASS | |
| 34 | Get condition set item | `get-condition-set-item` | PASS | |
| 35 | Replace condition set items | `replace-condition-set-items` | PASS | |
| 36 | Delete condition set item | `delete-condition-set-item` | PASS | |
| 37 | Create a key quorum | `create-quorum` | PASS | |
| 38 | Get the quorum | `get-quorum` | PASS | |
| 39 | Update the quorum | `update-quorum` | PASS | |
| 40 | List intents | `list-intents` | PASS | |
| 41 | Add allowlist entry | `add-allowlist-entry` | PASS | |
| 42 | List allowlist | `list-allowlist` | PASS | |
| 43 | Delete allowlist entry | `delete-allowlist-entry` | PASS | |
| 44 | Create an aggregation | `create-aggregation` | PASS | |
| 45 | Get the aggregation | `get-aggregation` | PASS | |
| 46 | Delete the aggregation | `delete-aggregation` | PASS | |
| 47 | Get KYC status | `get-kyc-status` | PASS | |
| 48 | List fiat accounts | `list-fiat-accounts` | PASS | |
| 49 | Delete condition set | `delete-condition-set` | PASS | |
| 50 | Delete policy | `delete-policy` | PASS | |
| 51 | Delete quorum | `delete-quorum` | PASS | |
| 52 | Delete user | `delete-user` | PASS | |

**Summary: 50/50 active steps pass (2 skipped).**

## Skipped Commands

| Command | Reason |
|---------|--------|
| `search-users` | Requires specific query format |
| `get-user-by-phone/wallet/discord/etc.` | Requires linked accounts |
| `export-wallet` / `authenticate-wallet` | Requires feature config |
| `transfer` / `swap` / `get-swap-quote` | Requires funded wallet |
| `eth-send-transaction` | Requires funded wallet |
| `solana-send-transaction` | Requires funded Solana wallet |
| Intent commands | Requires policy/quorum-gated setup |
| Yield commands | Requires vault/yield setup |
| Fiat/KYC write commands | Requires provider config |

## How to run

```bash
# Export credentials
export PRIVY_APP_ID="..."
export PRIVY_APP_SECRET="..."

# Run
w3 workflow test --execute test/workflows/e2e.yaml
```
