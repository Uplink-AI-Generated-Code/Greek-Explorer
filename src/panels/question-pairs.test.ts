import { describe, expect, it } from 'vitest';
import { PREPOSITIONS, getLexeme } from '../data/lexemes';
import { governsWord } from '../engine/preposition';
import { richText } from '../engine/segments';
import type { GreekInterrogative, Token } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const word = (id: string) => getLexeme(id) as GreekInterrogative;
const prep = (id: string) => PREPOSITIONS.find((p) => p.id === id)!;
const row = (prepId: string, wordId: string) => {
  const token: Token = { text: prep(prepId).lemma, lexeme: prepId, slot: { pos: 'preposition' }, agreesWith: 1 };
  const state: PanelState = { slot: token.slot, noun: wordId, nounNumber: 'sg' };
  const r = buildPanel(state, token, 'beginner').rows[0];
  return { el: richText(r.el), ro: richText(r.ro), en: richText(r.en) };
};

describe('a question word after a preposition: only the pairs that exist, with their Romanian words', () => {
  it('τι follows six prepositions', () => {
    expect(row('apo', 'ti').ro).toBe('din ce');
    expect(row('me', 'ti')).toEqual({ el: 'με τι', ro: 'cu ce', en: 'with what' });
    expect(row('gia', 'ti').ro).toBe('pentru ce');
    expect(row('pano', 'ti').ro).toBe('peste ce');
    expect(row('kato', 'ti').ro).toBe('sub ce');
    expect(row('mexri', 'ti').ro).toBe('până la ce');
  });

  it('πού follows από and μέχρι, πότε follows από, μέχρι and για', () => {
    expect(row('apo', 'pou').ro).toBe('de unde');
    expect(row('mexri', 'pou').ro).toBe('până unde');
    expect(row('apo', 'pote').ro).toBe('de când');
    expect(row('mexri', 'pote').ro).toBe('până când');
    expect(row('gia', 'pote').ro).toBe('pentru când');
  });

  it('γιατί and πώς follow no preposition, and the impossible pairs are neither offered nor accepted', () => {
    for (const p of PREPOSITIONS.filter((x) => !x.fused)) {
      expect(governsWord(p, word('giati'))).toBe(false);
      expect(governsWord(p, word('pos-how'))).toBe(false);
    }
    expect(governsWord(prep('me'), word('pou'))).toBe(false);
    expect(governsWord(prep('kato'), word('pote'))).toBe(false);
    expect(governsWord(prep('se'), word('ti'))).toBe(false);
    const noun: PanelState = { slot: { pos: 'preposition' }, noun: 'skylos', nounNumber: 'sg' };
    expect(applyControl(noun, 'noun', 'pote', 'me')).toBe(noun);
    expect(applyControl(noun, 'noun', 'pote', 'mexri')).toMatchObject({ noun: 'pote' });
    const token: Token = { text: 'με', lexeme: 'me', slot: { pos: 'preposition' }, agreesWith: 1 };
    const options = buildPanel(noun, token, 'beginner').controls[0].options.map((o) => o.value);
    expect(options).toContain('ti');
    expect(options).not.toEqual(expect.arrayContaining(['pou']));
    expect(options).not.toContain('pos-how');
  });
});
