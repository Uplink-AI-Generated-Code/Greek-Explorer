import type { Gender, Level, Mood, Tense, Voice } from '../types';

export interface Option {
  value: string;
  label: string;
}

export function caseOptions(level: Level): Option[] {
  return level === 'beginner'
    ? [
        { value: 'nom', label: 'subject' },
        { value: 'acc', label: 'object' },
        { value: 'gen', label: 'possessor' },
      ]
    : [
        { value: 'nom', label: 'nominative' },
        { value: 'acc', label: 'accusative' },
        { value: 'gen', label: 'genitive' },
      ];
}

export const numberOptions: Option[] = [
  { value: 'sg', label: 'one' },
  { value: 'pl', label: 'many' },
];

export const whoOptions: Option[] = [
  { value: '1sg', label: 'I' },
  { value: '2sg', label: 'you' },
  { value: '3sg', label: 'he / she' },
  { value: '1pl', label: 'we' },
  { value: '2pl', label: 'you (pl.)' },
  { value: '3pl', label: 'they' },
];

export const GENDER_NAME: Record<Gender, string> = { m: 'masculine', f: 'feminine', n: 'neuter' };

export const GREEK_PRONOUNS = ['εγώ', 'εσύ', 'αυτός/ή', 'εμείς', 'εσείς', 'αυτοί/ές'];
export const RO_PRONOUNS = ['eu', 'tu', 'el/ea', 'noi', 'voi', 'ei/ele'];
export const EN_PRONOUNS = ['I', 'you', 'he/she', 'we', 'you', 'they'];

const MOOD_LABEL: Record<Level, Record<Mood, string>> = {
  beginner: { indicative: 'a fact', subjunctive: 'wish or possibility', imperative: 'a command', conditional: 'would' },
  improver: { indicative: 'indicative', subjunctive: 'subjunctive', imperative: 'imperative', conditional: 'conditional' },
};

/** Keyed '<mood>.<tense>'. Beginner uses plain words, Improver the technical name (spec 3). */
const TENSE_LABEL: Record<Level, Record<string, string>> = {
  beginner: {
    'indicative.present': 'now',
    'indicative.imperfect': 'was doing',
    'indicative.aorist': 'did (once)',
    'indicative.future': 'will be doing',
    'indicative.futureSimple': 'will do',
    'indicative.perfect': 'have done',
    'indicative.pluperfect': 'had done',
    'indicative.futurePerfect': 'will have done',
    'subjunctive.present': 'to (do), ongoing',
    'subjunctive.aorist': 'to (do), once',
    'subjunctive.perfect': 'may have done',
    'imperative.present': 'keep doing!',
    'imperative.aorist': 'do it!',
    'conditional.imperfect': 'would do',
    'conditional.pluperfect': 'would have done',
  },
  improver: {
    'indicative.present': 'present',
    'indicative.imperfect': 'imperfect',
    'indicative.aorist': 'aorist',
    'indicative.future': 'future (continuous)',
    'indicative.futureSimple': 'future (simple)',
    'indicative.perfect': 'present perfect',
    'indicative.pluperfect': 'past perfect',
    'indicative.futurePerfect': 'future perfect',
    'subjunctive.present': 'present',
    'subjunctive.aorist': 'aorist',
    'subjunctive.perfect': 'perfect',
    'imperative.present': 'present (keep doing)',
    'imperative.aorist': 'aorist (do it once)',
    'conditional.imperfect': 'θα + imperfect',
    'conditional.pluperfect': 'θα + pluperfect',
  },
};

const VOICE_LABEL: Record<Level, Record<Voice, string>> = {
  beginner: { active: 'doing it', mediopassive: 'done to oneself' },
  improver: { active: 'active', mediopassive: 'mediopassive' },
};

export const moodLabel = (level: Level, mood: Mood): string => MOOD_LABEL[level][mood];

export function tenseLabel(level: Level, mood: Mood, tense: Tense): string {
  const label = TENSE_LABEL[level][`${mood}.${tense}`];
  if (!label) throw new Error(`${mood} ${tense} is not a Greek tense`);
  return label;
}

export const moodOptions = (level: Level, offered: Mood[]): Option[] =>
  offered.map((mood) => ({ value: mood, label: moodLabel(level, mood) }));

export const tenseOptions = (level: Level, mood: Mood, offered: Tense[]): Option[] =>
  offered.map((tense) => ({ value: tense, label: tenseLabel(level, mood, tense) }));

export const voiceOptions = (level: Level, offered: Voice[]): Option[] =>
  offered.map((voice) => ({ value: voice, label: VOICE_LABEL[level][voice] }));

/** The Who? options for the persons a mood offers ('2sg', '2pl' for the imperative). */
export const whoOptionsFor = (offered: string[]): Option[] => whoOptions.filter((o) => offered.includes(o.value));

/** πολύς and λίγος: the number the noun has decides the reading (spec 5.3). */
export const kindOptions: Option[] = [
  { value: 'mass', label: 'a mass (water, bread)' },
  { value: 'count', label: 'separate things (coffees)' },
];

export const degreeOptions = (level: Level): Option[] => [
  { value: 'plain', label: level === 'beginner' ? 'a lot / a little' : 'plain' },
  { value: 'comparative', label: level === 'beginner' ? 'more / less' : 'comparative' },
];

/** μερικοί: the Romanian counterpart is a control (spec 5.2, quantity-vs-sense). */
export const senseOptions: Option[] = [
  { value: 'some', label: 'some (niște)' },
  { value: 'few', label: 'a few (câțiva)' },
];

/** The kinds of object of a command (spec 5.3). */
export const objectOptions = (level: Level, indirect: boolean): Option[] => [
  { value: 'none', label: 'none' },
  { value: 'noun', label: level === 'beginner' ? 'a noun (spelled out)' : 'a noun phrase' },
  { value: 'pronoun', label: level === 'beginner' ? 'a small word (it, him)' : 'a pronoun' },
  ...(indirect
    ? [{ value: 'two', label: level === 'beginner' ? 'two small words (me + it)' : 'two pronouns (indirect + direct)' }]
    : []),
];
