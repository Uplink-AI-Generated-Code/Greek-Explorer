import { inflect } from '../engine/greek';
import { enVerbText } from '../engine/english';
import { memberKind, memberText } from '../engine/groups';
import { EN_PRONOUNS } from '../engine/labels';
import { allVerbSlots } from '../engine/offers';
import { compose } from '../engine/compose';
import { roVerb } from '../engine/romanian';
import { formText, richText } from '../engine/segments';
import { whoIndex } from '../engine/tenses';
import { unitText } from '../glossLinks';
import type { GreekLexeme, GreekVerb, SlotOf } from '../types';
import { type RecordSets, unverifiedRecords } from './unverified';
import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS } from '../data/clitics';
import { greekClitic } from '../engine/clitics';
import { isOffered, slotProblem } from '../engine/offers';
import { pronounSlots, slotsFor } from './validate';

const LANG_NAME = { el: 'Ελληνικά', ro: 'Română', en: 'English' } as const;

/** A verb, tense by tense: the six persons in each language. */
function verbLines(verb: GreekVerb): string[] {
  const groups = new Map<string, SlotOf<'verb'>[]>();
  for (const slot of allVerbSlots(verb)) {
    const key = `${slot.voice} · ${slot.mood} · ${slot.tense}`;
    groups.set(key, [...(groups.get(key) ?? []), slot]);
  }
  return [...groups.entries()].flatMap(([key, slots]) => [
    `- ${key}`,
    `  - ${LANG_NAME.el}: ${slots.map((s) => compose(verb, s).text).join(' · ')}`,
    `  - ${LANG_NAME.ro}: ${slots.map((s) => roVerb(verb, s)).join(' · ')}`,
    `  - ${LANG_NAME.en}: ${slots.map((s) => enVerbText(verb, s, EN_PRONOUNS[whoIndex(s)])).join(' · ')}`,
  ]);
}

/** A command with pronouns, one line per form, with the pronoun sets the validator builds (affirmative, negative, short form). */
function commandLines(verb: GreekVerb): string[] {
  const commands = allVerbSlots(verb).filter((s) => s.mood === 'imperative');
  const slots = commands.flatMap((s) => pronounSlots(verb, s)).filter((s) => isOffered(verb, s) && slotProblem(verb, s) === null);
  if (slots.length === 0) return [];
  return [
    '- commands with pronouns',
    ...slots.map((s) => {
      const label = [s.voice, s.tense, `${s.person}${s.number}`, (s.clitics ?? []).map(greekClitic).join(' + '), s.polarity === 'negative' ? 'negative' : s.shortForm ? 'short form' : 'affirmative'].join(' · ');
      return `  - ${label} — ${LANG_NAME.el}: ${compose(verb, s).text}; ${LANG_NAME.ro}: ${roVerb(verb, s)}; ${LANG_NAME.en}: ${enVerbText(verb, s, '')}`;
    }),
  ];
}

const unique = (values: string[]): string => [...new Set(values)].join(' / ');
const byGender = (cells: Record<string, string>): string => unique(['m', 'f', 'n'].map((g) => cells[g]));

/** The weak pronoun: the tables a reviewer checks for clitic-table:ro-clitics, printed as they are stored. */
function cliticLines(): string[] {
  return [
    'Romanian pronouns (free, attached to a command, after nu):',
    ...Object.entries(RO_CLITICS).map(([key, c]) => `- ${key}: free ${c.free} · attached ${c.enclitic} · after nu ${c.afterNu}`),
    '',
    'Romanian clusters (dative + accusative):',
    ...Object.entries(RO_CLUSTERS).map(([key, c]) => `- ${key}: attached ${c.enclitic} · after nu ${c.afterNu}`),
    '',
    'English pronouns:',
    ...Object.entries(EN_CLITICS).map(([key, cells]) => `- ${key}: ${byGender(cells)}`),
    '',
    'Greek strong forms:',
    ...Object.entries(GREEK_STRONG).map(([key, cells]) => `- ${key}: ${byGender(cells)}`),
  ];
}

/** Any other lexeme: its Greek forms slot by slot, then the stored Romanian and English data as it is. */
function otherLines(l: Exclude<GreekLexeme, GreekVerb>): string[] {
  const greek = slotsFor(l).map((slot) => {
    const { pos: _pos, ...rest } = slot as unknown as Record<string, unknown>;
    return `- ${Object.values(rest).join(' ') || l.pos}: ${formText(inflect(l, slot))}`;
  });
  const stored = ['ro' in l ? `- ${LANG_NAME.ro} (stored): \`${JSON.stringify(l.ro)}\`` : '', 'en' in l ? `- ${LANG_NAME.en} (stored): \`${JSON.stringify(l.en)}\`` : ''];
  return [...greek, ...stored.filter((line) => line !== '')];
}

function lexemeSection(l: GreekLexeme): string[] {
  const missing = (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]);
  if (missing.length === 0) return [];
  return [
    `### ${l.pos === 'verb' ? l.lemma : l.lemma} (${l.id})`,
    `Unverified: ${missing.join(', ')}. Part of speech: ${l.pos}.`,
    '',
    ...(l.pos === 'verb' ? [...verbLines(l), ...commandLines(l)] : l.pos === 'clitic' ? cliticLines() : otherLines(l)),
    '',
  ];
}

/**
 * The content review sheet (spec 9): a checklist of every unverified record, then what a speaker needs to check each one.
 * The review itself is not done here; a record becomes verified when its flag is set in the data.
 */
export function reviewSheet(sets: RecordSets & { pending: string[] }): string {
  const records = unverifiedRecords(sets);
  const lines: string[] = [
    '# Content review sheet',
    '',
    `${records.length} records are not verified. Every Greek, Romanian and English form below was written from memory (spec section 9).`,
    'Check each, then set its `verified` flag in the data. `npm run validate -- --release` passes when every record is verified and no cell is pending.',
    '',
    '## Checklist',
    '',
    ...records.map((r) => `- [ ] ${r}`),
    '',
    '## Review items (ending tables, auxiliary tables, glossaries)',
    '',
    ...sets.items.map((item) => `- ${item.id} (${item.kind})${item.verified ? ' — verified' : ''}`),
    '',
    '## Lexemes',
    '',
    ...Object.values(sets.lexemes).flatMap(lexemeSection),
    '## Phrases',
    '',
    ...sets.phrases.flatMap((phrase) => [
      `### ${phrase.id}: ${phrase.title}${phrase.verified ? ' — verified' : ''}`,
      `Greek: ${phrase.tokens.map((t) => t.text).join(' ')}`,
      ...phrase.glosses.map(
        (row) => `${row.language === 'en' ? 'English' : 'Română'} ${row.kind}: ${row.units.map(unitText).join(' ')}`,
      ),
      '',
    ]),
    '## Comparison notes',
    '',
    ...sets.divergences.map(
      (d) => `- ${d.id} (${d.point}, ${d.tag}${d.verified ? ', verified' : ''}) — ${LANG_NAME.el}: ${d.el}; ${LANG_NAME.ro}: ${d.ro}; ${LANG_NAME.en}: ${d.en}`,
    ),
    '',
    '## Authored readings',
    '',
    ...sets.templates.flatMap((t) => [`### ${t.rule}`, `- Beginner: ${t.beginner}`, `- Improver: ${t.improver}`, '']),
    '## Form groups',
    '',
    ...sets.groups.flatMap((group) => [
      `### ${group.meaning}`,
      ...group.members.map((member) => {
        const text = memberText(member);
        return `- ${memberKind(member)}: ${richText(text.el)} · ${text.ro} · ${text.en}${member.note ? ` (${member.note})` : ''}`;
      }),
      ...(group.closeNotSame
        ? [
            (() => {
              const text = memberText({ verb: group.closeNotSame.verb });
              return `- close, not the same: ${richText(text.el)} · ${text.ro} · ${text.en} (${group.closeNotSame.reason})`;
            })(),
          ]
        : []),
      '',
    ]),
    '## Pending Romanian cells',
    '',
    'These must be filled in before release (the panel shows "not yet added").',
    '',
    ...sets.pending.map((cell) => `- ${cell}`),
    '',
  ];
  return lines.join('\n');
}
