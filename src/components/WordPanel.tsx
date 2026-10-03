import type { Panel } from '../panels/panels';
import { FormTable } from './FormTable';

interface Props {
  panel: Panel;
  onChange: (key: string, value: string) => void;
  /** Given while a piece panel is open: returns to the verb's own panel. */
  onBack?: () => void;
  /** Given while the verb's own panel is showing: opens the particle, negation or auxiliary named by a reading part. */
  onPiece?: (piece: number) => void;
}

export function WordPanel({ panel, onChange, onBack, onPiece }: Props) {
  return (
    <section className="card word-panel" aria-label="Word panel">
      {onBack && (
        <button type="button" className="back-link" onClick={onBack}>
          ← Back to the verb
        </button>
      )}
      <h2 lang="el">{panel.lemma}</h2>
      <p className="pos-label">{panel.posLabel}</p>
      <div className="controls">
        {panel.controls.map((control) => {
          const id = `control-${control.key}`;
          return (
            <div className="control" key={control.key}>
              <label htmlFor={id}>{control.label}</label>
              <select id={id} value={control.value} onChange={(e) => onChange(control.key, e.target.value)}>
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <FormTable rows={panel.rows} />
      <p className="legend">
        <span className="role-article">blue</span> article, numeral or English pronoun ·{' '}
        <span className="role-ending">amber</span> ending · <span className="role-dim">dashed</span> optional or dropped
      </p>
      <p className="plain">{panel.plain}</p>
      {panel.reading && panel.reading.length > 0 && (
        <section className="reading" aria-label="How to read this">
          <p className="full-title">How to read this</p>
          {panel.reading.map((line) => (
            <div className="reading-line" key={line.lang}>
              <p className="reading-parts" lang={line.lang}>
                {line.parts.map((part, i) => {
                  const className = `reading-part reading-${part.role}`;
                  const opens =
                    onPiece !== undefined &&
                    line.lang === 'el' &&
                    part.piece !== null &&
                    (part.role === 'particle' || part.role === 'negation' || part.role === 'auxiliary');
                  return opens ? (
                    <button
                      key={i}
                      type="button"
                      className={className}
                      aria-label={`${part.text}: ${part.gloss}`}
                      onClick={() => onPiece(part.piece as number)}
                    >
                      {part.label}
                    </button>
                  ) : (
                    <span key={i} className={className}>
                      {part.label}
                    </span>
                  );
                })}
              </p>
              <p className="reading-text" lang={line.lang === 'el' ? undefined : line.lang}>{line.sentence}</p>
            </div>
          ))}
        </section>
      )}
      {panel.irregular && <p className="warn">{panel.irregular}</p>}
      {panel.note && <p className="note">Gender and form: {panel.note}</p>}
      {panel.full.length > 0 && (
        <>
          <p className="full-title">Full paradigm: the outlined cell is the form in use</p>
          <FormTable rows={panel.full} />
        </>
      )}
      {panel.overview && panel.overview.length > 0 && (
        <>
          <p className="full-title">All tenses for this person: the outlined form is the one in use</p>
          <FormTable rows={panel.overview} />
        </>
      )}
    </section>
  );
}
