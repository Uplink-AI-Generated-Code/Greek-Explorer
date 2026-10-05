# Pronouns in Every Form, λέω and Phrases 54 to 56 Implementation Plan (Plan 8)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the weak pronouns go with every indicative, subjunctive, conditional and hortative form (not only commands), store the Romanian fusions for every pronoun, add the verb λέω, and add phrases 54 to 56.

**Architecture:** Outside a command the Greek pronouns are extra pieces of the verb group, placed after the particle and μην and before the auxiliary (`[δεν] [θα / να / ας] [μην] [pronouns] [έχω] [verb]`), with no stress rule. English appends them after the verb or the participle. Romanian gets one function (`roWithPronouns`) that builds each tense from a stored table: every pronoun and every stored pair has six positions (free, attached to a command, after *nu*, after *să*, fused with a vowel-initial auxiliary, behind the participle). The verb panel's Object control works in every mood for verbs that take an object, with a "To whom?" control for the indirect pronoun, and the pronoun survives the other controls whenever the verb and voice can take it.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 5.2, 5.3, 6.1, 6.5, 6.6, 7, 10 and 20 to 22; the repository is at commit 11e6850 or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes, two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase, divergence row and review item has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what `compose` produces, ignoring capitals and trailing punctuation (the validator checks it).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement except where it says so.

1. **Which verbs take pronouns.** Any active verb except one flagged `intransitive` on its voice (πάω, πηδάω, είμαι, μπορεί); a mediopassive voice takes none (a reflexive verb has no object). `slotProblem` refuses the rest with "<lemma> takes no object". A short form is still for commands only. The Object control is offered for exactly these verbs, in every mood.
2. **The Romanian table.** `RoClitic` gains `afterSa` (*să-l*), `fused` (*l-*, joined to a vowel-initial auxiliary) and `after` (*-o*, behind the participle or the infinitive). The singles are stored for every person. Task 1 stores the pairs for "to me" and "to you" with the four third-person accusatives (eight pairs); Task 7 completes them for every dative (to me, to you, to him / her, to us, to you pl., to them): 24 pairs. In front of an accusative *ne* becomes *ni-*, *vă* becomes *vi-* and *le* becomes *li-* (*ni-l*, *vi-o*, *li-l*). A pair that is not stored (a first- or second-person accusative with a dative) throws "no Romanian cluster", as before; the panel cannot build one.
3. **Which Romanian positions each tense uses.** Present, imperfect and pluperfect: the free form (or the form after *nu*) before the verb. The compound past and both conditionals: the fused form before the vowel-initial auxiliary, with *o* and the pairs with *o* behind the participle or the infinitive (*am mâncat-o*, *aș mânca-o*). The future and the future perfect: the free form before *voi / vei …* (a consonant). The subjunctive and the hortative: the form after *să*.
4. **Pronouns survive the other controls.** `changeVerbSlot` no longer drops the pronouns when the mood changes; it drops them only when the verb or the voice cannot take them, and drops the short form outside a command. The held noun stays while the verb has pronouns (or is a command), and is cleared otherwise.
5. **Both Romanian genders are validated.** The validator builds the direct pronoun for a noun that is feminine in Romanian (*o*) and for one that is masculine (*îl*), because the fusion differs.
6. **English.** The pronouns are appended to the English verb cell for every mood (`EnParts.verb`), so the subject pronoun and "let's / may you" stay where they are. There is still no English or Romanian "How to read this" line for a form with pronouns.
7. **The Object control chooses the recipient.** Once a form has an indirect pronoun (δίνω: the pair, or a command with a spelled-out noun) a new control, "To whom?" (key `recipient`), chooses it: to me, to you, to him, to her, to us, to you (all), to them. It keeps its value when the tense, the person, the negation or the noun changes, and is dropped with the indirect pronoun. The Same-meaning strip (Give me the bread!) is about "me" only, so it is hidden for any other recipient.
8. **Delivery.** With this plan the picker lists all 56 phrases.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `VerbVoice.intransitive` |
| `src/data/clitics.ts` | the Romanian table gets `afterSa`, `fused`, `after` and eight pairs |
| `src/data/{lexemes,phrases,divergences,review}.ts` | `intransitive` on four verbs; the verb λέω; phrases 54 to 56; two comparison rows; one review item |
| `src/engine/{romanian,english,compose,offers,objects,labels,clitics,groups}.ts` | `roWithPronouns`; the English objects in every mood; the Greek placement outside commands; `slotProblem`; the object kind and options by mood; the recipients; the form groups are about "me" only |
| `src/panels/{verb,panels,types}.ts` | the Object control in every mood; the "To whom?" control; the pronoun survives the other controls |
| `src/validate/{validate,reviewSheet}.ts` | pronoun slots for every mood; the review sheet prints every position |
| tests | one new test file per task, plus the expectations the new rules change |

---

### Task 1: The Romanian pronoun table and the forms built from it

**Files:**
- Create (test): `src/engine/ro-pronouns.test.ts`
- Modify: `src/data/clitics.ts`
- Modify: `src/engine/clitics.ts`
- Modify: `src/engine/romanian.ts`
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/engine/clitics.test.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `RO_CLITICS`, `RO_CLUSTERS`, `roClitic`, `roClitics`, `roVerb` and `RO_AUXILIARIES` (Plan 6).
- Produces: `RoClitic` with the new fields `afterSa`, `fused` and `after`; `RO_CLUSTERS` of type `Record<string, RoClitic>` with eight pairs; `roClitics(list): RoClitic`; `roVerb` builds every non-command form with pronouns (`roWithPronouns`, not exported); the review sheet prints every position.

Nothing outside the Romanian side changes yet: no slot may carry pronouns outside a command until Task 2, so these forms are reached by the tests only. Three existing tests change because the table entries have more fields.

- [ ] **Step 1: Write the tests**

Create `src/engine/ro-pronouns.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { RO_CLITICS, RO_CLUSTERS } from '../data/clitics';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { roClitics } from './clitics';
import { roVerb } from './romanian';

const troo = getVerb('troo');
const dino = getVerb('dino');

/** ψωμί: "o" in Romanian (pâine is feminine). */
const O: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
/** παιδί: "îl" in Romanian (copil is masculine). */
const L: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const YOU: Clitic = { role: 'indirect', person: 2, number: 'sg' };

const slot = (
  mood: Mood,
  tense: Tense,
  clitics: Clitic[],
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', clitics, ...(negative ? { polarity: 'negative' as const } : {}),
});
const eat = (s: SlotOf<'verb'>) => roVerb(troo, s);
const give = (s: SlotOf<'verb'>) => roVerb(dino, s);

describe('Romanian pronouns before the verb (present, imperfect, past perfect)', () => {
  it('stand in front of the verb, with the fusion after nu', () => {
    expect(eat(slot('indicative', 'present', [L]))).toBe('îl mănânc');
    expect(eat(slot('indicative', 'present', [O]))).toBe('o mănânc');
    expect(eat(slot('indicative', 'present', [L], 1, 'sg', true))).toBe('nu-l mănânc');
    expect(eat(slot('indicative', 'present', [O], 1, 'sg', true))).toBe('nu o mănânc');
    expect(eat(slot('indicative', 'imperfect', [L]))).toBe('îl mâncam');
    expect(eat(slot('indicative', 'pluperfect', [L]))).toBe('îl mâncasem');
  });
});

describe('Romanian pronouns with the compound past and the conditional (a vowel-initial auxiliary)', () => {
  it('fuse with the auxiliary, except o, which follows the participle', () => {
    expect(eat(slot('indicative', 'perfect', [L]))).toBe('l-am mâncat');
    expect(eat(slot('indicative', 'perfect', [O]))).toBe('am mâncat-o');
    expect(eat(slot('indicative', 'aorist', [L], 3))).toBe('l-a mâncat');
    expect(eat(slot('indicative', 'perfect', [L], 1, 'sg', true))).toBe('nu l-am mâncat');
    expect(eat(slot('indicative', 'perfect', [O], 1, 'sg', true))).toBe('nu am mâncat-o');
  });

  it('the conditional does the same: l-aș mânca, aș mânca-o', () => {
    expect(eat(slot('conditional', 'imperfect', [L]))).toBe('l-aș mânca');
    expect(eat(slot('conditional', 'imperfect', [O]))).toBe('aș mânca-o');
    expect(eat(slot('conditional', 'imperfect', [L], 2, 'pl'))).toBe('l-ați mânca');
    expect(eat(slot('conditional', 'imperfect', [L], 1, 'sg', true))).toBe('nu l-aș mânca');
    expect(eat(slot('conditional', 'pluperfect', [L]))).toBe('l-aș fi mâncat');
    expect(eat(slot('conditional', 'pluperfect', [O]))).toBe('aș fi mâncat-o');
  });
});

describe('Romanian pronouns with the future and the subjunctive (a consonant-initial word)', () => {
  it('stand in front of the future auxiliary', () => {
    expect(eat(slot('indicative', 'future', [L]))).toBe('îl voi mânca');
    expect(eat(slot('indicative', 'futureSimple', [O], 3))).toBe('o va mânca');
    expect(eat(slot('indicative', 'future', [L], 1, 'sg', true))).toBe('nu-l voi mânca');
    expect(eat(slot('indicative', 'futurePerfect', [L]))).toBe('îl voi fi mâncat');
  });

  it('follow să, and să nu', () => {
    expect(eat(slot('subjunctive', 'aorist', [L]))).toBe('să-l mănânc');
    expect(eat(slot('subjunctive', 'aorist', [O]))).toBe('să o mănânc');
    expect(eat(slot('subjunctive', 'aorist', [L], 1, 'sg', true))).toBe('să nu-l mănânc');
    expect(eat(slot('subjunctive', 'aorist', [O], 1, 'sg', true))).toBe('să nu o mănânc');
    expect(eat(slot('subjunctive', 'perfect', [L]))).toBe('să-l fi mâncat');
    expect(eat(slot('hortative', 'aorist', [O], 1, 'pl'))).toBe('să o mâncăm');
    expect(eat(slot('hortative', 'aorist', [L], 1, 'pl', true))).toBe('să nu-l mâncăm');
  });
});

describe('Romanian pairs (dative then accusative)', () => {
  it('mi-o vei da, mi l-ai dat, mi-ai dat-o, să mi-o dea', () => {
    expect(give(slot('indicative', 'futureSimple', [ME, O], 2))).toBe('mi-o vei da');
    expect(give(slot('indicative', 'perfect', [ME, L], 2))).toBe('mi l-ai dat');
    expect(give(slot('indicative', 'perfect', [ME, O], 2))).toBe('mi-ai dat-o');
    expect(give(slot('indicative', 'present', [ME, O], 3))).toBe('mi-o dă');
    expect(give(slot('indicative', 'present', [ME, O], 3, 'sg', true))).toBe('nu mi-o dă');
    expect(give(slot('subjunctive', 'aorist', [ME, O], 3))).toBe('să mi-o dea');
    expect(give(slot('subjunctive', 'aorist', [YOU, L], 1, 'sg', true))).toBe('să nu ți-l dau');
    expect(give(slot('conditional', 'imperfect', [YOU, O]))).toBe('ți-aș da-o');
  });
});

describe('every stored pronoun, in every position', () => {
  const OBJECTS: Clitic[] = [
    { role: 'object', person: 1, number: 'sg' }, { role: 'object', person: 2, number: 'sg' },
    L, O,
    { role: 'object', person: 1, number: 'pl' }, { role: 'object', person: 2, number: 'pl' },
    { role: 'object', person: 3, number: 'pl', gender: 'm', roGender: 'm' },
    { role: 'object', person: 3, number: 'pl', gender: 'f', roGender: 'f' },
  ];
  const DATIVES: Clitic[] = [1, 2, 3].flatMap((person) =>
    (['sg', 'pl'] as const).map((number): Clitic => ({ role: 'indirect', person: person as Person, number })),
  );

  it('fuses with the auxiliary a in the third person of the compound past', () => {
    expect(OBJECTS.map((c) => eat(slot('indicative', 'perfect', [c], 3)))).toEqual([
      'm-a mâncat', 'te-a mâncat', 'l-a mâncat', 'a mâncat-o', 'ne-a mâncat', 'v-a mâncat', 'i-a mâncat', 'le-a mâncat',
    ]);
    expect(DATIVES.map((c) => give(slot('indicative', 'perfect', [c], 3)))).toEqual([
      'mi-a dat', 'ne-a dat', 'ți-a dat', 'v-a dat', 'i-a dat', 'le-a dat',
    ]);
  });

  it('has every position filled, and a fused or a behind-the-participle form', () => {
    for (const [key, entry] of [...Object.entries(RO_CLITICS), ...Object.entries(RO_CLUSTERS)]) {
      for (const field of ['free', 'enclitic', 'afterNu', 'afterSa'] as const) {
        expect(entry[field], `${key} ${field}`).not.toBe('');
      }
      expect(entry.fused !== '' || entry.after !== '', key).toBe(true);
    }
  });

  it('stores the pairs for "to me" and "to you" with the four third-person accusatives', () => {
    expect(Object.keys(RO_CLUSTERS)).toHaveLength(8);
    expect(roClitics([YOU, O]).fused).toBe('ți-');
    expect(roClitics([YOU, O]).after).toBe('-o');
  });
});
```

Change `src/engine/clitics.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -70,8 +70,8 @@
 describe('Romanian pronouns', () => {
   it('free, attached after a command, and after nu', () => {
-    expect(roClitic(c('object', 3, 'sg', 'm', 'm'))).toEqual({ free: 'îl', enclitic: '-l', afterNu: 'nu-l' });
-    expect(roClitic(c('object', 3, 'sg', 'n', 'f'))).toEqual({ free: 'o', enclitic: '-o', afterNu: 'nu o' });
-    expect(roClitic(c('indirect', 1, 'sg'))).toEqual({ free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' });
-    expect(roClitic(c('object', 1, 'pl'))).toEqual({ free: 'ne', enclitic: '-ne', afterNu: 'nu ne' });
+    expect(roClitic(c('object', 3, 'sg', 'm', 'm'))).toMatchObject({ free: 'îl', enclitic: '-l', afterNu: 'nu-l' });
+    expect(roClitic(c('object', 3, 'sg', 'n', 'f'))).toMatchObject({ free: 'o', enclitic: '-o', afterNu: 'nu o' });
+    expect(roClitic(c('indirect', 1, 'sg'))).toMatchObject({ free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' });
+    expect(roClitic(c('object', 1, 'pl'))).toMatchObject({ free: 'ne', enclitic: '-ne', afterNu: 'nu ne' });
   });
 
@@ -90,6 +90,6 @@
 
   it('one pronoun or a cluster of two (dative then accusative)', () => {
-    expect(roClitics([c('object', 3, 'sg', 'n', 'f')])).toEqual({ enclitic: '-o', afterNu: 'nu o' });
-    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'n', 'f')])).toEqual({
+    expect(roClitics([c('object', 3, 'sg', 'n', 'f')])).toMatchObject({ enclitic: '-o', afterNu: 'nu o' });
+    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'n', 'f')])).toMatchObject({
       enclitic: '-mi-o',
       afterNu: 'nu mi-o',
@@ -101,5 +101,5 @@
 
   it('refuses a cluster that is not stored, and a list that is not one or two', () => {
-    expect(() => roClitics([c('indirect', 2, 'sg'), c('object', 3, 'sg', 'm', 'm')])).toThrow(/no Romanian cluster/);
+    expect(() => roClitics([c('indirect', 3, 'sg'), c('object', 3, 'sg', 'm', 'm')])).toThrow(/no Romanian cluster/);
     expect(() => roClitics([])).toThrow(/one or two/);
   });
```

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -47,5 +47,6 @@
     expect(sheet).toContain('### το (clitic)');
     expect(sheet).toContain('- obj.3sg.m: free îl · attached -l · after nu nu-l');
-    expect(sheet).toContain('- ind.1sg+obj.3sg.f: attached -mi-o · after nu nu mi-o');
+    expect(sheet).toContain('- ind.1sg+obj.3sg.f: free mi-o · attached -mi-o · after nu nu mi-o · after să să mi-o · fused mi- · behind the participle -o');
+    expect(sheet).toContain('- obj.3sg.m: free îl · attached -l · after nu nu-l · after să să-l · fused l- · behind the participle —');
     expect(sheet).toContain('- 3sg: him / her / it');
     expect(sheet).toContain('- 3sg: αυτόν / αυτήν / αυτό');
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/ro-pronouns.test.ts`

Expected: FAIL (`roVerb` does not build forms with pronouns outside a command yet; the new table fields do not exist).

- [ ] **Step 3: Write the code**

Change `src/data/clitics.ts` (unified diff):

```diff
@@ -45,5 +45,5 @@
 
 export interface RoClitic {
-  /** On its own: îl. */
+  /** Before a consonant-initial word, on its own: îl mănânc, mi-o vei da. */
   free: string;
   /** Attached to a command with a hyphen: mănâncă-l. */
@@ -51,6 +51,21 @@
   /** After nu, with the fusions: nu-l, nu o. */
   afterNu: string;
+  /** After să, with the fusions: să-l, să o. */
+  afterSa: string;
+  /** Joined to a vowel-initial auxiliary (am, aș): l-am, mi l-ai; empty when the pronoun stays behind the participle or the infinitive. */
+  fused: string;
+  /** Behind the participle or the infinitive where Romanian puts it there: -o in am mâncat-o, aș mânca-o; otherwise empty. */
+  after: string;
 }
 
+const ro = (
+  free: string,
+  enclitic: string,
+  afterNu: string,
+  afterSa: string,
+  fused: string,
+  after = '',
+): RoClitic => ({ free, enclitic, afterNu, afterSa, fused, after });
+
 /**
  * The Romanian pronouns, keyed 'obj' or 'ind', then person and number, then the Romanian gender of a third-person
@@ -58,25 +73,32 @@
  */
 export const RO_CLITICS: Record<string, RoClitic> = {
-  'obj.1sg': { free: 'mă', enclitic: '-mă', afterNu: 'nu mă' },
-  'obj.2sg': { free: 'te', enclitic: '-te', afterNu: 'nu te' },
-  'obj.3sg.m': { free: 'îl', enclitic: '-l', afterNu: 'nu-l' },
-  'obj.3sg.f': { free: 'o', enclitic: '-o', afterNu: 'nu o' },
-  'obj.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
-  'obj.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
-  'obj.3pl.m': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
-  'obj.3pl.f': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
-  'ind.1sg': { free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' },
-  'ind.2sg': { free: 'îți', enclitic: '-ți', afterNu: 'nu-ți' },
-  'ind.3sg': { free: 'îi', enclitic: '-i', afterNu: 'nu-i' },
-  'ind.1pl': { free: 'ne', enclitic: '-ne', afterNu: 'nu ne' },
-  'ind.2pl': { free: 'vă', enclitic: '-vă', afterNu: 'nu vă' },
-  'ind.3pl': { free: 'le', enclitic: '-le', afterNu: 'nu le' },
+  'obj.1sg': ro('mă', '-mă', 'nu mă', 'să mă', 'm-'),
+  'obj.2sg': ro('te', '-te', 'nu te', 'să te', 'te-'),
+  'obj.3sg.m': ro('îl', '-l', 'nu-l', 'să-l', 'l-'),
+  'obj.3sg.f': ro('o', '-o', 'nu o', 'să o', '', '-o'),
+  'obj.1pl': ro('ne', '-ne', 'nu ne', 'să ne', 'ne-'),
+  'obj.2pl': ro('vă', '-vă', 'nu vă', 'să vă', 'v-'),
+  'obj.3pl.m': ro('îi', '-i', 'nu-i', 'să-i', 'i-'),
+  'obj.3pl.f': ro('le', '-le', 'nu le', 'să le', 'le-'),
+  'ind.1sg': ro('îmi', '-mi', 'nu-mi', 'să-mi', 'mi-'),
+  'ind.2sg': ro('îți', '-ți', 'nu-ți', 'să-ți', 'ți-'),
+  'ind.3sg': ro('îi', '-i', 'nu-i', 'să-i', 'i-'),
+  'ind.1pl': ro('ne', '-ne', 'nu ne', 'să ne', 'ne-'),
+  'ind.2pl': ro('vă', '-vă', 'nu vă', 'să vă', 'v-'),
+  'ind.3pl': ro('le', '-le', 'nu le', 'să le', 'le-'),
 };
 
-/** Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o. */
-export const RO_CLUSTERS: Record<string, { enclitic: string; afterNu: string }> = {
-  'ind.1sg+obj.3sg.m': { enclitic: '-mi-l', afterNu: 'nu mi-l' },
-  'ind.1sg+obj.3sg.f': { enclitic: '-mi-o', afterNu: 'nu mi-o' },
-  'ind.1sg+obj.3pl.m': { enclitic: '-mi-i', afterNu: 'nu mi-i' },
-  'ind.1sg+obj.3pl.f': { enclitic: '-mi-le', afterNu: 'nu mi-le' },
+/**
+ * Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o, mi-o vei da.
+ * Stored for the datives "to me" and "to you" with the four third-person accusatives.
+ */
+export const RO_CLUSTERS: Record<string, RoClitic> = {
+  'ind.1sg+obj.3sg.m': ro('mi-l', '-mi-l', 'nu mi-l', 'să mi-l', 'mi l-'),
+  'ind.1sg+obj.3sg.f': ro('mi-o', '-mi-o', 'nu mi-o', 'să mi-o', 'mi-', '-o'),
+  'ind.1sg+obj.3pl.m': ro('mi-i', '-mi-i', 'nu mi-i', 'să mi-i', 'mi i-'),
+  'ind.1sg+obj.3pl.f': ro('mi-le', '-mi-le', 'nu mi-le', 'să mi-le', 'mi le-'),
+  'ind.2sg+obj.3sg.m': ro('ți-l', '-ți-l', 'nu ți-l', 'să ți-l', 'ți l-'),
+  'ind.2sg+obj.3sg.f': ro('ți-o', '-ți-o', 'nu ți-o', 'să ți-o', 'ți-', '-o'),
+  'ind.2sg+obj.3pl.m': ro('ți-i', '-ți-i', 'nu ți-i', 'să ți-i', 'ți i-'),
+  'ind.2sg+obj.3pl.f': ro('ți-le', '-ți-le', 'nu ți-le', 'să ți-le', 'ți le-'),
 };
```

Change `src/engine/clitics.ts` (unified diff):

```diff
@@ -36,10 +36,7 @@
 }
 
-/** The attached form (after a command) and the form after nu, for one pronoun or a dative + accusative pair. */
-export function roClitics(list: readonly Clitic[]): { enclitic: string; afterNu: string } {
-  if (list.length === 1) {
-    const { enclitic, afterNu } = roClitic(list[0]);
-    return { enclitic, afterNu };
-  }
+/** Every form of one pronoun or of a dative + accusative pair: attached to a command, after nu, after să, fused with an auxiliary. */
+export function roClitics(list: readonly Clitic[]): RoClitic {
+  if (list.length === 1) return roClitic(list[0]);
   if (list.length === 2) {
     const key = `${roKey(list[0])}+${roKey(list[1])}`;
```

Change `src/engine/romanian.ts` (unified diff):

```diff
@@ -34,6 +34,53 @@
 } as const;
 
+/**
+ * A verb form with pronouns outside a command (spec 4.3): the stored pronoun forms go in front of the verb group
+ * (îl mănânc, nu-l mănânc, să-l mănânc, îl voi mânca), fuse with a vowel-initial auxiliary (l-am mâncat, l-aș mânca)
+ * or, for *o* and the pairs with it, stay behind the participle or the infinitive (am mâncat-o, aș mânca-o).
+ */
+function roWithPronouns(v: GreekVerb, s: SlotOf<'verb'>): string {
+  const ro = voiceOf(v, s.voice).ro;
+  const i = whoIndex(s);
+  const pronoun = roClitics(s.clitics ?? []);
+  const negative = s.polarity === 'negative';
+  const nu = negative ? 'nu ' : '';
+  // Before a consonant-initial word, and after să.
+  const pre = negative ? pronoun.afterNu : pronoun.free;
+  const afterSa = negative ? `să ${pronoun.afterNu}` : pronoun.afterSa;
+  const fused = (aux: string, rest: string) => `${nu}${pronoun.fused}${aux} ${rest}${pronoun.after}`;
+  switch (`${s.mood}.${s.tense}`) {
+    case 'indicative.present':
+      return `${pre} ${ro.present[i]}`;
+    case 'indicative.imperfect':
+      return `${pre} ${ro.imperfect[i]}`;
+    case 'indicative.pluperfect':
+      return `${pre} ${ro.pluperfect[i]}`;
+    case 'indicative.aorist':
+    case 'indicative.perfect':
+      return fused(RO_AUXILIARIES.have[i], ro.participle);
+    case 'indicative.future':
+    case 'indicative.futureSimple':
+      return `${pre} ${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
+    case 'indicative.futurePerfect':
+      return `${pre} ${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
+    case 'subjunctive.present':
+    case 'subjunctive.aorist':
+    case 'hortative.present':
+    case 'hortative.aorist':
+      return `${afterSa} ${ro.subjunctive[i]}`;
+    case 'subjunctive.perfect':
+      return `${afterSa} fi ${ro.participle}`;
+    case 'conditional.imperfect':
+      return fused(RO_AUXILIARIES.would[i], ro.infinitive);
+    case 'conditional.pluperfect':
+      return fused(RO_AUXILIARIES.would[i], `fi ${ro.participle}`);
+    default:
+      throw new Error(`${s.mood} ${s.tense} takes no pronouns`);
+  }
+}
+
 /** The Romanian cell for a verb slot: stored forms for the simple tenses, generated for the compound ones. */
 export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
+  if ((s.clitics ?? []).length > 0 && s.mood !== 'imperative') return roWithPronouns(v, s);
   const ro = voiceOf(v, s.voice).ro;
   const i = whoIndex(s);
```

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -11,9 +11,13 @@
 import type { GreekInterrogative, GreekLexeme, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
-import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS } from '../data/clitics';
+import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
 import { greekClitic } from '../engine/clitics';
 import { isOffered, slotProblem } from '../engine/offers';
 import { pronounSlots, slotsFor } from './validate';
 
+/** One line of the Romanian pronoun table: every position the pronoun can take. */
+const roForms = (c: RoClitic): string =>
+  `free ${c.free} · attached ${c.enclitic} · after nu ${c.afterNu} · after să ${c.afterSa} · fused ${c.fused || '—'} · behind the participle ${c.after || '—'}`;
+
 const LANG_NAME = { el: 'Ελληνικά', ro: 'Română', en: 'English' } as const;
 
@@ -53,9 +57,9 @@
 function cliticLines(): string[] {
   return [
-    'Romanian pronouns (free, attached to a command, after nu):',
-    ...Object.entries(RO_CLITICS).map(([key, c]) => `- ${key}: free ${c.free} · attached ${c.enclitic} · after nu ${c.afterNu}`),
+    'Romanian pronouns (free, attached to a command, after nu, after să, fused with an auxiliary, behind the participle):',
+    ...Object.entries(RO_CLITICS).map(([key, c]) => `- ${key}: ${roForms(c)}`),
     '',
     'Romanian clusters (dative + accusative):',
-    ...Object.entries(RO_CLUSTERS).map(([key, c]) => `- ${key}: attached ${c.enclitic} · after nu ${c.afterNu}`),
+    ...Object.entries(RO_CLUSTERS).map(([key, c]) => `- ${key}: ${roForms(c)}`),
     '',
     'English pronouns:',
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1073 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/ro-pronouns.test.ts src/data/clitics.ts src/engine/clitics.test.ts src/engine/clitics.ts src/engine/romanian.ts src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: the Romanian pronoun table and the forms with pronouns

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Pronouns in every form: Greek, English and which verbs take them

**Files:**
- Create (test): `src/engine/pronouns-finite.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/engine/compose.ts`
- Modify: `src/engine/english.ts`
- Modify: `src/engine/offers.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/engine/compose-clitics.test.ts`
- Modify (test): `src/validate/clitics-validate.test.ts`
- Modify (test): `src/validate/groups-validate.test.ts`

**Interfaces:**
- Consumes: `compose`, `enVerb`, `slotProblem`, `pronounSlots` and the Romanian forms of Task 1.
- Produces: `VerbVoice.intransitive`; `slotProblem` accepts pronouns in any mood for an active verb that takes an object, refuses them for a reflexive voice or an `intransitive` verb ("<lemma> takes no object"), and refuses a short form outside a command; `compose` puts the pronouns after the particle and μην and before the auxiliary; every English verb cell ends with its pronouns; `pronounSlots` builds slots for every mood and both Romanian genders.

Three existing tests asserted the old rule (pronouns only with a command); the diffs below change them to the new rule. The Greek reading of a form with pronouns needs no change: the pronoun is a `clitic` piece like any other.

- [ ] **Step 1: Write the tests**

Create `src/engine/pronouns-finite.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { pronounSlots } from '../validate/validate';
import { compose } from './compose';
import { enVerbText } from './english';
import { EN_PRONOUNS } from './labels';
import { slotProblem } from './offers';
import { readingFor } from './reading';
import { whoIndex } from './tenses';

const troo = getVerb('troo');
const dino = getVerb('dino');
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

const slot = (
  mood: Mood,
  tense: Tense,
  clitics: Clitic[] = [IT],
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  negative = false,
): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', clitics, ...(negative ? { polarity: 'negative' as const } : {}),
});
const el = (s: SlotOf<'verb'>, verb = troo) => compose(verb, s).text;
const en = (s: SlotOf<'verb'>, verb = troo) => enVerbText(verb, s, EN_PRONOUNS[whoIndex(s)]);

describe('Greek pronouns before the verb group (spec 4.3)', () => {
  it('stand in front of the verb: το τρώω, δεν το τρώω', () => {
    expect(el(slot('indicative', 'present'))).toBe('το τρώω');
    expect(el(slot('indicative', 'present', [IT], 1, 'sg', true))).toBe('δεν το τρώω');
    expect(el(slot('indicative', 'aorist', [IT], 3))).toBe('το έφαγε');
  });

  it('stand after θα and before the auxiliary: θα το φάω, το έχω φάει, θα το έχω φάει', () => {
    expect(el(slot('indicative', 'futureSimple'))).toBe('θα το φάω');
    expect(el(slot('indicative', 'futureSimple', [IT], 1, 'sg', true))).toBe('δεν θα το φάω');
    expect(el(slot('indicative', 'perfect'))).toBe('το έχω φάει');
    expect(el(slot('indicative', 'perfect', [IT], 1, 'sg', true))).toBe('δεν το έχω φάει');
    expect(el(slot('indicative', 'pluperfect'))).toBe('το είχα φάει');
    expect(el(slot('indicative', 'futurePerfect'))).toBe('θα το έχω φάει');
  });

  it('go with the conditional, the subjunctive and the hortative', () => {
    expect(el(slot('conditional', 'imperfect'))).toBe('θα το έτρωγα');
    expect(el(slot('conditional', 'pluperfect'))).toBe('θα το είχα φάει');
    expect(el(slot('subjunctive', 'aorist'))).toBe('να το φάω');
    expect(el(slot('subjunctive', 'aorist', [IT], 1, 'sg', true))).toBe('να μην το φάω');
    expect(el(slot('subjunctive', 'perfect'))).toBe('να το έχω φάει');
    expect(el(slot('hortative', 'aorist', [IT], 1, 'pl'))).toBe('ας το φάμε');
    expect(el(slot('hortative', 'aorist', [IT], 1, 'pl', true))).toBe('ας μην το φάμε');
  });

  it('two pronouns keep the indirect one first: θα μου το δώσεις', () => {
    expect(el(slot('indicative', 'futureSimple', [ME, IT], 2), dino)).toBe('θα μου το δώσεις');
    expect(el(slot('indicative', 'perfect', [ME, IT], 2), dino)).toBe('μου το έχεις δώσει');
  });

  it('gives each word its own piece, in written order, with no second accent', () => {
    const composed = compose(troo, slot('indicative', 'futureSimple', [IT], 1, 'sg', true));
    expect(composed.pieces.map((p) => p.kind)).toEqual(['negation', 'particle', 'clitic', 'verb']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular).toBeUndefined();
  });

  it('commands are unchanged: pronouns after the verb, or after μην', () => {
    expect(el(slot('imperative', 'aorist', [IT], 2))).toBe('φάε το');
    expect(el(slot('imperative', 'aorist', [IT], 2, 'sg', true))).toBe('μην το φας');
  });
});

describe('English pronouns after the verb or the participle', () => {
  it('says "eat it", "has eaten it", "will give it to me"', () => {
    expect(en(slot('indicative', 'present'))).toBe('I eat it');
    expect(en(slot('indicative', 'present', [IT], 3))).toBe('he/she eats it');
    expect(en(slot('indicative', 'present', [IT], 1, 'sg', true))).toBe("I don't eat it");
    expect(en(slot('indicative', 'futureSimple'))).toBe('I will eat it');
    expect(en(slot('indicative', 'perfect'))).toBe('I have eaten it');
    expect(en(slot('conditional', 'pluperfect'))).toBe('I would have eaten it');
    expect(en(slot('subjunctive', 'aorist'))).toBe('that I eat it');
    expect(en(slot('hortative', 'aorist', [IT], 1, 'pl'))).toBe("let's eat it");
    expect(en(slot('hortative', 'aorist', [IT], 1, 'pl', true))).toBe("let's not eat it");
    expect(en(slot('indicative', 'futureSimple', [ME, IT], 2), dino)).toBe('you will give it to me');
  });

  it('commands keep their pronouns too', () => {
    expect(en(slot('imperative', 'aorist', [IT], 2))).toBe('eat it');
    expect(en(slot('imperative', 'aorist', [ME, IT], 2), dino)).toBe('give it to me');
  });
});

describe('which verbs take pronouns', () => {
  it('a verb with an object does, in every active slot; πάω, είμαι and a reflexive voice do not', () => {
    expect(slotProblem(troo, slot('indicative', 'present'))).toBeNull();
    expect(slotProblem(troo, slot('hortative', 'present', [IT], 1, 'pl'))).toBeNull();
    expect(slotProblem(getVerb('pao'), slot('indicative', 'present'))).toMatch(/takes no object/);
    expect(slotProblem(getVerb('eimai'), slot('indicative', 'present'))).toMatch(/takes no object/);
    expect(slotProblem(getVerb('pleno'), { ...slot('indicative', 'present'), voice: 'mediopassive' })).toMatch(/takes no object/);
  });

  it('a short form is for commands only', () => {
    expect(slotProblem(troo, { ...slot('indicative', 'present'), shortForm: true })).toMatch(/only with a command/);
  });

  it('the validator builds the pronoun slots of every mood: two Romanian genders, and the pair for δίνω', () => {
    const present = slot('indicative', 'present', undefined);
    delete present.clitics;
    expect(pronounSlots(troo, present)).toHaveLength(4);
    expect(pronounSlots(dino, present)).toHaveLength(8);
    expect(pronounSlots(getVerb('pao'), present)).toEqual([]);
    expect(pronounSlots(troo, { ...present, voice: 'mediopassive' })).toEqual([]);
  });
});

describe('the reading of a form with a pronoun in a tense', () => {
  it('takes το έχω φάει apart: pronoun, auxiliary, stem, ending', () => {
    const reading = readingFor(troo, slot('indicative', 'perfect'));
    expect(reading.el.parts.map((p) => p.role)).toEqual(['clitic', 'auxiliary', 'stem', 'ending']);
    expect(reading.ro).toBeUndefined();
    expect(reading.en).toBeUndefined();
  });
});
```

Change `src/engine/compose-clitics.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -115,6 +115,13 @@
     expect(slotProblem(dino, command([mou]))).toBeNull();
   });
-  it('refuses pronouns outside a command', () => {
-    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present' }))).toMatch(/only with a command/);
+  it('accepts pronouns outside a command, but not a short form, and not with a verb that takes no object', () => {
+    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present' }))).toBeNull();
+    expect(slotProblem(troo, command([to], { mood: 'indicative', tense: 'present', shortForm: true }))).toMatch(
+      /only with a command/,
+    );
+    expect(slotProblem(getVerb('pao'), command([to], { mood: 'indicative', tense: 'present' }))).toMatch(/takes no object/);
+    expect(slotProblem(getVerb('pleno'), command([to], { mood: 'indicative', tense: 'present', voice: 'mediopassive' }))).toMatch(
+      /takes no object/,
+    );
   });
   it('refuses three pronouns, the wrong order, a missing gender and an indirect object the verb cannot take', () => {
```

Change `src/validate/clitics-validate.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -55,10 +55,10 @@
     expect(errors).toContain('test token 0 (Φάε!): text differs from what compose produces ("φάε το")');
   });
-  it('reports pronouns outside a command', () => {
+  it('reports pronouns with a verb that takes no object', () => {
     const errors = validate({
       ...base,
-      phrases: [phraseWith({ text: 'Τρώω το', lexeme: 'troo', slot: slot({ mood: 'indicative', tense: 'present', clitics: [it_] }) })],
+      phrases: [phraseWith({ text: 'Το πάω', lexeme: 'pao', slot: slot({ mood: 'indicative', tense: 'present', clitics: [it_] }) })],
     });
-    expect(errors.some((e) => e.includes('pronouns and short forms go only with a command'))).toBe(true);
+    expect(errors.some((e) => e.includes('πάω takes no object'))).toBe(true);
   });
 });
```

Change `src/validate/groups-validate.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -24,5 +24,5 @@
     const broken = {
       ...eat.members[1],
-      verb: { ...eat.members[1].verb, slot: { ...eat.members[1].verb.slot, mood: 'indicative' as const, tense: 'present' as const } },
+      verb: { ...eat.members[1].verb, slot: { ...eat.members[1].verb.slot, mood: 'indicative' as const, tense: 'present' as const, shortForm: true } },
     };
     const errors = validate(input([{ ...eat, members: [eat.members[0], broken] }]));
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/pronouns-finite.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -579,4 +579,5 @@
       lemma: 'πηδάω',
       class: 'contracted-ao',
+      intransitive: true,
       stems: {
         present: 'πηδ',
@@ -699,4 +700,5 @@
       lemma: 'πάω',
       class: 'athematic',
+      intransitive: true,
       stems: {
         present: 'πά',
@@ -770,4 +772,5 @@
       lemma: 'είμαι',
       class: 'copula',
+      intransitive: true,
       stems: { present: 'είμαι' },
       overrides: {
@@ -948,4 +951,5 @@
       lemma: 'μπορεί',
       class: 'impersonal',
+      intransitive: true,
       stems: { present: 'μπορ' },
       offers: { indicative: ['present'] },
```

Change `src/engine/compose.ts` (unified diff):

```diff
@@ -96,7 +96,8 @@
 
 /**
- * Builds a verb group in written order: the negation (δεν before θα; μην after να), the particle (θα, να),
- * the auxiliary (έχω) and the lexical verb. A negative command is μην + the pronouns + the subjunctive form
- * (μην το φας); an affirmative command puts its pronouns after the verb (φάε το). See spec 4.3.
+ * Builds a verb group in written order: the negation (δεν before θα; μην after να and ας), the particle (θα, να, ας),
+ * the pronouns, the auxiliary (έχω) and the lexical verb: δεν θα το φάω, να μην το φάω, το έχω φάει. A negative command
+ * is μην + the pronouns + the subjunctive form (μην το φας); an affirmative command puts its pronouns after the verb
+ * (φάε το). See spec 4.3.
  */
 export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
@@ -121,5 +122,5 @@
     ]);
   }
-  if (clitics.length > 0) return commandWithClitics(verb, slot, clitics);
+  if (slot.mood === 'imperative' && clitics.length > 0) return commandWithClitics(verb, slot, clitics);
 
   const structure = structureOf(slot.mood, slot.tense);
@@ -131,4 +132,6 @@
   if (structure.particle) pieces.push(wordPiece('particle', structure.particle));
   if (negation && afterParticle) pieces.push(negation);
+  // Outside a command the pronouns stand in front of the auxiliary or the verb, after the particle and μην (spec 4.3).
+  pieces.push(...clitics.map((c) => cliticPiece(c)));
   if (structure.aux) {
     const auxSlot: SlotOf<'verb'> = {
```

Change `src/engine/english.ts` (unified diff):

```diff
@@ -50,8 +50,10 @@
   const presentNot = en.modal ? `${present} not` : `${DONT[i]} ${en.base}`;
   const self = en.reflexive ? ` (${SELF[i]})` : '';
+  // The pronouns follow the verb, or the participle: "eat it", "has eaten it", "will give it to me".
+  const objects = enObjects(s.clitics ?? []);
   const parts = (verb: string, lead = '', subject = true, pronoun?: string): EnParts => ({
     lead,
     subject,
-    verb: `${verb}${self}`,
+    verb: `${verb}${self}${objects}`,
     ...(pronoun ? { pronoun } : {}),
   });
@@ -79,5 +81,5 @@
     case 'imperative.present':
     case 'imperative.aorist':
-      return parts(`${negative ? `don't ${en.base}` : en.base}${enObjects(s.clitics ?? [])}`, '', false);
+      return parts(negative ? `don't ${en.base}` : en.base, '', false);
     case 'hortative.present':
     case 'hortative.aorist':
```

Change `src/engine/offers.ts` (unified diff):

```diff
@@ -68,11 +68,13 @@
 }
 
-/** What is wrong with the pronouns or the short form of a slot, or null (spec 2, 4.2, 7). */
+/** What is wrong with the pronouns or the short form of a slot, or null (spec 2, 4.2, 4.3, 7). */
 export function slotProblem(verb: GreekVerb, s: SlotOf<'verb'>): string | null {
   const clitics = s.clitics ?? [];
   if (clitics.length === 0 && !s.shortForm) return null;
-  if (s.mood !== 'imperative') return 'pronouns and short forms go only with a command';
+  if (s.shortForm && s.mood !== 'imperative') return 'a short form goes only with a command';
   const data = verb.voices[s.voice];
   if (!data) return `${verb.id} has no ${s.voice} voice`;
+  // A verb that takes no object, and a reflexive (mediopassive) verb, take no pronouns (spec 4.3).
+  if (clitics.length > 0 && (s.voice !== 'active' || data.intransitive)) return `${data.lemma} takes no object`;
   if (clitics.length > 2) return 'a command takes at most two pronouns';
   if (clitics.some((c) => c.person === 3 && !c.gender)) return 'a third-person pronoun needs a gender';
```

Change `src/types.ts` (unified diff):

```diff
@@ -299,4 +299,6 @@
   /** The verb takes an indirect object (δίνω: δώσε μου). */
   indirect?: true;
+  /** The verb takes no object (πάω, πηδάω, είμαι, μπορεί): it takes no pronouns. */
+  intransitive?: true;
   /** Short forms of commands, keyed '<impAorist|impPresent>.<person><number>' (impAorist.2sg). Stored per verb, not generated. */
   shortForms?: Record<string, ShortForm>;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -74,15 +74,26 @@
 
 const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
+/** The same pronoun for a noun that is masculine in Romanian (παιδί: îl), so both Romanian forms are built. */
+const IT_M: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'it' };
 const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
 
-/** The commands with pronouns the panel can build from an offered command: one direct pronoun, and for a verb with an indirect object also "me" and the pair. */
+/**
+ * The forms with pronouns the panel can build from an offered slot: one direct pronoun (in both Romanian genders)
+ * and, for a verb with an indirect object, the pair "me + it"; for a command also "me" alone, beside a spelled-out noun.
+ * Each comes affirmative and negative, and a command also with its short form.
+ */
 export function pronounSlots(verb: GreekVerb, slot: SlotOf<'verb'>): SlotOf<'verb'>[] {
-  if (slot.mood !== 'imperative') return [];
-  const indirect = verb.voices[slot.voice]?.indirect === true;
-  const sets: Clitic[][] = indirect ? [[IT], [ME], [ME, IT]] : [[IT]];
+  const data = verb.voices[slot.voice];
+  if (!data || slot.voice !== 'active' || data.intransitive) return [];
+  const command = slot.mood === 'imperative';
+  const sets: Clitic[][] = [
+    [IT],
+    [IT_M],
+    ...(data.indirect === true ? [[ME, IT], [ME, IT_M], ...(command ? [[ME]] : [])] : []),
+  ];
   return sets.flatMap((clitics): SlotOf<'verb'>[] => [
     { ...slot, clitics },
     { ...slot, clitics, polarity: 'negative' },
-    ...(shortFormOf(verb, slot) ? [{ ...slot, clitics, shortForm: true }] : []),
+    ...(command && shortFormOf(verb, slot) ? [{ ...slot, clitics, shortForm: true }] : []),
   ]);
 }
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1085 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/pronouns-finite.test.ts src/data/lexemes.ts src/engine/compose-clitics.test.ts src/engine/compose.ts src/engine/english.ts src/engine/offers.ts src/types.ts src/validate/clitics-validate.test.ts src/validate/groups-validate.test.ts src/validate/validate.ts
git commit -m "feat: pronouns with every indicative, subjunctive, conditional and hortative form

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: The Object control in every mood

**Files:**
- Create (test): `src/panels/pronoun-panel.test.ts`
- Modify: `src/engine/labels.ts`
- Modify: `src/engine/objects.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/verb.ts`
- Modify (test): `src/panels/object.test.ts`
- Modify (test): `src/panels/panels.test.ts`
- Modify (test): `src/panels/verb.test.ts`

**Interfaces:**
- Consumes: `objectKind`, `objectOptions`, `changeVerbSlot`, `applyControl` and the verb panel (Plan 6), and `takesObject` rules of Task 2.
- Produces: `objectKind` returns `noun` only for a command; `objectOptions(level, indirect, command = true)`; the verb panel offers the Object control for every verb that takes an object, in every mood; `changeVerbSlot` keeps the pronouns across moods; the held noun stays while the verb has pronouns; `applyControl('object', 'noun')` is ignored outside a command; the plain-language line says where the pronoun goes in a tense.

The control order is Who, Mood, When, (Voice), Negated, Object, (Object noun). Six existing tests list the controls of a verb and change to include `object`.

- [ ] **Step 1: Write the tests**

Create `src/panels/pronoun-panel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Mood, Person, SlotOf, Tense } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const verbSlot = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  patch: Partial<SlotOf<'verb'>> = {},
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice: 'active', ...patch });
const stateOf = (slot: SlotOf<'verb'>, noun: string | null = null): PanelState => ({ slot, noun, nounNumber: 'sg' });
const panelOf = (lexeme: string, state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const row = (p: ReturnType<typeof panelOf>) => ({
  el: richText(p.rows[0].el),
  ro: richText(p.rows[0].ro),
  en: richText(p.rows[0].en),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the Object control in every mood', () => {
  it('turns a plain present into one with a pronoun: το θέλω / o vreau / I want it', () => {
    const start = stateOf(verbSlot('indicative', 'present'));
    const next = applyControl(start, 'object', 'pronoun', 'thelo');
    expect(next.noun).toBe('psomi');
    const p = panelOf('thelo', next);
    expect(row(p)).toEqual({ el: '(εγώ) το θέλω', ro: '(eu) o vreau', en: 'I want it' });
    expect(control(p, 'object')?.value).toBe('pronoun');
    expect(control(p, 'noun')?.value).toBe('psomi');
    expect(p.plain).toContain('in front of the verb group');
  });

  it('offers none, a pronoun and, for δίνω, two pronouns; a spelled-out noun only for a command', () => {
    const p = panelOf('dino', stateOf(verbSlot('indicative', 'present')));
    expect(control(p, 'object')?.options.map((o) => o.value)).toEqual(['none', 'pronoun', 'two']);
    const command = panelOf('dino', stateOf(verbSlot('imperative', 'aorist', 2)));
    expect(control(command, 'object')?.options.map((o) => o.value)).toEqual(['none', 'noun', 'pronoun', 'two']);
  });

  it('two pronouns in the simple future: θα μου το δώσεις / mi-o vei da / you will give it to me', () => {
    const start = stateOf(verbSlot('indicative', 'futureSimple', 2));
    const next = applyControl(start, 'object', 'two', 'dino');
    expect(row(panelOf('dino', next))).toEqual({
      el: '(εσύ) θα μου το δώσεις',
      ro: '(tu) mi-o vei da',
      en: 'you will give it to me',
    });
  });

  it('a negated hortative with a pronoun: ας μην το φάμε / să nu o mâncăm / let\'s not eat it', () => {
    const start = stateOf(verbSlot('hortative', 'aorist', 1, 'pl', { polarity: 'negative' }));
    const next = applyControl(start, 'object', 'pronoun', 'troo');
    expect(row(panelOf('troo', next))).toEqual({ el: '(εμείς) ας μην το φάμε', ro: '(noi) să nu o mâncăm', en: "let's not eat it" });
  });

  it('ignores a spelled-out noun outside a command', () => {
    const start = stateOf(verbSlot('indicative', 'present'));
    expect(applyControl(start, 'object', 'noun', 'troo').slot).not.toHaveProperty('clitics');
  });

  it('a verb that takes no object has no Object control', () => {
    expect(control(panelOf('pao', stateOf(verbSlot('indicative', 'present'))), 'object')).toBeUndefined();
    expect(control(panelOf('eimai', stateOf(verbSlot('indicative', 'present'))), 'object')).toBeUndefined();
  });
});

describe('the pronoun survives the other controls when it can', () => {
  const withPronoun = applyControl(stateOf(verbSlot('indicative', 'present')), 'object', 'pronoun', 'troo');

  it('keeps the pronoun and its noun when the mood, the tense, the person or the negation changes', () => {
    for (const [key, value] of [['mood', 'subjunctive'], ['tense', 'aorist'], ['who', '3pl'], ['polarity', 'negative']] as const) {
      const next = applyControl(withPronoun, key, value, 'troo');
      expect(next.slot.pos === 'verb' && next.slot.clitics?.length, key).toBe(1);
      expect(next.noun, key).toBe('psomi');
    }
  });

  it('keeps it going into a command, where the short form can be chosen again', () => {
    const next = applyControl(withPronoun, 'mood', 'imperative', 'troo');
    expect(next.slot).toMatchObject({ mood: 'imperative', person: 2 });
    expect(next.slot.pos === 'verb' && next.slot.clitics?.length).toBe(1);
  });

  it('drops the pronoun, and the noun, when the voice cannot take one', () => {
    const wash = applyControl(stateOf(verbSlot('indicative', 'present')), 'object', 'pronoun', 'pleno');
    const reflexive = applyControl(wash, 'voice', 'mediopassive', 'pleno');
    expect(reflexive.slot).not.toHaveProperty('clitics');
    expect(reflexive.noun).toBeNull();
  });

  it('reads as a Greek reading with the pronoun as its own part', () => {
    const perfect = applyControl(withPronoun, 'tense', 'perfect', 'troo');
    const p = panelOf('troo', perfect);
    expect(row(p).el).toBe('(εγώ) το έχω φάει');
    expect(p.reading?.[0].parts.map((part) => part.role)).toEqual(['clitic', 'auxiliary', 'stem', 'ending']);
  });
});
```

Change `src/panels/object.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -58,7 +58,8 @@
   });
 
-  it('outside a command there is no Object control and the full table has no pronouns', () => {
+  it('outside a command the Object control has no spelled-out noun, and the full table has no pronouns', () => {
     const present = panelOf('troo', command({ mood: 'indicative', tense: 'present' }), null);
-    expect(keys(present)).toEqual(['who', 'mood', 'tense', 'polarity']);
+    expect(keys(present)).toEqual(['who', 'mood', 'tense', 'polarity', 'object']);
+    expect(present.controls.find((c) => c.key === 'object')?.options.map((o) => o.value)).toEqual(['none', 'pronoun']);
     const improver = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver');
     expect(improver.full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
@@ -111,7 +112,7 @@
   const troo = getVerb('troo');
   const short = command({ clitics: [IT], shortForm: true });
-  it('leaving the command drops both', () => {
+  it('leaving the command drops the short form and keeps the pronoun', () => {
     const next = changeVerbSlot(troo, short, 'mood', 'indicative');
-    expect(next).not.toHaveProperty('clitics');
+    expect(next).toHaveProperty('clitics');
     expect(next).not.toHaveProperty('shortForm');
   });
```

Change `src/panels/panels.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -27,8 +27,8 @@
 describe('verb panel (θέλω)', () => {
   const panel = panelFor(0);
-  it('has lemma, label and the Who?, Mood and When? controls', () => {
+  it('has lemma, label and the Who?, Mood, When? and Object controls', () => {
     expect(panel.lemma).toBe('θέλω');
     expect(panel.posLabel).toBe('verb: to want');
-    expect(panel.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);
+    expect(panel.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity', 'object']);
     expect(panel.controls[0]).toMatchObject({ key: 'who', label: 'Who?', value: '1sg' });
   });
```

Change `src/panels/verb.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -52,7 +52,7 @@
 
 describe('verb panel: controls', () => {
-  it('θέλω: Who, Mood and When, no Voice', () => {
+  it('θέλω: Who, Mood, When and Object, no Voice', () => {
     const p = panel('thelo', vs('indicative', 'present'));
-    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);
+    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity', 'object']);
     expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional', 'hortative']);
     expect(control(p, 'tense')?.options.map((o) => o.value)).toHaveLength(8);
@@ -62,5 +62,5 @@
   it('πλένω has a Voice control', () => {
     const p = panel('pleno', vs('indicative', 'present'));
-    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity']);
+    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity', 'object']);
     expect(control(p, 'voice')?.options.map((o) => o.value)).toEqual(['active', 'mediopassive']);
   });
@@ -239,7 +239,7 @@
   });
 
-  it('offers a Negated? control last, with plain Yes and No', () => {
+  it('offers a Negated? control with plain Yes and No, before the Object control', () => {
     const p = panel('pleno', vs('indicative', 'present'));
-    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity']);
+    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity', 'object']);
     expect(control(p, 'polarity')).toMatchObject({ label: 'Negated?', value: 'affirmative' });
     expect(control(p, 'polarity')?.options.map((o) => o.label)).toEqual(['No', 'Yes']);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/pronoun-panel.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/engine/labels.ts` (unified diff):

```diff
@@ -142,7 +142,7 @@
 
 /** The kinds of object of a command (spec 5.3). */
-export const objectOptions = (level: Level, indirect: boolean): Option[] => [
+export const objectOptions = (level: Level, indirect: boolean, command = true): Option[] => [
   { value: 'none', label: 'none' },
-  { value: 'noun', label: level === 'beginner' ? 'a noun (spelled out)' : 'a noun phrase' },
+  ...(command ? [{ value: 'noun', label: level === 'beginner' ? 'a noun (spelled out)' : 'a noun phrase' }] : []),
   { value: 'pronoun', label: level === 'beginner' ? 'a small word (it, him)' : 'a pronoun' },
   ...(indirect
```

Change `src/engine/objects.ts` (unified diff):

```diff
@@ -28,9 +28,12 @@
 }
 
-/** The kind of object a command has, from its pronouns and the noun the panel holds. */
+/**
+ * The kind of object a verb form has, from its pronouns and the noun the panel holds. A spelled-out noun is for
+ * commands only (spec 5.3): in any other mood a held noun with no pronoun means no object.
+ */
 export function objectKind(slot: SlotOf<'verb'>, noun: string | null): ObjectKind {
   const clitics = slot.clitics ?? [];
   if (clitics.some((c) => c.role === 'object')) return clitics.some((c) => c.role === 'indirect') ? 'two' : 'pronoun';
-  return noun ? 'noun' : 'none';
+  return noun && slot.mood === 'imperative' ? 'noun' : 'none';
 }
 
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -108,5 +108,6 @@
         const next = changeVerbSlot(getVerb(lexemeId), slot, key, value);
         // The object noun belongs to the command: leaving the imperative leaves it behind.
-        return { ...state, slot: next, noun: next.mood === 'imperative' ? state.noun : null };
+        // The held noun is what a command's object (or a pronoun's referent) is; without either it is left behind.
+        return { ...state, slot: next, noun: next.mood === 'imperative' || (next.clitics ?? []).length > 0 ? state.noun : null };
       }
       if (key === 'who' && slot.pos === 'clitic') return { ...state, slot: withWho(slot, value) };
@@ -186,5 +187,6 @@
       if (slot.pos === 'verb') {
         if (!lexemeId) throw new Error('the object control needs the lexeme');
-        const kind = value as ObjectKind;
+        // A spelled-out noun is for commands only.
+        const kind = (value === 'noun' && slot.mood !== 'imperative' ? 'none' : value) as ObjectKind;
         const noun = getNoun(state.noun ?? DEFAULT_OBJECT);
         const next = { ...slot };
```

Change `src/panels/verb.ts` (unified diff):

```diff
@@ -74,4 +74,8 @@
 }
 
+/** Does the verb form take an object? Reflexive (mediopassive) verbs and verbs like πάω do not. */
+const takesObject = (verb: GreekVerb, slot: SlotOf<'verb'>): boolean =>
+  slot.voice === 'active' && voiceOf(verb, slot.voice).intransitive !== true;
+
 const pronounCells = (verb: GreekVerb, slot: SlotOf<'verb'>) => {
   const data = voiceOf(verb, slot.voice);
@@ -143,9 +147,6 @@
   // A negative command needs the verb to offer the matching subjunctive; if it does not, drop the negation.
   if (next.polarity === 'negative' && !isOffered(verb, next)) delete next.polarity;
-  // Pronouns and short forms are for commands; drop what no longer fits.
-  if (next.mood !== 'imperative') {
-    delete next.clitics;
-    delete next.shortForm;
-  }
+  // A short form is for commands; the pronouns stay unless the verb or the voice cannot take them (below).
+  if (next.mood !== 'imperative') delete next.shortForm;
   if (next.polarity === 'negative') delete next.shortForm;
   if (slotProblem(verb, next)) delete next.shortForm;
@@ -158,4 +159,6 @@
   affirmative: 'The pronoun follows an affirmative command (φάε το).',
   negative: 'The pronoun goes in front of the verb in a negative command (μην το φας).',
+  finite:
+    'The pronoun goes in front of the verb group, after δεν and θα / να / ας and before έχω: το τρώω, δεν το τρώω, θα το φάω, το έχω φάει.',
 };
 
@@ -206,7 +209,12 @@
     value: slot.polarity ?? 'affirmative',
   });
-  if (slot.mood === 'imperative') {
+  if (takesObject(verb, slot)) {
     const indirect = voiceOf(verb, slot.voice).indirect === true;
-    list.push({ key: 'object', label: 'Object', options: objectOptions(level, indirect), value: kind });
+    list.push({
+      key: 'object',
+      label: 'Object',
+      options: objectOptions(level, indirect, slot.mood === 'imperative'),
+      value: kind,
+    });
     if (kind !== 'none') list.push(nounControl('Object noun', state));
   }
@@ -253,5 +261,5 @@
   const formNote = lexicalPiece(composed)?.form.irregular?.plain;
   const who = offeredWho(verb, slot.voice, slot.mood);
-  const kind: ObjectKind = slot.mood === 'imperative' ? objectKind(slot, state.noun) : 'none';
+  const kind: ObjectKind = takesObject(verb, slot) ? objectKind(slot, state.noun) : 'none';
   const objectNoun = kind === 'noun' && state.noun ? getNoun(state.noun) : null;
   return {
@@ -278,5 +286,11 @@
       (slot.polarity === 'negative' ? ` ${NEGATION_PLAIN[slot.mood]}` : '') +
       ((slot.clitics ?? []).length > 0
-        ? ` ${slot.polarity === 'negative' ? CLITIC_PLAIN.negative : CLITIC_PLAIN.affirmative}`
+        ? ` ${
+            slot.mood !== 'imperative'
+              ? CLITIC_PLAIN.finite
+              : slot.polarity === 'negative'
+                ? CLITIC_PLAIN.negative
+                : CLITIC_PLAIN.affirmative
+          }`
         : ''),
     irregular: composed.irregular?.plain ?? formNote ?? classMessage(data),
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1095 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/pronoun-panel.test.ts src/engine/labels.ts src/engine/objects.ts src/panels/object.test.ts src/panels/panels.test.ts src/panels/panels.ts src/panels/verb.test.ts src/panels/verb.ts
git commit -m "feat: the Object control in every mood

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: The verb λέω

**Files:**
- Create (test): `src/engine/lego.test.ts`
- Modify: `src/data/lexemes.ts`

**Interfaces:**
- Consumes: The verb data shape (`VerbVoice`), `ACCENT_DROP`, the `athematic` class.
- Produces: The verb `lego` (λέω, *a zice*, say / call) with the present, the imperfect and the present subjunctive.

λέω is transitive, so it takes pronouns like the others (*το λένε*). It offers no aorist, so it offers no hortative.

- [ ] **Step 1: Write the tests**

Create `src/engine/lego.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, Person, SlotOf, Tense } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { roVerb } from './romanian';
import { whoIndex } from './tenses';

const lego = getVerb('lego');
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'it' };
const slot = (mood: Mood, tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg', clitics?: Clitic[]): SlotOf<'verb'> => ({
  pos: 'verb', person, number, mood, tense, voice: 'active', ...(clitics ? { clitics } : {}),
});
const el = (s: SlotOf<'verb'>) => compose(lego, s).text;
const en = (s: SlotOf<'verb'>) => enVerbText(lego, s, EN_PRONOUNS[whoIndex(s)]);

describe('λέω', () => {
  it('present: λέω, λες, λέει, λέμε, λέτε, λένε', () => {
    const forms = ([[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']] as const).map(([p, n]) =>
      el(slot('indicative', 'present', p, n)),
    );
    expect(forms).toEqual(['λέω', 'λες', 'λέει', 'λέμε', 'λέτε', 'λένε']);
  });

  it('imperfect: έλεγα … λέγαμε, λέγατε, έλεγαν (the augment goes where the stress moves)', () => {
    const forms = ([[1, 'sg'], [2, 'sg'], [3, 'sg'], [1, 'pl'], [2, 'pl'], [3, 'pl']] as const).map(([p, n]) =>
      el(slot('indicative', 'imperfect', p, n)),
    );
    expect(forms).toEqual(['έλεγα', 'έλεγες', 'έλεγε', 'λέγαμε', 'λέγατε', 'έλεγαν']);
  });

  it('subjunctive present: να λέω, να λες', () => {
    expect(el(slot('subjunctive', 'present', 1))).toBe('να λέω');
    expect(el(slot('subjunctive', 'present', 2))).toBe('να λες');
  });

  it('offers the present, the imperfect and the present subjunctive, and nothing else', () => {
    expect(allVerbSlots(lego)).toHaveLength(3 * 6);
    expect(allVerbSlots(lego).map((s) => `${s.mood}.${s.tense}`).filter((k, i, all) => all.indexOf(k) === i)).toEqual([
      'indicative.present', 'indicative.imperfect', 'subjunctive.present',
    ]);
  });

  it('Romanian a zice and English say', () => {
    expect(roVerb(lego, slot('indicative', 'present', 3, 'pl'))).toBe('zic');
    expect(roVerb(lego, slot('indicative', 'imperfect', 1))).toBe('ziceam');
    expect(roVerb(lego, slot('subjunctive', 'present', 3))).toBe('să zică');
    expect(en(slot('indicative', 'present', 3, 'pl'))).toBe('they say');
    expect(en(slot('indicative', 'imperfect', 1))).toBe('I was saying');
  });

  it('with a pronoun: το λένε / îl zic / they say it', () => {
    const s = slot('indicative', 'present', 3, 'pl', [IT]);
    expect(el(s)).toBe('το λένε');
    expect(roVerb(lego, s)).toBe('îl zic');
    expect(en(s)).toBe('they say it');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/lego.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -570,4 +570,37 @@
 };
 
+/** λέω, "say" and "call": it offers the present, the imperfect and the present subjunctive (spec 6.6). */
+const lego: GreekVerb = {
+  id: 'lego',
+  pos: 'verb',
+  lemma: 'λέω',
+  verified: { el: false, ro: false, en: false },
+  voices: {
+    active: {
+      lemma: 'λέω',
+      class: 'athematic',
+      stems: {
+        present: 'λέ',
+        imperfect: { strong: { augment: 'έ', stem: 'λεγ' }, weak: { stem: 'λέγ' } },
+      },
+      overrides: {
+        'present.2sg': { stem: 'λε', ending: 'ς', note: ACCENT_DROP },
+      },
+      offers: { indicative: ['present', 'imperfect'], subjunctive: ['present'] },
+      ro: {
+        lemma: 'a zice',
+        infinitive: 'zice',
+        participle: 'zis',
+        present: ['zic', 'zici', 'zice', 'zicem', 'ziceți', 'zic'],
+        subjunctive: ['zic', 'zici', 'zică', 'zicem', 'ziceți', 'zică'],
+        imperfect: ['ziceam', 'ziceai', 'zicea', 'ziceam', 'ziceați', 'ziceau'],
+        pluperfect: ['zisesem', 'ziseseși', 'zisese', 'ziseserăm', 'ziseserăți', 'ziseseră'],
+        imperative: ['zi', 'ziceți'],
+      },
+      en: { gloss: 'say / call', base: 'say', third: 'says', past: 'said', pastParticiple: 'said', ing: 'saying' },
+    },
+  },
+};
+
 const pidao: GreekVerb = {
   id: 'pidao',
@@ -1154,4 +1187,5 @@
   [pidao.id]: pidao,
   [kano.id]: kano,
+  [lego.id]: lego,
   [troo.id]: troo,
   [dino.id]: dino,
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1101 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/lego.test.ts src/data/lexemes.ts
git commit -m "feat: the verb λέω

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Phrases 54 to 56

**Files:**
- Create (test): `src/data/phrases-pronouns.test.ts`
- Modify: `src/data/phrases.ts`
- Modify (test): `src/App.questions.test.tsx`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The lexemes `lego`, `troo`, `dino`, `pos-how`, the helpers `iq`, `hslot`, `present`, `vslot`, `rows`, `u`, `p`, `seg` and the constants `IT`, `IT_CHILD`, `ME` in `src/data/phrases.ts`.
- Produces: Three phrases: `what-is-it-called`, `lets-eat-it`, `will-you-give-it-to-me`; the picker lists 56 phrases; `withClitics(slot, clitics)`.

Phrase 54 uses `IT_CHILD` (*îl* in Romanian, as in the spec's literal *cum îl zic*); phrase 55 uses `IT` (*o*, because *pâine* is feminine); phrase 56 uses `ME` and `IT` and a segmented Romanian unit (*Mi* + *-o*) whose segments link to two pieces of the verb group.

- [ ] **Step 1: Write the tests**

Create `src/data/phrases-pronouns.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES, getVerb } from '../data/lexemes';
import { compose } from '../engine/compose';
import { roVerb } from '../engine/romanian';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
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
const verbToken = (id: string, index: number) => {
  const token = phrase(id).tokens[index];
  if (token.slot.pos !== 'verb') throw new Error('not a verb');
  return { verb: getVerb(token.lexeme), slot: token.slot };
};

describe('phrases 54 to 56', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the themes the spec gives', () => {
    const three = ['what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me'].map(phrase);
    expect(three.map((p) => p.theme)).toEqual(['Daily life', 'Wishes and possibility', 'Daily life']);
    expect(three.every((p) => !p.verified)).toBe(true);
  });

  it('Πώς το λένε; reads "What is it called?", with the literal Romanian cum îl zic', () => {
    expect(phrase('what-is-it-called').tokens.map((t) => t.text).join(' ')).toBe('Πώς το λένε;');
    expect(gloss('what-is-it-called', 'en', 'natural')).toBe('What is it called?');
    expect(gloss('what-is-it-called', 'ro', 'natural')).toBe('Cum se numește?');
    expect(gloss('what-is-it-called', 'ro', 'literal')).toBe('cum îl zic');
    const { verb, slot } = verbToken('what-is-it-called', 1);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('îl zic');
  });

  it('Ας το φάμε! is "Let\'s eat it!" and Să o mâncăm! (pâine is feminine)', () => {
    expect(gloss('lets-eat-it', 'en', 'natural')).toBe("Let's eat it!");
    expect(gloss('lets-eat-it', 'ro', 'natural')).toBe('Să o mâncăm!');
    const { verb, slot } = verbToken('lets-eat-it', 0);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['particle', 'clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('să o mâncăm');
  });

  it('Θα μου το δώσεις; has two pronouns, and the Romanian is Mi-o vei da?', () => {
    expect(gloss('will-you-give-it-to-me', 'en', 'natural')).toBe('Will you give it to me?');
    expect(gloss('will-you-give-it-to-me', 'ro', 'natural')).toBe('Mi-o vei da?');
    const { verb, slot } = verbToken('will-you-give-it-to-me', 0);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['particle', 'clitic', 'clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('mi-o vei da');
  });
});
```

Change `src/App.questions.test.tsx` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -77,2 +77,25 @@
   });
 });
+
+describe('pronouns in every form, in the app', () => {
+  it('shows a pronoun in the simple future, and takes the verb group apart', async () => {
+    const user = userEvent.setup();
+    render(<App />);
+    await user.selectOptions(screen.getByLabelText('Phrase'), 'Will you give it to me?');
+    expect(screen.getByRole('cell', { name: '(εσύ) θα μου το δώσεις' })).toBeInTheDocument();
+    expect(screen.getByRole('cell', { name: '(tu) mi-o vei da' })).toBeInTheDocument();
+    expect(screen.getByRole('cell', { name: 'you will give it to me' })).toBeInTheDocument();
+    await user.click(screen.getByRole('button', { name: 'το' }));
+    expect(screen.getByRole('button', { name: /Back to the verb/ })).toBeInTheDocument();
+  });
+
+  it('adds a pronoun to a verb with the Object control, in any mood', async () => {
+    const user = userEvent.setup();
+    render(<App />);
+    await user.selectOptions(screen.getByLabelText('Mood'), 'subjunctive');
+    await user.selectOptions(screen.getByLabelText('Object'), 'pronoun');
+    expect(screen.getByRole('cell', { name: '(εγώ) να το θέλω' })).toBeInTheDocument();
+    expect(screen.getByRole('cell', { name: '(eu) să o vreau' })).toBeInTheDocument();
+    expect(screen.getByRole('cell', { name: 'that I want it' })).toBeInTheDocument();
+  });
+});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 53 phrases in the spec order', () => {
+  it('the picker lists all 56 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -98,4 +98,5 @@
       'who-is-it', 'how-much-bread', 'where-are-you-from', 'until-when-will-you-go', 'what-time-is-it',
       'how-much-is-it', 'lets-eat', 'let-him-eat', 'lets-not-go',
+      'what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-pronouns.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1182,4 +1182,57 @@
 };
 
+/** The same verb slot with pronouns (spec 4.3). */
+const withClitics = (slot: Slot, clitics: Clitic[]): Slot => ({ ...(slot as SlotOf<'verb'>), clitics });
+
+const whatIsItCalled: Phrase = {
+  id: 'what-is-it-called',
+  title: 'What is it called?',
+  theme: 'Daily life',
+  level: 'beginner',
+  tokens: [
+    { text: 'Πώς', lexeme: 'pos-how', slot: iq },
+    { text: 'το λένε;', lexeme: 'lego', slot: withClitics(present(3, 'pl'), [IT_CHILD]) },
+  ],
+  glosses: rows(
+    [u('What', 0), u('is', null), u('it', p(1, 0)), u('called?', p(1, 1))],
+    [u('how', 0), u('it', p(1, 0)), u('(they)', null), u('say', p(1, 1))],
+    [u('Cum', 0), u('se', null), u('numește?', p(1, 1))],
+    [u('cum', 0), u('îl', p(1, 0)), u('zic', p(1, 1))],
+  ),
+  verified: false,
+};
+
+const letsEatIt: Phrase = {
+  id: 'lets-eat-it',
+  title: "Let's eat it!",
+  theme: 'Wishes and possibility',
+  level: 'improver',
+  tokens: [{ text: 'Ας το φάμε!', lexeme: 'troo', slot: withClitics(hslot('aorist', 1, 'pl'), [IT]) }],
+  glosses: rows(
+    [u("Let's", p(0, 0)), u('eat', p(0, 2)), u('it!', p(0, 1))],
+    [u('let', p(0, 0)), u('it', p(0, 1)), u('(we)', null), u('eat', p(0, 2))],
+    [u('Să', p(0, 0)), u('o', p(0, 1)), u('mâncăm!', p(0, 2))],
+    [u('să', p(0, 0)), u('o', p(0, 1)), u('(noi)', null), u('mâncăm', p(0, 2))],
+  ),
+  verified: false,
+};
+
+const willYouGiveItToMe: Phrase = {
+  id: 'will-you-give-it-to-me',
+  title: 'Will you give it to me?',
+  theme: 'Daily life',
+  level: 'improver',
+  tokens: [
+    { text: 'Θα μου το δώσεις;', lexeme: 'dino', slot: withClitics(vslot('indicative', 'futureSimple', 2), [ME, IT]) },
+  ],
+  glosses: rows(
+    [u('Will you', p(0, 0)), u('give', p(0, 3)), u('it', p(0, 2)), u('to me?', p(0, 1))],
+    [u('will', p(0, 0)), u('to-me', p(0, 1)), u('it', p(0, 2)), u('(you)', null), u('give', p(0, 3))],
+    [seg(['Mi', p(0, 1)], ['-o', p(0, 2)]), u('vei', p(0, 0)), u('da?', p(0, 3))],
+    [u('(tu)', null), seg(['mi', p(0, 1)], ['-o', p(0, 2)]), u('vei', p(0, 0)), u('da', p(0, 3))],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1232,3 +1285,6 @@
   letHimEat,
   letsNotGo,
+  whatIsItCalled,
+  letsEatIt,
+  willYouGiveItToMe,
 ];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1108 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/phrases-pronouns.test.ts src/App.questions.test.tsx src/data/phrases-verbs.test.ts src/data/phrases.ts
git commit -m "feat: phrases 54 to 56 (pronouns in every form)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Comparison notes and the review item for pronouns

**Files:**
- Create (test): `src/data/divergences-pronouns.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/data/review.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences` and the `when` conditions (`moods`, `tenses`, `clitics`).
- Produces: The divergence rows `pronoun-position-finite` and `pronoun-before-auxiliary`; the review item `clitic-table:ro-fusions`.

The existing pronoun rows (`clitic-position`, `clitic-gender`, `clitic-order`, `clitic-stress`) already apply to commands only (`moods: ['imperative']`), so they do not show for the new forms.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-pronouns.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Clitic, Level, Slot } from '../types';
import { DIVERGENCES } from './divergences';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const verb = (mood: string, tense: string, clitics?: Clitic[]): Slot =>
  ({ pos: 'verb', person: 1, number: 'sg', mood, tense, voice: 'active', ...(clitics ? { clitics } : {}) }) as Slot;
const ids = (slot: Slot, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'verb', 'troo', level, slot).map((d) => d.id);

describe('the comparison notes for pronouns in every form', () => {
  it('the position note shows for a pronoun in any mood but the imperative', () => {
    expect(ids(verb('indicative', 'present', [IT]))).toContain('pronoun-position-finite');
    expect(ids(verb('hortative', 'aorist', [IT]))).toContain('pronoun-position-finite');
    expect(ids(verb('imperative', 'aorist', [IT]))).not.toContain('pronoun-position-finite');
    expect(ids(verb('indicative', 'present'))).not.toContain('pronoun-position-finite');
  });

  it('the auxiliary note shows only in the perfect tenses, and only at Improver', () => {
    expect(ids(verb('indicative', 'perfect', [IT]))).toContain('pronoun-before-auxiliary');
    expect(ids(verb('conditional', 'pluperfect', [IT]))).toContain('pronoun-before-auxiliary');
    expect(ids(verb('indicative', 'aorist', [IT]))).not.toContain('pronoun-before-auxiliary');
    expect(ids(verb('indicative', 'perfect', [IT]), 'beginner')).not.toContain('pronoun-before-auxiliary');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-pronouns.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -728,3 +728,32 @@
     verified: false,
   },
+  {
+    id: 'pronoun-position-finite',
+    appliesTo: { pos: 'verb', when: { moods: ['indicative', 'subjunctive', 'conditional', 'hortative'], clitics: 'some' } },
+    point: 'Where the pronoun goes',
+    el: 'in front of the verb group: το τρώω, δεν το τρώω, θα το φάω',
+    ro: 'in front too (îl mănânc), fused with să or the auxiliary (să-l mănânc, l-am mâncat)',
+    en: 'after the verb or the participle: "eat it", "has eaten it"',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'pronoun-before-auxiliary',
+    appliesTo: {
+      pos: 'verb',
+      when: {
+        moods: ['indicative', 'subjunctive', 'conditional', 'hortative'],
+        tenses: ['perfect', 'pluperfect', 'futurePerfect'],
+        clitics: 'some',
+      },
+    },
+    point: 'The pronoun and the auxiliary',
+    el: 'the pronoun stands before έχω: το έχω φάει',
+    ro: 'it fuses with the auxiliary (l-am mâncat), except o, which follows the participle (am mâncat-o)',
+    en: 'it follows the participle: "has eaten it"',
+    tag: 'differs',
+    level: 'extra',
+    verified: false,
+  },
 ];
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -12,4 +12,5 @@
   { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
   { id: 'clitic-table:ro-clitics', kind: 'clitic-table', verified: false },
+  { id: 'clitic-table:ro-fusions', kind: 'clitic-table', verified: false },
   { id: 'ending-table:quantifier-forms', kind: 'ending-table', verified: false },
   { id: 'ending-table:adj-stressed', kind: 'ending-table', verified: false },
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1110 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-pronouns.test.ts src/data/divergences.ts src/data/review.ts
git commit -m "feat: comparison notes and a review item for pronouns in every form

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: Every recipient: the remaining Romanian pairs and the "To whom?" control

**Files:**
- Modify: `src/data/clitics.ts`
- Modify: `src/engine/groups.ts`
- Modify: `src/engine/labels.ts`
- Modify: `src/engine/objects.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/types.ts`
- Modify: `src/panels/verb.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/engine/clitics.test.ts`
- Modify (test): `src/engine/pronouns-finite.test.ts`
- Modify (test): `src/engine/ro-pronouns.test.ts`
- Modify (test): `src/panels/pronoun-panel.test.ts`

**Interfaces:**
- Consumes: `RO_CLUSTERS`, `cliticsFor`, `objectKind`, `applyControl`, the verb panel controls, `groupFor` and `pronounSlots` (Tasks 1 to 3).
- Produces: `RO_CLUSTERS` with 24 pairs; `RECIPIENTS`, `indirectOf`, `recipientValue` and `cliticsFor(kind, noun, indirect, to = ME)` in `src/engine/objects.ts`; the control key `recipient` ("To whom?"); `applyControl(state, 'recipient', value, lexemeId)`; `groupFor` returns null for a recipient other than "me"; `pronounSlots` builds the pair for every recipient.

The three third-person datives and the three plurals complete the table (*ne* → *ni-*, *vă* → *vi-*, *le* → *li-* in front of an accusative). The new control appears once a form has an indirect pronoun, after the Object control and before the Object noun. Three existing tests change: the not-stored pair, the count of pronoun slots, and the count of stored pairs.

- [ ] **Step 1: Write the tests**

Change `src/engine/clitics.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -101,5 +101,5 @@
 
   it('refuses a cluster that is not stored, and a list that is not one or two', () => {
-    expect(() => roClitics([c('indirect', 3, 'sg'), c('object', 3, 'sg', 'm', 'm')])).toThrow(/no Romanian cluster/);
+    expect(() => roClitics([c('indirect', 1, 'sg'), c('object', 1, 'sg')])).toThrow(/no Romanian cluster/);
     expect(() => roClitics([])).toThrow(/one or two/);
   });
```

Change `src/engine/pronouns-finite.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -105,9 +105,10 @@
   });
 
-  it('the validator builds the pronoun slots of every mood: two Romanian genders, and the pair for δίνω', () => {
+  it('the validator builds the pronoun slots of every mood: two Romanian genders, and a pair for every recipient of δίνω', () => {
     const present = slot('indicative', 'present', undefined);
     delete present.clitics;
     expect(pronounSlots(troo, present)).toHaveLength(4);
-    expect(pronounSlots(dino, present)).toHaveLength(8);
+    // (1 direct + 7 recipients) × 2 Romanian genders × affirmative and negative
+    expect(pronounSlots(dino, present)).toHaveLength(2 * (1 + 7) * 2);
     expect(pronounSlots(getVerb('pao'), present)).toEqual([]);
     expect(pronounSlots(troo, { ...present, voice: 'mediopassive' })).toEqual([]);
```

Change `src/engine/ro-pronouns.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -121,8 +121,28 @@
   });
 
-  it('stores the pairs for "to me" and "to you" with the four third-person accusatives', () => {
-    expect(Object.keys(RO_CLUSTERS)).toHaveLength(8);
+  it('stores the pairs for every dative with the four third-person accusatives', () => {
+    expect(Object.keys(RO_CLUSTERS)).toHaveLength(6 * 4);
     expect(roClitics([YOU, O]).fused).toBe('ți-');
     expect(roClitics([YOU, O]).after).toBe('-o');
   });
+
+  it('says ni-, vi-, li- for "to us", "to you (pl.)" and "to them" in front of the accusative', () => {
+    const to = (person: Person, number: 'sg' | 'pl'): Clitic => ({ role: 'indirect', person, number, ...(person === 3 ? { gender: 'm' as const } : {}) });
+    expect(give(slot('indicative', 'present', [to(1, 'pl'), L], 3))).toBe('ni-l dă');
+    expect(give(slot('indicative', 'present', [to(2, 'pl'), O], 3))).toBe('vi-o dă');
+    expect(give(slot('indicative', 'present', [to(3, 'pl'), L], 3))).toBe('li-l dă');
+    expect(give(slot('indicative', 'present', [to(3, 'sg'), L], 3))).toBe('i-l dă');
+    expect(give(slot('indicative', 'present', [to(3, 'sg'), L], 3, 'sg', true))).toBe('nu i-l dă');
+  });
+
+  it('fuses the dative with the auxiliary for o, and the accusative for the others', () => {
+    const to = (person: Person, number: 'sg' | 'pl'): Clitic => ({ role: 'indirect', person, number, ...(person === 3 ? { gender: 'm' as const } : {}) });
+    expect(give(slot('indicative', 'perfect', [to(1, 'pl'), O], 3))).toBe('ne-a dat-o');
+    expect(give(slot('indicative', 'perfect', [to(1, 'pl'), L], 3))).toBe('ni l-a dat');
+    expect(give(slot('indicative', 'perfect', [to(2, 'pl'), O], 1))).toBe('v-am dat-o');
+    expect(give(slot('indicative', 'perfect', [to(3, 'pl'), O], 1))).toBe('le-am dat-o');
+    expect(give(slot('indicative', 'perfect', [to(3, 'pl'), L], 1))).toBe('li l-am dat');
+    expect(give(slot('subjunctive', 'aorist', [to(3, 'sg'), O], 1))).toBe('să i-o dau');
+    expect(give(slot('conditional', 'imperfect', [to(1, 'pl'), O], 3))).toBe('ne-ar da-o');
+  });
 });
```

Change `src/panels/pronoun-panel.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -98,2 +98,57 @@
   });
 });
+
+describe('the "To whom?" control (the indirect pronoun of δίνω)', () => {
+  const two = (patch: Partial<SlotOf<'verb'>> = {}) =>
+    applyControl(stateOf(verbSlot('indicative', 'futureSimple', 2, 'sg', patch)), 'object', 'two', 'dino');
+
+  it('appears once there is an indirect pronoun, and starts with "to me"', () => {
+    const none = panelOf('dino', stateOf(verbSlot('indicative', 'futureSimple', 2)));
+    expect(control(none, 'recipient')).toBeUndefined();
+    const p = panelOf('dino', two());
+    expect(control(p, 'recipient')?.value).toBe('1sg');
+    expect(control(p, 'recipient')?.options.map((o) => o.label)).toEqual([
+      'to me', 'to you', 'to him', 'to her', 'to us', 'to you (all)', 'to them',
+    ]);
+    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity', 'object', 'recipient', 'noun']);
+  });
+
+  it('builds the pair for the chosen person in the three languages', () => {
+    const expected: Record<string, { el: string; ro: string; en: string }> = {
+      '2sg': { el: '(εσύ) θα σου το δώσεις', ro: '(tu) ți-o vei da', en: 'you will give it to you' },
+      '3sg-f': { el: '(εσύ) θα της το δώσεις', ro: '(tu) i-o vei da', en: 'you will give it to her' },
+      '1pl': { el: '(εσύ) θα μας το δώσεις', ro: '(tu) ni-o vei da', en: 'you will give it to us' },
+      '2pl': { el: '(εσύ) θα σας το δώσεις', ro: '(tu) vi-o vei da', en: 'you will give it to you' },
+      '3pl': { el: '(εσύ) θα τους το δώσεις', ro: '(tu) li-o vei da', en: 'you will give it to them' },
+    };
+    for (const [value, cells] of Object.entries(expected)) {
+      expect(row(panelOf('dino', applyControl(two(), 'recipient', value, 'dino'))), value).toEqual(cells);
+    }
+  });
+
+  it('keeps the recipient when the tense, the noun or the negation changes, and drops it with the pronoun', () => {
+    const toHer = applyControl(two(), 'recipient', '3sg-f', 'dino');
+    const perfect = applyControl(toHer, 'tense', 'perfect', 'dino');
+    expect(row(panelOf('dino', perfect)).en).toBe('you have given it to her');
+    const other = applyControl(toHer, 'noun', 'kafes', 'dino');
+    expect(control(panelOf('dino', other), 'recipient')?.value).toBe('3sg-f');
+    const single = applyControl(toHer, 'object', 'pronoun', 'dino');
+    expect(control(panelOf('dino', single), 'recipient')).toBeUndefined();
+  });
+
+  it('also chooses the person of "give me the bread", and the Same-meaning strip is only about "me"', () => {
+    const command = applyControl(stateOf(verbSlot('imperative', 'aorist', 2)), 'object', 'noun', 'dino');
+    expect(control(panelOf('dino', command), 'recipient')?.value).toBe('1sg');
+    expect(panelOf('dino', command).sameMeaning).toBeDefined();
+    const toUs = applyControl(command, 'recipient', '1pl', 'dino');
+    expect(row(panelOf('dino', toUs)).el).toContain('δώσε μας');
+    expect(panelOf('dino', toUs).sameMeaning).toBeUndefined();
+  });
+
+  it('ignores a recipient it does not know, and does nothing without an indirect pronoun', () => {
+    const start = two();
+    expect(applyControl(start, 'recipient', 'nobody', 'dino')).toBe(start);
+    const bare = stateOf(verbSlot('indicative', 'present'));
+    expect(applyControl(bare, 'recipient', '2sg', 'dino')).toBe(bare);
+  });
+});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/clitics.ts` (unified diff):

```diff
@@ -91,5 +91,6 @@
 /**
  * Two pronouns, dative then accusative, keyed '<dative key>+<accusative key>': dă-mi-o, nu mi-o, mi-o vei da.
- * Stored for the datives "to me" and "to you" with the four third-person accusatives.
+ * Stored for every dative (me, you, him / her, us, you pl., them) with the four third-person accusatives: *ne* becomes
+ * *ni-*, *vă* becomes *vi-* and *le* becomes *li-* in front of the accusative (ni-l, vi-l, li-l).
  */
 export const RO_CLUSTERS: Record<string, RoClitic> = {
@@ -102,3 +103,19 @@
   'ind.2sg+obj.3pl.m': ro('ți-i', '-ți-i', 'nu ți-i', 'să ți-i', 'ți i-'),
   'ind.2sg+obj.3pl.f': ro('ți-le', '-ți-le', 'nu ți-le', 'să ți-le', 'ți le-'),
+  'ind.3sg+obj.3sg.m': ro('i-l', '-i-l', 'nu i-l', 'să i-l', 'i l-'),
+  'ind.3sg+obj.3sg.f': ro('i-o', '-i-o', 'nu i-o', 'să i-o', 'i-', '-o'),
+  'ind.3sg+obj.3pl.m': ro('i-i', '-i-i', 'nu i-i', 'să i-i', 'i i-'),
+  'ind.3sg+obj.3pl.f': ro('i-le', '-i-le', 'nu i-le', 'să i-le', 'i le-'),
+  'ind.1pl+obj.3sg.m': ro('ni-l', '-ni-l', 'nu ni-l', 'să ni-l', 'ni l-'),
+  'ind.1pl+obj.3sg.f': ro('ni-o', '-ni-o', 'nu ni-o', 'să ni-o', 'ne-', '-o'),
+  'ind.1pl+obj.3pl.m': ro('ni-i', '-ni-i', 'nu ni-i', 'să ni-i', 'ni i-'),
+  'ind.1pl+obj.3pl.f': ro('ni-le', '-ni-le', 'nu ni-le', 'să ni-le', 'ni le-'),
+  'ind.2pl+obj.3sg.m': ro('vi-l', '-vi-l', 'nu vi-l', 'să vi-l', 'vi l-'),
+  'ind.2pl+obj.3sg.f': ro('vi-o', '-vi-o', 'nu vi-o', 'să vi-o', 'v-', '-o'),
+  'ind.2pl+obj.3pl.m': ro('vi-i', '-vi-i', 'nu vi-i', 'să vi-i', 'vi i-'),
+  'ind.2pl+obj.3pl.f': ro('vi-le', '-vi-le', 'nu vi-le', 'să vi-le', 'vi le-'),
+  'ind.3pl+obj.3sg.m': ro('li-l', '-li-l', 'nu li-l', 'să li-l', 'li l-'),
+  'ind.3pl+obj.3sg.f': ro('li-o', '-li-o', 'nu li-o', 'să li-o', 'le-', '-o'),
+  'ind.3pl+obj.3pl.m': ro('li-i', '-li-i', 'nu li-i', 'să li-i', 'li i-'),
+  'ind.3pl+obj.3pl.f': ro('li-le', '-li-le', 'nu li-le', 'să li-le', 'li le-'),
 };
```

Change `src/engine/groups.ts` (unified diff):

```diff
@@ -5,4 +5,5 @@
 import { compose, composedRich } from './compose';
 import { enVerbText } from './english';
+import { indirectOf } from './objects';
 import { roVerb } from './romanian';
 import type { Rich } from './segments';
@@ -64,4 +65,7 @@
 export function groupFor(lexemeId: string, slot: SlotOf<'verb'>, noun: string | null): GroupMatch | null {
   if (slot.mood !== 'imperative') return null;
+  // The groups are about "me" (Give me the bread!): another recipient is not in one.
+  const to = indirectOf(slot);
+  if (to && !(to.person === 1 && to.number === 'sg')) return null;
   for (const group of FORM_GROUPS) {
     const family = group.members.some((m) => m.verb.lexeme === lexemeId && familyKey(m.verb.slot) === familyKey(slot));
```

Change `src/engine/labels.ts` (unified diff):

```diff
@@ -147,5 +147,5 @@
   { value: 'pronoun', label: level === 'beginner' ? 'a small word (it, him)' : 'a pronoun' },
   ...(indirect
-    ? [{ value: 'two', label: level === 'beginner' ? 'two small words (me + it)' : 'two pronouns (indirect + direct)' }]
+    ? [{ value: 'two', label: level === 'beginner' ? 'two small words (to someone + it)' : 'two pronouns (indirect + direct)' }]
     : []),
 ];
```

Change `src/engine/objects.ts` (unified diff):

```diff
@@ -9,4 +9,33 @@
 const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
 
+/** The people an indirect pronoun can stand for in the Object control. A third person needs a gender; "to them" takes none in Greek (τους). */
+export interface Recipient {
+  value: string;
+  label: string;
+  clitic: Clitic;
+}
+
+export const RECIPIENTS: Recipient[] = [
+  { value: '1sg', label: 'to me', clitic: ME },
+  { value: '2sg', label: 'to you', clitic: { role: 'indirect', person: 2, number: 'sg' } },
+  { value: '3sg-m', label: 'to him', clitic: { role: 'indirect', person: 3, number: 'sg', gender: 'm' } },
+  { value: '3sg-f', label: 'to her', clitic: { role: 'indirect', person: 3, number: 'sg', gender: 'f' } },
+  { value: '1pl', label: 'to us', clitic: { role: 'indirect', person: 1, number: 'pl' } },
+  { value: '2pl', label: 'to you (all)', clitic: { role: 'indirect', person: 2, number: 'pl' } },
+  { value: '3pl', label: 'to them', clitic: { role: 'indirect', person: 3, number: 'pl', gender: 'm' } },
+];
+
+/** The indirect pronoun a verb form has, or undefined. */
+export const indirectOf = (slot: SlotOf<'verb'>): Clitic | undefined => (slot.clitics ?? []).find((c) => c.role === 'indirect');
+
+/** Which recipient an indirect pronoun is; "to me" when it is none of them. */
+export function recipientValue(c: Clitic | undefined): string {
+  if (!c) return RECIPIENTS[0].value;
+  const match = RECIPIENTS.find(
+    (r) => r.clitic.person === c.person && r.clitic.number === c.number && (c.person !== 3 || c.number === 'pl' || r.clitic.gender === c.gender),
+  );
+  return (match ?? RECIPIENTS[0]).value;
+}
+
 /** The direct pronoun that stands for a noun: the Greek gender from the Greek noun, the Romanian gender from the Romanian one, the English word from the noun ("it" unless it says otherwise). */
 export const pronounFor = (noun: GreekNoun): Clitic => ({
@@ -38,15 +67,18 @@
 }
 
-/** The pronouns for an object kind; a verb with an indirect object (δίνω) gets "me" with a noun and in the pair. */
-export function cliticsFor(kind: ObjectKind, noun: GreekNoun, indirect: boolean): Clitic[] {
+/**
+ * The pronouns for an object kind; a verb with an indirect object (δίνω) gets the indirect pronoun (`to`, "me" unless
+ * the learner chose another) with a noun and in the pair.
+ */
+export function cliticsFor(kind: ObjectKind, noun: GreekNoun, indirect: boolean, to: Clitic = ME): Clitic[] {
   switch (kind) {
     case 'none':
       return [];
     case 'noun':
-      return indirect ? [ME] : [];
+      return indirect ? [to] : [];
     case 'pronoun':
       return [pronounFor(noun)];
     case 'two':
-      return [ME, pronounFor(noun)];
+      return [to, pronounFor(noun)];
   }
 }
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -1,5 +1,5 @@
 import { getLexeme, getNoun, getVerb } from '../data/lexemes';
 import { groupFor } from '../engine/groups';
-import { DEFAULT_OBJECT, cliticsFor, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';
+import { DEFAULT_OBJECT, RECIPIENTS, cliticsFor, indirectOf, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';
 import { voiceOf } from '../engine/offers';
 import type {
@@ -192,5 +192,5 @@
         const next = { ...slot };
         delete next.shortForm;
-        const clitics = cliticsFor(kind, noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true);
+        const clitics = cliticsFor(kind, noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true, indirectOf(slot));
         if (clitics.length > 0) next.clitics = clitics;
         else delete next.clitics;
@@ -198,4 +198,11 @@
       }
       break;
+    case 'recipient':
+      if (slot.pos === 'verb' && indirectOf(slot)) {
+        const to = RECIPIENTS.find((r) => r.value === value);
+        if (!to) break;
+        return { ...state, slot: { ...slot, clitics: (slot.clitics ?? []).map((c) => (c.role === 'indirect' ? { ...to.clitic } : c)) } };
+      }
+      break;
     case 'noun': {
       const noun = getLexeme(value);
@@ -208,5 +215,5 @@
         const next = { ...slot };
         delete next.shortForm;
-        const clitics = cliticsFor(objectKind(slot, state.noun), noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true);
+        const clitics = cliticsFor(objectKind(slot, state.noun), noun, voiceOf(getVerb(lexemeId), slot.voice).indirect === true, indirectOf(slot));
         if (clitics.length > 0) next.clitics = clitics;
         else delete next.clitics;
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -4,5 +4,5 @@
 
 export interface Control {
-  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object';
+  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient';
   label: string;
   options: Option[];
```

Change `src/panels/verb.ts` (unified diff):

```diff
@@ -25,5 +25,5 @@
   voiceOf,
 } from '../engine/offers';
-import { objectKind, type ObjectKind } from '../engine/objects';
+import { RECIPIENTS, indirectOf, objectKind, recipientValue, type ObjectKind } from '../engine/objects';
 import { readingFor } from '../engine/reading';
 import { roVerb } from '../engine/romanian';
@@ -217,4 +217,13 @@
       value: kind,
     });
+    // Who the indirect pronoun stands for (δίνω: to me, to you, to him …), once the form has one.
+    if (indirectOf(slot)) {
+      list.push({
+        key: 'recipient',
+        label: 'To whom?',
+        options: RECIPIENTS.map(({ value, label }) => ({ value, label })),
+        value: recipientValue(indirectOf(slot)),
+      });
+    }
     if (kind !== 'none') list.push(nounControl('Object noun', state));
   }
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -3,4 +3,5 @@
 import { allVerbSlots, isOffered, shortFormOf, slotProblem } from '../engine/offers';
 import { enClitic, roClitic } from '../engine/clitics';
+import { RECIPIENTS } from '../engine/objects';
 import { compose, lexicalPiece } from '../engine/compose';
 import { memberKind, memberText } from '../engine/groups';
@@ -76,9 +77,9 @@
 /** The same pronoun for a noun that is masculine in Romanian (παιδί: îl), so both Romanian forms are built. */
 const IT_M: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'it' };
-const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
 
 /**
  * The forms with pronouns the panel can build from an offered slot: one direct pronoun (in both Romanian genders)
- * and, for a verb with an indirect object, the pair "me + it"; for a command also "me" alone, beside a spelled-out noun.
+ * and, for a verb with an indirect object, the pair "to someone + it" for every recipient; for a command also the
+ * recipient alone, beside a spelled-out noun.
  * Each comes affirmative and negative, and a command also with its short form.
  */
@@ -90,5 +91,7 @@
     [IT],
     [IT_M],
-    ...(data.indirect === true ? [[ME, IT], [ME, IT_M], ...(command ? [[ME]] : [])] : []),
+    ...(data.indirect === true
+      ? RECIPIENTS.flatMap(({ clitic }) => [[clitic, IT], [clitic, IT_M], ...(command ? [[clitic]] : [])])
+      : []),
   ];
   return sets.flatMap((clitics): SlotOf<'verb'>[] => [
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1117 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/clitics.ts src/engine/clitics.test.ts src/engine/groups.ts src/engine/labels.ts src/engine/objects.ts src/engine/pronouns-finite.test.ts src/engine/ro-pronouns.test.ts src/panels/panels.ts src/panels/pronoun-panel.test.ts src/panels/types.ts src/panels/verb.ts src/validate/validate.ts
git commit -m "feat: every recipient for the indirect pronoun (the remaining Romanian pairs and a To whom? control)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 7.
- Produces: a spec that records what Plan 8 decided (new section 22), the validator rule and the Romanian table as built (sections 4.3, 7 and 10).

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)


sub(
    "or its slot asks for clitics outside an imperative, or for negation or a short form that the mood or the lexeme does not allow;",
    "or its slot asks for pronouns with a reflexive (mediopassive) voice or a verb that takes no object (`intransitive`: πάω, πηδάω, είμαι, μπορεί), or for a short form outside a command, or for negation or a short form that the mood or the lexeme does not allow;",
)
sub(
    "every fusion is stored in the Romanian clitic table, for every person, not derived.",
    "every fusion is stored in the Romanian clitic table, for every pronoun, not derived: each of the fourteen pronouns and each of the twenty-four pairs (every dative with the four third-person accusatives) has six positions (free, attached to a command, after *nu*, after *să*, fused with a vowel-initial auxiliary, behind the participle or the infinitive), and one function builds the form for each tense from them.",
)
sub(
    "(several hundred strings), each one a chance of a wrong form. Mitigated by storing them as one reviewed table keyed by pronoun and position, by unit tests on every auxiliary, and by the review sheet.",
    "(fourteen pronouns and twenty-four pairs with six positions each, about 230 strings), each one a chance of a wrong form. Mitigated by storing them as one reviewed table keyed by pronoun and position, by unit tests on every pronoun and every auxiliary, and by the review sheet.",
)
s = s.rstrip() + """

## 22. Decisions made in Plan 8

| Source | Decision | Where |
|---|---|---|
| Delivery | Plan 8 delivers pronouns in every indicative, subjunctive, conditional and hortative form, the verb λέω, the Romanian fusion table and phrases 54 to 56, so the picker lists all 56 phrases | 6.1, 11 |
| Which verbs take pronouns | Any active verb except one flagged `intransitive` (πάω, πηδάω, είμαι, μπορεί); a reflexive voice takes none. The Object control appears for those verbs in every mood; "a noun (spelled out)" stays for commands only | 4.3, 5.3 |
| Greek placement | [δεν] [θα / να / ας] [μην] [pronouns] [έχω] [verb]; no second accent outside commands; a short form is for commands only | 4.3 |
| English | The pronouns follow the verb or the participle ("has eaten it", "will give it to me"); the pair keeps "it to me" | 4.3 |
| Romanian table | `RoClitic` gains `afterSa`, `fused` and `after`; the pairs are stored for every dative with the four third-person accusatives (24 pairs; *ne*, *vă* and *le* become *ni-*, *vi-* and *li-* in front of the accusative) | 4.3, 6.5 |
| Object control | A "To whom?" control chooses the indirect pronoun (to me, to you, to him, to her, to us, to you pl., to them) once the form has one; the Same-meaning strip is about "me" only | 4.6, 5.3 |
| Readings | A form with pronouns has a Greek reading line only; the Romanian and English lines are not produced | 5.5 |
| λέω | Offers the present, the imperfect and the present subjunctive (so no hortative); Romanian *a zice*, English "say / call"; phrase 54 uses the 3pl *λένε* | 6.6 |
| Comparison notes | `pronoun-position-finite` (all moods but the imperative) and `pronoun-before-auxiliary` (the perfect tenses, Improver) | 5.2 |
| Review | The new item `clitic-table:ro-fusions`; the review sheet prints every position of every pronoun and pair | 9 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "intransitive" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "## 22. Decisions made in Plan 8" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "about 230 strings" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: three numbers, each at least `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records (no pending cell).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 8 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.3, 20: weak pronouns with every indicative, subjunctive, conditional and hortative form; placement `[δεν] [θα / να / ας] [μην] [pronouns] [έχω] [verb]`, no stress rule | 2 |
| 4.3: English puts the pronoun after the verb or the participle | 2 |
| 4.3, 6.5, 10: Romanian fusions (*l-am mâncat*, *aș mânca-o*, *să-l mănânc*, *nu l-am mâncat*, the pairs) stored in one table for every pronoun, built by one function per tense | 1, 7 |
| 5.3: the Object control in every mood; a spelled-out noun for commands only | 3 |
| 4.3, 6.5: the Romanian pairs for every dative, and a way to choose the recipient in the Object control | 7 |
| 6.6: λέω (present, imperfect, present subjunctive), *a zice*, "say / call" | 4 |
| 6.1: phrases 54 to 56 | 5 |
| 5.2: pronoun-position-finite, pronoun-before-auxiliary | 6 |
| 7, 9, 10, 22: the validator rule, the review item and sheet, the risk text, the decisions | 2, 6, 8 |
