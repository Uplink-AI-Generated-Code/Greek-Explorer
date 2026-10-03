import { getLexeme } from '../data/lexemes';
import { nounPhrase, type NounPhrase } from '../engine/agree';
import { enVerb } from '../engine/english';
import { inflectAdjective, inflectNumeral, inflectVerb } from '../engine/greek';
import {
  EN_PRONOUNS,
  GENDER_NAME,
  GREEK_PRONOUNS,
  RO_PRONOUNS,
  caseOptions,
  numberOptions,
  whoOptions,
  type Option,
} from '../engine/labels';
import { roNumeral, roVerb } from '../engine/romanian';
import { dim, formRich, numeralRich, plain, richText, type Rich } from '../engine/segments';
import type {
  Case,
  Gender,
  GreekAdjective,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
  Level,
  Num,
  Person,
  Phrase,
  Slot,
  SlotOf,
  Token,
} from '../types';

export interface Control {
  key: 'who' | 'number' | 'case';
  label: string;
  options: Option[];
  value: string;
}

export interface PanelRow {
  label: string;
  el: Rich;
  ro: Rich;
  en: Rich;
}

export interface Panel {
  lemma: string;
  posLabel: string;
  controls: Control[];
  rows: PanelRow[];
  plain: string;
  note: string;
}

const GENDERS: Gender[] = ['m', 'f', 'n'];

function nounFor(token: Token, phrase: Phrase): GreekNoun {
  if (token.agreesWith === undefined) throw new Error(`token ${token.text} has no agreesWith`);
  const lexeme = getLexeme(phrase.tokens[token.agreesWith].lexeme);
  if (lexeme.pos !== 'noun') throw new Error(`token ${token.text} must agree with a noun`);
  return lexeme;
}

const npRow = (label: string, np: NounPhrase): PanelRow => ({
  label,
  el: np.el,
  ro: plain(np.ro),
  en: plain(np.en),
});

const noPluralArticleRow = (): PanelRow => ({
  label: 'a / an',
  el: dim('none in plural'),
  ro: dim('none in plural'),
  en: dim('none in plural'),
});

const caseControl = (slot: { case: Case }, level: Level): Control => ({
  key: 'case',
  label: 'Role in sentence',
  options: caseOptions(level),
  value: slot.case,
});

const numberControl = (slot: { number: Num }): Control => ({
  key: 'number',
  label: 'How many?',
  options: numberOptions,
  value: slot.number,
});

function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  const index = slot.person - 1 + (slot.number === 'pl' ? 3 : 0);
  return {
    lemma: verb.lemma,
    posLabel: level === 'beginner' ? `verb: to ${verb.en.gloss}` : 'verb · -ω class · active',
    controls: [
      { key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` },
    ],
    rows: [
      {
        label: whoOptions[index].label,
        el: [
          { text: `(${GREEK_PRONOUNS[index]})`, role: 'dim' },
          { text: ' ', role: 'plain' },
          ...formRich(inflectVerb(verb, slot)),
        ],
        ro: [
          { text: `(${RO_PRONOUNS[index]})`, role: 'dim' },
          { text: ' ', role: 'plain' },
          { text: roVerb(verb, slot), role: 'plain' },
        ],
        en: [
          { text: EN_PRONOUNS[index], role: 'pronoun' },
          { text: ' ', role: 'plain' },
          { text: enVerb(verb, slot), role: 'plain' },
        ],
      },
    ],
    plain:
      'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
    note: '',
  };
}

function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level): Panel {
  const the = nounPhrase(noun, slot.number, slot.case, { article: 'definite' });
  return {
    lemma: noun.lemma,
    posLabel:
      level === 'beginner'
        ? `noun: ${noun.en.sg} (${GENDER_NAME[noun.gender]})`
        : `noun · ${GENDER_NAME[noun.gender]} · Romanian: ${noun.ro.lemma} (${GENDER_NAME[noun.ro.gender]})`,
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [
      npRow('the', the),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one' }))
        : noPluralArticleRow(),
    ],
    plain: 'The article agrees with the noun in gender, number and role.',
    note: noun.note,
  };
}

function adjectivePanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun, level: Level): Panel {
  const lemma = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  ).join(' / ');
  return {
    lemma,
    posLabel: level === 'beginner' ? `adjective: ${adj.en}` : 'adjective · 3-ending (stressed)',
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [
      npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite', adjective: adj })),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one', adjective: adj }))
        : noPluralArticleRow(),
    ],
    plain:
      'The Greek adjective copies gender, number and role from the noun. Romanian copies gender and number and goes after the noun. English never changes.',
    note: noun.note,
  };
}

function numeralPanel(numeral: GreekNumeral, slot: SlotOf<'numeral'>, noun: GreekNoun, level: Level): Panel {
  const lemma = GENDERS.map((gender) =>
    richText(numeralRich(inflectNumeral(numeral, { pos: 'numeral', value: 1, gender, case: 'nom' }))),
  ).join(' / ');
  const form = inflectNumeral(numeral, { pos: 'numeral', value: 1, gender: noun.gender, case: slot.case });
  return {
    lemma,
    posLabel: level === 'beginner' ? 'article: a / an' : 'numeral · doubles as the indefinite article',
    controls: [caseControl(slot, level)],
    rows: [
      {
        label: 'number',
        el: numeralRich(form),
        ro: plain(roNumeral(numeral, 1, noun.ro.gender, slot.case)),
        en: plain('a / an (one)'),
      },
      npRow('counting', nounPhrase(noun, 'sg', slot.case, { article: 'one' })),
    ],
    plain:
      'The numeral agrees with the noun it counts. Romanian changes by gender too (un / o); English never changes.',
    note: noun.note,
  };
}

function articlePanel(slot: SlotOf<'article'>, noun: GreekNoun, level: Level): Panel {
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    note: noun.note,
  };
}

export function buildPanel(slot: Slot, token: Token, phrase: Phrase, level: Level): Panel {
  const lexeme = getLexeme(token.lexeme);
  if (lexeme.pos !== slot.pos) throw new Error(`slot ${slot.pos} does not fit lexeme ${lexeme.id}`);
  switch (slot.pos) {
    case 'verb':
      return verbPanel(lexeme as GreekVerb, slot, level);
    case 'noun':
      return nounPanel(lexeme as GreekNoun, slot, level);
    case 'adjective':
      return adjectivePanel(lexeme as GreekAdjective, slot, nounFor(token, phrase), level);
    case 'numeral':
      return numeralPanel(lexeme as GreekNumeral, slot, nounFor(token, phrase), level);
    case 'article':
      return articlePanel(slot, nounFor(token, phrase), level);
  }
}

/** Returns a new slot with one control applied; a control that does not apply returns the same slot. */
export function applyControl(slot: Slot, key: string, value: string): Slot {
  if (key === 'who' && slot.pos === 'verb') {
    return { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num };
  }
  if (key === 'case' && slot.pos !== 'verb') {
    return { ...slot, case: value as Case };
  }
  if (key === 'number' && (slot.pos === 'noun' || slot.pos === 'adjective' || slot.pos === 'article')) {
    return { ...slot, number: value as Num };
  }
  return slot;
}
