# Shared lesson template

The React reader renders one lesson frame: hero, right-hand contents and
reading progress, article, previous/next navigation, resources and course
footer. At 1024px and below, the in-flow outline replaces the right sidebar.
Both use the same headings and scroll measurement. On wider screens the
outline scrolls independently when needed, with the reading meter above it.

- The course index, homepage and reader use the numeric `number` in the
  public course catalog. Missing numbers fall back to authored list position,
  and ties keep authored order. The previous/next links stay within that
  course and do not wrap around.
- Each authorized lesson supplies its own hero text, illustration, highlights
  and article. The shared desktop frame places the illustration left of the
  copy; the mobile frame puts the copy first. Use the catalog's `hero_kind`
  for a reusable visualization such as the synthetic threshold figure.
  Keep teaching headings and identifiers in the article. The
  shared frame supplies the start link and keeps the existing interactive
  figures and reading anchors. No private content is included in the build.
- The shared resources card supplies the quiz route from the catalog, and the
  PDF and notebook from the authorized file references. For old documents,
  the catalog and payload metadata provide the existing fallbacks. Inline
  dataset downloads stay with the explanation that uses them.
- Do not add hand-written previous/next navigation, reading meters, or a second
  resources card to lesson content. New lessons should supply metadata and
  article content; the frame renders the shared controls.

Use `/__preview__/lesson/` for a local synthetic example. Add `?note=03`
to check the long evaluation heading or `?note=04` to check the threshold
figure. Previous/next links stay in the preview and private downloads are
disabled. Open a real lesson locally to verify private assets and teaching
widgets with an authorized account.
