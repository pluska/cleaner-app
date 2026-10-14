# Security repairs and GPT migration

## Implemented behavior

- Chat requires a current authenticated session before any provider call. Structured GPT responses replace Gemini; models default to `gpt-4o-mini` and `gpt-4o`. Safety rules run before stain handling. Unknown chemical-safety requests remain deterministic. Routine chat no longer claims to save tasks that it has not created.
- D1 reservations enforce user/minute, user/day and global/day quotas atomically. Counter failures block paid calls. Authentication routes use persistent account/IP throttling and bounded input. Public email-existence endpoints and signup use generic responses.
- Password resets use Resend, a canonical HTTPS origin and hashed one-hour tokens. A database trigger atomically consumes all tokens, changes session version and removes database sessions with the password change. Tokens and reset URLs are never logged. Both password entry points apply the same bcrypt-compatible policy.
- Task reads merge rescheduled instances with virtual recurrence, honor skipped markers/end dates and use the user's timezone. Moves are atomic and reject collisions/completed tasks. Completion and legacy toggling use the reward path; undo is rejected. AI task/subtask writes are atomic per task, rewards are derived on the server, and room IDs belong to the authenticated user.
- An additional authorization defect found during implementation is fixed: deleting a task instance now verifies ownership. Pending occurrence deletion marks it skipped instead of allowing it to regenerate. Template deletion archives it to retain reward history.
- Local databases and their WAL/SHM files are removed from Git's index and ignored; the user's local copies remain intact.

## Dependency review

Initial npm audit: 47 affected packages (5 critical, 22 high, 11 moderate, 9 low).
After compatible updates and the tested Vitest 5 upgrade: 5 high findings, all in the development-only Next.js ESLint → fast-glob → micromatch → braces dependency chain. Production dependency audit reports zero findings. These five entries represent one underlying advisory, not five separate application exploits.

The remaining advisory is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), excessive recursion in `braces <=3.0.3`. At verification time the registry's latest braces is still 3.0.3. Next.js 16's ESLint plugin also depends on fast-glob. The audit's proposed downgrade to eslint-config-next 14 is not applied to this Next.js 15 application. The affected glob patterns are repository-controlled lint/build inputs, not HTTP request inputs. Do not lint untrusted repositories on a privileged production host; track an upstream patch. This is a documented residual risk, not a claim of remediation.

Auth.js core is now 0.41.3, Next.js 15.5.27, and the unused/unconfigured next-pwa dependency is removed. PostCSS and sharp overrides select patched versions within their existing major/minor compatibility lines. The existing esbuild override advances to 0.28.2; both build paths must be checked with this graph. No blanket forced audit upgrade was used.

## Confirmed Git-history exposure

Inspected database blobs together with their matching WAL and SHM files; inspecting the main SQLite file alone would have missed committed data. No personal identifiers or password hashes were printed or copied into this report.

- Commit `b9cf6bb` (2026-03-06): the database whose filename starts `9ba2b04b` contains one user record and no stored password hash.
- Commit `ea344ca` (2026-04-11): the same legacy record remains. The database whose filename starts `6bad73e7`, reconstructed with its WAL, contains one user record **with one password hash**. Its accounts, sessions and verificationTokens tables are empty.
- No `.env` file was found in the inspected file history. This is not an exhaustive secret scan of all source blobs.

Treat the affected password as exposed if this history was shared. Identify the account privately from the original database, reset its password (and any reuse), and increment its session version in every live environment holding the account. Removing current files does not erase history or clones. Coordinate any Git history rewrite with collaborators and repository owners; no history rewrite, password change, remote deletion or credential rotation was performed in this task.

## Verification and deployment boundary

Local verification uses synthetic user records, the checked-in migrations and isolated `.wrangler/security-review` state. It does not change the user's normal local D1 data. Live OpenAI/Resend checks require deployment credentials. Production deployment and remote database migrations remain separate release actions governed by the existing release checklist.

Final command results and local Worker smoke-test results are recorded below after verification.

- Unit/integration suite: 169 tests pass across 28 files, including actual SQLite migration/trigger behavior and concurrent request regressions.
- TypeScript: passes. ESLint: passes with three existing image-optimization warnings.
- Next.js production build and OpenNext Cloudflare artifact build: pass. Next.js reports Auth.js/jose CompressionStream/DecompressionStream Edge compatibility warnings; local Worker authentication is checked separately below.
- Wrangler applied migrations 0000–0005 successfully to fresh, isolated local D1 state.
- Production dependency audit: 0 findings. Full dependency audit: 5 high development-only findings as documented above.
- Local configuration contains no OpenAI or Resend credentials. Live model availability, real email delivery and deployed staging validation remain unverified; no production deployment or remote migration was performed.
- Local Worker HTTP smoke test passes: signup/login, authentication enforcement, deterministic chemical safety, bilingual static chat, body validation, owned task creation, one-occurrence rescheduling, Spanish recommendation fallback, concurrent completion with one reward, undo rejection, concurrent reset redemption with one winner, and immediate session revocation. Missing email configuration correctly returns 503.
- Read-only inspection through the connected Cloudflare account found the existing `sparkclean` Worker and the configured production `cleaner-planner-db`. The local Wrangler CLI uses a different account: a read-only lookup of that production database returned Cloudflare error 7404 (database not found). A temporary, empty D1 database created in the CLI account was immediately deleted. No staging Worker was deployed and no remote migration was run. Staging verification requires Wrangler credentials for the account that owns this project, plus separate OpenAI and Resend credentials for live provider checks.
