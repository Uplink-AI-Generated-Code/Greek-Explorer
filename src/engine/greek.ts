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

export function inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form {
  return { stem: l.stem, ending: ADJ_STRESSED[s.number][s.case][s.gender] };
}

export function inflectArticle(_l: GreekArticle, s: SlotOf<'article'>): Form {
  return { stem: ARTICLE_DEF[s.gender][s.number][s.case], ending: '' };
}

export function inflectNumeral(_l: GreekNumeral, s: SlotOf<'numeral'>): Form {
  const [stem, ending] = NUMERAL_ONE[s.gender][s.case];
  return { stem, ending };
}
