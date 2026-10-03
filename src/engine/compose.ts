import { getLexeme, getVerb } from '../data/lexemes';
import type { Form, GreekVerb, Slot, SlotOf } from '../types';
import { inflectVerb } from './greek';
import { formRich, formText, type Rich } from './segments';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle, negation or auxiliary piece carries the lexeme and slot a
 * panel would open for it (spec 4.2); the lexical verb carries its Form.
 */
export type Piece =
  | { kind: 'particle' | 'negation' | 'auxiliary'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
}

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

const joined = (pieces: Piece[]): Composed => ({ pieces, text: pieces.map(pieceText).join(' ') });

function wordPiece(kind: 'particle' | 'negation', id: string): Piece {
  const lexeme = getLexeme(id);
  return { kind, text: lexeme.lemma, lexeme: lexeme.id, slot: { pos: 'particle' } };
}

/**
 * Builds a verb group in written order: the negation (δεν before θα; μην after να), the particle (θα, να),
 * the auxiliary (έχω) and the lexical verb. A negative command is μην + the subjunctive form (spec 4.3).
 */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
  const negative = slot.polarity === 'negative';
  if (negative && slot.mood === 'imperative') {
    if (slot.person !== 2) throw new Error('commands are for "you" only');
    const subjunctive: SlotOf<'verb'> = {
      pos: 'verb',
      person: slot.person,
      number: slot.number,
      mood: 'subjunctive',
      tense: slot.tense,
      voice: slot.voice,
    };
    return joined([wordPiece('negation', 'min'), { kind: 'verb', form: inflectVerb(verb, subjunctive) }]);
  }

  const structure = structureOf(slot.mood, slot.tense);
  const negation = negative ? wordPiece('negation', slot.mood === 'subjunctive' ? 'min' : 'den') : null;
  const pieces: Piece[] = [];
  if (negation && slot.mood !== 'subjunctive') pieces.push(negation);
  if (structure.particle) pieces.push(wordPiece('particle', structure.particle));
  if (negation && slot.mood === 'subjunctive') pieces.push(negation);
  if (structure.aux) {
    const auxSlot: SlotOf<'verb'> = {
      pos: 'verb',
      person: slot.person,
      number: slot.number,
      mood: 'indicative',
      tense: structure.aux,
      voice: 'active',
    };
    pieces.push({
      kind: 'auxiliary',
      text: formText(inflectVerb(getVerb('echo'), auxSlot)),
      lexeme: 'echo',
      slot: auxSlot,
    });
  }
  pieces.push({ kind: 'verb', form: inflectVerb(verb, slot) });
  return joined(pieces);
}

/** The group as coloured segments: negation in `neg`, particle and auxiliary in `aux`, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich =
      piece.kind === 'verb'
        ? formRich(piece.form)
        : [{ text: piece.text, role: piece.kind === 'negation' ? 'neg' : 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
