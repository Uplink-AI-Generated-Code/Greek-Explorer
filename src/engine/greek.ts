import {
  ADJ_STRESSED,
  ARTICLE_DEF,
  NOUN_CLASSES,
  NUMERAL_ONE,
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
  Slot,
  SlotOf,
} from '../types';

export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
  return { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
}
