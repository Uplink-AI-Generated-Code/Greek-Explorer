import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { DIVERGENCES } from './divergences';

const NEW = ['free-relative-ever', 'free-relative-who'];
const ids = (pos: 'freeRelative' | 'quantifier', lexeme: string) =>
  selectDivergences(DIVERGENCES, pos, lexeme, 'improver').map((d) => d.id).filter((id) => NEW.includes(id));

describe('the comparison notes for the free relatives', () => {
  it('ό,τι and όπου show one note, όποιος the other, and no other word shows either', () => {
    expect(ids('freeRelative', 'free-oti')).toEqual(['free-relative-ever']);
    expect(ids('freeRelative', 'free-opou')).toEqual(['free-relative-ever']);
    expect(ids('quantifier', 'free-opoios')).toEqual(['free-relative-who']);
    expect(ids('quantifier', 'poios')).toEqual([]);
  });

  it('show at Beginner too, and are unverified', () => {
    expect(selectDivergences(DIVERGENCES, 'freeRelative', 'free-oti', 'beginner').map((d) => d.id)).toContain('free-relative-ever');
    const rows = DIVERGENCES.filter((d) => NEW.includes(d.id));
    expect(rows).toHaveLength(2);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
