export type Gender = 'm' | 'f' | 'n';
export type Case = 'nom' | 'acc' | 'gen';
export type Num = 'sg' | 'pl';
export type Person = 1 | 2 | 3;
export type Level = 'beginner' | 'improver';
export type NumeralValue = 1 | 2 | 3 | 4 | 5;

export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional';
// Indicative: present, imperfect, aorist, future (θα + present), futureSimple (θα + aorist subjunctive),
// perfect, pluperfect, futurePerfect. Subjunctive: present, aorist, perfect. Imperative: present, aorist
// (second person only). Conditional: imperfect (θα + imperfect) and pluperfect (θα + pluperfect).
export type Tense =
  | 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple' | 'perfect' | 'pluperfect' | 'futurePerfect';
export type Voice = 'active' | 'mediopassive';

export type Polarity = 'affirmative' | 'negative';

export interface IrregularNote {
  rule: string;
  plain: string;
}

/** A Greek form split for display. The ending is highlighted in the UI. */
export interface Form {
  /** The past-tense prefix (έ- in έτρωγα, ή- in ήθελα). */
  augment?: string;
  stem: string;
  ending: string;
  irregular?: IrregularNote;
}

export type Slot =
  | { pos: 'verb'; person: Person; number: Num; mood: Mood; tense: Tense; voice: Voice; polarity?: Polarity }
  | { pos: 'noun'; number: Num; case: Case; count?: Exclude<NumeralValue, 1> }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: NumeralValue; gender: Gender; case: Case }
  | { pos: 'preposition' }
  | { pos: 'particle' };

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

export type VerbClass = 'omega' | 'contracted-ao' | 'athematic' | 'mediopassive' | 'deponent' | 'impersonal';

/** A past-tense stem, with its augment when it has one (έ + τρωγ). */
export interface StemPair {
  augment?: string;
  stem: string;
}

/** Past stems: `strong` for 1sg, 2sg, 3sg and 3pl; `weak` for 1pl and 2pl, where the stress moves and the augment goes. */
export interface PastStems {
  strong: StemPair;
  weak: StemPair;
}

export interface VerbStems {
  present: string;
  imperfect?: PastStems;
  /** The indicative aorist (έφαγα). */
  aorist?: PastStems;
  /** The stem of the aorist subjunctive, the aorist imperative and the base form of the perfect tenses (φά-, πλύν-). */
  perfective?: string;
}

/** A cell that breaks its class pattern; the whole cell is stored. */
export interface CellOverride {
  augment?: string;
  stem: string;
  ending: string;
  note?: IrregularNote;
}

/** Lexical Romanian forms; compound tenses are generated from these. Six cells are 1sg 2sg 3sg 1pl 2pl 3pl. */
export interface RoVerbForms {
  lemma: string;
  /** The infinitive without "a" (mânca). */
  infinitive: string;
  participle: string;
  present: readonly string[];
  /** Without "să" (the generator adds it). */
  subjunctive: readonly string[];
  imperfect: readonly string[];
  pluperfect: readonly string[];
  imperative?: readonly [singular: string, plural: string];
  /** Stored perfect cells for reflexive verbs, whose clitic fuses with the auxiliary (m-am spălat). */
  perfect?: readonly string[];
}

export interface EnVerbForms {
  /** "to ___" in the Beginner label. */
  gloss: string;
  base: string;
  third: string;
  past: string;
  pastParticiple: string;
  ing: string;
  /** Adds "(myself)" and its person forms. */
  reflexive?: boolean;
  /** A modal verb (may) is negated with "not" after it, not with "do". */
  modal?: boolean;
}

/** Everything a verb stores for one voice. */
export interface VerbVoice {
  lemma: string;
  class: VerbClass;
  stems: VerbStems;
  /** Cells keyed '<kind>.<person><number>' ('present.2sg'), or 'base'. */
  overrides?: Record<string, CellOverride>;
  /** The slots the panel may offer, per mood. */
  offers: Partial<Record<Mood, Tense[]>>;
  /** Impersonal verbs (μπορεί) have one slot: the third person singular. */
  thirdSingularOnly?: boolean;
  ro: RoVerbForms;
  en: EnVerbForms;
}

export interface GreekVerb extends LexemeBase {
  pos: 'verb';
  voices: Partial<Record<Voice, VerbVoice>>;
}

export interface GreekParticle extends LexemeBase {
  pos: 'particle';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  example: { el: string; ro: string; en: string };
}

export interface GreekPreposition extends LexemeBase {
  pos: 'preposition';
  ro: string;
  en: string;
  /** A short plain meaning, used to label rows in the preposition table. */
  meaning: string;
}

export type GreekLexeme =
  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle;

export type TokenIndex = number;

export interface Token {
  text: string;
  lexeme: string;
  slot: Slot;
  /** Index of the noun this article, numeral, adjective or preposition goes with. */
  agreesWith?: TokenIndex;
}

/** A link points at a whole token, or at one piece of a verb group (Δεν θέλω: piece 0 is δεν). */
export type Link = TokenIndex | { token: TokenIndex; piece: number };

export type GlossUnit =
  | { text: string; link: Link | null }
  /** A unit made of parts that link to different Greek tokens (Romanian câine|le). */
  | { segments: { text: string; link: Link }[] };

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
  appliesTo: {
    pos: Pos;
    lexeme?: string;
    /** For verbs: show the row only when the panel's slot matches every listed dimension. */
    when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[]; polarity?: Polarity };
  };
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
