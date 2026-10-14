# OpenAI and account recovery setup

Cleaner Planner uses OpenAI Responses with strict structured output. The primary model defaults to `gpt-4o-mini`; one validation correction may use `gpt-4o`. Provider failures, refusals, missing credentials, and the 30-second total deadline use curated static content. No model can execute navigation or database writes. Chemical-safety chat responses are deterministic.

Use Node.js 22.12 or newer on the Node 22 line, matching CI. Install the committed lockfile with `npm ci`.

## Server configuration

Set secrets using Wrangler secrets for the intended environment. Local development can use an ignored `.dev.vars` or `.env.local`; never use `NEXT_PUBLIC_` for keys. Secrets are resolved at request time through the OpenNext Cloudflare context.

| Variable | Purpose/default |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI project API secret; absent means static mode |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `OPENAI_FALLBACK_MODEL` | `gpt-4o` |
| `AI_DISABLED` | `true` forces static content without provider calls |
| `AI_USER_MINUTE_LIMIT` | 10 |
| `AI_USER_DAY_LIMIT` | 50 |
| `AI_GLOBAL_DAY_LIMIT` | 200 |
| `RESEND_API_KEY` | Resend API secret |
| `RESEND_FROM` | Sender address on a verified Resend domain |
| `RESEND_SENDER_VERIFIED` | Set `true` only after verifying the sender/domain with Resend |
| `SITE_URL` | Canonical public HTTPS origin used for reset links |
| `AUTH_SECRET` | Auth.js session signing secret |

A paid generation reserves one request from all three D1 counters before contacting OpenAI; the optional correction belongs to that reservation. Quota exhaustion returns 429. Counter failure returns 503 and makes no paid request. Static chat replies consume no paid quota. Authentication is required in every mode. Authentication endpoints have persistent limits of 30 attempts per connecting IP and 5 per normalized account per 15 minutes. Request payloads and full provider responses are not logged; AI telemetry records model, attempt, latency and token counts.

## Database changes

Apply checked-in SQL migrations in order. `0004_security.sql` adds session versions, hashed reset tokens and usage counters; it invalidates previous reset links. Sessions without a version must sign in again. `0005_occurrence_guards.sql` prevents completion reversal and concurrent moves from corrupting rewards. Back up production D1 and complete the existing release checklist before remote migration or deployment.

`npm run db:migrate:local` targets the normal local database. For an isolated test database use:

```sh
npx wrangler d1 migrations apply cleaner-planner-db --local --persist-to .wrangler/security-review
```

Task move endpoints accept an instance ID, or a template ID plus `originalDueDate`. `reschedule` accepts `due_date`; `schedule` accepts `newDueDate`. Moves affect one occurrence, leave the source skipped, and reject completed tasks and occupied destination dates. Series-wide `isRecurring: true` moves return 400. Completion toggling cannot undo rewards. Email-check endpoints return generic messaging without an `exists` field. Signup returns the same generic message for existing and new accounts.

## Verification and rollout

Run `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, and `npm run pages:build`. Tests use synthetic SQLite databases with the actual migrations; provider calls are mocked. They do not require production credentials.

Deploy only to an explicitly configured isolated staging Worker and D1 first. Configure staging secrets separately. Confirm both model IDs are available to that OpenAI project, English/Spanish replies, real reset email delivery, session revocation, and concurrency behavior. Measure token counts, latency and fallback rates in staging logs before enabling production AI. A missing API key cannot establish live model compatibility.

Roll out database/security changes first, task repairs next, and AI last. Set `AI_DISABLED=true` to roll back provider use without undoing security migrations. Do not roll back the reset/session migrations to restore old plaintext tokens. Old Gemini credentials are no longer read and can be removed from deployment secrets.

Official references: [OpenAI Responses migration](https://developers.openai.com/api/docs/guides/migrate-to-responses), [D1 atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

For repeatable local HTTP verification, first build the Worker, apply migrations to `.wrangler/security-review`, then start Wrangler on port 8787 with that same `--persist-to` directory, `AI_DISABLED=true`, `AUTH_TRUST_HOST=true`, and a throwaway `AUTH_SECRET`. Run `node scripts/security-smoke.mjs`. The script refuses remote hosts and creates only synthetic accounts in that local database. Do not use production state or credentials for the smoke test.
