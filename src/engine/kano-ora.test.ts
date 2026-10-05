import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun, getVerb } from '../data/lexemes';
import type { Mood, Person, SlotOf, Tense } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflect } from './greek';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { roVerb } from './romanian';
import { formText } from './segments';
import { whoIndex } from './tenses';

const kano = getVerb('kano');
const slot = (mood: Mood, tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg'): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active',
});
const el = (s: SlotOf<'verb'>) => compose(kano, s).text;

describe('κάνω', () => {
  it('present, imperfect and aorist', () => {
    expect([1, 2, 3].map((p) => el(slot('indicative', 'present', p as Person)))).toEqual(['κάνω', 'κάνεις', 'κάνει']);
    expect(el(slot('indicative', 'present', 3, 'pl'))).toBe('κάνουν');
    expect(el(slot('indicative', 'imperfect', 1))).toBe('έκανα');
    expect(el(slot('indicative', 'imperfect', 1, 'pl'))).toBe('κάναμε');
    expect(el(slot('indicative', 'aorist', 3))).toBe('έκανε');
    expect(el(slot('indicative', 'aorist', 2, 'pl'))).toBe('κάνατε');
  });

  it('the compound forms, the subjunctive, the commands and the hortative', () => {
    expect(el(slot('indicative', 'perfect', 1))).toBe('έχω κάνει');
    expect(el(slot('indicative', 'futureSimple', 3))).toBe('θα κάνει');
    expect(el(slot('subjunctive', 'aorist', 1))).toBe('να κάνω');
    expect(el(slot('imperative', 'aorist', 2))).toBe('κάνε');
    expect(el(slot('imperative', 'present', 2, 'pl'))).toBe('κάνετε');
    expect(el(slot('hortative', 'aorist', 1, 'pl'))).toBe('ας κάνουμε');
  });

  it('Romanian a face and English do', () => {
    expect(roVerb(kano, slot('indicative', 'present', 3))).toBe('face');
    expect(roVerb(kano, slot('indicative', 'perfect', 1))).toBe('am făcut');
    expect(roVerb(kano, slot('subjunctive', 'present', 3))).toBe('să facă');
    expect(roVerb(kano, slot('imperative', 'aorist', 2))).toBe('fă');
    const say = (s: SlotOf<'verb'>) => enVerbText(kano, s, EN_PRONOUNS[whoIndex(s)]);
    expect(say(slot('indicative', 'present', 3))).toBe('he/she does');
    expect(say({ ...slot('indicative', 'present', 1), polarity: 'negative' })).toBe("I don't do");
    expect(say(slot('indicative', 'perfect', 1))).toBe('I have done');
  });

  it('offers every mood, the imperative and the hortative included', () => {
    expect(allVerbSlots(kano)).toHaveLength(15 * 6 + 4);
  });
});

describe('ώρα', () => {
  const ora = getNoun('ora');
  const form = (number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') => formText(inflect(ora, { pos: 'noun', number, case: c }));

  it('is a feminine noun in -α, with the accent moving in the genitive plural', () => {
    expect(['nom', 'acc', 'gen'].map((c) => form('sg', c as 'nom'))).toEqual(['ώρα', 'ώρα', 'ώρας']);
    expect(['nom', 'acc', 'gen'].map((c) => form('pl', c as 'nom'))).toEqual(['ώρες', 'ώρες', 'ωρών']);
    expect(inflect(ora, { pos: 'noun', number: 'pl', case: 'gen' }).irregular?.rule).toBe('accent-moves');
    expect(inflect(ora, { pos: 'noun', number: 'sg', case: 'gen' }).irregular).toBeUndefined();
  });

  it('is oră in Romanian and "hour" in English', () => {
    expect(ora.ro.forms.sg.indefinite).toBe('o oră');
    expect(ora.ro.forms.pl.genIndefinite).toBe('unor ore');
    expect(ora.en).toEqual({ sg: 'hour', pl: 'hours' });
    expect(getLexeme('ora').pos).toBe('noun');
  });
});
