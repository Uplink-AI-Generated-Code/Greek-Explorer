import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { roVerb } from './romanian';
import { whoIndex } from './tenses';

const lego = getVerb('lego');
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'it' };
const slot = (mood: Mood, tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg', clitics?: Clitic[]): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', ...(clitics ? { clitics } : {}),
});
const el = (s: SlotOf<'verb'>) => compose(lego, s).text;
const en = (s: SlotOf<'verb'>) => enVerbText(lego, s, EN_PRONOUNS[whoIndex(s)]);

describe('λέω', () => {
  it('present: λέω, λες, λέει, λέμε, λέτε, λένε', () => {
    const forms = ([[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']] as const).map(([p, n]) =>
      el(slot('indicative', 'present', p, n)),
    );
    expect(forms).toEqual(['λέω', 'λες', 'λέει', 'λέμε', 'λέτε', 'λένε']);
  });

  it('imperfect: έλεγα … λέγαμε, λέγατε, έλεγαν (the augment goes where the stress moves)', () => {
    const forms = ([[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']] as const).map(([p, n]) =>
      el(slot('indicative', 'imperfect', p, n)),
    );
    expect(forms).toEqual(['έλεγα', 'έλεγες', 'έλεγε', 'λέγαμε', 'λέγατε', 'έλεγαν']);
  });

  it('subjunctive present: να λέω, να λες', () => {
    expect(el(slot('subjunctive', 'present', 1))).toBe('να λέω');
    expect(el(slot('subjunctive', 'present', 2))).toBe('να λες');
  });

  it('offers the present, the imperfect and the present subjunctive, and nothing else', () => {
    expect(allVerbSlots(lego)).toHaveLength(3 * 6);
    expect(allVerbSlots(lego).map((s) => `${s.mood}.${s.tense}`).filter((k, i, all) => all.indexOf(k) === i)).toEqual([
      'indicative.present', 'indicative.imperfect', 'subjunctive.present',
    ]);
  });

  it('Romanian a zice and English say', () => {
    expect(roVerb(lego, slot('indicative', 'present', 3, 'pl'))).toBe('zic');
    expect(roVerb(lego, slot('indicative', 'imperfect', 1))).toBe('ziceam');
    expect(roVerb(lego, slot('subjunctive', 'present', 3))).toBe('să zică');
    expect(en(slot('indicative', 'present', 3, 'pl'))).toBe('they say');
    expect(en(slot('indicative', 'imperfect', 1))).toBe('I was saying');
  });

  it('with a pronoun: το λένε / îl zic / they say it', () => {
    const s = slot('indicative', 'present', 3, 'pl', [IT]);
    expect(el(s)).toBe('το λένε');
    expect(roVerb(lego, s)).toBe('îl zic');
    expect(en(s)).toBe('they say it');
  });
});
