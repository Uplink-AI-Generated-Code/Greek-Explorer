import { describe, expect, it } from 'vitest';
import { isSegmented, linkedPiece, linkedToken, linksOf, unitText } from './glossLinks';

describe('gloss links', () => {
  it('a whole-token link is the token index', () => {
    expect(linkedToken(3)).toBe(3);
    expect(linkedPiece(3)).toBeNull();
  });
  it('a piece link names its token and its piece', () => {
    expect(linkedToken({ token: 2, piece: 1 })).toBe(2);
    expect(linkedPiece({ token: 2, piece: 1 })).toBe(1);
  });
  it('token 0 and piece 0 are valid links, not "no link"', () => {
    expect(linkedToken(0)).toBe(0);
    expect(linkedToken({ token: 0, piece: 0 })).toBe(0);
    expect(linkedPiece({ token: 0, piece: 0 })).toBe(0);
  });
});

describe('segmented gloss units', () => {
  const plainUnit = { text: 'cafea', link: 3 };
  const segmented = {
    segments: [
      { text: 'câine', link: 8 },
      { text: 'le', link: 6 },
    ],
  };

  it('tells the two kinds apart', () => {
    expect(isSegmented(segmented)).toBe(true);
    expect(isSegmented(plainUnit)).toBe(false);
  });
  it('joins the segments into the text of the unit', () => {
    expect(unitText(segmented)).toBe('câinele');
    expect(unitText(plainUnit)).toBe('cafea');
  });
  it('lists every link of a unit', () => {
    expect(linksOf(segmented)).toEqual([8, 6]);
    expect(linksOf(plainUnit)).toEqual([3]);
    expect(linksOf({ text: '(I)', link: null })).toEqual([]);
  });
});
