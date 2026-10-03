import { linkedToken } from '../glossLinks';
import type { GlossRow, Link } from '../types';

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
              {row.units.map((unit, j) =>
                unit.link === null ? (
                  <span key={j} className="gloss-unit is-gap">
                    {unit.text}
                  </span>
                ) : (
                  <button
                    key={j}
                    type="button"
                    className="gloss-unit"
                    aria-pressed={linkedToken(unit.link) === selected}
                    onClick={() => onSelect(linkedToken(unit.link as Link))}
                  >
                    {unit.text}
                  </button>
                ),
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
