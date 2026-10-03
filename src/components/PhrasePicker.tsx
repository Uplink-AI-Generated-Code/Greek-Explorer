import type { Phrase } from '../types';

interface Props {
  phrases: Phrase[];
  value: number;
  onChange: (index: number) => void;
}

export function PhrasePicker({ phrases, value, onChange }: Props) {
  const themes = [...new Set(phrases.map((p) => p.theme))];
  return (
    <div className="phrase-picker">
      <label htmlFor="phrase-select">Phrase</label>
      <select id="phrase-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {themes.map((theme) => (
          <optgroup key={theme} label={theme}>
            {phrases.map((p, i) =>
              p.theme === theme ? (
                <option key={p.id} value={i}>
                  {p.title}
                </option>
              ) : null,
            )}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
