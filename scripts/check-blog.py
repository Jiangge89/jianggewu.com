"""Validate built blog routes, anchors, assets, and migration compatibility."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
import json

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.ids = [], set()
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag in ('a', 'iframe', 'img', 'script', 'link'):
            url = attrs.get('href' if tag in ('a', 'link') else 'src')
            if url:
                self.links.append(url)

root = Path('dist')
assert (root / 'blog/index.html').exists(), 'Run npm run build first.'
pages = {file: Page(file.read_text()) for file in root.rglob('*.html')}
errors = []

def check(source, raw, base):
    url = urlsplit(urljoin('https://jianggewu.com' + base, raw))
    if url.netloc != 'jianggewu.com':
        return
    target = root / unquote(url.path).lstrip('/')
    if target.is_dir() or not target.suffix:
        target /= 'index.html'
    if not target.exists():
        errors.append(f'{source}: missing {raw}')
    elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
        errors.append(f'{source}: missing anchor {raw}')

blog_pages = [file for file in pages if file.is_relative_to(root / 'blog')]
for file in blog_pages:
    text = file.read_text()
    for pattern in ('{{< ', '{{&lt; ', '{{% ', '{{&amp;lt; '):
        assert pattern not in text, f'Unconverted shortcode: {file}'
    base = '/' + file.relative_to(root).as_posix().removesuffix('index.html')
    for url in pages[file].links:
        check(file, url, base)
for item in json.loads((root / 'blog/search.json').read_text()):
    check('search index', item['url'], '/blog/')
for item in json.loads(Path('docs/jacksite-url-map.json').read_text()):
    check('migration map', item['new'], '/blog/')
toolbox = (root / 'blog/tech/interview/system-design/toolbox/index.html').read_text()
assert toolbox.count('<summary>Quick Reference</summary>') == 6, 'Missing converted details'
assert not errors, '\n'.join(errors)
print(f'Passed: {len(blog_pages)} blog pages, local links/assets/anchors, search destinations, migration map, and 6 details blocks.')
