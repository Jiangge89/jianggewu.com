"""One-time import. Refuses to overwrite an existing content directory."""
from pathlib import Path
import re, shutil, html, json, sys
source = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / 'Documents/jacksite'
target = Path('src/content/blog')
if any(target.iterdir()):
    raise SystemExit('Blog content already exists; refusing to overwrite edits.')
links = []
for original in sorted((source / 'content/docs').rglob('*.md')):
    relative = original.relative_to(source / 'content/docs')
    content = original.read_text()
    content = re.sub(r'\{\{< details "([^"]+)" >\}\}', lambda m: '<details>\n<summary>' + html.escape(m[1]) + '</summary>\n', content)
    content = content.replace('{{< /details >}}', '\n</details>')
    content = content.replace('/jacksite/invest/13f-q2-2026.html', '/blog-assets/invest/13f-q2-2026.html')
    content = content.replace('<iframe ', '<iframe title="Q2 2026 13F fund analysis" loading="lazy" ')
    def rewrite(m):
        label, url = m.groups()
        if url == r'top-questions/\1/':
            slug = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
            slug = {'range-sum-query': 'prefix-sums', 'longest-substring-without-repeating-characters': 'longest-substring-without-repeating', 'maxcounters': 'max-counters'}.get(slug, slug)
            url = 'top-questions/' + slug + '/'
        if not re.match(r'(?:[a-z]+:|/|#)', url):
            destination = relative.parent / url.rstrip('/')
            if not ((source/'content/docs'/destination).with_suffix('.md').exists() or (source/'content/docs'/destination/'_index.md').exists()):
                raise ValueError(f'Unknown link: {relative}: {url}')
            url = '/blog/' + destination.as_posix().removesuffix('.md') + '/'
        return '[' + label + '](' + url + ')'
    content = re.sub(r'\[([^\]]*)\]\(([^)]+)\)', rewrite, content)
    if relative.as_posix() == 'timeline/_index.md':
        # Follow the portfolio theme toggle, rather than Hextra's data-theme.
        while '@media (prefers-color-scheme: dark)' in content:
            start = content.index('@media (prefers-color-scheme: dark)')
            opening = content.index('{', start)
            depth, end = 1, opening + 1
            while depth:
                depth += (content[end] == '{') - (content[end] == '}')
                end += 1
            content = content[:start] + content[end:]
        content = content.replace(':root, :root[data-theme="light"]', '.blog-prose .tl').replace(':root[data-theme="dark"]', '.dark .blog-prose .tl')
    output = target / relative
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content)
    slug = relative.as_posix().removesuffix('.md').removesuffix('_index').rstrip('/')
    links.append({'old': '/jacksite/docs/' + (slug + '/' if slug else ''), 'new': '/blog/' + (slug + '/' if slug else '')})
shutil.copytree(source/'static', Path('public/blog-assets'), dirs_exist_ok=True)
shutil.copyfile(source/'content/_index.md', 'docs/jacksite-original-home.md')
Path('docs/jacksite-url-map.json').write_text(json.dumps(links, ensure_ascii=False, indent=2)+'\n')
print(f'Imported {len(links)} Markdown files and static assets; original homepage archived in docs/.')
