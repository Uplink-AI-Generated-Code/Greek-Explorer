import type { Rich } from '../engine/segments';

export function RichText({ rich }: { rich: Rich }) {
  return (
    <>
      {rich.map((segment, i) => (
        <span key={i} className={`role-${segment.role}`}>
          {segment.text}
        </span>
      ))}
    </>
  );
}
