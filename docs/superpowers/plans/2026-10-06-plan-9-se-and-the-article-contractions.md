# σε and the Article Contractions Implementation Plan (Plan 9)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the preposition σε with its six forms fused with the article (στον, στην, στο, στους, στις, στα), a Meaning control (to, at, in, on, to a person), the nouns σπίτι, δρόμος and θάλασσα, four comparison notes and phrases 57 to 62.

**Architecture:** σε is a `GreekPreposition` that stores its six fused forms and its meanings (`fused`, `senses`). In a phrase it is one token whose text is the fused word (στον) and whose `agreesWith` points at the noun; the article part is implied by the noun. The token has two parts, like a verb group: the phrase bar shows σ + τον as one chip with two buttons, the first opens the σε panel, the second the article panel for the noun, and gloss units may link to either part (`{ token, piece }`). The slot carries the meaning (`sense`), the panel offers it as the Meaning control, and the feminine στην loses its ν in front of most consonants (στη θάλασσα).

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.4, 5.2, 5.3, 6.1, 6.6, 7, 9 and 23; the repository is at commit fd0ff7b or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes, two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase, divergence row and review item has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what the data produces, ignoring capitals and trailing punctuation (the validator checks it).
- Colour is never the only signal, and `lang` attributes follow the existing components (this plan adds no new component).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement except where it says so.

1. **σπίτι needs a class of its own.** The spec said σπίτι uses a class we already have, but it is stressed on the stem (σπίτι, σπίτια) while `neut-i` is stressed on the ending (παιδί, ψωμί). The new class `neut-i-stem` stores the nominative and accusative; the genitives (σπιτιού, σπιτιών) move the accent, so the noun stores them as overrides (the mechanism Plan 7 added for ώρα). Task 8's spec edit corrects the sentence.
2. **The movable ν.** The feminine στην is written στη before most consonants (στη θάλασσα). `fusedForm(prep, noun, number, next?)` takes the word that follows and drops the ν of the feminine singular where Greek drops it (it keeps it before a vowel and κ π τ ξ ψ γκ μπ ντ τσ τζ). The σε panel passes the noun's own form, the validator passes the next token's text, and the six-form Improver table and the article panel keep the full forms. The masculine στον never changes.
3. **Meanings live on the slot.** `Slot` `preposition` gains `sense?: PrepSense` (`to | at | in | on | person`). Only σε has `senses`; the Meaning control (`key: 'sense'`) is offered only for it. A preposition token without a sense starts on the first meaning, "to".
4. **The person meaning.** In Romanian the indirect object takes the dative case and no preposition (*dau pâinea copilului*), so the person meaning stores an empty Romanian word and `dative: true`; the panel row then shows the noun in the Romanian dative (`genDefinite`), and the literal gloss row keeps *la* to show the Greek structure.
5. **Two parts, not two tokens.** A fused preposition has exactly two parts. `splitFused(text)` splits the written word after its first letter (στον → σ + τον). The first part opens the σε panel itself; the second opens the article panel, built from the noun and number the σε panel holds, with a "Back to σε" link.
6. **Glosses.** A Romanian natural row that starts a sentence with a segmented noun capitalises it (`Câine` + `le`); the warning check on split nouns ignores capitals.
7. **Delivery.** With this plan the picker lists 62 phrases.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `PrepSense`; `Slot` preposition `sense`; `PrepositionSense`; `GreekPreposition.fused` and `senses`; `NounClass` `neut-i-stem` |
| `src/engine/preposition.ts` (new) | `senseOf`, `fusedForm`, `splitFused` |
| `src/data/{lexemes,paradigms,review,phrases,divergences}.ts` | the preposition σε; the class `neut-i-stem`; three nouns; two review items; phrases 57 to 62; four comparison rows |
| `src/panels/{preposition,panels}.ts` | the σε panel (fused row, meaning control and example, six forms); `applyControl('sense')` for prepositions |
| `src/components/PhraseBar.tsx`, `src/Explorer.tsx`, `src/styles.css` | the fused chip with two parts; opening the article part |
| `src/validate/validate.ts` | checks for σε's data, a fused token, its meaning, its parts; the capital-insensitive split warning |
| tests | one new test file per task, plus the expectations the new preposition changes |

---

### Task 1: The preposition σε: fused forms, meanings and its panel

**Files:**
- Create: `src/engine/preposition.ts`
- Create (test): `src/engine/preposition.test.ts`
- Create (test): `src/panels/preposition-se.test.ts`
- Create (test): `src/validate/preposition-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/review.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/preposition.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/panels/full.test.ts`
- Modify (test): `src/panels/preposition-question.test.ts`

**Interfaces:**
- Consumes: `GreekPreposition`, `PREPOSITIONS`, `prepositionRow`, `prepositionPanel`, `applyControl` and `validate` (Plans 2 and 7).
- Produces: `PrepSense`, `PrepositionSense`, `GreekPreposition.fused` and `.senses`, `Slot` `preposition` with `sense`; the lexeme `se`; `senseOf`, `fusedForm(prep, noun, number, next?)` and `splitFused` in `src/engine/preposition.ts`; `prepositionRow(prep, noun, number, label, sense?)`; the Meaning control (`key: 'sense'`) and an example row on the σε panel; six fused forms in its Improver table; σε in the other prepositions' table; the review item `ending-table:se-contractions`; validator checks of σε's data.

This task builds everything about σε that does not need a phrase. Two existing tests change because there are now seven prepositions in the Improver table. A fused token in a phrase comes in Task 3.

- [ ] **Step 1: Write the tests**

Create `src/engine/preposition.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { GreekPreposition } from '../types';
import { fusedForm, senseOf, splitFused } from './preposition';

const se = getLexeme('se') as GreekPreposition;

describe('σε with the article', () => {
  it('fuses into the six forms, by the gender and number of the noun', () => {
    expect(fusedForm(se, getNoun('skylos'), 'sg')).toBe('στον');
    expect(fusedForm(se, getNoun('skylos'), 'pl')).toBe('στους');
    expect(fusedForm(se, getNoun('alepou'), 'sg')).toBe('στην');
    expect(fusedForm(se, getNoun('alepou'), 'pl')).toBe('στις');
    expect(fusedForm(se, getNoun('psomi'), 'sg')).toBe('στο');
    expect(fusedForm(se, getNoun('psomi'), 'pl')).toBe('στα');
  });

  it('is not defined for a preposition that does not fuse', () => {
    expect(fusedForm(getLexeme('pano') as GreekPreposition, getNoun('skylos'), 'sg')).toBeUndefined();
  });

  it('splits into σ and the article', () => {
    expect(splitFused('στον')).toEqual(['σ', 'τον']);
    expect(splitFused('Στο')).toEqual(['Σ', 'το']);
    expect(splitFused('στις')).toEqual(['σ', 'τις']);
  });
});

describe('the meanings of σε', () => {
  it('gives each meaning its Romanian and English word', () => {
    const words = (v: 'to' | 'at' | 'in' | 'on' | 'person') => {
      const s = senseOf(se, v)!;
      return [s.ro, s.en];
    };
    expect(words('to')).toEqual(['la', 'to']);
    expect(words('at')).toEqual(['la', 'at']);
    expect(words('in')).toEqual(['în', 'in']);
    expect(words('on')).toEqual(['pe', 'on']);
    expect(words('person')).toEqual(['', 'to']);
    expect(senseOf(se, 'person')?.dative).toBe(true);
  });

  it('starts with "to" when no meaning is asked for, and is undefined for a preposition without meanings', () => {
    expect(senseOf(se)?.value).toBe('to');
    expect(senseOf(getLexeme('pano') as GreekPreposition, 'on')).toBeUndefined();
  });
});
```

Create `src/panels/preposition-se.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, PrepSense, Token } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const token = (sense?: PrepSense): Token => ({
  text: 'στον',
  lexeme: 'se',
  slot: { pos: 'preposition', ...(sense ? { sense } : {}) },
  agreesWith: 1,
});
const stateOf = (noun: string, sense?: PrepSense, nounNumber: 'sg' | 'pl' = 'sg'): PanelState => ({
  slot: token(sense).slot,
  noun,
  nounNumber,
});
const panelOf = (state: PanelState, level: Level = 'beginner') => buildPanel(state, token(), level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the σε panel', () => {
  it('shows the fused form with the noun, and the Romanian and English word of the meaning', () => {
    const p = panelOf(stateOf('skylos', 'on'));
    expect(p.lemma).toBe('σε');
    expect(cells(p.rows, 0)).toEqual({ el: 'στον σκύλο', ro: 'pe câinele', en: 'on the dog' });
    expect(p.rows[0].label).toBe('prep. + noun');
  });

  it('fuses with the feminine and the neuter, singular and plural', () => {
    expect(cells(panelOf(stateOf('alepou', 'to')).rows, 0)).toEqual({ el: 'στην αλεπού', ro: 'la vulpea', en: 'to the fox' });
    expect(cells(panelOf(stateOf('psomi', 'at')).rows, 0)).toEqual({ el: 'στο ψωμί', ro: 'la pâinea', en: 'at the bread' });
    expect(cells(panelOf(stateOf('psomi', 'in', 'pl')).rows, 0)).toEqual({ el: 'στα ψωμιά', ro: 'în pâinile', en: 'in the bread' });
  });

  it('for a person Romanian uses the dative and no preposition', () => {
    const p = panelOf(stateOf('paidi', 'person'));
    expect(cells(p.rows, 0)).toEqual({ el: 'στο παιδί', ro: 'copilului', en: 'to the child' });
  });

  it('offers the five meanings, starts with "to", and shows an example of the meaning', () => {
    const start = panelOf(stateOf('skylos'));
    expect(control(start, 'sense')?.value).toBe('to');
    expect(control(start, 'sense')?.options.map((o) => o.value)).toEqual(['to', 'at', 'in', 'on', 'person']);
    expect(control(start, 'sense')?.options.map((o) => o.label)).toEqual([
      'to (direction)', 'at (place)', 'in, into', 'on (a surface)', 'to a person',
    ]);
    const on = panelOf(stateOf('skylos', 'on'));
    expect(on.rows.map((r) => r.label)).toEqual(['prep. + noun', 'example']);
    expect(cells(on.rows, 1)).toEqual({ el: 'στον δρόμο', ro: 'pe drum', en: 'on the road' });
  });

  it('the Meaning control changes the meaning and nothing else', () => {
    const next = applyControl(stateOf('skylos', 'to'), 'sense', 'in');
    expect(next.slot).toEqual({ pos: 'preposition', sense: 'in' });
    expect(next.noun).toBe('skylos');
  });

  it('Improver lists the six fused forms for the noun, with the one in use outlined', () => {
    const full = panelOf(stateOf('skylos', 'on'), 'improver').full;
    expect(full.map((r) => r.label)).toEqual([
      'masc. singular', 'masc. plural', 'fem. singular', 'fem. plural', 'neut. singular', 'neut. plural',
    ]);
    expect(full.map((r) => richText(r.el))).toEqual(['στον', 'στους', 'στην', 'στις', 'στο', 'στα']);
    expect(full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['masc. singular']);
    expect(cells(full, 0)).toEqual({ el: 'στον', ro: 'pe', en: 'on the' });
  });

  it('is in the other prepositions\' Improver table with its fused form', () => {
    const pano: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
    const full = buildPanel({ slot: pano.slot, noun: 'skylos', nounNumber: 'sg' }, pano, 'improver').full;
    expect(cells(full, full.length - 1)).toEqual({ el: 'στον σκύλο', ro: 'la câinele', en: 'to the dog' });
  });

  it('explains the fusion in plain words', () => {
    expect(panelOf(stateOf('skylos', 'to')).plain).toContain('σε + τον = στον');
  });
});
```

Create `src/validate/preposition-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekPreposition } from '../types';
import { validate } from './validate';

const se = LEXEMES.se as GreekPreposition;
const check = (prep: GreekPreposition) => validate({ lexemes: { ...LEXEMES, se: prep }, phrases: [] });

describe('σε in the validator', () => {
  it('accepts the real data', () => {
    expect(check(se)).toEqual([]);
  });

  it('refuses a missing fused form and a fused form that does not start with σ', () => {
    const missing: GreekPreposition = { ...se, fused: { ...se.fused!, f: { sg: '', pl: 'στις' } } };
    expect(check(missing)).toContain('lexeme se: no fused form for f sg');
    const wrong: GreekPreposition = { ...se, fused: { ...se.fused!, n: { sg: 'το', pl: 'στα' } } };
    expect(check(wrong)).toContain('lexeme se: the fused form το does not start with σ');
  });

  it('refuses two meanings with the same value, and a meaning with an empty text', () => {
    const twice: GreekPreposition = { ...se, senses: [se.senses![0], se.senses![0]] };
    expect(check(twice)).toContain('lexeme se: two senses have the same value');
    const empty: GreekPreposition = { ...se, senses: [{ ...se.senses![0], en: '' }] };
    expect(check(empty)).toContain('lexeme se: the sense "to" has an empty text');
  });

  it('lets the person meaning have no Romanian word (the dative)', () => {
    expect(se.senses!.find((s) => s.value === 'person')?.ro).toBe('');
    expect(check(se)).toEqual([]);
  });
});
```

Change `src/panels/full.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -83,9 +83,9 @@
   });
 
-  it('preposition: the six prepositions with the same noun, the current one highlighted', () => {
+  it('preposition: the seven prepositions with the same noun, the current one highlighted', () => {
     const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
     const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
     const full = buildPanel(state, token, 'improver').full;
-    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
+    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until', 'to / at / in / on']);
     expect(cells(full[1])).toEqual({ el: 'κάτω από τον σκύλο', ro: 'sub câinele', en: 'under the dog' });
     expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
```

Change `src/panels/preposition-question.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -50,7 +50,7 @@
   });
 
-  it('Improver lists every preposition with the question word', () => {
+  it('Improver lists every preposition with the question word, σε included', () => {
     const full = buildPanel(state, apo, 'improver').full;
-    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
+    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until', 'to / at / in / on']);
     expect(cells(full, 4)).toEqual({ el: 'από πού', ro: 'de unde', en: 'from where' });
     expect(cells(full, 5)).toEqual({ el: 'μέχρι πού', ro: 'până la unde', en: 'until where' });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/preposition.test.ts src/panels/preposition-se.test.ts src/validate/preposition-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/engine/preposition.ts`:

```ts
import type { GreekNoun, GreekPreposition, Num, PrepSense, PrepositionSense } from '../types';

/** The meaning in use for a preposition that has meanings (σε): the one asked for, else the first; undefined for any other preposition. */
export function senseOf(prep: GreekPreposition, sense?: PrepSense): PrepositionSense | undefined {
  if (!prep.senses) return undefined;
  return prep.senses.find((s) => s.value === sense) ?? prep.senses[0];
}

/** The preposition and the article of the noun, written as one word (σε + το = στο); undefined for a preposition that does not fuse. */
export const fusedForm = (prep: GreekPreposition, noun: GreekNoun, number: Num): string | undefined =>
  prep.fused?.[noun.gender][number];

/** The two parts of a fused word, as the phrase bar shows them: the preposition's σ and the article (στον → σ + τον). */
export const splitFused = (text: string): [preposition: string, article: string] => [text.slice(0, 1), text.slice(1)];
```

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -1027,4 +1027,34 @@
 const mexri = preposition('mexri', 'μέχρι', 'până la', 'until', 'until');
 
+/** σε governs the accusative and is written as one word with the article after it (spec 4.4). */
+const se: GreekPreposition = {
+  id: 'se',
+  pos: 'preposition',
+  lemma: 'σε',
+  verified: { el: false, ro: false, en: false },
+  ro: 'la',
+  en: 'to',
+  meaning: 'to / at / in / on',
+  fused: {
+    m: { sg: 'στον', pl: 'στους' },
+    f: { sg: 'στην', pl: 'στις' },
+    n: { sg: 'στο', pl: 'στα' },
+  },
+  senses: [
+    { value: 'to', label: 'to (direction)', ro: 'la', en: 'to', example: { el: 'πάω στο σπίτι', ro: 'merg acasă', en: 'I go home' } },
+    { value: 'at', label: 'at (place)', ro: 'la', en: 'at', example: { el: 'είμαι στο σπίτι', ro: 'sunt acasă', en: "I'm at home" } },
+    { value: 'in', label: 'in, into', ro: 'în', en: 'in', example: { el: 'πηδάει στο νερό', ro: 'sare în apă', en: 'jumps into the water' } },
+    { value: 'on', label: 'on (a surface)', ro: 'pe', en: 'on', example: { el: 'στον δρόμο', ro: 'pe drum', en: 'on the road' } },
+    {
+      value: 'person',
+      label: 'to a person',
+      ro: '',
+      en: 'to',
+      dative: true,
+      example: { el: 'δίνω το ψωμί στο παιδί', ro: 'dau pâinea copilului', en: 'I give the bread to the child' },
+    },
+  ],
+};
+
 const theta: GreekParticle = {
   id: 'theta',
@@ -1203,4 +1233,5 @@
   [apo.id]: apo,
   [mexri.id]: mexri,
+  [se.id]: se,
   [theta.id]: theta,
   [na.id]: na,
@@ -1221,5 +1252,5 @@
 
 /** The prepositions shown together in the Improver table, in display order. */
-export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia, apo, mexri];
+export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia, apo, mexri, se];
 
 export function getLexeme(id: string): GreekLexeme {
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -9,4 +9,5 @@
   { id: 'ending-table:fem-a', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-i', kind: 'ending-table', verified: false },
+  { id: 'ending-table:se-contractions', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
   { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -20,4 +20,5 @@
   Person,
   Phrase,
+  PrepSense,
   QuantifierDegree,
   SlotOf,
@@ -162,4 +163,5 @@
       break;
     case 'sense':
+      if (slot.pos === 'preposition') return { ...state, slot: { ...slot, sense: value as PrepSense } };
       if (slot.pos === 'quantifier') {
         const next = { ...slot };
```

Change `src/panels/preposition.ts` (unified diff):

```diff
@@ -1,8 +1,11 @@
 import { LEXEMES, PREPOSITIONS, getLexeme } from '../data/lexemes';
 import { nounPhrase } from '../engine/agree';
+import { inflectNoun } from '../engine/greek';
 import { numberOptions, type Option } from '../engine/labels';
-import { plain } from '../engine/segments';
-import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num } from '../types';
-import { ALL, nounOf, nounOptions } from './shared';
+import { fusedForm, senseOf } from '../engine/preposition';
+import { roNoun } from '../engine/romanian';
+import { formRich, plain } from '../engine/segments';
+import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num, PrepSense } from '../types';
+import { ALL, GENDERS, GENDER_ROW, NUMS, nounOf, nounOptions } from './shared';
 import type { Control, Panel, PanelRow, PanelState } from './types';
 
@@ -24,15 +27,44 @@
 }
 
-/** One preposition followed by the definite noun phrase in the accusative, in three languages. */
-export function prepositionRow(prep: GreekPreposition, noun: GreekNoun, number: Num, label: string): PanelRow {
+/**
+ * One preposition followed by the definite noun phrase in the accusative, in three languages. A preposition that
+ * fuses with the article (σε) is written as one word (στον σκύλο); one with meanings uses the word of the chosen
+ * meaning, and for a person Romanian uses the dative and no preposition (copilului).
+ */
+export function prepositionRow(
+  prep: GreekPreposition,
+  noun: GreekNoun,
+  number: Num,
+  label: string,
+  sense?: PrepSense,
+): PanelRow {
   const np = nounPhrase(noun, number, 'acc', { article: 'definite' });
+  const fused = fusedForm(prep, noun, number);
+  const meaning = senseOf(prep, sense);
+  const space = { text: ' ', role: 'plain' as const };
   return {
     label,
-    el: [{ text: prep.lemma, role: 'plain' }, { text: ' ', role: 'plain' }, ...np.el],
-    ro: plain(`${prep.ro} ${np.ro}`),
-    en: plain(`${prep.en} ${np.en}`),
+    el: fused
+      ? [{ text: fused, role: 'article' }, space, ...formRich(inflectNoun(noun, { pos: 'noun', number, case: 'acc' }))]
+      : [{ text: prep.lemma, role: 'plain' }, space, ...np.el],
+    ro: plain(meaning?.dative ? roNoun(noun, number, 'gen', 'definite') : `${meaning?.ro ?? prep.ro} ${np.ro}`),
+    en: plain(`${meaning?.en ?? prep.en} ${np.en}`),
   };
 }
 
+/** The six forms σε takes with the article, for the Improver table; the one the noun needs is outlined. */
+function fusedTable(prep: GreekPreposition, noun: GreekNoun, number: Num, sense?: PrepSense): PanelRow[] {
+  const meaning = senseOf(prep, sense);
+  return GENDERS.flatMap((gender) =>
+    NUMS.map((n): PanelRow => ({
+      label: `${GENDER_ROW[gender]} ${n === 'sg' ? 'singular' : 'plural'}`,
+      el: [{ text: prep.fused?.[gender][n] ?? '', role: 'article' }],
+      ro: plain(meaning?.dative ? 'dative' : (meaning?.ro ?? prep.ro)),
+      en: plain(`${meaning?.en ?? prep.en} the`),
+      hl: { el: gender === noun.gender && n === number },
+    })),
+  );
+}
+
 /** One preposition followed by a question word. Romanian fuses some pairs into one word (de unde, până când). */
 export function questionRow(prep: GreekPreposition, word: GreekInterrogative, label: string): PanelRow {
@@ -47,4 +79,6 @@
 export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
   const after = afterOf(state);
+  const sense = state.slot.pos === 'preposition' ? state.slot.sense : undefined;
+  const meaning = senseOf(prep, sense);
   const controls: Control[] = [
     { key: 'noun', label: 'Noun or question word after it', options: afterOptions(), value: state.noun ?? '' },
@@ -53,4 +87,15 @@
     controls.push({ key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber });
   }
+  if (prep.senses && meaning) {
+    controls.push({
+      key: 'sense',
+      label: 'Meaning',
+      options: prep.senses.map((s) => ({ value: s.value, label: s.label })),
+      value: meaning.value,
+    });
+  }
+  const example: PanelRow[] = meaning
+    ? [{ label: 'example', el: plain(meaning.example.el), ro: plain(meaning.example.ro), en: plain(meaning.example.en) }]
+    : [];
   return {
     lemma: prep.lemma,
@@ -59,19 +104,24 @@
     rows: [
       after.kind === 'noun'
-        ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun')
+        ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun', sense)
         : questionRow(prep, after.word, 'prep. + question word'),
+      ...example,
     ],
     full:
-      level === 'improver'
-        ? PREPOSITIONS.map((p) => ({
-            ...(after.kind === 'noun'
-              ? prepositionRow(p, after.noun, state.nounNumber, p.meaning)
-              : questionRow(p, after.word, p.meaning)),
-            hl: p.id === prep.id ? ALL : undefined,
-          }))
-        : [],
+      level !== 'improver'
+        ? []
+        : prep.fused && after.kind === 'noun'
+          ? fusedTable(prep, after.noun, state.nounNumber, sense)
+          : PREPOSITIONS.map((p) => ({
+              ...(after.kind === 'noun'
+                ? prepositionRow(p, after.noun, state.nounNumber, p.meaning, p === prep ? sense : undefined)
+                : questionRow(p, after.word, p.meaning)),
+              hl: p.id === prep.id ? ALL : undefined,
+            })),
     plain:
       after.kind === 'noun'
-        ? 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
+        ? prep.fused
+          ? 'σε is followed by the accusative and is written as one word with the article: σε + τον = στον. Romanian and English keep the preposition and the article apart. Where English and Romanian choose between to, at, in and on (la, în, pe), Greek uses σε for all of them.'
+          : 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
         : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
     irregular: '',
```

Change `src/types.ts` (unified diff):

```diff
@@ -9,4 +9,7 @@
 export type Stored = string | { pending: true; note?: string };
 
+/** What σε means: to (direction), at (place), in (inside or into), on (a surface), person (the indirect object). */
+export type PrepSense = 'to' | 'at' | 'in' | 'on' | 'person';
+
 export type QuantifierDegree = 'plain' | 'comparative';
 export type QuantifierSense = 'some' | 'few';
@@ -80,5 +83,5 @@
       use: QuantifierUse;
     }
-  | { pos: 'preposition' }
+  | { pos: 'preposition'; sense?: PrepSense }
   | { pos: 'particle' }
   | { pos: 'conjunction' }
@@ -350,4 +353,17 @@
 }
 
+/** One meaning of a preposition that has several (σε): its Romanian and English word and an example. */
+export interface PrepositionSense {
+  value: PrepSense;
+  /** The label in the Meaning control. */
+  label: string;
+  /** The Romanian word; empty when Romanian uses a case instead (`dative`). */
+  ro: string;
+  en: string;
+  /** Romanian puts the noun in the dative and uses no preposition (dau copilului). */
+  dative?: true;
+  example: { el: string; ro: string; en: string };
+}
+
 export interface GreekPreposition extends LexemeBase {
   pos: 'preposition';
@@ -356,4 +372,8 @@
   /** A short plain meaning, used to label rows in the preposition table. */
   meaning: string;
+  /** The forms written as one word with the article that follows (σε + τον = στον), by the noun's Greek gender and number. */
+  fused?: Record<Gender, Record<Num, string>>;
+  /** The meanings the Meaning control offers (σε only). */
+  senses?: PrepositionSense[];
 }
 
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -270,4 +270,17 @@
     if (isEmpty(l.ro)) errors.push(`lexeme ${l.id}: empty Romanian form`);
     if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
+    for (const gender of GENDERS) {
+      for (const number of NUMS) {
+        const form = l.fused?.[gender][number];
+        if (l.fused && (!form || isEmpty(form))) errors.push(`lexeme ${l.id}: no fused form for ${gender} ${number}`);
+        if (form && !form.startsWith(l.lemma.slice(0, 1))) errors.push(`lexeme ${l.id}: the fused form ${form} does not start with ${l.lemma.slice(0, 1)}`);
+      }
+    }
+    const values = (l.senses ?? []).map((s) => s.value);
+    if (new Set(values).size !== values.length) errors.push(`lexeme ${l.id}: two senses have the same value`);
+    for (const sense of l.senses ?? []) {
+      const texts = [sense.label, sense.en, sense.example.el, sense.example.ro, sense.example.en, ...(sense.dative ? [] : [sense.ro])];
+      if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: the sense "${sense.value}" has an empty text`);
+    }
   }
   return errors;
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1143 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/preposition.test.ts src/engine/preposition.ts src/panels/preposition-se.test.ts src/validate/preposition-validate.test.ts src/data/lexemes.ts src/data/review.ts src/panels/full.test.ts src/panels/panels.ts src/panels/preposition-question.test.ts src/panels/preposition.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the preposition σε with its fused forms and meanings

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: The place nouns σπίτι, δρόμος and θάλασσα

**Files:**
- Create (test): `src/engine/nouns-places.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/paradigms.ts`
- Modify: `src/data/review.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `NounClass`, `NOUN_CLASSES`, `GreekNoun.overrides` (Plan 7), the class `fem-a` and `masc-os`.
- Produces: The noun class `neut-i-stem` (σπίτι, σπίτια; the genitives σπιτιού and σπιτιών are stored as overrides because the accent moves); the nouns `spiti`, `dromos` and `thalassa` with their Romanian (*casă*, *drum*, *mare*) and English forms; the review item `ending-table:neut-i-stem`.

σπίτι cannot use `neut-i`, which is stressed on the ending (ψωμί, παιδί): see decision 1.

- [ ] **Step 1: Write the tests**

Create `src/engine/nouns-places.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import { inflect } from './greek';
import { formText } from './segments';

const forms = (id: string) =>
  (['sg', 'pl'] as const).map((number) =>
    (['nom', 'acc', 'gen'] as const).map((c) => formText(inflect(getNoun(id), { pos: 'noun', number, case: c }))),
  );

describe('the place nouns', () => {
  it('σπίτι keeps the accent on the stem except in the genitive', () => {
    expect(forms('spiti')).toEqual([
      ['σπίτι', 'σπίτι', 'σπιτιού'],
      ['σπίτια', 'σπίτια', 'σπιτιών'],
    ]);
    expect(inflect(getNoun('spiti'), { pos: 'noun', number: 'sg', case: 'gen' }).irregular?.rule).toBe('accent-moves');
    expect(inflect(getNoun('spiti'), { pos: 'noun', number: 'sg', case: 'nom' }).irregular).toBeUndefined();
  });

  it('δρόμος is a regular masculine in -ος', () => {
    expect(forms('dromos')).toEqual([
      ['δρόμος', 'δρόμο', 'δρόμου'],
      ['δρόμοι', 'δρόμους', 'δρόμων'],
    ]);
  });

  it('θάλασσα is a feminine in -α with the accent moving in the genitive plural', () => {
    expect(forms('thalassa')).toEqual([
      ['θάλασσα', 'θάλασσα', 'θάλασσας'],
      ['θάλασσες', 'θάλασσες', 'θαλασσών'],
    ]);
  });

  it('have Romanian and English forms, and genders that differ', () => {
    const spiti = getNoun('spiti');
    expect(spiti.gender).toBe('n');
    expect(spiti.ro).toMatchObject({ lemma: 'casă', gender: 'f' });
    expect(spiti.ro.forms.sg.indefinite).toBe('o casă');
    expect(getNoun('dromos').ro.forms.pl.genIndefinite).toBe('unor drumuri');
    expect(getNoun('thalassa').ro.forms.sg.genDefinite).toBe('mării');
    expect([spiti.en.sg, getNoun('dromos').en.sg, getNoun('thalassa').en.sg]).toEqual(['house', 'road', 'sea']);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/nouns-places.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -176,4 +176,80 @@
 };
 
+const ACCENT_MOVES = { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive: σπιτιού, not σπίτιου.' };
+
+const spiti: GreekNoun = {
+  id: 'spiti',
+  pos: 'noun',
+  lemma: 'σπίτι',
+  verified: { el: false, ro: false, en: false },
+  gender: 'n',
+  class: 'neut-i-stem',
+  stems: { sg: 'σπίτ', pl: 'σπίτ' },
+  overrides: {
+    'sg-gen': { stem: 'σπιτ', ending: 'ιού', note: ACCENT_MOVES },
+    'pl-gen': { stem: 'σπιτ', ending: 'ιών', note: { ...ACCENT_MOVES, plain: 'The accent moves onto the ending in the genitive plural: σπιτιών.' } },
+  },
+  ro: {
+    lemma: 'casă',
+    gender: 'f',
+    forms: {
+      sg: { definite: 'casa', indefinite: 'o casă', genDefinite: 'casei', genIndefinite: 'unei case' },
+      pl: { definite: 'casele', indefinite: 'case', genDefinite: 'caselor', genIndefinite: 'unor case' },
+    },
+    split: { sg: ['cas', 'a'], pl: ['case', 'le'] },
+  },
+  en: { sg: 'house', pl: 'houses' },
+  note: 'Neuter in Greek, feminine in Romanian (casă). στο σπίτι is "at home" or "in the house"; Romanian says acasă for "home".',
+};
+
+const dromos: GreekNoun = {
+  id: 'dromos',
+  pos: 'noun',
+  lemma: 'δρόμος',
+  verified: { el: false, ro: false, en: false },
+  gender: 'm',
+  class: 'masc-os',
+  stems: { sg: 'δρόμ', pl: 'δρόμ' },
+  ro: {
+    lemma: 'drum',
+    gender: 'm',
+    forms: {
+      sg: { definite: 'drumul', indefinite: 'un drum', genDefinite: 'drumului', genIndefinite: 'unui drum' },
+      pl: { definite: 'drumurile', indefinite: 'drumuri', genDefinite: 'drumurilor', genIndefinite: 'unor drumuri' },
+    },
+    split: { sg: ['drum', 'ul'], pl: ['drumuri', 'le'] },
+  },
+  en: { sg: 'road', pl: 'roads' },
+  note: 'Masculine in Greek and Romanian. δρόμος is the road or the street.',
+};
+
+const thalassa: GreekNoun = {
+  id: 'thalassa',
+  pos: 'noun',
+  lemma: 'θάλασσα',
+  verified: { el: false, ro: false, en: false },
+  gender: 'f',
+  class: 'fem-a',
+  stems: { sg: 'θάλασσ', pl: 'θάλασσ' },
+  overrides: {
+    'pl-gen': {
+      stem: 'θαλασσ',
+      ending: 'ών',
+      note: { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive plural: θαλασσών, not θάλασσων.' },
+    },
+  },
+  ro: {
+    lemma: 'mare',
+    gender: 'f',
+    forms: {
+      sg: { definite: 'marea', indefinite: 'o mare', genDefinite: 'mării', genIndefinite: 'unei mări' },
+      pl: { definite: 'mările', indefinite: 'mări', genDefinite: 'mărilor', genIndefinite: 'unor mări' },
+    },
+    split: { sg: ['mare', 'a'], pl: ['mări', 'le'] },
+  },
+  en: { sg: 'sea', pl: 'seas' },
+  note: 'Feminine in Greek and Romanian (mare).',
+};
+
 const zestos: GreekAdjective = {
   id: 'zestos',
@@ -1199,4 +1275,7 @@
   [nero.id]: nero,
   [ora.id]: ora,
+  [spiti.id]: spiti,
+  [dromos.id]: dromos,
+  [thalassa.id]: thalassa,
   [zestos.id]: zestos,
   [grigoros.id]: grigoros,
```

Change `src/data/paradigms.ts` (unified diff):

```diff
@@ -27,4 +27,9 @@
     pl: { nom: 'ιά', acc: 'ιά', gen: 'ιών' },
   },
+  /** Neuter nouns in -ι with the stress on the stem: σπίτι, σπίτια. The genitive moves the accent (σπιτιού, σπιτιών), so the noun stores it. */
+  'neut-i-stem': {
+    sg: { nom: 'ι', acc: 'ι', gen: 'ιού' },
+    pl: { nom: 'ια', acc: 'ια', gen: 'ιών' },
+  },
   /** Neuter nouns in -ό: νερό, νερού, νερά (the stress stays on the ending). */
   'neut-o': {
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -9,4 +9,5 @@
   { id: 'ending-table:fem-a', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-i', kind: 'ending-table', verified: false },
+  { id: 'ending-table:neut-i-stem', kind: 'ending-table', verified: false },
   { id: 'ending-table:se-contractions', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
```

Change `src/types.ts` (unified diff):

```diff
@@ -106,5 +106,5 @@
 }
 
-export type NounClass = 'masc-es' | 'masc-os' | 'fem-a' | 'fem-ou' | 'neut-i' | 'neut-o';
+export type NounClass = 'masc-es' | 'masc-os' | 'fem-a' | 'fem-ou' | 'neut-i' | 'neut-i-stem' | 'neut-o';
 
 export interface GreekNoun extends LexemeBase {
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1147 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/nouns-places.test.ts src/data/lexemes.ts src/data/paradigms.ts src/data/review.ts src/types.ts
git commit -m "feat: the nouns σπίτι, δρόμος and θάλασσα

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: A fused preposition is one token with two parts

**Files:**
- Create (test): `src/components/fused-token.test.tsx`
- Create (test): `src/validate/fused-validate.test.ts`
- Modify: `src/Explorer.tsx`
- Modify: `src/components/PhraseBar.tsx`
- Modify: `src/styles.css`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `PhraseBar`, `Explorer` (`select`, `pieceToOpen`, `OpenPiece`), `pieceCount` in the validator and the gloss links `{ token, piece }` (Plan 4).
- Produces: `PhraseBar` shows a token of a fusing preposition as one chip of two buttons (σ and the article); `Explorer` opens the σε panel for the first part and the article panel for the second ("Back to σε"); the validator counts two parts for a fused token, checks its text against the fused form of its noun, its meaning, and that it governs a noun.

The tests build their own small phrase, so this task does not depend on Task 4's phrases. The movable ν (στη θάλασσα) is added in Task 4, where the first phrase needs it; until then `fusedForm` returns the full form.

- [ ] **Step 1: Write the tests**

Create `src/components/fused-token.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Explorer } from '../Explorer';
import type { GlossRow, Phrase, Token } from '../types';
import { PhraseBar } from './PhraseBar';

const tokens: Token[] = [
  { text: 'στον', lexeme: 'se', slot: { pos: 'preposition', sense: 'on' }, agreesWith: 1 },
  { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];
const rows = (...units: GlossRow['units']): GlossRow[] => [
  { language: 'en', kind: 'natural', units },
  { language: 'en', kind: 'literal', units },
  { language: 'ro', kind: 'natural', units },
  { language: 'ro', kind: 'literal', units },
];
const phrase: Phrase = {
  id: 'on-the-dog',
  title: 'On the dog',
  theme: 'Places',
  level: 'beginner',
  tokens,
  glosses: rows(
    { text: 'on', link: { token: 0, piece: 0 } },
    { text: 'the', link: { token: 0, piece: 1 } },
    { text: 'dog', link: 1 },
  ),
  verified: false,
};

describe('PhraseBar: a fused preposition', () => {
  it('shows στον as one chip made of two parts, σ and τον', () => {
    render(<PhraseBar tokens={tokens} selected={0} onSelect={() => {}} />);
    expect(screen.getByRole('group', { name: 'στον' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'σ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'τον' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'σκύλο' })).toBeInTheDocument();
  });

  it('reports the part that was clicked', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={tokens} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'τον' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });
});

describe('Explorer: a fused preposition', () => {
  it('opens the σε panel for the first part, and the article for the second, with a way back', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον σκύλο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to σε/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
  });

  it('a gloss unit linked to a part opens that part', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    await user.click(screen.getAllByRole('button', { name: 'the' })[0]);
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
  });

  it('the article follows the noun the σε panel holds', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'psomi');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('cell', { name: 'το ψωμί' })).toBeInTheDocument();
  });
});
```

Create `src/validate/fused-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GlossRow, Phrase, Token } from '../types';
import { validate } from './validate';

const rows = (link: GlossRow['units'][number]): GlossRow[] => [
  { language: 'en', kind: 'natural', units: [link] },
  { language: 'en', kind: 'literal', units: [link] },
  { language: 'ro', kind: 'natural', units: [link] },
  { language: 'ro', kind: 'literal', units: [link] },
];
const phrase = (se: Partial<Token>, link: GlossRow['units'][number] = { text: 'on', link: { token: 0, piece: 0 } }): Phrase => ({
  id: 'p',
  title: 'p',
  theme: 'Places',
  level: 'beginner',
  tokens: [
    { text: 'στον', lexeme: 'se', slot: { pos: 'preposition', sense: 'on' }, agreesWith: 1, ...se },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(link),
  verified: false,
});
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a fused preposition token in the validator', () => {
  it('accepts στον before a masculine noun, with a link to either part', () => {
    expect(errorsOf(phrase({}))).toEqual([]);
    expect(errorsOf(phrase({}, { text: 'the', link: { token: 0, piece: 1 } }))).toEqual([]);
  });

  it('refuses a text that is not the fused form of the noun', () => {
    expect(errorsOf(phrase({ text: 'στο' }))).toContain('p token 0 (στο): text differs from the fused form ("στον")');
  });

  it('refuses a sense σε does not have', () => {
    const bad = phrase({ slot: { pos: 'preposition', sense: 'above' as never } });
    expect(errorsOf(bad)).toContain('p token 0 (στον): σε has no sense "above"');
  });

  it('refuses a link to a third part, and a link to a part of a preposition that does not fuse', () => {
    expect(errorsOf(phrase({}, { text: 'x', link: { token: 0, piece: 2 } }))).toContain(
      'p gloss en/natural: unit "x" has piece 2 but token 0 has 2 pieces',
    );
    const plain = phrase({ text: 'από', lexeme: 'apo', slot: { pos: 'preposition' } });
    expect(errorsOf(plain).some((e) => e.includes('which is not a verb group'))).toBe(true);
  });

  it('refuses σε in front of a question word', () => {
    const bad = phrase({ agreesWith: 1 });
    bad.tokens[1] = { text: 'πού', lexeme: 'pou', slot: { pos: 'interrogative' } };
    expect(errorsOf(bad)).toContain('p token 0 (στον): σε fuses with an article, so it needs a noun in agreesWith');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/components/fused-token.test.tsx src/validate/fused-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/Explorer.tsx` (unified diff):

```diff
@@ -5,8 +5,9 @@
 import { WordPanel } from './components/WordPanel';
 import { DIVERGENCES } from './data/divergences';
-import { getLexeme, getVerb } from './data/lexemes';
+import { getLexeme, getNoun, getVerb } from './data/lexemes';
 import { compose, pieceText } from './engine/compose';
+import { splitFused } from './engine/preposition';
 import { applyControl, buildPanel, initialState, sameState, type PanelState, type Related } from './panels/panels';
-import type { Level, Phrase, Slot, Token } from './types';
+import type { Level, Phrase, Slot, SlotOf, Token } from './types';
 
 /** A panel for one piece of a verb group (a particle, a negation or the auxiliary), working on its own copy. */
@@ -32,4 +33,23 @@
 }
 
+/**
+ * The panel to open for the article part of a fused preposition (στον): the definite article for the noun the σε
+ * panel holds, in the accusative. The first part is σε itself, so it opens nothing of its own.
+ */
+function fusedPieceToOpen(token: Token, state: PanelState, pieceIndex: number): OpenPiece | null {
+  if (pieceIndex !== 1 || !state.noun) return null;
+  const lexeme = getLexeme(state.noun);
+  if (lexeme.pos !== 'noun') return null;
+  const noun = getNoun(state.noun);
+  const slot: SlotOf<'article'> = { pos: 'article', gender: noun.gender, number: state.nounNumber, case: 'acc' };
+  const articleState: PanelState = { slot, noun: state.noun, nounNumber: state.nounNumber };
+  return {
+    token: { text: splitFused(token.text)[1], lexeme: 'def', slot },
+    state: articleState,
+    initial: articleState,
+    backLabel: 'Back to σε',
+  };
+}
+
 function pieceKindAt(from: OpenPiece, index: number): string | undefined {
   if (from.state.slot.pos !== 'verb') return undefined;
@@ -82,5 +102,13 @@
     setSelected(index);
     setPiece(pieceIndex ?? null);
-    setOpen(pieceIndex === undefined ? null : pieceToOpen(target.lexeme, target.slot, pieceIndex));
+    const lexeme = getLexeme(target.lexeme);
+    const fused = lexeme.pos === 'preposition' && lexeme.fused !== undefined;
+    setOpen(
+      pieceIndex === undefined
+        ? null
+        : fused
+          ? fusedPieceToOpen(target, states[index], pieceIndex)
+          : pieceToOpen(target.lexeme, target.slot, pieceIndex),
+    );
   }
 
```

Change `src/components/PhraseBar.tsx` (unified diff):

```diff
@@ -1,4 +1,5 @@
 import { getLexeme } from '../data/lexemes';
 import { compose } from '../engine/compose';
+import { splitFused } from '../engine/preposition';
 import type { Token } from '../types';
 
@@ -11,8 +12,18 @@
 }
 
-/** The words of a verb group with their kinds, or null for a single word (it needs no pieces). */
+/**
+ * The parts of a token that has several: the words of a verb group, or the σ and the article of a fused preposition
+ * (στον); null for a single word (it needs no parts).
+ */
 function groupPieces(token: Token): { word: string; kind: string }[] | null {
-  if (token.slot.pos !== 'verb') return null;
   const lexeme = getLexeme(token.lexeme);
+  if (token.slot.pos === 'preposition' && lexeme.pos === 'preposition' && lexeme.fused) {
+    const [preposition, article] = splitFused(token.text);
+    return [
+      { word: preposition, kind: 'preposition' },
+      { word: article, kind: 'article' },
+    ];
+  }
+  if (token.slot.pos !== 'verb') return null;
   if (lexeme.pos !== 'verb') return null;
   const { pieces } = compose(lexeme, token.slot);
@@ -34,5 +45,5 @@
           );
         }
-        // The verb is the last piece in a tense, the first in an affirmative command with pronouns.
+        // The verb is the last piece in a tense, the first in an affirmative command with pronouns; a fused preposition starts on σε.
         const verbPiece = Math.max(0, pieces.findIndex((p) => p.kind === 'verb' || p.kind === 'fused'));
         return (
```

Change `src/styles.css` (unified diff):

```diff
@@ -50,4 +50,5 @@
 .chip.piece-particle, .chip.piece-auxiliary { color: var(--accent-text); }
 .chip.piece-negation { font-weight: 600; }
+.chip.piece-preposition, .chip.piece-article { color: var(--accent-text); }
 .chip.piece[aria-pressed='true'] { color: var(--accent-text); }
 .chip:focus-visible, .gloss-unit:focus-visible, .phrase-status button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--accent-border); outline-offset: 2px; }
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -11,4 +11,5 @@
 import { formText } from '../engine/segments';
 import { enQuantifier, enVerb } from '../engine/english';
+import { fusedForm } from '../engine/preposition';
 import { roQuantifier, roVerb } from '../engine/romanian';
 import { isSegmented, linkedToken, linksOf, unitText } from '../glossLinks';
@@ -290,6 +291,10 @@
 const normalise = (text: string): string => text.toLowerCase().replace(/[!?.,;·]+$/u, '').trim();
 
-/** How many pieces a verb token has (0 for any other token). */
+/** How many parts a token has: the pieces of a verb group, two for a fused preposition (σε + the article), else 0. */
 function pieceCount(token: Token | undefined, lexemes: Record<string, GreekLexeme>): number {
+  if (token?.slot.pos === 'preposition') {
+    const prep = lexemes[token.lexeme];
+    return prep?.pos === 'preposition' && prep.fused ? 2 : 0;
+  }
   if (!token || token.slot.pos !== 'verb') return 0;
   const lexeme = lexemes[token.lexeme];
@@ -375,4 +380,17 @@
       errors.push(`${where}: preposition needs agreesWith pointing at the noun or question word it governs`);
     }
+    if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'noun' && target?.slot.pos === 'noun') {
+      // σε is written as one word with the article of its noun: στον for a masculine singular noun.
+      const expected = fusedForm(lexeme, governed, target.slot.number);
+      if (expected && normalise(expected) !== normalise(token.text)) {
+        errors.push(`${where}: text differs from the fused form ("${expected}")`);
+      }
+    } else if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'interrogative') {
+      errors.push(`${where}: ${lexeme.lemma} fuses with an article, so it needs a noun in agreesWith`);
+    }
+    if (lexeme.pos === 'preposition' && token.slot.pos === 'preposition' && token.slot.sense !== undefined) {
+      const sense = token.slot.sense;
+      if (!(lexeme.senses ?? []).some((s) => s.value === sense)) errors.push(`${where}: ${lexeme.lemma} has no sense "${sense}"`);
+    }
   }
   return errors;
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1157 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/components/fused-token.test.tsx src/validate/fused-validate.test.ts src/Explorer.tsx src/components/PhraseBar.tsx src/styles.css src/validate/validate.ts
git commit -m "feat: a fused preposition is one token with two parts

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Phrases 57 to 62 and the movable ν

**Files:**
- Create (test): `src/App.places.test.tsx`
- Create (test): `src/data/phrases-places.test.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/engine/preposition.ts`
- Modify: `src/panels/preposition.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`
- Modify (test): `src/engine/preposition.test.ts`
- Modify (test): `src/panels/preposition-se.test.ts`
- Modify (test): `src/validate/validate.test.ts`

**Interfaces:**
- Consumes: The lexemes of Tasks 1 and 2, the helpers `rows`, `u`, `p`, `seg`, `present` and `qslot` in `src/data/phrases.ts`.
- Produces: Six phrases: `going-home`, `at-home`, `go-to-the-sea`, `dog-on-the-road`, `give-bread-to-the-child`, `dog-jumps-into-the-water`; the picker lists 62 phrases; the new theme *Places*; the rule that drops the ν of στην (στη θάλασσα) in `fusedForm`, the σε panel and the validator; the split-noun warning check ignores capitals.

Phrase 59 needs the feminine στη, so the movable-ν rule arrives here (decision 2). The Romanian natural rows of phrases 60 and 62 start with a capitalised segmented noun (`Câine` + `le`).

- [ ] **Step 1: Write the tests**

Create `src/App.places.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('σε in the app', () => {
  it('shows στο as one chip with two parts, and opens the σε panel on the first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I'm at home");
    expect(screen.getByRole('group', { name: 'στο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'σ' }));
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'στο σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'la casa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'at the house' })).toBeInTheDocument();
  });

  it('the Meaning control changes the Romanian and English word, and the example', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I'm at home");
    await user.click(screen.getByRole('button', { name: 'σ' }));
    await user.selectOptions(screen.getByLabelText('Meaning'), 'in');
    expect(screen.getByRole('cell', { name: 'în casa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'in the house' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'sare în apă' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('opens the article from the second part, and goes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The dog is on the road');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον δρόμο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to σε/ }));
    expect(screen.getByRole('cell', { name: 'pe drumul' })).toBeInTheDocument();
  });

  it('writes στη before θάλασσα, while the article panel shows the full την', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Shall we go to the sea?');
    expect(screen.getByRole('group', { name: 'στη' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'τη' }));
    expect(screen.getByRole('cell', { name: 'την θάλασσα' })).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-places.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water'];
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

describe('phrases 57 to 62', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the themes the spec gives', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(['Places', 'Places', 'Places', 'Places', 'Daily life', 'Places']);
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('going-home')).toEqual(['Πάω στο σπίτι', "I'm going home", 'Merg acasă']);
    expect(read('at-home')).toEqual(['Είμαι στο σπίτι', "I'm at home", 'Sunt acasă']);
    expect(read('go-to-the-sea')).toEqual(['Πάμε στη θάλασσα;', 'Shall we go to the sea?', 'Mergem la mare?']);
    expect(read('dog-on-the-road')).toEqual(['Ο σκύλος είναι στον δρόμο', 'The dog is on the road', 'Câinele este pe drum']);
    expect(read('give-bread-to-the-child')).toEqual(['Δίνω το ψωμί στο παιδί', 'I give the bread to the child', 'Dau pâinea copilului']);
    expect(read('dog-jumps-into-the-water')).toEqual(['Ο σκύλος πηδάει στο νερό', 'The dog jumps into the water', 'Câinele sare în apă']);
  });

  it('use each meaning of σε once or more: to, at, in, on and a person', () => {
    const senses = IDS.flatMap((id) => phrase(id).tokens.flatMap((t) => (t.slot.pos === 'preposition' && t.slot.sense ? [t.slot.sense] : [])));
    expect(senses).toEqual(['to', 'at', 'to', 'on', 'person', 'in']);
  });

  it('write the fused word as one token that points at its noun', () => {
    for (const id of IDS) {
      const index = phrase(id).tokens.findIndex((t) => t.lexeme === 'se');
      const token = phrase(id).tokens[index];
      expect(token.agreesWith).toBe(index + 1);
      expect(phrase(id).tokens[token.agreesWith!].slot.pos).toBe('noun');
    }
    expect(['στο', 'στο', 'στη', 'στον', 'στο', 'στο']).toEqual(IDS.map((id) => phrase(id).tokens.find((t) => t.lexeme === 'se')!.text));
  });

  it('link the literal English to both parts of the fused word (to + the)', () => {
    const units = phrase('going-home').glosses[1].units;
    const links = units.flatMap((u) => ('link' in u && u.link !== null && typeof u.link === 'object' ? [u.link] : []));
    expect(links).toEqual([{ token: 1, piece: 0 }, { token: 1, piece: 1 }]);
  });

  it('the dative of a person: Romanian drops the preposition, the literal row shows it', () => {
    expect(gloss('give-bread-to-the-child', 'ro', 'literal')).toBe('(eu) dau pâinea la copilul');
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 56 phrases in the spec order', () => {
+  it('the picker lists all 62 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -99,4 +99,5 @@
       'how-much-is-it', 'lets-eat', 'let-him-eat', 'lets-not-go',
       'what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me',
+      'going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water',
     ]);
   });
```

Change `src/engine/preposition.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -16,4 +16,23 @@
   });
 
+  it('drops the ν of στην in front of most consonants, and keeps it in front of vowels and κ π τ ξ ψ γκ μπ ντ τσ τζ', () => {
+    const alepou = getNoun('alepou');
+    const next = (word: string) => fusedForm(se, alepou, 'sg', word);
+    expect(next('θάλασσα')).toBe('στη');
+    expect(next('βιβλιοθήκη')).toBe('στη');
+    expect(next('αλεπού')).toBe('στην');
+    expect(next('κουζίνα')).toBe('στην');
+    expect(next('πόλη')).toBe('στην');
+    expect(next('ξενοδοχείο')).toBe('στην');
+    expect(next('μπάλα')).toBe('στην');
+    expect(next('τσάντα')).toBe('στην');
+  });
+
+  it('keeps every other form whole, whatever follows', () => {
+    expect(fusedForm(se, getNoun('skylos'), 'sg', 'θάλασσα')).toBe('στον');
+    expect(fusedForm(se, getNoun('alepou'), 'pl', 'θάλασσες')).toBe('στις');
+    expect(fusedForm(se, getNoun('psomi'), 'sg', 'θάλασσα')).toBe('στο');
+  });
+
   it('is not defined for a preposition that does not fuse', () => {
     expect(fusedForm(getLexeme('pano') as GreekPreposition, getNoun('skylos'), 'sg')).toBeUndefined();
```

Change `src/panels/preposition-se.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -37,4 +37,10 @@
   });
 
+  it('writes στη before most consonants and στην before a vowel', () => {
+    expect(cells(panelOf(stateOf('thalassa', 'to')).rows, 0)).toEqual({ el: 'στη θάλασσα', ro: 'la marea', en: 'to the sea' });
+    expect(cells(panelOf(stateOf('alepou', 'to')).rows, 0).el).toBe('στην αλεπού');
+    expect(panelOf(stateOf('thalassa', 'to'), 'improver').full.map((r) => richText(r.el))).toContain('στην');
+  });
+
   it('for a person Romanian uses the dative and no preposition', () => {
     const p = panelOf(stateOf('paidi', 'person'));
```

Change `src/validate/validate.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -156,4 +156,12 @@
   });
 
+  it('does not mind a capital at the start of a split (Câine + le)', () => {
+    const capital = withDogUnit([
+      { text: 'Câine', link: 8 },
+      { text: 'le', link: 6 },
+    ]);
+    expect(warnings({ ...real, phrases: [capital] })).toEqual([]);
+  });
+
   it('warns when a segmented unit is not linked to a noun', () => {
     const bad = withDogUnit([
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.places.test.tsx src/data/phrases-places.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1,3 +1,3 @@
-import type { Case, Clitic, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, Slot, SlotOf, Tense, Token, Voice } from '../types';
+import type { Case, Clitic, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, PrepSense, Slot, SlotOf, Tense, Token, Voice } from '../types';
 
 const verbSlot = (person: 1 | 2 | 3): Slot => ({
@@ -1235,4 +1235,131 @@
 };
 
+/** σε with the meaning a phrase uses; the token text is the fused form (στο, στον …). */
+const preposition = (sense: PrepSense): Slot => ({ pos: 'preposition', sense });
+const accSg = { pos: 'noun', number: 'sg', case: 'acc' } as const;
+const nomSg = { pos: 'noun', number: 'sg', case: 'nom' } as const;
+const theDog: Token[] = [
+  { text: 'Ο', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 1 },
+  { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
+];
+
+const goingHome: Phrase = {
+  id: 'going-home',
+  title: "I'm going home",
+  theme: 'Places',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πάω', lexeme: 'pao', slot: present(1) },
+    { text: 'στο', lexeme: 'se', slot: preposition('to'), agreesWith: 2 },
+    { text: 'σπίτι', lexeme: 'spiti', slot: accSg },
+  ],
+  glosses: rows(
+    [u("I'm going", 0), u('home', 2)],
+    [u('(I)', null), u('go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('house', 2)],
+    [u('Merg', 0), u('acasă', 2)],
+    [u('(eu)', null), u('merg', 0), u('la', p(1, 0)), seg(['cas', 2], ['a', p(1, 1)])],
+  ),
+  verified: false,
+};
+
+const atHome: Phrase = {
+  id: 'at-home',
+  title: "I'm at home",
+  theme: 'Places',
+  level: 'beginner',
+  tokens: [
+    { text: 'Είμαι', lexeme: 'eimai', slot: present(1) },
+    { text: 'στο', lexeme: 'se', slot: preposition('at'), agreesWith: 2 },
+    { text: 'σπίτι', lexeme: 'spiti', slot: accSg },
+  ],
+  glosses: rows(
+    [u("I'm", 0), u('at', p(1, 0)), u('home', 2)],
+    [u('(I)', null), u('am', 0), u('at', p(1, 0)), u('the', p(1, 1)), u('house', 2)],
+    [u('Sunt', 0), u('acasă', 2)],
+    [u('(eu)', null), u('sunt', 0), u('la', p(1, 0)), seg(['cas', 2], ['a', p(1, 1)])],
+  ),
+  verified: false,
+};
+
+const goToTheSea: Phrase = {
+  id: 'go-to-the-sea',
+  title: 'Shall we go to the sea?',
+  theme: 'Places',
+  level: 'improver',
+  tokens: [
+    { text: 'Πάμε', lexeme: 'pao', slot: present(1, 'pl') },
+    { text: 'στη', lexeme: 'se', slot: preposition('to'), agreesWith: 2 },
+    { text: 'θάλασσα;', lexeme: 'thalassa', slot: accSg },
+  ],
+  glosses: rows(
+    [u('Shall we go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('sea?', 2)],
+    [u('(we)', null), u('go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('sea', 2)],
+    [u('Mergem', 0), u('la', p(1, 0)), u('mare?', 2)],
+    [u('(noi)', null), u('mergem', 0), u('la', p(1, 0)), seg(['mare', 2], ['a', p(1, 1)])],
+  ),
+  verified: false,
+};
+
+const dogOnTheRoad: Phrase = {
+  id: 'dog-on-the-road',
+  title: 'The dog is on the road',
+  theme: 'Places',
+  level: 'improver',
+  tokens: [
+    ...theDog,
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { text: 'στον', lexeme: 'se', slot: preposition('on'), agreesWith: 4 },
+    { text: 'δρόμο', lexeme: 'dromos', slot: accSg },
+  ],
+  glosses: rows(
+    [u('The', 0), u('dog', 1), u('is', 2), u('on', p(3, 0)), u('the', p(3, 1)), u('road', 4)],
+    [u('the', 0), u('dog', 1), u('is', 2), u('on', p(3, 0)), u('the', p(3, 1)), u('road', 4)],
+    [seg(['Câine', 1], ['le', 0]), u('este', 2), u('pe', p(3, 0)), u('drum', 4)],
+    [seg(['câine', 1], ['le', 0]), u('este', 2), u('pe', p(3, 0)), seg(['drum', 4], ['ul', p(3, 1)])],
+  ),
+  verified: false,
+};
+
+const giveBreadToTheChild: Phrase = {
+  id: 'give-bread-to-the-child',
+  title: 'I give the bread to the child',
+  theme: 'Daily life',
+  level: 'improver',
+  tokens: [
+    { text: 'Δίνω', lexeme: 'dino', slot: present(1) },
+    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
+    { text: 'ψωμί', lexeme: 'psomi', slot: accSg },
+    { text: 'στο', lexeme: 'se', slot: preposition('person'), agreesWith: 4 },
+    { text: 'παιδί', lexeme: 'paidi', slot: accSg },
+  ],
+  glosses: rows(
+    [u('I give', 0), u('the', 1), u('bread', 2), u('to', p(3, 0)), u('the', p(3, 1)), u('child', 4)],
+    [u('(I)', null), u('give', 0), u('the', 1), u('bread', 2), u('to', p(3, 0)), u('the', p(3, 1)), u('child', 4)],
+    [u('Dau', 0), seg(['pâine', 2], ['a', 1]), u('copilului', 4)],
+    [u('(eu)', null), u('dau', 0), seg(['pâine', 2], ['a', 1]), u('la', p(3, 0)), seg(['copil', 4], ['ul', p(3, 1)])],
+  ),
+  verified: false,
+};
+
+const dogJumpsIntoTheWater: Phrase = {
+  id: 'dog-jumps-into-the-water',
+  title: 'The dog jumps into the water',
+  theme: 'Places',
+  level: 'improver',
+  tokens: [
+    ...theDog,
+    { text: 'πηδάει', lexeme: 'pidao', slot: present(3) },
+    { text: 'στο', lexeme: 'se', slot: preposition('in'), agreesWith: 4 },
+    { text: 'νερό', lexeme: 'nero', slot: accSg },
+  ],
+  glosses: rows(
+    [u('The', 0), u('dog', 1), u('jumps', 2), u('into', p(3, 0)), u('the', p(3, 1)), u('water', 4)],
+    [u('the', 0), u('dog', 1), u('jumps', 2), u('in', p(3, 0)), u('the', p(3, 1)), u('water', 4)],
+    [seg(['Câine', 1], ['le', 0]), u('sare', 2), u('în', p(3, 0)), u('apă', 4)],
+    [seg(['câine', 1], ['le', 0]), u('sare', 2), u('în', p(3, 0)), seg(['ap', 4], ['a', p(3, 1)])],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1288,3 +1415,9 @@
   letsEatIt,
   willYouGiveItToMe,
+  goingHome,
+  atHome,
+  goToTheSea,
+  dogOnTheRoad,
+  giveBreadToTheChild,
+  dogJumpsIntoTheWater,
 ];
```

Change `src/engine/preposition.ts` (unified diff):

```diff
@@ -7,7 +7,16 @@
 }
 
-/** The preposition and the article of the noun, written as one word (σε + το = στο); undefined for a preposition that does not fuse. */
-export const fusedForm = (prep: GreekPreposition, noun: GreekNoun, number: Num): string | undefined =>
-  prep.fused?.[noun.gender][number];
+/** The feminine singular keeps its final ν (στην) in front of a vowel and κ π τ ξ ψ γκ μπ ντ τσ τζ, and drops it in front of any other consonant (στη θάλασσα). */
+const KEEPS_FINAL_N = /^(?:[αεηιουωάέήίόύώ]|[κπτξψ]|γκ|μπ|ντ|τσ|τζ)/;
+
+/**
+ * The preposition and the article of the noun, written as one word (σε + το = στο); undefined for a preposition that
+ * does not fuse. Given the word that follows, the feminine singular loses its ν where Greek drops it (στη θάλασσα).
+ */
+export function fusedForm(prep: GreekPreposition, noun: GreekNoun, number: Num, next?: string): string | undefined {
+  const form = prep.fused?.[noun.gender][number];
+  if (!form || next === undefined || noun.gender !== 'f' || number !== 'sg' || !form.endsWith('ν')) return form;
+  return KEEPS_FINAL_N.test(next.toLowerCase()) ? form : form.slice(0, -1);
+}
 
 /** The two parts of a fused word, as the phrase bar shows them: the preposition's σ and the article (στον → σ + τον). */
```

Change `src/panels/preposition.ts` (unified diff):

```diff
@@ -5,5 +5,5 @@
 import { fusedForm, senseOf } from '../engine/preposition';
 import { roNoun } from '../engine/romanian';
-import { formRich, plain } from '../engine/segments';
+import { formRich, formText, plain } from '../engine/segments';
 import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num, PrepSense } from '../types';
 import { ALL, GENDERS, GENDER_ROW, NUMS, nounOf, nounOptions } from './shared';
@@ -40,5 +40,6 @@
 ): PanelRow {
   const np = nounPhrase(noun, number, 'acc', { article: 'definite' });
-  const fused = fusedForm(prep, noun, number);
+  const nounForm = inflectNoun(noun, { pos: 'noun', number, case: 'acc' });
+  const fused = fusedForm(prep, noun, number, formText(nounForm));
   const meaning = senseOf(prep, sense);
   const space = { text: ' ', role: 'plain' as const };
@@ -46,5 +47,5 @@
     label,
     el: fused
-      ? [{ text: fused, role: 'article' }, space, ...formRich(inflectNoun(noun, { pos: 'noun', number, case: 'acc' }))]
+      ? [{ text: fused, role: 'article' }, space, ...formRich(nounForm)]
       : [{ text: prep.lemma, role: 'plain' }, space, ...np.el],
     ro: plain(meaning?.dative ? roNoun(noun, number, 'gen', 'definite') : `${meaning?.ro ?? prep.ro} ${np.ro}`),
@@ -122,5 +123,5 @@
       after.kind === 'noun'
         ? prep.fused
-          ? 'σε is followed by the accusative and is written as one word with the article: σε + τον = στον. Romanian and English keep the preposition and the article apart. Where English and Romanian choose between to, at, in and on (la, în, pe), Greek uses σε for all of them.'
+          ? 'σε is followed by the accusative and is written as one word with the article: σε + τον = στον. The feminine στην loses its ν before most consonants (στη θάλασσα). Romanian and English keep the preposition and the article apart. Where English and Romanian choose between to, at, in and on (la, în, pe), Greek uses σε for all of them.'
           : 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
         : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -382,5 +382,5 @@
     if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'noun' && target?.slot.pos === 'noun') {
       // σε is written as one word with the article of its noun: στον for a masculine singular noun.
-      const expected = fusedForm(lexeme, governed, target.slot.number);
+      const expected = fusedForm(lexeme, governed, target.slot.number, phrase.tokens[index + 1]?.text);
       if (expected && normalise(expected) !== normalise(token.text)) {
         errors.push(`${where}: text differs from the fused form ("${expected}")`);
@@ -541,5 +541,5 @@
         const expected = noun.ro.split[nounToken.slot.number];
         const actual = unit.segments.map((s) => s.text.replace(/[!?.,;]+$/u, ''));
-        if (actual.length !== 2 || actual[0] !== expected[0] || actual[1] !== expected[1]) {
+        if (actual.length !== 2 || actual[0].toLowerCase() !== expected[0].toLowerCase() || actual[1] !== expected[1]) {
           out.push(
             `${where}: "${unitText(unit)}" is split ${actual.join(' + ')}, the noun data splits it ${expected.join(' + ')}`,
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1172 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.places.test.tsx src/data/phrases-places.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/engine/preposition.test.ts src/engine/preposition.ts src/panels/preposition-se.test.ts src/panels/preposition.ts src/validate/validate.test.ts src/validate/validate.ts
git commit -m "feat: phrases 57 to 62 with σε, and the movable ν of στην

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Comparison notes for σε

**Files:**
- Create (test): `src/data/divergences-se.test.ts`
- Modify: `src/data/divergences.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences` (a row names one lexeme).
- Produces: The divergence rows `preposition-meaning`, `preposition-article-fusion`, `direction-and-place` and `indirect-object-dative`, all on σε.

The existing preposition rows (case, article) apply to every preposition and keep showing for σε.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-se.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (lexeme: string, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'preposition', lexeme, level, { pos: 'preposition' }).map((d) => d.id);

describe('the comparison notes for σε', () => {
  it('σε shows the four notes about its meanings, its fusion, direction and place, and the indirect object', () => {
    expect(ids('se')).toEqual(
      expect.arrayContaining(['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative']),
    );
  });

  it('the notes are the same at Beginner, because all four are core rows', () => {
    expect(ids('se', 'beginner')).toEqual(expect.arrayContaining(['preposition-meaning', 'indirect-object-dative']));
  });

  it('no other preposition shows them', () => {
    for (const other of ['pano', 'apo', 'me']) {
      expect(ids(other).filter((id) => ['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative'].includes(id))).toEqual([]);
    }
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => ['preposition-meaning', 'preposition-article-fusion', 'direction-and-place', 'indirect-object-dative'].includes(d.id));
    expect(rows).toHaveLength(4);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-se.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -757,3 +757,47 @@
     verified: false,
   },
+  {
+    id: 'preposition-meaning',
+    appliesTo: { pos: 'preposition', lexeme: 'se' },
+    point: 'Several meanings in one word',
+    el: 'σε covers to, at, in and on: πάω στο σπίτι, είμαι στο σπίτι, πηδάει στο νερό, στον δρόμο',
+    ro: 'la, în and pe, and the dative case for a person',
+    en: 'to, at, in and on',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'preposition-article-fusion',
+    appliesTo: { pos: 'preposition', lexeme: 'se' },
+    point: 'Written as one word with the article',
+    el: 'σε + το = στο; also στον, στην, στους, στις, στα',
+    ro: 'two words: la casa',
+    en: 'two words: to the house',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'direction-and-place',
+    appliesTo: { pos: 'preposition', lexeme: 'se' },
+    point: 'Direction and place',
+    el: 'the same word for both: πάω στο σπίτι, είμαι στο σπίτι',
+    ro: 'acasă covers both "home"; otherwise la for direction and place',
+    en: 'to for a direction, at or in for a place',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'indirect-object-dative',
+    appliesTo: { pos: 'preposition', lexeme: 'se' },
+    point: 'The indirect object',
+    el: 'σε + the accusative: δίνω το ψωμί στο παιδί',
+    ro: 'the dative case and no preposition: dau pâinea copilului',
+    en: '"to the child", or "give the child the bread"',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1176 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-se.test.ts src/data/divergences.ts
git commit -m "feat: comparison notes for σε

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 5.
- Produces: a spec that matches what was built (the class of σπίτι, the movable ν, the validator rule, the review additions) and records it in section 23.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, 1)


sub(
    "The six fused forms (σε + τον = στον, and so on) are stored data, not built by a rule; a ReviewItem covers them.",
    "The six fused forms (σε + τον = στον, and so on) are stored data, not built by a rule; a ReviewItem covers them. The feminine singular στην loses its final ν in front of most consonants (στη θάλασσα) and keeps it in front of a vowel and κ π τ ξ ψ γκ μπ ντ τσ τζ (στην αλεπού, στην κουζίνα): the σε panel and the validator apply this rule to the word that follows σε, while the article panel keeps the full την.",
)
sub(
    "σπίτι (neuter in -ί, like παιδί), δρόμος (masculine in -ος) and θάλασσα (feminine in -α, genitive plural θαλασσών)",
    "σπίτι (neuter in -ι with the stress on the stem, a class of its own: σπίτι, σπιτιού, σπίτια, σπιτιών), δρόμος (masculine in -ος) and θάλασσα (feminine in -α, genitive plural θαλασσών)",
)
sub(
    "and a σε token whose text is not the fused form of its noun's article (στον for a masculine singular noun);",
    "and a σε token whose text is not the fused form of its noun's article (στον for a masculine singular noun; στη or στην for a feminine singular noun, by the word that follows);",
)
sub(
    "the six fused forms (στον, στην, στο, στους, στις, στα); the senses",
    "the six fused forms (στον, στην, στο, στους, στις, στα) and the rule that drops the ν of στην (στη θάλασσα, στην αλεπού); the senses",
)
s = s.rstrip() + """
| Movable ν | στην becomes στη in front of most consonants; the σε panel and the validator apply it to the word after σε; the article panel keeps the full την | 4.4 |
| σπίτι | A class of its own, `neut-i-stem` (σπίτι, σπίτια; the genitive moves the accent: σπιτιού, σπιτιών, stored as overrides) | 6.6 |
| Gloss check | The check on a split Romanian noun ignores capitals (Câine + le at the start of a sentence) | 7 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "neut-i-stem" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Movable ν" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "by the word that follows" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: three numbers, each at least `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 9 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 2, 4.4: σε as a preposition fused with the article in six forms, stored as data, with a review item | 1 |
| 4.2, 5.3: the five meanings on the slot, the Meaning control, the Romanian and English word of each | 1 |
| 5.3: the σε panel (fused row, example, six forms in Improver, σε in the other prepositions' table) | 1 |
| 6.6: the nouns σπίτι, δρόμος, θάλασσα | 2 |
| 4.4: one token with two parts, one chip, each part opening its own panel, gloss units linking to either part | 3 |
| 7: the validator rules for σε and a fused token | 1, 3 |
| 6.1: phrases 57 to 62 and the *Places* theme | 4 |
| 5.2: preposition-meaning, preposition-article-fusion, direction-and-place, indirect-object-dative | 5 |
| 9, 23: the review additions and the decisions | 6 |
