import { describe, expect, it } from 'vitest';
import { getNoun, getVerb } from '../data/lexemes';
import { buildPanel } from '../panels/panels';
import type { Num, Person, SlotOf } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflectNoun } from './greek';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { readingFor } from './reading';
import { roVerb } from './romanian';
import { formText } from './segments';

const present = (person: Person, number: Num, negative = false): SlotOf<'verb'> => ({
  pos: 'verb',
  person,
  number,
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
  ...(negative ? { polarity: 'negative' as const } : {}),
});

describe('νερό', () => {
  it.each([
    ['sg', 'nom', 'νερό'],
    ['sg', 'acc', 'νερό'],
    ['sg', 'gen', 'νερού'],
    ['pl', 'nom', 'νερά'],
    ['pl', 'acc', 'νερά'],
    ['pl', 'gen', 'νερών'],
  ] as const)('%s %s -> %s', (number, c, expected) => {
    expect(formText(inflectNoun(getNoun('nero'), { pos: 'noun', number, case: c }))).toBe(expected);
  });

  it('is neuter in Greek and feminine in Romanian, and a mass noun like ψωμί', () => {
    const nero = getNoun('nero');
    expect(nero.gender).toBe('n');
    expect(nero.ro.gender).toBe('f');
    expect(nero.ro.forms.sg.indefinite).toBe('o apă');
    expect(nero.en).toEqual({ sg: 'water', pl: 'water' });
    expect(nero.mass).toBe(true);
    expect(getNoun('psomi').mass).toBe(true);
    expect(getNoun('kafes').mass).toBeUndefined();
  });
});

describe('είμαι', () => {
  const who: [Person, Num, string, string, string][] = [
    [1, 'sg', 'είμαι', 'sunt', 'I am'],
    [2, 'sg', 'είσαι', 'ești', 'you are'],
    [3, 'sg', 'είναι', 'este', 'he/she is'],
    [1, 'pl', 'είμαστε', 'suntem', 'we are'],
    [2, 'pl', 'είστε', 'sunteți', 'you are'],
    [3, 'pl', 'είναι', 'sunt', 'they are'],
  ];

  it.each(who)('person %s %s: %s / %s / %s', (person, number, el, ro, en) => {
    const verb = getVerb('eimai');
    const slot = present(person, number);
    expect(compose(verb, slot).text).toBe(el);
    expect(roVerb(verb, slot)).toBe(ro);
    expect(enVerbText(verb, slot, EN_PRONOUNS[(person - 1) + (number === 'pl' ? 3 : 0)])).toBe(en);
  });

  it('negates with δεν, nu and the English contractions', () => {
    const verb = getVerb('eimai');
    expect(compose(verb, present(1, 'sg', true)).text).toBe('δεν είμαι');
    expect(roVerb(verb, present(1, 'sg', true))).toBe('nu sunt');
    expect(enVerbText(verb, present(1, 'sg', true), 'I')).toBe('I am not');
    expect(enVerbText(verb, present(2, 'sg', true), 'you')).toBe("you aren't");
    expect(enVerbText(verb, present(3, 'sg', true), 'he/she')).toBe("he/she isn't");
  });

  it('offers only the present indicative, six persons', () => {
    expect(allVerbSlots(getVerb('eimai'))).toHaveLength(6);
  });

  it('is irregular, and its reading is one word with no hyphen and no ending', () => {
    const el = readingFor(getVerb('eimai'), present(3, 'sg')).el;
    expect(el.parts).toEqual([{ text: 'είναι', label: 'είναι', role: 'stem', gloss: 'be', piece: 0 }]);
    expect(el.beginner).toContain('irregular');
    expect(el.beginner).toContain('είμαι, είσαι, είναι, είμαστε, είστε, είναι');
  });

  it('has a verb panel with the irregularity message', () => {
    const slot = present(1, 'sg');
    const panel = buildPanel({ slot, noun: null, nounNumber: 'sg' }, { text: 'είμαι', lexeme: 'eimai', slot }, 'beginner');
    expect(panel.lemma).toBe('είμαι');
    expect(panel.posLabel).toBe('verb: to be');
    expect(panel.irregular).toContain('learn its six forms together');
  });
});
