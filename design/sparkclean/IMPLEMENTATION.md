# Implementation · visual system and shared household work

Reference: [approved Figma file](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5).

## Implemented

- Official palette exported as typed tokens, with the brand theme mapped to the approved light surfaces, navy and gold.
- Geist body text and Lora display typography through Next's existing font pipeline.
- Original supplied logo as a reusable `BrandLogo`, used in marketing, account flows, onboarding, the app shell and the kingdom header.
- Responsive landing page: original 39 marketing strings, existing EN/ES translations, interactive task preview, motivation cards, features, CTA and footer. The source translation file is unchanged.
- Exact Figma SVG exports served locally through `DesignIcon`. SVGs retain their original 24 × 24 dimensions; the preview check is 16 × 16. Logo ratio is 2048:682.
- Shared buttons, cards and labeled input/select fields; accessible focus, error associations and reduced-motion styling.
- Desktop sidebar and mobile navigation around existing dashboard, agenda, statistics and store routes. All visible navigation points to existing working routes.
- Existing account pages and onboarding retain their questions, messages and behavior. The live kingdom keeps its Pixi scene, persistence, missions and editor while adopting the official wordmark and UI colors.
- Persistent households, owner/member roles, membership lists and account-specific active household selection, with mobile/desktop camaradas navigation.
- Invitation links and codes: seven-day expiry, binding to the invited account email, hashed tokens at rest, review before acceptance, revocation and retry-safe atomic acceptance.
- Owner-controlled removal and ownership transfer; members can leave. The owner cannot leave without transferring administration. Transfer revokes the previous owner's outstanding invitations.
- Joining survives the real login/signup form through a constrained local callback. Private household endpoints enforce current membership independently of the UI.
- Household work at `/households/work`, linked from camaradas, dashboard and personal schedule: shared rooms, task descriptions and estimates, once/daily/weekly/monthly/yearly recurrence, seven-day views and personal filtering.
- Per-occurrence assignments, volunteer claims, and consent-based handoff requests with expiry. Owners can archive recurring work while preserving completed history. Leaving a household releases pending assignments and cancels pending handoffs.
- Opt-in availability by weekday and daily minute budget, plus rest. Deterministic allocation respects existing assignments and daily capacity. Owners review a preview before publishing; a version check and atomic batch reject stale proposals.
- Completing eligible work credits the actual contributor's personal XP, coins, activity and streak, plus one common household resource. A single database transaction protects all balances and prevents duplicate rewards. Household due dates use the household timezone; contributor activity uses their personal timezone.
- Shared completion contributes to weekly statistics and personal campaign progress. Common resources are persisted separately; household world construction and spending are a subsequent slice.
- Canonical `/favicon.ico` is owned by `src/app/favicon.ico`. The identical public duplicate was removed, and the icon generator now preserves this single route.
- The live kingdom now loads the supplied 3D-style terrain, tavern, well and entrance artwork, plus all three tower tiers and the new Sparklin guide. Original source images remain in `design/sparkclean/assets`; proportional WebP derivatives are generated with `npm run kingdom:art`. Grid guides appear while editing, saved layouts and game rules persist, and the supplied weekly banner appears after earning five completions.

## Household rollout

Migrations `drizzle/0006_households.sql` and `drizzle/0007_shared_work.sql`, with their Drizzle snapshots, are included and applied to local D1. The subsequent production rollout, backup and runtime checks are recorded in [the October 22 release record](../../docs/RELEASE_2026-10-22.md). Apply the migrations before activating these routes, using the project's normal migration workflow ([Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)).

Existing personal rooms, tasks, inventories and kingdoms retain their scope. Shared rooms and task templates are separate records and are never copied from personal schedules. Personal rewards belong to the contributor; common resources belong to the household. Shared task creation, archival and manual assignment require ownership. Members control their own availability and must accept incoming handoffs.

Households default to UTC. Owners may configure an IANA timezone before creating their first shared task; it is then locked to preserve recurrence dates. Availability is opt-in (zero minutes by default) and applies only to that household. Rest excludes future automatic allocation but does not silently release already published assignments. A proposal fills unassigned work only, with a maximum of 80 assignments per publication. Limits are 30 rooms and 100 active templates per household. Handoff requests expire after three days.

The custom triggers in migration 0007 are intentional: contributor rewards, common resource credit and occurrence completion must commit or roll back together. Member departure clears pending assignments in the same transaction. Review the full SQL migration when releasing; the generated Drizzle snapshot describes tables and indexes, while the SQL also contains these triggers.

Owners generate and copy invitations themselves; no email or other message is automatically sent. Raw invitation links are shown only when created and cannot be retrieved later from the database. Cancelling and regenerating a link is supported.

## Next slices

1. Supervised child profiles and guardian approval flows; richer task editing, rescheduling and rotation policies.
2. Ownership and inventories for avatars, items, clothes and skins; purchases and supervised-account approvals.
3. Monthly event definitions and developer publishing flow, participation and reward claims.
4. Opt-in seasonal/weather appearance, location preferences, reduced effects and dark mode.
5. Shared kingdom construction and resource spending, evolving dwelling structures, and remaining dashboard/layout compositions from Figma. The supplied personal-world artwork and tower tier visuals are integrated.

These remaining feature flows are designed in Figma but are not yet implemented.

## Verification

- `npm run typecheck`, `npm run lint`, `git diff --check`.
- `npm run build` builds the complete OpenNext Cloudflare artifact. The October 22 production-testing release uses Next.js 16.3.8; see the release record for runtime verification and deployment evidence.
- `TZ=UTC npm test`: 214 tests pass, including six household membership and nine shared-work SQLite/D1 integration tests. The earlier default-timezone run exposed three pre-existing date-boundary failures in unchanged `task-utils` tests, whose fixtures use UTC dates while the implementation uses local dates.
- `npx playwright test e2e/design-system.spec.ts`: four desktop/mobile checks for original EN/ES copy, asset loading and geometry, task XP, navigation and labeled auth controls.
- Existing `e2e/planner.spec.ts`: signup, all six onboarding steps, persisted task completion, calendar, statistics and store pass on desktop and mobile.
- Existing `e2e/kingdom.spec.ts`: live scene, mission completion, rewards, upgrades, editing and persistence pass on desktop and mobile.
- `e2e/households.spec.ts`: separate owner/member browser sessions, persisted switching, invitation review through login, cross-household denial, member privilege denial, revocation, removal, replay rejection, anonymous route protection and the canonical favicon response.
- `e2e/shared-work.spec.ts`: two-account room/task creation, timezone locking, opt-in availability, preview without publication, owner publication, recipient-approved handoff, persisted contributor XP/coins/statistics and common resources, retry-safe completion, and EN/ES responsive screens.
- Visual review covers the earlier marketing/account screens and the shared agenda/availability/allocation against Figma nodes `6:4259`, `6:4192` and `6:5257`.

The favicon conflict observed in the first slice is resolved; `/favicon.ico` returns 200 with an image content type. The icon artwork was kept unchanged.
