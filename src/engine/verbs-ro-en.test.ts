import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { enVerb, enVerbText } from './english';
import { RO_AUXILIARIES, roVerb } from './romanian';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

describe('Romanian verb forms (τρώω → a mânca, spec 6.4)', () => {
  it.each([
    ['indicative', 'present', 'mănânc'],
    ['indicative', 'imperfect', 'mâncam'],
    ['indicative', 'aorist', 'am mâncat'],
    ['indicative', 'future', 'voi mânca'],
    ['indicative', 'futureSimple', 'voi mânca'],
    ['indicative', 'perfect', 'am mâncat'],
    ['indicative', 'pluperfect', 'mâncasem'],
    ['indicative', 'futurePerfect', 'voi fi mâncat'],
    ['subjunctive', 'present', 'să mănânc'],
    ['subjunctive', 'aorist', 'să mănânc'],
    ['subjunctive', 'perfect', 'să fi mâncat'],
    ['conditional', 'imperfect', 'aș mânca'],
    ['conditional', 'pluperfect', 'aș fi mâncat'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(roVerb(getVerb('troo'), vs(mood, tense))).toBe(expected);
  });

  it('the compound auxiliary changes with the person', () => {
    expect(roVerb(getVerb('troo'), vs('indicative', 'perfect', 3, 'sg'))).toBe('a mâncat');
    expect(roVerb(getVerb('troo'), vs('indicative', 'perfect', 3, 'pl'))).toBe('au mâncat');
    expect(roVerb(getVerb('troo'), vs('indicative', 'futurePerfect', 3, 'sg'))).toBe('va fi mâncat');
    expect(roVerb(getVerb('troo'), vs('conditional', 'pluperfect', 1, 'pl'))).toBe('am fi mâncat');
    expect(RO_AUXILIARIES.have).toHaveLength(6);
    expect(RO_AUXILIARIES.will).toHaveLength(6);
    expect(RO_AUXILIARIES.would).toHaveLength(6);
  });

  it('the Romanian perfect covers both the Greek aorist and the Greek perfect', () => {
    for (const person of [1, 2, 3] as const) {
      expect(roVerb(getVerb('troo'), vs('indicative', 'aorist', person))).toBe(
        roVerb(getVerb('troo'), vs('indicative', 'perfect', person)),
      );
    }
  });

  it('the imperative is stored, singular and plural', () => {
    expect(roVerb(getVerb('troo'), vs('imperative', 'aorist', 2, 'sg'))).toBe('mănâncă');
    expect(roVerb(getVerb('troo'), vs('imperative', 'present', 2, 'pl'))).toBe('mâncați');
    expect(() => roVerb(getVerb('thelo'), vs('imperative', 'aorist', 2, 'sg'))).toThrow('thelo has no Romanian imperative');
  });

  it('a vrea: aș vrea, voiam, voisem', () => {
    expect(roVerb(getVerb('thelo'), vs('conditional', 'imperfect'))).toBe('aș vrea');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'imperfect'))).toBe('voiam');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'pluperfect'))).toBe('voisem');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'aorist'))).toBe('am vrut');
  });

  it('a reflexive verb stores its perfect, because the clitic fuses with the auxiliary', () => {
    const m = 'mediopassive';
    expect(roVerb(getVerb('pleno'), vs('indicative', 'present', 1, 'sg', m))).toBe('mă spăl');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'perfect', 1, 'sg', m))).toBe('m-am spălat');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'aorist', 3, 'sg', m))).toBe('s-a spălat');
    expect(roVerb(getVerb('pleno'), vs('subjunctive', 'present', 1, 'sg', m))).toBe('să mă spăl');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'pluperfect', 1, 'sg', m))).toBe('mă spălasem');
  });

  it('a deponent verb has no clitic in Romanian: dorm', () => {
    expect(roVerb(getVerb('koimamai'), vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe('dorm');
  });

  it('other verbs: a sări, a merge, a avea, a putea', () => {
    expect(roVerb(getVerb('pidao'), vs('indicative', 'perfect', 3))).toBe('a sărit');
    expect(roVerb(getVerb('pidao'), vs('indicative', 'imperfect', 3))).toBe('sărea');
    expect(roVerb(getVerb('pao'), vs('subjunctive', 'present', 3))).toBe('să meargă');
    expect(roVerb(getVerb('echo'), vs('indicative', 'future'))).toBe('voi avea');
    expect(roVerb(getVerb('mporei'), vs('indicative', 'present', 3))).toBe('poate');
  });
});

describe('English verb forms (eat / ate / eaten, spec 6.4)', () => {
  const text = (id: string, slot: SlotOf<'verb'>, pronoun = 'I') => enVerbText(getVerb(id), slot, pronoun);

  it.each([
    ['indicative', 'present', 'I eat'],
    ['indicative', 'imperfect', 'I was eating'],
    ['indicative', 'aorist', 'I ate'],
    ['indicative', 'future', 'I will eat'],
    ['indicative', 'futureSimple', 'I will eat'],
    ['indicative', 'perfect', 'I have eaten'],
    ['indicative', 'pluperfect', 'I had eaten'],
    ['indicative', 'futurePerfect', 'I will have eaten'],
    ['subjunctive', 'present', 'that I eat'],
    ['subjunctive', 'aorist', 'that I eat'],
    ['subjunctive', 'perfect', 'I may have eaten'],
    ['conditional', 'imperfect', 'I would eat'],
    ['conditional', 'pluperfect', 'I would have eaten'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('agrees with the person', () => {
    expect(text('troo', vs('indicative', 'present', 3), 'he/she')).toBe('he/she eats');
    expect(text('troo', vs('indicative', 'perfect', 3), 'he/she')).toBe('he/she has eaten');
    expect(text('troo', vs('indicative', 'imperfect', 2), 'you')).toBe('you were eating');
    expect(text('troo', vs('indicative', 'imperfect', 3), 'he/she')).toBe('he/she was eating');
    expect(text('troo', vs('subjunctive', 'present', 3), 'he/she')).toBe('that he/she eats');
  });

  it('the imperative has no subject and one form for singular and plural', () => {
    expect(enVerb(getVerb('troo'), vs('imperative', 'aorist', 2, 'sg'))).toEqual({ lead: '', subject: false, verb: 'eat' });
    expect(enVerb(getVerb('troo'), vs('imperative', 'present', 2, 'pl')).verb).toBe('eat');
  });

  it('reports the parts so a panel can colour the subject', () => {
    expect(enVerb(getVerb('troo'), vs('subjunctive', 'present'))).toEqual({ lead: 'that', subject: true, verb: 'eat' });
    expect(enVerb(getVerb('troo'), vs('indicative', 'present'))).toEqual({ lead: '', subject: true, verb: 'eat' });
  });

  it('the reflexive voice adds the matching "self" word', () => {
    const m = 'mediopassive';
    expect(text('pleno', vs('indicative', 'present', 1, 'sg', m))).toBe('I wash (myself)');
    expect(text('pleno', vs('indicative', 'present', 3, 'sg', m), 'he/she')).toBe('he/she washes (himself/herself)');
    expect(text('pleno', vs('indicative', 'perfect', 1, 'sg', m))).toBe('I have washed (myself)');
    expect(text('pleno', vs('indicative', 'present', 1, 'pl', m), 'we')).toBe('we wash (ourselves)');
  });

  it('a deponent verb is not reflexive: I sleep', () => {
    expect(text('koimamai', vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe('I sleep');
  });

  it('other verbs: want, jump, go, have, may', () => {
    expect(text('thelo', vs('conditional', 'imperfect'))).toBe('I would want');
    expect(text('pidao', vs('indicative', 'perfect', 3), 'he/she')).toBe('he/she has jumped');
    expect(text('pao', vs('indicative', 'aorist'))).toBe('I went');
    expect(text('echo', vs('indicative', 'present', 3), 'he/she')).toBe('he/she has');
    expect(text('mporei', vs('indicative', 'present', 3), 'he/she')).toBe('he/she may');
  });
});

const negative = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('Romanian negation (τρώω → a mânca)', () => {
  it.each([
    ['indicative', 'present', 'nu mănânc'],
    ['indicative', 'imperfect', 'nu mâncam'],
    ['indicative', 'aorist', 'nu am mâncat'],
    ['indicative', 'perfect', 'nu am mâncat'],
    ['indicative', 'pluperfect', 'nu mâncasem'],
    ['indicative', 'future', 'nu voi mânca'],
    ['indicative', 'futureSimple', 'nu voi mânca'],
    ['indicative', 'futurePerfect', 'nu voi fi mâncat'],
    ['subjunctive', 'present', 'să nu mănânc'],
    ['subjunctive', 'aorist', 'să nu mănânc'],
    ['subjunctive', 'perfect', 'să nu fi mâncat'],
    ['conditional', 'imperfect', 'nu aș mânca'],
    ['conditional', 'pluperfect', 'nu aș fi mâncat'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(roVerb(getVerb('troo'), negative(vs(mood, tense)))).toBe(expected);
  });

  it('the negative imperative is nu + the infinitive in the singular and nu + the plural imperative', () => {
    expect(roVerb(getVerb('troo'), negative(vs('imperative', 'aorist', 2, 'sg')))).toBe('nu mânca');
    expect(roVerb(getVerb('troo'), negative(vs('imperative', 'present', 2, 'pl')))).toBe('nu mâncați');
  });

  it('a reflexive verb keeps its clitic: nu mă spăl, nu m-am spălat, să nu mă spăl', () => {
    const m = 'mediopassive';
    expect(roVerb(getVerb('pleno'), negative(vs('indicative', 'present', 1, 'sg', m)))).toBe('nu mă spăl');
    expect(roVerb(getVerb('pleno'), negative(vs('indicative', 'perfect', 1, 'sg', m)))).toBe('nu m-am spălat');
    expect(roVerb(getVerb('pleno'), negative(vs('subjunctive', 'present', 1, 'sg', m)))).toBe('să nu mă spăl');
  });

  it('other persons and verbs: nu a mâncat, nu au mâncat, nu vreau, să nu merg', () => {
    expect(roVerb(getVerb('troo'), negative(vs('indicative', 'perfect', 3, 'sg')))).toBe('nu a mâncat');
    expect(roVerb(getVerb('troo'), negative(vs('indicative', 'perfect', 3, 'pl')))).toBe('nu au mâncat');
    expect(roVerb(getVerb('thelo'), negative(vs('indicative', 'present')))).toBe('nu vreau');
    expect(roVerb(getVerb('pao'), negative(vs('subjunctive', 'aorist')))).toBe('să nu merg');
  });
});

describe('English negation (eat / ate / eaten)', () => {
  const text = (id: string, slot: SlotOf<'verb'>, pronoun = 'I') => enVerbText(getVerb(id), negative(slot), pronoun);

  it.each([
    ['indicative', 'present', "I don't eat"],
    ['indicative', 'imperfect', "I wasn't eating"],
    ['indicative', 'aorist', "I didn't eat"],
    ['indicative', 'future', "I won't eat"],
    ['indicative', 'futureSimple', "I won't eat"],
    ['indicative', 'perfect', "I haven't eaten"],
    ['indicative', 'pluperfect', "I hadn't eaten"],
    ['indicative', 'futurePerfect', "I won't have eaten"],
    ['subjunctive', 'present', "that I don't eat"],
    ['subjunctive', 'aorist', "that I don't eat"],
    ['subjunctive', 'perfect', 'I may not have eaten'],
    ['conditional', 'imperfect', "I wouldn't eat"],
    ['conditional', 'pluperfect', "I wouldn't have eaten"],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('agrees with the person', () => {
    expect(text('troo', vs('indicative', 'present', 3), 'he/she')).toBe("he/she doesn't eat");
    expect(text('troo', vs('indicative', 'perfect', 3), 'he/she')).toBe("he/she hasn't eaten");
    expect(text('troo', vs('indicative', 'imperfect', 2), 'you')).toBe("you weren't eating");
  });

  it("the negative imperative is don't + the base verb, with no subject", () => {
    expect(enVerb(getVerb('troo'), negative(vs('imperative', 'aorist', 2, 'sg')))).toEqual({
      lead: '',
      subject: false,
      verb: "don't eat",
    });
  });

  it('a modal is negated with "not": he/she may not', () => {
    expect(text('mporei', vs('indicative', 'present', 3), 'he/she')).toBe('he/she may not');
  });

  it('the reflexive voice keeps its "self" word: I don\'t wash (myself)', () => {
    expect(text('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe("I don't wash (myself)");
  });
});
