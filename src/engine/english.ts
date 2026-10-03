import type { GreekNoun, GreekVerb, Num, SlotOf } from '../types';

export const enNoun = (n: GreekNoun, number: Num): string => n.en[number];

export const enIndefiniteArticle = (nextWord: string): 'a' | 'an' =>
  /^[aeiou]/i.test(nextWord) ? 'an' : 'a';

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  return s.person === 3 && s.number === 'sg' ? v.en.third : v.en.base;
}
