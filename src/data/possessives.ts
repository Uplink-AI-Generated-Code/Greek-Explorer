import type { Num } from '../types';

/** The possessor: person and number, and for the third person singular the gender. */
export type PossessorKey = '1sg' | '2sg' | '3sg.m' | '3sg.f' | '3sg.n' | '1pl' | '2pl' | '3pl';

/** A Romanian possessive: one invariable word (*lui*), or four forms by the gender and number of the possessed noun. */
export type RoPossessive = string | Record<'m' | 'f', Record<Num, string>>;

/**
 * The Romanian possessives by possessor (spec 4.3). They agree with the possessed noun, not with the possessor:
 * *casa mea*, *câinele meu*, *copiii mei*, *mările mele*. The third person is invariable. A ReviewItem covers this table.
 */
export const RO_POSSESSIVES: Record<PossessorKey, RoPossessive> = {
  '1sg': { m: { sg: 'meu', pl: 'mei' }, f: { sg: 'mea', pl: 'mele' } },
  '2sg': { m: { sg: 'tău', pl: 'tăi' }, f: { sg: 'ta', pl: 'tale' } },
  '3sg.m': 'lui',
  '3sg.f': 'ei',
  '3sg.n': 'lui',
  '1pl': { m: { sg: 'nostru', pl: 'noștri' }, f: { sg: 'noastră', pl: 'noastre' } },
  '2pl': { m: { sg: 'vostru', pl: 'voștri' }, f: { sg: 'voastră', pl: 'voastre' } },
  '3pl': 'lor',
};

/** The English possessives, which go before the noun and change with the possessor. */
export const EN_POSSESSIVES: Record<PossessorKey, string> = {
  '1sg': 'my',
  '2sg': 'your',
  '3sg.m': 'his',
  '3sg.f': 'her',
  '3sg.n': 'its',
  '1pl': 'our',
  '2pl': 'your',
  '3pl': 'their',
};

/**
 * Romanian *propriu* with its suffix article, by the gender and number of the possessed noun: *propriul meu câine*,
 * *propria mea casă*, *proprii mei copii*, *propriile mele case*. Nominative and accusative only (spec 24).
 */
export const RO_OWN: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'propriul', pl: 'proprii' },
  f: { sg: 'propria', pl: 'propriile' },
};

/** The Romanian word before the possessive when it stands on its own: *al meu*, *a mea*, *ai mei*, *ale mele*. */
export const RO_ALONE: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'al', pl: 'ai' },
  f: { sg: 'a', pl: 'ale' },
};

/** English "my own" beside a noun and "mine" on its own, by possessor. */
export const EN_OWN: Record<PossessorKey, { own: string; alone: string }> = {
  '1sg': { own: 'my own', alone: 'mine' },
  '2sg': { own: 'your own', alone: 'yours' },
  '3sg.m': { own: 'his own', alone: 'his' },
  '3sg.f': { own: 'her own', alone: 'hers' },
  '3sg.n': { own: 'its own', alone: 'its' },
  '1pl': { own: 'our own', alone: 'ours' },
  '2pl': { own: 'your own', alone: 'yours' },
  '3pl': { own: 'their own', alone: 'theirs' },
};
