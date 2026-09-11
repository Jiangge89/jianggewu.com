import { blogEntries, visibleEntries, href, plainText, sectionName } from '../../lib/blog';
export async function GET() {
  const entries = visibleEntries(await blogEntries()).filter(entry => entry.body?.trim());
  return Response.json(entries.map(entry => ({ title: entry.data.title, url: href(entry), text: plainText(entry.body), category: `${sectionName(entry)} ${entry.data.tags.join(' ')}` })));
}
