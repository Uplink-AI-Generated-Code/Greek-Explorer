import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import { DIAVAZO, TILEFONO } from '../test-fixtures';
import type { Clitic, GreekVerb, SlotOf } from '../types';
import { compose, composedRich } from './compose';
import { slotProblem } from './offers';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});
const kinds = (verb: GreekVerb, slot: SlotOf<'verb'>) => compose(verb, slot).pieces.map((p) => p.kind);

describe('compose: a command with pronouns', () => {
  it('φάε το: the pronoun follows an affirmative command', () => {
    const composed = compose(getVerb('troo'), command([to]));
    expect(composed.text).toBe('φάε το');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular).toBeUndefined();
  });

  it('πλύνε το: a regular verb', () => {
    expect(compose(getVerb('pleno'), command([to])).text).toBe('πλύνε το');
  });

  it('μην το φας: the pronoun comes before a negative command, after μην', () => {
    const composed = compose(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(composed.text).toBe('μην το φας');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['negation', 'clitic', 'verb']);
  });

  it('a clitic piece carries the lexeme and slot a panel would open', () => {
    const [, piece] = compose(getVerb('troo'), command([to])).pieces;
    expect(piece).toMatchObject({
      kind: 'clitic',
      text: 'το',
      lexeme: 'clitic',
      slot: { pos: 'clitic', role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' },
    });
  });

  it('the plural and the present imperative: φάτε το, τρώε το', () => {
    expect(compose(getVerb('troo'), command([to], { number: 'pl' })).text).toBe('φάτε το');
    expect(compose(getVerb('troo'), command([to], { tense: 'present' })).text).toBe('τρώε το');
  });

  it('colours the pronoun with its own role', () => {
    const rich = composedRich(compose(getVerb('troo'), command([to])));
    expect(rich.map((s) => s.role)).toEqual(['stem', 'ending', 'plain', 'clitic']);
  });
});

describe('compose: the stress rule', () => {
  it('δώσε μου: three syllables, no second accent', () => {
    expect(compose(getVerb('dino'), command([mou])).text).toBe('δώσε μου');
  });

  it('δώσε μού το: two pronouns push the stress to the fourth-last syllable (phrase 36)', () => {
    const composed = compose(getVerb('dino'), command([mou, to]));
    expect(composed.text).toBe('δώσε μού το');
    expect(composed.extraAccent).toEqual({ pieceIndex: 1 });
    expect(composed.irregular?.rule).toBe('clitic-stress');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic', 'clitic']);
  });

  it('τηλεφώνησέ μου: the accent falls on the verb (unit test only, spec 4.3)', () => {
    const composed = compose(TILEFONO, command([mou]));
    expect(composed.text).toBe('τηλεφώνησέ μου');
    expect(composed.extraAccent).toEqual({ pieceIndex: 0 });
    expect(kinds(TILEFONO, command([mou]))).toEqual(['verb', 'clitic']);
  });

  it('διάβασέ μου το (unit test only)', () => {
    const composed = compose(DIAVAZO, command([mou, to]));
    expect(composed.text).toBe('διάβασέ μου το');
    expect(composed.extraAccent).toEqual({ pieceIndex: 0 });
  });

  it('a negative command has no stress problem: the pronouns are in front', () => {
    const composed = compose(getVerb('dino'), command([mou, to], { polarity: 'negative' }));
    expect(composed.text).toBe('μη μου το δώσεις');
    expect(composed.extraAccent).toBeUndefined();
  });
});

describe('δίνω', () => {
  const slot = (mood: SlotOf<'verb'>['mood'], tense: SlotOf<'verb'>['tense'], person: 1 | 2 | 3 = 1, number: 'sg' | 'pl' = 'sg') =>
    ({ pos: 'verb', person, number, mood, tense, voice: 'active' }) as SlotOf<'verb'>;
  it.each([
    ['indicative', 'present', 1, 'sg', 'δίνω'],
    ['indicative', 'imperfect', 1, 'sg', 'έδινα'],
    ['indicative', 'imperfect', 1, 'pl', 'δίναμε'],
    ['indicative', 'aorist', 1, 'sg', 'έδωσα'],
    ['indicative', 'aorist', 1, 'pl', 'δώσαμε'],
    ['indicative', 'futureSimple', 1, 'sg', 'θα δώσω'],
    ['indicative', 'perfect', 1, 'sg', 'έχω δώσει'],
    ['imperative', 'aorist', 2, 'sg', 'δώσε'],
    ['imperative', 'aorist', 2, 'pl', 'δώστε'],
    ['imperative', 'present', 2, 'sg', 'δίνε'],
    ['imperative', 'present', 2, 'pl', 'δίνετε'],
  ] as const)('%s %s %s%s -> %s', (mood, tense, person, number, expected) => {
    expect(compose(getVerb('dino'), slot(mood, tense, person, number)).text).toBe(expected);
  });
});

describe('slotProblem', () => {
  const troo = getVerb('troo');
  const dino = getVerb('dino');
  it('accepts no pronouns, one pronoun and an indirect + direct pair', () => {
    expect(slotProblem(troo, command([]))).toBeNull();
    expect(slotProblem(troo, command([to]))).toBeNull();
    expect(slotProblem(dino, command([mou, to]))).toBeNull();
    expect(slotProblem(dino, command([mou]))).toBeNull();
  });
  it('accepts pronouns outside a command, but not a short form, and not with a verb that takes no object', () => {
    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present' }))).toBeNull();
    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present', shortForm: true }))).toMatch(
      /only with a command/,
    );
    expect(slotProblem(getVerb('pao'), command([to], { mood: 'indicative', tense: 'present' }))).toMatch(/takes no object/);
    expect(slotProblem(getVerb('pleno'), command([to], { mood: 'indicative', tense: 'present', voice: 'mediopassive' }))).toMatch(
      /takes no object/,
    );
  });
  it('refuses three pronouns, the wrong order, a missing gender and an indirect object the verb cannot take', () => {
    expect(slotProblem(dino, command([mou, to, to]))).toMatch(/at most two/);
    expect(slotProblem(dino, command([to, mou]))).toMatch(/indirect object and then a direct object/);
    expect(slotProblem(troo, command([{ role: 'object', person: 3, number: 'sg' }]))).toMatch(/needs a gender/);
    expect(slotProblem(troo, command([mou]))).toMatch(/takes no indirect object/);
  });
  it('compose refuses what slotProblem refuses', () => {
    expect(() => compose(troo, command([mou]))).toThrow(/takes no indirect object/);
  });
});
