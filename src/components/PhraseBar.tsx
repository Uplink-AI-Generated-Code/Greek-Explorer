import { getLexeme } from '../data/lexemes';
import { compose } from '../engine/compose';
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  /** The piece of the selected verb group that is pressed; null presses the verb itself. */
  selectedPiece?: number | null;
  onSelect: (index: number, piece?: number) => void;
}

/** The words of a verb group with their kinds, or null for a single word (it needs no pieces). */
function groupPieces(token: Token): { word: string; kind: string }[] | null {
  if (token.slot.pos !== 'verb') return null;
  const lexeme = getLexeme(token.lexeme);
  if (lexeme.pos !== 'verb') return null;
  const { pieces } = compose(lexeme, token.slot);
  const words = token.text.split(' ');
  if (pieces.length < 2 || words.length !== pieces.length) return null;
  return pieces.map((piece, i) => ({ word: words[i], kind: piece.kind }));
}

export function PhraseBar({ tokens, selected, selectedPiece = null, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => {
        const pieces = groupPieces(token);
        if (!pieces) {
          return (
            <button key={i} type="button" className="chip" aria-pressed={i === selected} onClick={() => onSelect(i)}>
              {token.text}
            </button>
          );
        }
        // The verb is the last piece in a tense, the first in an affirmative command with pronouns.
        const verbPiece = Math.max(0, pieces.findIndex((p) => p.kind === 'verb' || p.kind === 'fused'));
        return (
          <span
            key={i}
            role="group"
            aria-label={token.text}
            className={`chip-group${i === selected ? ' is-selected' : ''}`}
          >
            {pieces.map((piece, j) => (
              <button
                key={j}
                type="button"
                className={`chip piece piece-${piece.kind}`}
                aria-pressed={i === selected && (selectedPiece ?? verbPiece) === j}
                onClick={() => onSelect(i, j)}
              >
                {piece.word}
              </button>
            ))}
          </span>
        );
      })}
    </div>
  );
}
