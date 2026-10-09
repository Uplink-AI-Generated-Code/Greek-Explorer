import type { GlossUnit, Link, TokenIndex } from './types';

export type SegmentedUnit = Extract<GlossUnit, { segments: unknown }>;

/** The token a gloss link points at (the whole link, or the token of a piece link). */
export function linkedToken(link: Link): TokenIndex {
  return typeof link === 'number' ? link : link.token;
}

/** The piece of the token the link points at, or null when it points at the whole token. */
export function linkedPiece(link: Link): number | null {
  return typeof link === 'number' ? null : link.piece;
}

export const isSegmented = (unit: GlossUnit): unit is SegmentedUnit => 'segments' in unit;

/** The text of a unit; for a segmented unit, its segments joined (câine + le = câinele). */
export function unitText(unit: GlossUnit): string {
  return isSegmented(unit) ? unit.segments.map((s) => (s.link === null ? `(${s.text})` : s.text)).join('') : unit.text;
}

/** Every Greek link a unit carries. A unit with no Greek counterpart has none. */
export function linksOf(unit: GlossUnit): Link[] {
  if (isSegmented(unit)) return unit.segments.flatMap((s) => (s.link === null ? [] : [s.link]));
  return unit.link === null ? [] : [unit.link];
}
