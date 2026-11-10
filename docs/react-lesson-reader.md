# Step 8 — Authenticated lesson reader

The existing four lesson routes continue to ship a public, neutral shell. The
portal checks the account and classroom membership before requesting a lesson
payload or a Storage object. No lesson source, document, or preview fixture is
added to the published build. Apply this update on top of the local Step 7
checkout; the update does not require new dependencies or Supabase changes.

The shared React shell lazy-loads the reader. The existing authorized article
stays in an isolated document host so KaTeX markup, diagrams, layout classes,
and interactive examples can remain in their authored format. Reader-owned
slots render contents links, scroll position, copy and download controls.
Existing teaching widgets continue to load in their original order. Private
object URLs are scoped to the reader and revoked on disposal. A failed image
or optional widget leaves the article readable.

The local synthetic preview is at `/__preview__/lesson/`. It never starts
authentication and cannot download private files. Review the sample at narrow
and wide widths, then open a real lesson with a local classroom account to
verify Storage permissions and the authored widgets.
