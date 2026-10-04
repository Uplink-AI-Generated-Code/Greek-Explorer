# Question Words, Ας and the New Words Implementation Plan (Plan 7)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the question words (τι, πού, πότε, γιατί, πώς, ποιος, πόσος), the particle ας with a fifth mood (the hortative), the words ώρα, κάνω, από and μέχρι, and phrases 40 to 53.

**Architecture:** The hortative is `ας` + the subjunctive form, so it reuses the subjunctive builders: a new `Mood`, two `STRUCTURE` rows with the particle `as`, and one more case in the Romanian and English generators. The question words that never change are a new part of speech (`interrogative`) with its own slot, lexeme type and panel; ποιος and πόσος are ordinary `GreekQuantifier` lexemes flagged as question words, restricted to the subject and object roles. A preposition may govern a question word, so compound questions (από πού, μέχρι πότε, τι ώρα) are separate tokens that each link to their own gloss unit. Pronouns in every form, λέω and phrases 54 to 56 are Plan 8.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 5.2, 5.3, 6.1, 6.4, 6.6, 7 and 20; the repository is at commit fb98170 or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes, two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase and divergence row has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what `compose` produces, ignoring capitals and trailing punctuation (the validator checks it). The Greek question mark is the semicolon (`;`) and stays on the token's text.
- Colour is never the only signal, and `lang` attributes follow the existing components (this plan adds no new component).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement.

1. **English hortative.** One rendering per person: *let me eat*, *may you eat* (both second persons), *let him / her eat*, *let's eat*, *let them eat*; negated: *let's not eat*. The English cell takes the pronoun slot's word from `EnParts.pronoun`. The spec's alternative for the second person ("go ahead and eat") is left to the content review. There is no English "How to read this" line for the hortative, because the word-by-word shapes would drop the pronoun.
2. **Prepositions and question words.** A preposition token may govern a noun or an interrogative (τι, πού, πότε, γιατί, πώς). ποιος and πόσος after a preposition are out of scope (no phrase needs them), so the validator and the panel accept only the interrogative.
3. **Fused Romanian words.** `GreekInterrogative.roAfter` stores the Romanian word after a given preposition when it is one fused word (πού after από is *de unde*; πότε after μέχρι is *până când*). Every other pair is the preposition's Romanian word + the question word's (*de la ce*).
4. **ποιος and πόσος.** `question: 'who' | 'amount'` and `cases: ['nom', 'acc']` on the lexeme. ποιος uses the plain "How many?" control, πόσος the existing mass / count control. Romanian: *care* before a noun, *cine* on its own; *cât, câtă, câți, câte* for πόσος. The Romanian object role adds *pe* (*pe cine*), which the cells do not show; this is in the review list.
5. **A quantifier with no noun token** (Ποιος είναι;, Πόσο κάνει;) starts its panel with a noun of its Greek gender: σκύλος (m), αλεπού (f) or παιδί (n), chosen so that Romanian shows *cine* and *cât*. The validator lets a pronoun-use quantifier have no `agreesWith`.
6. **Nouns with an irregular cell.** `GreekNoun.overrides` (keyed `'pl-gen'`) stores a whole cell, as verbs do. ώρα (class `fem-a`) uses it for the genitive plural ωρών.
7. **Delivery.** From this plan the picker lists 53 phrases (1 to 53); phrases 54 to 56 arrive with Plan 8. The pronoun rules are unchanged: `slotProblem` still refuses pronouns outside commands.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `Mood` gains `hortative`; `Slot` gains `{ pos: 'interrogative' }`; new `GreekInterrogative`; `GreekQuantifier` gains `question` and `cases`; `GreekNoun` gains `overrides`; `NounClass` gains `fem-a`; a divergence may name several lexemes |
| `src/engine/{tenses,compose,romanian,english,labels,reading,greek,quantifier}.ts` | the hortative everywhere a mood is switched on; `inflectInterrogative`; `inflectNoun` overrides; `offeredCases` |
| `src/data/{lexemes,paradigms,readings,review,phrases,divergences}.ts` | the particle ας, five question words, ποιος, πόσος, από, μέχρι, ώρα, κάνω, the `fem-a` table, phrases 40 to 53, thirteen comparison rows |
| `src/panels/{interrogative,preposition,quantifier,panels,verb}.ts` | the question-word panel (new); the preposition panel with a question word; the quantifier panel for question words; the hortative lines |
| `src/validate/validate.ts` | the hortative offers rule, the interrogative checks, question-word quantifiers, a preposition before a question word |
| `src/components/ComparisonTable.tsx` | a divergence row may name several lexemes |
| tests | one new test file per task, plus the count updates the new mood forces (15 to 17 combinations) |

---

### Task 1: The hortative mood (ας + the subjunctive form)

**Files:**
- Create (test): `src/engine/hortative.test.ts`
- Create (test): `src/validate/hortative-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/readings.ts`
- Modify: `src/engine/compose.ts`
- Modify: `src/engine/english.ts`
- Modify: `src/engine/labels.ts`
- Modify: `src/engine/reading.ts`
- Modify: `src/engine/romanian.ts`
- Modify: `src/engine/tenses.ts`
- Modify: `src/panels/verb.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/engine/offers.test.ts`
- Modify (test): `src/engine/tenses.test.ts`
- Modify (test): `src/engine/verbs-greek.test.ts`
- Modify (test): `src/panels/object.test.ts`
- Modify (test): `src/panels/verb.test.ts`

**Interfaces:**
- Consumes: `compose`, `STRUCTURE`, `roVerb`, `enVerb`, the subjunctive builders and the `offers` of each verb (all from Plans 3 to 6).
- Produces: `Mood` includes `'hortative'`; `MOODS` and `TENSES_OF_MOOD.hortative = ['present', 'aorist']`; `STRUCTURE['hortative.present' | 'hortative.aorist']` with `particle: 'as'`; the particle lexeme `as` (ας); `HORTATIVE_ALL` in the verb data; `EnParts.pronoun?: string`; the validator rule that a voice offering the hortative offers the subjunctive present and aorist.

The hortative adds a fifth mood, so every count in the existing tests that says 15 mood and tense combinations becomes 17 (the diffs below change them). Every verb that offers the subjunctive present and aorist also offers the hortative: θέλω, τρώω, πάω, δίνω, πλένω (both voices), κοιμάμαι. έχω, είμαι, ψήνω and μπορεί do not.

- [ ] **Step 1: Write the tests**

Create `src/engine/hortative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Person, SlotOf } from '../types';
import { compose } from './compose';
import { enVerb, enVerbText } from './english';
import { EN_PRONOUNS, moodLabel, tenseLabel } from './labels';
import { isOffered } from './offers';
import { readingFor } from './reading';
import { roVerb } from './romanian';
import { whoIndex } from './tenses';

const hortative = (
  tense: 'present' | 'aorist',
  person: Person,
  number: 'sg' | 'pl',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb',
  person,
  number,
  mood: 'hortative',
  tense,
  voice: 'active',
  ...(negative ? { polarity: 'negative' as const } : {}),
});

const troo = getVerb('troo');
const pao = getVerb('pao');
const text = (slot: SlotOf<'verb'>, verb = troo) => compose(verb, slot).text;

describe('the hortative: Greek', () => {
  it('is ας + the aorist-subjunctive or the present form, in every person', () => {
    expect(text(hortative('aorist', 1, 'pl'))).toBe('ας φάμε');
    expect(text(hortative('aorist', 3, 'sg'))).toBe('ας φάει');
    expect(text(hortative('aorist', 1, 'sg'))).toBe('ας φάω');
    expect(text(hortative('present', 1, 'pl'))).toBe('ας τρώμε');
    expect(text(hortative('present', 3, 'pl'))).toBe('ας τρώνε');
  });

  it('puts μην after ας', () => {
    expect(text(hortative('aorist', 1, 'pl', true), pao)).toBe('ας μην πάμε');
    const pieces = compose(pao, hortative('aorist', 1, 'pl', true)).pieces;
    expect(pieces.map((p) => p.kind)).toEqual(['particle', 'negation', 'verb']);
    expect(pieces[0]).toMatchObject({ lexeme: 'as', text: 'ας' });
  });

  it('is offered by the verbs that offer the subjunctive present and aorist, and by no other', () => {
    expect(isOffered(troo, hortative('aorist', 1, 'pl'))).toBe(true);
    expect(isOffered(getVerb('echo'), hortative('aorist', 1, 'pl'))).toBe(false);
    expect(isOffered(getVerb('eimai'), hortative('present', 1, 'pl'))).toBe(false);
  });
});

describe('the hortative: Romanian and English', () => {
  it('Romanian is să + the subjunctive, with să nu for the negative', () => {
    expect(roVerb(troo, hortative('aorist', 1, 'pl'))).toBe('să mâncăm');
    expect(roVerb(troo, hortative('aorist', 3, 'sg'))).toBe('să mănânce');
    expect(roVerb(pao, hortative('aorist', 1, 'pl', true))).toBe('să nu mergem');
  });

  it('English changes with the person: let me, may you, let him / her, let\'s, let them', () => {
    const say = (person: Person, number: 'sg' | 'pl', negative = false) => {
      const slot = hortative('aorist', person, number, negative);
      return enVerbText(troo, slot, EN_PRONOUNS[whoIndex(slot)]);
    };
    expect(say(1, 'sg')).toBe('let me eat');
    expect(say(2, 'sg')).toBe('may you eat');
    expect(say(3, 'sg')).toBe('let him / her eat');
    expect(say(1, 'pl')).toBe("let's eat");
    expect(say(2, 'pl')).toBe('may you eat');
    expect(say(3, 'pl')).toBe('let them eat');
    expect(say(1, 'pl', true)).toBe("let's not eat");
    expect(say(3, 'sg', true)).toBe('let him / her not eat');
  });

  it('gives the pronoun slot of the English cell the word it shows', () => {
    expect(enVerb(troo, hortative('aorist', 1, 'pl'))).toMatchObject({ lead: '', subject: true, pronoun: "let's" });
    expect(enVerb(troo, hortative('aorist', 1, 'sg'))).toMatchObject({ lead: 'let', pronoun: 'me' });
  });
});

describe('the hortative: labels and reading', () => {
  it('has labels at both levels', () => {
    expect(moodLabel('beginner', 'hortative')).toBe("let's / let him");
    expect(moodLabel('improver', 'hortative')).toBe('hortative');
    expect(tenseLabel('improver', 'hortative', 'aorist')).toBe('aorist');
    expect(tenseLabel('beginner', 'hortative', 'present')).toBe('let us (do), ongoing');
  });

  it('takes ας φάμε apart, with ας as a particle part', () => {
    const reading = readingFor(troo, hortative('aorist', 1, 'pl'));
    expect(reading.el.parts.map((p) => [p.role, p.label])).toEqual([
      ['particle', 'ας'],
      ['stem', 'φά-'],
      ['ending', '-με'],
    ]);
    expect(reading.el.parts[0].gloss).toBe('let');
    expect(reading.el.improver).toBe('Hortative aorist: ας + aorist-subjunctive form (stem φά- + ending -με).');
    expect(reading.ro?.parts.map((p) => p.text)).toEqual(['să', 'mâncăm']);
    expect(reading.en).toBeUndefined();
  });

  it('puts the Romanian negation after să', () => {
    const reading = readingFor(pao, hortative('aorist', 1, 'pl', true));
    expect(reading.ro?.parts.map((p) => p.text)).toEqual(['să', 'nu', 'mergem']);
  });
});
```

Create `src/validate/hortative-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekVerb } from '../types';
import { validate } from './validate';

const echo = LEXEMES.echo as GreekVerb;

describe('the hortative in the validator', () => {
  it('accepts the real data', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });

  it('refuses a hortative on a verb that does not offer the subjunctive present and aorist', () => {
    const bad: GreekVerb = {
      ...echo,
      voices: { active: { ...echo.voices.active!, offers: { ...echo.voices.active!.offers, hortative: ['present', 'aorist'] } } },
    };
    const errors = validate({ lexemes: { ...LEXEMES, echo: bad }, phrases: [] });
    expect(errors).toContain('lexeme echo: the active voice offers the hortative but not the subjunctive present and aorist');
  });
});
```

Change `src/engine/offers.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -17,5 +17,5 @@
   it('lists voices, moods and tenses in their canonical order', () => {
     expect(offeredVoices(thelo)).toEqual(['active']);
-    expect(offeredMoods(thelo, 'active')).toEqual(['indicative', 'subjunctive', 'conditional']);
+    expect(offeredMoods(thelo, 'active')).toEqual(['indicative', 'subjunctive', 'conditional', 'hortative']);
     expect(offeredTenses(thelo, 'active', 'indicative')).toEqual([
       'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
@@ -58,6 +58,6 @@
   it('lists every offered slot once', () => {
     const slots = allVerbSlots(thelo);
-    expect(slots).toHaveLength(13 * 6);
-    expect(new Set(slots.map((s) => JSON.stringify(s))).size).toBe(13 * 6);
+    expect(slots).toHaveLength(15 * 6);
+    expect(new Set(slots.map((s) => JSON.stringify(s))).size).toBe(15 * 6);
     expect(slots.every((s) => isOffered(thelo, s))).toBe(true);
   });
```

Change `src/engine/tenses.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -3,8 +3,8 @@
 
 describe('tenses', () => {
-  it('has the 15 mood and tense combinations of the spec', () => {
-    expect(MOODS).toEqual(['indicative', 'subjunctive', 'imperative', 'conditional']);
-    expect(MOODS.flatMap((m) => TENSES_OF_MOOD[m])).toHaveLength(15);
-    expect(Object.keys(STRUCTURE)).toHaveLength(15);
+  it('has the 17 mood and tense combinations of the spec', () => {
+    expect(MOODS).toEqual(['indicative', 'subjunctive', 'imperative', 'conditional', 'hortative']);
+    expect(MOODS.flatMap((m) => TENSES_OF_MOOD[m])).toHaveLength(17);
+    expect(Object.keys(STRUCTURE)).toHaveLength(17);
   });
 
@@ -19,4 +19,6 @@
     expect(mainFormKind('imperative', 'present')).toBe('impPresent');
     expect(mainFormKind('imperative', 'aorist')).toBe('impAorist');
+    expect(mainFormKind('hortative', 'present')).toBe('present');
+    expect(mainFormKind('hortative', 'aorist')).toBe('subjAorist');
     expect(mainFormKind('conditional', 'imperfect')).toBe('imperfect');
     expect(mainFormKind('conditional', 'pluperfect')).toBe('base');
```

Change `src/engine/verbs-greek.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -119,10 +119,10 @@
   });
 
-  it('counts the slots: 13 combinations × 6 persons, plus the imperative for τρώω and πλένω', () => {
-    expect(allVerbSlots(getVerb('troo'))).toHaveLength(13 * 6 + 4);
-    expect(allVerbSlots(getVerb('pao'))).toHaveLength(13 * 6);
-    expect(allVerbSlots(getVerb('koimamai'))).toHaveLength(13 * 6);
-    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'active')).toHaveLength(13 * 6 + 4);
-    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'mediopassive')).toHaveLength(7 * 6);
+  it('counts the slots: 15 combinations × 6 persons, plus the imperative for τρώω and πλένω', () => {
+    expect(allVerbSlots(getVerb('troo'))).toHaveLength(15 * 6 + 4);
+    expect(allVerbSlots(getVerb('pao'))).toHaveLength(15 * 6);
+    expect(allVerbSlots(getVerb('koimamai'))).toHaveLength(15 * 6);
+    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'active')).toHaveLength(15 * 6 + 4);
+    expect(allVerbSlots(getVerb('pleno')).filter((s) => s.voice === 'mediopassive')).toHaveLength(9 * 6);
     expect(allVerbSlots(getVerb('echo'))).toHaveLength(5 * 6);
     expect(allVerbSlots(getVerb('mporei'))).toHaveLength(1);
```

Change `src/panels/object.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -63,5 +63,5 @@
     const improver = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver');
     expect(improver.full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
-    expect(improver.overview).toHaveLength(15);
+    expect(improver.overview).toHaveLength(17);
   });
 
```

Change `src/panels/verb.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -55,5 +55,5 @@
     const p = panel('thelo', vs('indicative', 'present'));
     expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);
-    expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional']);
+    expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional', 'hortative']);
     expect(control(p, 'tense')?.options.map((o) => o.value)).toHaveLength(8);
     expect(control(p, 'mood')?.label).toBe('Mood');
@@ -152,5 +152,5 @@
     const p = panel('troo', vs('indicative', 'perfect', 1), 'improver');
     const overview = p.overview ?? [];
-    expect(overview).toHaveLength(15);
+    expect(overview).toHaveLength(17);
     expect(overview[0].label).toBe('indicative · present');
     expect(richText(overview[0].el)).toBe('(εγώ) τρώω');
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/hortative.test.ts src/validate/hortative-validate.test.ts`

Expected: FAIL (`hortative` is not a mood yet; the count tests that changed also fail).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -423,6 +423,13 @@
 const CONDITIONAL_ALL: Tense[] = ['imperfect', 'pluperfect'];
 const IMPERATIVE_ALL: Tense[] = ['present', 'aorist'];
+/** The hortative (ας + the subjunctive) goes with the subjunctive present and aorist (spec 4.3). */
+const HORTATIVE_ALL: Tense[] = ['present', 'aorist'];
 /** Every mood except the imperative, which only some verbs offer. */
-const OFFERS_NO_IMPERATIVE = { indicative: INDICATIVE_ALL, subjunctive: SUBJUNCTIVE_ALL, conditional: CONDITIONAL_ALL };
+const OFFERS_NO_IMPERATIVE = {
+  indicative: INDICATIVE_ALL,
+  subjunctive: SUBJUNCTIVE_ALL,
+  conditional: CONDITIONAL_ALL,
+  hortative: HORTATIVE_ALL,
+};
 
 const thelo: GreekVerb = {
@@ -768,4 +775,5 @@
         indicative: ['present', 'imperfect', 'aorist', 'perfect', 'pluperfect'],
         subjunctive: ['present', 'aorist'],
+        hortative: HORTATIVE_ALL,
       },
       ro: {
@@ -906,4 +914,16 @@
 };
 
+const as: GreekParticle = {
+  id: 'as',
+  pos: 'particle',
+  lemma: 'ας',
+  verified: { el: false, ro: false, en: false },
+  ro: 'să (+ verb)',
+  en: "let / let's",
+  meaning:
+    'Suggests or allows: ας φάμε "let\'s eat", ας φάει "let him eat". Where να gives a wish or a purpose (θέλω να φάω), ας invites or permits.',
+  example: { el: 'ας φάμε', ro: 'să mâncăm', en: "let's eat" },
+};
+
 const min: GreekParticle = {
   id: 'min',
@@ -968,4 +988,5 @@
   [theta.id]: theta,
   [na.id]: na,
+  [as.id]: as,
   [den.id]: den,
   [min.id]: min,
```

Change `src/data/readings.ts` (unified diff):

```diff
@@ -23,4 +23,5 @@
   theta: 'will',
   na: 'to / that',
+  as: 'let',
   den: 'not',
   min: 'not',
@@ -108,4 +109,6 @@
   'conditional.imperfect': ['would', 'INF'],
   'conditional.pluperfect': ['would', 'be', 'PART'],
+  'hortative.present': ['to', 'VERB'],
+  'hortative.aorist': ['to', 'VERB'],
 };
 
```

Change `src/engine/compose.ts` (unified diff):

```diff
@@ -124,9 +124,11 @@
 
   const structure = structureOf(slot.mood, slot.tense);
-  const negation = negative ? wordPiece('negation', slot.mood === 'subjunctive' ? 'min' : 'den') : null;
+  // μην follows να and ας; δεν goes in front of everything else.
+  const afterParticle = slot.mood === 'subjunctive' || slot.mood === 'hortative';
+  const negation = negative ? wordPiece('negation', afterParticle ? 'min' : 'den') : null;
   const pieces: Piece[] = [];
-  if (negation && slot.mood !== 'subjunctive') pieces.push(negation);
+  if (negation && !afterParticle) pieces.push(negation);
   if (structure.particle) pieces.push(wordPiece('particle', structure.particle));
-  if (negation && slot.mood === 'subjunctive') pieces.push(negation);
+  if (negation && afterParticle) pieces.push(negation);
   if (structure.aux) {
     const auxSlot: SlotOf<'verb'> = {
```

Change `src/engine/english.ts` (unified diff):

```diff
@@ -25,6 +25,12 @@
   subject: boolean;
   verb: string;
+  /** The word shown where the subject pronoun stands, when it is not the usual one: "me" in "let me eat". */
+  pronoun?: string;
 }
 
+/** "let me", "let's", "let him / her", "let them"; the second person is "may you" (spec 5.2, hortative-persons). */
+const HORTATIVE_LEAD = ['let', 'may', 'let', '', 'may', 'let'];
+const HORTATIVE_WHO = ['me', 'you', 'him / her', "let's", 'you', 'them'];
+
 /** The pronouns after an English command: "eat it", "give me", "give it to me" (the direct pronoun comes first). */
 function enObjects(clitics: readonly Clitic[]): string {
@@ -44,5 +50,10 @@
   const presentNot = en.modal ? `${present} not` : `${DONT[i]} ${en.base}`;
   const self = en.reflexive ? ` (${SELF[i]})` : '';
-  const parts = (verb: string, lead = '', subject = true): EnParts => ({ lead, subject, verb: `${verb}${self}` });
+  const parts = (verb: string, lead = '', subject = true, pronoun?: string): EnParts => ({
+    lead,
+    subject,
+    verb: `${verb}${self}`,
+    ...(pronoun ? { pronoun } : {}),
+  });
   switch (`${s.mood}.${s.tense}`) {
     case 'indicative.present':
@@ -69,4 +80,7 @@
     case 'imperative.aorist':
       return parts(`${negative ? `don't ${en.base}` : en.base}${enObjects(s.clitics ?? [])}`, '', false);
+    case 'hortative.present':
+    case 'hortative.aorist':
+      return parts(`${negative ? 'not ' : ''}${en.base}`, HORTATIVE_LEAD[i], true, HORTATIVE_WHO[i]);
     case 'conditional.imperfect':
       return parts(`${negative ? "wouldn't" : 'would'} ${en.base}`);
@@ -81,5 +95,5 @@
 export function enVerbText(v: GreekVerb, s: SlotOf<'verb'>, pronoun: string): string {
   const p = enVerb(v, s);
-  return [p.lead, p.subject ? pronoun : '', p.verb].filter((part) => part !== '').join(' ');
+  return [p.lead, p.subject ? (p.pronoun ?? pronoun) : '', p.verb].filter((part) => part !== '').join(' ');
 }
 
```

Change `src/engine/labels.ts` (unified diff):

```diff
@@ -41,6 +41,18 @@
 
 const MOOD_LABEL: Record<Level, Record<Mood, string>> = {
-  beginner: { indicative: 'a fact', subjunctive: 'wish or possibility', imperative: 'a command', conditional: 'would' },
-  improver: { indicative: 'indicative', subjunctive: 'subjunctive', imperative: 'imperative', conditional: 'conditional' },
+  beginner: {
+    indicative: 'a fact',
+    subjunctive: 'wish or possibility',
+    imperative: 'a command',
+    conditional: 'would',
+    hortative: "let's / let him",
+  },
+  improver: {
+    indicative: 'indicative',
+    subjunctive: 'subjunctive',
+    imperative: 'imperative',
+    conditional: 'conditional',
+    hortative: 'hortative',
+  },
 };
 
@@ -63,4 +75,6 @@
     'conditional.imperfect': 'would do',
     'conditional.pluperfect': 'would have done',
+    'hortative.present': 'let us (do), ongoing',
+    'hortative.aorist': 'let us (do), once',
   },
   improver: {
@@ -80,4 +94,6 @@
     'conditional.imperfect': 'θα + imperfect',
     'conditional.pluperfect': 'θα + pluperfect',
+    'hortative.present': 'present',
+    'hortative.aorist': 'aorist',
   },
 };
```

Change `src/engine/reading.ts` (unified diff):

```diff
@@ -97,5 +97,6 @@
   } else {
     const base = RO_SHAPES[`${slot.mood}.${slot.tense}`];
-    if (base) shape = !negative ? base : slot.mood === 'subjunctive' ? [base[0], 'NOT', ...base.slice(1)] : ['NOT', ...base];
+    const afterParticle = slot.mood === 'subjunctive' || slot.mood === 'hortative';
+    if (base) shape = !negative ? base : afterParticle ? [base[0], 'NOT', ...base.slice(1)] : ['NOT', ...base];
   }
   const text = roVerb(verb, slot);
@@ -108,4 +109,6 @@
   // The fused forms with pronouns (mănâncă-o, nu-l mânca) do not fit the word-by-word shapes.
   if ((slot.clitics ?? []).length > 0) return undefined;
+  // "let me / let him / may you" carry a pronoun the word-by-word shapes leave out.
+  if (slot.mood === 'hortative') return undefined;
   const en = voiceOf(verb, slot.voice).en;
   const parts = enVerb(verb, slot);
```

Change `src/engine/romanian.ts` (unified diff):

```diff
@@ -59,4 +59,7 @@
     case 'subjunctive.present':
     case 'subjunctive.aorist':
+    // The hortative is the subjunctive: ας φάμε is *să mâncăm* (spec 6.4).
+    case 'hortative.present':
+    case 'hortative.aorist':
       return `să ${nu}${ro.subjunctive[i]}`;
     case 'subjunctive.perfect':
```

Change `src/engine/tenses.ts` (unified diff):

```diff
@@ -1,5 +1,5 @@
 import type { Mood, Num, Person, Tense } from '../types';
 
-export const MOODS: Mood[] = ['indicative', 'subjunctive', 'imperative', 'conditional'];
+export const MOODS: Mood[] = ['indicative', 'subjunctive', 'imperative', 'conditional', 'hortative'];
 
 export const TENSES_OF_MOOD: Record<Mood, Tense[]> = {
@@ -8,4 +8,5 @@
   imperative: ['present', 'aorist'],
   conditional: ['imperfect', 'pluperfect'],
+  hortative: ['present', 'aorist'],
 };
 
@@ -16,5 +17,5 @@
   /** The lexical verb's contribution. */
   form: FormKind;
-  particle?: 'theta' | 'na';
+  particle?: 'theta' | 'na' | 'as';
   /** έχω, in the present or the imperfect, carrying the person. */
   aux?: 'present' | 'imperfect';
@@ -38,4 +39,6 @@
   'conditional.imperfect': { form: 'imperfect', particle: 'theta' },
   'conditional.pluperfect': { form: 'base', particle: 'theta', aux: 'imperfect' },
+  'hortative.present': { form: 'present', particle: 'as' },
+  'hortative.aorist': { form: 'subjAorist', particle: 'as' },
 };
 
```

Change `src/panels/verb.ts` (unified diff):

```diff
@@ -64,4 +64,6 @@
   'conditional.imperfect': 'Greek has no conditional forms: θα + the imperfect says "would". It is also the polite way to ask: θα ήθελα.',
   'conditional.pluperfect': 'θα + the past perfect says "would have": what would have happened.',
+  'hortative.present': 'ας + the present form suggests or allows something ongoing: ας τρώμε, "let\'s eat (regularly)". Where να gives a wish or a purpose, ας invites or permits.',
+  'hortative.aorist': 'ας + the aorist-subjunctive form suggests or allows something once: ας φάμε, "let\'s eat"; ας φάει, "let him eat". It looks like the subjunctive with ας in place of να.',
 };
 
@@ -81,5 +83,5 @@
   const { show, impersonal } = pronounCells(verb, slot);
   const en = enVerb(verb, slot);
-  const enPronoun = impersonal ? 'it' : EN_PRONOUNS[index];
+  const enPronoun = impersonal ? 'it' : (en.pronoun ?? EN_PRONOUNS[index]);
   const label = impersonal ? 'it' : whoOptions[index].label;
   const lead: Rich = en.lead ? [{ text: en.lead, role: 'plain' }, SPACE] : [];
@@ -107,4 +109,5 @@
   subjunctive: 'μην goes after να: να μην φάω.',
   imperative: 'A negative command is not the imperative: Greek uses μην + the subjunctive form, as in μην φας.',
+  hortative: 'μην goes after ας: ας μην φάμε.',
 };
 
```

Change `src/types.ts` (unified diff):

```diff
@@ -13,8 +13,9 @@
 export type QuantifierUse = 'determiner' | 'pronoun';
 
-export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional';
+export type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional' | 'hortative';
 // Indicative: present, imperfect, aorist, future (θα + present), futureSimple (θα + aorist subjunctive),
 // perfect, pluperfect, futurePerfect. Subjunctive: present, aorist, perfect. Imperative: present, aorist
 // (second person only). Conditional: imperfect (θα + imperfect) and pluperfect (θα + pluperfect).
+// Hortative: present and aorist, ας + the subjunctive form (ας φάμε), every person.
 export type Tense =
   | 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple' | 'perfect' | 'pluperfect' | 'futurePerfect';
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -142,4 +142,10 @@
       }
     }
+    for (const [name, voice] of Object.entries(l.voices)) {
+      const subjunctive = voice?.offers.subjunctive ?? [];
+      if ((voice?.offers.hortative ?? []).length > 0 && !(subjunctive.includes('present') && subjunctive.includes('aorist'))) {
+        errors.push(`lexeme ${l.id}: the ${name} voice offers the hortative but not the subjunctive present and aorist`);
+      }
+    }
     const slots = allVerbSlots(l).flatMap((s): SlotOf<'verb'>[] => [
       s,
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 984 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/hortative.test.ts src/validate/hortative-validate.test.ts src/data/lexemes.ts src/data/readings.ts src/engine/compose.ts src/engine/english.ts src/engine/labels.ts src/engine/offers.test.ts src/engine/reading.ts src/engine/romanian.ts src/engine/tenses.test.ts src/engine/tenses.ts src/engine/verbs-greek.test.ts src/panels/object.test.ts src/panels/verb.test.ts src/panels/verb.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the hortative mood (ας + the subjunctive form)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Question words that never change

**Files:**
- Create: `src/panels/interrogative.ts`
- Create (test): `src/panels/interrogative.test.ts`
- Create (test): `src/validate/interrogative-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `Slot`, `GreekLexeme`, `inflect`, `buildPanel`, `applyControl`, `validate` and `slotsFor`.
- Produces: `Slot` `{ pos: 'interrogative' }`; `GreekInterrogative` (`ro`, `en`, `meaning`, `question`, optional `answer`, optional `roAfter`); `inflectInterrogative`; `interrogativePanel(word, level)`; the lexemes `ti`, `pou`, `pote`, `giati` and `pos-how`; the prepositions `apo` (από) and `mexri` (μέχρι) as data only (Task 4 adds them to the preposition table).

The five words that never change (τι, πού, πότε, γιατί, πώς) are one part of speech with one slot. από and μέχρι are added here as lexemes because `roAfter` is validated against them; they join the Improver table in Task 4.

- [ ] **Step 1: Write the tests**

Create `src/panels/interrogative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { richText } from '../engine/segments';
import type { GreekInterrogative } from '../types';
import { applyControl, buildPanel } from './panels';
import { interrogativePanel } from './interrogative';

const word = (id: string) => getLexeme(id) as GreekInterrogative;
const cells = (id: string) =>
  interrogativePanel(word(id), 'beginner').rows.map((r) => [r.label, richText(r.el), richText(r.ro), richText(r.en)]);

describe('the question words', () => {
  it('never change: one form for the one slot', () => {
    expect(inflect(word('pou'), { pos: 'interrogative' })).toEqual({ stem: 'πού', ending: '' });
  });

  it('τι: the word on its own and in a question', () => {
    expect(cells('ti')).toEqual([
      ['on its own', 'τι', 'ce', 'what'],
      ['in a question', 'Τι θέλεις;', 'Ce vrei?', 'What do you want?'],
    ]);
  });

  it('γιατί has a third row, "as an answer"', () => {
    expect(cells('giati')).toEqual([
      ['on its own', 'γιατί', 'de ce', 'why'],
      ['in a question', 'Γιατί δεν τρως;', 'De ce nu mănânci?', "Why aren't you eating?"],
      ['as an answer', 'γιατί δεν θέλω', 'pentru că nu vreau', "because I don't want to"],
    ]);
  });

  it('has no controls and no paradigm, and labels the part of speech at both levels', () => {
    const beginner = interrogativePanel(word('pote'), 'beginner');
    expect(beginner.controls).toEqual([]);
    expect(beginner.full).toEqual([]);
    expect(beginner.posLabel).toBe('question word: when');
    expect(interrogativePanel(word('pote'), 'improver').posLabel).toBe('interrogative · never changes');
    expect(beginner.plain).toContain('μέχρι');
  });

  it('opens through buildPanel and ignores the role control', () => {
    const token = { text: 'Πού', lexeme: 'pou', slot: { pos: 'interrogative' as const } };
    const state = { slot: token.slot, noun: null, nounNumber: 'sg' as const };
    expect(buildPanel(state, token, 'beginner').lemma).toBe('πού');
    expect(applyControl(state, 'case', 'gen')).toBe(state);
  });
});
```

Create `src/validate/interrogative-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekInterrogative } from '../types';
import { slotsFor, validate } from './validate';

const pou = LEXEMES.pou as GreekInterrogative;
const check = (word: GreekInterrogative) => validate({ lexemes: { ...LEXEMES, pou: word }, phrases: [] });

describe('the question words in the validator', () => {
  it('has one slot, and the real data is valid', () => {
    expect(slotsFor(pou)).toEqual([{ pos: 'interrogative' }]);
    expect(check(pou)).toEqual([]);
  });

  it('refuses an empty text', () => {
    expect(check({ ...pou, ro: '' })).toEqual([
      'lexeme pou: an empty Romanian, English, meaning or example text',
    ]);
  });

  it('refuses a fused Romanian word after something that is not a preposition', () => {
    expect(check({ ...pou, roAfter: { thelo: 'de unde' } })).toEqual([
      'lexeme pou: roAfter names "thelo", which is not a preposition',
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/interrogative.test.ts src/validate/interrogative-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/panels/interrogative.ts`:

```ts
import { plain } from '../engine/segments';
import type { GreekInterrogative, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** τι, πού, πότε, γιατί, πώς: the word on its own, in a question and, for γιατί, as an answer (spec 5.3). */
export function interrogativePanel(word: GreekInterrogative, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({
    label,
    el: plain(el),
    ro: plain(ro),
    en: plain(en),
  });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `question word: ${word.en}` : 'interrogative · never changes',
    controls: [],
    rows: [
      row('on its own', word.lemma, word.ro, word.en),
      row('in a question', word.question.el, word.question.ro, word.question.en),
      ...(word.answer ? [row('as an answer', word.answer.el, word.answer.ro, word.answer.en)] : []),
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
@@ -5,4 +5,5 @@
   GreekClitic,
   GreekConjunction,
+  GreekInterrogative,
   GreekLexeme,
   GreekNoun,
@@ -880,4 +881,6 @@
 const me = preposition('me', 'με', 'cu', 'with', 'with');
 const gia = preposition('gia', 'για', 'pentru', 'for', 'for');
+const apo = preposition('apo', 'από', 'de la', 'from', 'from');
+const mexri = preposition('mexri', 'μέχρι', 'până la', 'until', 'until');
 
 const theta: GreekParticle = {
@@ -949,4 +952,68 @@
 };
 
+const interrogative = (
+  id: string,
+  lemma: string,
+  ro: string,
+  en: string,
+  meaning: string,
+  question: GreekInterrogative['question'],
+  extra: Pick<GreekInterrogative, 'roAfter' | 'answer'> = {},
+): GreekInterrogative => ({
+  id,
+  pos: 'interrogative',
+  lemma,
+  verified: { el: false, ro: false, en: false },
+  ro,
+  en,
+  meaning,
+  question,
+  ...extra,
+});
+
+const ti = interrogative(
+  'ti',
+  'τι',
+  'ce',
+  'what',
+  'τι means "what". It never changes, and it can stand in front of a noun: τι ώρα, "what time".',
+  { el: 'Τι θέλεις;', ro: 'Ce vrei?', en: 'What do you want?' },
+);
+const pou = interrogative(
+  'pou',
+  'πού',
+  'unde',
+  'where',
+  'πού means "where". After από it means "from where": Greek and English use two words, Romanian one (de unde).',
+  { el: 'Πού πας;', ro: 'Unde mergi?', en: 'Where are you going?' },
+  { roAfter: { apo: 'de unde' } },
+);
+const pote = interrogative(
+  'pote',
+  'πότε',
+  'când',
+  'when',
+  'πότε means "when". After μέχρι it means "until when": Romanian has the fused phrase până când.',
+  { el: 'Πότε θα φας;', ro: 'Când vei mânca?', en: 'When will you eat?' },
+  { roAfter: { mexri: 'până când' } },
+);
+const giati = interrogative(
+  'giati',
+  'γιατί',
+  'de ce',
+  'why',
+  'γιατί means both "why" (in a question) and "because" (in an answer). Romanian has two words, de ce and pentru că.',
+  { el: 'Γιατί δεν τρως;', ro: 'De ce nu mănânci?', en: "Why aren't you eating?" },
+  { answer: { el: 'γιατί δεν θέλω', ro: 'pentru că nu vreau', en: "because I don't want to" } },
+);
+const posHow = interrogative(
+  'pos-how',
+  'πώς',
+  'cum',
+  'how',
+  'πώς means "how". It never changes.',
+  { el: 'Πώς είσαι;', ro: 'Cum ești?', en: 'How are you?' },
+);
+
 const clitic: GreekClitic = { id: 'clitic', pos: 'clitic', lemma: 'το', verified: { el: false, ro: false, en: false } };
 
@@ -986,4 +1053,6 @@
   [me.id]: me,
   [gia.id]: gia,
+  [apo.id]: apo,
+  [mexri.id]: mexri,
   [theta.id]: theta,
   [na.id]: na,
@@ -993,4 +1062,9 @@
   [an.id]: an,
   [clitic.id]: clitic,
+  [ti.id]: ti,
+  [pou.id]: pou,
+  [pote.id]: pote,
+  [giati.id]: giati,
+  [posHow.id]: posHow,
 };
 
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -23,4 +23,5 @@
   GreekClitic,
   GreekConjunction,
+  GreekInterrogative,
   GreekParticle,
   GreekPreposition,
@@ -172,4 +173,8 @@
 }
 
+export function inflectInterrogative(l: GreekInterrogative, _s: SlotOf<'interrogative'>): Form {
+  return { stem: l.lemma, ending: '' };
+}
+
 export function inflect(l: GreekLexeme, s: Slot): Form {
   if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
@@ -195,4 +200,6 @@
     case 'particle':
       return inflectParticle(l, s as SlotOf<'particle'>);
+    case 'interrogative':
+      return inflectInterrogative(l, s as SlotOf<'interrogative'>);
   }
 }
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -8,4 +8,5 @@
   GreekAdjective,
   GreekConjunction,
+  GreekInterrogative,
   GreekNoun,
   GreekNumeral,
@@ -30,4 +31,5 @@
 import { cliticPanel, withWho } from './clitic';
 import { conjunctionPanel } from './conjunction';
+import { interrogativePanel } from './interrogative';
 import { quantifierPanel } from './quantifier';
 import type { Panel, PanelState } from './types';
@@ -78,4 +80,6 @@
     case 'conjunction':
       return conjunctionPanel(lexeme as GreekConjunction, level);
+    case 'interrogative':
+      return interrogativePanel(lexeme as GreekInterrogative, level);
     case 'quantifier':
       return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
@@ -117,5 +121,12 @@
       break;
     case 'case':
-      if (slot.pos !== 'verb' && slot.pos !== 'preposition' && slot.pos !== 'particle' && slot.pos !== 'conjunction' && slot.pos !== 'clitic') {
+      if (
+        slot.pos !== 'verb' &&
+        slot.pos !== 'preposition' &&
+        slot.pos !== 'particle' &&
+        slot.pos !== 'conjunction' &&
+        slot.pos !== 'interrogative' &&
+        slot.pos !== 'clitic'
+      ) {
         return { ...state, slot: { ...slot, case: value as Case } };
       }
```

Change `src/types.ts` (unified diff):

```diff
@@ -83,4 +83,5 @@
   | { pos: 'particle' }
   | { pos: 'conjunction' }
+  | { pos: 'interrogative' }
   | ({ pos: 'clitic' } & Clitic);
 
@@ -318,4 +319,19 @@
 }
 
+/** A question word that never changes: τι, πού, πότε, γιατί, πώς (spec 5.3). ποιος and πόσος are quantifiers. */
+export interface GreekInterrogative extends LexemeBase {
+  pos: 'interrogative';
+  ro: string;
+  en: string;
+  /** One line of meaning for the panel. */
+  meaning: string;
+  /** The Romanian word after a preposition, where it is one fused word (de unde, până când), by preposition id. */
+  roAfter?: Record<string, string>;
+  /** An example question in each language. */
+  question: { el: string; ro: string; en: string };
+  /** γιατί is also "because": the word used as an answer. */
+  answer?: { el: string; ro: string; en: string };
+}
+
 /** The weak pronoun as a word of its own: the panel a clitic piece of a verb group opens (spec 5.3). */
 export interface GreekClitic extends LexemeBase {
@@ -332,5 +348,5 @@
 
 export type GreekLexeme =
-  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekQuantifier;
+  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekQuantifier | GreekInterrogative;
 
 export type TokenIndex = number;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -63,4 +63,6 @@
     case 'conjunction':
       return [{ pos: 'conjunction' }];
+    case 'interrogative':
+      return [{ pos: 'interrogative' }];
     case 'clitic':
       return cliticSlots();
@@ -184,4 +186,11 @@
     if (isEmpty(l.ro) || isEmpty(l.en) || isEmpty(l.example.el)) errors.push(`lexeme ${l.id}: empty Romanian, English or example`);
   }
+  if (l.pos === 'interrogative') {
+    const texts = [l.ro, l.en, l.meaning, ...Object.values(l.question), ...Object.values(l.answer ?? { el: 'x' })];
+    if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian, English, meaning or example text`);
+    for (const key of Object.keys(l.roAfter ?? {})) {
+      if (lexemes[key]?.pos !== 'preposition') errors.push(`lexeme ${l.id}: roAfter names "${key}", which is not a preposition`);
+    }
+  }
   if (l.pos === 'clitic') {
     for (const slot of cliticSlots()) {
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 992 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/interrogative.test.ts src/panels/interrogative.ts src/validate/interrogative-validate.test.ts src/data/lexemes.ts src/engine/greek.ts src/panels/panels.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the question words that never change

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: ποιος and πόσος

**Files:**
- Create (test): `src/engine/question-quantifiers.test.ts`
- Create (test): `src/panels/question-quantifier.test.ts`
- Create (test): `src/validate/question-quantifier-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/paradigms.ts`
- Modify: `src/engine/quantifier.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/quantifier.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `GreekQuantifier`, `quantifierSlots`, `quantifierPanel`, `QUANTIFIER_FORMS`, `applyControl`, `initialState` and `numberControl`.
- Produces: `GreekQuantifier.question?: 'who' | 'amount'` and `cases?: Case[]`; `offeredCases(q)`; `QUANTIFIER_FORMS.poios`; the lexemes `poios` and `posos`; `applyControl(state, 'number', …)` for quantifiers; a default noun for a quantifier with no noun token; the validator rules for question-word quantifiers.

ποιος and πόσος are quantifier lexemes (spec 4.2): the same panel, the same Romanian cells, restricted to the subject and object roles. ποιος has its own table (ποιος, ποια, ποιο; ποιοι, ποιες, ποια); πόσος takes the adjective endings on the stem πόσ-.

- [ ] **Step 1: Write the tests**

Create `src/engine/question-quantifiers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { offeredCases, quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = (id: string) => getLexeme(id) as GreekQuantifier;
const slot = (g: Gender, n: Num, c: Case, patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier', gender: g, number: n, case: c, degree: 'plain', use: 'determiner', ...patch,
});
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflectQuantifier(q(id), s));

describe('ποιος', () => {
  it.each([
    ['m', 'sg', 'nom', 'ποιος'], ['f', 'sg', 'nom', 'ποια'], ['n', 'sg', 'nom', 'ποιο'],
    ['m', 'sg', 'acc', 'ποιον'], ['f', 'sg', 'acc', 'ποια'], ['n', 'sg', 'acc', 'ποιο'],
    ['m', 'pl', 'nom', 'ποιοι'], ['f', 'pl', 'nom', 'ποιες'], ['n', 'pl', 'nom', 'ποια'],
    ['m', 'pl', 'acc', 'ποιους'], ['f', 'pl', 'acc', 'ποιες'], ['n', 'pl', 'acc', 'ποια'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('poios', slot(g, n, c))).toBe(expected);
  });

  it('is cine on its own and care before a noun; English who and which', () => {
    expect(roQuantifier(q('poios'), slot('m', 'sg', 'nom', { use: 'pronoun' }), 'm')).toBe('cine');
    expect(roQuantifier(q('poios'), slot('n', 'sg', 'acc'), 'f')).toBe('care');
    expect(enQuantifier(q('poios'), slot('m', 'sg', 'nom', { use: 'pronoun' }))).toBe('who');
    expect(enQuantifier(q('poios'), slot('n', 'sg', 'acc'))).toBe('which');
  });
});

describe('πόσος', () => {
  it.each([
    ['m', 'sg', 'nom', 'πόσος'], ['f', 'sg', 'nom', 'πόση'], ['n', 'sg', 'acc', 'πόσο'],
    ['m', 'pl', 'nom', 'πόσοι'], ['f', 'pl', 'acc', 'πόσες'], ['n', 'pl', 'nom', 'πόσα'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('posos', slot(g, n, c))).toBe(expected);
  });

  it('is cât, câtă, câți, câte, and "how much" or "how many"', () => {
    expect(roQuantifier(q('posos'), slot('n', 'sg', 'acc'), 'f')).toBe('câtă');
    expect(roQuantifier(q('posos'), slot('n', 'sg', 'acc'), 'm')).toBe('cât');
    expect(roQuantifier(q('posos'), slot('m', 'pl', 'nom'), 'm')).toBe('câți');
    expect(roQuantifier(q('posos'), slot('f', 'pl', 'nom'), 'f')).toBe('câte');
    expect(enQuantifier(q('posos'), slot('n', 'sg', 'acc'))).toBe('how much');
    expect(enQuantifier(q('posos'), slot('n', 'pl', 'acc'))).toBe('how many');
  });
});

describe('the roles of a question word', () => {
  it('are the subject and the object only', () => {
    expect(offeredCases(q('poios'))).toEqual(['nom', 'acc']);
    expect(offeredCases(q('polys'))).toEqual(['nom', 'acc', 'gen']);
    expect(quantifierSlots(q('posos')).every((s) => s.case !== 'gen')).toBe(true);
    // 3 genders × 2 numbers × 2 roles × 2 uses
    expect(quantifierSlots(q('posos'))).toHaveLength(24);
  });
});
```

Create `src/panels/question-quantifier.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Token } from '../types';
import { applyControl, buildPanel, initialState } from './panels';
import type { PanelState } from './panels';

const slotOf = (patch: Record<string, unknown> = {}) =>
  ({ pos: 'quantifier', gender: 'n', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner', ...patch }) as Token['slot'] & { pos: 'quantifier' };
const panelFor = (lexeme: string, slot: ReturnType<typeof slotOf>, noun: string, level: 'beginner' | 'improver' = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: slot.number };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const control = (p: ReturnType<typeof panelFor>, key: string) => p.controls.find((c) => c.key === key);

describe('πόσος and ποιος: the panel', () => {
  it('πόσος with ψωμί: a mass noun reads "how much", and the badge says question word', () => {
    const p = panelFor('posos', slotOf(), 'psomi');
    expect(p.lemma).toBe('πόσος / πόση / πόσο');
    expect(cells(p, 0)).toEqual({ el: 'πόσο ψωμί', ro: 'câtă pâine', en: 'how much bread' });
    expect(cells(p, 1)).toEqual({ el: 'πόσο', ro: 'câtă', en: 'how much' });
    expect(p.badge).toBe('question word');
    expect(p.posLabel).toBe('question word: how much');
    expect(p.plain).toContain('mass reading');
  });

  it('πόσος offers the kind control; ποιος offers "how many?" instead', () => {
    expect(control(panelFor('posos', slotOf(), 'psomi'), 'kind')?.value).toBe('mass');
    const who = panelFor('poios', slotOf({ gender: 'm', case: 'nom' }), 'skylos');
    expect(control(who, 'kind')).toBeUndefined();
    expect(control(who, 'number')?.options.map((o) => o.label)).toEqual(['one', 'many']);
    expect(who.plain).not.toContain('mass reading');
  });

  it('offers the subject and object roles only', () => {
    const p = panelFor('poios', slotOf({ gender: 'm', case: 'nom' }), 'skylos', 'improver');
    expect(control(p, 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(p.full).toHaveLength(6);
    expect(p.full.map((r) => r.label)).toEqual([
      'masc. nominative', 'masc. accusative', 'fem. nominative', 'fem. accusative', 'neut. nominative', 'neut. accusative',
    ]);
  });

  it('ποιος on its own is who and cine, before a noun which and care', () => {
    const p = panelFor('poios', slotOf({ gender: 'm', case: 'nom', use: 'pronoun' }), 'skylos');
    expect(cells(p, 0)).toEqual({ el: 'ποιος σκύλος', ro: 'care câine', en: 'which dog' });
    expect(cells(p, 1)).toEqual({ el: 'ποιος', ro: 'cine', en: 'who' });
  });

  it('the number control changes the number of a quantifier', () => {
    const state: PanelState = { slot: slotOf({ gender: 'm', case: 'nom' }), noun: 'skylos', nounNumber: 'sg' };
    const next = applyControl(state, 'number', 'pl');
    expect(next.slot).toMatchObject({ number: 'pl' });
  });

  it('a quantifier with no noun token starts with a noun of its gender (Ποιος είναι;)', () => {
    const token: Token = { text: 'Ποιος', lexeme: 'poios', slot: slotOf({ gender: 'm', case: 'nom', use: 'pronoun' }) };
    const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens: [token], glosses: [], verified: false };
    expect(initialState(token, phrase).noun).toBe('skylos');
    const f = { ...token, slot: slotOf({ gender: 'f' }) };
    expect(initialState(f, { ...phrase, tokens: [f] }).noun).toBe('alepou');
    const n = { ...token, slot: slotOf({ gender: 'n' }) };
    expect(initialState(n, { ...phrase, tokens: [n] }).noun).toBe('paidi');
  });
});
```

Create `src/validate/question-quantifier-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekQuantifier, Phrase, Token } from '../types';
import { validate } from './validate';

const poios = LEXEMES.poios as GreekQuantifier;
const real = { lexemes: LEXEMES, phrases: PHRASES };

/** Phrase 1 with its first token replaced by a ποιος token, which needs no noun. */
const withToken = (patch: Partial<Token>): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) =>
    i === 0
      ? {
          text: 'Ποιος',
          lexeme: 'poios',
          slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'nom', degree: 'plain', use: 'pronoun' },
          ...patch,
        }
      : t,
  ),
});

describe('question-word quantifiers in the validator', () => {
  it('accepts the real data', () => {
    expect(validate({ ...real, phrases: [] })).toEqual([]);
  });

  it('accepts ποιος on its own with no noun', () => {
    expect(validate({ ...real, phrases: [withToken({})] })).toEqual([]);
  });

  it('still wants a noun when ποιος stands beside one', () => {
    const phrase = withToken({ slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'nom', degree: 'plain', use: 'determiner' } });
    expect(validate({ ...real, phrases: [phrase] })).toContain(
      'ordering-hot-coffee token 0 (Ποιος): quantifier needs agreesWith pointing at a noun',
    );
  });

  it('refuses the genitive in a token and in the lexeme data', () => {
    const token = withToken({ text: 'ποιου', slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'gen', degree: 'plain', use: 'pronoun' } });
    expect(validate({ ...real, phrases: [token] })).toContain('ordering-hot-coffee token 0 (ποιου): poios does not offer the gen role');
    const wide: GreekQuantifier = { ...poios, cases: ['nom', 'acc', 'gen'] };
    expect(validate({ lexemes: { ...LEXEMES, poios: wide }, phrases: [] })).toContain(
      'lexeme poios: a question word offers the subject and object roles only',
    );
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/question-quantifiers.test.ts src/panels/question-quantifier.test.ts src/validate/question-quantifier-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -418,4 +418,51 @@
 };
 
+const poios: GreekQuantifier = {
+  id: 'poios',
+  pos: 'quantifier',
+  lemma: 'ποιος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { table: 'poios' } },
+  numbers: ['sg', 'pl'],
+  question: 'who',
+  cases: ['nom', 'acc'],
+  meaning:
+    'ποιος means "who" on its own and "which" in front of a noun (ποιο ψωμί, "which bread"). It changes with gender, number and role, like κάποιος. Romanian splits it into cine (who) and care (which).',
+  ro: {
+    lemma: 'care',
+    plain: {
+      determiner: { m: { sg: ro1('care'), pl: ro1('care') }, f: { sg: ro1('care'), pl: ro1('care') } },
+      pronoun: { m: { sg: ro1('cine'), pl: ro1('cine') }, f: { sg: ro1('cine'), pl: ro1('cine') } },
+    },
+  },
+  en: { plain: { determiner: { sg: 'which', pl: 'which' }, pronoun: { sg: 'who', pl: 'who' } } },
+};
+
+const posos: GreekQuantifier = {
+  id: 'posos',
+  pos: 'quantifier',
+  lemma: 'πόσος',
+  verified: { el: false, ro: false, en: false },
+  greek: { plain: { stem: 'πόσ' } },
+  numbers: ['sg', 'pl'],
+  question: 'amount',
+  cases: ['nom', 'acc'],
+  meaning:
+    'πόσος asks "how much" with a mass noun (πόσο ψωμί) and "how many" with a count noun (πόσα ψωμιά). It declines like an adjective; Romanian cât, câtă, câți, câte changes too, English does not.',
+  ro: {
+    lemma: 'cât',
+    plain: {
+      determiner: { m: { sg: ro1('cât'), pl: ro1('câți') }, f: { sg: ro1('câtă'), pl: ro1('câte') } },
+      pronoun: { m: { sg: ro1('cât'), pl: ro1('câți') }, f: { sg: ro1('câtă'), pl: ro1('câte') } },
+    },
+  },
+  en: {
+    plain: {
+      determiner: { sg: 'how much', pl: 'how many' },
+      pronoun: { sg: 'how much', pl: 'how many' },
+    },
+  },
+};
+
 const INDICATIVE_ALL: Tense[] = [
   'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
@@ -1038,4 +1085,6 @@
   [polys.id]: polys,
   [ligos.id]: ligos,
+  [poios.id]: poios,
+  [posos.id]: posos,
   [thelo.id]: thelo,
   [pidao.id]: pidao,
```

Change `src/data/paradigms.ts` (unified diff):

```diff
@@ -218,5 +218,17 @@
  * κάποιος keeps the final ν of the masculine accusative; κανένας follows the numeral ένας; πολύς has two stems.
  */
-export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys', PairTable> = {
+export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys' | 'poios', PairTable> = {
+  poios: {
+    sg: {
+      nom: { m: ['ποι', 'ος'], f: ['ποι', 'α'], n: ['ποι', 'ο'] },
+      acc: { m: ['ποι', 'ον'], f: ['ποι', 'α'], n: ['ποι', 'ο'] },
+      gen: { m: ['ποι', 'ου'], f: ['ποι', 'ας'], n: ['ποι', 'ου'] },
+    },
+    pl: {
+      nom: { m: ['ποι', 'οι'], f: ['ποι', 'ες'], n: ['ποι', 'α'] },
+      acc: { m: ['ποι', 'ους'], f: ['ποι', 'ες'], n: ['ποι', 'α'] },
+      gen: { m: ['ποι', 'ων'], f: ['ποι', 'ων'], n: ['ποι', 'ων'] },
+    },
+  },
   kapoios: {
     sg: {
```

Change `src/engine/quantifier.ts` (unified diff):

```diff
@@ -6,4 +6,7 @@
 
 /** The degrees a quantifier has: the comparative only where its data has one. */
+/** The roles a quantifier offers: all three, or the few its data names (the question words). */
+export const offeredCases = (q: GreekQuantifier): Case[] => q.cases ?? CASES;
+
 export const offeredDegrees = (q: GreekQuantifier): QuantifierDegree[] =>
   q.greek.comparative ? ['plain', 'comparative'] : ['plain'];
@@ -16,5 +19,5 @@
   return GENDERS.flatMap((gender) =>
     q.numbers.flatMap((number) =>
-      CASES.flatMap((c) =>
+      offeredCases(q).flatMap((c) =>
         offeredDegrees(q).flatMap((degree) =>
           offeredSenses(q).flatMap((sense) =>
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -48,4 +48,5 @@
     if (direct) noun = nounForClitic(direct);
   }
+  if (!noun && token.slot.pos === 'quantifier') noun = DEFAULT_NOUN[token.slot.gender];
   return {
     slot: token.slot,
@@ -55,4 +56,7 @@
 }
 
+/** The noun a quantifier panel shows when the phrase has none (ποιος είναι;): one of each Greek gender. */
+const DEFAULT_NOUN: Record<Gender, string> = { m: 'skylos', f: 'alepou', n: 'paidi' };
+
 export const sameState = (a: PanelState, b: PanelState): boolean => JSON.stringify(a) === JSON.stringify(b);
 
@@ -133,5 +137,5 @@
       break;
     case 'number':
-      if (slot.pos === 'adjective' || slot.pos === 'article') {
+      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'quantifier') {
         return { ...state, slot: { ...slot, number: value as Num } };
       }
```

Change `src/panels/quantifier.ts` (unified diff):

```diff
@@ -2,10 +2,10 @@
 import { inflectNoun, inflectQuantifier } from '../engine/greek';
 import { degreeOptions, kindOptions, senseOptions } from '../engine/labels';
-import { offeredDegrees, offeredSenses } from '../engine/quantifier';
+import { offeredCases, offeredDegrees, offeredSenses } from '../engine/quantifier';
 import { roBareNoun, roQuantifier } from '../engine/romanian';
 import { formRich, joinRich, notice, numeralRich, plain, richText, type Rich } from '../engine/segments';
 import { NOT_YET_ADDED, storedText } from '../engine/stored';
-import type { Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
-import { CASES, GENDERS, GENDER_ROW, caseControl, caseName, nounControl, nounOf } from './shared';
+import type { Case, Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
+import { GENDERS, GENDER_ROW, caseControl, caseName, nounControl, nounOf, numberControl } from './shared';
 import type { Control, Panel, PanelRow, PanelState, Related } from './types';
 
@@ -45,5 +45,5 @@
 function quantifierFull(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow[] {
   return GENDERS.flatMap((g) =>
-    CASES.map((c) => {
+    offeredCases(q).map((c) => {
       const s: SlotOf<'quantifier'> = { ...here, gender: g, case: c, use: 'determiner' };
       return {
@@ -59,7 +59,15 @@
 
 function controls(q: GreekQuantifier, slot: SlotOf<'quantifier'>, state: PanelState, level: Level): Control[] {
-  const list: Control[] = [nounControl('Noun it goes with', state), caseControl(slot, level)];
+  const role = caseControl(slot, level);
+  const list: Control[] = [
+    nounControl('Noun it goes with', state),
+    { ...role, options: role.options.filter((o) => offeredCases(q).includes(o.value as Case)) },
+  ];
   if (q.numbers.length > 1) {
-    list.push({ key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' });
+    list.push(
+      q.question === 'who'
+        ? numberControl(slot.number)
+        : { key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' },
+    );
   }
   if (offeredDegrees(q).length > 1) {
@@ -77,4 +85,5 @@
   if (how.table === 'kanenas') return 'quantifier · declines like the numeral ένας';
   if (how.table === 'polys') return 'quantifier · two stems (πολύ-, πολλ-)';
+  if (how.table === 'poios') return 'quantifier · declines like κάποιος, with a plural';
   return 'quantifier · singular only';
 }
@@ -138,7 +147,13 @@
     posLabel:
       level === 'beginner'
-        ? `quantifier: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined })}`
+        ? `${q.question ? 'question word' : 'quantifier'}: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined })}`
         : improverLabel(q),
-    badge: q.numbers.length > 1 ? (slot.number === 'sg' ? 'mass reading' : 'count reading') : undefined,
+    badge: q.question
+      ? 'question word'
+      : q.numbers.length > 1
+        ? slot.number === 'sg'
+          ? 'mass reading'
+          : 'count reading'
+        : undefined,
     controls: controls(q, slot, state, level),
     rows: [withNoun, alone, ...(negation ? [negation] : [])],
@@ -146,5 +161,5 @@
     plain:
       q.meaning +
-      (q.numbers.length > 1
+      (q.numbers.length > 1 && q.question !== 'who'
         ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
         : '') +
```

Change `src/types.ts` (unified diff):

```diff
@@ -157,5 +157,5 @@
  * (the stem-stressed endings, or the ending-stressed ones when `stressed` is set: μερικός, μερικοί).
  */
-export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' } | { stem: string; stressed?: true };
+export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' | 'poios' } | { stem: string; stressed?: true };
 
 /** One Romanian cell: nominative-accusative and genitive-dative. `gen` is absent where the form is not covered (a stand-alone genitive pronoun, spec 6.3). */
@@ -177,4 +177,11 @@
   /** One line of meaning for the panel. */
   meaning: string;
+  /**
+   * A question word (ποιος, πόσος). `who` takes the number control "one / many", `amount` the kind control
+   * "a mass / separate things" (spec 5.3).
+   */
+  question?: 'who' | 'amount';
+  /** The roles the panel may offer; absent means all three. Question words offer the subject and object only (spec 4.2). */
+  cases?: Case[];
   ro: {
     lemma: string;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -1,4 +1,4 @@
 import { inflect } from '../engine/greek';
-import { quantifierSlots } from '../engine/quantifier';
+import { offeredCases, quantifierSlots } from '../engine/quantifier';
 import { allVerbSlots, isOffered, shortFormOf, slotProblem } from '../engine/offers';
 import { enClitic, roClitic } from '../engine/clitics';
@@ -209,4 +209,7 @@
     if (l.numbers.length === 0) errors.push(`lexeme ${l.id}: a quantifier must offer at least one number`);
     if (l.ro.few && !l.en.few) errors.push(`lexeme ${l.id}: ro.few has no en.few`);
+    if (l.question && (!l.cases || l.cases.length === 0 || l.cases.some((c) => c === 'gen'))) {
+      errors.push(`lexeme ${l.id}: a question word offers the subject and object roles only`);
+    }
     for (const slot of quantifierSlots(l)) {
       const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
@@ -286,9 +289,12 @@
     }
   }
+  // A quantifier on its own (Ποιος είναι;) needs no noun; a quantifier that points at a noun must agree with it.
+  const aloneQuantifier = token.slot.pos === 'quantifier' && token.slot.use === 'pronoun' && token.agreesWith === undefined;
   if (
-    token.slot.pos === 'adjective' ||
-    token.slot.pos === 'numeral' ||
-    token.slot.pos === 'article' ||
-    token.slot.pos === 'quantifier'
+    !aloneQuantifier &&
+    (token.slot.pos === 'adjective' ||
+      token.slot.pos === 'numeral' ||
+      token.slot.pos === 'article' ||
+      token.slot.pos === 'quantifier')
   ) {
     const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
@@ -308,4 +314,5 @@
       errors.push(`${where}: the quantifier is ${token.slot.case} but its noun is ${target.slot.case}`);
     }
+    if (!offeredCases(lexeme).includes(token.slot.case)) errors.push(`${where}: ${lexeme.id} does not offer the ${token.slot.case} role`);
     if (token.slot.sense === 'few' && !lexeme.ro.few) errors.push(`${where}: ${lexeme.id} has no "few" sense`);
     try {
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1023 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/question-quantifiers.test.ts src/panels/question-quantifier.test.ts src/validate/question-quantifier-validate.test.ts src/data/lexemes.ts src/data/paradigms.ts src/engine/quantifier.ts src/panels/panels.ts src/panels/quantifier.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the question words ποιος and πόσος as quantifiers

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: A preposition before a question word

**Files:**
- Create (test): `src/panels/preposition-question.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/preposition.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/App.test.tsx`
- Modify (test): `src/panels/full.test.ts`
- Modify (test): `src/panels/panels.test.ts`
- Modify (test): `src/validate/question-quantifier-validate.test.ts`

**Interfaces:**
- Consumes: `prepositionPanel`, `PREPOSITIONS`, `nounOf`, `nounOptions`, `applyControl` and the `apo`, `mexri` and interrogative lexemes of Task 2.
- Produces: `PREPOSITIONS` lists από and μέχρι; `questionRow(prep, word, label)`; a preposition panel whose "after it" control also offers the question words; the validator accepts a noun or an interrogative after a preposition.

The control label changes from "Noun after it" to "Noun or question word after it", so three existing tests change with it.

- [ ] **Step 1: Write the tests**

Create `src/panels/preposition-question.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const apo: Token = { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 };
const pou: Token = { text: 'πού', lexeme: 'pou', slot: { pos: 'interrogative' } };
const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens: [apo, pou], glosses: [], verified: false } satisfies Phrase;
const state: PanelState = initialState(apo, phrase);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});

describe('a preposition before a question word', () => {
  it('starts with the question word the phrase has', () => {
    expect(state.noun).toBe('pou');
  });

  it('από πού is "from where" in Greek and English, and one Romanian word, de unde', () => {
    const panel = buildPanel(state, apo, 'beginner');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + question word']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'από πού', ro: 'de unde', en: 'from where' });
    expect(panel.controls.map((c) => c.key)).toEqual(['noun']);
    expect(panel.plain).toContain('de unde');
    expect(panel.note).toBe('');
  });

  it('μέχρι πότε is "until when" and până când', () => {
    const mexri: Token = { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 };
    const next = applyControl({ ...state, slot: mexri.slot }, 'noun', 'pote');
    expect(cells(buildPanel(next, mexri, 'beginner').rows, 0)).toEqual({ el: 'μέχρι πότε', ro: 'până când', en: 'until when' });
  });

  it('builds "preposition + question word" from the two words when Romanian has no fused one', () => {
    const next = applyControl(state, 'noun', 'ti');
    expect(cells(buildPanel(next, apo, 'beginner').rows, 0)).toEqual({ el: 'από τι', ro: 'de la ce', en: 'from what' });
  });

  it('offers the nouns and then the question words in the control, and switches back to a noun', () => {
    const options = buildPanel(state, apo, 'beginner').controls[0].options.map((o) => o.value);
    expect(options.slice(-5)).toEqual(['ti', 'pou', 'pote', 'giati', 'pos-how']);
    expect(options).toContain('skylos');
    const noun = applyControl(state, 'noun', 'skylos');
    expect(noun.noun).toBe('skylos');
    const panel = buildPanel(noun, apo, 'beginner');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
    expect(cells(panel.rows, 0)).toEqual({ el: 'από τον σκύλο', ro: 'de la câinele', en: 'from the dog' });
  });

  it('Improver lists every preposition with the question word', () => {
    const full = buildPanel(state, apo, 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
    expect(cells(full, 4)).toEqual({ el: 'από πού', ro: 'de unde', en: 'from where' });
    expect(cells(full, 5)).toEqual({ el: 'μέχρι πού', ro: 'până la unde', en: 'until where' });
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['from']);
  });
});
```

Change `src/App.test.tsx` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -128,5 +128,5 @@
     await user.click(screen.getByRole('button', { name: 'πάνω από' }));
     expect(screen.getByRole('cell', { name: 'πάνω από τον σκύλο' })).toBeInTheDocument();
-    await user.selectOptions(screen.getByLabelText('Noun after it'), 'alepou');
+    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'alepou');
     expect(screen.getByRole('cell', { name: 'πάνω από την αλεπού' })).toBeInTheDocument();
     expect(screen.getByRole('cell', { name: 'peste vulpea' })).toBeInTheDocument();
```

Change `src/panels/full.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -83,9 +83,9 @@
   });
 
-  it('preposition: the four prepositions with the same noun, the current one highlighted', () => {
+  it('preposition: the six prepositions with the same noun, the current one highlighted', () => {
     const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
     const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
     const full = buildPanel(state, token, 'improver').full;
-    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for']);
+    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for', 'from', 'until']);
     expect(cells(full[1])).toEqual({ el: 'κάτω από τον σκύλο', ro: 'sub câinele', en: 'under the dog' });
     expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
```

Change `src/panels/panels.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -211,5 +211,5 @@
     expect(panel.posLabel).toBe('preposition: over');
     expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
-    expect(panel.controls[0].label).toBe('Noun after it');
+    expect(panel.controls[0].label).toBe('Noun or question word after it');
     expect(panel.rows.map((r) => r.label)).toEqual(['prep. + noun']);
     expect(text(panel.rows, 0)).toEqual({ el: 'πάνω από τον σκύλο', ro: 'peste câinele', en: 'over the dog' });
```

Change `src/validate/question-quantifier-validate.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -48,2 +48,26 @@
   });
 });
+
+describe('a preposition before a question word', () => {
+  const withPreposition = (target: string, slot: Token['slot']): Phrase => ({
+    ...PHRASES[0],
+    tokens: [
+      { text: 'από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 },
+      { text: 'x', lexeme: target, slot },
+    ],
+  });
+
+  it('accepts a question word after the preposition', () => {
+    const phrase = withPreposition('pou', { pos: 'interrogative' });
+    expect(validate({ ...real, phrases: [phrase] }).filter((e) => e.includes('token 0'))).toEqual([]);
+  });
+
+  it('refuses a verb after the preposition', () => {
+    const phrase = withPreposition('thelo', {
+      pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active',
+    });
+    expect(validate({ ...real, phrases: [phrase] })).toContain(
+      'ordering-hot-coffee token 0 (από): preposition needs agreesWith pointing at the noun or question word it governs',
+    );
+  });
+});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/preposition-question.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -1122,5 +1122,5 @@
 
 /** The prepositions shown together in the Improver table, in display order. */
-export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia];
+export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia, apo, mexri];
 
 export function getLexeme(id: string): GreekLexeme {
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -198,4 +198,6 @@
     case 'noun': {
       const noun = getLexeme(value);
+      // After a preposition the learner may choose a question word as well as a noun (από πού).
+      if (slot.pos === 'preposition' && noun.pos === 'interrogative') return { ...state, noun: value };
       if (noun.pos !== 'noun') break;
       if (slot.pos === 'preposition') return { ...state, noun: value };
```

Change `src/panels/preposition.ts` (unified diff):

```diff
@@ -1,9 +1,26 @@
-import { PREPOSITIONS } from '../data/lexemes';
+import { LEXEMES, PREPOSITIONS, getLexeme } from '../data/lexemes';
 import { nounPhrase } from '../engine/agree';
-import { numberOptions } from '../engine/labels';
+import { numberOptions, type Option } from '../engine/labels';
 import { plain } from '../engine/segments';
-import type { GreekNoun, GreekPreposition, Level, Num } from '../types';
-import { ALL, nounControl, nounOf } from './shared';
-import type { Panel, PanelRow, PanelState } from './types';
+import type { GreekInterrogative, GreekNoun, GreekPreposition, Level, Num } from '../types';
+import { ALL, nounOf, nounOptions } from './shared';
+import type { Control, Panel, PanelRow, PanelState } from './types';
+
+/** What follows a preposition: a noun, or a question word (από πού). */
+type After = { kind: 'noun'; noun: GreekNoun } | { kind: 'question'; word: GreekInterrogative };
+
+function afterOf(state: PanelState): After {
+  const lexeme = state.noun ? getLexeme(state.noun) : undefined;
+  if (lexeme?.pos === 'interrogative') return { kind: 'question', word: lexeme };
+  return { kind: 'noun', noun: nounOf(state) };
+}
+
+/** The nouns, then the question words, for the "after it" control. */
+function afterOptions(): Option[] {
+  const words = Object.values(LEXEMES).flatMap((l) =>
+    l.pos === 'interrogative' ? [{ value: l.id, label: `${l.lemma} (${l.en})` }] : [],
+  );
+  return [...nounOptions(), ...words];
+}
 
 /** One preposition followed by the definite noun phrase in the accusative, in three languages. */
@@ -18,25 +35,46 @@
 }
 
+/** One preposition followed by a question word. Romanian fuses some pairs into one word (de unde, până când). */
+export function questionRow(prep: GreekPreposition, word: GreekInterrogative, label: string): PanelRow {
+  return {
+    label,
+    el: plain(`${prep.lemma} ${word.lemma}`),
+    ro: plain(word.roAfter?.[prep.id] ?? `${prep.ro} ${word.ro}`),
+    en: plain(`${prep.en} ${word.en}`),
+  };
+}
+
 export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
-  const noun = nounOf(state);
+  const after = afterOf(state);
+  const controls: Control[] = [
+    { key: 'noun', label: 'Noun or question word after it', options: afterOptions(), value: state.noun ?? '' },
+  ];
+  if (after.kind === 'noun') {
+    controls.push({ key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber });
+  }
   return {
     lemma: prep.lemma,
     posLabel: level === 'beginner' ? `preposition: ${prep.en}` : 'preposition · governs the accusative',
-    controls: [
-      nounControl('Noun after it', state),
-      { key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber },
+    controls,
+    rows: [
+      after.kind === 'noun'
+        ? prepositionRow(prep, after.noun, state.nounNumber, 'prep. + noun')
+        : questionRow(prep, after.word, 'prep. + question word'),
     ],
-    rows: [prepositionRow(prep, noun, state.nounNumber, 'prep. + noun')],
     full:
       level === 'improver'
         ? PREPOSITIONS.map((p) => ({
-            ...prepositionRow(p, noun, state.nounNumber, p.meaning),
+            ...(after.kind === 'noun'
+              ? prepositionRow(p, after.noun, state.nounNumber, p.meaning)
+              : questionRow(p, after.word, p.meaning)),
             hl: p.id === prep.id ? ALL : undefined,
           }))
         : [],
     plain:
-      'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.',
+      after.kind === 'noun'
+        ? 'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.'
+        : 'A question word follows a preposition as a noun would: από πού, "from where". Greek and English build it from two words; Romanian often has one fused word (de unde, până când).',
     irregular: '',
-    note: noun.note,
+    note: after.kind === 'noun' ? after.noun.note : '',
   };
 }
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -325,7 +325,7 @@
   if (token.slot.pos === 'preposition') {
     const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
-    const noun = target ? lexemes[target.lexeme] : undefined;
-    if (!noun || noun.pos !== 'noun') {
-      errors.push(`${where}: preposition needs agreesWith pointing at the noun it governs`);
+    const governed = target ? lexemes[target.lexeme] : undefined;
+    if (!governed || (governed.pos !== 'noun' && governed.pos !== 'interrogative')) {
+      errors.push(`${where}: preposition needs agreesWith pointing at the noun or question word it governs`);
     }
   }
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1031 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/preposition-question.test.ts src/App.test.tsx src/data/lexemes.ts src/panels/full.test.ts src/panels/panels.test.ts src/panels/panels.ts src/panels/preposition.ts src/validate/question-quantifier-validate.test.ts src/validate/validate.ts
git commit -m "feat: a preposition may govern a question word (από πού, μέχρι πότε)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: The noun ώρα and the verb κάνω

**Files:**
- Create (test): `src/engine/kano-ora.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/paradigms.ts`
- Modify: `src/data/review.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `inflectNoun`, `NOUN_CLASSES`, the verb data shape (`VerbVoice`) and `OFFERS_NO_IMPERATIVE`.
- Produces: `NounClass` `'fem-a'`; `GreekNoun.overrides`; the noun `ora` (ώρα, *oră*, hour); the verb `kano` (κάνω, *a face*, do / make) with every mood, the imperative and the hortative; the review item `ending-table:fem-a`.

ώρα is the first noun with a cell of its own: the accent moves in the genitive plural (ωρών). κάνω has the full standard offers; its Romanian counterpart is *a face*.

- [ ] **Step 1: Write the tests**

Create `src/engine/kano-ora.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun, getVerb } from '../data/lexemes';
import type { Mood, Person, SlotOf, Tense } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflect } from './greek';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { roVerb } from './romanian';
import { formText } from './segments';
import { whoIndex } from './tenses';

const kano = getVerb('kano');
const slot = (mood: Mood, tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg'): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active',
});
const el = (s: SlotOf<'verb'>) => compose(kano, s).text;

describe('κάνω', () => {
  it('present, imperfect and aorist', () => {
    expect([1, 2, 3].map((p) => el(slot('indicative', 'present', p as Person)))).toEqual(['κάνω', 'κάνεις', 'κάνει']);
    expect(el(slot('indicative', 'present', 3, 'pl'))).toBe('κάνουν');
    expect(el(slot('indicative', 'imperfect', 1))).toBe('έκανα');
    expect(el(slot('indicative', 'imperfect', 1, 'pl'))).toBe('κάναμε');
    expect(el(slot('indicative', 'aorist', 3))).toBe('έκανε');
    expect(el(slot('indicative', 'aorist', 2, 'pl'))).toBe('κάνατε');
  });

  it('the compound forms, the subjunctive, the commands and the hortative', () => {
    expect(el(slot('indicative', 'perfect', 1))).toBe('έχω κάνει');
    expect(el(slot('indicative', 'futureSimple', 3))).toBe('θα κάνει');
    expect(el(slot('subjunctive', 'aorist', 1))).toBe('να κάνω');
    expect(el(slot('imperative', 'aorist', 2))).toBe('κάνε');
    expect(el(slot('imperative', 'present', 2, 'pl'))).toBe('κάνετε');
    expect(el(slot('hortative', 'aorist', 1, 'pl'))).toBe('ας κάνουμε');
  });

  it('Romanian a face and English do', () => {
    expect(roVerb(kano, slot('indicative', 'present', 3))).toBe('face');
    expect(roVerb(kano, slot('indicative', 'perfect', 1))).toBe('am făcut');
    expect(roVerb(kano, slot('subjunctive', 'present', 3))).toBe('să facă');
    expect(roVerb(kano, slot('imperative', 'aorist', 2))).toBe('fă');
    const say = (s: SlotOf<'verb'>) => enVerbText(kano, s, EN_PRONOUNS[whoIndex(s)]);
    expect(say(slot('indicative', 'present', 3))).toBe('he/she does');
    expect(say({ ...slot('indicative', 'present', 1), polarity: 'negative' })).toBe("I don't do");
    expect(say(slot('indicative', 'perfect', 1))).toBe('I have done');
  });

  it('offers every mood, the imperative and the hortative included', () => {
    expect(allVerbSlots(kano)).toHaveLength(15 * 6 + 4);
  });
});

describe('ώρα', () => {
  const ora = getNoun('ora');
  const form = (number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') => formText(inflect(ora, { pos: 'noun', number, case: c }));

  it('is a feminine noun in -α, with the accent moving in the genitive plural', () => {
    expect(['nom', 'acc', 'gen'].map((c) => form('sg', c as 'nom'))).toEqual(['ώρα', 'ώρα', 'ώρας']);
    expect(['nom', 'acc', 'gen'].map((c) => form('pl', c as 'nom'))).toEqual(['ώρες', 'ώρες', 'ωρών']);
    expect(inflect(ora, { pos: 'noun', number: 'pl', case: 'gen' }).irregular?.rule).toBe('accent-moves');
    expect(inflect(ora, { pos: 'noun', number: 'sg', case: 'gen' }).irregular).toBeUndefined();
  });

  it('is oră in Romanian and "hour" in English', () => {
    expect(ora.ro.forms.sg.indefinite).toBe('o oră');
    expect(ora.ro.forms.pl.genIndefinite).toBe('unor ore');
    expect(ora.en).toEqual({ sg: 'hour', pl: 'hours' });
    expect(getLexeme('ora').pos).toBe('noun');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/kano-ora.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -148,4 +148,32 @@
 };
 
+const ora: GreekNoun = {
+  id: 'ora',
+  pos: 'noun',
+  lemma: 'ώρα',
+  verified: { el: false, ro: false, en: false },
+  gender: 'f',
+  class: 'fem-a',
+  stems: { sg: 'ώρ', pl: 'ώρ' },
+  overrides: {
+    'pl-gen': {
+      stem: 'ωρ',
+      ending: 'ών',
+      note: { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive plural: ωρών, not ώρων.' },
+    },
+  },
+  ro: {
+    lemma: 'oră',
+    gender: 'f',
+    forms: {
+      sg: { definite: 'ora', indefinite: 'o oră', genDefinite: 'orei', genIndefinite: 'unei ore' },
+      pl: { definite: 'orele', indefinite: 'ore', genDefinite: 'orelor', genIndefinite: 'unor ore' },
+    },
+    split: { sg: ['or', 'a'], pl: ['ore', 'le'] },
+  },
+  en: { sg: 'hour', pl: 'hours' },
+  note: 'Feminine in Greek and Romanian (oră). τι ώρα is literally "what hour"; English says "what time".',
+};
+
 const zestos: GreekAdjective = {
   id: 'zestos',
@@ -511,4 +539,35 @@
 };
 
+const kano: GreekVerb = {
+  id: 'kano',
+  pos: 'verb',
+  lemma: 'κάνω',
+  verified: { el: false, ro: false, en: false },
+  voices: {
+    active: {
+      lemma: 'κάνω',
+      class: 'omega',
+      stems: {
+        present: 'κάν',
+        imperfect: { strong: { augment: 'έ', stem: 'καν' }, weak: { stem: 'κάν' } },
+        aorist: { strong: { augment: 'έ', stem: 'καν' }, weak: { stem: 'κάν' } },
+        perfective: 'κάν',
+      },
+      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
+      ro: {
+        lemma: 'a face',
+        infinitive: 'face',
+        participle: 'făcut',
+        present: ['fac', 'faci', 'face', 'facem', 'faceți', 'fac'],
+        subjunctive: ['fac', 'faci', 'facă', 'facem', 'faceți', 'facă'],
+        imperfect: ['făceam', 'făceai', 'făcea', 'făceam', 'făceați', 'făceau'],
+        pluperfect: ['făcusem', 'făcuseși', 'făcuse', 'făcuserăm', 'făcuserăți', 'făcuseră'],
+        imperative: ['fă', 'faceți'],
+      },
+      en: { gloss: 'do / make', base: 'do', third: 'does', past: 'did', pastParticiple: 'done', ing: 'doing' },
+    },
+  },
+};
+
 const pidao: GreekVerb = {
   id: 'pidao',
@@ -1072,4 +1131,5 @@
   [psomi.id]: psomi,
   [nero.id]: nero,
+  [ora.id]: ora,
   [zestos.id]: zestos,
   [grigoros.id]: grigoros,
@@ -1089,4 +1149,5 @@
   [thelo.id]: thelo,
   [pidao.id]: pidao,
+  [kano.id]: kano,
   [troo.id]: troo,
   [dino.id]: dino,
```

Change `src/data/paradigms.ts` (unified diff):

```diff
@@ -13,4 +13,9 @@
     pl: { nom: 'οι', acc: 'ους', gen: 'ων' },
   },
+  /** Feminine nouns in -α: ώρα, ώρας, ώρες. */
+  'fem-a': {
+    sg: { nom: 'α', acc: 'α', gen: 'ας' },
+    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
+  },
   /** Feminine nouns in -ού: the singular does not change except in the genitive, and the plural adds -δ-. */
   'fem-ou': {
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -7,4 +7,5 @@
   { id: 'ending-table:masc-os', kind: 'ending-table', verified: false },
   { id: 'ending-table:fem-ou', kind: 'ending-table', verified: false },
+  { id: 'ending-table:fem-a', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-i', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -39,4 +39,8 @@
 
 export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
+  const override = l.overrides?.[`${s.number}-${s.case}`];
+  if (override) {
+    return { stem: override.stem, ending: override.ending, ...(override.note ? { irregular: override.note } : {}) };
+  }
   const form: Form = { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
   const note = NOUN_NOTES[l.class]?.[`${s.number}-${s.case}` as const];
```

Change `src/types.ts` (unified diff):

```diff
@@ -103,5 +103,5 @@
 }
 
-export type NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i' | 'neut-o';
+export type NounClass = 'masc-es' | 'masc-os' | 'fem-a' | 'fem-ou' | 'neut-i' | 'neut-o';
 
 export interface GreekNoun extends LexemeBase {
@@ -114,4 +114,6 @@
   enPronoun?: string;
   stems: Record<Num, string>;
+  /** A cell that breaks its class pattern, keyed '<number>-<case>' ('pl-gen'); the whole cell is stored. */
+  overrides?: Partial<Record<`${Num}-${Case}`, { stem: string; ending: string; note?: IrregularNote }>>;
   ro: {
     lemma: string;
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1037 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/kano-ora.test.ts src/data/lexemes.ts src/data/paradigms.ts src/data/review.ts src/engine/greek.ts src/types.ts
git commit -m "feat: the noun ώρα and the verb κάνω

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Phrases 40 to 53

**Files:**
- Create (test): `src/App.questions.test.tsx`
- Create (test): `src/data/phrases-questions.test.ts`
- Modify: `src/data/phrases.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: All the lexemes of Tasks 1 to 5, and the `rows`, `u`, `p`, `qslot` and `vslot` helpers at the top of `src/data/phrases.ts`.
- Produces: Fourteen phrases: `what-do-you-want`, `where-are-you-going`, `when-will-you-eat`, `why-arent-you-eating`, `how-are-you`, `who-is-it`, `how-much-bread`, `where-are-you-from`, `until-when-will-you-go`, `what-time-is-it`, `how-much-is-it`, `lets-eat`, `let-him-eat`, `lets-not-go`; the picker lists 53 phrases.

Phrases 40 to 50 are in the new theme *Questions*; 51 to 53 join *Wishes and possibility*. Compound questions are separate tokens: από πού is two tokens (a preposition with `agreesWith: 1`, then the question word), τι ώρα is a question word and a noun, πόσο κάνει is a quantifier on its own and a verb. English "do" in the natural row of a question is an unlinked unit (`link: null`, shown dashed).

- [ ] **Step 1: Write the tests**

Create `src/App.questions.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('the question words and the hortative in the app', () => {
  it('opens a question word, and shows an example question in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'What do you want?');
    await user.click(screen.getByRole('button', { name: 'Τι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ce' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'What do you want?' })).toBeInTheDocument();
    expect(screen.getByText('question word: what')).toBeInTheDocument();
  });

  it('opens από before πού, switches the question word and the noun after it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Where are you from?');
    await user.click(screen.getByRole('button', { name: 'Από' }));
    expect(screen.getByRole('heading', { level: 2, name: 'από' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'από πού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'de unde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'from where' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'skylos');
    expect(screen.getByRole('cell', { name: 'από τον σκύλο' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('opens ποιος on its own (no noun in the phrase) and shows the question-word badge', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Who is it?');
    await user.click(screen.getByRole('button', { name: 'Ποιος' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ποιος / ποια / ποιο' })).toBeInTheDocument();
    expect(screen.getByText('question word')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'cine' })).toBeInTheDocument();
    const roles = screen.getByLabelText('Role in sentence');
    expect(within(roles).getAllByRole('option').map((o) => o.textContent)).toEqual(['subject', 'object']);
  });

  it('the price idiom: πόσο on its own, κάνει literally "does"', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'How much is it?');
    await user.click(screen.getByRole('button', { name: 'Πόσο' }));
    expect(screen.getByRole('cell', { name: 'cât' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'κάνει;' }));
    expect(screen.getByRole('heading', { level: 2, name: 'κάνω' })).toBeInTheDocument();
  });

  it("opens ας from Let's eat! and takes the form apart", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "Let's eat!");
    expect(screen.getByRole('cell', { name: '(εμείς) ας φάμε' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "let's eat" })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(noi) să mâncăm' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ας' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to the verb/ })).toBeInTheDocument();
  });

  it('changes the mood of θέλω to the hortative at both levels', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Mood'), 'hortative');
    expect(screen.getByRole('cell', { name: '(εγώ) ας θέλω' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'let me want' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Who?'), '1pl');
    expect(screen.getByRole('cell', { name: "(εμείς) ας θέλουμε" })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "let's want" })).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-questions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate } from '../validate/validate';
import { PHRASES } from './phrases';

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

const QUESTIONS = [
  'what-do-you-want', 'where-are-you-going', 'when-will-you-eat', 'why-arent-you-eating', 'how-are-you', 'who-is-it',
  'how-much-bread', 'where-are-you-from', 'until-when-will-you-go', 'what-time-is-it', 'how-much-is-it',
];
const HORTATIVES = ['lets-eat', 'let-him-eat', 'lets-not-go'];

describe('phrases 40 to 53', () => {
  it('validate against the data', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are in the Questions theme (40 to 50) and Wishes and possibility (51 to 53)', () => {
    expect(QUESTIONS.map((id) => phrase(id).theme)).toEqual(QUESTIONS.map(() => 'Questions'));
    expect(HORTATIVES.map((id) => phrase(id).theme)).toEqual(HORTATIVES.map(() => 'Wishes and possibility'));
  });

  it('the questions read as the spec says, in the three languages', () => {
    const read = (id: string) => [
      phrase(id).tokens.map((t) => t.text).join(' '),
      gloss(id, 'en', 'natural'),
      gloss(id, 'ro', 'natural'),
    ];
    expect(read('what-do-you-want')).toEqual(['Τι θέλεις;', 'What do you want?', 'Ce vrei?']);
    expect(read('where-are-you-going')).toEqual(['Πού πας;', 'Where are you going?', 'Unde mergi?']);
    expect(read('when-will-you-eat')).toEqual(['Πότε θα φας;', 'When will you eat?', 'Când vei mânca?']);
    expect(read('why-arent-you-eating')).toEqual(['Γιατί δεν τρως;', "Why aren't you eating?", 'De ce nu mănânci?']);
    expect(read('how-are-you')).toEqual(['Πώς είσαι;', 'How are you?', 'Cum ești?']);
    expect(read('who-is-it')).toEqual(['Ποιος είναι;', 'Who is it?', 'Cine este?']);
    expect(read('how-much-bread')).toEqual(['Πόσο ψωμί θέλεις;', 'How much bread do you want?', 'Câtă pâine vrei?']);
    expect(read('where-are-you-from')).toEqual(['Από πού είσαι;', 'Where are you from?', 'De unde ești?']);
    expect(read('until-when-will-you-go')).toEqual(['Μέχρι πότε θα πας;', 'Until when will you go?', 'Până când vei merge?']);
    expect(read('what-time-is-it')).toEqual(['Τι ώρα είναι;', 'What time is it?', 'Ce oră este?']);
    expect(read('how-much-is-it')).toEqual(['Πόσο κάνει;', 'How much is it?', 'Cât costă?']);
  });

  it('the hortatives read as the spec says', () => {
    const read = (id: string) => [phrase(id).tokens[0].text, gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('lets-eat')).toEqual(['Ας φάμε!', "Let's eat!", 'Să mâncăm!']);
    expect(read('let-him-eat')).toEqual(['Ας φάει.', 'Let him / her eat.', 'Să mănânce.']);
    expect(read('lets-not-go')).toEqual(['Ας μην πάμε.', "Let's not go.", 'Să nu mergem.']);
  });

  it('the literal rows show what each language builds from', () => {
    expect(gloss('where-are-you-from', 'en', 'literal')).toBe('from where (you) are');
    expect(gloss('what-time-is-it', 'en', 'literal')).toBe('what hour is');
    expect(gloss('how-much-is-it', 'en', 'literal')).toBe('how-much (it) does');
    expect(gloss('how-much-is-it', 'ro', 'literal')).toBe('cât (el) face');
    expect(gloss('lets-not-go', 'en', 'literal')).toBe('let not (we) go');
  });

  it('keep the compound questions as separate tokens, each with its own gloss link', () => {
    const from = phrase('where-are-you-from');
    expect(from.tokens.map((t) => t.lexeme)).toEqual(['apo', 'pou', 'eimai']);
    const linked = from.glosses[1].units.flatMap((u) => ('link' in u && u.link !== null ? [u.link] : []));
    expect(linked).toEqual([0, 1, 2]);
    expect(phrase('what-time-is-it').tokens.map((t) => t.lexeme)).toEqual(['ti', 'ora', 'eimai']);
  });

  it('show the unlinked "do" of an English question as a dropped word', () => {
    const units = phrase('what-do-you-want').glosses[0].units;
    expect(units.find((u) => 'text' in u && u.text === 'do')).toEqual({ text: 'do', link: null });
  });

  it('Ποιος είναι; has no noun token and Πόσο κάνει; is the price idiom', () => {
    expect(phrase('who-is-it').tokens[0].agreesWith).toBeUndefined();
    expect(phrase('how-much-is-it').tokens.map((t) => t.lexeme)).toEqual(['posos', 'kano']);
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 39 phrases in the spec order', () => {
+  it('the picker lists all 53 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -95,4 +95,7 @@
       'eat-it', 'wash-it', 'give-it-to-me', 'dont-eat-it', 'eat-bare',
       'want-not-to-go',
+      'what-do-you-want', 'where-are-you-going', 'when-will-you-eat', 'why-arent-you-eating', 'how-are-you',
+      'who-is-it', 'how-much-bread', 'where-are-you-from', 'until-when-will-you-go', 'what-time-is-it',
+      'how-much-is-it', 'lets-eat', 'let-him-eat', 'lets-not-go',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.questions.test.tsx src/data/phrases-questions.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -923,4 +923,263 @@
 };
 
+/** A question word that never changes (τι, πού, πότε, γιατί, πώς). */
+const iq: Slot = { pos: 'interrogative' };
+/** A hortative slot: ας + the subjunctive form. */
+const hslot = (tense: Tense, person: Person, number: Num, negative = false): Slot => ({
+  ...(vslot('hortative', tense, person, number) as SlotOf<'verb'>),
+  ...(negative ? { polarity: 'negative' as const } : {}),
+});
+const present = (person: Person, number: Num = 'sg', negative = false): Slot => ({
+  ...(vslot('indicative', 'present', person, number) as SlotOf<'verb'>),
+  ...(negative ? { polarity: 'negative' as const } : {}),
+});
+
+const whatDoYouWant: Phrase = {
+  id: 'what-do-you-want',
+  title: 'What do you want?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Τι', lexeme: 'ti', slot: iq },
+    { text: 'θέλεις;', lexeme: 'thelo', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('What', 0), u('do', null), u('you want?', 1)],
+    [u('what', 0), u('(you)', null), u('want', 1)],
+    [u('Ce', 0), u('vrei?', 1)],
+    [u('ce', 0), u('(tu)', null), u('vrei', 1)],
+  ),
+  verified: false,
+};
+
+const whereAreYouGoing: Phrase = {
+  id: 'where-are-you-going',
+  title: 'Where are you going?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πού', lexeme: 'pou', slot: iq },
+    { text: 'πας;', lexeme: 'pao', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('Where', 0), u('are you going?', 1)],
+    [u('where', 0), u('(you)', null), u('go', 1)],
+    [u('Unde', 0), u('mergi?', 1)],
+    [u('unde', 0), u('(tu)', null), u('mergi', 1)],
+  ),
+  verified: false,
+};
+
+const whenWillYouEat: Phrase = {
+  id: 'when-will-you-eat',
+  title: 'When will you eat?',
+  theme: 'Questions',
+  level: 'improver',
+  tokens: [
+    { text: 'Πότε', lexeme: 'pote', slot: iq },
+    { text: 'θα φας;', lexeme: 'troo', slot: vslot('indicative', 'futureSimple', 2) },
+  ],
+  glosses: rows(
+    [u('When', 0), u('will you', p(1, 0)), u('eat?', p(1, 1))],
+    [u('when', 0), u('will', p(1, 0)), u('(you)', null), u('eat', p(1, 1))],
+    [u('Când', 0), u('vei', p(1, 0)), u('mânca?', p(1, 1))],
+    [u('când', 0), u('vei', p(1, 0)), u('mânca', p(1, 1))],
+  ),
+  verified: false,
+};
+
+const whyArentYouEating: Phrase = {
+  id: 'why-arent-you-eating',
+  title: "Why aren't you eating?",
+  theme: 'Questions',
+  level: 'improver',
+  tokens: [
+    { text: 'Γιατί', lexeme: 'giati', slot: iq },
+    { text: 'δεν τρως;', lexeme: 'troo', slot: present(2, 'sg', true) },
+  ],
+  glosses: rows(
+    [u('Why', 0), u("aren't you", p(1, 0)), u('eating?', p(1, 1))],
+    [u('why', 0), u('not', p(1, 0)), u('(you)', null), u('eat', p(1, 1))],
+    [u('De ce', 0), u('nu', p(1, 0)), u('mănânci?', p(1, 1))],
+    [u('de ce', 0), u('nu', p(1, 0)), u('(tu)', null), u('mănânci', p(1, 1))],
+  ),
+  verified: false,
+};
+
+const howAreYou: Phrase = {
+  id: 'how-are-you',
+  title: 'How are you?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πώς', lexeme: 'pos-how', slot: iq },
+    { text: 'είσαι;', lexeme: 'eimai', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('How', 0), u('are you?', 1)],
+    [u('how', 0), u('(you)', null), u('are', 1)],
+    [u('Cum', 0), u('ești?', 1)],
+    [u('cum', 0), u('(tu)', null), u('ești', 1)],
+  ),
+  verified: false,
+};
+
+const whoIsIt: Phrase = {
+  id: 'who-is-it',
+  title: 'Who is it?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Ποιος', lexeme: 'poios', slot: qslot('m', 'sg', 'nom', { use: 'pronoun' }) },
+    { text: 'είναι;', lexeme: 'eimai', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('Who', 0), u('is it?', 1)],
+    [u('who', 0), u('is', 1)],
+    [u('Cine', 0), u('este?', 1)],
+    [u('cine', 0), u('este', 1)],
+  ),
+  verified: false,
+};
+
+const howMuchBread: Phrase = {
+  id: 'how-much-bread',
+  title: 'How much bread do you want?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πόσο', lexeme: 'posos', slot: qslot('n', 'sg', 'acc'), agreesWith: 1 },
+    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
+    { text: 'θέλεις;', lexeme: 'thelo', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('How much', 0), u('bread', 1), u('do', null), u('you want?', 2)],
+    [u('how-much', 0), u('bread', 1), u('(you)', null), u('want', 2)],
+    [u('Câtă', 0), u('pâine', 1), u('vrei?', 2)],
+    [u('câtă', 0), u('pâine', 1), u('(tu)', null), u('vrei', 2)],
+  ),
+  verified: false,
+};
+
+const whereAreYouFrom: Phrase = {
+  id: 'where-are-you-from',
+  title: 'Where are you from?',
+  theme: 'Questions',
+  level: 'improver',
+  tokens: [
+    { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 },
+    { text: 'πού', lexeme: 'pou', slot: iq },
+    { text: 'είσαι;', lexeme: 'eimai', slot: present(2) },
+  ],
+  glosses: rows(
+    [u('Where', 1), u('are you', 2), u('from?', 0)],
+    [u('from', 0), u('where', 1), u('(you)', null), u('are', 2)],
+    [u('De', 0), u('unde', 1), u('ești?', 2)],
+    [u('de', 0), u('unde', 1), u('(tu)', null), u('ești', 2)],
+  ),
+  verified: false,
+};
+
+const untilWhenWillYouGo: Phrase = {
+  id: 'until-when-will-you-go',
+  title: 'Until when will you go?',
+  theme: 'Questions',
+  level: 'improver',
+  tokens: [
+    { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 },
+    { text: 'πότε', lexeme: 'pote', slot: iq },
+    { text: 'θα πας;', lexeme: 'pao', slot: vslot('indicative', 'futureSimple', 2) },
+  ],
+  glosses: rows(
+    [u('Until', 0), u('when', 1), u('will you', p(2, 0)), u('go?', p(2, 1))],
+    [u('until', 0), u('when', 1), u('will', p(2, 0)), u('(you)', null), u('go', p(2, 1))],
+    [u('Până', 0), u('când', 1), u('vei', p(2, 0)), u('merge?', p(2, 1))],
+    [u('până', 0), u('când', 1), u('vei', p(2, 0)), u('merge', p(2, 1))],
+  ),
+  verified: false,
+};
+
+const whatTimeIsIt: Phrase = {
+  id: 'what-time-is-it',
+  title: 'What time is it?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Τι', lexeme: 'ti', slot: iq },
+    { text: 'ώρα', lexeme: 'ora', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
+    { text: 'είναι;', lexeme: 'eimai', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('What', 0), u('time', 1), u('is it?', 2)],
+    [u('what', 0), u('hour', 1), u('is', 2)],
+    [u('Ce', 0), u('oră', 1), u('este?', 2)],
+    [u('ce', 0), u('oră', 1), u('este', 2)],
+  ),
+  verified: false,
+};
+
+const howMuchIsIt: Phrase = {
+  id: 'how-much-is-it',
+  title: 'How much is it?',
+  theme: 'Questions',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πόσο', lexeme: 'posos', slot: qslot('n', 'sg', 'acc', { use: 'pronoun' }) },
+    { text: 'κάνει;', lexeme: 'kano', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('How much', 0), u('is it?', 1)],
+    [u('how-much', 0), u('(it)', null), u('does', 1)],
+    [u('Cât', 0), u('costă?', 1)],
+    [u('cât', 0), u('(el)', null), u('face', 1)],
+  ),
+  verified: false,
+};
+
+const letsEat: Phrase = {
+  id: 'lets-eat',
+  title: "Let's eat!",
+  theme: 'Wishes and possibility',
+  level: 'improver',
+  tokens: [{ text: 'Ας φάμε!', lexeme: 'troo', slot: hslot('aorist', 1, 'pl') }],
+  glosses: rows(
+    [u("Let's", p(0, 0)), u('eat!', p(0, 1))],
+    [u('let', p(0, 0)), u('(we)', null), u('eat', p(0, 1))],
+    [u('Să', p(0, 0)), u('mâncăm!', p(0, 1))],
+    [u('să', p(0, 0)), u('(noi)', null), u('mâncăm', p(0, 1))],
+  ),
+  verified: false,
+};
+
+const letHimEat: Phrase = {
+  id: 'let-him-eat',
+  title: 'Let him / her eat',
+  theme: 'Wishes and possibility',
+  level: 'improver',
+  tokens: [{ text: 'Ας φάει.', lexeme: 'troo', slot: hslot('aorist', 3, 'sg') }],
+  glosses: rows(
+    [u('Let him / her', p(0, 0)), u('eat.', p(0, 1))],
+    [u('let', p(0, 0)), u('(he/she)', null), u('eat', p(0, 1))],
+    [u('Să', p(0, 0)), u('mănânce.', p(0, 1))],
+    [u('să', p(0, 0)), u('(el/ea)', null), u('mănânce', p(0, 1))],
+  ),
+  verified: false,
+};
+
+const letsNotGo: Phrase = {
+  id: 'lets-not-go',
+  title: "Let's not go",
+  theme: 'Wishes and possibility',
+  level: 'improver',
+  tokens: [{ text: 'Ας μην πάμε.', lexeme: 'pao', slot: hslot('aorist', 1, 'pl', true) }],
+  glosses: rows(
+    [u("Let's", p(0, 0)), u('not', p(0, 1)), u('go.', p(0, 2))],
+    [u('let', p(0, 0)), u('not', p(0, 1)), u('(we)', null), u('go', p(0, 2))],
+    [u('Să', p(0, 0)), u('nu', p(0, 1)), u('mergem.', p(0, 2))],
+    [u('să', p(0, 0)), u('nu', p(0, 1)), u('(noi)', null), u('mergem', p(0, 2))],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -959,3 +1218,17 @@
   eatBare,
   wantNotToGo,
+  whatDoYouWant,
+  whereAreYouGoing,
+  whenWillYouEat,
+  whyArentYouEating,
+  howAreYou,
+  whoIsIt,
+  howMuchBread,
+  whereAreYouFrom,
+  untilWhenWillYouGo,
+  whatTimeIsIt,
+  howMuchIsIt,
+  letsEat,
+  letHimEat,
+  letsNotGo,
 ];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1051 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.questions.test.tsx src/data/phrases-questions.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts
git commit -m "feat: phrases 40 to 53 (questions and the hortative)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: Comparison notes for the question words and the hortative

**Files:**
- Create (test): `src/data/divergences-questions.test.ts`
- Modify: `src/components/ComparisonTable.tsx`
- Modify: `src/data/divergences.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences` and the `when` conditions on a verb row.
- Produces: `Divergence.appliesTo.lexeme` may be a list; thirteen new rows (the eleven notes of spec 5.2 that belong to Plan 7, two of them as two rows).

The spec's notes are rows of `DIVERGENCES`. Two notes need two rows because they apply to a different part of speech each (question-words: τι and ποιος; question-compounds: the prepositions and ώρα).

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-questions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level, Pos, Slot } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (pos: Pos, lexeme: string, slot?: Slot, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, pos, lexeme, level, slot).map((d) => d.id);
const verb = (mood: string, tense: string, polarity?: 'negative'): Slot =>
  ({ pos: 'verb', person: 1, number: 'pl', mood, tense, voice: 'active', ...(polarity ? { polarity } : {}) }) as Slot;

describe('the comparison notes for question words', () => {
  it('every question word shows the word order and the question mark', () => {
    expect(ids('interrogative', 'pou')).toEqual(['question-order', 'question-mark']);
    expect(ids('interrogative', 'ti')).toEqual(['question-order', 'question-mark', 'question-words']);
    expect(ids('interrogative', 'giati')).toEqual(['question-order', 'question-mark', 'why-because']);
  });

  it('ποιος and πόσος show the declension; only ποιος shows who / which / what', () => {
    expect(ids('quantifier', 'poios')).toEqual(expect.arrayContaining(['question-words-who', 'question-declension']));
    expect(ids('quantifier', 'posos')).toContain('question-declension');
    expect(ids('quantifier', 'posos')).not.toContain('question-words-who');
    expect(ids('quantifier', 'polys')).not.toContain('question-declension');
  });

  it('από and μέχρι show the fused Romanian words, and ώρα shows "what time"', () => {
    expect(ids('preposition', 'apo')).toContain('question-compounds');
    expect(ids('preposition', 'mexri')).toContain('question-compounds');
    expect(ids('preposition', 'pano')).not.toContain('question-compounds');
    expect(ids('noun', 'ora')).toContain('question-compounds-hour');
  });

  it('κάνω in the present shows the price idiom, and no other verb or tense does', () => {
    expect(ids('verb', 'kano', verb('indicative', 'present'))).toContain('price-idiom');
    expect(ids('verb', 'kano', verb('indicative', 'aorist'))).not.toContain('price-idiom');
    expect(ids('verb', 'troo', verb('indicative', 'present'))).not.toContain('price-idiom');
  });
});

describe('the comparison notes for the hortative', () => {
  it('show only in the hortative, and the negation note only when negated', () => {
    expect(ids('verb', 'troo', verb('hortative', 'aorist'))).toEqual([
      'verb-subject', 'hortative-construction', 'hortative-vs-subjunctive', 'hortative-persons',
    ]);
    expect(ids('verb', 'troo', verb('hortative', 'aorist', 'negative'))).toContain('hortative-negation');
    expect(ids('verb', 'troo', verb('subjunctive', 'aorist'))).not.toContain('hortative-construction');
  });

  it('Beginner leaves out the extra note about ας and να', () => {
    expect(ids('verb', 'troo', verb('hortative', 'aorist'), 'beginner')).toEqual([
      'verb-subject', 'hortative-construction', 'hortative-persons',
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-questions.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/components/ComparisonTable.tsx` (unified diff):

```diff
@@ -23,5 +23,5 @@
     (d) =>
       d.appliesTo.pos === pos &&
-      (d.appliesTo.lexeme === undefined || d.appliesTo.lexeme === lexemeId) &&
+      (d.appliesTo.lexeme === undefined || [d.appliesTo.lexeme].flat().includes(lexemeId)) &&
       matchesWhen(d.appliesTo.when, slot) &&
       (level === 'improver' || d.level === 'core'),
```

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -585,3 +585,146 @@
     verified: false,
   },
+  {
+    id: 'question-order',
+    appliesTo: { pos: 'interrogative' },
+    point: 'Word order',
+    el: 'the statement order after the question word: Τι θέλεις;',
+    ro: 'the same order: Ce vrei?',
+    en: 'adds "do" and inverts: What do you want?',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-mark',
+    appliesTo: { pos: 'interrogative' },
+    point: 'Question mark',
+    el: 'the semicolon: Τι θέλεις;',
+    ro: 'the question mark: Ce vrei?',
+    en: 'the question mark: What do you want?',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-words',
+    appliesTo: { pos: 'interrogative', lexeme: 'ti' },
+    point: 'Who, which and what',
+    el: 'ποιος (who, which) and τι (what)',
+    ro: 'cine (who), care (which) and ce (what)',
+    en: 'who, which and what',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-words-who',
+    appliesTo: { pos: 'quantifier', lexeme: 'poios' },
+    point: 'Who, which and what',
+    el: 'ποιος (who, which) and τι (what)',
+    ro: 'cine (who), care (which) and ce (what)',
+    en: 'who, which and what',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'why-because',
+    appliesTo: { pos: 'interrogative', lexeme: 'giati' },
+    point: 'Why and because',
+    el: 'γιατί means both "why" and "because"',
+    ro: 'de ce (why) and pentru că (because)',
+    en: 'why and because',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-declension',
+    appliesTo: { pos: 'quantifier', lexeme: ['poios', 'posos'] },
+    point: 'Which question words change',
+    el: 'ποιος and πόσος decline (ποιος, ποια, ποιο; πόσος, πόση, πόσο); τι, πού, πότε, γιατί and πώς never change',
+    ro: 'cât changes too (cât, câtă, câți, câte)',
+    en: '"how much / how many" does not change',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-compounds',
+    appliesTo: { pos: 'preposition', lexeme: ['apo', 'mexri'] },
+    point: 'A question word after a preposition',
+    el: 'two words: από πού, μέχρι πότε',
+    ro: 'one fused word: de unde, până când',
+    en: 'two words: from where, until when',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'question-compounds-hour',
+    appliesTo: { pos: 'noun', lexeme: 'ora' },
+    point: 'What time is it?',
+    el: 'τι ώρα: "what hour"',
+    ro: 'ce oră: "what hour" as well',
+    en: '"what time", not "what hour"',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'price-idiom',
+    appliesTo: { pos: 'verb', lexeme: 'kano', when: { moods: ['indicative'], tenses: ['present'] } },
+    point: 'Asking a price',
+    el: 'Πόσο κάνει; (literally "how much does it do")',
+    ro: 'Cât costă? (literally cât face)',
+    en: 'How much is it?',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'hortative-construction',
+    appliesTo: { pos: 'verb', when: { moods: ['hortative'] } },
+    point: 'Letting and suggesting',
+    el: 'ας + the subjunctive form: ας φάμε',
+    ro: 'să + the subjunctive: Să mâncăm!',
+    en: "let's eat / let him eat",
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'hortative-vs-subjunctive',
+    appliesTo: { pos: 'verb', when: { moods: ['hortative'] } },
+    point: 'ας or να',
+    el: 'ας suggests or allows (ας φάμε, "let\'s eat"); να gives a wish or a purpose (θέλω να φάω)',
+    ro: 'one particle, să, for both: Să mâncăm! and Vreau să mănânc',
+    en: 'different words: "let\'s eat" and "I want to eat"',
+    tag: 'differs',
+    level: 'extra',
+    verified: false,
+  },
+  {
+    id: 'hortative-negation',
+    appliesTo: { pos: 'verb', when: { moods: ['hortative'], polarity: 'negative' } },
+    point: 'Negation',
+    el: 'μην follows ας: ας μην φάμε',
+    ro: 'nu follows să: Să nu mâncăm',
+    en: '"not" follows: let\'s not eat',
+    tag: 'same',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'hortative-persons',
+    appliesTo: { pos: 'verb', when: { moods: ['hortative'] } },
+    point: 'Persons',
+    el: 'only the verb ending changes',
+    ro: 'only the verb ending changes',
+    en: 'the words change: let me, let\'s, let him / her, let them (may you for "you")',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/types.ts` (unified diff):

```diff
@@ -400,5 +400,6 @@
   appliesTo: {
     pos: Pos;
-    lexeme?: string;
+    /** One lexeme, or several that share the row (ποιος and πόσος). */
+    lexeme?: string | string[];
     /** For verbs: show the row only when the panel's slot matches every listed dimension. */
     when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[]; polarity?: Polarity; clitics?: 'some' | 'two' };
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1057 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-questions.test.ts src/components/ComparisonTable.tsx src/data/divergences.ts src/types.ts
git commit -m "feat: comparison notes for the question words and the hortative

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 7.
- Produces: a spec that records what Plan 7 decided (new section 21), the validator rule as built (section 7) and the review item (section 9).

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
import re
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)


sub(
    "- a question-word token that is not an interrogative or a question-word quantifier; a preposition token whose `agreesWith` is neither a noun nor a question word;",
    "- a question-word quantifier (`question`) that does not offer exactly the subject and object roles, or a quantifier token outside the roles its lexeme offers; a quantifier token with no `agreesWith` unless it is used on its own; a preposition token whose `agreesWith` is neither a noun nor an interrogative (τι, πού, πότε, γιατί, πώς); an interrogative whose `roAfter` names something that is not a preposition;",
)
sub(
    "- Plan 7 and 8 additions: the question words",
    "- Plan 7 addition: whether the Romanian object role of *cine* and *care* needs *pe* (*pe cine*), which the cells do not show; whether the English second person of the hortative should be \"may you eat\" or \"go ahead and eat\"; and the Romanian forms *cât, câtă, câți, câte*, *de unde*, *până când*, *de la ce*.\n- Plan 7 and 8 additions: the question words",
)
s = s.rstrip() + """

## 21. Decisions made in Plan 7

| Source | Decision | Where |
|---|---|---|
| Delivery | Plan 7 delivers the question words, ας, the hortative, ώρα, κάνω, από, μέχρι and phrases 40 to 53, so the picker lists 53 phrases; phrases 54 to 56 follow in Plan 8 | 6.1, 11 |
| English hortative | One rendering per person (*let me*, *may you* for both second persons, *let him / her*, *let's*, *let them*); the English cell takes the pronoun word from `EnParts.pronoun`; there is no English reading line for the hortative | 5.2, 5.5 |
| A preposition and a question word | A preposition governs a noun or an interrogative; `roAfter` stores the fused Romanian word (*de unde*, *până când*); ποιος and πόσος after a preposition are out of scope | 4.4, 5.3 |
| ποιος and πόσος | `question: 'who' \\| 'amount'` and `cases: ['nom', 'acc']` on the quantifier lexeme; ποιος uses the "How many?" control, πόσος the mass / count control; Romanian *care* before a noun and *cine* on its own | 4.2, 5.3, 6.6 |
| A quantifier with no noun token | The panel starts with σκύλος (m), αλεπού (f) or παιδί (n) as its noun, so Romanian shows *cine* and *cât* | 5.3 |
| Nouns | `GreekNoun.overrides` stores a whole irregular cell; ώρα is class `fem-a` with the genitive plural ωρών | 4.3, 6.6 |
| Comparison notes | Thirteen rows for the eleven notes of 5.2: question-order, question-mark, question-words (two rows), why-because, question-declension, question-compounds (two rows), price-idiom and four hortative rows; a row may name several lexemes | 5.2 |
| Counts | 17 mood and tense combinations; every verb with the subjunctive present and aorist offers the hortative | 4.2, 4.3 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the three edits**

Run: `grep -c "noun nor an interrogative" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "## 21. Decisions made in Plan 7" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Plan 7 addition" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: `1`, `1` and `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). The validator's unverified count has grown by the new lexemes, phrases, divergence rows and the `ending-table:fem-a` item; `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 7 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 2, 4.2: the hortative mood, 17 combinations; 4.3: ας + the subjunctive, μην after ας, offered with the subjunctive | 1 |
| 5.3: the particle ας has its own panel (the particle panel, opened from the piece) | 1 |
| 4.2: the `interrogative` slot; 5.3: the question-word panel (on its own, in a question, γιατί as an answer) | 2 |
| 4.2, 5.3, 6.6: ποιος and πόσος as quantifiers, subject and object roles, badge "question word" | 3 |
| 4.4, 5.3: a preposition governs a question word; από and μέχρι | 2, 4 |
| 6.6: ώρα (feminine -α, genitive plural ωρών) and κάνω | 5 |
| 6.1: phrases 40 to 53 and the *Questions* theme | 6 |
| 5.2: question-order, question-mark, question-words, why-because, question-declension, question-compounds, price-idiom and the four hortative notes | 7 |
| 7: the validator rules for the hortative, question words and prepositions; 9: the review additions; 10 and 20: decisions | 1, 2, 3, 4, 8 |
| Not in this plan (Plan 8): pronouns in every form, λέω, phrases 54 to 56, the Romanian fusion table for every person | |
