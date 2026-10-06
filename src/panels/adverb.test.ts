import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { formText, richText } from '../engine/segments';
import { inflect } from '../engine/greek';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const token = (lexeme: string): Token => ({ text: lexeme, lexeme, slot: { pos: 'adverb' } });
const panelOf = (lexeme: string, level: 'beginner' | 'improver' = 'beginner') =>
  buildPanel({ slot: { pos: 'adverb' }, noun: null, nounNumber: 'sg' }, token(lexeme), level);

describe('the place words', () => {
  it('εδώ and εκεί are unverified lexemes that never change', () => {
    for (const id of ['edo', 'ekei']) {
      const lexeme = getLexeme(id);
      expect(lexeme.pos).toBe('adverb');
      expect(lexeme.verified).toEqual({ el: false, ro: false, en: false });
      expect(formText(inflect(lexeme, { pos: 'adverb' }))).toBe(lexeme.lemma);
    }
  });

  it('the panel shows the word on its own and in a sentence', () => {
    const here = panelOf('edo');
    expect(here.lemma).toBe('εδώ');
    expect(here.posLabel).toBe('place word: here');
    expect(here.controls).toEqual([]);
    expect(here.rows.map((r) => r.label)).toEqual(['on its own', 'in a sentence']);
    expect(cells(here.rows, 0)).toEqual({ el: 'εδώ', ro: 'aici', en: 'here' });
    expect(cells(here.rows, 1)).toEqual({ el: 'Εδώ είναι το σπίτι', ro: 'Aici este casa', en: 'Here is the house' });
    const there = panelOf('ekei', 'improver');
    expect(there.posLabel).toBe('adverb · never changes');
    expect(cells(there.rows, 0)).toEqual({ el: 'εκεί', ro: 'acolo', en: 'there' });
    expect(there.full).toEqual([]);
  });

  it('has no controls to apply', () => {
    const state: PanelState = { slot: { pos: 'adverb' }, noun: null, nounNumber: 'sg' };
    expect(applyControl(state, 'case', 'gen')).toBe(state);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
  });
});

describe('a preposition before a place word', () => {
  const mexri: Token = { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 };
  const apo: Token = { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 };
  const phrase = (prep: Token, word: string): Phrase => ({
    id: 'x', title: 'x', theme: 'x', level: 'beginner', tokens: [prep, token(word)], glosses: [], verified: false,
  });

  it('μέχρι εκεί is "until there", and până acolo (not până la acolo)', () => {
    const state = initialState(mexri, phrase(mexri, 'ekei'));
    expect(state.noun).toBe('ekei');
    const panel = buildPanel(state, mexri, 'beginner');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + place word']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'μέχρι εκεί', ro: 'până acolo', en: 'until there' });
    expect(panel.controls.map((c) => c.key)).toEqual(['noun']);
    expect(panel.plain).toContain('μέχρι εκεί');
  });

  it('από εδώ is de aici', () => {
    const state = initialState(apo, phrase(apo, 'edo'));
    expect(cells(buildPanel(state, apo, 'beginner').rows, 0)).toEqual({ el: 'από εδώ', ro: 'de aici', en: 'from here' });
    expect(cells(buildPanel(applyControl(state, 'noun', 'ekei'), apo, 'beginner').rows, 0).ro).toBe('de acolo');
  });

  it('μέχρι εδώ is până aici', () => {
    const state = initialState(mexri, phrase(mexri, 'edo'));
    expect(cells(buildPanel(state, mexri, 'beginner').rows, 0)).toEqual({ el: 'μέχρι εδώ', ro: 'până aici', en: 'until here' });
  });

  it('the control offers the place words, and switching to one drops the number', () => {
    const noun: PanelState = { slot: apo.slot, noun: 'skylos', nounNumber: 'pl' };
    const next = applyControl(noun, 'noun', 'edo');
    expect(next).toMatchObject({ noun: 'edo', nounNumber: 'sg' });
    expect(buildPanel(next, apo, 'beginner').controls[0].options.map((o) => o.value)).toEqual(expect.arrayContaining(['edo', 'ekei']));
  });

  it('Improver lists only the prepositions that take a place word', () => {
    const state = initialState(mexri, phrase(mexri, 'ekei'));
    expect(buildPanel(state, mexri, 'improver').full.map((r) => r.label)).toEqual(['from', 'until']);
  });

  it('a preposition other than από and μέχρι neither offers nor accepts a place word', () => {
    const me: Token = { text: 'με', lexeme: 'me', slot: { pos: 'preposition' }, agreesWith: 1 };
    const noun: PanelState = { slot: { pos: 'preposition' }, noun: 'skylos', nounNumber: 'sg' };
    const options = buildPanel(noun, me, 'beginner').controls[0].options.map((o) => o.value);
    expect(options).not.toContain('edo');
    expect(options).toContain('pou');
    expect(applyControl(noun, 'noun', 'edo', 'me')).toBe(noun);
    expect(applyControl(noun, 'noun', 'edo', 'apo')).toMatchObject({ noun: 'edo' });
  });
});
