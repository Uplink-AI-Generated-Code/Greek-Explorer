import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { Gender, GreekRelative, Num, RelativeRole, SlotOf } from '../types';
import { inflect } from './greek';
import { greekOpoios, opoiosWord } from './relative';
import { relativeGroup } from './relativeGroup';
import { formText, richText } from './segments';

const slot = (role: RelativeRole, gender: Gender, number: Num, preposition?: string): SlotOf<'relative'> => ({
  pos: 'relative',
  role,
  gender,
  number,
  ...(preposition ? { preposition } : {}),
});
const group = (kind: 'pou' | 'opoios', s: SlotOf<'relative'>, antecedent: string, owned = 'spiti') => {
  const g = relativeGroup(kind, s, getNoun(antecedent), getNoun(owned));
  return { el: richText(g.el), ro: g.ro, en: g.en };
};

describe('the relative lexemes', () => {
  it('που and ο οποίος are unverified', () => {
    for (const id of ['rel-pou', 'rel-opoios']) {
      expect(getLexeme(id).pos).toBe('relative');
      expect(getLexeme(id).verified).toEqual({ el: false, ro: false, en: false });
    }
  });

  it('the token text of που never changes, and ο οποίος is a chip with its article', () => {
    const pou = getLexeme('rel-pou') as GreekRelative;
    const opoios = getLexeme('rel-opoios') as GreekRelative;
    expect(formText(inflect(pou, slot('whose', 'f', 'pl')))).toBe('που');
    expect(formText(inflect(opoios, slot('subject', 'm', 'sg')))).toBe('ο οποίος');
  });

  it('the animals and the child are animate; the house, the sea and the bread are not', () => {
    expect(['skylos', 'alepou', 'paidi'].every((id) => getNoun(id).animate === true)).toBe(true);
    expect(['spiti', 'thalassa', 'psomi', 'kafes'].every((id) => getNoun(id).animate === undefined)).toBe(true);
  });
});

describe('ο οποίος', () => {
  it('takes the case of its job and the gender and number of its noun', () => {
    const cell = (role: RelativeRole, gender: Gender, number: Num) => greekOpoios(slot(role, gender, number));
    expect([cell('subject', 'm', 'sg'), cell('subject', 'f', 'sg'), cell('subject', 'n', 'sg'), cell('subject', 'm', 'pl'), cell('subject', 'f', 'pl'), cell('subject', 'n', 'pl')]).toEqual([
      'ο οποίος', 'η οποία', 'το οποίο', 'οι οποίοι', 'οι οποίες', 'τα οποία',
    ]);
    expect([cell('object', 'm', 'sg'), cell('object', 'f', 'sg'), cell('object', 'n', 'sg'), cell('object', 'm', 'pl'), cell('object', 'f', 'pl')]).toEqual([
      'τον οποίο', 'την οποία', 'το οποίο', 'τους οποίους', 'τις οποίες',
    ]);
    expect([cell('whose', 'm', 'sg'), cell('whose', 'f', 'sg'), cell('whose', 'n', 'sg'), cell('whose', 'm', 'pl')]).toEqual([
      'του οποίου', 'της οποίας', 'του οποίου', 'των οποίων',
    ]);
    expect(opoiosWord(slot('object', 'm', 'sg'))).toBe('οποίο');
  });

  it('σε fuses with the article for "to whom", and the other prepositions stand apart', () => {
    expect(greekOpoios(slot('indirect', 'm', 'sg'))).toBe('στον οποίο');
    expect(greekOpoios(slot('indirect', 'f', 'sg'))).toBe('στην οποία');
    expect(greekOpoios(slot('indirect', 'n', 'pl'))).toBe('στα οποία');
    expect(greekOpoios(slot('preposition', 'n', 'sg', 'se'))).toBe('στο οποίο');
    expect(greekOpoios(slot('preposition', 'n', 'sg', 'me'))).toBe('με το οποίο');
    expect(greekOpoios(slot('preposition', 'f', 'sg', 'pano'))).toBe('πάνω από την οποία');
    expect(greekOpoios(slot('preposition', 'm', 'pl', 'gia'))).toBe('για τους οποίους');
  });

  it('a job after a preposition needs the preposition', () => {
    expect(() => greekOpoios(slot('preposition', 'n', 'sg'))).toThrow(/needs the preposition/);
  });
});

describe('the pronoun group in three languages', () => {
  it('subject and object: που stands alone; Romanian care and pe care; English who, whom, which', () => {
    expect(group('pou', slot('subject', 'n', 'sg'), 'paidi')).toEqual({ el: 'που', ro: 'care', en: 'who' });
    expect(group('opoios', slot('subject', 'n', 'sg'), 'paidi')).toEqual({ el: 'το οποίο', ro: 'care', en: 'who' });
    expect(group('pou', slot('subject', 'n', 'sg'), 'spiti').en).toBe('which');
    expect(group('opoios', slot('object', 'm', 'sg'), 'skylos')).toEqual({ el: 'τον οποίο', ro: 'pe care', en: 'whom' });
    expect(group('pou', slot('object', 'n', 'sg'), 'psomi')).toEqual({ el: 'που', ro: 'pe care', en: 'which' });
  });

  it('to whom: που with a pronoun, the dative of care, "to whom"', () => {
    expect(group('pou', slot('indirect', 'n', 'sg'), 'paidi')).toEqual({ el: 'που του …', ro: 'căruia', en: 'to whom' });
    expect(group('opoios', slot('indirect', 'n', 'sg'), 'paidi').el).toBe('στο οποίο');
    expect(group('pou', slot('indirect', 'f', 'sg'), 'alepou')).toEqual({ el: 'που της …', ro: 'căreia', en: 'to whom' });
    expect(group('pou', slot('indirect', 'n', 'pl'), 'paidi')).toEqual({ el: 'που τους …', ro: 'cărora', en: 'to whom' });
    expect(group('pou', slot('indirect', 'n', 'sg'), 'spiti').en).toBe('to which');
  });

  it('whose: the first Romanian word follows the owned thing, the second the antecedent', () => {
    expect(group('opoios', slot('whose', 'm', 'sg'), 'skylos', 'spiti')).toEqual({ el: 'του οποίου το σπίτι', ro: 'a cărui casă', en: 'whose house' });
    expect(group('pou', slot('whose', 'm', 'sg'), 'skylos', 'spiti').el).toBe('που το σπίτι του …');
    expect(group('opoios', slot('whose', 'f', 'sg'), 'thalassa', 'skylos')).toEqual({ el: 'της οποίας ο σκύλος', ro: 'al cărei câine', en: 'whose dog' });
    expect(group('pou', slot('whose', 'f', 'sg'), 'thalassa', 'skylos').el).toBe('που ο σκύλος της …');
    expect(group('opoios', slot('whose', 'n', 'pl'), 'paidi', 'skylos')).toEqual({ el: 'των οποίων ο σκύλος', ro: 'al căror câine', en: 'whose dog' });
  });

  it('after a preposition: ο οποίος with it, που with the strong pronoun after the clause', () => {
    expect(group('opoios', slot('preposition', 'n', 'sg', 'me'), 'paidi')).toEqual({ el: 'με το οποίο', ro: 'cu care', en: 'with whom' });
    expect(group('pou', slot('preposition', 'n', 'sg', 'me'), 'spiti')).toEqual({ el: 'που … με αυτό', ro: 'cu care', en: 'with which' });
    expect(group('pou', slot('preposition', 'm', 'sg', 'gia'), 'skylos')).toEqual({ el: 'που … για αυτόν', ro: 'pentru care', en: 'for whom' });
    expect(group('opoios', slot('preposition', 'n', 'sg', 'se'), 'spiti')).toEqual({ el: 'στο οποίο', ro: 'la care', en: 'to which' });
    expect(group('pou', slot('preposition', 'n', 'pl', 'apo'), 'paidi').el).toBe('που … από αυτά');
  });
});
