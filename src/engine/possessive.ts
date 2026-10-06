import { EN_POSSESSIVES, RO_POSSESSIVES, type PossessorKey } from '../data/possessives';
import type { Case, Clitic, GreekNoun, Num, SlotOf } from '../types';
import { greekClitic } from './clitics';

type Possessor = SlotOf<'possessive'>;

/** The possessor as the key of the Romanian and English tables: '1sg', '3sg.f', '3pl'. */
export function possessorKey(s: Possessor): PossessorKey {
  if (s.person === 3 && s.number === 'sg') {
    if (!s.gender) throw new Error('a third-person singular possessor needs a gender');
    return `3sg.${s.gender}`;
  }
  return `${s.person}${s.number}` as PossessorKey;
}

/** The Greek possessive is the genitive weak pronoun: μου, σου, του, της, μας, σας, τους. */
export function greekPossessive(s: Possessor): string {
  possessorKey(s);
  const clitic: Clitic = { role: 'indirect', person: s.person, number: s.number, gender: s.gender ?? 'm' };
  return greekClitic(clitic);
}

/**
 * The Romanian possessive for a noun: it agrees with the possessed noun in gender and number, a neuter following the
 * masculine in the singular and the feminine in the plural. The genitive-dative singular of a feminine noun uses the
 * plural form (casei mele). The third person never changes.
 */
export function roPossessive(s: Possessor, noun: GreekNoun, number: Num, c: Case = 'nom'): string {
  const entry = RO_POSSESSIVES[possessorKey(s)];
  if (typeof entry === 'string') return entry;
  const ro = noun.ro.gender;
  const gender = ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro;
  return entry[gender][c === 'gen' && gender === 'f' && number === 'sg' ? 'pl' : number];
}

export const enPossessive = (s: Possessor): string => EN_POSSESSIVES[possessorKey(s)];

/** The seven possessors the panel offers, with the label of the Whose? control. */
export const POSSESSORS: { value: string; label: string; slot: Possessor }[] = [
  { value: '1sg', label: 'my', slot: { pos: 'possessive', person: 1, number: 'sg' } },
  { value: '2sg', label: 'your', slot: { pos: 'possessive', person: 2, number: 'sg' } },
  { value: '3sg-m', label: 'his', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'm' } },
  { value: '3sg-f', label: 'her', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'f' } },
  { value: '1pl', label: 'our', slot: { pos: 'possessive', person: 1, number: 'pl' } },
  { value: '2pl', label: 'your (pl.)', slot: { pos: 'possessive', person: 2, number: 'pl' } },
  { value: '3pl', label: 'their', slot: { pos: 'possessive', person: 3, number: 'pl' } },
];

/** Which of the seven a possessive slot is; "my" when it is none of them. */
export function possessorValue(s: Possessor | null | undefined): string {
  if (!s) return POSSESSORS[0].value;
  const match = POSSESSORS.find(
    (p) => p.slot.person === s.person && p.slot.number === s.number && (s.person !== 3 || s.number === 'pl' || p.slot.gender === s.gender),
  );
  return (match ?? POSSESSORS[0]).value;
}
