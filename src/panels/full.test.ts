import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';
import type { PanelRow } from './types';

const hot = PHRASES[0];
const improver = (i: number, state: PanelState = initialState(hot.tokens[i], hot)) =>
  buildPanel(state, hot.tokens[i], 'improver').full;
const cells = (r: PanelRow) => ({ el: richText(r.el), ro: richText(r.ro), en: richText(r.en) });
const find = (rows: PanelRow[], label: string) => rows.find((r) => r.label === label) as PanelRow;

describe('full paradigm tables', () => {
  it('are empty at the Beginner level', () => {
    for (let i = 0; i < hot.tokens.length; i++) {
      expect(buildPanel(initialState(hot.tokens[i], hot), hot.tokens[i], 'beginner').full).toEqual([]);
    }
  });

  it('verb: six persons, the current one highlighted in every column', () => {
    const full = improver(0);
    expect(full.map((r) => r.label)).toEqual(['I', 'you', 'he / she', 'we', 'you (pl.)', 'they']);
    expect(cells(full[0])).toEqual({ el: '(εγώ) θέλω', ro: '(eu) vreau', en: 'I want' });
    expect(cells(full[5])).toEqual({ el: '(αυτοί/ές) θέλουν', ro: '(ei/ele) vor', en: 'they want' });
    expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
    expect(full.filter((r) => r.hl).length).toBe(1);
  });

  it('noun: case × number with the indefinite form underneath', () => {
    const full = improver(3);
    expect(full.map((r) => r.label)).toEqual([
      'nominative sg', 'nominative pl', 'accusative sg', 'accusative pl', 'genitive sg', 'genitive pl',
    ]);
    const accSg = cells(find(full, 'accusative sg'));
    expect(accSg.el).toBe('τον καφέ έναν καφέ');
    expect(accSg.ro).toBe('cafeaua o cafea');
    expect(accSg.en).toBe('the coffee a coffee');
    expect(cells(find(full, 'accusative pl')).el).toContain('no plural a / an');
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['accusative sg']);
  });

  it('noun: a counted plural highlights the plural row', () => {
    const state = applyControl(initialState(hot.tokens[3], hot), 'count', '3');
    expect(improver(3, state).filter((r) => r.hl).map((r) => r.label)).toEqual(['accusative pl']);
  });

  it('adjective: the Greek and Romanian columns highlight different genders', () => {
    const full = improver(2);
    expect(full).toHaveLength(9);
    const mAcc = find(full, 'masc. accusative');
    expect(cells(mAcc)).toEqual({ el: 'ζεστό', ro: 'cald', en: 'hot' });
    expect(mAcc.hl).toEqual({ el: true, ro: false, en: false });
    const fAcc = find(full, 'fem. accusative');
    expect(cells(fAcc)).toEqual({ el: 'ζεστή', ro: 'caldă', en: 'hot' });
    expect(fAcc.hl).toEqual({ el: false, ro: true, en: false });
  });

  it('numeral: gender × case, the same highlighting rule', () => {
    const full = improver(1);
    expect(full).toHaveLength(9);
    expect(cells(find(full, 'neut. nominative'))).toEqual({ el: 'ένα', ro: 'un', en: 'one' });
    expect(cells(find(full, 'fem. genitive'))).toEqual({ el: 'μίας', ro: 'unei', en: 'one' });
    expect(find(full, 'masc. accusative').hl).toEqual({ el: true, ro: false, en: false });
    expect(find(full, 'fem. accusative').hl).toEqual({ el: false, ro: true, en: false });
  });

  it('article: the Romanian suffixes and the English "the"', () => {
    const token: Token = {
      text: 'τον',
      lexeme: 'def',
      slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' },
      agreesWith: 0,
    };
    const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
    const full = buildPanel(state, token, 'improver').full;
    expect(full).toHaveLength(9);
    const mAcc = find(full, 'masc. accusative');
    expect(cells(mAcc)).toEqual({ el: 'τον', ro: '-ul / -le', en: 'the' });
    expect(mAcc.hl).toEqual({ el: true, ro: true, en: true });
    expect(cells(find(full, 'masc. genitive'))).toEqual({ el: 'του', ro: '-ului / -lui', en: 'of the' });
    expect(find(full, 'fem. accusative').hl).toEqual({ el: false, ro: false, en: true });
  });

  it('preposition: the four prepositions with the same noun, the current one highlighted', () => {
    const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
    const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
    const full = buildPanel(state, token, 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for']);
    expect(cells(full[1])).toEqual({ el: 'κάτω από τον σκύλο', ro: 'sub câinele', en: 'under the dog' });
    expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
    expect(full.filter((r) => r.hl).length).toBe(1);
  });
});
