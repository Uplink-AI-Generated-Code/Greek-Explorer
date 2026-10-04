import { getLexeme, getVerb } from '../data/lexemes';
import type {
  Case,
  Gender,
  GreekAdjective,
  GreekConjunction,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
  GreekPreposition,
  GreekQuantifier,
  GreekVerb,
  Level,
  Num,
  NumeralValue,
  Person,
  Phrase,
  QuantifierDegree,
  Token,
} from '../types';
import { adjectivePanel } from './adjective';
import { articlePanel } from './article';
import { nounPanel } from './noun';
import { numeralPanel } from './numeral';
import { prepositionPanel } from './preposition';
import { cliticPanel, withWho } from './clitic';
import { conjunctionPanel } from './conjunction';
import { quantifierPanel } from './quantifier';
import type { Panel, PanelState } from './types';
import { particlePanel } from './particle';
import { changeVerbSlot, verbPanel } from './verb';

export type { Control, Panel, PanelRow, PanelState, Related } from './types';

/** The state a word's panel starts in: the token's own slot and the noun it goes with in the phrase. */
export function initialState(token: Token, phrase: Phrase): PanelState {
  const nounToken = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
  return {
    slot: token.slot,
    noun: nounToken ? nounToken.lexeme : null,
    nounNumber: nounToken && nounToken.slot.pos === 'noun' ? nounToken.slot.number : 'sg',
  };
}

export const sameState = (a: PanelState, b: PanelState): boolean => JSON.stringify(a) === JSON.stringify(b);

export function buildPanel(state: PanelState, token: Token, level: Level): Panel {
  const lexeme = getLexeme(token.lexeme);
  const slot = state.slot;
  if (lexeme.pos !== slot.pos) throw new Error(`slot ${slot.pos} does not fit lexeme ${lexeme.id}`);
  switch (slot.pos) {
    case 'verb':
      return verbPanel(lexeme as GreekVerb, slot, level);
    case 'noun':
      return nounPanel(lexeme as GreekNoun, slot, level);
    case 'adjective':
      return adjectivePanel(lexeme as GreekAdjective, slot, state, level);
    case 'numeral':
      return numeralPanel(lexeme as GreekNumeral, slot, state, level);
    case 'article':
      return articlePanel(slot, state, level);
    case 'preposition':
      return prepositionPanel(lexeme as GreekPreposition, state, level);
    case 'particle':
      return particlePanel(lexeme as GreekParticle, level);
    case 'clitic':
      return cliticPanel(slot, level);
    case 'conjunction':
      return conjunctionPanel(lexeme as GreekConjunction, level);
    case 'quantifier':
      return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
  }
}

/** Returns a new state with one control applied; a control that does not apply returns the same state. */
export function applyControl(state: PanelState, key: string, value: string, lexemeId?: string): PanelState {
  const { slot } = state;
  switch (key) {
    case 'mood':
    case 'tense':
    case 'voice':
    case 'polarity':
      if (slot.pos === 'verb') {
        if (!lexemeId) throw new Error(`the ${key} control needs the lexeme`);
        return { ...state, slot: changeVerbSlot(getVerb(lexemeId), slot, key, value) };
      }
      break;
    case 'who':
      if (slot.pos === 'verb') {
        return { ...state, slot: { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num } };
      }
      if (slot.pos === 'clitic') return { ...state, slot: withWho(slot, value) };
      break;
    case 'gender':
      if (slot.pos === 'clitic') return { ...state, slot: { ...slot, gender: value as Gender } };
      break;
    case 'role':
      if (slot.pos === 'clitic') return { ...state, slot: { ...slot, role: value as 'object' | 'indirect' } };
      break;
    case 'case':
      if (slot.pos !== 'verb' && slot.pos !== 'preposition' && slot.pos !== 'particle' && slot.pos !== 'conjunction' && slot.pos !== 'clitic') {
        return { ...state, slot: { ...slot, case: value as Case } };
      }
      break;
    case 'number':
      if (slot.pos === 'adjective' || slot.pos === 'article') {
        return { ...state, slot: { ...slot, number: value as Num } };
      }
      if (slot.pos === 'preposition') return { ...state, nounNumber: value as Num };
      break;
    case 'count':
      if (slot.pos === 'noun') {
        if (value === '1') return { ...state, slot: { pos: 'noun', number: 'sg', case: slot.case } };
        if (value === 'many') return { ...state, slot: { pos: 'noun', number: 'pl', case: slot.case } };
        return {
          ...state,
          slot: { pos: 'noun', number: 'pl', case: slot.case, count: Number(value) as Exclude<NumeralValue, 1> },
        };
      }
      break;
    case 'value':
      if (slot.pos === 'numeral') return { ...state, slot: { ...slot, value: Number(value) as NumeralValue } };
      break;
    case 'kind':
      if (slot.pos === 'quantifier') return { ...state, slot: { ...slot, number: value === 'mass' ? 'sg' : 'pl' } };
      break;
    case 'degree':
      if (slot.pos === 'quantifier') return { ...state, slot: { ...slot, degree: value as QuantifierDegree } };
      break;
    case 'sense':
      if (slot.pos === 'quantifier') {
        const next = { ...slot };
        if (value === 'few') next.sense = 'few';
        else delete next.sense;
        return { ...state, slot: next };
      }
      break;
    case 'noun': {
      const noun = getLexeme(value);
      if (noun.pos !== 'noun') break;
      if (slot.pos === 'preposition') return { ...state, noun: value };
      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral' || slot.pos === 'quantifier') {
        return { ...state, noun: value, slot: { ...slot, gender: noun.gender } };
      }
      break;
    }
  }
  return state;
}
