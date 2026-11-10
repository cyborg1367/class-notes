# Frontend architecture during the React migration

The migration is incremental. A route can have a React shell and a legacy main
application. This is an explicit boundary, not a claim that the entire site is
already React. Existing authentication, private delivery and trusted grading stay
behind their current service contracts.

## Ownership and dependency rules

| Layer | Responsibility | Must not own |
| --- | --- | --- |
| `frontend/shell/shell-model.ts` | Validated public route data and link derivation | React, browser state, auth, network calls |
| `frontend/shell/SiteHeader.tsx`, `SiteFooter.tsx` | Semantic shell markup and component composition | Supabase clients, tokens, XP, membership decisions |
| `frontend/shell/useNavigation.ts` | Disclosure state, focus and document-event lifecycle | Persistence or remote writes |
| `frontend/course/` | Course UI and immutable view subscriptions | RPC transport, access grants or XP awards |
| `frontend/catalog/types.ts` | Shared public course/lesson types | UI, auth state or persistence |
| `frontend/home/domain/` | Public publication summaries and conceptual projection | React, DOM, network or learner data |
| `frontend/home/contracts.ts` | Homepage view DTO and action port | Supabase client, tokens or user identity payloads |
| `frontend/home/` | Homepage composition, controls and React-owned reveal motion | OAuth SDK calls or direct mutations by legacy renderers |
| `web/assets/home-service.mjs` | Connect the minimal auth presentation/action port to the existing auth owner | Rendering, private reads, XP or token storage |
| `web/assets/course-service.mjs` | Project server state to course DTOs; guard async ownership | React markup |
| `web/assets/site-shell-adapter.mjs` | Wait for the ESM shell before legacy services attach | Session, network, UI rendering |
| `frontend/account/` | Shared account UI, menu/dialog focus and lifecycle, immutable subscriptions | SDK access, tokens, persistence or authorization |
| `web/assets/account-model.mjs`, `account-controller.mjs` | Project identity, guard actions/owner races and safe continuation URLs | React or SDK calls |
| `web/assets/sign-out-service.mjs` | Existing save/confirm/sign-out sequence | Rendering or deciding whether a lesson is authorized |
| `frontend/dashboard/` | Typed dashboard views, learning path, bookmarks and result disclosure | SDK access or authorization |
| `frontend/dashboard/dashboard-controller.mjs` | Project authenticated state to dashboard views and discard stale responses | React and DOM mutation |
| `web/assets/dashboard-model.mjs` | Pure projection of lab snapshots, quiz receipts and study history | Storage access, network, XP awards |
| `web/assets/portal.js` | Existing auth/RPC composition and private-page routing | Mutations inside React-owned route content |
| `frontend/site-shell.tsx`, `course-index.tsx` | Entry-point composition, hydration and disposal | Domain decisions |

Components do not receive Supabase clients or session tokens. UI visibility never
replaces authorization. XP continues to be granted and checked by the server.
View snapshots remain immutable; identity changes invalidate stale operations.

## Temporary legacy integration boundary

The account menu, compact lab account and account page are React-owned in step 5.
One account runtime per document shares an immutable view channel across their
roots; SSR creates a fresh neutral controller per route. Identity snapshots contain
only display name, email, initial and safe HTTPS avatar URL. User IDs stay private
to the controller's async ownership guard; tokens are never passed to components.

The existing portal is the only SDK/auth owner. The account controller delegates
sign-in/out to it and deduplicates pending actions. Sign-out retains the exact
save/timeout/explicit-confirm/auth sequence in a separate service. Switching users
invalidates old confirmations and completions. React actions are marked so the
legacy delegated gate-link bridge cannot also execute the same click.

Only opaque presence and notification slots retain legacy child DOM. React owns
the wrapper, while the named service owns its contents. Presence uses
`data-shell-presence-slot` and `data-account-presence-slot`; notifications use
`data-notification-anchor`. Do not put React children or changing HTML into these
slots. Startup waits for both shell and account-page hydration before services
attach. Notification attachment also runs when a new React account host appears.

Compact lab accounts keep their attachment API, but create isolated React roots
inside the legacy lab wrapper. Detached roots are pruned on updates/attachment and
all roots/listeners are released at disposal. Menu/dialog portals avoid sticky
header containment; one controller allows only one open account menu at a time.
`account-menu.mjs` is a compatibility facade, not a second HTML renderer.

The dashboard mounts after portal authorization. The dashboard controller can
use bootstrap snapshots or the existing fallback reads. Its revision guard
covers progress and the separately requested review count. The portal disposes
the old root before replacing protected content during an account change.
Bookmark persistence stays per browser and account; those values never affect XP.

## Build and delivery

Vite produces route ESM entries (`homepage.js`, `site-shell.js`, `account-page.js`, `course-index.js` and `dashboard-page.js`)
sharing one content-hashed React chunk. Course UI is requested only by course
routes. The dashboard entry is loaded only on the dashboard. There is no React CDN and no second React runtime bundled for each route.
Utility chunks may also be shared. A route loads only its main entry plus the shell.

The same components prerender and hydrate the shell on all 20 current routes and
the complete homepage and account-page main content. These have no parallel Python HTML
renderer. Its catalog snapshot is checked before publication. Bundled public
models, icons and authored frontend assets participate in stale-output detection.
Python validates generated source and catalog hashes before building public files.
Entry links use the existing shared asset fingerprint; imported chunks have
content-hashed filenames. Relative URLs work at a custom-domain root or below a
GitHub Pages project path. Route HTML remains MPA output, not an SPA fallback.

The local server serves already-built browser assets unchanged. It must not
transform classic portal.js into ESM. Generated fixture modules still use Vite's
resolver. Source edits rebuild the frontend and page output; generated assets
are excluded from rebuild triggers.

## Validation and current limits

Tests execute the actual emitted ESM graph and the classic bootstrap together in
isolated DOM contexts. They cover hydration reuse, deeply nested routes, private
main-content preservation, disclosure/focus behavior, account and presence node
ownership, startup timing, guest sign-in binding, view races and build contracts.
Homepage checks also cover pre-hydration auth, login errors/sign-out callbacks,
the landing illustration's delayed load and keyboard reset, reduced motion,
cleanup and GitHub Pages project-prefix links. Dashboard tests cover verified
XP snapshots, unknown progress, membership gating, bookmarks and the result
anchor, bootstrap retries and account changes.
VM-module support is enabled for Node tests only; it is not a browser dependency.

DOM tests do not verify browser layout, touch, zoom, virtual keyboards or real
Google callbacks. Those still require local review. The existing Auth/XP/draft
contracts are preserved; no backend schema, lesson body, Storage object, server
function or production configuration is changed by this public package.
