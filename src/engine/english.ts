import type { Clitic, GreekNoun, GreekNumeral, GreekQuantifier, GreekVerb, Num, NumeralValue, SlotOf } from '../types';
import { enClitic } from './clitics';
import { voiceOf } from './offers';
import { whoIndex } from './tenses';

export const enNoun = (n: GreekNoun, number: Num): string => n.en[number];

export const enIndefiniteArticle = (nextWord: string): 'a' | 'an' =>
  /^[aeiou]/i.test(nextWord) ? 'an' : 'a';

export const enNumeral = (n: GreekNumeral, value: NumeralValue): string => n.en[value];

const HAVE = ['have', 'have', 'has', 'have', 'have', 'have'];
const WAS = ['was', 'were', 'was', 'were', 'were', 'were'];
const SELF = ['myself', 'yourself', 'himself/herself', 'ourselves', 'yourselves', 'themselves'];
const DONT = ["don't", "don't", "doesn't", "don't", "don't", "don't"];
const WASNT = ["wasn't", "weren't", "wasn't", "weren't", "weren't", "weren't"];
const HAVENT = ["haven't", "haven't", "hasn't", "haven't", "haven't", "haven't"];

/** An English verb slot in parts, so the panel can colour the subject pronoun: lead + subject + verb. */
export interface EnParts {
  /** A word before the subject ("that" in "that I eat"). */
  lead: string;
  /** False for the imperative. */
  subject: boolean;
  verb: string;
  /** The word shown where the subject pronoun stands, when it is not the usual one: "me" in "let me eat". */
  pronoun?: string;
}

/** "let me", "let's", "let him / her", "let them"; the second person is "may you" (spec 5.2, hortative-persons). */
const HORTATIVE_LEAD = ['let', 'may', 'let', '', 'may', 'let'];
const HORTATIVE_WHO = ['me', 'you', 'him / her', "let's", 'you', 'them'];

/** The pronouns after an English verb form: "eat it", "give me", "give it to me" (the direct pronoun comes first). */
function enObjects(clitics: readonly Clitic[]): string {
  const direct = clitics.find((c) => c.role === 'object');
  const indirect = clitics.find((c) => c.role === 'indirect');
  if (direct && indirect) return ` ${enClitic(direct)} to ${enClitic(indirect)}`;
  const only = direct ?? indirect;
  return only ? ` ${enClitic(only)}` : '';
}

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): EnParts {
  const en = voiceOf(v, s.voice).en;
  const i = whoIndex(s);
  const negative = s.polarity === 'negative';
  const present = i === 2 ? en.third : en.base;
  // "do"-support, or "not" after a modal.
  const presentNot = en.modal ? `${present} not` : `${DONT[i]} ${en.base}`;
  const self = en.reflexive ? ` (${SELF[i]})` : '';
  // The pronouns follow the verb, or the participle: "eat it", "has eaten it", "will give it to me".
  const objects = enObjects(s.clitics ?? []);
  const parts = (verb: string, lead = '', subject = true, pronoun?: string): EnParts => ({
    lead,
    subject,
    verb: `${verb}${self}${objects}`,
    ...(pronoun ? { pronoun } : {}),
  });
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return parts(negative ? (en.presentNot?.[i] ?? presentNot) : (en.present?.[i] ?? present));
    case 'indicative.imperfect':
      return parts(`${negative ? WASNT[i] : WAS[i]} ${en.ing}`);
    case 'indicative.aorist':
      return parts(negative ? `didn't ${en.base}` : en.past);
    case 'indicative.future':
    case 'indicative.futureSimple':
      return parts(`${negative ? "won't" : 'will'} ${en.base}`);
    case 'indicative.perfect':
      return parts(`${negative ? HAVENT[i] : HAVE[i]} ${en.pastParticiple}`);
    case 'indicative.pluperfect':
      return parts(`${negative ? "hadn't" : 'had'} ${en.pastParticiple}`);
    case 'indicative.futurePerfect':
      return parts(`${negative ? "won't" : 'will'} have ${en.pastParticiple}`);
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return parts(negative ? presentNot : present, 'that');
    case 'subjunctive.perfect':
      return parts(`may${negative ? ' not' : ''} have ${en.pastParticiple}`);
    case 'imperative.present':
    case 'imperative.aorist':
      return parts(negative ? `don't ${en.base}` : en.base, '', false);
    case 'hortative.present':
    case 'hortative.aorist':
      return parts(`${negative ? 'not ' : ''}${en.base}`, HORTATIVE_LEAD[i], true, HORTATIVE_WHO[i]);
    case 'conditional.imperfect':
      return parts(`${negative ? "wouldn't" : 'would'} ${en.base}`);
    case 'conditional.pluperfect':
      return parts(`${negative ? "wouldn't" : 'would'} have ${en.pastParticiple}`);
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}

/** The whole English cell as text: "that I eat", "I have eaten", "eat". */
export function enVerbText(v: GreekVerb, s: SlotOf<'verb'>, pronoun: string): string {
  const p = enVerb(v, s);
  return [p.lead, p.subject ? (p.pronoun ?? pronoun) : '', p.verb].filter((part) => part !== '').join(' ');
}

/** The English word for a quantifier slot ("some / any", "much / a lot of", "fewer"). */
export function enQuantifier(q: GreekQuantifier, s: SlotOf<'quantifier'>): string {
  const set = s.degree === 'comparative' ? q.en.comparative : s.sense === 'few' && q.en.few ? q.en.few : q.en.plain;
  if (!set) throw new Error(`${q.id} has no English ${s.degree} form`);
  const word = set[s.use][s.number];
  if (word === undefined) throw new Error(`${q.id} has no English ${s.use} form for the ${s.number}`);
  return word;
}
