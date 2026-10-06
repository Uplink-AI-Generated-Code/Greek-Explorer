# Free Relatives Implementation Plan (Plan 14)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the free relatives ό,τι ("what", "whatever"), όπου ("where", "wherever") and όποιος ("whoever", "whichever"): the words, their panels with the Romanian *ce / orice*, *unde / oriunde*, *oricine / orice* and the English counterparts, two comparison notes and phrases 90 to 94. This finishes the relative pronouns (spec 26).

**Architecture:** όποιος declines, so it is one more quantifier lexeme (flagged `free`), reusing the quantifier engine, panel and validator with the Greek forms of ποιος. ό,τι and όπου never change, so they are a small new part of speech, the free relative, shaped like the place words: one lexeme stores both readings (Romanian *orice* / *ce*, English whatever / what) and an example of each, and the panel shows them side by side.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 5.2, 5.3, 6.1, 7, 9 and 26; the repository is at commit 0739031 or later when this plan starts).

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

1. **όποιος is a quantifier lexeme** (id `free-opoios`, flag `free`): the Greek table `opoiosFree` (όποιος, όποια, όποιο; accusative όποιον; plural όποιοι, όποιες, όποια) with the stress on the first syllable, the subject and object only (as for ποιος), both uses (beside a noun, on its own) and the plain "How many?" control. It has no mass or count reading. Romanian says *orice* beside a noun and *oricine* on its own, for every gender and number; English whichever and whoever.
2. **ό,τι and όπου are a new part of speech,** `freeRelative` (ids `free-oti`, `free-opou`), not the place words (which take prepositions) and not the question words (which are questions). A lexeme stores the Romanian and English word of each reading (*orice* / *ce*, whatever / what; *oriunde* / *unde*, wherever / where), a meaning and an example of each reading.
3. **A token does not choose a reading.** The Greek word is the same in both; the gloss of a phrase shows which one it is (*Orice vrei*, *Ce am*). The panel shows both readings in its rows.
4. **The panel** has no controls: rows for the "-ever" reading, the plain reading and an example of each.
5. **Phrases.** 90 to 94, one more than the spec's sketch (90 to 92): *Ό,τι έχω / Ce am* and *Εκεί όπου είναι το σπίτι / Acolo unde este casa* show the plain readings. The Romanian for *Όποιος θέλει* is *Oricine vrea* (the pronoun the panel shows; the spec said *Cine vrea*). 90 and 91 are Beginner, the others Improver. They stay in the theme *Relative clauses*. Task 5 corrects the spec.
6. **The review sheet** reuses the demonstrative section for όποιος (every noun beside it) and prints both readings and the examples for ό,τι and όπου.
7. **Delivery.** With this plan the picker lists 94 phrases.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `GreekQuantifier.free`; the table name `opoiosFree`; `GreekFreeRelative`; the slot `{ pos: 'freeRelative' }` |
| `src/data/{paradigms,lexemes,phrases,divergences}.ts` | the table `opoiosFree`; the lexemes `free-opoios`, `free-oti`, `free-opou`; phrases 90 to 94; two comparison rows |
| `src/engine/greek.ts` | `inflectFreeRelative` and the `inflect` case |
| `src/panels/{quantifier,free-relative,panels}.ts` | the free-relative badge and labels for όποιος; the free-relative panel; `buildPanel` and the `case` exclusion |
| `src/validate/{validate,reviewSheet}.ts` | the free-relative lexeme checks and slot; the review-sheet sections |
| tests | one new test file per task, plus the picker order test |

---

### Task 1: όποιος, the free relative that declines

**Files:**
- Create (test): `src/engine/free-opoios.test.ts`
- Create (test): `src/panels/free-opoios.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/paradigms.ts`
- Modify: `src/panels/quantifier.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `GreekQuantifier`, `QUANTIFIER_FORMS` and its `onStem` helper, `quantifierPanel`, `validate` and `quantifierSlots`.
- Produces: `GreekQuantifier.free`; the table `opoiosFree`; the lexeme `free-opoios`; the panel for it (badge "free relative", the "How many?" control, no mass or count sentence); the validator rule that a free relative offers the subject and object only.

This task is a quantifier like ποιος. It needs no phrase; the phrases are Task 3.

- [ ] **Step 1: Write the tests**

Create `src/engine/free-opoios.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES, getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = getLexeme('free-opoios') as GreekQuantifier;
const slot = (gender: Gender, number: Num, c: Case, use: SlotOf<'quantifier'>['use'] = 'determiner'): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender,
  number,
  case: c,
  degree: 'plain',
  use,
});

describe('όποιος, the free relative', () => {
  it('is an unverified quantifier flagged free, offered as a subject or an object', () => {
    expect(q.free).toBe(true);
    expect(q.cases).toEqual(['nom', 'acc']);
    expect(q.verified).toEqual({ el: false, ro: false, en: false });
    expect(quantifierSlots(q)).toHaveLength(24);
    expect(quantifierSlots(q).every((s) => s.case !== 'gen' && s.register === undefined)).toBe(true);
  });

  it('declines like ποιος, with the stress on the first syllable', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'nom'), slot('m', 'sg', 'acc'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'acc'),
      slot('m', 'pl', 'nom'), slot('f', 'pl', 'nom'), slot('n', 'pl', 'nom'), slot('m', 'pl', 'acc'), slot('f', 'pl', 'acc'), slot('n', 'pl', 'acc'),
    ].map((s) => formText(inflectQuantifier(q, s)));
    expect(forms).toEqual(['όποιος', 'όποια', 'όποιο', 'όποιον', 'όποια', 'όποιο', 'όποιοι', 'όποιες', 'όποια', 'όποιους', 'όποιες', 'όποια']);
  });

  it('Romanian says orice beside a noun and oricine on its own, whatever the gender', () => {
    for (const g of ['m', 'f'] as const) {
      for (const n of ['sg', 'pl'] as const) {
        expect(roQuantifier(q, slot(g, n, 'nom'), g)).toBe('orice');
        expect(roQuantifier(q, slot(g, n, 'acc', 'pronoun'), g)).toBe('oricine');
      }
    }
  });

  it('English says whichever beside a noun and whoever on its own', () => {
    expect(enQuantifier(q, slot('m', 'sg', 'nom'))).toBe('whichever');
    expect(enQuantifier(q, slot('m', 'pl', 'nom', 'pronoun'))).toBe('whoever');
  });

  it('validates, and wants the subject and object only', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    const bad = { ...LEXEMES, 'free-opoios': { ...q, cases: undefined } };
    expect(validate({ lexemes: bad, phrases: [] })).toContain('lexeme free-opoios: a free relative offers the subject and object roles only');
  });
});
```

Create `src/panels/free-opoios.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'n',
  number: 'sg',
  case: 'acc',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
const stateOf = (slot: SlotOf<'quantifier'>, noun: string): PanelState => ({ slot, noun, nounNumber: slot.number });
const panelFor = (state: PanelState, level: Level = 'beginner') => buildPanel(state, { text: '', lexeme: 'free-opoios', slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({ el: richText(p.rows[i].el), ro: richText(p.rows[i].ro), en: richText(p.rows[i].en) });

describe('the free relative όποιος in its panel', () => {
  it('shows whichever beside a noun and whoever on its own', () => {
    const p = panelFor(stateOf(slotOf(), 'psomi'));
    expect(p.lemma).toBe('όποιος / όποια / όποιο');
    expect(p.badge).toBe('free relative');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p, 0)).toEqual({ el: 'όποιο ψωμί', ro: 'orice pâine', en: 'whichever bread' });
    expect(cells(p, 1)).toEqual({ el: 'όποιο', ro: 'oricine', en: 'whoever' });
  });

  it('agrees with the noun in gender and number, and takes the plural', () => {
    const dog = panelFor(applyControl(stateOf(slotOf(), 'psomi'), 'noun', 'skylos'));
    expect(cells(dog, 0).el).toBe('όποιον σκύλο');
    const plural = panelFor(applyControl(stateOf(slotOf({ gender: 'm' }), 'skylos'), 'number', 'pl'));
    expect(cells(plural, 0)).toEqual({ el: 'όποιους σκύλους', ro: 'orice câini', en: 'whichever dogs' });
  });

  it('offers the noun, the role (subject and object) and how many, like ποιος', () => {
    const p = panelFor(stateOf(slotOf(), 'psomi'), 'improver');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'case', 'number']);
    expect(p.controls[1].options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(p.posLabel).toBe('free relative · declines like ποιος');
    expect(p.full).toHaveLength(6);
  });

  it('does not talk about a mass or a count reading', () => {
    expect(panelFor(stateOf(slotOf(), 'psomi')).plain).toContain('whoever');
    expect(panelFor(stateOf(slotOf(), 'psomi')).plain).not.toContain('mass reading');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/free-opoios.test.ts src/panels/free-opoios.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -704,4 +704,25 @@
 };
 
+const freeOpoios: GreekQuantifier = {
+  id: 'free-opoios',
+  pos: 'quantifier',
+  lemma: 'όποιος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { table: 'opoiosFree' } },
+  numbers: ['sg', 'pl'],
+  free: true,
+  cases: ['nom', 'acc'],
+  meaning:
+    'όποιος means "whoever" on its own and "whichever" in front of a noun (όποιο ψωμί θέλεις). It changes with gender, number and role, like ποιος. Romanian splits it into oricine (whoever) and orice (whichever); English into whoever and whichever.',
+  ro: {
+    lemma: 'oricine',
+    plain: {
+      determiner: { m: { sg: ro1('orice'), pl: ro1('orice') }, f: { sg: ro1('orice'), pl: ro1('orice') } },
+      pronoun: { m: { sg: ro1('oricine'), pl: ro1('oricine') }, f: { sg: ro1('oricine'), pl: ro1('oricine') } },
+    },
+  },
+  en: { plain: { determiner: { sg: 'whichever', pl: 'whichever' }, pronoun: { sg: 'whoever', pl: 'whoever' } } },
+};
+
 const INDICATIVE_ALL: Tense[] = [
   'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
@@ -1495,4 +1516,5 @@
   [tetoios.id]: tetoios,
   [tosos.id]: tosos,
+  [freeOpoios.id]: freeOpoios,
   [thelo.id]: thelo,
   [pidao.id]: pidao,
```

Change `src/data/paradigms.ts` (unified diff):

```diff
@@ -235,5 +235,11 @@
  * κάποιος keeps the final ν of the masculine accusative; κανένας follows the numeral ένας; πολύς has two stems.
  */
-export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios', PairTable> = {
+export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios' | 'opoiosFree', PairTable> = {
+  /** όποιος (whoever) declines like ποιος, with the stress on the first syllable of the stem. */
+  opoiosFree: onStem(
+    'όποι',
+    [['ος', 'α', 'ο'], ['ον', 'α', 'ο'], ['ου', 'ας', 'ου']],
+    [['οι', 'ες', 'α'], ['ους', 'ες', 'α'], ['ων', 'ων', 'ων']],
+  ),
   /** αυτός keeps the stress on the ending and the final ν of the accusative (αυτόν, αυτήν). */
   autos: onStem(
```

Change `src/panels/quantifier.ts` (unified diff):

```diff
@@ -125,5 +125,5 @@
   if (q.numbers.length > 1) {
     list.push(
-      q.question === 'who' || (q.demonstrative && q.demonstrative !== 'amount')
+      q.question === 'who' || q.free || (q.demonstrative && q.demonstrative !== 'amount')
         ? numberControl(slot.number)
         : { key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' },
@@ -150,4 +150,5 @@
 
 function improverLabel(q: GreekQuantifier): string {
+  if (q.free) return 'free relative · declines like ποιος';
   if (q.demonstrative) return DEMONSTRATIVE_LABEL[q.demonstrative];
   const how = q.greek.plain;
@@ -210,9 +211,11 @@
     posLabel:
       level === 'beginner'
-        ? `${q.question ? 'question word' : q.demonstrative ? 'demonstrative' : 'quantifier'}: ${enBeside(q, { ...det, degree: 'plain', sense: undefined, register: undefined }, noun)}`
+        ? `${q.question ? 'question word' : q.free ? 'free relative' : q.demonstrative ? 'demonstrative' : 'quantifier'}: ${enBeside(q, { ...det, degree: 'plain', sense: undefined, register: undefined }, noun)}`
         : improverLabel(q),
     badge: q.question
       ? 'question word'
-      : q.demonstrative
+      : q.free
+        ? 'free relative'
+        : q.demonstrative
         ? 'demonstrative'
         : q.numbers.length > 1
@@ -226,5 +229,5 @@
     plain:
       q.meaning +
-      (q.numbers.length > 1 && q.question !== 'who' && (!q.demonstrative || q.demonstrative === 'amount')
+      (q.numbers.length > 1 && q.question !== 'who' && !q.free && (!q.demonstrative || q.demonstrative === 'amount')
         ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
         : '') +
```

Change `src/types.ts` (unified diff):

```diff
@@ -177,5 +177,5 @@
  * (the stem-stressed endings, or the ending-stressed ones when `stressed` is set: μερικός, μερικοί).
  */
-export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios' } | { stem: string; stressed?: true };
+export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' | 'autos' | 'ekeinos' | 'tetoios' | 'opoiosFree' } | { stem: string; stressed?: true };
 
 /** One Romanian cell: nominative-accusative and genitive-dative. `gen` is absent where the form is not covered (a stand-alone genitive pronoun, spec 6.3). */
@@ -207,4 +207,6 @@
   /** A demonstrative (αυτός, εκείνος, τέτοιος, τόσος): the article follows the near and far ones, and ένα goes before τέτοιος (spec 25). */
   demonstrative?: DemonstrativeKind;
+  /** A free relative (όποιος: whoever, whichever): a relative word with no noun to refer to (spec 26). */
+  free?: true;
   /** The uses the panel may offer; absent means both (τέτοιος has no stand-alone use). */
   uses?: QuantifierUse[];
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -297,4 +297,7 @@
       errors.push(`lexeme ${l.id}: a question word offers the subject and object roles only`);
     }
+    if (l.free && !(l.cases?.length === 2 && l.cases.includes('nom') && l.cases.includes('acc'))) {
+      errors.push(`lexeme ${l.id}: a free relative offers the subject and object roles only`);
+    }
     for (const slot of quantifierSlots(l)) {
       const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1442 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/free-opoios.test.ts src/panels/free-opoios.test.ts src/data/lexemes.ts src/data/paradigms.ts src/panels/quantifier.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the free relative όποιος (whoever, whichever)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: ό,τι and όπου: the free-relative part of speech

**Files:**
- Create: `src/panels/free-relative.ts`
- Create (test): `src/panels/free-relative.test.ts`
- Create (test): `src/validate/free-relative-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `GreekAdverb` and its panel as the model, `buildPanel`, `applyControl`, `inflect`, `slotsFor` and `validate`.
- Produces: `GreekFreeRelative`, the slot `{ pos: 'freeRelative' }`, `inflectFreeRelative`; the lexemes `free-oti` and `free-opou`; `freeRelativePanel` (rows for the two readings and an example of each, no controls); the validator's free-relative checks.

Each lexeme stores both readings; the Greek word is the same in both, so the panel is where the contrast is shown.

- [ ] **Step 1: Write the tests**

Create `src/panels/free-relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { formText, richText } from '../engine/segments';
import type { GreekFreeRelative, Token } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const state: PanelState = { slot: { pos: 'freeRelative' }, noun: null, nounNumber: 'sg' };
const token = (lexeme: string): Token => ({ text: lexeme, lexeme, slot: { pos: 'freeRelative' } });
const panelOf = (lexeme: string, level: 'beginner' | 'improver' = 'beginner') => buildPanel(state, token(lexeme), level);
const cells = (p: ReturnType<typeof panelOf>, i: number) => ({ el: richText(p.rows[i].el), ro: richText(p.rows[i].ro), en: richText(p.rows[i].en) });

describe('the free relatives ό,τι and όπου', () => {
  it('are unverified lexemes that never change', () => {
    for (const id of ['free-oti', 'free-opou']) {
      const lexeme = getLexeme(id) as GreekFreeRelative;
      expect(lexeme.pos).toBe('freeRelative');
      expect(lexeme.verified).toEqual({ el: false, ro: false, en: false });
      expect(formText(inflect(lexeme, { pos: 'freeRelative' }))).toBe(lexeme.lemma);
    }
    expect([getLexeme('free-oti').lemma, getLexeme('free-opou').lemma]).toEqual(['ό,τι', 'όπου']);
  });

  it('ό,τι: one Greek word, two Romanian and two English words', () => {
    const p = panelOf('free-oti');
    expect(p.lemma).toBe('ό,τι');
    expect(p.posLabel).toBe('free relative: whatever');
    expect(p.controls).toEqual([]);
    expect(p.rows.map((r) => r.label)).toEqual(['whatever', 'what', 'in a sentence (whatever)', 'in a sentence (what)']);
    expect(cells(p, 0)).toEqual({ el: 'ό,τι', ro: 'orice', en: 'whatever' });
    expect(cells(p, 1)).toEqual({ el: 'ό,τι', ro: 'ce', en: 'what' });
    expect(cells(p, 2)).toEqual({ el: 'Ό,τι θέλεις', ro: 'Orice vrei', en: 'Whatever you want' });
    expect(cells(p, 3)).toEqual({ el: 'Ό,τι έχω', ro: 'Ce am', en: 'What I have' });
  });

  it('όπου: where and wherever, unde and oriunde', () => {
    const p = panelOf('free-opou', 'improver');
    expect(p.posLabel).toBe('free relative · never changes');
    expect(cells(p, 0)).toEqual({ el: 'όπου', ro: 'oriunde', en: 'wherever' });
    expect(cells(p, 1)).toEqual({ el: 'όπου', ro: 'unde', en: 'where' });
    expect(cells(p, 2)).toEqual({ el: 'Όπου πας', ro: 'Oriunde mergi', en: 'Wherever you go' });
    expect(cells(p, 3)).toEqual({ el: 'Εκεί όπου είναι το σπίτι', ro: 'Acolo unde este casa', en: 'There where the house is' });
    expect(p.full).toEqual([]);
  });

  it('have no controls to apply', () => {
    expect(applyControl(state, 'case', 'gen')).toBe(state);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
  });
});
```

Create `src/validate/free-relative-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekFreeRelative } from '../types';
import { slotsFor, validate } from './validate';

const oti = LEXEMES['free-oti'] as GreekFreeRelative;

describe('the free relatives in the validator', () => {
  it('are valid and offer one slot', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    expect(slotsFor(oti)).toEqual([{ pos: 'freeRelative' }]);
  });

  it('want every text to be filled in', () => {
    const bad = { ...LEXEMES, 'free-oti': { ...oti, ro: { ...oti.ro, ever: '' } } };
    expect(validate({ lexemes: bad, phrases: [] })).toContain('lexeme free-oti: an empty Romanian, English, meaning or example text');
    const noExample = { ...LEXEMES, 'free-opou': { ...(LEXEMES['free-opou'] as GreekFreeRelative), examples: { ever: { el: '', ro: 'x', en: 'x' }, plain: { el: 'x', ro: 'x', en: 'x' } } } };
    expect(validate({ lexemes: noExample, phrases: [] })).toContain('lexeme free-opou: an empty Romanian, English, meaning or example text');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/free-relative.test.ts src/validate/free-relative-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/panels/free-relative.ts`:

```ts
import { plain } from '../engine/segments';
import type { GreekFreeRelative, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** ό,τι and όπου: the word in each of its two readings, with an example of each (spec 5.3, 26). */
export function freeRelativePanel(word: GreekFreeRelative, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({ label, el: plain(el), ro: plain(ro), en: plain(en) });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `free relative: ${word.en.ever}` : 'free relative · never changes',
    controls: [],
    rows: [
      row(word.en.ever, word.lemma, word.ro.ever, word.en.ever),
      row(word.en.plain, word.lemma, word.ro.plain, word.en.plain),
      row(`in a sentence (${word.en.ever})`, word.examples.ever.el, word.examples.ever.ro, word.examples.ever.en),
      row(`in a sentence (${word.en.plain})`, word.examples.plain.el, word.examples.plain.ro, word.examples.plain.en),
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
+  GreekFreeRelative,
   GreekRelative,
   GreekAdverb,
@@ -1417,4 +1418,34 @@
 );
 
+const oti: GreekFreeRelative = {
+  id: 'free-oti',
+  pos: 'freeRelative',
+  lemma: 'ό,τι',
+  verified: { el: false, ro: false, en: false },
+  ro: { ever: 'orice', plain: 'ce' },
+  en: { ever: 'whatever', plain: 'what' },
+  meaning:
+    'ό,τι never changes and has no noun to refer to: it means "what" and "whatever" (Ό,τι θέλεις). Romanian has two words, ce (what) and orice (whatever); so does English. The comma and the accent tell it apart from ότι ("that") and from the question τι.',
+  examples: {
+    ever: { el: 'Ό,τι θέλεις', ro: 'Orice vrei', en: 'Whatever you want' },
+    plain: { el: 'Ό,τι έχω', ro: 'Ce am', en: 'What I have' },
+  },
+};
+
+const opou: GreekFreeRelative = {
+  id: 'free-opou',
+  pos: 'freeRelative',
+  lemma: 'όπου',
+  verified: { el: false, ro: false, en: false },
+  ro: { ever: 'oriunde', plain: 'unde' },
+  en: { ever: 'wherever', plain: 'where' },
+  meaning:
+    'όπου never changes and means "where" and "wherever" (Όπου πας). Romanian has two words, unde (where) and oriunde (wherever); so does English. It is not the question πού.',
+  examples: {
+    ever: { el: 'Όπου πας', ro: 'Oriunde mergi', en: 'Wherever you go' },
+    plain: { el: 'Εκεί όπου είναι το σπίτι', ro: 'Acolo unde este casa', en: 'There where the house is' },
+  },
+};
+
 const relPou: GreekRelative = {
   id: 'rel-pou',
@@ -1551,4 +1582,6 @@
   [posHow.id]: posHow,
   [edo.id]: edo,
+  [oti.id]: oti,
+  [opou.id]: opou,
   [relPou.id]: relPou,
   [relOpoios.id]: relOpoios,
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -31,4 +31,5 @@
   GreekAdverb,
   GreekRelative,
+  GreekFreeRelative,
   GreekVerb,
   IrregularNote,
@@ -194,4 +195,8 @@
 }
 
+export function inflectFreeRelative(l: GreekFreeRelative, _s: SlotOf<'freeRelative'>): Form {
+  return { stem: l.lemma, ending: '' };
+}
+
 export function inflect(l: GreekLexeme, s: Slot): Form {
   if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
@@ -225,4 +230,6 @@
     case 'relative':
       return inflectRelative(l as GreekRelative, s as SlotOf<'relative'>);
+    case 'freeRelative':
+      return inflectFreeRelative(l as GreekFreeRelative, s as SlotOf<'freeRelative'>);
   }
 }
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -10,4 +10,5 @@
   GreekAdjective,
   GreekAdverb,
+  GreekFreeRelative,
   GreekRelative,
   GreekConjunction,
@@ -42,4 +43,5 @@
 import { possessivePanel } from './possessive';
 import { adverbPanel } from './adverb';
+import { freeRelativePanel } from './free-relative';
 import { relativePanel } from './relative';
 import { interrogativePanel } from './interrogative';
@@ -129,4 +131,6 @@
     case 'relative':
       return relativePanel(lexeme as GreekRelative, slot, state, level);
+    case 'freeRelative':
+      return freeRelativePanel(lexeme as GreekFreeRelative, level);
     case 'quantifier':
       return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
@@ -183,4 +187,5 @@
         slot.pos !== 'adverb' &&
         slot.pos !== 'relative' &&
+        slot.pos !== 'freeRelative' &&
         slot.pos !== 'clitic'
       ) {
```

Change `src/types.ts` (unified diff):

```diff
@@ -96,4 +96,5 @@
   | { pos: 'interrogative' }
   | { pos: 'adverb' }
+  | { pos: 'freeRelative' }
   | { pos: 'relative'; role: RelativeRole; gender: Gender; number: Num; preposition?: string }
   | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }
@@ -358,4 +359,19 @@
 
 /**
+ * A free relative that never changes: ό,τι (what, whatever) and όπου (where, wherever). Greek has one word where Romanian and
+ * English have two (ce / orice, unde / oriunde; what / whatever, where / wherever) (spec 26).
+ */
+export interface GreekFreeRelative extends LexemeBase {
+  pos: 'freeRelative';
+  /** The Romanian and English words for the "-ever" reading (orice, whatever) and for the plain one (ce, what). */
+  ro: { ever: string; plain: string };
+  en: { ever: string; plain: string };
+  /** One line of meaning for the panel. */
+  meaning: string;
+  /** An example for each reading, in each language. */
+  examples: { ever: { el: string; ro: string; en: string }; plain: { el: string; ro: string; en: string } };
+}
+
+/**
  * A relative pronoun: που never changes, ο οποίος agrees with the noun it refers to (spec 26). Their Romanian and English
  * words are shared tables (`src/data/relatives.ts`); the slot holds the antecedent's gender and number and the job in the clause.
@@ -435,5 +451,5 @@
 
 export type GreekLexeme =
-  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb | GreekRelative;
+  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb | GreekRelative | GreekFreeRelative;
 
 export type TokenIndex = number;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -87,4 +87,6 @@
     case 'adverb':
       return [{ pos: 'adverb' }];
+    case 'freeRelative':
+      return [{ pos: 'freeRelative' }];
     case 'relative':
       return GENDERS.flatMap((gender) =>
@@ -244,4 +246,8 @@
     }
   }
+  if (l.pos === 'freeRelative') {
+    const texts = [l.ro.ever, l.ro.plain, l.en.ever, l.en.plain, l.meaning, ...Object.values(l.examples.ever), ...Object.values(l.examples.plain)];
+    if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian, English, meaning or example text`);
+  }
   if (l.pos === 'relative') {
     if (isEmpty(l.meaning)) errors.push(`lexeme ${l.id}: an empty meaning`);
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1448 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/free-relative.test.ts src/panels/free-relative.ts src/validate/free-relative-validate.test.ts src/data/lexemes.ts src/engine/greek.ts src/panels/panels.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the free relatives ό,τι and όπου (what, whatever; where, wherever)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Free relatives in phrases 90 to 94

**Files:**
- Create (test): `src/App.free-relative.test.tsx`
- Create (test): `src/data/phrases-free-relative.test.ts`
- Modify: `src/data/phrases.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The helpers `rows`, `u`, `seg`, `present`, `verbSlot`, `qslot`, `article`, `adverb` and `nomSg` in `src/data/phrases.ts`, and the lexemes of Tasks 1 and 2.
- Produces: The phrases `whatever-you-want`, `wherever-you-go`, `whoever-wants`, `what-i-have`, `there-where-the-house-is` in the theme *Relative clauses*; the picker lists 94 phrases.

Phrase 92 uses όποιος on its own, with no noun: a stand-alone quantifier needs no `agreesWith`.

- [ ] **Step 1: Write the tests**

Create `src/App.free-relative.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('free relatives in the app', () => {
  it('opens ό,τι with both readings and an example of each', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Whatever you want');
    await user.click(screen.getByRole('button', { name: 'Ό,τι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ό,τι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'orice' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ce' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ce am' })).toBeInTheDocument();
  });

  it('opens όπου with wherever and where', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Wherever you go');
    await user.click(screen.getByRole('button', { name: 'Όπου' }));
    expect(screen.getByRole('cell', { name: 'oriunde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'unde' })).toBeInTheDocument();
  });

  it('opens όποιος like a quantifier: whoever on its own, whichever beside a noun', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Whoever wants');
    await user.click(screen.getByRole('button', { name: 'Όποιος' }));
    expect(screen.getByRole('heading', { level: 2, name: 'όποιος / όποια / όποιο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'oricine' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'psomi');
    expect(screen.getByRole('cell', { name: 'όποιο ψωμί' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'whichever bread' })).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-free-relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['whatever-you-want', 'wherever-you-go', 'whoever-wants', 'what-i-have', 'there-where-the-house-is'];
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

describe('phrases 90 to 94', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Relative clauses theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Relative clauses'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('whatever-you-want')).toEqual(['Ό,τι θέλεις', 'Whatever you want', 'Orice vrei']);
    expect(read('wherever-you-go')).toEqual(['Όπου πας', 'Wherever you go', 'Oriunde mergi']);
    expect(read('whoever-wants')).toEqual(['Όποιος θέλει', 'Whoever wants', 'Oricine vrea']);
    expect(read('what-i-have')).toEqual(['Ό,τι έχω', 'What I have', 'Ce am']);
    expect(read('there-where-the-house-is')).toEqual(['Εκεί όπου είναι το σπίτι', 'There where the house is', 'Acolo unde este casa']);
  });

  it('the same Greek word has two Romanian words: ό,τι is orice and ce, όπου is oriunde and unde', () => {
    expect(gloss('whatever-you-want', 'ro', 'natural')).toContain('Orice');
    expect(gloss('what-i-have', 'ro', 'natural')).toContain('Ce');
    expect(gloss('wherever-you-go', 'ro', 'natural')).toContain('Oriunde');
    expect(gloss('there-where-the-house-is', 'ro', 'natural')).toContain('unde');
  });

  it('όποιος stands on its own, with no noun to agree with', () => {
    const token = phrase('whoever-wants').tokens[0];
    expect(token.slot).toMatchObject({ pos: 'quantifier', use: 'pronoun', gender: 'm', case: 'nom' });
    expect(token.agreesWith).toBeUndefined();
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 89 phrases in the spec order', () => {
+  it('the picker lists all 94 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -105,4 +105,5 @@
       'the-dog-that-jumps', 'the-bread-that-i-ate', 'the-coffee-i-want', 'the-child-i-gave-it-to', 'the-child-whose-dog-jumps',
       'the-house-i-am-going-to', 'the-child-i-am-going-with', 'the-dog-that-is-there', 'this-is-the-house-i-have',
+      'whatever-you-want', 'wherever-you-go', 'whoever-wants', 'what-i-have', 'there-where-the-house-is',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.free-relative.test.tsx src/data/phrases-free-relative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1926,4 +1926,99 @@
 };
 
+const freeRelative: Slot = { pos: 'freeRelative' };
+
+const whateverYouWant: Phrase = {
+  id: 'whatever-you-want',
+  title: 'Whatever you want',
+  theme: 'Relative clauses',
+  level: 'beginner',
+  tokens: [
+    { text: 'Ό,τι', lexeme: 'free-oti', slot: freeRelative },
+    { text: 'θέλεις', lexeme: 'thelo', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('Whatever', 0), u('you want', 1)],
+    [u('whatever', 0), u('(you)', null), u('want', 1)],
+    [u('Orice', 0), u('vrei', 1)],
+    [u('orice', 0), u('(tu)', null), u('vrei', 1)],
+  ),
+  verified: false,
+};
+
+const whereverYouGo: Phrase = {
+  id: 'wherever-you-go',
+  title: 'Wherever you go',
+  theme: 'Relative clauses',
+  level: 'beginner',
+  tokens: [
+    { text: 'Όπου', lexeme: 'free-opou', slot: freeRelative },
+    { text: 'πας', lexeme: 'pao', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('Wherever', 0), u('you go', 1)],
+    [u('wherever', 0), u('(you)', null), u('go', 1)],
+    [u('Oriunde', 0), u('mergi', 1)],
+    [u('oriunde', 0), u('(tu)', null), u('mergi', 1)],
+  ),
+  verified: false,
+};
+
+const whoeverWants: Phrase = {
+  id: 'whoever-wants',
+  title: 'Whoever wants',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { text: 'Όποιος', lexeme: 'free-opoios', slot: qslot('m', 'sg', 'nom', { use: 'pronoun' }) },
+    { text: 'θέλει', lexeme: 'thelo', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('Whoever', 0), u('wants', 1)],
+    [u('whoever', 0), u('wants', 1)],
+    [u('Oricine', 0), u('vrea', 1)],
+    [u('oricine', 0), u('vrea', 1)],
+  ),
+  verified: false,
+};
+
+const whatIHave: Phrase = {
+  id: 'what-i-have',
+  title: 'What I have',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { text: 'Ό,τι', lexeme: 'free-oti', slot: freeRelative },
+    { text: 'έχω', lexeme: 'echo', slot: verbSlot(1) },
+  ],
+  glosses: rows(
+    [u('What', 0), u('I have', 1)],
+    [u('what', 0), u('(I)', null), u('have', 1)],
+    [u('Ce', 0), u('am', 1)],
+    [u('ce', 0), u('(eu)', null), u('am', 1)],
+  ),
+  verified: false,
+};
+
+const thereWhereTheHouseIs: Phrase = {
+  id: 'there-where-the-house-is',
+  title: 'There where the house is',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { text: 'Εκεί', lexeme: 'ekei', slot: adverb },
+    { text: 'όπου', lexeme: 'free-opou', slot: freeRelative },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { ...article('n', 'nom', 4), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('There', 0), u('where', 1), u('the', 3), u('house', 4), u('is', 2)],
+    [u('there', 0), u('where', 1), u('is', 2), u('the', 3), u('house', 4)],
+    [u('Acolo', 0), u('unde', 1), u('este', 2), seg(['cas', 4], ['a', 3])],
+    [u('acolo', 0), u('unde', 1), u('este', 2), seg(['cas', 4], ['a', 3])],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -2012,3 +2107,8 @@
   theDogThatIsThere,
   thisIsTheHouseIHave,
+  whateverYouWant,
+  whereverYouGo,
+  whoeverWants,
+  whatIHave,
+  thereWhereTheHouseIs,
 ];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1456 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.free-relative.test.tsx src/data/phrases-free-relative.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts
git commit -m "feat: phrases 90 to 94 (free relatives)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Comparison notes and the review sheet

**Files:**
- Create (test): `src/data/divergences-free-relative.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences`, `lexemeSection` and `demonstrativeLines` in `src/validate/reviewSheet.ts`.
- Produces: The divergence rows `free-relative-ever` (on ό,τι and όπου) and `free-relative-who` (on όποιος); review-sheet sections for the free relatives.

The review sheet is written to `review/content-review.md`, which is git-ignored.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-free-relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { DIVERGENCES } from './divergences';

const NEW = ['free-relative-ever', 'free-relative-who'];
const ids = (pos: 'freeRelative' | 'quantifier', lexeme: string) =>
  selectDivergences(DIVERGENCES, pos, lexeme, 'improver').map((d) => d.id).filter((id) => NEW.includes(id));

describe('the comparison notes for the free relatives', () => {
  it('ό,τι and όπου show one note, όποιος the other, and no other word shows either', () => {
    expect(ids('freeRelative', 'free-oti')).toEqual(['free-relative-ever']);
    expect(ids('freeRelative', 'free-opou')).toEqual(['free-relative-ever']);
    expect(ids('quantifier', 'free-opoios')).toEqual(['free-relative-who']);
    expect(ids('quantifier', 'poios')).toEqual([]);
  });

  it('show at Beginner too, and are unverified', () => {
    expect(selectDivergences(DIVERGENCES, 'freeRelative', 'free-oti', 'beginner').map((d) => d.id)).toContain('free-relative-ever');
    const rows = DIVERGENCES.filter((d) => NEW.includes(d.id));
    expect(rows).toHaveLength(2);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
```

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -166,4 +166,18 @@
   });
 
+  it('shows the free relatives: both readings and an example of each', () => {
+    expect(sheet).toContain('- whatever: ό,τι · orice · whatever');
+    expect(sheet).toContain('- what: ό,τι · ce · what');
+    expect(sheet).toContain('- Example (whatever): Ελληνικά: Ό,τι θέλεις; Română: Orice vrei; English: Whatever you want');
+    expect(sheet).toContain('- Example (what): Ελληνικά: Ό,τι έχω; Română: Ce am; English: What I have');
+    expect(sheet).toContain('- wherever: όπου · oriunde · wherever');
+    expect(sheet).toContain('- where: όπου · unde · where');
+  });
+
+  it('shows όποιος with every noun', () => {
+    expect(sheet).toContain('όποιο ψωμί · orice pâine · whichever bread');
+    expect(sheet).toContain('όποιος σκύλος · orice câine · whichever dog');
+  });
+
   it('says how many records are unverified', () => {
     expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-free-relative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -1014,3 +1014,25 @@
     verified: false,
   },
+  {
+    id: 'free-relative-ever',
+    appliesTo: { pos: 'freeRelative' },
+    point: 'One word or two',
+    el: 'one word: ό,τι means "what" and "whatever", όπου means "where" and "wherever"',
+    ro: 'two words: ce and orice, unde and oriunde',
+    en: 'two words: what and whatever, where and wherever',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'free-relative-who',
+    appliesTo: { pos: 'quantifier', lexeme: 'free-opoios' },
+    point: 'Whoever and whichever',
+    el: 'όποιος declines (όποιος, όποια, όποιο) and means both "whoever" and "whichever": όποιος θέλει, όποιο ψωμί θέλεις',
+    ro: 'two words that never change: oricine (whoever) and orice (whichever)',
+    en: 'two words that never change: whoever and whichever',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -18,5 +18,5 @@
 import { RELATIVE_PREPOSITIONS, RELATIVE_ROLES, RO_CARE_DATIVE, RO_CARE_GENITIVE } from '../data/relatives';
 import { relativeGroup } from '../engine/relativeGroup';
-import type { Clitic, GreekAdjective, GreekAdverb, GreekInterrogative, GreekQuantifier, GreekRelative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
+import type { Clitic, GreekAdjective, GreekAdverb, GreekFreeRelative, GreekInterrogative, GreekQuantifier, GreekRelative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
 import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
@@ -178,4 +178,15 @@
 }
 
+/** A free relative (ό,τι, όπου): the word in each reading, with the Romanian and English words, and an example of each. */
+function freeRelativeLines(l: GreekFreeRelative): string[] {
+  const example = (e: { el: string; ro: string; en: string }) => `${LANG_NAME.el}: ${e.el}; ${LANG_NAME.ro}: ${e.ro}; ${LANG_NAME.en}: ${e.en}`;
+  return [
+    `- ${l.en.ever}: ${l.lemma} · ${l.ro.ever} · ${l.en.ever}`,
+    `- ${l.en.plain}: ${l.lemma} · ${l.ro.plain} · ${l.en.plain}`,
+    `- Example (${l.en.ever}): ${example(l.examples.ever)}`,
+    `- Example (${l.en.plain}): ${example(l.examples.plain)}`,
+  ];
+}
+
 /** A place word: its example and the Romanian words after each preposition. */
 function adverbLines(l: GreekAdverb, lexemes: Record<string, GreekLexeme>): string[] {
@@ -185,5 +196,5 @@
 
 /**
- * A demonstrative with every noun, in the three languages: the "with a noun" row of its panel, which is what the app
+ * A demonstrative or a free relative (όποιος) with every noun, in the three languages: the "with a noun" row of its panel, which is what the app
  * shows (spec 9, 25). The genitive and the spoken Romanian forms are printed where the lexeme has them.
  */
@@ -317,6 +328,7 @@
       ...(l.pos === 'interrogative' ? interrogativeLines(l, lexemes) : []),
       ...(l.pos === 'adverb' ? adverbLines(l, lexemes) : []),
+      ...(l.pos === 'freeRelative' ? freeRelativeLines(l) : []),
       ...(l.pos === 'relative' ? relativeLines(l, lexemes) : []),
-      ...(l.pos === 'quantifier' && l.demonstrative ? demonstrativeLines(l, lexemes) : []),
+      ...(l.pos === 'quantifier' && (l.demonstrative || l.free) ? demonstrativeLines(l, lexemes) : []),
       ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
       ...(l.pos === 'possessive' ? possessiveLines(lexemes) : []),
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1460 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-free-relative.test.ts src/data/divergences.ts src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: comparison notes and review-sheet sections for the free relatives

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces: a spec that matches what was built (phrases 90 to 94, *Oricine vrea*, the notes, the panel rows, the model) and records it in section 26.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:70])
    s = s.replace(old, new)


sub('the relative pronouns (που, ο οποίος; and, in a second step, ό,τι, όπου, όποιος). The passive participle',
    'the relative pronouns (που, ο οποίος) and the free relatives (ό,τι and όπου, which never change, and όποιος, which declines). The passive participle')
sub('| relative-omitted | English can leave the relative pronoun out of an object clause (the bread I ate); Greek and Romanian cannot. |\n',
    '''| relative-omitted | English can leave the relative pronoun out of an object clause (the bread I ate); Greek and Romanian cannot. |
| free-relative-ever | Greek has one word where Romanian and English have two: ό,τι is "what" and "whatever" (*ce*, *orice*), όπου is "where" and "wherever" (*unde*, *oriunde*). |
| free-relative-who | Greek όποιος declines and means "whoever" and "whichever" (όποιος θέλει, όποιο ψωμί θέλεις); Romanian has two words that never change, *oricine* and *orice*; English *whoever* and *whichever*. |
''')
sub('| Particle (δεν, μην, να, θα, ας) |', '''| Free relative (ό,τι, όπου) | none | The word in each reading (whatever / what, wherever / where) with its Romanian and English words, and an example of each | none |
| Free relative that declines (όποιος) | As a quantifier: noun it goes with, role (subject or object only), how many; the badge reads "free relative" | "with a noun" (όποιο ψωμί / *orice pâine* / whichever bread) and "on its own" (όποιος / *oricine* / whoever) | Gender × role for the selected number |
| Particle (δεν, μην, να, θα, ας) |''')
sub("| 89 | Αυτό είναι το σπίτι που έχω | This is the house that I have | a demonstrative, then που; Romanian *Aceasta este casa pe care o am* |\n",
    '''| 89 | Αυτό είναι το σπίτι που έχω | This is the house that I have | a demonstrative, then που; Romanian *Aceasta este casa pe care o am* |
| 90 | Ό,τι θέλεις | Whatever you want | the free relative ό,τι; Romanian *Orice vrei* |
| 91 | Όπου πας | Wherever you go | όπου; Romanian *Oriunde mergi* |
| 92 | Όποιος θέλει | Whoever wants | όποιος on its own; Romanian *Oricine vrea* |
| 93 | Ό,τι έχω | What I have | the plain reading of ό,τι; Romanian *Ce am* |
| 94 | Εκεί όπου είναι το σπίτι | There where the house is | the plain reading of όπου; Romanian *Acolo unde este casa* |
''')
sub('*Relative clauses* (81 to 89, and 90 to 92 in Plan 14);', '*Relative clauses* (81 to 94);')
sub('\nReviewed content is marked verified in the data,', '''
- Plan 14 additions: the free relatives ό,τι, όπου and όποιος in every gender, number and role, the Romanian *orice / ce*, *oriunde / unde*, *oricine / orice*, the English whatever / what, wherever / where, whoever / whichever, and phrases 90 to 94.

Reviewed content is marked verified in the data,''')
sub("(*Ό,τι θέλεις / Orice vrei*, *Όπου πας / Oriunde mergi*, *Όποιος θέλει / Cine vrea*), set in Plan 14's own plan", "(*Ό,τι θέλεις / Orice vrei*, *Όπου πας / Oriunde mergi*, *Όποιος θέλει / Oricine vrea*, *Ό,τι έχω / Ce am*, *Εκεί όπου είναι το σπίτι / Acolo unde este casa*)")
sub('phrases 90 to 92 (', 'phrases 90 to 94 (')
s = s.rstrip() + """
| Free relatives, model | ό,τι and όπου are a new part of speech, the free relative, with the slot `{ pos: 'freeRelative' }` and a lexeme that stores both readings (Romanian *orice / ce*, *oriunde / unde*; English whatever / what, wherever / where) and an example of each; όποιος is a quantifier lexeme flagged `free`, with the Greek table of ποιος, the subject and object only, Romanian *orice* beside a noun and *oricine* on its own, and English whichever and whoever | 4.2 |
| Plan 14 built | The free relatives ό,τι, όπου and όποιος, their panels, phrases 90 to 94 (94 in all), two notes and the review-sheet sections; the "-ever" relatives in the genitive and the construction with an auxiliary (όπου κι αν πας) are not covered | 26 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "Plan 14 built" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Oricine vrea" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: `1`, then a number of at least `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 14 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.2, 4.3: όποιος with the Greek forms of ποιος, Romanian *orice / oricine* and English whichever / whoever | 1 |
| 5.3: the όποιος panel (a quantifier panel with the badge "free relative") | 1 |
| 4.2, 4.3, 5.3: ό,τι and όπου as a part of speech with both readings and its panel | 2 |
| 6.1: phrases 90 to 94 | 3 |
| 5.2: free-relative-ever and free-relative-who | 4 |
| 9: the review additions (όποιος with every noun; both readings and examples of ό,τι and όπου) | 4 |
| 26: the decisions, and the corrections (phrases 90 to 94; *Oricine vrea*) | 5 |
| Not covered: the "-ever" relatives in the genitive; the construction όπου κι αν πας | |
