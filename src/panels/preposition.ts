import { PREPOSITIONS } from '../data/lexemes';
import { nounPhrase } from '../engine/agree';
import { numberOptions } from '../engine/labels';
import { plain } from '../engine/segments';
import type { GreekNoun, GreekPreposition, Level, Num } from '../types';
import { ALL, nounControl, nounOf } from './shared';
import type { Panel, PanelRow, PanelState } from './types';

/** One preposition followed by the definite noun phrase in the accusative, in three languages. */
export function prepositionRow(prep: GreekPreposition, noun: GreekNoun, number: Num, label: string): PanelRow {
  const np = nounPhrase(noun, number, 'acc', { article: 'definite' });
  return {
    label,
    el: [{ text: prep.lemma, role: 'plain' }, { text: ' ', role: 'plain' }, ...np.el],
    ro: plain(`${prep.ro} ${np.ro}`),
    en: plain(`${prep.en} ${np.en}`),
  };
}

export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: prep.lemma,
    posLabel: level === 'beginner' ? `preposition: ${prep.en}` : 'preposition · governs the accusative',
    controls: [
      nounControl('Noun after it', state),
      { key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber },
    ],
    rows: [prepositionRow(prep, noun, state.nounNumber, 'prep. + noun')],
    full:
      level === 'improver'
        ? PREPOSITIONS.map((p) => ({
            ...prepositionRow(p, noun, state.nounNumber, p.meaning),
            hl: p.id === prep.id ? ALL : undefined,
          }))
        : [],
    plain:
      'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.',
    irregular: '',
    note: noun.note,
  };
}
