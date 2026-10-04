# Clitics, Short Forms and Form Groups Implementation Plan (Plan 6 of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Weak pronouns after and before commands (Φάε το!, Μην το φας!, Δώσε μού το!) in all three languages, with the Greek stress rule, the lexical short forms (Φάτο!, Δως μου το!), the clitic pronoun panel, the "Same meaning" strip built from form groups, and phrases 34 to 38. A script that turns every unverified record into a review sheet, so the content review (spec section 9) can start.

**Architecture:** A verb slot may carry `clitics` and `shortForm`; `compose` places the pronouns (after an affirmative command, before a negative one), applies the stress rule from a small string module, and returns a short form as a joined piece (φάτο) or as a shortened verb (δως). The Romanian and English generators read the same clitic list through stored tables (single pronouns, clusters, English pronouns). A clitic piece opens a clitic panel, like the particle pieces of Plan 4. Form groups are data (`form-groups.ts`); the engine generates every member's three-language text from its slot, and the verb panel shows the group a slot belongs to as a strip whose rows are buttons.

**Tech Stack:** Vite, React, TypeScript (strict), Vitest, Testing Library, tsx (all as in Plans 1 to 5).

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (4.2, 4.3, 4.6, 5.2 to 5.5, 6.1, 6.5, 6.6, 7, 8, 9, 11 and sections 16 to 18).

## Global Constraints

- The spec is the authority; the plan argues from it. Departures are listed under "Departures from the spec".
- TypeScript strict. No `any`. No `sed -i` (macOS): use the Edit tool or a short Python script.
- Before every commit run `npx vitest run && npm run typecheck` (and `npm run validate` whenever the task touches data or the validator) and commit only when green. Stage files by explicit path (never `git add -A`; the untracked `.claude/` folder must not be committed). Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Every new lexeme starts with `verified: { el: false, ro: false, en: false }`; every new phrase, divergence note, reading template and form group starts with `verified: false`; every new table or glossary gets a `ReviewItem` with `verified: false`. All Greek, Romanian and English text in this plan was written from memory and is unverified (spec section 9).
- Clitics appear only in imperative slots (spec 2). A negative command is μην + the subjunctive form, and its pronouns come before the verb. The genitive (indirect) pronoun comes before the accusative (direct) one.
- The stress rule (spec 4.3): Greek stress may not fall further back than the third-last syllable of the whole unit; when it would fall on the fourth-last or further back, a second accent is written two syllables after the original stress (δώσε μού το, τηλεφώνησέ μου, διάβασέ μου το).
- Whitespace-only rich-text segments are plain text nodes. Colour is never the only signal: pressed buttons carry `aria-pressed`, the current cell carries `aria-current`, dimmed rows and badges carry text. English notices inside Greek or Romanian cells carry `lang="en"`; Greek words inside English sentences carry `lang="el"`.
- The phrase and its glosses are fixed and authored; the panel works on a copy. Greek forms are monotonic. The present imperative of τρώω is τρώγε / τρώγετε (spec section 17).

## Scope of this plan

In:

- `Clitic` and the verb slot's `clitics` and `shortForm`; the Greek weak pronouns, the strong forms (as a note), the Romanian single pronouns and clusters, the English pronouns; the clitic lexeme, the clitic slot and the clitic panel (spec 5.3).
- `compose` with pronouns, the stress rule (`engine/stress.ts`), short forms (φάτο joined, δως shortened), the verb δίνω; Romanian and English generators for commands with pronouns (*mănâncă-l*, *nu-l mânca*, *dă-mi-o*, "give it to me").
- Readings for forms with pronouns and short forms (authored templates for `clitic-stress` and `short-imperative`), and clicking a pronoun part to open its panel.
- The verb panel's Object control (none, a noun, a pronoun, two pronouns) and the object noun.
- Phrases 34, 35, 36, 37 and 38; the notes clitic-position, clitic-gender, clitic-order, clitic-stress and the clitic panel's note.
- Form groups (4.6) with the four groups of spec 6.5, their validator checks, and the "Same meaning" strip (5.4), Beginner and Improver.
- `npm run review-sheet`: a Markdown sheet of every unverified record and pending cell, for the reviewer.

Out:

- The content review itself (spec section 9, definition of done 5): it needs a Greek speaker. `npm run validate -- --release` keeps failing until every record is verified and the six pending Romanian genitives are filled in.
- Romanian and English "how to read this" lines for forms with pronouns; the Romanian neuter; clitics outside commands (spec 2).

## Departures from the spec

1. **`clitics` and `shortForm` are optional on the verb slot** (absent means none), as `polarity` is, so every earlier slot literal stays valid and `sameState` compares JSON.
2. **`Clitic` gains `roGender?`**: the Romanian gender of the noun the pronoun stands for. The Greek pronoun follows the Greek noun (ψωμί is neuter: το) and the Romanian follows the Romanian noun (*pâine* is feminine: *o*; παιδί is neuter in Greek and masculine in *copil*: *-l*). Spec 5.2 names this difference (clitic-gender) but gives the type no place for it.
3. **Short forms are stored on the verb voice** (`shortForms`, keyed `impAorist.2sg`) with a `fuse` flag, and `VerbVoice.indirect` marks a verb that takes an indirect object (δίνω). The spec says only that the shortening table is data.
4. **The Object control** has four kinds (none, a noun, a pronoun, two pronouns), plus an "Object noun" select. The noun is held in `PanelState.noun`; the kind is derived from the noun and the slot's pronouns. Verb tokens of phrases 24, 25 and 26 get `agreesWith` pointing at their noun, so their panel starts on the with-noun reading. The short form is never a control (spec 5.3): only the strip sets it.
5. **Romanian clusters are stored only for the pairs the panel can build**: the first-person singular dative with a third-person accusative (*mi-l, mi-o, mi-i, mi-le*), each in the two positions. Single pronouns are stored for every person.
6. **No Romanian or English reading line for a form with pronouns** (the fused *nu-l* and *mănâncă-o* do not fit the word-by-word shapes of Plan 4); the Greek line has them.
7. **The strip's Romanian and English cells for a short form read "none"**, as in the spec's table (5.4): Romanian and English have no such form.
8. **The content review is tooling only**: `npm run review-sheet` writes `review/content-review.md` (git-ignored) from the data; the review itself is not part of this plan.

## File structure

New:

- `src/data/clitics.ts`: the pronoun tables (Greek, strong, Romanian singles and clusters, English).
- `src/data/form-groups.ts`: the four groups.
- `src/engine/clitics.ts`: pronoun lookups, `cliticSlot`.
- `src/engine/stress.ts`: syllables and the second accent.
- `src/engine/groups.ts`: member kind and text, `groupFor`.
- `src/engine/objects.ts`: the object kinds of the Object control.
- `src/panels/clitic.ts`, `src/components/SameMeaningStrip.tsx`, `src/validate/reviewSheet.ts`, `scripts/review-sheet.ts`, `src/test-fixtures.ts` (the two verbs of the stress unit tests, spec 6.6).
- Tests: `src/engine/clitics.test.ts`, `stress.test.ts`, `compose-clitics.test.ts`, `groups.test.ts`, `src/panels/clitic.test.ts`, `object.test.ts`, `strip.test.ts`, `src/data/phrases-clitics.test.ts`, `src/validate/groups-validate.test.ts`, `reviewSheet.test.ts`, and additions to existing test files.

Modified: `src/types.ts`, `src/data/lexemes.ts`, `phrases.ts`, `divergences.ts`, `readings.ts`, `review.ts`, `src/engine/compose.ts`, `offers.ts`, `greek.ts`, `romanian.ts`, `english.ts`, `reading.ts`, `segments.ts`, `src/validate/validate.ts`, `scripts/validate.ts`, `src/panels/panels.ts`, `types.ts`, `verb.ts`, `src/components/WordPanel.tsx`, `ComparisonTable.tsx`, `PhraseBar.tsx`, `src/Explorer.tsx`, `src/styles.css`, `package.json`, `.gitignore`, the spec, and the tests named in each task.

---

### Task 1: The clitic pronoun lexeme, its tables and its panel

**Files:**

- Create: `src/data/clitics.ts`, `src/engine/clitics.ts`, `src/panels/clitic.ts`
- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/greek.ts`, `src/validate/validate.ts`, `src/panels/panels.ts`, `src/panels/types.ts`
- Test: `src/engine/clitics.test.ts`, `src/panels/clitic.test.ts`

**Interfaces:**

- Consumes: Plan 5's `inflect`, `buildPanel`, `applyControl`, `whoOptions`, `GENDER_NAME`, `plain`, `ALL`.
- Produces:
  - `interface Clitic { person; number; gender?; roGender?; role: 'object' | 'indirect' }`; the verb slot gains `clitics?: Clitic[]` and `shortForm?: boolean`; the slot variant `{ pos: 'clitic' } & Clitic`; `GreekClitic` (`pos: 'clitic'`) in `GreekLexeme`; the lexeme `clitic`.
  - `src/data/clitics.ts`: `GREEK_CLITICS`, `GREEK_STRONG`, `EN_CLITICS`, `RO_CLITICS` (single pronouns: free, enclitic, after *nu*), `RO_CLUSTERS`.
  - `src/engine/clitics.ts`: `personKey`, `greekClitic(c)`, `greekStrong(c)`, `enClitic(c)`, `roClitic(c): { free; enclitic; afterNu }`, `roClitics(list): { enclitic; afterNu }`, `cliticSlot(c): SlotOf<'clitic'>`.
  - `inflectClitic` (also through `inflect`); `clitic` panel: controls `who`, `gender` (third person), `role`; one row (weak form in three languages); the Improver table (person × number for the role); the strong form in the plain-language line.
  - `Control['key']` gains `'gender' | 'role'`; `applyControl` handles `who`, `gender` and `role` for a clitic slot.
  - Two `ReviewItem`s: `ending-table:clitic-forms`, `clitic-table:ro-clitics`.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/clitics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Clitic } from '../types';
import { cliticSlot, enClitic, greekClitic, greekStrong, personKey, roClitic, roClitics } from './clitics';

const c = (
  role: Clitic['role'],
  person: Clitic['person'],
  number: Clitic['number'],
  gender?: Clitic['gender'],
  roGender?: Clitic['roGender'],
): Clitic => ({ role, person, number, ...(gender ? { gender } : {}), ...(roGender ? { roGender } : {}) });

describe('Greek weak pronouns (spec 6.5)', () => {
  it.each([
    ['object', 1, 'sg', undefined, 'με'],
    ['object', 2, 'sg', undefined, 'σε'],
    ['object', 3, 'sg', 'm', 'τον'],
    ['object', 3, 'sg', 'f', 'την'],
    ['object', 3, 'sg', 'n', 'το'],
    ['object', 1, 'pl', undefined, 'μας'],
    ['object', 2, 'pl', undefined, 'σας'],
    ['object', 3, 'pl', 'm', 'τους'],
    ['object', 3, 'pl', 'f', 'τις'],
    ['object', 3, 'pl', 'n', 'τα'],
    ['indirect', 1, 'sg', undefined, 'μου'],
    ['indirect', 2, 'sg', undefined, 'σου'],
    ['indirect', 3, 'sg', 'm', 'του'],
    ['indirect', 3, 'sg', 'f', 'της'],
    ['indirect', 3, 'sg', 'n', 'του'],
    ['indirect', 1, 'pl', undefined, 'μας'],
    ['indirect', 2, 'pl', undefined, 'σας'],
    ['indirect', 3, 'pl', 'm', 'τους'],
    ['indirect', 3, 'pl', 'f', 'τους'],
    ['indirect', 3, 'pl', 'n', 'τους'],
  ] as const)('%s %s %s %s -> %s', (role, person, number, gender, expected) => {
    expect(greekClitic(c(role, person, number, gender))).toBe(expected);
  });

  it('a third-person pronoun needs a gender', () => {
    expect(() => greekClitic(c('object', 3, 'sg'))).toThrow(/needs a gender/);
  });

  it('the strong forms are notes: εμένα, αυτό, and σε + the strong form for the indirect role', () => {
    expect(greekStrong(c('object', 1, 'sg'))).toBe('εμένα');
    expect(greekStrong(c('object', 3, 'sg', 'n'))).toBe('αυτό');
    expect(greekStrong(c('object', 3, 'pl', 'f'))).toBe('αυτές');
    expect(greekStrong(c('indirect', 2, 'pl'))).toBe('σε εσάς');
  });

  it('keys a person and number', () => {
    expect(personKey({ person: 3, number: 'pl' })).toBe('3pl');
  });
});

describe('English pronouns', () => {
  it.each([
    [1, 'sg', undefined, 'me'],
    [2, 'sg', undefined, 'you'],
    [3, 'sg', 'm', 'him'],
    [3, 'sg', 'f', 'her'],
    [3, 'sg', 'n', 'it'],
    [1, 'pl', undefined, 'us'],
    [2, 'pl', undefined, 'you'],
    [3, 'pl', 'n', 'them'],
  ] as const)('%s %s %s -> %s', (person, number, gender, expected) => {
    expect(enClitic(c('object', person, number, gender))).toBe(expected);
  });
});

describe('Romanian pronouns', () => {
  it('free, attached after a command, and after nu', () => {
    expect(roClitic(c('object', 3, 'sg', 'm', 'm'))).toEqual({ free: 'îl', enclitic: '-l', afterNu: 'nu-l' });
    expect(roClitic(c('object', 3, 'sg', 'n', 'f'))).toEqual({ free: 'o', enclitic: '-o', afterNu: 'nu o' });
    expect(roClitic(c('indirect', 1, 'sg'))).toEqual({ free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' });
    expect(roClitic(c('object', 1, 'pl'))).toEqual({ free: 'ne', enclitic: '-ne', afterNu: 'nu ne' });
  });

  it('follows the Romanian gender of the noun, not the Greek one (clitic-gender)', () => {
    expect(roClitic(c('object', 3, 'sg', 'n', 'f')).free).toBe('o');
    expect(roClitic(c('object', 3, 'sg', 'n', 'm')).free).toBe('îl');
    expect(roClitic(c('object', 3, 'pl', 'n', 'f')).free).toBe('le');
    expect(roClitic(c('object', 3, 'pl', 'm', 'm')).free).toBe('îi');
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(roClitic(c('object', 3, 'sg', 'n', 'n')).free).toBe('îl');
    expect(roClitic(c('object', 3, 'pl', 'n', 'n')).free).toBe('le');
    expect(roClitic(c('object', 3, 'sg', 'n')).free).toBe('îl');
  });

  it('one pronoun or a cluster of two (dative then accusative)', () => {
    expect(roClitics([c('object', 3, 'sg', 'n', 'f')])).toEqual({ enclitic: '-o', afterNu: 'nu o' });
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'n', 'f')])).toEqual({
      enclitic: '-mi-o',
      afterNu: 'nu mi-o',
    });
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'm', 'm')]).enclitic).toBe('-mi-l');
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'pl', 'm', 'm')]).enclitic).toBe('-mi-i');
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'pl', 'f', 'f')]).enclitic).toBe('-mi-le');
  });

  it('refuses a cluster that is not stored, and a list that is not one or two', () => {
    expect(() => roClitics([c('indirect', 2, 'sg'), c('object', 3, 'sg', 'm', 'm')])).toThrow(/no Romanian cluster/);
    expect(() => roClitics([])).toThrow(/one or two/);
  });
});

describe('the clitic slot', () => {
  it('is the pronoun with its part of speech', () => {
    expect(cliticSlot(c('object', 3, 'sg', 'n', 'f'))).toEqual({
      pos: 'clitic',
      role: 'object',
      person: 3,
      number: 'sg',
      gender: 'n',
      roGender: 'f',
    });
  });
});
```

Create `src/panels/clitic.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'clitic'>> = {}): SlotOf<'clitic'> => ({
  pos: 'clitic',
  person: 3,
  number: 'sg',
  gender: 'n',
  role: 'object',
  ...patch,
});
const stateOf = (slot: SlotOf<'clitic'>): PanelState => ({ slot, noun: null, nounNumber: 'sg' });
const panelFor = (slot: SlotOf<'clitic'>, level: Level = 'beginner') =>
  buildPanel(stateOf(slot), { text: 'το', lexeme: 'clitic', slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i = 0) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});

describe('clitic panel', () => {
  it('shows the weak form in the three languages', () => {
    const p = panelFor(slotOf({ roGender: 'f' }));
    expect(p.lemma).toBe('το / του');
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].label).toBe('weak form');
    expect(cells(p)).toEqual({ el: 'το', ro: 'o', en: 'it' });
  });

  it('the first person: με / mă / me, and the indirect role: μου / îmi / me', () => {
    expect(cells(panelFor(slotOf({ person: 1, gender: undefined })))).toEqual({ el: 'με', ro: 'mă', en: 'me' });
    expect(cells(panelFor(slotOf({ person: 1, gender: undefined, role: 'indirect' })))).toEqual({
      el: 'μου',
      ro: 'îmi',
      en: 'me',
    });
  });

  it('names the strong form in the plain-language line', () => {
    expect(panelFor(slotOf({ person: 1, gender: undefined })).plain).toContain('εμένα');
  });

  it('controls: who, gender for the third person only, and role', () => {
    expect(panelFor(slotOf()).controls.map((x) => x.key)).toEqual(['who', 'gender', 'role']);
    expect(panelFor(slotOf({ person: 2, gender: undefined })).controls.map((x) => x.key)).toEqual(['who', 'role']);
    expect(panelFor(slotOf()).controls.find((x) => x.key === 'who')?.value).toBe('3sg');
  });

  it('the role labels are plain for Beginner and technical for Improver', () => {
    const labels = (level: Level) => panelFor(slotOf(), level).controls.find((x) => x.key === 'role')?.options.map((o) => o.label);
    expect(labels('beginner')).toEqual(['it, him, me (the thing acted on)', 'to me, to him (who receives it)']);
    expect(labels('improver')).toEqual(['accusative (direct object)', 'genitive (indirect object)']);
  });

  it('Improver: person × number for the role, with the current one outlined', () => {
    const p = panelFor(slotOf(), 'improver');
    expect(p.full).toHaveLength(6);
    expect(p.full.find((r) => r.hl?.el)?.label).toBe('he / she');
    expect(richText(p.full[0].el)).toBe('με');
    expect(richText(p.full[2].el)).toBe('το');
    expect(panelFor(slotOf(), 'beginner').full).toEqual([]);
  });
});

describe('applyControl for a clitic', () => {
  const start = stateOf(slotOf({ roGender: 'f' }));
  it('who changes the person and number, and drops the genders outside the third person', () => {
    const next = applyControl(start, 'who', '1pl').slot;
    expect(next).toEqual({ pos: 'clitic', person: 1, number: 'pl', role: 'object' });
  });
  it('who back to the third person defaults the gender to neuter', () => {
    const first = applyControl(start, 'who', '2sg');
    expect(applyControl(first, 'who', '3pl').slot).toMatchObject({ person: 3, number: 'pl', gender: 'n' });
  });
  it('gender and role change the pronoun', () => {
    expect(applyControl(start, 'gender', 'f').slot).toMatchObject({ gender: 'f' });
    expect(applyControl(start, 'role', 'indirect').slot).toMatchObject({ role: 'indirect' });
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/clitics.test.ts src/panels/clitic.test.ts`
Expected: FAIL (`./clitics` not found).

- [ ] **Step 3: The types**

In `src/types.ts`:

a) After `export type Polarity = …;` add:

```ts
/** A weak (clitic) pronoun, with a command (spec 4.2). */
export interface Clitic {
  person: Person;
  number: Num;
  /** The Greek gender of a third-person pronoun (το is neuter). */
  gender?: Gender;
  /** The Romanian gender of the noun the pronoun stands for, when it differs from the Greek one (ψωμί n, *pâine* f). */
  roGender?: Gender;
  role: 'object' | 'indirect';
}
```

b) In the verb variant of `Slot`, change `…voice: Voice; polarity?: Polarity }` so it reads:

```ts
  | {
      pos: 'verb';
      person: Person;
      number: Num;
      mood: Mood;
      tense: Tense;
      voice: Voice;
      polarity?: Polarity;
      /** Pronouns of a command, the indirect one first (spec 4.2). */
      clitics?: Clitic[];
      /** Use the lexical short form (φάτο, δως) when the verb has one. */
      shortForm?: boolean;
    }
```

c) Add `| ({ pos: 'clitic' } & Clitic)` to the `Slot` union (after the `conjunction` variant).

d) After `GreekConjunction` add:

```ts
/** The weak pronoun as a word of its own: the panel a clitic piece of a verb group opens (spec 5.3). */
export interface GreekClitic extends LexemeBase {
  pos: 'clitic';
}
```

and add `| GreekClitic` to the `GreekLexeme` union.

- [ ] **Step 4: The tables**

Create `src/data/clitics.ts`:

```ts
import type { Clitic, Gender } from '../types';

type ByGender = Record<Gender, string>;
const same = (word: string): ByGender => ({ m: word, f: word, n: word });

/** The Greek weak pronouns by role and person (spec 6.5). A ReviewItem covers this table. */
export const GREEK_CLITICS: Record<Clitic['role'], Record<string, ByGender>> = {
  object: {
    '1sg': same('με'),
    '2sg': same('σε'),
    '3sg': { m: 'τον', f: 'την', n: 'το' },
    '1pl': same('μας'),
    '2pl': same('σας'),
    '3pl': { m: 'τους', f: 'τις', n: 'τα' },
  },
  indirect: {
    '1sg': same('μου'),
    '2sg': same('σου'),
    '3sg': { m: 'του', f: 'της', n: 'του' },
    '1pl': same('μας'),
    '2pl': same('σας'),
    '3pl': same('τους'),
  },
};

/** The strong (emphatic) accusative forms, shown as a note only (spec 6.5). */
export const GREEK_STRONG: Record<string, ByGender> = {
  '1sg': same('εμένα'),
  '2sg': same('εσένα'),
  '3sg': { m: 'αυτόν', f: 'αυτήν', n: 'αυτό' },
  '1pl': same('εμάς'),
  '2pl': same('εσάς'),
  '3pl': { m: 'αυτούς', f: 'αυτές', n: 'αυτά' },
};

/** The English object pronouns; "to me" uses the same forms. */
export const EN_CLITICS: Record<string, ByGender> = {
  '1sg': same('me'),
  '2sg': same('you'),
  '3sg': { m: 'him', f: 'her', n: 'it' },
  '1pl': same('us'),
  '2pl': same('you'),
  '3pl': same('them'),
};

export interface RoClitic {
  /** On its own: îl. */
  free: string;
  /** Attached to a command with a hyphen: mănâncă-l. */
  enclitic: string;
  /** After nu, with the fusions: nu-l, nu o. */
  afterNu: string;
}

/**
 * The Romanian pronouns, keyed 'obj' or 'ind', then person and number, then the Romanian gender of a third-person
 * accusative ('obj.3sg.m'). Fusions are stored, not derived (spec 4.3). A ReviewItem covers this table.
 */
export const RO_CLITICS: Record<string, RoClitic> = {
  'obj.1sg': { free: 'mă', enclitic: '-mă', afterNu: 'nu mă' },
  'obj.2sg': { free: 'te', enclitic: '-te', afterNu: 'nu te' },
  'obj.3sg.m': { free: 'îl', enclitic: '-l', afterNu: 'nu-l' },
  'obj.3sg.f': { free: 'o', enclitic: '-o', afterNu: 'nu o' },
  'obj.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
  'obj.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
  'obj.3pl.m': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
  'obj.3pl.f': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
  'ind.1sg': { free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' },
  'ind.2sg': { free: 'îți', enclitic: '-ți', afterNu: 'nu-ți' },
  'ind.3sg': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
  'ind.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
  'ind.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
  'ind.3pl': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
};

/** Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o. */
export const RO_CLUSTERS: Record<string, { enclitic: string; afterNu: string }> = {
  'ind.1sg+obj.3sg.m': { enclitic: '-mi-l', afterNu: 'nu mi-l' },
  'ind.1sg+obj.3sg.f': { enclitic: '-mi-o', afterNu: 'nu mi-o' },
  'ind.1sg+obj.3pl.m': { enclitic: '-mi-i', afterNu: 'nu mi-i' },
  'ind.1sg+obj.3pl.f': { enclitic: '-mi-le', afterNu: 'nu mi-le' },
};
```

- [ ] **Step 5: The lookups**

Create `src/engine/clitics.ts`:

```ts
import { EN_CLITICS, GREEK_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
import type { Clitic, Gender, SlotOf } from '../types';

const ROLE_KEY = { object: 'obj', indirect: 'ind' } as const;

/** '1sg', '3pl'. */
export const personKey = (c: Pick<Clitic, 'person' | 'number'>): string => `${c.person}${c.number}`;

function genderOf(c: Clitic): Gender {
  if (c.person === 3 && !c.gender) throw new Error('a third-person pronoun needs a gender');
  return c.gender ?? 'm';
}

export const greekClitic = (c: Clitic): string => GREEK_CLITICS[c.role][personKey(c)][genderOf(c)];

/** The strong form, as a note: εμένα; for the indirect role σε + the strong form. */
export function greekStrong(c: Clitic): string {
  const strong = GREEK_STRONG[personKey(c)][genderOf(c)];
  return c.role === 'indirect' ? `σε ${strong}` : strong;
}

export const enClitic = (c: Clitic): string => EN_CLITICS[personKey(c)][genderOf(c)];

/** Only the third-person accusative has a gender in Romanian; a neuter follows the masculine (sg) or the feminine (pl). */
function roKey(c: Clitic): string {
  const base = `${ROLE_KEY[c.role]}.${personKey(c)}`;
  if (c.person !== 3 || c.role !== 'object') return base;
  const g = c.roGender ?? genderOf(c);
  return `${base}.${g === 'n' ? (c.number === 'sg' ? 'm' : 'f') : g}`;
}

export function roClitic(c: Clitic): RoClitic {
  const entry = RO_CLITICS[roKey(c)];
  if (!entry) throw new Error(`no Romanian pronoun for ${roKey(c)}`);
  return entry;
}

/** The attached form (after a command) and the form after nu, for one pronoun or a dative + accusative pair. */
export function roClitics(list: readonly Clitic[]): { enclitic: string; afterNu: string } {
  if (list.length === 1) {
    const { enclitic, afterNu } = roClitic(list[0]);
    return { enclitic, afterNu };
  }
  if (list.length === 2) {
    const key = `${roKey(list[0])}+${roKey(list[1])}`;
    const entry = RO_CLUSTERS[key];
    if (!entry) throw new Error(`no Romanian cluster ${key}`);
    return entry;
  }
  throw new Error('a command takes one or two pronouns');
}

export const cliticSlot = (c: Clitic): SlotOf<'clitic'> => ({ pos: 'clitic', ...c });
```

- [ ] **Step 6: The lexeme, inflect and the validator**

In `src/data/lexemes.ts` add `GreekClitic` to the type imports and, after the `an` conjunction:

```ts
const clitic: GreekClitic = { id: 'clitic', pos: 'clitic', lemma: 'το', verified: { el: false, ro: false, en: false } };
```

and register `[clitic.id]: clitic,` in `LEXEMES`.

In `src/engine/greek.ts` add `GreekClitic` to the type imports and `import { greekClitic } from './clitics';`, add before `inflectPreposition`:

```ts
export function inflectClitic(_l: GreekClitic, s: SlotOf<'clitic'>): Form {
  return { stem: greekClitic(s), ending: '' };
}
```

and in `inflect` add before the `'conjunction'` case:

```ts
    case 'clitic':
      return inflectClitic(l, s as SlotOf<'clitic'>);
```

In `src/validate/validate.ts`: import `enClitic, roClitic` from `../engine/clitics`; add to `slotsFor` (before `case 'quantifier'`):

```ts
    case 'clitic':
      return cliticSlots();
```

with this function above `slotsFor`:

```ts
/** Every pronoun slot: both roles, both numbers, and the three genders of the third person. */
function cliticSlots(): SlotOf<'clitic'>[] {
  return (['object', 'indirect'] as const).flatMap((role) =>
    NUMS.flatMap((number) =>
      ([1, 2, 3] as const).flatMap((person): SlotOf<'clitic'>[] =>
        person === 3
          ? GENDERS.map((gender): SlotOf<'clitic'> => ({ pos: 'clitic', person, number, gender, role }))
          : [{ pos: 'clitic', person, number, role }],
      ),
    ),
  );
}
```

and in `checkLexeme`, after the `conjunction` block:

```ts
  if (l.pos === 'clitic') {
    for (const slot of cliticSlots()) {
      const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
      try {
        if (isEmpty(roClitic(slot).free) || isEmpty(roClitic(slot).enclitic) || isEmpty(roClitic(slot).afterNu)) {
          errors.push(`${where}: empty Romanian pronoun`);
        }
        if (isEmpty(enClitic(slot))) errors.push(`${where}: empty English pronoun`);
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
```

- [ ] **Step 7: The panel**

Create `src/panels/clitic.ts`:

```ts
import { enClitic, greekClitic, greekStrong, roClitic } from '../engine/clitics';
import { GENDER_NAME, whoOptions } from '../engine/labels';
import { plain } from '../engine/segments';
import type { Gender, Level, Num, Person, SlotOf } from '../types';
import { ALL } from './shared';
import type { Control, Panel, PanelRow } from './types';

const WHO = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
const GENDERS: Gender[] = ['m', 'f', 'n'];

/** The same pronoun for another person; the gender only matters in the third person. */
export function withWho(slot: SlotOf<'clitic'>, who: string): SlotOf<'clitic'> {
  const next: SlotOf<'clitic'> = { ...slot, person: Number(who[0]) as Person, number: who.slice(1) as Num };
  if (next.person === 3) next.gender = slot.gender ?? 'n';
  else {
    delete next.gender;
    delete next.roGender;
  }
  return next;
}

const row = (label: string, c: SlotOf<'clitic'>): PanelRow => ({
  label,
  el: plain(greekClitic(c)),
  ro: plain(roClitic(c).free),
  en: plain(enClitic(c)),
});

function controls(slot: SlotOf<'clitic'>, level: Level): Control[] {
  const list: Control[] = [
    { key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` },
  ];
  if (slot.person === 3) {
    list.push({
      key: 'gender',
      label: 'Gender of the noun',
      options: GENDERS.map((g) => ({ value: g, label: GENDER_NAME[g] })),
      value: slot.gender ?? 'n',
    });
  }
  list.push({
    key: 'role',
    label: 'Role',
    options:
      level === 'beginner'
        ? [
            { value: 'object', label: 'it, him, me (the thing acted on)' },
            { value: 'indirect', label: 'to me, to him (who receives it)' },
          ]
        : [
            { value: 'object', label: 'accusative (direct object)' },
            { value: 'indirect', label: 'genitive (indirect object)' },
          ],
    value: slot.role,
  });
  return list;
}

/** The weak pronoun on its own (spec 5.3): the form in each language, and the table of persons in Improver. */
export function cliticPanel(slot: SlotOf<'clitic'>, level: Level): Panel {
  const both = (role: SlotOf<'clitic'>['role']) => greekClitic({ ...slot, role });
  return {
    lemma: `${both('object')} / ${both('indirect')}`,
    posLabel:
      level === 'beginner'
        ? `small word for "${enClitic(slot)}"`
        : `weak pronoun · ${slot.role === 'object' ? 'accusative' : 'genitive'}`,
    controls: controls(slot, level),
    rows: [row('weak form', slot)],
    full:
      level === 'improver'
        ? WHO.map((who) => ({
            ...row(whoOptions.find((o) => o.value === who)?.label ?? who, withWho(slot, who)),
            hl: who === `${slot.person}${slot.number}` ? ALL : undefined,
          }))
        : [],
    plain:
      `Weak pronouns are short and unstressed. Greek puts them after a command (φάε το) and before a negative one (μην το φας); Romanian attaches them with a hyphen after a command (mănâncă-l). The strong form, used for emphasis, is ${greekStrong(slot)}.`,
    irregular: '',
    note: '',
  };
}
```

In `src/panels/types.ts` change the `Control` key union to end with `… | 'kind' | 'degree' | 'sense' | 'gender' | 'role';`.

In `src/panels/panels.ts`: add `import { cliticPanel, withWho } from './clitic';`, add this case to `buildPanel` (before `'conjunction'`):

```ts
    case 'clitic':
      return cliticPanel(slot, level);
```

and in `applyControl` change the `who` case to:

```ts
    case 'who':
      if (slot.pos === 'verb') {
        return { ...state, slot: { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num } };
      }
      if (slot.pos === 'clitic') return { ...state, slot: withWho(slot, value) };
      break;
    case 'gender':
      if (slot.pos === 'clitic') return { ...state, slot: { ...slot, gender: value as Gender } };
      break;
    case 'role':
      if (slot.pos === 'clitic') return { ...state, slot: { ...slot, role: value as 'object' | 'indirect' } };
      break;
```

(adding `Gender` to the type imports of `panels.ts`), and check that the `case` branch's guard still compiles (a clitic slot has no `case`): extend its condition to also exclude `slot.pos !== 'clitic'`.

In `src/data/review.ts` add after the `ending-table:neut-o` line:

```ts
  { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
  { id: 'clitic-table:ro-clitics', kind: 'clitic-table', verified: false },
```

- [ ] **Step 8: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Pending (6)`; `Unverified (231):` (Plan 5's 226, plus 3 for the lexeme and 2 review items).

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/data/clitics.ts src/data/lexemes.ts src/data/review.ts src/engine/clitics.ts src/engine/greek.ts src/validate/validate.ts src/panels/clitic.ts src/panels/panels.ts src/panels/types.ts src/engine/clitics.test.ts src/panels/clitic.test.ts
git commit -m "feat: the weak pronouns: tables, lexeme and panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The stress rule, commands with pronouns, and the verb δίνω

**Files:**

- Create: `src/engine/stress.ts`, `src/test-fixtures.ts`
- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/engine/offers.ts`, `src/engine/compose.ts`, `src/engine/segments.ts`, `src/engine/reading.ts`, `src/Explorer.tsx`, `src/styles.css`
- Test: `src/engine/stress.test.ts`, `src/engine/compose-clitics.test.ts`

**Interfaces:**

- Consumes: Task 1's `Clitic`, `greekClitic`, `cliticSlot`; Plan 4's `compose`, `Piece`, `composedRich`.
- Produces:
  - `src/engine/stress.ts`: `syllables(words): Syllable[]`, `secondAccent(words): { word; at } | null`, `accentAt(word, at): string`.
  - `VerbVoice.indirect?: true`; the verb `dino` (δίνω: present, imperfect, aorist, the imperatives δώσε / δώστε and δίνε / δίνετε; Romanian *a da*; English *give*; `indirect: true`).
  - `slotProblem(verb, slot): string | null` in `offers.ts`: pronouns only with a command, at most two, the indirect one first, third person needs a gender, an indirect pronoun needs `indirect`.
  - `Piece` gains `{ kind: 'clitic'; … }` and `{ kind: 'fused'; text; of }`; `Composed` gains `extraAccent?` and `irregular?`; `compose` places the pronouns (after an affirmative command, before a negative one) and applies the second accent (to a pronoun or to the verb). `Role` gains `'clitic'`.
  - `src/test-fixtures.ts`: the two verbs of the stress unit tests, τηλεφωνώ and διαβάζω (spec 6.6; outside `data/`).

- [ ] **Step 1: Write the failing tests**

Create `src/engine/stress.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { accentAt, secondAccent, syllables } from './stress';

const count = (...words: string[]) => syllables(words).length;

describe('Greek syllables', () => {
  it.each([
    ['δώσε', 2], ['φάε', 2], ['πλύνε', 2], ['μου', 1], ['το', 1], ['δως', 1],
    ['παιδί', 2], ['είναι', 2], ['ψωμιά', 2], ['μία', 2], ['διάβασε', 3], ['τηλεφώνησε', 5],
    ['κοιμάμαι', 3], ['ψωμιού', 2],
  ] as const)('%s has %i', (word, n) => {
    expect(count(word)).toBe(n);
  });

  it('a diphthong is one syllable, a glide ι joins the next vowel, an accented ι does not', () => {
    expect(count('ου')).toBe(1);
    expect(count('αι')).toBe(1);
    expect(count('ια')).toBe(1);
    expect(count('ία')).toBe(2);
    expect(count('άι')).toBe(2);
  });

  it('records which syllable takes the accent and where it sits', () => {
    const all = syllables(['δώσε', 'μου']);
    expect(all.map((s) => [s.word, s.at, s.stressed])).toEqual([[0, 1, true], [0, 3, false], [1, 2, false]]);
  });
});

describe('the second accent (spec 4.3)', () => {
  it('δώσε μου το: the stress would reach the fourth-last syllable, so μού gets the accent', () => {
    const accent = secondAccent(['δώσε', 'μου', 'το']);
    expect(accent).toEqual({ word: 1, at: 2 });
    expect(accentAt('μου', 2)).toBe('μού');
  });

  it('τηλεφώνησε μου: the accent goes on the last syllable of the verb', () => {
    const accent = secondAccent(['τηλεφώνησε', 'μου']);
    expect(accent).toEqual({ word: 0, at: 9 });
    expect(accentAt('τηλεφώνησε', 9)).toBe('τηλεφώνησέ');
  });

  it('διάβασε μου το: the stress is on the fifth-last syllable, the accent two syllables after it', () => {
    const accent = secondAccent(['διάβασε', 'μου', 'το']);
    expect(accent).toEqual({ word: 0, at: 6 });
    expect(accentAt('διάβασε', 6)).toBe('διάβασέ');
  });

  it.each([
    [['φάε', 'το']],
    [['πλύνε', 'το']],
    [['δώσε', 'μου']],
    [['δώσε', 'το']],
    [['δως', 'μου', 'το']],
    [['δώσε']],
  ])('%j needs no second accent', (words) => {
    expect(secondAccent(words)).toBeNull();
  });

  it('a word with no accent mark and more than one syllable has no known stress', () => {
    expect(secondAccent(['ασε', 'μου', 'το', 'ακομα'])).toBeNull();
  });
});
```

Create `src/engine/compose-clitics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import { DIAVAZO, TILEFONO } from '../test-fixtures';
import type { Clitic, GreekVerb, SlotOf } from '../types';
import { compose, composedRich } from './compose';
import { slotProblem } from './offers';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});
const kinds = (verb: GreekVerb, slot: SlotOf<'verb'>) => compose(verb, slot).pieces.map((p) => p.kind);

describe('compose: a command with pronouns', () => {
  it('φάε το: the pronoun follows an affirmative command', () => {
    const composed = compose(getVerb('troo'), command([to]));
    expect(composed.text).toBe('φάε το');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular).toBeUndefined();
  });

  it('πλύνε το: a regular verb', () => {
    expect(compose(getVerb('pleno'), command([to])).text).toBe('πλύνε το');
  });

  it('μην το φας: the pronoun comes before a negative command, after μην', () => {
    const composed = compose(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(composed.text).toBe('μην το φας');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['negation', 'clitic', 'verb']);
  });

  it('a clitic piece carries the lexeme and slot a panel would open', () => {
    const [, piece] = compose(getVerb('troo'), command([to])).pieces;
    expect(piece).toMatchObject({
      kind: 'clitic',
      text: 'το',
      lexeme: 'clitic',
      slot: { pos: 'clitic', role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' },
    });
  });

  it('the plural and the present imperative: φάτε το, τρώγε το', () => {
    expect(compose(getVerb('troo'), command([to], { number: 'pl' })).text).toBe('φάτε το');
    expect(compose(getVerb('troo'), command([to], { tense: 'present' })).text).toBe('τρώγε το');
  });

  it('colours the pronoun with its own role', () => {
    const rich = composedRich(compose(getVerb('troo'), command([to])));
    expect(rich.map((s) => s.role)).toEqual(['stem', 'ending', 'plain', 'clitic']);
  });
});

describe('compose: the stress rule', () => {
  it('δώσε μου: three syllables, no second accent', () => {
    expect(compose(getVerb('dino'), command([mou])).text).toBe('δώσε μου');
  });

  it('δώσε μού το: two pronouns push the stress to the fourth-last syllable (phrase 36)', () => {
    const composed = compose(getVerb('dino'), command([mou, to]));
    expect(composed.text).toBe('δώσε μού το');
    expect(composed.extraAccent).toEqual({ pieceIndex: 1 });
    expect(composed.irregular?.rule).toBe('clitic-stress');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic', 'clitic']);
  });

  it('τηλεφώνησέ μου: the accent falls on the verb (unit test only, spec 4.3)', () => {
    const composed = compose(TILEFONO, command([mou]));
    expect(composed.text).toBe('τηλεφώνησέ μου');
    expect(composed.extraAccent).toEqual({ pieceIndex: 0 });
    expect(kinds(TILEFONO, command([mou]))).toEqual(['verb', 'clitic']);
  });

  it('διάβασέ μου το (unit test only)', () => {
    const composed = compose(DIAVAZO, command([mou, to]));
    expect(composed.text).toBe('διάβασέ μου το');
    expect(composed.extraAccent).toEqual({ pieceIndex: 0 });
  });

  it('a negative command has no stress problem: the pronouns are in front', () => {
    const composed = compose(getVerb('dino'), command([mou, to], { polarity: 'negative' }));
    expect(composed.text).toBe('μην μου το δώσεις');
    expect(composed.extraAccent).toBeUndefined();
  });
});

describe('δίνω', () => {
  const slot = (mood: SlotOf<'verb'>['mood'], tense: SlotOf<'verb'>['tense'], person: 1 | 2 | 3 = 1, number: 'sg' | 'pl' = 'sg') =>
    ({ pos: 'verb', person, number, mood, tense, voice: 'active' }) as SlotOf<'verb'>;
  it.each([
    ['indicative', 'present', 1, 'sg', 'δίνω'],
    ['indicative', 'imperfect', 1, 'sg', 'έδινα'],
    ['indicative', 'imperfect', 1, 'pl', 'δίναμε'],
    ['indicative', 'aorist', 1, 'sg', 'έδωσα'],
    ['indicative', 'aorist', 1, 'pl', 'δώσαμε'],
    ['indicative', 'futureSimple', 1, 'sg', 'θα δώσω'],
    ['indicative', 'perfect', 1, 'sg', 'έχω δώσει'],
    ['imperative', 'aorist', 2, 'sg', 'δώσε'],
    ['imperative', 'aorist', 2, 'pl', 'δώστε'],
    ['imperative', 'present', 2, 'sg', 'δίνε'],
    ['imperative', 'present', 2, 'pl', 'δίνετε'],
  ] as const)('%s %s %s%s -> %s', (mood, tense, person, number, expected) => {
    expect(compose(getVerb('dino'), slot(mood, tense, person, number)).text).toBe(expected);
  });
});

describe('slotProblem', () => {
  const troo = getVerb('troo');
  const dino = getVerb('dino');
  it('accepts no pronouns, one pronoun and an indirect + direct pair', () => {
    expect(slotProblem(troo, command([]))).toBeNull();
    expect(slotProblem(troo, command([to]))).toBeNull();
    expect(slotProblem(dino, command([mou, to]))).toBeNull();
    expect(slotProblem(dino, command([mou]))).toBeNull();
  });
  it('refuses pronouns outside a command', () => {
    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present' }))).toMatch(/only with a command/);
  });
  it('refuses three pronouns, the wrong order, a missing gender and an indirect object the verb cannot take', () => {
    expect(slotProblem(dino, command([mou, to, to]))).toMatch(/at most two/);
    expect(slotProblem(dino, command([to, mou]))).toMatch(/indirect object and then a direct object/);
    expect(slotProblem(troo, command([{ role: 'object', person: 3, number: 'sg' }]))).toMatch(/needs a gender/);
    expect(slotProblem(troo, command([mou]))).toMatch(/takes no indirect object/);
  });
  it('compose refuses what slotProblem refuses', () => {
    expect(() => compose(troo, command([mou]))).toThrow(/takes no indirect object/);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/stress.test.ts src/engine/compose-clitics.test.ts`
Expected: FAIL (`./stress` not found).

- [ ] **Step 3: The stress module**

Create `src/engine/stress.ts`:

```ts
/** Greek stress for the clitic rule (spec 4.3): syllables, the stressed syllable, and the second accent. */

const ACUTE: Record<string, string> = { α: 'ά', ε: 'έ', η: 'ή', ι: 'ί', ο: 'ό', υ: 'ύ', ω: 'ώ' };
const ACCENTED = new Set(['ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ΐ', 'ΰ']);
const DIAERESIS = new Set(['ϊ', 'ϋ', 'ΐ', 'ΰ']);
const BASE: Record<string, string> = {
  ά: 'α', έ: 'ε', ή: 'η', ί: 'ι', ό: 'ο', ύ: 'υ', ώ: 'ω', ϊ: 'ι', ϋ: 'υ', ΐ: 'ι', ΰ: 'υ',
};
const VOWELS = new Set(['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']);

const baseOf = (ch: string): string => BASE[ch] ?? ch;
const isVowel = (ch: string): boolean => VOWELS.has(baseOf(ch));

/** Do two neighbouring vowels make one syllable? A diphthong (αι ει οι υι, αυ ευ ου), or an unaccented ι before a vowel. */
function merges(prev: string, next: string): boolean {
  if (DIAERESIS.has(next) || ACCENTED.has(prev)) return false;
  const a = baseOf(prev);
  const b = baseOf(next);
  if (a === 'ι') return true;
  if (b === 'υ') return a === 'α' || a === 'ε' || a === 'η' || a === 'ο';
  if (b === 'ι') return a === 'α' || a === 'ε' || a === 'ο' || a === 'υ';
  return false;
}

export interface Syllable {
  /** Which word of the unit (0 is the verb). */
  word: number;
  /** The index of the letter that takes an accent in that word (the last vowel of the syllable). */
  at: number;
  /** Whether the syllable carries an accent mark. */
  stressed: boolean;
}

/** The syllables of a unit written as words (the verb, then its pronouns). */
export function syllables(words: readonly string[]): Syllable[] {
  const out: Syllable[] = [];
  words.forEach((word, w) => {
    let last = -1;
    const chars = [...word.toLowerCase()];
    chars.forEach((ch, i) => {
      if (!isVowel(ch)) {
        last = -1;
        return;
      }
      const current = out[out.length - 1];
      if (last >= 0 && current && merges(chars[last], ch)) {
        current.at = i;
        current.stressed = current.stressed || ACCENTED.has(ch);
      } else {
        out.push({ word: w, at: i, stressed: ACCENTED.has(ch) });
      }
      last = i;
    });
  });
  return out;
}

/**
 * Greek stress may not fall further back than the third-last syllable of the whole unit. When the verb's stress
 * would be on the fourth-last syllable or further back, a second accent is written two syllables after it. Returns
 * the word and the letter that take it, or null when no second accent is needed.
 */
export function secondAccent(words: readonly string[]): { word: number; at: number } | null {
  const all = syllables(words);
  let stressed = all.findIndex((s) => s.word === 0 && s.stressed);
  // A one-syllable verb is written without an accent mark but is stressed.
  if (stressed < 0 && all.filter((s) => s.word === 0).length === 1) stressed = 0;
  if (stressed < 0 || all.length - stressed < 4) return null;
  const target = all[stressed + 2];
  return { word: target.word, at: target.at };
}

/** The word with an acute accent on the letter at `at`. */
export function accentAt(word: string, at: number): string {
  const chars = [...word];
  chars[at] = ACUTE[chars[at]] ?? chars[at];
  return chars.join('');
}
```

- [ ] **Step 4: Types, the verb δίνω and the fixtures**

In `src/types.ts`, in `VerbVoice` add after `thirdSingularOnly?: boolean;`:

```ts
  /** The verb takes an indirect object (δίνω: δώσε μου). */
  indirect?: true;
```

In `src/data/lexemes.ts`, after `troo`, add:

```ts
const dino: GreekVerb = {
  id: 'dino',
  pos: 'verb',
  lemma: 'δίνω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'δίνω',
      class: 'omega',
      stems: {
        present: 'δίν',
        imperfect: { strong: { augment: 'έ', stem: 'διν' }, weak: { stem: 'δίν' } },
        aorist: { strong: { augment: 'έ', stem: 'δωσ' }, weak: { stem: 'δώσ' } },
        perfective: 'δώσ',
      },
      overrides: {
        // The usual plural of the aorist imperative is δώστε, not δώσετε.
        'impAorist.2pl': { stem: 'δώσ', ending: 'τε' },
      },
      indirect: true,
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a da',
        infinitive: 'da',
        participle: 'dat',
        present: ['dau', 'dai', 'dă', 'dăm', 'dați', 'dau'],
        subjunctive: ['dau', 'dai', 'dea', 'dăm', 'dați', 'dea'],
        imperfect: ['dădeam', 'dădeai', 'dădea', 'dădeam', 'dădeați', 'dădeau'],
        pluperfect: ['dădusem', 'dăduseși', 'dăduse', 'dăduserăm', 'dăduserăți', 'dăduseră'],
        imperative: ['dă', 'dați'],
      },
      en: { gloss: 'give', base: 'give', third: 'gives', past: 'gave', pastParticiple: 'given', ing: 'giving' },
    },
  },
};
```

and register `[dino.id]: dino,` after `[troo.id]: troo,` in `LEXEMES`.

Create `src/test-fixtures.ts` (spec 6.6: the two verbs of the stress unit tests live outside `data/`):

```ts
import type { GreekVerb } from './types';

const NO_CELLS: readonly string[] = ['', '', '', '', '', ''];

/** A verb with only the aorist imperative, for the stress unit tests; it takes an indirect object. */
const fixture = (id: string, lemma: string, present: string, perfective: string): GreekVerb => ({
  id,
  pos: 'verb',
  lemma,
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma,
      class: 'omega',
      stems: { present, perfective },
      indirect: true,
      offers: { imperative: ['aorist'] },
      ro: { lemma: '-', infinitive: '-', participle: '-', present: NO_CELLS, subjunctive: NO_CELLS, imperfect: NO_CELLS, pluperfect: NO_CELLS },
      en: { gloss: '-', base: '-', third: '-', past: '-', pastParticiple: '-', ing: '-' },
    },
  },
});

/** τηλεφωνώ: τηλεφώνησε has its stress on the third-last syllable, so one pronoun already needs the second accent. */
export const TILEFONO = fixture('tilefono', 'τηλεφωνώ', 'τηλεφων', 'τηλεφώνησ');
/** διαβάζω: διάβασε has its stress on the fourth-last syllable. */
export const DIAVAZO = fixture('diavazo', 'διαβάζω', 'διαβάζ', 'διάβασ');
```

- [ ] **Step 5: `slotProblem`**

In `src/engine/offers.ts` append:

```ts
/** What is wrong with the pronouns of a slot, or null (spec 2, 4.2, 7). */
export function slotProblem(verb: GreekVerb, s: SlotOf<'verb'>): string | null {
  const clitics = s.clitics ?? [];
  if (clitics.length === 0) return null;
  if (s.mood !== 'imperative') return 'pronouns go only with a command';
  const data = verb.voices[s.voice];
  if (!data) return `${verb.id} has no ${s.voice} voice`;
  if (clitics.length > 2) return 'a command takes at most two pronouns';
  if (clitics.some((c) => c.person === 3 && !c.gender)) return 'a third-person pronoun needs a gender';
  if (clitics.length === 2 && !(clitics[0].role === 'indirect' && clitics[1].role === 'object')) {
    return 'two pronouns are an indirect object and then a direct object';
  }
  if (clitics.some((c) => c.role === 'indirect') && !data.indirect) return `${data.lemma} takes no indirect object`;
  return null;
}
```

- [ ] **Step 6: `compose`**

Replace the whole of `src/engine/compose.ts` with:

```ts
import { getLexeme, getVerb } from '../data/lexemes';
import type { Clitic, Form, GreekVerb, IrregularNote, Slot, SlotOf } from '../types';
import { cliticSlot, greekClitic } from './clitics';
import { inflectVerb } from './greek';
import { slotProblem } from './offers';
import { formRich, formText, type Rich } from './segments';
import { accentAt, secondAccent } from './stress';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle, negation, auxiliary or pronoun piece carries the lexeme and slot a
 * panel would open for it (spec 4.2); the lexical verb carries its Form; a fused short form (φάτο) opens the verb.
 */
export type Piece =
  | { kind: 'particle' | 'negation' | 'auxiliary' | 'clitic'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form }
  | { kind: 'fused'; text: string; of: string[] };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
  /** The piece that carries the second accent the stress rule adds (spec 4.3). */
  extraAccent?: { pieceIndex: number };
  /** A rule that shaped the whole group: the second accent. */
  irregular?: IrregularNote;
}

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

const joined = (pieces: Piece[], extra: Pick<Composed, 'extraAccent' | 'irregular'> = {}): Composed => ({
  pieces,
  text: pieces.map(pieceText).join(' '),
  ...extra,
});

function wordPiece(kind: 'particle' | 'negation', id: string): Piece {
  const lexeme = getLexeme(id);
  return { kind, text: lexeme.lemma, lexeme: lexeme.id, slot: { pos: 'particle' } };
}

const cliticPiece = (c: Clitic, text: string = greekClitic(c)): Piece => ({
  kind: 'clitic',
  text,
  lexeme: 'clitic',
  slot: cliticSlot(c),
});

const CLITIC_STRESS: IrregularNote = {
  rule: 'clitic-stress',
  plain:
    'The pronouns push the stress to the fourth-last syllable or further back, which Greek does not allow, so a second accent is written two syllables after the original stress.',
};

/** The form with an acute accent on the letter at `at` of its written text. */
function accentForm(form: Form, at: number): Form {
  const parts = [form.augment ?? '', form.stem, form.ending];
  let offset = 0;
  const next = parts.map((part) => {
    const local = at - offset;
    offset += part.length;
    return local >= 0 && local < part.length ? accentAt(part, local) : part;
  });
  return { ...form, ...(form.augment ? { augment: next[0] } : {}), stem: next[1], ending: next[2] };
}

/** An affirmative command with pronouns: the verb, then the pronouns, with the second accent where the rule asks. */
function commandWithClitics(verb: GreekVerb, slot: SlotOf<'verb'>, clitics: readonly Clitic[]): Composed {
  const form = inflectVerb(verb, slot);
  const texts = clitics.map((c) => greekClitic(c));
  const pieces: Piece[] = [{ kind: 'verb', form }, ...clitics.map((c, i) => cliticPiece(c, texts[i]))];
  const accent = secondAccent([formText(form), ...texts]);
  if (!accent) return joined(pieces);
  if (accent.word === 0) {
    pieces[0] = { kind: 'verb', form: accentForm(form, accent.at) };
  } else {
    const target = pieces[accent.word];
    if (target.kind === 'clitic') pieces[accent.word] = { ...target, text: accentAt(target.text, accent.at) };
  }
  return joined(pieces, { extraAccent: { pieceIndex: accent.word }, irregular: CLITIC_STRESS });
}

/**
 * Builds a verb group in written order: the negation (δεν before θα; μην after να), the particle (θα, να),
 * the auxiliary (έχω) and the lexical verb. A negative command is μην + the pronouns + the subjunctive form
 * (μην το φας); an affirmative command puts its pronouns after the verb (φάε το). See spec 4.3.
 */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
  const problem = slotProblem(verb, slot);
  if (problem) throw new Error(problem);
  const clitics = slot.clitics ?? [];
  const negative = slot.polarity === 'negative';
  if (negative && slot.mood === 'imperative') {
    if (slot.person !== 2) throw new Error('commands are for "you" only');
    const subjunctive: SlotOf<'verb'> = {
      pos: 'verb',
      person: slot.person,
      number: slot.number,
      mood: 'subjunctive',
      tense: slot.tense,
      voice: slot.voice,
    };
    return joined([
      wordPiece('negation', 'min'),
      ...clitics.map((c) => cliticPiece(c)),
      { kind: 'verb', form: inflectVerb(verb, subjunctive) },
    ]);
  }
  if (clitics.length > 0) return commandWithClitics(verb, slot, clitics);

  const structure = structureOf(slot.mood, slot.tense);
  const negation = negative ? wordPiece('negation', slot.mood === 'subjunctive' ? 'min' : 'den') : null;
  const pieces: Piece[] = [];
  if (negation && slot.mood !== 'subjunctive') pieces.push(negation);
  if (structure.particle) pieces.push(wordPiece('particle', structure.particle));
  if (negation && slot.mood === 'subjunctive') pieces.push(negation);
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
  return joined(pieces);
}

/** The group as coloured segments: negation in `neg`, particle and auxiliary in `aux`, pronouns in `clitic`, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich =
      piece.kind === 'verb'
        ? formRich(piece.form)
        : [{ text: piece.text, role: piece.kind === 'negation' ? 'neg' : piece.kind === 'clitic' || piece.kind === 'fused' ? 'clitic' : 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
```

In `src/engine/segments.ts` add `'clitic'` to the `Role` union (`… | 'aux' | 'neg' | 'clitic'`).

In `src/styles.css` append:

```css
.role-clitic { background: var(--accent-bg); color: var(--accent-text); border-radius: 4px; padding: 0 3px; border-bottom: 2px solid var(--accent-text); }
```

`PhraseBar` needs no code change: a pronoun piece is a `piece-clitic` button through the existing `piece-${piece.kind}` class. Add its style to `src/styles.css`:

```css
.piece-clitic { border-style: dashed; }
```

- [ ] **Step 7: Keep the rest of the code compiling**

`Piece` has two new kinds, so two places that read pieces need a small change now (Task 5 gives them their real behaviour).

In `src/types.ts` add `'clitic' | 'fused'` to the `role` union of `ReadingPart` (so it reads `'particle' | 'negation' | 'auxiliary' | 'clitic' | 'fused' | 'augment' | 'stem' | 'ending' | 'word'`).

In `src/engine/reading.ts`, at the top of `wordGloss`, add:

```ts
  // Task 5 gives pronouns and joined short forms their own glosses.
  if (piece.kind === 'fused' || piece.kind === 'clitic') return piece.text;
```

In `src/Explorer.tsx` change the guard in `pieceToOpen` to `if (!piece || piece.kind === 'verb' || piece.kind === 'fused') return null;` and the predicate in `authoredPiece` to `(p) => p.kind !== 'verb' && p.kind !== 'fused' && p.kind === kind && p.lexeme === lexemeId`.

- [ ] **Step 8: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (234):` (231 + 3 for δίνω). If an existing test now fails because `compose` or `Piece` changed shape, fix the test to match (the `Piece` union has two new kinds; nothing else changed for slots without pronouns).

- [ ] **Step 9: Commit**

```bash
git add src/engine/stress.ts src/test-fixtures.ts src/types.ts src/data/lexemes.ts src/engine/offers.ts src/engine/compose.ts src/engine/segments.ts src/engine/reading.ts src/Explorer.tsx src/styles.css src/engine/stress.test.ts src/engine/compose-clitics.test.ts
git commit -m "feat: commands with pronouns, the stress rule and the verb δίνω

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 3: Short forms: φάτο and δως

**Files:**

- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/engine/offers.ts`, `src/engine/compose.ts`
- Test: `src/engine/compose-short.test.ts`

**Interfaces:**

- Consumes: Task 2's `compose`, `slotProblem`, `commandWithClitics`.
- Produces:
  - `interface ShortForm { stem; ending; fuse: boolean; plain: string }`; `VerbVoice.shortForms?: Record<string, ShortForm>` keyed `impAorist.2sg`.
  - Data: τρώω `impAorist.2sg` = φά (fused with the pronoun: φάτο); δίνω `impAorist.2sg` = δως (shortened, pronouns follow: δως μου το).
  - `shortFormOf(verb, slot): ShortForm | undefined` in `offers.ts`; `slotProblem` refuses a short form that the verb lacks, a negative command with one, one with no pronoun, and a joined one with more than one pronoun.
  - `compose` with `shortForm: true`: a `fused` piece (φάτο, `of: ['φάε', 'το']`) or a shortened verb piece (δως), with `Composed.irregular` of rule `short-imperative`. The short forms need no second accent.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/compose-short.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, GreekVerb, SlotOf } from '../types';
import { compose } from './compose';
import { shortFormOf, slotProblem } from './offers';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const ton: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'm' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, shortForm: true, ...extra,
});

describe('φάτο: the short form that joins the pronoun', () => {
  it('is one fused piece with the two words it comes from', () => {
    const composed = compose(getVerb('troo'), command([to]));
    expect(composed.text).toBe('φάτο');
    expect(composed.pieces).toEqual([{ kind: 'fused', text: 'φάτο', of: ['φάε', 'το'] }]);
    expect(composed.irregular?.rule).toBe('short-imperative');
    expect(composed.extraAccent).toBeUndefined();
  });
  it('joins any single pronoun: φάτον', () => {
    expect(compose(getVerb('troo'), command([ton])).text).toBe('φάτον');
  });
});

describe('δως: the short form that stays a word of its own', () => {
  it('δως μου το: three pieces and no second accent', () => {
    const composed = compose(getVerb('dino'), command([mou, to]));
    expect(composed.text).toBe('δως μου το');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic', 'clitic']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular?.rule).toBe('short-imperative');
  });
  it('δως το and δως μου', () => {
    expect(compose(getVerb('dino'), command([to])).text).toBe('δως το');
    expect(compose(getVerb('dino'), command([mou])).text).toBe('δως μου');
  });
  it('without shortForm the same pronouns give the full form and the second accent', () => {
    expect(compose(getVerb('dino'), command([mou, to], { shortForm: false })).text).toBe('δώσε μού το');
  });
});

describe('shortFormOf and slotProblem', () => {
  const troo = getVerb('troo');
  const dino = getVerb('dino');
  it('finds the stored short form of the aorist imperative, second person singular only', () => {
    expect(shortFormOf(troo, command([to]))?.fuse).toBe(true);
    expect(shortFormOf(dino, command([to]))?.fuse).toBe(false);
    expect(shortFormOf(troo, command([to], { number: 'pl' }))).toBeUndefined();
    expect(shortFormOf(troo, command([to], { tense: 'present' }))).toBeUndefined();
    expect(shortFormOf(getVerb('pleno'), command([to]))).toBeUndefined();
  });
  it('accepts a short form with a pronoun', () => {
    expect(slotProblem(troo, command([to]))).toBeNull();
    expect(slotProblem(dino, command([mou, to]))).toBeNull();
  });
  it('refuses a short form the verb lacks, with no pronoun, or in a negative command', () => {
    expect(slotProblem(getVerb('pleno'), command([to]))).toMatch(/has no short form/);
    expect(slotProblem(troo, command([]))).toMatch(/needs a pronoun/);
    expect(slotProblem(troo, command([to], { polarity: 'negative' }))).toMatch(/negative command has no short form/);
    expect(slotProblem(troo, command([to], { number: 'pl' }))).toMatch(/has no short form/);
  });
  it('refuses a short form outside a command', () => {
    expect(slotProblem(troo, command([], { mood: 'indicative', tense: 'present' }))).toMatch(/only with a command/);
  });
  it('a joined short form takes one pronoun', () => {
    const active = dino.voices.active;
    if (!active) throw new Error('δίνω has an active voice');
    const joinedDino: GreekVerb = {
      ...dino,
      voices: {
        active: { ...active, shortForms: { 'impAorist.2sg': { stem: 'δω', ending: 'ς', fuse: true, plain: 'x' } } },
      },
    };
    expect(slotProblem(joinedDino, command([mou, to]))).toMatch(/takes one pronoun/);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/compose-short.test.ts`
Expected: FAIL (`shortFormOf` is not exported).

- [ ] **Step 3: The type and the data**

In `src/types.ts` add above `VerbVoice`:

```ts
/** A lexical short form of a command with a pronoun (spec 4.3): φάε + το = φάτο, δώσε μου = δως μου. */
export interface ShortForm {
  /** The shortened verb: φά, δω. */
  stem: string;
  ending: string;
  /** True when the pronoun joins the verb into one word (φάτο); false when the pronouns stay words (δως μου το). */
  fuse: boolean;
  /** One line for the reader. */
  plain: string;
}
```

and in `VerbVoice`, after `indirect?: true;`:

```ts
  /** Short forms of commands, keyed '<impAorist|impPresent>.<person><number>' (impAorist.2sg). Stored per verb, not generated. */
  shortForms?: Record<string, ShortForm>;
```

In `src/data/lexemes.ts`, in τρώω's active voice, add after the `overrides` object (before `offers:`):

```ts
      shortForms: {
        'impAorist.2sg': {
          stem: 'φά',
          ending: '',
          fuse: true,
          plain: 'A short way of saying φάε το: the final -ε drops and the pronoun joins the verb.',
        },
      },
```

and in δίνω's active voice, after `indirect: true,`:

```ts
      shortForms: {
        'impAorist.2sg': {
          stem: 'δω',
          ending: 'ς',
          fuse: false,
          plain: 'δως is a short form of δώσε: the pronouns follow it as separate words.',
        },
      },
```

- [ ] **Step 4: `shortFormOf` and `slotProblem`**

In `src/engine/offers.ts` add `ShortForm` to the type imports and `import { mainFormKind } from './tenses';` (merge with the existing `./tenses` import), then replace `slotProblem` with:

```ts
/** The stored short form of this command, if the verb has one (spec 4.3). */
export function shortFormOf(verb: GreekVerb, s: SlotOf<'verb'>): ShortForm | undefined {
  const data = verb.voices[s.voice];
  if (!data || s.mood !== 'imperative') return undefined;
  return data.shortForms?.[`${mainFormKind(s.mood, s.tense)}.${s.person}${s.number}`];
}

/** What is wrong with the pronouns or the short form of a slot, or null (spec 2, 4.2, 7). */
export function slotProblem(verb: GreekVerb, s: SlotOf<'verb'>): string | null {
  const clitics = s.clitics ?? [];
  if (clitics.length === 0 && !s.shortForm) return null;
  if (s.mood !== 'imperative') return 'pronouns and short forms go only with a command';
  const data = verb.voices[s.voice];
  if (!data) return `${verb.id} has no ${s.voice} voice`;
  if (clitics.length > 2) return 'a command takes at most two pronouns';
  if (clitics.some((c) => c.person === 3 && !c.gender)) return 'a third-person pronoun needs a gender';
  if (clitics.length === 2 && !(clitics[0].role === 'indirect' && clitics[1].role === 'object')) {
    return 'two pronouns are an indirect object and then a direct object';
  }
  if (clitics.some((c) => c.role === 'indirect') && !data.indirect) return `${data.lemma} takes no indirect object`;
  if (s.shortForm) {
    const short = shortFormOf(verb, s);
    if (!short) return `${data.lemma} has no short form here`;
    if (s.polarity === 'negative') return 'a negative command has no short form';
    if (clitics.length === 0) return 'a short form needs a pronoun';
    if (short.fuse && clitics.length !== 1) return 'the joined short form takes one pronoun';
  }
  return null;
}
```

(The Task 2 test that expects `/only with a command/` still matches.)

- [ ] **Step 5: `compose`**

In `src/engine/compose.ts` change the import `import { slotProblem } from './offers';` to `import { shortFormOf, slotProblem } from './offers';` and replace the whole function `commandWithClitics` with:

```ts
/**
 * An affirmative command with pronouns: the verb, then the pronouns, with the second accent where the rule asks.
 * A short form either joins the pronoun into one word (φάτο) or shortens the verb (δως μου το); neither needs the rule.
 */
function commandWithClitics(verb: GreekVerb, slot: SlotOf<'verb'>, clitics: readonly Clitic[]): Composed {
  const full = inflectVerb(verb, slot);
  const short = slot.shortForm ? shortFormOf(verb, slot) : undefined;
  const shortNote: IrregularNote | undefined = short && { rule: 'short-imperative', plain: short.plain };
  const texts = clitics.map((c) => greekClitic(c));
  if (short?.fuse) {
    const fused = `${short.stem}${short.ending}${texts[0]}`;
    return joined([{ kind: 'fused', text: fused, of: [formText(full), texts[0]] }], { irregular: shortNote });
  }
  const form: Form = short ? { stem: short.stem, ending: short.ending, irregular: shortNote } : full;
  const pieces: Piece[] = [{ kind: 'verb', form }, ...clitics.map((c, i) => cliticPiece(c, texts[i]))];
  const accent = short ? null : secondAccent([formText(form), ...texts]);
  if (!accent) return joined(pieces, shortNote ? { irregular: shortNote } : {});
  if (accent.word === 0) {
    pieces[0] = { kind: 'verb', form: accentForm(form, accent.at) };
  } else {
    const target = pieces[accent.word];
    if (target.kind === 'clitic') pieces[accent.word] = { ...target, text: accentAt(target.text, accent.at) };
  }
  return joined(pieces, { extraAccent: { pieceIndex: accent.word }, irregular: CLITIC_STRESS });
}
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (234):` (unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/data/lexemes.ts src/engine/offers.ts src/engine/compose.ts src/engine/compose-short.test.ts
git commit -m "feat: the short forms φάτο and δως

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Romanian and English commands with pronouns, and the validator

**Files:**

- Modify: `src/engine/romanian.ts`, `src/engine/english.ts`, `src/validate/validate.ts`, `src/data/review.ts`
- Test: `src/engine/clitics-ro-en.test.ts`, `src/validate/clitics-validate.test.ts`

**Interfaces:**

- Consumes: Tasks 1 to 3; `roClitics`, `enClitic`, `slotProblem`, `shortFormOf`.
- Produces:
  - `roVerb` with pronouns: an affirmative command attaches them (*mănâncă-l*, *dă-mi-o*); a negative one puts them after *nu* in front of the infinitive (singular, *nu-l mânca*) or the plural imperative (*nu-l mâncați*).
  - `enVerb` with pronouns: "eat it", "give me", "give it to me" (the direct pronoun first), "don't eat it".
  - `validate` checks, for every verb that offers a command, the command with the pronouns the panel can build (one direct pronoun; for a verb with an indirect object also the indirect one and the pair), in both polarities and with the short form where the verb has one: compose, Romanian and English text.
  - A `ReviewItem` `auxiliary-table:en-clitic-order`.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/clitics-ro-en.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { enVerb, enVerbText } from './english';
import { roVerb } from './romanian';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const toChild: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});
const neg = { polarity: 'negative' as const };

describe('Romanian commands with pronouns (spec 6.5)', () => {
  it('attaches the pronoun with a hyphen: mănâncă-o, spală-l, dă-mi-o', () => {
    expect(roVerb(getVerb('troo'), command([to]))).toBe('mănâncă-o');
    expect(roVerb(getVerb('pleno'), command([toChild]))).toBe('spală-l');
    expect(roVerb(getVerb('dino'), command([mou, to]))).toBe('dă-mi-o');
    expect(roVerb(getVerb('dino'), command([mou]))).toBe('dă-mi');
  });
  it('the plural: mâncați-o, dați-mi-o', () => {
    expect(roVerb(getVerb('troo'), command([to], { number: 'pl' }))).toBe('mâncați-o');
    expect(roVerb(getVerb('dino'), command([mou, to], { number: 'pl' }))).toBe('dați-mi-o');
  });
  it('a negative command: nu o mânca, nu-l mânca, nu mi-o da; plural nu o mâncați', () => {
    expect(roVerb(getVerb('troo'), command([to], neg))).toBe('nu o mânca');
    expect(roVerb(getVerb('troo'), command([toChild], neg))).toBe('nu-l mânca');
    expect(roVerb(getVerb('dino'), command([mou, to], neg))).toBe('nu mi-o da');
    expect(roVerb(getVerb('troo'), command([to], { ...neg, number: 'pl' }))).toBe('nu o mâncați');
  });
  it('a command with no pronouns is unchanged', () => {
    expect(roVerb(getVerb('troo'), command([]))).toBe('mănâncă');
    expect(roVerb(getVerb('troo'), command([], neg))).toBe('nu mânca');
  });
  it('the short form changes nothing in Romanian', () => {
    expect(roVerb(getVerb('troo'), command([to], { shortForm: true }))).toBe('mănâncă-o');
  });
});

describe('English commands with pronouns', () => {
  const text = (verb: string, slot: SlotOf<'verb'>) => enVerbText(getVerb(verb), slot, 'you');
  it('eat it, wash him, give me', () => {
    expect(text('troo', command([to]))).toBe('eat it');
    expect(text('pleno', command([{ ...toChild, gender: 'm' }]))).toBe('wash him');
    expect(text('dino', command([mou]))).toBe('give me');
  });
  it('the direct pronoun comes first: give it to me', () => {
    expect(text('dino', command([mou, to]))).toBe('give it to me');
  });
  it("don't eat it, don't give it to me", () => {
    expect(text('troo', command([to], neg))).toBe("don't eat it");
    expect(text('dino', command([mou, to], neg))).toBe("don't give it to me");
  });
  it('a command has no subject, and a command with no pronouns is unchanged', () => {
    expect(enVerb(getVerb('troo'), command([to])).subject).toBe(false);
    expect(text('troo', command([]))).toBe('eat');
  });
});
```

Create `src/validate/clitics-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekVerb, Phrase, Slot, Token } from '../types';
import { validate } from './validate';

const troo = LEXEMES.troo as GreekVerb;
const base = { lexemes: LEXEMES, phrases: [] as Phrase[] };

describe('the validator builds commands with pronouns', () => {
  it('accepts the real data', () => {
    expect(validate(base)).toEqual([]);
  });

  it('reports a verb whose Romanian command cannot take a pronoun', () => {
    const active = troo.voices.active;
    if (!active) throw new Error('τρώω has an active voice');
    const broken: GreekVerb = {
      ...troo,
      voices: { active: { ...active, ro: { ...active.ro, imperative: undefined } } },
    };
    const errors = validate({ ...base, lexemes: { ...LEXEMES, troo: broken } });
    expect(errors.some((e) => e.includes('lexeme troo') && e.includes('imperative'))).toBe(true);
  });
});

describe('a verb token with pronouns', () => {
  const phraseWith = (token: Token): Phrase => ({
    id: 'test',
    title: 'test',
    theme: 'Eating',
    level: 'beginner',
    tokens: [token],
    glosses: ['natural', 'literal'].flatMap((kind) =>
      (['en', 'ro'] as const).map((language) => ({ language, kind: kind as 'natural' | 'literal', units: [{ text: 'x', link: 0 }] })),
    ),
    verified: false,
  });
  const slot = (patch: Record<string, unknown>): Slot =>
    ({ pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...patch }) as Slot;
  const it_: Record<string, unknown> = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };

  it('accepts φάε το', () => {
    expect(validate({ ...base, phrases: [phraseWith({ text: 'Φάε το!', lexeme: 'troo', slot: slot({ clitics: [it_] }) })] })).toEqual([]);
  });
  it('reports a text that is not what compose produces', () => {
    const errors = validate({ ...base, phrases: [phraseWith({ text: 'Φάε!', lexeme: 'troo', slot: slot({ clitics: [it_] }) })] });
    expect(errors).toContain('test token 0 (Φάε!): text differs from what compose produces ("φάε το")');
  });
  it('reports pronouns outside a command', () => {
    const errors = validate({
      ...base,
      phrases: [phraseWith({ text: 'Τρώω το', lexeme: 'troo', slot: slot({ mood: 'indicative', tense: 'present', clitics: [it_] }) })],
    });
    expect(errors.some((e) => e.includes('pronouns and short forms go only with a command'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/clitics-ro-en.test.ts src/validate/clitics-validate.test.ts`
Expected: FAIL (the commands come out without pronouns).

- [ ] **Step 3: Romanian**

In `src/engine/romanian.ts` add `import { roClitics } from './clitics';` and replace the whole `case 'imperative.present': case 'imperative.aorist': { … }` block of `roVerb` with:

```ts
    case 'imperative.present':
    case 'imperative.aorist': {
      const clitics = s.clitics ?? [];
      const negative = s.polarity === 'negative';
      const attached = clitics.length > 0 ? roClitics(clitics) : null;
      const after = attached ? attached.afterNu : 'nu';
      if (negative && s.number === 'sg') return `${after} ${ro.infinitive}`;
      if (!ro.imperative) throw new Error(`${v.id} has no Romanian imperative`);
      const form = ro.imperative[s.number === 'sg' ? 0 : 1];
      if (negative) return `${after} ${form}`;
      return attached ? `${form}${attached.enclitic}` : form;
    }
```

(The `nu` constant above the `switch` is still used by the other cases.)

- [ ] **Step 4: English**

In `src/engine/english.ts` add `import { enClitic } from './clitics';`, add `Clitic` to the type imports, and add above `enVerb`:

```ts
/** The pronouns after an English command: "eat it", "give me", "give it to me" (the direct pronoun comes first). */
function enObjects(clitics: readonly Clitic[]): string {
  const direct = clitics.find((c) => c.role === 'object');
  const indirect = clitics.find((c) => c.role === 'indirect');
  if (direct && indirect) return ` ${enClitic(direct)} to ${enClitic(indirect)}`;
  const only = direct ?? indirect;
  return only ? ` ${enClitic(only)}` : '';
}
```

and replace the imperative case with:

```ts
    case 'imperative.present':
    case 'imperative.aorist':
      return parts(`${negative ? `don't ${en.base}` : en.base}${enObjects(s.clitics ?? [])}`, '', false);
```

- [ ] **Step 5: The validator**

In `src/validate/validate.ts`: change the import from `../engine/offers` to `import { allVerbSlots, isOffered, shortFormOf, slotProblem } from '../engine/offers';` and add `Clitic` and `GreekVerb` to the type imports. Above `checkLexeme` add:

```ts
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

/** The commands with pronouns the panel can build from an offered command: one direct pronoun, and for a verb with an indirect object also "me" and the pair. */
function pronounSlots(verb: GreekVerb, slot: SlotOf<'verb'>): SlotOf<'verb'>[] {
  if (slot.mood !== 'imperative') return [];
  const indirect = verb.voices[slot.voice]?.indirect === true;
  const sets: Clitic[][] = indirect ? [[IT], [ME], [ME, IT]] : [[IT]];
  return sets.flatMap((clitics): SlotOf<'verb'>[] => [
    { ...slot, clitics },
    { ...slot, clitics, polarity: 'negative' },
    ...(shortFormOf(verb, slot) ? [{ ...slot, clitics, shortForm: true }] : []),
  ]);
}
```

and in the verb block of `checkLexeme` replace the two lines that build `slots` with:

```ts
    const slots = allVerbSlots(l).flatMap((s): SlotOf<'verb'>[] => [
      s,
      { ...s, polarity: 'negative' },
      ...pronounSlots(l, s),
    ]);
    for (const slot of slots.filter((s) => isOffered(l, s) && slotProblem(l, s) === null)) {
```

(The line `for (const slot of slots.filter((s) => isOffered(l, s))) {` is replaced by the `for` above.) A slot the verb cannot take (for example the joined short form with two pronouns) is skipped, not reported.

In `checkToken`, in the verb branch, after the `isOffered` test, report the pronoun problem. Replace

```ts
    if (!isOffered(lexeme, token.slot)) {
      errors.push(`${where}: slot is not offered by ${lexeme.id}`);
    } else {
```

with

```ts
    const problem = slotProblem(lexeme, token.slot);
    if (!isOffered(lexeme, token.slot)) {
      errors.push(`${where}: slot is not offered by ${lexeme.id}`);
    } else if (problem) {
      errors.push(`${where}: ${problem}`);
    } else {
```

In `src/data/review.ts` add after the `auxiliary-table:ro-comparative` line:

```ts
  { id: 'auxiliary-table:en-clitic-order', kind: 'auxiliary-table', verified: false },
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (235):`. (A failure in the "reading part has no gloss" check for a pronoun slot would mean `readingFor` cannot yet read pieces of kind `clitic`: Task 2 gave them the text as gloss, so it passes; Task 5 improves the glosses.)

- [ ] **Step 7: Commit**

```bash
git add src/engine/romanian.ts src/engine/english.ts src/validate/validate.ts src/data/review.ts src/engine/clitics-ro-en.test.ts src/validate/clitics-validate.test.ts
git commit -m "feat: Romanian and English commands with pronouns, and their validation

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Readings for pronouns and short forms

**Files:**

- Modify: `src/engine/reading.ts`, `src/data/readings.ts`, `src/data/review.ts`, `src/validate/validate.ts`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`
- Test: `src/engine/reading-clitics.test.ts`, `src/data/readings.test.ts`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 4; Plan 4's `readingFor`, `ReadingPart`, `READING_TEMPLATES`; Plan 5's `participleReading`.
- Produces:
  - Reading parts for a pronoun (`role: 'clitic'`, gloss "it" or "to me") and for a joined short form (`role: 'fused'`, gloss "φάε + το, joined"); Improver descriptions "accusative pronoun το".
  - Two authored templates, `clitic-stress` and `short-imperative`; `readingFor` picks the template of `Composed.irregular` before the one of the verb's own irregular note; the Improver text of a pair adds the order sentence when no template is used.
  - No Romanian or English reading line for a form with pronouns.
  - The validator fails when the rule of a composed form has no template (as for a verb form).
  - A pronoun part in the Greek reading is a button that opens the pronoun panel; `authoredPiece` matches a piece by kind, lexeme and slot, so the right pronoun chip is pressed.
  - A `ReviewItem` `glossary:clitic-reading`.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/reading-clitics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { readingFor } from './reading';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});

describe('the reading of a command with a pronoun', () => {
  it('φάε το: the pronoun is a part of its own', () => {
    const { el } = readingFor(getVerb('troo'), command([to]));
    expect(el.parts.map((p) => [p.label, p.role, p.piece])).toEqual([
      ['φά-', 'stem', 0],
      ['-ε', 'ending', 0],
      ['το', 'clitic', 1],
    ]);
    expect(el.parts[2].gloss).toBe('it');
    expect(el.beginner).toBe('φάε το: φά- = eat, -ε = a command to you: do it once, το = it.');
    expect(el.improver).toContain('accusative pronoun το');
  });

  it('an indirect pronoun reads "to me"', () => {
    const { el } = readingFor(getVerb('dino'), command([mou]));
    expect(el.parts.find((p) => p.role === 'clitic')?.gloss).toBe('to me');
  });

  it('two pronouns: both are described, genitive then accusative', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to], { shortForm: false }));
    expect(el.improver).toContain('genitive pronoun μού');
    expect(el.improver).toContain('accusative pronoun το');
  });

  it('a negative command: μην, the pronoun, then the verb', () => {
    const { el } = readingFor(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(el.parts.map((p) => [p.label, p.role, p.piece])).toEqual([
      ['μην', 'negation', 0],
      ['το', 'clitic', 1],
      ['φα-', 'stem', 2],
      ['-ς', 'ending', 2],
    ]);
    expect(el.beginner).toContain('To forbid something');
  });
});

describe('the reading of the stress rule and of short forms', () => {
  it('δώσε μού το uses the clitic-stress template', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to]));
    expect(el.beginner).toContain('Greek adds a second accent');
    expect(el.improver).toContain('two syllables after the original stress');
    expect(el.parts.filter((p) => p.role === 'clitic').map((p) => p.label)).toEqual(['μού', 'το']);
  });

  it('φάτο is one joined part and uses the short-imperative template', () => {
    const { el } = readingFor(getVerb('troo'), command([to], { shortForm: true }));
    expect(el.parts).toEqual([{ text: 'φάτο', label: 'φάτο', role: 'fused', gloss: 'φάε + το, joined', piece: 0 }]);
    expect(el.beginner).toContain('A short way of saying φάε το');
    expect(el.improver).toContain('A short way of saying φάε το');
  });

  it('δως μου το: the shortened verb and the pronouns', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to], { shortForm: true }));
    expect(el.beginner).toContain('δως is a short form of δώσε');
    expect(el.parts.filter((p) => p.role === 'clitic').map((p) => p.gloss)).toEqual(['to me', 'it']);
  });

  it('a form with pronouns has no Romanian or English line', () => {
    const reading = readingFor(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(reading.ro).toBeUndefined();
    expect(reading.en).toBeUndefined();
  });
});
```

In `src/data/readings.test.ts` replace the expected list in `has one template per irregularity rule, …` with:

```ts
    expect(READING_TEMPLATES.map((t) => t.rule).sort()).toEqual([
      'clitic-stress', 'irregular-be', 'monosyllable', 'old-stem', 'short-imperative', 'stress-shift',
    ]);
```

Append to `src/App.test.tsx`, inside the `describe('App', …)` block (the pronoun chips arrive with phrases in Task 7, so this test drives the panel of an existing verb by choosing the command and the object):

```tsx
  it('a pronoun part of the reading opens the pronoun panel and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat the bread!');
    await user.click(screen.getByRole('button', { name: 'Φάε' }));
    await user.selectOptions(screen.getByLabelText('Object'), 'pronoun');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    await user.click(within(reading).getByRole('button', { name: /^το: it/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'το / του' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the verb' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τρώω' })).toBeInTheDocument();
  });
```

(This test needs the Object control of Task 6; mark it with `it.skip` here and remove the `.skip` in Task 6, Step 7.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/reading-clitics.test.ts src/data/readings.test.ts`
Expected: FAIL.

- [ ] **Step 3: The templates and the glossary**

In `src/data/readings.ts` add at the end of `READING_TEMPLATES` (before the closing `];`):

```ts
  {
    rule: 'clitic-stress',
    beginner: '{text}: {parts}. Greek adds a second accent so the stress is not too far back.',
    improver:
      '{text}: {technical}. The stress would fall on the fourth-last syllable or further back, so a second accent is written two syllables after the original stress.',
    verified: false,
  },
  {
    rule: 'short-imperative',
    beginner: '{text}: {parts}. {note}',
    improver: '{text}: {technical}. {note}',
    verified: false,
  },
```

In `src/data/review.ts` add after the `glossary:participle-reading` line:

```ts
  { id: 'glossary:clitic-reading', kind: 'glossary', verified: false },
```

- [ ] **Step 4: `readingFor`**

In `src/engine/reading.ts`:

a) Add `import { enClitic } from './clitics';` and `Clitic` to the type imports.

b) Replace `wordGloss` (including the Task 2 line) with:

```ts
/** What a pronoun means in a reading: "it", "to me". */
function cliticGloss(c: Clitic): string {
  return c.role === 'indirect' ? `to ${enClitic(c)}` : enClitic(c);
}

function wordGloss(piece: Exclude<Piece, { kind: 'verb' }>, slot: SlotOf<'verb'>): string {
  if (piece.kind === 'fused') return `${piece.of.join(' + ')}, joined`;
  if (piece.kind === 'clitic') return piece.slot.pos === 'clitic' ? cliticGloss(piece.slot) : piece.text;
  if (piece.kind === 'auxiliary') {
    const aux = piece.slot;
    return aux.pos === 'verb' ? AUX_GLOSS[aux.tense === 'imperfect' ? 'imperfect' : 'present'][whoIndex(aux)] : piece.text;
  }
  if (piece.lexeme === 'theta' && slot.mood === 'conditional') return 'would';
  return PARTICLE_GLOSS[piece.lexeme] ?? piece.text;
}
```

c) In `describe`, before `return piece.text;` add:

```ts
  if (piece.kind === 'clitic' && piece.slot.pos === 'clitic') {
    return `${piece.slot.role === 'object' ? 'accusative' : 'genitive'} pronoun ${piece.text}`;
  }
  if (piece.kind === 'fused') return `${piece.of.join(' + ')} joined (${piece.text})`;
```

d) In `romanianLine` and `englishLine`, add as their first statement:

```ts
  // The fused forms with pronouns (mănâncă-o, nu-l mânca) do not fit the word-by-word shapes.
  if ((slot.clitics ?? []).length > 0) return undefined;
```

e) In `readingFor`, change the template selection and the variables. Replace

```ts
  const template = form?.irregular && !negativeCommand ? READING_TEMPLATES.find((t) => t.rule === form.irregular?.rule) : undefined;
```

with

```ts
  // A rule that shaped the whole group (the second accent, a short form) comes before the verb's own irregularity.
  const rule = composed.irregular?.rule ?? form?.irregular?.rule;
  const template = rule && !negativeCommand ? READING_TEMPLATES.find((t) => t.rule === rule) : undefined;
```

and in the `vars` object change `note: form?.irregular?.plain ?? '',` to `note: composed.irregular?.plain ?? form?.irregular?.plain ?? '',`.

f) The pronoun order sentence: change the `improverTail` definition to

```ts
  const pair = (slot.clitics ?? []).length === 2;
  const improverTail =
    kind === 'base'
      ? ' The auxiliary carries the person.'
      : negativeCommand
        ? ' The subjunctive replaces the imperative.'
        : pair && !template
          ? ' The genitive pronoun comes before the accusative.'
          : '';
```

(keeping the existing `kind === 'base'` and `negativeCommand` branches exactly as they are now).

g) In the loop that builds `parts`, the verb branch must label a stem that has no ending without a hyphen (already done in Plan 5) and the non-verb branch already pushes `role: piece.kind`; nothing else changes.

h) In `src/validate/validate.ts`, in the verb block, replace

```ts
        const lexical = composed.pieces[composed.pieces.length - 1];
        const rule = lexical.kind === 'verb' ? lexical.form.irregular?.rule : undefined;
        if (rule && !READING_TEMPLATES.some((t) => t.rule === rule)) {
          errors.push(`lexeme ${l.id}: the irregular rule "${rule}" has no authored reading`);
        }
```

with

```ts
        const lexical = composed.pieces[composed.pieces.length - 1];
        const rules = [composed.irregular?.rule, lexical.kind === 'verb' ? lexical.form.irregular?.rule : undefined];
        for (const rule of rules) {
          if (rule && !READING_TEMPLATES.some((t) => t.rule === rule)) {
            errors.push(`lexeme ${l.id}: the irregular rule "${rule}" has no authored reading`);
          }
        }
```

- [ ] **Step 5: The panel and the chips**

In `src/components/WordPanel.tsx` extend the `opens` condition so a pronoun part is a button:

```tsx
                    (part.role === 'particle' || part.role === 'negation' || part.role === 'auxiliary' || part.role === 'clitic');
```

In `src/styles.css` change `.reading-particle, .reading-auxiliary { … }` to `.reading-particle, .reading-auxiliary, .reading-clitic, .reading-fused { color: var(--accent-text); }` (keep the declaration inside as it is).

In `src/Explorer.tsx` make `authoredPiece` tell two pronouns apart: replace its signature and body with

```ts
/** The piece of the authored token that is the opened piece (same kind, lexeme and slot), or -1 when the phrase has none. */
function authoredPiece(authored: Token, opened: Token, kind: string | undefined): number {
  if (authored.slot.pos !== 'verb') return -1;
  const pieces = compose(getVerb(authored.lexeme), authored.slot).pieces;
  return pieces.findIndex(
    (p) =>
      p.kind !== 'verb' &&
      p.kind !== 'fused' &&
      p.kind === kind &&
      p.lexeme === opened.lexeme &&
      JSON.stringify(p.slot) === JSON.stringify(opened.slot),
  );
}
```

and its call in `openFromReading` to `authoredPiece(token, opened.token, pieceKindAt(current, pieceIndex))`.

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green (the App test is skipped until Task 6); `Data is valid.`; `Unverified (238):` (235 + 2 templates + 1 review item). If the existing Plan 4 test that opens the second of two particle pieces now fails, check that `authoredPiece` still finds the piece for θα and έχω (their slots are `{ pos: 'particle' }` and the auxiliary verb slot, equal in the authored token and the opened panel).

- [ ] **Step 7: Commit**

```bash
git add src/engine/reading.ts src/data/readings.ts src/data/review.ts src/validate/validate.ts src/components/WordPanel.tsx src/Explorer.tsx src/styles.css src/engine/reading-clitics.test.ts src/data/readings.test.ts src/App.test.tsx
git commit -m "feat: readings for pronouns and short forms

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 6: The Object control

**Files:**

- Create: `src/engine/objects.ts`
- Modify: `src/engine/labels.ts`, `src/panels/types.ts`, `src/panels/panels.ts`, `src/panels/verb.ts`
- Test: `src/engine/objects.test.ts`, `src/panels/object.test.ts`, `src/panels/verb.test.ts`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 5; Plan 5's `nounControl`, `nounPhrase`.
- Produces:
  - `src/engine/objects.ts`: `type ObjectKind = 'none' | 'noun' | 'pronoun' | 'two'`; `DEFAULT_OBJECT = 'psomi'`; `pronounFor(noun): Clitic`; `nounForClitic(c): string | null`; `objectKind(slot, noun): ObjectKind`; `cliticsFor(kind, noun, indirect): Clitic[]`.
  - The verb panel for a command: the **Object** control (none, a noun, a pronoun, two pronouns for a verb with an indirect object) and, unless the kind is none, the **Object noun** control (`noun`); the first row spells the noun out (*φάε το ψωμί* / *mănâncă pâinea* / "eat the bread") for the kind *a noun*; the plain-language line says where the pronoun goes.
  - `verbPanel(verb, slot, state, level)` (new `state` argument); `Control['key']` gains `'object'`; `applyControl` handles `object` and, for a verb, `noun`.
  - `initialState` gives a command with a direct pronoun the noun that fits it (`nounForClitic`) when the token has no `agreesWith`.
  - `changeVerbSlot` drops the pronouns and the short form when the slot leaves the command, drops the short form when it no longer applies, and drops the pronouns when they no longer fit. The full table and the tense overview show the bare verb.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/objects.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { DEFAULT_OBJECT, cliticsFor, nounForClitic, objectKind, pronounFor } from './objects';

const command = (clitics?: Clitic[]): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...(clitics ? { clitics } : {}),
});
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

describe('objects of a command', () => {
  it('the pronoun that stands for a noun follows its Greek and its Romanian gender', () => {
    expect(pronounFor(getNoun('psomi'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' });
    expect(pronounFor(getNoun('paidi'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' });
    expect(pronounFor(getNoun('kafes'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'f' });
  });

  it('finds a noun a pronoun can stand for', () => {
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' })).toBe('psomi');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' })).toBe('paidi');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'm' })).toBe('skylos');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'f', roGender: 'f' })).toBe('alepou');
    expect(nounForClitic({ role: 'object', person: 1, number: 'sg' })).toBeNull();
    expect(nounForClitic({ role: 'object', person: 3, number: 'pl', gender: 'n' })).toBeNull();
  });

  it('derives the kind from the pronouns and the noun', () => {
    expect(objectKind(command(), null)).toBe('none');
    expect(objectKind(command(), 'psomi')).toBe('noun');
    expect(objectKind(command([ME]), 'psomi')).toBe('noun');
    expect(objectKind(command([pronounFor(getNoun('psomi'))]), 'psomi')).toBe('pronoun');
    expect(objectKind(command([ME, pronounFor(getNoun('psomi'))]), 'psomi')).toBe('two');
  });

  it('builds the pronouns for a kind', () => {
    const psomi = getNoun('psomi');
    expect(cliticsFor('none', psomi, true)).toEqual([]);
    expect(cliticsFor('noun', psomi, false)).toEqual([]);
    expect(cliticsFor('noun', psomi, true)).toEqual([ME]);
    expect(cliticsFor('pronoun', psomi, true)).toEqual([pronounFor(psomi)]);
    expect(cliticsFor('two', psomi, true)).toEqual([ME, pronounFor(psomi)]);
  });

  it('the default object is the bread', () => {
    expect(DEFAULT_OBJECT).toBe('psomi');
  });
});
```

Create `src/panels/object.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Clitic, Level, SlotOf } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';
import { changeVerbSlot } from './verb';
import { getVerb } from '../data/lexemes';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const panelOf = (lexeme: string, slot: SlotOf<'verb'>, noun: string | null, level: Level = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: 'sg' };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const row = (p: ReturnType<typeof panelOf>) => ({ el: richText(p.rows[0].el), ro: richText(p.rows[0].ro), en: richText(p.rows[0].en) });
const keys = (p: ReturnType<typeof panelOf>) => p.controls.map((c) => c.key);

describe('the verb panel of a command and its object', () => {
  it('no object: a command offers the Object control set to none', () => {
    const p = panelOf('troo', command(), null);
    expect(keys(p)).toEqual(['who', 'mood', 'tense', 'polarity', 'object']);
    expect(p.controls.find((c) => c.key === 'object')?.value).toBe('none');
    expect(row(p)).toEqual({ el: 'φάε', ro: 'mănâncă', en: 'eat' });
  });

  it('a noun is spelled out: φάε το ψωμί / mănâncă pâinea / eat the bread', () => {
    const p = panelOf('troo', command(), 'psomi');
    expect(keys(p)).toEqual(['who', 'mood', 'tense', 'polarity', 'object', 'noun']);
    expect(p.controls.find((c) => c.key === 'object')?.value).toBe('noun');
    expect(row(p)).toEqual({ el: 'φάε το ψωμί', ro: 'mănâncă pâinea', en: 'eat the bread' });
  });

  it('a verb with an indirect object: δώσε μου το ψωμί / dă-mi pâinea / give me the bread', () => {
    const p = panelOf('dino', command({ clitics: [ME] }), 'psomi');
    expect(row(p)).toEqual({ el: 'δώσε μου το ψωμί', ro: 'dă-mi pâinea', en: 'give me the bread' });
  });

  it('a pronoun: φάε το / mănâncă-o / eat it; two pronouns: δώσε μού το / dă-mi-o / give it to me', () => {
    expect(row(panelOf('troo', command({ clitics: [IT] }), 'psomi'))).toEqual({ el: 'φάε το', ro: 'mănâncă-o', en: 'eat it' });
    expect(row(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi'))).toEqual({
      el: 'δώσε μού το', ro: 'dă-mi-o', en: 'give it to me',
    });
  });

  it('a negative command: μην το φας / nu o mânca / don\'t eat it', () => {
    expect(row(panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi'))).toEqual({
      el: 'μην το φας', ro: 'nu o mânca', en: "don't eat it",
    });
  });

  it('the Object options: three, and four for a verb with an indirect object', () => {
    const options = (id: string) => panelOf(id, command(), null).controls.find((c) => c.key === 'object')?.options.map((o) => o.value);
    expect(options('troo')).toEqual(['none', 'noun', 'pronoun']);
    expect(options('dino')).toEqual(['none', 'noun', 'pronoun', 'two']);
  });

  it('outside a command there is no Object control and the full table has no pronouns', () => {
    const present = panelOf('troo', command({ mood: 'indicative', tense: 'present' }), null);
    expect(keys(present)).toEqual(['who', 'mood', 'tense', 'polarity']);
    const improver = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver');
    expect(improver.full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
    expect(improver.overview).toHaveLength(15);
  });

  it('the plain-language line says where the pronoun goes', () => {
    expect(panelOf('troo', command({ clitics: [IT] }), 'psomi').plain).toContain('follows an affirmative command');
    expect(panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi').plain).toContain('in front of the verb');
  });

  it('the stress rule shows as an irregularity message', () => {
    expect(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi').irregular).toContain('second accent');
  });
});

describe('applyControl: object and object noun', () => {
  const bare: PanelState = { slot: command(), noun: null, nounNumber: 'sg' };

  it('a pronoun for the default noun, then none again', () => {
    const next = applyControl(bare, 'object', 'pronoun', 'troo');
    expect(next.noun).toBe('psomi');
    expect(next.slot).toMatchObject({ clitics: [IT] });
    const none = applyControl(next, 'object', 'none', 'troo');
    expect(none.noun).toBeNull();
    expect(none.slot).not.toHaveProperty('clitics');
  });

  it('a noun for a verb with an indirect object adds "me"; two adds both pronouns', () => {
    expect(applyControl(bare, 'object', 'noun', 'dino').slot).toMatchObject({ clitics: [ME] });
    expect(applyControl(bare, 'object', 'noun', 'troo').slot).not.toHaveProperty('clitics');
    expect(applyControl(bare, 'object', 'two', 'dino').slot).toMatchObject({ clitics: [ME, IT] });
  });

  it('changing the object noun changes the pronoun: the child is το in Greek and -l in Romanian', () => {
    const pronoun = applyControl(bare, 'object', 'pronoun', 'troo');
    const child = applyControl(pronoun, 'noun', 'paidi', 'troo');
    expect(child.noun).toBe('paidi');
    expect(child.slot).toMatchObject({ clitics: [{ role: 'object', gender: 'n', roGender: 'm' }] });
    expect(richText(buildPanel(child, { text: '', lexeme: 'troo', slot: child.slot }, 'beginner').rows[0].ro)).toBe('mănâncă-l');
  });

  it('changing the object drops the short form', () => {
    const short: PanelState = { slot: command({ clitics: [IT], shortForm: true }), noun: 'psomi', nounNumber: 'sg' };
    expect(applyControl(short, 'object', 'two', 'dino').slot).not.toHaveProperty('shortForm');
  });
});

describe('changeVerbSlot keeps pronouns and short forms valid', () => {
  const troo = getVerb('troo');
  const short = command({ clitics: [IT], shortForm: true });
  it('leaving the command drops both', () => {
    const next = changeVerbSlot(troo, short, 'mood', 'indicative');
    expect(next).not.toHaveProperty('clitics');
    expect(next).not.toHaveProperty('shortForm');
  });
  it('the plural, the present and a negative command drop the short form but keep the pronoun', () => {
    const plural = { ...short, number: 'pl' as const };
    expect(changeVerbSlot(troo, plural, 'tense', 'aorist')).not.toHaveProperty('shortForm');
    expect(changeVerbSlot(troo, plural, 'tense', 'aorist')).toHaveProperty('clitics');
    expect(changeVerbSlot(troo, short, 'tense', 'present')).not.toHaveProperty('shortForm');
    const negative = changeVerbSlot(troo, short, 'polarity', 'negative');
    expect(negative).not.toHaveProperty('shortForm');
    expect(negative).toHaveProperty('clitics');
  });
});

describe('initialState for a command', () => {
  it('a command with a pronoun and no noun token gets the noun that fits the pronoun', () => {
    const phrase = { ...PHRASES[0], tokens: [{ text: 'Φάε το', lexeme: 'troo', slot: command({ clitics: [IT] }) }] };
    expect(initialState(phrase.tokens[0], phrase).noun).toBe('psomi');
  });
});
```

Un-skip the Task 5 App test (`it.skip(` becomes `it(`) in `src/App.test.tsx`; it chooses the command Φάε of *Eat the bread!*, sets Object to *pronoun* and opens the pronoun from the reading.

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/objects.test.ts src/panels/object.test.ts`
Expected: FAIL (`./objects` not found).

- [ ] **Step 3: The objects module and the labels**

Create `src/engine/objects.ts`:

```ts
import { LEXEMES } from '../data/lexemes';
import type { Clitic, GreekNoun, SlotOf } from '../types';

export type ObjectKind = 'none' | 'noun' | 'pronoun' | 'two';

/** The noun the Object control starts with. */
export const DEFAULT_OBJECT = 'psomi';

const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

/** The direct pronoun that stands for a noun: the Greek gender from the Greek noun, the Romanian gender from the Romanian one. */
export const pronounFor = (noun: GreekNoun): Clitic => ({
  role: 'object',
  person: 3,
  number: 'sg',
  gender: noun.gender,
  roGender: noun.ro.gender,
});

/** The first noun a third-person singular pronoun can stand for (same Greek and Romanian gender), or null. */
export function nounForClitic(c: Clitic): string | null {
  if (c.person !== 3 || c.number !== 'sg' || !c.gender) return null;
  const match = Object.values(LEXEMES).find(
    (l): l is GreekNoun => l.pos === 'noun' && l.gender === c.gender && l.ro.gender === (c.roGender ?? c.gender),
  );
  return match ? match.id : null;
}

/** The kind of object a command has, from its pronouns and the noun the panel holds. */
export function objectKind(slot: SlotOf<'verb'>, noun: string | null): ObjectKind {
  const clitics = slot.clitics ?? [];
  if (clitics.some((c) => c.role === 'object')) return clitics.some((c) => c.role === 'indirect') ? 'two' : 'pronoun';
  return noun ? 'noun' : 'none';
}

/** The pronouns for an object kind; a verb with an indirect object (δίνω) gets "me" with a noun and in the pair. */
export function cliticsFor(kind: ObjectKind, noun: GreekNoun, indirect: boolean): Clitic[] {
  switch (kind) {
    case 'none':
      return [];
    case 'noun':
      return indirect ? [ME] : [];
    case 'pronoun':
      return [pronounFor(noun)];
    case 'two':
      return [ME, pronounFor(noun)];
  }
}
```

In `src/engine/labels.ts` append:

```ts
/** The kinds of object of a command (spec 5.3). */
export const objectOptions = (level: Level, indirect: boolean): Option[] => [
  { value: 'none', label: 'none' },
  { value: 'noun', label: level === 'beginner' ? 'a noun (spelled out)' : 'a noun phrase' },
  { value: 'pronoun', label: level === 'beginner' ? 'a small word (it, him)' : 'a pronoun' },
  ...(indirect
    ? [{ value: 'two', label: level === 'beginner' ? 'two small words (me + it)' : 'two pronouns (indirect + direct)' }]
    : []),
];
```

In `src/panels/types.ts` add `| 'object'` to the `Control` key union.

- [ ] **Step 4: The verb panel**

In `src/panels/verb.ts`:

a) Imports: add `getNoun` (from `'../data/lexemes'`), `nounPhrase` (from `'../engine/agree'`), `objectOptions` (to the `../engine/labels` import), `objectKind, type ObjectKind` (from `'../engine/objects'`), `slotProblem` (to the `../engine/offers` import), `nounControl` (to the `./shared` import), and `PanelState` (to the `./types` import).

b) Replace `whoSlot` with:

```ts
/** The bare verb for another person: the tables show forms without pronouns or short forms. */
const whoSlot = (slot: SlotOf<'verb'>, who: string): SlotOf<'verb'> => {
  const next: SlotOf<'verb'> = { ...slot, person: Number(who[0]) as Person, number: who.slice(1) as 'sg' | 'pl' };
  delete next.clitics;
  delete next.shortForm;
  return next;
};
```

c) In `overviewRow`, after `const target: SlotOf<'verb'> = { ...slot, mood, tense };` add:

```ts
  delete target.clitics;
  delete target.shortForm;
```

d) Add above `controls`:

```ts
/** Where the pronoun goes, added to the plain-language line of a command with pronouns (spec 6.5). */
const CLITIC_PLAIN = {
  affirmative: 'The pronoun follows an affirmative command (φάε το).',
  negative: 'The pronoun goes in front of the verb in a negative command (μην το φας).',
};

/** The command with its object spelled out: φάε το ψωμί / mănâncă pâinea / eat the bread. */
function objectRow(verb: GreekVerb, slot: SlotOf<'verb'>, noun: GreekNoun): PanelRow {
  const base = verbRow(verb, slot);
  const np = nounPhrase(noun, 'sg', 'acc', { article: 'definite' });
  return {
    ...base,
    el: [...base.el, SPACE, ...np.el],
    ro: [...base.ro, SPACE, ...plain(np.ro)],
    en: [...base.en, SPACE, ...plain(np.en)],
  };
}
```

(add `GreekNoun` to the type imports), change the signature of `controls` to `function controls(verb: GreekVerb, slot: SlotOf<'verb'>, state: PanelState, kind: ObjectKind, level: Level): Control[] {`, and before the final `return list;` of `controls` add:

```ts
  if (slot.mood === 'imperative') {
    const indirect = voiceOf(verb, slot.voice).indirect === true;
    list.push({ key: 'object', label: 'Object', options: objectOptions(level, indirect), value: kind });
    if (kind !== 'none') list.push(nounControl('Object noun', state));
  }
```

e) Change `export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {` to `export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, state: PanelState, level: Level): Panel {` and in its body: add after `const who = …`:

```ts
  const kind: ObjectKind = slot.mood === 'imperative' ? objectKind(slot, state.noun) : 'none';
  const objectNoun = kind === 'noun' && state.noun ? getNoun(state.noun) : null;
```

replace `controls: controls(verb, slot, level),` with `controls: controls(verb, slot, state, kind, level),`, replace `rows: [verbRow(verb, slot)],` with `rows: [objectNoun ? objectRow(verb, slot, objectNoun) : verbRow(verb, slot)],`, change the `plain:` expression to

```ts
    plain:
      PLAIN[`${slot.mood}.${slot.tense}`] +
      (slot.polarity === 'negative' ? ` ${NEGATION_PLAIN[slot.mood]}` : '') +
      ((slot.clitics ?? []).length > 0
        ? ` ${slot.polarity === 'negative' ? CLITIC_PLAIN.negative : CLITIC_PLAIN.affirmative}`
        : ''),
```

and change `irregular: formNote ?? classMessage(data),` to `irregular: composed.irregular?.plain ?? formNote ?? classMessage(data),`.

f) In `changeVerbSlot`, replace the last line before `return next;` (`if (next.polarity === 'negative' && !isOffered(verb, next)) delete next.polarity;`) with:

```ts
  if (next.polarity === 'negative' && !isOffered(verb, next)) delete next.polarity;
  // Pronouns and short forms are for commands; drop what no longer fits.
  if (next.mood !== 'imperative') {
    delete next.clitics;
    delete next.shortForm;
  }
  if (next.polarity === 'negative') delete next.shortForm;
  if (slotProblem(verb, next)) delete next.shortForm;
  if (slotProblem(verb, next)) delete next.clitics;
```

- [ ] **Step 5: `panels.ts`**

In `src/panels/panels.ts`:

a) Imports: `getNoun` with `getLexeme, getVerb`; `import { DEFAULT_OBJECT, cliticsFor, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';`; `voiceOf` from `'../engine/offers'`.

b) `initialState` becomes:

```ts
export function initialState(token: Token, phrase: Phrase): PanelState {
  const nounToken = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
  let noun = nounToken ? nounToken.lexeme : null;
  // A command with a pronoun and no noun token of its own: the noun the pronoun can stand for.
  if (!noun && token.slot.pos === 'verb') {
    const direct = (token.slot.clitics ?? []).find((c) => c.role === 'object');
    if (direct) noun = nounForClitic(direct);
  }
  return {
    slot: token.slot,
    noun,
    nounNumber: nounToken && nounToken.slot.pos === 'noun' ? nounToken.slot.number : 'sg',
  };
}
```

c) In `buildPanel` change the verb case to `return verbPanel(lexeme as GreekVerb, slot, state, level);`.

d) In `applyControl`, add this case before `case 'noun'`:

```ts
    case 'object':
      if (slot.pos === 'verb') {
        if (!lexemeId) throw new Error('the object control needs the lexeme');
        const kind = value as ObjectKind;
        const noun = getNoun(state.noun ?? DEFAULT_OBJECT);
        const next = { ...slot };
        delete next.shortForm;
        const clitics = cliticsFor(kind, noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true);
        if (clitics.length > 0) next.clitics = clitics;
        else delete next.clitics;
        return { ...state, slot: next, noun: kind === 'none' ? null : noun.id };
      }
      break;
```

and inside the existing `case 'noun': { const noun = getLexeme(value); if (noun.pos !== 'noun') break; …` block add, after the `preposition` line:

```ts
      // Without the lexeme the verb's indirect object is unknown: the control does not apply.
      if (slot.pos === 'verb' && lexemeId) {
        const next = { ...slot };
        delete next.shortForm;
        const clitics = cliticsFor(objectKind(slot, state.noun), noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true);
        if (clitics.length > 0) next.clitics = clitics;
        else delete next.clitics;
        return { ...state, slot: next, noun: value };
      }
```

- [ ] **Step 6: Update the tests that call `verbPanel` directly**

Run `grep -rn "verbPanel(" src --include=*.ts --include=*.tsx`. Every call outside `panels.ts` gets a state: `verbPanel(verb, slot, { slot, noun: null, nounNumber: 'sg' }, level)`.

- [ ] **Step 7: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green, including the un-skipped App test; `Data is valid.`; `Unverified (238):` (unchanged). Existing verb-panel tests that list the controls of a command (`who, mood, tense, polarity`) now also see `object`; update their expectation.

- [ ] **Step 8: Commit**

```bash
git add src/engine/objects.ts src/engine/labels.ts src/panels/types.ts src/panels/panels.ts src/panels/verb.ts src/engine/objects.test.ts src/panels/object.test.ts src/panels/verb.test.ts src/App.test.tsx
git commit -m "feat: the Object control of a command

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Phrases 34 to 38 and the pronoun notes

**Files:**

- Modify: `src/data/phrases.ts`, `src/data/divergences.ts`, `src/types.ts`, `src/components/ComparisonTable.tsx`, `src/validate/validate.ts`
- Test: `src/data/phrases-clitics.test.ts`, `src/data/phrases-verbs.test.ts`, `src/components/ComparisonTable.test.tsx`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 6; Plan 4's phrase helpers (`vslot`, `u`, `seg`, `p`, `rows`).
- Produces:
  - Phrases `eat-it` (34), `wash-it` (35), `give-it-to-me` (36), `dont-eat-it` (37) and `eat-bare` (38) after `bread-is-baked`; `PHRASES` has 39 entries in the spec order. The verb tokens of phrases 24, 25 and 26 get `agreesWith` pointing at their noun.
  - `Divergence.appliesTo.when.clitics?: 'some' | 'two'`; `matchesWhen` honours it.
  - Notes `clitic-position`, `clitic-gender`, `clitic-order`, `clitic-stress` (verbs, commands with pronouns) and `clitic-weak-strong` (the pronoun panel).
  - `warnings()` no longer reports a segmented Romanian unit whose segments are pieces of a verb group (*mănâncă|-o*).

- [ ] **Step 1: Write the failing tests**

In `src/data/phrases-verbs.test.ts` replace the whole test `it('the picker lists all 34 phrases in the spec order', …)` with:

```ts
  it('the picker lists all 39 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee', 'want-more-water',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread',
      'eat-less-bread', 'used-to-eat-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'if-i-had-bread', 'would-have-eaten-the-bread',
      'child-is-washed', 'bread-is-baked',
      'eat-it', 'wash-it', 'give-it-to-me', 'dont-eat-it', 'eat-bare',
      'want-not-to-go',
    ]);
  });
```

Create `src/data/phrases-clitics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { compose } from '../engine/compose';
import { linksOf } from '../glossLinks';
import { buildPanel, initialState } from '../panels/panels';
import { richText } from '../engine/segments';
import type { SlotOf } from '../types';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES, getVerb } from './lexemes';
import { PHRASES } from './phrases';

const IDS = ['eat-it', 'wash-it', 'give-it-to-me', 'dont-eat-it', 'eat-bare'];
const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with pronouns (34 to 38)', () => {
  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('start unverified and have a theme', () => {
    for (const id of IDS) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it.each([
    ['eat-it', 'Φάε το!', 2],
    ['wash-it', 'Πλύνε το!', 2],
    ['give-it-to-me', 'Δώσε μού το!', 3],
    ['dont-eat-it', 'Μην το φας!', 3],
    ['eat-bare', 'Φάε!', 1],
  ])('%s is one token, «%s», of %i pieces', (id, text, pieces) => {
    const phrase = byId(id);
    expect(phrase.tokens).toHaveLength(1);
    expect(phrase.tokens[0].text).toBe(text);
    const slot = phrase.tokens[0].slot as SlotOf<'verb'>;
    expect(compose(getVerb(phrase.tokens[0].lexeme), slot).pieces).toHaveLength(pieces);
  });

  it('every gloss unit links to a real piece', () => {
    for (const id of IDS) {
      const phrase = byId(id);
      const count = compose(getVerb(phrase.tokens[0].lexeme), phrase.tokens[0].slot as SlotOf<'verb'>).pieces.length;
      for (const row of phrase.glosses) {
        for (const unit of row.units) {
          for (const link of linksOf(unit)) {
            if (typeof link === 'object') expect(link.piece).toBeLessThan(count);
          }
        }
      }
    }
  });

  it('the panel rows in the three languages (spec 6.1)', () => {
    const row = (id: string) => {
      const phrase = byId(id);
      const r = buildPanel(initialState(phrase.tokens[0], phrase), phrase.tokens[0], 'beginner').rows[0];
      return [richText(r.el), richText(r.ro), richText(r.en)];
    };
    expect(row('eat-it')).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(row('wash-it')).toEqual(['πλύνε το', 'spală-l', 'wash it']);
    expect(row('give-it-to-me')).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(row('dont-eat-it')).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(row('eat-bare')).toEqual(['φάε', 'mănâncă', 'eat']);
  });

  it('the verbs of phrases 24, 25 and 26 go with their noun, so the panel starts on the with-noun reading', () => {
    for (const id of ['eat-the-bread', 'dont-eat-the-bread', 'wash-the-child']) {
      const phrase = byId(id);
      expect(phrase.tokens[0].agreesWith).toBe(2);
      expect(initialState(phrase.tokens[0], phrase).noun).toBe(phrase.tokens[2].lexeme);
    }
  });
});

describe('the pronoun notes', () => {
  const ids = (slot: Partial<SlotOf<'verb'>>, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'verb', 'troo', level, {
      pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...slot,
    }).map((d) => d.id);
  const to = { role: 'object' as const, person: 3 as const, number: 'sg' as const, gender: 'n' as const };

  it('appear only for a command with pronouns', () => {
    expect(ids({}, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([]);
    expect(ids({ clitics: [to] }, 'beginner').filter((id) => id.startsWith('clitic-'))).toEqual(['clitic-position', 'clitic-gender']);
    expect(ids({ clitics: [to] }, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([
      'clitic-position', 'clitic-gender', 'clitic-stress',
    ]);
  });
  it('the order note needs two pronouns', () => {
    const two = [{ role: 'indirect' as const, person: 1 as const, number: 'sg' as const }, to];
    expect(ids({ clitics: two }, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([
      'clitic-position', 'clitic-gender', 'clitic-order', 'clitic-stress',
    ]);
  });
  it('the pronoun panel has its own note', () => {
    expect(selectDivergences(DIVERGENCES, 'clitic', 'clitic', 'beginner').map((d) => d.id)).toEqual(['clitic-weak-strong']);
  });
  it('start unverified', () => {
    for (const d of DIVERGENCES.filter((row) => row.id.startsWith('clitic-'))) expect(d.verified).toBe(false);
  });
});
```

In `src/components/ComparisonTable.test.tsx` append inside the main `describe` (before its closing `});`):

```tsx
  it('a row with a pronoun condition shows only for a command with that many pronouns', () => {
    const row: Divergence = {
      id: 'x', appliesTo: { pos: 'verb', when: { clitics: 'two' } }, point: 'P', el: 'a', ro: 'b', en: 'c',
      tag: 'differs', level: 'core', verified: false,
    };
    const it_ = { role: 'object' as const, person: 3 as const, number: 'sg' as const, gender: 'n' as const };
    const me = { role: 'indirect' as const, person: 1 as const, number: 'sg' as const };
    const slot = (clitics: Clitic[]): Slot =>
      ({ pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics }) as Slot;
    expect(selectDivergences([row], 'verb', 'troo', 'improver', slot([it_]))).toEqual([]);
    expect(selectDivergences([row], 'verb', 'dino', 'improver', slot([me, it_]))).toHaveLength(1);
  });
```

(The file already imports `selectDivergences` and `Slot`; change its type import to `import type { Clitic, Divergence, Slot } from '../types';`.)

Append to `src/App.test.tsx`, inside the `describe('App', …)` block:

```tsx
  it('Eat it! has two pieces; the pronoun opens its own panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat it!');
    const group = screen.getByRole('group', { name: 'Φάε το!' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    const form = within(screen.getAllByRole('table')[0]);
    expect(form.getByRole('cell', { name: 'φάε το' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'mănâncă-o' })).toBeInTheDocument();
    await user.click(within(group).getByRole('button', { name: 'το!' }));
    expect(screen.getByRole('heading', { level: 2, name: 'το / του' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'o' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Gender of the noun'), 'm');
    expect(screen.getByRole('cell', { name: 'τον' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the verb' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τρώω' })).toBeInTheDocument();
  });

  it('Give it to me! shows the second accent and its explanation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Give it to me!');
    const form = within(screen.getAllByRole('table')[0]);
    expect(form.getByRole('cell', { name: 'δώσε μού το' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'dă-mi-o' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'give it to me' })).toBeInTheDocument();
    expect(screen.getByText(/second accent/, { selector: '.warn' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-clitics.test.ts src/data/phrases-verbs.test.ts src/components/ComparisonTable.test.tsx`
Expected: FAIL.

- [ ] **Step 3: The condition on notes**

In `src/types.ts`, in `Divergence.appliesTo.when` add `clitics?: 'some' | 'two'`, so it reads:

```ts
    when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[]; polarity?: Polarity; clitics?: 'some' | 'two' };
```

In `src/components/ComparisonTable.tsx` extend `matchesWhen`'s return with one more condition:

```ts
    (!when.polarity || (slot.polarity ?? 'affirmative') === when.polarity) &&
    (!when.clitics || (when.clitics === 'two' ? (slot.clitics ?? []).length === 2 : (slot.clitics ?? []).length > 0))
```

- [ ] **Step 4: The phrases**

In `src/data/phrases.ts` add `Clitic` to the type imports and, after `qslot`:

```ts
/** ψωμί: το in Greek, o in Romanian (pâine is feminine). */
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
/** παιδί: το in Greek, -l in Romanian (copil is masculine). */
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
/** A command to one person. */
const command = (tense: Tense, extra: Partial<SlotOf<'verb'>> = {}): Slot => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense, voice: 'active', ...extra,
});
```

Add the five phrases after `breadIsBaked` and put them in `PHRASES` between `breadIsBaked,` and `wantNotToGo,`:

```ts
const eatIt: Phrase = {
  id: 'eat-it',
  title: 'Eat it!',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Φάε το!', lexeme: 'troo', slot: command('aorist', { clitics: [IT] }) }],
  glosses: rows(
    [u('Eat', p(0, 0)), u('it!', p(0, 1))],
    [u('(you)', null), u('eat', p(0, 0)), u('it-[acc]', p(0, 1))],
    [seg(['Mănâncă', p(0, 0)], ['-o!', p(0, 1)])],
    [u('(tu)', null), seg(['mănâncă', p(0, 0)], ['-o', p(0, 1)])],
  ),
  verified: false,
};

const washIt: Phrase = {
  id: 'wash-it',
  title: 'Wash him / her / it!',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Πλύνε το!', lexeme: 'pleno', slot: command('aorist', { clitics: [IT_CHILD] }) }],
  glosses: rows(
    [u('Wash', p(0, 0)), u('him / her / it!', p(0, 1))],
    [u('(you)', null), u('wash', p(0, 0)), u('it-[acc]', p(0, 1))],
    [seg(['Spală', p(0, 0)], ['-l!', p(0, 1)])],
    [u('(tu)', null), seg(['spală', p(0, 0)], ['-l', p(0, 1)])],
  ),
  verified: false,
};

const giveItToMe: Phrase = {
  id: 'give-it-to-me',
  title: 'Give it to me!',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Δώσε μού το!', lexeme: 'dino', slot: command('aorist', { clitics: [ME, IT] }) }],
  glosses: rows(
    [u('Give', p(0, 0)), u('it', p(0, 2)), u('to me!', p(0, 1))],
    [u('(you)', null), u('give', p(0, 0)), u('me-[gen]', p(0, 1)), u('it-[acc]', p(0, 2))],
    [seg(['Dă', p(0, 0)], ['-mi', p(0, 1)], ['-o!', p(0, 2)])],
    [u('(tu)', null), seg(['dă', p(0, 0)], ['-mi', p(0, 1)], ['-o', p(0, 2)])],
  ),
  verified: false,
};

const dontEatIt: Phrase = {
  id: 'dont-eat-it',
  title: "Don't eat it!",
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Μην το φας!', lexeme: 'troo', slot: command('aorist', { clitics: [IT], polarity: 'negative' }) },
  ],
  glosses: rows(
    [u("Don't", p(0, 0)), u('eat', p(0, 2)), u('it!', p(0, 1))],
    [u('(you)', null), u('not', p(0, 0)), u('it-[acc]', p(0, 1)), u('eat', p(0, 2))],
    [u('Nu', p(0, 0)), u('o', p(0, 1)), u('mânca!', p(0, 2))],
    [u('(tu)', null), u('nu', p(0, 0)), u('o', p(0, 1)), u('mânca', p(0, 2))],
  ),
  verified: false,
};

const eatBare: Phrase = {
  id: 'eat-bare',
  title: 'Eat!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [{ text: 'Φάε!', lexeme: 'troo', slot: command('aorist') }],
  glosses: rows(
    [u('Eat!', 0)],
    [u('(you)', null), u('eat', 0)],
    [u('Mănâncă!', 0)],
    [u('(tu)', null), u('mănâncă', 0)],
  ),
  verified: false,
};
```

Give the verb tokens of phrases 24, 25 and 26 their noun: in `eatTheBread`, `dontEatTheBread` and `washTheChild` add `agreesWith: 2` to the first token (the verb), whose object noun is the third token.

- [ ] **Step 5: The notes and the warning**

Append to `DIVERGENCES` in `src/data/divergences.ts`:

```ts
  {
    id: 'clitic-position',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'], clitics: 'some' } },
    point: 'Position of the pronoun',
    el: 'after an affirmative command (φάε το), before a negative one (μην το φας)',
    ro: 'after, with a hyphen (mănâncă-l); before a negative one (nu-l mânca)',
    en: 'after the verb both times: eat it, don\'t eat it',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'clitic-gender',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'], clitics: 'some' } },
    point: 'Gender of the pronoun',
    el: 'follows the Greek noun: ψωμί (n) → το',
    ro: 'follows the Romanian noun: pâine (f) → o; copil (m) → -l',
    en: '"it" (no gender), or him / her for a person',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'clitic-order',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'], clitics: 'two' } },
    point: 'Two pronouns',
    el: 'genitive, then accusative: δώσε μού το',
    ro: 'dative, then accusative: dă-mi-o',
    en: '"give it to me": the direct pronoun comes first',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'clitic-stress',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'], clitics: 'some' } },
    point: 'Stress',
    el: 'a second accent when the stress would reach the fourth-last syllable: δώσε μού το',
    ro: 'hyphens only, no accent change',
    en: 'nothing changes',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'clitic-weak-strong',
    appliesTo: { pos: 'clitic' },
    point: 'Weak and strong forms',
    el: 'weak με, σε, το (short, unstressed) and strong εμένα, εσένα, αυτό (for emphasis)',
    ro: 'weak mă, te, îl and strong mine, tine, el',
    en: 'one form: me, you, it',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

In `src/validate/validate.ts`, in `warnings`, directly after `if (!isSegmented(unit)) continue;` add:

```ts
        // Segments that are pieces of a verb group (mănâncă|-o) are not a noun and its article.
        if (unit.segments.every((segment) => typeof segment.link !== 'number')) continue;
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.` with no Warnings block; `Unverified (248):` (238 + 5 phrases + 5 notes). Existing tests that read the verb panel of phrases 24, 25 or 26 now see the noun spelled out (`φάε το ψωμί`); update their expectations.

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/data/phrases.ts src/data/divergences.ts src/components/ComparisonTable.tsx src/validate/validate.ts src/data/phrases-clitics.test.ts src/data/phrases-verbs.test.ts src/components/ComparisonTable.test.tsx src/App.test.tsx
git commit -m "feat: phrases 34 to 38 and the pronoun notes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Form groups

**Files:**

- Create: `src/data/form-groups.ts`, `src/engine/groups.ts`
- Modify: `src/types.ts`, `src/validate/validate.ts`, `scripts/validate.ts`
- Test: `src/engine/groups.test.ts`, `src/validate/groups-validate.test.ts`

**Interfaces:**

- Consumes: Tasks 1 to 7; `compose`, `roVerb`, `enVerbText`, `nounPhrase`, `composedRich`.
- Produces:
  - `FormGroup`, `GroupMember` (spec 4.6); `FORM_GROUPS`: *eat-the-bread*, *wash-the-child*, *give-me-the-bread*, *dont-eat-the-bread* (spec 6.5), each with `closeNotSame`.
  - `src/engine/groups.ts`: `memberKind(m): 'with-noun' | 'short-form' | 'with-clitic'` (the precedence of spec 4.6; a bare verb throws), `memberText(m): { el: Rich; ro: string; en: string; irregular?: string }`, `groupFor(lexemeId, slot, noun): { group; current: number | 'close' | null } | null`.
  - `validate({ lexemes, phrases, groups })` checks every group (at least two members, one verb lexeme and one mood, every member composes and has Romanian and English text, a member is not a bare verb, `closeNotSame` has no pronouns); `scripts/validate.ts` passes `FORM_GROUPS` and counts the groups among the unverified records.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/groups.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FORM_GROUPS } from '../data/form-groups';
import type { GroupMember, SlotOf } from '../types';
import { groupFor, memberKind, memberText } from './groups';
import { richText } from './segments';

const group = (id: string) => {
  const g = FORM_GROUPS.find((x) => x.id === id);
  if (!g) throw new Error(`no group ${id}`);
  return g;
};
const text = (m: GroupMember) => {
  const t = memberText(m);
  return [richText(t.el), t.ro, t.en];
};

describe('the form groups (spec 6.5)', () => {
  it('there are four, each unverified, with at least two members and a close-but-not-the-same row', () => {
    expect(FORM_GROUPS.map((g) => g.id)).toEqual(['eat-the-bread', 'wash-the-child', 'give-me-the-bread', 'dont-eat-the-bread']);
    for (const g of FORM_GROUPS) {
      expect(g.verified).toBe(false);
      expect(g.members.length).toBeGreaterThanOrEqual(2);
      expect(g.closeNotSame).toBeDefined();
    }
  });

  it('Eat the bread!: with a noun, with a pronoun, and the short form', () => {
    const g = group('eat-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic', 'short-form']);
    expect(text(g.members[0])).toEqual(['φάε το ψωμί', 'mănâncă pâinea', 'eat the bread']);
    expect(text(g.members[1])).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(text(g.members[2])).toEqual(['φάτο', 'mănâncă-o', 'eat it']);
    expect(g.closeNotSame && text({ verb: g.closeNotSame.verb })).toEqual(['φάε', 'mănâncă', 'eat']);
  });

  it('Wash the child!: no short form; the Romanian pronoun is -l', () => {
    const g = group('wash-the-child');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic']);
    expect(text(g.members[0])).toEqual(['πλύνε το παιδί', 'spală copilul', 'wash the child']);
    expect(text(g.members[1])).toEqual(['πλύνε το', 'spală-l', 'wash it']);
  });

  it('Give me the bread!: two pronouns and the stress rule; the short form needs none', () => {
    const g = group('give-me-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic', 'short-form']);
    expect(text(g.members[0])).toEqual(['δώσε μου το ψωμί', 'dă-mi pâinea', 'give me the bread']);
    expect(text(g.members[1])).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(text(g.members[2])).toEqual(['δως μου το', 'dă-mi-o', 'give it to me']);
    expect(memberText(g.members[1]).irregular).toContain('second accent');
    expect(memberText(g.members[2]).irregular).toContain('short form');
  });

  it("Don't eat the bread!: the pronoun moves in front of the verb", () => {
    const g = group('dont-eat-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic']);
    expect(text(g.members[0])).toEqual(['μην φας το ψωμί', 'nu mânca pâinea', "don't eat the bread"]);
    expect(text(g.members[1])).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(g.members[1].note).toContain('in front of the verb');
  });

  it('a bare verb is not a member', () => {
    const bare: GroupMember = { verb: { lexeme: 'troo', slot: { pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active' } } };
    expect(() => memberKind(bare)).toThrow(/not a member/);
  });

  it('with-noun wins over the other kinds (spec 4.6)', () => {
    const g = group('give-me-the-bread');
    expect(g.members[0].verb.slot.clitics).toHaveLength(1);
    expect(memberKind(g.members[0])).toBe('with-noun');
  });
});

describe('groupFor: which group a panel belongs to, and which member is in use', () => {
  const slot = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
    pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
  });
  const it_ = { role: 'object' as const, person: 3 as const, number: 'sg' as const, gender: 'n' as const, roGender: 'f' as const };

  it('the bare verb with no noun is the close row; with the bread it is the with-noun member', () => {
    expect(groupFor('troo', slot(), null)).toMatchObject({ group: { id: 'eat-the-bread' }, current: 'close' });
    expect(groupFor('troo', slot(), 'psomi')).toMatchObject({ group: { id: 'eat-the-bread' }, current: 0 });
  });

  it('a pronoun or a short form is its member, whatever noun the panel holds', () => {
    expect(groupFor('troo', slot({ clitics: [it_] }), 'psomi')).toMatchObject({ current: 1 });
    expect(groupFor('troo', slot({ clitics: [it_], shortForm: true }), 'psomi')).toMatchObject({ current: 2 });
  });

  it('the same command with another pronoun is in the family but not a member', () => {
    const other = { ...it_, roGender: 'm' as const };
    expect(groupFor('troo', slot({ clitics: [other] }), 'paidi')).toMatchObject({ group: { id: 'eat-the-bread' }, current: null });
  });

  it('the negative command and the other verbs find their own groups', () => {
    expect(groupFor('troo', slot({ polarity: 'negative', clitics: [it_] }), 'psomi')).toMatchObject({
      group: { id: 'dont-eat-the-bread' }, current: 1,
    });
    expect(groupFor('pleno', slot(), 'paidi')).toMatchObject({ group: { id: 'wash-the-child' }, current: 0 });
    expect(groupFor('dino', slot(), null)).toMatchObject({ group: { id: 'give-me-the-bread' }, current: 'close' });
  });

  it('a command with no group, and anything that is not a command, has none', () => {
    expect(groupFor('troo', slot({ tense: 'present' }), null)).toBeNull();
    expect(groupFor('troo', slot({ number: 'pl' }), null)).toBeNull();
    expect(groupFor('troo', slot({ mood: 'indicative', tense: 'present' }), null)).toBeNull();
  });
});
```

Create `src/validate/groups-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FORM_GROUPS } from '../data/form-groups';
import { LEXEMES } from '../data/lexemes';
import type { FormGroup } from '../types';
import { validate } from './validate';

const input = (groups: FormGroup[]) => ({ lexemes: LEXEMES, phrases: [], groups });
const eat = FORM_GROUPS[0];

describe('the validator checks form groups (spec 7)', () => {
  it('accepts the real groups', () => {
    expect(validate(input(FORM_GROUPS))).toEqual([]);
  });
  it('refuses a group with fewer than two members', () => {
    expect(validate(input([{ ...eat, members: [eat.members[0]] }]))).toContain('group eat-the-bread: needs at least two members');
  });
  it('refuses members of different verbs or moods', () => {
    const other = { ...eat.members[1], verb: { ...eat.members[1].verb, lexeme: 'pleno' } };
    expect(validate(input([{ ...eat, members: [eat.members[0], other] }]))).toContain(
      'group eat-the-bread: the members use different verbs or moods',
    );
  });
  it('refuses a member that does not compose', () => {
    const broken = {
      ...eat.members[1],
      verb: { ...eat.members[1].verb, slot: { ...eat.members[1].verb.slot, mood: 'indicative' as const, tense: 'present' as const } },
    };
    const errors = validate(input([{ ...eat, members: [eat.members[0], broken] }]));
    expect(errors.some((e) => e.startsWith('group eat-the-bread: member 1'))).toBe(true);
  });
  it('refuses a bare verb as a member', () => {
    const bare = { verb: eat.members[0].verb };
    const errors = validate(input([{ ...eat, members: [eat.members[0], bare] }]));
    expect(errors).toContain('group eat-the-bread: member 1 is a bare verb, which is not a member');
  });
  it('refuses a close-but-not-the-same verb with pronouns', () => {
    const close = eat.closeNotSame && { ...eat.closeNotSame, verb: eat.members[1].verb };
    expect(validate(input([{ ...eat, closeNotSame: close }]))).toContain(
      'group eat-the-bread: the close-but-not-the-same verb must have no pronouns',
    );
  });
  it('refuses an object noun that does not exist', () => {
    const ghost = { ...eat.members[0], object: { noun: 'nope', number: 'sg' as const, case: 'acc' as const } };
    const errors = validate(input([{ ...eat, members: [ghost, eat.members[1]] }]));
    expect(errors.some((e) => e.includes('member 0') && e.includes('nope'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/groups.test.ts src/validate/groups-validate.test.ts`
Expected: FAIL (`../data/form-groups` not found).

- [ ] **Step 3: The types and the data**

In `src/types.ts` append:

```ts
/** One way of saying the same command (spec 4.6): a slot, and optionally a spelled-out object. */
export interface GroupMember {
  verb: { lexeme: string; slot: SlotOf<'verb'> };
  /** A spelled-out object noun (the with-noun member). */
  object?: { noun: string; number: Num; case: Case };
  /** A note shown with the member ("the pronoun moves in front of the verb"). */
  note?: string;
}

/** Forms that mean the same (spec 4.6); the texts are generated from the slots. */
export interface FormGroup {
  id: string;
  /** Plain language: "Eat the bread!". */
  meaning: string;
  members: GroupMember[];
  /** The verb with no object, shown under the strip as "close, not the same". */
  closeNotSame?: { verb: GroupMember['verb']; reason: string };
  /** Covers the meaning, the member notes, the close-not-the-same reason and the claim that the members mean the same (spec 4.3). */
  verified: boolean;
}
```

Create `src/data/form-groups.ts`:

```ts
import type { Clitic, FormGroup, SlotOf } from '../types';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const object = (noun: string) => ({ noun, number: 'sg' as const, case: 'acc' as const });

/** The four groups of spec 6.5. A speaker must confirm that each group's members mean the same (spec 9). */
export const FORM_GROUPS: FormGroup[] = [
  {
    id: 'eat-the-bread',
    meaning: 'Eat the bread!',
    members: [
      { verb: { lexeme: 'troo', slot: command() }, object: object('psomi') },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT] }) },
        note: 'το is neuter (ψωμί); the Romanian pronoun o is feminine (pâine).',
      },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT], shortForm: true }) },
        note: 'The final -ε drops and the pronoun joins: φά(ε) + το.',
      },
    ],
    closeNotSame: { verb: { lexeme: 'troo', slot: command() }, reason: 'no object: what to eat is not said' },
    verified: false,
  },
  {
    id: 'wash-the-child',
    meaning: 'Wash the child!',
    members: [
      { verb: { lexeme: 'pleno', slot: command() }, object: object('paidi') },
      {
        verb: { lexeme: 'pleno', slot: command({ clitics: [IT_CHILD] }) },
        note: 'το is neuter (παιδί); the Romanian pronoun -l is masculine (copil).',
      },
    ],
    closeNotSame: { verb: { lexeme: 'pleno', slot: command() }, reason: 'no object: whom to wash is not said' },
    verified: false,
  },
  {
    id: 'give-me-the-bread',
    meaning: 'Give me the bread!',
    members: [
      { verb: { lexeme: 'dino', slot: command({ clitics: [ME] }) }, object: object('psomi') },
      {
        verb: { lexeme: 'dino', slot: command({ clitics: [ME, IT] }) },
        note: 'Two pronouns: the genitive μου comes before the accusative το.',
      },
      {
        verb: { lexeme: 'dino', slot: command({ clitics: [ME, IT], shortForm: true }) },
        note: 'δως needs no second accent.',
      },
    ],
    closeNotSame: { verb: { lexeme: 'dino', slot: command() }, reason: 'no object: what to give is not said' },
    verified: false,
  },
  {
    id: 'dont-eat-the-bread',
    meaning: "Don't eat the bread!",
    members: [
      { verb: { lexeme: 'troo', slot: command({ polarity: 'negative' }) }, object: object('psomi') },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT], polarity: 'negative' }) },
        note: 'The pronoun moves in front of the verb: μην το φας.',
      },
    ],
    closeNotSame: {
      verb: { lexeme: 'troo', slot: command({ polarity: 'negative' }) },
      reason: 'no object: what not to eat is not said',
    },
    verified: false,
  },
];
```

- [ ] **Step 4: The engine**

Create `src/engine/groups.ts`:

```ts
import { FORM_GROUPS } from '../data/form-groups';
import { getNoun, getVerb } from '../data/lexemes';
import type { FormGroup, GroupMember, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { compose, composedRich } from './compose';
import { enVerbText } from './english';
import { roVerb } from './romanian';
import type { Rich } from './segments';

export type MemberKind = 'with-noun' | 'short-form' | 'with-clitic';

/** The kind of a member, derived in the order of spec 4.6: a spelled-out noun wins, then a short form, then a pronoun. */
export function memberKind(m: GroupMember): MemberKind {
  if (m.object) return 'with-noun';
  if (m.verb.slot.shortForm) return 'short-form';
  if ((m.verb.slot.clitics ?? []).length > 0) return 'with-clitic';
  throw new Error('a bare verb is not a member');
}

export interface MemberText {
  el: Rich;
  ro: string;
  en: string;
  /** The stress rule or the short form, in a sentence (Improver). */
  irregular?: string;
}

/** The three texts of a member, generated from its slot and its object (spec 4.6). */
export function memberText(m: GroupMember): MemberText {
  const verb = getVerb(m.verb.lexeme);
  const composed = compose(verb, m.verb.slot);
  const object = m.object ? nounPhrase(getNoun(m.object.noun), m.object.number, m.object.case, { article: 'definite' }) : null;
  const space: Rich = [{ text: ' ', role: 'plain' }];
  return {
    el: object ? [...composedRich(composed), ...space, ...object.el] : composedRich(composed),
    ro: [roVerb(verb, m.verb.slot), object?.ro].filter(Boolean).join(' '),
    en: [enVerbText(verb, m.verb.slot, ''), object?.en].filter(Boolean).join(' '),
    irregular: composed.irregular?.plain,
  };
}

/** The identity of a command for matching: everything but the object noun. */
const slotKey = (s: SlotOf<'verb'>): string =>
  JSON.stringify([
    s.mood, s.tense, s.person, s.number, s.voice, s.polarity ?? 'affirmative',
    (s.clitics ?? []).map((c) => [c.role, c.person, c.number, c.gender ?? null, c.roGender ?? null]),
    s.shortForm ?? false,
  ]);

/** The same command apart from the pronouns and the short form. */
const familyKey = (s: SlotOf<'verb'>): string =>
  JSON.stringify([s.mood, s.tense, s.person, s.number, s.voice, s.polarity ?? 'affirmative']);

export interface GroupMatch {
  group: FormGroup;
  /** The member in use (its index), the close-but-not-the-same row, or null when the panel is in the family but on no member. */
  current: number | 'close' | null;
}

/**
 * The group a command panel belongs to (spec 5.4): the one with a member of the same verb, mood, tense, person and
 * polarity. `noun` is the object noun the panel holds, or null.
 */
export function groupFor(lexemeId: string, slot: SlotOf<'verb'>, noun: string | null): GroupMatch | null {
  if (slot.mood !== 'imperative') return null;
  for (const group of FORM_GROUPS) {
    const family = group.members.some((m) => m.verb.lexeme === lexemeId && familyKey(m.verb.slot) === familyKey(slot));
    if (!family) continue;
    const index = group.members.findIndex(
      (m) =>
        m.verb.lexeme === lexemeId &&
        slotKey(m.verb.slot) === slotKey(slot) &&
        (m.object ? m.object.noun === noun : true),
    );
    if (index >= 0) return { group, current: index };
    const close = group.closeNotSame;
    if (close && close.verb.lexeme === lexemeId && slotKey(close.verb.slot) === slotKey(slot) && noun === null) {
      return { group, current: 'close' };
    }
    return { group, current: null };
  }
  return null;
}
```

- [ ] **Step 5: The validator**

In `src/validate/validate.ts`: import `FormGroup` (type), `memberKind, memberText` from `'../engine/groups'` and `getVerb`'s sibling `getNoun`? (no: the group check reads `input.lexemes`). Add `groups?: FormGroup[]` to `ValidationInput`, add this function above `validate`:

```ts
/** Spec 7: a group has two members or more, one verb and one mood, members that compose and are not bare, and a close verb with no pronouns. */
function checkGroup(group: FormGroup, lexemes: Record<string, GreekLexeme>): string[] {
  const errors: string[] = [];
  const where = `group ${group.id}`;
  if (isEmpty(group.meaning)) errors.push(`${where}: has no meaning text`);
  if (group.members.length < 2) errors.push(`${where}: needs at least two members`);
  const first = group.members[0];
  if (first && group.members.some((m) => m.verb.lexeme !== first.verb.lexeme || m.verb.slot.mood !== first.verb.slot.mood)) {
    errors.push(`${where}: the members use different verbs or moods`);
  }
  group.members.forEach((member, i) => {
    const lexeme = lexemes[member.verb.lexeme];
    if (!lexeme || lexeme.pos !== 'verb') {
      errors.push(`${where}: member ${i} uses the unknown verb "${member.verb.lexeme}"`);
      return;
    }
    if (member.object && !lexemes[member.object.noun]) {
      errors.push(`${where}: member ${i} uses the unknown noun "${member.object.noun}"`);
      return;
    }
    try {
      memberKind(member);
    } catch {
      errors.push(`${where}: member ${i} is a bare verb, which is not a member`);
      return;
    }
    try {
      const text = memberText(member);
      if (isEmpty(text.ro) || isEmpty(text.en) || text.el.length === 0) errors.push(`${where}: member ${i} has an empty text`);
    } catch (e) {
      errors.push(`${where}: member ${i} does not compose: ${(e as Error).message}`);
    }
  });
  const close = group.closeNotSame;
  if (close) {
    if ((close.verb.slot.clitics ?? []).length > 0) {
      errors.push(`${where}: the close-but-not-the-same verb must have no pronouns`);
    }
    if (isEmpty(close.reason)) errors.push(`${where}: the close-but-not-the-same verb has no reason`);
  }
  return errors;
}
```

and at the end of `validate` (before `return errors;`) add `for (const group of input.groups ?? []) errors.push(...checkGroup(group, input.lexemes));`.

In `scripts/validate.ts` import `FORM_GROUPS` from `'../src/data/form-groups'`, pass `groups: FORM_GROUPS` to the `validate` call, and add to the `unverified` array:

```ts
  ...FORM_GROUPS.filter((g) => !g.verified).map((g) => `group ${g.id}`),
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (252):` (248 + 4 groups).

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/data/form-groups.ts src/engine/groups.ts src/validate/validate.ts scripts/validate.ts src/engine/groups.test.ts src/validate/groups-validate.test.ts
git commit -m "feat: form groups, their text and their validation

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 9: The "Same meaning" strip

**Files:**

- Create: `src/components/MixedText.tsx`, `src/components/SameMeaningStrip.tsx`, `src/panels/sameMeaning.ts`
- Modify: `src/panels/types.ts`, `src/panels/panels.ts`, `src/panels/verb.ts`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`
- Test: `src/panels/strip.test.ts`, `src/components/SameMeaningStrip.test.tsx`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 6 to 8; `groupFor`, `memberKind`, `memberText`, `notice`, `nounForClitic`.
- Produces:
  - `SameMeaning { meaning; rows: SameMeaningRow[]; close?; notes: string[] }` and `Panel.sameMeaning?`; `sameMeaningFor(lexemeId, slot, noun, level)`.
  - Beginner rows: *with noun* and *with clitic*; Improver adds *short form* rows (their Romanian and English cells read "none"), the stress and short-form sentences and the order note for two pronouns. A member's own note shows at both levels. The row in use is a pressed button; the bare verb is the "Close, not the same" row with its reason.
  - `applyControl(state, 'member', key, lexemeId)`: copies the member's slot (and its object noun) into the working copy; `'close'` selects the bare verb.
  - `SameMeaningStrip` component; `WordPanel` prop `onMember`; `Explorer` wires it to `changeControl('member', key)`.
  - `MixedText` moves out of `WordPanel` into its own file.

- [ ] **Step 1: Write the failing tests**

Create `src/panels/strip.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Clitic, Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const panelOf = (lexeme: string, slot: SlotOf<'verb'>, noun: string | null, level: Level = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: 'sg' };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const texts = (r: { el: Parameters<typeof richText>[0]; ro: Parameters<typeof richText>[0]; en: Parameters<typeof richText>[0] }) => [
  richText(r.el), richText(r.ro), richText(r.en),
];

describe('the Same-meaning strip (spec 5.4)', () => {
  it('Beginner: with a noun and with a pronoun, the form in use pressed, and the close row', () => {
    const strip = panelOf('troo', command(), 'psomi').sameMeaning;
    expect(strip?.meaning).toBe('Eat the bread!');
    expect(strip?.rows.map((r) => [r.tag, r.current])).toEqual([['with noun', true], ['with clitic', false]]);
    expect(strip && texts(strip.rows[0])).toEqual(['φάε το ψωμί', 'mănâncă pâinea', 'eat the bread']);
    expect(strip && texts(strip.rows[1])).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(strip?.rows[1].note).toContain('feminine (pâine)');
    expect(strip?.close && texts(strip.close)).toEqual(['φάε', 'mănâncă', 'eat']);
    expect(strip?.close?.reason).toBe('no object: what to eat is not said');
    expect(strip?.close?.current).toBe(false);
    expect(strip?.notes).toEqual([]);
  });

  it('Improver adds the short-form row, whose Romanian and English cells read "none"', () => {
    const strip = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver').sameMeaning;
    expect(strip?.rows.map((r) => [r.tag, r.current])).toEqual([
      ['with noun', false], ['with clitic', false], ['short form', true],
    ]);
    expect(strip && texts(strip.rows[2])).toEqual(['φάτο', 'none', 'none']);
    expect(strip?.notes).toEqual(['short form: A short way of saying φάε το: the final -ε drops and the pronoun joins the verb.']);
  });

  it('the bare verb with no object is the close row', () => {
    const strip = panelOf('troo', command(), null).sameMeaning;
    expect(strip?.rows.every((r) => !r.current)).toBe(true);
    expect(strip?.close?.current).toBe(true);
  });

  it('two pronouns: the stress sentence and the order note are for Improver', () => {
    const improver = panelOf('dino', command({ clitics: [ME, IT] }), 'psomi', 'improver').sameMeaning;
    expect(improver && texts(improver.rows[1])).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(improver?.notes).toContain('with clitic: The pronouns push the stress to the fourth-last syllable or further back, which Greek does not allow, so a second accent is written two syllables after the original stress.');
    expect(improver?.notes).toContain('Two pronouns: the genitive comes before the accusative.');
    expect(improver?.rows[2].tag).toBe('short form');
    expect(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi', 'beginner').sameMeaning?.notes).toEqual([]);
  });

  it("Don't eat the bread!: the negative group, with the note that the pronoun moves", () => {
    const strip = panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi').sameMeaning;
    expect(strip?.meaning).toBe("Don't eat the bread!");
    expect(strip?.rows.map((r) => r.current)).toEqual([false, true]);
    expect(strip && texts(strip.rows[1])).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(strip?.rows[1].note).toContain('in front of the verb');
  });

  it('Wash the child!: the Romanian pronoun is -l', () => {
    const strip = panelOf('pleno', command({ clitics: [IT_CHILD] }), 'paidi').sameMeaning;
    expect(strip?.meaning).toBe('Wash the child!');
    expect(strip && texts(strip.rows[1])).toEqual(['πλύνε το', 'spală-l', 'wash it']);
    expect(strip?.rows).toHaveLength(2);
  });

  it('there is no strip outside a command, or for a command with no group', () => {
    expect(panelOf('troo', command({ mood: 'indicative', tense: 'present' }), null).sameMeaning).toBeUndefined();
    expect(panelOf('troo', command({ tense: 'present' }), null).sameMeaning).toBeUndefined();
  });
});

describe('applyControl: choosing a member', () => {
  const start: PanelState = { slot: command(), noun: 'psomi', nounNumber: 'sg' };
  it('with a pronoun, then the short form, then the noun again, then the bare verb', () => {
    const clitic = applyControl(start, 'member', '1', 'troo');
    expect(clitic.slot).toMatchObject({ clitics: [IT] });
    expect(clitic.slot).not.toHaveProperty('shortForm');
    expect(clitic.noun).toBe('psomi');
    const short = applyControl(clitic, 'member', '2', 'troo');
    expect(short.slot).toMatchObject({ clitics: [IT], shortForm: true });
    const noun = applyControl(short, 'member', '0', 'troo');
    expect(noun.slot).not.toHaveProperty('clitics');
    expect(noun.slot).not.toHaveProperty('shortForm');
    expect(noun.noun).toBe('psomi');
    const close = applyControl(noun, 'member', 'close', 'troo');
    expect(close.noun).toBeNull();
    expect(close.slot).not.toHaveProperty('clitics');
  });
  it("the child's pronoun brings the child with it", () => {
    const wash: PanelState = { slot: command(), noun: 'paidi', nounNumber: 'sg' };
    const next = applyControl(wash, 'member', '1', 'pleno');
    expect(next.noun).toBe('paidi');
    expect(next.slot).toMatchObject({ clitics: [IT_CHILD] });
  });
  it('a panel on no group changes nothing', () => {
    const none: PanelState = { slot: command({ tense: 'present' }), noun: null, nounNumber: 'sg' };
    expect(applyControl(none, 'member', '0', 'troo')).toBe(none);
  });
});
```

Create `src/components/SameMeaningStrip.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { notice, plain } from '../engine/segments';
import type { SameMeaning } from '../panels/types';
import { SameMeaningStrip } from './SameMeaningStrip';

const strip: SameMeaning = {
  meaning: 'Eat the bread!',
  rows: [
    { key: '0', tag: 'with noun', el: plain('φάε το ψωμί'), ro: plain('mănâncă pâinea'), en: plain('eat the bread'), current: true },
    { key: '1', tag: 'with clitic', el: plain('φάε το'), ro: plain('mănâncă-o'), en: plain('eat it'), current: false, note: 'το is neuter (ψωμί).' },
    { key: '2', tag: 'short form', el: plain('φάτο'), ro: notice('none'), en: notice('none'), current: false },
  ],
  close: { key: 'close', el: plain('φάε'), ro: plain('mănâncă'), en: plain('eat'), reason: 'no object: what to eat is not said', current: false },
  notes: ['short form: A short way of saying φάε το.'],
};

describe('SameMeaningStrip', () => {
  it('is a labelled region with a pressed button for the form in use', () => {
    render(<SameMeaningStrip strip={strip} onMember={() => {}} />);
    const region = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(region).getByRole('button', { name: 'with noun' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(region).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(region).getByRole('cell', { name: 'φάε το ψωμί' })).toHaveAttribute('aria-current', 'true');
  });

  it('clicking a row reports its key', async () => {
    const onMember = vi.fn();
    render(<SameMeaningStrip strip={strip} onMember={onMember} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'short form' }));
    expect(onMember).toHaveBeenCalledWith('2');
    await userEvent.setup().click(screen.getByRole('button', { name: 'bare verb' }));
    expect(onMember).toHaveBeenCalledWith('close');
  });

  it('shows the notes, the "none" cells and the close row with its reason', () => {
    render(<SameMeaningStrip strip={strip} onMember={() => {}} />);
    expect(screen.getAllByText('none')).toHaveLength(2);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'with clitic: το is neuter (ψωμί).',
      'short form: A short way of saying φάε το.',
    ]);
    expect(screen.getByText('Close, not the same')).toBeInTheDocument();
    expect(screen.getByText('no object: what to eat is not said')).toBeInTheDocument();
  });

  it('without a handler the rows are not buttons you can press', () => {
    render(<SameMeaningStrip strip={strip} />);
    expect(screen.getByRole('button', { name: 'with clitic' })).toBeDisabled();
  });
});
```

Append to `src/App.test.tsx`, inside the `describe('App', …)` block:

```tsx
  it('Eat the bread!: the strip shows the forms that mean the same, and a click changes the panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat the bread!');
    await user.click(screen.getByRole('button', { name: 'Φάε' }));
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('button', { name: 'with noun' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(strip).queryByRole('button', { name: 'short form' })).not.toBeInTheDocument();
    await user.click(within(strip).getByRole('button', { name: 'with clitic' }));
    expect(within(strip).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'φάε το' }).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(screen.getByRole('region', { name: 'Same meaning' })).getByRole('button', { name: 'with noun' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Improver: the short form is a member and Romanian and English have none', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Improver'));
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat it!');
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(strip).getByRole('button', { name: 'short form' }));
    expect(screen.getAllByRole('cell', { name: 'φάτο' }).length).toBeGreaterThan(0);
    expect(within(strip).getAllByText('none')).toHaveLength(2);
    const bare = within(strip).getByRole('button', { name: 'bare verb' });
    await user.click(bare);
    expect(within(screen.getByRole('region', { name: 'Same meaning' })).getByRole('button', { name: 'bare verb' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Give it to me!: the strip lists the pair, the short form and the close row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Improver'));
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Give it to me!');
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('cell', { name: 'δως μου το' })).toBeInTheDocument();
    expect(within(strip).getByRole('cell', { name: 'δώσε μου το ψωμί' })).toBeInTheDocument();
    expect(within(strip).getByText('Two pronouns: the genitive comes before the accusative.')).toBeInTheDocument();
    expect(within(strip).getByText('no object: what to give is not said')).toBeInTheDocument();
  });
```

(`within` is already imported at the top of `App.test.tsx`.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/strip.test.ts src/components/SameMeaningStrip.test.tsx`
Expected: FAIL.

- [ ] **Step 3: The panel data**

In `src/panels/types.ts` add after `Related`:

```ts
/** One way of saying the command in the Same-meaning strip (spec 5.4). */
export interface SameMeaningRow {
  /** The member's index in the group, as a string; 'close' for the bare verb. */
  key: string;
  tag: 'with noun' | 'with clitic' | 'short form';
  el: Rich;
  ro: Rich;
  en: Rich;
  /** The member the panel is showing. */
  current: boolean;
  note?: string;
}

/** The forms that mean the same as the command in the panel, built from its form group (spec 4.6, 5.4). */
export interface SameMeaning {
  meaning: string;
  rows: SameMeaningRow[];
  /** The verb with no object: close, not the same. */
  close?: { key: 'close'; el: Rich; ro: Rich; en: Rich; reason: string; current: boolean };
  /** Improver: the stress, short-form and order sentences. */
  notes: string[];
}
```

and add to `Panel`, after `related?: Related;`:

```ts
  /** Commands: the forms that mean the same (spec 5.4). */
  sameMeaning?: SameMeaning;
```

Create `src/panels/sameMeaning.ts`:

```ts
import { groupFor, memberKind, memberText } from '../engine/groups';
import { notice, plain } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import type { SameMeaning, SameMeaningRow } from './types';

const TAG = { 'with-noun': 'with noun', 'with-clitic': 'with clitic', 'short-form': 'short form' } as const;

/**
 * The Same-meaning strip for a command (spec 5.4), or undefined when the command belongs to no group.
 * Beginner shows the member with a noun and the member with a pronoun; Improver adds the short forms and the stress
 * and order notes. The short form has no Romanian or English counterpart, so those cells read "none".
 */
export function sameMeaningFor(
  lexemeId: string,
  slot: SlotOf<'verb'>,
  noun: string | null,
  level: Level,
): SameMeaning | undefined {
  const match = groupFor(lexemeId, slot, noun);
  if (!match) return undefined;
  const { group } = match;
  const rows: SameMeaningRow[] = [];
  const notes: string[] = [];
  let orderNote = false;
  group.members.forEach((member, i) => {
    const kind = memberKind(member);
    if (level === 'beginner' && kind === 'short-form') return;
    const text = memberText(member);
    const short = kind === 'short-form';
    rows.push({
      key: String(i),
      tag: TAG[kind],
      el: text.el,
      ro: short ? notice('none') : plain(text.ro),
      en: short ? notice('none') : plain(text.en),
      current: match.current === i,
      note: member.note,
    });
    if (level === 'improver') {
      if (text.irregular) notes.push(`${TAG[kind]}: ${text.irregular}`);
      if (!orderNote && kind !== 'with-noun' && (member.verb.slot.clitics ?? []).length === 2) {
        orderNote = true;
        notes.push('Two pronouns: the genitive comes before the accusative.');
      }
    }
  });
  const close = group.closeNotSame;
  const closeText = close && memberText({ verb: close.verb });
  return {
    meaning: group.meaning,
    rows,
    close:
      close && closeText
        ? {
            key: 'close',
            el: closeText.el,
            ro: plain(closeText.ro),
            en: plain(closeText.en),
            reason: close.reason,
            current: match.current === 'close',
          }
        : undefined,
    notes,
  };
}
```

In `src/panels/verb.ts` import `sameMeaningFor` and add to the returned panel (after `reading:`): `sameMeaning: slot.mood === 'imperative' ? sameMeaningFor(verb.id, slot, state.noun, level) : undefined,`.

In `src/panels/panels.ts` import `groupFor` (from `'../engine/groups'`) and add this case to `applyControl` before `case 'object'`:

```ts
    case 'member':
      if (slot.pos === 'verb' && lexemeId) {
        const match = groupFor(lexemeId, slot, state.noun);
        if (!match) break;
        const member = value === 'close' ? undefined : match.group.members[Number(value)];
        const target = value === 'close' ? match.group.closeNotSame?.verb : member?.verb;
        if (!target) break;
        const direct = (target.slot.clitics ?? []).find((c) => c.role === 'object');
        const noun = member?.object?.noun ?? (direct ? nounForClitic(direct) : null);
        const copy: SlotOf<'verb'> = { ...target.slot };
        if (target.slot.clitics) copy.clitics = target.slot.clitics.map((c) => ({ ...c }));
        return { ...state, slot: copy, noun };
      }
      break;
```

(adding `SlotOf` to the type imports).

- [ ] **Step 4: The component**

Create `src/components/MixedText.tsx` by moving `MixedText` out of `WordPanel.tsx`:

```tsx
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
```

and in `WordPanel.tsx` delete the local `MixedText` function and add `import { MixedText } from './MixedText';`.

Create `src/components/SameMeaningStrip.tsx`:

```tsx
import type { SameMeaning } from '../panels/types';
import { MixedText } from './MixedText';
import { RichText } from './RichText';

interface Props {
  strip: SameMeaning;
  /** Chooses a member; without it the rows are shown but cannot be pressed. */
  onMember?: (key: string) => void;
}

type Row = { key: string; label: string; el: SameMeaning['rows'][number]['el']; ro: SameMeaning['rows'][number]['ro']; en: SameMeaning['rows'][number]['en']; current: boolean };

function StripTable({ rows, onMember }: { rows: Row[]; onMember?: (key: string) => void }) {
  return (
    <table className="form-table">
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Form</span>
          </th>
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
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">
              <button
                type="button"
                className="strip-pick"
                aria-pressed={row.current}
                disabled={!onMember}
                onClick={() => onMember?.(row.key)}
              >
                {row.label}
              </button>
            </th>
            <td lang="el" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.el} />
            </td>
            <td lang="ro" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.ro} />
            </td>
            <td lang="en" className={row.current ? 'cur' : undefined} aria-current={row.current ? 'true' : undefined}>
              <RichText rich={row.en} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The forms that mean the same as the command in the panel (spec 5.4); each row is a button that makes it the form in use. */
export function SameMeaningStrip({ strip, onMember }: Props) {
  const notes = strip.rows.flatMap((row) => (row.note ? [`${row.tag}: ${row.note}`] : []));
  return (
    <section className="same-meaning" aria-label="Same meaning">
      <p className="full-title">
        Same meaning: <span lang="en">{strip.meaning}</span> (the outlined row is the form in use)
      </p>
      <StripTable rows={strip.rows.map((row) => ({ ...row, label: row.tag }))} onMember={onMember} />
      {(notes.length > 0 || strip.notes.length > 0) && (
        <ul className="strip-notes">
          {[...notes, ...strip.notes].map((note) => (
            <li key={note}>
              <MixedText text={note} />
            </li>
          ))}
        </ul>
      )}
      {strip.close && (
        <>
          <p className="full-title">Close, not the same</p>
          <StripTable rows={[{ ...strip.close, label: 'bare verb' }]} onMember={onMember} />
          <p className="note">{strip.close.reason}</p>
        </>
      )}
    </section>
  );
}
```

In `src/components/WordPanel.tsx` import `SameMeaningStrip`, add `onMember?: (key: string) => void;` to `Props` and to the destructured parameters, and render it directly after the `<p className="legend">…</p>` element:

```tsx
      {panel.sameMeaning && <SameMeaningStrip strip={panel.sameMeaning} onMember={onMember} />}
```

In `src/Explorer.tsx` pass `onMember={open ? undefined : (key) => changeControl('member', key)}` to `<WordPanel>`.

In `src/styles.css` append:

```css
.same-meaning { margin-top: 12px; }
.strip-pick { font: inherit; font-size: 13px; background: var(--surface); color: var(--text); border: 0.5px solid var(--border); border-radius: 8px; padding: 2px 10px; cursor: pointer; }
.strip-pick[aria-pressed='true'] { background: var(--accent-bg); color: var(--accent-text); border-color: var(--accent-border); }
.strip-pick:disabled { cursor: default; }
.strip-pick:focus-visible { outline: 2px solid var(--accent-border); outline-offset: 2px; }
.strip-notes { margin: 6px 0 0; padding-left: 18px; font-size: 13px; color: var(--muted); }
```

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (252):` (unchanged). An existing test that reads the cells of a command panel by name may now find the same text twice (once in the table and once in the strip); narrow it with `within(...)` or `getAllByRole(...)`.

- [ ] **Step 6: Commit**

```bash
git add src/components/MixedText.tsx src/components/SameMeaningStrip.tsx src/components/WordPanel.tsx src/panels/sameMeaning.ts src/panels/types.ts src/panels/panels.ts src/panels/verb.ts src/Explorer.tsx src/styles.css src/panels/strip.test.ts src/components/SameMeaningStrip.test.tsx src/App.test.tsx
git commit -m "feat: the Same-meaning strip

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The review sheet

**Files:**

- Create: `src/validate/unverified.ts`, `src/validate/reviewSheet.ts`, `scripts/review-sheet.ts`
- Modify: `scripts/validate.ts`, `src/validate/validate.ts`, `package.json`, `.gitignore`
- Test: `src/validate/reviewSheet.test.ts`

**Interfaces:**

- Consumes: everything above.
- Produces:
  - `unverifiedRecords(sets): string[]` (the list `npm run validate` prints, now one function), `RecordSets`.
  - `reviewSheet(sets & { pending }): string`: a Markdown sheet for the content review (spec section 9): a checklist with one `- [ ]` line per unverified record, then the details a reviewer needs: every lexeme's forms in the three languages, every phrase with its four gloss rows, the notes, the authored readings, the form groups with generated texts, the review items, and the pending Romanian cells.
  - `npm run review-sheet` writes `review/content-review.md` (git-ignored). `slotsFor` is exported from `validate.ts`.
  - The review itself is not part of this plan: `npm run validate -- --release` still fails until a speaker has checked every record and the six pending genitives are filled in.

- [ ] **Step 1: Write the failing tests**

Create `src/validate/reviewSheet.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { FORM_GROUPS } from '../data/form-groups';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import { READING_TEMPLATES } from '../data/readings';
import { REVIEW_ITEMS } from '../data/review';
import { reviewSheet } from './reviewSheet';
import { unverifiedRecords, type RecordSets } from './unverified';
import { pendingCells } from './validate';

const sets: RecordSets = {
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
};
const sheet = reviewSheet({ ...sets, pending: pendingCells(LEXEMES) });

describe('unverifiedRecords', () => {
  it('lists a language of a lexeme, a review item, a phrase, a note, a template and a group', () => {
    const records = unverifiedRecords(sets);
    expect(records).toContain('lexeme thelo (el)');
    expect(records).toContain('glossary:ending-glosses');
    expect(records).toContain('phrase eat-it');
    expect(records).toContain('divergence clitic-position');
    expect(records).toContain('reading clitic-stress');
    expect(records).toContain('group eat-the-bread');
  });
  it('skips what is verified', () => {
    const verified = { ...LEXEMES, thelo: { ...LEXEMES.thelo, verified: { el: true, ro: true, en: false } } };
    const records = unverifiedRecords({ ...sets, lexemes: verified });
    expect(records).not.toContain('lexeme thelo (el)');
    expect(records).toContain('lexeme thelo (en)');
  });
});

describe('the review sheet', () => {
  it('has one checklist line per unverified record', () => {
    const lines = sheet.match(/^- \[ \] /gm) ?? [];
    expect(lines).toHaveLength(unverifiedRecords(sets).length);
  });

  it('shows the forms of a verb in the three languages', () => {
    expect(sheet).toContain('### θέλω (thelo)');
    expect(sheet).toContain('Ελληνικά: θέλω · θέλεις · θέλει · θέλουμε · θέλετε · θέλουν');
    expect(sheet).toContain('Română: vreau · vrei · vrea · vrem · vreți · vor');
    expect(sheet).toContain('English: I want · you want · he/she wants · we want · you want · they want');
  });

  it('shows a noun, a phrase with its gloss rows, a note, a reading, a group and the pending cells', () => {
    expect(sheet).toContain('ζεστός');
    expect(sheet).toContain('### eat-it: Eat it!');
    expect(sheet).toContain('English natural: Eat it!');
    expect(sheet).toContain('Română natural: Mănâncă-o!');
    expect(sheet).toContain('- clitic-position');
    expect(sheet).toContain('clitic-stress');
    expect(sheet).toContain('### Eat the bread!');
    expect(sheet).toContain('φάε το ψωμί · mănâncă pâinea · eat the bread');
    expect(sheet).toContain('## Pending Romanian cells');
    expect(sheet).toContain('polys Romanian plain determiner m sg gen');
  });

  it('says how many records are unverified', () => {
    expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/validate/reviewSheet.test.ts`
Expected: FAIL (`./unverified` not found).

- [ ] **Step 3: `unverifiedRecords`**

Create `src/validate/unverified.ts`:

```ts
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
```

In `scripts/validate.ts` replace the whole `const unverified = [ … ];` block with:

```ts
const unverified = unverifiedRecords({
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
});
```

and add `import { unverifiedRecords } from '../src/validate/unverified';` (the imports of `READING_TEMPLATES`, `DIVERGENCES`, `REVIEW_ITEMS`, `FORM_GROUPS` stay).

In `src/validate/validate.ts` change `function slotsFor(` to `export function slotsFor(`.

- [ ] **Step 4: The sheet**

Create `src/validate/reviewSheet.ts`:

```ts
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
import { slotsFor } from './validate';

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
    ...(l.pos === 'verb' ? verbLines(l) : otherLines(l)),
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
```

(If TypeScript objects to the unused `_pos` binding, destructure with `Object.entries(slot).filter(([k]) => k !== 'pos')` instead.)

Create `scripts/review-sheet.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { DIVERGENCES } from '../src/data/divergences';
import { FORM_GROUPS } from '../src/data/form-groups';
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { READING_TEMPLATES } from '../src/data/readings';
import { REVIEW_ITEMS } from '../src/data/review';
import { reviewSheet } from '../src/validate/reviewSheet';
import { pendingCells } from '../src/validate/validate';

const sheet = reviewSheet({
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
  pending: pendingCells(LEXEMES),
});
mkdirSync('review', { recursive: true });
writeFileSync('review/content-review.md', sheet);
console.log(`Wrote review/content-review.md (${sheet.split('\n').length} lines).`);
```

In `package.json` add to `scripts`: `"review-sheet": "tsx scripts/review-sheet.ts"`. Add the line `review/` to `.gitignore`.

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate && npm run review-sheet`
Expected: all green; `Data is valid.`; `Unverified (252):` as before; `Wrote review/content-review.md (… lines).` Open the file and check that the checklist has 252 lines, that `### θέλω (thelo)` shows three language lines per tense and that the sheet ends with the six pending cells. `git status` must not list `review/`.

- [ ] **Step 6: Commit**

```bash
git add src/validate/unverified.ts src/validate/reviewSheet.ts src/validate/validate.ts scripts/review-sheet.ts scripts/validate.ts package.json .gitignore src/validate/reviewSheet.test.ts
git commit -m "feat: a review sheet for the content review

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: The spec update, the validation report and the end-to-end check

**Files:**

- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`, `src/styles.css` (only if the phone-width check needs it)

**Interfaces:**

- Consumes: everything above.
- Produces: a spec that matches the built clitics, short forms, groups and strip; a verified build; the browser check.

- [ ] **Step 1: Run the full gate and read the report**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all green.

Run: `npm run validate`
Expected: `Data is valid.` with no Warnings block, `Pending (6):` and `Unverified (252):`. The count is Plan 5's 226; 2 new lexemes (the pronoun, δίνω) × 3 languages (6); 5 new phrases; 5 new notes; 2 new reading templates; 4 new review items (`ending-table:clitic-forms`, `clitic-table:ro-clitics`, `auxiliary-table:en-clitic-order`, `glossary:clitic-reading`); 4 form groups. If the real count differs, find the difference in the printed list before going on.

Run: `npm run validate -- --release; echo "exit $?"`
Expected: `--release: 252 record(s) are not verified and 6 cell(s) are pending.` and `exit 1`.

Run: `npm run review-sheet` and check `review/content-review.md` exists and is not tracked (`git status --short` lists only `.claude/`).

- [ ] **Step 2: Update the spec**

In `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`:

a) Change the status line to `Status: revised after review 4, Plan 3, Plan 5 and Plan 6 (changes listed in sections 13 to 19)`.

b) In section 4.2, change the line `interface Clitic { person: Person; number: Num; gender?: Gender; role: 'object' | 'indirect' }` to:

```ts
interface Clitic {
  person: Person; number: Num;
  gender?: Gender;      // the Greek gender of a third-person pronoun
  roGender?: Gender;    // the Romanian gender of the noun it stands for (ψωμί n: το; pâine f: o)
  role: 'object' | 'indirect';
}
```

and, in the same section, in the verb variant of `Slot`, change `clitics: Clitic[];` to `clitics?: Clitic[];` and `shortForm?: boolean` stays, with the comment `// optional: absent means none`.

c) In section 9, after the "Plan 5 additions" bullet, add:

```markdown
- Plan 6 additions: the Greek weak pronouns and the strong forms; the Romanian pronoun table (free, attached after a command, after *nu*) and the four clusters (*mi-l, mi-o, mi-i, mi-le*); the English pronoun order ("give it to me"); the verb δίνω and its forms (δώσε, δώστε, δίνε, δως) with *a da* and "give"; the short forms φάτο and δως μου το; the second-accent rule (δώσε μού το, and the two unit-test cases); phrases 34 to 38; the four form groups (the claim that their members mean the same, the member notes, the close-not-the-same reasons); and the two authored readings `clitic-stress` and `short-imperative`. `npm run review-sheet` writes a sheet of every unverified record for the reviewer.
```

d) Append at the end of the file:

```markdown

## 19. Changes since Plan 6

| Source | Change | Where |
|---|---|---|
| `clitics` and `shortForm` | Optional on the verb slot (absent means none), as `polarity` is | 4.2 |
| Pronoun gender in two languages | `Clitic.roGender` carries the Romanian gender of the noun the pronoun stands for (clitic-gender) | 4.2, 5.2 |
| Short forms | Stored on the verb voice (`shortForms`, keyed `impAorist.2sg`, with a `fuse` flag); `VerbVoice.indirect` marks a verb with an indirect object (δίνω) | 4.3 |
| Stress rule | `engine/stress.ts` counts syllables of the whole unit (a diphthong and an unaccented ι before a vowel are one syllable) and adds the second accent to a pronoun or to the verb; the short forms need none | 4.3 |
| Object control | Four kinds (none, a noun, a pronoun, two pronouns) and an "Object noun" select; the noun is held in the panel state; the verb tokens of phrases 24, 25 and 26 point at their noun | 5.3 |
| Romanian pronouns | Singles for every person; clusters only for the first-person dative with a third-person accusative | 4.3 |
| Readings | Forms with pronouns have a Greek reading line only; Romanian and English lines are not produced for them | 5.5 |
| Same-meaning strip | Rows are buttons; a short form's Romanian and English cells read "none"; Beginner shows *with noun* and *with clitic* | 5.4 |
| Content review | `npm run review-sheet` writes the sheet; the review itself and the six pending Romanian genitives remain | 9, 11 |
```

e) Run `git diff --stat docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` and check that only these places changed.

- [ ] **Step 3: Browser check**

Start the app with `npm run dev -- --port 5199 --strictPort` (via `preview_start` and `.claude/launch.json`) and check each point in the browser pane, reporting the actual text seen:

1. Pick **Eat it!**. The chip is a group with two buttons, *Φάε* and *το!*. The Greek cell reads φάε το, the Romanian mănâncă-o, the English eat it. Click *το!*: the pronoun panel opens (heading *το / του*, row *weak form* το / o / it, controls **Who?**, **Gender of the noun**, **Role**) with **← Back to the verb**. Set **Gender of the noun** to *masculine*: τον / îl / it, and the plain line names the strong form. Go back.
2. In the same phrase, **How to read this** reads "φάε το: φά- = eat, -ε = a command to you: do it once, το = it." Click the part *το*: the pronoun panel opens and the chip piece is pressed; go back.
3. Pick **Give it to me!**. The chip has three pieces: *Δώσε*, *μού*, *το!*. The cells read δώσε μού το / dă-mi-o / give it to me. The irregularity line says a second accent is written; **How to read this** mentions the second accent. Switch to Improver: the strip **Same meaning: Give me the bread!** has *with noun* (δώσε μου το ψωμί / dă-mi pâinea / give me the bread), *with clitic* (pressed), *short form* (δως μου το, with *none* in Romanian and English), the order note, and **Close, not the same** with its reason.
4. In that strip click *short form*: the Greek cell reads δως μου το, "Differs from the phrase." appears and *short form* is pressed. Click *with noun*: δώσε μου το ψωμί. Click **Reset to phrase**: *with clitic* is pressed again. Switch back to Beginner: the strip has two rows and no *short form*.
5. Pick **Don't eat it!**: μην το φας / nu o mânca / don't eat it; the chip has three pieces *Μην*, *το*, *φας!*; the strip is **Don't eat the bread!** with the note that the pronoun moves in front of the verb.
6. Pick **Wash him / her / it!** and then **Eat it!**: Romanian spală-l against mănâncă-o. Open **Object noun** in the first (Improver): παιδί, ψωμί and the other nouns; switching the noun changes the Romanian pronoun (-l, -o) but not the Greek one (το).
7. Pick **Eat!** (the bare command): the strip's **bare verb** row is pressed; **Object** reads *none*; set it to *a noun*: φάε το ψωμί, and *with noun* becomes the pressed row.
8. Pick **Eat the bread!** (phrase 24) and click the verb Φάε: **Object** reads *a noun (spelled out)* and the first row reads φάε το ψωμί; the strip's *with noun* row is pressed. Set **Negated?** to *Yes*: μην φας το ψωμί and the strip is the negative group.
9. At phone width (375 px), in Improver, open **Give it to me!** (three-piece chip, strip with five rows) and check that the page has no horizontal scrollbar (`document.documentElement.scrollWidth` equals `clientWidth`) and that the strip table wraps inside the card. If something overflows, fix it in `src/styles.css`, re-check, and run the gate again.
10. Dark mode and keyboard: with the colour scheme set to dark, the strip buttons, the pressed row, the dashed pronoun chip and the *none* cells keep readable contrast. Tab to a strip button: it shows a visible focus ring and Enter selects the member; the pronoun reading part and the **Open …** buttons stay reachable.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record Plan 6's decisions and its review items in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

If Step 3 needed a style change, commit it separately:

```bash
git add src/styles.css
git commit -m "style: keep the Same-meaning strip inside the viewport at phone width

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage** (spec sections that this plan owns, and the task that delivers them):

| Spec | Delivered by |
|---|---|
| 4.2 `Clitic`, the verb slot's `clitics` and `shortForm`, the `clitic` slot, `Piece` kinds `clitic` and `fused`, `Composed.extraAccent` and `irregular` | Tasks 1, 2, 3 |
| 4.3 clitic engine: placement (after an affirmative command, before a negative one), order (genitive before accusative), the stress rule, shortening as data | Tasks 2, 3 |
| 4.3 Romanian pronoun table with fusions and clusters; the English reordering of the pronoun object | Tasks 1, 4 |
| 5.3 clitic pronoun panel (Who, gender, role; the form in three languages; the strong form; person × number table) | Task 1 |
| 5.3 verb panel Object control (none, a noun, a pronoun, two pronouns); the short form only through the strip | Tasks 6, 9 |
| 4.4 clicking a pronoun piece opens its panel with a way back | Tasks 2, 5 |
| 5.5 readings of Φάτο, Δως μου το, Δώσε μού το, Μην φας (authored `clitic-stress` and `short-imperative`; generated pronoun parts; clicking a pronoun part opens its panel) | Task 5 |
| 5.2 notes clitic-position, clitic-gender, clitic-order, clitic-stress | Task 7 |
| 6.1 phrases 34 to 38; 11 item 1 (all 39 phrases) | Task 7 |
| 4.6 form groups (kinds in the order of precedence, text generated from slots, `closeNotSame`) and 6.5 the four groups | Task 8 |
| 5.4 the Same-meaning strip (Beginner and Improver differences, member notes, close row, clicking a member updates the controls) | Task 9 |
| 7 validator: pronouns only in commands, short forms only where the verb has them, a group's checks, the unit-test-only verbs outside `data/` (6.6) | Tasks 2, 3, 4, 8 |
| 9 / 11 content review: the sheet that makes it possible; the review itself stays with the speaker | Task 10 |
| Not here | the content review itself (11 item 5); Romanian and English reading lines for forms with pronouns; the Romanian neuter; clitics outside commands |

**Placeholder scan:** no "TBD", "TODO", "fill in" or "similar to Task N" in this plan; every code step shows the code. Two conditional steps say when they apply (the style fix in Task 11; adjusting existing tests whose expectation the new controls change, named in the steps that cause it).

**Type consistency:** `Clitic` and the `clitic` slot (Task 1) are read by `greekClitic`, `roClitics`, `enClitic`, `cliticSlot`, `compose`, `slotProblem`, `roVerb`, `enVerb`, `readingFor` and the Object control. `ShortForm` (Task 3) is read by `shortFormOf`, `slotProblem` and `compose`. `Piece` kinds `clitic` and `fused` (Task 2) are handled in `composedRich`, `pieceToOpen`, `authoredPiece`, `wordGloss` and `describe`. `ObjectKind` (Task 6) is read by `verbPanel`, `applyControl` and `objectKind`. `GroupMember`, `FormGroup` (Task 8) are read by `memberKind`, `memberText`, `groupFor`, `sameMeaningFor`, `applyControl('member')`, `checkGroup` and `reviewSheet`. `SameMeaning` (Task 9) is rendered by `SameMeaningStrip`. `RecordSets` (Task 10) is what `scripts/validate.ts` and `reviewSheet` share.

**Counts to check when running** (the plan's arithmetic, not yet run): unverified goes 231 (Task 1), 234 (2), 234 (3), 235 (4), 238 (5), 238 (6), 248 (7), 252 (8 to 11); pending stays 6. `PHRASES` goes 34, 39 (Task 7).

**Known soft spots** (decisions the executor should not "fix" silently): the Romanian clusters exist only for "me" + a third-person accusative; the fused short form takes exactly one pronoun; `groupFor` shows the strip for a command in a group's family even when the panel is on no member (nothing is pressed then); Beginner hides the short-form rows, so a Beginner panel on a short form shows no pressed row; the Romanian and English cells of a short form read "none" although the generated text exists; the unit-test verbs τηλεφωνώ and διαβάζω live in `src/test-fixtures.ts`, not in `data/`; the sheet prints raw stored Romanian and English data for non-verbs, which a reviewer must read as data, not prose.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-04-plan-6-clitics-short-forms-and-form-groups.md`. Execute it with superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.
