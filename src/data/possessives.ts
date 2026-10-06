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
