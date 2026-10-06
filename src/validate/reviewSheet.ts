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
import { RECIPIENTS } from '../engine/objects';
import { nounPhrase, ownAlone, ownPhrase } from '../engine/agree';
import { POSSESSORS } from '../engine/possessive';
import { RO_ALONE, RO_OWN, RO_POSSESSIVES } from '../data/possessives';
import type { Clitic, GreekAdjective, GreekInterrogative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
import { type RecordSets, unverifiedRecords } from './unverified';
import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
import { greekClitic } from '../engine/clitics';
import { isOffered, slotProblem } from '../engine/offers';
import { pronounSlots, slotsFor } from './validate';

/** One line of the Romanian pronoun table: every position the pronoun can take. */
const roForms = (c: RoClitic): string =>
  `free ${c.free} · attached ${c.enclitic} · after nu ${c.afterNu} · after să ${c.afterSa} · fused ${c.fused || '—'} · behind the participle ${c.after || '—'}`;

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

const verbSlotOf = (mood: string, tense: string, person: 1 | 2 | 3, number: 'sg' | 'pl', clitics: Clitic[], polarity?: 'negative'): SlotOf<'verb'> =>
  ({ pos: 'verb', person, number, mood, tense, voice: 'active', clitics, ...(polarity ? { polarity } : {}) }) as SlotOf<'verb'>;

/** Romanian forms built from the pronoun table, for a feminine and a masculine pronoun, and for the pair with each recipient. */
function generatedFormLines(lexemes: Record<string, GreekLexeme>): string[] {
  const lines = ['Romanian forms with pronouns (generated):'];
  const troo = lexemes.troo;
  const dino = lexemes.dino;
  const it = (roGender: 'f' | 'm'): Clitic => ({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender });
  if (troo?.pos === 'verb') {
    const cases: [string, string, string, 1 | 2 | 3, 'sg' | 'pl', 'negative'?][] = [
      ['present', 'indicative', 'present', 1, 'sg'],
      ['present negative', 'indicative', 'present', 1, 'sg', 'negative'],
      ['perfect', 'indicative', 'perfect', 1, 'sg'],
      ['perfect negative', 'indicative', 'perfect', 1, 'sg', 'negative'],
      ['simple future', 'indicative', 'futureSimple', 1, 'sg'],
      ['subjunctive aorist', 'subjunctive', 'aorist', 1, 'sg'],
      ['subjunctive aorist negative', 'subjunctive', 'aorist', 1, 'sg', 'negative'],
      ['conditional imperfect', 'conditional', 'imperfect', 1, 'sg'],
      ['conditional pluperfect', 'conditional', 'pluperfect', 1, 'sg'],
      ['hortative aorist 1pl', 'hortative', 'aorist', 1, 'pl'],
    ];
    lines.push(`- ${troo.lemma}: tense · masculine pronoun · feminine pronoun`);
    for (const [label, mood, tense, person, number, polarity] of cases) {
      const text = (roGender: 'f' | 'm') => roVerb(troo, verbSlotOf(mood, tense, person, number, [it(roGender)], polarity));
      lines.push(`  - ${label} · ${text('m')} · ${text('f')}`);
    }
  }
  if (dino?.pos === 'verb') {
    lines.push(`- ${dino.lemma} with a recipient and a feminine pronoun`);
    for (const r of RECIPIENTS) {
      for (const [label, tense] of [['simple future 2sg', 'futureSimple'], ['perfect 2sg', 'perfect']] as const) {
        const slot = verbSlotOf('indicative', tense, 2, 'sg', [r.clitic, it('f')]);
        lines.push(`  - ${r.label} · ${label} · ${roVerb(dino, slot)}`);
      }
    }
  }
  return lines;
}

/** The weak pronoun: the tables a reviewer checks for clitic-table:ro-clitics, printed as they are stored. */
function cliticLines(lexemes: Record<string, GreekLexeme>): string[] {
  return [
    'Romanian pronouns (free, attached to a command, after nu, after să, fused with an auxiliary, behind the participle):',
    ...Object.entries(RO_CLITICS).map(([key, c]) => `- ${key}: ${roForms(c)}`),
    '',
    'Romanian clusters (dative + accusative):',
    ...Object.entries(RO_CLUSTERS).map(([key, c]) => `- ${key}: ${roForms(c)}`),
    '',
    'English pronouns:',
    ...Object.entries(EN_CLITICS).map(([key, cells]) => `- ${key}: ${byGender(cells)}`),
    '',
    'Greek strong forms:',
    ...Object.entries(GREEK_STRONG).map(([key, cells]) => `- ${key}: ${byGender(cells)}`),
    '',
    ...generatedFormLines(lexemes),
  ];
}

/** A question word: its example, its answer use, the fused Romanian words after a preposition, and the pairs Romanian builds. */
function interrogativeLines(l: GreekInterrogative, lexemes: Record<string, GreekLexeme>): string[] {
  const example = (e: { el: string; ro: string; en: string }) => `${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`;
  const pairs = Object.values(lexemes)
    .flatMap((p) => (p.pos === 'preposition' && !p.fused ? [p] : []))
    .map((p) =>
      l.roAfter?.[p.id]
        ? `- ${LANG_NAME.ro} after ${p.lemma} (stored): ${p.lemma} ${l.lemma}: ${l.roAfter[p.id]}`
        : `- ${LANG_NAME.ro} after ${p.lemma} (generated): ${p.lemma} ${l.lemma}: ${p.ro} ${l.ro}`,
    );
  return [
    `- Question: ${example(l.question)}`,
    ...(l.answer ? [`- Answer: ${example(l.answer)}`] : []),
    ...pairs,
  ];
}

/** A preposition that fuses with the article (σε): the six fused forms, the στη rule and each meaning with its example. */
function prepositionLines(l: GreekPreposition): string[] {
  const example = (e: { el: string; ro: string; en: string }) => `${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`;
  const fused = l.fused
    ? [
        '- fused forms with the article:',
        ...(['m', 'f', 'n'] as const).flatMap((g) =>
          (['sg', 'pl'] as const).map((n) => `  - ${GENDER_NAME[g]} ${n === 'sg' ? 'singular' : 'plural'}: ${l.fused?.[g][n]}`),
        ),
        `- the feminine ${l.fused.f.sg} becomes ${l.fused.f.sg.replace(/ν$/, '')} before most consonants (στη θάλασσα)`,
      ]
    : [];
  const senses = (l.senses ?? []).map(
    (s) => `- meaning ${s.value} (${s.label}): ${LANG_NAME.ro}: ${s.ro || 'the dative case'}; ${LANG_NAME.en}: ${s.en}; example — ${example(s.example)}`,
  );
  return [...fused, ...senses];
}

const GENDER_NAME = { m: 'masc.', f: 'fem.', n: 'neut.' } as const;

/** Any other lexeme: its Greek forms slot by slot, then the stored Romanian and English data as it is. */
function otherLines(l: Exclude<GreekLexeme, GreekVerb>): string[] {
  const greek = slotsFor(l).map((slot) => {
    const { pos: _pos, ...rest } = slot as unknown as Record<string, unknown>;
    return `- ${Object.values(rest).join(' ') || l.pos}: ${formText(inflect(l, slot))}`;
  });
  const stored = ['ro' in l ? `- ${LANG_NAME.ro} (stored): \`${JSON.stringify(l.ro)}\`` : '', 'en' in l ? `- ${LANG_NAME.en} (stored): \`${JSON.stringify(l.en)}\`` : ''];
  return [...greek, ...stored.filter((line) => line !== '')];
}

/** The Romanian possessives by possessor, and every noun with every possessor in the three languages (spec 9). */
function possessiveLines(lexemes: Record<string, GreekLexeme>): string[] {
  const table = Object.entries(RO_POSSESSIVES).map(
    ([key, entry]) =>
      `- ${key}: ${typeof entry === 'string' ? entry : `${entry.m.sg} · ${entry.m.pl} · ${entry.f.sg} · ${entry.f.pl} (masculine singular, masculine plural, feminine singular, feminine plural)`}`,
  );
  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
  const phrases = nouns.flatMap((noun) =>
    (['sg', 'pl'] as const).flatMap((number) => {
      const all = POSSESSORS.map((p) => nounPhrase(noun, number, 'nom', { article: 'definite', possessor: p.slot }));
      const gen = POSSESSORS.map((p) => nounPhrase(noun, number, 'gen', { article: 'definite', possessor: p.slot }));
      return [
        `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}):`,
        `  - ${LANG_NAME.el}: ${all.map((n) => richText(n.el)).join(' · ')}`,
        `  - ${LANG_NAME.ro}: ${all.map((n) => n.ro).join(' · ')}`,
        `  - ${LANG_NAME.en}: ${all.map((n) => n.en).join(' · ')}`,
        `  - ${LANG_NAME.el}, genitive: ${gen.map((n) => richText(n.el)).join(' · ')}`,
        `  - ${LANG_NAME.ro}, genitive: ${gen.map((n) => n.ro).join(' · ')}`,
        `  - ${LANG_NAME.en}, genitive: ${gen.map((n) => n.en).join(' · ')}`,
      ];
    }),
  );
  return ['- Romanian possessives (they agree with the possessed noun):', ...table, '- Noun phrases with each possessor, nominative and genitive (generated):', ...phrases];
}

/** δικός: the Romanian *propriu* and *al meu* words, and every noun with every possessor before the noun and on its own (spec 9, 24). */
function ownLines(adj: GreekAdjective, lexemes: Record<string, GreekLexeme>): string[] {
  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
  const table = (words: typeof RO_OWN) => `masc. sg ${words.m.sg} · masc. pl ${words.m.pl} · fem. sg ${words.f.sg} · fem. pl ${words.f.pl}`;
  const phrases = nouns.flatMap((noun) =>
    (['sg', 'pl'] as const).flatMap((number) => {
      const before = POSSESSORS.map((p) => ownPhrase(adj, noun, number, 'nom', p.slot));
      const alone = POSSESSORS.map((p) => ownAlone(adj, noun, number, 'nom', p.slot));
      return [
        `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}):`,
        `  - ${LANG_NAME.el}, before the noun: ${before.map((n) => richText(n.el)).join(' · ')}`,
        `  - ${LANG_NAME.ro}, before the noun: ${before.map((n) => n.ro).join(' · ')}`,
        `  - ${LANG_NAME.en}, before the noun: ${before.map((n) => n.en).join(' · ')}`,
        `  - ${LANG_NAME.el}, on its own: ${alone.map((n) => richText(n.el)).join(' · ')}`,
        `  - ${LANG_NAME.ro}, on its own: ${alone.map((n) => n.ro).join(' · ')}`,
        `  - ${LANG_NAME.en}, on its own: ${alone.map((n) => n.en).join(' · ')}`,
      ];
    }),
  );
  return [
    `- Romanian propriu with its article (nominative): ${table(RO_OWN)}`,
    `- Romanian word before the possessive on its own: ${table(RO_ALONE)}`,
    '- Noun phrases with each possessor (generated):',
    ...phrases,
  ];
}

/** Every noun owned by every noun, in the three languages (spec 9, 24). */
function ownerLines(lexemes: Record<string, GreekLexeme>): string[] {
  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
  return nouns.flatMap((noun) => {
    const all = nouns.map((owner) => nounPhrase(noun, 'sg', 'nom', { article: 'definite', owner }));
    return [
      `- ${noun.lemma}:`,
      `  - ${LANG_NAME.el}: ${all.map((n) => richText(n.el)).join(' · ')}`,
      `  - ${LANG_NAME.ro}: ${all.map((n) => n.ro).join(' · ')}`,
      `  - ${LANG_NAME.en}: ${all.map((n) => n.en).join(' · ')}`,
    ];
  });
}

function lexemeSection(l: GreekLexeme, lexemes: Record<string, GreekLexeme>): string[] {
  const missing = (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]);
  if (missing.length === 0) return [];
  return [
    `### ${l.pos === 'verb' ? l.lemma : l.lemma} (${l.id})`,
    `Unverified: ${missing.join(', ')}. Part of speech: ${l.pos}.`,
    '',
    ...(l.pos === 'verb' ? [...verbLines(l), ...commandLines(l)] : l.pos === 'clitic' ? cliticLines(lexemes) : [
      ...otherLines(l),
      ...(l.pos === 'interrogative' ? interrogativeLines(l, lexemes) : []),
      ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
      ...(l.pos === 'possessive' ? possessiveLines(lexemes) : []),
      ...(l.pos === 'adjective' && l.emphatic ? ownLines(l, lexemes) : []),
    ]),
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
    ...Object.values(sets.lexemes).flatMap((l) => lexemeSection(l, sets.lexemes)),
    '## Noun possessors (generated)',
    '',
    'Each noun in the singular nominative, owned by each noun in the genitive (the owners in the order of the nouns listed here).',
    '',
    ...ownerLines(sets.lexemes),
    '',
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
