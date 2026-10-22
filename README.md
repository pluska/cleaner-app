# Cleaner Planner - Medieval Cleaning Kingdom

Turn household cleaning into quests that grow a personal medieval kingdom. The intended experience combines recurring cleaning tasks with a PixiJS 2D kingdom and private progress tied to the signed-in user.

## Migration Status

The application uses `@opennextjs/cloudflare` and Next.js 16.3.8. Next.js is pinned because the installed adapter fails at runtime with Next.js 16.4's new preview-props manifest ([upstream issue](https://github.com/opennextjs/opennextjs-cloudflare/issues/1355)). Recheck the compiled Workers preview before changing that pin. The production build explicitly uses webpack, and authentication uses the Next.js 16 `proxy.ts` convention.

The target stack is Next.js, React, TypeScript, Auth.js, Drizzle, Cloudflare D1 through the server-side `DB` binding, and PixiJS / `@pixi/react` for the kingdom. User tasks and kingdom progress must be scoped to the authenticated user on every server read and mutation. D1 does not inherit the old Supabase row-level security policies; authorization must be enforced by the application.

The former Supabase SQL setup and generic hosting instructions are superseded by this migration. Cloudflare's [Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) describes the OpenNext Workers runtime and preview workflow.

## Local Development

Use Node.js 22 and npm, matching CI. From the repository root:

```bash
npm ci
npm run db:migrate:local
npm run dev
```

Open [localhost:3000](http://localhost:3000). `db:migrate:local` applies checked-in migrations to local D1 state. It is not a production migration command.

Configure local authentication secrets and any enabled integrations using the variable names required by the current implementation. Keep secrets in ignored local files or the deployment environment, never in browser-visible variables or committed configuration. Configure a local `DB` binding and use a separate staging database for staging. Do not point local development or CI at production data.

If `npm ci` reports a package/lockfile mismatch, reconcile and commit the lockfile as part of the dependency migration before retrying. CI deliberately uses the committed dependency graph.

## Verification and Cloudflare Preview

```bash
npm run typecheck
npm test
npm run build
npm run pages:build
npm run pages:preview
```

The historical `pages:*` command names are retained for compatibility:

| Command | Purpose |
| --- | --- |
| `npm run build` / `npm run pages:build` | Build Next.js and the OpenNext Cloudflare artifact. |
| `npm run build:next` | Build Next.js only (called internally by OpenNext). |
| `npm run pages:preview` | Build and preview using the Cloudflare runtime. |
| `npm run pages:deploy` | Build and deploy manually, only after release approval. |

The names do not imply deployment through the former next-on-pages adapter. Validate the OpenNext configuration, Worker entry point, assets, runtime compatibility settings, and D1 binding together. A successful `next build` alone does not prove the Cloudflare artifact works. `open-next.config.ts` explicitly invokes `build:next` to avoid recursion now that `build` produces the complete Cloudflare artifact.

Workers Builds targets `sparkclean` in the account declared in `wrangler.toml`. Its build command is `npm run build`; the non-production upload command is `npx wrangler versions upload`. Uploading a version does not activate it in production. Production uses `npm run pages:deploy` or `npx wrangler deploy` after a successful build. The default runtime origin is [sparkclean.pluskaandres.workers.dev](https://sparkclean.pluskaandres.workers.dev). Configure `AUTH_SECRET` and `CRON_SECRET` as Worker secrets, separately from build variables.

## CI and Releases

`.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run pages:build` (including the Next.js build) on pushes and pull requests. It does not deploy or apply remote migrations. Passing CI is only one release requirement.

The general release acceptance criteria in [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) include:

- Actual end-to-end tests against the staging Cloudflare runtime and staging D1 database.
- Measured kingdom rendering at a sustained minimum of 30 FPS on representative physical mobile devices.
- A configured SMTP or email API provider, verified sender/domain, and proven staging delivery for supported email flows.
- A completed D1 backup and restore rehearsal with verified recovered user progress.
- Verification that one user cannot read or change another user's tasks or kingdom progress.

Deployment is a separate, explicit operator action after sign-off. The owner requested controlled production testing on October 22, 2026; [the release record](docs/RELEASE_2026-10-22.md) records the deployment, validation and remaining gaps. Neither this documentation nor CI guarantees a bug-free release.

To run browser checks against an already running Cloudflare preview or deployment, set `E2E_BASE_URL`. This disables the local Next development server. Authenticated browser scenarios create isolated accounts and household data; use a test database unless deliberately validating a production release.

```bash
E2E_BASE_URL=http://127.0.0.1:3101 npx playwright test e2e/design-system.spec.ts e2e/households.spec.ts e2e/shared-work.spec.ts
```

## GPT and security configuration

The active AI integration uses OpenAI with validated structured output and curated static fallbacks. See [OPENAI_SETUP.md](OPENAI_SETUP.md) for server secrets, quotas, password recovery through Resend, migration ordering and rollback. See [the security implementation report](docs/SECURITY_IMPLEMENTATION.md) for verification results, dependency exceptions and historical database exposure. Existing unversioned sessions must sign in again after migration 0004.

## Code and functionality review (2026-10-14)

See [the latest review](docs/CODE_REVIEW_2026-10-14.md) for corrected defects, test evidence and remaining operational requirements. The planner now saves manual tasks, shows a real monthly calendar and derives statistics from persisted rewards. Onboarding retries preserve tasks and subtasks without duplication. Local browser tests cover desktop and mobile, and CI runs them with synthetic authentication secrets and local D1.

Playwright uses `.next-e2e` so its development server does not overwrite production build output. Run `npm run db:migrate:local` before `npm run test:e2e`.

`worker.mjs` wraps the generated OpenNext HTTP worker and provides the scheduled handler used by the configured daily Cron Trigger. Set `CRON_SECRET` separately in each environment; an unset secret disables the job. Each invocation processes at most 15 recurrence cursors. An operator can repeat the authenticated `/api/cron/daily` call to drain backlog; size the schedule before scaling. Task reads evaluate virtual recurrence independently of materialization.

The former PWA service worker is retired at `/sw.js`; it deletes legacy caches and unregisters itself for previously installed clients. Private API responses are no longer served from those legacy caches.
