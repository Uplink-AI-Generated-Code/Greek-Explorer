import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, RelativeRole, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'relative'>> = {}): SlotOf<'relative'> => ({
  pos: 'relative',
  role: 'subject',
  gender: 'n',
  number: 'sg',
  ...patch,
});
const stateOf = (slot: SlotOf<'relative'>, noun: string, patch: Partial<PanelState> = {}): PanelState => ({ slot, noun, nounNumber: slot.number, ...patch });
const panelFor = (lexeme: string, state: PanelState, level: Level = 'beginner') => buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);

describe('the relative pronoun panel', () => {
  it('που shows its own pattern first and ο οποίος second, with the same Romanian and English', () => {
    const p = panelFor('rel-pou', stateOf(slotOf(), 'paidi'));
    expect(p.lemma).toBe('που');
    expect(p.posLabel).toBe('relative: who / which / that');
    expect(p.rows.map((r) => r.label)).toEqual(['with που', 'with ο οποίος']);
    expect(cells(p, 0)).toEqual({ el: 'που', ro: 'care', en: 'who' });
    expect(cells(p, 1)).toEqual({ el: 'το οποίο', ro: 'care', en: 'who' });
  });

  it('ο οποίος puts its own row first', () => {
    const p = panelFor('rel-opoios', stateOf(slotOf({ role: 'object', gender: 'm' }), 'skylos'));
    expect(p.lemma).toBe('ο οποίος / η οποία / το οποίο');
    expect(p.rows.map((r) => r.label)).toEqual(['with ο οποίος', 'with που']);
    expect(cells(p, 0)).toEqual({ el: 'τον οποίο', ro: 'pe care', en: 'whom' });
    expect(cells(p, 1)).toEqual({ el: 'που', ro: 'pe care', en: 'whom' });
  });

  it('the Improver label says whether the word changes', () => {
    expect(panelFor('rel-pou', stateOf(slotOf(), 'paidi'), 'improver').posLabel).toBe('relative pronoun · never changes');
    expect(panelFor('rel-opoios', stateOf(slotOf(), 'paidi'), 'improver').posLabel).toBe('relative pronoun · agrees with its noun');
  });

  it('offers the noun, how many and the role, and the preposition only after a preposition', () => {
    expect(keys(panelFor('rel-pou', stateOf(slotOf(), 'paidi')))).toEqual(['noun', 'number', 'role']);
    const withPreposition = panelFor('rel-pou', stateOf(slotOf({ role: 'preposition', preposition: 'me' }), 'paidi'));
    expect(keys(withPreposition)).toEqual(['noun', 'number', 'role', 'preposition']);
    expect(withPreposition.controls[3].value).toBe('me');
    expect(withPreposition.controls[3].options.map((o) => o.value)).toEqual(['pano', 'kato', 'me', 'gia', 'apo', 'mexri', 'se']);
    expect(cells(withPreposition, 0)).toEqual({ el: 'που … με αυτό', ro: 'cu care', en: 'with whom' });
  });

  it('the role control lists the five jobs', () => {
    const role = panelFor('rel-pou', stateOf(slotOf(), 'paidi')).controls[2];
    expect(role.options.map((o) => o.value)).toEqual(['subject', 'object', 'indirect', 'whose', 'preposition']);
    expect(role.value).toBe('subject');
  });

  it('whose has a Noun owned control, a house by default and a dog when the antecedent is the house', () => {
    const p = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose', gender: 'm' }), 'skylos'));
    expect(keys(p)).toEqual(['noun', 'number', 'role', 'owned']);
    expect(p.controls[3].value).toBe('spiti');
    expect(cells(p, 0)).toEqual({ el: 'του οποίου το σπίτι', ro: 'a cărui casă', en: 'whose house' });
    const house = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose' }), 'spiti'));
    expect(house.controls[3].value).toBe('skylos');
    const chosen = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose', gender: 'f' }), 'thalassa', { owned: 'paidi' }));
    expect(cells(chosen, 0)).toEqual({ el: 'της οποίας το παιδί', ro: 'al cărei copil', en: 'whose child' });
  });

  it('Improver: all five jobs for the noun, with the one in use outlined', () => {
    const p = panelFor('rel-pou', stateOf(slotOf({ role: 'indirect' }), 'paidi'), 'improver');
    expect(p.full.map((r) => r.label)).toEqual(['subject', 'object', 'to whom', 'whose', 'after a preposition']);
    expect(richText(p.full[2].el)).toBe('που του … · στο οποίο');
    expect(p.full[2].ro).toEqual([{ text: 'căruia', role: 'plain' }]);
    expect(p.full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['to whom']);
    expect(richText(p.full[4].el)).toBe('που … με αυτό · με το οποίο');
    expect(panelFor('rel-pou', stateOf(slotOf(), 'paidi')).full).toEqual([]);
  });

  it('follows the number of the noun: τα παιδιά …', () => {
    const roles: RelativeRole[] = ['indirect', 'whose'];
    const p = panelFor('rel-pou', stateOf(slotOf({ role: roles[0], number: 'pl' }), 'paidi'));
    expect(cells(p, 0)).toEqual({ el: 'που τους …', ro: 'cărora', en: 'to whom' });
    expect(cells(p, 1).el).toBe('στα οποία');
  });

  it('owned is accepted only for "whose", and the note is empty', () => {
    const subject = stateOf(slotOf(), 'paidi');
    expect(applyControl(subject, 'owned', 'skylos')).toEqual(subject);
    const whose = stateOf(slotOf({ role: 'whose' }), 'paidi');
    expect(applyControl(whose, 'owned', 'skylos')).toHaveProperty('owned', 'skylos');
    expect(panelFor('rel-pou', subject).note).toBe('');
  });
});
