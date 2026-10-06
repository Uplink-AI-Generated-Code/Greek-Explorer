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
import { reviewSheet, scopeSets } from './reviewSheet';
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

  it('lists the shared verb tables before the single verbs', () => {
    const paths = files.map((f) => f.path);
    expect(paths.indexOf('verb-tables.md')).toBeLessThan(paths.indexOf('verbs/thelo.md'));
  });

  it('mentions the pending Romanian cells in the index, when there are any', () => {
    expect(files[0].content).not.toContain('Romanian cells are still pending');
    const withPending = reviewFiles({ ...input, pending: ['polys Romanian plain determiner m sg gen', 'ligos Romanian plain determiner f sg gen'] });
    expect(withPending[0].content).toContain('2 Romanian cells are still pending');
  });

  it('links to the index from every file, one level up from a verb', () => {
    expect(file('adjectives.md')).toContain('[the index](index.md)');
    expect(file('verbs/troo.md')).toContain('[the index](../index.md)');
  });

  it('says so in a file with nothing left to check', () => {
    const empty = reviewSheet(input, { id: 'x', title: 'Nothing left', lexemes: [], items: [], phrases: [], divergences: [], readings: [], groups: [] });
    expect(empty).toContain('0 records are not verified');
    expect(empty).toContain('Every record in this file is verified.');
    expect(empty).not.toContain('## Lexemes');
  });

  it('share the records between them: the counts add up to the whole', () => {
    const sum = files.slice(1).reduce((n, f) => n + f.unverified, 0);
    expect(sum).toBe(unverifiedRecords(sets).length);
    // A known count, not the code's own computation: verbs/lego.md has the 3 language flags of λέω and the phrase "What is it called?".
    expect(files.find((f) => f.path === 'verbs/lego.md')?.unverified).toBe(4);
  });

  it('list only their own records in the checklist, and every record once across the files', () => {
    const everything = new Set(unverifiedRecords(sets));
    const seen: string[] = [];
    for (const feature of REVIEW_FEATURES) {
      const content = file(`${feature.id}.md`);
      const listed = [...content.matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
      expect(listed).toEqual(unverifiedRecords(scopeSets(sets, feature)));
      seen.push(...listed);
    }
    expect(seen.sort()).toEqual([...everything].sort());
  });

  it('puts the records where a reviewer looks for them', () => {
    expect(REVIEW_FEATURES.find((f) => f.id === 'quantifiers')?.items).toContain('auxiliary-table:ro-comparative');
    expect(REVIEW_FEATURES.find((f) => f.id === 'weak-pronouns')?.items).toContain('auxiliary-table:en-clitic-order');
    expect(REVIEW_FEATURES.find((f) => f.id === 'weak-pronouns')?.divergences).toEqual(expect.arrayContaining(['pronoun-position-finite', 'pronoun-before-auxiliary']));
    expect(REVIEW_FEATURES.find((f) => f.id === 'particles-and-conjunction')?.divergences).toEqual(expect.arrayContaining(['subjunctive-negation', 'hortative-persons', 'negative-imperative']));
    const kano = REVIEW_FEATURES.find((f) => f.id === 'verbs/kano');
    expect(kano?.phrases).toContain('how-much-is-it');
    expect(kano?.divergences).toContain('price-idiom');
    expect(REVIEW_FEATURES.find((f) => f.id === 'verbs/mporei')?.phrases).toContain('may-have-eaten');
    expect(REVIEW_FEATURES.find((f) => f.id === 'verbs/lego')?.phrases).toContain('what-is-it-called');
    expect(REVIEW_FEATURES.find((f) => f.id === 'verbs/eimai')?.readings).toContain('irregular-be');
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
    expect(file('verbs/dino.md')).not.toContain('## Phrases');
    expect(file('verbs/dino.md')).not.toContain('## Comparison notes');
    expect(file('verbs/dino.md')).toContain('## Lexemes');
    expect(file('adjectives.md')).not.toContain('## Form groups');
    expect(file('weak-pronouns.md')).toContain('## Form groups');
  });

  it('print the generated sections where they belong', () => {
    expect(file('possessives.md')).toContain('## Noun possessors (generated)');
    expect(file('nouns-and-article.md')).not.toContain('## Noun possessors (generated)');
    expect(file('possessives.md')).toContain('in the order of nouns-and-article.md');
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
