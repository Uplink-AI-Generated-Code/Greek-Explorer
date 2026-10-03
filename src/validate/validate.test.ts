import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import { isSegmented, unitText } from '../glossLinks';
import type { GlossUnit, GreekVerb, Link, Phrase, Token, VerbVoice } from '../types';
import { validate, warnings } from './validate';

const real = { lexemes: LEXEMES, phrases: PHRASES };

/** A copy of phrase 1 with one token changed. */
const withToken = (index: number, patch: Partial<Token>): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) => (i === index ? { ...t, ...patch } : t)),
});

describe('validate', () => {
  it('accepts the real data', () => {
    expect(validate(real)).toEqual([]);
  });

  it('reports an unknown lexeme', () => {
    expect(validate({ ...real, phrases: [withToken(3, { lexeme: 'nope' })] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): unknown lexeme "nope"',
    );
  });

  it('reports a slot of the wrong part of speech', () => {
    const bad = withToken(3, { slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): slot is article but lexeme kafes is noun',
    );
  });

  it('reports a gloss link outside the phrase', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: 9 }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports an adjective that does not agree with its noun in gender', () => {
    const bad = withToken(2, { slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): slot gender f differs from noun gender m',
    );
  });

  it('reports a missing agreesWith on an adjective', () => {
    const bad = withToken(2, { agreesWith: undefined });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): adjective needs agreesWith pointing at a noun',
    );
  });

  it('reports an empty Romanian form on a lexeme', () => {
    const lexemes = {
      ...LEXEMES,
      kafes: {
        ...LEXEMES.kafes,
        ro: {
          lemma: 'cafea',
          gender: 'f',
          forms: {
            sg: { definite: '', indefinite: 'o cafea', genDefinite: 'cafelei', genIndefinite: 'unei cafele' },
            pl: { definite: 'cafelele', indefinite: 'cafele', genDefinite: 'cafelelor', genIndefinite: 'unor cafele' },
          },
          split: { sg: ['cafea', 'ua'], pl: ['cafele', 'le'] },
        },
      },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme kafes: empty Romanian form sg.definite');
  });

  const withExtraUnit = (link: Link): Phrase => ({
    ...PHRASES[0],
    glosses: PHRASES[0].glosses.map((g, i) =>
      i === 0 ? { ...g, units: [...g.units, { text: 'extra', link }] } : g,
    ),
  });

  it('accepts a gloss link to a piece of an existing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: 0 })] })).toEqual([]);
  });

  it('reports a piece link to a missing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 9, piece: 0 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports a negative piece number', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: -1 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" has an invalid piece -1',
    );
  });

  it('reports a phrase with no theme', () => {
    expect(validate({ ...real, phrases: [{ ...PHRASES[0], theme: '' }] })).toContain(
      'ordering-hot-coffee: missing theme',
    );
  });

  it('reports an empty Romanian or English form on a preposition', () => {
    const lexemes = {
      ...LEXEMES,
      pano: { ...LEXEMES.pano, ro: '' },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme pano: empty Romanian form');
  });
});

describe('segmented gloss units', () => {
  const fox = PHRASES.find((p) => p.id === 'fox-sentence') as Phrase;

  /** The fox sentence with its Romanian "câinele" unit replaced by the given segments. */
  const withDogUnit = (segments: { text: string; link: number }[]): Phrase => ({
    ...fox,
    glosses: fox.glosses.map((g) =>
      g.language === 'ro' && g.kind === 'natural'
        ? {
            ...g,
            units: g.units.map((u): GlossUnit => (isSegmented(u) && unitText(u) === 'câinele' ? { segments } : u)),
          }
        : g,
    ),
  });

  it('the real data has no errors and no warnings', () => {
    expect(validate(real)).toEqual([]);
    expect(warnings(real)).toEqual([]);
  });

  it('reports a segment that links to a missing token', () => {
    const bad = withDogUnit([
      { text: 'câine', link: 99 },
      { text: 'le', link: 6 },
    ]);
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: unit "câinele" links to missing token 99',
    );
  });

  it('warns when the authored split disagrees with the noun data', () => {
    const bad = withDogUnit([
      { text: 'câin', link: 8 },
      { text: 'ele', link: 6 },
    ]);
    expect(warnings({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: "câinele" is split câin + ele, the noun data splits it câine + le',
    );
  });

  it('warns when a segmented unit is not linked to a noun', () => {
    const bad = withDogUnit([
      { text: 'câine', link: 6 },
      { text: 'le', link: 7 },
    ]);
    expect(warnings({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: segmented unit "câinele" is not linked to a noun',
    );
  });
});

describe('verb lexemes', () => {
  /** The real data with the active voice of τρώω changed by `patch` (a deep copy, so the real data is untouched). */
  const modifiedTroo = (patch: (voice: VerbVoice) => void) => {
    const copy: typeof LEXEMES = JSON.parse(JSON.stringify(LEXEMES));
    patch((copy.troo as GreekVerb).voices.active as VerbVoice);
    return { lexemes: copy, phrases: [] as Phrase[] };
  };

  it('reports a Romanian cell the verb needs and does not have', () => {
    const errors = validate(modifiedTroo((v) => { delete v.ro.imperative; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot build') && e.includes('Romanian imperative'))).toBe(true);
  });

  it('reports an empty English participle that a perfect tense needs', () => {
    const errors = validate(modifiedTroo((v) => { v.en.pastParticiple = ''; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: empty English form'))).toBe(true);
  });

  it('reports a Romanian cell that ends in a space', () => {
    const errors = validate(modifiedTroo((v) => { v.ro.participle = ''; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot build') && e.includes('Romanian'))).toBe(true);
  });

  it('reports a slot with no Greek form (a missing perfective stem)', () => {
    const errors = validate(modifiedTroo((v) => { delete v.stems.perfective; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot inflect'))).toBe(true);
  });
});

describe('verb tokens', () => {
  const thelo = PHRASES[0].tokens[0];

  it('reports a verb token whose text differs from what compose produces', () => {
    const errors = validate({ ...real, phrases: [withToken(0, { text: 'Θέλεις' })] });
    expect(errors).toContain('ordering-hot-coffee token 0 (Θέλεις): text differs from what compose produces ("θέλω")');
  });

  it('ignores capitals and trailing punctuation when comparing', () => {
    expect(validate({ ...real, phrases: [withToken(0, { text: 'ΘΈΛΩ!' })] })).toEqual([]);
  });

  it('reports a slot the verb does not offer', () => {
    const slot = { ...thelo.slot, mood: 'imperative', tense: 'aorist' } as Token['slot'];
    expect(validate({ ...real, phrases: [withToken(0, { slot })] })).toContain(
      'ordering-hot-coffee token 0 (Θέλω): slot is not offered by thelo',
    );
  });

  it('reports a piece link beyond the pieces the token has', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: { token: 0, piece: 1 } }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" has piece 1 but token 0 has 1 piece',
    );
  });

  it('reports a piece link to a token that is not a verb group', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: { token: 3, piece: 0 } }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to piece 0 of token 3, which is not a verb group',
    );
  });
});

describe('segmented units with punctuation', () => {
  it('does not warn when a segment carries trailing punctuation: pâine|a!', () => {
    const eat = PHRASES.find((x) => x.id === 'eat-the-bread');
    expect(eat).toBeDefined();
    expect(warnings({ lexemes: LEXEMES, phrases: [eat as Phrase] })).toEqual([]);
  });
});
