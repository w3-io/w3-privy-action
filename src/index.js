const core = require("@actions/core");

async function run() {
  try {
    const command = core.getInput("command", { required: true }).toLowerCase();
    const appId = core.getInput("app-id", { required: true });
    const appSecret = core.getInput("app-secret", { required: true });
    const apiUrl = core.getInput("api-url") || "https://api.privy.io/v1";

    // Common inputs
    const userId = core.getInput("user-id") || "";
    const walletId = core.getInput("wallet-id") || "";
    const policyId = core.getInput("policy-id") || "";
    const ruleId = core.getInput("rule-id") || "";
    const quorumId = core.getInput("quorum-id") || "";
    const intentId = core.getInput("intent-id") || "";
    const transactionId = core.getInput("transaction-id") || "";
    const vaultId = core.getInput("vault-id") || "";
    const actionId = core.getInput("action-id") || "";
    const conditionSetId = core.getInput("condition-set-id") || "";
    const itemId = core.getInput("item-id") || "";
    const aggregationId = core.getInput("aggregation-id") || "";
    const entryId = core.getInput("entry-id") || "";
    const claimId = core.getInput("claim-id") || "";
    const sweepId = core.getInput("sweep-id") || "";
    const body = core.getInput("body") || "";
    const cursor = core.getInput("cursor") || "";
    const limit = core.getInput("limit") || "";
    const chainType = core.getInput("chain-type") || "";
    const chain = core.getInput("chain") || "";
    const asset = core.getInput("asset") || "";
    const token = core.getInput("token") || "";
    const address = core.getInput("address") || "";
    const email = core.getInput("email") || "";
    const phone = core.getInput("phone") || "";
    const idempotencyKey = core.getInput("idempotency-key") || "";
    const caip2 = core.getInput("caip2") || "";
    const provider = core.getInput("provider") || "";

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${appId}:${appSecret}`).toString("base64"),
      "privy-app-id": appId,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (idempotencyKey) headers["privy-idempotency-key"] = idempotencyKey;

    async function req(method, path, bodyObj) {
      const url = `${apiUrl}${path}`;
      const opts = { method, headers: { ...headers } };
      if (bodyObj && method !== "GET" && method !== "DELETE") {
        opts.body = JSON.stringify(bodyObj);
      }
      const res = await fetch(url, opts);
      if (res.status === 204) return { success: true };
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        const msg = typeof data === "object" ? JSON.stringify(data) : data;
        throw new Error(`${method} ${path} returned ${res.status}: ${msg.slice(0, 200)}`);
      }
      return data;
    }

    function qs(p) {
      const e = Object.entries(p).filter(([, v]) => v !== "");
      return e.length ? "?" + e.map(([k, v]) => `${k}=${v}`).join("&") : "";
    }

    function pb() {
      if (!body) throw new Error("body input is required");
      return JSON.parse(body);
    }

    let result;

    switch (command) {
      // ── Users ──────────────────────────────────────────────────────
      case "create-user": result = await req("POST", "/users", pb()); break;
      case "get-user":
        if (!userId) throw new Error("user-id required");
        result = await req("GET", `/users/${userId}`); break;
      case "list-users": result = await req("GET", `/users${qs({ cursor, limit })}`); break;
      case "delete-user":
        if (!userId) throw new Error("user-id required");
        result = await req("DELETE", `/users/${userId}`); break;
      case "search-users": result = await req("POST", "/users/search", pb()); break;
      case "set-user-metadata":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/custom_metadata`, pb()); break;
      case "link-account":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/accounts`, pb()); break;
      case "unlink-account":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/accounts/unlink`, pb()); break;
      case "pregenerate-wallets":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/wallets`,
          body ? pb() : { wallets: [{ chain_type: chainType || "ethereum" }] }); break;

      // ── User Lookups ───────────────────────────────────────────────
      case "get-user-by-email":
        result = await req("POST", "/users/email/address", { address: email || pb().address }); break;
      case "get-user-by-phone":
        result = await req("POST", "/users/phone/number", { number: phone || pb().number }); break;
      case "get-user-by-wallet":
        result = await req("POST", "/users/wallet/address", { address: address || pb().address }); break;
      case "get-user-by-smart-wallet":
        result = await req("POST", "/users/smart_wallet/address", pb()); break;
      case "get-user-by-discord":
        result = await req("POST", "/users/discord/username", pb()); break;
      case "get-user-by-telegram-id":
        result = await req("POST", "/users/telegram/telegram_user_id", pb()); break;
      case "get-user-by-telegram-username":
        result = await req("POST", "/users/telegram/username", pb()); break;
      case "get-user-by-farcaster":
        result = await req("POST", "/users/farcaster/fid", pb()); break;
      case "get-user-by-instagram":
        result = await req("POST", "/users/instagram/username", pb()); break;
      case "get-user-by-twitter":
        result = await req("POST", "/users/twitter/username", pb()); break;
      case "get-user-by-twitter-id":
        result = await req("POST", "/users/twitter/subject", pb()); break;
      case "get-user-by-github":
        result = await req("POST", "/users/github/username", pb()); break;
      case "get-user-by-twitch":
        result = await req("POST", "/users/twitch/username", pb()); break;
      case "get-user-by-spotify":
        result = await req("POST", "/users/spotify/subject", pb()); break;
      case "get-user-by-custom-auth":
        result = await req("POST", "/users/custom_auth/id", pb()); break;

      // ── Wallets ────────────────────────────────────────────────────
      case "create-wallet":
        result = await req("POST", "/wallets", body ? pb() : { chain_type: chainType || "ethereum" }); break;
      case "batch-create-wallets": result = await req("POST", "/wallets/batch", pb()); break;
      case "create-custodial-wallet": result = await req("POST", "/custodial_wallets", pb()); break;
      case "get-wallet":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("GET", `/wallets/${walletId}`); break;
      case "list-wallets":
        result = await req("GET", `/wallets${qs({ cursor, limit, chain_type: chainType, user_id: userId })}`); break;
      case "get-wallet-by-address":
        result = await req("POST", "/wallets/address", { address: address || pb().address }); break;
      case "update-wallet":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("PATCH", `/wallets/${walletId}`, pb()); break;
      case "get-wallet-balance":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("GET", `/wallets/${walletId}/balance${qs({ chain, asset, token })}`); break;
      case "export-wallet":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/export`, pb()); break;
      case "authenticate-wallet":
        result = await req("POST", "/wallets/authenticate", pb()); break;
      case "get-wallet-action":
        if (!walletId || !actionId) throw new Error("wallet-id and action-id required");
        result = await req("GET", `/wallets/${walletId}/actions/${actionId}`); break;
      case "get-wallet-transactions":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("GET", `/wallets/${walletId}/transactions${qs({ cursor, limit, chain })}`); break;
      case "transfer":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/transfer`, pb()); break;
      case "swap":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/swap`, pb()); break;
      case "get-swap-quote":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/swap/quote`, pb()); break;

      // ── Signing — Ethereum ─────────────────────────────────────────
      case "eth-send-transaction": {
        if (!walletId) throw new Error("wallet-id required");
        const p = pb(); if (caip2) p.caip2 = caip2;
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "eth_sendTransaction", params: p }); break;
      }
      case "eth-sign-transaction": {
        if (!walletId) throw new Error("wallet-id required");
        const p = pb(); if (caip2) p.caip2 = caip2;
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "eth_signTransaction", params: p }); break;
      }
      case "personal-sign":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "personal_sign", params: pb() }); break;
      case "eth-sign-typed-data":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "eth_signTypedData_v4", params: pb() }); break;
      case "eth-sign-7702":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "eth_sign7702Authorization", params: pb() }); break;
      case "eth-sign-user-operation": {
        if (!walletId) throw new Error("wallet-id required");
        const p = pb(); if (caip2) p.caip2 = caip2;
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "eth_signUserOperation", params: p }); break;
      }

      // ── Signing — Solana ───────────────────────────────────────────
      case "solana-send-transaction": {
        if (!walletId) throw new Error("wallet-id required");
        const p = pb(); if (caip2) p.caip2 = caip2;
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "signAndSendTransaction", params: p }); break;
      }
      case "solana-sign-transaction":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "signTransaction", params: pb() }); break;
      case "solana-sign-message":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "signMessage", params: pb() }); break;

      // ── Signing — Bitcoin / Spark ──────────────────────────────────
      case "bitcoin-sign-psbt":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "signPsbt", params: pb() }); break;
      case "spark-transfer":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "transfer", params: pb() }); break;
      case "spark-transfer-tokens":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/rpc`, { method: "transferTokens", params: pb() }); break;

      // ── Signing — Raw ──────────────────────────────────────────────
      case "raw-sign":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/raw_sign`, pb()); break;

      // ── Transactions ───────────────────────────────────────────────
      case "get-transaction":
        if (!transactionId) throw new Error("transaction-id required");
        result = await req("GET", `/transactions/${transactionId}`); break;

      // ── Policies ───────────────────────────────────────────────────
      case "create-policy": result = await req("POST", "/policies", pb()); break;
      case "get-policy":
        if (!policyId) throw new Error("policy-id required");
        result = await req("GET", `/policies/${policyId}`); break;
      case "update-policy":
        if (!policyId) throw new Error("policy-id required");
        result = await req("PATCH", `/policies/${policyId}`, pb()); break;
      case "delete-policy":
        if (!policyId) throw new Error("policy-id required");
        result = await req("DELETE", `/policies/${policyId}`); break;
      case "create-rule":
        if (!policyId) throw new Error("policy-id required");
        result = await req("POST", `/policies/${policyId}/rules`, pb()); break;
      case "get-rule":
        if (!policyId || !ruleId) throw new Error("policy-id and rule-id required");
        result = await req("GET", `/policies/${policyId}/rules/${ruleId}`); break;
      case "update-rule":
        if (!policyId || !ruleId) throw new Error("policy-id and rule-id required");
        result = await req("PATCH", `/policies/${policyId}/rules/${ruleId}`, pb()); break;
      case "delete-rule":
        if (!policyId || !ruleId) throw new Error("policy-id and rule-id required");
        result = await req("DELETE", `/policies/${policyId}/rules/${ruleId}`); break;

      // ── Key Quorums ────────────────────────────────────────────────
      case "create-quorum": result = await req("POST", "/key_quorums", pb()); break;
      case "get-quorum":
        if (!quorumId) throw new Error("quorum-id required");
        result = await req("GET", `/key_quorums/${quorumId}`); break;
      case "update-quorum":
        if (!quorumId) throw new Error("quorum-id required");
        result = await req("PATCH", `/key_quorums/${quorumId}`, pb()); break;
      case "delete-quorum":
        if (!quorumId) throw new Error("quorum-id required");
        result = await req("DELETE", `/key_quorums/${quorumId}`); break;

      // ── Intents ────────────────────────────────────────────────────
      case "create-rpc-intent":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/intents/wallets/${walletId}/rpc`, pb()); break;
      case "create-wallet-update-intent":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("PATCH", `/intents/wallets/${walletId}`, pb()); break;
      case "create-policy-update-intent":
        if (!policyId) throw new Error("policy-id required");
        result = await req("PATCH", `/intents/policies/${policyId}`, pb()); break;
      case "create-rule-intent":
        if (!policyId) throw new Error("policy-id required");
        result = await req("POST", `/intents/policies/${policyId}/rules`, pb()); break;
      case "update-rule-intent":
        if (!policyId || !ruleId) throw new Error("policy-id and rule-id required");
        result = await req("PATCH", `/intents/policies/${policyId}/rules/${ruleId}`, pb()); break;
      case "delete-rule-intent":
        if (!policyId || !ruleId) throw new Error("policy-id and rule-id required");
        result = await req("DELETE", `/intents/policies/${policyId}/rules/${ruleId}`); break;
      case "create-quorum-update-intent":
        if (!quorumId) throw new Error("quorum-id required");
        result = await req("PATCH", `/intents/key_quorums/${quorumId}`, pb()); break;
      case "get-intent":
        if (!intentId) throw new Error("intent-id required");
        result = await req("GET", `/intents/${intentId}`); break;
      case "list-intents": result = await req("GET", `/intents${qs({ cursor, limit })}`); break;

      // ── Yield (ERC-4626) ───────────────────────────────────────────
      case "get-vault":
        if (!vaultId) throw new Error("vault-id required");
        result = await req("GET", `/ethereum_yield_vault/${vaultId}`); break;
      case "get-vault-position":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("GET", `/wallets/${walletId}/ethereum_yield_vault`); break;
      case "deposit-vault":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/ethereum_yield_deposit`, pb()); break;
      case "withdraw-vault":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/ethereum_yield_withdraw`, pb()); break;
      case "claim-yield":
        if (!walletId) throw new Error("wallet-id required");
        result = await req("POST", `/wallets/${walletId}/ethereum_yield_claim`, pb()); break;
      case "get-claim":
        if (!claimId) throw new Error("claim-id required");
        result = await req("GET", `/ethereum_yield_claim/${claimId}`); break;
      case "get-sweep":
        if (!sweepId) throw new Error("sweep-id required");
        result = await req("GET", `/ethereum_yield_sweep/${sweepId}`); break;

      // ── Fiat / KYC ─────────────────────────────────────────────────
      case "start-kyc":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/kyc`, pb()); break;
      case "get-kyc-status":
        if (!userId) throw new Error("user-id required");
        result = await req("GET", `/users/${userId}/fiat/kyc${qs({ provider })}`); break;
      case "update-kyc":
        if (!userId) throw new Error("user-id required");
        result = await req("PATCH", `/users/${userId}/fiat/kyc`, pb()); break;
      case "get-kyc-link":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/kyc_link`, body ? pb() : {}); break;
      case "create-fiat-tos":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/tos`, pb()); break;
      case "create-fiat-account":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/accounts`, pb()); break;
      case "list-fiat-accounts":
        if (!userId) throw new Error("user-id required");
        result = await req("GET", `/users/${userId}/fiat/accounts`); break;
      case "initiate-onramp":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/onramp`, pb()); break;
      case "initiate-offramp":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/offramp`, pb()); break;
      case "list-fiat-transactions":
        if (!userId) throw new Error("user-id required");
        result = await req("POST", `/users/${userId}/fiat/status`, body ? pb() : {}); break;

      // ── Condition Sets ─────────────────────────────────────────────
      case "create-condition-set": result = await req("POST", "/condition_sets", pb()); break;
      case "get-condition-set":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("GET", `/condition_sets/${conditionSetId}`); break;
      case "update-condition-set":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("PATCH", `/condition_sets/${conditionSetId}`, pb()); break;
      case "delete-condition-set":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("DELETE", `/condition_sets/${conditionSetId}`); break;
      case "add-condition-set-items":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("POST", `/condition_sets/${conditionSetId}/condition_set_items`, pb()); break;
      case "replace-condition-set-items":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("PUT", `/condition_sets/${conditionSetId}/condition_set_items`, pb()); break;
      case "list-condition-set-items":
        if (!conditionSetId) throw new Error("condition-set-id required");
        result = await req("GET", `/condition_sets/${conditionSetId}/condition_set_items${qs({ cursor, limit })}`); break;
      case "get-condition-set-item":
        if (!conditionSetId || !itemId) throw new Error("condition-set-id and item-id required");
        result = await req("GET", `/condition_sets/${conditionSetId}/condition_set_items/${itemId}`); break;
      case "delete-condition-set-item":
        if (!conditionSetId || !itemId) throw new Error("condition-set-id and item-id required");
        result = await req("DELETE", `/condition_sets/${conditionSetId}/condition_set_items/${itemId}`); break;

      // ── Allowlist ──────────────────────────────────────────────────
      case "add-allowlist-entry":
        result = await req("POST", `/apps/${appId}/allowlist`, pb()); break;
      case "list-allowlist":
        result = await req("GET", `/apps/${appId}/allowlist`); break;
      case "delete-allowlist-entry":
        if (!entryId) throw new Error("entry-id required");
        result = await req("DELETE", `/apps/${appId}/allowlist/${entryId}`); break;

      // ── Aggregations ───────────────────────────────────────────────
      case "create-aggregation": result = await req("POST", "/aggregations", pb()); break;
      case "get-aggregation":
        if (!aggregationId) throw new Error("aggregation-id required");
        result = await req("GET", `/aggregations/${aggregationId}`); break;
      case "delete-aggregation":
        if (!aggregationId) throw new Error("aggregation-id required");
        result = await req("DELETE", `/aggregations/${aggregationId}`); break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    core.setOutput("result", JSON.stringify(result));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
