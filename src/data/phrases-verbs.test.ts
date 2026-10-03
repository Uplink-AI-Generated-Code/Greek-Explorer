import { describe, expect, it } from 'vitest';
import { compose } from '../engine/compose';
import { linksOf } from '../glossLinks';
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

  it('are in the picker, after the first three phrases', () => {
    expect(PHRASES.slice(3, 3 + ids.length).map((p) => p.id)).toEqual(ids);
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
