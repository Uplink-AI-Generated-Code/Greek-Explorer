import { roClitics } from './clitics';
import { voiceOf } from './offers';
import { whoIndex } from './tenses';
import type {
  Case, Gender, GreekAdjective, GreekNoun, GreekNumeral, GreekQuantifier, GreekVerb, Num, NumeralValue, SlotOf, Stored,
} from '../types';

export function roNoun(n: GreekNoun, number: Num, c: Case, kind: 'definite' | 'indefinite'): string {
  const f = n.ro.forms[number];
  const gen = c === 'gen';
  if (kind === 'definite') return gen ? f.genDefinite : f.definite;
  return gen ? f.genIndefinite : f.indefinite;
}

/** Romanian adjectives agree with the Romanian noun's gender, which can differ from the Greek one. */
export function roAdjective(a: GreekAdjective, roGender: Gender, number: Num, c: Case): string {
  const f = a.ro.forms[roGender];
  if (c === 'gen' && number === 'sg' && f.genSg) return f.genSg;
  return f[number];
}

export function roNumeral(n: GreekNumeral, value: NumeralValue, roGender: Gender, c: Case): string {
  return n.ro[value][roGender][c === 'gen' ? 'gen' : 'nom'];
}

/** The Romanian auxiliaries of the compound tenses (spec 4.3); a ReviewItem covers them. */
export const RO_AUXILIARIES = {
  /** a avea, present: the perfect (am mâncat). */
  have: ['am', 'ai', 'a', 'am', 'ați', 'au'],
  /** a vrea, future particle: voi mânca. */
  will: ['voi', 'vei', 'va', 'vom', 'veți', 'vor'],
  /** the conditional auxiliary: aș mânca. */
  would: ['aș', 'ai', 'ar', 'am', 'ați', 'ar'],
} as const;

/**
 * A verb form with pronouns outside a command (spec 4.3): the stored pronoun forms go in front of the verb group
 * (îl mănânc, nu-l mănânc, să-l mănânc, îl voi mânca), fuse with a vowel-initial auxiliary (l-am mâncat, l-aș mânca)
 * or, for *o* and the pairs with it, stay behind the participle or the infinitive (am mâncat-o, aș mânca-o).
 */
function roWithPronouns(v: GreekVerb, s: SlotOf<'verb'>): string {
  const ro = voiceOf(v, s.voice).ro;
  const i = whoIndex(s);
  const pronoun = roClitics(s.clitics ?? []);
  const negative = s.polarity === 'negative';
  const nu = negative ? 'nu ' : '';
  // Before a consonant-initial word, and after să.
  const pre = negative ? pronoun.afterNu : pronoun.free;
  const afterSa = negative ? `să ${pronoun.afterNu}` : pronoun.afterSa;
  const fused = (aux: string, rest: string) => `${nu}${pronoun.fused}${aux} ${rest}${pronoun.after}`;
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return `${pre} ${ro.present[i]}`;
    case 'indicative.imperfect':
      return `${pre} ${ro.imperfect[i]}`;
    case 'indicative.pluperfect':
      return `${pre} ${ro.pluperfect[i]}`;
    case 'indicative.aorist':
    case 'indicative.perfect':
      return fused(RO_AUXILIARIES.have[i], ro.participle);
    case 'indicative.future':
    case 'indicative.futureSimple':
      return `${pre} ${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
    case 'indicative.futurePerfect':
      return `${pre} ${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
    case 'subjunctive.present':
    case 'subjunctive.aorist':
    case 'hortative.present':
    case 'hortative.aorist':
      return `${afterSa} ${ro.subjunctive[i]}`;
    case 'subjunctive.perfect':
      return `${afterSa} fi ${ro.participle}`;
    case 'conditional.imperfect':
      return fused(RO_AUXILIARIES.would[i], ro.infinitive);
    case 'conditional.pluperfect':
      return fused(RO_AUXILIARIES.would[i], `fi ${ro.participle}`);
    default:
      throw new Error(`${s.mood} ${s.tense} takes no pronouns`);
  }
}

/** The Romanian cell for a verb slot: stored forms for the simple tenses, generated for the compound ones. */
export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  if ((s.clitics ?? []).length > 0 && s.mood !== 'imperative') return roWithPronouns(v, s);
  const ro = voiceOf(v, s.voice).ro;
  const i = whoIndex(s);
  // Negation: nu in front of the verb group; să nu in the subjunctive (spec 6.4).
  const nu = s.polarity === 'negative' ? 'nu ' : '';
  const key = `${s.mood}.${s.tense}`;
  switch (key) {
    case 'indicative.present':
      return `${nu}${ro.present[i]}`;
    case 'indicative.imperfect':
      return `${nu}${ro.imperfect[i]}`;
    case 'indicative.aorist':
    case 'indicative.perfect':
      // Romanian has one tense for both; a reflexive verb stores it (m-am spălat).
      return `${nu}${ro.perfect?.[i] ?? `${RO_AUXILIARIES.have[i]} ${ro.participle}`}`;
    case 'indicative.pluperfect':
      return `${nu}${ro.pluperfect[i]}`;
    case 'indicative.future':
    case 'indicative.futureSimple':
      return `${nu}${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
    case 'indicative.futurePerfect':
      return `${nu}${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
    case 'subjunctive.present':
    case 'subjunctive.aorist':
    // The hortative is the subjunctive: ας φάμε is *să mâncăm* (spec 6.4).
    case 'hortative.present':
    case 'hortative.aorist':
      return `să ${nu}${ro.subjunctive[i]}`;
    case 'subjunctive.perfect':
      return `să ${nu}fi ${ro.participle}`;
    case 'imperative.present':
    case 'imperative.aorist': {
      const clitics = s.clitics ?? [];
      const negative = s.polarity === 'negative';
      const attached = clitics.length > 0 ? roClitics(clitics) : null;
      const after = attached ? attached.afterNu : 'nu';
      if (negative && s.number === 'sg') return `${after} ${ro.infinitive}`;
      if (!ro.imperative) throw new Error(`${v.id} has no Romanian imperative`);
      const form = ro.imperative[s.number === 'sg' ? 0 : 1];
      if (negative) return `${after} ${form}`;
      return attached ? `${form}${attached.enclitic}` : form;
    }
    case 'conditional.imperfect':
      return `${nu}${RO_AUXILIARIES.would[i]} ${ro.infinitive}`;
    case 'conditional.pluperfect':
      return `${nu}${RO_AUXILIARIES.would[i]} fi ${ro.participle}`;
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}

/** The Romanian noun without an article or numeral, as it follows a quantifier: pâine, cafele, unei cafele → cafele. */
export function roBareNoun(n: GreekNoun, number: Num, c: Case): string {
  const f = n.ro.forms[number];
  const form = c === 'gen' ? f.genIndefinite : f.indefinite;
  // The singular and the genitive start with an article word (o, un, unei, unor); the plural nominative does not.
  return number === 'sg' || c === 'gen' ? form.split(' ').slice(1).join(' ') : form;
}

/** Neuter nouns follow the masculine in the singular and the feminine in the plural (spec 10). */
const quantifierGender = (g: Gender, number: Num): 'm' | 'f' => (g === 'n' ? (number === 'sg' ? 'm' : 'f') : g);

/**
 * The Romanian cell of a quantifier slot, for a noun of Romanian gender `roGender`. The comparative is `mai` + the
 * plain form (a pending cell stays pending). Returns null where the form is not covered: the stand-alone genitive
 * (spec 6.3, 16).
 */
export function roQuantifier(q: GreekQuantifier, s: SlotOf<'quantifier'>, roGender: Gender): Stored | null {
  const set = s.register === 'spoken' ? q.ro.spoken : s.sense === 'few' && q.ro.few ? q.ro.few : q.ro.plain;
  if (!set) throw new Error(`${q.id} has no Romanian ${s.register ?? s.sense ?? 'plain'} forms`);
  const cell = set[s.use]?.[quantifierGender(roGender, s.number)][s.number];
  if (!cell) throw new Error(`${q.id} has no Romanian ${s.use} form for the ${s.number}`);
  const value = s.case === 'gen' ? cell.gen : cell.nom;
  if (value === undefined) return null;
  if (typeof value !== 'string' || s.degree !== 'comparative') return value;
  return `mai ${value}`;
}
