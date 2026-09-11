import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'blog'>;
export const isSection = (entry: Entry) => entry.id.endsWith('_index');
export const slug = (entry: Entry) => entry.id.replace(/\/?_index$/, '');
export const href = (entry: Entry) => `/blog/${slug(entry)}${slug(entry) ? '/' : ''}`;
export const parent = (entry: Entry) => slug(entry).split('/').slice(0, -1).join('/');
export const sectionName = (entry: Entry) => ({ tech: 'Technology', invest: 'Investing', reading: 'Reading', about: 'About the author', timeline: 'Timeline' }[entry.id.split('/')[0]] ?? 'Notes');
export const order = (a: Entry, b: Entry) => a.data.weight - b.data.weight || a.data.title.localeCompare(b.data.title);
export const dated = (entry: Entry) => entry.data.updated ?? entry.data.date;
export const recent = (a: Entry, b: Entry) => (dated(b)?.getTime() ?? 0) - (dated(a)?.getTime() ?? 0) || order(a, b);
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'Asia/Singapore' }).format(date);
export const plainText = (body = '') => body
  .replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')
  .replace(/```[^\n]*\n[\s\S]*?```/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/^---+$/gm, ' ')
  .replace(/[#*`>|_]/g, ' ').replace(/\s+/g, ' ').trim();
export const excerpt = (entry: Entry) => entry.data.description ?? plainText(entry.body).slice(0, 155);
export async function blogEntries() {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort(order);
}
export function visibleEntries(entries: Entry[]) {
  return entries.filter(entry => slug(entry) && (!isSection(entry) || entry.body?.trim() || entries.some(other => !isSection(other) && slug(other).startsWith(slug(entry) + '/'))));
}
export const categoryDescriptions: Record<string, string> = {
  tech: 'Distributed systems, algorithms, and the craft of building software.',
  invest: 'Research, market observations, and a record of learning to invest.',
  reading: 'Ideas from books, and the connections they leave behind.',
  about: 'A little more about the person behind these notes.',
  timeline: 'Milestones and reflections along the way.',
};
