import { LEXEMES, PREPOSITIONS, getLexeme } from '../data/lexemes';
import { nounPhrase } from '../engine/agree';
import { numberOptions, type Option } from '../engine/labels';
import { plain } from '../engine/segments';
import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num } from '../types';
import { ALL, nounOf, nounOptions } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** What follows a preposition: a noun, or a question word (από πού). */
type After = { kind: 'noun'; noun: GreekNoun } | { kind: 'question'; word: GreekInterrogative };

function afterOf(state: PanelState): After {
  const lexeme = state.noun ? getLexeme(state.noun) : undefined;
  if (lexeme?.pos === 'interrogative') return { kind: 'question', word: lexeme };
  return { kind: 'noun', noun: nounOf(state) };
}

/** The nouns, then the question words, for the "after it" control. */
function afterOptions(): Option[] {
  const words = Object.values(LEXEMES).flatMap((l) =>
    l.pos === 'interrogative' ? [{ value: l.id, label: `${l.lemma} (${l.en})` }] : [],
  );
  return [...nounOptions(), ...words];
}

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

/** One preposition followed by a question word. Romanian fuses some pairs into one word (de unde, până când). */
export function questionRow(prep: GreekPreposition, word: GreekInterrogative, label: string): PanelRow {
  return {
    label,
    el: plain(`${prep.lemma} ${word.lemma}`),
    ro: plain(word.roAfter?.[prep.id] ?? `${prep.ro} ${word.ro}`),
    en: plain(`${prep.en} ${word.en}`),
  };
}

export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
  const after = afterOf(state);
  const controls: Control[] = [
    { key: 'noun', label: 'Noun or question word after it', options: afterOptions(), value: state.noun ?? '' },
  ];
  if (after.kind === 'noun') {
    controls.push({ key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber });
  }
  return {
    lemma: prep.lemma,
    posLabel: level === 'beginner' ? `preposition: ${prep.en}` : 'preposition · governs the accusative',
    controls,
    rows: [
      after.kind === 'noun'
        ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun')
        : questionRow(prep, after.word, 'prep. + question word'),
    ],
    full:
      level === 'improver'
        ? PREPOSITIONS.map((p) => ({
            ...(after.kind === 'noun'
              ? prepositionRow(p, after.noun, state.nounNumber, p.meaning)
              : questionRow(p, after.word, p.meaning)),
            hl: p.id === prep.id ? ALL : undefined,
          }))
        : [],
    plain:
      after.kind === 'noun'
        ? 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
        : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
    irregular: '',
    note: after.kind === 'noun' ? after.noun.note : '',
  };
}
