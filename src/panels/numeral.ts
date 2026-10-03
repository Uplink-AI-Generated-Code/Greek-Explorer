import { nounPhrase } from '../engine/agree';
import { enNumeral } from '../engine/english';
import { inflectNumeral } from '../engine/greek';
import { roNumeral } from '../engine/romanian';
import { numeralRich, plain, richText } from '../engine/segments';
import type { GreekNumeral, Level, NumeralValue, SlotOf } from '../types';
import { GENDERS, caseControl, nounControl, nounOf, npRow } from './shared';
import type { Panel, PanelState } from './types';

const VALUES: NumeralValue[] = [1, 2, 3, 4, 5];

function irregularText(value: NumeralValue): string {
  if (value === 1) return 'One declines like a noun and also changes with gender.';
  if (value === 3 || value === 4) return 'Only the neuter differs (τρία, τέσσερα), and the genitive is τριών / τεσσάρων.';
  return 'Does not change at all.';
}

export function numeralPanel(numeral: GreekNumeral, slot: SlotOf<'numeral'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const forms = GENDERS.map((gender) =>
    richText(numeralRich(inflectNumeral(numeral, { pos: 'numeral', value: slot.value, gender, case: 'nom' }))),
  );
  const form = inflectNumeral(numeral, { pos: 'numeral', value: slot.value, gender: noun.gender, case: slot.case });
  const counting =
    slot.value === 1
      ? nounPhrase(noun, 'sg', slot.case, { article: 'one' })
      : nounPhrase(noun, 'pl', slot.case, { count: slot.value });
  const word = enNumeral(numeral, slot.value);
  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel:
      slot.value === 1
        ? level === 'beginner'
          ? 'article: a / an'
          : 'numeral · doubles as the indefinite article'
        : level === 'beginner'
          ? `number: ${word}`
          : `numeral · ${slot.value === 2 || slot.value === 5 ? 'invariable' : 'agrees in gender and case'}`,
    controls: [
      {
        key: 'value',
        label: 'Number',
        options: VALUES.map((v) => ({ value: String(v), label: `${v} (${enNumeral(numeral, v)})` })),
        value: String(slot.value),
      },
      nounControl('Noun it counts', state),
      caseControl(slot, level),
    ],
    rows: [
      {
        label: 'number',
        el: numeralRich(form),
        ro: plain(roNumeral(numeral, slot.value, noun.ro.gender, slot.case)),
        en: plain(slot.value === 1 ? 'a / an (one)' : word),
      },
      npRow('counting', counting),
    ],
    full: [],
    plain:
      'The numeral agrees with the noun it counts; the noun is plural for 2 and up. Romanian changes 1 and 2 by gender; English never changes.',
    irregular: irregularText(slot.value),
    note: noun.note,
  };
}
