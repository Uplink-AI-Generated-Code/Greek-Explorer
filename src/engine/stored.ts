import type { Stored } from '../types';

export const NOT_YET_ADDED = 'not yet added';

export const isPending = (cell: Stored): cell is { pending: true; note?: string } => typeof cell !== 'string';

/** The text of a cell, or null while it is pending. */
export const storedText = (cell: Stored): string | null => (typeof cell === 'string' ? cell : null);
