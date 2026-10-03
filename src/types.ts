export type Gender = 'm' | 'f' | 'n';
export type Case = 'nom' | 'acc' | 'gen';
export type Num = 'sg' | 'pl';
export type Person = 1 | 2 | 3;
export type Level = 'beginner' | 'improver';
export type NumeralValue = 1 | 2 | 3 | 4 | 5;

export interface IrregularNote {
  rule: string;
  plain: string;
}

/** A Greek form split for display. The ending is highlighted in the UI. */
export interface Form {
  stem: string;
  ending: string;
  irregular?: IrregularNote;
}

export type Slot =
  | { pos: 'verb'; person: Person; number: Num; mood: 'indicative'; tense: 'present'; voice: 'active' }
  | { pos: 'noun'; number: Num; case: Case; count?: Exclude<NumeralValue, 1> }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: NumeralValue; gender: Gender; case: Case };

export type Pos = Slot['pos'];
export type SlotOf<P extends Pos> = Extract<Slot, { pos: P }>;

interface LexemeBase {
  id: string;
  lemma: string;
  /** Per language: true once a speaker has checked that language's forms of this lexeme (spec 4.3, 9). */
  verified: { el: boolean; ro: boolean; en: boolean };
}

export interface RoNounForms {
  definite: string;
  indefinite: string;
  genDefinite: string;
  genIndefinite: string;
}

export type NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i';

export interface GreekNoun extends LexemeBase {
  pos: 'noun';
  gender: Gender;
  class: NounClass;
  stems: Record<Num, string>;
  ro: {
    lemma: string;
    gender: Gender;
    forms: Record<Num, RoNounForms>;
    /** Stem and article suffix of the nominative/accusative definite form (câine + le), used to check gloss segments. */
    split: Record<Num, readonly [stem: string, suffix: string]>;
  };
  en: Record<Num, string>;
  /** One line comparing gender and form across the three languages. */
  note: string;
}

export interface RoAdjectiveForms {
  sg: string;
  pl: string;
  /** Genitive-dative singular, when it differs from `sg` (feminine only). */
  genSg?: string;
}

export type AdjectiveClass = 'adj-stressed' | 'adj-unstressed' | 'adj-indeclinable';

export interface GreekAdjective extends LexemeBase {
  pos: 'adjective';
  class: AdjectiveClass;
  /** The stem; for an indeclinable adjective, the whole word. */
  stem: string;
  ro: { lemma: string; forms: Record<Gender, RoAdjectiveForms> };
  en: string;
}

export interface GreekNumeral extends LexemeBase {
  pos: 'numeral';
  /** Romanian forms for every value; values above 1 have no genitive of their own, so `gen` repeats `nom`. */
  ro: Record<NumeralValue, Record<Gender, { nom: string; gen: string }>>;
  en: Record<NumeralValue, string>;
}

export interface GreekArticle extends LexemeBase {
  pos: 'article';
}

export type VerbClass = 'omega' | 'contracted-ao';

export interface GreekVerb extends LexemeBase {
  pos: 'verb';
  class: VerbClass;
  stems: { present: string };
  ro: { lemma: string; present: string[] };
  en: { gloss: string; base: string; third: string };
}

export type GreekLexeme = GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb;

export type TokenIndex = number;

export interface Token {
  text: string;
  lexeme: string;
  slot: Slot;
  /** Index of the noun this article, numeral or adjective agrees with. */
  agreesWith?: TokenIndex;
}

/** A link points at a whole token, or at one piece of a verb group (Δεν θέλω: piece 0 is δεν). */
export type Link = TokenIndex | { token: TokenIndex; piece: number };

export interface GlossUnit {
  text: string;
  /** The linked Greek token (or piece of one), or null when Greek has no counterpart. */
  link: Link | null;
}

export interface GlossRow {
  language: 'en' | 'ro';
  kind: 'natural' | 'literal';
  units: GlossUnit[];
}

export interface Phrase {
  id: string;
  title: string;
  /** The phrase picker groups by theme. */
  theme: string;
  /** A badge and sort key; the level toggle never hides phrases. */
  level: Level;
  tokens: Token[];
  glosses: GlossRow[];
  /** True once a speaker has checked the Greek tokens and every gloss row (spec section 9). */
  verified: boolean;
}

export interface Divergence {
  id: string;
  appliesTo: { pos: Pos; lexeme?: string };
  point: string;
  el: string;
  ro: string;
  en: string;
  /** The type tag shown on the row. */
  tag: 'same' | 'differs' | 'absent';
  /** `core` rows show in both levels; `extra` rows only in Improver. */
  level: 'core' | 'extra';
  verified: boolean;
}

/** Checked data that is not a lexeme and has no flag of its own: the ending tables (spec 4.2, 9). */
export interface ReviewItem {
  id: string;
  kind: 'ending-table' | 'auxiliary-table' | 'clitic-table' | 'glossary';
  verified: boolean;
}
