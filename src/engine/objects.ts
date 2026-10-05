import { LEXEMES } from '../data/lexemes';
import type { Clitic, GreekNoun, SlotOf } from '../types';

export type ObjectKind = 'none' | 'noun' | 'pronoun' | 'two';

/** The noun the Object control starts with. */
export const DEFAULT_OBJECT = 'psomi';

const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

/** The direct pronoun that stands for a noun: the Greek gender from the Greek noun, the Romanian gender from the Romanian one, the English word from the noun ("it" unless it says otherwise). */
export const pronounFor = (noun: GreekNoun): Clitic => ({
  role: 'object',
  person: 3,
  number: 'sg',
  gender: noun.gender,
  roGender: noun.ro.gender,
  enPronoun: noun.enPronoun ?? 'it',
});

/** The first noun a third-person singular pronoun can stand for (same Greek and Romanian gender), or null. */
export function nounForClitic(c: Clitic): string | null {
  if (c.person !== 3 || c.number !== 'sg' || !c.gender) return null;
  const match = Object.values(LEXEMES).find(
    (l): l is GreekNoun => l.pos === 'noun' && l.gender === c.gender && l.ro.gender === (c.roGender ?? c.gender),
  );
  return match ? match.id : null;
}

/**
 * The kind of object a verb form has, from its pronouns and the noun the panel holds. A spelled-out noun is for
 * commands only (spec 5.3): in any other mood a held noun with no pronoun means no object.
 */
export function objectKind(slot: SlotOf<'verb'>, noun: string | null): ObjectKind {
  const clitics = slot.clitics ?? [];
  if (clitics.some((c) => c.role === 'object')) return clitics.some((c) => c.role === 'indirect') ? 'two' : 'pronoun';
  return noun && slot.mood === 'imperative' ? 'noun' : 'none';
}

/** The pronouns for an object kind; a verb with an indirect object (δίνω) gets "me" with a noun and in the pair. */
export function cliticsFor(kind: ObjectKind, noun: GreekNoun, indirect: boolean): Clitic[] {
  switch (kind) {
    case 'none':
      return [];
    case 'noun':
      return indirect ? [ME] : [];
    case 'pronoun':
      return [pronounFor(noun)];
    case 'two':
      return [ME, pronounFor(noun)];
  }
}
