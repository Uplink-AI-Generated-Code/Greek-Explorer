import type { Case, Gender, IrregularNote, Num, NounClass, NumeralValue, VerbClass } from '../types';

export type EndingTable = Record<Num, Record<Case, string>>;
export type Pair = readonly [stem: string, ending: string];

export const NOUN_CLASSES: Record<NounClass, EndingTable> = {
  'masc-es': {
    sg: { nom: 'ές', acc: 'έ', gen: 'έ' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
  'masc-os': {
    sg: { nom: 'ος', acc: 'ο', gen: 'ου' },
    pl: { nom: 'οι', acc: 'ους', gen: 'ων' },
  },
  /** Feminine nouns in -ού: the singular does not change except in the genitive, and the plural adds -δ-. */
  'fem-ou': {
    sg: { nom: '', acc: '', gen: 'ς' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
  'neut-i': {
    sg: { nom: 'ί', acc: 'ί', gen: 'ιού' },
    pl: { nom: 'ιά', acc: 'ιά', gen: 'ιών' },
  },
  /** Neuter nouns in -ό: νερό, νερού, νερά (the stress stays on the ending). */
  'neut-o': {
    sg: { nom: 'ό', acc: 'ό', gen: 'ού' },
    pl: { nom: 'ά', acc: 'ά', gen: 'ών' },
  },
};

type NoteKey = `${Num}-${Case}`;

/** One-line explanations for cells that surprise a learner. Cells not listed have no note. */
export const NOUN_NOTES: Partial<Record<NounClass, Partial<Record<NoteKey, IrregularNote>>>> = {
  'masc-es': {
    'sg-acc': {
      rule: 'drop-final-s',
      plain: 'The final ς drops in the singular accusative and genitive (ο καφές → τον καφέ).',
    },
    'sg-gen': {
      rule: 'drop-final-s',
      plain: 'The final ς drops in the singular accusative and genitive (ο καφές → του καφέ).',
    },
  },
  'masc-os': {
    'sg-acc': { rule: 'drop-final-s', plain: 'In the singular accusative the final ς drops (ο σκύλος → τον σκύλο).' },
  },
  'fem-ou': {
    'sg-nom': {
      rule: 'invariable-singular',
      plain: 'The singular does not change between subject and object: only the article shows the role.',
    },
    'sg-acc': {
      rule: 'invariable-singular',
      plain: 'The singular does not change between subject and object: only the article shows the role.',
    },
    'pl-nom': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδες.' },
    'pl-acc': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδες.' },
    'pl-gen': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδων.' },
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

/** Adjectives with the stress inside the stem: γρήγορος, γρήγορη, γρήγορο. */
export const ADJ_UNSTRESSED: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ος', f: 'η', n: 'ο' },
    acc: { m: 'ο', f: 'η', n: 'ο' },
    gen: { m: 'ου', f: 'ης', n: 'ου' },
  },
  pl: {
    nom: { m: 'οι', f: 'ες', n: 'α' },
    acc: { m: 'ους', f: 'ες', n: 'α' },
    gen: { m: 'ων', f: 'ων', n: 'ων' },
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

/** Endings in the order 1sg 2sg 3sg 1pl 2pl 3pl; null = no such form (impersonal verbs). */
type Endings = readonly (string | null)[];
const NONE: Endings = [null, null, null, null, null, null];

/** Present active (and mediopassive) endings. The stem carries the accent where the class has none of its own. */
export const VERB_PRESENT: Record<VerbClass, Endings> = {
  omega: ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  /** Contracted verbs: the stressed ending replaces the -ω endings (πηδάω, πηδάς, πηδάει …). */
  'contracted-ao': ['άω', 'άς', 'άει', 'άμε', 'άτε', 'άνε'],
  /** τρώω, πάω: the endings attach straight to a stem ending in a vowel (τρώ-με). */
  athematic: ['ω', 'ς', 'ει', 'με', 'τε', 'νε'],
  mediopassive: ['ομαι', 'εσαι', 'εται', 'όμαστε', 'εστε', 'ονται'],
  deponent: ['άμαι', 'άσαι', 'άται', 'όμαστε', 'άστε', 'ούνται'],
  impersonal: [null, null, 'εί', null, null, null],
  /** είμαι: the lexeme stores all six cells as overrides. */
  copula: NONE,
};

/** Imperfect endings. */
export const VERB_IMPERFECT: Record<VerbClass, Endings> = {
  omega: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  'contracted-ao': ['ούσα', 'ούσες', 'ούσε', 'ούσαμε', 'ούσατε', 'ούσαν'],
  athematic: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  mediopassive: ['όμουν', 'όσουν', 'όταν', 'όμασταν', 'όσασταν', 'όνταν'],
  deponent: ['όμουν', 'όσουν', 'όταν', 'όμασταν', 'όσασταν', 'όνταν'],
  impersonal: NONE,
  copula: NONE,
};

/** Indicative aorist endings. */
export const VERB_AORIST: Record<VerbClass, Endings> = {
  omega: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  'contracted-ao': ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  athematic: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  mediopassive: ['ηκα', 'ηκες', 'ηκε', 'ήκαμε', 'ήκατε', 'ηκαν'],
  deponent: ['ηκα', 'ηκες', 'ηκε', 'ήκαμε', 'ήκατε', 'ηκαν'],
  impersonal: NONE,
  copula: NONE,
};

/** Aorist subjunctive endings, added to the perfective stem. */
export const VERB_SUBJ_AORIST: Record<VerbClass, Endings> = {
  omega: ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  'contracted-ao': ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  athematic: ['ω', 'ς', 'ει', 'με', 'τε', 'νε'],
  mediopassive: ['ώ', 'είς', 'εί', 'ούμε', 'είτε', 'ούν'],
  deponent: ['ώ', 'είς', 'εί', 'ούμε', 'είτε', 'ούν'],
  impersonal: NONE,
  copula: NONE,
};

/** Imperative endings (second person singular, plural); null = the class has no imperative here. */
export const VERB_IMPERATIVE: Record<
  VerbClass,
  { present: readonly [string, string] | null; aorist: readonly [string, string] | null }
> = {
  omega: { present: ['ε', 'ετε'], aorist: ['ε', 'ετε'] },
  'contracted-ao': { present: null, aorist: null },
  athematic: { present: ['ε', 'τε'], aorist: ['ε', 'τε'] },
  mediopassive: { present: null, aorist: null },
  deponent: { present: null, aorist: null },
  impersonal: { present: null, aorist: null },
  copula: { present: null, aorist: null },
};

/** The ending of the invariable base form used by the perfect tenses (φάει, πλυθεί). */
export const VERB_BASE: Record<VerbClass, string | null> = {
  omega: 'ει',
  'contracted-ao': 'ει',
  athematic: 'ει',
  mediopassive: 'εί',
  deponent: 'εί',
  impersonal: null,
  copula: null,
};

const invariable = (word: string): Record<Gender, Record<Case, Pair>> => {
  const row: Record<Case, Pair> = { nom: [word, ''], acc: [word, ''], gen: [word, ''] };
  return { m: row, f: row, n: row };
};

const mfRow = (nomAcc: string, gen: string): Record<Case, Pair> => ({
  nom: [nomAcc, ''],
  acc: [nomAcc, ''],
  gen: [gen, ''],
});

/** The numerals 1 to 5. 1, 3 and 4 change with gender and case; 2 and 5 never change. */
export const NUMERAL_FORMS: Record<NumeralValue, Record<Gender, Record<Case, Pair>>> = {
  1: NUMERAL_ONE,
  2: invariable('δύο'),
  3: { m: mfRow('τρεις', 'τριών'), f: mfRow('τρεις', 'τριών'), n: mfRow('τρία', 'τριών') },
  4: { m: mfRow('τέσσερις', 'τεσσάρων'), f: mfRow('τέσσερις', 'τεσσάρων'), n: mfRow('τέσσερα', 'τεσσάρων') },
  5: invariable('πέντε'),
};

/** The Romanian definite article as a suffix, by the noun's Romanian gender (spec 5.1). */
export const RO_ARTICLE_SUFFIX: Record<Num, Record<Gender, { direct: string; genitive: string }>> = {
  sg: {
    m: { direct: '-ul / -le', genitive: '-ului / -lui' },
    f: { direct: '-a / -ea', genitive: '-ei' },
    n: { direct: '-ul', genitive: '-ului' },
  },
  pl: {
    m: { direct: '-i', genitive: '-lor' },
    f: { direct: '-le', genitive: '-lor' },
    n: { direct: '-le', genitive: '-lor' },
  },
};
