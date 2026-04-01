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
    const body = core.getInput("body") || "";
    const cursor = core.getInput("cursor") || "";
    const limit = core.getInput("limit") || "";
    const chainType = core.getInput("chain-type") || "";
    const address = core.getInput("address") || "";
    const email = core.getInput("email") || "";
    const phone = core.getInput("phone") || "";
    const idempotencyKey = core.getInput("idempotency-key") || "";

    // RPC inputs
    const method = core.getInput("method") || "";
    const caip2 = core.getInput("caip2") || "";

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${appId}:${appSecret}`).toString("base64"),
      "privy-app-id": appId,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (idempotencyKey) headers["privy-idempotency-key"] = idempotencyKey;

    async function request(httpMethod, path, bodyObj) {
      const url = `${apiUrl}${path}`;
      const opts = { method: httpMethod, headers: { ...headers } };
      if (
        bodyObj &&
        (httpMethod === "POST" || httpMethod === "PUT" || httpMethod === "PATCH")
      ) {
        opts.body = JSON.stringify(bodyObj);
      }
      const res = await fetch(url, opts);
      if (res.status === 204) return { success: true };
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      if (!res.ok) {
        const msg = typeof data === "object" ? JSON.stringify(data) : data;
        throw new Error(`${httpMethod} ${path} returned ${res.status}: ${msg}`);
      }
      return data;
    }

    function qs(params) {
      const entries = Object.entries(params).filter(([, v]) => v !== "");
      return entries.length
        ? "?" + entries.map(([k, v]) => `${k}=${v}`).join("&")
        : "";
    }

    function parseBody() {
      if (!body) throw new Error("body input is required for this command");
      return JSON.parse(body);
    }

    let result;

    switch (command) {
      // =================================================================
      // USERS
      // =================================================================

      case "create-user":
        result = await request("POST", "/users", parseBody());
        break;

      case "get-user":
        if (!userId) throw new Error("user-id is required");
        result = await request("GET", `/users/${userId}`);
        break;

      case "list-users":
        result = await request("GET", `/users${qs({ cursor, limit })}`);
        break;

      case "delete-user":
        if (!userId) throw new Error("user-id is required");
        result = await request("DELETE", `/users/${userId}`);
        break;

      case "get-user-by-email":
        if (!email) throw new Error("email is required");
        result = await request("GET", `/users/email/${encodeURIComponent(email)}`);
        break;

      case "get-user-by-phone":
        if (!phone) throw new Error("phone is required");
        result = await request("GET", `/users/phone/${encodeURIComponent(phone)}`);
        break;

      case "get-user-by-wallet":
        if (!address) throw new Error("address is required");
        result = await request("POST", "/users/wallet/address", { address });
        break;

      case "get-user-by-discord":
        result = await request("POST", "/users/discord/username", parseBody());
        break;

      case "get-user-by-telegram-id":
        result = await request(
          "POST",
          "/users/telegram/telegram_user_id",
          parseBody(),
        );
        break;

      case "get-user-by-telegram-username":
        result = await request("POST", "/users/telegram/username", parseBody());
        break;

      case "get-user-by-farcaster":
        result = await request("POST", "/users/farcaster/fid", parseBody());
        break;

      case "get-user-by-instagram":
        result = await request(
          "POST",
          "/users/instagram/username",
          parseBody(),
        );
        break;

      case "set-user-metadata":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/custom-metadata`,
          parseBody(),
        );
        break;

      case "pregenerate-wallets":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/wallets`,
          body ? parseBody() : { wallets: [{ chain_type: chainType || "ethereum" }] },
        );
        break;

      // =================================================================
      // WALLETS
      // =================================================================

      case "create-wallet":
        result = await request(
          "POST",
          "/wallets",
          body ? parseBody() : { chain_type: chainType || "ethereum" },
        );
        break;

      case "batch-create-wallets":
        result = await request("POST", "/wallets/batch", parseBody());
        break;

      case "get-wallet":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("GET", `/wallets/${walletId}`);
        break;

      case "list-wallets":
        result = await request(
          "GET",
          `/wallets${qs({ cursor, limit, chain_type: chainType, user_id: userId })}`,
        );
        break;

      case "get-wallet-by-address":
        if (!address) throw new Error("address is required");
        result = await request(
          "GET",
          `/wallets${qs({ address })}`,
        );
        break;

      case "get-wallet-balance":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "GET",
          `/wallets/${walletId}/balance${qs({
            chain: core.getInput("chain") || "",
            token: core.getInput("token") || "",
            asset: core.getInput("asset") || "",
          })}`,
        );
        break;

      case "export-wallet":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "POST",
          `/wallets/${walletId}/export`,
          parseBody(),
        );
        break;

      case "create-custodial-wallet":
        result = await request("POST", "/custodial_wallets", parseBody());
        break;

      case "authenticate-wallet":
        result = await request("POST", "/wallets/authenticate", parseBody());
        break;

      case "create-wallet-update-intent":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "PATCH",
          `/intents/wallets/${walletId}`,
          parseBody(),
        );
        break;

      case "list-wallet-transactions":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "GET",
          `/wallets/${walletId}/transactions${qs({ cursor, limit })}`,
        );
        break;

      case "transfer":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "POST",
          `/wallets/${walletId}/transfer`,
          parseBody(),
        );
        break;

      case "swap":
        if (!walletId) throw new Error("wallet-id is required");
        result = await request(
          "POST",
          `/wallets/${walletId}/swap`,
          parseBody(),
        );
        break;

      case "get-swap-quote":
        result = await request(
          "GET",
          `/swap/quote${qs({
            wallet_id: walletId,
            from_token: core.getInput("from-token") || "",
            to_token: core.getInput("to-token") || "",
            amount: core.getInput("amount") || "",
            chain: core.getInput("chain") || "",
          })}`,
        );
        break;

      // =================================================================
      // WALLET RPC — Signing and Transactions
      // =================================================================

      case "eth-send-transaction": {
        if (!walletId) throw new Error("wallet-id is required");
        const rpcBody = { method: "eth_sendTransaction", params: parseBody() };
        if (caip2) rpcBody.params.caip2 = caip2;
        result = await request("POST", `/wallets/${walletId}/rpc`, rpcBody);
        break;
      }

      case "eth-sign-transaction": {
        if (!walletId) throw new Error("wallet-id is required");
        const rpcBody = { method: "eth_signTransaction", params: parseBody() };
        if (caip2) rpcBody.params.caip2 = caip2;
        result = await request("POST", `/wallets/${walletId}/rpc`, rpcBody);
        break;
      }

      case "personal-sign": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "personal_sign",
          params: parseBody(),
        });
        break;
      }

      case "eth-sign-typed-data": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "eth_signTypedData_v4",
          params: parseBody(),
        });
        break;
      }

      case "solana-send-transaction": {
        if (!walletId) throw new Error("wallet-id is required");
        const rpcBody = {
          method: "signAndSendTransaction",
          params: parseBody(),
        };
        if (caip2) rpcBody.params.caip2 = caip2;
        result = await request("POST", `/wallets/${walletId}/rpc`, rpcBody);
        break;
      }

      case "solana-sign-transaction": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "signTransaction",
          params: parseBody(),
        });
        break;
      }

      case "solana-sign-message": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "signMessage",
          params: parseBody(),
        });
        break;
      }

      case "raw-sign": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "secp256k1_sign",
          params: parseBody(),
        });
        break;
      }

      case "eth-sign-7702": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "eth_sign7702Authorization",
          params: parseBody(),
        });
        break;
      }

      case "eth-sign-user-operation": {
        if (!walletId) throw new Error("wallet-id is required");
        const rpcBody = {
          method: "eth_signUserOperation",
          params: parseBody(),
        };
        if (caip2) rpcBody.params.caip2 = caip2;
        result = await request("POST", `/wallets/${walletId}/rpc`, rpcBody);
        break;
      }

      case "bitcoin-sign-psbt": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "signPsbt",
          params: parseBody(),
        });
        break;
      }

      case "spark-transfer": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "transfer",
          params: parseBody(),
        });
        break;
      }

      case "spark-transfer-tokens": {
        if (!walletId) throw new Error("wallet-id is required");
        result = await request("POST", `/wallets/${walletId}/rpc`, {
          method: "transferTokens",
          params: parseBody(),
        });
        break;
      }

      // =================================================================
      // TRANSACTIONS
      // =================================================================

      case "get-transaction":
        if (!transactionId) throw new Error("transaction-id is required");
        result = await request("GET", `/transactions/${transactionId}`);
        break;

      // =================================================================
      // POLICIES
      // =================================================================

      case "create-policy":
        result = await request("POST", "/policies", parseBody());
        break;

      case "get-policy":
        if (!policyId) throw new Error("policy-id is required");
        result = await request("GET", `/policies/${policyId}`);
        break;

      case "update-policy":
        if (!policyId) throw new Error("policy-id is required");
        result = await request("PATCH", `/policies/${policyId}`, parseBody());
        break;

      case "delete-policy":
        if (!policyId) throw new Error("policy-id is required");
        result = await request("DELETE", `/policies/${policyId}`);
        break;

      case "create-rule":
        if (!policyId) throw new Error("policy-id is required");
        result = await request(
          "POST",
          `/policies/${policyId}/rules`,
          parseBody(),
        );
        break;

      case "update-rule":
        if (!policyId) throw new Error("policy-id is required");
        if (!ruleId) throw new Error("rule-id is required");
        result = await request(
          "PATCH",
          `/policies/${policyId}/rules/${ruleId}`,
          parseBody(),
        );
        break;

      case "delete-rule":
        if (!policyId) throw new Error("policy-id is required");
        if (!ruleId) throw new Error("rule-id is required");
        result = await request(
          "DELETE",
          `/policies/${policyId}/rules/${ruleId}`,
        );
        break;

      // =================================================================
      // KEY QUORUMS
      // =================================================================

      case "create-quorum":
        result = await request("POST", "/key_quorums", parseBody());
        break;

      case "get-quorum":
        if (!quorumId) throw new Error("quorum-id is required");
        result = await request("GET", `/key_quorums/${quorumId}`);
        break;

      case "update-quorum":
        if (!quorumId) throw new Error("quorum-id is required");
        result = await request(
          "PATCH",
          `/key_quorums/${quorumId}`,
          parseBody(),
        );
        break;

      case "delete-quorum":
        if (!quorumId) throw new Error("quorum-id is required");
        result = await request("DELETE", `/key_quorums/${quorumId}`);
        break;

      // =================================================================
      // INTENTS
      // =================================================================

      case "create-rpc-intent":
        result = await request("POST", "/intents/rpc", parseBody());
        break;

      case "get-intent":
        if (!intentId) throw new Error("intent-id is required");
        result = await request("GET", `/intents/${intentId}`);
        break;

      case "list-intents":
        result = await request("GET", `/intents${qs({ cursor, limit })}`);
        break;

      // =================================================================
      // YIELD (ERC-4626 Vaults)
      // =================================================================

      case "get-vault":
        if (!vaultId) throw new Error("vault-id is required");
        result = await request(
          "GET",
          `/ethereum_yield/vaults/${vaultId}`,
        );
        break;

      case "get-vault-position":
        if (!walletId) throw new Error("wallet-id is required");
        if (!vaultId) throw new Error("vault-id is required");
        result = await request(
          "GET",
          `/ethereum_yield/positions/${walletId}/${vaultId}`,
        );
        break;

      case "deposit-vault":
        result = await request("POST", "/ethereum_yield/deposit", parseBody());
        break;

      case "withdraw-vault":
        result = await request(
          "POST",
          "/ethereum_yield/withdraw",
          parseBody(),
        );
        break;

      case "claim-yield":
        result = await request("POST", "/ethereum_yield/claim", parseBody());
        break;

      // =================================================================
      // FIAT / KYC
      // =================================================================

      case "start-kyc":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/fiat/kyc`,
          parseBody(),
        );
        break;

      case "get-kyc-status":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "GET",
          `/users/${userId}/fiat/kyc${qs({ provider: core.getInput("provider") || "" })}`,
        );
        break;

      case "create-fiat-account":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/fiat/accounts`,
          parseBody(),
        );
        break;

      case "list-fiat-accounts":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "GET",
          `/users/${userId}/fiat/accounts`,
        );
        break;

      case "initiate-onramp":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/fiat/onramp`,
          parseBody(),
        );
        break;

      case "initiate-offramp":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/fiat/offramp`,
          parseBody(),
        );
        break;

      case "update-kyc":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "PATCH",
          `/users/${userId}/fiat/kyc`,
          parseBody(),
        );
        break;

      case "create-fiat-tos":
        if (!userId) throw new Error("user-id is required");
        result = await request(
          "POST",
          `/users/${userId}/fiat/tos`,
          parseBody(),
        );
        break;

      case "list-fiat-transactions":
        result = await request(
          "GET",
          `/fiat/transactions${qs({ cursor, limit })}`,
        );
        break;

      // =================================================================
      // CONDITION SETS
      // =================================================================

      case "create-condition-set":
        result = await request("POST", "/condition-sets", parseBody());
        break;

      case "get-condition-set":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "GET",
          `/condition-sets/${core.getInput("condition-set-id")}`,
        );
        break;

      case "update-condition-set":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "PATCH",
          `/condition-sets/${core.getInput("condition-set-id")}`,
          parseBody(),
        );
        break;

      case "delete-condition-set":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "DELETE",
          `/condition-sets/${core.getInput("condition-set-id")}`,
        );
        break;

      // =================================================================
      // CONDITION SET ITEMS
      // =================================================================

      case "add-condition-set-items":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "POST",
          `/condition-sets/${core.getInput("condition-set-id")}/items`,
          parseBody(),
        );
        break;

      case "list-condition-set-items":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "GET",
          `/condition-sets/${core.getInput("condition-set-id")}/items${qs({ cursor, limit })}`,
        );
        break;

      case "replace-condition-set-items":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        result = await request(
          "PATCH",
          `/condition-sets/${core.getInput("condition-set-id")}/items`,
          parseBody(),
        );
        break;

      case "delete-condition-set-item":
        if (!core.getInput("condition-set-id"))
          throw new Error("condition-set-id is required");
        if (!core.getInput("item-id"))
          throw new Error("item-id is required");
        result = await request(
          "DELETE",
          `/condition-sets/${core.getInput("condition-set-id")}/items/${core.getInput("item-id")}`,
        );
        break;

      // =================================================================
      // ALLOWLIST
      // =================================================================

      case "add-allowlist-entry":
        result = await request(
          "POST",
          `/apps/${appId}/allowlist`,
          parseBody(),
        );
        break;

      case "list-allowlist":
        result = await request("GET", `/apps/${appId}/allowlist`);
        break;

      case "delete-allowlist-entry":
        if (!core.getInput("entry-id"))
          throw new Error("entry-id is required");
        result = await request(
          "DELETE",
          `/apps/${appId}/allowlist/${core.getInput("entry-id")}`,
        );
        break;

      // =================================================================
      // AGGREGATIONS
      // =================================================================

      case "create-aggregation":
        result = await request("POST", "/aggregations", parseBody());
        break;

      case "get-aggregation":
        if (!core.getInput("aggregation-id"))
          throw new Error("aggregation-id is required");
        result = await request(
          "GET",
          `/aggregations/${core.getInput("aggregation-id")}`,
        );
        break;

      case "delete-aggregation":
        if (!core.getInput("aggregation-id"))
          throw new Error("aggregation-id is required");
        result = await request(
          "DELETE",
          `/aggregations/${core.getInput("aggregation-id")}`,
        );
        break;

      // =================================================================
      // YIELD — Additional
      // =================================================================

      case "get-claim":
        if (!core.getInput("claim-id"))
          throw new Error("claim-id is required");
        result = await request(
          "GET",
          `/ethereum_yield/claims/${core.getInput("claim-id")}`,
        );
        break;

      case "get-sweep":
        if (!core.getInput("sweep-id"))
          throw new Error("sweep-id is required");
        result = await request(
          "GET",
          `/ethereum_yield/sweeps/${core.getInput("sweep-id")}`,
        );
        break;

      default:
        throw new Error(
          `Unknown command: ${command}. Available: ` +
            "create-user, get-user, list-users, delete-user, get-user-by-email, get-user-by-phone, get-user-by-wallet, set-user-metadata, pregenerate-wallets, " +
            "create-wallet, batch-create-wallets, get-wallet, list-wallets, get-wallet-by-address, get-wallet-balance, export-wallet, " +
            "eth-send-transaction, eth-sign-transaction, personal-sign, eth-sign-typed-data, solana-send-transaction, solana-sign-transaction, solana-sign-message, raw-sign, " +
            "get-transaction, " +
            "create-policy, get-policy, update-policy, delete-policy, create-rule, update-rule, delete-rule, " +
            "create-quorum, get-quorum, update-quorum, delete-quorum, " +
            "create-rpc-intent, get-intent, list-intents, " +
            "get-vault, get-vault-position, deposit-vault, withdraw-vault, claim-yield, " +
            "start-kyc, get-kyc-status, create-fiat-account, list-fiat-accounts, initiate-onramp, initiate-offramp, " +
            "create-condition-set, get-condition-set, update-condition-set, delete-condition-set",
        );
    }

    core.setOutput("result", JSON.stringify(result));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
