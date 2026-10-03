import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { getVerb } from './data/lexemes';
import { compose, pieceText } from './engine/compose';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';
import type { Level, Phrase, Slot, Token } from './types';

/** A panel for one piece of a verb group (a particle, a negation or the auxiliary), working on its own copy. */
interface OpenPiece {
  token: Token;
  state: PanelState;
  initial: PanelState;
}

/** The panel to open for piece `index` of the group that `slot` of verb `lexemeId` composes; null for the verb itself. */
function pieceToOpen(lexemeId: string, slot: Slot, index: number): OpenPiece | null {
  if (slot.pos !== 'verb') return null;
  const piece = compose(getVerb(lexemeId), slot).pieces[index];
  if (!piece || piece.kind === 'verb') return null;
  const state: PanelState = { slot: piece.slot, noun: null, nounNumber: 'sg' };
  return { token: { text: pieceText(piece), lexeme: piece.lexeme, slot: piece.slot }, state, initial: state };
}

function pieceKindAt(from: OpenPiece, index: number): string | undefined {
  if (from.state.slot.pos !== 'verb') return undefined;
  return compose(getVerb(from.token.lexeme), from.state.slot).pieces[index]?.kind;
}

/** The piece of the authored token with this kind and lexeme, or -1 when the phrase has none (so nothing is pressed). */
function authoredPiece(authored: Token, lexemeId: string, kind: string | undefined): number {
  if (authored.slot.pos !== 'verb') return -1;
  const pieces = compose(getVerb(authored.lexeme), authored.slot).pieces;
  return pieces.findIndex((p) => p.kind !== 'verb' && p.kind === kind && p.lexeme === lexemeId);
}

/** One phrase: the phrase bar, the gloss rows, the word panel and the comparison. */
export function Explorer({ phrase, level }: { phrase: Phrase; level: Level }) {
  const initial = phrase.tokens.map((t) => initialState(t, phrase));
  const [states, setStates] = useState<PanelState[]>(initial);
  const [selected, setSelected] = useState(0);
  const [piece, setPiece] = useState<number | null>(null);
  const [open, setOpen] = useState<OpenPiece | null>(null);

  const token = phrase.tokens[selected];
  const current: OpenPiece = open ?? { token, state: states[selected], initial: initial[selected] };
  const panel = buildPanel(current.state, current.token, level);
  const divergences = selectDivergences(
    DIVERGENCES,
    current.state.slot.pos,
    current.token.lexeme,
    level,
    current.state.slot,
  );
  const differsFromPhrase = !sameState(current.state, current.initial);

  /** A chip piece or a gloss unit was clicked: select the token and piece; open the piece's own panel unless it is the verb. */
  function select(index: number, pieceIndex?: number) {
    const target = phrase.tokens[index];
    setSelected(index);
    setPiece(pieceIndex ?? null);
    setOpen(pieceIndex === undefined ? null : pieceToOpen(target.lexeme, target.slot, pieceIndex));
  }

  /** A reading part was clicked: open that piece of the form the panel is showing (its current slot, not the phrase's). */
  function openFromReading(pieceIndex: number) {
    const opened = pieceToOpen(current.token.lexeme, current.state.slot, pieceIndex);
    setOpen(opened);
    setPiece(opened ? authoredPiece(token, opened.token.lexeme, pieceKindAt(current, pieceIndex)) : null);
  }

  function back() {
    setOpen(null);
    setPiece(null);
  }

  function changeControl(key: string, value: string) {
    if (open) {
      setOpen({ ...open, state: applyControl(open.state, key, value, open.token.lexeme) });
      return;
    }
    setStates((all) => all.map((s, i) => (i === selected ? applyControl(s, key, value, token.lexeme) : s)));
  }

  function resetToPhrase() {
    if (open) {
      setOpen({ ...open, state: open.initial });
      return;
    }
    setStates((all) => all.map((s, i) => (i === selected ? initial[selected] : s)));
  }

  return (
    <>
      <section className="card" aria-label={phrase.title}>
        <PhraseBar tokens={phrase.tokens} selected={selected} selectedPiece={piece} onSelect={select} />
        <GlossGrid glosses={phrase.glosses} selected={selected} selectedPiece={piece} onSelect={select} />
      </section>
      {differsFromPhrase && (
        <div className="phrase-status" role="status">
          <span>Differs from the phrase.</span>
          <button type="button" onClick={resetToPhrase}>
            Reset to phrase
          </button>
        </div>
      )}
      <WordPanel
        panel={panel}
        onChange={changeControl}
        onBack={open ? back : undefined}
        onPiece={open ? undefined : openFromReading}
      />
      {divergences.length > 0 && <ComparisonTable rows={divergences} word={current.token.text} />}
    </>
  );
}
