import { describe, expect, it } from 'vitest';
import { ENDING_GLOSS, READING_TEMPLATES } from './readings';

describe('reading data', () => {
  it('has a gloss for every kind of ending', () => {
    expect(Object.keys(ENDING_GLOSS).sort()).toEqual(
      ['aorist', 'base', 'impAorist', 'impPresent', 'imperfect', 'present', 'subjAorist'].sort(),
    );
  });
  it('has one template per irregularity rule, all unverified, with both levels written', () => {
    expect(READING_TEMPLATES.map((t) => t.rule).sort()).toEqual(['irregular-be', 'monosyllable', 'old-stem', 'stress-shift']);
    for (const t of READING_TEMPLATES) {
      expect(t.verified).toBe(false);
      expect(t.beginner).toContain('{text}');
      expect(t.improver).toContain('{text}');
    }
  });

  it('the irregular-be reading has no markdown and is true for both polarities', () => {
    const t = READING_TEMPLATES.find((x) => x.rule === 'irregular-be');
    if (!t) throw new Error('no irregular-be template');
    expect(t.improver).not.toContain('*');
    expect(t.beginner).toContain('the verb "to be" is irregular');
    expect(t.beginner).toContain('είμαι, είσαι, είναι, είμαστε, είστε, είναι');
    expect(t.beginner).not.toContain('no parts to take apart');
    expect(t.beginner.split(/[.!?]\s/).length).toBeLessThanOrEqual(2);
  });
});
