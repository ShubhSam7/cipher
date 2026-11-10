# Cipher implementation audit

Reviewed 10 November 2026 against the working tree and recent commits. The
workspace already contained a visual refresh, light/dark themes and animation
work; those changes were preserved. The priorities below are proposed next
steps based on the code, rather than a previously agreed product specification.

## Implemented in this pass

- Post text search in the header and feed, alongside exact `#hashtag` searches.
  Search terms are bounded to 100 characters, and SQL pattern characters are
  treated literally. Existing membership visibility checks remain in the query.
- Question search across titles and bodies, an accepted-answer filter, readable
  body previews, filter explanations, and URL-backed search/filter state.
- Question pagination appends pages and shows a single Load more control on the
  last loaded page. Reaching the end produces an explicit status message.
- Community search across names, slugs and descriptions, combined with a Joined
  filter, result counts and filter-specific empty states.
- The post composer defaults to a viewed community only for a confirmed member.
  Students can explicitly switch to the campus feed. Members-only destinations
  show a visibility hint, and loading/errors prevent an unresolved community
  destination from silently becoming a campus post.
- Shared API loading state belongs to the current request. Changing URLs hides
  data from the previous URL, reopening requests shows pending state, and
  aborted requests cannot overwrite current results.
- Responsive search controls, clear actions, search summaries and a direct link
  from post search to matching questions, using the existing visual tokens.

## Remaining work

| Priority | Gap and evidence | Concrete next step |
| --- | --- | --- |
| High | Account recovery is absent. [Signin](../app/(auth)/signin/page.tsx), [signup](../app/api/v1/signup/route.ts) and [settings](../app/(main)/settings/page.tsx) have no password reset/change flow. | Add single-use, expiring recovery tokens and verified-email recovery, then account settings for changing passwords and invalidating old sessions. |
| High | [Signin](../app/api/v1/signin/route.ts) has password verification but no request throttling. Signup already has per-email OTP resend limits and attempt lockout. | Add shared, deployment-safe rate limits for signin, aggregate OTP abuse and content mutations, with Retry-After feedback. |
| High | No reporting/blocking model or moderation queue exists in [the schema](../prisma/schema.prisma). Community roles are stored but have no management interface. | Define reporting categories, moderator permissions and review actions; build a reporting flow and auditable admin queue. |
| High | [The posts API](../app/api/v1/posts/route.ts) only supports GET/POST. [PostCard](../components/feed/PostCard.tsx) has no author edit/delete actions. | Add ownership-checked update/delete endpoints, hashtag reconciliation, deletion confirmation and consistent feed/detail updates. |
| High | [Auth state](../lib/store/authStore.ts) clears locally even if logout fails, while [the UI store](../lib/store/uiStore.ts) retains newly created post DTOs across signout. | Confirm cookie logout before reporting success and reset session-specific UI data when auth is cleared or the account changes. |
| Medium | Media arrays exist in [the schema](../prisma/schema.prisma) and [post validation](../lib/validation/posts.ts), but the composer and post card do not upload or render them. | Add authenticated uploads, size/type checks, storage cleanup, accessible previews and safe rendering before exposing attachments. |
| Medium | `CommentLike` exists in [the schema](../prisma/schema.prisma) without a comment-like API or controls. | Either implement idempotent voting with counts and ownership/visibility tests, or remove the unused model in a separate migration. |
| Medium | Notifications and saved posts have no models, endpoints or screens. | Choose notification events and delivery preferences, then implement an inbox and server-backed saved-post collection. |
| Medium | [Polls](../app/api/v1/polls/route.ts) stop at 100 active and 100 ended rows; [communities](../app/api/v1/communities/route.ts) load the entire directory. Text search currently uses substring filters. | Add cursor-backed directories/poll history and measure search queries on realistic data before adding trigram or full-text indexes. |
| Medium | [Profiles](../app/(main)/u/[handle]/page.tsx) show an unfiltered post count while their feed applies visibility rules. | Count only posts visible to the viewer, or label the count as all authored posts after deciding the intended privacy behavior. |
| Verification | Route tests mock Prisma/SMTP. Existing migration application and live database/email behavior are not established by these checks. | Run migrations and end-to-end signup, community visibility, posting, voting and recovery checks against a disposable PostgreSQL database and test mailbox. |

## Verification for this pass

- TypeScript, ESLint and whitespace checks pass.
- 72 tests pass across five files, including 13 new discovery cases covering
  request validation, literal punctuation, authentication, composed visibility
  filters, cursor metadata, accepted/unanswered semantics and directory filters.
- The production build passes with dummy configuration and network access for
  the configured Google Font. No database migration was required for this pass.
- An isolated copy at `/tmp/cipher-discovery-review` uses labeled simulated data
  and no real database connection. Browser checks verified question pagination
  (10 → 20 → 23 rows), combined search/answered filters, joined-community
  description search, mobile text/hashtag navigation and contextual composer
  selection with an explicit campus-feed override.
- Inspected question controls at 320px, 390px and 1280px, community controls and
  composer at 320px, and light/dark question views. No horizontal overflow was
  observed in those checks. This is not a complete accessibility/device audit.
- Browser fixtures verify UI behavior, not real API/database integration. No
  real accounts were created or content published, no migration was applied,
  and nothing was deployed.

Screenshots use simulated content and a visible fixture banner:

- [Questions on mobile](screenshots/discovery-questions-fixture-mobile.jpg)
- [Questions on desktop](screenshots/discovery-questions-fixture-desktop.jpg)
