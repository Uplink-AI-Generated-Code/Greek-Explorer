import { nounPhrase } from '../engine/agree';
import { inflectNoun } from '../engine/greek';
import { GENDER_NAME, type Option } from '../engine/labels';
import type { GreekNoun, Level, SlotOf } from '../types';
import { caseControl, noPluralArticleRow, npRow } from './shared';
import type { Panel } from './types';

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
    full: [],
    plain: 'The article agrees with the noun in gender, number and role.',
    irregular: inflectNoun(noun, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
