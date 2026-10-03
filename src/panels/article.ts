import { nounPhrase } from '../engine/agree';
import type { Level, SlotOf } from '../types';
import { caseControl, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Panel, PanelState } from './types';

export function articlePanel(slot: SlotOf<'article'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [nounControl('Noun it goes with', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    full: [],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    irregular: '',
    note: noun.note,
  };
}
