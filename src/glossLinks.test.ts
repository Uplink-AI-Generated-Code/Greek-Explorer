import { describe, expect, it } from 'vitest';
import { linkedPiece, linkedToken } from './glossLinks';

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
