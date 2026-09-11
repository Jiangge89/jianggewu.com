# jacksite → personal notebook

Imported the current local working tree of `~/Documents/jacksite`, including its
uncommitted articles and edits. The source repository was not modified.

- All 149 Markdown files under `content/docs/` now live in `src/content/blog/`.
  This includes 110 regular notes and 39 index files (including the old docs root).
- The original Hugo homepage is archived in `jacksite-original-home.md`; the new
  Blog homepage replaces its presentation. The old docs root text remains in the
  content collection, while `/blog/` provides the new entry point.
- The standalone 13F report lives in `public/blog-assets/invest/` and its iframe
  and full-screen link point there.
- Six Hugo `details` shortcodes became native HTML details/summary elements.
- Repaired the algorithm overview's literal `\1` links using the actual article
  filenames; converted relative article links to absolute `/blog/` paths.
- Timeline styles now follow the personal site's class-based theme toggle.
- Preserved filename case, titles, dates, ordering, and tags. No publication or
  update dates were invented. Empty sections are hidden from the browsing tree,
  but their pages still exist.

`jacksite-url-map.json` records the old docs URLs and their new equivalents.
It is a migration reference, not a deployed redirect: the existing GitHub Pages
site remains untouched. After the new site is approved, the old repository can
publish redirect pages using this mapping. RSS and old-site redirects are left
for the follow-up publishing stage.

The one-time importer `scripts/migrate-jacksite.py` refuses to overwrite existing
blog content. Future writing should happen directly in `src/content/blog/`.
Search is a static JSON index fetched only when a reader types a query. It searches
titles, tags, and prose in Chinese and English; code blocks are omitted from the
index. No external search service or runtime backend is needed.

Validation: `npm run build`, then `python3 scripts/check-blog.py`. The checker
verifies every generated blog page's local link/asset target and fragment,
search destinations, the old-to-new route map, and shortcode conversion.
