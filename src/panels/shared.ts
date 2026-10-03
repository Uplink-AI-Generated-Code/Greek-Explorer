import { LEXEMES, getLexeme } from '../data/lexemes';
import type { NounPhrase } from '../engine/agree';
import { GENDER_NAME, caseOptions, numberOptions, type Option } from '../engine/labels';
import { dim, plain } from '../engine/segments';
import type { Case, Gender, GreekNoun, Level, Num } from '../types';
import type { Control, PanelRow, PanelState } from './types';

export const GENDERS: Gender[] = ['m', 'f', 'n'];
export const CASES: Case[] = ['nom', 'acc', 'gen'];
export const NUMS: Num[] = ['sg', 'pl'];

export const npRow = (label: string, np: NounPhrase): PanelRow => ({
  label,
  el: np.el,
  ro: plain(np.ro),
  en: plain(np.en),
});

export const noPluralArticleRow = (): PanelRow => ({
  label: 'a / an',
  el: dim('none in plural'),
  ro: dim('none in plural'),
  en: dim('none in plural'),
});

export const caseControl = (slot: { case: Case }, level: Level): Control => ({
  key: 'case',
  label: 'Role in sentence',
  options: caseOptions(level),
  value: slot.case,
});

export const numberControl = (value: Num): Control => ({
  key: 'number',
  label: 'How many?',
  options: numberOptions,
  value,
});

export function nounOptions(): Option[] {
  return Object.values(LEXEMES).flatMap((l) =>
    l.pos === 'noun' ? [{ value: l.id, label: `${l.lemma} (${GENDER_NAME[l.gender]})` }] : [],
  );
}

export const nounControl = (label: string, state: PanelState): Control => ({
  key: 'noun',
  label,
  options: nounOptions(),
  value: state.noun ?? '',
});

/** The noun an article, numeral, adjective or preposition goes with. */
export function nounOf(state: PanelState): GreekNoun {
  if (!state.noun) throw new Error('this word needs a noun to go with');
  const lexeme = getLexeme(state.noun);
  if (lexeme.pos !== 'noun') throw new Error(`lexeme ${state.noun} is not a noun`);
  return lexeme;
}
