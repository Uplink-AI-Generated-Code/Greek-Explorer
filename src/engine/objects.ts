import { LEXEMES } from '../data/lexemes';
import type { Clitic, GreekNoun, SlotOf } from '../types';

export type ObjectKind = 'none' | 'noun' | 'pronoun' | 'two';

/** The noun the Object control starts with. */
export const DEFAULT_OBJECT = 'psomi';

const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

/** The people an indirect pronoun can stand for in the Object control. A third person needs a gender; "to them" takes none in Greek (τους). */
export interface Recipient {
  value: string;
  label: string;
  clitic: Clitic;
}

export const RECIPIENTS: Recipient[] = [
  { value: '1sg', label: 'to me', clitic: ME },
  { value: '2sg', label: 'to you', clitic: { role: 'indirect', person: 2, number: 'sg' } },
  { value: '3sg-m', label: 'to him', clitic: { role: 'indirect', person: 3, number: 'sg', gender: 'm' } },
  { value: '3sg-f', label: 'to her', clitic: { role: 'indirect', person: 3, number: 'sg', gender: 'f' } },
  { value: '1pl', label: 'to us', clitic: { role: 'indirect', person: 1, number: 'pl' } },
  { value: '2pl', label: 'to you (all)', clitic: { role: 'indirect', person: 2, number: 'pl' } },
  { value: '3pl', label: 'to them', clitic: { role: 'indirect', person: 3, number: 'pl', gender: 'm' } },
];

/** The indirect pronoun a verb form has, or undefined. */
export const indirectOf = (slot: SlotOf<'verb'>): Clitic | undefined => (slot.clitics ?? []).find((c) => c.role === 'indirect');

/** Which recipient an indirect pronoun is; "to me" when it is none of them. */
export function recipientValue(c: Clitic | undefined): string {
  if (!c) return RECIPIENTS[0].value;
  const match = RECIPIENTS.find(
    (r) => r.clitic.person === c.person && r.clitic.number === c.number && (c.person !== 3 || c.number === 'pl' || r.clitic.gender === c.gender),
  );
  return (match ?? RECIPIENTS[0]).value;
}

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

/**
 * The pronouns for an object kind; a verb with an indirect object (δίνω) gets the indirect pronoun (`to`, "me" unless
 * the learner chose another) with a noun and in the pair.
 */
export function cliticsFor(kind: ObjectKind, noun: GreekNoun, indirect: boolean, to: Clitic = ME): Clitic[] {
  switch (kind) {
    case 'none':
      return [];
    case 'noun':
      return indirect ? [to] : [];
    case 'pronoun':
      return [pronounFor(noun)];
    case 'two':
      return [to, pronounFor(noun)];
  }
}
