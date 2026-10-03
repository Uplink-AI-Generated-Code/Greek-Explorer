import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  onSelect: (index: number) => void;
}

export function PhraseBar({ tokens, selected, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => (
        <button
          key={i}
          type="button"
          className="chip"
          aria-pressed={i === selected}
          onClick={() => onSelect(i)}
        >
          {token.text}
        </button>
      ))}
    </div>
  );
}
