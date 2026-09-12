"""Check SEO metadata and sitemap consistency in the production build."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path('dist')
SITE = 'https://jianggewu.com'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta, self.canonicals, self.schemas = {}, [], []
        self.h1 = 0
        self.lang = None
        self.json_buffer = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'h1':
            self.h1 += 1
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs['href'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_buffer = ''

    def handle_data(self, data):
        if self.json_buffer is not None:
            self.json_buffer += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.json_buffer is not None:
            self.schemas.append(json.loads(self.json_buffer))
            self.json_buffer = None

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
index = ET.parse(ROOT / 'sitemap-index.xml')
sitemap_urls = set()
for loc in index.findall('.//s:loc', ns):
    sitemap = ET.parse(ROOT / urlsplit(loc.text).path.lstrip('/'))
    sitemap_urls.update(node.text for node in sitemap.findall('.//s:loc', ns))

count = excluded = articles = 0
for file in sorted(ROOT.rglob('*.html')):
    if file.is_relative_to(ROOT / 'blog-assets'):
        continue  # Standalone imported visualization, not an Astro page.
    page = Page(file.read_text())
    url = SITE + '/' + file.relative_to(ROOT).as_posix().removesuffix('index.html')
    assert page.lang in ('en', 'zh-CN'), file
    assert page.h1 >= 1, f'Missing h1: {file}'
    assert page.meta.get('description', '').strip(), file
    assert page.meta['og:locale'] == ('zh_CN' if page.lang == 'zh-CN' else 'en_US'), file
    image = urlsplit(page.meta['og:image'])
    assert image.scheme == 'https' and (ROOT / unquote(image.path).lstrip('/')).exists(), file
    if 'noindex' in page.meta.get('robots', ''):
        assert url not in sitemap_urls and not page.canonicals, file
        excluded += 1
        continue
    assert page.canonicals == [url], (file, page.canonicals, url)
    assert url in sitemap_urls, f'Missing sitemap entry: {file}'
    assert page.meta['og:url'] == url, file
    assert len(page.schemas) == 1, file
    graph = page.schemas[0]['@graph']
    if page.meta['og:type'] == 'article':
        article = next(node for node in graph if node['@type'] == 'BlogPosting')
        assert article['headline'] and article['author']['@id'], file
        assert article['inLanguage'] == page.lang, file
        assert any(node['@type'] == 'BreadcrumbList' for node in graph), file
        articles += 1
    count += 1
assert len(sitemap_urls) == count, 'Sitemap includes unexpected pages'
print(f'Passed: {count} indexable pages, {excluded} excluded pages, {articles} articles; metadata, JSON-LD, image assets and sitemap consistency.')
