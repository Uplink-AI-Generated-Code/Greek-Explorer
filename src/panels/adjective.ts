import { nounPhrase } from '../engine/agree';
import { inflectAdjective } from '../engine/greek';
import { roAdjective } from '../engine/romanian';
import { formRich, plain, richText } from '../engine/segments';
import type { AdjectiveClass, GreekAdjective, GreekNoun, Level, SlotOf } from '../types';
import {
  CASES,
  GENDERS,
  GENDER_ROW,
  caseControl,
  caseName,
  noPluralArticleRow,
  nounControl,
  nounOf,
  npRow,
  numberControl,
} from './shared';
import type { Panel, PanelRow, PanelState } from './types';

const CLASS_LABEL: Record<AdjectiveClass, string> = {
  'adj-stressed': 'adjective · 3-ending (stressed)',
  'adj-unstressed': 'adjective · 3-ending (stem-stressed)',
  'adj-indeclinable': 'adjective · indeclinable',
};

function adjectiveFull(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => ({
      label: `${GENDER_ROW[g]} ${caseName(c)}`,
      el: formRich(inflectAdjective(adj, { pos: 'adjective', gender: g, number: slot.number, case: c })),
      ro: plain(roAdjective(adj, g, slot.number, c)),
      en: plain(adj.en),
      hl: { el: g === noun.gender && c === slot.case, ro: g === noun.ro.gender && c === slot.case, en: false },
    })),
  );
}

export function adjectivePanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const forms = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  );
  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel: level === 'beginner' ? `adjective: ${adj.en}` : CLASS_LABEL[adj.class],
    controls: [nounControl('Noun it describes', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [
      npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite', adjective: adj })),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one', adjective: adj }))
        : noPluralArticleRow(),
    ],
    full: level === 'improver' ? adjectiveFull(adj, slot, noun) : [],
    plain:
      'The Greek adjective copies gender, number and role from the noun. Romanian copies gender and number and goes after the noun. English never changes.',
    irregular: inflectAdjective(adj, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
