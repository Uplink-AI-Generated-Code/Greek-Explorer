import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { compose, composedRich, pieceText } from './compose';
import { richText } from './segments';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const text = (id: string, slot: SlotOf<'verb'>) => compose(getVerb(id), slot).text;

describe('compose τρώω, 1st person singular, all 15 combinations (spec 6.4)', () => {
  it.each([
    ['indicative', 'present', 'τρώω'],
    ['indicative', 'imperfect', 'έτρωγα'],
    ['indicative', 'aorist', 'έφαγα'],
    ['indicative', 'future', 'θα τρώω'],
    ['indicative', 'futureSimple', 'θα φάω'],
    ['indicative', 'perfect', 'έχω φάει'],
    ['indicative', 'pluperfect', 'είχα φάει'],
    ['indicative', 'futurePerfect', 'θα έχω φάει'],
    ['subjunctive', 'present', 'να τρώω'],
    ['subjunctive', 'aorist', 'να φάω'],
    ['subjunctive', 'perfect', 'να έχω φάει'],
    ['conditional', 'imperfect', 'θα έτρωγα'],
    ['conditional', 'pluperfect', 'θα είχα φάει'],
  ] as const)('%s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('the imperatives are single words in the second person', () => {
    expect(text('troo', vs('imperative', 'aorist', 2, 'sg'))).toBe('φάε');
    expect(text('troo', vs('imperative', 'aorist', 2, 'pl'))).toBe('φάτε');
    expect(text('troo', vs('imperative', 'present', 2, 'sg'))).toBe('τρώγε');
    expect(text('troo', vs('imperative', 'present', 2, 'pl'))).toBe('τρώγετε');
  });
});

describe('compose: the auxiliary carries the person, the base form never changes', () => {
  it('έχει φάει / έχουν φάει / είχαμε φάει', () => {
    expect(text('troo', vs('indicative', 'perfect', 3, 'sg'))).toBe('έχει φάει');
    expect(text('troo', vs('indicative', 'perfect', 3, 'pl'))).toBe('έχουν φάει');
    expect(text('troo', vs('indicative', 'pluperfect', 1, 'pl'))).toBe('είχαμε φάει');
    expect(text('troo', vs('conditional', 'pluperfect', 1, 'pl'))).toBe('θα είχαμε φάει');
  });
  it('other verbs and the mediopassive', () => {
    expect(text('pidao', vs('indicative', 'perfect', 3))).toBe('έχει πηδήξει');
    expect(text('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive'))).toBe('έχω πλυθεί');
    expect(text('pleno', vs('indicative', 'perfect', 3, 'pl', 'mediopassive'))).toBe('έχουν πλυθεί');
    expect(text('thelo', vs('conditional', 'imperfect'))).toBe('θα ήθελα');
    expect(text('thelo', vs('conditional', 'pluperfect'))).toBe('θα είχα θελήσει');
    expect(text('koimamai', vs('indicative', 'future', 1, 'sg', 'mediopassive'))).toBe('θα κοιμάμαι');
    expect(text('mporei', vs('indicative', 'present', 3))).toBe('μπορεί');
  });
});

describe('compose: the pieces', () => {
  it('lists particle, auxiliary and verb in written order, each with what a panel needs', () => {
    const c = compose(getVerb('troo'), vs('indicative', 'futurePerfect'));
    expect(c.pieces.map((p) => p.kind)).toEqual(['particle', 'auxiliary', 'verb']);
    expect(c.pieces.map(pieceText)).toEqual(['θα', 'έχω', 'φάει']);
    expect(c.pieces[0]).toMatchObject({ lexeme: 'theta', slot: { pos: 'particle' } });
    expect(c.pieces[1]).toMatchObject({
      lexeme: 'echo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    });
  });
  it('a single word is one verb piece', () => {
    expect(compose(getVerb('thelo'), vs('indicative', 'present')).pieces.map((p) => p.kind)).toEqual(['verb']);
  });
  it('the subjunctive starts with να', () => {
    const c = compose(getVerb('troo'), vs('subjunctive', 'perfect', 3));
    expect(c.pieces.map((p) => p.kind)).toEqual(['particle', 'auxiliary', 'verb']);
    expect(c.pieces[0]).toMatchObject({ text: 'να', lexeme: 'na' });
    expect(c.text).toBe('να έχει φάει');
  });
  it('an imperative in the first person is refused', () => {
    expect(() => compose(getVerb('troo'), vs('imperative', 'aorist', 1))).toThrow('commands are for "you" only');
  });
});

describe('composedRich', () => {
  it('colours particle and auxiliary, and keeps the spaces as plain segments', () => {
    const rich = composedRich(compose(getVerb('troo'), vs('indicative', 'futurePerfect')));
    expect(richText(rich)).toBe('θα έχω φάει');
    expect(rich.map((s) => s.role)).toEqual(['aux', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });
  it('shows the augment as its own part', () => {
    const rich = composedRich(compose(getVerb('troo'), vs('indicative', 'imperfect')));
    expect(rich.map((s) => [s.text, s.role])).toEqual([['έ', 'augment'], ['τρωγ', 'stem'], ['α', 'ending']]);
  });
});
