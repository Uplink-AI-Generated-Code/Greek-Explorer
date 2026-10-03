import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import { applyControl, buildPanel } from './panels';

const phrase = PHRASES[0];
const panelFor = (index: number, level: 'beginner' | 'improver' = 'beginner', slot = phrase.tokens[index].slot) =>
  buildPanel(slot, phrase.tokens[index], phrase, level);
const text = (rows: ReturnType<typeof panelFor>['rows'], i: number) => ({
  el: richText(rows[i].el),
  ro: richText(rows[i].ro),
  en: richText(rows[i].en),
});

describe('verb panel (θέλω)', () => {
  const panel = panelFor(0);
  it('has lemma, label and a Who? control', () => {
    expect(panel.lemma).toBe('θέλω');
    expect(panel.posLabel).toBe('verb: to want');
    expect(panel.controls).toHaveLength(1);
    expect(panel.controls[0]).toMatchObject({ key: 'who', label: 'Who?', value: '1sg' });
  });
  it('shows the dropped Greek and Romanian pronouns and the required English one', () => {
    expect(text(panel.rows, 0)).toEqual({ el: '(εγώ) θέλω', ro: '(eu) vreau', en: 'I want' });
    expect(panel.rows[0].el[0].role).toBe('dim');
    expect(panel.rows[0].en[0].role).toBe('pronoun');
  });
  it('follows the person: 3sg', () => {
    const p = panelFor(0, 'beginner', applyControl(phrase.tokens[0].slot, 'who', '3sg'));
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) θέλει', ro: '(el/ea) vrea', en: 'he/she wants' });
  });
  it('uses the technical label for Improver', () => {
    expect(panelFor(0, 'improver').posLabel).toBe('verb · -ω class · active');
  });
});

describe('noun panel (καφές)', () => {
  it('shows the definite and indefinite phrases in three languages', () => {
    const panel = panelFor(3);
    expect(panel.lemma).toBe('καφές');
    expect(panel.posLabel).toBe('noun: coffee (masculine)');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον καφέ', ro: 'cafeaua', en: 'the coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.note).toContain('feminine in Romanian');
  });
  it('shows no plural a / an', () => {
    const slot = applyControl(phrase.tokens[3].slot, 'number', 'pl');
    const panel = panelFor(3, 'beginner', slot);
    expect(text(panel.rows, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(panel.rows[1].label).toBe('a / an');
    expect(richText(panel.rows[1].el)).toBe('none in plural');
    expect(panel.rows[1].el[0].role).toBe('dim');
  });
  it('describes the Improver label with the Romanian gender', () => {
    expect(panelFor(3, 'improver').posLabel).toBe('noun · masculine · Romanian: cafea (feminine)');
  });
});

describe('adjective panel (ζεστός)', () => {
  it('lists the lemma in three genders and builds noun phrases with the noun it agrees with', () => {
    const panel = panelFor(2);
    expect(panel.lemma).toBe('ζεστός / ζεστή / ζεστό');
    expect(panel.posLabel).toBe('adjective: hot');
    expect(text(panel.rows, 0)).toEqual({ el: 'τον ζεστό καφέ', ro: 'cafeaua caldă', en: 'the hot coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν ζεστό καφέ', ro: 'o cafea caldă', en: 'a hot coffee' });
  });
  it('follows the genitive', () => {
    const panel = panelFor(2, 'beginner', applyControl(phrase.tokens[2].slot, 'case', 'gen'));
    expect(text(panel.rows, 0)).toEqual({ el: 'του ζεστού καφέ', ro: 'cafelei calde', en: 'of the hot coffee' });
  });
  it('has number and case controls only (gender comes from the noun)', () => {
    expect(panelFor(2).controls.map((c) => c.key)).toEqual(['number', 'case']);
  });
});

describe('numeral panel (ένας)', () => {
  it('shows the numeral and the counted noun phrase', () => {
    const panel = panelFor(1);
    expect(panel.lemma).toBe('ένας / μία / ένα');
    expect(panel.posLabel).toBe('article: a / an');
    expect(panel.rows.map((r) => r.label)).toEqual(['number', 'counting']);
    expect(text(panel.rows, 0)).toEqual({ el: 'έναν', ro: 'o', en: 'a / an (one)' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
  });
  it('has a case control only', () => {
    expect(panelFor(1).controls.map((c) => c.key)).toEqual(['case']);
  });
});

describe('applyControl', () => {
  it('sets person and number from a who value', () => {
    expect(applyControl(phrase.tokens[0].slot, 'who', '2pl')).toMatchObject({ person: 2, number: 'pl' });
  });
  it('sets the case', () => {
    expect(applyControl(phrase.tokens[3].slot, 'case', 'gen')).toMatchObject({ pos: 'noun', case: 'gen' });
  });
  it('ignores a control that does not apply', () => {
    const slot = phrase.tokens[1].slot;
    expect(applyControl(slot, 'number', 'pl')).toBe(slot);
  });
});
