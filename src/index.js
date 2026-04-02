import { createCommandRouter, setJsonOutput, handleError } from '@w3-io/action-core'
import * as core from '@actions/core'

const router = createCommandRouter({
  // ── Users ──────────────────────────────────────────────────────
  'create-user': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users', pb()))
  },
  'get-user': async () => {
    const { req, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('GET', `/users/${userId}`))
  },
  'list-users': async () => {
    const { req, qs, cursor, limit } = setup()
    setJsonOutput('result', await req('GET', `/users${qs({ cursor, limit })}`))
  },
  'delete-user': async () => {
    const { req, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('DELETE', `/users/${userId}`))
  },
  'search-users': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/search', pb()))
  },
  'set-user-metadata': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/custom_metadata`, pb()))
  },
  'link-account': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/accounts`, pb()))
  },
  'unlink-account': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/accounts/unlink`, pb()))
  },
  'pregenerate-wallets': async () => {
    const { req, pb, userId, body, chainType } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput(
      'result',
      await req('POST', `/users/${userId}/wallets`, body ? pb() : { wallets: [{ chain_type: chainType || 'ethereum' }] }),
    )
  },

  // ── User Lookups ───────────────────────────────────────────────
  'get-user-by-email': async () => {
    const { req, pb, email } = setup()
    setJsonOutput('result', await req('POST', '/users/email/address', { address: email || pb().address }))
  },
  'get-user-by-phone': async () => {
    const { req, pb, phone } = setup()
    setJsonOutput('result', await req('POST', '/users/phone/number', { number: phone || pb().number }))
  },
  'get-user-by-wallet': async () => {
    const { req, pb, address } = setup()
    setJsonOutput('result', await req('POST', '/users/wallet/address', { address: address || pb().address }))
  },
  'get-user-by-smart-wallet': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/smart_wallet/address', pb()))
  },
  'get-user-by-discord': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/discord/username', pb()))
  },
  'get-user-by-telegram-id': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/telegram/telegram_user_id', pb()))
  },
  'get-user-by-telegram-username': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/telegram/username', pb()))
  },
  'get-user-by-farcaster': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/farcaster/fid', pb()))
  },
  'get-user-by-instagram': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/instagram/username', pb()))
  },
  'get-user-by-twitter': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/twitter/username', pb()))
  },
  'get-user-by-twitter-id': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/twitter/subject', pb()))
  },
  'get-user-by-github': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/github/username', pb()))
  },
  'get-user-by-twitch': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/twitch/username', pb()))
  },
  'get-user-by-spotify': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/spotify/subject', pb()))
  },
  'get-user-by-custom-auth': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/users/custom_auth/id', pb()))
  },

  // ── Wallets ────────────────────────────────────────────────────
  'create-wallet': async () => {
    const { req, pb, body, chainType } = setup()
    setJsonOutput('result', await req('POST', '/wallets', body ? pb() : { chain_type: chainType || 'ethereum' }))
  },
  'batch-create-wallets': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/wallets/batch', pb()))
  },
  'create-custodial-wallet': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/custodial_wallets', pb()))
  },
  'get-wallet': async () => {
    const { req, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('GET', `/wallets/${walletId}`))
  },
  'list-wallets': async () => {
    const { req, qs, cursor, limit, chainType, userId } = setup()
    setJsonOutput('result', await req('GET', `/wallets${qs({ cursor, limit, chain_type: chainType, user_id: userId })}`))
  },
  'get-wallet-by-address': async () => {
    const { req, pb, address } = setup()
    setJsonOutput('result', await req('POST', '/wallets/address', { address: address || pb().address }))
  },
  'update-wallet': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('PATCH', `/wallets/${walletId}`, pb()))
  },
  'get-wallet-balance': async () => {
    const { req, qs, walletId, chain, asset, token } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('GET', `/wallets/${walletId}/balance${qs({ chain, asset, token })}`))
  },
  'export-wallet': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/export`, pb()))
  },
  'authenticate-wallet': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/wallets/authenticate', pb()))
  },
  'get-wallet-action': async () => {
    const { req, walletId, actionId } = setup()
    if (!walletId || !actionId) throw new Error('wallet-id and action-id required')
    setJsonOutput('result', await req('GET', `/wallets/${walletId}/actions/${actionId}`))
  },
  'get-wallet-transactions': async () => {
    const { req, qs, walletId, cursor, limit, chain } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('GET', `/wallets/${walletId}/transactions${qs({ cursor, limit, chain })}`))
  },
  'transfer': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/transfer`, pb()))
  },
  'swap': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/swap`, pb()))
  },
  'get-swap-quote': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/swap/quote`, pb()))
  },

  // ── Signing — Ethereum ─────────────────────────────────────────
  'eth-send-transaction': async () => {
    const { req, pb, walletId, caip2 } = setup()
    if (!walletId) throw new Error('wallet-id required')
    const p = pb(); if (caip2) p.caip2 = caip2
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'eth_sendTransaction', params: p }))
  },
  'eth-sign-transaction': async () => {
    const { req, pb, walletId, caip2 } = setup()
    if (!walletId) throw new Error('wallet-id required')
    const p = pb(); if (caip2) p.caip2 = caip2
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'eth_signTransaction', params: p }))
  },
  'personal-sign': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'personal_sign', params: pb() }))
  },
  'eth-sign-typed-data': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'eth_signTypedData_v4', params: pb() }))
  },
  'eth-sign-7702': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'eth_sign7702Authorization', params: pb() }))
  },
  'eth-sign-user-operation': async () => {
    const { req, pb, walletId, caip2 } = setup()
    if (!walletId) throw new Error('wallet-id required')
    const p = pb(); if (caip2) p.caip2 = caip2
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'eth_signUserOperation', params: p }))
  },

  // ── Signing — Solana ───────────────────────────────────────────
  'solana-send-transaction': async () => {
    const { req, pb, walletId, caip2 } = setup()
    if (!walletId) throw new Error('wallet-id required')
    const p = pb(); if (caip2) p.caip2 = caip2
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'signAndSendTransaction', params: p }))
  },
  'solana-sign-transaction': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'signTransaction', params: pb() }))
  },
  'solana-sign-message': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'signMessage', params: pb() }))
  },

  // ── Signing — Bitcoin / Spark ──────────────────────────────────
  'bitcoin-sign-psbt': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'signPsbt', params: pb() }))
  },
  'spark-transfer': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'transfer', params: pb() }))
  },
  'spark-transfer-tokens': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/rpc`, { method: 'transferTokens', params: pb() }))
  },

  // ── Signing — Raw ──────────────────────────────────────────────
  'raw-sign': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/raw_sign`, pb()))
  },

  // ── Transactions ───────────────────────────────────────────────
  'get-transaction': async () => {
    const { req, transactionId } = setup()
    if (!transactionId) throw new Error('transaction-id required')
    setJsonOutput('result', await req('GET', `/transactions/${transactionId}`))
  },

  // ── Policies ───────────────────────────────────────────────────
  'create-policy': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/policies', pb()))
  },
  'get-policy': async () => {
    const { req, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('GET', `/policies/${policyId}`))
  },
  'update-policy': async () => {
    const { req, pb, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('PATCH', `/policies/${policyId}`, pb()))
  },
  'delete-policy': async () => {
    const { req, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('DELETE', `/policies/${policyId}`))
  },
  'create-rule': async () => {
    const { req, pb, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('POST', `/policies/${policyId}/rules`, pb()))
  },
  'get-rule': async () => {
    const { req, policyId, ruleId } = setup()
    if (!policyId || !ruleId) throw new Error('policy-id and rule-id required')
    setJsonOutput('result', await req('GET', `/policies/${policyId}/rules/${ruleId}`))
  },
  'update-rule': async () => {
    const { req, pb, policyId, ruleId } = setup()
    if (!policyId || !ruleId) throw new Error('policy-id and rule-id required')
    setJsonOutput('result', await req('PATCH', `/policies/${policyId}/rules/${ruleId}`, pb()))
  },
  'delete-rule': async () => {
    const { req, policyId, ruleId } = setup()
    if (!policyId || !ruleId) throw new Error('policy-id and rule-id required')
    setJsonOutput('result', await req('DELETE', `/policies/${policyId}/rules/${ruleId}`))
  },

  // ── Key Quorums ────────────────────────────────────────────────
  'create-quorum': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/key_quorums', pb()))
  },
  'get-quorum': async () => {
    const { req, quorumId } = setup()
    if (!quorumId) throw new Error('quorum-id required')
    setJsonOutput('result', await req('GET', `/key_quorums/${quorumId}`))
  },
  'update-quorum': async () => {
    const { req, pb, quorumId } = setup()
    if (!quorumId) throw new Error('quorum-id required')
    setJsonOutput('result', await req('PATCH', `/key_quorums/${quorumId}`, pb()))
  },
  'delete-quorum': async () => {
    const { req, quorumId } = setup()
    if (!quorumId) throw new Error('quorum-id required')
    setJsonOutput('result', await req('DELETE', `/key_quorums/${quorumId}`))
  },

  // ── Intents ────────────────────────────────────────────────────
  'create-rpc-intent': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/intents/wallets/${walletId}/rpc`, pb()))
  },
  'create-wallet-update-intent': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('PATCH', `/intents/wallets/${walletId}`, pb()))
  },
  'create-policy-update-intent': async () => {
    const { req, pb, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('PATCH', `/intents/policies/${policyId}`, pb()))
  },
  'create-rule-intent': async () => {
    const { req, pb, policyId } = setup()
    if (!policyId) throw new Error('policy-id required')
    setJsonOutput('result', await req('POST', `/intents/policies/${policyId}/rules`, pb()))
  },
  'update-rule-intent': async () => {
    const { req, pb, policyId, ruleId } = setup()
    if (!policyId || !ruleId) throw new Error('policy-id and rule-id required')
    setJsonOutput('result', await req('PATCH', `/intents/policies/${policyId}/rules/${ruleId}`, pb()))
  },
  'delete-rule-intent': async () => {
    const { req, pb, policyId, ruleId } = setup()
    if (!policyId || !ruleId) throw new Error('policy-id and rule-id required')
    setJsonOutput('result', await req('DELETE', `/intents/policies/${policyId}/rules/${ruleId}`))
  },
  'create-quorum-update-intent': async () => {
    const { req, pb, quorumId } = setup()
    if (!quorumId) throw new Error('quorum-id required')
    setJsonOutput('result', await req('PATCH', `/intents/key_quorums/${quorumId}`, pb()))
  },
  'get-intent': async () => {
    const { req, intentId } = setup()
    if (!intentId) throw new Error('intent-id required')
    setJsonOutput('result', await req('GET', `/intents/${intentId}`))
  },
  'list-intents': async () => {
    const { req, qs, cursor, limit } = setup()
    setJsonOutput('result', await req('GET', `/intents${qs({ cursor, limit })}`))
  },

  // ── Yield (ERC-4626) ───────────────────────────────────────────
  'get-vault': async () => {
    const { req, vaultId } = setup()
    if (!vaultId) throw new Error('vault-id required')
    setJsonOutput('result', await req('GET', `/ethereum_yield_vault/${vaultId}`))
  },
  'get-vault-position': async () => {
    const { req, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('GET', `/wallets/${walletId}/ethereum_yield_vault`))
  },
  'deposit-vault': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/ethereum_yield_deposit`, pb()))
  },
  'withdraw-vault': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/ethereum_yield_withdraw`, pb()))
  },
  'claim-yield': async () => {
    const { req, pb, walletId } = setup()
    if (!walletId) throw new Error('wallet-id required')
    setJsonOutput('result', await req('POST', `/wallets/${walletId}/ethereum_yield_claim`, pb()))
  },
  'get-claim': async () => {
    const { req, claimId } = setup()
    if (!claimId) throw new Error('claim-id required')
    setJsonOutput('result', await req('GET', `/ethereum_yield_claim/${claimId}`))
  },
  'get-sweep': async () => {
    const { req, sweepId } = setup()
    if (!sweepId) throw new Error('sweep-id required')
    setJsonOutput('result', await req('GET', `/ethereum_yield_sweep/${sweepId}`))
  },

  // ── Fiat / KYC ─────────────────────────────────────────────────
  'start-kyc': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/kyc`, pb()))
  },
  'get-kyc-status': async () => {
    const { req, qs, userId, provider } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('GET', `/users/${userId}/fiat/kyc${qs({ provider })}`))
  },
  'update-kyc': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('PATCH', `/users/${userId}/fiat/kyc`, pb()))
  },
  'get-kyc-link': async () => {
    const { req, pb, userId, body } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/kyc_link`, body ? pb() : {}))
  },
  'create-fiat-tos': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/tos`, pb()))
  },
  'create-fiat-account': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/accounts`, pb()))
  },
  'list-fiat-accounts': async () => {
    const { req, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('GET', `/users/${userId}/fiat/accounts`))
  },
  'initiate-onramp': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/onramp`, pb()))
  },
  'initiate-offramp': async () => {
    const { req, pb, userId } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/offramp`, pb()))
  },
  'list-fiat-transactions': async () => {
    const { req, pb, userId, body } = setup()
    if (!userId) throw new Error('user-id required')
    setJsonOutput('result', await req('POST', `/users/${userId}/fiat/status`, body ? pb() : {}))
  },

  // ── Condition Sets ─────────────────────────────────────────────
  'create-condition-set': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/condition_sets', pb()))
  },
  'get-condition-set': async () => {
    const { req, conditionSetId } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('GET', `/condition_sets/${conditionSetId}`))
  },
  'update-condition-set': async () => {
    const { req, pb, conditionSetId } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('PATCH', `/condition_sets/${conditionSetId}`, pb()))
  },
  'delete-condition-set': async () => {
    const { req, conditionSetId } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('DELETE', `/condition_sets/${conditionSetId}`))
  },
  'add-condition-set-items': async () => {
    const { req, pb, conditionSetId } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('POST', `/condition_sets/${conditionSetId}/condition_set_items`, pb()))
  },
  'replace-condition-set-items': async () => {
    const { req, pb, conditionSetId } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('PUT', `/condition_sets/${conditionSetId}/condition_set_items`, pb()))
  },
  'list-condition-set-items': async () => {
    const { req, qs, conditionSetId, cursor, limit } = setup()
    if (!conditionSetId) throw new Error('condition-set-id required')
    setJsonOutput('result', await req('GET', `/condition_sets/${conditionSetId}/condition_set_items${qs({ cursor, limit })}`))
  },
  'get-condition-set-item': async () => {
    const { req, conditionSetId, itemId } = setup()
    if (!conditionSetId || !itemId) throw new Error('condition-set-id and item-id required')
    setJsonOutput('result', await req('GET', `/condition_sets/${conditionSetId}/condition_set_items/${itemId}`))
  },
  'delete-condition-set-item': async () => {
    const { req, conditionSetId, itemId } = setup()
    if (!conditionSetId || !itemId) throw new Error('condition-set-id and item-id required')
    setJsonOutput('result', await req('DELETE', `/condition_sets/${conditionSetId}/condition_set_items/${itemId}`))
  },

  // ── Allowlist ──────────────────────────────────────────────────
  'add-allowlist-entry': async () => {
    const { req, pb, appId } = setup()
    setJsonOutput('result', await req('POST', `/apps/${appId}/allowlist`, pb()))
  },
  'list-allowlist': async () => {
    const { req, appId } = setup()
    setJsonOutput('result', await req('GET', `/apps/${appId}/allowlist`))
  },
  'delete-allowlist-entry': async () => {
    const { req, appId, entryId } = setup()
    if (!entryId) throw new Error('entry-id required')
    setJsonOutput('result', await req('DELETE', `/apps/${appId}/allowlist/${entryId}`))
  },

  // ── Aggregations ───────────────────────────────────────────────
  'create-aggregation': async () => {
    const { req, pb } = setup()
    setJsonOutput('result', await req('POST', '/aggregations', pb()))
  },
  'get-aggregation': async () => {
    const { req, aggregationId } = setup()
    if (!aggregationId) throw new Error('aggregation-id required')
    setJsonOutput('result', await req('GET', `/aggregations/${aggregationId}`))
  },
  'delete-aggregation': async () => {
    const { req, aggregationId } = setup()
    if (!aggregationId) throw new Error('aggregation-id required')
    setJsonOutput('result', await req('DELETE', `/aggregations/${aggregationId}`))
  },
})

/**
 * Read all common inputs and build helpers once per command invocation.
 */
function setup() {
  const appId = core.getInput('app-id', { required: true })
  const appSecret = core.getInput('app-secret', { required: true })
  const apiUrl = core.getInput('api-url') || 'https://api.privy.io/v1'

  const userId = core.getInput('user-id') || ''
  const walletId = core.getInput('wallet-id') || ''
  const policyId = core.getInput('policy-id') || ''
  const ruleId = core.getInput('rule-id') || ''
  const quorumId = core.getInput('quorum-id') || ''
  const intentId = core.getInput('intent-id') || ''
  const transactionId = core.getInput('transaction-id') || ''
  const vaultId = core.getInput('vault-id') || ''
  const actionId = core.getInput('action-id') || ''
  const conditionSetId = core.getInput('condition-set-id') || ''
  const itemId = core.getInput('item-id') || ''
  const aggregationId = core.getInput('aggregation-id') || ''
  const entryId = core.getInput('entry-id') || ''
  const claimId = core.getInput('claim-id') || ''
  const sweepId = core.getInput('sweep-id') || ''
  const body = core.getInput('body') || ''
  const cursor = core.getInput('cursor') || ''
  const limit = core.getInput('limit') || ''
  const chainType = core.getInput('chain-type') || ''
  const chain = core.getInput('chain') || ''
  const asset = core.getInput('asset') || ''
  const token = core.getInput('token') || ''
  const address = core.getInput('address') || ''
  const email = core.getInput('email') || ''
  const phone = core.getInput('phone') || ''
  const idempotencyKey = core.getInput('idempotency-key') || ''
  const caip2 = core.getInput('caip2') || ''
  const provider = core.getInput('provider') || ''

  const headers = {
    Authorization: 'Basic ' + Buffer.from(`${appId}:${appSecret}`).toString('base64'),
    'privy-app-id': appId,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (idempotencyKey) headers['privy-idempotency-key'] = idempotencyKey

  async function req(method, path, bodyObj) {
    const url = `${apiUrl}${path}`
    const opts = { method, headers: { ...headers } }
    if (bodyObj && method !== 'GET' && method !== 'DELETE') {
      opts.body = JSON.stringify(bodyObj)
    }
    const res = await fetch(url, opts)
    if (res.status === 204) return { success: true }
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) {
      const msg = typeof data === 'object' ? JSON.stringify(data) : data
      throw new Error(`${method} ${path} returned ${res.status}: ${msg}`)
    }
    return data
  }

  function qs(p) {
    const e = Object.entries(p).filter(([, v]) => v !== '')
    return e.length ? '?' + e.map(([k, v]) => `${k}=${v}`).join('&') : ''
  }

  function pb() {
    if (!body) throw new Error('body input is required')
    return JSON.parse(body)
  }

  return {
    req, qs, pb, appId, userId, walletId, policyId, ruleId, quorumId,
    intentId, transactionId, vaultId, actionId, conditionSetId, itemId,
    aggregationId, entryId, claimId, sweepId, body, cursor, limit,
    chainType, chain, asset, token, address, email, phone, caip2, provider,
  }
}

router()
