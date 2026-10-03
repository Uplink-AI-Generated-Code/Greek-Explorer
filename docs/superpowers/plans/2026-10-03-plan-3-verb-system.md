# Verb System Implementation Plan (Plan 3 of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every verb form the spec's tenses, moods and voices call for, except negation and clitics: single-word Greek forms from stems plus shared ending tables, `compose()` for particle + auxiliary + verb groups, generated Romanian and English compounds, a verb panel with Mood / When / Voice controls and a tense overview, verb chips that show their pieces, and 19 new phrases (4, 5, 6, 11 to 15, 17 to 19, 22 to 24, 26 to 29 and 31 of the spec).

**Architecture:** `inflectVerb(lexeme, slot)` returns one `Form` (now with an `augment`) for the lexical verb of any slot; `compose(verb, slot)` wraps it with the particle (θα, να) and the auxiliary (έχω) in written order. A verb lexeme holds one or two voices; each voice stores stems (a present stem, strong and weak past stems, a perfective stem), a class, per-cell overrides, `offers` (the slots its panel may show), and the lexical Romanian and English forms. Romanian and English compound tenses are generated from shared auxiliary tables. The panel works on a copy of the slot as before (Plan 2's `PanelState`).

**Tech Stack:** Vite, React, TypeScript (strict), Vitest, Testing Library, tsx (all as in Plans 1 and 2).

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 4.2 to 4.5, 5.1, 5.3, 6.2, 6.4, 6.5 and 6.6; the conditional is in 6.5, the clitic rows are not used here).

## Global Constraints

- The spec is the authority; the plan argues from it. Where the plan departs from the spec the departure is listed under "Departures from the spec" below.
- TypeScript strict. No `any`. No `sed -i` (macOS): use the Edit tool or a short Python script.
- Before every commit run `npx vitest run && npm run typecheck`, and commit only when both are green. Stage files by explicit path (never `git add -A`; the untracked `.claude/` folder must not be committed). Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Every new lexeme starts with `verified: { el: false, ro: false, en: false }`; every new phrase and divergence note starts with `verified: false`; every new ending or auxiliary table gets a `ReviewItem` with `verified: false`. All Greek, Romanian and English content in this plan was written from memory. Tests check that the engine does what the data says, not that the language is right (spec section 9).
- A whitespace-only rich-text segment must be a plain text node when rendered (`RichText` already does this); spaces between pieces are their own `{ text: ' ', role: 'plain' }` segments.
- Colour is never the only signal: dimmed overview rows carry a text reason; the form in use carries `aria-current`.
- Greek forms are monotonic and are written with the accent on the stem or on the ending exactly as they appear in the finished word.

## Scope of this plan

In:

- Slot dimensions `mood`, `tense` and `voice` for verbs, with the 15 mood and tense combinations of spec 4.2: indicative (present, imperfect, aorist, future, futureSimple, perfect, pluperfect, futurePerfect), subjunctive (present, aorist, perfect), imperative (present, aorist; second person only) and conditional (imperfect, pluperfect). Voices active and mediopassive.
- Single-word forms from stems and ending tables (present, imperfect, aorist, aorist subjunctive, both imperatives, and the invariable base form of the perfect tenses); the strong and weak past stems; per-cell overrides.
- `compose()` for particle (θα, να) + auxiliary (έχω) + verb, and the two particle lexemes.
- Romanian and English lexical forms per verb and the generators for every tense.
- New lexemes: τρώω, πάω, έχω, πλένω (active and mediopassive), κοιμάμαι (deponent), μπορεί (impersonal) and the noun ψωμί.
- The verb panel (controls, plain-language line, irregularity message, full table, tense overview) and a minimal particle panel.
- Verb tokens that are verb groups (one token, one chip with coloured pieces) and gloss links to a piece of a verb token (`{ token, piece }`), checked by the validator.
- 19 phrases and the divergence notes for the new tenses, selected by the slot's mood, tense and voice.

Out (later plans):

- Negation (δεν, μην, να μην), the negative imperative and the "Negated" control; the copula είμαι, αν / *dacă*, the passive participle, quantifiers and the `pending` marker; phrases 7 to 10, 16, 20, 21, 25, 30, 32, 33 and 39 (Plan 5).
- Clicking a piece of a verb chip, the particle and auxiliary panels reached from a chip, "Back to the verb", "how to read this" lines and readings (Plan 4). The pieces are shown in colour in this plan; they are not yet separate buttons.
- Clitics, shortened forms, form groups and the Same-meaning strip; phrases 34 to 38 (Plan 6). The content review of all unverified records is Plan 6.

## Departures from the spec

1. **One lexeme per verb, with a voice dimension.** The spec's inventory lists "πλένω and πλένομαι" and 6.2 says such lexemes are linked. Here πλένω is one lexeme with an `active` and a `mediopassive` voice, because voice is already a slot dimension (4.2) and one lexeme keeps the voice control and the data together. κοιμάμαι is a lexeme with only a mediopassive voice. If the review prefers two linked lexemes the change is confined to `lexemes.ts` and `voiceOf`.
2. **Plan numbering.** The first plans spoke of "Plans 3 to 5". Splitting the verb system from the pieces UI and readings makes six plans: 4 = pieces, readings and negation, 5 = quantifiers, copula, participles, αν and `pending`, 6 = clitics, form groups and the content review.
3. **English future.** The continuous future (θα τρώω) and the simple future (θα φάω) both generate "will eat". English has no aspect marker for the future here; the tense overview shows the two cells equal, and a divergence note says why.
4. **Mass noun ψωμί.** The noun panel's second row for ψωμί reads "a bread" in English. The spec calls bread a mass noun; a "some bread" row belongs to the quantifier work in Plan 5.
5. **Mediopassive Romanian perfect.** Romanian reflexive clitics fuse with the auxiliary (*m-am spălat*). Until Plan 6 adds the clitic-cluster table, the reflexive voice stores its perfect cells (`ro.perfect`) and offers only the tenses that need no fusion.

## File structure

New:

- `src/engine/tenses.ts`: moods, tenses, the `STRUCTURE` table (particle, auxiliary, which stored form the lexical verb contributes), `whoIndex`.
- `src/engine/offers.ts`: `voiceOf`, `offeredVoices/Moods/Tenses/Who`, `isOffered`, `allVerbSlots`.
- `src/engine/compose.ts`: `Piece`, `Composed`, `compose`, `pieceText`, `composedRich`.
- `src/panels/particle.ts`: the minimal particle panel.
- Tests: `src/engine/offers.test.ts`, `tenses.test.ts`, `compose.test.ts`, `verbs-ro-en.test.ts`, `src/panels/verb.test.ts`, `src/data/phrases-verbs.test.ts`.

Modified: `src/types.ts`, `src/data/paradigms.ts`, `lexemes.ts`, `review.ts`, `phrases.ts`, `divergences.ts`, `src/engine/greek.ts`, `segments.ts`, `romanian.ts`, `english.ts`, `labels.ts`, `src/panels/verb.ts`, `panels.ts`, `types.ts`, `src/validate/validate.ts`, `src/components/PhraseBar.tsx`, `FormTable.tsx`, `WordPanel.tsx`, `ComparisonTable.tsx`, `src/Explorer.tsx`, `src/styles.css`, `scripts/validate.ts`, and the tests named in each task.

---

### Task 1: The verb model, tenses, offers and single-word Greek forms

**Files:**

- Create: `src/engine/tenses.ts`, `src/engine/offers.ts`, `src/engine/offers.test.ts`, `src/engine/tenses.test.ts`
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/greek.ts`, `src/engine/greek.test.ts`, `src/engine/segments.ts`, `src/engine/romanian.ts`, `src/engine/english.ts`, `src/panels/verb.ts`, `src/validate/validate.ts`, `src/styles.css`

**Interfaces:**

- Consumes: Plan 1 and 2's `Form`, `Slot`, `GreekVerb`, `inflect`, `VERB_PRESENT`, `getLexeme`.
- Produces:
  - Types: `Mood`, `Tense`, `Voice`, `StemPair`, `PastStems`, `VerbStems`, `CellOverride`, `RoVerbForms`, `EnVerbForms`, `VerbVoice`, `GreekParticle`; `Form.augment?`; the verb `Slot` with `mood: Mood; tense: Tense; voice: Voice`; the slot `{ pos: 'particle' }`; `VerbClass` of six members.
  - `src/engine/tenses.ts`: `MOODS`, `TENSES_OF_MOOD`, `FormKind`, `Structure`, `STRUCTURE`, `mainFormKind(mood, tense)`, `whoIndex(slot)`.
  - `src/engine/offers.ts`: `voiceOf(verb, voice)`, `offeredVoices(verb)`, `offeredMoods(verb, voice)`, `offeredTenses(verb, voice, mood)`, `offeredWho(verb, voice, mood)` (strings such as `'2sg'`), `isOffered(verb, slot)`, `allVerbSlots(verb)`.
  - `inflectVerb(verb, slot): Form` for every verb slot (the form the lexical verb contributes); `inflectParticle`; `formText(form)` in `segments.ts`; `Role` gains `'augment'` and `'aux'`; `getVerb(id)`; lexemes `theta` and `na`; `thelo` and `pidao` in the new shape with all their stems.

- [ ] **Step 1: Write the failing tests for the offers and tenses modules**

Create `src/engine/tenses.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { MOODS, STRUCTURE, TENSES_OF_MOOD, mainFormKind, whoIndex } from './tenses';

describe('tenses', () => {
  it('has the 15 mood and tense combinations of the spec', () => {
    expect(MOODS).toEqual(['indicative', 'subjunctive', 'imperative', 'conditional']);
    expect(MOODS.flatMap((m) => TENSES_OF_MOOD[m])).toHaveLength(15);
    expect(Object.keys(STRUCTURE)).toHaveLength(15);
  });

  it('says which stored form the lexical verb contributes', () => {
    expect(mainFormKind('indicative', 'present')).toBe('present');
    expect(mainFormKind('indicative', 'future')).toBe('present');
    expect(mainFormKind('indicative', 'futureSimple')).toBe('subjAorist');
    expect(mainFormKind('indicative', 'perfect')).toBe('base');
    expect(mainFormKind('subjunctive', 'present')).toBe('present');
    expect(mainFormKind('subjunctive', 'aorist')).toBe('subjAorist');
    expect(mainFormKind('subjunctive', 'perfect')).toBe('base');
    expect(mainFormKind('imperative', 'present')).toBe('impPresent');
    expect(mainFormKind('imperative', 'aorist')).toBe('impAorist');
    expect(mainFormKind('conditional', 'imperfect')).toBe('imperfect');
    expect(mainFormKind('conditional', 'pluperfect')).toBe('base');
  });

  it('rejects a combination that is not a Greek tense', () => {
    expect(() => mainFormKind('imperative', 'future')).toThrow('imperative future is not a Greek tense');
  });

  it('numbers the six persons 1sg 2sg 3sg 1pl 2pl 3pl', () => {
    expect(whoIndex({ person: 1, number: 'sg' })).toBe(0);
    expect(whoIndex({ person: 3, number: 'sg' })).toBe(2);
    expect(whoIndex({ person: 1, number: 'pl' })).toBe(3);
    expect(whoIndex({ person: 3, number: 'pl' })).toBe(5);
  });
});
```

Create `src/engine/offers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { GreekVerb, Person, SlotOf, Tense, VerbVoice } from '../types';
import { allVerbSlots, isOffered, offeredMoods, offeredTenses, offeredVoices, offeredWho, voiceOf } from './offers';

const thelo = getVerb('thelo');
const slot = (mood: SlotOf<'verb'>['mood'], tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg') =>
  ({ pos: 'verb', person, number, mood, tense, voice: 'active' }) as const;

/** θέλω with the active voice's offers (and optional extra fields) replaced. */
const withVoice = (extra: Partial<VerbVoice>): GreekVerb => ({
  ...thelo,
  voices: { active: { ...(thelo.voices.active as VerbVoice), ...extra } },
});

describe('offers', () => {
  it('lists voices, moods and tenses in their canonical order', () => {
    expect(offeredVoices(thelo)).toEqual(['active']);
    expect(offeredMoods(thelo, 'active')).toEqual(['indicative', 'subjunctive', 'conditional']);
    expect(offeredTenses(thelo, 'active', 'indicative')).toEqual([
      'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
    ]);
    expect(offeredTenses(thelo, 'active', 'imperative')).toEqual([]);
  });

  it('voiceOf throws for a voice the verb does not have', () => {
    expect(voiceOf(thelo, 'active').class).toBe('omega');
    expect(() => voiceOf(thelo, 'mediopassive')).toThrow('thelo has no mediopassive voice');
  });

  it('isOffered checks voice, mood and tense', () => {
    expect(isOffered(thelo, slot('indicative', 'present'))).toBe(true);
    expect(isOffered(thelo, slot('conditional', 'pluperfect'))).toBe(true);
    expect(isOffered(thelo, slot('imperative', 'aorist', 2))).toBe(false);
    expect(isOffered(thelo, { ...slot('indicative', 'present'), voice: 'mediopassive' })).toBe(false);
  });

  it('offers the imperative to the second person only', () => {
    const verb = withVoice({ offers: { imperative: ['present', 'aorist'] } });
    expect(isOffered(verb, slot('imperative', 'aorist', 2))).toBe(true);
    expect(isOffered(verb, slot('imperative', 'aorist', 2, 'pl'))).toBe(true);
    expect(isOffered(verb, slot('imperative', 'aorist', 1))).toBe(false);
    expect(isOffered(verb, slot('imperative', 'aorist', 3, 'pl'))).toBe(false);
    expect(offeredWho(verb, 'active', 'imperative')).toEqual(['2sg', '2pl']);
  });

  it('offers an impersonal verb in the third person singular only', () => {
    const verb = withVoice({ offers: { indicative: ['present'] }, thirdSingularOnly: true });
    expect(isOffered(verb, slot('indicative', 'present', 3))).toBe(true);
    expect(isOffered(verb, slot('indicative', 'present', 1))).toBe(false);
    expect(offeredWho(verb, 'active', 'indicative')).toEqual(['3sg']);
  });

  it('offers all six persons otherwise', () => {
    expect(offeredWho(thelo, 'active', 'indicative')).toEqual(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']);
  });

  it('lists every offered slot once', () => {
    const slots = allVerbSlots(thelo);
    expect(slots).toHaveLength(13 * 6);
    expect(new Set(slots.map((s) => JSON.stringify(s))).size).toBe(13 * 6);
    expect(slots.every((s) => isOffered(thelo, s))).toBe(true);
  });
});
```

- [ ] **Step 2: Add the failing Greek engine tests**

In `src/engine/greek.test.ts` replace the import on line 2 (the `../data/lexemes` import) with the one below, and add the two new imports after the `./greek` import on line 3:

```ts
import { DEF_ARTICLE, NUMERAL, getAdjective, getLexeme, getNoun, getVerb } from '../data/lexemes';
```

```ts
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { formText } from './segments';
```

Then append at the end of the file:

```ts
const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const WHO: [Person, Num][] = [[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']];
const words = (verbId: string, mood: Mood, tense: Tense) =>
  WHO.map(([p, n]) => formText(inflectVerb(getVerb(verbId), vs(mood, tense, p, n))));

describe('inflectVerb: past forms (θέλω and πηδάω)', () => {
  it('θέλω imperfect: ήθελα … θέλαμε (the augment goes with the stress)', () => {
    expect(words('thelo', 'indicative', 'imperfect')).toEqual(['ήθελα', 'ήθελες', 'ήθελε', 'θέλαμε', 'θέλατε', 'ήθελαν']);
  });
  it('θέλω aorist: θέλησα … θελήσαμε', () => {
    expect(words('thelo', 'indicative', 'aorist')).toEqual(['θέλησα', 'θέλησες', 'θέλησε', 'θελήσαμε', 'θελήσατε', 'θέλησαν']);
  });
  it('πηδάω imperfect: πηδούσα … (no augment)', () => {
    expect(words('pidao', 'indicative', 'imperfect')).toEqual(['πηδούσα', 'πηδούσες', 'πηδούσε', 'πηδούσαμε', 'πηδούσατε', 'πηδούσαν']);
  });
  it('πηδάω aorist: πήδηξα … πηδήξαμε', () => {
    expect(words('pidao', 'indicative', 'aorist')).toEqual(['πήδηξα', 'πήδηξες', 'πήδηξε', 'πηδήξαμε', 'πηδήξατε', 'πήδηξαν']);
  });
  it('keeps the augment as its own part of the form', () => {
    expect(inflect(getVerb('thelo'), vs('indicative', 'imperfect'))).toMatchObject({ augment: 'ή', stem: 'θελ', ending: 'α' });
    expect(inflect(getVerb('thelo'), vs('indicative', 'imperfect', 1, 'pl'))).toMatchObject({ stem: 'θέλ', ending: 'αμε' });
    expect(inflect(getVerb('thelo'), vs('indicative', 'imperfect', 1, 'pl')).augment).toBeUndefined();
  });
  it('notes the stress shift in the plural forms that lose their augment or move their accent', () => {
    expect(inflect(getVerb('thelo'), vs('indicative', 'imperfect', 1, 'pl')).irregular?.rule).toBe('stress-shift');
    expect(inflect(getVerb('pidao'), vs('indicative', 'aorist', 1, 'pl')).irregular?.rule).toBe('stress-shift');
    expect(inflect(getVerb('thelo'), vs('indicative', 'imperfect', 1, 'sg')).irregular).toBeUndefined();
    expect(inflect(getVerb('pidao'), vs('indicative', 'imperfect', 1, 'pl')).irregular).toBeUndefined();
  });
});

describe('inflectVerb: the perfective stem (aorist subjunctive and the base form)', () => {
  it('θέλω aorist subjunctive: θελήσω … θελήσουν', () => {
    expect(words('thelo', 'subjunctive', 'aorist')).toEqual(['θελήσω', 'θελήσεις', 'θελήσει', 'θελήσουμε', 'θελήσετε', 'θελήσουν']);
  });
  it('the simple future uses the aorist subjunctive form', () => {
    expect(words('thelo', 'indicative', 'futureSimple')).toEqual(words('thelo', 'subjunctive', 'aorist'));
  });
  it('the subjunctive present and the continuous future use the present forms', () => {
    expect(words('thelo', 'subjunctive', 'present')).toEqual(words('thelo', 'indicative', 'present'));
    expect(words('thelo', 'indicative', 'future')).toEqual(words('thelo', 'indicative', 'present'));
  });
  it('the perfect tenses use one invariable base form for every person', () => {
    expect(formText(inflectVerb(getVerb('pidao'), vs('indicative', 'perfect', 3, 'sg')))).toBe('πηδήξει');
    for (const [mood, tense] of [
      ['indicative', 'perfect'], ['indicative', 'pluperfect'], ['indicative', 'futurePerfect'],
      ['subjunctive', 'perfect'], ['conditional', 'pluperfect'],
    ] as const) {
      expect(new Set(words('thelo', mood, tense))).toEqual(new Set(['θελήσει']));
    }
  });
  it('the conditional uses the imperfect form', () => {
    expect(formText(inflectVerb(getVerb('thelo'), vs('conditional', 'imperfect')))).toBe('ήθελα');
  });
});

describe('inflectVerb: refusals', () => {
  it('commands are for "you" only', () => {
    expect(() => inflectVerb(getVerb('thelo'), vs('imperative', 'aorist', 1))).toThrow('commands are for "you" only');
  });
  it('a class with no imperative has no imperative form', () => {
    expect(() => inflectVerb(getVerb('pidao'), vs('imperative', 'present', 2))).toThrow('no pidao impPresent form');
  });
  it('a voice the verb does not have is refused', () => {
    expect(() => inflectVerb(getVerb('thelo'), vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toThrow(
      'thelo has no mediopassive voice',
    );
  });
});

describe('inflectParticle', () => {
  it('the whole word is the stem', () => {
    expect(inflect(getLexeme('theta'), { pos: 'particle' })).toEqual({ stem: 'θα', ending: '' });
    expect(inflect(getLexeme('na'), { pos: 'particle' })).toEqual({ stem: 'να', ending: '' });
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `npx vitest run src/engine/offers.test.ts src/engine/tenses.test.ts src/engine/greek.test.ts`
Expected: FAIL (missing modules `./tenses` and `./offers`, missing `getVerb`).

- [ ] **Step 4: Widen the types**

In `src/types.ts`:

1. Replace the `Form` interface with:

```ts
/** A Greek form split for display. The ending is highlighted in the UI. */
export interface Form {
  /** The past-tense prefix (έ- in έτρωγα, ή- in ήθελα). */
  augment?: string;
  stem: string;
  ending: string;
  irregular?: IrregularNote;
}
```

2. After the `NumeralValue` line add:

```ts
export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional';
// Indicative: present, imperfect, aorist, future (θα + present), futureSimple (θα + aorist subjunctive),
// perfect, pluperfect, futurePerfect. Subjunctive: present, aorist, perfect. Imperative: present, aorist
// (second person only). Conditional: imperfect (θα + imperfect) and pluperfect (θα + pluperfect).
export type Tense =
  | 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple' | 'perfect' | 'pluperfect' | 'futurePerfect';
export type Voice = 'active' | 'mediopassive';
```

3. In the `Slot` union replace the verb line and add the particle:

```ts
  | { pos: 'verb'; person: Person; number: Num; mood: Mood; tense: Tense; voice: Voice }
```

and, after the preposition line, add `  | { pos: 'particle' }`. The union then ends:

```ts
  | { pos: 'preposition' }
  | { pos: 'particle' };
```

4. Replace the whole `VerbClass` / `GreekVerb` block (from `export type VerbClass` through the closing `}` of `GreekVerb`) with:

```ts
export type VerbClass = 'omega' | 'contracted-ao' | 'athematic' | 'mediopassive' | 'deponent' | 'impersonal';

/** A past-tense stem, with its augment when it has one (έ + τρωγ). */
export interface StemPair {
  augment?: string;
  stem: string;
}

/** Past stems: `strong` for 1sg, 2sg, 3sg and 3pl; `weak` for 1pl and 2pl, where the stress moves and the augment goes. */
export interface PastStems {
  strong: StemPair;
  weak: StemPair;
}

export interface VerbStems {
  present: string;
  imperfect?: PastStems;
  /** The indicative aorist (έφαγα). */
  aorist?: PastStems;
  /** The stem of the aorist subjunctive, the aorist imperative and the base form of the perfect tenses (φά-, πλύν-). */
  perfective?: string;
}

/** A cell that breaks its class pattern; the whole cell is stored. */
export interface CellOverride {
  augment?: string;
  stem: string;
  ending: string;
  note?: IrregularNote;
}

/** Lexical Romanian forms; compound tenses are generated from these. Six cells are 1sg 2sg 3sg 1pl 2pl 3pl. */
export interface RoVerbForms {
  lemma: string;
  /** The infinitive without "a" (mânca). */
  infinitive: string;
  participle: string;
  present: readonly string[];
  /** Without "să" (the generator adds it). */
  subjunctive: readonly string[];
  imperfect: readonly string[];
  pluperfect: readonly string[];
  imperative?: readonly [singular: string, plural: string];
  /** Stored perfect cells for reflexive verbs, whose clitic fuses with the auxiliary (m-am spălat). */
  perfect?: readonly string[];
}

export interface EnVerbForms {
  /** "to ___" in the Beginner label. */
  gloss: string;
  base: string;
  third: string;
  past: string;
  pastParticiple: string;
  ing: string;
  /** Adds "(myself)" and its person forms. */
  reflexive?: boolean;
}

/** Everything a verb stores for one voice. */
export interface VerbVoice {
  lemma: string;
  class: VerbClass;
  stems: VerbStems;
  /** Cells keyed '<kind>.<person><number>' ('present.2sg'), or 'base'. */
  overrides?: Record<string, CellOverride>;
  /** The slots the panel may offer, per mood. */
  offers: Partial<Record<Mood, Tense[]>>;
  /** Impersonal verbs (μπορεί) have one slot: the third person singular. */
  thirdSingularOnly?: boolean;
  ro: RoVerbForms;
  en: EnVerbForms;
}

export interface GreekVerb extends LexemeBase {
  pos: 'verb';
  voices: Partial<Record<Voice, VerbVoice>>;
}

export interface GreekParticle extends LexemeBase {
  pos: 'particle';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  example: { el: string; ro: string; en: string };
}
```

5. Add `GreekParticle` to the lexeme union:

```ts
export type GreekLexeme =
  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle;
```

- [ ] **Step 5: Replace the present-tense table with the verb ending tables**

In `src/data/paradigms.ts` replace the whole `VERB_PRESENT` declaration (the doc comment and the `export const VERB_PRESENT … };` block) with:

```ts
/** Endings in the order 1sg 2sg 3sg 1pl 2pl 3pl; null = no such form (impersonal verbs). */
type Endings = readonly (string | null)[];
const NONE: Endings = [null, null, null, null, null, null];

/** Present active (and mediopassive) endings. The stem carries the accent where the class has none of its own. */
export const VERB_PRESENT: Record<VerbClass, Endings> = {
  omega: ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  /** Contracted verbs: the stressed ending replaces the -ω endings (πηδάω, πηδάς, πηδάει …). */
  'contracted-ao': ['άω', 'άς', 'άει', 'άμε', 'άτε', 'άνε'],
  /** τρώω, πάω: the endings attach straight to a stem ending in a vowel (τρώ-με). */
  athematic: ['ω', 'ς', 'ει', 'με', 'τε', 'νε'],
  mediopassive: ['ομαι', 'εσαι', 'εται', 'όμαστε', 'εστε', 'ονται'],
  deponent: ['άμαι', 'άσαι', 'άται', 'όμαστε', 'άστε', 'ούνται'],
  impersonal: [null, null, 'εί', null, null, null],
};

/** Imperfect endings. */
export const VERB_IMPERFECT: Record<VerbClass, Endings> = {
  omega: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  'contracted-ao': ['ούσα', 'ούσες', 'ούσε', 'ούσαμε', 'ούσατε', 'ούσαν'],
  athematic: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  mediopassive: ['όμουν', 'όσουν', 'όταν', 'όμασταν', 'όσασταν', 'όνταν'],
  deponent: ['όμουν', 'όσουν', 'όταν', 'όμασταν', 'όσασταν', 'όνταν'],
  impersonal: NONE,
};

/** Indicative aorist endings. */
export const VERB_AORIST: Record<VerbClass, Endings> = {
  omega: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  'contracted-ao': ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  athematic: ['α', 'ες', 'ε', 'αμε', 'ατε', 'αν'],
  mediopassive: ['ηκα', 'ηκες', 'ηκε', 'ήκαμε', 'ήκατε', 'ηκαν'],
  deponent: ['ηκα', 'ηκες', 'ηκε', 'ήκαμε', 'ήκατε', 'ηκαν'],
  impersonal: NONE,
};

/** Aorist subjunctive endings, added to the perfective stem. */
export const VERB_SUBJ_AORIST: Record<VerbClass, Endings> = {
  omega: ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  'contracted-ao': ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  athematic: ['ω', 'ς', 'ει', 'με', 'τε', 'νε'],
  mediopassive: ['ώ', 'είς', 'εί', 'ούμε', 'είτε', 'ούν'],
  deponent: ['ώ', 'είς', 'εί', 'ούμε', 'είτε', 'ούν'],
  impersonal: NONE,
};

/** Imperative endings (second person singular, plural); null = the class has no imperative here. */
export const VERB_IMPERATIVE: Record<
  VerbClass,
  { present: readonly [string, string] | null; aorist: readonly [string, string] | null }
> = {
  omega: { present: ['ε', 'ετε'], aorist: ['ε', 'ετε'] },
  'contracted-ao': { present: null, aorist: null },
  athematic: { present: ['ε', 'τε'], aorist: ['ε', 'τε'] },
  mediopassive: { present: null, aorist: null },
  deponent: { present: null, aorist: null },
  impersonal: { present: null, aorist: null },
};

/** The ending of the invariable base form used by the perfect tenses (φάει, πλυθεί). */
export const VERB_BASE: Record<VerbClass, string | null> = {
  omega: 'ει',
  'contracted-ao': 'ει',
  athematic: 'ει',
  mediopassive: 'εί',
  deponent: 'εί',
  impersonal: null,
};
```

- [ ] **Step 6: Create the tenses module**

Create `src/engine/tenses.ts`:

```ts
import type { Mood, Num, Person, Tense } from '../types';

export const MOODS: Mood[] = ['indicative', 'subjunctive', 'imperative', 'conditional'];

export const TENSES_OF_MOOD: Record<Mood, Tense[]> = {
  indicative: ['present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect'],
  subjunctive: ['present', 'aorist', 'perfect'],
  imperative: ['present', 'aorist'],
  conditional: ['imperfect', 'pluperfect'],
};

/** Which stored form of the lexical verb a slot uses. */
export type FormKind = 'present' | 'imperfect' | 'aorist' | 'subjAorist' | 'impPresent' | 'impAorist' | 'base';

export interface Structure {
  /** The lexical verb's contribution. */
  form: FormKind;
  particle?: 'theta' | 'na';
  /** έχω, in the present or the imperfect, carrying the person. */
  aux?: 'present' | 'imperfect';
}

/** How each mood and tense is built (spec 4.3), keyed '<mood>.<tense>'. */
export const STRUCTURE: Record<string, Structure> = {
  'indicative.present': { form: 'present' },
  'indicative.imperfect': { form: 'imperfect' },
  'indicative.aorist': { form: 'aorist' },
  'indicative.future': { form: 'present', particle: 'theta' },
  'indicative.futureSimple': { form: 'subjAorist', particle: 'theta' },
  'indicative.perfect': { form: 'base', aux: 'present' },
  'indicative.pluperfect': { form: 'base', aux: 'imperfect' },
  'indicative.futurePerfect': { form: 'base', particle: 'theta', aux: 'present' },
  'subjunctive.present': { form: 'present', particle: 'na' },
  'subjunctive.aorist': { form: 'subjAorist', particle: 'na' },
  'subjunctive.perfect': { form: 'base', particle: 'na', aux: 'present' },
  'imperative.present': { form: 'impPresent' },
  'imperative.aorist': { form: 'impAorist' },
  'conditional.imperfect': { form: 'imperfect', particle: 'theta' },
  'conditional.pluperfect': { form: 'base', particle: 'theta', aux: 'imperfect' },
};

export function structureOf(mood: Mood, tense: Tense): Structure {
  const structure = STRUCTURE[`${mood}.${tense}`];
  if (!structure) throw new Error(`${mood} ${tense} is not a Greek tense`);
  return structure;
}

export const mainFormKind = (mood: Mood, tense: Tense): FormKind => structureOf(mood, tense).form;

/** 0 to 5 for 1sg 2sg 3sg 1pl 2pl 3pl. */
export const whoIndex = (who: { person: Person; number: Num }): number =>
  who.person - 1 + (who.number === 'pl' ? 3 : 0);
```

- [ ] **Step 7: Create the offers module**

Create `src/engine/offers.ts`:

```ts
import type { GreekVerb, Mood, SlotOf, Tense, Voice, VerbVoice } from '../types';
import { MOODS, TENSES_OF_MOOD } from './tenses';

const VOICES: Voice[] = ['active', 'mediopassive'];
const WHO = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

export function voiceOf(verb: GreekVerb, voice: Voice): VerbVoice {
  const data = verb.voices[voice];
  if (!data) throw new Error(`${verb.id} has no ${voice} voice`);
  return data;
}

export const offeredVoices = (verb: GreekVerb): Voice[] => VOICES.filter((v) => verb.voices[v]);

export function offeredMoods(verb: GreekVerb, voice: Voice): Mood[] {
  const offers = voiceOf(verb, voice).offers;
  return MOODS.filter((mood) => (offers[mood]?.length ?? 0) > 0);
}

export function offeredTenses(verb: GreekVerb, voice: Voice, mood: Mood): Tense[] {
  const offered = voiceOf(verb, voice).offers[mood] ?? [];
  return TENSES_OF_MOOD[mood].filter((tense) => offered.includes(tense));
}

/** The persons the panel's Who? control may offer for a mood: '1sg' … '3pl'. */
export function offeredWho(verb: GreekVerb, voice: Voice, mood: Mood): string[] {
  if (voiceOf(verb, voice).thirdSingularOnly) return ['3sg'];
  if (mood === 'imperative') return ['2sg', '2pl'];
  return [...WHO];
}

export function isOffered(verb: GreekVerb, s: SlotOf<'verb'>): boolean {
  const data = verb.voices[s.voice];
  if (!data) return false;
  if (!(data.offers[s.mood] ?? []).includes(s.tense)) return false;
  return offeredWho(verb, s.voice, s.mood).includes(`${s.person}${s.number}`);
}

/** Every slot the verb offers, voice by voice, mood by mood, tense by tense, person by person. */
export function allVerbSlots(verb: GreekVerb): SlotOf<'verb'>[] {
  return offeredVoices(verb).flatMap((voice) =>
    offeredMoods(verb, voice).flatMap((mood) =>
      offeredTenses(verb, voice, mood).flatMap((tense) =>
        offeredWho(verb, voice, mood).map(
          (who): SlotOf<'verb'> => ({
            pos: 'verb',
            person: Number(who[0]) as 1 | 2 | 3,
            number: who.slice(1) as 'sg' | 'pl',
            mood,
            tense,
            voice,
          }),
        ),
      ),
    ),
  );
}
```

- [ ] **Step 8: Add `augment` and `aux` to the rich-text roles**

In `src/engine/segments.ts` replace the `Role` line, `formRich` and add `formText`:

```ts
export type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim' | 'sub' | 'augment' | 'aux';
```

```ts
export const formText = (f: Form): string => `${f.augment ?? ''}${f.stem}${f.ending}`;

export function formRich(f: Form): Rich {
  const out: Rich = [];
  if (f.augment) out.push({ text: f.augment, role: 'augment' });
  out.push({ text: f.stem, role: 'stem' });
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}
```

(`formRich` replaces the existing function; `formText` is new.)

In `src/styles.css` replace the line `.role-article, .role-pronoun { … }` so it also covers `.role-aux`, and add a rule for the augment right after the `.role-ending` rule:

```css
.role-article, .role-pronoun, .role-aux { background: var(--accent-bg); color: var(--accent-text); border-radius: 4px; padding: 0 3px; }
.role-ending { background: var(--warn-bg); color: var(--warn-text); border-radius: 4px; padding: 0 3px; }
.role-augment { color: var(--warn-text); border-bottom: 2px dotted var(--warn-text); }
```

- [ ] **Step 9: Write the single-word verb engine**

In `src/engine/greek.ts` replace the import block at the top with:

```ts
import {
  ADJ_STRESSED,
  ADJ_UNSTRESSED,
  ARTICLE_DEF,
  NOUN_CLASSES,
  NOUN_NOTES,
  NUMERAL_FORMS,
  VERB_AORIST,
  VERB_BASE,
  VERB_IMPERATIVE,
  VERB_IMPERFECT,
  VERB_PRESENT,
  VERB_SUBJ_AORIST,
} from '../data/paradigms';
import type {
  Form,
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
  GreekPreposition,
  GreekVerb,
  IrregularNote,
  PastStems,
  Slot,
  SlotOf,
  StemPair,
} from '../types';
import { voiceOf } from './offers';
import { mainFormKind, whoIndex } from './tenses';
```

Replace the whole `inflectVerb` function with the code below, and add `inflectParticle` after `inflectPreposition`:

```ts
const STRESS_SHIFT: IrregularNote = {
  rule: 'stress-shift',
  plain:
    'In the "we" and "you (pl.)" forms the stress moves toward the end of the word, so the past-tense prefix drops out and the stem takes the accent.',
};

function pick(table: readonly (string | null)[], index: number, what: string): string {
  const ending = table[index];
  if (ending === null || ending === undefined) throw new Error(`no ${what} form`);
  return ending;
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`no ${what}`);
  return value;
}

function pastForm(stems: PastStems | undefined, table: readonly (string | null)[], index: number, what: string): Form {
  const past = need(stems, `${what} stem`);
  const weak = index === 3 || index === 4;
  const pair: StemPair = weak ? past.weak : past.strong;
  const form: Form = { stem: pair.stem, ending: pick(table, index, what) };
  if (pair.augment) form.augment = pair.augment;
  if (weak && (past.strong.augment !== undefined || past.strong.stem !== past.weak.stem)) form.irregular = STRESS_SHIFT;
  return form;
}

/** The form the lexical verb contributes to a slot (compose adds the particle and the auxiliary). */
export function inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form {
  const v = voiceOf(l, s.voice);
  const kind = mainFormKind(s.mood, s.tense);
  const index = whoIndex(s);
  const what = `${l.id} ${kind}`;
  const key = kind === 'base' ? 'base' : `${kind}.${s.person}${s.number}`;
  const override = v.overrides?.[key];
  if (override) {
    const form: Form = { stem: override.stem, ending: override.ending };
    if (override.augment) form.augment = override.augment;
    if (override.note) form.irregular = override.note;
    return form;
  }
  switch (kind) {
    case 'present':
      return { stem: v.stems.present, ending: pick(VERB_PRESENT[v.class], index, what) };
    case 'imperfect':
      return pastForm(v.stems.imperfect, VERB_IMPERFECT[v.class], index, what);
    case 'aorist':
      return pastForm(v.stems.aorist, VERB_AORIST[v.class], index, what);
    case 'subjAorist':
      return {
        stem: need(v.stems.perfective, `${what} stem`),
        ending: pick(VERB_SUBJ_AORIST[v.class], index, what),
      };
    case 'impPresent':
    case 'impAorist': {
      if (s.person !== 2) throw new Error('commands are for "you" only');
      const table = VERB_IMPERATIVE[v.class][kind === 'impPresent' ? 'present' : 'aorist'];
      if (!table) throw new Error(`no ${what} form`);
      const stem = kind === 'impPresent' ? v.stems.present : need(v.stems.perfective, `${what} stem`);
      return { stem, ending: table[s.number === 'sg' ? 0 : 1] };
    }
    case 'base': {
      const ending = VERB_BASE[v.class];
      if (!ending) throw new Error(`no ${what} form`);
      return { stem: need(v.stems.perfective, `${what} stem`), ending };
    }
  }
}

export function inflectParticle(l: GreekParticle, _s: SlotOf<'particle'>): Form {
  return { stem: l.lemma, ending: '' };
}
```

In the `inflect` dispatcher add the particle case at the end of the `switch`:

```ts
    case 'particle':
      return inflectParticle(l, s as SlotOf<'particle'>);
```

- [ ] **Step 10: Move θέλω and πηδάω to the new shape and add the particle lexemes**

In `src/data/lexemes.ts`: add `GreekParticle`, `GreekVerb` (already imported), `Tense` to the type import, and add near the top of the verb section (before `const thelo`):

```ts
const INDICATIVE_ALL: Tense[] = [
  'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
];
const SUBJUNCTIVE_ALL: Tense[] = ['present', 'aorist', 'perfect'];
const CONDITIONAL_ALL: Tense[] = ['imperfect', 'pluperfect'];
const IMPERATIVE_ALL: Tense[] = ['present', 'aorist'];
/** Every mood except the imperative, which only some verbs offer. */
const OFFERS_NO_IMPERATIVE = { indicative: INDICATIVE_ALL, subjunctive: SUBJUNCTIVE_ALL, conditional: CONDITIONAL_ALL };
```

Replace the `thelo` and `pidao` declarations with:

```ts
const thelo: GreekVerb = {
  id: 'thelo',
  pos: 'verb',
  lemma: 'θέλω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'θέλω',
      class: 'omega',
      stems: {
        present: 'θέλ',
        imperfect: { strong: { augment: 'ή', stem: 'θελ' }, weak: { stem: 'θέλ' } },
        aorist: { strong: { stem: 'θέλησ' }, weak: { stem: 'θελήσ' } },
        perfective: 'θελήσ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a vrea',
        infinitive: 'vrea',
        participle: 'vrut',
        present: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vor'],
        subjunctive: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vrea'],
        imperfect: ['voiam', 'voiai', 'voia', 'voiam', 'voiați', 'voiau'],
        pluperfect: ['voisem', 'voiseși', 'voise', 'voiserăm', 'voiserăți', 'voiseră'],
      },
      en: { gloss: 'want', base: 'want', third: 'wants', past: 'wanted', pastParticiple: 'wanted', ing: 'wanting' },
    },
  },
};

const pidao: GreekVerb = {
  id: 'pidao',
  pos: 'verb',
  lemma: 'πηδάω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πηδάω',
      class: 'contracted-ao',
      stems: {
        present: 'πηδ',
        imperfect: { strong: { stem: 'πηδ' }, weak: { stem: 'πηδ' } },
        aorist: { strong: { stem: 'πήδηξ' }, weak: { stem: 'πηδήξ' } },
        perfective: 'πηδήξ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a sări',
        infinitive: 'sări',
        participle: 'sărit',
        present: ['sar', 'sari', 'sare', 'sărim', 'săriți', 'sar'],
        subjunctive: ['sar', 'sari', 'sară', 'sărim', 'săriți', 'sară'],
        imperfect: ['săream', 'săreai', 'sărea', 'săream', 'săreați', 'săreau'],
        pluperfect: ['sărisem', 'săriseși', 'sărise', 'săriserăm', 'săriserăți', 'săriseră'],
      },
      en: { gloss: 'jump', base: 'jump', third: 'jumps', past: 'jumped', pastParticiple: 'jumped', ing: 'jumping' },
    },
  },
};

const theta: GreekParticle = {
  id: 'theta',
  pos: 'particle',
  lemma: 'θα',
  verified: { el: false, ro: false, en: false },
  ro: 'voi / aș (+ verb)',
  en: 'will / would',
  meaning: 'Marks the future (θα φάω) and, with a past tense, "would" (θα έτρωγα).',
  example: { el: 'θα φάω', ro: 'voi mânca', en: 'will eat' },
};

const na: GreekParticle = {
  id: 'na',
  pos: 'particle',
  lemma: 'να',
  verified: { el: false, ro: false, en: false },
  ro: 'să (+ verb)',
  en: 'to / that',
  meaning: 'Introduces a wish, a purpose or a possibility: Greek has no infinitive, so "to eat" is "να φάω".',
  example: { el: 'να φάω', ro: 'să mănânc', en: 'to eat' },
};
```

Add `[theta.id]: theta,` and `[na.id]: na,` to the `LEXEMES` record (after `[gia.id]: gia,`), and add after `getAdjective` (copy its shape):

```ts
export function getVerb(id: string): GreekVerb {
  const l = getLexeme(id);
  if (l.pos !== 'verb') throw new Error(`lexeme ${id} is a ${l.pos}, not a verb`);
  return l;
}
```

Add `GreekParticle` and `Tense` to the existing `import type { … } from '../types'` block at the top of `lexemes.ts` (keep it alphabetical: `GreekParticle` after `GreekNumeral`, `Tense` after `GreekVerb`).

- [ ] **Step 11: Update the code that read the old verb shape**

`src/engine/romanian.ts`: replace the `roVerb` function (and add the import) with this temporary present-tense version; Task 4 replaces it with the full generator:

```ts
import { voiceOf } from './offers';
import { whoIndex } from './tenses';
```

```ts
export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  return voiceOf(v, s.voice).ro.present[whoIndex(s)];
}
```

`src/engine/english.ts`: replace `enVerb` and add the import (Task 4 replaces it too):

```ts
import { voiceOf } from './offers';
```

```ts
export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  const en = voiceOf(v, s.voice).en;
  return s.person === 3 && s.number === 'sg' ? en.third : en.base;
}
```

`src/panels/verb.ts`: replace the top of the file down to the end of `verbRow` so it reads the class from the voice and imports `whoIndex` from the tenses module. The file's imports become:

```ts
import { enVerb } from '../engine/english';
import { inflectVerb } from '../engine/greek';
import { EN_PRONOUNS, GREEK_PRONOUNS, RO_PRONOUNS, whoOptions } from '../engine/labels';
import { voiceOf } from '../engine/offers';
import { roVerb } from '../engine/romanian';
import { formRich } from '../engine/segments';
import { whoIndex } from '../engine/tenses';
import type { GreekVerb, Level, Person, SlotOf, VerbClass } from '../types';
import { ALL } from './shared';
import type { Panel, PanelRow } from './types';
```

Delete the old `export const whoIndex = …` line from this file (it now comes from `tenses.ts`; nothing else imports it from here). Change `CLASS_LABEL` to cover the six classes:

```ts
const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
  athematic: 'athematic class',
  mediopassive: 'mediopassive -ομαι class',
  deponent: 'deponent -άμαι class',
  impersonal: 'impersonal',
};
```

In `verbPanel`, replace the two uses of `verb.class` and `verb.en.gloss` with the voice's data:

```ts
export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  const data = voiceOf(verb, slot.voice);
  return {
    lemma: data.lemma,
    posLabel:
      level === 'beginner' ? `verb: to ${data.en.gloss}` : `verb · ${CLASS_LABEL[data.class]} · ${slot.voice}`,
```

(the rest of the returned object is unchanged except `irregular`, which becomes `data.class === 'contracted-ao' ? '…' : ''`). `verbRow` is unchanged. Task 5 rewrites this file.

`src/validate/validate.ts`: add imports and replace the `verb` case of `slotsFor` and the `verb` block of `checkLexeme`:

```ts
import { allVerbSlots } from '../engine/offers';
import type { VerbVoice, Voice } from '../types';
```

In `slotsFor` the verb case becomes `return allVerbSlots(l);`, and a new case is added:

```ts
    case 'particle':
      return [{ pos: 'particle' }];
```

(also remove the now-unused `PERSONS` constant and the `Person` import if the compiler warns that they are unused; the repository's tsconfig does not fail on unused locals, so removing them is optional). In `checkLexeme` replace the whole `if (l.pos === 'verb') { … }` block with:

```ts
  if (l.pos === 'verb') {
    for (const [voice, data] of Object.entries(l.voices) as [Voice, VerbVoice][]) {
      const cells = data.thirdSingularOnly ? [data.ro.present[2]] : data.ro.present;
      if (cells.length === 0 || cells.some(isEmpty)) {
        errors.push(`lexeme ${l.id} (${voice}): Romanian present needs its non-empty forms`);
      }
      if (isEmpty(data.en.base) || isEmpty(data.en.third)) errors.push(`lexeme ${l.id} (${voice}): empty English form`);
    }
  }
  if (l.pos === 'particle') {
    if (isEmpty(l.ro) || isEmpty(l.en) || isEmpty(l.example.el)) errors.push(`lexeme ${l.id}: empty Romanian, English or example`);
  }
```

- [ ] **Step 12: Add the review items for the new ending tables**

In `src/data/review.ts` add after the `verb-contracted-ao-present` line:

```ts
  { id: 'ending-table:verb-imperfect', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-aorist', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-subj-aorist', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-imperative', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-base', kind: 'ending-table', verified: false },
```

- [ ] **Step 13: Run the tests and the gate**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS (the new tests and every earlier engine test). If `panels.test.ts` or other suites reference `verb.class`, run `npx vitest run` and fix only what the compiler names.

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all tests pass, typecheck clean, `Data is valid.` The unverified list now also names `lexeme theta (el)` and so on.

- [ ] **Step 14: Commit**

```bash
git add src/types.ts src/data/paradigms.ts src/data/lexemes.ts src/data/review.ts src/engine src/panels/verb.ts src/validate/validate.ts src/styles.css
git commit -m "feat: verb model with voices, offers and single-word forms for every tense

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The new verbs and the noun ψωμί

**Files:**

- Create: `src/engine/verbs-greek.test.ts`
- Modify: `src/data/lexemes.ts`, `src/engine/agree.test.ts`

**Interfaces:**

- Consumes: Task 1's `VerbVoice` shape, `inflectVerb`, `allVerbSlots`, `offeredVoices`, `getVerb`.
- Produces: lexemes `troo` (τρώω), `pao` (πάω), `echo` (έχω, also the auxiliary), `pleno` (πλένω with an `active` and a `mediopassive` voice), `koimamai` (κοιμάμαι, mediopassive only), `mporei` (μπορεί, impersonal) and the noun `psomi` (ψωμί). Every Greek form the spec's 6.4 gives for these verbs.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/verbs-greek.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { inflectVerb } from './greek';
import { allVerbSlots, offeredVoices } from './offers';
import { formText } from './segments';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person,
  number: Num,
  voice: Voice,
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const WHO: [Person, Num][] = [[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']];

const six = (id: string, voice: Voice, mood: Mood, tense: Tense) =>
  WHO.map(([p, n]) => formText(inflectVerb(getVerb(id), vs(mood, tense, p, n, voice))));

const two = (id: string, voice: Voice, tense: Tense) =>
  (['sg', 'pl'] as const).map((n) => formText(inflectVerb(getVerb(id), vs('imperative', tense, 2, n, voice))));

type Row = [id: string, voice: Voice, mood: Mood, tense: Tense, forms: string[]];

const SIX: Row[] = [
  ['troo', 'active', 'indicative', 'present', ['τρώω', 'τρως', 'τρώει', 'τρώμε', 'τρώτε', 'τρώνε']],
  ['troo', 'active', 'indicative', 'imperfect', ['έτρωγα', 'έτρωγες', 'έτρωγε', 'τρώγαμε', 'τρώγατε', 'έτρωγαν']],
  ['troo', 'active', 'indicative', 'aorist', ['έφαγα', 'έφαγες', 'έφαγε', 'φάγαμε', 'φάγατε', 'έφαγαν']],
  ['troo', 'active', 'subjunctive', 'aorist', ['φάω', 'φας', 'φάει', 'φάμε', 'φάτε', 'φάνε']],
  ['pao', 'active', 'indicative', 'present', ['πάω', 'πας', 'πάει', 'πάμε', 'πάτε', 'πάνε']],
  ['pao', 'active', 'indicative', 'imperfect', ['πήγαινα', 'πήγαινες', 'πήγαινε', 'πηγαίναμε', 'πηγαίνατε', 'πήγαιναν']],
  ['pao', 'active', 'indicative', 'aorist', ['πήγα', 'πήγες', 'πήγε', 'πήγαμε', 'πήγατε', 'πήγαν']],
  ['pao', 'active', 'subjunctive', 'aorist', ['πάω', 'πας', 'πάει', 'πάμε', 'πάτε', 'πάνε']],
  ['echo', 'active', 'indicative', 'present', ['έχω', 'έχεις', 'έχει', 'έχουμε', 'έχετε', 'έχουν']],
  ['echo', 'active', 'indicative', 'imperfect', ['είχα', 'είχες', 'είχε', 'είχαμε', 'είχατε', 'είχαν']],
  ['pleno', 'active', 'indicative', 'present', ['πλένω', 'πλένεις', 'πλένει', 'πλένουμε', 'πλένετε', 'πλένουν']],
  ['pleno', 'active', 'indicative', 'imperfect', ['έπλενα', 'έπλενες', 'έπλενε', 'πλέναμε', 'πλένατε', 'έπλεναν']],
  ['pleno', 'active', 'indicative', 'aorist', ['έπλυνα', 'έπλυνες', 'έπλυνε', 'πλύναμε', 'πλύνατε', 'έπλυναν']],
  ['pleno', 'active', 'subjunctive', 'aorist', ['πλύνω', 'πλύνεις', 'πλύνει', 'πλύνουμε', 'πλύνετε', 'πλύνουν']],
  ['pleno', 'mediopassive', 'indicative', 'present', ['πλένομαι', 'πλένεσαι', 'πλένεται', 'πλενόμαστε', 'πλένεστε', 'πλένονται']],
  [
    'pleno', 'mediopassive', 'indicative', 'imperfect',
    ['πλενόμουν', 'πλενόσουν', 'πλενόταν', 'πλενόμασταν', 'πλενόσασταν', 'πλένονταν'],
  ],
  ['pleno', 'mediopassive', 'indicative', 'aorist', ['πλύθηκα', 'πλύθηκες', 'πλύθηκε', 'πλυθήκαμε', 'πλυθήκατε', 'πλύθηκαν']],
  ['pleno', 'mediopassive', 'subjunctive', 'aorist', ['πλυθώ', 'πλυθείς', 'πλυθεί', 'πλυθούμε', 'πλυθείτε', 'πλυθούν']],
  ['koimamai', 'mediopassive', 'indicative', 'present', ['κοιμάμαι', 'κοιμάσαι', 'κοιμάται', 'κοιμόμαστε', 'κοιμάστε', 'κοιμούνται']],
  [
    'koimamai', 'mediopassive', 'indicative', 'imperfect',
    ['κοιμόμουν', 'κοιμόσουν', 'κοιμόταν', 'κοιμόμασταν', 'κοιμόσασταν', 'κοιμόνταν'],
  ],
  [
    'koimamai', 'mediopassive', 'indicative', 'aorist',
    ['κοιμήθηκα', 'κοιμήθηκες', 'κοιμήθηκε', 'κοιμηθήκαμε', 'κοιμηθήκατε', 'κοιμήθηκαν'],
  ],
  [
    'koimamai', 'mediopassive', 'subjunctive', 'aorist',
    ['κοιμηθώ', 'κοιμηθείς', 'κοιμηθεί', 'κοιμηθούμε', 'κοιμηθείτε', 'κοιμηθούν'],
  ],
];

describe('Greek forms of the new verbs (spec 6.4)', () => {
  it.each(SIX)('%s %s %s %s', (id, voice, mood, tense, forms) => {
    expect(six(id, voice, mood, tense)).toEqual(forms);
  });

  it('the imperatives of τρώω and πλένω', () => {
    expect(two('troo', 'active', 'aorist')).toEqual(['φάε', 'φάτε']);
    expect(two('troo', 'active', 'present')).toEqual(['τρώε', 'τρώτε']);
    expect(two('pleno', 'active', 'aorist')).toEqual(['πλύνε', 'πλύνετε']);
    expect(two('pleno', 'active', 'present')).toEqual(['πλένε', 'πλένετε']);
  });

  it('the base forms of the perfect tenses', () => {
    const base = (id: string, voice: Voice) => formText(inflectVerb(getVerb(id), vs('indicative', 'perfect', 1, 'sg', voice)));
    expect(base('troo', 'active')).toBe('φάει');
    expect(base('pao', 'active')).toBe('πάει');
    expect(base('pleno', 'active')).toBe('πλύνει');
    expect(base('pleno', 'mediopassive')).toBe('πλυθεί');
    expect(base('koimamai', 'mediopassive')).toBe('κοιμηθεί');
  });

  it('the impersonal μπορεί has one form', () => {
    expect(formText(inflectVerb(getVerb('mporei'), vs('indicative', 'present', 3, 'sg', 'active')))).toBe('μπορεί');
    expect(() => inflectVerb(getVerb('mporei'), vs('indicative', 'present', 1, 'sg', 'active'))).toThrow('no mporei present form');
  });

  it('a one-syllable form drops its accent, and says so', () => {
    expect(inflectVerb(getVerb('troo'), vs('indicative', 'present', 2, 'sg', 'active')).irregular?.rule).toBe('monosyllable');
    expect(inflectVerb(getVerb('troo'), vs('subjunctive', 'aorist', 2, 'sg', 'active')).irregular?.rule).toBe('monosyllable');
    expect(inflectVerb(getVerb('troo'), vs('indicative', 'present', 1, 'sg', 'active')).irregular).toBeUndefined();
  });

  it('the stress moves in πλενόμαστε and stays in πλένονταν, and says so', () => {
    expect(inflectVerb(getVerb('pleno'), vs('indicative', 'present', 1, 'pl', 'mediopassive')).irregular?.rule).toBe('stress-shift');
    expect(inflectVerb(getVerb('pleno'), vs('indicative', 'imperfect', 3, 'pl', 'mediopassive')).irregular?.rule).toBe('stress-shift');
  });

  it('the plural past of τρώω loses its augment: τρώγαμε', () => {
    const form = inflectVerb(getVerb('troo'), vs('indicative', 'imperfect', 1, 'pl', 'active'));
    expect(form.augment).toBeUndefined();
    expect(form.irregular?.rule).toBe('stress-shift');
  });
});

describe('what the new verbs offer', () => {
  it('πλένω has two voices, κοιμάμαι only the mediopassive', () => {
    expect(offeredVoices(getVerb('pleno'))).toEqual(['active', 'mediopassive']);
    expect(offeredVoices(getVerb('koimamai'))).toEqual(['mediopassive']);
    expect(offeredVoices(getVerb('thelo'))).toEqual(['active']);
  });

  it('counts the slots: 13 combinations × 6 persons, plus the imperative for τρώω and πλένω', () => {
    expect(allVerbSlots(getVerb('troo'))).toHaveLength(13 * 6 + 4);
    expect(allVerbSlots(getVerb('pao'))).toHaveLength(13 * 6);
    expect(allVerbSlots(getVerb('koimamai'))).toHaveLength(13 * 6);
    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'active')).toHaveLength(13 * 6 + 4);
    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'mediopassive')).toHaveLength(7 * 6);
    expect(allVerbSlots(getVerb('echo'))).toHaveLength(5 * 6);
    expect(allVerbSlots(getVerb('mporei'))).toHaveLength(1);
  });
});
```

Append to `src/engine/agree.test.ts` (inside a new `describe`, at the end of the file; use the imports already at the top of the file, adding `getNoun` from `'../data/lexemes'` and `richText` from `'./segments'` if they are not imported yet):

```ts
describe('ψωμί (neuter in Greek, feminine in Romanian)', () => {
  const psomi = getNoun('psomi');
  it('the definite article agrees with the noun: το ψωμί / pâinea / the bread', () => {
    const np = nounPhrase(psomi, 'sg', 'acc', { article: 'definite' });
    expect(richText(np.el)).toBe('το ψωμί');
    expect(np.ro).toBe('pâinea');
    expect(np.en).toBe('the bread');
  });
  it('the plural is ψωμιά', () => {
    expect(richText(nounPhrase(psomi, 'pl', 'nom', { article: 'definite' }).el)).toBe('τα ψωμιά');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/verbs-greek.test.ts src/engine/agree.test.ts`
Expected: FAIL (unknown lexeme `troo`, `psomi`).

- [ ] **Step 3: Add the lexemes**

In `src/data/lexemes.ts`, add `IrregularNote` to the `import type` block, and add above `const thelo`:

```ts
const note = (rule: string, plain: string): IrregularNote => ({ rule, plain });
const ACCENT_DROP = note('monosyllable', 'A one-syllable form loses its accent mark: τρως, not τρώς.');
```

Add after the `pidao` declaration (before `const theta`):

```ts
const troo: GreekVerb = {
  id: 'troo',
  pos: 'verb',
  lemma: 'τρώω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'τρώω',
      class: 'athematic',
      stems: {
        present: 'τρώ',
        imperfect: { strong: { augment: 'έ', stem: 'τρωγ' }, weak: { stem: 'τρώγ' } },
        aorist: { strong: { augment: 'έ', stem: 'φαγ' }, weak: { stem: 'φάγ' } },
        perfective: 'φά',
      },
      overrides: {
        'present.2sg': { stem: 'τρω', ending: 'ς', note: ACCENT_DROP },
        'subjAorist.2sg': { stem: 'φα', ending: 'ς', note: ACCENT_DROP },
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a mânca',
        infinitive: 'mânca',
        participle: 'mâncat',
        present: ['mănânc', 'mănânci', 'mănâncă', 'mâncăm', 'mâncați', 'mănâncă'],
        subjunctive: ['mănânc', 'mănânci', 'mănânce', 'mâncăm', 'mâncați', 'mănânce'],
        imperfect: ['mâncam', 'mâncai', 'mânca', 'mâncam', 'mâncați', 'mâncau'],
        pluperfect: ['mâncasem', 'mâncaseși', 'mâncase', 'mâncaserăm', 'mâncaserăți', 'mâncaseră'],
        imperative: ['mănâncă', 'mâncați'],
      },
      en: { gloss: 'eat', base: 'eat', third: 'eats', past: 'ate', pastParticiple: 'eaten', ing: 'eating' },
    },
  },
};

const pao: GreekVerb = {
  id: 'pao',
  pos: 'verb',
  lemma: 'πάω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πάω',
      class: 'athematic',
      stems: {
        present: 'πά',
        imperfect: { strong: { stem: 'πήγαιν' }, weak: { stem: 'πηγαίν' } },
        aorist: { strong: { stem: 'πήγ' }, weak: { stem: 'πήγ' } },
        perfective: 'πά',
      },
      overrides: {
        'present.2sg': { stem: 'πα', ending: 'ς', note: ACCENT_DROP },
        'subjAorist.2sg': { stem: 'πα', ending: 'ς', note: ACCENT_DROP },
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a merge',
        infinitive: 'merge',
        participle: 'mers',
        present: ['merg', 'mergi', 'merge', 'mergem', 'mergeți', 'merg'],
        subjunctive: ['merg', 'mergi', 'meargă', 'mergem', 'mergeți', 'meargă'],
        imperfect: ['mergeam', 'mergeai', 'mergea', 'mergeam', 'mergeați', 'mergeau'],
        pluperfect: ['mersesem', 'merseseși', 'mersese', 'merseserăm', 'merseserăți', 'merseseră'],
      },
      en: { gloss: 'go', base: 'go', third: 'goes', past: 'went', pastParticiple: 'gone', ing: 'going' },
    },
  },
};

/** έχω, also the auxiliary of the perfect tenses. It offers only the forms the auxiliary role and its own panel need. */
const echo: GreekVerb = {
  id: 'echo',
  pos: 'verb',
  lemma: 'έχω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'έχω',
      class: 'omega',
      stems: {
        present: 'έχ',
        imperfect: { strong: { stem: 'είχ' }, weak: { stem: 'είχ' } },
      },
      offers: { indicative: ['present', 'imperfect', 'future'], subjunctive: ['present'], conditional: ['imperfect'] },
      ro: {
        lemma: 'a avea',
        infinitive: 'avea',
        participle: 'avut',
        present: ['am', 'ai', 'are', 'avem', 'aveți', 'au'],
        subjunctive: ['am', 'ai', 'aibă', 'avem', 'aveți', 'aibă'],
        imperfect: ['aveam', 'aveai', 'avea', 'aveam', 'aveați', 'aveau'],
        pluperfect: ['avusesem', 'avuseseși', 'avusese', 'avuseserăm', 'avuseserăți', 'avuseseră'],
      },
      en: { gloss: 'have', base: 'have', third: 'has', past: 'had', pastParticiple: 'had', ing: 'having' },
    },
  },
};

const pleno: GreekVerb = {
  id: 'pleno',
  pos: 'verb',
  lemma: 'πλένω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πλένω',
      class: 'omega',
      stems: {
        present: 'πλέν',
        imperfect: { strong: { augment: 'έ', stem: 'πλεν' }, weak: { stem: 'πλέν' } },
        aorist: { strong: { augment: 'έ', stem: 'πλυν' }, weak: { stem: 'πλύν' } },
        perfective: 'πλύν',
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a spăla',
        infinitive: 'spăla',
        participle: 'spălat',
        present: ['spăl', 'speli', 'spală', 'spălăm', 'spălați', 'spală'],
        subjunctive: ['spăl', 'speli', 'spele', 'spălăm', 'spălați', 'spele'],
        imperfect: ['spălam', 'spălai', 'spăla', 'spălam', 'spălați', 'spălau'],
        pluperfect: ['spălasem', 'spălaseși', 'spălase', 'spălaserăm', 'spălaserăți', 'spălaseră'],
        imperative: ['spală', 'spălați'],
      },
      en: { gloss: 'wash', base: 'wash', third: 'washes', past: 'washed', pastParticiple: 'washed', ing: 'washing' },
    },
    mediopassive: {
      lemma: 'πλένομαι',
      class: 'mediopassive',
      stems: {
        present: 'πλέν',
        imperfect: { strong: { stem: 'πλεν' }, weak: { stem: 'πλεν' } },
        aorist: { strong: { stem: 'πλύθ' }, weak: { stem: 'πλυθ' } },
        perfective: 'πλυθ',
      },
      overrides: {
        'present.1pl': {
          stem: 'πλεν',
          ending: 'όμαστε',
          note: note('stress-shift', 'In "we" the stress moves onto the ending: πλενόμαστε.'),
        },
        'imperfect.3pl': {
          stem: 'πλέν',
          ending: 'ονταν',
          note: note('stress-shift', 'In "they" the stress stays on the stem: πλένονταν.'),
        },
      },
      offers: {
        indicative: ['present', 'imperfect', 'aorist', 'perfect', 'pluperfect'],
        subjunctive: ['present', 'aorist'],
      },
      ro: {
        lemma: 'a se spăla',
        infinitive: 'spăla',
        participle: 'spălat',
        present: ['mă spăl', 'te speli', 'se spală', 'ne spălăm', 'vă spălați', 'se spală'],
        subjunctive: ['mă spăl', 'te speli', 'se spele', 'ne spălăm', 'vă spălați', 'se spele'],
        imperfect: ['mă spălam', 'te spălai', 'se spăla', 'ne spălam', 'vă spălați', 'se spălau'],
        pluperfect: ['mă spălasem', 'te spălaseși', 'se spălase', 'ne spălaserăm', 'vă spălaserăți', 'se spălaseră'],
        perfect: ['m-am spălat', 'te-ai spălat', 's-a spălat', 'ne-am spălat', 'v-ați spălat', 's-au spălat'],
      },
      en: {
        gloss: 'wash',
        base: 'wash',
        third: 'washes',
        past: 'washed',
        pastParticiple: 'washed',
        ing: 'washing',
        reflexive: true,
      },
    },
  },
};

/** κοιμάμαι is deponent: passive in form, not reflexive in meaning. */
const koimamai: GreekVerb = {
  id: 'koimamai',
  pos: 'verb',
  lemma: 'κοιμάμαι',
  verified: { el: false, ro: false, en: false },
  voices: {
    mediopassive: {
      lemma: 'κοιμάμαι',
      class: 'deponent',
      stems: {
        present: 'κοιμ',
        imperfect: { strong: { stem: 'κοιμ' }, weak: { stem: 'κοιμ' } },
        aorist: { strong: { stem: 'κοιμήθ' }, weak: { stem: 'κοιμηθ' } },
        perfective: 'κοιμηθ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a dormi',
        infinitive: 'dormi',
        participle: 'dormit',
        present: ['dorm', 'dormi', 'doarme', 'dormim', 'dormiți', 'dorm'],
        subjunctive: ['dorm', 'dormi', 'doarmă', 'dormim', 'dormiți', 'doarmă'],
        imperfect: ['dormeam', 'dormeai', 'dormea', 'dormeam', 'dormeați', 'dormeau'],
        pluperfect: ['dormisem', 'dormiseși', 'dormise', 'dormiserăm', 'dormiserăți', 'dormiseră'],
      },
      en: { gloss: 'sleep', base: 'sleep', third: 'sleeps', past: 'slept', pastParticiple: 'slept', ing: 'sleeping' },
    },
  },
};

/** μπορεί ("it is possible; may") has one slot: the third person singular of the present. */
const mporei: GreekVerb = {
  id: 'mporei',
  pos: 'verb',
  lemma: 'μπορεί',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'μπορεί',
      class: 'impersonal',
      stems: { present: 'μπορ' },
      offers: { indicative: ['present'] },
      thirdSingularOnly: true,
      ro: {
        lemma: 'a putea',
        infinitive: 'putea',
        participle: 'putut',
        present: ['', '', 'poate', '', '', ''],
        subjunctive: ['', '', 'poată', '', '', ''],
        imperfect: ['', '', '', '', '', ''],
        pluperfect: ['', '', '', '', '', ''],
      },
      en: {
        gloss: 'be able to',
        base: 'may',
        third: 'may',
        past: 'might',
        pastParticiple: 'been able to',
        ing: 'being able to',
      },
    },
  },
};
```

Add the noun after the `paidi` declaration:

```ts
const psomi: GreekNoun = {
  id: 'psomi',
  pos: 'noun',
  lemma: 'ψωμί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  stems: { sg: 'ψωμ', pl: 'ψωμ' },
  ro: {
    lemma: 'pâine',
    gender: 'f',
    forms: {
      sg: { definite: 'pâinea', indefinite: 'o pâine', genDefinite: 'pâinii', genIndefinite: 'unei pâini' },
      pl: { definite: 'pâinile', indefinite: 'pâini', genDefinite: 'pâinilor', genIndefinite: 'unor pâini' },
    },
    split: { sg: ['pâine', 'a'], pl: ['pâini', 'le'] },
  },
  en: { sg: 'bread', pl: 'bread' },
  note: 'Neuter in Greek, feminine in Romanian (pâine); "bread" has no gender and no plural in English.',
};
```

Add the new ids to the `LEXEMES` record: `[psomi.id]: psomi,` after `[paidi.id]`, and `[troo.id]: troo, [pao.id]: pao, [echo.id]: echo, [pleno.id]: pleno, [koimamai.id]: koimamai, [mporei.id]: mporei,` after `[pidao.id]: pidao,`.

- [ ] **Step 4: Run the tests and the gate**

Run: `npx vitest run src/engine && npm run typecheck && npm run validate`
Expected: PASS; `Data is valid.` (the validator walks every offered slot of every verb through `inflectVerb`). If a Greek test fails, compare the failing form with the stems above: the stems and tables are the source of truth, and the test list is the spec's 6.4.

Run: `npx vitest run && npm run typecheck`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/data/lexemes.ts src/engine/verbs-greek.test.ts src/engine/agree.test.ts
git commit -m "feat: add τρώω, πάω, έχω, πλένω, κοιμάμαι, μπορεί and the noun ψωμί

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `compose()` for particle, auxiliary and verb

**Files:**

- Create: `src/engine/compose.ts`, `src/engine/compose.test.ts`

**Interfaces:**

- Consumes: Task 1's `structureOf`, `inflectVerb`, `formText`, `formRich`; Task 2's `echo` and the particle lexemes `theta` and `na`.
- Produces:
  - `type Piece = { kind: 'particle' | 'auxiliary'; text: string; lexeme: string; slot: Slot } | { kind: 'verb'; form: Form }`
  - `interface Composed { pieces: Piece[]; text: string }`
  - `compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed`
  - `pieceText(piece: Piece): string`
  - `composedRich(composed: Composed): Rich` (particle and auxiliary in the `aux` role, the verb as stem and ending, the augment in its own role, spaces as plain segments)

- [ ] **Step 1: Write the failing tests**

Create `src/engine/compose.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { compose, composedRich, pieceText } from './compose';
import { richText } from './segments';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const text = (id: string, slot: SlotOf<'verb'>) => compose(getVerb(id), slot).text;

describe('compose τρώω, 1st person singular, all 15 combinations (spec 6.4)', () => {
  it.each([
    ['indicative', 'present', 'τρώω'],
    ['indicative', 'imperfect', 'έτρωγα'],
    ['indicative', 'aorist', 'έφαγα'],
    ['indicative', 'future', 'θα τρώω'],
    ['indicative', 'futureSimple', 'θα φάω'],
    ['indicative', 'perfect', 'έχω φάει'],
    ['indicative', 'pluperfect', 'είχα φάει'],
    ['indicative', 'futurePerfect', 'θα έχω φάει'],
    ['subjunctive', 'present', 'να τρώω'],
    ['subjunctive', 'aorist', 'να φάω'],
    ['subjunctive', 'perfect', 'να έχω φάει'],
    ['conditional', 'imperfect', 'θα έτρωγα'],
    ['conditional', 'pluperfect', 'θα είχα φάει'],
  ] as const)('%s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('the imperatives are single words in the second person', () => {
    expect(text('troo', vs('imperative', 'aorist', 2, 'sg'))).toBe('φάε');
    expect(text('troo', vs('imperative', 'aorist', 2, 'pl'))).toBe('φάτε');
    expect(text('troo', vs('imperative', 'present', 2, 'sg'))).toBe('τρώε');
    expect(text('troo', vs('imperative', 'present', 2, 'pl'))).toBe('τρώτε');
  });
});

describe('compose: the auxiliary carries the person, the base form never changes', () => {
  it('έχει φάει / έχουν φάει / είχαμε φάει', () => {
    expect(text('troo', vs('indicative', 'perfect', 3, 'sg'))).toBe('έχει φάει');
    expect(text('troo', vs('indicative', 'perfect', 3, 'pl'))).toBe('έχουν φάει');
    expect(text('troo', vs('indicative', 'pluperfect', 1, 'pl'))).toBe('είχαμε φάει');
    expect(text('troo', vs('conditional', 'pluperfect', 1, 'pl'))).toBe('θα είχαμε φάει');
  });
  it('other verbs and the mediopassive', () => {
    expect(text('pidao', vs('indicative', 'perfect', 3))).toBe('έχει πηδήξει');
    expect(text('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive'))).toBe('έχω πλυθεί');
    expect(text('pleno', vs('indicative', 'perfect', 3, 'pl', 'mediopassive'))).toBe('έχουν πλυθεί');
    expect(text('thelo', vs('conditional', 'imperfect'))).toBe('θα ήθελα');
    expect(text('thelo', vs('conditional', 'pluperfect'))).toBe('θα είχα θελήσει');
    expect(text('koimamai', vs('indicative', 'future', 1, 'sg', 'mediopassive'))).toBe('θα κοιμάμαι');
    expect(text('mporei', vs('indicative', 'present', 3))).toBe('μπορεί');
  });
});

describe('compose: the pieces', () => {
  it('lists particle, auxiliary and verb in written order, each with what a panel needs', () => {
    const c = compose(getVerb('troo'), vs('indicative', 'futurePerfect'));
    expect(c.pieces.map((p) => p.kind)).toEqual(['particle', 'auxiliary', 'verb']);
    expect(c.pieces.map(pieceText)).toEqual(['θα', 'έχω', 'φάει']);
    expect(c.pieces[0]).toMatchObject({ lexeme: 'theta', slot: { pos: 'particle' } });
    expect(c.pieces[1]).toMatchObject({
      lexeme: 'echo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    });
  });
  it('a single word is one verb piece', () => {
    expect(compose(getVerb('thelo'), vs('indicative', 'present')).pieces.map((p) => p.kind)).toEqual(['verb']);
  });
  it('the subjunctive starts with να', () => {
    const c = compose(getVerb('troo'), vs('subjunctive', 'perfect', 3));
    expect(c.pieces.map((p) => p.kind)).toEqual(['particle', 'auxiliary', 'verb']);
    expect(c.pieces[0]).toMatchObject({ text: 'να', lexeme: 'na' });
    expect(c.text).toBe('να έχει φάει');
  });
  it('an imperative in the first person is refused', () => {
    expect(() => compose(getVerb('troo'), vs('imperative', 'aorist', 1))).toThrow('commands are for "you" only');
  });
});

describe('composedRich', () => {
  it('colours particle and auxiliary, and keeps the spaces as plain segments', () => {
    const rich = composedRich(compose(getVerb('troo'), vs('indicative', 'futurePerfect')));
    expect(richText(rich)).toBe('θα έχω φάει');
    expect(rich.map((s) => s.role)).toEqual(['aux', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });
  it('shows the augment as its own part', () => {
    const rich = composedRich(compose(getVerb('troo'), vs('indicative', 'imperfect')));
    expect(rich.map((s) => [s.text, s.role])).toEqual([['έ', 'augment'], ['τρωγ', 'stem'], ['α', 'ending']]);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/compose.test.ts`
Expected: FAIL (module `./compose` not found).

- [ ] **Step 3: Implement `compose`**

Create `src/engine/compose.ts`:

```ts
import { getLexeme, getVerb } from '../data/lexemes';
import type { Form, GreekVerb, Slot, SlotOf } from '../types';
import { inflectVerb } from './greek';
import { formRich, formText, type Rich } from './segments';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle or auxiliary piece carries the lexeme and slot a panel
 * would open for it (spec 4.2); the lexical verb carries its Form.
 */
export type Piece =
  | { kind: 'particle' | 'auxiliary'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
}

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

/** Builds a verb group: the particle (θα, να), the auxiliary (έχω) and the lexical verb, in written order. */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
  const structure = structureOf(slot.mood, slot.tense);
  const pieces: Piece[] = [];
  if (structure.particle) {
    const particle = getLexeme(structure.particle);
    pieces.push({ kind: 'particle', text: particle.lemma, lexeme: particle.id, slot: { pos: 'particle' } });
  }
  if (structure.aux) {
    const auxSlot: SlotOf<'verb'> = {
      pos: 'verb',
      person: slot.person,
      number: slot.number,
      mood: 'indicative',
      tense: structure.aux,
      voice: 'active',
    };
    pieces.push({
      kind: 'auxiliary',
      text: formText(inflectVerb(getVerb('echo'), auxSlot)),
      lexeme: 'echo',
      slot: auxSlot,
    });
  }
  pieces.push({ kind: 'verb', form: inflectVerb(verb, slot) });
  return { pieces, text: pieces.map(pieceText).join(' ') };
}

/** The group as coloured segments: particle and auxiliary in the `aux` role, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich = piece.kind === 'verb' ? formRich(piece.form) : [{ text: piece.text, role: 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
```

- [ ] **Step 4: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/engine/compose.ts src/engine/compose.test.ts
git commit -m "feat: compose verb groups from particle, auxiliary and verb

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Romanian and English verb generators

**Files:**

- Create: `src/engine/verbs-ro-en.test.ts`
- Modify: `src/engine/romanian.ts`, `src/engine/english.ts`, `src/panels/verb.ts` (one line), `src/validate/validate.ts`, `src/validate/validate.test.ts`, `src/data/review.ts`

**Interfaces:**

- Consumes: Task 1's `voiceOf`, `whoIndex`, `allVerbSlots`; Task 2's verbs and their stored Romanian and English forms; Task 3's `compose`.
- Produces:
  - `roVerb(verb, slot): string`: the Romanian cell for any verb slot (the stored forms for the simple tenses; the perfect, future, conditional and perfect subjunctive generated from `RO_AUXILIARIES` and the stored infinitive and participle).
  - `RO_AUXILIARIES = { have, will, would }` (six cells each).
  - `interface EnParts { lead: string; subject: boolean; verb: string }`, `enVerb(verb, slot): EnParts`, and `enVerbText(verb, slot, pronoun): string` joining lead, pronoun and verb.
  - The validator checks, for every offered slot of every verb, that `compose`, `roVerb` and `enVerb` produce a non-empty form.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/verbs-ro-en.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { enVerb, enVerbText } from './english';
import { RO_AUXILIARIES, roVerb } from './romanian';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

describe('Romanian verb forms (τρώω → a mânca, spec 6.4)', () => {
  it.each([
    ['indicative', 'present', 'mănânc'],
    ['indicative', 'imperfect', 'mâncam'],
    ['indicative', 'aorist', 'am mâncat'],
    ['indicative', 'future', 'voi mânca'],
    ['indicative', 'futureSimple', 'voi mânca'],
    ['indicative', 'perfect', 'am mâncat'],
    ['indicative', 'pluperfect', 'mâncasem'],
    ['indicative', 'futurePerfect', 'voi fi mâncat'],
    ['subjunctive', 'present', 'să mănânc'],
    ['subjunctive', 'aorist', 'să mănânc'],
    ['subjunctive', 'perfect', 'să fi mâncat'],
    ['conditional', 'imperfect', 'aș mânca'],
    ['conditional', 'pluperfect', 'aș fi mâncat'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(roVerb(getVerb('troo'), vs(mood, tense))).toBe(expected);
  });

  it('the compound auxiliary changes with the person', () => {
    expect(roVerb(getVerb('troo'), vs('indicative', 'perfect', 3, 'sg'))).toBe('a mâncat');
    expect(roVerb(getVerb('troo'), vs('indicative', 'perfect', 3, 'pl'))).toBe('au mâncat');
    expect(roVerb(getVerb('troo'), vs('indicative', 'futurePerfect', 3, 'sg'))).toBe('va fi mâncat');
    expect(roVerb(getVerb('troo'), vs('conditional', 'pluperfect', 1, 'pl'))).toBe('am fi mâncat');
    expect(RO_AUXILIARIES.have).toHaveLength(6);
    expect(RO_AUXILIARIES.will).toHaveLength(6);
    expect(RO_AUXILIARIES.would).toHaveLength(6);
  });

  it('the Romanian perfect covers both the Greek aorist and the Greek perfect', () => {
    for (const person of [1, 2, 3] as const) {
      expect(roVerb(getVerb('troo'), vs('indicative', 'aorist', person))).toBe(
        roVerb(getVerb('troo'), vs('indicative', 'perfect', person)),
      );
    }
  });

  it('the imperative is stored, singular and plural', () => {
    expect(roVerb(getVerb('troo'), vs('imperative', 'aorist', 2, 'sg'))).toBe('mănâncă');
    expect(roVerb(getVerb('troo'), vs('imperative', 'present', 2, 'pl'))).toBe('mâncați');
    expect(() => roVerb(getVerb('thelo'), vs('imperative', 'aorist', 2, 'sg'))).toThrow('thelo has no Romanian imperative');
  });

  it('a vrea: aș vrea, voiam, voisem', () => {
    expect(roVerb(getVerb('thelo'), vs('conditional', 'imperfect'))).toBe('aș vrea');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'imperfect'))).toBe('voiam');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'pluperfect'))).toBe('voisem');
    expect(roVerb(getVerb('thelo'), vs('indicative', 'aorist'))).toBe('am vrut');
  });

  it('a reflexive verb stores its perfect, because the clitic fuses with the auxiliary', () => {
    const m = 'mediopassive';
    expect(roVerb(getVerb('pleno'), vs('indicative', 'present', 1, 'sg', m))).toBe('mă spăl');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'perfect', 1, 'sg', m))).toBe('m-am spălat');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'aorist', 3, 'sg', m))).toBe('s-a spălat');
    expect(roVerb(getVerb('pleno'), vs('subjunctive', 'present', 1, 'sg', m))).toBe('să mă spăl');
    expect(roVerb(getVerb('pleno'), vs('indicative', 'pluperfect', 1, 'sg', m))).toBe('mă spălasem');
  });

  it('a deponent verb has no clitic in Romanian: dorm', () => {
    expect(roVerb(getVerb('koimamai'), vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe('dorm');
  });

  it('other verbs: a sări, a merge, a avea, a putea', () => {
    expect(roVerb(getVerb('pidao'), vs('indicative', 'perfect', 3))).toBe('a sărit');
    expect(roVerb(getVerb('pidao'), vs('indicative', 'imperfect', 3))).toBe('sărea');
    expect(roVerb(getVerb('pao'), vs('subjunctive', 'present', 3))).toBe('să meargă');
    expect(roVerb(getVerb('echo'), vs('indicative', 'future'))).toBe('voi avea');
    expect(roVerb(getVerb('mporei'), vs('indicative', 'present', 3))).toBe('poate');
  });
});

describe('English verb forms (eat / ate / eaten, spec 6.4)', () => {
  const text = (id: string, slot: SlotOf<'verb'>, pronoun = 'I') => enVerbText(getVerb(id), slot, pronoun);

  it.each([
    ['indicative', 'present', 'I eat'],
    ['indicative', 'imperfect', 'I was eating'],
    ['indicative', 'aorist', 'I ate'],
    ['indicative', 'future', 'I will eat'],
    ['indicative', 'futureSimple', 'I will eat'],
    ['indicative', 'perfect', 'I have eaten'],
    ['indicative', 'pluperfect', 'I had eaten'],
    ['indicative', 'futurePerfect', 'I will have eaten'],
    ['subjunctive', 'present', 'that I eat'],
    ['subjunctive', 'aorist', 'that I eat'],
    ['subjunctive', 'perfect', 'I may have eaten'],
    ['conditional', 'imperfect', 'I would eat'],
    ['conditional', 'pluperfect', 'I would have eaten'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('agrees with the person', () => {
    expect(text('troo', vs('indicative', 'present', 3), 'he/she')).toBe('he/she eats');
    expect(text('troo', vs('indicative', 'perfect', 3), 'he/she')).toBe('he/she has eaten');
    expect(text('troo', vs('indicative', 'imperfect', 2), 'you')).toBe('you were eating');
    expect(text('troo', vs('indicative', 'imperfect', 3), 'he/she')).toBe('he/she was eating');
    expect(text('troo', vs('subjunctive', 'present', 3), 'he/she')).toBe('that he/she eats');
  });

  it('the imperative has no subject and one form for singular and plural', () => {
    expect(enVerb(getVerb('troo'), vs('imperative', 'aorist', 2, 'sg'))).toEqual({ lead: '', subject: false, verb: 'eat' });
    expect(enVerb(getVerb('troo'), vs('imperative', 'present', 2, 'pl')).verb).toBe('eat');
  });

  it('reports the parts so a panel can colour the subject', () => {
    expect(enVerb(getVerb('troo'), vs('subjunctive', 'present'))).toEqual({ lead: 'that', subject: true, verb: 'eat' });
    expect(enVerb(getVerb('troo'), vs('indicative', 'present'))).toEqual({ lead: '', subject: true, verb: 'eat' });
  });

  it('the reflexive voice adds the matching "self" word', () => {
    const m = 'mediopassive';
    expect(text('pleno', vs('indicative', 'present', 1, 'sg', m))).toBe('I wash (myself)');
    expect(text('pleno', vs('indicative', 'present', 3, 'sg', m), 'he/she')).toBe('he/she washes (himself/herself)');
    expect(text('pleno', vs('indicative', 'perfect', 1, 'sg', m))).toBe('I have washed (myself)');
    expect(text('pleno', vs('indicative', 'present', 1, 'pl', m), 'we')).toBe('we wash (ourselves)');
  });

  it('a deponent verb is not reflexive: I sleep', () => {
    expect(text('koimamai', vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe('I sleep');
  });

  it('other verbs: want, jump, go, have, may', () => {
    expect(text('thelo', vs('conditional', 'imperfect'))).toBe('I would want');
    expect(text('pidao', vs('indicative', 'perfect', 3), 'he/she')).toBe('he/she has jumped');
    expect(text('pao', vs('indicative', 'aorist'))).toBe('I went');
    expect(text('echo', vs('indicative', 'present', 3), 'he/she')).toBe('he/she has');
    expect(text('mporei', vs('indicative', 'present', 3), 'he/she')).toBe('he/she may');
  });
});
```

Append to `src/validate/validate.test.ts` (it already imports `LEXEMES`, `validate` and `real`):

```ts
describe('verb lexemes', () => {
  /** The real data with the active voice of τρώω changed by `patch` (a deep copy, so the real data is untouched). */
  const modifiedTroo = (patch: (voice: VerbVoice) => void) => {
    const copy: typeof LEXEMES = JSON.parse(JSON.stringify(LEXEMES));
    patch((copy.troo as GreekVerb).voices.active as VerbVoice);
    return { lexemes: copy, phrases: [] as Phrase[] };
  };

  it('reports a Romanian cell the verb needs and does not have', () => {
    const errors = validate(modifiedTroo((v) => { delete v.ro.imperative; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot build') && e.includes('Romanian imperative'))).toBe(true);
  });

  it('reports an empty English participle that a perfect tense needs', () => {
    const errors = validate(modifiedTroo((v) => { v.en.pastParticiple = ''; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: empty English form'))).toBe(true);
  });

  it('reports a slot with no Greek form (a missing perfective stem)', () => {
    const errors = validate(modifiedTroo((v) => { delete v.stems.perfective; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot inflect'))).toBe(true);
  });
});
```

(Add `GreekVerb` and `VerbVoice` to the file's existing `import type { … } from '../types'` line.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/verbs-ro-en.test.ts src/validate/validate.test.ts`
Expected: FAIL (`RO_AUXILIARIES`, `enVerbText` missing; `enVerb` returns a string).

- [ ] **Step 3: Write the Romanian generator**

In `src/engine/romanian.ts` replace the temporary `roVerb` (and keep the `voiceOf` / `whoIndex` imports from Task 1) with:

```ts
/** The Romanian auxiliaries of the compound tenses (spec 4.3); a ReviewItem covers them. */
export const RO_AUXILIARIES = {
  /** a avea, present: the perfect (am mâncat). */
  have: ['am', 'ai', 'a', 'am', 'ați', 'au'],
  /** a vrea, future particle: voi mânca. */
  will: ['voi', 'vei', 'va', 'vom', 'veți', 'vor'],
  /** the conditional auxiliary: aș mânca. */
  would: ['aș', 'ai', 'ar', 'am', 'ați', 'ar'],
} as const;

/** The Romanian cell for a verb slot: stored forms for the simple tenses, generated for the compound ones. */
export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  const ro = voiceOf(v, s.voice).ro;
  const i = whoIndex(s);
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return ro.present[i];
    case 'indicative.imperfect':
      return ro.imperfect[i];
    case 'indicative.aorist':
    case 'indicative.perfect':
      // Romanian has one tense for both; a reflexive verb stores it (m-am spălat).
      return ro.perfect?.[i] ?? `${RO_AUXILIARIES.have[i]} ${ro.participle}`;
    case 'indicative.pluperfect':
      return ro.pluperfect[i];
    case 'indicative.future':
    case 'indicative.futureSimple':
      return `${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
    case 'indicative.futurePerfect':
      return `${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return `să ${ro.subjunctive[i]}`;
    case 'subjunctive.perfect':
      return `să fi ${ro.participle}`;
    case 'imperative.present':
    case 'imperative.aorist': {
      if (!ro.imperative) throw new Error(`${v.id} has no Romanian imperative`);
      return ro.imperative[s.number === 'sg' ? 0 : 1];
    }
    case 'conditional.imperfect':
      return `${RO_AUXILIARIES.would[i]} ${ro.infinitive}`;
    case 'conditional.pluperfect':
      return `${RO_AUXILIARIES.would[i]} fi ${ro.participle}`;
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}
```

- [ ] **Step 4: Write the English generator**

In `src/engine/english.ts` replace the temporary `enVerb` with:

```ts
const HAVE = ['have', 'have', 'has', 'have', 'have', 'have'];
const WAS = ['was', 'were', 'was', 'were', 'were', 'were'];
const SELF = ['myself', 'yourself', 'himself/herself', 'ourselves', 'yourselves', 'themselves'];

/** An English verb slot in parts, so the panel can colour the subject pronoun: lead + subject + verb. */
export interface EnParts {
  /** A word before the subject ("that" in "that I eat"). */
  lead: string;
  /** False for the imperative. */
  subject: boolean;
  verb: string;
}

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): EnParts {
  const en = voiceOf(v, s.voice).en;
  const i = whoIndex(s);
  const present = i === 2 ? en.third : en.base;
  const self = en.reflexive ? ` (${SELF[i]})` : '';
  const parts = (verb: string, lead = '', subject = true): EnParts => ({ lead, subject, verb: `${verb}${self}` });
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return parts(present);
    case 'indicative.imperfect':
      return parts(`${WAS[i]} ${en.ing}`);
    case 'indicative.aorist':
      return parts(en.past);
    case 'indicative.future':
    case 'indicative.futureSimple':
      return parts(`will ${en.base}`);
    case 'indicative.perfect':
      return parts(`${HAVE[i]} ${en.pastParticiple}`);
    case 'indicative.pluperfect':
      return parts(`had ${en.pastParticiple}`);
    case 'indicative.futurePerfect':
      return parts(`will have ${en.pastParticiple}`);
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return parts(present, 'that');
    case 'subjunctive.perfect':
      return parts(`may have ${en.pastParticiple}`);
    case 'imperative.present':
    case 'imperative.aorist':
      return parts(en.base, '', false);
    case 'conditional.imperfect':
      return parts(`would ${en.base}`);
    case 'conditional.pluperfect':
      return parts(`would have ${en.pastParticiple}`);
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}

/** The whole English cell as text: "that I eat", "I have eaten", "eat". */
export function enVerbText(v: GreekVerb, s: SlotOf<'verb'>, pronoun: string): string {
  const p = enVerb(v, s);
  return [p.lead, p.subject ? pronoun : '', p.verb].filter((part) => part !== '').join(' ');
}
```

- [ ] **Step 5: Keep the old panel compiling**

In `src/panels/verb.ts` change the `en:` cell of `verbRow`'s returned object so it reads the verb text from the parts (Task 5 rewrites this whole function):

```ts
    en: [
      { text: EN_PRONOUNS[index], role: 'pronoun' },
      { text: ' ', role: 'plain' },
      { text: enVerb(verb, slot).verb, role: 'plain' },
    ],
```

- [ ] **Step 6: Check every offered slot in the validator**

In `src/validate/validate.ts` add the imports

```ts
import { compose } from '../engine/compose';
import { enVerb } from '../engine/english';
import { roVerb } from '../engine/romanian';
```

and replace the `if (l.pos === 'verb') { … }` block of `checkLexeme` (Task 1's version) with:

```ts
  if (l.pos === 'verb') {
    for (const slot of allVerbSlots(l)) {
      const where = `lexeme ${l.id}: cannot build ${JSON.stringify(slot)}`;
      try {
        if (isEmpty(compose(l, slot).text)) errors.push(`${where}: empty Greek group`);
        const ro = roVerb(l, slot);
        if (isEmpty(ro) || ro.includes('undefined')) errors.push(`${where}: no Romanian form`);
        const en = enVerb(l, slot).verb;
        if (isEmpty(en) || en.includes('undefined') || /\s$/.test(en)) {
          errors.push(`lexeme ${l.id}: empty English form for ${JSON.stringify(slot)}`);
        }
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
```

(The generic loop above it still reports a missing Greek form as `cannot inflect …`. The Romanian-imperative test finds the generator's own message, `troo has no Romanian imperative`, inside the `cannot build` line; the empty-participle test finds the trailing space of "have " in the English cell.)

- [ ] **Step 7: Add the review items for the compound tables**

In `src/data/review.ts` add:

```ts
  { id: 'auxiliary-table:el-tense-structure', kind: 'auxiliary-table', verified: false },
  { id: 'auxiliary-table:ro-compound', kind: 'auxiliary-table', verified: false },
  { id: 'auxiliary-table:en-compound', kind: 'auxiliary-table', verified: false },
```

(They cover `STRUCTURE`, `RO_AUXILIARIES` and the English was/were/have/has patterns.)

- [ ] **Step 8: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green and `Data is valid.`; if the validator reports an English or Romanian error for a real lexeme, the stored form named in the message is the one to fix.

- [ ] **Step 9: Commit**

```bash
git add src/engine/romanian.ts src/engine/english.ts src/engine/verbs-ro-en.test.ts src/panels/verb.ts src/validate/validate.ts src/validate/validate.test.ts src/data/review.ts
git commit -m "feat: generate Romanian and English verb forms for every tense

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The verb panel: Who / Mood / When / Voice, tense overview and the particle panel

**Files:**

- Create: `src/panels/verb.test.ts`, `src/panels/particle.ts`
- Modify: `src/engine/labels.ts`, `src/engine/labels.test.ts`, `src/panels/types.ts`, `src/panels/verb.ts`, `src/panels/panels.ts`, `src/panels/panels.test.ts`, `src/components/FormTable.tsx`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`

**Interfaces:**

- Consumes: Tasks 1 to 4 (`compose`, `composedRich`, `roVerb`, `enVerb`, offers, `MOODS`, `TENSES_OF_MOOD`).
- Produces:
  - `labels.ts`: `moodOptions(level, offered)`, `tenseOptions(level, mood, offered)`, `voiceOptions(level, offered)`, `moodLabel(level, mood)`, `tenseLabel(level, mood, tense)`, `WHO_IMPERATIVE` handled by `whoOptionsFor(offered)`.
  - `Control.key` gains `'mood' | 'tense' | 'voice'`.
  - `PanelRow.dimmed?: string` (a reason, shown in the Greek cell) and `Panel.overview?: PanelRow[]` (Improver only).
  - `verbRow(verb, slot)`, `verbPanel(verb, slot, level)`, `changeVerbSlot(verb, slot, key, value)` in `panels/verb.ts`.
  - `applyControl(state, key, value, lexemeId?)`: the mood, tense and voice controls need the lexeme and throw without it.
  - `particlePanel(particle, level)`; `buildPanel` handles the `particle` slot.

- [ ] **Step 1: Write the failing tests**

Create `src/panels/verb.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Mood, Num, Person, SlotOf, Tense, Token, Voice } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const stateOf = (slot: SlotOf<'verb'>): PanelState => ({ slot, noun: null, nounNumber: 'sg' });
const panel = (id: string, slot: SlotOf<'verb'>, level: Level = 'beginner', state = stateOf(slot)) => {
  const token: Token = { text: '', lexeme: id, slot };
  return buildPanel(state, token, level);
};
const cells = (p: ReturnType<typeof panel>, i = 0) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const control = (p: ReturnType<typeof panel>, key: string) => p.controls.find((c) => c.key === key);

describe('verb panel: the row', () => {
  it('shows a compound form with its pieces, the dropped pronouns and the English subject', () => {
    const p = panel('troo', vs('indicative', 'perfect'));
    expect(cells(p)).toEqual({ el: '(εγώ) έχω φάει', ro: '(eu) am mâncat', en: 'I have eaten' });
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['dim', 'plain', 'aux', 'plain', 'stem', 'ending']);
    expect(p.rows[0].en[0].role).toBe('pronoun');
  });
  it('shows the augment as its own part', () => {
    const p = panel('troo', vs('indicative', 'imperfect'));
    expect(p.rows[0].el.map((s) => [s.text, s.role]).slice(2)).toEqual([['έ', 'augment'], ['τρωγ', 'stem'], ['α', 'ending']]);
  });
  it('puts the English lead before the subject: that I eat', () => {
    expect(cells(panel('troo', vs('subjunctive', 'aorist'))).en).toBe('that I eat');
  });
  it('an imperative has no subject pronouns in any language', () => {
    const p = panel('troo', vs('imperative', 'aorist', 2, 'sg'));
    expect(cells(p)).toEqual({ el: 'φάε', ro: 'mănâncă', en: 'eat' });
    expect(p.rows[0].label).toBe('you');
  });
  it('an impersonal verb has no pronoun in Greek or Romanian and "it" in English', () => {
    const p = panel('mporei', vs('indicative', 'present', 3));
    expect(cells(p)).toEqual({ el: 'μπορεί', ro: 'poate', en: 'it may' });
  });
});

describe('verb panel: controls', () => {
  it('θέλω: Who, Mood and When, no Voice', () => {
    const p = panel('thelo', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense']);
    expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toHaveLength(8);
    expect(control(p, 'mood')?.label).toBe('Mood');
    expect(control(p, 'tense')?.label).toBe('When?');
  });
  it('πλένω has a Voice control', () => {
    const p = panel('pleno', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice']);
    expect(control(p, 'voice')?.options.map((o) => o.value)).toEqual(['active', 'mediopassive']);
  });
  it('the imperative offers only "you" and "you (pl.)"', () => {
    const p = panel('troo', vs('imperative', 'aorist', 2, 'sg'));
    expect(control(p, 'who')?.options.map((o) => o.value)).toEqual(['2sg', '2pl']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toEqual(['present', 'aorist']);
  });
  it('μπορεί offers one person and one tense', () => {
    const p = panel('mporei', vs('indicative', 'present', 3));
    expect(control(p, 'who')?.options.map((o) => o.value)).toEqual(['3sg']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toEqual(['present']);
  });
  it('Beginner uses plain labels, Improver the technical ones', () => {
    const b = panel('troo', vs('indicative', 'perfect'), 'beginner');
    const i = panel('troo', vs('indicative', 'perfect'), 'improver');
    expect(control(b, 'tense')?.options.find((o) => o.value === 'perfect')?.label).toBe('have done');
    expect(control(i, 'tense')?.options.find((o) => o.value === 'perfect')?.label).toBe('present perfect');
    expect(control(b, 'mood')?.options.find((o) => o.value === 'imperative')?.label).toBe('a command');
    expect(control(i, 'mood')?.options.find((o) => o.value === 'imperative')?.label).toBe('imperative');
  });
  it('labels the panel for the learner level', () => {
    expect(panel('troo', vs('indicative', 'present'), 'beginner').posLabel).toBe('verb: to eat');
    expect(panel('troo', vs('indicative', 'present'), 'improver').posLabel).toBe('verb · athematic class · active');
    expect(panel('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'), 'improver').posLabel).toBe(
      'verb · mediopassive -ομαι class · mediopassive',
    );
    expect(panel('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'), 'improver').lemma).toBe('πλένομαι');
  });
});

describe('verb panel: applyControl', () => {
  const change = (slot: SlotOf<'verb'>, key: string, value: string, id = 'troo') =>
    applyControl(stateOf(slot), key, value, id).slot as SlotOf<'verb'>;

  it('mood: moving to the imperative makes the person "you" and keeps an offered tense', () => {
    expect(change(vs('indicative', 'aorist', 3, 'pl'), 'mood', 'imperative')).toMatchObject({
      mood: 'imperative', tense: 'aorist', person: 2, number: 'pl',
    });
  });
  it('mood: a tense the new mood does not offer falls back to its first tense', () => {
    expect(change(vs('indicative', 'futurePerfect'), 'mood', 'subjunctive')).toMatchObject({
      mood: 'subjunctive', tense: 'present',
    });
  });
  it('tense: sets the tense', () => {
    expect(change(vs('indicative', 'present'), 'tense', 'pluperfect')).toMatchObject({ tense: 'pluperfect' });
  });
  it('voice: a tense the other voice does not offer falls back to its first tense', () => {
    expect(change(vs('indicative', 'futurePerfect'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', mood: 'indicative', tense: 'present',
    });
    expect(change(vs('indicative', 'perfect'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', tense: 'perfect',
    });
  });
  it('voice: a mood the other voice does not offer falls back to its first mood', () => {
    expect(change(vs('imperative', 'aorist', 2, 'sg'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', mood: 'indicative',
    });
  });
  it('who: still works without the lexeme', () => {
    expect(applyControl(stateOf(vs('indicative', 'present')), 'who', '3pl').slot).toMatchObject({ person: 3, number: 'pl' });
  });
  it('mood, tense and voice need the lexeme', () => {
    expect(() => applyControl(stateOf(vs('indicative', 'present')), 'mood', 'subjunctive')).toThrow(
      'the mood control needs the lexeme',
    );
  });
});

describe('verb panel: full table and tense overview (Improver)', () => {
  it('Beginner shows neither', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'beginner');
    expect(p.full).toEqual([]);
    expect(p.overview ?? []).toEqual([]);
  });
  it('the full table lists the six persons of the selected mood, tense and voice', () => {
    const p = panel('troo', vs('indicative', 'perfect', 3), 'improver');
    expect(p.full.map((r) => richText(r.el))).toEqual([
      '(εγώ) έχω φάει', '(εσύ) έχεις φάει', '(αυτός/ή) έχει φάει', '(εμείς) έχουμε φάει', '(εσείς) έχετε φάει', '(αυτοί/ές) έχουν φάει',
    ]);
    expect(p.full.map((r) => Boolean(r.hl))).toEqual([false, false, true, false, false, false]);
  });
  it('the imperative table has two rows', () => {
    expect(panel('troo', vs('imperative', 'aorist', 2, 'sg'), 'improver').full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
  });
  it('the overview lists every mood and tense for the selected person, with the form in use highlighted', () => {
    const p = panel('troo', vs('indicative', 'perfect', 1), 'improver');
    const overview = p.overview ?? [];
    expect(overview).toHaveLength(15);
    expect(overview[0].label).toBe('indicative · present');
    expect(richText(overview[0].el)).toBe('(εγώ) τρώω');
    expect(richText(overview[5].el)).toBe('(εγώ) έχω φάει');
    expect(overview.filter((r) => r.hl).map((r) => r.label)).toEqual(['indicative · present perfect']);
    expect(overview.find((r) => r.label === 'subjunctive · perfect')?.dimmed).toBeUndefined();
  });
  it('rows with no form are dimmed with a reason', () => {
    const overview = panel('troo', vs('indicative', 'present', 1), 'improver').overview ?? [];
    const imperative = overview.find((r) => r.label === 'imperative · aorist (do it once)');
    expect(imperative?.dimmed).toBe('commands are for "you" only');
    const thelo = panel('thelo', vs('indicative', 'present', 2), 'improver').overview ?? [];
    expect(thelo.find((r) => r.label === 'imperative · present (keep doing)')?.dimmed).toBe('θέλω has no imperative here');
  });
  it('the two futures show the same English cell', () => {
    const overview = panel('troo', vs('indicative', 'future', 1), 'improver').overview ?? [];
    const en = (label: string) => richText(overview.find((r) => r.label === label)!.en);
    expect(en('indicative · future (continuous)')).toBe(en('indicative · future (simple)'));
  });
});

describe('verb panel: plain-language line and irregularity', () => {
  it('describes the perfect: only the auxiliary changes with the person', () => {
    expect(panel('troo', vs('indicative', 'perfect')).plain).toContain('only έχω changes');
  });
  it('explains the aspect choice of the subjunctive', () => {
    expect(panel('troo', vs('subjunctive', 'aorist')).plain).toContain('once');
    expect(panel('troo', vs('subjunctive', 'present')).plain).toContain('regularly');
  });
  it('shows the irregularity of the lexical verb', () => {
    expect(panel('troo', vs('indicative', 'imperfect', 1, 'pl')).irregular).toContain('stress moves');
    expect(panel('troo', vs('indicative', 'present', 2)).irregular).toContain('τρως');
    expect(panel('troo', vs('indicative', 'present', 1)).irregular).toBe('');
  });
  it('keeps the explanation of the contracted class', () => {
    expect(panel('pidao', vs('indicative', 'present', 3)).irregular).toContain('Contracted');
  });
});

describe('particle panel', () => {
  it('shows the particle with a verb in each language', () => {
    const token: Token = { text: 'θα', lexeme: 'theta', slot: { pos: 'particle' } };
    const p = buildPanel({ slot: token.slot, noun: null, nounNumber: 'sg' }, token, 'beginner');
    expect(p.lemma).toBe('θα');
    expect(p.controls).toEqual([]);
    expect(richText(p.rows[0].el)).toBe('θα φάω');
    expect(richText(p.rows[0].ro)).toBe('voi mânca');
    expect(richText(p.rows[0].en)).toBe('will eat');
    expect(p.plain).toContain('future');
  });
});
```

Update `src/panels/panels.test.ts`: in `describe('verb panel (θέλω)')` change the control test to:

```ts
  it('has lemma, label and the Who?, Mood and When? controls', () => {
    expect(panel.lemma).toBe('θέλω');
    expect(panel.posLabel).toBe('verb: to want');
    expect(panel.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense']);
    expect(panel.controls[0]).toMatchObject({ key: 'who', label: 'Who?', value: '1sg' });
  });
```

Leave the contracted-verb test in that file as it is. Add `moodLabel, moodOptions, tenseLabel, tenseOptions, voiceOptions, whoOptionsFor` to the existing import from `'./labels'` at the top of `src/engine/labels.test.ts`, and append at the end of the file:

```ts
describe('verb labels', () => {
  it('names moods for each level', () => {
    expect(moodLabel('beginner', 'subjunctive')).toBe('wish or possibility');
    expect(moodLabel('improver', 'subjunctive')).toBe('subjunctive');
    expect(moodOptions('beginner', ['indicative', 'conditional']).map((o) => o.label)).toEqual(['a fact', 'would']);
  });
  it('names tenses for each level', () => {
    expect(tenseLabel('beginner', 'indicative', 'aorist')).toBe('did (once)');
    expect(tenseLabel('improver', 'indicative', 'aorist')).toBe('aorist');
    expect(tenseLabel('improver', 'indicative', 'future')).toBe('future (continuous)');
    expect(tenseOptions('improver', 'imperative', ['present', 'aorist']).map((o) => o.label)).toEqual([
      'present (keep doing)', 'aorist (do it once)',
    ]);
  });
  it('names voices and persons', () => {
    expect(voiceOptions('beginner', ['active', 'mediopassive']).map((o) => o.label)).toEqual(['doing it', 'done to oneself']);
    expect(whoOptionsFor(['2sg', '2pl']).map((o) => o.label)).toEqual(['you', 'you (pl.)']);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels src/engine/labels.test.ts`
Expected: FAIL (new label functions, new controls and the overview are missing).

- [ ] **Step 3: Add the labels**

In `src/engine/labels.ts` add the import `import type { Gender, Level, Mood, Tense, Voice } from '../types';` (extend the existing import) and append:

```ts
const MOOD_LABEL: Record<Level, Record<Mood, string>> = {
  beginner: { indicative: 'a fact', subjunctive: 'wish or possibility', imperative: 'a command', conditional: 'would' },
  improver: { indicative: 'indicative', subjunctive: 'subjunctive', imperative: 'imperative', conditional: 'conditional' },
};

/** Keyed '<mood>.<tense>'. Beginner uses plain words, Improver the technical name (spec 3). */
const TENSE_LABEL: Record<Level, Record<string, string>> = {
  beginner: {
    'indicative.present': 'now',
    'indicative.imperfect': 'was doing',
    'indicative.aorist': 'did (once)',
    'indicative.future': 'will be doing',
    'indicative.futureSimple': 'will do',
    'indicative.perfect': 'have done',
    'indicative.pluperfect': 'had done',
    'indicative.futurePerfect': 'will have done',
    'subjunctive.present': 'to (do), ongoing',
    'subjunctive.aorist': 'to (do), once',
    'subjunctive.perfect': 'may have done',
    'imperative.present': 'keep doing!',
    'imperative.aorist': 'do it!',
    'conditional.imperfect': 'would do',
    'conditional.pluperfect': 'would have done',
  },
  improver: {
    'indicative.present': 'present',
    'indicative.imperfect': 'imperfect',
    'indicative.aorist': 'aorist',
    'indicative.future': 'future (continuous)',
    'indicative.futureSimple': 'future (simple)',
    'indicative.perfect': 'present perfect',
    'indicative.pluperfect': 'past perfect',
    'indicative.futurePerfect': 'future perfect',
    'subjunctive.present': 'present',
    'subjunctive.aorist': 'aorist',
    'subjunctive.perfect': 'perfect',
    'imperative.present': 'present (keep doing)',
    'imperative.aorist': 'aorist (do it once)',
    'conditional.imperfect': 'θα + imperfect',
    'conditional.pluperfect': 'θα + pluperfect',
  },
};

const VOICE_LABEL: Record<Level, Record<Voice, string>> = {
  beginner: { active: 'doing it', mediopassive: 'done to oneself' },
  improver: { active: 'active', mediopassive: 'mediopassive' },
};

export const moodLabel = (level: Level, mood: Mood): string => MOOD_LABEL[level][mood];

export function tenseLabel(level: Level, mood: Mood, tense: Tense): string {
  const label = TENSE_LABEL[level][`${mood}.${tense}`];
  if (!label) throw new Error(`${mood} ${tense} is not a Greek tense`);
  return label;
}

export const moodOptions = (level: Level, offered: Mood[]): Option[] =>
  offered.map((mood) => ({ value: mood, label: moodLabel(level, mood) }));

export const tenseOptions = (level: Level, mood: Mood, offered: Tense[]): Option[] =>
  offered.map((tense) => ({ value: tense, label: tenseLabel(level, mood, tense) }));

export const voiceOptions = (level: Level, offered: Voice[]): Option[] =>
  offered.map((voice) => ({ value: voice, label: VOICE_LABEL[level][voice] }));

/** The Who? options for the persons a mood offers ('2sg', '2pl' for the imperative). */
export const whoOptionsFor = (offered: string[]): Option[] => whoOptions.filter((o) => offered.includes(o.value));
```

- [ ] **Step 4: Extend the panel types**

In `src/panels/types.ts` change `Control.key` and the row and panel types:

```ts
export interface Control {
  key: 'who' | 'mood' | 'tense' | 'voice' | 'noun' | 'number' | 'count' | 'value' | 'case';
  label: string;
  options: Option[];
  value: string;
}

export interface PanelRow {
  label: string;
  el: Rich;
  ro: Rich;
  en: Rich;
  /** Per-column highlight: the cell that holds the form in use. */
  hl?: { el?: boolean; ro?: boolean; en?: boolean };
  /** A row with no form: the reason, shown in place of the cells. */
  dimmed?: string;
}
```

and in `Panel` add after `full`:

```ts
  /** Verbs, Improver only: every mood and tense for the selected person. */
  overview?: PanelRow[];
```

- [ ] **Step 5: Rewrite the verb panel**

Replace the whole of `src/panels/verb.ts` with:

```ts
import { composedRich, compose } from '../engine/compose';
import { enVerb } from '../engine/english';
import {
  EN_PRONOUNS,
  GREEK_PRONOUNS,
  RO_PRONOUNS,
  moodLabel,
  moodOptions,
  tenseLabel,
  tenseOptions,
  voiceOptions,
  whoOptions,
  whoOptionsFor,
} from '../engine/labels';
import {
  isOffered,
  offeredMoods,
  offeredTenses,
  offeredVoices,
  offeredWho,
  voiceOf,
} from '../engine/offers';
import { roVerb } from '../engine/romanian';
import { dim, plain, type Rich, type Segment } from '../engine/segments';
import { MOODS, TENSES_OF_MOOD, whoIndex } from '../engine/tenses';
import type { GreekVerb, Level, Mood, Person, SlotOf, Tense, VerbClass, Voice } from '../types';
import { ALL } from './shared';
import type { Control, Panel, PanelRow } from './types';

const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
  athematic: 'athematic class',
  mediopassive: 'mediopassive -ομαι class',
  deponent: 'deponent -άμαι class',
  impersonal: 'impersonal',
};

const SPACE: Segment = { text: ' ', role: 'plain' };

/** One sentence describing the slot (spec 5.1), keyed '<mood>.<tense>'. */
const PLAIN: Record<string, string> = {
  'indicative.present': 'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
  'indicative.imperfect': 'The imperfect says what was going on or used to happen. Greek adds a past-tense prefix to the stem and keeps it only where the stress allows.',
  'indicative.aorist': 'The aorist says what happened, once and finished. Romanian uses its one compound past for this and for the perfect.',
  'indicative.future': 'The continuous future is θα + the present form: something that will go on or repeat. English and Romanian have no separate form for it.',
  'indicative.futureSimple': 'The simple future is θα + the aorist subjunctive form: something that will happen once. It looks like the subjunctive with θα in front.',
  'indicative.perfect': 'The present perfect is έχω + one form that never changes. Only έχω changes with the person. Romanian does the same with a avea + a participle.',
  'indicative.pluperfect': 'The past perfect is είχα + the same unchanging form. Romanian has a single word for it (mâncasem).',
  'indicative.futurePerfect': 'The future perfect is θα + έχω + the unchanging form: what will have happened by a later time.',
  'subjunctive.present': 'Greek has no infinitive: "to eat" is να + a verb form. The present stem says "regularly" or "in general".',
  'subjunctive.aorist': 'The aorist stem after να says "once". Greek chooses between this and the present stem; Romanian and English do not.',
  'subjunctive.perfect': 'να + έχω + the unchanging form looks back with doubt or hope: "may have eaten".',
  'imperative.present': 'The present imperative asks for something to go on or repeat ("keep eating"). It is used for the second person only.',
  'imperative.aorist': 'The aorist imperative asks for something to be done once and finished ("eat up"). It is used for the second person only.',
  'conditional.imperfect': 'Greek has no conditional forms: θα + the imperfect says "would". It is also the polite way to ask: θα ήθελα.',
  'conditional.pluperfect': 'θα + the past perfect says "would have": what would have happened.',
};

function classMessage(data: { class: VerbClass }): string {
  return data.class === 'contracted-ao'
    ? 'Contracted -άω verbs: the stressed ending (-άς, -άει) replaces the -ω endings.'
    : '';
}

const pronounCells = (verb: GreekVerb, slot: SlotOf<'verb'>) => {
  const data = voiceOf(verb, slot.voice);
  return { show: slot.mood !== 'imperative' && !data.thirdSingularOnly, impersonal: data.thirdSingularOnly === true };
};

export function verbRow(verb: GreekVerb, slot: SlotOf<'verb'>): PanelRow {
  const index = whoIndex(slot);
  const { show, impersonal } = pronounCells(verb, slot);
  const en = enVerb(verb, slot);
  const enPronoun = impersonal ? 'it' : EN_PRONOUNS[index];
  const label = impersonal ? 'it' : whoOptions[index].label;
  const lead: Rich = en.lead ? [{ text: en.lead, role: 'plain' }, SPACE] : [];
  const subject: Rich = en.subject ? [{ text: enPronoun, role: 'pronoun' }, SPACE] : [];
  return {
    label,
    el: [...(show ? [...dim(`(${GREEK_PRONOUNS[index]})`), SPACE] : []), ...composedRich(compose(verb, slot))],
    ro: [...(show ? [...dim(`(${RO_PRONOUNS[index]})`), SPACE] : []), { text: roVerb(verb, slot), role: 'plain' }],
    en: [...lead, ...subject, { text: en.verb, role: 'plain' }],
  };
}

const whoSlot = (slot: SlotOf<'verb'>, who: string): SlotOf<'verb'> => ({
  ...slot,
  person: Number(who[0]) as Person,
  number: who.slice(1) as 'sg' | 'pl',
});

/** A new slot with one verb control applied; anything the new value makes invalid falls back to the first valid choice. */
export function changeVerbSlot(
  verb: GreekVerb,
  slot: SlotOf<'verb'>,
  key: 'mood' | 'tense' | 'voice',
  value: string,
): SlotOf<'verb'> {
  const next = { ...slot };
  if (key === 'voice') next.voice = value as Voice;
  if (key === 'mood') next.mood = value as Mood;
  if (key === 'tense') next.tense = value as Tense;
  const moods = offeredMoods(verb, next.voice);
  if (!moods.includes(next.mood)) next.mood = moods[0];
  const tenses = offeredTenses(verb, next.voice, next.mood);
  if (!tenses.includes(next.tense)) next.tense = tenses[0];
  const who = offeredWho(verb, next.voice, next.mood);
  if (!who.includes(`${next.person}${next.number}`)) {
    next.person = Number(who[0][0]) as Person;
    next.number = who[0].slice(1) as 'sg' | 'pl';
    if (next.mood === 'imperative') next.number = slot.number;
  }
  return next;
}

function controls(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Control[] {
  const list: Control[] = [
    {
      key: 'who',
      label: 'Who?',
      options: whoOptionsFor(offeredWho(verb, slot.voice, slot.mood)),
      value: `${slot.person}${slot.number}`,
    },
    {
      key: 'mood',
      label: 'Mood',
      options: moodOptions(level, offeredMoods(verb, slot.voice)),
      value: slot.mood,
    },
    {
      key: 'tense',
      label: 'When?',
      options: tenseOptions(level, slot.mood, offeredTenses(verb, slot.voice, slot.mood)),
      value: slot.tense,
    },
  ];
  const voices = offeredVoices(verb);
  if (voices.length > 1) {
    list.push({ key: 'voice', label: 'Voice', options: voiceOptions(level, voices), value: slot.voice });
  }
  return list;
}

function overviewRow(verb: GreekVerb, slot: SlotOf<'verb'>, mood: Mood, tense: Tense): PanelRow {
  const target: SlotOf<'verb'> = { ...slot, mood, tense };
  const label = `${moodLabel('improver', mood)} · ${tenseLabel('improver', mood, tense)}`;
  if (!isOffered(verb, target)) {
    const reason =
      mood === 'imperative' && slot.person !== 2
        ? 'commands are for "you" only'
        : `${verb.lemma} has no ${moodLabel('improver', mood)} here`;
    const none = plain('—');
    return { label, el: none, ro: none, en: none, dimmed: reason };
  }
  const row = verbRow(verb, target);
  return { ...row, label, hl: mood === slot.mood && tense === slot.tense ? ALL : undefined };
}

export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  const data = voiceOf(verb, slot.voice);
  const composed = compose(verb, slot);
  const lexical = composed.pieces[composed.pieces.length - 1];
  const formNote = lexical.kind === 'verb' ? lexical.form.irregular?.plain : undefined;
  const who = offeredWho(verb, slot.voice, slot.mood);
  return {
    lemma: data.lemma,
    posLabel:
      level === 'beginner' ? `verb: to ${data.en.gloss}` : `verb · ${CLASS_LABEL[data.class]} · ${slot.voice}`,
    controls: controls(verb, slot, level),
    rows: [verbRow(verb, slot)],
    full:
      level === 'improver'
        ? who.map((w) => ({
            ...verbRow(verb, whoSlot(slot, w)),
            hl: w === `${slot.person}${slot.number}` ? ALL : undefined,
          }))
        : [],
    overview:
      level === 'improver'
        ? MOODS.flatMap((mood) => TENSES_OF_MOOD[mood].map((tense) => overviewRow(verb, slot, mood, tense)))
        : [],
    plain: PLAIN[`${slot.mood}.${slot.tense}`],
    irregular: formNote ?? classMessage(data),
    note: '',
  };
}
```

- [ ] **Step 6: The particle panel**

Create `src/panels/particle.ts`:

```ts
import { plain } from '../engine/segments';
import type { GreekParticle, Level } from '../types';
import type { Panel } from './types';

/** θα and να: one row, the particle with a verb in each language (spec 5.3). */
export function particlePanel(particle: GreekParticle, level: Level): Panel {
  return {
    lemma: particle.lemma,
    posLabel: level === 'beginner' ? 'little word before a verb' : 'particle',
    controls: [],
    rows: [
      {
        label: 'with a verb',
        el: plain(particle.example.el),
        ro: plain(particle.example.ro),
        en: plain(particle.example.en),
      },
    ],
    full: [],
    plain: particle.meaning,
    irregular: '',
    note: '',
  };
}
```

- [ ] **Step 7: Wire `buildPanel` and `applyControl`**

In `src/panels/panels.ts` add `GreekParticle`, `Mood`, `Tense`, `Voice` to the type imports, import `particlePanel` and `changeVerbSlot`, import `getVerb` next to `getLexeme`, and add the particle case to `buildPanel`:

```ts
    case 'particle':
      return particlePanel(lexeme as GreekParticle, level);
```

Change the signature and the verb controls of `applyControl`:

```ts
export function applyControl(state: PanelState, key: string, value: string, lexemeId?: string): PanelState {
```

and add this case before the `case 'who':` block:

```ts
    case 'mood':
    case 'tense':
    case 'voice':
      if (slot.pos === 'verb') {
        if (!lexemeId) throw new Error(`the ${key} control needs the lexeme`);
        return { ...state, slot: changeVerbSlot(getVerb(lexemeId), slot, key, value) };
      }
      break;
```

In `src/Explorer.tsx` pass the lexeme: change `changeControl` to

```ts
  function changeControl(key: string, value: string) {
    setStates((current) => current.map((s, i) => (i === selected ? applyControl(s, key, value, token.lexeme) : s)));
  }
```

- [ ] **Step 8: Render dimmed rows and the overview table**

In `src/components/FormTable.tsx` replace the `<tbody>` rows with a version that handles `dimmed`:

```tsx
        {rows.map((row) =>
          row.dimmed ? (
            <tr key={row.label} className="is-dim">
              <th scope="row">{row.label}</th>
              <td lang="en" colSpan={3}>
                {row.dimmed}
              </td>
            </tr>
          ) : (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td lang="el" className={row.hl?.el ? 'cur' : undefined} aria-current={row.hl?.el ? 'true' : undefined}>
                <RichText rich={row.el} />
              </td>
              <td lang="ro" className={row.hl?.ro ? 'cur' : undefined} aria-current={row.hl?.ro ? 'true' : undefined}>
                <RichText rich={row.ro} />
              </td>
              <td lang="en" className={row.hl?.en ? 'cur' : undefined} aria-current={row.hl?.en ? 'true' : undefined}>
                <RichText rich={row.en} />
              </td>
            </tr>
          ),
        )}
```

(Keep the file's existing `<thead>`; only the mapped rows change. If the existing cells already use exactly this markup, only the `row.dimmed ?` branch is new.)

In `src/components/WordPanel.tsx` render the overview after the full paradigm block, inside the same fragment condition style:

```tsx
      {panel.overview && panel.overview.length > 0 && (
        <>
          <p className="full-title">All tenses for this person: the outlined form is the one in use</p>
          <FormTable rows={panel.overview} />
        </>
      )}
```

In `src/styles.css` add:

```css
.form-table tr.is-dim th, .form-table tr.is-dim td { color: var(--muted); font-style: italic; }
```

- [ ] **Step 9: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck`
Expected: all green. The Task 4 tests still pass; `App.test.tsx` and `WordPanel.test.tsx` use labelled controls, which still exist.

If a WordPanel or App test counts `combobox` elements for a verb token, update the count to the three controls a θέλω token now has (Who?, Mood, When?).

- [ ] **Step 10: Commit**

```bash
git add src/engine/labels.ts src/engine/labels.test.ts src/panels src/components/FormTable.tsx src/components/WordPanel.tsx src/Explorer.tsx src/styles.css
git commit -m "feat: verb panel with mood, tense and voice controls, tense overview and particle panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verb groups in the phrase bar, and validation of verb tokens and piece links

**Files:**

- Modify: `src/components/PhraseBar.tsx`, `src/components/PhraseBar.test.tsx`, `src/validate/validate.ts`, `src/validate/validate.test.ts`, `src/styles.css`

**Interfaces:**

- Consumes: `compose`, `pieceText`, `isOffered`, `getLexeme`.
- Produces:
  - A verb token with more than one piece renders as one chip whose pieces are separate `<span class="piece piece-particle | piece-auxiliary | piece-verb">` elements, with the words taken from the token's authored `text` (so capitals are kept) and the spaces as plain text nodes. A single-word verb token renders as before.
  - The validator rejects a verb token whose slot the lexeme does not offer, or whose `text` (ignoring case and trailing punctuation) differs from `compose(...).text`; a gloss link `{ token, piece }` must name a piece that exists (`piece < number of pieces`), and only a verb token has pieces.

- [ ] **Step 1: Write the failing tests**

In `src/components/PhraseBar.test.tsx` add the imports `import type { Token } from '../types';` and append:

```tsx
describe('PhraseBar: verb groups', () => {
  const group: Token[] = [
    {
      text: 'Θα έχω φάει',
      lexeme: 'troo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'futurePerfect', voice: 'active' },
    },
    {
      text: 'Θέλω',
      lexeme: 'thelo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    },
  ];

  it('is one chip for the whole group, named by its written words', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Θα έχω φάει' })).toBeInTheDocument();
  });

  it('colours the pieces: particle, auxiliary, verb', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const chip = screen.getByRole('button', { name: 'Θα έχω φάει' });
    const pieces = Array.from(chip.querySelectorAll('.piece'));
    expect(pieces.map((p) => p.textContent)).toEqual(['Θα', 'έχω', 'φάει']);
    expect(pieces.map((p) => p.className)).toEqual([
      'piece piece-particle',
      'piece piece-auxiliary',
      'piece piece-verb',
    ]);
  });

  it('a single-word verb is a plain chip', () => {
    render(<PhraseBar tokens={group} selected={1} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Θέλω' }).querySelector('.piece')).toBeNull();
  });
});
```

Append to `src/validate/validate.test.ts`:

```ts
describe('verb tokens', () => {
  const thelo = PHRASES[0].tokens[0];

  it('reports a verb token whose text differs from what compose produces', () => {
    const errors = validate({ ...real, phrases: [withToken(0, { text: 'Θέλεις' })] });
    expect(errors).toContain('ordering-hot-coffee token 0 (Θέλεις): text differs from what compose produces ("θέλω")');
  });

  it('ignores capitals and trailing punctuation when comparing', () => {
    expect(validate({ ...real, phrases: [withToken(0, { text: 'ΘΈΛΩ!' })] })).toEqual([]);
  });

  it('reports a slot the verb does not offer', () => {
    const slot = { ...thelo.slot, mood: 'imperative', tense: 'aorist' } as Token['slot'];
    expect(validate({ ...real, phrases: [withToken(0, { slot })] })).toContain(
      'ordering-hot-coffee token 0 (Θέλω): slot is not offered by thelo',
    );
  });

  it('reports a piece link beyond the pieces the token has', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: { token: 0, piece: 1 } }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" has piece 1 but token 0 has 1 piece',
    );
  });

  it('reports a piece link to a token that is not a verb group', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: { token: 3, piece: 0 } }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to piece 0 of token 3, which is not a verb group',
    );
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/components/PhraseBar.test.tsx src/validate/validate.test.ts`
Expected: FAIL (no pieces, no new checks).

- [ ] **Step 3: Render verb groups as one chip with coloured pieces**

Replace `src/components/PhraseBar.tsx` with:

```tsx
import { Fragment } from 'react';
import { getLexeme } from '../data/lexemes';
import { compose } from '../engine/compose';
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  onSelect: (index: number) => void;
}

/** The words of a verb group with their kinds, or null for a single word (it needs no pieces). */
function groupPieces(token: Token): { word: string; kind: string }[] | null {
  if (token.slot.pos !== 'verb') return null;
  const lexeme = getLexeme(token.lexeme);
  if (lexeme.pos !== 'verb') return null;
  const { pieces } = compose(lexeme, token.slot);
  const words = token.text.split(' ');
  if (pieces.length < 2 || words.length !== pieces.length) return null;
  return pieces.map((piece, i) => ({ word: words[i], kind: piece.kind }));
}

export function PhraseBar({ tokens, selected, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => {
        const pieces = groupPieces(token);
        return (
          <button
            key={i}
            type="button"
            className="chip"
            aria-pressed={i === selected}
            onClick={() => onSelect(i)}
          >
            {pieces
              ? pieces.map((piece, j) => (
                  <Fragment key={j}>
                    {j > 0 && ' '}
                    <span className={`piece piece-${piece.kind}`}>{piece.word}</span>
                  </Fragment>
                ))
              : token.text}
          </button>
        );
      })}
    </div>
  );
}
```

In `src/styles.css` add:

```css
.chip .piece-particle, .chip .piece-auxiliary { color: var(--accent-text); }
.chip[aria-pressed='true'] .piece-particle, .chip[aria-pressed='true'] .piece-auxiliary { color: inherit; }
```

- [ ] **Step 4: Validate verb tokens and piece links**

In `src/validate/validate.ts` add the imports `import { compose } from '../engine/compose';` and `import { isOffered } from '../engine/offers';` (the `compose` import may already be there from Task 4), and add above `checkToken`:

```ts
/** Compares a token's text with the composed text, ignoring capitals and trailing punctuation. */
const normalise = (text: string): string => text.toLowerCase().replace(/[!?.,;·]+$/u, '').trim();

/** How many pieces a verb token has (0 for any other token). */
function pieceCount(token: Token | undefined, lexemes: Record<string, GreekLexeme>): number {
  if (!token || token.slot.pos !== 'verb') return 0;
  const lexeme = lexemes[token.lexeme];
  if (!lexeme || lexeme.pos !== 'verb') return 0;
  try {
    return compose(lexeme, token.slot).pieces.length;
  } catch {
    return 0;
  }
}
```

In `checkToken`, after the `try { inflect(lexeme, token.slot); } catch …` block, add:

```ts
  if (token.slot.pos === 'verb' && lexeme.pos === 'verb') {
    if (!isOffered(lexeme, token.slot)) {
      errors.push(`${where}: slot is not offered by ${lexeme.id}`);
    } else {
      try {
        const composed = compose(lexeme, token.slot);
        if (normalise(composed.text) !== normalise(token.text)) {
          errors.push(`${where}: text differs from what compose produces ("${composed.text}")`);
        }
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
```

In `checkPhrase`, replace the piece check inside the link loop (the `if (typeof link === 'object' && (!Number.isInteger(link.piece) || link.piece < 0)) { … }` block) with:

```ts
          if (typeof link === 'object') {
            if (!Number.isInteger(link.piece) || link.piece < 0) {
              errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" has an invalid piece ${link.piece}`);
            } else if (token >= 0 && token < phrase.tokens.length) {
              const count = pieceCount(phrase.tokens[token], lexemes);
              if (count === 0) {
                errors.push(
                  `${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" links to piece ${link.piece} of token ${token}, which is not a verb group`,
                );
              } else if (link.piece >= count) {
                errors.push(
                  `${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" has piece ${link.piece} but token ${token} has ${count} piece${count === 1 ? '' : 's'}`,
                );
              }
            }
          }
```

`checkPhrase` already has `lexemes` in scope (it is passed in).

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; the earlier test "accepts a gloss link to a piece of an existing token" still passes because θέλω is a one-piece verb token.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhraseBar.tsx src/components/PhraseBar.test.tsx src/validate/validate.ts src/validate/validate.test.ts src/styles.css
git commit -m "feat: verb groups as one chip with coloured pieces; validate verb tokens and piece links

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Phrases 4, 5, 6, 11 to 15 and 18 (voice, the perfects and the subjunctive)

**Files:**

- Modify: `src/data/phrases.ts`
- Create: `src/data/phrases-verbs.test.ts`
- Modify: `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 6 (verb lexemes, `compose`, piece links, the verb panel, the verb chips); `nounPhrase`-style glosses from Plan 2.
- Produces: phrases `washing-myself`, `washing-the-child`, `sleeping`, `present-perfect`, `past-perfect`, `future-perfect`, `want-to-eat`, `want-to-eat-regularly`, `have-washed-myself` appended to `PHRASES`; the authoring helpers `vslot`, `u`, `seg`, `p`, `rows` at the top of `phrases.ts`.

- [ ] **Step 1: Write the failing tests**

Create `src/data/phrases-verbs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compose } from '../engine/compose';
import { linksOf } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { LEXEMES, getVerb } from './lexemes';
import { PHRASES } from './phrases';

const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with verbs (voice, perfects, subjunctive)', () => {
  const ids = [
    'washing-myself', 'washing-the-child', 'sleeping', 'present-perfect', 'past-perfect',
    'future-perfect', 'want-to-eat', 'want-to-eat-regularly', 'have-washed-myself',
  ];

  it('are in the picker, after the first three phrases', () => {
    expect(PHRASES.slice(3, 3 + ids.length).map((p) => p.id)).toEqual(ids);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('start unverified and have a theme', () => {
    for (const id of ids) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('use the reflexive voice for 4 and the deponent voice for 6', () => {
    expect(byId('washing-myself').tokens[0].slot).toMatchObject({ voice: 'mediopassive' });
    expect(byId('sleeping').tokens[0].slot).toMatchObject({ voice: 'mediopassive' });
    expect(byId('washing-the-child').tokens[0].slot).toMatchObject({ voice: 'active' });
  });

  it('write each verb group as one token whose pieces the glosses link to', () => {
    const perfect = byId('future-perfect');
    expect(perfect.tokens).toHaveLength(1);
    const token = perfect.tokens[0];
    const verb = getVerb(token.lexeme);
    expect(token.slot.pos).toBe('verb');
    if (token.slot.pos !== 'verb') return;
    expect(compose(verb, token.slot).pieces).toHaveLength(3);
    const englishNatural = perfect.glosses.find((g) => g.language === 'en' && g.kind === 'natural');
    expect(englishNatural?.units.flatMap(linksOf)).toEqual([
      { token: 0, piece: 0 }, { token: 0, piece: 1 }, { token: 0, piece: 2 },
    ]);
  });

  it('the subjunctive pair differs only in the verb piece (aspect)', () => {
    const once = byId('want-to-eat').tokens[1];
    const regularly = byId('want-to-eat-regularly').tokens[1];
    expect(once.text).toBe('να φάω');
    expect(regularly.text).toBe('να τρώω');
  });

  it('the Romanian glosses of the perfect and of the aorist-like phrase 18 share the compound past', () => {
    const ro = (id: string) => byId(id).glosses.find((g) => g.language === 'ro' && g.kind === 'natural');
    expect(ro('present-perfect')?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('Am mâncat');
    expect(ro('have-washed-myself')?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('M-am spălat');
  });
});
```

Append to `src/App.test.tsx` (use the file's existing imports; add `within` from `@testing-library/react` and `userEvent` if they are not imported yet):

```tsx
describe('verb groups in the app', () => {
  it('opens the perfect, shows its pieces, and lets the learner vary the tense without changing the phrase', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I have eaten');

    const chip = screen.getByRole('button', { name: 'Έχω φάει' });
    expect(chip.querySelectorAll('.piece')).toHaveLength(2);
    await user.click(chip);

    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω φάει' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) am mâncat' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'I have eaten' })).toBeInTheDocument();

    await user.selectOptions(within(panel).getByLabelText('When?'), 'had done');
    expect(within(panel).getByRole('cell', { name: '(εγώ) είχα φάει' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) mâncasem' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Έχω φάει' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω φάει' })).toBeInTheDocument();
  });

  it('switches πλένω between its two voices', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I wash (myself)');
    await user.click(screen.getByRole('button', { name: 'Πλένομαι' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('cell', { name: '(εγώ) πλένομαι' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'I wash (myself)' })).toBeInTheDocument();
    await user.selectOptions(within(panel).getByLabelText('Voice'), 'doing it');
    expect(within(panel).getByRole('cell', { name: '(εγώ) πλένω' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) spăl' })).toBeInTheDocument();
  });
});
```

(`render`, `screen`, `userEvent` and `App` are imported in the existing file. If the file does not yet import `within`, add it to the `@testing-library/react` import. If the table cells' accessible names differ in spacing in your run, fix the expectation to the text the cell actually shows; the data is the source of truth.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-verbs.test.ts src/App.test.tsx`
Expected: FAIL (the phrases do not exist).

- [ ] **Step 3: Add the authoring helpers**

In `src/data/phrases.ts` replace the first import and the `verbSlot` helper with:

```ts
import type { GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, Slot, Tense, Token, Voice } from '../types';

const verbSlot = (person: 1 | 2 | 3): Slot => ({
  pos: 'verb',
  person,
  number: 'sg',
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
});

/** A verb slot for any mood, tense and voice. */
const vslot = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): Slot => ({ pos: 'verb', person, number, mood, tense, voice });

/** A gloss unit; `null` marks a word Greek leaves out. */
const u = (text: string, link: Link | null): GlossUnit => ({ text, link });
/** A unit made of parts that link to different Greek tokens (Romanian câine|le). */
const seg = (...parts: [text: string, link: Link][]): GlossUnit => ({
  segments: parts.map(([text, link]) => ({ text, link })),
});
/** A link to one piece of a verb group. */
const p = (token: number, piece: number): Link => ({ token, piece });
/** The four gloss rows in the order the grid shows them. */
const rows = (
  enNatural: GlossUnit[],
  enLiteral: GlossUnit[],
  roNatural: GlossUnit[],
  roLiteral: GlossUnit[],
): GlossRow[] => [
  { language: 'en', kind: 'natural', units: enNatural },
  { language: 'en', kind: 'literal', units: enLiteral },
  { language: 'ro', kind: 'natural', units: roNatural },
  { language: 'ro', kind: 'literal', units: roLiteral },
];
```

(The existing three phrases keep using `verbSlot`.)

- [ ] **Step 4: Add the nine phrases**

Insert before the `export const PHRASES` line:

```ts
const washingMyself: Phrase = {
  id: 'washing-myself',
  title: 'I wash (myself)',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [{ text: 'Πλένομαι', lexeme: 'pleno', slot: vslot('indicative', 'present', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I wash (myself)', 0)],
    [u('(I)', null), u('wash-[self]', 0)],
    [u('Mă spăl', 0)],
    [u('(Eu)', null), u('mă spăl', 0)],
  ),
  verified: false,
};

const washingTheChild: Phrase = {
  id: 'washing-the-child',
  title: 'I wash the child',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [
    { text: 'Πλένω', lexeme: 'pleno', slot: vslot('indicative', 'present') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I wash', 0), u('the', 1), u('child', 2)],
    [u('(I)', null), u('wash', 0), u('the-[acc]', 1), u('child', 2)],
    [u('Spăl', 0), seg(['copil', 2], ['ul', 1])],
    [u('(Eu)', null), u('spăl', 0), seg(['copil', 2], ['ul', 1])],
  ),
  verified: false,
};

const sleeping: Phrase = {
  id: 'sleeping',
  title: 'I sleep',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [{ text: 'Κοιμάμαι', lexeme: 'koimamai', slot: vslot('indicative', 'present', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I sleep', 0)],
    [u('(I)', null), u('sleep', 0)],
    [u('Dorm', 0)],
    [u('(Eu)', null), u('dorm', 0)],
  ),
  verified: false,
};

const presentPerfect: Phrase = {
  id: 'present-perfect',
  title: 'I have eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Έχω φάει', lexeme: 'troo', slot: vslot('indicative', 'perfect') }],
  glosses: rows(
    [u('I have', p(0, 0)), u('eaten', p(0, 1))],
    [u('(I)', null), u('have', p(0, 0)), u('eaten', p(0, 1))],
    [u('Am', p(0, 0)), u('mâncat', p(0, 1))],
    [u('(Eu)', null), u('am', p(0, 0)), u('mâncat', p(0, 1))],
  ),
  verified: false,
};

const pastPerfect: Phrase = {
  id: 'past-perfect',
  title: 'I had eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Είχα φάει', lexeme: 'troo', slot: vslot('indicative', 'pluperfect') }],
  glosses: rows(
    [u('I had', p(0, 0)), u('eaten', p(0, 1))],
    [u('(I)', null), u('had', p(0, 0)), u('eaten', p(0, 1))],
    [u('Mâncasem', 0)],
    [u('(Eu)', null), u('mâncasem', 0)],
  ),
  verified: false,
};

const futurePerfect: Phrase = {
  id: 'future-perfect',
  title: 'I will have eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Θα έχω φάει', lexeme: 'troo', slot: vslot('indicative', 'futurePerfect') }],
  glosses: rows(
    [u('I will', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2))],
    [u('(I)', null), u('will', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2))],
    [u('Voi', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2))],
    [u('(Eu)', null), u('voi', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2))],
  ),
  verified: false,
};

const wantToEat: Phrase = {
  id: 'want-to-eat',
  title: 'I want to eat',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να φάω', lexeme: 'troo', slot: vslot('subjunctive', 'aorist') },
  ],
  glosses: rows(
    [u('I want', 0), u('to', p(1, 0)), u('eat', p(1, 1))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('(I)', null), u('eat', p(1, 1))],
    [u('Vreau', 0), u('să', p(1, 0)), u('mănânc', p(1, 1))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('(eu)', null), u('mănânc', p(1, 1))],
  ),
  verified: false,
};

const wantToEatRegularly: Phrase = {
  id: 'want-to-eat-regularly',
  title: 'I want to eat (regularly)',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να τρώω', lexeme: 'troo', slot: vslot('subjunctive', 'present') },
  ],
  glosses: rows(
    [u('I want', 0), u('to', p(1, 0)), u('eat (regularly)', p(1, 1))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('(I)', null), u('eat-[ongoing]', p(1, 1))],
    [u('Vreau', 0), u('să', p(1, 0)), u('mănânc', p(1, 1))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('(eu)', null), u('mănânc', p(1, 1))],
  ),
  verified: false,
};

const haveWashedMyself: Phrase = {
  id: 'have-washed-myself',
  title: 'I have washed (myself)',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Έχω πλυθεί', lexeme: 'pleno', slot: vslot('indicative', 'perfect', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I have', p(0, 0)), u('washed (myself)', p(0, 1))],
    [u('(I)', null), u('have', p(0, 0)), u('washed-[self]', p(0, 1))],
    [u('M-am spălat', 0)],
    [u('(Eu)', null), u('m-am spălat', 0)],
  ),
  verified: false,
};
```

Replace the `PHRASES` export with:

```ts
export const PHRASES: Phrase[] = [
  orderingHotCoffee,
  orderingThreeCoffees,
  foxSentence,
  washingMyself,
  washingTheChild,
  sleeping,
  presentPerfect,
  pastPerfect,
  futurePerfect,
  wantToEat,
  wantToEatRegularly,
  haveWashedMyself,
];
```

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green. If `PhrasePicker.test.tsx` or `App.test.tsx` hard-codes the number of phrases or the groups of the picker, update the expectation to the real list (themes in order of first appearance: Ordering, The fox sentence, Daily life, Eating, Wishes and possibility). `npm run validate` prints no warnings: each segmented Romanian unit matches its noun's split.

- [ ] **Step 6: Commit**

```bash
git add src/data/phrases.ts src/data/phrases-verbs.test.ts src/App.test.tsx
git commit -m "feat: phrases for voice, the perfects and the subjunctive (4, 5, 6, 11 to 15, 18)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

If the App or picker test needed a count update in Step 5, add that test file to the `git add` line.

---

### Task 8: Phrases 17, 19, 22, 23, 24, 26 to 29 and 31

**Files:**

- Modify: `src/data/phrases.ts`, `src/data/phrases-verbs.test.ts`, `src/validate/validate.ts`, `src/validate/validate.test.ts`

**Interfaces:**

- Consumes: Task 7's helpers and phrases.
- Produces: phrases `fox-has-jumped`, `ate-the-bread`, `wanted-a-coffee`, `fox-was-jumping`, `eat-the-bread`, `wash-the-child`, `keep-eating-the-bread`, `may-have-eaten`, `would-like-a-coffee`, `would-have-eaten-the-bread`; `PHRASES` in the spec's numerical order; `warnings()` ignores trailing punctuation on a Romanian segment ("pâine|a!").

- [ ] **Step 1: Write the failing tests**

Append to `src/data/phrases-verbs.test.ts`:

```ts
describe('phrases with verbs (past, imperative, conditional)', () => {
  const ids = [
    'fox-has-jumped', 'ate-the-bread', 'wanted-a-coffee', 'fox-was-jumping', 'eat-the-bread',
    'wash-the-child', 'keep-eating-the-bread', 'may-have-eaten', 'would-like-a-coffee', 'would-have-eaten-the-bread',
  ];

  it('are all present, unverified, with a theme', () => {
    for (const id of ids) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('the picker lists all 22 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'fox-has-jumped', 'have-washed-myself', 'ate-the-bread', 'wanted-a-coffee', 'fox-was-jumping',
      'eat-the-bread', 'wash-the-child', 'keep-eating-the-bread', 'may-have-eaten',
      'would-like-a-coffee', 'would-have-eaten-the-bread',
    ]);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('the aorist and the perfect are different Greek tokens with the same Romanian words', () => {
    const roVerb = (id: string) =>
      byId(id).glosses.find((g) => g.language === 'ro' && g.kind === 'natural')?.units[0];
    expect(byId('ate-the-bread').tokens[0].text).toBe('Έφαγα');
    expect(byId('present-perfect').tokens[0].text).toBe('Έχω φάει');
    expect(roVerb('ate-the-bread')).toEqual({ text: 'Am mâncat', link: 0 });
  });

  it('the imperatives are second-person singular, aorist and present', () => {
    expect(byId('eat-the-bread').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2 });
    expect(byId('keep-eating-the-bread').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'present', person: 2 });
    expect(byId('wash-the-child').tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2 });
  });

  it('the polite imperfect and the conditional differ only in θα', () => {
    expect(byId('wanted-a-coffee').tokens[0].text).toBe('Ήθελα');
    expect(byId('would-like-a-coffee').tokens[0].text).toBe('Θα ήθελα');
  });

  it('the modal and its subjunctive are two tokens', () => {
    const phrase = byId('may-have-eaten');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Μπορεί', 'να έχει φάει']);
    expect(phrase.tokens[0].slot).toMatchObject({ person: 3, number: 'sg' });
  });
});
```

Append to `src/validate/validate.test.ts` (inside the existing `describe('segmented gloss units', …)` block, or as a new `describe`; it uses `PHRASES`, `LEXEMES` and `warnings`, which are imported):

```ts
describe('segmented units with punctuation', () => {
  it('does not warn when a segment carries trailing punctuation: pâine|a!', () => {
    const eat = PHRASES.find((x) => x.id === 'eat-the-bread');
    expect(eat).toBeDefined();
    expect(warnings({ lexemes: LEXEMES, phrases: [eat as Phrase] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-verbs.test.ts src/validate/validate.test.ts`
Expected: FAIL (the phrases do not exist).

- [ ] **Step 3: Ignore trailing punctuation when checking segments**

In `src/validate/validate.ts`, inside `warnings`, change the line that builds `actual`:

```ts
        const actual = unit.segments.map((s) => s.text.replace(/[!?.,;]+$/u, ''));
```

- [ ] **Step 4: Add the ten phrases**

Insert before `export const PHRASES`:

```ts
const foxHasJumped: Phrase = {
  id: 'fox-has-jumped',
  title: 'The fox has jumped over the dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: [
    { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'έχει πηδήξει', lexeme: 'pidao', slot: vslot('indicative', 'perfect', 3) },
    { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 5 },
    { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 5 },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('The', 0), u('fox', 1), u('has', p(2, 0)), u('jumped', p(2, 1)), u('over', 3), u('the', 4), u('dog', 5)],
    [
      u('the-[nom]', 0), u('fox', 1), u('has', p(2, 0)), u('jumped', p(2, 1)),
      u('above-from', 3), u('the-[acc]', 4), u('dog-[acc]', 5),
    ],
    [seg(['vulpe', 1], ['a', 0]), u('a', p(2, 0)), u('sărit', p(2, 1)), u('peste', 3), seg(['câine', 5], ['le', 4])],
    [seg(['vulpe', 1], ['a', 0]), u('a', p(2, 0)), u('sărit', p(2, 1)), u('peste', 3), seg(['câine', 5], ['le', 4])],
  ),
  verified: false,
};

const ateTheBread: Phrase = {
  id: 'ate-the-bread',
  title: 'I ate the bread',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Έφαγα', lexeme: 'troo', slot: vslot('indicative', 'aorist') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I ate', 0), u('the', 1), u('bread', 2)],
    [u('(I)', null), u('ate', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Am mâncat', 0), seg(['pâine', 2], ['a', 1])],
    [u('(Eu)', null), u('am mâncat', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const wantedACoffee: Phrase = {
  id: 'wanted-a-coffee',
  title: "I'd like a coffee",
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Ήθελα', lexeme: 'thelo', slot: vslot('indicative', 'imperfect') },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("I'd like", 0), u('a', 1), u('coffee', 2)],
    [u('(I)', null), u('wanted', 0), u('a-one', 1), u('coffee', 2)],
    [u('Aș vrea', 0), u('o', 1), u('cafea', 2)],
    [u('(Eu)', null), u('voiam', 0), u('o', 1), u('cafea', 2)],
  ),
  verified: false,
};

const foxWasJumping: Phrase = {
  id: 'fox-was-jumping',
  title: 'The fox was jumping over the dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: [
    { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'πηδούσε', lexeme: 'pidao', slot: vslot('indicative', 'imperfect', 3) },
    { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 5 },
    { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 5 },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('The', 0), u('fox', 1), u('was jumping', 2), u('over', 3), u('the', 4), u('dog', 5)],
    [u('the-[nom]', 0), u('fox', 1), u('was jumping', 2), u('above-from', 3), u('the-[acc]', 4), u('dog-[acc]', 5)],
    [seg(['vulpe', 1], ['a', 0]), u('sărea', 2), u('peste', 3), seg(['câine', 5], ['le', 4])],
    [seg(['vulpe', 1], ['a', 0]), u('sărea', 2), u('peste', 3), seg(['câine', 5], ['le', 4])],
  ),
  verified: false,
};

const eatTheBread: Phrase = {
  id: 'eat-the-bread',
  title: 'Eat the bread!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Φάε', lexeme: 'troo', slot: vslot('imperative', 'aorist', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Eat', 0), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('eat', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Mănâncă', 0), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('mănâncă', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const washTheChild: Phrase = {
  id: 'wash-the-child',
  title: 'Wash the child!',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [
    { text: 'Πλύνε', lexeme: 'pleno', slot: vslot('imperative', 'aorist', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'παιδί!', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Wash', 0), u('the', 1), u('child!', 2)],
    [u('(you)', null), u('wash', 0), u('the-[acc]', 1), u('child', 2)],
    [u('Spală', 0), seg(['copil', 2], ['ul!', 1])],
    [u('(tu)', null), u('spală', 0), seg(['copil', 2], ['ul', 1])],
  ),
  verified: false,
};

const keepEatingTheBread: Phrase = {
  id: 'keep-eating-the-bread',
  title: 'Keep eating the bread!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Τρώε', lexeme: 'troo', slot: vslot('imperative', 'present', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Keep eating', 0), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('eat-[ongoing]', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Mănâncă', 0), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('mănâncă', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const mayHaveEaten: Phrase = {
  id: 'may-have-eaten',
  title: 'He / she may have eaten',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Μπορεί', lexeme: 'mporei', slot: vslot('indicative', 'present', 3) },
    { text: 'να έχει φάει', lexeme: 'troo', slot: vslot('subjunctive', 'perfect', 3) },
  ],
  glosses: rows(
    [u('He / she may', 0), u('have', p(1, 1)), u('eaten', p(1, 2))],
    [u('it-is-possible', 0), u('that', p(1, 0)), u('(he/she)', null), u('has', p(1, 1)), u('eaten', p(1, 2))],
    [u('Poate', 0), u('să', p(1, 0)), u('fi', p(1, 1)), u('mâncat', p(1, 2))],
    [u('poate', 0), u('să', p(1, 0)), u('fi', p(1, 1)), u('mâncat', p(1, 2))],
  ),
  verified: false,
};

const wouldLikeACoffee: Phrase = {
  id: 'would-like-a-coffee',
  title: 'I would like a coffee',
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Θα ήθελα', lexeme: 'thelo', slot: vslot('conditional', 'imperfect') },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I would', p(0, 0)), u('like', p(0, 1)), u('a', 1), u('coffee', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('wanted', p(0, 1)), u('a-one', 1), u('coffee', 2)],
    [u('Aș', p(0, 0)), u('vrea', p(0, 1)), u('o', 1), u('cafea', 2)],
    [u('(Eu)', null), u('aș', p(0, 0)), u('vrea', p(0, 1)), u('o', 1), u('cafea', 2)],
  ),
  verified: false,
};

const wouldHaveEaten: Phrase = {
  id: 'would-have-eaten-the-bread',
  title: 'I would have eaten the bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Θα είχα φάει', lexeme: 'troo', slot: vslot('conditional', 'pluperfect') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I would', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2)), u('the', 1), u('bread', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('had', p(0, 1)), u('eaten', p(0, 2)), u('the-[acc]', 1), u('bread', 2)],
    [u('Aș', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2)), seg(['pâine', 2], ['a', 1])],
    [u('(Eu)', null), u('aș', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2)), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};
```

Replace the `PHRASES` export with the spec's order (phrases 1, 2, 3, 4, 5, 6, 11 to 15, 17, 18, 19, 22, 23, 24, 26 to 29, 31):

```ts
export const PHRASES: Phrase[] = [
  orderingHotCoffee,
  orderingThreeCoffees,
  foxSentence,
  washingMyself,
  washingTheChild,
  sleeping,
  presentPerfect,
  pastPerfect,
  futurePerfect,
  wantToEat,
  wantToEatRegularly,
  foxHasJumped,
  haveWashedMyself,
  ateTheBread,
  wantedACoffee,
  foxWasJumping,
  eatTheBread,
  washTheChild,
  keepEatingTheBread,
  mayHaveEaten,
  wouldLikeACoffee,
  wouldHaveEaten,
];
```

Also update the Task 7 test `are in the picker, after the first three phrases` in `src/data/phrases-verbs.test.ts`: the nine Task 7 phrases are no longer contiguous (17 sits between 15 and 18), so replace that test with:

```ts
  it('are all in the picker', () => {
    for (const id of ids) expect(PHRASES.map((p) => p.id)).toContain(id);
  });
```

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green, `Data is valid.`, no Warnings block. If `validate` reports a token text mismatch, the message prints what `compose` produces; the Greek in the token is the thing to compare with spec 6.1.

- [ ] **Step 6: Commit**

```bash
git add src/data/phrases.ts src/data/phrases-verbs.test.ts src/validate/validate.ts src/validate/validate.test.ts
git commit -m "feat: phrases for the past, the imperative, the modal and the conditional

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Divergence notes that follow the mood, tense and voice

**Files:**

- Modify: `src/types.ts`, `src/data/divergences.ts`, `src/components/ComparisonTable.tsx`, `src/components/ComparisonTable.test.tsx`, `src/Explorer.tsx`

**Interfaces:**

- Consumes: Task 5's panel state (`state.slot`).
- Produces:
  - `Divergence.appliesTo.when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[] }`: the row shows only when the panel's verb slot matches every listed dimension. A row with `when` never shows when `selectDivergences` is called without a slot.
  - `selectDivergences(all, pos, lexemeId, level, slot?)`.
  - 14 new notes (spec 5.2): perfect-vs-aorist, invariable-participle, pluperfect-form, subjunctive-for-infinitive, aspect, imperfect-vs-aorist, polite-imperfect, imperative-aspect, imperative-forms, perfect-subjunctive, impersonal-modal, conditional-construction, reflexive, deponent.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/ComparisonTable.test.tsx` (it already imports `selectDivergences` and `DIVERGENCES`; add the type import `import type { Slot } from '../types';`):

```tsx
describe('selectDivergences by mood, tense and voice', () => {
  const verb = (mood: string, tense: string, voice = 'active'): Slot =>
    ({ pos: 'verb', person: 1, number: 'sg', mood, tense, voice }) as Slot;
  const ids = (lexeme: string, slot: Slot, level: 'beginner' | 'improver' = 'improver') =>
    selectDivergences(DIVERGENCES, 'verb', lexeme, level, slot).map((d) => d.id);

  it('without a slot, rows with a condition never show (the old call keeps its old result)', () => {
    expect(selectDivergences(DIVERGENCES, 'verb', 'troo', 'improver').map((d) => d.id)).toEqual(['verb-subject']);
  });

  it('the perfect shows the aorist contrast and the unchanging participle', () => {
    const shown = ids('troo', verb('indicative', 'perfect'));
    expect(shown).toContain('perfect-vs-aorist');
    expect(shown).toContain('invariable-participle');
    expect(shown).not.toContain('imperative-aspect');
  });

  it('the aorist subjunctive shows the infinitive and aspect notes', () => {
    const shown = ids('troo', verb('subjunctive', 'aorist'));
    expect(shown).toEqual(expect.arrayContaining(['subjunctive-for-infinitive', 'aspect']));
    expect(shown).not.toContain('perfect-subjunctive');
  });

  it('the perfect subjunctive shows its own note', () => {
    expect(ids('troo', verb('subjunctive', 'perfect'))).toContain('perfect-subjunctive');
  });

  it('the imperative shows aspect and forms; the forms note is Improver only', () => {
    expect(ids('troo', verb('imperative', 'aorist'), 'beginner')).toContain('imperative-aspect');
    expect(ids('troo', verb('imperative', 'aorist'), 'beginner')).not.toContain('imperative-forms');
    expect(ids('troo', verb('imperative', 'aorist'))).toContain('imperative-forms');
  });

  it('the polite imperfect is attached to θέλω', () => {
    expect(ids('thelo', verb('indicative', 'imperfect'))).toContain('polite-imperfect');
    expect(ids('troo', verb('indicative', 'imperfect'))).not.toContain('polite-imperfect');
  });

  it('the conditional shows how Greek builds it', () => {
    expect(ids('thelo', verb('conditional', 'imperfect'))).toContain('conditional-construction');
  });

  it('the reflexive and deponent notes follow the voice and the lexeme', () => {
    expect(ids('pleno', verb('indicative', 'present', 'mediopassive'))).toContain('reflexive');
    expect(ids('pleno', verb('indicative', 'present', 'active'))).not.toContain('reflexive');
    expect(ids('koimamai', verb('indicative', 'present', 'mediopassive'))).toContain('deponent');
  });

  it('the modal note is attached to μπορεί', () => {
    expect(ids('mporei', verb('indicative', 'present'))).toContain('impersonal-modal');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/components/ComparisonTable.test.tsx`
Expected: FAIL (`selectDivergences` ignores the slot; no such rows).

- [ ] **Step 3: Widen the type and the selector**

In `src/types.ts` change the `Divergence` interface's `appliesTo`:

```ts
export interface Divergence {
  id: string;
  appliesTo: {
    pos: Pos;
    lexeme?: string;
    /** For verbs: show the row only when the panel's slot matches every listed dimension. */
    when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[] };
  };
  point: string;
  el: string;
  ro: string;
  en: string;
  /** The type tag shown on the row. */
  tag: 'same' | 'differs' | 'absent';
  /** `core` rows show in both levels; `extra` rows only in Improver. */
  level: 'core' | 'extra';
  verified: boolean;
}
```

Replace `selectDivergences` in `src/components/ComparisonTable.tsx` (and add `Divergence['appliesTo']`-compatible imports):

```tsx
import type { Divergence, Level, Pos, Slot } from '../types';

function matchesWhen(when: Divergence['appliesTo']['when'], slot: Slot | undefined): boolean {
  if (!when) return true;
  if (!slot || slot.pos !== 'verb') return false;
  return (
    (!when.moods || when.moods.includes(slot.mood)) &&
    (!when.tenses || when.tenses.includes(slot.tense)) &&
    (!when.voices || when.voices.includes(slot.voice))
  );
}

export function selectDivergences(
  all: Divergence[],
  pos: Pos,
  lexemeId: string,
  level: Level,
  slot?: Slot,
): Divergence[] {
  return all.filter(
    (d) =>
      d.appliesTo.pos === pos &&
      (d.appliesTo.lexeme === undefined || d.appliesTo.lexeme === lexemeId) &&
      matchesWhen(d.appliesTo.when, slot) &&
      (level === 'improver' || d.level === 'core'),
  );
}
```

In `src/Explorer.tsx` pass the slot:

```ts
  const divergences = selectDivergences(DIVERGENCES, state.slot.pos, token.lexeme, level, state.slot);
```

- [ ] **Step 4: Add the notes**

Append these objects inside the `DIVERGENCES` array in `src/data/divergences.ts` (before the closing `];`):

```ts
  {
    id: 'perfect-vs-aorist',
    appliesTo: { pos: 'verb', when: { moods: ['indicative'], tenses: ['perfect', 'aorist'] } },
    point: 'Aorist or perfect',
    el: 'έφαγα (what happened) and έχω φάει (what I have done) are different tenses',
    ro: 'one tense for both: am mâncat',
    en: 'ate and have eaten, separate like Greek',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'invariable-participle',
    appliesTo: { pos: 'verb', when: { moods: ['indicative', 'subjunctive'], tenses: ['perfect', 'pluperfect', 'futurePerfect'] } },
    point: 'The part that never changes',
    el: 'έχω + one fixed form (φάει): the auxiliary carries the person',
    ro: 'a avea + a participle that does not change (mâncat)',
    en: 'have + past participle (eaten)',
    tag: 'same',
    level: 'core',
    verified: false,
  },
  {
    id: 'pluperfect-form',
    appliesTo: { pos: 'verb', when: { moods: ['indicative'], tenses: ['pluperfect'] } },
    point: 'Past perfect',
    el: 'είχα φάει (two words)',
    ro: 'mâncasem (one word)',
    en: 'had eaten (two words)',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'subjunctive-for-infinitive',
    appliesTo: { pos: 'verb', when: { moods: ['subjunctive'] } },
    point: '"To eat"',
    el: 'no infinitive: θέλω να φάω, "I want that I eat"',
    ro: 'să + subjunctive: vreau să mănânc',
    en: 'to + base verb: I want to eat',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'aspect',
    appliesTo: { pos: 'verb', when: { moods: ['subjunctive'], tenses: ['present', 'aorist'] } },
    point: 'Once or regularly',
    el: 'present stem (να τρώω, regularly) or aorist stem (να φάω, once)',
    ro: 'one form for both: să mănânc',
    en: 'one form for both: to eat',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'imperfect-vs-aorist',
    appliesTo: { pos: 'verb', when: { moods: ['indicative'], tenses: ['imperfect', 'aorist'] } },
    point: 'Imperfect or aorist',
    el: 'έτρωγα (was eating, used to eat) and έφαγα (ate) are separate',
    ro: 'the imperfect mâncam matches Greek; the compound am mâncat covers the aorist',
    en: 'was eating / used to eat, and ate',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'polite-imperfect',
    appliesTo: { pos: 'verb', lexeme: 'thelo', when: { moods: ['indicative'], tenses: ['imperfect'] } },
    point: 'A polite request',
    el: 'Ήθελα softens a request: "I wanted"',
    ro: 'the conditional aș vrea',
    en: '"I\'d like" (a conditional)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'imperative-aspect',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'] } },
    point: 'Once or keep going',
    el: 'φάε (eat up, once) and τρώε (keep eating)',
    ro: 'one form: mănâncă',
    en: 'one form: eat',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'imperative-forms',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'] } },
    point: 'One person or several',
    el: 'φάε (to one person) and φάτε (to several)',
    ro: 'mănâncă and mâncați',
    en: 'eat, for both',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'perfect-subjunctive',
    appliesTo: { pos: 'verb', when: { moods: ['subjunctive'], tenses: ['perfect'] } },
    point: '"May have eaten"',
    el: 'να έχει φάει',
    ro: 'să fi mâncat',
    en: 'may have eaten (a modal)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'impersonal-modal',
    appliesTo: { pos: 'verb', lexeme: 'mporei' },
    point: '"May"',
    el: 'μπορεί να … (one form, third person)',
    ro: 'poate să …',
    en: 'may … (a modal)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'conditional-construction',
    appliesTo: { pos: 'verb', when: { moods: ['conditional'] } },
    point: '"Would"',
    el: 'no conditional forms: θα + a past tense (θα έτρωγα, θα είχα φάει)',
    ro: 'its own forms: aș mânca, aș fi mâncat',
    en: 'would + verb (would have + participle)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'reflexive',
    appliesTo: { pos: 'verb', lexeme: 'pleno', when: { voices: ['mediopassive'] } },
    point: 'Doing it to oneself',
    el: 'the ending marks it: πλένομαι',
    ro: 'a clitic marks it: mă spăl',
    en: 'often no marker: I wash (myself)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'deponent',
    appliesTo: { pos: 'verb', lexeme: 'koimamai' },
    point: 'Passive form, active meaning',
    el: 'κοιμάμαι looks passive but is not reflexive',
    ro: 'no clitic: dorm',
    en: 'sleep',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green. The existing assertion `selectDivergences(DIVERGENCES, 'verb', 'thelo', 'beginner')` still returns `['verb-subject', 'thelo-politeness']` because every new row has a condition or a different lexeme.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/data/divergences.ts src/components/ComparisonTable.tsx src/components/ComparisonTable.test.tsx src/Explorer.tsx
git commit -m "feat: divergence notes for the new tenses, selected by mood, tense and voice

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The validation report and the end-to-end check

**Files:**

- Modify: `src/styles.css` (only if the phone-width check below needs it)

**Interfaces:**

- Consumes: everything above.
- Produces: a verified build, an unverified-record report, and the browser check.

- [ ] **Step 1: Run the full gate and read the report**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all green.

Run: `npm run validate`
Expected: `Data is valid.` with no Warnings block, and `Unverified (147):`. The count is: Plan 2's 79; 9 new lexemes × 3 languages (27); 8 new review items; 19 new phrases; 14 new divergence notes. If the real count differs, find the difference in the printed list before going on. A missing or extra line means a record was added without its flag, or twice.

Run: `npm run validate -- --release`
Expected: `--release: 147 record(s) are not verified.` and a non-zero exit code.

- [ ] **Step 2: Browser check**

Start the app with `npm run dev -- --port 5199 --strictPort` (via `preview_start` and `.claude/launch.json`) and check each point in the browser pane, reporting the actual text seen:

1. Pick **I have eaten**. The chip reads «Έχω φάει» and shows two pieces, έχω in blue. Click it. The panel heading is τρώω; the Greek cell reads (εγώ) έχω φάει with έχω blue and φάει amber at the end; Romanian (eu) am mâncat; English I have eaten.
2. Change **When?** to *had done*, then *will have done*. The cells read (εγώ) είχα φάει / (eu) mâncasem / I had eaten, then (εγώ) θα έχω φάει / (eu) voi fi mâncat / I will have eaten. The phrase chip and the gloss rows do not change. "Differs from the phrase." appears; **Reset to phrase** restores the perfect.
3. Change **Mood** to *wish or possibility* and **When?** to *to (do), once*, then *to (do), ongoing*: (εγώ) να φάω / να τρώω; Romanian *să mănânc* in both; English *that I eat* in both. Read the plain-language line each time.
4. Switch to **Improver**. The full table shows six rows with the form in use outlined in all three columns; the "All tenses for this person" table shows 15 rows. Select **I want to eat** and open the θέλω token: the imperative rows are dimmed with the reason "θέλω has no imperative here". Open τρώω and choose person *I*: the imperative rows read "commands are for "you" only".
5. Pick **I wash (myself)** and open the chip. A **Voice** control appears. Choose *doing it*: the cells read (εγώ) πλένω / (eu) spăl / I wash. Choose *done to oneself* again, then *aorist*: (εγώ) πλύθηκα / (eu) m-am spălat / I washed (myself); *we* in the imperfect: πλενόμασταν. The stress-shift line appears for *we* forms.
6. Pick **Eat the bread!** Open Φάε. The **Who?** control offers only *you* and *you (pl.)*; **Mood** offers *a fact*, *wish or possibility*, *a command*, *would*. Choose *keep doing!*: τρώε / mănâncă / eat.
7. In **I have eaten**, click the Romanian word *mâncat* in the gloss rows: the token is selected. Click *Am*: the same token. In **I will have eaten**, check that every unit of the English natural row is a button that selects the token.
8. In **The fox has jumped over the dog**, select τον: only *le* in *câinele* is highlighted, in both Romanian rows (the Plan 2 behaviour still holds with a verb group in the sentence). Select **έχει πηδήξει** and check the English rows highlight *has* and *jumped*.
9. At phone width (375 px): open **I will have eaten** in Improver and check that the page has no horizontal scrollbar (`document.documentElement.scrollWidth` equals `clientWidth`). If the 15-row overview table makes the page scroll sideways, append this to `src/styles.css`, re-check, and run the gate again:

```css
.word-panel { min-width: 0; overflow-x: auto; }
```

10. Dark mode and keyboard: with the colour scheme set to dark, the amber augment, the blue piece colours and the dimmed overview rows keep readable contrast. Tab through the page: the phrase picker, the chip, the gloss buttons and every verb control show a visible focus ring, and each control can be changed with the keyboard.

- [ ] **Step 3: Commit (only if Step 2 needed a style change)**

```bash
git add src/styles.css
git commit -m "style: keep the verb tables inside the viewport at phone width

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage** (spec sections that this plan owns, and the task that delivers them):

| Spec | Delivered by |
|---|---|
| 4.2 `Mood`, `Tense`, `Voice`, `Form.augment`, `Piece`, `Composed`, verb `Slot` (without `polarity`, `clitics`, `shortForm`) | Tasks 1, 3 |
| 4.3 stems, principal parts, strong and weak past stems, per-cell overrides, `offers`, one lexeme per verb with `verified` per language | Tasks 1, 2 |
| 4.3 `inflect` and `compose`; particle + auxiliary + base form; the simple future and the continuous future; the conditional as θα + imperfect or pluperfect; the imperfect augment lost in the plural; irregular perfective stems (τρώω φαγ-/φα-, πάω πήγ-/πα-) | Tasks 1, 2, 3 |
| 4.3 Romanian stored forms and generated compounds; English stored forms and generated compounds; reflexive perfect stored (departure 5) | Tasks 2, 4 |
| 4.4 one token per verb group; token `text` equals the composed text; the phrase is fixed and the panel works on a copy | Tasks 6, 7, 8 (the copy is Plan 2's `PanelState`) |
| 4.5 gloss links to a piece of a verb group | Tasks 6, 7, 8 |
| 5.1 controls, current-form table, plain-language line, irregularity message, full table (Improver) | Task 5 |
| 5.3 verb row of the panel table: Who, Mood, When, Voice; six persons for the selected mood and tense; tense overview with dimmed rows and reasons. The "Negated" and object controls are Plans 5 and 6 | Task 5 |
| 5.3 particle panel | Task 5 (minimal; reached from a chip in Plan 4) |
| 5.2 divergence types: perfect-vs-aorist, invariable-participle, pluperfect-form, subjunctive-for-infinitive, aspect, imperfect-vs-aorist, polite-imperfect, imperative-aspect, imperative-forms, perfect-subjunctive, impersonal-modal, conditional-construction, reflexive (and deponent, 6.2) | Task 9 |
| 6.1 phrases 4, 5, 6, 11 to 15, 17, 18, 19, 22, 23, 24, 26, 27, 28, 29, 31 | Tasks 7, 8 |
| 6.2 reflexive and deponent verbs (πλένομαι, κοιμάμαι) | Tasks 2, 7, 9 |
| 6.4 forms and constructions for τρώω, πάω, πηδάω, θέλω, πλένω, πλένομαι | Task 2 (tests are the spec's tables) |
| 7 validation: verb token text equals compose, slot inside `offers`, gloss piece links inside the group, every offered slot builds in all three languages | Tasks 4, 6 |
| 3 Beginner and Improver names for tenses, moods and voices; full table and overview only in Improver | Task 5 |
| Not here (listed under Out) | negation and `μην`, the copula, αν, participles, quantifiers, `pending` (Plan 5); clitics, shortening, form groups (Plan 6); readings and piece panels (Plan 4) |

**Placeholder scan:** no "TBD", "TODO", "fill in" or "similar to Task N" in this plan; every code step shows the code. The two conditional edits (the `.word-panel` rule in Task 10 and the `FormTable` markup in Task 5) say exactly when they apply and give the code.

**Type consistency:** `GreekVerb.voices` / `VerbVoice` (Task 1) are read through `voiceOf` in `greek.ts`, `romanian.ts`, `english.ts`, `offers.ts`, `panels/verb.ts` and `validate.ts`. `inflectVerb` returns a `Form` with `augment?`; `formText` and `formRich` (Task 1) are used by `compose` (Task 3) and the panel (Task 5). `STRUCTURE` and `structureOf` (Task 1) feed `compose` (Task 3). `roVerb(verb, slot): string` (Task 4) and `enVerb(verb, slot): EnParts` (Task 4) are used by `verbRow` (Task 5) and the validator (Task 4). `Control.key` gains `mood | tense | voice` (Task 5) and `applyControl(state, key, value, lexemeId?)` is called with the token's lexeme in `Explorer.tsx` (Task 5). `PanelRow.dimmed` and `Panel.overview` are optional, so every Plan 2 panel module compiles unchanged. `selectDivergences(…, slot?)` (Task 9) keeps its old four-argument behaviour.

**Counts to check when running** (the plan's arithmetic, not yet run): `allVerbSlots` gives 78 for θέλω, πηδάω, πάω and κοιμάμαι; 82 for τρώω and the active voice of πλένω; 42 for the mediopassive voice of πλένω; 30 for έχω; 1 for μπορεί. The unverified count after Task 10 is 147.

**Known soft spots** (decisions the executor should not "fix" silently): the mass-noun "a bread" row; the unchanged English future; the stored reflexive perfect; the two-lexeme-versus-one-lexeme choice for πλένω. They are listed under "Departures from the spec" above.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-03-plan-3-verb-system.md`. Execute it with superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.
