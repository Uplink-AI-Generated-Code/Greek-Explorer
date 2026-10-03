import type { Case, Gender, Num } from '../types';

export type EndingTable = Record<Num, Record<Case, string>>;
export type Pair = readonly [stem: string, ending: string];

export const NOUN_CLASSES: Record<'masc-es', EndingTable> = {
  'masc-es': {
    sg: { nom: 'ές', acc: 'έ', gen: 'έ' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
};

/** Adjectives with the stress on the ending: ζεστός, ζεστή, ζεστό. */
export const ADJ_STRESSED: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ός', f: 'ή', n: 'ό' },
    acc: { m: 'ό', f: 'ή', n: 'ό' },
    gen: { m: 'ού', f: 'ής', n: 'ού' },
  },
  pl: {
    nom: { m: 'οί', f: 'ές', n: 'ά' },
    acc: { m: 'ούς', f: 'ές', n: 'ά' },
    gen: { m: 'ών', f: 'ών', n: 'ών' },
  },
};

export const ARTICLE_DEF: Record<Gender, Record<Num, Record<Case, string>>> = {
  m: { sg: { nom: 'ο', acc: 'τον', gen: 'του' }, pl: { nom: 'οι', acc: 'τους', gen: 'των' } },
  f: { sg: { nom: 'η', acc: 'την', gen: 'της' }, pl: { nom: 'οι', acc: 'τις', gen: 'των' } },
  n: { sg: { nom: 'το', acc: 'το', gen: 'του' }, pl: { nom: 'τα', acc: 'τα', gen: 'των' } },
};

/** The numeral "one", which doubles as the indefinite article. */
export const NUMERAL_ONE: Record<Gender, Record<Case, Pair>> = {
  m: { nom: ['ένα', 'ς'], acc: ['ένα', 'ν'], gen: ['ενό', 'ς'] },
  f: { nom: ['μία', ''], acc: ['μία', ''], gen: ['μία', 'ς'] },
  n: { nom: ['ένα', ''], acc: ['ένα', ''], gen: ['ενό', 'ς'] },
};

/** Present active endings of -ω verbs, in the order 1sg 2sg 3sg 1pl 2pl 3pl. */
export const VERB_OMEGA_PRESENT: readonly string[] = ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'];
