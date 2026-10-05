import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Person, SlotOf } from '../types';
import { compose } from './compose';
import { enVerb, enVerbText } from './english';
import { EN_PRONOUNS, moodLabel, tenseLabel } from './labels';
import { isOffered } from './offers';
import { readingFor } from './reading';
import { roVerb } from './romanian';
import { whoIndex } from './tenses';

const hortative = (
  tense: 'present' | 'aorist',
  person: Person,
  number: 'sg' | 'pl',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb',
  person,
  number,
  mood: 'hortative',
  tense,
  voice: 'active',
  ...(negative ? { polarity: 'negative' as const } : {}),
});

const troo = getVerb('troo');
const pao = getVerb('pao');
const text = (slot: SlotOf<'verb'>, verb = troo) => compose(verb, slot).text;

describe('the hortative: Greek', () => {
  it('is ας + the aorist-subjunctive or the present form, in every person', () => {
    expect(text(hortative('aorist', 1, 'pl'))).toBe('ας φάμε');
    expect(text(hortative('aorist', 3, 'sg'))).toBe('ας φάει');
    expect(text(hortative('aorist', 1, 'sg'))).toBe('ας φάω');
    expect(text(hortative('present', 1, 'pl'))).toBe('ας τρώμε');
    expect(text(hortative('present', 3, 'pl'))).toBe('ας τρώνε');
  });

  it('puts μην after ας', () => {
    expect(text(hortative('aorist', 1, 'pl', true), pao)).toBe('ας μην πάμε');
    const pieces = compose(pao, hortative('aorist', 1, 'pl', true)).pieces;
    expect(pieces.map((p) => p.kind)).toEqual(['particle', 'negation', 'verb']);
    expect(pieces[0]).toMatchObject({ lexeme: 'as', text: 'ας' });
  });

  it('is offered by the verbs that offer the subjunctive present and aorist, and by no other', () => {
    expect(isOffered(troo, hortative('aorist', 1, 'pl'))).toBe(true);
    expect(isOffered(getVerb('echo'), hortative('aorist', 1, 'pl'))).toBe(false);
    expect(isOffered(getVerb('eimai'), hortative('present', 1, 'pl'))).toBe(false);
  });
});

describe('the hortative: Romanian and English', () => {
  it('Romanian is să + the subjunctive, with să nu for the negative', () => {
    expect(roVerb(troo, hortative('aorist', 1, 'pl'))).toBe('să mâncăm');
    expect(roVerb(troo, hortative('aorist', 3, 'sg'))).toBe('să mănânce');
    expect(roVerb(pao, hortative('aorist', 1, 'pl', true))).toBe('să nu mergem');
  });

  it('English changes with the person: let me, may you, let him / her, let\'s, let them', () => {
    const say = (person: Person, number: 'sg' | 'pl', negative = false) => {
      const slot = hortative('aorist', person, number, negative);
      return enVerbText(troo, slot, EN_PRONOUNS[whoIndex(slot)]);
    };
    expect(say(1, 'sg')).toBe('let me eat');
    expect(say(2, 'sg')).toBe('may you eat');
    expect(say(3, 'sg')).toBe('let him / her eat');
    expect(say(1, 'pl')).toBe("let's eat");
    expect(say(2, 'pl')).toBe('may you eat');
    expect(say(3, 'pl')).toBe('let them eat');
    expect(say(1, 'pl', true)).toBe("let's not eat");
    expect(say(3, 'sg', true)).toBe('let him / her not eat');
  });

  it('gives the pronoun slot of the English cell the word it shows', () => {
    expect(enVerb(troo, hortative('aorist', 1, 'pl'))).toMatchObject({ lead: '', subject: true, pronoun: "let's" });
    expect(enVerb(troo, hortative('aorist', 1, 'sg'))).toMatchObject({ lead: 'let', pronoun: 'me' });
  });
});

describe('the hortative: labels and reading', () => {
  it('has labels at both levels', () => {
    expect(moodLabel('beginner', 'hortative')).toBe("let's / let him");
    expect(moodLabel('improver', 'hortative')).toBe('hortative');
    expect(tenseLabel('improver', 'hortative', 'aorist')).toBe('aorist');
    expect(tenseLabel('beginner', 'hortative', 'present')).toBe('let us (do), ongoing');
  });

  it('takes ας φάμε apart, with ας as a particle part', () => {
    const reading = readingFor(troo, hortative('aorist', 1, 'pl'));
    expect(reading.el.parts.map((p) => [p.role, p.label])).toEqual([
      ['particle', 'ας'],
      ['stem', 'φά-'],
      ['ending', '-με'],
    ]);
    expect(reading.el.parts[0].gloss).toBe('let');
    expect(reading.el.improver).toBe('Hortative aorist: ας + aorist-subjunctive form (stem φά- + ending -με).');
    expect(reading.ro?.parts.map((p) => p.text)).toEqual(['să', 'mâncăm']);
    expect(reading.en).toBeUndefined();
  });

  it('puts the Romanian negation after să', () => {
    const reading = readingFor(pao, hortative('aorist', 1, 'pl', true));
    expect(reading.ro?.parts.map((p) => p.text)).toEqual(['să', 'nu', 'mergem']);
  });
});
