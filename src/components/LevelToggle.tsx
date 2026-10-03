import type { Level } from '../types';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'improver', label: 'Improver' },
];

export function LevelToggle({ value, onChange }: { value: Level; onChange: (level: Level) => void }) {
  return (
    <fieldset className="level-toggle">
      <legend className="sr-only">Level</legend>
      {LEVELS.map((l) => (
        <label key={l.value}>
          <input
            type="radio"
            name="level"
            value={l.value}
            checked={value === l.value}
            onChange={() => onChange(l.value)}
          />
          {l.label}
        </label>
      ))}
    </fieldset>
  );
}
