# React migration: local review, step 6

This is a staged migration of the existing public application. Nothing in this
package publishes the site, pushes Git or deploys a server function. Keep the
current production domain and Supabase settings unchanged during UI review.

## Step 6: Student dashboard

The dashboard uses a single lazy React root. Keep the static HTML neutral; render
personal progress only after the portal resolves the authenticated account. The
dashboard controller projects the existing membership, quiz receipts, study
history and lab snapshots into typed view states. Keep XP and completion derived
from the existing server snapshots. A missing snapshot must remain unavailable.
Dispose the React root and ignore pending work when the account changes.

Preserve the paper design and URL contracts, including `#results`, and keep the
learning path readable at narrow widths. Use the same row markup for desktop
and mobile. Keep the local bookmark filter next to the list it changes.
The independently loaded review count must not reset filters or results.

## Earlier steps

- The header account menu, compact lab account controls and `/account/` page now
  use React. The paper classes, copy, routes and server auth owner are retained.
  One account runtime per document shares sanitized identity and action state;
  SSR stays neutral and never embeds a user's identity or session.
- React owns account menus, avatar fallback, keyboard focus, viewport positioning
  and unsaved-draft confirmation. Google login and draft-aware sign-out delegate
  to the existing portal. Action guards prevent duplicate clicks, and owner changes
  cancel stale confirmations. The legacy account HTML renderer is removed.
- The portal waits for both shell and account-page hydration before adding presence
  controls. Notification widgets retain opaque child slots and are attached when
  new header/lab hosts appear. Presence and notifications are still legacy services.
  No additional backend request, dependency or authorization decision is introduced.
- The account route loads its own main entry; the entries reuse the
  shared ESM React runtime. Source freshness checks include account projection and
  controller modules. The following earlier migration steps are included:
- The entire homepage main content now uses React: the existing hero, interactive
  Gradient Descent illustration, learning strip, published courses/latest note,
  learning method, instructor teaser and dashboard callout. Its paper CSS and
  authored copy are retained.
- Homepage publication summaries have one renderer, shared by SSR and hydration.
  The previous Python HTML template is removed. Catalog-derived counts/latest-note
  links are checked independently, including growth to ten notes and escaping.
- The homepage account CTA subscribes to a minimal auth presentation DTO. Only
  the existing portal performs OAuth/sign-out. Account updates do not rebuild the
  diagram or course cards; an unavailable auth config resolves to an account
  fallback. No new auth reads or progress writes were added.
- The landing illustration loads when visible and keeps the keyboard controls
  and the paper palette.
- The course page's main content is rendered by shared React components: hero,
  resume action, lesson cards, public search/topics, current quiz receipts and the
  membership/access notice.
- The header, footer and mobile navigation use shared React components on
  all 20 routes. Explicit service slots keep legacy presence/notification DOM separate
  from React navigation. Startup waits for hydration before services attach.
- The homepage, course and shell entries share one content-hashed ESM React runtime. See
  [frontend-architecture.md](frontend-architecture.md) for dependency rules,
  ownership boundaries and the intentional temporary legacy adapters.
- Static HTML is prerendered from the same React component tree and canonical
  catalog, then hydrated. The build removes whitespace outside that tree to avoid
  hydration recovery. The catalog digest prevents silently shipping stale content.
- `PaperButton`, `CourseApplication` and the immutable view channel establish
  component/service boundaries for subsequent pages.
- The existing portal owns authentication, membership and trusted RPCs. A course
  controller projects current-course/current-quiz-version data to the renderer.
  It rejects late replies and stale account actions. React does not receive access
  tokens or a Supabase client and does not award XP.
- The login notice has explicit responsive padding and a desktop text/action row.
  Personal-results navigation is shown only for active course membership. Search,
  topic selection, count typography and footer spacing are balanced on this route.
- All text I/O in build.py, build_assets.py and check.py specifies UTF-8. The local
  runner also launches Python in UTF-8 mode, including inside a virtualenv.
- A local Vite server rebuilds source changes and reloads the page. Preview-only
  fixtures are served by development middleware; they are not copied into dist.

## Local operation

Copy public-update contents into the existing public repository root. Node.js 24
and Python 3 are required. Existing public auth configuration is retained.

```sh
npm ci
npm run dev
```

In Windows PowerShell use `npm.cmd`. Open:

- `http://127.0.0.1:5173/` for the React homepage.
- `http://127.0.0.1:5173/dashboard/` for the signed-in student dashboard.
- `http://127.0.0.1:5173/__preview__/dashboard/` for dashboard states with sample data.
- `http://127.0.0.1:5173/account/` for the React account page and sign-in/out review.
- `http://127.0.0.1:5173/machine-learning/` for the React course page.
- `http://127.0.0.1:5173/__preview__/course/?state=guest` for isolated UI review.

The dashboard preview offers in-progress, new, partial-progress and pending
membership states. It never starts the auth SDK. The course preview offers guest, member, pending, unregistered, suspended,
restricted, error and loading states. These are explicitly labeled sample data.
They neither sign in nor call Supabase, grading, membership writes or XP endpoints.
The sample request-access control changes only the local fixture to pending.

The ordinary application URL uses existing live configuration. Actual local
Google callbacks and lab grading need separate allowed-origin configuration;
do not change production settings merely to review these UI states. Public routes
and nested index.html URLs remain intact; no SPA history fallback was introduced.

### Reader behavior in local development

Fixture membership is sample UI state, never an authentication or access grant.
Clicking a lesson leaves the fixture and opens the actual protected reader. Its
body, lesson scripts, images, PDFs and notebooks still come from Supabase after
real sign-in and class authorization. The public source archive contains shells,
not a complete offline copy of those materials. A cyborgmass.ir browser session
does not automatically become a 127.0.0.1 session.

For actual local Google sign-in, add exactly
`http://127.0.0.1:5173/account/` to Supabase Authentication > URL Configuration >
Redirect URLs. Retain the production Site URL and existing redirect entries.
Then sign in at `http://127.0.0.1:5173/account/` with an authorized class account.
This allows the existing Auth/RPC reader to run; it does not configure Edge Function
CORS for local lab grading or bypass server membership checks.

The dev server serves emitted JavaScript assets byte-for-byte from dist before
Vite's module transformation. Classic scripts such as portal.js must remain classic:
Vite's dynamic-import helper injection would otherwise make them invalid. Asset
pre-transformation is disabled for this prebuilt preview; generated fixture modules
still use Vite's resolver. Relative React links in fixtures retain their original
attributes and use the course URL as the document base to avoid hydration mismatches.

`npm run build` creates the static application. `npm run check` rebuilds, checks
TypeScript, runs the Python build/check/tests and all Node tests. Source edits in
frontend or web trigger local rebuild/reload. Files in dist and .cache are generated.
Stop the server with Ctrl+C before replacing project files.

## Remaining migration

| Area | Status |
| --- | --- |
| Course, homepage, account, dashboard, shell | React |
| Notifications inbox | React island; portal owns RPC |
| Presence widget and visibility setting | React island; portal owns RPC and realtime |
| Membership/login/error cards | Shared React `GateCard`; portal decides when to show them |
| About page | React prerender; authored copy |
| Lesson reader, quizzes, review notebook, instructor panel | React |
| Coding lab chrome (frame, workspace, mission, tutor, XP) | React islands; `coding-lab.js` remains the vanilla orchestrator |
| Lesson widgets (`python-lab.js`, `space3d.js`, thresholds) | Authored vanilla; not a route migration |
| `portal.js` auth/RPC | Stays a service; not a UI renderer |
| Installable/offline PWA | Separate design; not implied by adopting React |

Reuse the component/service contracts and shared ESM runtime when migrating each
additional route; do not clone React or couple UI components to Supabase clients.
Keep the paper visual identity, independent lab stories, IDs and route contracts.

## Validation boundaries

TypeScript, static builds, existing regression tests, isolated service races and
production-bundle hydration/filter/private-view interactions are checked locally.
The DOM interaction suite is not a substitute for real browser layout, touch,
screen-reader, zoom or virtual-keyboard checks. Managed browser preview is not
available in the authoring environment; the user is reviewing this build locally.

No backend SQL, schema, Edge Function, membership record, XP record, lesson source,
private PDF/notebook, auth key or domain configuration is changed by this update.
