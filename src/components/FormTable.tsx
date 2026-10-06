import type { PanelRow } from '../panels/panels';
import { MixedText } from './MixedText';
import { RichText } from './RichText';

export function FormTable({ rows }: { rows: PanelRow[] }) {
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
        {rows.map((row) =>
          row.dimmed ? (
            <tr key={row.label} className="is-dim">
              <th scope="row">
                <MixedText text={row.label} />
              </th>
              <td lang="en" colSpan={3}>
                {row.dimmed}
              </td>
            </tr>
          ) : (
            <tr key={row.label}>
              <th scope="row">
                <MixedText text={row.label} />
              </th>
              <td lang="el" className={row.hl?.el ? 'cur' : undefined} aria-current={row.hl?.el ? 'true' : undefined}>
                <RichText rich={row.el} />
              </td>
              <td lang="ro" className={row.hl?.ro ? 'cur' : undefined} aria-current={row.hl?.ro ? 'true' : undefined}>
                <RichText rich={row.ro} />
              </td>
              <td lang="en" className={row.hl?.en ? 'cur' : undefined} aria-current={row.hl?.en ? 'true' : undefined}>
                <RichText rich={row.en} />
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}
