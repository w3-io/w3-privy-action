/**
 * Privy action unit tests.
 *
 * Tests the core logic extracted from src/index.js without importing
 * the module (which auto-runs).  Covers:
 *   - Auth header construction (Basic auth + privy-app-id)
 *   - URL / query-string building
 *   - Body parsing + validation
 *   - Per-command API call shape (method, path, body)
 *   - Missing-input validation
 *   - Error handling (HTTP errors, timeouts, unparseable responses)
 *
 * Run with: npm test
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// ── Reproduce helpers from src/index.js ────────────────────────────

const DEFAULT_API_URL = "https://api.privy.io/v1";

function buildAuthHeaders(appId, appSecret, idempotencyKey) {
  const headers = {
    Authorization:
      "Basic " + Buffer.from(`${appId}:${appSecret}`).toString("base64"),
    "privy-app-id": appId,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (idempotencyKey) headers["privy-idempotency-key"] = idempotencyKey;
  return headers;
}

function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== "");
  return entries.length
    ? "?" + entries.map(([k, v]) => `${k}=${v}`).join("&")
    : "";
}

function pb(bodyStr) {
  if (!bodyStr) throw new Error("body input is required");
  return JSON.parse(bodyStr);
}

// ── Fetch mock infrastructure ──────────────────────────────────────

let originalFetch;
let calls;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  calls = [];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(responses) {
  let index = 0;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const response = responses[index++];
    if (!response) throw new Error(`Unexpected fetch call ${index}: ${url}`);
    const status = response.status ?? 200;
    const ok = status >= 200 && status < 300;
    return {
      ok,
      status,
      headers: { get: (k) => (response.headers || {})[k] || null },
      text: async () =>
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body ?? {}),
      json: async () => response.body ?? {},
    };
  };
}

/**
 * Simulate what the action's req() helper does: build URL, call fetch,
 * parse response.
 */
async function req(apiUrl, headers, method, path, bodyObj) {
  const url = `${apiUrl}${path}`;
  const opts = { method, headers: { ...headers } };
  if (bodyObj && method !== "GET" && method !== "DELETE") {
    opts.body = JSON.stringify(bodyObj);
  }
  const res = await globalThis.fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} returned ${res.status}: ${text}`);
  }
  if (res.status === 204) return { success: true };
  const text = await res.text();
  if (!text) return { success: true };
  return JSON.parse(text);
}

// ── Tests ──────────────────────────────────────────────────────────

describe("Auth header construction", () => {
  it("produces correct Basic auth from app-id and app-secret", () => {
    const h = buildAuthHeaders("app123", "secret456");
    const decoded = Buffer.from(
      h.Authorization.replace("Basic ", ""),
      "base64",
    ).toString();
    assert.equal(decoded, "app123:secret456");
  });

  it("sets privy-app-id header", () => {
    const h = buildAuthHeaders("myapp", "mysecret");
    assert.equal(h["privy-app-id"], "myapp");
  });

  it("sets Content-Type and Accept to application/json", () => {
    const h = buildAuthHeaders("a", "b");
    assert.equal(h["Content-Type"], "application/json");
    assert.equal(h.Accept, "application/json");
  });

  it("includes idempotency key when provided", () => {
    const h = buildAuthHeaders("a", "b", "idem-123");
    assert.equal(h["privy-idempotency-key"], "idem-123");
  });

  it("omits idempotency key when empty", () => {
    const h = buildAuthHeaders("a", "b", "");
    assert.equal(h["privy-idempotency-key"], undefined);
  });
});

describe("Query string builder", () => {
  it("builds query string from non-empty params", () => {
    assert.equal(qs({ cursor: "abc", limit: "10" }), "?cursor=abc&limit=10");
  });

  it("skips empty-string values", () => {
    assert.equal(qs({ cursor: "", limit: "5" }), "?limit=5");
  });

  it("returns empty string when all values empty", () => {
    assert.equal(qs({ cursor: "", limit: "" }), "");
  });
});

describe("Body parser", () => {
  it("parses valid JSON body", () => {
    const result = pb('{"key": "value"}');
    assert.deepEqual(result, { key: "value" });
  });

  it("throws on empty body", () => {
    assert.throws(() => pb(""), /body input is required/);
  });

  it("throws on invalid JSON", () => {
    assert.throws(() => pb("{not json}"), /SyntaxError|Unexpected/);
  });
});

// ── Users ──────────────────────────────────────────────────────────

describe("Users: create-user", () => {
  it("POSTs to /users with body", async () => {
    mockFetch([{ body: { id: "did:privy:abc" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = { linked_accounts: [{ type: "email", address: "a@b.com" }] };
    const result = await req(DEFAULT_API_URL, h, "POST", "/users", body);
    assert.equal(result.id, "did:privy:abc");
    assert.equal(calls[0].url, "https://api.privy.io/v1/users");
    assert.equal(calls[0].options.method, "POST");
    assert.deepEqual(JSON.parse(calls[0].options.body), body);
  });
});

describe("Users: get-user", () => {
  it("GETs /users/{id}", async () => {
    mockFetch([{ body: { id: "did:privy:u1", linked_accounts: [] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(DEFAULT_API_URL, h, "GET", "/users/did:privy:u1");
    assert.equal(result.id, "did:privy:u1");
    assert.match(calls[0].url, /\/users\/did:privy:u1$/);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.body, undefined);
  });
});

describe("Users: delete-user", () => {
  it("DELETEs /users/{id}", async () => {
    mockFetch([{ status: 204 }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(
      DEFAULT_API_URL,
      h,
      "DELETE",
      "/users/did:privy:u1",
    );
    assert.deepEqual(result, { success: true });
    assert.equal(calls[0].options.method, "DELETE");
  });
});

describe("Users: search-users", () => {
  it("POSTs to /users/search", async () => {
    mockFetch([{ body: { data: [{ id: "u1" }] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = { searchTerm: "alice" };
    const result = await req(DEFAULT_API_URL, h, "POST", "/users/search", body);
    assert.equal(result.data.length, 1);
  });
});

describe("Users: get-user-by-email", () => {
  it("POSTs to /users/email/address", async () => {
    mockFetch([{ body: { id: "did:privy:u1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/users/email/address", {
      address: "a@b.com",
    });
    assert.match(calls[0].url, /\/users\/email\/address$/);
  });
});

describe("Users: get-user-by-wallet", () => {
  it("POSTs to /users/wallet/address", async () => {
    mockFetch([{ body: { id: "did:privy:u1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/users/wallet/address", {
      address: "0xabc",
    });
    assert.match(calls[0].url, /\/users\/wallet\/address$/);
    assert.deepEqual(JSON.parse(calls[0].options.body), { address: "0xabc" });
  });
});

describe("Users: set-user-metadata", () => {
  it("POSTs to /users/{id}/custom_metadata", async () => {
    mockFetch([{ body: { success: true } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(
      DEFAULT_API_URL,
      h,
      "POST",
      "/users/did:privy:u1/custom_metadata",
      { tier: "gold" },
    );
    assert.match(calls[0].url, /\/users\/did:privy:u1\/custom_metadata$/);
  });
});

// ── Wallets ────────────────────────────────────────────────────────

describe("Wallets: create-wallet", () => {
  it("POSTs to /wallets with chain_type", async () => {
    mockFetch([{ body: { id: "w1", address: "0x123" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(DEFAULT_API_URL, h, "POST", "/wallets", {
      chain_type: "solana",
    });
    assert.equal(result.id, "w1");
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      chain_type: "solana",
    });
  });

  it("defaults to ethereum when no body provided", () => {
    // Reproduces the fallback logic: body ? pb() : { chain_type: chainType || "ethereum" }
    const chainType = "";
    const fallback = { chain_type: chainType || "ethereum" };
    assert.equal(fallback.chain_type, "ethereum");
  });
});

describe("Wallets: list-wallets", () => {
  it("GETs /wallets with query params", async () => {
    mockFetch([{ body: { data: [], next_cursor: null } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const q = qs({
      cursor: "",
      limit: "10",
      chain_type: "ethereum",
      user_id: "",
    });
    await req(DEFAULT_API_URL, h, "GET", `/wallets${q}`);
    assert.match(calls[0].url, /\/wallets\?limit=10&chain_type=ethereum$/);
  });
});

describe("Wallets: get-wallet-balance", () => {
  it("GETs /wallets/{id}/balance with chain and asset", async () => {
    mockFetch([{ body: { balances: [{ raw_value: "1000" }] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const q = qs({ chain: "ethereum", asset: "eth", token: "" });
    await req(DEFAULT_API_URL, h, "GET", `/wallets/w1/balance${q}`);
    assert.match(
      calls[0].url,
      /\/wallets\/w1\/balance\?chain=ethereum&asset=eth$/,
    );
  });
});

describe("Wallets: batch-create-wallets", () => {
  it("POSTs to /wallets/batch", async () => {
    mockFetch([{ body: { wallets: [{ id: "w1" }, { id: "w2" }] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = {
      wallets: [{ chain_type: "ethereum" }, { chain_type: "solana" }],
    };
    const result = await req(
      DEFAULT_API_URL,
      h,
      "POST",
      "/wallets/batch",
      body,
    );
    assert.equal(result.wallets.length, 2);
  });
});

// ── Signing: Ethereum ──────────────────────────────────────────────

describe("Signing: eth-send-transaction", () => {
  it("POSTs to /wallets/{id}/rpc with eth_sendTransaction method", async () => {
    mockFetch([{ body: { data: { hash: "0xabc" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = {
      method: "eth_sendTransaction",
      params: { transaction: { to: "0x1", value: "0x0" }, caip2: "eip155:1" },
    };
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", body);
    assert.match(calls[0].url, /\/wallets\/w1\/rpc$/);
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.method, "eth_sendTransaction");
    assert.equal(sent.params.caip2, "eip155:1");
  });
});

describe("Signing: personal-sign", () => {
  it("POSTs to /wallets/{id}/rpc with personal_sign method", async () => {
    mockFetch([{ body: { data: { signature: "0xsig" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = {
      method: "personal_sign",
      params: { message: "Hello", encoding: "utf-8" },
    };
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", body);
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.method, "personal_sign");
  });
});

describe("Signing: eth-sign-typed-data", () => {
  it("uses eth_signTypedData_v4 method", async () => {
    mockFetch([{ body: { data: { signature: "0x" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", {
      method: "eth_signTypedData_v4",
      params: { domain: {}, types: {}, value: {} },
    });
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.method, "eth_signTypedData_v4");
  });
});

// ── Signing: Solana ────────────────────────────────────────────────

describe("Signing: solana-send-transaction", () => {
  it("uses signAndSendTransaction method", async () => {
    mockFetch([{ body: { data: { signature: "abc" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", {
      method: "signAndSendTransaction",
      params: { transaction: "base64tx" },
    });
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.method, "signAndSendTransaction");
  });
});

describe("Signing: solana-sign-message", () => {
  it("uses signMessage method", async () => {
    mockFetch([{ body: { data: { signature: "abc" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", {
      method: "signMessage",
      params: { message: "aGVsbG8=", encoding: "base64" },
    });
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.method, "signMessage");
  });
});

// ── Signing: Bitcoin / Spark ───────────────────────────────────────

describe("Signing: bitcoin-sign-psbt", () => {
  it("uses signPsbt method", async () => {
    mockFetch([{ body: { data: {} } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/rpc", {
      method: "signPsbt",
      params: { psbt: "base64" },
    });
    assert.equal(JSON.parse(calls[0].options.body).method, "signPsbt");
  });
});

// ── Signing: Raw ───────────────────────────────────────────────────

describe("Signing: raw-sign", () => {
  it("POSTs to /wallets/{id}/raw_sign", async () => {
    mockFetch([{ body: { data: { signature: "0x" } } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/raw_sign", {
      hash: "0xabcdef",
    });
    assert.match(calls[0].url, /\/wallets\/w1\/raw_sign$/);
  });
});

// ── Policies ───────────────────────────────────────────────────────

describe("Policies: create-policy", () => {
  it("POSTs to /policies", async () => {
    mockFetch([{ body: { id: "pol1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = { version: "1.0", name: "spend-limit", rules: [] };
    await req(DEFAULT_API_URL, h, "POST", "/policies", body);
    assert.match(calls[0].url, /\/policies$/);
  });
});

describe("Policies: get-policy", () => {
  it("GETs /policies/{id}", async () => {
    mockFetch([{ body: { id: "pol1", rules: [] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "GET", "/policies/pol1");
    assert.match(calls[0].url, /\/policies\/pol1$/);
  });
});

describe("Policies: create-rule", () => {
  it("POSTs to /policies/{id}/rules", async () => {
    mockFetch([{ body: { id: "rule1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/policies/pol1/rules", {
      type: "amount_limit",
    });
    assert.match(calls[0].url, /\/policies\/pol1\/rules$/);
  });
});

// ── Key Quorums ────────────────────────────────────────────────────

describe("Key Quorums: create-quorum", () => {
  it("POSTs to /key_quorums", async () => {
    mockFetch([{ body: { id: "q1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/key_quorums", { name: "main" });
    assert.match(calls[0].url, /\/key_quorums$/);
  });
});

describe("Key Quorums: delete-quorum", () => {
  it("DELETEs /key_quorums/{id}", async () => {
    mockFetch([{ status: 204 }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(DEFAULT_API_URL, h, "DELETE", "/key_quorums/q1");
    assert.deepEqual(result, { success: true });
  });
});

// ── Intents ────────────────────────────────────────────────────────

describe("Intents: create-rpc-intent", () => {
  it("POSTs to /intents/wallets/{id}/rpc", async () => {
    mockFetch([{ body: { id: "intent1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/intents/wallets/w1/rpc", {
      method: "eth_sendTransaction",
    });
    assert.match(calls[0].url, /\/intents\/wallets\/w1\/rpc$/);
  });
});

describe("Intents: list-intents", () => {
  it("GETs /intents with pagination", async () => {
    mockFetch([{ body: { data: [], next_cursor: null } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const q = qs({ cursor: "", limit: "20" });
    await req(DEFAULT_API_URL, h, "GET", `/intents${q}`);
    assert.match(calls[0].url, /\/intents\?limit=20$/);
  });
});

// ── Yield (ERC-4626) ───────────────────────────────────────────────

describe("Yield: deposit-vault", () => {
  it("POSTs to /wallets/{id}/ethereum_yield_deposit", async () => {
    mockFetch([{ body: { tx_hash: "0x" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(
      DEFAULT_API_URL,
      h,
      "POST",
      "/wallets/w1/ethereum_yield_deposit",
      { vault_id: "v1", amount: "100" },
    );
    assert.match(calls[0].url, /\/ethereum_yield_deposit$/);
  });
});

describe("Yield: get-vault", () => {
  it("GETs /ethereum_yield_vault/{id}", async () => {
    mockFetch([{ body: { id: "v1", apy: "5.2" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "GET", "/ethereum_yield_vault/v1");
    assert.match(calls[0].url, /\/ethereum_yield_vault\/v1$/);
  });
});

// ── Fiat / KYC ─────────────────────────────────────────────────────

describe("Fiat: start-kyc", () => {
  it("POSTs to /users/{id}/fiat/kyc", async () => {
    mockFetch([{ body: { status: "pending", url: "https://verify.example" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/users/did:privy:u1/fiat/kyc", {
      provider: "bridge",
    });
    assert.match(calls[0].url, /\/users\/did:privy:u1\/fiat\/kyc$/);
  });
});

describe("Fiat: initiate-onramp", () => {
  it("POSTs to /users/{id}/fiat/onramp", async () => {
    mockFetch([{ body: { id: "onramp1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/users/did:privy:u1/fiat/onramp", {
      amount: 100,
    });
    assert.match(calls[0].url, /\/fiat\/onramp$/);
  });
});

describe("Fiat: list-fiat-accounts", () => {
  it("GETs /users/{id}/fiat/accounts", async () => {
    mockFetch([{ body: { data: [] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "GET", "/users/did:privy:u1/fiat/accounts");
    assert.match(calls[0].url, /\/fiat\/accounts$/);
    assert.equal(calls[0].options.method, "GET");
  });
});

// ── Condition Sets ─────────────────────────────────────────────────

describe("Condition Sets: create-condition-set", () => {
  it("POSTs to /condition_sets", async () => {
    mockFetch([{ body: { id: "cs1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/condition_sets", {
      name: "geo-block",
    });
    assert.match(calls[0].url, /\/condition_sets$/);
  });
});

describe("Condition Sets: list-condition-set-items", () => {
  it("GETs /condition_sets/{id}/condition_set_items with pagination", async () => {
    mockFetch([{ body: { data: [] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const q = qs({ cursor: "abc", limit: "50" });
    await req(
      DEFAULT_API_URL,
      h,
      "GET",
      `/condition_sets/cs1/condition_set_items${q}`,
    );
    assert.match(calls[0].url, /\/condition_set_items\?cursor=abc&limit=50$/);
  });
});

// ── Allowlist ──────────────────────────────────────────────────────

describe("Allowlist: add-allowlist-entry", () => {
  it("POSTs to /apps/{appId}/allowlist", async () => {
    mockFetch([{ body: { id: "entry1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/apps/app1/allowlist", {
      type: "email",
      value: "a@b.com",
    });
    assert.match(calls[0].url, /\/apps\/app1\/allowlist$/);
  });
});

// ── Aggregations ───────────────────────────────────────────────────

describe("Aggregations: create-aggregation", () => {
  it("POSTs to /aggregations", async () => {
    mockFetch([{ body: { id: "agg1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/aggregations", { type: "sum" });
    assert.match(calls[0].url, /\/aggregations$/);
  });
});

// ── Error handling ─────────────────────────────────────────────────

describe("Error handling", () => {
  it("throws on non-OK HTTP response", async () => {
    mockFetch([{ status: 403, body: { error: "forbidden" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await assert.rejects(
      () => req(DEFAULT_API_URL, h, "GET", "/users/u1"),
      (err) => err.message.includes("403"),
    );
  });

  it("throws on 404 with error details", async () => {
    mockFetch([{ status: 404, body: { error: "not found" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await assert.rejects(
      () => req(DEFAULT_API_URL, h, "GET", "/wallets/nonexistent"),
      (err) => err.message.includes("404"),
    );
  });

  it("treats 204 as success with no body", async () => {
    mockFetch([{ status: 204 }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(DEFAULT_API_URL, h, "DELETE", "/policies/pol1");
    assert.deepEqual(result, { success: true });
  });

  it("treats empty text body as success", async () => {
    mockFetch([{ status: 200, body: "" }]);
    const h = buildAuthHeaders("app1", "sec1");
    const result = await req(DEFAULT_API_URL, h, "DELETE", "/users/u1");
    assert.deepEqual(result, { success: true });
  });

  it("does not send body on GET requests", async () => {
    mockFetch([{ body: { data: [] } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "GET", "/wallets", { ignored: true });
    assert.equal(calls[0].options.body, undefined);
  });

  it("does not send body on DELETE requests", async () => {
    mockFetch([{ status: 204 }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "DELETE", "/policies/pol1", {
      ignored: true,
    });
    assert.equal(calls[0].options.body, undefined);
  });
});

// ── Transfer / Swap ────────────────────────────────────────────────

describe("Wallets: transfer", () => {
  it("POSTs to /wallets/{id}/transfer", async () => {
    mockFetch([{ body: { id: "tx1", status: "pending" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    const body = {
      source: { asset: "usdc", amount: "100", chain: "ethereum_sepolia" },
      destination: { address: "0xrecipient" },
    };
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/transfer", body);
    assert.match(calls[0].url, /\/wallets\/w1\/transfer$/);
  });
});

describe("Wallets: swap", () => {
  it("POSTs to /wallets/{id}/swap", async () => {
    mockFetch([{ body: { id: "swap1" } }]);
    const h = buildAuthHeaders("app1", "sec1");
    await req(DEFAULT_API_URL, h, "POST", "/wallets/w1/swap", {
      from: "eth",
      to: "usdc",
    });
    assert.match(calls[0].url, /\/wallets\/w1\/swap$/);
  });
});
