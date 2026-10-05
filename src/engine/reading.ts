import { getVerb } from '../data/lexemes';
import { AUX_GLOSS, EN_FUNCTION, RO_SHAPES, ENDING_GLOSS, KIND_NAME, PARTICLE_GLOSS, READING_TEMPLATES, WHO_GLOSS } from '../data/readings';
import type { Clitic, EnVerbForms, GreekAdjective, GreekNoun, GreekVerb, Reading, ReadingLine, ReadingPart, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { enClitic } from './clitics';
import { compose, lexicalPiece, type Piece } from './compose';
import { enVerb, enVerbText } from './english';
import { inflectAdjective } from './greek';
import { EN_PRONOUNS, GENDER_NAME, caseOptions, moodLabel, tenseLabel } from './labels';
import { voiceOf } from './offers';
import { roVerb } from './romanian';
import { richText } from './segments';
import { lexicalFormKind, whoIndex } from './tenses';

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

/** What a pronoun means in a reading: "it", "to me". */
function cliticGloss(c: Clitic): string {
  return c.role === 'indirect' ? `to ${enClitic(c)}` : enClitic(c);
}

function wordGloss(piece: Exclude<Piece, { kind: 'verb' }>, slot: SlotOf<'verb'>): string {
  if (piece.kind === 'fused') return `${piece.of.join(' + ')}, joined`;
  if (piece.kind === 'clitic') return piece.slot.pos === 'clitic' ? cliticGloss(piece.slot) : piece.text;
  if (piece.kind === 'auxiliary') {
    const aux = piece.slot;
    return aux.pos === 'verb' ? AUX_GLOSS[aux.tense === 'imperfect' ? 'imperfect' : 'present'][whoIndex(aux)] : piece.text;
  }
  if (piece.lexeme === 'theta' && slot.mood === 'conditional') return 'would';
  return PARTICLE_GLOSS[piece.lexeme] ?? piece.text;
}

/** The technical description of one piece (Improver). */
function describe(piece: Piece, kind: ReturnType<typeof lexicalFormKind>): string {
  if (piece.kind === 'verb') {
    const { augment, stem, ending } = piece.form;
    const bits = [augment ? `augment ${augment}-` : '', `stem ${stem}-`, ending ? `ending -${ending}` : '']
      .filter((bit) => bit !== '')
      .join(' + ');
    return `${KIND_NAME[kind]} (${bits})`;
  }
  if (piece.kind === 'auxiliary' && piece.slot.pos === 'verb') {
    return `${piece.text} (${piece.slot.tense} ${piece.slot.person}${piece.slot.number} of έχω)`;
  }
  if (piece.kind === 'clitic' && piece.slot.pos === 'clitic') {
    return `${piece.slot.role === 'object' ? 'accusative' : 'genitive'} pronoun ${piece.text}`;
  }
  if (piece.kind === 'fused') return `${piece.of.join(' + ')} joined (${piece.text})`;
  return piece.text;
}

/** A line made of Romanian or English words, each with a gloss. */
function wordsLine(text: string, words: { word: string; gloss: string }[], greekText: string): ReadingLine {
  const parts: ReadingPart[] = words.map(({ word, gloss }) => ({ text: word, label: word, role: 'word', gloss, piece: null }));
  const listing = words.map(({ word, gloss }) => `${word} = ${gloss}`).join(', ');
  return {
    parts,
    beginner: `${text}: ${listing}.`,
    improver: `${text}: ${listing}. Compare Greek ${greekText}.`,
  };
}

function roGloss(key: string, en: EnVerbForms): string {
  switch (key) {
    case 'have':
      return 'have (auxiliary)';
    case 'will':
    case 'would':
    case 'be':
      return key;
    case 'to':
      return 'that / to';
    case 'NOT':
      return 'not';
    case 'INF':
      return en.base;
    case 'VERB':
      return en.gloss;
    case 'VERBPL':
      return `${en.gloss} (you, pl.)`;
    default:
      return `${en.pastParticiple} (never changes)`;
  }
}

function romanianLine(verb: GreekVerb, slot: SlotOf<'verb'>, greekText: string): ReadingLine | undefined {
  // The fused forms with pronouns (mănâncă-o, nu-l mânca) do not fit the word-by-word shapes.
  if ((slot.clitics ?? []).length > 0) return undefined;
  const en = voiceOf(verb, slot.voice).en;
  const negative = slot.polarity === 'negative';
  let shape: readonly string[] | undefined;
  if (slot.mood === 'imperative') {
    shape = negative ? ['NOT', slot.number === 'sg' ? 'INF' : 'VERBPL'] : undefined;
  } else {
    const base = RO_SHAPES[`${slot.mood}.${slot.tense}`];
    const afterParticle = slot.mood === 'subjunctive' || slot.mood === 'hortative';
    if (base) shape = !negative ? base : afterParticle ? [base[0], 'NOT', ...base.slice(1)] : ['NOT', ...base];
  }
  const text = roVerb(verb, slot);
  const words = text.split(' ');
  if (!shape || shape.length !== words.length) return undefined;
  return wordsLine(text, words.map((word, i) => ({ word, gloss: roGloss(shape[i], en) })), greekText);
}

function englishLine(verb: GreekVerb, slot: SlotOf<'verb'>, greekText: string): ReadingLine | undefined {
  // The fused forms with pronouns (mănâncă-o, nu-l mânca) do not fit the word-by-word shapes.
  if ((slot.clitics ?? []).length > 0) return undefined;
  // "let me / let him / may you" carry a pronoun the word-by-word shapes leave out.
  if (slot.mood === 'hortative') return undefined;
  const en = voiceOf(verb, slot.voice).en;
  const parts = enVerb(verb, slot);
  // The parenthetical "(myself)" of a reflexive verb and the subject pronoun are not parts of the verb group.
  const core = parts.verb.replace(/\s*\(.*\)$/, '');
  const words = [parts.lead, core].join(' ').split(' ').filter((word) => word !== '');
  if (words.length < 2) return undefined;
  // The last word of the group is the lexical verb, even when it is "have" or "do".
  const gloss = (word: string, last: boolean): string => {
    if (!last && EN_FUNCTION[word]) return EN_FUNCTION[word];
    if (word === en.ing) return `${word} (in progress)`;
    if (word === en.pastParticiple) return `${word} (past participle: never changes)`;
    if (word === en.base) return `${word} (the verb)`;
    if (word === en.past) return `${word} (past)`;
    return EN_FUNCTION[word] ?? word;
  };
  const text = enVerbText(verb, slot, EN_PRONOUNS[whoIndex(slot)]);
  return wordsLine(text, words.map((word, i) => ({ word, gloss: gloss(word, i === words.length - 1) })), greekText);
}

/**
 * Takes a verb form apart (spec 5.5): the Greek line is generated from the composed pieces, the glossary of
 * endings and, for an irregular form, the authored template of its rule.
 */
export function readingFor(verb: GreekVerb, slot: SlotOf<'verb'>): Reading {
  const composed = compose(verb, slot);
  const data = voiceOf(verb, slot.voice);
  const kind = lexicalFormKind(slot);
  const who = WHO_GLOSS[whoIndex(slot)];
  const negative = slot.polarity === 'negative';

  const parts: ReadingPart[] = [];
  composed.pieces.forEach((piece, index) => {
    if (piece.kind === 'verb') {
      const { augment, stem, ending } = piece.form;
      if (augment) parts.push({ text: augment, label: `${augment}-`, role: 'augment', gloss: 'in the past', piece: index });
      // A stem with no ending is a whole word (είμαι): no hyphen.
      parts.push({ text: stem, label: ending ? `${stem}-` : stem, role: 'stem', gloss: data.en.gloss, piece: index });
      if (ending) {
        parts.push({
          text: ending,
          label: `-${ending}`,
          role: 'ending',
          gloss: ENDING_GLOSS[kind].replace('{who}', who),
          piece: index,
        });
      }
      return;
    }
    parts.push({ text: piece.text, label: piece.text, role: piece.kind, gloss: wordGloss(piece, slot), piece: index });
  });

  const form = lexicalPiece(composed)?.form;
  const negativeCommand = negative && slot.mood === 'imperative';
  // A negative command already has its own extra sentence, so a template would make a third.
  // A rule that shaped the whole group (the second accent, a short form) comes before the verb's own irregularity.
  const rule = composed.irregular?.rule ?? form?.irregular?.rule;
  const template = rule && !negativeCommand ? READING_TEMPLATES.find((t) => t.rule === rule) : undefined;

  const listing = parts.map((p) => `${p.label} = ${p.gloss}`).join(', ');
  const technical = composed.pieces.map((piece) => describe(piece, kind)).join(' + ');
  const moodTense =
    slot.mood === 'indicative'
      ? tenseLabel('improver', slot.mood, slot.tense)
      : `${moodLabel('improver', slot.mood)} ${tenseLabel('improver', slot.mood, slot.tense)}`;
  const name = capitalise(`${negative ? 'negative ' : ''}${moodTense}`);
  const vars = {
    text: composed.text,
    parts: listing,
    technical,
    stem: form?.stem ?? '',
    ending: form?.ending ?? '',
    note: composed.irregular?.plain ?? form?.irregular?.plain ?? '',
  };

  const beginnerTail =
    kind === 'base'
      ? ' Only έχω changes with the person.'
      : negativeCommand
        ? ' To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.'
        : '';
  const pair = (slot.clitics ?? []).length === 2;
  const improverTail =
    kind === 'base'
      ? ' The auxiliary carries the person.'
      : negativeCommand
        ? ' The subjunctive replaces the imperative.'
        : pair && !template
          ? ' The genitive pronoun comes before the accusative.'
          : '';

  const beginner = (template ? fill(template.beginner, vars) : `${composed.text}: ${listing}.`) + beginnerTail;
  const improver = (template ? `${negative ? `${name}: ` : ''}${fill(template.improver, vars)}` : `${name}: ${technical}.`) + improverTail;

  const ro = romanianLine(verb, slot, composed.text);
  const en = englishLine(verb, slot, composed.text);
  return { el: { parts, beginner, improver }, ...(ro ? { ro } : {}), ...(en ? { en } : {}) };
}

/**
 * "How to read this" for a passive participle (spec 5.5): the verb's participle stem plus -μένος, declined like a
 * stem-stressed adjective. `noun` is the noun the panel is showing it with.
 */
export function participleReading(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun): ReadingLine {
  const from = adj.derivedFrom;
  if (!from) throw new Error(`${adj.id} is not derived from a verb`);
  const gloss = voiceOf(getVerb(from.verb), 'active').en.gloss;
  const ending = `μέν${inflectAdjective(adj, slot).ending}`;
  const matches = richText(nounPhrase(noun, slot.number, slot.case, { article: 'definite' }).el);
  const parts: ReadingPart[] = [
    { text: from.stem, label: `${from.stem}-`, role: 'stem', gloss, piece: null },
    {
      text: ending,
      label: `-${ending}`,
      role: 'ending',
      gloss: `a describing word (${adj.en}) that matches ${matches}: ${GENDER_NAME[slot.gender]}, ${slot.number === 'sg' ? 'one' : 'many'}`,
      piece: null,
    },
  ];
  const listing = parts.map((p) => `${p.label} = ${p.gloss}`).join(', ');
  const role = caseOptions('improver').find((o) => o.value === slot.case)?.label ?? slot.case;
  return {
    parts,
    beginner: `${from.stem}${ending}: ${listing}.`,
    improver: `Passive participle: participle stem ${from.stem}- + -μένος declined in the ${GENDER_NAME[slot.gender]} ${role} ${slot.number === 'sg' ? 'singular' : 'plural'}.`,
  };
}
