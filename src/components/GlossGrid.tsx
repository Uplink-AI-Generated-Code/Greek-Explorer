import { isSegmented, linkedToken } from '../glossLinks';
import type { GlossRow } from '../types';

interface Props {
  glosses: GlossRow[];
  selected: number;
  onSelect: (index: number) => void;
}

const LANGUAGE_NAME = { en: 'English', ro: 'Română' } as const;

export function GlossGrid({ glosses, selected, onSelect }: Props) {
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
                      {unit.segments.map((segment, k) => (
                        <button
                          key={k}
                          type="button"
                          className="gloss-segment"
                          aria-pressed={linkedToken(segment.link) === selected}
                          onClick={() => onSelect(linkedToken(segment.link))}
                        >
                          {segment.text}
                        </button>
                      ))}
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
                    aria-pressed={linkedToken(link) === selected}
                    onClick={() => onSelect(linkedToken(link))}
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
