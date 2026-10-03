import type { Gender, Level } from '../types';

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
