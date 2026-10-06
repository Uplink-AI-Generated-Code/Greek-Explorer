import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'possessive', 'possessive', level, { pos: 'possessive', person: 1, number: 'sg' }).map((d) => d.id);

describe('the comparison notes for the possessive', () => {
  it('Improver shows the four notes', () => {
    expect(ids()).toEqual(['possessor-agreement', 'possessive-position', 'possessive-accent', 'possessive-third-person']);
  });

  it('Beginner leaves out the second accent', () => {
    expect(ids('beginner')).toEqual(['possessor-agreement', 'possessive-position', 'possessive-third-person']);
  });

  it('no other part of speech shows them', () => {
    expect(selectDivergences(DIVERGENCES, 'noun', 'kafes', 'improver').map((d) => d.id)).not.toContain('possessor-agreement');
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => d.appliesTo.pos === 'possessive');
    expect(rows).toHaveLength(4);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
