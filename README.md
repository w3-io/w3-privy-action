# W3 Privy Action

Privy wallet infrastructure for W3 workflows. 106 commands covering users, wallets, EVM/Solana/Bitcoin signing, transfers, swaps, transaction policies, key quorums, intents, ERC-4626 yield vaults, fiat/KYC, condition sets, allowlist, and aggregations.

## Why W3 + Privy

Privy manages per-user wallets and signing keys. W3 makes operations on those wallets **verifiable, auditable, and automated**:

- **Verified execution:** Batch operations across user wallets go through validator consensus — not a single server
- **Receipted transactions:** Every signing and transfer produces a cryptographic receipt anchored to L1
- **Cross-system orchestration:** Combine Privy wallets with Pyth prices, Chainalysis screening, Stripe payments, and MongoDB state in verified workflows
- **Scheduled automation:** Auto-compound yield, rebalance portfolios, process batch airdrops on a cron schedule

## Commands

### Users (9)

| Command | Description |
|---------|-------------|
| `create-user` | Create a user with linked accounts and optional wallets |
| `get-user` | Get user by Privy DID |
| `list-users` | List all users (paginated) |
| `delete-user` | Delete a user |
| `get-user-by-email` | Lookup user by email |
| `get-user-by-phone` | Lookup user by phone |
| `get-user-by-wallet` | Lookup user by wallet address |
| `set-user-metadata` | Set custom metadata on a user |
| `pregenerate-wallets` | Create embedded wallets for an existing user |

### Wallets (7)

| Command | Description |
|---------|-------------|
| `create-wallet` | Create a server wallet (ethereum, solana, bitcoin, etc.) |
| `batch-create-wallets` | Create multiple wallets in one request |
| `get-wallet` | Get wallet details by ID |
| `list-wallets` | List wallets (filter by chain, user, etc.) |
| `get-wallet-by-address` | Lookup wallet by blockchain address |
| `get-wallet-balance` | Get wallet balance (native or token) |
| `export-wallet` | Export wallet private key (HPKE-encrypted) |

### Signing — Ethereum (5)

| Command | Description |
|---------|-------------|
| `eth-send-transaction` | Sign and broadcast an EVM transaction |
| `eth-sign-transaction` | Sign without broadcasting (returns signed tx) |
| `personal-sign` | EIP-191 message signing |
| `eth-sign-typed-data` | EIP-712 typed data signing |
| `raw-sign` | Raw secp256k1 signature over a hash |

### Signing — Solana (3)

| Command | Description |
|---------|-------------|
| `solana-send-transaction` | Sign and broadcast a Solana transaction |
| `solana-sign-transaction` | Sign a Solana transaction without broadcasting |
| `solana-sign-message` | Sign a message on Solana |

### Transactions (1)

| Command | Description |
|---------|-------------|
| `get-transaction` | Get transaction details by ID |

### Policies (7)

| Command | Description |
|---------|-------------|
| `create-policy` | Create a spending/signing policy |
| `get-policy` | Get policy details |
| `update-policy` | Update a policy |
| `delete-policy` | Delete a policy |
| `create-rule` | Add a rule to a policy |
| `update-rule` | Update a rule |
| `delete-rule` | Delete a rule |

### Key Quorums (4)

| Command | Description |
|---------|-------------|
| `create-quorum` | Create a multi-sig key quorum |
| `get-quorum` | Get quorum details |
| `update-quorum` | Update quorum configuration |
| `delete-quorum` | Delete a quorum |

### Intents (3)

| Command | Description |
|---------|-------------|
| `create-rpc-intent` | Create a governed RPC execution intent |
| `get-intent` | Get intent status |
| `list-intents` | List all intents |

### Yield Vaults (5)

| Command | Description |
|---------|-------------|
| `get-vault` | Get ERC-4626 vault details and APY |
| `get-vault-position` | Get a wallet's position in a vault |
| `deposit-vault` | Deposit into a yield vault |
| `withdraw-vault` | Withdraw from a vault |
| `claim-yield` | Claim accrued yield rewards |

### Fiat / KYC (6)

| Command | Description |
|---------|-------------|
| `start-kyc` | Start KYC verification for a user |
| `get-kyc-status` | Check KYC status |
| `create-fiat-account` | Register a bank account |
| `list-fiat-accounts` | List user's fiat accounts |
| `initiate-onramp` | Start fiat-to-crypto onramp |
| `initiate-offramp` | Start crypto-to-fiat offramp |

### Condition Sets (4)

| Command | Description |
|---------|-------------|
| `create-condition-set` | Create a condition set for policy rules |
| `get-condition-set` | Get condition set details |
| `update-condition-set` | Update a condition set |
| `delete-condition-set` | Delete a condition set |

## Usage

### Create a User with a Wallet

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

### Send a Transaction from a User Wallet

```yaml
- uses: w3/privy@v1
  with:
    command: eth-send-transaction
    app-id: ${{ secrets.PRIVY_APP_ID }}
    app-secret: ${{ secrets.PRIVY_APP_SECRET }}
    wallet-id: ${{ steps.wallet.outputs.result.id }}
    caip2: "eip155:43114"
    body: |
      {
        "transaction": {
          "to": "0xRecipient",
          "value": "0x2386F26FC10000",
          "type": 2
        }
      }
```

### Batch Airdrop to User Wallets

```yaml
- name: List user wallets
  id: wallets
  uses: w3/privy@v1
  with:
    command: list-wallets
    app-id: ${{ secrets.PRIVY_APP_ID }}
    app-secret: ${{ secrets.PRIVY_APP_SECRET }}
    chain-type: ethereum

# For each wallet, send tokens via Privy's signing
- name: Airdrop to first wallet
  uses: w3/privy@v1
  with:
    command: eth-send-transaction
    app-id: ${{ secrets.PRIVY_APP_ID }}
    app-secret: ${{ secrets.PRIVY_APP_SECRET }}
    wallet-id: ${{ fromJson(steps.wallets.outputs.result).data[0].id }}
    body: |
      {
        "transaction": {
          "to": "0xTokenContract",
          "data": "0xa9059cbb..."
        }
      }
```

### Auto-Compound Yield

```yaml
name: auto-compound
on:
  schedule:
    cron: "0 0 * * 0"

jobs:
  compound:
    runs-on: ubuntu-latest
    steps:
      - name: Claim rewards
        uses: w3/privy@v1
        with:
          command: claim-yield
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          body: '{"wallet_id": "...", "vault_id": "..."}'

      - name: Re-deposit
        uses: w3/privy@v1
        with:
          command: deposit-vault
          app-id: ${{ secrets.PRIVY_APP_ID }}
          app-secret: ${{ secrets.PRIVY_APP_SECRET }}
          body: '{"wallet_id": "...", "vault_id": "...", "amount": "..."}'
```

## Authentication

Privy uses Basic auth with your App ID and App Secret:

```
Authorization: Basic base64(app_id:app_secret)
privy-app-id: your_app_id
```

Get credentials at the Privy Dashboard under App Settings > Basics.

## Supported Chains

Wallets: Ethereum, Solana, Bitcoin (segwit), Cosmos, Stellar, Sui, Aptos, Tron, NEAR, TON, Starknet

Signing: EVM (all EIP-155 chains via CAIP-2), Solana, Spark (Bitcoin L2)
