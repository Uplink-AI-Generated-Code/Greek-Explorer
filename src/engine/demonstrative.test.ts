import { describe, expect, it } from 'vitest';
import { LEXEMES, getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { offeredUses, quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = (id: string) => getLexeme(id) as GreekQuantifier;
const slot = (
  gender: Gender,
  number: Num,
  c: Case,
  use: SlotOf<'quantifier'>['use'] = 'determiner',
  register?: 'spoken',
): SlotOf<'quantifier'> => ({ pos: 'quantifier', gender, number, case: c, degree: 'plain', use, ...(register ? { register } : {}) });
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflectQuantifier(q(id), s));

describe('the Greek forms of the demonstratives', () => {
  it('αυτός keeps the stress on the ending and the final ν', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('m', 'sg', 'acc'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'nom'),
      slot('m', 'sg', 'gen'), slot('f', 'sg', 'gen'), slot('m', 'pl', 'nom'), slot('m', 'pl', 'acc'),
      slot('f', 'pl', 'nom'), slot('n', 'pl', 'nom'), slot('n', 'pl', 'gen'),
    ].map((s) => greek('autos', s));
    expect(forms).toEqual(['αυτός', 'αυτόν', 'αυτήν', 'αυτό', 'αυτού', 'αυτής', 'αυτοί', 'αυτούς', 'αυτές', 'αυτά', 'αυτών']);
  });

  it('εκείνος is stressed on the stem', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'acc'), slot('m', 'sg', 'gen'),
      slot('m', 'pl', 'acc'), slot('f', 'pl', 'gen'),
    ].map((s) => greek('ekeinos', s));
    expect(forms).toEqual(['εκείνος', 'εκείνη', 'εκείνο', 'εκείνου', 'εκείνους', 'εκείνων']);
  });

  it('τέτοιος has the feminine τέτοια, and τόσος declines like an adjective', () => {
    expect([slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'acc'), slot('f', 'sg', 'gen'), slot('m', 'pl', 'nom')].map((s) => greek('tetoios', s))).toEqual([
      'τέτοιος', 'τέτοια', 'τέτοιο', 'τέτοιας', 'τέτοιοι',
    ]);
    expect([slot('m', 'sg', 'nom'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'acc'), slot('m', 'pl', 'nom'), slot('f', 'pl', 'acc'), slot('n', 'pl', 'nom')].map((s) => greek('tosos', s))).toEqual([
      'τόσος', 'τόση', 'τόσο', 'τόσοι', 'τόσες', 'τόσα',
    ]);
  });
});

describe('the Romanian forms of the demonstratives', () => {
  const ro = (id: string, s: SlotOf<'quantifier'>, g: Gender) => roQuantifier(q(id), s, g);

  it('before the noun, after it, and the genitives', () => {
    expect(ro('autos', slot('m', 'sg', 'nom'), 'm')).toBe('acest');
    expect(ro('autos', slot('f', 'sg', 'nom'), 'f')).toBe('această');
    expect(ro('autos', slot('m', 'pl', 'nom'), 'm')).toBe('acești');
    expect(ro('autos', slot('f', 'pl', 'nom'), 'f')).toBe('aceste');
    expect(ro('autos', slot('m', 'sg', 'nom', 'pronoun'), 'm')).toBe('acesta');
    expect(ro('autos', slot('f', 'pl', 'nom', 'pronoun'), 'f')).toBe('acestea');
    expect(ro('autos', slot('m', 'sg', 'gen'), 'm')).toBe('acestui');
    expect(ro('autos', slot('f', 'sg', 'gen', 'pronoun'), 'f')).toBe('acesteia');
    expect(ro('ekeinos', slot('m', 'sg', 'nom'), 'm')).toBe('acel');
    expect(ro('ekeinos', slot('f', 'sg', 'nom'), 'f')).toBe('acea');
    expect(ro('ekeinos', slot('m', 'pl', 'nom', 'pronoun'), 'm')).toBe('aceia');
    expect(ro('ekeinos', slot('m', 'sg', 'gen', 'pronoun'), 'm')).toBe('aceluia');
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(ro('autos', slot('n', 'sg', 'nom'), 'n')).toBe('acest');
    expect(ro('autos', slot('n', 'pl', 'nom'), 'n')).toBe('aceste');
  });

  it('the spoken forms have no genitive', () => {
    expect(ro('autos', slot('m', 'sg', 'nom', 'determiner', 'spoken'), 'm')).toBe('ăsta');
    expect(ro('autos', slot('f', 'sg', 'nom', 'pronoun', 'spoken'), 'f')).toBe('asta');
    expect(ro('ekeinos', slot('f', 'pl', 'nom', 'determiner', 'spoken'), 'f')).toBe('alea');
    expect(ro('ekeinos', slot('m', 'pl', 'nom', 'determiner', 'spoken'), 'm')).toBe('ăia');
    expect(ro('autos', slot('m', 'sg', 'gen', 'determiner', 'spoken'), 'm')).toBeNull();
  });

  it('asemenea, with its article, and atâta', () => {
    expect(ro('tetoios', slot('m', 'sg', 'nom'), 'm')).toBe('un asemenea');
    expect(ro('tetoios', slot('f', 'sg', 'nom'), 'f')).toBe('o asemenea');
    expect(ro('tetoios', slot('m', 'pl', 'nom'), 'm')).toBe('asemenea');
    expect(ro('tetoios', slot('f', 'sg', 'gen'), 'f')).toBe('unei asemenea');
    expect(ro('tosos', slot('f', 'sg', 'nom'), 'f')).toBe('atâta');
    expect(ro('tosos', slot('m', 'pl', 'nom'), 'm')).toBe('atâția');
    expect(ro('tosos', slot('f', 'pl', 'acc'), 'f')).toBe('atâtea');
    expect(ro('tosos', slot('m', 'sg', 'nom', 'pronoun'), 'm')).toBe('atât');
  });

  it('a lexeme with no spoken forms has no spoken slot', () => {
    expect(() => ro('polys', slot('m', 'sg', 'nom', 'determiner', 'spoken'), 'm')).toThrow(/no Romanian spoken forms/);
  });
});

describe('the English forms of the demonstratives', () => {
  it('follow the number', () => {
    const en = (id: string, number: Num, use: SlotOf<'quantifier'>['use'] = 'determiner') => enQuantifier(q(id), slot('m', number, 'nom', use));
    expect([en('autos', 'sg'), en('autos', 'pl'), en('ekeinos', 'sg'), en('ekeinos', 'pl', 'pronoun')]).toEqual(['this', 'these', 'that', 'those']);
    expect([en('tetoios', 'sg'), en('tetoios', 'pl'), en('tosos', 'sg'), en('tosos', 'pl')]).toEqual(['such a', 'such', 'so much', 'so many']);
  });

  it('τέτοιος has no stand-alone use', () => {
    expect(() => enQuantifier(q('tetoios'), slot('m', 'sg', 'nom', 'pronoun'))).toThrow(/no English pronoun form/);
  });
});

describe('the slots of the demonstratives', () => {
  it('αυτός and εκείνος have both uses and the spoken register', () => {
    expect(quantifierSlots(q('autos'))).toHaveLength(72);
    expect(quantifierSlots(q('autos')).filter((s) => s.register === 'spoken')).toHaveLength(36);
    expect(offeredUses(q('autos'))).toEqual(['determiner', 'pronoun']);
  });

  it('τέτοιος has the determiner only, and τόσος the subject and object only', () => {
    expect(offeredUses(q('tetoios'))).toEqual(['determiner']);
    expect(quantifierSlots(q('tetoios'))).toHaveLength(18);
    expect(quantifierSlots(q('tosos')).every((s) => s.case !== 'gen')).toBe(true);
  });

  it('the new lexemes are unverified and validate', () => {
    for (const id of ['autos', 'ekeinos', 'tetoios', 'tosos']) {
      expect(q(id).verified).toEqual({ el: false, ro: false, en: false });
      expect(q(id).demonstrative).toBeDefined();
    }
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });
});

describe('the validator and the demonstratives', () => {
  const without = (id: string, change: (l: GreekQuantifier) => GreekQuantifier) => ({ ...LEXEMES, [id]: change({ ...q(id) }) });
  const errors = (lexemes: Record<string, (typeof LEXEMES)[string]>) => validate({ lexemes, phrases: [] });

  it('wants the spoken forms on a near or far demonstrative', () => {
    const bad = without('autos', (l) => ({ ...l, ro: { ...l.ro, spoken: undefined } }));
    expect(errors(bad)).toContain('lexeme autos: a near or far demonstrative needs its spoken Romanian forms');
  });

  it('wants τέτοιος beside a noun only', () => {
    const bad = without('tetoios', (l) => ({ ...l, uses: undefined }));
    expect(errors(bad)).toContain('lexeme tetoios: τέτοιος is offered beside a noun only');
  });
});
