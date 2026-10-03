import type { Link, TokenIndex } from './types';

/** The token a gloss link points at (the whole link, or the token of a piece link). */
export function linkedToken(link: Link): TokenIndex {
  return typeof link === 'number' ? link : link.token;
}

/** The piece of the token the link points at, or null when it points at the whole token. */
export function linkedPiece(link: Link): number | null {
  return typeof link === 'number' ? null : link.piece;
}
