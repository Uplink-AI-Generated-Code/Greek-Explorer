import { describe, expect, it } from 'vitest';
import { compose } from '../engine/compose';
import { linksOf } from '../glossLinks';
import type { SlotOf } from '../types';
import { validate, warnings } from '../validate/validate';
import { LEXEMES, getVerb } from './lexemes';
import { PHRASES } from './phrases';

const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with verbs (voice, perfects, subjunctive)', () => {
  const ids = [
    'washing-myself', 'washing-the-child', 'sleeping', 'present-perfect', 'past-perfect',
    'future-perfect', 'want-to-eat', 'want-to-eat-regularly', 'have-washed-myself',
  ];

  it('are all in the picker', () => {
    for (const id of ids) expect(PHRASES.map((p) => p.id)).toContain(id);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('start unverified and have a theme', () => {
    for (const id of ids) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('use the reflexive voice for 4 and the deponent voice for 6', () => {
    expect(byId('washing-myself').tokens[0].slot).toMatchObject({ voice: 'mediopassive' });
    expect(byId('sleeping').tokens[0].slot).toMatchObject({ voice: 'mediopassive' });
    expect(byId('washing-the-child').tokens[0].slot).toMatchObject({ voice: 'active' });
  });

  it('write each verb group as one token whose pieces the glosses link to', () => {
    const perfect = byId('future-perfect');
    expect(perfect.tokens).toHaveLength(1);
    const token = perfect.tokens[0];
    const verb = getVerb(token.lexeme);
    expect(token.slot.pos).toBe('verb');
    if (token.slot.pos !== 'verb') return;
    expect(compose(verb, token.slot).pieces).toHaveLength(3);
    const englishNatural = perfect.glosses.find((g) => g.language === 'en' && g.kind === 'natural');
    expect(englishNatural?.units.flatMap(linksOf)).toEqual([
      { token: 0, piece: 0 }, { token: 0, piece: 1 }, { token: 0, piece: 2 },
    ]);
  });

  it('the subjunctive pair differs only in the verb piece (aspect)', () => {
    const once = byId('want-to-eat').tokens[1];
    const regularly = byId('want-to-eat-regularly').tokens[1];
    expect(once.text).toBe('να φάω');
    expect(regularly.text).toBe('να τρώω');
  });

  it('the Romanian glosses of the perfect and of the aorist-like phrase 18 share the compound past', () => {
    const ro = (id: string) => byId(id).glosses.find((g) => g.language === 'ro' && g.kind === 'natural');
    expect(ro('present-perfect')?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('Am mâncat');
    expect(ro('have-washed-myself')?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('M-am spălat');
  });
});

describe('phrases with verbs (past, imperative, conditional)', () => {
  const ids = [
    'fox-has-jumped', 'ate-the-bread', 'wanted-a-coffee', 'fox-was-jumping', 'eat-the-bread',
    'wash-the-child', 'keep-eating-the-bread', 'may-have-eaten', 'would-like-a-coffee', 'if-i-had-bread', 'would-have-eaten-the-bread',
  ];

  it('are all present, unverified, with a theme', () => {
    for (const id of ids) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('the picker lists all 68 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee', 'want-more-water',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread',
      'eat-less-bread', 'used-to-eat-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'if-i-had-bread', 'would-have-eaten-the-bread',
      'child-is-washed', 'bread-is-baked',
      'eat-it', 'wash-it', 'give-it-to-me', 'dont-eat-it', 'eat-bare',
      'want-not-to-go',
      'what-do-you-want', 'where-are-you-going', 'when-will-you-eat', 'why-arent-you-eating', 'how-are-you',
      'who-is-it', 'how-much-bread', 'where-are-you-from', 'until-when-will-you-go', 'what-time-is-it',
      'how-much-is-it', 'lets-eat', 'let-him-eat', 'lets-not-go',
      'what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me',
      'going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water',
      'my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee',
    ]);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('the aorist and the perfect are different Greek tokens with the same Romanian words', () => {
    const roVerb = (id: string) =>
      byId(id).glosses.find((g) => g.language === 'ro' && g.kind === 'natural')?.units[0];
    expect(byId('ate-the-bread').tokens[0].text).toBe('Έφαγα');
    expect(byId('present-perfect').tokens[0].text).toBe('Έχω φάει');
    expect(roVerb('ate-the-bread')).toEqual({ text: 'Am mâncat', link: 0 });
  });

  it('the imperatives are second-person singular, aorist and present', () => {
    expect(byId('eat-the-bread').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2 });
    expect(byId('keep-eating-the-bread').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'present', person: 2 });
    expect(byId('wash-the-child').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2 });
  });

  it('the polite imperfect and the conditional differ only in θα', () => {
    expect(byId('wanted-a-coffee').tokens[0].text).toBe('Ήθελα');
    expect(byId('would-like-a-coffee').tokens[0].text).toBe('Θα ήθελα');
  });

  it('the modal and its subjunctive are two tokens', () => {
    const phrase = byId('may-have-eaten');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Μπορεί', 'να έχει φάει']);
    expect(phrase.tokens[0].slot).toMatchObject({ person: 3, number: 'sg' });
  });
});

describe('phrases with negation', () => {
  it('phrase 16 negates the main verb before a subjunctive', () => {
    const phrase = byId('dont-want-to-go');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Δεν θέλω', 'να πάω']);
    expect(phrase.tokens[0].slot).toMatchObject({ polarity: 'negative' });
    expect(phrase.tokens[1].slot).not.toHaveProperty('polarity');
  });

  it('phrase 25 is a negative command built from the subjunctive', () => {
    const phrase = byId('dont-eat-the-bread');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Μην φας', 'το', 'ψωμί!']);
    expect(phrase.tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2, polarity: 'negative' });
  });

  it('phrase 39 negates the subjunctive clause, not the main verb', () => {
    const phrase = byId('want-not-to-go');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Θέλω', 'να μην πάω']);
    expect(phrase.tokens[0].slot).not.toHaveProperty('polarity');
    expect(phrase.tokens[1].slot).toMatchObject({ mood: 'subjunctive', polarity: 'negative' });
    const roNatural = phrase.glosses.find((g) => g.language === 'ro' && g.kind === 'natural');
    expect(roNatural?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('Vreau să nu merg');
  });

  it('the English literal rows of 16 and 39 differ in where "not" sits', () => {
    const literal = (id: string) =>
      byId(id).glosses.find((g) => g.language === 'en' && g.kind === 'literal')?.units.map((u) => ('text' in u ? u.text : ''));
    expect(literal('dont-want-to-go')).toEqual(['(I)', 'not', 'want', 'that', '(I)', 'go']);
    expect(literal('want-not-to-go')).toEqual(['(I)', 'want', 'that', 'not', '(I)', 'go']);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });
});

describe('phrase 30: the if-clause', () => {
  const phrase = byId('if-i-had-bread');
  it('has an αν token, είχα, the noun and the conditional', () => {
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Αν', 'είχα', 'ψωμί,', 'θα έτρωγα']);
    expect(phrase.tokens[0].slot).toEqual({ pos: 'conjunction' });
    expect(phrase.tokens[1]).toMatchObject({ lexeme: 'echo', slot: { mood: 'indicative', tense: 'imperfect' } });
    expect(phrase.tokens[3].slot).toMatchObject({ mood: 'conditional', tense: 'imperfect' });
  });
  it('validates, starts unverified and is in the Eating theme', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(phrase.verified).toBe(false);
    expect(phrase.theme).toBe('Eating');
  });
  it('θα έτρωγα is a two-piece group, and the glosses link to its pieces', () => {
    expect(compose(getVerb('troo'), phrase.tokens[3].slot as SlotOf<'verb'>).pieces).toHaveLength(2);
    const links = phrase.glosses.flatMap((g) => g.units.flatMap((unit) => linksOf(unit)));
    expect(links).toContainEqual({ token: 3, piece: 0 });
    expect(links).toContainEqual({ token: 3, piece: 1 });
  });
});
