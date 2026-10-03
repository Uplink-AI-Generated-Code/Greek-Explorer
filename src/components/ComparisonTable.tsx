import type { Divergence, Level, Pos } from '../types';

export function selectDivergences(all: Divergence[], pos: Pos, lexemeId: string, level: Level): Divergence[] {
  return all.filter(
    (d) =>
      d.appliesTo.pos === pos &&
      (d.appliesTo.lexeme === undefined || d.appliesTo.lexeme === lexemeId) &&
      (level === 'improver' || d.level === 'core'),
  );
}

export function ComparisonTable({ rows, word }: { rows: Divergence[]; word: string }) {
  return (
    <section className="card" aria-label="Comparison">
      <p className="compare-title">
        Compare: <span lang="el">{word}</span>
      </p>
      <table className="form-table">
        <thead>
          <tr>
            <th scope="col">Point</th>
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
          {rows.map((d) => (
            <tr key={d.id}>
              <th scope="row">
                {d.point} <span className={`tag tag-${d.tag}`}>{d.tag}</span>
              </th>
              <td lang="el">{d.el}</td>
              <td lang="ro">{d.ro}</td>
              <td lang="en">{d.en}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
