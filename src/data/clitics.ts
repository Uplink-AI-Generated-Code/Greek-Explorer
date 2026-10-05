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
  /** Before a consonant-initial word, on its own: îl mănânc, mi-o vei da. */
  free: string;
  /** Attached to a command with a hyphen: mănâncă-l. */
  enclitic: string;
  /** After nu, with the fusions: nu-l, nu o. */
  afterNu: string;
  /** After să, with the fusions: să-l, să o. */
  afterSa: string;
  /** Joined to a vowel-initial auxiliary (am, aș): l-am, mi l-ai; empty when the pronoun stays behind the participle or the infinitive. */
  fused: string;
  /** Behind the participle or the infinitive where Romanian puts it there: -o in am mâncat-o, aș mânca-o; otherwise empty. */
  after: string;
}

const ro = (
  free: string,
  enclitic: string,
  afterNu: string,
  afterSa: string,
  fused: string,
  after = '',
): RoClitic => ({ free, enclitic, afterNu, afterSa, fused, after });

/**
 * The Romanian pronouns, keyed 'obj' or 'ind', then person and number, then the Romanian gender of a third-person
 * accusative ('obj.3sg.m'). Fusions are stored, not derived (spec 4.3). A ReviewItem covers this table.
 */
export const RO_CLITICS: Record<string, RoClitic> = {
  'obj.1sg': ro('mă', '-mă', 'nu mă', 'să mă', 'm-'),
  'obj.2sg': ro('te', '-te', 'nu te', 'să te', 'te-'),
  'obj.3sg.m': ro('îl', '-l', 'nu-l', 'să-l', 'l-'),
  'obj.3sg.f': ro('o', '-o', 'nu o', 'să o', '', '-o'),
  'obj.1pl': ro('ne', '-ne', 'nu ne', 'să ne', 'ne-'),
  'obj.2pl': ro('vă', '-vă', 'nu vă', 'să vă', 'v-'),
  'obj.3pl.m': ro('îi', '-i', 'nu-i', 'să-i', 'i-'),
  'obj.3pl.f': ro('le', '-le', 'nu le', 'să le', 'le-'),
  'ind.1sg': ro('îmi', '-mi', 'nu-mi', 'să-mi', 'mi-'),
  'ind.2sg': ro('îți', '-ți', 'nu-ți', 'să-ți', 'ți-'),
  'ind.3sg': ro('îi', '-i', 'nu-i', 'să-i', 'i-'),
  'ind.1pl': ro('ne', '-ne', 'nu ne', 'să ne', 'ne-'),
  'ind.2pl': ro('vă', '-vă', 'nu vă', 'să vă', 'v-'),
  'ind.3pl': ro('le', '-le', 'nu le', 'să le', 'le-'),
};

/**
 * Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o, mi-o vei da.
 * Stored for the datives "to me" and "to you" with the four third-person accusatives.
 */
export const RO_CLUSTERS: Record<string, RoClitic> = {
  'ind.1sg+obj.3sg.m': ro('mi-l', '-mi-l', 'nu mi-l', 'să mi-l', 'mi l-'),
  'ind.1sg+obj.3sg.f': ro('mi-o', '-mi-o', 'nu mi-o', 'să mi-o', 'mi-', '-o'),
  'ind.1sg+obj.3pl.m': ro('mi-i', '-mi-i', 'nu mi-i', 'să mi-i', 'mi i-'),
  'ind.1sg+obj.3pl.f': ro('mi-le', '-mi-le', 'nu mi-le', 'să mi-le', 'mi le-'),
  'ind.2sg+obj.3sg.m': ro('ți-l', '-ți-l', 'nu ți-l', 'să ți-l', 'ți l-'),
  'ind.2sg+obj.3sg.f': ro('ți-o', '-ți-o', 'nu ți-o', 'să ți-o', 'ți-', '-o'),
  'ind.2sg+obj.3pl.m': ro('ți-i', '-ți-i', 'nu ți-i', 'să ți-i', 'ți i-'),
  'ind.2sg+obj.3pl.f': ro('ți-le', '-ți-le', 'nu ți-le', 'să ți-le', 'ți le-'),
};
