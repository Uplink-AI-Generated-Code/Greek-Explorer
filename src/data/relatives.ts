import type { Case, Gender, Num, RelativeRole } from '../types';

/** The jobs a relative pronoun does in its clause, with the label of the Role control. */
export const RELATIVE_ROLES: { value: RelativeRole; label: string }[] = [
  { value: 'subject', label: 'subject (the man who came)' },
  { value: 'object', label: 'object (the bread that I ate)' },
  { value: 'indirect', label: 'to whom (the child I gave it to)' },
  { value: 'whose', label: 'whose (the child whose dog)' },
  { value: 'preposition', label: 'after a preposition (the child I go with)' },
];

/** The prepositions the relative pronoun may follow; σε is the direction "to" (la). */
export const RELATIVE_PREPOSITIONS = ['pano', 'kato', 'me', 'gia', 'apo', 'mexri', 'se'] as const;

/** ο οποίος: the stem and the endings (the accusative masculine has no ν: τον οποίο). */
export const OPOIOS_STEM = 'οποί';
export const OPOIOS_ENDINGS: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ος', f: 'α', n: 'ο' },
    acc: { m: 'ο', f: 'α', n: 'ο' },
    gen: { m: 'ου', f: 'ας', n: 'ου' },
  },
  pl: {
    nom: { m: 'οι', f: 'ες', n: 'α' },
    acc: { m: 'ους', f: 'ες', n: 'α' },
    gen: { m: 'ων', f: 'ων', n: 'ων' },
  },
};

/**
 * Romanian *care* in the dative (căruia, căreia, cărora) and the genitive (cărui, cărei, căror), by the Romanian gender of the
 * antecedent (a neuter follows the masculine in the singular and the feminine in the plural). A ReviewItem covers both tables.
 */
export const RO_CARE_DATIVE: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'căruia', pl: 'cărora' },
  f: { sg: 'căreia', pl: 'cărora' },
};
export const RO_CARE_GENITIVE: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'cărui', pl: 'căror' },
  f: { sg: 'cărei', pl: 'căror' },
};
