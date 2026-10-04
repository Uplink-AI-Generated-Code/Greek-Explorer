import { EN_CLITICS, GREEK_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
import type { Clitic, Gender, SlotOf } from '../types';

const ROLE_KEY = { object: 'obj', indirect: 'ind' } as const;

/** '1sg', '3pl'. */
export const personKey = (c: Pick<Clitic, 'person' | 'number'>): string => `${c.person}${c.number}`;

function genderOf(c: Clitic): Gender {
  if (c.person === 3 && !c.gender) throw new Error('a third-person pronoun needs a gender');
  return c.gender ?? 'm';
}

export const greekClitic = (c: Clitic): string => GREEK_CLITICS[c.role][personKey(c)][genderOf(c)];

/** The strong form, as a note: εμένα; for the indirect role σε + the strong form. */
export function greekStrong(c: Clitic): string {
  const strong = GREEK_STRONG[personKey(c)][genderOf(c)];
  return c.role === 'indirect' ? `σε ${strong}` : strong;
}

export const enClitic = (c: Clitic): string => c.enPronoun ?? EN_CLITICS[personKey(c)][genderOf(c)];

/** Only the third-person accusative has a gender in Romanian; a neuter follows the masculine (sg) or the feminine (pl). */
function roKey(c: Clitic): string {
  const base = `${ROLE_KEY[c.role]}.${personKey(c)}`;
  if (c.person !== 3 || c.role !== 'object') return base;
  const g = c.roGender ?? genderOf(c);
  return `${base}.${g === 'n' ? (c.number === 'sg' ? 'm' : 'f') : g}`;
}

export function roClitic(c: Clitic): RoClitic {
  const entry = RO_CLITICS[roKey(c)];
  if (!entry) throw new Error(`no Romanian pronoun for ${roKey(c)}`);
  return entry;
}

/** The attached form (after a command) and the form after nu, for one pronoun or a dative + accusative pair. */
export function roClitics(list: readonly Clitic[]): { enclitic: string; afterNu: string } {
  if (list.length === 1) {
    const { enclitic, afterNu } = roClitic(list[0]);
    return { enclitic, afterNu };
  }
  if (list.length === 2) {
    const key = `${roKey(list[0])}+${roKey(list[1])}`;
    const entry = RO_CLUSTERS[key];
    if (!entry) throw new Error(`no Romanian cluster ${key}`);
    return entry;
  }
  throw new Error('a command takes one or two pronouns');
}

export const cliticSlot = (c: Clitic): SlotOf<'clitic'> => ({ pos: 'clitic', ...c });
