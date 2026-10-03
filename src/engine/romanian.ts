import { voiceOf } from './offers';
import { whoIndex } from './tenses';
import type { Case, Gender, GreekAdjective, GreekNoun, GreekNumeral, GreekVerb, Num, NumeralValue, SlotOf } from '../types';

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

/** The Romanian cell for a verb slot: stored forms for the simple tenses, generated for the compound ones. */
export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  const ro = voiceOf(v, s.voice).ro;
  const i = whoIndex(s);
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return ro.present[i];
    case 'indicative.imperfect':
      return ro.imperfect[i];
    case 'indicative.aorist':
    case 'indicative.perfect':
      // Romanian has one tense for both; a reflexive verb stores it (m-am spălat).
      return ro.perfect?.[i] ?? `${RO_AUXILIARIES.have[i]} ${ro.participle}`;
    case 'indicative.pluperfect':
      return ro.pluperfect[i];
    case 'indicative.future':
    case 'indicative.futureSimple':
      return `${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
    case 'indicative.futurePerfect':
      return `${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return `să ${ro.subjunctive[i]}`;
    case 'subjunctive.perfect':
      return `să fi ${ro.participle}`;
    case 'imperative.present':
    case 'imperative.aorist': {
      if (!ro.imperative) throw new Error(`${v.id} has no Romanian imperative`);
      return ro.imperative[s.number === 'sg' ? 0 : 1];
    }
    case 'conditional.imperfect':
      return `${RO_AUXILIARIES.would[i]} ${ro.infinitive}`;
    case 'conditional.pluperfect':
      return `${RO_AUXILIARIES.would[i]} fi ${ro.participle}`;
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}
