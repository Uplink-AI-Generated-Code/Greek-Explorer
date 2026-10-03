import { getLexeme, getVerb } from '../data/lexemes';
import type { Form, GreekVerb, Slot, SlotOf } from '../types';
import { inflectVerb } from './greek';
import { formRich, formText, type Rich } from './segments';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle or auxiliary piece carries the lexeme and slot a panel
 * would open for it (spec 4.2); the lexical verb carries its Form.
 */
export type Piece =
  | { kind: 'particle' | 'auxiliary'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
}

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

/** Builds a verb group: the particle (θα, να), the auxiliary (έχω) and the lexical verb, in written order. */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
  const structure = structureOf(slot.mood, slot.tense);
  const pieces: Piece[] = [];
  if (structure.particle) {
    const particle = getLexeme(structure.particle);
    pieces.push({ kind: 'particle', text: particle.lemma, lexeme: particle.id, slot: { pos: 'particle' } });
  }
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
  return { pieces, text: pieces.map(pieceText).join(' ') };
}

/** The group as coloured segments: particle and auxiliary in the `aux` role, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich = piece.kind === 'verb' ? formRich(piece.form) : [{ text: piece.text, role: 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
