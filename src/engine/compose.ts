import { getLexeme, getVerb } from '../data/lexemes';
import type { Clitic, Form, GreekVerb, IrregularNote, Slot, SlotOf } from '../types';
import { cliticSlot, greekClitic } from './clitics';
import { inflectVerb } from './greek';
import { shortFormOf, slotProblem } from './offers';
import { formRich, formText, type Rich } from './segments';
import { accentAt, secondAccent } from './stress';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle, negation, auxiliary or pronoun piece carries the lexeme and slot a
 * panel would open for it (spec 4.2); the lexical verb carries its Form; a fused short form (φάτο) opens the verb.
 */
export type Piece =
  | { kind: 'particle' | 'negation' | 'auxiliary' | 'clitic'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form }
  | { kind: 'fused'; text: string; of: string[] };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
  /** The piece that carries the second accent the stress rule adds (spec 4.3). */
  extraAccent?: { pieceIndex: number };
  /** A rule that shaped the whole group: the second accent. */
  irregular?: IrregularNote;
}

/** The piece that holds the lexical verb (its Form); a fused short form has none. */
export const lexicalPiece = (composed: Composed): Extract<Piece, { kind: 'verb' }> | undefined =>
  composed.pieces.find((p): p is Extract<Piece, { kind: 'verb' }> => p.kind === 'verb');

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

const joined = (pieces: Piece[], extra: Pick<Composed, 'extraAccent' | 'irregular'> = {}): Composed => ({
  pieces,
  text: pieces.map(pieceText).join(' '),
  ...extra,
});

function wordPiece(kind: 'particle' | 'negation', id: string): Piece {
  const lexeme = getLexeme(id);
  return { kind, text: lexeme.lemma, lexeme: lexeme.id, slot: { pos: 'particle' } };
}

const cliticPiece = (c: Clitic, text: string = greekClitic(c)): Piece => ({
  kind: 'clitic',
  text,
  lexeme: 'clitic',
  slot: cliticSlot(c),
});

const CLITIC_STRESS: IrregularNote = {
  rule: 'clitic-stress',
  plain:
    'The pronouns push the stress to the fourth-last syllable or further back, which Greek does not allow, so a second accent is written two syllables after the original stress.',
};

/** The form with an acute accent on the letter at `at` of its written text. */
function accentForm(form: Form, at: number): Form {
  const parts = [form.augment ?? '', form.stem, form.ending];
  let offset = 0;
  const next = parts.map((part) => {
    const local = at - offset;
    offset += part.length;
    return local >= 0 && local < part.length ? accentAt(part, local) : part;
  });
  return { ...form, ...(form.augment ? { augment: next[0] } : {}), stem: next[1], ending: next[2] };
}

/**
 * An affirmative command with pronouns: the verb, then the pronouns, with the second accent where the rule asks.
 * A short form either joins the pronoun into one word (φάτο) or shortens the verb (δως μου το); neither needs the rule.
 */
function commandWithClitics(verb: GreekVerb, slot: SlotOf<'verb'>, clitics: readonly Clitic[]): Composed {
  const full = inflectVerb(verb, slot);
  const short = slot.shortForm ? shortFormOf(verb, slot) : undefined;
  const shortNote: IrregularNote | undefined = short && { rule: 'short-imperative', plain: short.plain };
  const texts = clitics.map((c) => greekClitic(c));
  if (short?.fuse) {
    const fused = `${short.stem}${short.ending}${texts[0]}`;
    return joined([{ kind: 'fused', text: fused, of: [formText(full), texts[0]] }], { irregular: shortNote });
  }
  const form: Form = short ? { stem: short.stem, ending: short.ending, irregular: shortNote } : full;
  const pieces: Piece[] = [{ kind: 'verb', form }, ...clitics.map((c, i) => cliticPiece(c, texts[i]))];
  const accent = short ? null : secondAccent([formText(form), ...texts]);
  if (!accent) return joined(pieces, shortNote ? { irregular: shortNote } : {});
  if (accent.word === 0) {
    pieces[0] = { kind: 'verb', form: accentForm(form, accent.at) };
  } else {
    const target = pieces[accent.word];
    if (target.kind === 'clitic') pieces[accent.word] = { ...target, text: accentAt(target.text, accent.at) };
  }
  return joined(pieces, { extraAccent: { pieceIndex: accent.word }, irregular: CLITIC_STRESS });
}

/**
 * Builds a verb group in written order: the negation (δεν before θα; μην after να), the particle (θα, να),
 * the auxiliary (έχω) and the lexical verb. A negative command is μην + the pronouns + the subjunctive form
 * (μην το φας); an affirmative command puts its pronouns after the verb (φάε το). See spec 4.3.
 */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
  const problem = slotProblem(verb, slot);
  if (problem) throw new Error(problem);
  const clitics = slot.clitics ?? [];
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
    return joined([
      wordPiece('negation', 'min'),
      ...clitics.map((c) => cliticPiece(c)),
      { kind: 'verb', form: inflectVerb(verb, subjunctive) },
    ]);
  }
  if (clitics.length > 0) return commandWithClitics(verb, slot, clitics);

  const structure = structureOf(slot.mood, slot.tense);
  // μην follows να and ας; δεν goes in front of everything else.
  const afterParticle = slot.mood === 'subjunctive' || slot.mood === 'hortative';
  const negation = negative ? wordPiece('negation', afterParticle ? 'min' : 'den') : null;
  const pieces: Piece[] = [];
  if (negation && !afterParticle) pieces.push(negation);
  if (structure.particle) pieces.push(wordPiece('particle', structure.particle));
  if (negation && afterParticle) pieces.push(negation);
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

/** The group as coloured segments: negation in `neg`, particle and auxiliary in `aux`, pronouns in `clitic`, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich =
      piece.kind === 'verb'
        ? formRich(piece.form)
        : [{ text: piece.text, role: piece.kind === 'negation' ? 'neg' : piece.kind === 'clitic' || piece.kind === 'fused' ? 'clitic' : 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
