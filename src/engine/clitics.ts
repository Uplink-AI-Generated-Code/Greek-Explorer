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

/** Every form of one pronoun or of a dative + accusative pair: attached to a command, after nu, after să, fused with an auxiliary. */
export function roClitics(list: readonly Clitic[]): RoClitic {
  if (list.length === 1) return roClitic(list[0]);
  if (list.length === 2) {
    const key = `${roKey(list[0])}+${roKey(list[1])}`;
    const entry = RO_CLUSTERS[key];
    if (!entry) throw new Error(`no Romanian cluster ${key}`);
    return entry;
  }
  throw new Error('a verb form takes one or two pronouns');
}

export const cliticSlot = (c: Clitic): SlotOf<'clitic'> => ({ pos: 'clitic', ...c });
