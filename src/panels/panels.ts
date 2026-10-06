import { getLexeme, getNoun, getVerb } from '../data/lexemes';
import { groupFor } from '../engine/groups';
import { POSSESSORS } from '../engine/possessive';
import { RELATIVE_PREPOSITIONS } from '../data/relatives';
import { DEFAULT_OBJECT, RECIPIENTS, cliticsFor, indirectOf, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';
import { voiceOf } from '../engine/offers';
import type {
  Case,
  Gender,
  GreekAdjective,
  GreekAdverb,
  GreekRelative,
  GreekConjunction,
  GreekInterrogative,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
  GreekPossessive,
  GreekPreposition,
  GreekQuantifier,
  GreekVerb,
  Level,
  Num,
  NumeralValue,
  Person,
  Phrase,
  PrepSense,
  RelativeRole,
  QuantifierDegree,
  SlotOf,
  Token,
} from '../types';
import { adjectivePanel } from './adjective';
import { dikosPanel } from './dikos';
import { articlePanel } from './article';
import { nounPanel } from './noun';
import { numeralPanel } from './numeral';
import { prepositionPanel } from './preposition';
import { governsWord } from '../engine/preposition';
import { cliticPanel, withWho } from './clitic';
import { conjunctionPanel } from './conjunction';
import { possessivePanel } from './possessive';
import { adverbPanel } from './adverb';
import { relativePanel } from './relative';
import { interrogativePanel } from './interrogative';
import { quantifierPanel } from './quantifier';
import type { Panel, PanelState } from './types';
import { particlePanel } from './particle';
import { changeVerbSlot, verbPanel } from './verb';

export type { Control, Panel, PanelRow, PanelState, Related } from './types';

/** The noun a quantifier panel shows when the phrase has none (ποιος είναι;): one of each Greek gender. */
const DEFAULT_NOUN: Record<Gender, string> = { m: 'skylos', f: 'alepou', n: 'paidi' };

const lexemeIsEmphatic = (token: Token): boolean => {
  const l = getLexeme(token.lexeme);
  return l.pos === 'adjective' && l.emphatic === true;
};

/** The state a word's panel starts in: the token's own slot and the noun it goes with in the phrase. */
export function initialState(token: Token, phrase: Phrase): PanelState {
  const nounToken = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
  let noun = nounToken ? nounToken.lexeme : null;
  // A command with a pronoun and no noun token of its own: the noun the pronoun can stand for.
  if (!noun && token.slot.pos === 'verb') {
    const direct = (token.slot.clitics ?? []).find((c) => c.role === 'object');
    if (direct) noun = nounForClitic(direct);
  }
  if (!noun && token.slot.pos === 'quantifier') noun = DEFAULT_NOUN[token.slot.gender];
  // A noun that a possessive points at shows it: το σπίτι μου.
  const at = phrase.tokens.indexOf(token);
  const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === at && phrase.tokens.indexOf(t) === at + 1) : undefined;
  // A noun shows the noun that owns it: the genitive noun that points back at it (το σπίτι του παιδιού).
  // A relative pronoun for "whose" shows the noun owned: the article and noun that follow it (του οποίου το σπίτι).
  const ownedToken =
    token.slot.pos === 'relative' && token.slot.role === 'whose' && phrase.tokens[at + 1]?.lexeme === 'def' && phrase.tokens[at + 2]?.slot.pos === 'noun'
      ? phrase.tokens[at + 2]
      : undefined;
  const owner = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'noun' && t.slot.case === 'gen' && t.agreesWith === at) : undefined;
  // δικός shows the possessive that follows it: το δικό μου σπίτι.
  const after = phrase.tokens[at + 1];
  const own = lexemeIsEmphatic(token) && after?.slot.pos === 'possessive' ? after : undefined;
  return {
    slot: token.slot,
    ...(possessive && possessive.slot.pos === 'possessive' ? { possessor: possessive.slot } : {}),
    ...(own && own.slot.pos === 'possessive' ? { possessor: own.slot } : {}),
    ...(owner ? { owner: owner.lexeme } : {}),
    ...(ownedToken ? { owned: ownedToken.lexeme } : {}),
    ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
    noun,
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
      return verbPanel(lexeme as GreekVerb, slot, state, level);
    case 'noun':
      return nounPanel(lexeme as GreekNoun, slot, level, state);
    case 'adjective':
      return (lexeme as GreekAdjective).emphatic
        ? dikosPanel(lexeme as GreekAdjective, slot, state, level)
        : adjectivePanel(lexeme as GreekAdjective, slot, state, level);
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
    case 'possessive':
      return possessivePanel(lexeme as GreekPossessive, slot, state, level);
    case 'conjunction':
      return conjunctionPanel(lexeme as GreekConjunction, level);
    case 'interrogative':
      return interrogativePanel(lexeme as GreekInterrogative, level);
    case 'adverb':
      return adverbPanel(lexeme as GreekAdverb, level);
    case 'relative':
      return relativePanel(lexeme as GreekRelative, slot, state, level);
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
    case 'who':
      if (slot.pos === 'verb') {
        // Without the lexeme only the person can change; nothing else can be checked.
        if (!lexemeId && key === 'who') {
          return { ...state, slot: { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num } };
        }
        if (!lexemeId) throw new Error(`the ${key} control needs the lexeme`);
        const next = changeVerbSlot(getVerb(lexemeId), slot, key, value);
        // The held noun is what a command's object (or a pronoun's referent) is; without either it is left behind.
        return { ...state, slot: next, noun: next.mood === 'imperative' || (next.clitics ?? []).length > 0 ? state.noun : null };
      }
      if (key === 'who' && slot.pos === 'clitic') return { ...state, slot: withWho(slot, value) };
      break;
    case 'gender':
      if (slot.pos === 'clitic') {
        // The Romanian gender and the English word belonged to the noun the pronoun stood for.
        const next: SlotOf<'clitic'> = { ...slot, gender: value as Gender };
        delete next.roGender;
        delete next.enPronoun;
        return { ...state, slot: next };
      }
      break;
    case 'role':
      if (slot.pos === 'clitic') return { ...state, slot: { ...slot, role: value as 'object' | 'indirect' } };
      if (slot.pos === 'relative') {
        // The preposition belongs to the job after a preposition only; it starts as με.
        const { preposition: _kept, ...rest } = slot;
        const role = value as RelativeRole;
        return { ...state, slot: role === 'preposition' ? { ...rest, role, preposition: slot.preposition ?? 'me' } : { ...rest, role } };
      }
      break;
    case 'case':
      if (slot.pos === 'possessive') return { ...state, nounCase: value as Case };
      if (
        slot.pos !== 'verb' &&
        slot.pos !== 'preposition' &&
        slot.pos !== 'particle' &&
        slot.pos !== 'conjunction' &&
        slot.pos !== 'interrogative' &&
        slot.pos !== 'adverb' &&
        slot.pos !== 'relative' &&
        slot.pos !== 'clitic'
      ) {
        return { ...state, slot: { ...slot, case: value as Case } };
      }
      break;
    case 'number':
      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'quantifier' || slot.pos === 'relative') {
        return { ...state, slot: { ...slot, number: value as Num } };
      }
      if (slot.pos === 'possessive') return { ...state, nounNumber: value as Num };
      if (slot.pos === 'preposition') return { ...state, nounNumber: value as Num };
      break;
    case 'count':
      if (slot.pos === 'noun') {
        if (value === '1') return { ...state, slot: { pos: 'noun', number: 'sg', case: slot.case } };
        if (value === 'many') return { ...state, slot: { pos: 'noun', number: 'pl', case: slot.case } };
        // A counted noun has no noun possessor, so none stays selected out of sight.
        const { owner: _owner, ...rest } = state;
        return {
          ...rest,
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
      if (slot.pos === 'preposition') return { ...state, slot: { ...slot, sense: value as PrepSense } };
      if (slot.pos === 'quantifier') {
        const next = { ...slot };
        if (value === 'few') next.sense = 'few';
        else delete next.sense;
        return { ...state, slot: next };
      }
      break;
    case 'member':
      if (slot.pos === 'verb' && lexemeId) {
        const match = groupFor(lexemeId, slot, state.noun);
        if (!match) break;
        const member = value === 'close' ? undefined : match.group.members[Number(value)];
        const target = value === 'close' ? match.group.closeNotSame?.verb : member?.verb;
        if (!target) break;
        const direct = (target.slot.clitics ?? []).find((c) => c.role === 'object');
        const noun = member?.object?.noun ?? (direct ? nounForClitic(direct) : null);
        const copy: SlotOf<'verb'> = { ...target.slot };
        if (target.slot.clitics) copy.clitics = target.slot.clitics.map((c) => ({ ...c }));
        return { ...state, slot: copy, noun };
      }
      break;
    case 'object':
      if (slot.pos === 'verb') {
        if (!lexemeId) throw new Error('the object control needs the lexeme');
        // A spelled-out noun is for commands only.
        const kind = (value === 'noun' && slot.mood !== 'imperative' ? 'none' : value) as ObjectKind;
        const noun = getNoun(state.noun ?? DEFAULT_OBJECT);
        const next = { ...slot };
        delete next.shortForm;
        const clitics = cliticsFor(kind, noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true, indirectOf(slot));
        if (clitics.length > 0) next.clitics = clitics;
        else delete next.clitics;
        return { ...state, slot: next, noun: kind === 'none' ? null : noun.id };
      }
      break;
    case 'possessor':
      if (slot.pos === 'noun' || slot.pos === 'adjective') {
        const to = POSSESSORS.find((p) => p.value === value);
        const { possessor: _old, owner: _owner, slot: _slot, ...rest } = state;
        // A fixed key order, so that sameState (which compares JSON) is true after nobody → the phrase's own possessor.
        return { slot: state.slot, ...(to ? { possessor: { ...to.slot } } : {}), ...rest };
      }
      if (slot.pos === 'possessive') {
        const to = POSSESSORS.find((p) => p.value === value);
        if (to) return { ...state, slot: { ...to.slot } };
      }
      break;
    case 'owner':
      if (slot.pos === 'noun') {
        const { possessor: _old, owner: _owner, slot: _slot, ...rest } = state;
        const to = value !== 'none' && getLexeme(value).pos === 'noun' ? value : undefined;
        // A fixed key order, as for the possessor.
        return { slot: state.slot, ...(to ? { owner: to } : {}), ...rest };
      }
      break;
    case 'preposition':
      if (slot.pos === 'relative' && slot.role === 'preposition' && (RELATIVE_PREPOSITIONS as readonly string[]).includes(value)) {
        return { ...state, slot: { ...slot, preposition: value } };
      }
      break;
    case 'owned':
      if (slot.pos === 'relative' && slot.role === 'whose' && getLexeme(value).pos === 'noun') {
        const { owned: _old, slot: _slot, ...rest } = state;
        // A fixed key order, so that sameState (which compares JSON) is true after choosing the phrase's own noun again.
        return { slot: state.slot, owned: value, ...rest };
      }
      break;
    case 'register':
      if (slot.pos === 'quantifier') {
        const next = { ...slot };
        if (value === 'spoken') next.register = 'spoken';
        else delete next.register;
        return { ...state, slot: next };
      }
      break;
    case 'recipient':
      if (slot.pos === 'verb' && indirectOf(slot)) {
        const to = RECIPIENTS.find((r) => r.value === value);
        if (!to) break;
        return { ...state, slot: { ...slot, clitics: (slot.clitics ?? []).map((c) => (c.role === 'indirect' ? { ...to.clitic } : c)) } };
      }
      break;
    case 'noun': {
      const noun = getLexeme(value);
      // After a preposition the learner may choose a question word as well as a noun (από πού).
      if (slot.pos === 'preposition' && (noun.pos === 'interrogative' || noun.pos === 'adverb')) {
        const prep = lexemeId ? getLexeme(lexemeId) : undefined;
        // A place word follows only the prepositions its data names (από εδώ, μέχρι εκεί).
        if (prep?.pos === 'preposition' && !governsWord(prep, noun)) break;
        return { ...state, noun: value, nounNumber: 'sg' };
      }
      if (noun.pos !== 'noun') break;
      if (slot.pos === 'preposition') return { ...state, noun: value };
      if (slot.pos === 'possessive') return { ...state, noun: value };
      // Without the lexeme the verb's indirect object is unknown: the control does not apply.
      if (slot.pos === 'verb' && lexemeId) {
        const next = { ...slot };
        delete next.shortForm;
        const clitics = cliticsFor(objectKind(slot, state.noun), noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true, indirectOf(slot));
        if (clitics.length > 0) next.clitics = clitics;
        else delete next.clitics;
        return { ...state, slot: next, noun: value };
      }
      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral' || slot.pos === 'quantifier' || slot.pos === 'relative') {
        return { ...state, noun: value, slot: { ...slot, gender: noun.gender } };
      }
      break;
    }
  }
  return state;
}
