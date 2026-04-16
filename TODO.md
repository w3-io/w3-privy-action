# TODO

## Elevated permissions — blocked at Privy-side

A large block of commands skipped because the current Privy app
tier doesn't have the required permissions. Revisit when we upgrade
or request those specific capabilities on Privy's dashboard.

- [ ] Custodial wallet creation — `create-custodial-wallet`,
      `create-wallet`, `batch-create-wallets`. Blocked on the
      "custodial wallets" flag being enabled for the Privy app.
- [ ] Signing — `personal-sign`, `eth-sign-typed-data`,
      `solana-sign-message`, `raw-sign`. Each depends on a wallet
      existing, so blocked behind the custodial-wallet flag above.
- [ ] Transaction submission — `eth-send-transaction`,
      `solana-send-transaction`. Same chain.

## API format divergence — needs investigation

- [ ] Policy / rule / condition commands — `create-policy`,
      `create-rule`, `create-condition-set`, etc. Current skip note
      cites "API format differences." Spec a sandbox test and see
      what Privy actually wants; fix the action's request shapes.
- [ ] `search-users` — "requires specific query format." Same
      investigation applies.
- [ ] `link-account` / `unlink-account` — "requires specific
      linked_account format." Same.

## Unblockable with linked accounts

- [ ] Social lookup commands — `get-user-by-phone`,
      `get-user-by-discord`, `get-user-by-twitter`, etc. Require
      users with linked accounts of that type. Set up a single
      test user with all linked accounts to exercise these.

## Funded-wallet gated

- [ ] `transfer`, `swap`, `get-swap-quote` — require a wallet with
      balance. Similar story to the Stripe/Circle funded-wallet
      blocks; fund once and the commands are testable.

## Feature-flag gated

- [ ] `export-wallet` / `authenticate-wallet` — require specific
      feature flags on the Privy app tier.
- [ ] Quorum / intent commands — require policy-gated setup that
      overlaps with the Policy skip block above.
- [ ] Yield / fiat / KYC write commands — require provider config
      (Privy's yield partner, fiat partner, KYC partner). Each is
      a separate onboarding.

## Test re-run

- [ ] Verify the 8 currently-passing commands still pass against
      the live Privy API. RESULTS.md says PASS (8/8) as of
      2026-04-15. Re-run periodically to catch API drift.
