/** English text with Greek words in it: the Greek runs get lang="el" so a screen reader pronounces them. */
export function MixedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/([Ͱ-Ͽἀ-῿]+)/).map((part, i) =>
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
