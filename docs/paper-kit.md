# Compact paper interface

The shared visual layer follows the approved compact dashboard direction:
off-white paper, forest-green actions, restrained ochre accents, small cut-paper
icons and quiet information surfaces. Learning state remains server-owned.

## Shared files

- `web/assets/paper-kit.css` is the final stylesheet in every page shell.
  It contains the shared tokens, components, page adaptations and breakpoints.
- `web/assets/paper-icons.mjs` is a pure SVG renderer. Icons have fixed geometry,
  no image downloads, filters, fonts or external dependencies. They are
  decorative; links and controls retain their existing accessible names.
- Static navigation icons are emitted directly in the HTML. Account menus,
  dashboard, notebook, notices and lab tools reuse the same icon renderer.

Keep the existing build fingerprint mechanism. ESM consumers pass their own
URL query to the shared icon module. Do not introduce independent asset versions.

## Visual rules

| Element | Rule |
| --- | --- |
| Utility icons | 18–24 px; clear solid silhouettes |
| Section marks | At most 28 px |
| Achievement icons | 36 px with separate real text labels |
| Main surfaces | `#fffaf0`, thin `#d3cbb6` rules, 3–4 px corners |
| Main action | `#18564e`; off-white text; shallow shadow |
| Text | `#24241f`; secondary `#596253` |
| Accent | `#c9a058`; never the only indication of completion |
| Desktop content | 1200 px maximum; compact, consistent spacing |
| Lab workspace | Full available width; existing split controls retained |

Detailed illustrations are not used as dashboard card ornaments. The interactive
feature-space figure, teaching figures and instructor photograph retain their
actual functions. Do not apply icon sizing rules to plots or mathematical SVGs.

Reading retains the existing hero and teaching figure, start-reading control,
three-point strip, active table of contents, copyable code, mathematical content
and end-of-lesson resources. Reading prose remains 17 px (16 px on small screens).
Lab code, highlighted overlay, line numbers and console remain 12 px; task prose
remains 16 px. Editor line metrics and scroll ownership are not redefined.

## Responsive behavior

- Below 1100 px, the shared header uses the existing keyboard-accessible menu.
- On narrow screens, action rows wrap, dashboard cards stack and the lesson
  table scrolls horizontally within its own wrapper.
- Notebook, notification, account and lab interactions retain their original
  controls and focus behavior. Touch actions keep useful target sizes.
- Visible focus indicators, reduced-motion handling and print overrides remain.

## Scope and validation

This is a frontend presentation update. It requires no SQL, Edge Function changes
or provider configuration. Catalogue IDs, private content, grading, XP receipts,
drafts, server progress, tutor behavior and database state are unchanged.

Run the normal build, link/privacy checks, Python tests and Node tests. Local
integration verification also exercises real modules through Linkedom with mocked
RPCs: account lifecycle, all three lab stories/imports/tutor tabs/splitters,
notebook recovery and notices. Static layout inspection uses WeasyPrint with
emulated media widths; it is not a native browser screenshot or production test.

Deployment follows the existing GitHub Pages pipeline. Merge the update's `web`
and `docs` directories into the existing checkout without deleting other files.
Review the diff before committing; do not upload demo fixtures or private code.
