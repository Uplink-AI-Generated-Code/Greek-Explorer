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

describe('the comparison note for δικός', () => {
  const dikos = (level: Level = 'improver') =>
    selectDivergences(DIVERGENCES, 'adjective', 'dikos', level, { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }).map((d) => d.id);

  it('shows on δικός at both levels, and on no other adjective', () => {
    expect(dikos()).toContain('emphatic-possessive');
    expect(dikos('beginner')).toContain('emphatic-possessive');
    expect(selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'improver').map((d) => d.id)).not.toContain('emphatic-possessive');
  });

  it('is unverified', () => {
    expect(DIVERGENCES.find((d) => d.id === 'emphatic-possessive')?.verified).toBe(false);
  });
});

describe('the comparison note for a noun possessor', () => {
  it('shows on a noun at both levels', () => {
    for (const level of ['beginner', 'improver'] as const) {
      expect(selectDivergences(DIVERGENCES, 'noun', 'spiti', level).map((d) => d.id)).toContain('noun-possessor');
    }
  });

  it('is unverified', () => {
    expect(DIVERGENCES.find((d) => d.id === 'noun-possessor')?.verified).toBe(false);
  });
});
