import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { pronounSlots } from '../validate/validate';
import { compose } from './compose';
import { enVerbText } from './english';
import { EN_PRONOUNS } from './labels';
import { slotProblem } from './offers';
import { readingFor } from './reading';
import { whoIndex } from './tenses';

const troo = getVerb('troo');
const dino = getVerb('dino');
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

const slot = (
  mood: Mood,
  tense: Tense,
  clitics: Clitic[] = [IT],
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', clitics, ...(negative ? { polarity: 'negative' as const } : {}),
});
const el = (s: SlotOf<'verb'>, verb = troo) => compose(verb, s).text;
const en = (s: SlotOf<'verb'>, verb = troo) => enVerbText(verb, s, EN_PRONOUNS[whoIndex(s)]);

describe('Greek pronouns before the verb group (spec 4.3)', () => {
  it('stand in front of the verb: το τρώω, δεν το τρώω', () => {
    expect(el(slot('indicative', 'present'))).toBe('το τρώω');
    expect(el(slot('indicative', 'present', [IT], 1, 'sg', true))).toBe('δεν το τρώω');
    expect(el(slot('indicative', 'aorist', [IT], 3))).toBe('το έφαγε');
  });

  it('stand after θα and before the auxiliary: θα το φάω, το έχω φάει, θα το έχω φάει', () => {
    expect(el(slot('indicative', 'futureSimple'))).toBe('θα το φάω');
    expect(el(slot('indicative', 'futureSimple', [IT], 1, 'sg', true))).toBe('δεν θα το φάω');
    expect(el(slot('indicative', 'perfect'))).toBe('το έχω φάει');
    expect(el(slot('indicative', 'perfect', [IT], 1, 'sg', true))).toBe('δεν το έχω φάει');
    expect(el(slot('indicative', 'pluperfect'))).toBe('το είχα φάει');
    expect(el(slot('indicative', 'futurePerfect'))).toBe('θα το έχω φάει');
  });

  it('go with the conditional, the subjunctive and the hortative', () => {
    expect(el(slot('conditional', 'imperfect'))).toBe('θα το έτρωγα');
    expect(el(slot('conditional', 'pluperfect'))).toBe('θα το είχα φάει');
    expect(el(slot('subjunctive', 'aorist'))).toBe('να το φάω');
    expect(el(slot('subjunctive', 'aorist', [IT], 1, 'sg', true))).toBe('να μην το φάω');
    expect(el(slot('subjunctive', 'perfect'))).toBe('να το έχω φάει');
    expect(el(slot('hortative', 'aorist', [IT], 1, 'pl'))).toBe('ας το φάμε');
    expect(el(slot('hortative', 'aorist', [IT], 1, 'pl', true))).toBe('ας μην το φάμε');
  });

  it('two pronouns keep the indirect one first: θα μου το δώσεις', () => {
    expect(el(slot('indicative', 'futureSimple', [ME, IT], 2), dino)).toBe('θα μου το δώσεις');
    expect(el(slot('indicative', 'perfect', [ME, IT], 2), dino)).toBe('μου το έχεις δώσει');
  });

  it('gives each word its own piece, in written order, with no second accent', () => {
    const composed = compose(troo, slot('indicative', 'futureSimple', [IT], 1, 'sg', true));
    expect(composed.pieces.map((p) => p.kind)).toEqual(['negation', 'particle', 'clitic', 'verb']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular).toBeUndefined();
  });

  it('commands are unchanged: pronouns after the verb, or after μην', () => {
    expect(el(slot('imperative', 'aorist', [IT], 2))).toBe('φάε το');
    expect(el(slot('imperative', 'aorist', [IT], 2, 'sg', true))).toBe('μην το φας');
  });
});

describe('English pronouns after the verb or the participle', () => {
  it('says "eat it", "has eaten it", "will give it to me"', () => {
    expect(en(slot('indicative', 'present'))).toBe('I eat it');
    expect(en(slot('indicative', 'present', [IT], 3))).toBe('he/she eats it');
    expect(en(slot('indicative', 'present', [IT], 1, 'sg', true))).toBe("I don't eat it");
    expect(en(slot('indicative', 'futureSimple'))).toBe('I will eat it');
    expect(en(slot('indicative', 'perfect'))).toBe('I have eaten it');
    expect(en(slot('conditional', 'pluperfect'))).toBe('I would have eaten it');
    expect(en(slot('subjunctive', 'aorist'))).toBe('that I eat it');
    expect(en(slot('hortative', 'aorist', [IT], 1, 'pl'))).toBe("let's eat it");
    expect(en(slot('hortative', 'aorist', [IT], 1, 'pl', true))).toBe("let's not eat it");
    expect(en(slot('indicative', 'futureSimple', [ME, IT], 2), dino)).toBe('you will give it to me');
  });

  it('commands keep their pronouns too', () => {
    expect(en(slot('imperative', 'aorist', [IT], 2))).toBe('eat it');
    expect(en(slot('imperative', 'aorist', [ME, IT], 2), dino)).toBe('give it to me');
  });
});

describe('which verbs take pronouns', () => {
  it('a verb with an object does, in every active slot; πάω, είμαι and a reflexive voice do not', () => {
    expect(slotProblem(troo, slot('indicative', 'present'))).toBeNull();
    expect(slotProblem(troo, slot('hortative', 'present', [IT], 1, 'pl'))).toBeNull();
    expect(slotProblem(getVerb('pao'), slot('indicative', 'present'))).toMatch(/takes no object/);
    expect(slotProblem(getVerb('eimai'), slot('indicative', 'present'))).toMatch(/takes no object/);
    expect(slotProblem(getVerb('pleno'), { ...slot('indicative', 'present'), voice: 'mediopassive' })).toMatch(/takes no object/);
  });

  it('a short form is for commands only', () => {
    expect(slotProblem(troo, { ...slot('indicative', 'present'), shortForm: true })).toMatch(/only with a command/);
  });

  it('the validator builds the pronoun slots of every mood: two Romanian genders, and the pair for δίνω', () => {
    const present = slot('indicative', 'present', undefined);
    delete present.clitics;
    expect(pronounSlots(troo, present)).toHaveLength(4);
    expect(pronounSlots(dino, present)).toHaveLength(8);
    expect(pronounSlots(getVerb('pao'), present)).toEqual([]);
    expect(pronounSlots(troo, { ...present, voice: 'mediopassive' })).toEqual([]);
  });
});

describe('the reading of a form with a pronoun in a tense', () => {
  it('takes το έχω φάει apart: pronoun, auxiliary, stem, ending', () => {
    const reading = readingFor(troo, slot('indicative', 'perfect'));
    expect(reading.el.parts.map((p) => p.role)).toEqual(['clitic', 'auxiliary', 'stem', 'ending']);
    expect(reading.ro).toBeUndefined();
    expect(reading.en).toBeUndefined();
  });
});
