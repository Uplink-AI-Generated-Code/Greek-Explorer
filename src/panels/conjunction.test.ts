import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import { buildPanel } from './panels';

const slot = { pos: 'conjunction' } as const;
const panel = (level: 'beginner' | 'improver' = 'beginner') =>
  buildPanel({ slot, noun: null, nounNumber: 'sg' }, { text: 'Αν', lexeme: 'an', slot }, level);

describe('conjunction panel (αν)', () => {
  it('shows one row with the if-clause in the three languages', () => {
    const p = panel();
    expect(p.lemma).toBe('αν');
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].label).toBe('if-clause');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'αν είχα ψωμί',
      'dacă aș avea pâine',
      'if I had bread',
    ]);
  });

  it('has no controls and no table, and names the construction', () => {
    const p = panel('improver');
    expect(p.controls).toEqual([]);
    expect(p.full).toEqual([]);
    expect(p.plain).toContain('αν');
    expect(p.plain).toContain('dacă');
    expect(p.posLabel).toBe('conjunction');
    expect(panel('beginner').posLabel).toBe('little word: if');
  });
});
