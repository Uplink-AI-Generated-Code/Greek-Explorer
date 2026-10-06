# Demonstratives and Place Words Implementation Plan (Plan 12)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the demonstratives αυτός (this), εκείνος (that), τέτοιος (such) and τόσος (so much, so many) with their Romanian forms (before the noun, after the noun, spoken) and English forms, the place words εδώ and εκεί as a new invariable part of speech, seven comparison notes and phrases 73 to 80 in a new theme *Pointing*.

**Architecture:** The four declining words are quantifier lexemes flagged `demonstrative`, so they reuse the quantifier engine, panel, validator and review sheet. A quantifier slot gains an optional `register` (the spoken Romanian forms), a lexeme gains `uses`, `demonstrative` and `ro.spoken`, and the panel puts the article after αυτός and εκείνος (αυτό το σπίτι), ένα before τέτοιος, and both Romanian placements in one cell (*acest copil / copilul acesta*). εδώ and εκεί are a new part of speech, the adverb, shaped like the question words; the preposition panel accepts one after από and μέχρι (*de aici*, *până acolo*).

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 4.4, 5.2, 5.3, 6.1, 6.3, 7, 9 and 25; the repository is at commit acdd479 or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes (double quotes where the text contains an apostrophe), two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase and divergence row has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what the data produces, ignoring capitals and trailing punctuation (the validator checks it).
- Colour is never the only signal, and `lang` attributes follow the existing components (this plan adds no new component).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.
- An App test can time out (the default is 5 seconds) on a heavily loaded machine. If a test fails only with a timeout, run `npx vitest run --testTimeout=60000` before concluding anything.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement except where it says so.

1. **The quantifier machinery is reused.** `GreekQuantifier.demonstrative` is `'near'` (αυτός), `'far'` (εκείνος), `'such'` (τέτοιος) or `'amount'` (τόσος). The panel, the validator, `quantifierSlots` and the review sheet need only small additions.
2. **Greek forms.** αυτός, εκείνος and τέτοιος are whole-form tables (`QUANTIFIER_FORMS`, written with a small `onStem` helper) with the final ν kept (αυτόν, αυτήν, τέτοιον); τόσος is the stem-stressed adjective endings on τόσ- like πόσος. The existing review item `ending-table:quantifier-forms` covers the new tables.
3. **Romanian cells.** For αυτός and εκείνος the `determiner` cells are the forms before the noun (*acest, această, acești, aceste*), and the `pronoun` cells are the forms on their own and after the noun (*acesta, aceasta, aceștia, acestea*). The spoken forms (*ăsta, asta, ăștia, astea*) are a third set, `ro.spoken`, the same for both uses and with no genitive. The slot carries `register: 'spoken'`; a Greek token never does.
4. **The "with a noun" row.** For a near or far demonstrative the Greek cell is demonstrative + article + noun; the Romanian cell shows both formal placements (*acest copil / copilul acesta*) or, for the spoken register, the placement after the noun (*copilul ăsta*). A Romanian form control (formal or spoken) appears when the lexeme has spoken forms.
5. **τέτοιος** is offered beside a noun only (`uses: ['determiner']`; the pronoun cells of the Romanian and English data are optional). In the singular it follows ένα (*ένα τέτοιο σπίτι*, *o asemenea casă*, "such a house"); with a mass noun there is no ένα and no *o* (*τέτοιο ψωμί*, *asemenea pâine*, "such bread").
6. **τόσος** offers the subject and object only, like πόσος (the Romanian genitive of *atâta* is not covered), and uses the same mass or count control. This narrows the spec's table, which listed *atâtor*; Task 6 corrects the spec.
7. **The number control.** αυτός, εκείνος and τέτοιος use the plain "How many?" control; τόσος uses the "Kind of noun" control.
8. **A stand-alone αυτό still points at a noun** when the phrase has one (phrase 76: αυτό points at σπίτι), so the Romanian form follows the house (*aceasta*); with no noun it starts from a noun of its Greek gender, as the question words do.
9. **The place words** are a new part of speech, `adverb`, with the slot `{ pos: 'adverb' }`, the lexemes `edo` and `ekei`, and a panel with the rows "on its own" and "in a sentence". The preposition panel's "question word" case is widened to "question word or place word"; `roAfter` stores *de aici*, *de acolo*, *până aici* and *până acolo* (μέχρι's stored Romanian is *până la*, which would give *până la acolo*). The control label becomes "Noun, question word or place word after it", and five existing tests are updated for it.
10. **Phrases.** 73, 74, 77 are Beginner, the others Improver. In the Romanian rows the Greek article token is left unlinked (*Această casă*, as in the English rows), except where the Romanian noun carries it as a suffix (*Casele acestea*, a split unit).
11. **Validator.** A near or far demonstrative beside a noun needs the definite article of that noun; τέτοιος in the singular needs ένα unless the noun is mass; a Greek token never carries `register`; a preposition may govern a place word, but σε takes nouns only.
12. **Delivery.** With this plan the picker lists 80 phrases.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `QuantifierRegister`, `DemonstrativeKind`; the quantifier slot's `register`; `GreekQuantifier.demonstrative`, `uses`, `ro.spoken`; optional pronoun cells; `GreekAdverb`; the slot `{ pos: 'adverb' }` |
| `src/data/{paradigms,lexemes,phrases,divergences}.ts` | the tables `autos`, `ekeinos`, `tetoios`; the lexemes `autos`, `ekeinos`, `tetoios`, `tosos`, `edo`, `ekei`; phrases 73 to 80; seven comparison rows |
| `src/engine/{quantifier,romanian,english,greek}.ts` | `offeredUses`, `offeredRegisters`, spoken slots; `roQuantifier` with the spoken set; optional pronoun cells; `inflectAdverb` |
| `src/panels/{quantifier,adverb,preposition,panels,types}.ts` | the demonstrative rows and the Romanian form control; the place-word panel; the preposition panel with a place word; the control key `register` |
| `src/validate/{validate,reviewSheet}.ts` | demonstrative lexeme and token rules, the adverb lexeme and its place after a preposition; the review-sheet sections |
| tests | one new test file per task, plus the expectations the new label and options change |

---

### Task 1: The demonstratives in the data and the engine

**Files:**
- Create (test): `src/engine/demonstrative.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/paradigms.ts`
- Modify: `src/engine/english.ts`
- Modify: `src/engine/quantifier.ts`
- Modify: `src/engine/romanian.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `GreekQuantifier`, `QUANTIFIER_FORMS`, `inflectQuantifier`, `roQuantifier`, `enQuantifier`, `quantifierSlots`, `validate` and `pendingCells`.
- Produces: `QuantifierRegister`, `DemonstrativeKind`; the quantifier slot's optional `register`; `GreekQuantifier.demonstrative`, `uses` and `ro.spoken`; optional `pronoun` cells in `RoQuantifierCells` and `EnQuantifierCells`; the tables `autos`, `ekeinos`, `tetoios` in `QUANTIFIER_FORMS`; the lexemes `autos`, `ekeinos`, `tetoios`, `tosos`; `offeredUses(q)`, `offeredRegisters(q)` in `src/engine/quantifier.ts`; `roQuantifier` reads `ro.spoken` when the slot says `register: 'spoken'`; validator rules for the lexemes.

This task is data and engine only: the forms in three languages and the slots. The panel is Task 2 and the phrases are Task 4. The expected strings in the tests are worked out by hand from the rules in Decisions 2, 3, 5 and 6.

- [ ] **Step 1: Write the tests**

Create `src/engine/demonstrative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES, getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { offeredUses, quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = (id: string) => getLexeme(id) as GreekQuantifier;
const slot = (
  gender: Gender,
  number: Num,
  c: Case,
  use: SlotOf<'quantifier'>['use'] = 'determiner',
  register?: 'spoken',
): SlotOf<'quantifier'> => ({ pos: 'quantifier', gender, number, case: c, degree: 'plain', use, ...(register ? { register } : {}) });
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflectQuantifier(q(id), s));

describe('the Greek forms of the demonstratives', () => {
  it('αυτός keeps the stress on the ending and the final ν', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('m', 'sg', 'acc'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'nom'),
      slot('m', 'sg', 'gen'), slot('f', 'sg', 'gen'), slot('m', 'pl', 'nom'), slot('m', 'pl', 'acc'),
      slot('f', 'pl', 'nom'), slot('n', 'pl', 'nom'), slot('n', 'pl', 'gen'),
    ].map((s) => greek('autos', s));
    expect(forms).toEqual(['αυτός', 'αυτόν', 'αυτήν', 'αυτό', 'αυτού', 'αυτής', 'αυτοί', 'αυτούς', 'αυτές', 'αυτά', 'αυτών']);
  });

  it('εκείνος is stressed on the stem', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'acc'), slot('m', 'sg', 'gen'),
      slot('m', 'pl', 'acc'), slot('f', 'pl', 'gen'),
    ].map((s) => greek('ekeinos', s));
    expect(forms).toEqual(['εκείνος', 'εκείνη', 'εκείνο', 'εκείνου', 'εκείνους', 'εκείνων']);
  });

  it('τέτοιος has the feminine τέτοια, and τόσος declines like an adjective', () => {
    expect([slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'acc'), slot('f', 'sg', 'gen'), slot('m', 'pl', 'nom')].map((s) => greek('tetoios', s))).toEqual([
      'τέτοιος', 'τέτοια', 'τέτοιο', 'τέτοιας', 'τέτοιοι',
    ]);
    expect([slot('m', 'sg', 'nom'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'acc'), slot('m', 'pl', 'nom'), slot('f', 'pl', 'acc'), slot('n', 'pl', 'nom')].map((s) => greek('tosos', s))).toEqual([
      'τόσος', 'τόση', 'τόσο', 'τόσοι', 'τόσες', 'τόσα',
    ]);
  });
});

describe('the Romanian forms of the demonstratives', () => {
  const ro = (id: string, s: SlotOf<'quantifier'>, g: Gender) => roQuantifier(q(id), s, g);

  it('before the noun, after it, and the genitives', () => {
    expect(ro('autos', slot('m', 'sg', 'nom'), 'm')).toBe('acest');
    expect(ro('autos', slot('f', 'sg', 'nom'), 'f')).toBe('această');
    expect(ro('autos', slot('m', 'pl', 'nom'), 'm')).toBe('acești');
    expect(ro('autos', slot('f', 'pl', 'nom'), 'f')).toBe('aceste');
    expect(ro('autos', slot('m', 'sg', 'nom', 'pronoun'), 'm')).toBe('acesta');
    expect(ro('autos', slot('f', 'pl', 'nom', 'pronoun'), 'f')).toBe('acestea');
    expect(ro('autos', slot('m', 'sg', 'gen'), 'm')).toBe('acestui');
    expect(ro('autos', slot('f', 'sg', 'gen', 'pronoun'), 'f')).toBe('acesteia');
    expect(ro('ekeinos', slot('m', 'sg', 'nom'), 'm')).toBe('acel');
    expect(ro('ekeinos', slot('f', 'sg', 'nom'), 'f')).toBe('acea');
    expect(ro('ekeinos', slot('m', 'pl', 'nom', 'pronoun'), 'm')).toBe('aceia');
    expect(ro('ekeinos', slot('m', 'sg', 'gen', 'pronoun'), 'm')).toBe('aceluia');
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(ro('autos', slot('n', 'sg', 'nom'), 'n')).toBe('acest');
    expect(ro('autos', slot('n', 'pl', 'nom'), 'n')).toBe('aceste');
  });

  it('the spoken forms have no genitive', () => {
    expect(ro('autos', slot('m', 'sg', 'nom', 'determiner', 'spoken'), 'm')).toBe('ăsta');
    expect(ro('autos', slot('f', 'sg', 'nom', 'pronoun', 'spoken'), 'f')).toBe('asta');
    expect(ro('ekeinos', slot('f', 'pl', 'nom', 'determiner', 'spoken'), 'f')).toBe('alea');
    expect(ro('ekeinos', slot('m', 'pl', 'nom', 'determiner', 'spoken'), 'm')).toBe('ăia');
    expect(ro('autos', slot('m', 'sg', 'gen', 'determiner', 'spoken'), 'm')).toBeNull();
  });

  it('asemenea, with its article, and atâta', () => {
    expect(ro('tetoios', slot('m', 'sg', 'nom'), 'm')).toBe('un asemenea');
    expect(ro('tetoios', slot('f', 'sg', 'nom'), 'f')).toBe('o asemenea');
    expect(ro('tetoios', slot('m', 'pl', 'nom'), 'm')).toBe('asemenea');
    expect(ro('tetoios', slot('f', 'sg', 'gen'), 'f')).toBe('unei asemenea');
    expect(ro('tosos', slot('f', 'sg', 'nom'), 'f')).toBe('atâta');
    expect(ro('tosos', slot('m', 'pl', 'nom'), 'm')).toBe('atâția');
    expect(ro('tosos', slot('f', 'pl', 'acc'), 'f')).toBe('atâtea');
    expect(ro('tosos', slot('m', 'sg', 'nom', 'pronoun'), 'm')).toBe('atât');
  });

  it('a lexeme with no spoken forms has no spoken slot', () => {
    expect(() => ro('polys', slot('m', 'sg', 'nom', 'determiner', 'spoken'), 'm')).toThrow(/no Romanian spoken forms/);
  });
});

describe('the English forms of the demonstratives', () => {
  it('follow the number', () => {
    const en = (id: string, number: Num, use: SlotOf<'quantifier'>['use'] = 'determiner') => enQuantifier(q(id), slot('m', number, 'nom', use));
    expect([en('autos', 'sg'), en('autos', 'pl'), en('ekeinos', 'sg'), en('ekeinos', 'pl', 'pronoun')]).toEqual(['this', 'these', 'that', 'those']);
    expect([en('tetoios', 'sg'), en('tetoios', 'pl'), en('tosos', 'sg'), en('tosos', 'pl')]).toEqual(['such a', 'such', 'so much', 'so many']);
  });

  it('τέτοιος has no stand-alone use', () => {
    expect(() => enQuantifier(q('tetoios'), slot('m', 'sg', 'nom', 'pronoun'))).toThrow(/no English pronoun form/);
  });
});

describe('the slots of the demonstratives', () => {
  it('αυτός and εκείνος have both uses and the spoken register', () => {
    expect(quantifierSlots(q('autos'))).toHaveLength(72);
    expect(quantifierSlots(q('autos')).filter((s) => s.register === 'spoken')).toHaveLength(36);
    expect(offeredUses(q('autos'))).toEqual(['determiner', 'pronoun']);
  });

  it('τέτοιος has the determiner only, and τόσος the subject and object only', () => {
    expect(offeredUses(q('tetoios'))).toEqual(['determiner']);
    expect(quantifierSlots(q('tetoios'))).toHaveLength(18);
    expect(quantifierSlots(q('tosos')).every((s) => s.case !== 'gen')).toBe(true);
  });

  it('the new lexemes are unverified and validate', () => {
    for (const id of ['autos', 'ekeinos', 'tetoios', 'tosos']) {
      expect(q(id).verified).toEqual({ el: false, ro: false, en: false });
      expect(q(id).demonstrative).toBeDefined();
    }
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });
});

describe('the validator and the demonstratives', () => {
  const without = (id: string, change: (l: GreekQuantifier) => GreekQuantifier) => ({ ...LEXEMES, [id]: change({ ...q(id) }) });
  const errors = (lexemes: Record<string, (typeof LEXEMES)[string]>) => validate({ lexemes, phrases: [] });

  it('wants the spoken forms on a near or far demonstrative', () => {
    const bad = without('autos', (l) => ({ ...l, ro: { ...l.ro, spoken: undefined } }));
    expect(errors(bad)).toContain('lexeme autos: a near or far demonstrative needs its spoken Romanian forms');
  });

  it('wants τέτοιος beside a noun only', () => {
    const bad = without('tetoios', (l) => ({ ...l, uses: undefined }));
    expect(errors(bad)).toContain('lexeme tetoios: τέτοιος is offered beside a noun only');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/demonstrative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -589,4 +589,114 @@
 };
 
+/** The spoken Romanian forms of a demonstrative: after the noun, the same for both uses, with no genitive. */
+const spokenCells = (msg: string, mpl: string, fsg: string, fpl: string): GreekQuantifier['ro']['plain'] => {
+  const cells = { m: { sg: ro1(msg), pl: ro1(mpl) }, f: { sg: ro1(fsg), pl: ro1(fpl) } };
+  return { determiner: cells, pronoun: cells };
+};
+
+const autos: GreekQuantifier = {
+  id: 'autos',
+  pos: 'quantifier',
+  lemma: 'αυτός',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { table: 'autos' } },
+  numbers: ['sg', 'pl'],
+  demonstrative: 'near',
+  meaning:
+    'αυτός means "this" (and, in everyday Greek, "that" too). It changes with gender, number and role, and the noun keeps its article: αυτό το σπίτι. Romanian says acest copil (before the noun, no article) or copilul acesta (after the noun, with its article).',
+  ro: {
+    lemma: 'acest',
+    plain: {
+      determiner: {
+        m: { sg: ro1('acest', 'acestui'), pl: ro1('acești', 'acestor') },
+        f: { sg: ro1('această', 'acestei'), pl: ro1('aceste', 'acestor') },
+      },
+      pronoun: {
+        m: { sg: ro1('acesta', 'acestuia'), pl: ro1('aceștia', 'acestora') },
+        f: { sg: ro1('aceasta', 'acesteia'), pl: ro1('acestea', 'acestora') },
+      },
+    },
+    spoken: spokenCells('ăsta', 'ăștia', 'asta', 'astea'),
+  },
+  en: { plain: { determiner: { sg: 'this', pl: 'these' }, pronoun: { sg: 'this', pl: 'these' } } },
+};
+
+const ekeinos: GreekQuantifier = {
+  id: 'ekeinos',
+  pos: 'quantifier',
+  lemma: 'εκείνος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { table: 'ekeinos' } },
+  numbers: ['sg', 'pl'],
+  demonstrative: 'far',
+  meaning:
+    'εκείνος means "that", the one further away or already mentioned. It changes with gender, number and role, and the noun keeps its article: εκείνος ο σκύλος. Romanian says acel câine (before the noun) or câinele acela (after the noun).',
+  ro: {
+    lemma: 'acel',
+    plain: {
+      determiner: {
+        m: { sg: ro1('acel', 'acelui'), pl: ro1('acei', 'acelor') },
+        f: { sg: ro1('acea', 'acelei'), pl: ro1('acele', 'acelor') },
+      },
+      pronoun: {
+        m: { sg: ro1('acela', 'aceluia'), pl: ro1('aceia', 'acelora') },
+        f: { sg: ro1('aceea', 'aceleia'), pl: ro1('acelea', 'acelora') },
+      },
+    },
+    spoken: spokenCells('ăla', 'ăia', 'aia', 'alea'),
+  },
+  en: { plain: { determiner: { sg: 'that', pl: 'those' }, pronoun: { sg: 'that', pl: 'those' } } },
+};
+
+const tetoios: GreekQuantifier = {
+  id: 'tetoios',
+  pos: 'quantifier',
+  lemma: 'τέτοιος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { table: 'tetoios' } },
+  numbers: ['sg', 'pl'],
+  demonstrative: 'such',
+  uses: ['determiner'],
+  meaning:
+    'τέτοιος means "such" and goes beside a noun only. In the singular it follows the indefinite article: ένα τέτοιο σπίτι, "such a house". It changes with gender, number and role. Romanian asemenea never changes.',
+  ro: {
+    lemma: 'asemenea',
+    plain: {
+      determiner: {
+        m: { sg: ro1('un asemenea', 'unui asemenea'), pl: ro1('asemenea', 'unor asemenea') },
+        f: { sg: ro1('o asemenea', 'unei asemenea'), pl: ro1('asemenea', 'unor asemenea') },
+      },
+    },
+  },
+  en: { plain: { determiner: { sg: 'such a', pl: 'such' } } },
+};
+
+const tosos: GreekQuantifier = {
+  id: 'tosos',
+  pos: 'quantifier',
+  lemma: 'τόσος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { stem: 'τόσ' } },
+  numbers: ['sg', 'pl'],
+  demonstrative: 'amount',
+  cases: ['nom', 'acc'],
+  meaning:
+    'τόσος means "so much" with a mass noun (τόσο ψωμί) and "so many" with a count noun (τόσα ψωμιά): the answer to πόσος. It declines like an adjective; Romanian atâta, atâția, atâtea changes too, English does not. It is offered as a subject or an object only.',
+  ro: {
+    lemma: 'atâta',
+    plain: {
+      determiner: {
+        m: { sg: ro1('atâta'), pl: ro1('atâția') },
+        f: { sg: ro1('atâta'), pl: ro1('atâtea') },
+      },
+      pronoun: {
+        m: { sg: ro1('atât'), pl: ro1('atâția') },
+        f: { sg: ro1('atâta'), pl: ro1('atâtea') },
+      },
+    },
+  },
+  en: { plain: { determiner: { sg: 'so much', pl: 'so many' }, pronoun: { sg: 'so much', pl: 'so many' } } },
+};
+
 const INDICATIVE_ALL: Tense[] = [
   'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
@@ -1316,4 +1426,8 @@
   [poios.id]: poios,
   [posos.id]: posos,
+  [autos.id]: autos,
+  [ekeinos.id]: ekeinos,
+  [tetoios.id]: tetoios,
+  [tosos.id]: tosos,
   [thelo.id]: thelo,
   [pidao.id]: pidao,
```

Change `src/data/paradigms.ts` (unified diff):

```diff
@@ -224,9 +224,33 @@
 type PairTable = Partial<Record<Num, Record<Case, Record<Gender, Pair>>>>;
 
+/** A table of whole forms on one stem: for each number, the endings of the nominative, accusative and genitive, each by masculine, feminine and neuter. */
+const onStem = (stem: string, sg: string[][], pl: string[][]): PairTable => {
+  const row = (e: string[]): Record<Gender, Pair> => ({ m: [stem, e[0]], f: [stem, e[1]], n: [stem, e[2]] });
+  const build = (rows: string[][]): Record<Case, Record<Gender, Pair>> => ({ nom: row(rows[0]), acc: row(rows[1]), gen: row(rows[2]) });
+  return { sg: build(sg), pl: build(pl) };
+};
+
 /**
  * Whole forms of the quantifiers that do not follow the adjective endings on one stem (spec 6.3).
  * κάποιος keeps the final ν of the masculine accusative; κανένας follows the numeral ένας; πολύς has two stems.
  */
-export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys' | 'poios', PairTable> = {
+export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios', PairTable> = {
+  /** αυτός keeps the stress on the ending and the final ν of the accusative (αυτόν, αυτήν). */
+  autos: onStem(
+    'αυτ',
+    [['ός', 'ή', 'ό'], ['όν', 'ήν', 'ό'], ['ού', 'ής', 'ού']],
+    [['οί', 'ές', 'ά'], ['ούς', 'ές', 'ά'], ['ών', 'ών', 'ών']],
+  ),
+  ekeinos: onStem(
+    'εκείν',
+    [['ος', 'η', 'ο'], ['ον', 'ην', 'ο'], ['ου', 'ης', 'ου']],
+    [['οι', 'ες', 'α'], ['ους', 'ες', 'α'], ['ων', 'ων', 'ων']],
+  ),
+  /** τέτοιος has the feminine τέτοια, like ποιος. */
+  tetoios: onStem(
+    'τέτοι',
+    [['ος', 'α', 'ο'], ['ον', 'α', 'ο'], ['ου', 'ας', 'ου']],
+    [['οι', 'ες', 'α'], ['ους', 'ες', 'α'], ['ων', 'ων', 'ων']],
+  ),
   poios: {
     sg: {
```

Change `src/engine/english.ts` (unified diff):

```diff
@@ -104,5 +104,5 @@
   const set = s.degree === 'comparative' ? q.en.comparative : s.sense === 'few' && q.en.few ? q.en.few : q.en.plain;
   if (!set) throw new Error(`${q.id} has no English ${s.degree} form`);
-  const word = set[s.use][s.number];
+  const word = set[s.use]?.[s.number];
   if (word === undefined) throw new Error(`${q.id} has no English ${s.use} form for the ${s.number}`);
   return word;
```

Change `src/engine/quantifier.ts` (unified diff):

```diff
@@ -1,3 +1,3 @@
-import type { Case, Gender, GreekQuantifier, QuantifierDegree, QuantifierSense, QuantifierUse, SlotOf } from '../types';
+import type { Case, Gender, GreekQuantifier, QuantifierDegree, QuantifierRegister, QuantifierSense, QuantifierUse, SlotOf } from '../types';
 
 const GENDERS: Gender[] = ['m', 'f', 'n'];
@@ -15,5 +15,10 @@
 export const offeredSenses = (q: GreekQuantifier): QuantifierSense[] => (q.ro.few ? ['some', 'few'] : ['some']);
 
-/** Every slot a quantifier offers; the `few` sense is the only one written on the slot. */
+export const offeredUses = (q: GreekQuantifier): QuantifierUse[] => q.uses ?? USES;
+
+/** The registers a quantifier has: the spoken Romanian forms only where its data has them (a demonstrative). */
+export const offeredRegisters = (q: GreekQuantifier): (QuantifierRegister | undefined)[] => (q.ro.spoken ? [undefined, 'spoken'] : [undefined]);
+
+/** Every slot a quantifier offers; the `few` sense and the spoken register are the only ones written on the slot. */
 export function quantifierSlots(q: GreekQuantifier): SlotOf<'quantifier'>[] {
   return GENDERS.flatMap((gender) =>
@@ -22,14 +27,17 @@
         offeredDegrees(q).flatMap((degree) =>
           offeredSenses(q).flatMap((sense) =>
-            USES.map(
-              (use): SlotOf<'quantifier'> => ({
-                pos: 'quantifier',
-                gender,
-                number,
-                case: c,
-                degree,
-                ...(sense === 'few' ? { sense } : {}),
-                use,
-              }),
+            offeredRegisters(q).flatMap((register) =>
+              offeredUses(q).map(
+                (use): SlotOf<'quantifier'> => ({
+                  pos: 'quantifier',
+                  gender,
+                  number,
+                  case: c,
+                  degree,
+                  ...(sense === 'few' ? { sense } : {}),
+                  ...(register ? { register } : {}),
+                  use,
+                }),
+              ),
             ),
           ),
```

Change `src/engine/romanian.ts` (unified diff):

```diff
@@ -150,6 +150,7 @@
  */
 export function roQuantifier(q: GreekQuantifier, s: SlotOf<'quantifier'>, roGender: Gender): Stored | null {
-  const set = s.sense === 'few' && q.ro.few ? q.ro.few : q.ro.plain;
-  const cell = set[s.use][quantifierGender(roGender, s.number)][s.number];
+  const set = s.register === 'spoken' ? q.ro.spoken : s.sense === 'few' && q.ro.few ? q.ro.few : q.ro.plain;
+  if (!set) throw new Error(`${q.id} has no Romanian ${s.register ?? s.sense ?? 'plain'} forms`);
+  const cell = set[s.use]?.[quantifierGender(roGender, s.number)][s.number];
   if (!cell) throw new Error(`${q.id} has no Romanian ${s.use} form for the ${s.number}`);
   const value = s.case === 'gen' ? cell.gen : cell.nom;
```

Change `src/types.ts` (unified diff):

```diff
@@ -15,4 +15,8 @@
 export type QuantifierSense = 'some' | 'few';
 export type QuantifierUse = 'determiner' | 'pronoun';
+/** Romanian only: the spoken forms (ăsta, ăla), which go after the noun (spec 25). */
+export type QuantifierRegister = 'spoken';
+/** What a demonstrative points at: this, that, such, so much or so many (spec 25). */
+export type DemonstrativeKind = 'near' | 'far' | 'such' | 'amount';
 
 export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional' | 'hortative';
@@ -82,4 +86,6 @@
       /** Beside a noun, or on its own. Greek does not change; Romanian and English do (spec 4.2). */
       use: QuantifierUse;
+      /** The spoken Romanian forms of a demonstrative; Greek and English do not change. */
+      register?: QuantifierRegister;
     }
   | { pos: 'preposition'; sense?: PrepSense }
@@ -165,5 +171,5 @@
  * (the stem-stressed endings, or the ending-stressed ones when `stressed` is set: μερικός, μερικοί).
  */
-export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' } | { stem: string; stressed?: true };
+export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios' } | { stem: string; stressed?: true };
 
 /** One Romanian cell: nominative-accusative and genitive-dative. `gen` is absent where the form is not covered (a stand-alone genitive pronoun, spec 6.3). */
@@ -174,7 +180,8 @@
 
 /** By use, then Romanian gender (neuter follows masculine in the singular and feminine in the plural), then number. */
-export type RoQuantifierCells = Record<QuantifierUse, Record<'m' | 'f', Partial<Record<Num, RoQuantifierCell>>>>;
+type RoCellsByGender = Record<'m' | 'f', Partial<Record<Num, RoQuantifierCell>>>;
+export type RoQuantifierCells = { determiner: RoCellsByGender; pronoun?: RoCellsByGender };
 
-export type EnQuantifierCells = Record<QuantifierUse, Partial<Record<Num, string>>>;
+export type EnQuantifierCells = { determiner: Partial<Record<Num, string>>; pronoun?: Partial<Record<Num, string>> };
 
 export interface GreekQuantifier extends LexemeBase {
@@ -192,7 +199,13 @@
   /** The roles the panel may offer; absent means all three. Question words offer the subject and object only (spec 4.2). */
   cases?: Case[];
+  /** A demonstrative (αυτός, εκείνος, τέτοιος, τόσος): the article follows the near and far ones, and ένα goes before τέτοιος (spec 25). */
+  demonstrative?: DemonstrativeKind;
+  /** The uses the panel may offer; absent means both (τέτοιος has no stand-alone use). */
+  uses?: QuantifierUse[];
   ro: {
     lemma: string;
     plain: RoQuantifierCells;
+    /** The spoken forms of a demonstrative, which go after the noun (casa asta); no genitive. */
+    spoken?: RoQuantifierCells;
     /** The second sense (câțiva beside niște). The comparative is generated: mai + the plain form. */
     few?: RoQuantifierCells;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -1,4 +1,4 @@
 import { inflect } from '../engine/greek';
-import { offeredCases, quantifierSlots } from '../engine/quantifier';
+import { offeredCases, offeredUses, quantifierSlots } from '../engine/quantifier';
 import { allVerbSlots, isOffered, shortFormOf, slotProblem } from '../engine/offers';
 import { enClitic, roClitic } from '../engine/clitics';
@@ -258,4 +258,11 @@
   }
   if (l.pos === 'quantifier') {
+    if (l.demonstrative === 'near' || l.demonstrative === 'far') {
+      if (!l.ro.spoken) errors.push(`lexeme ${l.id}: a near or far demonstrative needs its spoken Romanian forms`);
+      if (offeredUses(l).length !== 2) errors.push(`lexeme ${l.id}: a near or far demonstrative offers both uses`);
+    }
+    if (l.demonstrative === 'such' && (offeredUses(l).length !== 1 || offeredUses(l)[0] !== 'determiner')) {
+      errors.push(`lexeme ${l.id}: τέτοιος is offered beside a noun only`);
+    }
     if (l.numbers.length === 0) errors.push(`lexeme ${l.id}: a quantifier must offer at least one number`);
     if (l.ro.few && !l.en.few) errors.push(`lexeme ${l.id}: ro.few has no en.few`);
@@ -270,5 +277,5 @@
           if (cell === null) {
             // A stand-alone genitive pronoun is not covered (spec 6.3); a determiner must have one.
-            if (slot.use === 'determiner') errors.push(`${where}: no Romanian ${roGender} determiner form in the genitive`);
+            if (slot.use === 'determiner' && slot.register !== 'spoken') errors.push(`${where}: no Romanian ${roGender} determiner form in the genitive`);
           } else if (typeof cell === 'string' && isEmpty(cell)) {
             errors.push(`${where}: empty Romanian ${roGender} form`);
@@ -669,5 +676,5 @@
         for (const g of ['m', 'f'] as const) {
           for (const number of ['sg', 'pl'] as const) {
-            const cell = set[use][g][number];
+            const cell = set[use]?.[g][number];
             if (!cell) continue;
             for (const key of ['nom', 'gen'] as const) {
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1320 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/demonstrative.test.ts src/data/lexemes.ts src/data/paradigms.ts src/engine/english.ts src/engine/quantifier.ts src/engine/romanian.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the demonstratives αυτός, εκείνος, τέτοιος and τόσος (forms in three languages)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: The demonstrative panel

**Files:**
- Create (test): `src/panels/demonstrative.test.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/quantifier.ts`
- Modify: `src/panels/types.ts`

**Interfaces:**
- Consumes: `quantifierPanel`, `roBareNoun`, `roNoun`, `inflectArticle`, `inflectNumeral`, `DEF_ARTICLE`, `NUMERAL` and `applyControl`.
- Produces: The "with a noun" row with the article after αυτός and εκείνος and ένα before τέτοιος; both Romanian placements (and the spoken one) in one cell; the Romanian form control (`register`, formal or spoken) and the control key `register`; `applyControl(state, 'register', …)`; the badge "demonstrative"; no "on its own" row for τέτοιος.

The panel changes are inside `src/panels/quantifier.ts`; the other quantifier panels must not change (a test checks πολύς).

- [ ] **Step 1: Write the tests**

Create `src/panels/demonstrative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, sameState, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'n',
  number: 'sg',
  case: 'nom',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
const stateOf = (slot: SlotOf<'quantifier'>, noun: string): PanelState => ({ slot, noun, nounNumber: slot.number });
const panelFor = (lexeme: string, state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);
const near = (noun: string, patch: Partial<SlotOf<'quantifier'>> = {}, lexeme = 'autos', level: Level = 'beginner') =>
  panelFor(lexeme, stateOf(slotOf(patch), noun), level);

describe('the demonstrative panel: αυτός and εκείνος', () => {
  it('shows the article after the demonstrative, and both Romanian placements', () => {
    const p = near('spiti');
    expect(p.lemma).toBe('αυτός / αυτή / αυτό');
    expect(p.posLabel).toBe('demonstrative: this');
    expect(p.badge).toBe('demonstrative');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p, 0)).toEqual({ el: 'αυτό το σπίτι', ro: 'această casă / casa aceasta', en: 'this house' });
    expect(cells(p, 1)).toEqual({ el: 'αυτό', ro: 'aceasta', en: 'this' });
  });

  it('εκείνος is the far demonstrative', () => {
    const p = near('skylos', { gender: 'm' }, 'ekeinos');
    expect(p.posLabel).toBe('demonstrative: that');
    expect(cells(p, 0)).toEqual({ el: 'εκείνος ο σκύλος', ro: 'acel câine / câinele acela', en: 'that dog' });
    expect(cells(p, 1)).toEqual({ el: 'εκείνος', ro: 'acela', en: 'that' });
  });

  it('follows the number and the role', () => {
    expect(cells(near('spiti', { number: 'pl' }), 0)).toEqual({
      el: 'αυτά τα σπίτια',
      ro: 'aceste case / casele acestea',
      en: 'these houses',
    });
    expect(cells(near('spiti', { case: 'gen' }), 0)).toEqual({
      el: 'αυτού του σπιτιού',
      ro: 'acestei case / casei acesteia',
      en: 'of this house',
    });
    expect(cells(near('skylos', { gender: 'm', case: 'acc' }), 0).el).toBe('αυτόν τον σκύλο');
  });

  it('the spoken Romanian forms go after the noun, and have no genitive', () => {
    const spoken = near('spiti', { register: 'spoken' });
    expect(cells(spoken, 0)).toEqual({ el: 'αυτό το σπίτι', ro: 'casa asta', en: 'this house' });
    expect(cells(spoken, 1).ro).toBe('asta');
    expect(cells(near('skylos', { gender: 'm', register: 'spoken' }, 'ekeinos'), 0).ro).toBe('câinele ăla');
    expect(cells(near('spiti', { register: 'spoken', case: 'gen' }), 0).ro).toBe('not covered');
  });

  it('offers the noun, the role, how many and the Romanian form', () => {
    const p = near('spiti', {}, 'autos', 'improver');
    expect(keys(p)).toEqual(['noun', 'case', 'number', 'register']);
    expect(p.controls.find((c) => c.key === 'register')?.value).toBe('formal');
    expect(p.controls.find((c) => c.key === 'register')?.options.map((o) => o.value)).toEqual(['formal', 'spoken']);
    expect(near('spiti', { register: 'spoken' }).controls.find((c) => c.key === 'register')?.value).toBe('spoken');
  });

  it('Improver: gender by role, with the noun’s forms outlined', () => {
    const p = near('spiti', {}, 'autos', 'improver');
    expect(p.posLabel).toBe('demonstrative · near ("this")');
    expect(p.full).toHaveLength(9);
    expect(p.full[0].label).toBe('masc. nominative');
    expect(richText(p.full[0].el)).toBe('αυτός');
    expect(richText(p.full[0].ro)).toBe('acest');
    expect(p.full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['neut. nominative']);
    expect(p.full.filter((r) => r.hl?.ro).map((r) => r.label)).toEqual(['fem. nominative']);
    expect(near('spiti').full).toEqual([]);
  });

  it('the Romanian form control switches the register, and it is part of the state', () => {
    const start = stateOf(slotOf(), 'spiti');
    const spoken = applyControl(start, 'register', 'spoken');
    expect(spoken.slot).toMatchObject({ register: 'spoken' });
    const back = applyControl(spoken, 'register', 'formal');
    expect('register' in back.slot).toBe(false);
    expect(sameState(back, start)).toBe(true);
    expect(applyControl(stateOf({ ...slotOf(), pos: 'quantifier' }, 'spiti'), 'noun', 'skylos').slot).toMatchObject({ gender: 'm' });
  });

  it('explains the spoken forms in the plain text', () => {
    expect(near('spiti', { register: 'spoken' }).plain).toContain('ăsta, ăla');
    expect(near('spiti').plain).not.toContain('ăsta, ăla');
    expect(near('spiti').plain).not.toContain('mass reading');
  });
});

describe('the demonstrative panel: τέτοιος and τόσος', () => {
  it('τέτοιος takes ένα in the singular and has no stand-alone row', () => {
    const p = panelFor('tetoios', stateOf(slotOf(), 'spiti'));
    expect(p.lemma).toBe('τέτοιος / τέτοια / τέτοιο');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun']);
    expect(cells(p, 0)).toEqual({ el: 'ένα τέτοιο σπίτι', ro: 'o asemenea casă', en: 'such a house' });
    expect(keys(p)).toEqual(['noun', 'case', 'number']);
  });

  it('τέτοιος in the plural takes no article, and with a mass noun no ένα', () => {
    expect(cells(panelFor('tetoios', stateOf(slotOf({ number: 'pl' }), 'spiti')), 0)).toEqual({
      el: 'τέτοια σπίτια',
      ro: 'asemenea case',
      en: 'such houses',
    });
    expect(cells(panelFor('tetoios', stateOf(slotOf(), 'psomi')), 0)).toEqual({ el: 'τέτοιο ψωμί', ro: 'asemenea pâine', en: 'such bread' });
  });

  it('τόσος is the answer to πόσος: so much with a mass noun, so many with a count noun', () => {
    const mass = panelFor('tosos', stateOf(slotOf({ case: 'acc' }), 'psomi'));
    expect(cells(mass, 0)).toEqual({ el: 'τόσο ψωμί', ro: 'atâta pâine', en: 'so much bread' });
    expect(cells(mass, 1)).toEqual({ el: 'τόσο', ro: 'atâta', en: 'so much' });
    expect(cells(panelFor('tosos', stateOf(slotOf({ gender: 'm', case: 'acc' }), 'skylos')), 1).ro).toBe('atât');
    expect(mass.badge).toBe('demonstrative');
    expect(keys(mass)).toEqual(['noun', 'case', 'kind']);
    expect(mass.plain).toContain('mass reading');
    expect(mass.controls.find((c) => c.key === 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    const count = panelFor('tosos', stateOf(slotOf({ case: 'acc', number: 'pl' }), 'spiti'));
    expect(cells(count, 0)).toEqual({ el: 'τόσα σπίτια', ro: 'atâtea case', en: 'so many houses' });
  });
});

describe('the other quantifier panels are unchanged', () => {
  it('πολύς has no Romanian form control and keeps its badge', () => {
    const p = panelFor('polys', stateOf(slotOf({ case: 'acc' }), 'psomi'));
    expect(keys(p)).toEqual(['noun', 'case', 'kind', 'degree']);
    expect(p.badge).toBe('mass reading');
    expect(cells(p, 0).el).toBe('πολύ ψωμί');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/demonstrative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -248,4 +248,12 @@
       }
       break;
+    case 'register':
+      if (slot.pos === 'quantifier') {
+        const next = { ...slot };
+        if (value === 'spoken') next.register = 'spoken';
+        else delete next.register;
+        return { ...state, slot: next };
+      }
+      break;
     case 'recipient':
       if (slot.pos === 'verb' && indirectOf(slot)) {
```

Change `src/panels/quantifier.ts` (unified diff):

```diff
@@ -1,8 +1,9 @@
+import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
 import { enQuantifier } from '../engine/english';
-import { inflectNoun, inflectQuantifier } from '../engine/greek';
+import { inflectArticle, inflectNoun, inflectNumeral, inflectQuantifier } from '../engine/greek';
 import { degreeOptions, kindOptions, senseOptions } from '../engine/labels';
-import { offeredCases, offeredDegrees, offeredSenses } from '../engine/quantifier';
-import { roBareNoun, roQuantifier } from '../engine/romanian';
-import { formRich, joinRich, notice, numeralRich, plain, richText, type Rich } from '../engine/segments';
+import { offeredCases, offeredDegrees, offeredSenses, offeredUses } from '../engine/quantifier';
+import { roBareNoun, roNoun, roQuantifier } from '../engine/romanian';
+import { articleRich, formRich, joinRich, notice, numeralRich, plain, richText, type Rich } from '../engine/segments';
 import { NOT_YET_ADDED, storedText } from '../engine/stored';
 import type { Case, Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
@@ -26,4 +27,52 @@
 }
 
+/** The registers of a Romanian demonstrative: the formal forms or the spoken ones (spec 25). */
+const registerOptions = [
+  { value: 'formal', label: 'formal (acest, acesta)' },
+  { value: 'spoken', label: 'spoken (ăsta, ăla)' },
+];
+
+/**
+ * A near or far demonstrative with its noun in Romanian: before the noun with no article (acest copil) and after it with
+ * the article (copilul acesta); the spoken forms go after the noun only (copilul ăsta).
+ */
+function roDemonstrativeWithNoun(q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): Rich {
+  const after = roQuantifier(q, { ...det, use: 'pronoun' }, noun.ro.gender);
+  if (after === null) return notice('not covered');
+  const afterWord = storedText(after);
+  if (afterWord === null) return notice(NOT_YET_ADDED);
+  const behind = `${roNoun(noun, det.number, det.case, 'definite')} ${afterWord}`;
+  if (det.register === 'spoken') return plain(behind);
+  const before = roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case));
+  return plain(`${richText(before)} / ${behind}`);
+}
+
+/** τέτοιος in the singular takes ένα, except with a mass noun (ένα τέτοιο σπίτι, τέτοιο ψωμί). */
+const takesIndefinite = (q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): boolean =>
+  q.demonstrative === 'such' && det.number === 'sg' && !noun.mass;
+
+/** The "with a noun" row of every quantifier: the article after a near or far demonstrative, ένα before τέτοιος. */
+function withNounRow(q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow {
+  const nounForm = formRich(inflectNoun(noun, { pos: 'noun', number: det.number, case: det.case }));
+  const near = q.demonstrative === 'near' || q.demonstrative === 'far';
+  const indefinite = takesIndefinite(q, det, noun);
+  const el = joinRich([
+    ...(indefinite ? [numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: 1, gender: noun.gender, case: det.case }))] : []),
+    numeralRich(inflectQuantifier(q, det)),
+    ...(near ? [articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: noun.gender, number: det.number, case: det.case }))] : []),
+    nounForm,
+  ]);
+  const ro = near
+    ? roDemonstrativeWithNoun(q, det, noun)
+    : q.demonstrative === 'such' && noun.mass
+      ? plain(`${q.ro.lemma} ${roBareNoun(noun, det.number, det.case)}`)
+      : roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case));
+  const en =
+    q.demonstrative === 'such' && noun.mass
+      ? plain(`${det.case === 'gen' ? 'of ' : ''}such ${noun.en[det.number]}`)
+      : enWithNoun(q, det, noun);
+  return { label: 'with a noun', el, ro, en };
+}
+
 function negationRow(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow | null {
   if (!q.en.negated) return null;
@@ -66,5 +115,5 @@
   if (q.numbers.length > 1) {
     list.push(
-      q.question === 'who'
+      q.question === 'who' || (q.demonstrative && q.demonstrative !== 'amount')
         ? numberControl(slot.number)
         : { key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' },
@@ -77,8 +126,19 @@
     list.push({ key: 'sense', label: 'Romanian counterpart', options: senseOptions, value: slot.sense ?? 'some' });
   }
+  if (q.ro.spoken) {
+    list.push({ key: 'register', label: 'Romanian form', options: registerOptions, value: slot.register ?? 'formal' });
+  }
   return list;
 }
 
+const DEMONSTRATIVE_LABEL: Record<NonNullable<GreekQuantifier['demonstrative']>, string> = {
+  near: 'demonstrative · near ("this")',
+  far: 'demonstrative · far ("that")',
+  such: 'demonstrative · "such", beside a noun only',
+  amount: 'demonstrative · "so much / so many", declines like an adjective',
+};
+
 function improverLabel(q: GreekQuantifier): string {
+  if (q.demonstrative) return DEMONSTRATIVE_LABEL[q.demonstrative];
   const how = q.greek.plain;
   if ('stem' in how) return 'quantifier · declines like an adjective';
@@ -117,15 +177,8 @@
   );
 
-  const withNoun: PanelRow = {
-    label: 'with a noun',
-    el: joinRich([
-      numeralRich(inflectQuantifier(q, det)),
-      formRich(inflectNoun(noun, { pos: 'noun', number: det.number, case: det.case })),
-    ]),
-    ro: roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case)),
-    en: enWithNoun(q, det, noun),
-  };
-  const alone: PanelRow =
-    slot.case === 'gen'
+  const withNoun = withNounRow(q, det, noun);
+  // τέτοιος has no stand-alone use, so its row is never built.
+  const aloneRow = (): PanelRow =>
+    slot.case === 'gen' && !q.demonstrative
       ? {
           label: 'on its own',
@@ -147,9 +200,11 @@
     posLabel:
       level === 'beginner'
-        ? `${q.question ? 'question word' : 'quantifier'}: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined })}`
+        ? `${q.question ? 'question word' : q.demonstrative ? 'demonstrative' : 'quantifier'}: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined, register: undefined })}`
         : improverLabel(q),
     badge: q.question
       ? 'question word'
-      : q.numbers.length > 1
+      : q.demonstrative
+        ? 'demonstrative'
+        : q.numbers.length > 1
         ? slot.number === 'sg'
           ? 'mass reading'
@@ -157,9 +212,9 @@
         : undefined,
     controls: controls(q, slot, state, level),
-    rows: [withNoun, alone, ...(negation ? [negation] : [])],
+    rows: [withNoun, ...(offeredUses(q).includes('pronoun') ? [aloneRow()] : []), ...(negation ? [negation] : [])],
     full: level === 'improver' ? quantifierFull(q, here, noun) : [],
     plain:
       q.meaning +
-      (q.numbers.length > 1 && q.question !== 'who'
+      (q.numbers.length > 1 && q.question !== 'who' && (!q.demonstrative || q.demonstrative === 'amount')
         ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
         : '') +
@@ -169,4 +224,7 @@
       (slot.case === 'gen' && slot.number === 'pl' && q.ro.genitiveWithA
         ? ` Romanian also says "${q.ro.genitiveWithA}" (a + the plain plural) with the same meaning.`
+        : '') +
+      (slot.register === 'spoken'
+        ? ' The spoken Romanian forms (ăsta, ăla) go after the noun, which keeps its article (casa asta), and have no genitive.'
         : ''),
     irregular: inflectQuantifier(q, det).irregular?.plain ?? '',
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -4,5 +4,5 @@
 
 export interface Control {
-  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor' | 'owner';
+  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor' | 'owner' | 'register';
   label: string;
   options: Option[];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1332 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/demonstrative.test.ts src/panels/panels.ts src/panels/quantifier.ts src/panels/types.ts
git commit -m "feat: the demonstrative panel (article, both Romanian placements, spoken forms)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: The place words: the adverb part of speech

**Files:**
- Create: `src/panels/adverb.ts`
- Create (test): `src/panels/adverb.test.ts`
- Create (test): `src/validate/adverb-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/preposition.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/App.questions.test.tsx`
- Modify (test): `src/App.test.tsx`
- Modify (test): `src/panels/panels.test.ts`
- Modify (test): `src/panels/preposition-question.test.ts`
- Modify (test): `src/validate/question-quantifier-validate.test.ts`

**Interfaces:**
- Consumes: `GreekInterrogative` and its panel as the model, `prepositionPanel`, `questionRow`, `applyControl` and `validate`.
- Produces: `GreekAdverb`, the slot `{ pos: 'adverb' }`, `inflectAdverb`; the lexemes `edo` and `ekei` with `roAfter`; `adverbPanel`; the preposition panel with a place word ("prep. + place word"); the validator's adverb checks and a preposition governing an adverb; the control label "Noun, question word or place word after it".

Five existing tests mention the old control label or the old validator message and are updated here.

- [ ] **Step 1: Write the tests**

Create `src/panels/adverb.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { formText, richText } from '../engine/segments';
import { inflect } from '../engine/greek';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const token = (lexeme: string): Token => ({ text: lexeme, lexeme, slot: { pos: 'adverb' } });
const panelOf = (lexeme: string, level: 'beginner' | 'improver' = 'beginner') =>
  buildPanel({ slot: { pos: 'adverb' }, noun: null, nounNumber: 'sg' }, token(lexeme), level);

describe('the place words', () => {
  it('εδώ and εκεί are unverified lexemes that never change', () => {
    for (const id of ['edo', 'ekei']) {
      const lexeme = getLexeme(id);
      expect(lexeme.pos).toBe('adverb');
      expect(lexeme.verified).toEqual({ el: false, ro: false, en: false });
      expect(formText(inflect(lexeme, { pos: 'adverb' }))).toBe(lexeme.lemma);
    }
  });

  it('the panel shows the word on its own and in a sentence', () => {
    const here = panelOf('edo');
    expect(here.lemma).toBe('εδώ');
    expect(here.posLabel).toBe('place word: here');
    expect(here.controls).toEqual([]);
    expect(here.rows.map((r) => r.label)).toEqual(['on its own', 'in a sentence']);
    expect(cells(here.rows, 0)).toEqual({ el: 'εδώ', ro: 'aici', en: 'here' });
    expect(cells(here.rows, 1)).toEqual({ el: 'Εδώ είναι το σπίτι', ro: 'Aici este casa', en: 'Here is the house' });
    const there = panelOf('ekei', 'improver');
    expect(there.posLabel).toBe('adverb · never changes');
    expect(cells(there.rows, 0)).toEqual({ el: 'εκεί', ro: 'acolo', en: 'there' });
    expect(there.full).toEqual([]);
  });

  it('has no controls to apply', () => {
    const state: PanelState = { slot: { pos: 'adverb' }, noun: null, nounNumber: 'sg' };
    expect(applyControl(state, 'case', 'gen')).toBe(state);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
  });
});

describe('a preposition before a place word', () => {
  const mexri: Token = { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 };
  const apo: Token = { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 };
  const phrase = (prep: Token, word: string): Phrase => ({
    id: 'x', title: 'x', theme: 'x', level: 'beginner', tokens: [prep, token(word)], glosses: [], verified: false,
  });

  it('μέχρι εκεί is "until there", and până acolo (not până la acolo)', () => {
    const state = initialState(mexri, phrase(mexri, 'ekei'));
    expect(state.noun).toBe('ekei');
    const panel = buildPanel(state, mexri, 'beginner');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + place word']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'μέχρι εκεί', ro: 'până acolo', en: 'until there' });
    expect(panel.controls.map((c) => c.key)).toEqual(['noun']);
    expect(panel.plain).toContain('μέχρι εκεί');
  });

  it('από εδώ is de aici', () => {
    const state = initialState(apo, phrase(apo, 'edo'));
    expect(cells(buildPanel(state, apo, 'beginner').rows, 0)).toEqual({ el: 'από εδώ', ro: 'de aici', en: 'from here' });
    expect(cells(buildPanel(applyControl(state, 'noun', 'ekei'), apo, 'beginner').rows, 0).ro).toBe('de acolo');
  });

  it('μέχρι εδώ is până aici', () => {
    const state = initialState(mexri, phrase(mexri, 'edo'));
    expect(cells(buildPanel(state, mexri, 'beginner').rows, 0)).toEqual({ el: 'μέχρι εδώ', ro: 'până aici', en: 'until here' });
  });

  it('the control offers the place words, and switching to one drops the number', () => {
    const noun: PanelState = { slot: apo.slot, noun: 'skylos', nounNumber: 'pl' };
    const next = applyControl(noun, 'noun', 'edo');
    expect(next).toMatchObject({ noun: 'edo', nounNumber: 'sg' });
    expect(buildPanel(next, apo, 'beginner').controls[0].options.map((o) => o.value)).toEqual(expect.arrayContaining(['edo', 'ekei']));
  });

  it('Improver lists the prepositions that take a place word, without σε', () => {
    const state = initialState(mexri, phrase(mexri, 'ekei'));
    expect(buildPanel(state, mexri, 'improver').full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
  });
});
```

Create `src/validate/adverb-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekAdverb, GreekLexeme, Phrase, Slot } from '../types';
import { validate } from './validate';

const real = { lexemes: LEXEMES };
const withPreposition = (prep: string, target: string, slot: Slot): Phrase => ({
  ...PHRASES[0],
  tokens: [
    { text: prep === 'se' ? 'στο' : 'από', lexeme: prep, slot: { pos: 'preposition' }, agreesWith: 1 },
    { text: 'x', lexeme: target, slot },
  ],
});
const edo = LEXEMES.edo as GreekAdverb;
const lexemesWith = (change: Partial<GreekAdverb>): Record<string, GreekLexeme> => ({ ...LEXEMES, edo: { ...edo, ...change } });

describe('the place words in the validator', () => {
  it('the real lexemes are valid', () => {
    expect(validate({ ...real, phrases: [] })).toEqual([]);
  });

  it('accepts a place word after a preposition', () => {
    const phrase = withPreposition('apo', 'edo', { pos: 'adverb' });
    expect(validate({ ...real, phrases: [phrase] }).filter((e) => e.includes('token 0'))).toEqual([]);
  });

  it('σε fuses with an article, so it does not take a place word', () => {
    const phrase = withPreposition('se', 'edo', { pos: 'adverb' });
    expect(validate({ ...real, phrases: [phrase] })).toContain(
      'ordering-hot-coffee token 0 (στο): σε fuses with an article, so it needs a noun in agreesWith',
    );
  });

  it('wants the texts to be filled in, and roAfter to name a preposition', () => {
    expect(validate({ lexemes: lexemesWith({ ro: '' }), phrases: [] })).toContain('lexeme edo: an empty Romanian, English, meaning or example text');
    expect(validate({ lexemes: lexemesWith({ roAfter: { pou: 'de aici' } }), phrases: [] })).toContain(
      'lexeme edo: roAfter names "pou", which is not a preposition',
    );
    expect(validate({ lexemes: lexemesWith({ roAfter: { apo: '' } }), phrases: [] })).toContain('lexeme edo: roAfter for apo is empty');
  });
});
```

Change `src/App.questions.test.tsx` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -27,5 +27,5 @@
     expect(screen.getByRole('cell', { name: 'de unde' })).toBeInTheDocument();
     expect(screen.getByRole('cell', { name: 'from where' })).toBeInTheDocument();
-    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'skylos');
+    await user.selectOptions(screen.getByLabelText('Noun, question word or place word after it'), 'skylos');
     expect(screen.getByRole('cell', { name: 'από τον σκύλο' })).toBeInTheDocument();
     expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
```

Change `src/App.test.tsx` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -128,5 +128,5 @@
     await user.click(screen.getByRole('button', { name: 'πάνω από' }));
     expect(screen.getByRole('cell', { name: 'πάνω από τον σκύλο' })).toBeInTheDocument();
-    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'alepou');
+    await user.selectOptions(screen.getByLabelText('Noun, question word or place word after it'), 'alepou');
     expect(screen.getByRole('cell', { name: 'πάνω από την αλεπού' })).toBeInTheDocument();
     expect(screen.getByRole('cell', { name: 'peste vulpea' })).toBeInTheDocument();
```

Change `src/panels/panels.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -211,5 +211,5 @@
     expect(panel.posLabel).toBe('preposition: over');
     expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
-    expect(panel.controls[0].label).toBe('Noun or question word after it');
+    expect(panel.controls[0].label).toBe('Noun, question word or place word after it');
     expect(panel.rows.map((r) => r.label)).toEqual(['prep. + noun']);
     expect(text(panel.rows, 0)).toEqual({ el: 'πάνω από τον σκύλο', ro: 'peste câinele', en: 'over the dog' });
```

Change `src/panels/preposition-question.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -39,7 +39,7 @@
   });
 
-  it('offers the nouns and then the question words in the control, and switches back to a noun', () => {
+  it('offers the nouns, then the question words and the place words, and switches back to a noun', () => {
     const options = buildPanel(state, apo, 'beginner').controls[0].options.map((o) => o.value);
-    expect(options.slice(-5)).toEqual(['ti', 'pou', 'pote', 'giati', 'pos-how']);
+    expect(options.slice(-7)).toEqual(['ti', 'pou', 'pote', 'giati', 'pos-how', 'edo', 'ekei']);
     expect(options).toContain('skylos');
     const noun = applyControl(state, 'noun', 'skylos');
@@ -52,5 +52,5 @@
   it('the control is labelled for both nouns and question words, and offers both', () => {
     const control = buildPanel(state, apo, 'beginner').controls[0];
-    expect(control.label).toBe('Noun or question word after it');
+    expect(control.label).toBe('Noun, question word or place word after it');
     expect(control.options.map((o) => o.value)).toEqual(expect.arrayContaining(['skylos', 'pou', 'ti']));
   });
```

Change `src/validate/question-quantifier-validate.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -75,5 +75,5 @@
     });
     expect(validate({ ...real, phrases: [phrase] })).toContain(
-      'ordering-hot-coffee token 0 (από): preposition needs agreesWith pointing at the noun or question word it governs',
+      'ordering-hot-coffee token 0 (από): preposition needs agreesWith pointing at the noun, question word or place word it governs',
     );
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/adverb.test.ts src/validate/adverb-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/panels/adverb.ts`:

```ts
import { plain } from '../engine/segments';
import type { GreekAdverb, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** εδώ and εκεί: the word on its own and in a sentence (spec 5.3). */
export function adverbPanel(word: GreekAdverb, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({
    label,
    el: plain(el),
    ro: plain(ro),
    en: plain(en),
  });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `place word: ${word.en}` : 'adverb · never changes',
    controls: [],
    rows: [
      row('on its own', word.lemma, word.ro, word.en),
      row('in a sentence', word.example.el, word.example.ro, word.example.en),
    ],
    full: [],
    plain: word.meaning,
    irregular: '',
    note: '',
  };
}
```

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -1,3 +1,4 @@
 import type {
+  GreekAdverb,
   CellOverride,
   GreekAdjective,
@@ -1351,4 +1352,44 @@
 });
 
+const adverb = (
+  id: string,
+  lemma: string,
+  ro: string,
+  en: string,
+  meaning: string,
+  example: GreekAdverb['example'],
+  roAfter?: GreekAdverb['roAfter'],
+): GreekAdverb => ({
+  id,
+  pos: 'adverb',
+  lemma,
+  verified: { el: false, ro: false, en: false },
+  ro,
+  en,
+  meaning,
+  example,
+  ...(roAfter ? { roAfter } : {}),
+});
+
+const edo = adverb(
+  'edo',
+  'εδώ',
+  'aici',
+  'here',
+  'εδώ means "here", the place near the speaker. It never changes. Romanian aici, English here.',
+  { el: 'Εδώ είναι το σπίτι', ro: 'Aici este casa', en: 'Here is the house' },
+  { apo: 'de aici', mexri: 'până aici' },
+);
+
+const ekei = adverb(
+  'ekei',
+  'εκεί',
+  'acolo',
+  'there',
+  'εκεί means "there", the place away from the speaker. It never changes. Romanian acolo, English there.',
+  { el: 'Εκεί είναι ο σκύλος', ro: 'Acolo este câinele', en: 'There is the dog' },
+  { apo: 'de acolo', mexri: 'până acolo' },
+);
+
 const ti = interrogative(
   'ti',
@@ -1463,4 +1504,6 @@
   [giati.id]: giati,
   [posHow.id]: posHow,
+  [edo.id]: edo,
+  [ekei.id]: ekei,
 };
 
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -28,4 +28,5 @@
   GreekPreposition,
   GreekQuantifier,
+  GreekAdverb,
   GreekVerb,
   IrregularNote,
@@ -187,4 +188,8 @@
 }
 
+export function inflectAdverb(l: GreekAdverb, _s: SlotOf<'adverb'>): Form {
+  return { stem: l.lemma, ending: '' };
+}
+
 export function inflect(l: GreekLexeme, s: Slot): Form {
   if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
@@ -214,4 +219,6 @@
     case 'interrogative':
       return inflectInterrogative(l, s as SlotOf<'interrogative'>);
+    case 'adverb':
+      return inflectAdverb(l, s as SlotOf<'adverb'>);
   }
 }
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -8,4 +8,5 @@
   Gender,
   GreekAdjective,
+  GreekAdverb,
   GreekConjunction,
   GreekInterrogative,
@@ -36,4 +37,5 @@
 import { conjunctionPanel } from './conjunction';
 import { possessivePanel } from './possessive';
+import { adverbPanel } from './adverb';
 import { interrogativePanel } from './interrogative';
 import { quantifierPanel } from './quantifier';
@@ -112,4 +114,6 @@
     case 'interrogative':
       return interrogativePanel(lexeme as GreekInterrogative, level);
+    case 'adverb':
+      return adverbPanel(lexeme as GreekAdverb, level);
     case 'quantifier':
       return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
@@ -158,4 +162,5 @@
         slot.pos !== 'conjunction' &&
         slot.pos !== 'interrogative' &&
+        slot.pos !== 'adverb' &&
         slot.pos !== 'clitic'
       ) {
@@ -266,5 +271,5 @@
       const noun = getLexeme(value);
       // After a preposition the learner may choose a question word as well as a noun (από πού).
-      if (slot.pos === 'preposition' && noun.pos === 'interrogative') return { ...state, noun: value, nounNumber: 'sg' };
+      if (slot.pos === 'preposition' && (noun.pos === 'interrogative' || noun.pos === 'adverb')) return { ...state, noun: value, nounNumber: 'sg' };
       if (noun.pos !== 'noun') break;
       if (slot.pos === 'preposition') return { ...state, noun: value };
```

Change `src/panels/preposition.ts` (unified diff):

```diff
@@ -6,22 +6,22 @@
 import { roNoun } from '../engine/romanian';
 import { formRich, formText, plain } from '../engine/segments';
-import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num, PrepSense } from '../types';
+import type { GreekAdverb, GreekInterrogative, GreekNoun, GreekPreposition, Level, Num, PrepSense } from '../types';
 import { ALL, GENDERS, GENDER_ROW, NUMS, nounOf, nounOptions } from './shared';
 import type { Control, Panel, PanelRow, PanelState } from './types';
 
-/** What follows a preposition: a noun, or a question word (από πού). */
-type After = { kind: 'noun'; noun: GreekNoun } | { kind: 'question'; word: GreekInterrogative };
+/** What follows a preposition: a noun, a question word (από πού) or a place word (μέχρι εκεί). */
+type After = { kind: 'noun'; noun: GreekNoun } | { kind: 'question'; word: GreekInterrogative | GreekAdverb };
 
 function afterOf(state: PanelState): After {
   const lexeme = state.noun ? getLexeme(state.noun) : undefined;
-  if (lexeme?.pos === 'interrogative') return { kind: 'question', word: lexeme };
+  if (lexeme?.pos === 'interrogative' || lexeme?.pos === 'adverb') return { kind: 'question', word: lexeme };
   return { kind: 'noun', noun: nounOf(state) };
 }
 
-/** The nouns, then the question words, for the "after it" control. */
+/** The nouns, then the question words and the place words, for the "after it" control. */
 function afterOptions(prep: GreekPreposition): Option[] {
   if (prep.fused) return nounOptions();
   const words = Object.values(LEXEMES).flatMap((l) =>
-    l.pos === 'interrogative' ? [{ value: l.id, label: `${l.lemma} (${l.en})` }] : [],
+    l.pos === 'interrogative' || l.pos === 'adverb' ? [{ value: l.id, label: `${l.lemma} (${l.en})` }] : [],
   );
   return [...nounOptions(), ...words];
@@ -69,6 +69,6 @@
 }
 
-/** One preposition followed by a question word. Romanian fuses some pairs into one word (de unde, până când). */
-export function questionRow(prep: GreekPreposition, word: GreekInterrogative, label: string): PanelRow {
+/** One preposition followed by a question word or a place word. Romanian fuses some pairs into one word (de unde, până când, de aici). */
+export function questionRow(prep: GreekPreposition, word: GreekInterrogative | GreekAdverb, label: string): PanelRow {
   return {
     label,
@@ -86,5 +86,5 @@
     {
       key: 'noun',
-      label: prep.fused ? 'Noun after it' : 'Noun or question word after it',
+      label: prep.fused ? 'Noun after it' : 'Noun, question word or place word after it',
       options: afterOptions(prep),
       value: state.noun ?? '',
@@ -112,5 +112,5 @@
       after.kind === 'noun'
         ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun', sense)
-        : questionRow(prep, after.word, 'prep. + question word'),
+        : questionRow(prep, after.word, after.word.pos === 'adverb' ? 'prep. + place word' : 'prep. + question word'),
       ...example,
     ],
@@ -131,5 +131,7 @@
           ? 'σε is followed by the accusative and is written as one word with the article: σε + τον = στον. The feminine στην loses its ν before most consonants (στη θάλασσα). Romanian and English keep the preposition and the article apart. Where English and Romanian choose between to, at, in and on (la, în, pe), Greek uses σε for all of them.'
           : 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
-        : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
+        : after.word.pos === 'adverb'
+          ? 'A place word follows a preposition as a noun would: μέχρι εκεί, "as far as there". Greek and English build it from two words; Romanian sometimes has one fused word (de aici) and sometimes two (până acolo).'
+          : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
     irregular: '',
     note: after.kind === 'noun' ? after.noun.note : '',
```

Change `src/types.ts` (unified diff):

```diff
@@ -93,4 +93,5 @@
   | { pos: 'conjunction' }
   | { pos: 'interrogative' }
+  | { pos: 'adverb' }
   | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }
   | ({ pos: 'clitic' } & Clitic);
@@ -350,4 +351,17 @@
 
 /** A question word that never changes: τι, πού, πότε, γιατί, πώς (spec 5.3). ποιος and πόσος are quantifiers. */
+/** A place word that never changes: εδώ and εκεί (spec 25). A preposition may govern one (μέχρι εκεί). */
+export interface GreekAdverb extends LexemeBase {
+  pos: 'adverb';
+  ro: string;
+  en: string;
+  /** One line of meaning for the panel. */
+  meaning: string;
+  /** The Romanian words after a preposition, where they are not the preposition's word + the adverb (από εδώ: de aici), by preposition id. */
+  roAfter?: Record<string, string>;
+  /** An example sentence in each language. */
+  example: { el: string; ro: string; en: string };
+}
+
 export interface GreekInterrogative extends LexemeBase {
   pos: 'interrogative';
@@ -403,5 +417,5 @@
 
 export type GreekLexeme =
-  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative;
+  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb;
 
 export type TokenIndex = number;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -84,4 +84,6 @@
     case 'interrogative':
       return [{ pos: 'interrogative' }];
+    case 'adverb':
+      return [{ pos: 'adverb' }];
     case 'clitic':
       return cliticSlots();
@@ -231,4 +233,12 @@
     }
   }
+  if (l.pos === 'adverb') {
+    const texts = [l.ro, l.en, l.meaning, ...Object.values(l.example)];
+    if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian, English, meaning or example text`);
+    for (const [key, value] of Object.entries(l.roAfter ?? {})) {
+      if (lexemes[key]?.pos !== 'preposition') errors.push(`lexeme ${l.id}: roAfter names "${key}", which is not a preposition`);
+      if (isEmpty(value)) errors.push(`lexeme ${l.id}: roAfter for ${key} is empty`);
+    }
+  }
   if (l.pos === 'possessive') {
     for (const [key, entry] of Object.entries(RO_POSSESSIVES)) {
@@ -482,6 +492,6 @@
     const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
     const governed = target ? lexemes[target.lexeme] : undefined;
-    if (!governed || (governed.pos !== 'noun' && governed.pos !== 'interrogative')) {
-      errors.push(`${where}: preposition needs agreesWith pointing at the noun or question word it governs`);
+    if (!governed || (governed.pos !== 'noun' && governed.pos !== 'interrogative' && governed.pos !== 'adverb')) {
+      errors.push(`${where}: preposition needs agreesWith pointing at the noun, question word or place word it governs`);
     }
     if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'noun' && target?.slot.pos === 'noun') {
@@ -492,5 +502,5 @@
       }
       if (target.slot.case !== 'acc') errors.push(`${where}: ${lexeme.lemma} governs the accusative, so its noun must be accusative`);
-    } else if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'interrogative') {
+    } else if (lexeme.pos === 'preposition' && lexeme.fused && (governed?.pos === 'interrogative' || governed?.pos === 'adverb')) {
       errors.push(`${where}: ${lexeme.lemma} fuses with an article, so it needs a noun in agreesWith`);
     }
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1344 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/adverb.test.ts src/panels/adverb.ts src/validate/adverb-validate.test.ts src/App.questions.test.tsx src/App.test.tsx src/data/lexemes.ts src/engine/greek.ts src/panels/panels.test.ts src/panels/panels.ts src/panels/preposition-question.test.ts src/panels/preposition.ts src/types.ts src/validate/question-quantifier-validate.test.ts src/validate/validate.ts
git commit -m "feat: the place words εδώ and εκεί (the adverb part of speech)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Demonstratives and place words in phrases: the validator and phrases 73 to 80

**Files:**
- Create (test): `src/App.pointing.test.tsx`
- Create (test): `src/data/phrases-pointing.test.ts`
- Create (test): `src/validate/demonstrative-validate.test.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The helpers `rows`, `u`, `seg`, `qslot`, `article`, `possessive`, `present`, `verbSlot`, `nomSg` and `accSg` in `src/data/phrases.ts`, and the lexemes of Tasks 1 and 3.
- Produces: Validator rules for the article beside αυτός and εκείνος, ένα beside τέτοιος and the spoken register; the phrases `this-house`, `that-dog`, `these-houses`, `this-is-my-house`, `here-is-the-house`, `as-far-as-there`, `such-a-house`, `so-much-bread` in the new theme *Pointing*; the picker lists 80 phrases.

Phrase 76 gives αυτό an `agreesWith` (the house) although it is a stand-alone use, so that its panel starts from σπίτι and shows *aceasta*.

- [ ] **Step 1: Write the tests**

Create `src/App.pointing.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('demonstratives in the app', () => {
  it('opens αυτός from its chip with the article kept and both Romanian placements', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'αυτός / αυτή / αυτό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'αυτό το σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'această casă / casa aceasta' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'this house' })).toBeInTheDocument();
    expect(screen.getByText('demonstrative')).toBeInTheDocument();
  });

  it('the Romanian form control switches to the spoken forms', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    await user.selectOptions(screen.getByLabelText('Romanian form'), 'spoken');
    expect(screen.getByRole('cell', { name: 'casa asta' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Romanian form'), 'formal');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('αυτό on its own agrees with the noun in Romanian', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This is my house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    expect(screen.getByRole('cell', { name: 'aceasta' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'skylos');
    expect(screen.getByRole('cell', { name: 'acesta' })).toBeInTheDocument();
  });

  it('τέτοιος has no stand-alone row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Such a house');
    await user.click(screen.getByRole('button', { name: 'τέτοιο' }));
    expect(screen.getByRole('cell', { name: 'ένα τέτοιο σπίτι' })).toBeInTheDocument();
    expect(screen.getByText('with a noun')).toBeInTheDocument();
    expect(screen.queryByText('on its own')).not.toBeInTheDocument();
  });
});

describe('the place words in the app', () => {
  it('opens εδώ with the word and an example', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Here is the house');
    await user.click(screen.getByRole('button', { name: 'Εδώ' }));
    expect(screen.getByRole('heading', { level: 2, name: 'εδώ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'aici' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Aici este casa' })).toBeInTheDocument();
  });

  it('μέχρι before εκεί is până acolo, and the control can switch to εδώ', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'As far as there');
    await user.click(screen.getByRole('button', { name: 'Μέχρι' }));
    expect(screen.getByRole('cell', { name: 'μέχρι εκεί' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'până acolo' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun, question word or place word after it'), 'edo');
    expect(screen.getByRole('cell', { name: 'până aici' })).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-pointing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'here-is-the-house', 'as-far-as-there', 'such-a-house', 'so-much-bread'];
const phrase = (id: string) => {
  const found = PHRASES.find((p) => p.id === id);
  if (!found) throw new Error(`no phrase ${id}`);
  return found;
};
const gloss = (id: string, language: 'en' | 'ro', kind: 'natural' | 'literal') =>
  phrase(id)
    .glosses.find((g) => g.language === language && g.kind === kind)!
    .units.map(unitText)
    .join(' ');
const text = (id: string) => phrase(id).tokens.map((t) => t.text).join(' ');

describe('phrases 73 to 80', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Pointing theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Pointing'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('this-house')).toEqual(['Αυτό το σπίτι', 'This house', 'Această casă']);
    expect(read('that-dog')).toEqual(['Εκείνος ο σκύλος', 'That dog', 'Acel câine']);
    expect(read('these-houses')).toEqual(['Αυτά τα σπίτια', 'These houses', 'Casele acestea']);
    expect(read('this-is-my-house')).toEqual(['Αυτό είναι το σπίτι μου', 'This is my house', 'Aceasta este casa mea']);
    expect(read('here-is-the-house')).toEqual(['Εδώ είναι το σπίτι', 'Here is the house', 'Aici este casa']);
    expect(read('as-far-as-there')).toEqual(['Μέχρι εκεί', 'As far as there', 'Până acolo']);
    expect(read('such-a-house')).toEqual(['Ένα τέτοιο σπίτι', 'Such a house', 'O asemenea casă']);
    expect(read('so-much-bread')).toEqual(['Έχω τόσο ψωμί', 'I have so much bread', 'Am atâta pâine']);
  });

  it('the literal English follows the Greek order', () => {
    expect(gloss('this-house', 'en', 'literal')).toBe('this the house');
    expect(gloss('such-a-house', 'en', 'literal')).toBe('a such house');
    expect(gloss('as-far-as-there', 'en', 'literal')).toBe('until there');
  });

  it('the demonstrative points at its noun, and so does its article', () => {
    const tokens = phrase('this-house').tokens;
    expect([tokens[0].agreesWith, tokens[1].agreesWith]).toEqual([2, 2]);
    const pronoun = phrase('this-is-my-house').tokens[0];
    expect(pronoun.slot).toMatchObject({ pos: 'quantifier', use: 'pronoun' });
    expect(pronoun.agreesWith).toBe(3);
  });
});
```

Create `src/validate/demonstrative-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const find = (id: string) => PHRASES.find((p) => p.id === id)!;
const withTokens = (base: Phrase, change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a demonstrative in the validator', () => {
  it('accepts the real phrases', () => {
    for (const id of ['this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'such-a-house', 'so-much-bread']) {
      expect(errorsOf(find(id))).toEqual([]);
    }
  });

  it('wants the definite article of the noun after αυτός and εκείνος', () => {
    const noArticle = withTokens(find('this-house'), (t) => [t[0], t[2]].map((x) => ({ ...x, agreesWith: x.agreesWith === 2 ? 1 : x.agreesWith })));
    expect(errorsOf(noArticle)).toContain('this-house token 0 (Αυτό): αυτός beside a noun needs the definite article of that noun');
    const far = withTokens(find('that-dog'), (t) => [t[0], t[2]].map((x) => ({ ...x, agreesWith: x.agreesWith === 2 ? 1 : x.agreesWith })));
    expect(errorsOf(far)).toContain('that-dog token 0 (Εκείνος): εκείνος beside a noun needs the definite article of that noun');
  });

  it('wants ένα before τέτοιος in the singular, and none in the plural', () => {
    const noOne = withTokens(find('such-a-house'), (t) => [t[1], t[2]].map((x) => ({ ...x, agreesWith: 1 })));
    expect(errorsOf(noOne)).toContain('such-a-house token 0 (τέτοιο): τέτοιος in the singular needs ένα before it');
    const plural: Phrase = {
      ...find('such-a-house'),
      tokens: [
        { text: 'τέτοια', lexeme: 'tetoios', slot: { pos: 'quantifier', gender: 'n', number: 'pl', case: 'nom', degree: 'plain', use: 'determiner' }, agreesWith: 1 },
        { text: 'σπίτια', lexeme: 'spiti', slot: { pos: 'noun', number: 'pl', case: 'nom' } },
      ],
      glosses: (['en', 'ro'] as const).flatMap((language) =>
        (['natural', 'literal'] as const).map((kind) => ({ language, kind, units: [{ text: 'a', link: 0 }, { text: 'b', link: 1 }] })),
      ),
    };
    expect(errorsOf(plural)).toEqual([]);
  });

  it('τόσος needs no article, and a pronoun use needs none either', () => {
    const noArticle = errorsOf(find('so-much-bread'));
    expect(noArticle).toEqual([]);
  });

  it('the spoken register is not part of a Greek token', () => {
    const spoken = withTokens(find('this-house'), (t) => t.map((x, i) => (i === 0 ? { ...x, slot: { ...(x.slot as object), register: 'spoken' } as Token['slot'] } : x)));
    expect(errorsOf(spoken)).toContain('this-house token 0 (Αυτό): the spoken register is a Romanian form, not part of a Greek token');
  });

  it('checks the form: the genders of the demonstrative and its noun must agree', () => {
    const wrong = withTokens(find('this-house'), (t) => t.map((x, i) => (i === 0 ? { ...x, text: 'Αυτός', slot: { ...(x.slot as object), gender: 'm' } as Token['slot'] } : x)));
    expect(errorsOf(wrong).some((e) => e.includes('slot gender m differs from noun gender n'))).toBe(true);
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 72 phrases in the spec order', () => {
+  it('the picker lists all 80 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -102,4 +102,5 @@
       'my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee',
       'my-own-house', 'the-house-is-mine', 'the-childs-house', 'the-childs-dog',
+      'this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'here-is-the-house', 'as-far-as-there', 'such-a-house', 'so-much-bread',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.pointing.test.tsx src/data/phrases-pointing.test.ts src/validate/demonstrative-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1576,4 +1576,166 @@
 };
 
+const pluralArticle = (gender: Gender, agreesWith: number): Token => ({
+  text: '',
+  lexeme: 'def',
+  slot: { pos: 'article', gender, number: 'pl', case: 'nom' },
+  agreesWith,
+});
+const adverb: Slot = { pos: 'adverb' };
+
+const thisHouse: Phrase = {
+  id: 'this-house',
+  title: 'This house',
+  theme: 'Pointing',
+  level: 'beginner',
+  tokens: [
+    { text: 'Αυτό', lexeme: 'autos', slot: qslot('n', 'sg', 'nom'), agreesWith: 2 },
+    { ...article('n', 'nom', 2), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('This', 0), u('house', 2)],
+    [u('this', 0), u('the', 1), u('house', 2)],
+    [u('Această', 0), u('casă', 2)],
+    [u('această', 0), u('casă', 2)],
+  ),
+  verified: false,
+};
+
+const thatDog: Phrase = {
+  id: 'that-dog',
+  title: 'That dog',
+  theme: 'Pointing',
+  level: 'beginner',
+  tokens: [
+    { text: 'Εκείνος', lexeme: 'ekeinos', slot: qslot('m', 'sg', 'nom'), agreesWith: 2 },
+    { ...article('m', 'nom', 2), text: 'ο' },
+    { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('That', 0), u('dog', 2)],
+    [u('that', 0), u('the', 1), u('dog', 2)],
+    [u('Acel', 0), u('câine', 2)],
+    [u('acel', 0), u('câine', 2)],
+  ),
+  verified: false,
+};
+
+const theseHouses: Phrase = {
+  id: 'these-houses',
+  title: 'These houses',
+  theme: 'Pointing',
+  level: 'improver',
+  tokens: [
+    { text: 'Αυτά', lexeme: 'autos', slot: qslot('n', 'pl', 'nom'), agreesWith: 2 },
+    { ...pluralArticle('n', 2), text: 'τα' },
+    { text: 'σπίτια', lexeme: 'spiti', slot: { pos: 'noun', number: 'pl', case: 'nom' } },
+  ],
+  glosses: rows(
+    [u('These', 0), u('houses', 2)],
+    [u('these', 0), u('the', 1), u('houses', 2)],
+    [seg(['Case', 2], ['le', 1]), u('acestea', 0)],
+    [seg(['case', 2], ['le', 1]), u('acestea', 0)],
+  ),
+  verified: false,
+};
+
+const thisIsMyHouse: Phrase = {
+  id: 'this-is-my-house',
+  title: 'This is my house',
+  theme: 'Pointing',
+  level: 'improver',
+  tokens: [
+    { text: 'Αυτό', lexeme: 'autos', slot: qslot('n', 'sg', 'nom', { use: 'pronoun' }), agreesWith: 3 },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { ...article('n', 'nom', 3), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 3 },
+  ],
+  glosses: rows(
+    [u('This', 0), u('is', 1), u('my', 4), u('house', 3)],
+    [u('this', 0), u('is', 1), u('the', 2), u('house', 3), u('my', 4)],
+    [u('Aceasta', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('mea', 4)],
+    [u('aceasta', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('mea', 4)],
+  ),
+  verified: false,
+};
+
+const hereIsTheHouse: Phrase = {
+  id: 'here-is-the-house',
+  title: 'Here is the house',
+  theme: 'Pointing',
+  level: 'beginner',
+  tokens: [
+    { text: 'Εδώ', lexeme: 'edo', slot: adverb },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { ...article('n', 'nom', 3), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('Here', 0), u('is', 1), u('the', 2), u('house', 3)],
+    [u('here', 0), u('is', 1), u('the', 2), u('house', 3)],
+    [u('Aici', 0), u('este', 1), seg(['cas', 3], ['a', 2])],
+    [u('aici', 0), u('este', 1), seg(['cas', 3], ['a', 2])],
+  ),
+  verified: false,
+};
+
+const asFarAsThere: Phrase = {
+  id: 'as-far-as-there',
+  title: 'As far as there',
+  theme: 'Pointing',
+  level: 'improver',
+  tokens: [
+    { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 },
+    { text: 'εκεί', lexeme: 'ekei', slot: adverb },
+  ],
+  glosses: rows(
+    [u('As far as', 0), u('there', 1)],
+    [u('until', 0), u('there', 1)],
+    [u('Până', 0), u('acolo', 1)],
+    [u('până', 0), u('acolo', 1)],
+  ),
+  verified: false,
+};
+
+const suchAHouse: Phrase = {
+  id: 'such-a-house',
+  title: 'Such a house',
+  theme: 'Pointing',
+  level: 'improver',
+  tokens: [
+    { text: 'Ένα', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'n', case: 'nom' }, agreesWith: 2 },
+    { text: 'τέτοιο', lexeme: 'tetoios', slot: qslot('n', 'sg', 'nom'), agreesWith: 2 },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('Such', 1), u('a', 0), u('house', 2)],
+    [u('a', 0), u('such', 1), u('house', 2)],
+    [u('O', 0), u('asemenea', 1), u('casă', 2)],
+    [u('o', 0), u('asemenea', 1), u('casă', 2)],
+  ),
+  verified: false,
+};
+
+const soMuchBread: Phrase = {
+  id: 'so-much-bread',
+  title: 'I have so much bread',
+  theme: 'Pointing',
+  level: 'improver',
+  tokens: [
+    { text: 'Έχω', lexeme: 'echo', slot: verbSlot(1) },
+    { text: 'τόσο', lexeme: 'tosos', slot: qslot('n', 'sg', 'acc'), agreesWith: 2 },
+    { text: 'ψωμί', lexeme: 'psomi', slot: accSg },
+  ],
+  glosses: rows(
+    [u('I have', 0), u('so much', 1), u('bread', 2)],
+    [u('(I)', null), u('have', 0), u('so much', 1), u('bread', 2)],
+    [u('Am', 0), u('atâta', 1), u('pâine', 2)],
+    [u('(Eu)', null), u('am', 0), u('atâta', 1), u('pâine', 2)],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1645,3 +1807,11 @@
   theChildsHouse,
   theChildsDog,
+  thisHouse,
+  thatDog,
+  theseHouses,
+  thisIsMyHouse,
+  hereIsTheHouse,
+  asFarAsThere,
+  suchAHouse,
+  soMuchBread,
 ];
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -402,4 +402,17 @@
     }
     if (!offeredCases(lexeme).includes(token.slot.case)) errors.push(`${where}: ${lexeme.id} does not offer the ${token.slot.case} role`);
+    if (token.slot.register) errors.push(`${where}: the spoken register is a Romanian form, not part of a Greek token`);
+    if (token.slot.use === 'determiner' && target?.slot.pos === 'noun' && token.agreesWith !== undefined) {
+      const beside = (t: Token, pos: string) => t.slot.pos === pos && t.agreesWith === token.agreesWith;
+      const nounLexeme = lexemes[target.lexeme];
+      // αυτός and εκείνος keep the article of the noun (αυτό το σπίτι); τέτοιος takes ένα in the singular with a count noun.
+      if ((lexeme.demonstrative === 'near' || lexeme.demonstrative === 'far') && !phrase.tokens.some((t) => beside(t, 'article') && t.lexeme === 'def')) {
+        errors.push(`${where}: ${lexeme.lemma} beside a noun needs the definite article of that noun`);
+      }
+      if (lexeme.demonstrative === 'such' && token.slot.number === 'sg' && nounLexeme?.pos === 'noun' && !nounLexeme.mass) {
+        const one = phrase.tokens.some((t) => beside(t, 'numeral') && t.slot.pos === 'numeral' && t.slot.value === 1);
+        if (!one) errors.push(`${where}: τέτοιος in the singular needs ένα before it`);
+      }
+    }
     if (token.slot.sense === 'few' && !lexeme.ro.few) errors.push(`${where}: ${lexeme.id} has no "few" sense`);
     try {
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1361 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.pointing.test.tsx src/data/phrases-pointing.test.ts src/validate/demonstrative-validate.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/validate/validate.ts
git commit -m "feat: phrases 73 to 80 (demonstratives and place words)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Comparison notes and the review sheet

**Files:**
- Create (test): `src/data/divergences-demonstrative.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences`, `interrogativeLines` and `lexemeSection` in `src/validate/reviewSheet.ts`, and `buildPanel`.
- Produces: The divergence rows `demonstrative-article`, `demonstrative-placement`, `demonstrative-neuter`, `demonstrative-he`, `demonstrative-spoken`, `such-so` and `place-words`; review-sheet sections that print every noun with each demonstrative (from the panel's own row) and the place words with the Romanian words after each preposition.

Two notes are Improver rows (`demonstrative-he`, `demonstrative-spoken`); the rest show at Beginner too. The review sheet is written to `review/content-review.md`, which is git-ignored.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-demonstrative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

/** The notes of this plan; a quantifier also shows the general quantifier notes. */
const NEW = ['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-he', 'demonstrative-spoken', 'such-so', 'place-words'];
const ids = (pos: 'quantifier' | 'adverb', lexeme: string, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, pos, lexeme, level).map((d) => d.id).filter((id) => NEW.includes(id));

describe('the comparison notes for the demonstratives', () => {
  it('αυτός shows five notes in Improver and three in Beginner', () => {
    expect(ids('quantifier', 'autos')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-he', 'demonstrative-spoken']);
    expect(ids('quantifier', 'autos', 'beginner')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter']);
  });

  it('εκείνος has the same notes except "this and he"', () => {
    expect(ids('quantifier', 'ekeinos')).toEqual(['demonstrative-article', 'demonstrative-placement', 'demonstrative-neuter', 'demonstrative-spoken']);
  });

  it('τέτοιος and τόσος share one note, and the place words have one', () => {
    expect(ids('quantifier', 'tetoios')).toContain('such-so');
    expect(ids('quantifier', 'tosos')).toContain('such-so');
    expect(ids('quantifier', 'polys')).not.toContain('such-so');
    expect(ids('adverb', 'edo')).toEqual(['place-words']);
    expect(ids('adverb', 'ekei', 'beginner')).toEqual(['place-words']);
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => NEW.includes(d.id));
    expect(rows).toHaveLength(7);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
```

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -129,4 +129,21 @@
   });
 
+  it('shows the demonstratives with every noun, in both Romanian registers', () => {
+    expect(sheet).toContain('αυτό το σπίτι · această casă / casa aceasta · this house');
+    expect(sheet).toContain('αυτού του σπιτιού · acestei case / casei acesteia · of this house');
+    expect(sheet).toContain('αυτό το σπίτι · casa asta · this house');
+    expect(sheet).toContain('εκείνος ο σκύλος · acel câine / câinele acela · that dog');
+    expect(sheet).toContain('ένα τέτοιο σπίτι · o asemenea casă · such a house');
+    expect(sheet).toContain('τέτοιο ψωμί · asemenea pâine · such bread');
+    expect(sheet).toContain('τόσο ψωμί · atâta pâine · so much bread');
+  });
+
+  it('shows the place words: the example and the Romanian words after each preposition', () => {
+    expect(sheet).toContain('Example: Ελληνικά: Εδώ είναι το σπίτι; Română: Aici este casa; English: Here is the house');
+    expect(sheet).toContain('after από (stored): από εδώ: de aici');
+    expect(sheet).toContain('after μέχρι (stored): μέχρι εκεί: până acolo');
+    expect(sheet).toContain('after με (generated): με εδώ: cu aici');
+  });
+
   it('says how many records are unverified', () => {
     expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-demonstrative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -867,3 +867,80 @@
     verified: false,
   },
+  {
+    id: 'demonstrative-article',
+    appliesTo: { pos: 'quantifier', lexeme: ['autos', 'ekeinos'] },
+    point: 'The article after the demonstrative',
+    el: 'keeps the article: αυτό το σπίτι',
+    ro: 'no article before the noun (această casă); the article stays on the noun after it (casa aceasta)',
+    en: 'no article: this house',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'demonstrative-placement',
+    appliesTo: { pos: 'quantifier', lexeme: ['autos', 'ekeinos'] },
+    point: 'Where the demonstrative goes',
+    el: 'before the noun: αυτό το σπίτι',
+    ro: 'before the noun (acest copil) or after it, with the article (copilul acesta)',
+    en: 'before the noun: this child',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'demonstrative-neuter',
+    appliesTo: { pos: 'quantifier', lexeme: ['autos', 'ekeinos'] },
+    point: 'This, of a thing',
+    el: 'the neuter αυτό for "this" of any thing: Αυτό είναι το σπίτι μου',
+    ro: 'agrees with the thing: Aceasta este casa mea, Acesta este câinele meu',
+    en: '"this" never changes: This is my house',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'demonstrative-he',
+    appliesTo: { pos: 'quantifier', lexeme: 'autos' },
+    point: 'This and he',
+    el: 'αυτός is also "he" (the strong pronoun): Αυτός έρχεται',
+    ro: 'acesta can mean "he" in formal speech; the ordinary pronoun is el',
+    en: '"this" is never "he"; the pronoun is he',
+    tag: 'differs',
+    level: 'extra',
+    verified: false,
+  },
+  {
+    id: 'demonstrative-spoken',
+    appliesTo: { pos: 'quantifier', lexeme: ['autos', 'ekeinos'] },
+    point: 'Spoken forms',
+    el: 'no spoken pair: αυτός and εκείνος are used in every register',
+    ro: 'spoken ăsta, asta, ăla, aia go after the noun: casa asta',
+    en: 'this and that in every register',
+    tag: 'absent',
+    level: 'extra',
+    verified: false,
+  },
+  {
+    id: 'such-so',
+    appliesTo: { pos: 'quantifier', lexeme: ['tetoios', 'tosos'] },
+    point: 'Such and so much',
+    el: 'τέτοιος and τόσος decline: ένα τέτοιο σπίτι, τόσα σπίτια',
+    ro: 'asemenea does not change (o asemenea casă); atâta, atâția, atâtea agree with the noun',
+    en: '"such" and "so" do not change: such a house, so many houses',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'place-words',
+    appliesTo: { pos: 'adverb' },
+    point: 'Here and there',
+    el: 'εδώ and εκεί never change; a preposition can come before them: από εδώ, μέχρι εκεί',
+    ro: 'aici and acolo never change: de aici, până acolo',
+    en: '"here" and "there" never change: from here, as far as there',
+    tag: 'same',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -11,7 +11,9 @@
 import { RECIPIENTS } from '../engine/objects';
 import { nounPhrase, ownAlone, ownPhrase } from '../engine/agree';
+import { offeredCases } from '../engine/quantifier';
+import { buildPanel } from '../panels/panels';
 import { POSSESSORS } from '../engine/possessive';
 import { RO_ALONE, RO_OWN, RO_POSSESSIVES } from '../data/possessives';
-import type { Clitic, GreekAdjective, GreekInterrogative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
+import type { Clitic, GreekAdjective, GreekAdverb, GreekInterrogative, GreekQuantifier, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
 import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
@@ -117,8 +119,7 @@
 }
 
-/** A question word: its example, its answer use, the fused Romanian words after a preposition, and the pairs Romanian builds. */
-function interrogativeLines(l: GreekInterrogative, lexemes: Record<string, GreekLexeme>): string[] {
-  const example = (e: { el: string; ro: string; en: string }) => `${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`;
-  const pairs = Object.values(lexemes)
+/** The Romanian words after each preposition: the stored one where Romanian fuses the pair, else the generated pair. */
+function prepositionPairs(l: GreekInterrogative | GreekAdverb, lexemes: Record<string, GreekLexeme>): string[] {
+  return Object.values(lexemes)
     .flatMap((p) => (p.pos === 'preposition' && !p.fused ? [p] : []))
     .map((p) =>
@@ -127,4 +128,10 @@
         : `- ${LANG_NAME.ro} after ${p.lemma} (generated): ${p.lemma} ${l.lemma}: ${p.ro} ${l.ro}`,
     );
+}
+
+/** A question word: its example, its answer use, the fused Romanian words after a preposition, and the pairs Romanian builds. */
+function interrogativeLines(l: GreekInterrogative, lexemes: Record<string, GreekLexeme>): string[] {
+  const example = (e: { el: string; ro: string; en: string }) => `${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`;
+  const pairs = prepositionPairs(l, lexemes);
   return [
     `- Question: ${example(l.question)}`,
@@ -134,4 +141,34 @@
 }
 
+/** A place word: its example and the Romanian words after each preposition. */
+function adverbLines(l: GreekAdverb, lexemes: Record<string, GreekLexeme>): string[] {
+  const e = l.example;
+  return [`- Example: ${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`, ...prepositionPairs(l, lexemes)];
+}
+
+/**
+ * A demonstrative with every noun, in the three languages: the "with a noun" row of its panel, which is what the app
+ * shows (spec 9, 25). The genitive and the spoken Romanian forms are printed where the lexeme has them.
+ */
+function demonstrativeLines(q: GreekQuantifier, lexemes: Record<string, GreekLexeme>): string[] {
+  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
+  const line = (noun: GreekNoun, number: 'sg' | 'pl', c: 'nom' | 'gen', register?: 'spoken') => {
+    const slot: SlotOf<'quantifier'> = { pos: 'quantifier', gender: noun.gender, number, case: c, degree: 'plain', use: 'determiner', ...(register ? { register } : {}) };
+    const row = buildPanel({ slot, noun: noun.id, nounNumber: number }, { text: '', lexeme: q.id, slot }, 'beginner').rows[0];
+    return `${richText(row.el)} · ${richText(row.ro)} · ${richText(row.en)}`;
+  };
+  return nouns.flatMap((noun) =>
+    (['sg', 'pl'] as const).flatMap((number) => {
+      if (!q.numbers.includes(number)) return [];
+      const cases = (['nom', 'gen'] as const).filter((c) => offeredCases(q).includes(c));
+      return [
+        `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}):`,
+        ...cases.map((c) => `  - ${c === 'nom' ? 'nominative' : 'genitive'}: ${line(noun, number, c)}`),
+        ...(q.ro.spoken ? [`  - spoken: ${line(noun, number, 'nom', 'spoken')}`] : []),
+      ];
+    }),
+  );
+}
+
 /** A preposition that fuses with the article (σε): the six fused forms, the στη rule and each meaning with its example. */
 function prepositionLines(l: GreekPreposition): string[] {
@@ -240,4 +277,6 @@
       ...otherLines(l),
       ...(l.pos === 'interrogative' ? interrogativeLines(l, lexemes) : []),
+      ...(l.pos === 'adverb' ? adverbLines(l, lexemes) : []),
+      ...(l.pos === 'quantifier' && l.demonstrative ? demonstrativeLines(l, lexemes) : []),
       ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
       ...(l.pos === 'possessive' ? possessiveLines(lexemes) : []),
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1367 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-demonstrative.test.ts src/data/divergences.ts src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: comparison notes and review-sheet sections for demonstratives and place words

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 5.
- Produces: a spec that matches what was built (τόσος offers the subject and object only; the slot, validator and preposition decisions) and records it in section 25.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:70])
    s = s.replace(old, new, 1)


sub('| Genitive plural *atâtor*; the singular genitive is not covered. |', '| Subject and object only, like πόσος. |')
s = s.rstrip() + """
| Slot and data | A quantifier slot gains `register` (the spoken Romanian forms); a quantifier lexeme gains `demonstrative` (near, far, such or amount), `uses` and `ro.spoken`; the `pronoun` cells of the Romanian and English data are optional, because τέτοιος has no stand-alone use | 4.2 |
| τόσος and τέτοιος | τόσος offers the subject and object only, like πόσος; τέτοιος with a mass noun takes no ένα and, in Romanian, no article word (τέτοιο ψωμί, *asemenea pâine*, "such bread") | 5.3 |
| Prepositions | από and μέχρι govern a place word as they govern a question word; `roAfter` stores *de aici*, *de acolo*, *până aici* and *până acolo*; σε takes nouns only | 5.3 |
| Validator | αυτός and εκείνος beside a noun need the definite article of that noun; τέτοιος in the singular needs ένα unless the noun is mass; a Greek token never carries the spoken register; a preposition may name a place word | 7 |
| Plan 12 built | αυτός, εκείνος, τέτοιος and τόσος, the Romanian form control, the adverb part of speech (εδώ, εκεί), phrases 73 to 80 (80 in all), seven notes, and the review-sheet sections; the manner adverbs and the other demonstratives listed above are not covered | 25 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "Plan 12 built" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Subject and object only, like πόσος." docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: two numbers, each `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 12 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.2, 4.3, 6.3: the forms of αυτός, εκείνος, τέτοιος and τόσος; the Romanian before-noun, after-noun and spoken sets; the English forms | 1 |
| 5.3: the demonstrative panel (noun, role, how many, Romanian form; "with a noun" with the article kept; "on its own"; gender × role in Improver) | 2 |
| 5.3: the place-word panel and the preposition panel with a place word | 3 |
| 4.4, 7: the article beside αυτός and εκείνος, ένα beside τέτοιος, the place word after a preposition | 4 |
| 6.1: phrases 73 to 80 and the theme *Pointing* | 4 |
| 5.2: demonstrative-article, demonstrative-placement, demonstrative-neuter, demonstrative-he, demonstrative-spoken, such-so, place-words | 5 |
| 9: the review additions (every noun with each demonstrative; the place words and their prepositions) | 5 |
| 25: the decisions, and the narrowing of τόσος | 6 |
| Not covered: τούτος, the three-way near / far / by-you distinction, έτσι, *același*, *cel*, the spoken genitive, a stand-alone τέτοιος | |
