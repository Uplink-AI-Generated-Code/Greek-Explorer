import { nounPhrase } from '../engine/agree';
import { inflectNoun } from '../engine/greek';
import { GENDER_NAME, type Option } from '../engine/labels';
import { plain, richText } from '../engine/segments';
import type { GreekNoun, Level, SlotOf } from '../types';
import { ALL, CASES, NUMS, caseControl, caseName, noPluralArticleRow, npRow } from './shared';
import type { Panel, PanelRow } from './types';

export const countOptions: Option[] = [
  { value: '1', label: 'one' },
  { value: '2', label: 'two' },
  { value: '3', label: 'three' },
  { value: '4', label: 'four' },
  { value: '5', label: 'five' },
  { value: 'many', label: 'many' },
];

export const countValue = (slot: SlotOf<'noun'>): string =>
  slot.number === 'sg' ? '1' : slot.count ? String(slot.count) : 'many';

function nounFull(noun: GreekNoun, slot: SlotOf<'noun'>): PanelRow[] {
  const rows: PanelRow[] = [];
  for (const c of CASES) {
    for (const n of NUMS) {
      const def = nounPhrase(noun, n, c, { article: 'definite' });
      const one = n === 'sg' ? nounPhrase(noun, 'sg', c, { article: 'one' }) : null;
      const none = 'no plural a / an';
      rows.push({
        label: `${caseName(c)} ${n}`,
        el: [...def.el, { text: ' ', role: 'plain' }, { text: one ? richText(one.el) : none, role: 'sub' }],
        ro: [...plain(def.ro), { text: ' ', role: 'plain' }, { text: one ? one.ro : none, role: 'sub' }],
        en: [...plain(def.en), { text: ' ', role: 'plain' }, { text: one ? one.en : none, role: 'sub' }],
        hl: n === slot.number && c === slot.case ? ALL : undefined,
      });
    }
  }
  return rows;
}

export function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level): Panel {
  const second =
    slot.number === 'sg'
      ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one' }))
      : slot.count
        ? npRow('with a number', nounPhrase(noun, 'pl', slot.case, { count: slot.count }))
        : noPluralArticleRow();
  return {
    lemma: noun.lemma,
    posLabel:
      level === 'beginner'
        ? `noun: ${noun.en.sg} (${GENDER_NAME[noun.gender]})`
        : `noun · ${GENDER_NAME[noun.gender]} · Romanian: ${noun.ro.lemma} (${GENDER_NAME[noun.ro.gender]})`,
    controls: [
      { key: 'count', label: 'How many?', options: countOptions, value: countValue(slot) },
      caseControl(slot, level),
    ],
    rows: [npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite' })), second],
    full: level === 'improver' ? nounFull(noun, slot) : [],
    plain: 'The article agrees with the noun in gender, number and role.',
    irregular: inflectNoun(noun, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
