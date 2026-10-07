export type Gender = 'm' | 'f' | 'n';
export type Case = 'nom' | 'acc' | 'gen';
export type Num = 'sg' | 'pl';
export type Person = 1 | 2 | 3;
export type Level = 'beginner' | 'improver';
/** The numerals the app has: 1 to 5, and 13 and 14, the two teens that change with gender in Greek like 3 and 4. */
export type NumeralValue = 1 | 2 | 3 | 4 | 5 | 13 | 14;

/** A stored Romanian cell: text, or `pending` while the form is not confirmed. A release build refuses a pending cell (spec 4.2, 7). */
export type Stored = string | { pending: true; note?: string };

/** What σε means: to (direction), at (place), in (inside or into), on (a surface), person (the indirect object). */
export type PrepSense = 'to' | 'at' | 'in' | 'on' | 'person';

export type QuantifierDegree = 'plain' | 'comparative';
export type QuantifierSense = 'some' | 'few';
export type QuantifierUse = 'determiner' | 'pronoun';
/** The job a relative pronoun does in its own clause (spec 26). */
export type RelativeRole = 'subject' | 'object' | 'indirect' | 'whose' | 'preposition';
/** Romanian only: the spoken forms (ăsta, ăla), which go after the noun (spec 25). */
export type QuantifierRegister = 'spoken';
/** What a demonstrative points at: this, that, such, so much or so many (spec 25). */
export type DemonstrativeKind = 'near' | 'far' | 'such' | 'amount';

export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional' | 'hortative';
// Indicative: present, imperfect, aorist, future (θα + present), futureSimple (θα + aorist subjunctive),
// perfect, pluperfect, futurePerfect. Subjunctive: present, aorist, perfect. Imperative: present, aorist
// (second person only). Conditional: imperfect (θα + imperfect) and pluperfect (θα + pluperfect).
// Hortative: present and aorist, ας + the subjunctive form (ας φάμε), every person.
export type Tense =
  | 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple' | 'perfect' | 'pluperfect' | 'futurePerfect';
export type Voice = 'active' | 'mediopassive';

export type Polarity = 'affirmative' | 'negative';

/** A weak (clitic) pronoun, with a command (spec 4.2). */
export interface Clitic {
  person: Person;
  number: Num;
  /** The Greek gender of a third-person pronoun (το is neuter). */
  gender?: Gender;
  /** The Romanian gender of the noun the pronoun stands for, when it differs from the Greek one (ψωμί n, *pâine* f). */
  roGender?: Gender;
  /** The English word for a third-person pronoun when it is not the table's: "it" for a coffee, "him / her / it" for a child. */
  enPronoun?: string;
  role: 'object' | 'indirect';
}

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
  | {
      pos: 'verb';
      person: Person;
      number: Num;
      mood: Mood;
      tense: Tense;
      voice: Voice;
      polarity?: Polarity;
      /** Pronouns of a command, the indirect one first (spec 4.2). */
      clitics?: Clitic[];
      /** Use the lexical short form (φάτο, δως) when the verb has one. */
      shortForm?: boolean;
    }
  | { pos: 'noun'; number: Num; case: Case; count?: Exclude<NumeralValue, 1> }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: NumeralValue; gender: Gender; case: Case }
  | {
      pos: 'quantifier';
      gender: Gender;
      number: Num;
      case: Case;
      degree: QuantifierDegree;
      /** μερικοί: Romanian niște (the default, 'some') or câțiva ('few'). */
      sense?: QuantifierSense;
      /** Beside a noun, or on its own. Greek does not change; Romanian and English do (spec 4.2). */
      use: QuantifierUse;
      /** The spoken Romanian forms of a demonstrative; Greek and English do not change. */
      register?: QuantifierRegister;
    }
  | { pos: 'preposition'; sense?: PrepSense }
  | { pos: 'particle' }
  | { pos: 'conjunction' }
  | { pos: 'interrogative' }
  | { pos: 'adverb' }
  | { pos: 'freeRelative' }
  | { pos: 'relative'; role: RelativeRole; gender: Gender; number: Num; preposition?: string }
  | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }
  | ({ pos: 'clitic' } & Clitic);

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

export type NounClass = 'masc-es' | 'masc-os' | 'fem-a' | 'fem-ou' | 'neut-i' | 'neut-i-stem' | 'neut-o';

export interface GreekNoun extends LexemeBase {
  pos: 'noun';
  /** A person or an animal: English says who or whom, not which (spec 26). */
  animate?: true;
  gender: Gender;
  class: NounClass;
  /** A mass noun (ψωμί, νερό): in English it has no plural, so "many bread" is not said. */
  mass?: true;
  /** The English pronoun that stands for the noun (default "it"): "him / her / it" for a child. */
  enPronoun?: string;
  stems: Record<Num, string>;
  /** A cell that breaks its class pattern, keyed '<number>-<case>' ('pl-gen'); the whole cell is stored. */
  overrides?: Partial<Record<`${Num}-${Case}`, { stem: string; ending: string; note?: IrregularNote }>>;
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
  /** A passive participle: the verb it comes from and the participle stem it stores (πλυ-). */
  derivedFrom?: { verb: string; stem: string };
  /** δικός: it is always followed by the weak possessive (το δικό μου σπίτι) and has a panel of its own (spec 24). */
  emphatic?: true;
}

export interface GreekNumeral extends LexemeBase {
  pos: 'numeral';
  /** Romanian forms for every value; values above 1 have no genitive of their own, so `gen` repeats `nom`. */
  ro: Record<NumeralValue, Record<Gender, { nom: string; gen: string }>>;
  en: Record<NumeralValue, string>;
}

/**
 * How the Greek forms of one degree are made: a shared table of whole forms, or the adjective endings on a stem
 * (the stem-stressed endings, or the ending-stressed ones when `stressed` is set: μερικός, μερικοί).
 */
export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios' | 'opoiosFree' } | { stem: string; stressed?: true };

/** One Romanian cell: nominative-accusative and genitive-dative. `gen` is absent where the form is not covered (a stand-alone genitive pronoun, spec 6.3). */
export interface RoQuantifierCell {
  nom: Stored;
  gen?: Stored;
}

/** By use, then Romanian gender (neuter follows masculine in the singular and feminine in the plural), then number. */
type RoCellsByGender = Record<'m' | 'f', Partial<Record<Num, RoQuantifierCell>>>;
export type RoQuantifierCells = { determiner: RoCellsByGender; pronoun?: RoCellsByGender };

export type EnQuantifierCells = { determiner: Partial<Record<Num, string>>; pronoun?: Partial<Record<Num, string>> };

export interface GreekQuantifier extends LexemeBase {
  pos: 'quantifier';
  greek: { plain: QuantifierGreek; comparative?: QuantifierGreek };
  /** The numbers the panel may offer: μερικοί is plural only, κάποιος and κανένας singular only (spec 4.2). */
  numbers: Num[];
  /** One line of meaning for the panel. */
  meaning: string;
  /**
   * A question word (ποιος, πόσος). `who` takes the number control "one / many", `amount` the kind control
   * "a mass / separate things" (spec 5.3).
   */
  question?: 'who' | 'amount';
  /** The roles the panel may offer; absent means all three. Question words offer the subject and object only (spec 4.2). */
  cases?: Case[];
  /** A demonstrative (αυτός, εκείνος, τέτοιος, τόσος): the article follows the near and far ones, and ένα goes before τέτοιος (spec 25). */
  demonstrative?: DemonstrativeKind;
  /** A free relative (όποιος: whoever, whichever): a relative word with no noun to refer to (spec 26). */
  free?: true;
  /** The uses the panel may offer; absent means both (τέτοιος has no stand-alone use). */
  uses?: QuantifierUse[];
  ro: {
    lemma: string;
    plain: RoQuantifierCells;
    /** The spoken forms of a demonstrative, which go after the noun (casa asta); no genitive. */
    spoken?: RoQuantifierCells;
    /** The second sense (câțiva beside niște). The comparative is generated: mai + the plain form. */
    few?: RoQuantifierCells;
    /** The numbers whose Romanian genitive has the article built in (multului = "of the much"). */
    genitiveWithArticle?: Num[];
    /** The plural genitive can also be said as "a" + the plain plural: "a mulți / a multe". */
    genitiveWithA?: string;
  };
  en: {
    plain: EnQuantifierCells;
    few?: EnQuantifierCells;
    comparative?: EnQuantifierCells;
    /** The word after a negative verb: "not … any". */
    negated?: string;
  };
}

export interface GreekArticle extends LexemeBase {
  pos: 'article';
}

export type VerbClass = 'omega' | 'contracted-ao' | 'athematic' | 'mediopassive' | 'deponent' | 'impersonal' | 'copula';

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
  /** The stem of the passive participle, without -μέν (πλένω: πλυ-, ψήνω: ψη-); the derived adjective joins -μένος to it. */
  participle?: string;
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
  /** A verb of wanting or knowing: its English imperfect is the simple past (I wanted), not "was wanting". */
  stative?: boolean;
  /** A modal verb (may) is negated with "not" after it, not with "do". */
  modal?: boolean;
  /** The six present cells of an irregular verb (am, are, is, are, are, are); `presentNot` the negative ones. */
  present?: readonly string[];
  presentNot?: readonly string[];
}

/** A lexical short form of a command with a pronoun (spec 4.3): φάε + το = φάτο, δώσε μου = δως μου. */
export interface ShortForm {
  /** The shortened verb: φά, δω. */
  stem: string;
  ending: string;
  /** True when the pronoun joins the verb into one word (φάτο); false when the pronouns stay words (δως μου το). */
  fuse: boolean;
  /** One line for the reader. */
  plain: string;
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
  /** The verb takes an indirect object (δίνω: δώσε μου). */
  indirect?: true;
  /** The verb takes no object (πάω, πηδάω, είμαι, μπορεί): it takes no pronouns. */
  intransitive?: true;
  /** Short forms of commands, keyed '<impAorist|impPresent>.<person><number>' (impAorist.2sg). Stored per verb, not generated. */
  shortForms?: Record<string, ShortForm>;
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

export interface GreekConjunction extends LexemeBase {
  pos: 'conjunction';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  example: { el: string; ro: string; en: string };
}

/**
 * A free relative that never changes: ό,τι (what, whatever) and όπου (where, wherever). Greek has one word where Romanian and
 * English have two (ce / orice, unde / oriunde; what / whatever, where / wherever) (spec 26).
 */
export interface GreekFreeRelative extends LexemeBase {
  pos: 'freeRelative';
  /** The Romanian and English words for the "-ever" reading (orice, whatever) and for the plain one (ce, what). */
  ro: { ever: string; plain: string };
  en: { ever: string; plain: string };
  /** One line of meaning for the panel. */
  meaning: string;
  /** An example for each reading, in each language. */
  examples: { ever: { el: string; ro: string; en: string }; plain: { el: string; ro: string; en: string } };
}

/**
 * A relative pronoun: που never changes, ο οποίος agrees with the noun it refers to (spec 26). Their Romanian and English
 * words are shared tables (`src/data/relatives.ts`); the slot holds the antecedent's gender and number and the job in the clause.
 */
export interface GreekRelative extends LexemeBase {
  pos: 'relative';
  kind: 'pou' | 'opoios';
  /** One line of meaning for the panel. */
  meaning: string;
}

/** A place word that never changes: εδώ and εκεί (spec 25). A preposition may govern one (μέχρι εκεί). */
export interface GreekAdverb extends LexemeBase {
  pos: 'adverb';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  /** The Romanian words after a preposition, where they are not the preposition's word + the adverb (από εδώ: de aici), by preposition id. */
  roAfter?: Record<string, string>;
  /** An example sentence in each language. */
  example: { el: string; ro: string; en: string };
}

/** A question word that never changes: τι, πού, πότε, γιατί, πώς (spec 5.3). ποιος and πόσος are quantifiers. */
export interface GreekInterrogative extends LexemeBase {
  pos: 'interrogative';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  /** The Romanian word after a preposition, where it is one fused word (de unde, până când), by preposition id. */
  roAfter?: Record<string, string>;
  /** An example question in each language. */
  question: { el: string; ro: string; en: string };
  /** γιατί is also "because": the word used as an answer. */
  answer?: { el: string; ro: string; en: string };
}

/**
 * The weak genitive pronoun after a noun: το σπίτι μου (spec 4.3). The slot holds the possessor; the possessed noun
 * is the token's `agreesWith`.
 */
export interface GreekPossessive extends LexemeBase {
  pos: 'possessive';
}

/** The weak pronoun as a word of its own: the panel a clitic piece of a verb group opens (spec 5.3). */
export interface GreekClitic extends LexemeBase {
  pos: 'clitic';
}

/** One meaning of a preposition that has several (σε): its Romanian and English word and an example. */
export interface PrepositionSense {
  value: PrepSense;
  /** The label in the Meaning control. */
  label: string;
  /** The Romanian word; empty when Romanian uses a case instead (`dative`). */
  ro: string;
  en: string;
  /** Romanian puts the noun in the dative and uses no preposition (dau copilului). */
  dative?: true;
  example: { el: string; ro: string; en: string };
}

export interface GreekPreposition extends LexemeBase {
  pos: 'preposition';
  ro: string;
  en: string;
  /** A short plain meaning, used to label rows in the preposition table. */
  meaning: string;
  /** The forms written as one word with the article that follows (σε + τον = στον), by the noun's Greek gender and number. */
  fused?: Record<Gender, Record<Num, string>>;
  /** The meanings the Meaning control offers (σε only). */
  senses?: PrepositionSense[];
}

export type GreekLexeme =
  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb | GreekRelative | GreekFreeRelative;

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
    /** One lexeme, or several that share the row (ποιος and πόσος). */
    lexeme?: string | string[];
    /** For verbs: show the row only when the panel's slot matches every listed dimension. */
    when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[]; polarity?: Polarity; clitics?: 'some' | 'two' };
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

/** An authored reading for one irregularity rule (spec 5.5); {text}, {parts}, {technical}, {stem} and {ending} are filled from the form. */
export interface ReadingTemplate {
  rule: string;
  beginner: string;
  improver: string;
  verified: boolean;
}

/** One part of a form taken apart: a particle, a negation, the auxiliary, or the augment, stem or ending of the verb. */
export interface ReadingPart {
  text: string;
  /** The part as shown: φά-, -ει, θα. */
  label: string;
  role: 'particle' | 'negation' | 'auxiliary' | 'clitic' | 'fused' | 'augment' | 'stem' | 'ending' | 'word';
  gloss: string;
  /** The index of the piece in compose(...).pieces, or null for a Romanian or English word. */
  piece: number | null;
}

export interface ReadingLine {
  parts: ReadingPart[];
  beginner: string;
  improver: string;
}

/** "How to read this" for one form: always a Greek line; Romanian and English lines for compound forms (spec 5.5). */
export interface Reading {
  el: ReadingLine;
  ro?: ReadingLine;
  en?: ReadingLine;
}

/** One way of saying the same command (spec 4.6): a slot, and optionally a spelled-out object. */
export interface GroupMember {
  verb: { lexeme: string; slot: SlotOf<'verb'> };
  /** A spelled-out object noun (the with-noun member). */
  object?: { noun: string; number: Num; case: Case };
  /** A note shown with the member ("the pronoun moves in front of the verb"). */
  note?: string;
}

/** Forms that mean the same (spec 4.6); the texts are generated from the slots. */
export interface FormGroup {
  id: string;
  /** Plain language: "Eat the bread!". */
  meaning: string;
  members: GroupMember[];
  /** The verb with no object, shown under the strip as "close, not the same". */
  closeNotSame?: { verb: GroupMember['verb']; reason: string };
  /** Covers the meaning, the member notes, the close-not-the-same reason and the claim that the members mean the same (spec 4.3). */
  verified: boolean;
}

/** One file of the split review sheet: the records of a topic a speaker reviews in one sitting (spec 9). */
export interface ReviewFeature {
  /** The path of the file without its extension: 'adjectives', 'verbs/troo'. */
  id: string;
  title: string;
  lexemes: string[];
  /** Ending tables, auxiliary tables and glossaries (`ReviewItem` ids). */
  items: string[];
  phrases: string[];
  /** Comparison note ids. */
  divergences: string[];
  /** Authored reading rules. */
  readings: string[];
  /** Form group ids. */
  groups: string[];
  /** The file also prints every noun owned by every noun (the generated lines of the noun possessor). */
  nounPossessors?: true;
}
