import type { SameMeaning } from '../panels/types';
import { MixedText } from './MixedText';
import { RichText } from './RichText';

interface Props {
  strip: SameMeaning;
  /** Chooses a member; without it the rows are shown but cannot be pressed. */
  onMember?: (key: string) => void;
}

type Row = { key: string; label: string; el: SameMeaning['rows'][number]['el']; ro: SameMeaning['rows'][number]['ro']; en: SameMeaning['rows'][number]['en']; current: boolean };

function StripTable({ rows, onMember }: { rows: Row[]; onMember?: (key: string) => void }) {
  return (
    <table className="form-table">
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Form</span>
          </th>
          <th scope="col" lang="el">
            Ελληνικά
          </th>
          <th scope="col" lang="ro">
            Română
          </th>
          <th scope="col" lang="en">
            English
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">
              <button
                type="button"
                className="strip-pick"
                aria-pressed={row.current}
                disabled={!onMember}
                onClick={() => onMember?.(row.key)}
              >
                {row.label}
              </button>
            </th>
            <td lang="el" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.el} />
            </td>
            <td lang="ro" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.ro} />
            </td>
            <td lang="en" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.en} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The forms that mean the same as the command in the panel (spec 5.4); each row is a button that makes it the form in use. */
export function SameMeaningStrip({ strip, onMember }: Props) {
  const notes = strip.rows.flatMap((row) => (row.note ? [`${row.tag}: ${row.note}`] : []));
  return (
    <section className="same-meaning" aria-label="Same meaning">
      <p className="full-title">
        Same meaning: <span lang="en">{strip.meaning}</span> (the outlined row is the form in use)
      </p>
      <StripTable rows={strip.rows.map((row) => ({ ...row, label: row.tag }))} onMember={onMember} />
      {(notes.length > 0 || strip.notes.length > 0) && (
        <ul className="strip-notes">
          {[...notes, ...strip.notes].map((note) => (
            <li key={note}>
              <MixedText text={note} />
            </li>
          ))}
        </ul>
      )}
      {strip.close && (
        <>
          <p className="full-title">Close, not the same</p>
          <StripTable rows={[{ ...strip.close, label: 'bare verb' }]} onMember={onMember} />
          <p className="note">{strip.close.reason}</p>
        </>
      )}
    </section>
  );
}
