import { AUX_GLOSS, EN_FUNCTION, RO_SHAPES, ENDING_GLOSS, KIND_NAME, PARTICLE_GLOSS, READING_TEMPLATES, WHO_GLOSS } from '../data/readings';
import type { EnVerbForms, GreekVerb, Reading, ReadingLine, ReadingPart, SlotOf } from '../types';
import { compose, type Piece } from './compose';
import { enVerb, enVerbText } from './english';
import { EN_PRONOUNS, moodLabel, tenseLabel } from './labels';
import { voiceOf } from './offers';
import { roVerb } from './romanian';
import { lexicalFormKind, whoIndex } from './tenses';

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

function wordGloss(piece: Exclude<Piece, { kind: 'verb' }>, slot: SlotOf<'verb'>): string {
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
  const en = voiceOf(verb, slot.voice).en;
  const negative = slot.polarity === 'negative';
  let shape: readonly string[] | undefined;
  if (slot.mood === 'imperative') {
    shape = negative ? ['NOT', slot.number === 'sg' ? 'INF' : 'VERBPL'] : undefined;
  } else {
    const base = RO_SHAPES[`${slot.mood}.${slot.tense}`];
    if (base) shape = !negative ? base : slot.mood === 'subjunctive' ? [base[0], 'NOT', ...base.slice(1)] : ['NOT', ...base];
  }
  const text = roVerb(verb, slot);
  const words = text.split(' ');
  if (!shape || shape.length !== words.length) return undefined;
  return wordsLine(text, words.map((word, i) => ({ word, gloss: roGloss(shape[i], en) })), greekText);
}

function englishLine(verb: GreekVerb, slot: SlotOf<'verb'>, greekText: string): ReadingLine | undefined {
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

  const lexical = composed.pieces[composed.pieces.length - 1];
  const form = lexical.kind === 'verb' ? lexical.form : undefined;
  const negativeCommand = negative && slot.mood === 'imperative';
  // A negative command already has its own extra sentence, so a template would make a third.
  const template = form?.irregular && !negativeCommand ? READING_TEMPLATES.find((t) => t.rule === form.irregular?.rule) : undefined;

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
    note: form?.irregular?.plain ?? '',
  };

  const beginnerTail =
    kind === 'base'
      ? ' Only έχω changes with the person.'
      : negativeCommand
        ? ' To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.'
        : '';
  const improverTail =
    kind === 'base' ? ' The auxiliary carries the person.' : negativeCommand ? ' The subjunctive replaces the imperative.' : '';

  const beginner = (template ? fill(template.beginner, vars) : `${composed.text}: ${listing}.`) + beginnerTail;
  const improver = (template ? `${negative ? `${name}: ` : ''}${fill(template.improver, vars)}` : `${name}: ${technical}.`) + improverTail;

  const ro = romanianLine(verb, slot, composed.text);
  const en = englishLine(verb, slot, composed.text);
  return { el: { parts, beginner, improver }, ...(ro ? { ro } : {}), ...(en ? { en } : {}) };
}
