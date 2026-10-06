import { REVIEW_FEATURES } from '../data/review-features';
import type { ReviewFeature } from '../types';
import { reviewSheet, scopeSets } from './reviewSheet';
import { type RecordSets, unverifiedRecords } from './unverified';

/** One file of the split review sheet. */
export interface ReviewFile {
  /** The path inside the review folder: 'index.md', 'adjectives.md', 'verbs/troo.md'. */
  path: string;
  content: string;
  /** How many records in the file are not verified. */
  unverified: number;
}

/**
 * The features, with a last one called `general` for any record that no feature names (a new record that was never
 * assigned): a test keeps that file empty, so it shows up as soon as someone forgets to assign a record.
 */
export function withGeneral(sets: RecordSets, features: ReviewFeature[] = REVIEW_FEATURES): ReviewFeature[] {
  const named = (key: keyof Omit<ReviewFeature, 'id' | 'title'>): Set<string> => new Set(features.flatMap((f) => f[key]));
  const left = <T,>(list: T[], key: keyof Omit<ReviewFeature, 'id' | 'title'>, id: (t: T) => string): string[] =>
    list.map(id).filter((i) => !named(key).has(i));
  const general: ReviewFeature = {
    id: 'general',
    title: 'Not yet assigned to a feature',
    lexemes: Object.keys(sets.lexemes).filter((id) => !named('lexemes').has(id)),
    items: left(sets.items, 'items', (i) => i.id),
    phrases: left(sets.phrases, 'phrases', (p) => p.id),
    divergences: left(sets.divergences, 'divergences', (d) => d.id),
    readings: left(sets.templates, 'readings', (t) => t.rule),
    groups: left(sets.groups, 'groups', (g) => g.id),
  };
  const empty = [general.lexemes, general.items, general.phrases, general.divergences, general.readings, general.groups].every((l) => l.length === 0);
  return empty ? features : [...features, general];
}

/** The index, then one file per feature (the `general` file only when it has something in it). */
export function reviewFiles(sets: RecordSets & { pending: string[] }, features: ReviewFeature[] = REVIEW_FEATURES): ReviewFile[] {
  const all = withGeneral(sets, features);
  const files = all.map((feature): ReviewFile => ({
    path: `${feature.id}.md`,
    content: reviewSheet(sets, feature),
    unverified: unverifiedRecords(scopeSets(sets, feature)).length,
  }));
  const total = unverifiedRecords(sets).length;
  const rows = files.map((f, i) => `| [${all[i].title}](${f.path}) | \`${f.path}\` | ${f.unverified} |`);
  const index = [
    '# Content review: one feature at a time',
    '',
    `${total} records are not verified in ${files.length} files. Open one file, check its records against what you know, then set their \`verified\` flags in the data.`,
    'Every Greek, Romanian and English form was written from memory (spec section 9). `npm run validate -- --release` passes when every record in every file is verified.',
    '',
    '| Feature | File | Not verified |',
    '|---|---|---|',
    ...rows,
    '',
  ].join('\n');
  return [{ path: 'index.md', content: index, unverified: total }, ...files];
}
