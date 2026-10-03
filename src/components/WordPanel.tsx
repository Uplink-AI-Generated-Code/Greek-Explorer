import type { Panel } from '../panels/panels';
import { FormTable } from './FormTable';

interface Props {
  panel: Panel;
  onChange: (key: string, value: string) => void;
}

export function WordPanel({ panel, onChange }: Props) {
  return (
    <section className="card word-panel" aria-label="Word panel">
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
