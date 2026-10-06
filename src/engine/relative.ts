import { getLexeme } from '../data/lexemes';
import { OPOIOS_ENDINGS, OPOIOS_STEM } from '../data/relatives';
import { ARTICLE_DEF } from '../data/paradigms';
import type { Case, Form, GreekPreposition, GreekRelative, RelativeRole, SlotOf } from '../types';

type RelativeSlot = SlotOf<'relative'>;

/** The case of the pronoun in its own clause: the subject is nominative, whose genitive, the rest accusative. */
export const relativeCase = (role: RelativeRole): Case => (role === 'subject' ? 'nom' : role === 'whose' ? 'gen' : 'acc');

/** The preposition before ο οποίος: σε for "to whom", the chosen one after a preposition; none for the other roles. */
export function relativePreposition(slot: RelativeSlot): GreekPreposition | undefined {
  const id = slot.role === 'indirect' ? 'se' : slot.role === 'preposition' ? slot.preposition : undefined;
  if (slot.role === 'preposition' && !id) throw new Error('a relative pronoun after a preposition needs the preposition');
  if (!id) return undefined;
  const prep = getLexeme(id);
  if (prep.pos !== 'preposition') throw new Error(`${id} is not a preposition`);
  return prep;
}

/** The word οποίος in the form its role needs: οποίος, οποίο, οποίου. */
export const opoiosWord = (slot: RelativeSlot): string => OPOIOS_STEM + OPOIOS_ENDINGS[slot.number][relativeCase(slot.role)][slot.gender];

/** The parts of the chip: an optional preposition (στον, with the article inside), the article, the word. */
export function opoiosParts(slot: RelativeSlot): { preposition?: string; article?: string; word: string } {
  const prep = relativePreposition(slot);
  const article = ARTICLE_DEF[slot.gender][slot.number][relativeCase(slot.role)];
  const word = opoiosWord(slot);
  if (!prep) return { article, word };
  // σε is written as one word with the article (στον οποίο); the other prepositions stand apart (με τον οποίο).
  return prep.fused ? { preposition: prep.fused[slot.gender][slot.number], word } : { preposition: prep.lemma, article, word };
}

/** The whole chip of ο οποίος: ο οποίος, τον οποίο, στον οποίο, του οποίου, με τον οποίο. */
export function greekOpoios(slot: RelativeSlot): string {
  const { preposition, article, word } = opoiosParts(slot);
  return [preposition, article, word].filter(Boolean).join(' ');
}

/** The text of a relative token: που, or the chip of ο οποίος. */
export function inflectRelative(l: GreekRelative, s: RelativeSlot): Form {
  return { stem: l.kind === 'pou' ? 'που' : greekOpoios(s), ending: '' };
}
