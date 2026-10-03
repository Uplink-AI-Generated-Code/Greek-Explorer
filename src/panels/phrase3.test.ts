import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level } from '../types';
import { buildPanel, initialState, type PanelState } from './panels';

const fox = PHRASES[2];
const three = PHRASES[1];
const panelFor = (phrase = fox, i: number, level: Level = 'beginner', state?: PanelState) =>
  buildPanel(state ?? initialState(phrase.tokens[i], phrase), phrase.tokens[i], level);
const row = (panel: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(panel.rows[i].el),
  ro: richText(panel.rows[i].ro),
  en: richText(panel.rows[i].en),
});

describe('the fox sentence', () => {
  it('has nine tokens in the right order', () => {
    expect(fox.tokens.map((t) => t.text)).toEqual([
      'Η', 'γρήγορη', 'καφέ', 'αλεπού', 'πηδάει', 'πάνω από', 'τον', 'τεμπέλικο', 'σκύλο',
    ]);
  });
  it('Η: the article with the fox', () => {
    const p = panelFor(fox, 0);
    expect(p.controls[0].value).toBe('alepou');
    expect(row(p, 0)).toEqual({ el: 'η αλεπού', ro: 'vulpea', en: 'the fox' });
  });
  it('γρήγορη: the stem-stressed adjective', () => {
    const p = panelFor(fox, 1);
    expect(p.lemma).toBe('γρήγορος / γρήγορη / γρήγορο');
    expect(row(p, 0)).toEqual({ el: 'η γρήγορη αλεπού', ro: 'vulpea rapidă', en: 'the quick fox' });
  });
  it('καφέ: the indeclinable adjective says it never changes', () => {
    const p = panelFor(fox, 2);
    expect(p.lemma).toBe('καφέ');
    expect(row(p, 0)).toEqual({ el: 'η καφέ αλεπού', ro: 'vulpea maro', en: 'the brown fox' });
    expect(p.irregular).toContain('never changes');
  });
  it('αλεπού: the invariable singular', () => {
    const p = panelFor(fox, 3);
    expect(row(p, 0)).toEqual({ el: 'η αλεπού', ro: 'vulpea', en: 'the fox' });
    expect(row(p, 1)).toEqual({ el: 'μία αλεπού', ro: 'o vulpe', en: 'a fox' });
    expect(p.irregular).toContain('does not change');
  });
  it('πηδάει: the contracted verb in the third person', () => {
    expect(row(panelFor(fox, 4), 0)).toEqual({
      el: '(αυτός/ή) πηδάει',
      ro: '(el/ea) sare',
      en: 'he/she jumps',
    });
  });
  it('πάνω από: the preposition with the dog in the accusative', () => {
    expect(row(panelFor(fox, 5), 0)).toEqual({
      el: 'πάνω από τον σκύλο',
      ro: 'peste câinele',
      en: 'over the dog',
    });
  });
  it('τον and τεμπέλικο and σκύλο go with the dog', () => {
    expect(row(panelFor(fox, 6), 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
    expect(row(panelFor(fox, 7), 0)).toEqual({ el: 'τον τεμπέλικο σκύλο', ro: 'câinele leneș', en: 'the lazy dog' });
    expect(row(panelFor(fox, 8), 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
    expect(panelFor(fox, 8).irregular).toContain('final ς drops');
  });
});

describe('ordering three coffees', () => {
  it('τρεις: the numeral three counting the coffees', () => {
    const p = panelFor(three, 1);
    expect(p.lemma).toBe('τρεις / τρία');
    expect(row(p, 0)).toEqual({ el: 'τρεις', ro: 'trei', en: 'three' });
    expect(row(p, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
  it('καφέδες: the noun starts at the count three', () => {
    const p = panelFor(three, 2);
    expect(p.controls[0].value).toBe('3');
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    expect(row(p, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(row(p, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
});
