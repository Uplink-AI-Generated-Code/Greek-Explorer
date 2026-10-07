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
    expect(text('troo', vs('imperative', 'present', 2, 'sg'))).toBe('τρώε');
    expect(text('troo', vs('imperative', 'present', 2, 'pl'))).toBe('τρώτε');
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

const neg = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('compose: negation (τρώω, 1st person singular)', () => {
  it.each([
    ['indicative', 'present', 'δεν τρώω'],
    ['indicative', 'imperfect', 'δεν έτρωγα'],
    ['indicative', 'aorist', 'δεν έφαγα'],
    ['indicative', 'future', 'δεν θα τρώω'],
    ['indicative', 'futureSimple', 'δεν θα φάω'],
    ['indicative', 'perfect', 'δεν έχω φάει'],
    ['indicative', 'pluperfect', 'δεν είχα φάει'],
    ['indicative', 'futurePerfect', 'δεν θα έχω φάει'],
    ['subjunctive', 'present', 'να μην τρώω'],
    ['subjunctive', 'aorist', 'να μη φάω'],
    ['subjunctive', 'perfect', 'να μην έχω φάει'],
    ['conditional', 'imperfect', 'δεν θα έτρωγα'],
    ['conditional', 'pluperfect', 'δεν θα είχα φάει'],
  ] as const)('%s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', neg(vs(mood, tense)))).toBe(expected);
  });

  it('δεν goes before θα and before the verb; μην goes after να', () => {
    const pieces = (slot: SlotOf<'verb'>) => compose(getVerb('troo'), slot).pieces.map((p) => p.kind);
    expect(pieces(neg(vs('indicative', 'futurePerfect')))).toEqual(['negation', 'particle', 'auxiliary', 'verb']);
    expect(pieces(neg(vs('subjunctive', 'perfect')))).toEqual(['particle', 'negation', 'auxiliary', 'verb']);
    expect(pieces(neg(vs('indicative', 'present')))).toEqual(['negation', 'verb']);
  });

  it('the negation pieces carry the lexeme and slot a panel would open', () => {
    const [first] = compose(getVerb('troo'), neg(vs('indicative', 'present'))).pieces;
    expect(first).toMatchObject({ kind: 'negation', text: 'δεν', lexeme: 'den', slot: { pos: 'particle' } });
    const [, second] = compose(getVerb('troo'), neg(vs('subjunctive', 'aorist'))).pieces;
    expect(second).toMatchObject({ kind: 'negation', text: 'μη', lexeme: 'min' });
  });

  it('the negative imperative is μην + the subjunctive form, not the imperative', () => {
    expect(text('troo', neg(vs('imperative', 'aorist', 2, 'sg')))).toBe('μη φας');
    expect(text('troo', neg(vs('imperative', 'aorist', 2, 'pl')))).toBe('μη φάτε');
    expect(text('troo', neg(vs('imperative', 'present', 2, 'sg')))).toBe('μην τρως');
    expect(text('troo', neg(vs('imperative', 'present', 2, 'pl')))).toBe('μην τρώτε');
    expect(text('pleno', neg(vs('imperative', 'aorist', 2, 'sg')))).toBe('μην πλύνεις');
    expect(text('pleno', neg(vs('imperative', 'aorist', 2, 'pl')))).toBe('μην πλύνετε');
  });

  it('a negative command is for "you" only', () => {
    expect(() => compose(getVerb('troo'), neg(vs('imperative', 'aorist', 1)))).toThrow('commands are for "you" only');
  });

  it('other verbs, voices and persons', () => {
    expect(text('thelo', neg(vs('indicative', 'present')))).toBe('δεν θέλω');
    expect(text('pao', neg(vs('subjunctive', 'aorist')))).toBe('να μην πάω');
    expect(text('pleno', neg(vs('indicative', 'perfect', 1, 'sg', 'mediopassive')))).toBe('δεν έχω πλυθεί');
    expect(text('troo', neg(vs('indicative', 'perfect', 3, 'sg')))).toBe('δεν έχει φάει');
  });

  it('colours the negation in its own role', () => {
    const rich = composedRich(compose(getVerb('troo'), neg(vs('indicative', 'future'))));
    expect(richText(rich)).toBe('δεν θα τρώω');
    expect(rich.map((s) => s.role)).toEqual(['neg', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });

  it('an affirmative slot without a polarity is unchanged', () => {
    expect(text('troo', vs('indicative', 'future'))).toBe('θα τρώω');
    expect(text('troo', { ...vs('indicative', 'future'), polarity: 'affirmative' })).toBe('θα τρώω');
  });
});
