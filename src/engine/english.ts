import type { GreekNoun, GreekNumeral, GreekVerb, Num, NumeralValue, SlotOf } from '../types';
import { voiceOf } from './offers';

export const enNoun = (n: GreekNoun, number: Num): string => n.en[number];

export const enIndefiniteArticle = (nextWord: string): 'a' | 'an' =>
  /^[aeiou]/i.test(nextWord) ? 'an' : 'a';

export const enNumeral = (n: GreekNumeral, value: NumeralValue): string => n.en[value];

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  const en = voiceOf(v, s.voice).en;
  return s.person === 3 && s.number === 'sg' ? en.third : en.base;
}
