import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'n',
  number: 'sg',
  case: 'acc',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
const stateOf = (slot: SlotOf<'quantifier'>, noun: string): PanelState => ({ slot, noun, nounNumber: slot.number });
const panelFor = (state: PanelState, level: Level = 'beginner') => buildPanel(state, { text: '', lexeme: 'free-opoios', slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({ el: richText(p.rows[i].el), ro: richText(p.rows[i].ro), en: richText(p.rows[i].en) });

describe('the free relative όποιος in its panel', () => {
  it('shows whichever beside a noun and whoever on its own', () => {
    const p = panelFor(stateOf(slotOf(), 'psomi'));
    expect(p.lemma).toBe('όποιος / όποια / όποιο');
    expect(p.badge).toBe('free relative');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p, 0)).toEqual({ el: 'όποιο ψωμί', ro: 'orice pâine', en: 'whichever bread' });
    expect(cells(p, 1)).toEqual({ el: 'όποιο', ro: 'oricine', en: 'whoever' });
  });

  it('agrees with the noun in gender and number, and takes the plural', () => {
    const dog = panelFor(applyControl(stateOf(slotOf(), 'psomi'), 'noun', 'skylos'));
    expect(cells(dog, 0).el).toBe('όποιον σκύλο');
    const plural = panelFor(applyControl(stateOf(slotOf({ gender: 'm' }), 'skylos'), 'number', 'pl'));
    expect(cells(plural, 0)).toEqual({ el: 'όποιους σκύλους', ro: 'orice câini', en: 'whichever dogs' });
  });

  it('offers the noun, the role (subject and object) and how many, like ποιος', () => {
    const p = panelFor(stateOf(slotOf(), 'psomi'), 'improver');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'case', 'number']);
    expect(p.controls[1].options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(p.posLabel).toBe('free relative · declines like ποιος');
    expect(p.full).toHaveLength(6);
  });

  it('does not talk about a mass or a count reading', () => {
    expect(panelFor(stateOf(slotOf(), 'psomi')).plain).toContain('whoever');
    expect(panelFor(stateOf(slotOf(), 'psomi')).plain).not.toContain('mass reading');
  });
});
