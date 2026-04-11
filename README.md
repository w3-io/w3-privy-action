# W3 Privy Action

Privy wallet infrastructure -- users, wallets, EVM/Solana/Bitcoin signing, policies, key quorums, intents, yield vaults, and fiat/KYC for W3 workflows.

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

- uses: w3/privy@v1
  with:
    command: eth-send-transaction
    app-id: ${{ secrets.PRIVY_APP_ID }}
    app-secret: ${{ secrets.PRIVY_APP_SECRET }}
    wallet-id: ${{ fromJson(steps.user.outputs.result).wallet.id }}
    caip2: "eip155:1"
    body: |
      {
        "transaction": {
          "to": "0xRecipient",
          "value": "0x2386F26FC10000",
          "type": 2
        }
      }
```

## Commands

### Users (9)

| Command               | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `create-user`         | Create a user with linked accounts and optional wallets |
| `get-user`            | Get user by Privy DID                                   |
| `list-users`          | List all users (paginated)                              |
| `delete-user`         | Delete a user                                           |
| `get-user-by-email`   | Lookup user by email                                    |
| `get-user-by-phone`   | Lookup user by phone                                    |
| `get-user-by-wallet`  | Lookup user by wallet address                           |
| `set-user-metadata`   | Set custom metadata on a user                           |
| `pregenerate-wallets` | Create embedded wallets for an existing user            |

### Wallets (7)

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `create-wallet`         | Create a server wallet (ethereum, solana, bitcoin, etc.) |
| `batch-create-wallets`  | Create multiple wallets in one request                   |
| `get-wallet`            | Get wallet details by ID                                 |
| `list-wallets`          | List wallets (filter by chain, user, etc.)               |
| `get-wallet-by-address` | Lookup wallet by blockchain address                      |
| `get-wallet-balance`    | Get wallet balance (native or token)                     |
| `export-wallet`         | Export wallet private key (HPKE-encrypted)               |

### Signing -- Ethereum (5)

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `eth-send-transaction` | Sign and broadcast an EVM transaction         |
| `eth-sign-transaction` | Sign without broadcasting (returns signed tx) |
| `personal-sign`        | EIP-191 message signing                       |
| `eth-sign-typed-data`  | EIP-712 typed data signing                    |
| `raw-sign`             | Raw secp256k1 signature over a hash           |

### Signing -- Solana (3)

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `solana-send-transaction` | Sign and broadcast a Solana transaction        |
| `solana-sign-transaction` | Sign a Solana transaction without broadcasting |
| `solana-sign-message`     | Sign a message on Solana                       |

### Transactions (1)

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `get-transaction` | Get transaction details by ID |

### Policies (7)

| Command         | Description                      |
| --------------- | -------------------------------- |
| `create-policy` | Create a spending/signing policy |
| `get-policy`    | Get policy details               |
| `update-policy` | Update a policy                  |
| `delete-policy` | Delete a policy                  |
| `create-rule`   | Add a rule to a policy           |
| `update-rule`   | Update a rule                    |
| `delete-rule`   | Delete a rule                    |

### Key Quorums (4)

| Command         | Description                   |
| --------------- | ----------------------------- |
| `create-quorum` | Create a multi-sig key quorum |
| `get-quorum`    | Get quorum details            |
| `update-quorum` | Update quorum configuration   |
| `delete-quorum` | Delete a quorum               |

### Intents (3)

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `create-rpc-intent` | Create a governed RPC execution intent |
| `get-intent`        | Get intent status                      |
| `list-intents`      | List all intents                       |

### Yield Vaults (5)

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `get-vault`          | Get ERC-4626 vault details and APY |
| `get-vault-position` | Get a wallet's position in a vault |
| `deposit-vault`      | Deposit into a yield vault         |
| `withdraw-vault`     | Withdraw from a vault              |
| `claim-yield`        | Claim accrued yield rewards        |

### Fiat / KYC (6)

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `start-kyc`           | Start KYC verification for a user |
| `get-kyc-status`      | Check KYC status                  |
| `create-fiat-account` | Register a bank account           |
| `list-fiat-accounts`  | List user's fiat accounts         |
| `initiate-onramp`     | Start fiat-to-crypto onramp       |
| `initiate-offramp`    | Start crypto-to-fiat offramp      |

### Condition Sets (4)

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `create-condition-set` | Create a condition set for policy rules |
| `get-condition-set`    | Get condition set details               |
| `update-condition-set` | Update a condition set                  |
| `delete-condition-set` | Delete a condition set                  |

## Inputs

| Name               | Required | Default                   | Description                                         |
| ------------------ | -------- | ------------------------- | --------------------------------------------------- |
| `command`          | Yes      |                           | Operation to perform (54 commands)                  |
| `app-id`           | Yes      |                           | Privy App ID                                        |
| `app-secret`       | Yes      |                           | Privy App Secret                                    |
| `api-url`          | No       | `https://api.privy.io/v1` | Privy API base URL                                  |
| `body`             | No       |                           | Request body as JSON                                |
| `user-id`          | No       |                           | User ID (Privy DID)                                 |
| `wallet-id`        | No       |                           | Wallet ID                                           |
| `policy-id`        | No       |                           | Policy ID                                           |
| `rule-id`          | No       |                           | Rule ID (within a policy)                           |
| `quorum-id`        | No       |                           | Key quorum ID                                       |
| `intent-id`        | No       |                           | Intent ID                                           |
| `transaction-id`   | No       |                           | Transaction ID                                      |
| `vault-id`         | No       |                           | ERC-4626 vault ID                                   |
| `condition-set-id` | No       |                           | Condition set ID                                    |
| `chain-type`       | No       |                           | Chain type (ethereum, solana, bitcoin-segwit, etc.) |
| `address`          | No       |                           | Blockchain address                                  |
| `email`            | No       |                           | User email                                          |
| `phone`            | No       |                           | User phone number                                   |
| `caip2`            | No       |                           | CAIP-2 chain identifier (e.g. `eip155:1`)           |
| `method`           | No       |                           | RPC method name                                     |
| `cursor`           | No       |                           | Pagination cursor                                   |
| `limit`            | No       |                           | Page size (max 100)                                 |
| `idempotency-key`  | No       |                           | Idempotency key for write operations                |
| `chain`            | No       |                           | Chain for balance queries                           |
| `token`            | No       |                           | Token address for balance queries                   |
| `asset`            | No       |                           | Asset type for balance queries                      |
| `provider`         | No       |                           | KYC provider (`bridge` or `bridge-sandbox`)         |

## Outputs

| Name     | Description                   |
| -------- | ----------------------------- |
| `result` | Command result as JSON string |

## Authentication

Privy uses Basic auth with your App ID and App Secret (`Authorization: Basic base64(app_id:app_secret)`). Get credentials at the Privy Dashboard under App Settings > Basics.

Supported wallet chains: Ethereum, Solana, Bitcoin (segwit), Cosmos, Stellar, Sui, Aptos, Tron, NEAR, TON, Starknet. Signing supports all EVM chains via CAIP-2 identifiers, Solana, and Spark (Bitcoin L2).
