import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Clitic, Level, Slot } from '../types';
import { DIVERGENCES } from './divergences';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const verb = (mood: string, tense: string, clitics?: Clitic[]): Slot =>
  ({ pos: 'verb', person: 1, number: 'sg', mood, tense, voice: 'active', ...(clitics ? { clitics } : {}) }) as Slot;
const ids = (slot: Slot, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'verb', 'troo', level, slot).map((d) => d.id);

describe('the comparison notes for pronouns in every form', () => {
  it('the position note shows for a pronoun in any mood but the imperative', () => {
    expect(ids(verb('indicative', 'present', [IT]))).toContain('pronoun-position-finite');
    expect(ids(verb('hortative', 'aorist', [IT]))).toContain('pronoun-position-finite');
    expect(ids(verb('imperative', 'aorist', [IT]))).not.toContain('pronoun-position-finite');
    expect(ids(verb('indicative', 'present'))).not.toContain('pronoun-position-finite');
  });

  it('the gender and order notes show in the other moods too', () => {
    const TWO: Clitic[] = [{ role: 'indirect', person: 1, number: 'sg' }, IT];
    expect(ids(verb('indicative', 'present', [IT]))).toContain('clitic-gender');
    expect(ids(verb('indicative', 'present', [IT]))).not.toContain('clitic-order');
    expect(ids(verb('indicative', 'futureSimple', TWO))).toContain('clitic-order');
  });

  it('the auxiliary note shows only in the perfect tenses, and only at Improver', () => {
    expect(ids(verb('indicative', 'perfect', [IT]))).toContain('pronoun-before-auxiliary');
    expect(ids(verb('conditional', 'pluperfect', [IT]))).toContain('pronoun-before-auxiliary');
    expect(ids(verb('indicative', 'aorist', [IT]))).not.toContain('pronoun-before-auxiliary');
    expect(ids(verb('indicative', 'perfect', [IT]), 'beginner')).not.toContain('pronoun-before-auxiliary');
  });
});
