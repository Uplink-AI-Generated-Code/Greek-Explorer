import { DEF_ARTICLE } from '../data/lexemes';
import { RO_ARTICLE_SUFFIX } from '../data/paradigms';
import { nounPhrase } from '../engine/agree';
import { inflectArticle } from '../engine/greek';
import { articleRich, plain } from '../engine/segments';
import type { GreekNoun, Level, SlotOf } from '../types';
import {
  CASES,
  GENDERS,
  GENDER_ROW,
  caseControl,
  caseName,
  nounControl,
  nounOf,
  npRow,
  numberControl,
} from './shared';
import type { Panel, PanelRow, PanelState } from './types';

function articleFull(slot: SlotOf<'article'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => {
      const suffix = RO_ARTICLE_SUFFIX[slot.number][g];
      return {
        label: `${GENDER_ROW[g]} ${caseName(c)}`,
        el: articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: g, number: slot.number, case: c })),
        ro: plain(c === 'gen' ? suffix.genitive : suffix.direct),
        en: plain(c === 'gen' ? 'of the' : 'the'),
        hl: {
          el: g === noun.gender && c === slot.case,
          ro: g === noun.ro.gender && c === slot.case,
          en: c === slot.case,
        },
      };
    }),
  );
}

export function articlePanel(slot: SlotOf<'article'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [nounControl('Noun it goes with', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    full: level === 'improver' ? articleFull(slot, noun) : [],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    irregular: '',
    note: noun.note,
  };
}
