# Production Release Checklist

General release acceptance remains incomplete until the checks below have evidence and an accountable reviewer. The owner explicitly requested controlled production testing on October 22, 2026; see [that release record](RELEASE_2026-10-22.md). Unchecked items are not completed by passing CI, and that deployment does not establish staging, physical-device performance, email delivery or remote recovery evidence.

## Release Record

- Candidate commit / artifact: pending
- Staging URL and deployment version: pending
- Test date and operator: pending
- Release owner and reviewer: pending
- Evidence links (logs, traces, recordings, reports): pending
- Known defects and residual risks: pending
- Rollback owner and prior working version: pending

## Build and Migration

- [ ] The committed manifest and lockfile resolve supported, compatible Next.js and `@opennextjs/cloudflare` releases; the former next-on-pages adapter is no longer used by the build path.
- [ ] A clean checkout passes `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`. Record the CI run and candidate commit.
- [ ] `npm run pages:build` succeeds and `npm run pages:preview` serves the candidate in the Cloudflare runtime. Check Worker entry point, assets, compatibility settings, and removal of obsolete Pages output configuration.
- [ ] The retained `db:migrate:local`, `pages:build`, `pages:preview`, and `pages:deploy` commands match their documented behavior.
- [ ] `npm run db:migrate:local` succeeds against fresh local state. Staging migration results and the production migration order are reviewed separately.
- [ ] Server database access uses the D1 `DB` binding in staging. Local, staging, and production data and secrets are isolated. No production credentials are required by CI.

## Actual Staging E2E - Release Blocker

- [ ] Run real browser E2E against the deployed staging candidate and staging D1, not only mocks or the Node development server. Record URL, commit, browser versions, logs, and traces.
- [ ] Verify sign-up/sign-in, sign-out, session expiry, and the implemented account recovery or verification flows, including failure states.
- [ ] Create, edit, schedule, complete, and delete cleaning tasks; verify resulting kingdom progress survives refresh and a new authenticated session.
- [ ] Repeat completion requests and retry interrupted requests; verify rewards and progress are not duplicated or corrupted.
- [ ] Use two separate accounts to attempt cross-user reads and writes, including direct API requests with substituted identifiers. Confirm private tasks and progress remain inaccessible; test unauthenticated access too.
- [ ] Verify responsive navigation, touch controls, keyboard access, and a usable task interface when the kingdom renderer cannot initialize.

## Measured Mobile Performance - Release Blocker

- [ ] On representative physical mobile devices, measure the PixiJS 2D kingdom at a sustained minimum of 30 FPS during normal interactions and the largest supported kingdom state. Emulation or a desktop observation alone does not satisfy this gate.
- [ ] Record device model, OS/browser version, viewport, scene size, candidate commit, measurement method, duration, FPS distribution, and visible stalls. Use at least a 60-second capture after warm-up and report dips instead of relying only on an average.
- [ ] Verify touch interaction, resize/orientation changes, background/resume, and renderer failure behavior. Attach traces or recordings and document any unsupported devices.

## Email Delivery - Release Blocker

- [ ] Configure the selected SMTP or API provider, credentials, sender address, and sending domain for the actual supported email flows. Placeholder settings do not satisfy this gate.
- [ ] Verify provider domain ownership and the required DNS authentication records. Confirm staging delivery to a controlled recipient and record provider delivery evidence without exposing tokens or credentials.
- [ ] Confirm links use the correct environment origin; verify expiry, reuse rejection where applicable, and delivery-failure behavior. Record the production configuration owner.

## D1 Backup and Restore - Release Blocker

- [ ] Record the backup method, retention, access controls, recovery target, and accountable operator before production migrations.
- [ ] Rehearse backup and restore using representative staging data into a separate recovery database. Never rehearse destructive recovery against production.
- [ ] Validate restored schema, task records, ownership, and kingdom progress; run application smoke tests against the restored data and record elapsed recovery time and data-loss window.
- [ ] Record the exact reviewed recovery procedure and evidence. A configured backup without a successful restore rehearsal does not pass.
- [ ] Review schema compatibility with application rollback. Reverting a Worker alone may not undo a database migration.

## Manual Release Decision

- [ ] All required gates above have evidence for the candidate being released. Missing staging E2E, mobile measurements, email configuration/delivery, or restore evidence keeps production blocked.
- [ ] The reviewer records known issues, user impact, and residual risks. Do not claim that automated checks or this checklist guarantee a bug-free release.
- [ ] Record explicit release sign-off, deployment target, migration order, operator, and rollback procedure before any remote mutation.
- [ ] Only the designated operator invokes `npm run pages:deploy` after approval. Remote migrations are separately reviewed and run manually against the confirmed target; CI does not perform them.
- [ ] After deployment, verify authentication, private progress persistence, email delivery, and kingdom rendering, and monitor errors. Invoke the reviewed rollback/recovery procedure if release criteria fail.
