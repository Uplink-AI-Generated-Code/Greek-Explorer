import type { Panel, Related } from '../panels/panels';
import { FormTable } from './FormTable';

interface Props {
  panel: Panel;
  onChange: (key: string, value: string) => void;
  /** Given while a piece panel is open: returns to the verb's own panel. */
  onBack?: () => void;
  /** Given while the verb's own panel is showing: opens the particle, negation or auxiliary named by a reading part. */
  onPiece?: (piece: number) => void;
  /** The label of the way back; defaults to "Back to the verb". */
  backLabel?: string;
  /** Opens the panel's related panel (a participle's verb, ένας for κανένας). */
  onRelated?: (related: Related) => void;
}

/** English text with Greek words in it: the Greek runs get lang="el" so a screen reader pronounces them. */
function MixedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/([\u0370-\u03FF\u1F00-\u1FFF]+)/).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} lang="el">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function WordPanel({ panel, onChange, onBack, onPiece, backLabel = 'Back to the verb', onRelated }: Props) {
  const { related } = panel;
  return (
    <section className="card word-panel" aria-label="Word panel">
      {onBack && (
        <button type="button" className="back-link" onClick={onBack}>
          ← <MixedText text={backLabel} />
        </button>
      )}
      <h2 lang="el">{panel.lemma}</h2>
      <p className="pos-label">
        {panel.posLabel}
        {panel.badge && (
          <>
            {' '}
            <span className="badge">{panel.badge}</span>
          </>
        )}
      </p>
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
      {related && onRelated && (
        <p className="related">
          <MixedText text={related.text} />{' '}
          <button type="button" className="back-link" onClick={() => onRelated(related)}>
            <MixedText text={related.button} />
          </button>
        </p>
      )}
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
