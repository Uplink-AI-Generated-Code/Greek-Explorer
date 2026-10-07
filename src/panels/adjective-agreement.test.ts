import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { DIVERGENCES } from '../data/divergences';
import type { SlotOf } from '../types';
import { buildPanel, type PanelState } from './panels';

const slot: SlotOf<'adjective'> = { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' };
const state: PanelState = { slot, noun: 'kafes', nounNumber: 'sg' };

describe('how Romanian adjectives agree', () => {
  it('the note says gender, number and the feminine singular genitive-dative', () => {
    const note = selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'beginner').find((d) => d.id === 'adjective-agreement')!;
    expect(note.ro).toBe('gender and number; the feminine singular also takes the genitive-dative form: cafeaua caldă, cafelei calde');
    expect(note.verified).toBe(false);
  });

  it('the panel explains the same, and the data has the form', () => {
    const panel = buildPanel(state, { text: 'ζεστό', lexeme: 'zestos', slot }, 'beginner');
    expect(panel.plain).toContain('in the feminine singular genitive-dative, the case: cafelei calde');
    const gen = buildPanel({ ...state, slot: { ...slot, case: 'gen' } }, { text: '', lexeme: 'zestos', slot: { ...slot, case: 'gen' } }, 'beginner');
    expect(gen.rows[0].ro.map((s) => s.text).join('')).toBe('cafelei calde');
  });
});
