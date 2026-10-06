import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

/** The notes of this plan; a quantifier also shows the general quantifier notes. */
const NEW = ['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-he', 'demonstrative-spoken', 'such-so', 'place-words'];
const ids = (pos: 'quantifier' | 'adverb', lexeme: string, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, pos, lexeme, level).map((d) => d.id).filter((id) => NEW.includes(id));

describe('the comparison notes for the demonstratives', () => {
  it('αυτός shows five notes in Improver and three in Beginner', () => {
    expect(ids('quantifier', 'autos')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-he', 'demonstrative-spoken']);
    expect(ids('quantifier', 'autos', 'beginner')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter']);
  });

  it('εκείνος has the same notes except "this and he"', () => {
    expect(ids('quantifier', 'ekeinos')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-spoken']);
  });

  it('τέτοιος and τόσος share one note, and the place words have one', () => {
    expect(ids('quantifier', 'tetoios')).toContain('such-so');
    expect(ids('quantifier', 'tosos')).toContain('such-so');
    expect(ids('quantifier', 'polys')).not.toContain('such-so');
    expect(ids('adverb', 'edo')).toEqual(['place-words']);
    expect(ids('adverb', 'ekei', 'beginner')).toEqual(['place-words']);
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => NEW.includes(d.id));
    expect(rows).toHaveLength(7);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
