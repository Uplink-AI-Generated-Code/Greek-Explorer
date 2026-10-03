import type { GreekNoun, GreekNumeral, GreekVerb, Num, NumeralValue, SlotOf } from '../types';
import { voiceOf } from './offers';
import { whoIndex } from './tenses';

export const enNoun = (n: GreekNoun, number: Num): string => n.en[number];

export const enIndefiniteArticle = (nextWord: string): 'a' | 'an' =>
  /^[aeiou]/i.test(nextWord) ? 'an' : 'a';

export const enNumeral = (n: GreekNumeral, value: NumeralValue): string => n.en[value];

const HAVE = ['have', 'have', 'has', 'have', 'have', 'have'];
const WAS = ['was', 'were', 'was', 'were', 'were', 'were'];
const SELF = ['myself', 'yourself', 'himself/herself', 'ourselves', 'yourselves', 'themselves'];

/** An English verb slot in parts, so the panel can colour the subject pronoun: lead + subject + verb. */
export interface EnParts {
  /** A word before the subject ("that" in "that I eat"). */
  lead: string;
  /** False for the imperative. */
  subject: boolean;
  verb: string;
}

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): EnParts {
  const en = voiceOf(v, s.voice).en;
  const i = whoIndex(s);
  const present = i === 2 ? en.third : en.base;
  const self = en.reflexive ? ` (${SELF[i]})` : '';
  const parts = (verb: string, lead = '', subject = true): EnParts => ({ lead, subject, verb: `${verb}${self}` });
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return parts(present);
    case 'indicative.imperfect':
      return parts(`${WAS[i]} ${en.ing}`);
    case 'indicative.aorist':
      return parts(en.past);
    case 'indicative.future':
    case 'indicative.futureSimple':
      return parts(`will ${en.base}`);
    case 'indicative.perfect':
      return parts(`${HAVE[i]} ${en.pastParticiple}`);
    case 'indicative.pluperfect':
      return parts(`had ${en.pastParticiple}`);
    case 'indicative.futurePerfect':
      return parts(`will have ${en.pastParticiple}`);
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return parts(present, 'that');
    case 'subjunctive.perfect':
      return parts(`may have ${en.pastParticiple}`);
    case 'imperative.present':
    case 'imperative.aorist':
      return parts(en.base, '', false);
    case 'conditional.imperfect':
      return parts(`would ${en.base}`);
    case 'conditional.pluperfect':
      return parts(`would have ${en.pastParticiple}`);
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}

/** The whole English cell as text: "that I eat", "I have eaten", "eat". */
export function enVerbText(v: GreekVerb, s: SlotOf<'verb'>, pronoun: string): string {
  const p = enVerb(v, s);
  return [p.lead, p.subject ? pronoun : '', p.verb].filter((part) => part !== '').join(' ');
}
