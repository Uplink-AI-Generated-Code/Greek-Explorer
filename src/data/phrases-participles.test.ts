import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { richText } from '../engine/segments';
import { buildPanel, initialState } from '../panels/panels';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES } from './lexemes';
import { PHRASES } from './phrases';

const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};
const rowOf = (id: string, token: number) => {
  const phrase = byId(id);
  const row = buildPanel(initialState(phrase.tokens[token], phrase), phrase.tokens[token], 'beginner').rows[0];
  return [richText(row.el), richText(row.ro), richText(row.en)];
};

describe('phrases with the copula and a participle (32, 33)', () => {
  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('have four tokens each, start unverified and have a theme', () => {
    expect(byId('child-is-washed').tokens.map((t) => t.text)).toEqual(['Το', 'παιδί', 'είναι', 'πλυμένο']);
    expect(byId('bread-is-baked').tokens.map((t) => t.text)).toEqual(['Το', 'ψωμί', 'είναι', 'ψημένο']);
    for (const id of ['child-is-washed', 'bread-is-baked']) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('είναι is the copula in the third person singular; the participle agrees with the noun', () => {
    for (const id of ['child-is-washed', 'bread-is-baked']) {
      const phrase = byId(id);
      expect(phrase.tokens[2]).toMatchObject({ lexeme: 'eimai', slot: { person: 3, number: 'sg', tense: 'present' } });
      expect(phrase.tokens[3]).toMatchObject({ agreesWith: 1, slot: { gender: 'n', number: 'sg', case: 'nom' } });
    }
  });

  it('the participle panel agrees in Greek and follows the Romanian noun gender', () => {
    expect(rowOf('child-is-washed', 3)).toEqual(['το πλυμένο παιδί', 'copilul spălat', 'the washed child']);
    expect(rowOf('bread-is-baked', 3)).toEqual(['το ψημένο ψωμί', 'pâinea coaptă', 'the baked bread']);
  });

  it('the copula panel reads (αυτός/ή) είναι / (el/ea) este / he/she is', () => {
    expect(rowOf('child-is-washed', 2)).toEqual(['(αυτός/ή) είναι', '(el/ea) este', 'he/she is']);
  });
});

describe('the participle notes', () => {
  const ids = (lexeme: string, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'adjective', lexeme, level).map((d) => d.id);

  it('πλυμένος shows agreement for both levels and the perfect contrast for Improver', () => {
    expect(ids('plymenos', 'beginner')).toContain('participle-agreement');
    expect(ids('plymenos', 'beginner')).not.toContain('perfect-vs-participle');
    expect(ids('plymenos', 'improver')).toContain('perfect-vs-participle');
  });
  it('ψημένος shows the gender contrast', () => {
    expect(ids('psimenos', 'beginner')).toContain('participle-agreement-gender');
  });
  it('an ordinary adjective shows none of them', () => {
    expect(ids('zestos', 'improver').filter((id) => id.startsWith('participle') || id === 'perfect-vs-participle')).toEqual([]);
  });
  it('start unverified', () => {
    for (const id of ['participle-agreement', 'perfect-vs-participle', 'participle-agreement-gender']) {
      expect(DIVERGENCES.find((d) => d.id === id)?.verified).toBe(false);
    }
  });
});
