import { describe, expect, it } from 'vitest';
import { RO_CLITICS, RO_CLUSTERS } from '../data/clitics';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { roClitics } from './clitics';
import { roVerb } from './romanian';

const troo = getVerb('troo');
const dino = getVerb('dino');

/** ψωμί: "o" in Romanian (pâine is feminine). */
const O: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
/** παιδί: "îl" in Romanian (copil is masculine). */
const L: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const YOU: Clitic = { role: 'indirect', person: 2, number: 'sg' };

const slot = (
  mood: Mood,
  tense: Tense,
  clitics: Clitic[],
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', clitics, ...(negative ? { polarity: 'negative' as const } : {}),
});
const eat = (s: SlotOf<'verb'>) => roVerb(troo, s);
const give = (s: SlotOf<'verb'>) => roVerb(dino, s);

describe('Romanian pronouns before the verb (present, imperfect, past perfect)', () => {
  it('stand in front of the verb, with the fusion after nu', () => {
    expect(eat(slot('indicative', 'present', [L]))).toBe('îl mănânc');
    expect(eat(slot('indicative', 'present', [O]))).toBe('o mănânc');
    expect(eat(slot('indicative', 'present', [L], 1, 'sg', true))).toBe('nu-l mănânc');
    expect(eat(slot('indicative', 'present', [O], 1, 'sg', true))).toBe('nu o mănânc');
    expect(eat(slot('indicative', 'imperfect', [L]))).toBe('îl mâncam');
    expect(eat(slot('indicative', 'pluperfect', [L]))).toBe('îl mâncasem');
  });
});

describe('Romanian pronouns with the compound past and the conditional (a vowel-initial auxiliary)', () => {
  it('fuse with the auxiliary, except o, which follows the participle', () => {
    expect(eat(slot('indicative', 'perfect', [L]))).toBe('l-am mâncat');
    expect(eat(slot('indicative', 'perfect', [O]))).toBe('am mâncat-o');
    expect(eat(slot('indicative', 'aorist', [L], 3))).toBe('l-a mâncat');
    expect(eat(slot('indicative', 'perfect', [L], 1, 'sg', true))).toBe('nu l-am mâncat');
    expect(eat(slot('indicative', 'perfect', [O], 1, 'sg', true))).toBe('nu am mâncat-o');
  });

  it('the conditional does the same: l-aș mânca, aș mânca-o', () => {
    expect(eat(slot('conditional', 'imperfect', [L]))).toBe('l-aș mânca');
    expect(eat(slot('conditional', 'imperfect', [O]))).toBe('aș mânca-o');
    expect(eat(slot('conditional', 'imperfect', [L], 2, 'pl'))).toBe('l-ați mânca');
    expect(eat(slot('conditional', 'imperfect', [L], 1, 'sg', true))).toBe('nu l-aș mânca');
    expect(eat(slot('conditional', 'pluperfect', [L]))).toBe('l-aș fi mâncat');
    expect(eat(slot('conditional', 'pluperfect', [O]))).toBe('aș fi mâncat-o');
  });
});

describe('Romanian pronouns with the future and the subjunctive (a consonant-initial word)', () => {
  it('stand in front of the future auxiliary', () => {
    expect(eat(slot('indicative', 'future', [L]))).toBe('îl voi mânca');
    expect(eat(slot('indicative', 'futureSimple', [O], 3))).toBe('o va mânca');
    expect(eat(slot('indicative', 'future', [L], 1, 'sg', true))).toBe('nu-l voi mânca');
    expect(eat(slot('indicative', 'futurePerfect', [L]))).toBe('îl voi fi mâncat');
  });

  it('follow să, and să nu', () => {
    expect(eat(slot('subjunctive', 'aorist', [L]))).toBe('să-l mănânc');
    expect(eat(slot('subjunctive', 'aorist', [O]))).toBe('să o mănânc');
    expect(eat(slot('subjunctive', 'aorist', [L], 1, 'sg', true))).toBe('să nu-l mănânc');
    expect(eat(slot('subjunctive', 'aorist', [O], 1, 'sg', true))).toBe('să nu o mănânc');
    expect(eat(slot('subjunctive', 'perfect', [L]))).toBe('să-l fi mâncat');
    expect(eat(slot('hortative', 'aorist', [O], 1, 'pl'))).toBe('să o mâncăm');
    expect(eat(slot('hortative', 'aorist', [L], 1, 'pl', true))).toBe('să nu-l mâncăm');
  });
});

describe('Romanian pairs (dative then accusative)', () => {
  it('mi-o vei da, mi l-ai dat, mi-ai dat-o, să mi-o dea', () => {
    expect(give(slot('indicative', 'futureSimple', [ME, O], 2))).toBe('mi-o vei da');
    expect(give(slot('indicative', 'perfect', [ME, L], 2))).toBe('mi l-ai dat');
    expect(give(slot('indicative', 'perfect', [ME, O], 2))).toBe('mi-ai dat-o');
    expect(give(slot('indicative', 'present', [ME, O], 3))).toBe('mi-o dă');
    expect(give(slot('indicative', 'present', [ME, O], 3, 'sg', true))).toBe('nu mi-o dă');
    expect(give(slot('subjunctive', 'aorist', [ME, O], 3))).toBe('să mi-o dea');
    expect(give(slot('subjunctive', 'aorist', [YOU, L], 1, 'sg', true))).toBe('să nu ți-l dau');
    expect(give(slot('conditional', 'imperfect', [YOU, O]))).toBe('ți-aș da-o');
  });
});

describe('every stored pronoun, in every position', () => {
  const OBJECTS: Clitic[] = [
    { role: 'object', person: 1, number: 'sg' }, { role: 'object', person: 2, number: 'sg' },
    L, O,
    { role: 'object', person: 1, number: 'pl' }, { role: 'object', person: 2, number: 'pl' },
    { role: 'object', person: 3, number: 'pl', gender: 'm', roGender: 'm' },
    { role: 'object', person: 3, number: 'pl', gender: 'f', roGender: 'f' },
  ];
  const DATIVES: Clitic[] = [1, 2, 3].flatMap((person) =>
    (['sg', 'pl'] as const).map((number): Clitic => ({ role: 'indirect', person: person as Person, number })),
  );

  it('fuses with the auxiliary a in the third person of the compound past', () => {
    expect(OBJECTS.map((c) => eat(slot('indicative', 'perfect', [c], 3)))).toEqual([
      'm-a mâncat', 'te-a mâncat', 'l-a mâncat', 'a mâncat-o', 'ne-a mâncat', 'v-a mâncat', 'i-a mâncat', 'le-a mâncat',
    ]);
    expect(DATIVES.map((c) => give(slot('indicative', 'perfect', [c], 3)))).toEqual([
      'mi-a dat', 'ne-a dat', 'ți-a dat', 'v-a dat', 'i-a dat', 'le-a dat',
    ]);
  });

  it('has every position filled, and a fused or a behind-the-participle form', () => {
    for (const [key, entry] of [...Object.entries(RO_CLITICS), ...Object.entries(RO_CLUSTERS)]) {
      for (const field of ['free', 'enclitic', 'afterNu', 'afterSa'] as const) {
        expect(entry[field], `${key} ${field}`).not.toBe('');
      }
      expect(entry.fused !== '' || entry.after !== '', key).toBe(true);
    }
  });

  it('stores the pairs for "to me" and "to you" with the four third-person accusatives', () => {
    expect(Object.keys(RO_CLUSTERS)).toHaveLength(8);
    expect(roClitics([YOU, O]).fused).toBe('ți-');
    expect(roClitics([YOU, O]).after).toBe('-o');
  });
});
