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
      '{text}: {parts}. In the "we" and "you (pl.)" forms the stress moves toward the end, so the word looks different from the other past forms.',
    improver:
      '{text}: {technical}. The stress moves forward in the plural, so the stem takes a different accent and any augment is dropped.',
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
    beginner: '{text}: {parts}. This command keeps the older stem {stem}- (with γ).',
    improver: '{text}: {technical}. The present imperative keeps the older stem {stem}-, unlike the rest of the present.',
    verified: false,
  },
];
