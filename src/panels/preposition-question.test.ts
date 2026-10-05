import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const apo: Token = { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 };
const pou: Token = { text: 'πού', lexeme: 'pou', slot: { pos: 'interrogative' } };
const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens: [apo, pou], glosses: [], verified: false } satisfies Phrase;
const state: PanelState = initialState(apo, phrase);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});

describe('a preposition before a question word', () => {
  it('starts with the question word the phrase has', () => {
    expect(state.noun).toBe('pou');
  });

  it('από πού is "from where" in Greek and English, and one Romanian word, de unde', () => {
    const panel = buildPanel(state, apo, 'beginner');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + question word']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'από πού', ro: 'de unde', en: 'from where' });
    expect(panel.controls.map((c) => c.key)).toEqual(['noun']);
    expect(panel.plain).toContain('de unde');
    expect(panel.note).toBe('');
  });

  it('μέχρι πότε is "until when" and până când', () => {
    const mexri: Token = { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 };
    const next = applyControl({ ...state, slot: mexri.slot }, 'noun', 'pote');
    expect(cells(buildPanel(next, mexri, 'beginner').rows, 0)).toEqual({ el: 'μέχρι πότε', ro: 'până când', en: 'until when' });
  });

  it('builds "preposition + question word" from the two words when Romanian has no fused one', () => {
    const next = applyControl(state, 'noun', 'ti');
    expect(cells(buildPanel(next, apo, 'beginner').rows, 0)).toEqual({ el: 'από τι', ro: 'de la ce', en: 'from what' });
  });

  it('offers the nouns and then the question words in the control, and switches back to a noun', () => {
    const options = buildPanel(state, apo, 'beginner').controls[0].options.map((o) => o.value);
    expect(options.slice(-5)).toEqual(['ti', 'pou', 'pote', 'giati', 'pos-how']);
    expect(options).toContain('skylos');
    const noun = applyControl(state, 'noun', 'skylos');
    expect(noun.noun).toBe('skylos');
    const panel = buildPanel(noun, apo, 'beginner');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'από τον σκύλο', ro: 'de la câinele', en: 'from the dog' });
  });

  it('Improver lists every preposition with the question word', () => {
    const full = buildPanel(state, apo, 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
    expect(cells(full, 4)).toEqual({ el: 'από πού', ro: 'de unde', en: 'from where' });
    expect(cells(full, 5)).toEqual({ el: 'μέχρι πού', ro: 'până la unde', en: 'until where' });
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['from']);
  });
});

describe('choosing the phrase\'s own question word again', () => {
  it('equals the phrase state even after a noun and "many" were chosen', () => {
    let next = applyControl(state, 'noun', 'skylos');
    next = applyControl(next, 'number', 'pl');
    expect(sameState(next, state)).toBe(false);
    expect(sameState(applyControl(next, 'noun', 'pou'), state)).toBe(true);
  });
});
