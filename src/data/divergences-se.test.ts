import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (lexeme: string, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'preposition', lexeme, level, { pos: 'preposition' }).map((d) => d.id);

describe('the comparison notes for σε', () => {
  it('σε shows the four notes about its meanings, its fusion, direction and place, and the indirect object', () => {
    expect(ids('se')).toEqual(
      expect.arrayContaining(['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative']),
    );
  });

  it('the notes are the same at Beginner, because all four are core rows', () => {
    expect(ids('se', 'beginner')).toEqual(expect.arrayContaining(['preposition-meaning', 'indirect-object-dative']));
  });

  it('no other preposition shows them', () => {
    for (const other of ['pano', 'apo', 'me']) {
      expect(ids(other).filter((id) => ['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative'].includes(id))).toEqual([]);
    }
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => ['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative'].includes(d.id));
    expect(rows).toHaveLength(4);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
