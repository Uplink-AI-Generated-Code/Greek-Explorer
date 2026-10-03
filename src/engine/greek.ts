import {
  ADJ_STRESSED,
  ADJ_UNSTRESSED,
  ARTICLE_DEF,
  NOUN_CLASSES,
  NOUN_NOTES,
  NUMERAL_FORMS,
  VERB_OMEGA_PRESENT,
} from '../data/paradigms';
import type {
  Form,
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
  IrregularNote,
  Slot,
  SlotOf,
} from '../types';

export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
  const form: Form = { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
  const note = NOUN_NOTES[l.class]?.[`${s.number}-${s.case}` as const];
  return note ? { ...form, irregular: note } : form;
}

const INDECLINABLE: IrregularNote = {
  rule: 'indeclinable',
  plain: 'This adjective never changes, whatever the noun, number or role.',
};

export function inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form {
  if (l.class === 'adj-indeclinable') return { stem: l.stem, ending: '', irregular: INDECLINABLE };
  const table = l.class === 'adj-stressed' ? ADJ_STRESSED : ADJ_UNSTRESSED;
  return { stem: l.stem, ending: table[s.number][s.case][s.gender] };
}

export function inflectArticle(_l: GreekArticle, s: SlotOf<'article'>): Form {
  return { stem: ARTICLE_DEF[s.gender][s.number][s.case], ending: '' };
}

export function inflectNumeral(_l: GreekNumeral, s: SlotOf<'numeral'>): Form {
  const [stem, ending] = NUMERAL_FORMS[s.value][s.gender][s.case];
  return { stem, ending };
}

export function inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form {
  const index = s.person - 1 + (s.number === 'pl' ? 3 : 0);
  return { stem: l.stems.present, ending: VERB_OMEGA_PRESENT[index] };
}

export function inflect(l: GreekLexeme, s: Slot): Form {
  if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
  switch (l.pos) {
    case 'noun':
      return inflectNoun(l, s as SlotOf<'noun'>);
    case 'adjective':
      return inflectAdjective(l, s as SlotOf<'adjective'>);
    case 'article':
      return inflectArticle(l, s as SlotOf<'article'>);
    case 'numeral':
      return inflectNumeral(l, s as SlotOf<'numeral'>);
    case 'verb':
      return inflectVerb(l, s as SlotOf<'verb'>);
  }
}
