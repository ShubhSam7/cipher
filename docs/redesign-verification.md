# Redesign verification

The redesign was reviewed on 28 October 2026. Local changes already present in the workspace’s tokens, font setup and UI primitives were preserved and extended.

## Implemented

- Shared Manrope typography, charcoal/ivory/lime palette, semantic feedback and control tokens, consistent radii and 44px key controls.
- Landing composition with an immediately visible, explicitly illustrative conversation preview and no invented activity counts. Signed-in hero action leads to the feed; logout remains in the app account menu.
- Shared authentication layout, labeled fields, existing password visibility/autofill, validation and loading behavior.
- Compact feed heading/composer; flat posts, restrained hashtag styling, shared discovery rail, explicit hashtag search.
- Connected comment/reply rows, original-poster labels and shallow mobile indentation; existing reply/delete behavior preserved.
- Questions, accepted answers, poll options/results, communities, profiles, settings and About use shared content widths and hierarchy.
- Navigation compacts on tablet and becomes a focus-managed mobile drawer. Settings/About are separated from frequent destinations.
- Dialog, drawer, menu, skeleton, error and empty-state styles follow the same system.
- Poll deadlines have an explicit `en-GB`/Asia-Kolkata format to prevent locale-dependent server/client text. Post open/share labels correctly identify the author in community posts.

## Automated checks

| Check | Result |
| --- | --- |
| ESLint | Passed |
| TypeScript `tsc --noEmit` | Passed |
| Vitest | 58 tests passed across 3 files |
| Next.js production build | Passed, all routes compiled |
| `git diff --check` | Passed |
| Encoding scan | No mojibake patterns found in active app/component text |

The pnpm launcher could not verify its package-manager registry signature in this environment, so checks used the already installed CLI entry points through Node. The first sandboxed build could not fetch Manrope. The build passed after granting network access. An isolated review directory initially entered Tailwind/ESLint scans; explicit exclusions resolved this. Neither issue remains in the final build.

## Browser checks

Inspected near 390×844, 768×1024 and 1440×1000. Confirmed no horizontal page overflow in inspected public screens and shared conversation fixtures. Reviewed landing, sign-in, signup, About, mobile navigation, short/long posts, long pseudonyms, unbroken reply text, poll options, loading skeletons and validation errors.

Exercised sign-in/signup empty-form validation, password visibility, long-post expansion, poll option selection (without submitting), dialog focus trapping and Escape dismissal, and mobile drawer Escape dismissal with focus restored to the opener. The dialog fit a 390px viewport with 16px gutters.

Conversation/poll/dialog component checks used a temporary, explicitly labeled local fixture screen in the public shell. The fixture screen was removed and About restored before the final production build. Application routes continue to use live APIs and server queries. Fixture screenshots are labeled by filename and content; they are not evidence of an authenticated live feed.

Contrast calculated from canonical sRGB colors: primary text/background 16.50:1; secondary text/surface 7.99:1; secondary text/elevated 6.98:1; accent-button text 12.98:1; control border/surface 4.14:1 and control border/elevated 3.61:1; error text/surface 7.94:1. These checked combinations meet AA text or essential-control thresholds as applicable. This is not an exhaustive automated accessibility audit.

## Limits

No authenticated test session was available. Live sign-in success, email OTP delivery, posting, likes, reply/delete mutations, question acceptance/voting, membership changes, profile saves and server-confirmed poll submissions were not exercised in the browser. Existing mocked route tests passed; they do not substitute for integration testing against a migrated test database. No real campus data was mutated, no migrations were applied, and nothing was deployed.

Questions, communities, settings and authenticated profile/detail routes were reviewed in source and compiled in the production build; they were not all individually inspected with live authenticated data. On-screen keyboard behavior, screen-reader announcements and 200% text zoom still need dedicated device/accessibility review.

## Screenshots

- [Before: committed landing baseline](screenshots/landing-before-committed.jpg). Captured from an isolated copy of HEAD with dummy server configuration, not by reverting workspace edits.
- [After: landing desktop](screenshots/landing-desktop.jpg)
- [After: landing mobile](screenshots/landing-mobile.jpg)
- [After: sign-in desktop](screenshots/signin-desktop.jpg)
- [After: sign-in mobile](screenshots/signin-mobile.jpg)
- [Shared conversation components: desktop fixtures](screenshots/conversation-fixtures-desktop.jpg)
- [Shared conversation components: mobile fixtures](screenshots/conversation-fixtures-mobile.jpg)
- [Shared dialog: mobile fixture](screenshots/dialog-mobile.jpg)

See [design-system.md](design-system.md) for reusable rules and local review commands.

## Follow-up: isolated application flow review

After the initial pass, a separate copy in `/tmp/cipher-flow-review` was run with an in-memory simulated API, a test identity, and a visible fixture banner. Production routes, session verification, API handlers and Prisma integration were not replaced in this repository. The simulated API verified UI response handling; it did not verify actual backend contracts, permissions, database constraints or email delivery.

Inspected the real question list/detail, community list/detail, profile, settings, feed, post thread and poll screens in that copy. Exercised:

- Question filters and empty states, question creation with navigation to its detail, answer submission, and accepted-answer updates.
- Community join with a confirmed member-count update and navigation into a community.
- Posting through the actual composer, with the new post visible in the feed, and replying through the actual thread composer with reply-target reset after success.
- Bio save and the updated bio on the profile.
- Poll selection, a simulated failed vote (selection retained and error displayed), successful retry, closing a poll, and results shown after closing.
- Mobile hashtag search: focus on open, Escape return to its opener, submission to the tagged feed, and resizing an open search to tablet width.
- Account menu navigation to the profile.

Reflow checks included 320px, 390px, 768px and 1440px. No horizontal overflow was observed in the inspected layouts. The narrow header uses a compact brand mark below 380px while preserving its accessible name. Search remains in normal header flow at tablet/desktop widths. Search and select text use 16px on mobile to avoid small-field text; actual mobile keyboard behavior still needs device testing.

Fixes made during this pass: search focus/Escape handling and breakpoint layout; reduced excess space above question details; correct singular/plural labels; accurate upvote/remove-upvote accessible names; filter-specific empty copy; community visibility described as campus-visible; action-specific poll confirmation text; nonwrapping result totals.

Lint, TypeScript, all 58 regression tests, the production build and whitespace checks passed again after the follow-up changes. Browser fixture checks do not remove the live integration limitations documented above. No real campus records were created, changed or deleted.

Additional screenshots (all explicitly simulated data):

- [Created question, desktop](screenshots/question-created-flow-desktop.jpg)
- [Question detail, mobile](screenshots/question-detail-flow-mobile.jpg)
- [Community membership, mobile](screenshots/community-flow-mobile.jpg)
- [Composer, mobile](screenshots/composer-flow-mobile.jpg)
- [Reply thread, mobile](screenshots/reply-flow-mobile.jpg)
- [Settings, mobile](screenshots/settings-flow-mobile.jpg)
- [Closed poll results, mobile](screenshots/poll-results-flow-mobile.jpg)
- [Hashtag search, mobile](screenshots/search-flow-mobile.jpg)
