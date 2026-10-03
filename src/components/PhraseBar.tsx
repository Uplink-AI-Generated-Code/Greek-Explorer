import { Fragment } from 'react';
import { getLexeme } from '../data/lexemes';
import { compose } from '../engine/compose';
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  onSelect: (index: number) => void;
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

export function PhraseBar({ tokens, selected, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => {
        const pieces = groupPieces(token);
        return (
          <button
            key={i}
            type="button"
            className="chip"
            aria-pressed={i === selected}
            onClick={() => onSelect(i)}
          >
            {pieces
              ? pieces.map((piece, j) => (
                  <Fragment key={j}>
                    {j > 0 && ' '}
                    <span className={`piece piece-${piece.kind}`}>{piece.word}</span>
                  </Fragment>
                ))
              : token.text}
          </button>
        );
      })}
    </div>
  );
}
