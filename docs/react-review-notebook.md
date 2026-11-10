# Step 7 — Personal review notebook

This update layers onto the local Step 6 React migration. It keeps the existing
notebook route, paper CSS, quiz and lab evidence links, private RPCs, and draft
storage keys. It does not require a dependency, SQL, Supabase configuration, or
a deployment change.

The portal establishes identity and membership before importing the notebook
through the shared React shell entry. React renders a typed controller snapshot.
The controller owns asynchronous operations and revision guards; the draft
adapter owns browser storage. A replaced identity disposes the old controller
and prevents late responses from publishing. Session scheduling, result and
feedback remain server owned.

The lesson query filter and practice links remain valid. Local note and
reflection drafts are scoped to the existing account key. A pending answer
retains its server run ID for safe replay. Revision conflicts keep the local
text; loading a copy of the account's version does not write to the account.
The existing confirmation for leaving with an unsaved draft remains in use.

Run `npm run dev` and open `/__preview__/review/` to inspect the notebook with
samples. The fixture is served only by the development server and uses
in-memory changes. Use `/review/` for the real authenticated route.
