# Cipher

Cipher is a campus discussion app for IIIT Nagpur students. Students verify an
institute email with an OTP, choose a public handle, and share posts, hashtags,
likes, and threaded comments. Sessions use a signed JWT in an HttpOnly cookie.

The app uses Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma,
PostgreSQL, and Nodemailer with Gmail. Route tests run in Vitest with mocked
Prisma and mail adapters.

## Local setup

Use Node.js 22 LTS (minimum 20.19), pnpm 10.26.1, and a running PostgreSQL database.
The pinned pnpm version is recorded in `package.json`.

```sh
corepack enable
cp .env.example .env
```

Edit `.env` before continuing:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the application. |
| `DIRECT_URL` | Direct, unpooled PostgreSQL connection used by Prisma migrations. For a local database, use the same URL as `DATABASE_URL`. |
| `JWT_SECRET` | Random secret used to sign and verify sessions. Generate one with `openssl rand -hex 32`. |
| `EMAIL_USER` | Gmail address that sends signup OTPs. |
| `EMAIL_PASS` | Gmail app password for that account. |

Next.js and Prisma CLI both load `.env`. Server configuration is validated when
server modules are imported, so the application and build need all required
values. Keep `.env` private; `.env.example` contains placeholders only.

For Gmail, enable 2-Step Verification and create an app password. Put the app
password in `EMAIL_PASS`, rather than your normal Google account password.
Managed school/work accounts may restrict app passwords; see
[Google's app-password instructions](https://support.google.com/accounts/answer/185833).

Create the database named in your connection URLs, then run:

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

`pnpm install` generates Prisma Client. `pnpm db:migrate` runs
`prisma migrate dev`, applying existing migrations and creating a new migration
when your local schema changes. Open [localhost:3000](http://localhost:3000).
Signup accepts institute addresses such as `bt22cse001@iiitn.ac.in` for the
supported CSE, CSA, CSD, CSH, ECE, and IOT branches.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm lint` | Run ESLint across the repository. |
| `pnpm typecheck` | Run `tsc --noEmit`. |
| `pnpm test` | Run the Vitest regression suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm test:security` | Run the auth, route, and security regression file. |
| `pnpm db:migrate` | Run Prisma development migrations. |
| `pnpm db:studio` | Open Prisma Studio for the configured database. |
| `pnpm build` | Create the production build. |
| `pnpm start` | Serve the production build. |

## Tests and CI

Tests call the actual route handlers with Next.js requests. Prisma and SMTP are
mocked, and Vitest supplies test-only environment values; no database, Gmail
account, or real secrets are needed for `pnpm test`. Coverage includes OTP hashing,
resend throttling and lockout, verification expiry, signup/signin cookies,
comment ownership, like/unlike behavior, cursor pagination, and batched tags.
Database constraints and migration execution still need verification against
PostgreSQL when changing the schema.

Every pull request runs dependency installation, lint, typecheck, tests, and a
production build in GitHub Actions. CI uses dummy environment values and never
applies migrations or sends mail. The build fetches the app's Google fonts and
requires network access.

## Project layout

- `app/(auth)` — signup and signin pages.
- `app/(main)` — feed, individual posts, and other campus pages.
- `app/api/v1` — auth, posts, comments, likes, and trending route handlers.
- `components` — UI and feed components.
- `lib/session.ts` and `lib/withAuth.ts` — session cookies and authenticated handlers.
- `lib/validation` — shared request schemas and types.
- `lib/posts.ts` — post queries and DTO serialization.
- `lib/mail.ts` — Gmail transport and OTP email template.
- `prisma` — database schema and versioned migrations.
- `tests` — Vitest regression tests.
- `proxy.ts` — public-route allowlist and session protection.

Post lists use cursor pagination:
`GET /api/v1/posts?limit=10&cursor=<last-id>`. Omit `cursor` for the first request,
then use `pagination.nextCursor` while `pagination.hasMore` is true.

## Deployment

Install development dependencies during the build stage: Prisma CLI, TypeScript,
and the lint/test tooling live in `devDependencies`. Configure the environment,
then run:

```sh
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
pnpm build
pnpm start
```

Use `migrate deploy` for deployments; `db:migrate` is for local development.
Production session cookies require HTTPS. The security migration invalidates
existing OTPs and verified signup grants, so pending signups must request a new
code when upgrading from the original schema. The reply-cascade and query-index
migrations must also be applied before serving the updated routes.

## Profiles, communities, Q&A and polls

Set `ADMIN_EMAILS=bt23csa041@iiitn.ac.in` in your local `.env` and hosting
configuration (comma-separated for multiple admins), then restart the server.
The default is empty: no account gets admin rights until configured. Admin status
is derived on the server from the authenticated email for every admin request.

The round-two schema migration is
`20261028030000_profiles_communities_questions_polls`. It was generated offline;
apply it yourself with `pnpm exec prisma migrate deploy` (or `pnpm db:migrate`
for local development). No migration has been applied to the real database by
this task. The schema adds a rename timestamp, Q&A with answer votes, and polls
with immutable ballots. Existing community tables are reused, and their member counters are reconciled from membership rows.

- `/u/[handle]` shows a pseudonym, bio, join month and posts. Email and year are
  excluded from the public projection. `/settings` edits bio and handle, with
  roll-number rejection and a server-enforced 30-day rename cooldown.
- Admins create communities at `/community`; students join, leave and post to
  joined communities. Members-only posts, comments, likes and trending are
  filtered by membership. Community membership is open to campus accounts.
- `/questions` supports tagged questions, answers, upvotes, and asker-only
  acceptance. "Unanswered" means there are no answers yet.
- `/polls` supports admin-created single/multiple-choice polls lasting up to
  30 days. A submitted ballot cannot be changed. Results and voter totals are
  omitted from API responses until closing, including responses to admins.
  Multiple-choice percentages use the number of voters as denominator.
- Authenticated requests use `apiFetch`; expired sessions clear persisted state
  and return to signin with a validated local `next` destination.

`tests/mvp.test.js` covers the admin gates, poll rules, username constraints,
question acceptance/votes and membership counts. Signed-in browser verification
requires applying the migration and signing in yourself; the agent does not enter
your password. Admin behavior can also be verified through the mocked API tests.
