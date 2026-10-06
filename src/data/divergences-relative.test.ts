import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (lexeme: string, level: Level = 'improver') => selectDivergences(DIVERGENCES, 'relative', lexeme, level).map((d) => d.id);
const ALL = ['relative-invariable', 'relative-resumptive', 'relative-object', 'relative-whose', 'relative-preposition', 'relative-omitted'];

describe('the comparison notes for the relative pronouns', () => {
  it('both words show the six notes in Improver and five in Beginner', () => {
    for (const lexeme of ['rel-pou', 'rel-opoios']) {
      expect(ids(lexeme)).toEqual(ALL);
      expect(ids(lexeme, 'beginner')).toEqual(ALL.filter((id) => id !== 'relative-omitted'));
    }
  });

  it('no other part of speech shows them', () => {
    expect(selectDivergences(DIVERGENCES, 'noun', 'spiti', 'improver').map((d) => d.id).filter((id) => id.startsWith('relative-'))).toEqual([]);
    expect(selectDivergences(DIVERGENCES, 'quantifier', 'autos', 'improver').map((d) => d.id).filter((id) => id.startsWith('relative-'))).toEqual([]);
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => ALL.includes(d.id));
    expect(rows).toHaveLength(6);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
