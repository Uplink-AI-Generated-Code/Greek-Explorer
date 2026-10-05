import { describe, expect, it } from 'vitest';
import { MOODS, STRUCTURE, TENSES_OF_MOOD, mainFormKind, whoIndex } from './tenses';

describe('tenses', () => {
  it('has the 17 mood and tense combinations of the spec', () => {
    expect(MOODS).toEqual(['indicative', 'subjunctive', 'imperative', 'conditional', 'hortative']);
    expect(MOODS.flatMap((m) => TENSES_OF_MOOD[m])).toHaveLength(17);
    expect(Object.keys(STRUCTURE)).toHaveLength(17);
  });

  it('says which stored form the lexical verb contributes', () => {
    expect(mainFormKind('indicative', 'present')).toBe('present');
    expect(mainFormKind('indicative', 'future')).toBe('present');
    expect(mainFormKind('indicative', 'futureSimple')).toBe('subjAorist');
    expect(mainFormKind('indicative', 'perfect')).toBe('base');
    expect(mainFormKind('subjunctive', 'present')).toBe('present');
    expect(mainFormKind('subjunctive', 'aorist')).toBe('subjAorist');
    expect(mainFormKind('subjunctive', 'perfect')).toBe('base');
    expect(mainFormKind('imperative', 'present')).toBe('impPresent');
    expect(mainFormKind('imperative', 'aorist')).toBe('impAorist');
    expect(mainFormKind('hortative', 'present')).toBe('present');
    expect(mainFormKind('hortative', 'aorist')).toBe('subjAorist');
    expect(mainFormKind('conditional', 'imperfect')).toBe('imperfect');
    expect(mainFormKind('conditional', 'pluperfect')).toBe('base');
  });

  it('rejects a combination that is not a Greek tense', () => {
    expect(() => mainFormKind('imperative', 'future')).toThrow('imperative future is not a Greek tense');
  });

  it('numbers the six persons 1sg 2sg 3sg 1pl 2pl 3pl', () => {
    expect(whoIndex({ person: 1, number: 'sg' })).toBe(0);
    expect(whoIndex({ person: 3, number: 'sg' })).toBe(2);
    expect(whoIndex({ person: 1, number: 'pl' })).toBe(3);
    expect(whoIndex({ person: 3, number: 'pl' })).toBe(5);
  });
});
