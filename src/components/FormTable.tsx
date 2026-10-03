import type { PanelRow } from '../panels/panels';
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
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td lang="el">
              <RichText rich={row.el} />
            </td>
            <td lang="ro">
              <RichText rich={row.ro} />
            </td>
            <td lang="en">
              <RichText rich={row.en} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
