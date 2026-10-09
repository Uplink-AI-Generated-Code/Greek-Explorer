import { isSegmented, linkedPiece, linkedToken } from '../glossLinks';
import type { GlossRow, Link } from '../types';

interface Props {
  glosses: GlossRow[];
  selected: number;
  /** The selected piece of the selected verb group; null means the token as a whole. */
  selectedPiece?: number | null;
  onSelect: (index: number, piece?: number) => void;
}

const LANGUAGE_NAME = { en: 'English', ro: 'Română' } as const;

/**
 * A unit is lit when it links to the selected token and, with a piece selected, to that piece or to the whole
 * token (a unit that covers the whole token, like Romanian mâncasem, covers every piece).
 */
function isPressed(link: Link, selected: number, piece: number | null): boolean {
  if (linkedToken(link) !== selected) return false;
  const linked = linkedPiece(link);
  return piece === null || linked === null || linked === piece;
}

const choose = (link: Link, onSelect: Props['onSelect']): void =>
  typeof link === 'number' ? onSelect(link) : onSelect(link.token, link.piece);

export function GlossGrid({ glosses, selected, selectedPiece = null, onSelect }: Props) {
  return (
    <div className="gloss-grid">
      {glosses.map((row, i) => {
        const firstOfLanguage = i === 0 || glosses[i - 1].language !== row.language;
        return (
          <div className="gloss-row" key={`${row.language}-${row.kind}`} lang={row.language}>
            <span className="gloss-language">{firstOfLanguage ? LANGUAGE_NAME[row.language] : ''}</span>
            <span className="gloss-kind">{row.kind}</span>
            <span className="gloss-units">
              {row.units.map((unit, j) => {
                if (isSegmented(unit)) {
                  return (
                    <span key={j} className="gloss-unit gloss-segmented">
                      {unit.segments.map((segment, k) => {
                        const segmentLink = segment.link;
                        if (segmentLink === null) {
                          return (
                            <span key={k} className="gloss-segment is-gap">
                              ({segment.text})
                            </span>
                          );
                        }
                        return (
                          <button
                            key={k}
                            type="button"
                            className="gloss-segment"
                            aria-pressed={isPressed(segmentLink, selected, selectedPiece)}
                            onClick={() => choose(segmentLink, onSelect)}
                          >
                            {segment.text}
                          </button>
                        );
                      })}
                    </span>
                  );
                }
                const link = unit.link;
                if (link === null) {
                  return (
                    <span key={j} className="gloss-unit is-gap">
                      {unit.text}
                    </span>
                  );
                }
                return (
                  <button
                    key={j}
                    type="button"
                    className="gloss-unit"
                    aria-pressed={isPressed(link, selected, selectedPiece)}
                    onClick={() => choose(link, onSelect)}
                  >
                    {unit.text}
                  </button>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
