# Campus After Hours

Cipher uses one dark theme. The existing app has no light-theme setting. The redesign preserves its routes, API payloads, permissions and data integrations.

## Foundations

Canonical colors and component classes are in `app/globals.css`. Use the semantic Tailwind aliases (`background`, `card`, `popover`, `foreground`, `muted-foreground`, `primary`, `input`, `destructive`) rather than page-specific colors. The background is #111310; surfaces #1A1D17 and #24291F; text #F3F1E8 and #ADB4A5; primary actions #D4ED83 with #18200D text. Input borders use the stronger `--control-border`; decorative dividers use `--border-subtle`.

Manrope is loaded once through `next/font` at weights 400, 500, 600 and 700. Use `page-title` for app headings, `section-title` for sections, `content-body` for reading, and `metadata` for timestamps and supporting labels. Body text is 16px/1.55; metadata is 13px. Avoid serif, italic display text and uppercase paragraphs.

Use 4, 8, 12, 16, 24, 32 and 48px spacing. Controls use 10px radii, panels/dialogs 16px, avatars circles. Chips may be pills. Lucide is the shared icon set. Keep meaningful labels or accessible names on actions.

## Shared patterns

- `Button`, `Input`, `Textarea`, `Field`, Radix dialogs, drawers and menus own control behavior and appearance. Primary actions use the default Button variant; secondary actions use outline or ghost. Avoid per-page primary button overrides.
- `page-stack` controls a 700px reading column. `page-header`, `page-description`, `panel`, `content-row`, `filter-tabs`, `tag-link`, `status-badge`, `feedback-panel` and `empty-state` are reusable hierarchy and state patterns.
- The desktop shell has a 200px navigation rail and a reading/discovery grid. Discovery relocates below 1200px. Tablet navigation compacts at 1023px; below 768px it is a focus-managed drawer. Mobile content uses 16px gutters.
- Posts and replies use flat rows with subtle separators. Composer, polls and dialogs use contained surfaces. Reply indentation stays shallow on mobile.
- Polls display only confirmed API state. Results remain hidden until closing. Search is explicitly hashtag search. Question filters mean all questions or those with no answers; accepted-answer status comes from the API.
- Public illustrative posts are labeled and contain no fabricated live activity counts. Public handles are pseudonyms; accounts remain connected to institute email. Do not promise complete anonymity.

## Interaction and accessibility

Key controls have 44px minimum targets. Keyboard focus uses pale lime with an offset. Selected navigation has both a surface change and an indicator; filter buttons expose pressed state; polls retain native labeled radio/checkbox inputs. Errors have text and alert semantics. Radix handles dialog trapping and Escape; the mobile drawer returns focus to its opener. Respect reduced motion, native scrolling, safe areas and dynamic viewport height.

## Local review

`CIPHER_BUILD_DIR=.next-review node node_modules/next/dist/bin/next dev --port 3100` runs an isolated review server alongside another Next instance. `.next-review` is excluded from Git, ESLint and Tailwind scanning. The default build directory remains `.next`.

No backend or schema changes are part of this redesign. Authenticated mutation checks require disposable test data; do not use real campus posts to test the interface.
