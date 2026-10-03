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
