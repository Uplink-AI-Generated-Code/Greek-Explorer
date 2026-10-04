import { groupFor, memberKind, memberText } from '../engine/groups';
import { notice, plain } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import type { SameMeaning, SameMeaningRow } from './types';

const TAG = { 'with-noun': 'with noun', 'with-clitic': 'with clitic', 'short-form': 'short form' } as const;

/**
 * The Same-meaning strip for a command (spec 5.4), or undefined when the command belongs to no group.
 * Beginner shows the member with a noun and the member with a pronoun; Improver adds the short forms and the stress
 * and order notes. The short form has no Romanian or English counterpart, so those cells read "none".
 */
export function sameMeaningFor(
  lexemeId: string,
  slot: SlotOf<'verb'>,
  noun: string | null,
  level: Level,
): SameMeaning | undefined {
  const match = groupFor(lexemeId, slot, noun);
  if (!match) return undefined;
  const { group } = match;
  const rows: SameMeaningRow[] = [];
  const notes: string[] = [];
  let orderNote = false;
  group.members.forEach((member, i) => {
    const kind = memberKind(member);
    if (level === 'beginner' && kind === 'short-form') return;
    const text = memberText(member);
    const short = kind === 'short-form';
    rows.push({
      key: String(i),
      tag: TAG[kind],
      el: text.el,
      ro: short ? notice('none') : plain(text.ro),
      en: short ? notice('none') : plain(text.en),
      current: match.current === i,
      note: member.note,
    });
    if (level === 'improver') {
      if (text.irregular) notes.push(`${TAG[kind]}: ${text.irregular}`);
      if (!orderNote && kind !== 'with-noun' && (member.verb.slot.clitics ?? []).length === 2) {
        orderNote = true;
        notes.push('Two pronouns: the genitive comes before the accusative.');
      }
    }
  });
  const close = group.closeNotSame;
  const closeText = close && memberText({ verb: close.verb });
  return {
    meaning: group.meaning,
    rows,
    close:
      close && closeText
        ? {
            key: 'close',
            el: closeText.el,
            ro: plain(closeText.ro),
            en: plain(closeText.en),
            reason: close.reason,
            current: match.current === 'close',
          }
        : undefined,
    notes,
  };
}
