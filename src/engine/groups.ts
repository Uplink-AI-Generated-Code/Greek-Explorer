import { FORM_GROUPS } from '../data/form-groups';
import { getNoun, getVerb } from '../data/lexemes';
import type { FormGroup, GroupMember, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { compose, composedRich } from './compose';
import { enVerbText } from './english';
import { indirectOf } from './objects';
import { roVerb } from './romanian';
import type { Rich } from './segments';

export type MemberKind = 'with-noun' | 'short-form' | 'with-clitic';

/** The kind of a member, derived in the order of spec 4.6: a spelled-out noun wins, then a short form, then a pronoun. */
export function memberKind(m: GroupMember): MemberKind {
  if (m.object) return 'with-noun';
  if (m.verb.slot.shortForm) return 'short-form';
  if ((m.verb.slot.clitics ?? []).length > 0) return 'with-clitic';
  throw new Error('a bare verb is not a member');
}

export interface MemberText {
  el: Rich;
  ro: string;
  en: string;
  /** The stress rule or the short form, in a sentence (Improver). */
  irregular?: string;
}

/** The three texts of a member, generated from its slot and its object (spec 4.6). */
export function memberText(m: GroupMember): MemberText {
  const verb = getVerb(m.verb.lexeme);
  const composed = compose(verb, m.verb.slot);
  const object = m.object ? nounPhrase(getNoun(m.object.noun), m.object.number, m.object.case, { article: 'definite' }) : null;
  const space: Rich = [{ text: ' ', role: 'plain' }];
  return {
    el: object ? [...composedRich(composed), ...space, ...object.el] : composedRich(composed),
    ro: [roVerb(verb, m.verb.slot), object?.ro].filter(Boolean).join(' '),
    en: [enVerbText(verb, m.verb.slot, ''), object?.en].filter(Boolean).join(' '),
    irregular: composed.irregular?.plain,
  };
}

/** The identity of a command for matching: everything but the object noun. */
const slotKey = (s: SlotOf<'verb'>): string =>
  JSON.stringify([
    s.mood, s.tense, s.person, s.number, s.voice, s.polarity ?? 'affirmative',
    (s.clitics ?? []).map((c) => [c.role, c.person, c.number, c.gender ?? null, c.roGender ?? null]),
    s.shortForm ?? false,
  ]);

/** The same command apart from the pronouns and the short form. */
const familyKey = (s: SlotOf<'verb'>): string =>
  JSON.stringify([s.mood, s.tense, s.person, s.number, s.voice, s.polarity ?? 'affirmative']);

export interface GroupMatch {
  group: FormGroup;
  /** The member in use (its index), the close-but-not-the-same row, or null when the panel is in the family but on no member. */
  current: number | 'close' | null;
}

/**
 * The group a command panel belongs to (spec 5.4): the one with a member of the same verb, mood, tense, person and
 * polarity. `noun` is the object noun the panel holds, or null.
 */
export function groupFor(lexemeId: string, slot: SlotOf<'verb'>, noun: string | null): GroupMatch | null {
  if (slot.mood !== 'imperative') return null;
  // The groups are about "me" (Give me the bread!): another recipient is not in one.
  const to = indirectOf(slot);
  if (to && !(to.person === 1 && to.number === 'sg')) return null;
  for (const group of FORM_GROUPS) {
    const family = group.members.some((m) => m.verb.lexeme === lexemeId && familyKey(m.verb.slot) === familyKey(slot));
    if (!family) continue;
    const index = group.members.findIndex(
      (m) =>
        m.verb.lexeme === lexemeId &&
        slotKey(m.verb.slot) === slotKey(slot) &&
        (m.object ? m.object.noun === noun : true),
    );
    if (index >= 0) return { group, current: index };
    const close = group.closeNotSame;
    if (close && close.verb.lexeme === lexemeId && slotKey(close.verb.slot) === slotKey(slot) && noun === null) {
      return { group, current: 'close' };
    }
    return { group, current: null };
  }
  return null;
}
