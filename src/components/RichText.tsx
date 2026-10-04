import { Fragment } from 'react';
import type { Rich } from '../engine/segments';

/** Whitespace-only segments are plain text nodes, so word spacing survives in the accessible name. */
export function RichText({ rich }: { rich: Rich }) {
  return (
    <>
      {rich.map((segment, i) =>
        segment.text.trim() === '' ? (
          <Fragment key={i}>{segment.text}</Fragment>
        ) : (
          <span key={i} className={`role-${segment.role}`} lang={segment.role === 'notice' ? 'en' : undefined}>
            {segment.text}
          </span>
        ),
      )}
    </>
  );
}
