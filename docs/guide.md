# W3 Privy Action Reference Guide

W3 Privy Action provides wallet infrastructure for W3 workflows -- user management, server wallet creation (EVM, Solana, Bitcoin, and more), transaction signing, spending policies, key quorums, and fiat on/off-ramp via KYC. This guide focuses on users, wallets, signing, and policies. See the [README](../README.md) for the full 54-command reference.

## Quick Start

```yaml
- uses: w3/privy@v1
  id: user
  with:
    command: create-user
    app-id: ${{ secrets.PRIVY_APP_ID }}
    app-secret: ${{ secrets.PRIVY_APP_SECRET }}
    body: |
      {
        "create_ethereum_wallet": true,
        "linked_accounts": [
          {"type": "email", "address": "alice@example.com"}
        ]
      }
```

## Commands

### Users

| Command | Required Inputs | Description |
|---------|----------------|-------------|
| `create-user` | `app-id`, `app-secret`, `body` | Create user with linked accounts and optional wallets |
| `get-user` | `app-id`, `app-secret`, `user-id` | Get user by Privy DID |
| `list-users` | `app-id`, `app-secret` | List users (paginated via `cursor`, `limit`) |
| `delete-user` | `app-id`, `app-secret`, `user-id` | Delete a user |
| `get-user-by-email` | `app-id`, `app-secret`, `email` | Lookup by email |
| `get-user-by-wallet` | `app-id`, `app-secret`, `address` | Lookup by wallet address |
| `set-user-metadata` | `app-id`, `app-secret`, `user-id`, `body` | Set custom metadata |

### Wallets

| Command | Required Inputs | Description |
|---------|----------------|-------------|
| `create-wallet` | `app-id`, `app-secret`, `body` | Create a server wallet |
| `batch-create-wallets` | `app-id`, `app-secret`, `body` | Create multiple wallets |
| `get-wallet` | `app-id`, `app-secret`, `wallet-id` | Get wallet details |
| `list-wallets` | `app-id`, `app-secret` | List wallets (filter by `chain-type`) |
| `get-wallet-by-address` | `app-id`, `app-secret`, `address`, `chain-type` | Lookup by address |
| `get-wallet-balance` | `app-id`, `app-secret`, `wallet-id` | Get balance (native or token) |

Supported chains: Ethereum, Solana, Bitcoin (segwit), Cosmos, Stellar, Sui, Aptos, Tron, NEAR, TON, Starknet.

### Signing -- Ethereum

| Command | Required Inputs | Description |
|---------|----------------|-------------|
| `eth-send-transaction` | `app-id`, `app-secret`, `wallet-id`, `caip2`, `body` | Sign and broadcast EVM tx |
| `eth-sign-transaction` | `app-id`, `app-secret`, `wallet-id`, `caip2`, `body` | Sign without broadcasting |
| `personal-sign` | `app-id`, `app-secret`, `wallet-id`, `body` | EIP-191 message signing |
| `eth-sign-typed-data` | `app-id`, `app-secret`, `wallet-id`, `body` | EIP-712 typed data |
| `raw-sign` | `app-id`, `app-secret`, `wallet-id`, `body` | Raw secp256k1 signature |

The `caip2` input identifies the chain (e.g. `eip155:1` for Ethereum mainnet, `eip155:43114` for Avalanche).

### Signing -- Solana

| Command | Required Inputs | Description |
|---------|----------------|-------------|
| `solana-send-transaction` | `app-id`, `app-secret`, `wallet-id`, `body` | Sign and broadcast |
| `solana-sign-transaction` | `app-id`, `app-secret`, `wallet-id`, `body` | Sign without broadcasting |
| `solana-sign-message` | `app-id`, `app-secret`, `wallet-id`, `body` | Sign a message |

### Policies

| Command | Required Inputs | Description |
|---------|----------------|-------------|
| `create-policy` | `app-id`, `app-secret`, `body` | Create a spending/signing policy |
| `get-policy` | `app-id`, `app-secret`, `policy-id` | Get policy details |
| `update-policy` | `app-id`, `app-secret`, `policy-id`, `body` | Update a policy |
| `delete-policy` | `app-id`, `app-secret`, `policy-id` | Delete a policy |
| `create-rule` | `app-id`, `app-secret`, `policy-id`, `body` | Add a rule to a policy |
| `update-rule` | `app-id`, `app-secret`, `policy-id`, `rule-id`, `body` | Update a rule |
| `delete-rule` | `app-id`, `app-secret`, `policy-id`, `rule-id` | Delete a rule |

### Other Command Categories

| Category | Count | Examples |
|----------|-------|---------|
| Key Quorums | 4 | `create-quorum`, `get-quorum`, `update-quorum` |
| Intents | 3 | `create-rpc-intent`, `get-intent`, `list-intents` |
| Yield Vaults | 5 | `deposit-vault`, `withdraw-vault`, `claim-yield` |
| Fiat / KYC | 6 | `start-kyc`, `initiate-onramp`, `initiate-offramp` |
| Condition Sets | 4 | `create-condition-set`, `update-condition-set` |

See the [README](../README.md) for the complete reference.

## Authentication

Privy uses Basic auth (`Authorization: Basic base64(app_id:app_secret)`). The action handles this automatically. Get credentials from the Privy Dashboard under App Settings > Basics.

## Full Workflow Example

```yaml
name: Create wallet and send transaction
on: workflow_dispatch

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Create user with wallet
        uses: w3/privy@v1
        id: user
        with:
          command: create-user
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          body: |
            {
              "create_ethereum_wallet": true,
              "linked_accounts": [
                {"type": "email", "address": "alice@example.com"}
              ]
            }

      - name: Create spending policy
        uses: w3/privy@v1
        id: policy
        with:
          command: create-policy
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          body: |
            {
              "name": "daily-limit",
              "wallet_id": "${{ fromJson(steps.user.outputs.result).wallet.id }}"
            }

      - name: Add spending rule
        uses: w3/privy@v1
        with:
          command: create-rule
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          policy-id: ${{ fromJson(steps.policy.outputs.result).id }}
          body: |
            {
              "action": "ALLOW",
              "max_value_per_day": "1000000000000000000"
            }

      - name: Send ETH transaction
        uses: w3/privy@v1
        id: tx
        with:
          command: eth-send-transaction
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          wallet-id: ${{ fromJson(steps.user.outputs.result).wallet.id }}
          caip2: "eip155:1"
          body: |
            {
              "transaction": {
                "to": "0xRecipientAddress",
                "value": "0x2386F26FC10000",
                "type": 2
              }
            }

      - name: Check balance
        uses: w3/privy@v1
        with:
          command: get-wallet-balance
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          wallet-id: ${{ fromJson(steps.user.outputs.result).wallet.id }}
```
