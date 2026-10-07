import type { FormKind } from '../engine/tenses';
import type { ReadingTemplate } from '../types';

/** The persons as an English learner would say them. */
export const WHO_GLOSS = ['I', 'you', 'he/she', 'we', 'you (pl.)', 'they'] as const;

/**
 * The shared glossary of endings (spec 5.5, 9): what an ending adds, by the kind of form.
 * {who} is replaced by the person. A ReviewItem covers this table.
 */
export const ENDING_GLOSS: Record<FormKind, string> = {
  present: '{who}, present form',
  imperfect: '{who}, in the past (was doing)',
  aorist: '{who}, in the past (once)',
  subjAorist: '{who}, once',
  impPresent: 'a command to {who}: keep doing',
  impAorist: 'a command to {who}: do it once',
  base: 'never changes after έχω',
};

/** What each particle and negation means, by lexeme id. */
export const PARTICLE_GLOSS: Record<string, string> = {
  theta: 'will',
  na: 'to / that',
  as: 'let',
  den: 'not',
  min: 'not',
};

/** The auxiliary έχω as it reads in English, by tense and person. */
export const AUX_GLOSS = {
  present: ['I have', 'you have', 'he/she has', 'we have', 'you (pl.) have', 'they have'],
  imperfect: ['I had', 'you had', 'he/she had', 'we had', 'you (pl.) had', 'they had'],
} as const;

/** The technical name of the form the lexical verb contributes (Improver). */
export const KIND_NAME: Record<FormKind, string> = {
  present: 'present form',
  imperfect: 'imperfect form',
  aorist: 'aorist form',
  subjAorist: 'aorist-subjunctive form',
  impPresent: 'present imperative',
  impAorist: 'aorist imperative',
  base: 'invariable base form',
};

/**
 * Authored readings for irregular forms, one per irregularity rule (spec 5.5, plan departure 3).
 * {text} the written form, {parts} the parts and their glosses, {technical} the technical description,
 * {stem} and {ending} the verb's own stem and ending.
 */
export const READING_TEMPLATES: ReadingTemplate[] = [
  {
    rule: 'stress-shift',
    beginner:
      '{text}: {parts}. {note}',
    improver:
      '{text}: {technical}. {note}',
    verified: false,
  },
  {
    rule: 'monosyllable',
    beginner: '{text}: {parts}. A word of one syllable loses its accent mark.',
    improver: '{text}: {technical}. A monosyllable is written without an accent mark.',
    verified: false,
  },
  {
    rule: 'old-stem',
    beginner: '{text}: {parts}. The older commands τρώγε and τρώγετε (with γ) are also correct; people mostly say φάε and φάτε.',
    improver: '{text}: {technical}. The older present imperative τρώγε, τρώγετε keeps the stem with -γ- and is also correct; the aorist φάε, φάτε is the common command.',
    verified: false,
  },
  {
    rule: 'imperative-plural',
    beginner: '{text}: {parts}. The command to several people drops the -ε-; κάνετε (from the present) is for something that continues.',
    improver: '{text}: {technical}. The aorist imperative plural κάντε is the usual command; the present imperative κάνετε is for an action that continues or repeats.',
    verified: false,
  },
  {
    rule: 'irregular-be',
    beginner:
      '{text}: the verb "to be" is irregular, so its forms are learned whole, not built from a stem and an ending (with δεν, the not-word comes first). Learn the six forms together: είμαι, είσαι, είναι, είμαστε, είστε, είναι.',
    improver:
      '{text}: the present of είμαι is irregular and has no separate stem and ending (είμαι, είσαι, είναι, είμαστε, είστε, είναι). Romanian "a fi" and English "be" are irregular in the same way.',
    verified: false,
  },
  {
    rule: 'clitic-stress',
    beginner: '{text}: {parts}. Greek adds a second accent so the stress is not too far back.',
    improver:
      '{text}: {technical}. The stress would fall on the fourth-last syllable or further back, so a second accent is written two syllables after the original stress.',
    verified: false,
  },
  {
    rule: 'short-imperative',
    beginner: '{text}: {parts}. {note}',
    improver: '{text}: {technical}. {note}',
    verified: false,
  },
];

/**
 * The words of a compound Romanian form, in order, by mood and tense (affirmative). Keys: have, will, would, be,
 * to (să), INF (the infinitive), VERB (the subjunctive verb), PART (the participle). A ReviewItem covers these.
 */
export const RO_SHAPES: Record<string, readonly string[]> = {
  'indicative.aorist': ['have', 'PART'],
  'indicative.perfect': ['have', 'PART'],
  'indicative.future': ['will', 'INF'],
  'indicative.futureSimple': ['will', 'INF'],
  'indicative.futurePerfect': ['will', 'be', 'PART'],
  'subjunctive.present': ['to', 'VERB'],
  'subjunctive.aorist': ['to', 'VERB'],
  'subjunctive.perfect': ['to', 'be', 'PART'],
  'conditional.imperfect': ['would', 'INF'],
  'conditional.pluperfect': ['would', 'be', 'PART'],
  'hortative.present': ['to', 'VERB'],
  'hortative.aorist': ['to', 'VERB'],
};

/** What the English function words of a compound form mean. */
export const EN_FUNCTION: Record<string, string> = {
  am: 'am (a form of "be")',
  are: 'are (a form of "be")',
  is: 'is (a form of "be")',
  will: 'will (the future)',
  "won't": 'will, not',
  would: 'would',
  "wouldn't": 'would, not',
  have: 'have (auxiliary)',
  has: 'have (auxiliary)',
  had: 'had (auxiliary)',
  "haven't": 'have (auxiliary), not',
  "hasn't": 'have (auxiliary), not',
  "hadn't": 'had (auxiliary), not',
  was: 'was (a form of "be")',
  were: 'were (a form of "be")',
  "wasn't": 'was, not',
  "weren't": 'were, not',
  may: 'may (a possibility)',
  not: 'not',
  "don't": 'do (auxiliary), not',
  "doesn't": 'do (auxiliary), not',
  "didn't": 'did (auxiliary), not',
  that: 'that',
};
