import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, PrepSense, Token } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const token = (sense?: PrepSense): Token => ({
  text: 'στον',
  lexeme: 'se',
  slot: { pos: 'preposition', ...(sense ? { sense } : {}) },
  agreesWith: 1,
});
const stateOf = (noun: string, sense?: PrepSense, nounNumber: 'sg' | 'pl' = 'sg'): PanelState => ({
  slot: token(sense).slot,
  noun,
  nounNumber,
});
const panelOf = (state: PanelState, level: Level = 'beginner') => buildPanel(state, token(), level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the σε panel', () => {
  it('shows the fused form with the noun, and the Romanian and English word of the meaning', () => {
    const p = panelOf(stateOf('skylos', 'on'));
    expect(p.lemma).toBe('σε');
    expect(cells(p.rows, 0)).toEqual({ el: 'στον σκύλο', ro: 'pe câinele', en: 'on the dog' });
    expect(p.rows[0].label).toBe('prep. + noun');
  });

  it('fuses with the feminine and the neuter, singular and plural', () => {
    expect(cells(panelOf(stateOf('alepou', 'to')).rows, 0)).toEqual({ el: 'στην αλεπού', ro: 'la vulpea', en: 'to the fox' });
    expect(cells(panelOf(stateOf('psomi', 'at')).rows, 0)).toEqual({ el: 'στο ψωμί', ro: 'la pâinea', en: 'at the bread' });
    expect(cells(panelOf(stateOf('psomi', 'in', 'pl')).rows, 0)).toEqual({ el: 'στα ψωμιά', ro: 'în pâinile', en: 'in the bread' });
  });

  it('writes στη before most consonants and στην before a vowel', () => {
    expect(cells(panelOf(stateOf('thalassa', 'to')).rows, 0)).toEqual({ el: 'στη θάλασσα', ro: 'la marea', en: 'to the sea' });
    expect(cells(panelOf(stateOf('alepou', 'to')).rows, 0).el).toBe('στην αλεπού');
    expect(panelOf(stateOf('thalassa', 'to'), 'improver').full.map((r) => richText(r.el))).toContain('στην');
  });

  it('for a person Romanian uses the dative and no preposition', () => {
    const p = panelOf(stateOf('paidi', 'person'));
    expect(cells(p.rows, 0)).toEqual({ el: 'στο παιδί', ro: 'copilului', en: 'to the child' });
  });

  it('offers the five meanings, starts with "to", and shows an example of the meaning', () => {
    const start = panelOf(stateOf('skylos'));
    expect(control(start, 'sense')?.value).toBe('to');
    expect(control(start, 'sense')?.options.map((o) => o.value)).toEqual(['to', 'at', 'in', 'on', 'person']);
    expect(control(start, 'sense')?.options.map((o) => o.label)).toEqual([
      'to (direction)', 'at (place)', 'in, into', 'on (a surface)', 'to a person',
    ]);
    const on = panelOf(stateOf('skylos', 'on'));
    expect(on.rows.map((r) => r.label)).toEqual(['prep. + noun', 'example']);
    expect(cells(on.rows, 1)).toEqual({ el: 'στον δρόμο', ro: 'pe drum', en: 'on the road' });
  });

  it('the Meaning control changes the meaning and nothing else', () => {
    const next = applyControl(stateOf('skylos', 'to'), 'sense', 'in');
    expect(next.slot).toEqual({ pos: 'preposition', sense: 'in' });
    expect(next.noun).toBe('skylos');
  });

  it('Improver lists the six fused forms for the noun, with the one in use outlined', () => {
    const full = panelOf(stateOf('skylos', 'on'), 'improver').full;
    expect(full.map((r) => r.label)).toEqual([
      'masc. singular', 'masc. plural', 'fem. singular', 'fem. plural', 'neut. singular', 'neut. plural',
    ]);
    expect(full.map((r) => richText(r.el))).toEqual(['στον', 'στους', 'στην', 'στις', 'στο', 'στα']);
    expect(full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['masc. singular']);
    expect(cells(full, 0)).toEqual({ el: 'στον', ro: 'pe', en: 'on the' });
  });

  it('is in the other prepositions\' Improver table with its fused form', () => {
    const pano: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
    const full = buildPanel({ slot: pano.slot, noun: 'skylos', nounNumber: 'sg' }, pano, 'improver').full;
    expect(cells(full, full.length - 1)).toEqual({ el: 'στον σκύλο', ro: 'la câinele', en: 'to the dog' });
  });

  it('explains the fusion in plain words', () => {
    expect(panelOf(stateOf('skylos', 'to')).plain).toContain('σε + τον = στον');
  });
});
