import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { inflectVerb } from './greek';
import { allVerbSlots, offeredVoices } from './offers';
import { formText } from './segments';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person,
  number: Num,
  voice: Voice,
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const WHO: [Person, Num][] = [[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']];

const six = (id: string, voice: Voice, mood: Mood, tense: Tense) =>
  WHO.map(([p, n]) => formText(inflectVerb(getVerb(id), vs(mood, tense, p, n, voice))));

const two = (id: string, voice: Voice, tense: Tense) =>
  (['sg', 'pl'] as const).map((n) => formText(inflectVerb(getVerb(id), vs('imperative', tense, 2, n, voice))));

type Row = [id: string, voice: Voice, mood: Mood, tense: Tense, forms: string[]];

const SIX: Row[] = [
  ['troo', 'active', 'indicative', 'present', ['τρώω', 'τρως', 'τρώει', 'τρώμε', 'τρώτε', 'τρώνε']],
  ['troo', 'active', 'indicative', 'imperfect', ['έτρωγα', 'έτρωγες', 'έτρωγε', 'τρώγαμε', 'τρώγατε', 'έτρωγαν']],
  ['troo', 'active', 'indicative', 'aorist', ['έφαγα', 'έφαγες', 'έφαγε', 'φάγαμε', 'φάγατε', 'έφαγαν']],
  ['troo', 'active', 'subjunctive', 'aorist', ['φάω', 'φας', 'φάει', 'φάμε', 'φάτε', 'φάνε']],
  ['pao', 'active', 'indicative', 'present', ['πάω', 'πας', 'πάει', 'πάμε', 'πάτε', 'πάνε']],
  ['pao', 'active', 'indicative', 'imperfect', ['πήγαινα', 'πήγαινες', 'πήγαινε', 'πηγαίναμε', 'πηγαίνατε', 'πήγαιναν']],
  ['pao', 'active', 'indicative', 'aorist', ['πήγα', 'πήγες', 'πήγε', 'πήγαμε', 'πήγατε', 'πήγαν']],
  ['pao', 'active', 'subjunctive', 'aorist', ['πάω', 'πας', 'πάει', 'πάμε', 'πάτε', 'πάνε']],
  ['echo', 'active', 'indicative', 'present', ['έχω', 'έχεις', 'έχει', 'έχουμε', 'έχετε', 'έχουν']],
  ['echo', 'active', 'indicative', 'imperfect', ['είχα', 'είχες', 'είχε', 'είχαμε', 'είχατε', 'είχαν']],
  ['pleno', 'active', 'indicative', 'present', ['πλένω', 'πλένεις', 'πλένει', 'πλένουμε', 'πλένετε', 'πλένουν']],
  ['pleno', 'active', 'indicative', 'imperfect', ['έπλενα', 'έπλενες', 'έπλενε', 'πλέναμε', 'πλένατε', 'έπλεναν']],
  ['pleno', 'active', 'indicative', 'aorist', ['έπλυνα', 'έπλυνες', 'έπλυνε', 'πλύναμε', 'πλύνατε', 'έπλυναν']],
  ['pleno', 'active', 'subjunctive', 'aorist', ['πλύνω', 'πλύνεις', 'πλύνει', 'πλύνουμε', 'πλύνετε', 'πλύνουν']],
  ['pleno', 'mediopassive', 'indicative', 'present', ['πλένομαι', 'πλένεσαι', 'πλένεται', 'πλενόμαστε', 'πλένεστε', 'πλένονται']],
  [
    'pleno', 'mediopassive', 'indicative', 'imperfect',
    ['πλενόμουν', 'πλενόσουν', 'πλενόταν', 'πλενόμασταν', 'πλενόσασταν', 'πλένονταν'],
  ],
  ['pleno', 'mediopassive', 'indicative', 'aorist', ['πλύθηκα', 'πλύθηκες', 'πλύθηκε', 'πλυθήκαμε', 'πλυθήκατε', 'πλύθηκαν']],
  ['pleno', 'mediopassive', 'subjunctive', 'aorist', ['πλυθώ', 'πλυθείς', 'πλυθεί', 'πλυθούμε', 'πλυθείτε', 'πλυθούν']],
  ['koimamai', 'mediopassive', 'indicative', 'present', ['κοιμάμαι', 'κοιμάσαι', 'κοιμάται', 'κοιμόμαστε', 'κοιμάστε', 'κοιμούνται']],
  [
    'koimamai', 'mediopassive', 'indicative', 'imperfect',
    ['κοιμόμουν', 'κοιμόσουν', 'κοιμόταν', 'κοιμόμασταν', 'κοιμόσασταν', 'κοιμόνταν'],
  ],
  [
    'koimamai', 'mediopassive', 'indicative', 'aorist',
    ['κοιμήθηκα', 'κοιμήθηκες', 'κοιμήθηκε', 'κοιμηθήκαμε', 'κοιμηθήκατε', 'κοιμήθηκαν'],
  ],
  [
    'koimamai', 'mediopassive', 'subjunctive', 'aorist',
    ['κοιμηθώ', 'κοιμηθείς', 'κοιμηθεί', 'κοιμηθούμε', 'κοιμηθείτε', 'κοιμηθούν'],
  ],
];

describe('Greek forms of the new verbs (spec 6.4)', () => {
  it.each(SIX)('%s %s %s %s', (id, voice, mood, tense, forms) => {
    expect(six(id, voice, mood, tense)).toEqual(forms);
  });

  it('the imperatives of τρώω and πλένω', () => {
    expect(two('troo', 'active', 'aorist')).toEqual(['φάε', 'φάτε']);
    expect(two('troo', 'active', 'present')).toEqual(['τρώγε', 'τρώγετε']);
    expect(two('pleno', 'active', 'aorist')).toEqual(['πλύνε', 'πλύνετε']);
    expect(two('pleno', 'active', 'present')).toEqual(['πλένε', 'πλένετε']);
  });

  it('the base forms of the perfect tenses', () => {
    const base = (id: string, voice: Voice) => formText(inflectVerb(getVerb(id), vs('indicative', 'perfect', 1, 'sg', voice)));
    expect(base('troo', 'active')).toBe('φάει');
    expect(base('pao', 'active')).toBe('πάει');
    expect(base('pleno', 'active')).toBe('πλύνει');
    expect(base('pleno', 'mediopassive')).toBe('πλυθεί');
    expect(base('koimamai', 'mediopassive')).toBe('κοιμηθεί');
  });

  it('the impersonal μπορεί has one form', () => {
    expect(formText(inflectVerb(getVerb('mporei'), vs('indicative', 'present', 3, 'sg', 'active')))).toBe('μπορεί');
    expect(() => inflectVerb(getVerb('mporei'), vs('indicative', 'present', 1, 'sg', 'active'))).toThrow('no mporei present form');
  });

  it('a one-syllable form drops its accent, and says so', () => {
    expect(inflectVerb(getVerb('troo'), vs('indicative', 'present', 2, 'sg', 'active')).irregular?.rule).toBe('monosyllable');
    expect(inflectVerb(getVerb('troo'), vs('subjunctive', 'aorist', 2, 'sg', 'active')).irregular?.rule).toBe('monosyllable');
    expect(inflectVerb(getVerb('troo'), vs('indicative', 'present', 1, 'sg', 'active')).irregular).toBeUndefined();
  });

  it('the stress moves in πλενόμαστε and stays in πλένονταν, and says so', () => {
    expect(inflectVerb(getVerb('pleno'), vs('indicative', 'present', 1, 'pl', 'mediopassive')).irregular?.rule).toBe('stress-shift');
    expect(inflectVerb(getVerb('pleno'), vs('indicative', 'imperfect', 3, 'pl', 'mediopassive')).irregular?.rule).toBe('stress-shift');
  });

  it('the present imperative of τρώω keeps the older -γ-, and says so', () => {
    const form = inflectVerb(getVerb('troo'), vs('imperative', 'present', 2, 'sg', 'active'));
    expect(formText(form)).toBe('τρώγε');
    expect(form.irregular?.rule).toBe('old-stem');
    expect(inflectVerb(getVerb('troo'), vs('imperative', 'aorist', 2, 'sg', 'active')).irregular).toBeUndefined();
  });

  it('the plural past of τρώω loses its augment: τρώγαμε', () => {
    const form = inflectVerb(getVerb('troo'), vs('indicative', 'imperfect', 1, 'pl', 'active'));
    expect(form.augment).toBeUndefined();
    expect(form.irregular?.rule).toBe('stress-shift');
  });
});

describe('what the new verbs offer', () => {
  it('πλένω has two voices, κοιμάμαι only the mediopassive', () => {
    expect(offeredVoices(getVerb('pleno'))).toEqual(['active', 'mediopassive']);
    expect(offeredVoices(getVerb('koimamai'))).toEqual(['mediopassive']);
    expect(offeredVoices(getVerb('thelo'))).toEqual(['active']);
  });

  it('counts the slots: 13 combinations × 6 persons, plus the imperative for τρώω and πλένω', () => {
    expect(allVerbSlots(getVerb('troo'))).toHaveLength(13 * 6 + 4);
    expect(allVerbSlots(getVerb('pao'))).toHaveLength(13 * 6);
    expect(allVerbSlots(getVerb('koimamai'))).toHaveLength(13 * 6);
    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'active')).toHaveLength(13 * 6 + 4);
    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'mediopassive')).toHaveLength(7 * 6);
    expect(allVerbSlots(getVerb('echo'))).toHaveLength(5 * 6);
    expect(allVerbSlots(getVerb('mporei'))).toHaveLength(1);
  });
});
