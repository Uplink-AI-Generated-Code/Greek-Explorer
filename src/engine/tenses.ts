import type { Mood, Num, Person, Tense } from '../types';

export const MOODS: Mood[] = ['indicative', 'subjunctive', 'imperative', 'conditional'];

export const TENSES_OF_MOOD: Record<Mood, Tense[]> = {
  indicative: ['present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect'],
  subjunctive: ['present', 'aorist', 'perfect'],
  imperative: ['present', 'aorist'],
  conditional: ['imperfect', 'pluperfect'],
};

/** Which stored form of the lexical verb a slot uses. */
export type FormKind = 'present' | 'imperfect' | 'aorist' | 'subjAorist' | 'impPresent' | 'impAorist' | 'base';

export interface Structure {
  /** The lexical verb's contribution. */
  form: FormKind;
  particle?: 'theta' | 'na';
  /** έχω, in the present or the imperfect, carrying the person. */
  aux?: 'present' | 'imperfect';
}

/** How each mood and tense is built (spec 4.3), keyed '<mood>.<tense>'. */
export const STRUCTURE: Record<string, Structure> = {
  'indicative.present': { form: 'present' },
  'indicative.imperfect': { form: 'imperfect' },
  'indicative.aorist': { form: 'aorist' },
  'indicative.future': { form: 'present', particle: 'theta' },
  'indicative.futureSimple': { form: 'subjAorist', particle: 'theta' },
  'indicative.perfect': { form: 'base', aux: 'present' },
  'indicative.pluperfect': { form: 'base', aux: 'imperfect' },
  'indicative.futurePerfect': { form: 'base', particle: 'theta', aux: 'present' },
  'subjunctive.present': { form: 'present', particle: 'na' },
  'subjunctive.aorist': { form: 'subjAorist', particle: 'na' },
  'subjunctive.perfect': { form: 'base', particle: 'na', aux: 'present' },
  'imperative.present': { form: 'impPresent' },
  'imperative.aorist': { form: 'impAorist' },
  'conditional.imperfect': { form: 'imperfect', particle: 'theta' },
  'conditional.pluperfect': { form: 'base', particle: 'theta', aux: 'imperfect' },
};

export function structureOf(mood: Mood, tense: Tense): Structure {
  const structure = STRUCTURE[`${mood}.${tense}`];
  if (!structure) throw new Error(`${mood} ${tense} is not a Greek tense`);
  return structure;
}

export const mainFormKind = (mood: Mood, tense: Tense): FormKind => structureOf(mood, tense).form;

/** 0 to 5 for 1sg 2sg 3sg 1pl 2pl 3pl. */
export const whoIndex = (who: { person: Person; number: Num }): number =>
  who.person - 1 + (who.number === 'pl' ? 3 : 0);
