import { AUX_GLOSS, ENDING_GLOSS, KIND_NAME, PARTICLE_GLOSS, READING_TEMPLATES, WHO_GLOSS } from '../data/readings';
import type { GreekVerb, Reading, ReadingPart, SlotOf } from '../types';
import { compose, type Piece } from './compose';
import { moodLabel, tenseLabel } from './labels';
import { voiceOf } from './offers';
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
      parts.push({ text: stem, label: `${stem}-`, role: 'stem', gloss: data.en.gloss, piece: index });
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
  const template = form?.irregular ? READING_TEMPLATES.find((t) => t.rule === form.irregular?.rule) : undefined;

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
  };

  const negativeCommand = negative && slot.mood === 'imperative';
  const beginnerTail =
    kind === 'base'
      ? ' Only έχω changes with the person.'
      : negativeCommand
        ? ' To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.'
        : '';
  const improverTail =
    kind === 'base' ? ' The auxiliary carries the person.' : negativeCommand ? ' The subjunctive replaces the imperative.' : '';

  const beginner = (template ? fill(template.beginner, vars) : `${composed.text}: ${listing}.`) + beginnerTail;
  const improver = (template ? fill(template.improver, vars) : `${name}: ${technical}.`) + improverTail;

  return { el: { parts, beginner, improver } };
}
