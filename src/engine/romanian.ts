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

export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  return v.ro.present[s.person - 1 + (s.number === 'pl' ? 3 : 0)];
}
