import { LEXEMES, PREPOSITIONS, getLexeme } from '../data/lexemes';
import { nounPhrase } from '../engine/agree';
import { inflectNoun } from '../engine/greek';
import { numberOptions, type Option } from '../engine/labels';
import { fusedForm, senseOf } from '../engine/preposition';
import { roNoun } from '../engine/romanian';
import { formRich, formText, plain } from '../engine/segments';
import type { GreekAdverb, GreekInterrogative, GreekNoun, GreekPreposition, Level, Num, PrepSense } from '../types';
import { ALL, GENDERS, GENDER_ROW, NUMS, nounOf, nounOptions } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** What follows a preposition: a noun, a question word (από πού) or a place word (μέχρι εκεί). */
type After = { kind: 'noun'; noun: GreekNoun } | { kind: 'question'; word: GreekInterrogative | GreekAdverb };

function afterOf(state: PanelState): After {
  const lexeme = state.noun ? getLexeme(state.noun) : undefined;
  if (lexeme?.pos === 'interrogative' || lexeme?.pos === 'adverb') return { kind: 'question', word: lexeme };
  return { kind: 'noun', noun: nounOf(state) };
}

/** The nouns, then the question words and the place words, for the "after it" control. */
function afterOptions(prep: GreekPreposition): Option[] {
  if (prep.fused) return nounOptions();
  const words = Object.values(LEXEMES).flatMap((l) =>
    l.pos === 'interrogative' || l.pos === 'adverb' ? [{ value: l.id, label: `${l.lemma} (${l.en})` }] : [],
  );
  return [...nounOptions(), ...words];
}

/**
 * One preposition followed by the definite noun phrase in the accusative, in three languages. A preposition that
 * fuses with the article (σε) is written as one word (στον σκύλο); one with meanings uses the word of the chosen
 * meaning, and for a person Romanian uses the dative and no preposition (copilului).
 */
export function prepositionRow(
  prep: GreekPreposition,
  noun: GreekNoun,
  number: Num,
  label: string,
  sense?: PrepSense,
): PanelRow {
  const np = nounPhrase(noun, number, 'acc', { article: 'definite' });
  const nounForm = inflectNoun(noun, { pos: 'noun', number, case: 'acc' });
  const fused = fusedForm(prep, noun, number, formText(nounForm));
  const meaning = senseOf(prep, sense);
  const space = { text: ' ', role: 'plain' as const };
  return {
    label,
    el: fused
      ? [{ text: fused, role: 'article' }, space, ...formRich(nounForm)]
      : [{ text: prep.lemma, role: 'plain' }, space, ...np.el],
    ro: plain(meaning?.dative ? roNoun(noun, number, 'gen', 'definite') : `${meaning?.ro ?? prep.ro} ${np.ro}`),
    en: plain(`${meaning?.en ?? prep.en} ${np.en}`),
  };
}

/** The six forms σε takes with the article, for the Improver table; the one the noun needs is outlined. */
function fusedTable(prep: GreekPreposition, noun: GreekNoun, number: Num, sense?: PrepSense): PanelRow[] {
  const meaning = senseOf(prep, sense);
  return GENDERS.flatMap((gender) =>
    NUMS.map((n): PanelRow => ({
      label: `${GENDER_ROW[gender]} ${n === 'sg' ? 'singular' : 'plural'}`,
      el: [{ text: prep.fused?.[gender][n] ?? '', role: 'article' }],
      ro: plain(meaning?.dative ? 'dative' : (meaning?.ro ?? prep.ro)),
      en: plain(`${meaning?.en ?? prep.en} the`),
      hl: { el: gender === noun.gender && n === number },
    })),
  );
}

/** One preposition followed by a question word or a place word. Romanian fuses some pairs into one word (de unde, până când, de aici). */
export function questionRow(prep: GreekPreposition, word: GreekInterrogative | GreekAdverb, label: string): PanelRow {
  return {
    label,
    el: plain(`${prep.lemma} ${word.lemma}`),
    ro: plain(word.roAfter?.[prep.id] ?? `${prep.ro} ${word.ro}`),
    en: plain(`${prep.en} ${word.en}`),
  };
}

export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
  const after = afterOf(state);
  const sense = state.slot.pos === 'preposition' ? state.slot.sense : undefined;
  const meaning = senseOf(prep, sense);
  const controls: Control[] = [
    {
      key: 'noun',
      label: prep.fused ? 'Noun after it' : 'Noun, question word or place word after it',
      options: afterOptions(prep),
      value: state.noun ?? '',
    },
  ];
  if (after.kind === 'noun') {
    controls.push({ key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber });
  }
  if (prep.senses && meaning) {
    controls.push({
      key: 'sense',
      label: 'Meaning',
      options: prep.senses.map((s) => ({ value: s.value, label: s.label })),
      value: meaning.value,
    });
  }
  const example: PanelRow[] = meaning
    ? [{ label: 'example', el: plain(meaning.example.el), ro: plain(meaning.example.ro), en: plain(meaning.example.en) }]
    : [];
  return {
    lemma: prep.lemma,
    posLabel: level === 'beginner' ? `preposition: ${meaning?.en ?? prep.en}` : 'preposition · governs the accusative',
    controls,
    rows: [
      after.kind === 'noun'
        ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun', sense)
        : questionRow(prep, after.word, after.word.pos === 'adverb' ? 'prep. + place word' : 'prep. + question word'),
      ...example,
    ],
    full:
      level !== 'improver'
        ? []
        : prep.fused && after.kind === 'noun'
          ? fusedTable(prep, after.noun, state.nounNumber, sense)
          : PREPOSITIONS.filter((p) => after.kind === 'noun' || !p.fused).map((p) => ({
              ...(after.kind === 'noun'
                ? prepositionRow(p, after.noun, state.nounNumber, p.meaning, p === prep ? sense : undefined)
                : questionRow(p, after.word, p.meaning)),
              hl: p.id === prep.id ? ALL : undefined,
            })),
    plain:
      after.kind === 'noun'
        ? prep.fused
          ? 'σε is followed by the accusative and is written as one word with the article: σε + τον = στον. The feminine στην loses its ν before most consonants (στη θάλασσα). Romanian and English keep the preposition and the article apart. Where English and Romanian choose between to, at, in and on (la, în, pe), Greek uses σε for all of them.'
          : 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
        : after.word.pos === 'adverb'
          ? 'A place word follows a preposition as a noun would: μέχρι εκεί, "as far as there". Greek and English build it from two words; Romanian sometimes has one fused word (de aici) and sometimes two (până acolo).'
          : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
    irregular: '',
    note: after.kind === 'noun' ? after.noun.note : '',
  };
}
