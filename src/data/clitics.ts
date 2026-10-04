import type { Clitic, Gender } from '../types';

type ByGender = Record<Gender, string>;
const same = (word: string): ByGender => ({ m: word, f: word, n: word });

/** The Greek weak pronouns by role and person (spec 6.5). A ReviewItem covers this table. */
export const GREEK_CLITICS: Record<Clitic['role'], Record<string, ByGender>> = {
  object: {
    '1sg': same('με'),
    '2sg': same('σε'),
    '3sg': { m: 'τον', f: 'την', n: 'το' },
    '1pl': same('μας'),
    '2pl': same('σας'),
    '3pl': { m: 'τους', f: 'τις', n: 'τα' },
  },
  indirect: {
    '1sg': same('μου'),
    '2sg': same('σου'),
    '3sg': { m: 'του', f: 'της', n: 'του' },
    '1pl': same('μας'),
    '2pl': same('σας'),
    '3pl': same('τους'),
  },
};

/** The strong (emphatic) accusative forms, shown as a note only (spec 6.5). */
export const GREEK_STRONG: Record<string, ByGender> = {
  '1sg': same('εμένα'),
  '2sg': same('εσένα'),
  '3sg': { m: 'αυτόν', f: 'αυτήν', n: 'αυτό' },
  '1pl': same('εμάς'),
  '2pl': same('εσάς'),
  '3pl': { m: 'αυτούς', f: 'αυτές', n: 'αυτά' },
};

/** The English object pronouns; "to me" uses the same forms. */
export const EN_CLITICS: Record<string, ByGender> = {
  '1sg': same('me'),
  '2sg': same('you'),
  '3sg': { m: 'him', f: 'her', n: 'it' },
  '1pl': same('us'),
  '2pl': same('you'),
  '3pl': same('them'),
};

export interface RoClitic {
  /** On its own: îl. */
  free: string;
  /** Attached to a command with a hyphen: mănâncă-l. */
  enclitic: string;
  /** After nu, with the fusions: nu-l, nu o. */
  afterNu: string;
}

/**
 * The Romanian pronouns, keyed 'obj' or 'ind', then person and number, then the Romanian gender of a third-person
 * accusative ('obj.3sg.m'). Fusions are stored, not derived (spec 4.3). A ReviewItem covers this table.
 */
export const RO_CLITICS: Record<string, RoClitic> = {
  'obj.1sg': { free: 'mă', enclitic: '-mă', afterNu: 'nu mă' },
  'obj.2sg': { free: 'te', enclitic: '-te', afterNu: 'nu te' },
  'obj.3sg.m': { free: 'îl', enclitic: '-l', afterNu: 'nu-l' },
  'obj.3sg.f': { free: 'o', enclitic: '-o', afterNu: 'nu o' },
  'obj.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
  'obj.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
  'obj.3pl.m': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
  'obj.3pl.f': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
  'ind.1sg': { free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' },
  'ind.2sg': { free: 'îți', enclitic: '-ți', afterNu: 'nu-ți' },
  'ind.3sg': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
  'ind.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
  'ind.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
  'ind.3pl': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
};

/** Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o. */
export const RO_CLUSTERS: Record<string, { enclitic: string; afterNu: string }> = {
  'ind.1sg+obj.3sg.m': { enclitic: '-mi-l', afterNu: 'nu mi-l' },
  'ind.1sg+obj.3sg.f': { enclitic: '-mi-o', afterNu: 'nu mi-o' },
  'ind.1sg+obj.3pl.m': { enclitic: '-mi-i', afterNu: 'nu mi-i' },
  'ind.1sg+obj.3pl.f': { enclitic: '-mi-le', afterNu: 'nu mi-le' },
};
