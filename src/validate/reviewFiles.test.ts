import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { FORM_GROUPS } from '../data/form-groups';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import { READING_TEMPLATES } from '../data/readings';
import { REVIEW_FEATURES } from '../data/review-features';
import { REVIEW_ITEMS } from '../data/review';
import type { Phrase } from '../types';
import { reviewFiles, withGeneral } from './reviewFiles';
import { scopeSets } from './reviewSheet';
import { type RecordSets, unverifiedRecords } from './unverified';
import { pendingCells } from './validate';

const sets: RecordSets = {
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
};
const input = { ...sets, pending: pendingCells(LEXEMES) };
const files = reviewFiles(input);
const file = (path: string) => files.find((f) => f.path === path)?.content ?? '';

describe('the feature map', () => {
  const count = (key: 'lexemes' | 'items' | 'phrases' | 'divergences' | 'readings' | 'groups') => {
    const seen = new Map<string, number>();
    for (const f of REVIEW_FEATURES) for (const id of f[key]) seen.set(id, (seen.get(id) ?? 0) + 1);
    return seen;
  };

  it('names every record exactly once, and only records that exist', () => {
    const records: Record<string, string[]> = {
      lexemes: Object.keys(LEXEMES),
      items: REVIEW_ITEMS.map((i) => i.id),
      phrases: PHRASES.map((p) => p.id),
      divergences: DIVERGENCES.map((d) => d.id),
      readings: READING_TEMPLATES.map((t) => t.rule),
      groups: FORM_GROUPS.map((g) => g.id),
    };
    for (const [key, ids] of Object.entries(records)) {
      const seen = count(key as 'lexemes');
      expect([...seen.keys()].filter((id) => !ids.includes(id))).toEqual([]);
      expect(ids.filter((id) => seen.get(id) !== 1)).toEqual([]);
    }
  });

  it('has one file for every verb, and unique file names', () => {
    const verbs = Object.values(LEXEMES).filter((l) => l.pos === 'verb').map((l) => `verbs/${l.id}`);
    expect(verbs.every((id) => REVIEW_FEATURES.some((f) => f.id === id && f.lexemes.length === 1))).toBe(true);
    const ids = REVIEW_FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('needs no "general" file while every record is assigned, and makes one when a record is not', () => {
    expect(withGeneral(sets)).toBe(REVIEW_FEATURES);
    const stray: Phrase = { ...PHRASES[0], id: 'a-new-phrase' };
    const more = withGeneral({ ...sets, phrases: [...PHRASES, stray] });
    expect(more.at(-1)).toMatchObject({ id: 'general', phrases: ['a-new-phrase'] });
    expect(reviewFiles({ ...input, phrases: [...PHRASES, stray] }).map((f) => f.path)).toContain('general.md');
    expect(files.map((f) => f.path)).not.toContain('general.md');
  });
});

describe('the files', () => {
  it('start with an index that lists every file and the number of records left', () => {
    expect(files[0].path).toBe('index.md');
    const total = unverifiedRecords(sets).length;
    expect(files[0].content).toContain(`${total} records are not verified in ${files.length - 1} files`);
    for (const f of files.slice(1)) expect(files[0].content).toContain(`(${f.path})`);
    expect(files[0].content).toContain('| [Adjectives and participles](adjectives.md) | `adjectives.md` |');
  });

  it('share the records between them: the counts add up to the whole', () => {
    const sum = files.slice(1).reduce((n, f) => n + f.unverified, 0);
    expect(sum).toBe(unverifiedRecords(sets).length);
    for (const feature of REVIEW_FEATURES) {
      expect(files.find((f) => f.path === `${feature.id}.md`)?.unverified).toBe(unverifiedRecords(scopeSets(sets, feature)).length);
    }
  });

  it('each hold their own records only', () => {
    expect(file('adjectives.md')).toContain('# Review: Adjectives and participles');
    expect(file('adjectives.md')).toContain('### ζεστός (zestos)');
    expect(file('adjectives.md')).not.toContain('### πηδάω');
    expect(file('verbs/troo.md')).toContain('### τρώω (troo)');
    expect(file('verbs/troo.md')).not.toContain('### ζεστός');
    expect(file('verbs/troo.md')).toContain('### eat-the-bread');
    expect(file('relative-pronouns.md')).toContain('- Romanian care, dative:');
    expect(file('relative-pronouns.md')).toContain('whose (noun owned: σκύλος)');
  });

  it('leave out a section that has nothing in it', () => {
    expect(file('verbs/kano.md')).not.toContain('## Phrases');
    expect(file('verbs/kano.md')).toContain('## Comparison notes');
    expect(file('adjectives.md')).not.toContain('## Form groups');
    expect(file('weak-pronouns.md')).toContain('## Form groups');
  });

  it('print the generated sections where they belong', () => {
    expect(file('possessives.md')).toContain('## Noun possessors (generated)');
    expect(file('nouns-and-article.md')).not.toContain('## Noun possessors (generated)');
    // No Romanian cell is pending in the data today; a pending cell goes to the file of its lexeme.
    const pending = reviewFiles({ ...input, pending: ['polys Romanian plain determiner m sg gen'] });
    expect(pending.find((f) => f.path === 'quantifiers.md')?.content).toContain('- polys Romanian plain determiner m sg gen');
    expect(pending.find((f) => f.path === 'adjectives.md')?.content).not.toContain('## Pending Romanian cells');
    expect(file('quantifiers.md')).not.toContain('## Pending Romanian cells');
  });

  it('use the whole data as context: the possessive file still prints every noun with every possessor', () => {
    expect(file('possessives.md')).toContain('το σπίτι μου · το σπίτι σου · το σπίτι του · το σπίτι της · το σπίτι μας · το σπίτι σας · το σπίτι τους');
    expect(file('demonstratives.md')).toContain('αυτό το σπίτι · această casă / casa aceasta · this house');
  });
});
