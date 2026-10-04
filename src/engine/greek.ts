import {
  ADJ_STRESSED,
  ADJ_UNSTRESSED,
  ARTICLE_DEF,
  NOUN_CLASSES,
  NOUN_NOTES,
  NUMERAL_FORMS,
  QUANTIFIER_FORMS,
  VERB_AORIST,
  VERB_BASE,
  VERB_IMPERATIVE,
  VERB_IMPERFECT,
  VERB_PRESENT,
  VERB_SUBJ_AORIST,
} from '../data/paradigms';
import type {
  Form,
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekClitic,
  GreekConjunction,
  GreekParticle,
  GreekPreposition,
  GreekQuantifier,
  GreekVerb,
  IrregularNote,
  PastStems,
  Slot,
  SlotOf,
  StemPair,
} from '../types';
import { greekClitic } from './clitics';
import { voiceOf } from './offers';
import { mainFormKind, whoIndex } from './tenses';

export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
  const form: Form = { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
  const note = NOUN_NOTES[l.class]?.[`${s.number}-${s.case}` as const];
  return note ? { ...form, irregular: note } : form;
}

const INDECLINABLE: IrregularNote = {
  rule: 'indeclinable',
  plain: 'This adjective never changes, whatever the noun, number or role.',
};

export function inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form {
  if (l.class === 'adj-indeclinable') return { stem: l.stem, ending: '', irregular: INDECLINABLE };
  const table = l.class === 'adj-stressed' ? ADJ_STRESSED : ADJ_UNSTRESSED;
  return { stem: l.stem, ending: table[s.number][s.case][s.gender] };
}

export function inflectArticle(_l: GreekArticle, s: SlotOf<'article'>): Form {
  return { stem: ARTICLE_DEF[s.gender][s.number][s.case], ending: '' };
}

export function inflectNumeral(_l: GreekNumeral, s: SlotOf<'numeral'>): Form {
  const [stem, ending] = NUMERAL_FORMS[s.value][s.gender][s.case];
  return { stem, ending };
}

const STRESS_SHIFT_PREFIX: IrregularNote = {
  rule: 'stress-shift',
  plain:
    'In the "we" and "you (pl.)" forms the stress moves toward the end of the word, so the past-tense prefix drops out and the stem takes the accent.',
};

const STRESS_SHIFT: IrregularNote = {
  rule: 'stress-shift',
  plain: 'In the "we" and "you (pl.)" forms the stress moves toward the end of the word, so the stem takes a different accent.',
};

function pick(table: readonly (string | null)[], index: number, what: string): string {
  const ending = table[index];
  if (ending === null || ending === undefined) throw new Error(`no ${what} form`);
  return ending;
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`no ${what}`);
  return value;
}

function pastForm(stems: PastStems | undefined, table: readonly (string | null)[], index: number, what: string): Form {
  const past = need(stems, `${what} stem`);
  const weak = index === 3 || index === 4;
  const pair: StemPair = weak ? past.weak : past.strong;
  const form: Form = { stem: pair.stem, ending: pick(table, index, what) };
  if (pair.augment) form.augment = pair.augment;
  if (weak && (past.strong.augment !== undefined || past.strong.stem !== past.weak.stem)) form.irregular = past.strong.augment !== undefined ? STRESS_SHIFT_PREFIX : STRESS_SHIFT;
  return form;
}

/** The form the lexical verb contributes to a slot (compose adds the particle and the auxiliary). */
export function inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form {
  const v = voiceOf(l, s.voice);
  const kind = mainFormKind(s.mood, s.tense);
  const index = whoIndex(s);
  const what = `${l.id} ${kind}`;
  const key = kind === 'base' ? 'base' : `${kind}.${s.person}${s.number}`;
  const override = v.overrides?.[key];
  if (override) {
    const form: Form = { stem: override.stem, ending: override.ending };
    if (override.augment) form.augment = override.augment;
    if (override.note) form.irregular = override.note;
    return form;
  }
  switch (kind) {
    case 'present':
      return { stem: v.stems.present, ending: pick(VERB_PRESENT[v.class], index, what) };
    case 'imperfect':
      return pastForm(v.stems.imperfect, VERB_IMPERFECT[v.class], index, what);
    case 'aorist':
      return pastForm(v.stems.aorist, VERB_AORIST[v.class], index, what);
    case 'subjAorist':
      return {
        stem: need(v.stems.perfective, `${what} stem`),
        ending: pick(VERB_SUBJ_AORIST[v.class], index, what),
      };
    case 'impPresent':
    case 'impAorist': {
      if (s.person !== 2) throw new Error('commands are for "you" only');
      const table = VERB_IMPERATIVE[v.class][kind === 'impPresent' ? 'present' : 'aorist'];
      if (!table) throw new Error(`no ${what} form`);
      const stem = kind === 'impPresent' ? v.stems.present : need(v.stems.perfective, `${what} stem`);
      return { stem, ending: table[s.number === 'sg' ? 0 : 1] };
    }
    case 'base': {
      const ending = VERB_BASE[v.class];
      if (!ending) throw new Error(`no ${what} form`);
      return { stem: need(v.stems.perfective, `${what} stem`), ending };
    }
  }
}

const TWO_STEMS: IrregularNote = {
  rule: 'two-stems',
  plain: 'πολύς has two stems: πολύ- (πολύς, πολύ) and πολλ- (all the other forms).',
};

export function inflectQuantifier(l: GreekQuantifier, s: SlotOf<'quantifier'>): Form {
  if (!l.numbers.includes(s.number)) throw new Error(`${l.id} is not offered in the ${s.number}`);
  const how = l.greek[s.degree];
  if (!how) throw new Error(`${l.id} has no ${s.degree} degree`);
  if ('stem' in how) {
    const endings = how.stressed ? ADJ_STRESSED : ADJ_UNSTRESSED;
    return { stem: how.stem, ending: endings[s.number][s.case][s.gender] };
  }
  const pair = QUANTIFIER_FORMS[how.table][s.number]?.[s.case][s.gender];
  if (!pair) throw new Error(`${l.id} has no ${s.number} form`);
  const form: Form = { stem: pair[0], ending: pair[1] };
  return how.table === 'polys' ? { ...form, irregular: TWO_STEMS } : form;
}

export function inflectClitic(_l: GreekClitic, s: SlotOf<'clitic'>): Form {
  return { stem: greekClitic(s), ending: '' };
}

export function inflectPreposition(l: GreekPreposition, _s: SlotOf<'preposition'>): Form {
  return { stem: l.lemma, ending: '' };
}

export function inflectParticle(l: GreekParticle, _s: SlotOf<'particle'>): Form {
  return { stem: l.lemma, ending: '' };
}

export function inflectConjunction(l: GreekConjunction, _s: SlotOf<'conjunction'>): Form {
  return { stem: l.lemma, ending: '' };
}

export function inflect(l: GreekLexeme, s: Slot): Form {
  if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
  switch (l.pos) {
    case 'noun':
      return inflectNoun(l, s as SlotOf<'noun'>);
    case 'adjective':
      return inflectAdjective(l, s as SlotOf<'adjective'>);
    case 'article':
      return inflectArticle(l, s as SlotOf<'article'>);
    case 'numeral':
      return inflectNumeral(l, s as SlotOf<'numeral'>);
    case 'verb':
      return inflectVerb(l, s as SlotOf<'verb'>);
    case 'clitic':
      return inflectClitic(l, s as SlotOf<'clitic'>);
    case 'conjunction':
      return inflectConjunction(l, s as SlotOf<'conjunction'>);
    case 'quantifier':
      return inflectQuantifier(l, s as SlotOf<'quantifier'>);
    case 'preposition':
      return inflectPreposition(l, s as SlotOf<'preposition'>);
    case 'particle':
      return inflectParticle(l, s as SlotOf<'particle'>);
  }
}
