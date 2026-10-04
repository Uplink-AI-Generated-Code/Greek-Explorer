import type { Divergence, FormGroup, GreekLexeme, Phrase, ReadingTemplate, ReviewItem } from '../types';

export interface RecordSets {
  lexemes: Record<string, GreekLexeme>;
  items: ReviewItem[];
  phrases: Phrase[];
  divergences: Divergence[];
  templates: ReadingTemplate[];
  groups: FormGroup[];
}

/** Every record a speaker still has to check (spec 9), one line each; `--release` fails while this is not empty. */
export function unverifiedRecords(sets: RecordSets): string[] {
  return [
    ...Object.values(sets.lexemes).flatMap((l) =>
      (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]).map((lang) => `lexeme ${l.id} (${lang})`),
    ),
    ...sets.items.filter((r) => !r.verified).map((r) => r.id),
    ...sets.phrases.filter((p) => !p.verified).map((p) => `phrase ${p.id}`),
    ...sets.divergences.filter((d) => !d.verified).map((d) => `divergence ${d.id}`),
    ...sets.templates.filter((t) => !t.verified).map((t) => `reading ${t.rule}`),
    ...sets.groups.filter((g) => !g.verified).map((g) => `group ${g.id}`),
  ];
}
