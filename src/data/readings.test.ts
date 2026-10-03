import { describe, expect, it } from 'vitest';
import { ENDING_GLOSS, READING_TEMPLATES } from './readings';

describe('reading data', () => {
  it('has a gloss for every kind of ending', () => {
    expect(Object.keys(ENDING_GLOSS).sort()).toEqual(
      ['aorist', 'base', 'impAorist', 'impPresent', 'imperfect', 'present', 'subjAorist'].sort(),
    );
  });
  it('has one template per irregularity rule, all unverified, with both levels written', () => {
    expect(READING_TEMPLATES.map((t) => t.rule).sort()).toEqual(['monosyllable', 'old-stem', 'stress-shift']);
    for (const t of READING_TEMPLATES) {
      expect(t.verified).toBe(false);
      expect(t.beginner).toContain('{text}');
      expect(t.improver).toContain('{text}');
    }
  });
});
