# Quantifiers, the Copula, Participles and αν Implementation Plan (Plan 5 of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The quantifier words (μερικοί, κάποιος, κανένας, πολύς, λίγος and the comparatives) with a panel in all three languages; the `pending` marker for Romanian forms that are not yet confirmed; the copula είμαι; the conjunction αν; the passive participle as a derived adjective with a link back to its verb; the noun νερό. Nine more phrases: 7, 8, 9, 10, 20, 21, 30, 32 and 33.

**Architecture:** Quantifiers are a new lexeme kind with their own slot (`pos: 'quantifier'`). Greek forms come from a shared table or from the stem-stressed adjective endings on a stem; Romanian and English cells are stored per use (beside a noun, on its own), Romanian gender and number, and a Romanian cell may be `pending`. The quantifier panel builds on the adjective and numeral panels. The copula is an ordinary verb lexeme whose six present forms are overrides. The participle is an adjective lexeme with `derivedFrom`, and a panel can carry a `related` link that `Explorer` opens in place of the panel (as it already does for pieces of a verb group).

**Tech Stack:** Vite, React, TypeScript (strict), Vitest, Testing Library, tsx (all as in Plans 1 to 4).

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (4.2, 4.3, 5.2, 5.3, 5.5, 6.1, 6.3, 6.5, 6.6, 7, 8 and sections 15 to 17).

## Global Constraints

- The spec is the authority; the plan argues from it. Departures are listed under "Departures from the spec".
- TypeScript strict. No `any`. No `sed -i` (macOS): use the Edit tool or a short Python script.
- Before every commit run `npx vitest run && npm run typecheck` (and `npm run validate` whenever the task touches data or the validator) and commit only when green. Stage files by explicit path (never `git add -A`; the untracked `.claude/` folder must not be committed). Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Every new lexeme starts with `verified: { el: false, ro: false, en: false }`; every new phrase, divergence note and reading template starts with `verified: false`; every new table or glossary gets a `ReviewItem` with `verified: false`. All Greek, Romanian and English text in this plan was written from memory and is unverified (spec section 9).
- A stored Romanian cell is either text or `{ pending: true }` (spec 4.2). The UI shows a pending cell as "not yet added"; the validator accepts and lists it; `npm run validate -- --release` fails while any remains (spec 7).
- Whitespace-only rich-text segments are plain segments (`RichText` renders them as text nodes). Colour is never the only signal: pressed buttons carry `aria-pressed`, the current cell carries `aria-current`, dimmed rows and badges carry text.
- The phrase and its glosses are fixed and authored; the panel works on a copy.
- Greek forms are monotonic. The present imperative of τρώω is τρώγε / τρώγετε (spec section 17).

## Scope of this plan

In:

- The `pending` marker (`Stored`), its validator report and the release check.
- The quantifier lexemes μερικοί (with the sense *some* / *a few*), κάποιος, κανένας, πολύς and λίγος (with the comparatives περισσότερος and λιγότερος as a degree), the quantifier slot and panel (controls: noun, role, kind of noun, degree, sense; rows: with a noun, on its own, with negation; the Improver table), and the quantifier notes of spec 5.2.
- The noun νερό (neuter in -ό) and the copula είμαι (present only).
- The conjunction αν / *dacă* / if, its panel and the *if-clause* note.
- The passive participle: a `participle` stem on πλένω and the new verb ψήνω, the derived adjectives πλυμένος and ψημένος, the Greek reading line (spec 5.5, "Πλυμένο"), the participle notes.
- A `related` link on a panel: the participle opens its verb, κανένας opens the numeral ένας, each with a way back.
- Phrases 7, 8, 9, 10, 20, 21, 30, 32 and 33; `PHRASES` ends with 34 entries in the spec order.

Out (later plans):

- Clitics, shortened forms, form groups, the Same-meaning strip; phrases 34 to 38; the clitic pronoun panel (Plan 6).
- The content review of all unverified records, and filling or removing the pending Romanian genitives (Plan 6).
- Readings for words that are not verbs or participles, and hover or focus highlighting of a reading part.
- A Romanian neuter noun (the quantifier code already maps neuter to masculine in the singular and feminine in the plural, spec 10, but no lexeme uses it).

## Departures from the spec

1. **Quantifier `use` is not a control.** Spec 4.2 says the panel offers sense and use as controls; spec 5.3 says the rows "with a noun" and "on its own" are always shown. The panel follows 5.3. `use` stays on the slot, so a token says which reading the phrase has; `sense` is a control (spec 4.2).
2. **`offers` of a quantifier is `numbers`** (the numbers the panel may offer, spec 4.2). The degrees and senses it offers are the ones its data has: a comparative is offered when the lexeme has a `greek.comparative`, the second sense when it has `ro.few`.
3. **`Stored` is used on Romanian quantifier cells only.** No other lexeme has a pending cell yet; the type is general (spec 4.2) and a later plan may use it elsewhere.
4. **The stand-alone genitive of a pronoun is not stored** (spec 6.3: not covered, and dropped from the pending line in spec 16). The "on its own" row is dimmed with a reason in the genitive.
5. **Mass nouns.** A noun may be `mass: true` (ψωμί, νερό). In the quantifier panel the English cell of a plural count reading of a mass noun says "uncountable: no plural in English" instead of an ungrammatical "many bread". This is the count-vs-mass note made concrete (spec 5.2).
6. **The copula's six forms are per-cell overrides** carrying an irregularity rule `irregular-be` (with one authored reading template); the class `copula` has no ending table. The spec says only that the copula "offers only the present indicative".
7. **The derived participle** stores `derivedFrom: { verb, stem }` on the adjective and a `participle` stem on the verb; a validator check ties them together (the adjective stem is the participle stem + μέν). The reading line exists for the Greek column only.
8. **`related`** is a panel field the spec does not name: the "Derived from" line of a participle (spec 5.3) and the "shares its pattern with ένας" link of κανένας (spec 5.3) both open another panel and come back.

## File structure

New:

- `src/engine/stored.ts`: `Stored` helpers (`isPending`, `storedText`, `NOT_YET_ADDED`).
- `src/engine/quantifier.ts`: the slots, degrees and senses a quantifier offers.
- `src/panels/quantifier.ts`, `src/panels/conjunction.ts`.
- Tests: `src/engine/copula.test.ts`, `src/engine/quantifier.test.ts`, `src/engine/quantifier-ro-en.test.ts`, `src/panels/quantifier.test.ts`, `src/data/phrases-quantifiers.test.ts`, `src/panels/conjunction.test.ts`, `src/engine/participle.test.ts`, `src/data/phrases-participles.test.ts`, and additions to existing test files.

Modified: `src/types.ts`, `src/data/lexemes.ts`, `paradigms.ts`, `phrases.ts`, `divergences.ts`, `readings.ts`, `review.ts`, `src/engine/greek.ts`, `english.ts`, `romanian.ts`, `reading.ts`, `src/validate/validate.ts`, `scripts/validate.ts`, `src/panels/panels.ts`, `types.ts`, `adjective.ts`, `verb.ts`, `src/engine/labels.ts`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`, and the tests named in each task.

---

### Task 1: The noun νερό and the copula είμαι

**Files:**

- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/readings.ts`, `src/data/divergences.ts`, `src/data/review.ts`, `src/engine/english.ts`, `src/engine/reading.ts`, `src/panels/verb.ts`
- Test: `src/engine/copula.test.ts`, `src/data/readings.test.ts`

**Interfaces:**

- Consumes: Plans 3 and 4's `inflectVerb`, `compose`, `roVerb`, `enVerb`, `readingFor`, `allVerbSlots`, `buildPanel`.
- Produces:
  - `NounClass` gains `'neut-o'`; `GreekNoun` gains `mass?: true` (set on ψωμί and νερό); the lexeme `nero` (νερό, Romanian *apă*, English water).
  - `VerbClass` gains `'copula'`; `EnVerbForms` gains `present?` and `presentNot?` (six cells each); the lexeme `eimai` (είμαι, active voice, indicative present only; Romanian *a fi*; English *be*). Its six forms are overrides with the rule `irregular-be`; `READING_TEMPLATES` gains a template for that rule.
  - `readingFor` labels a stem with no ending without a hyphen (`είμαι`, not `είμαι-`).

- [ ] **Step 1: Write the failing tests**

Create `src/engine/copula.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getNoun, getVerb } from '../data/lexemes';
import { buildPanel } from '../panels/panels';
import type { Num, Person, SlotOf } from '../types';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflectNoun } from './greek';
import { EN_PRONOUNS } from './labels';
import { allVerbSlots } from './offers';
import { readingFor } from './reading';
import { roVerb } from './romanian';
import { formText } from './segments';

const present = (person: Person, number: Num, negative = false): SlotOf<'verb'> => ({
  pos: 'verb',
  person,
  number,
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
  ...(negative ? { polarity: 'negative' as const } : {}),
});

describe('νερό', () => {
  it.each([
    ['sg', 'nom', 'νερό'],
    ['sg', 'acc', 'νερό'],
    ['sg', 'gen', 'νερού'],
    ['pl', 'nom', 'νερά'],
    ['pl', 'acc', 'νερά'],
    ['pl', 'gen', 'νερών'],
  ] as const)('%s %s -> %s', (number, c, expected) => {
    expect(formText(inflectNoun(getNoun('nero'), { pos: 'noun', number, case: c }))).toBe(expected);
  });

  it('is neuter in Greek and feminine in Romanian, and a mass noun like ψωμί', () => {
    const nero = getNoun('nero');
    expect(nero.gender).toBe('n');
    expect(nero.ro.gender).toBe('f');
    expect(nero.ro.forms.sg.indefinite).toBe('o apă');
    expect(nero.en).toEqual({ sg: 'water', pl: 'water' });
    expect(nero.mass).toBe(true);
    expect(getNoun('psomi').mass).toBe(true);
    expect(getNoun('kafes').mass).toBeUndefined();
  });
});

describe('είμαι', () => {
  const who: [Person, Num, string, string, string][] = [
    [1, 'sg', 'είμαι', 'sunt', 'I am'],
    [2, 'sg', 'είσαι', 'ești', 'you are'],
    [3, 'sg', 'είναι', 'este', 'he/she is'],
    [1, 'pl', 'είμαστε', 'suntem', 'we are'],
    [2, 'pl', 'είστε', 'sunteți', 'you are'],
    [3, 'pl', 'είναι', 'sunt', 'they are'],
  ];

  it.each(who)('person %s %s: %s / %s / %s', (person, number, el, ro, en) => {
    const verb = getVerb('eimai');
    const slot = present(person, number);
    expect(compose(verb, slot).text).toBe(el);
    expect(roVerb(verb, slot)).toBe(ro);
    expect(enVerbText(verb, slot, EN_PRONOUNS[(person - 1) + (number === 'pl' ? 3 : 0)])).toBe(en);
  });

  it('negates with δεν, nu and the English contractions', () => {
    const verb = getVerb('eimai');
    expect(compose(verb, present(1, 'sg', true)).text).toBe('δεν είμαι');
    expect(roVerb(verb, present(1, 'sg', true))).toBe('nu sunt');
    expect(enVerbText(verb, present(1, 'sg', true), 'I')).toBe('I am not');
    expect(enVerbText(verb, present(2, 'sg', true), 'you')).toBe("you aren't");
    expect(enVerbText(verb, present(3, 'sg', true), 'he/she')).toBe("he/she isn't");
  });

  it('offers only the present indicative, six persons', () => {
    expect(allVerbSlots(getVerb('eimai'))).toHaveLength(6);
  });

  it('is irregular, and its reading is one word with no hyphen and no ending', () => {
    const el = readingFor(getVerb('eimai'), present(3, 'sg')).el;
    expect(el.parts).toEqual([{ text: 'είναι', label: 'είναι', role: 'stem', gloss: 'be', piece: 0 }]);
    expect(el.beginner).toContain('irregular');
    expect(el.beginner).toContain('είμαι, είσαι, είναι, είμαστε, είστε, είναι');
  });

  it('has a verb panel with the irregularity message', () => {
    const slot = present(1, 'sg');
    const panel = buildPanel({ slot, noun: null, nounNumber: 'sg' }, { text: 'είμαι', lexeme: 'eimai', slot }, 'beginner');
    expect(panel.lemma).toBe('είμαι');
    expect(panel.posLabel).toBe('verb: to be');
    expect(panel.irregular).toContain('learn its six forms together');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/copula.test.ts`
Expected: FAIL (`unknown lexeme: nero`).

- [ ] **Step 3: Extend the types**

In `src/types.ts`:

- Change `export type NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i';` to `export type NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i' | 'neut-o';`.
- In `GreekNoun`, after `class: NounClass;` add:

```ts
  /** A mass noun (ψωμί, νερό): in English it has no plural, so "many bread" is not said. */
  mass?: true;
```

- Change `export type VerbClass = 'omega' | 'contracted-ao' | 'athematic' | 'mediopassive' | 'deponent' | 'impersonal';` to add `| 'copula'` at the end of the union.
- In `EnVerbForms`, after `modal?: boolean;` add:

```ts
  /** The six present cells of an irregular verb (am, are, is, are, are, are); `presentNot` the negative ones. */
  present?: readonly string[];
  presentNot?: readonly string[];
```

- [ ] **Step 4: The paradigms**

In `src/data/paradigms.ts`, inside `NOUN_CLASSES`, after the `'neut-i'` block add:

```ts
  /** Neuter nouns in -ό: νερό, νερού, νερά (the stress stays on the ending). */
  'neut-o': {
    sg: { nom: 'ό', acc: 'ό', gen: 'ού' },
    pl: { nom: 'ά', acc: 'ά', gen: 'ών' },
  },
```

Then give every verb table an entry for the new class. Run this Python script from the repository root:

```python
import pathlib
p = pathlib.Path('src/data/paradigms.ts')
s = p.read_text()
s = s.replace("  impersonal: [null, null, 'εί', null, null, null],\n",
              "  impersonal: [null, null, 'εί', null, null, null],\n  /** είμαι: the lexeme stores all six cells as overrides. */\n  copula: NONE,\n")
s = s.replace("  impersonal: NONE,\n", "  impersonal: NONE,\n  copula: NONE,\n")
s = s.replace("  impersonal: { present: null, aorist: null },\n",
              "  impersonal: { present: null, aorist: null },\n  copula: { present: null, aorist: null },\n")
s = s.replace("  impersonal: null,\n};", "  impersonal: null,\n  copula: null,\n};")
p.write_text(s)
```

Check with `git diff src/data/paradigms.ts` that `copula` appears once in each of `VERB_PRESENT`, `VERB_IMPERFECT`, `VERB_AORIST`, `VERB_SUBJ_AORIST`, `VERB_IMPERATIVE` and `VERB_BASE`.

- [ ] **Step 5: The lexemes**

In `src/data/lexemes.ts`:

a) In `psomi`, add `mass: true,` after its `class: 'neut-i',` line (use the Edit tool with this context so the change does not land in `paidi`):

```ts
  lemma: 'ψωμί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  mass: true,
```

b) After the `psomi` constant add:

```ts
const nero: GreekNoun = {
  id: 'nero',
  pos: 'noun',
  lemma: 'νερό',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-o',
  mass: true,
  stems: { sg: 'νερ', pl: 'νερ' },
  ro: {
    lemma: 'apă',
    gender: 'f',
    forms: {
      sg: { definite: 'apa', indefinite: 'o apă', genDefinite: 'apei', genIndefinite: 'unei ape' },
      pl: { definite: 'apele', indefinite: 'ape', genDefinite: 'apelor', genIndefinite: 'unor ape' },
    },
    split: { sg: ['ap', 'a'], pl: ['ape', 'le'] },
  },
  en: { sg: 'water', pl: 'water' },
  note: 'Neuter in Greek, feminine in Romanian (apă); "water" has no gender and no plural in English.',
};
```

c) After the `echo` constant add the copula:

```ts
const IRREGULAR_BE = note(
  'irregular-be',
  'είμαι ("to be") does not follow the usual pattern: learn its six forms together.',
);
const beCell = (word: string): CellOverride => ({ stem: word, ending: '', note: IRREGULAR_BE });
const NO_CELLS: readonly string[] = ['', '', '', '', '', ''];

/** είμαι, the copula. It offers only the present indicative (spec 4.2); the six forms are overrides. */
const eimai: GreekVerb = {
  id: 'eimai',
  pos: 'verb',
  lemma: 'είμαι',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'είμαι',
      class: 'copula',
      stems: { present: 'είμαι' },
      overrides: {
        'present.1sg': beCell('είμαι'),
        'present.2sg': beCell('είσαι'),
        'present.3sg': beCell('είναι'),
        'present.1pl': beCell('είμαστε'),
        'present.2pl': beCell('είστε'),
        'present.3pl': beCell('είναι'),
      },
      offers: { indicative: ['present'] },
      ro: {
        lemma: 'a fi',
        infinitive: 'fi',
        participle: 'fost',
        present: ['sunt', 'ești', 'este', 'suntem', 'sunteți', 'sunt'],
        subjunctive: NO_CELLS,
        imperfect: NO_CELLS,
        pluperfect: NO_CELLS,
      },
      en: {
        gloss: 'be',
        base: 'be',
        third: 'is',
        past: 'was',
        pastParticiple: 'been',
        ing: 'being',
        present: ['am', 'are', 'is', 'are', 'are', 'are'],
        presentNot: ['am not', "aren't", "isn't", "aren't", "aren't", "aren't"],
      },
    },
  },
};
```

Add `CellOverride` to the type import at the top of the file. Register both in `LEXEMES` (`[nero.id]: nero,` after `psomi`, `[eimai.id]: eimai,` after `echo`).

- [ ] **Step 6: The English present of "be"**

In `src/engine/english.ts` replace the line

```ts
      return parts(negative ? presentNot : present);
```

(inside `case 'indicative.present':`) with:

```ts
      return parts(negative ? (en.presentNot?.[i] ?? presentNot) : (en.present?.[i] ?? present));
```

- [ ] **Step 7: The reading**

In `src/engine/reading.ts`, in the stem part of `readingFor`, replace

```ts
      parts.push({ text: stem, label: `${stem}-`, role: 'stem', gloss: data.en.gloss, piece: index });
```

with:

```ts
      // A stem with no ending is a whole word (είμαι): no hyphen.
      parts.push({ text: stem, label: ending ? `${stem}-` : stem, role: 'stem', gloss: data.en.gloss, piece: index });
```

In `src/data/readings.ts` add this template at the end of `READING_TEMPLATES`:

```ts
  {
    rule: 'irregular-be',
    beginner:
      '{text}: the verb "to be" is irregular, so there are no parts to take apart. Learn the six forms together: είμαι, είσαι, είναι, είμαστε, είστε, είναι.',
    improver:
      '{text}: the present of είμαι is irregular and has no separate stem and ending (είμαι, είσαι, είναι, είμαστε, είστε, είναι). Romanian *a fi* and English "be" are irregular in the same way.',
    verified: false,
  },
```

and add to `EN_FUNCTION`:

```ts
  am: 'am (a form of "be")',
  are: 'are (a form of "be")',
  is: 'is (a form of "be")',
```

In `src/data/readings.test.ts` the test that lists the rules (`has one template per irregularity rule, …`) now sees a fourth rule. Change its expectation to:

```ts
    expect(READING_TEMPLATES.map((t) => t.rule).sort()).toEqual(['irregular-be', 'monosyllable', 'old-stem', 'stress-shift']);
```

- [ ] **Step 8: The verb panel label, the note and the review item**

In `src/panels/verb.ts` add to `CLASS_LABEL`: `copula: 'irregular copula',`.

In `src/data/divergences.ts` append, before the closing `];`:

```ts
  {
    id: 'copula-irregular',
    appliesTo: { pos: 'verb', lexeme: 'eimai' },
    point: 'The verb "to be"',
    el: 'είμαι, είσαι, είναι … (irregular)',
    ro: 'sunt, ești, este … (irregular)',
    en: 'am, are, is … (irregular)',
    tag: 'same',
    level: 'core',
    verified: false,
  },
```

In `src/data/review.ts` add after the `ending-table:neut-i` line:

```ts
  { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
```

- [ ] **Step 9: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (174):` (165 + 3 + 3 for the two lexemes, 1 divergence note, 1 review item, 1 reading template).

- [ ] **Step 10: Commit**

```bash
git add src/types.ts src/data/paradigms.ts src/data/lexemes.ts src/data/readings.ts src/data/divergences.ts src/data/review.ts src/engine/english.ts src/engine/reading.ts src/panels/verb.ts src/engine/copula.test.ts src/data/readings.test.ts
git commit -m "feat: the noun νερό and the copula είμαι

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The quantifier model, its Greek forms and its data

**Files:**

- Create: `src/engine/stored.ts`, `src/engine/quantifier.ts`
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/engine/greek.ts`, `src/validate/validate.ts`, `src/panels/panels.ts`
- Test: `src/engine/quantifier.test.ts`

**Interfaces:**

- Consumes: Task 1; `ADJ_UNSTRESSED`, `Pair` from `paradigms.ts`; `inflect`.
- Produces:
  - `type Stored = string | { pending: true; note?: string }`; `src/engine/stored.ts`: `isPending(cell)`, `storedText(cell): string | null`, `NOT_YET_ADDED = 'not yet added'`.
  - Types `QuantifierDegree`, `QuantifierSense`, `QuantifierUse`, `QuantifierGreek`, `RoQuantifierCell`, `RoQuantifierCells`, `EnQuantifierCells`, `GreekQuantifier`; the slot variant `{ pos: 'quantifier'; gender; number; case; degree; sense?; use }`; `GreekLexeme` includes `GreekQuantifier`.
  - Lexemes `merikoi`, `kapoios`, `kanenas`, `polys`, `ligos` with their Greek, Romanian (six cells pending) and English data.
  - `QUANTIFIER_FORMS` (tables `kapoios`, `kanenas`, `polys`) in `paradigms.ts`; `inflectQuantifier(l, slot): Form` in `greek.ts`, also reached through `inflect`. The πολύς forms carry the irregularity note `two-stems`.
  - `src/engine/quantifier.ts`: `offeredDegrees(q)`, `offeredSenses(q)`, `quantifierSlots(q): SlotOf<'quantifier'>[]`.
  - The validator inflects every slot a quantifier offers. `buildPanel` throws "no quantifier panel yet" for a quantifier until Task 4 (no phrase uses one before then).

- [ ] **Step 1: Write the failing tests**

Create `src/engine/quantifier.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import type { Case, Gender, Num, QuantifierDegree, SlotOf } from '../types';
import { inflect } from './greek';
import { isPending, storedText } from './stored';
import { offeredDegrees, offeredSenses, quantifierSlots } from './quantifier';
import { formText } from './segments';

const slot = (
  gender: Gender,
  number: Num,
  c: Case,
  degree: QuantifierDegree = 'plain',
): SlotOf<'quantifier'> => ({ pos: 'quantifier', gender, number, case: c, degree, use: 'determiner' });
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflect(getLexeme(id), s));

describe('μερικοί (plural only)', () => {
  it.each([
    ['m', 'nom', 'μερικοί'], ['f', 'nom', 'μερικές'], ['n', 'nom', 'μερικά'],
    ['m', 'acc', 'μερικούς'], ['f', 'acc', 'μερικές'], ['n', 'acc', 'μερικά'],
    ['m', 'gen', 'μερικών'], ['f', 'gen', 'μερικών'], ['n', 'gen', 'μερικών'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('merikoi', slot(g, 'pl', c))).toBe(expected);
  });
  it('has no singular', () => {
    expect(() => inflect(getLexeme('merikoi'), slot('m', 'sg', 'nom'))).toThrow(/no sg form|not offered/);
  });
});

describe('κάποιος (singular only)', () => {
  it.each([
    ['m', 'nom', 'κάποιος'], ['f', 'nom', 'κάποια'], ['n', 'nom', 'κάποιο'],
    ['m', 'acc', 'κάποιον'], ['f', 'acc', 'κάποια'], ['n', 'acc', 'κάποιο'],
    ['m', 'gen', 'κάποιου'], ['f', 'gen', 'κάποιας'], ['n', 'gen', 'κάποιου'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('kapoios', slot(g, 'sg', c))).toBe(expected);
  });
  it('has no plural and no comparative', () => {
    expect(() => inflect(getLexeme('kapoios'), slot('m', 'pl', 'nom'))).toThrow();
    expect(() => inflect(getLexeme('kapoios'), slot('m', 'sg', 'nom', 'comparative'))).toThrow(/comparative/);
  });
});

describe('κανένας (singular only, like ένας)', () => {
  it.each([
    ['m', 'nom', 'κανένας'], ['f', 'nom', 'καμία'], ['n', 'nom', 'κανένα'],
    ['m', 'acc', 'κανέναν'], ['f', 'acc', 'καμία'], ['n', 'acc', 'κανένα'],
    ['m', 'gen', 'κανενός'], ['f', 'gen', 'καμίας'], ['n', 'gen', 'κανενός'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('kanenas', slot(g, 'sg', c))).toBe(expected);
  });
});

describe('πολύς and περισσότερος', () => {
  it.each([
    ['m', 'sg', 'nom', 'πολύς'], ['f', 'sg', 'nom', 'πολλή'], ['n', 'sg', 'nom', 'πολύ'],
    ['m', 'sg', 'acc', 'πολύ'], ['f', 'sg', 'acc', 'πολλή'], ['n', 'sg', 'acc', 'πολύ'],
    ['m', 'sg', 'gen', 'πολλού'], ['f', 'sg', 'gen', 'πολλής'], ['n', 'sg', 'gen', 'πολλού'],
    ['m', 'pl', 'nom', 'πολλοί'], ['f', 'pl', 'nom', 'πολλές'], ['n', 'pl', 'nom', 'πολλά'],
    ['m', 'pl', 'acc', 'πολλούς'], ['f', 'pl', 'acc', 'πολλές'], ['n', 'pl', 'acc', 'πολλά'],
    ['m', 'pl', 'gen', 'πολλών'], ['f', 'pl', 'gen', 'πολλών'], ['n', 'pl', 'gen', 'πολλών'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('polys', slot(g, n, c))).toBe(expected);
  });
  it.each([
    ['n', 'sg', 'acc', 'περισσότερο'], ['m', 'sg', 'nom', 'περισσότερος'], ['f', 'sg', 'nom', 'περισσότερη'],
    ['m', 'pl', 'nom', 'περισσότεροι'], ['n', 'pl', 'acc', 'περισσότερα'], ['m', 'sg', 'gen', 'περισσότερου'],
  ] as const)('comparative %s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('polys', slot(g, n, c, 'comparative'))).toBe(expected);
  });
  it('the πολύς forms carry the two-stems note; the comparative does not', () => {
    expect(inflect(getLexeme('polys'), slot('n', 'sg', 'acc')).irregular?.rule).toBe('two-stems');
    expect(inflect(getLexeme('polys'), slot('n', 'sg', 'acc', 'comparative')).irregular).toBeUndefined();
  });
});

describe('λίγος and λιγότερος', () => {
  it.each([
    ['m', 'sg', 'nom', 'λίγος'], ['f', 'sg', 'nom', 'λίγη'], ['n', 'sg', 'acc', 'λίγο'],
    ['m', 'pl', 'nom', 'λίγοι'], ['f', 'pl', 'acc', 'λίγες'], ['n', 'pl', 'nom', 'λίγα'], ['m', 'pl', 'gen', 'λίγων'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('ligos', slot(g, n, c))).toBe(expected);
  });
  it.each([
    ['n', 'sg', 'acc', 'λιγότερο'], ['m', 'sg', 'nom', 'λιγότερος'], ['n', 'pl', 'nom', 'λιγότερα'],
  ] as const)('comparative %s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('ligos', slot(g, n, c, 'comparative'))).toBe(expected);
  });
});

describe('what a quantifier offers', () => {
  const q = (id: string) => {
    const lexeme = getLexeme(id);
    if (lexeme.pos !== 'quantifier') throw new Error('not a quantifier');
    return lexeme;
  };
  it('degrees and senses come from the data', () => {
    expect(offeredDegrees(q('polys'))).toEqual(['plain', 'comparative']);
    expect(offeredDegrees(q('kanenas'))).toEqual(['plain']);
    expect(offeredSenses(q('merikoi'))).toEqual(['some', 'few']);
    expect(offeredSenses(q('polys'))).toEqual(['some']);
  });
  it('lists every slot: gender × number × role × degree × sense × use', () => {
    expect(quantifierSlots(q('merikoi'))).toHaveLength(36);
    expect(quantifierSlots(q('kapoios'))).toHaveLength(18);
    expect(quantifierSlots(q('kanenas'))).toHaveLength(18);
    expect(quantifierSlots(q('polys'))).toHaveLength(72);
    expect(quantifierSlots(q('ligos'))).toHaveLength(72);
  });
  it('only the few sense carries `sense` on the slot', () => {
    const slots = quantifierSlots(q('merikoi'));
    expect(slots.filter((s) => s.sense === 'few')).toHaveLength(18);
    expect(slots.filter((s) => s.sense === undefined)).toHaveLength(18);
  });
});

describe('Stored cells', () => {
  it('a pending cell has no text', () => {
    expect(storedText('mult')).toBe('mult');
    expect(storedText({ pending: true })).toBeNull();
    expect(isPending({ pending: true, note: 'not yet confirmed' })).toBe(true);
    expect(isPending('mult')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/quantifier.test.ts`
Expected: FAIL (module `./stored` not found).

- [ ] **Step 3: The types**

In `src/types.ts`:

a) Add to the `Slot` union, before `| { pos: 'preposition' }`:

```ts
  | {
      pos: 'quantifier';
      gender: Gender;
      number: Num;
      case: Case;
      degree: QuantifierDegree;
      /** μερικοί: Romanian niște (the default, 'some') or câțiva ('few'). */
      sense?: QuantifierSense;
      /** Beside a noun, or on its own. Greek does not change; Romanian and English do (spec 4.2). */
      use: QuantifierUse;
    }
```

b) After the `NumeralValue` line add the supporting types:

```ts
/** A stored Romanian cell: text, or `pending` while the form is not confirmed. A release build refuses a pending cell (spec 4.2, 7). */
export type Stored = string | { pending: true; note?: string };

export type QuantifierDegree = 'plain' | 'comparative';
export type QuantifierSense = 'some' | 'few';
export type QuantifierUse = 'determiner' | 'pronoun';
```

c) After `GreekNumeral` add:

```ts
/**
 * How the Greek forms of one degree are made: a shared table of whole forms, or the adjective endings on a stem
 * (the stem-stressed endings, or the ending-stressed ones when `stressed` is set: μερικός, μερικοί).
 */
export type QuantifierGreek = { table: 'kapoios' | 'kanenas' | 'polys' } | { stem: string; stressed?: true };

/** One Romanian cell: nominative-accusative and genitive-dative. `gen` is absent where the form is not covered (a stand-alone genitive pronoun, spec 6.3). */
export interface RoQuantifierCell {
  nom: Stored;
  gen?: Stored;
}

/** By use, then Romanian gender (neuter follows masculine in the singular and feminine in the plural), then number. */
export type RoQuantifierCells = Record<QuantifierUse, Record<'m' | 'f', Partial<Record<Num, RoQuantifierCell>>>>;

export type EnQuantifierCells = Record<QuantifierUse, Partial<Record<Num, string>>>;

export interface GreekQuantifier extends LexemeBase {
  pos: 'quantifier';
  greek: { plain: QuantifierGreek; comparative?: QuantifierGreek };
  /** The numbers the panel may offer: μερικοί is plural only, κάποιος and κανένας singular only (spec 4.2). */
  numbers: Num[];
  /** One line of meaning for the panel. */
  meaning: string;
  ro: {
    lemma: string;
    plain: RoQuantifierCells;
    /** The second sense (câțiva beside niște). The comparative is generated: mai + the plain form. */
    few?: RoQuantifierCells;
  };
  en: {
    plain: EnQuantifierCells;
    few?: EnQuantifierCells;
    comparative?: EnQuantifierCells;
    /** The word after a negative verb: "not … any". */
    negated?: string;
  };
}
```

d) Add `| GreekQuantifier` to the `GreekLexeme` union.

- [ ] **Step 4: The `Stored` helpers and the offered slots**

Create `src/engine/stored.ts`:

```ts
import type { Stored } from '../types';

export const NOT_YET_ADDED = 'not yet added';

export const isPending = (cell: Stored): cell is { pending: true; note?: string } => typeof cell !== 'string';

/** The text of a cell, or null while it is pending. */
export const storedText = (cell: Stored): string | null => (typeof cell === 'string' ? cell : null);
```

Create `src/engine/quantifier.ts`:

```ts
import type { Case, Gender, GreekQuantifier, QuantifierDegree, QuantifierSense, QuantifierUse, SlotOf } from '../types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const CASES: Case[] = ['nom', 'acc', 'gen'];
const USES: QuantifierUse[] = ['determiner', 'pronoun'];

/** The degrees a quantifier has: the comparative only where its data has one. */
export const offeredDegrees = (q: GreekQuantifier): QuantifierDegree[] =>
  q.greek.comparative ? ['plain', 'comparative'] : ['plain'];

/** The senses a quantifier has: the second only where its Romanian data has one (μερικοί). */
export const offeredSenses = (q: GreekQuantifier): QuantifierSense[] => (q.ro.few ? ['some', 'few'] : ['some']);

/** Every slot a quantifier offers; the `few` sense is the only one written on the slot. */
export function quantifierSlots(q: GreekQuantifier): SlotOf<'quantifier'>[] {
  return GENDERS.flatMap((gender) =>
    q.numbers.flatMap((number) =>
      CASES.flatMap((c) =>
        offeredDegrees(q).flatMap((degree) =>
          offeredSenses(q).flatMap((sense) =>
            USES.map(
              (use): SlotOf<'quantifier'> => ({
                pos: 'quantifier',
                gender,
                number,
                case: c,
                degree,
                ...(sense === 'few' ? { sense } : {}),
                use,
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
```

- [ ] **Step 5: The Greek tables and `inflectQuantifier`**

In `src/data/paradigms.ts` append:

```ts
type PairTable = Partial<Record<Num, Record<Case, Record<Gender, Pair>>>>;

/**
 * Whole forms of the quantifiers that do not follow the adjective endings on one stem (spec 6.3).
 * κάποιος keeps the final ν of the masculine accusative; κανένας follows the numeral ένας; πολύς has two stems.
 */
export const QUANTIFIER_FORMS: Record<'kapoios' | 'kanenas' | 'polys', PairTable> = {
  kapoios: {
    sg: {
      nom: { m: ['κάποι', 'ος'], f: ['κάποι', 'α'], n: ['κάποι', 'ο'] },
      acc: { m: ['κάποι', 'ον'], f: ['κάποι', 'α'], n: ['κάποι', 'ο'] },
      gen: { m: ['κάποι', 'ου'], f: ['κάποι', 'ας'], n: ['κάποι', 'ου'] },
    },
  },
  kanenas: {
    sg: {
      nom: { m: ['κανένα', 'ς'], f: ['καμία', ''], n: ['κανένα', ''] },
      acc: { m: ['κανένα', 'ν'], f: ['καμία', ''], n: ['κανένα', ''] },
      gen: { m: ['κανενό', 'ς'], f: ['καμία', 'ς'], n: ['κανενό', 'ς'] },
    },
  },
  polys: {
    sg: {
      nom: { m: ['πολύ', 'ς'], f: ['πολλ', 'ή'], n: ['πολύ', ''] },
      acc: { m: ['πολύ', ''], f: ['πολλ', 'ή'], n: ['πολύ', ''] },
      gen: { m: ['πολλ', 'ού'], f: ['πολλ', 'ής'], n: ['πολλ', 'ού'] },
    },
    pl: {
      nom: { m: ['πολλ', 'οί'], f: ['πολλ', 'ές'], n: ['πολλ', 'ά'] },
      acc: { m: ['πολλ', 'ούς'], f: ['πολλ', 'ές'], n: ['πολλ', 'ά'] },
      gen: { m: ['πολλ', 'ών'], f: ['πολλ', 'ών'], n: ['πολλ', 'ών'] },
    },
  },
};
```

In `src/engine/greek.ts`: add `QUANTIFIER_FORMS` to the `../data/paradigms` import, `GreekQuantifier` to the type import, and add before `inflectPreposition`:

```ts
const TWO_STEMS: IrregularNote = {
  rule: 'two-stems',
  plain: 'πολύς has two stems: πολύ- (πολύς, πολύ) and πολλ- (all the other forms).',
};

export function inflectQuantifier(l: GreekQuantifier, s: SlotOf<'quantifier'>): Form {
  if (!l.numbers.includes(s.number)) throw new Error(`${l.id} is not offered in the ${s.number}`);
  const how = l.greek[s.degree];
  if (!how) throw new Error(`${l.id} has no ${s.degree} degree`);
  if ('stem' in how) {
    const endings = how.stressed ? ADJ_STRESSED : ADJ_UNSTRESSED;
    return { stem: how.stem, ending: endings[s.number][s.case][s.gender] };
  }
  const pair = QUANTIFIER_FORMS[how.table][s.number]?.[s.case][s.gender];
  if (!pair) throw new Error(`${l.id} has no ${s.number} form`);
  const form: Form = { stem: pair[0], ending: pair[1] };
  return how.table === 'polys' ? { ...form, irregular: TWO_STEMS } : form;
}
```

and in `inflect` add before the `'preposition'` case:

```ts
    case 'quantifier':
      return inflectQuantifier(l, s as SlotOf<'quantifier'>);
```

- [ ] **Step 6: The data**

In `src/data/lexemes.ts` add `GreekQuantifier`, `RoQuantifierCell` and `Stored` to the type imports, and after the `def` constant add:

```ts
const ro1 = (nom: Stored, gen?: Stored): RoQuantifierCell => (gen === undefined ? { nom } : { nom, gen });
/** A Romanian form not yet confirmed: shown as "not yet added" (spec 4.2). */
const PENDING: Stored = { pending: true, note: 'not yet confirmed' };

const merikoi: GreekQuantifier = {
  id: 'merikoi',
  pos: 'quantifier',
  lemma: 'μερικοί',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'μερικ', stressed: true } },
  numbers: ['pl'],
  meaning:
    'Greek has no plural "a / an": μερικοί means "some" and, with the sense control, "a few". Romanian splits it into niște and câțiva.',
  ro: {
    lemma: 'niște',
    plain: {
      determiner: { m: { pl: ro1('niște', 'unor') }, f: { pl: ro1('niște', 'unor') } },
      pronoun: { m: { pl: ro1('unii') }, f: { pl: ro1('unele') } },
    },
    few: {
      determiner: { m: { pl: ro1('câțiva', 'câtorva') }, f: { pl: ro1('câteva', 'câtorva') } },
      pronoun: { m: { pl: ro1('câțiva') }, f: { pl: ro1('câteva') } },
    },
  },
  en: {
    plain: { determiner: { pl: 'some' }, pronoun: { pl: 'some' } },
    few: { determiner: { pl: 'a few / several' }, pronoun: { pl: 'a few' } },
  },
};

const kapoios: GreekQuantifier = {
  id: 'kapoios',
  pos: 'quantifier',
  lemma: 'κάποιος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'kapoios' } },
  numbers: ['sg'],
  meaning:
    'κάποιος covers both "some" and "any": Greek does not separate them the way English does. On its own it is "someone / anyone".',
  ro: {
    lemma: 'vreun',
    plain: {
      determiner: { m: { sg: ro1('vreun', 'vreunui') }, f: { sg: ro1('vreo', 'vreunei') } },
      pronoun: { m: { sg: ro1('vreunul') }, f: { sg: ro1('vreuna') } },
    },
  },
  en: { plain: { determiner: { sg: 'some / any' }, pronoun: { sg: 'someone / anyone' } } },
};

const kanenas: GreekQuantifier = {
  id: 'kanenas',
  pos: 'quantifier',
  lemma: 'κανένας',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'kanenas' } },
  numbers: ['sg'],
  meaning:
    'κανένας means "no" or "none" and needs a negative verb: δεν θέλω κανέναν καφέ. It declines like the numeral ένας.',
  ro: {
    lemma: 'niciun',
    plain: {
      determiner: { m: { sg: ro1('niciun', 'niciunui') }, f: { sg: ro1('nicio', 'niciunei') } },
      pronoun: { m: { sg: ro1('niciunul') }, f: { sg: ro1('niciuna') } },
    },
  },
  en: { plain: { determiner: { sg: 'no' }, pronoun: { sg: 'none / no one' } }, negated: 'any' },
};

const polys: GreekQuantifier = {
  id: 'polys',
  pos: 'quantifier',
  lemma: 'πολύς',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'polys' }, comparative: { stem: 'περισσότερ' } },
  numbers: ['sg', 'pl'],
  meaning:
    'πολύς means "much" with a mass noun (πολύ ψωμί) and "many" with a count noun (πολλά ψωμιά). With the degree control it becomes περισσότερος, "more".',
  ro: {
    lemma: 'mult',
    plain: {
      determiner: {
        m: { sg: ro1('mult', PENDING), pl: ro1('mulți', 'multor') },
        f: { sg: ro1('multă', PENDING), pl: ro1('multe', 'multor') },
      },
      pronoun: {
        m: { sg: ro1('mult'), pl: ro1('mulți') },
        f: { sg: ro1('multă'), pl: ro1('multe') },
      },
    },
  },
  en: {
    plain: {
      determiner: { sg: 'much / a lot of', pl: 'many / a lot of' },
      pronoun: { sg: 'much / a lot', pl: 'many / a lot' },
    },
    comparative: { determiner: { sg: 'more', pl: 'more' }, pronoun: { sg: 'more', pl: 'more' } },
  },
};

const ligos: GreekQuantifier = {
  id: 'ligos',
  pos: 'quantifier',
  lemma: 'λίγος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'λίγ' }, comparative: { stem: 'λιγότερ' } },
  numbers: ['sg', 'pl'],
  meaning:
    'λίγος means "little" with a mass noun (λίγο νερό) and "few" with a count noun (λίγα ψωμιά). With the degree control it becomes λιγότερος, "less" or "fewer".',
  ro: {
    lemma: 'puțin',
    plain: {
      determiner: {
        m: { sg: ro1('puțin', PENDING), pl: ro1('puțini', PENDING) },
        f: { sg: ro1('puțină', PENDING), pl: ro1('puține', PENDING) },
      },
      pronoun: {
        m: { sg: ro1('puțin'), pl: ro1('puțini') },
        f: { sg: ro1('puțină'), pl: ro1('puține') },
      },
    },
  },
  en: {
    plain: {
      determiner: { sg: 'little / a little', pl: 'few / a few' },
      pronoun: { sg: 'little / a little', pl: 'few / a few' },
    },
    comparative: { determiner: { sg: 'less', pl: 'fewer' }, pronoun: { sg: 'less', pl: 'fewer' } },
  },
};
```

Register all five in `LEXEMES` (after `def`): `[merikoi.id]: merikoi,` and so on.

- [ ] **Step 7: The validator and the interim panel**

In `src/validate/validate.ts` import `quantifierSlots` from `../engine/quantifier` and add to `slotsFor`:

```ts
    case 'quantifier':
      return quantifierSlots(l);
```

In `src/panels/panels.ts` add to the import list `GreekQuantifier` is not needed yet; add this case to `buildPanel`'s switch (after `'particle'`):

```ts
    case 'quantifier':
      // The quantifier panel arrives in Task 4; no phrase uses a quantifier before then.
      throw new Error('no quantifier panel yet');
```

- [ ] **Step 8: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (189):` (174 + 5 lexemes × 3).

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/data/paradigms.ts src/data/lexemes.ts src/engine/greek.ts src/engine/stored.ts src/engine/quantifier.ts src/validate/validate.ts src/panels/panels.ts src/engine/quantifier.test.ts
git commit -m "feat: the quantifier lexemes and their Greek forms

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 3: Romanian and English quantifier forms, token checks and the pending report

**Files:**

- Modify: `src/engine/romanian.ts`, `src/engine/english.ts`, `src/validate/validate.ts`, `scripts/validate.ts`, `src/data/review.ts`
- Test: `src/engine/quantifier-ro-en.test.ts`, `src/validate/quantifier-validate.test.ts`

**Interfaces:**

- Consumes: Task 2's lexemes and types, `storedText`.
- Produces:
  - `roQuantifier(q, slot, roGender): Stored | null` in `romanian.ts`: the Romanian cell for a slot. The comparative is `mai` + the plain form (a pending cell stays pending). `null` means "not covered" (a stand-alone genitive pronoun). A neuter Romanian gender maps to masculine in the singular and feminine in the plural.
  - `roBareNoun(noun, number, case): string`: the Romanian noun with no article or numeral (`pâine`, `cafele`), as it follows a quantifier.
  - `enQuantifier(q, slot): string` in `english.ts`.
  - `pendingCells(lexemes): string[]` in `validate.ts`; `validate` checks every Romanian and English quantifier cell and the quantifier tokens (noun agreement, number, sense, degree, text).
  - `scripts/validate.ts` prints `Pending (n)` and `--release` fails while any cell is pending.
  - Two `ReviewItem`s: `ending-table:quantifier-forms`, `auxiliary-table:ro-comparative`.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/quantifier-ro-en.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { GreekQuantifier, SlotOf } from '../types';
import { enQuantifier } from './english';
import { roBareNoun, roQuantifier } from './romanian';

const q = (id: string): GreekQuantifier => {
  const lexeme = getLexeme(id);
  if (lexeme.pos !== 'quantifier') throw new Error(`${id} is not a quantifier`);
  return lexeme;
};
const slot = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'm',
  number: 'sg',
  case: 'nom',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});

describe('Romanian quantifier cells', () => {
  it('μερικοί: niște / unor, and câțiva / câteva / câtorva with the few sense', () => {
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl' }), 'm')).toBe('niște');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', case: 'gen' }), 'f')).toBe('unor');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few' }), 'm')).toBe('câțiva');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few' }), 'f')).toBe('câteva');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few', case: 'gen' }), 'm')).toBe('câtorva');
  });

  it('μερικοί on its own: unii / unele, and no stand-alone genitive', () => {
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun' }), 'm')).toBe('unii');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun' }), 'f')).toBe('unele');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun', case: 'gen' }), 'm')).toBeNull();
  });

  it('κάποιος: vreun / vreo, vreunui / vreunei, vreunul / vreuna', () => {
    expect(roQuantifier(q('kapoios'), slot(), 'm')).toBe('vreun');
    expect(roQuantifier(q('kapoios'), slot(), 'f')).toBe('vreo');
    expect(roQuantifier(q('kapoios'), slot({ case: 'gen' }), 'm')).toBe('vreunui');
    expect(roQuantifier(q('kapoios'), slot({ case: 'gen' }), 'f')).toBe('vreunei');
    expect(roQuantifier(q('kapoios'), slot({ use: 'pronoun' }), 'm')).toBe('vreunul');
    expect(roQuantifier(q('kapoios'), slot({ use: 'pronoun' }), 'f')).toBe('vreuna');
  });

  it('κανένας: niciun / nicio, niciunui / niciunei, niciunul / niciuna', () => {
    expect(roQuantifier(q('kanenas'), slot(), 'm')).toBe('niciun');
    expect(roQuantifier(q('kanenas'), slot(), 'f')).toBe('nicio');
    expect(roQuantifier(q('kanenas'), slot({ case: 'gen' }), 'm')).toBe('niciunui');
    expect(roQuantifier(q('kanenas'), slot({ case: 'gen' }), 'f')).toBe('niciunei');
    expect(roQuantifier(q('kanenas'), slot({ use: 'pronoun' }), 'm')).toBe('niciunul');
    expect(roQuantifier(q('kanenas'), slot({ use: 'pronoun' }), 'f')).toBe('niciuna');
  });

  it('πολύς: mult, multă, mulți, multe, multor; the singular genitive is pending', () => {
    expect(roQuantifier(q('polys'), slot(), 'm')).toBe('mult');
    expect(roQuantifier(q('polys'), slot(), 'f')).toBe('multă');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'm')).toBe('mulți');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'f')).toBe('multe');
    expect(roQuantifier(q('polys'), slot({ number: 'pl', case: 'gen' }), 'f')).toBe('multor');
    expect(roQuantifier(q('polys'), slot({ case: 'gen' }), 'f')).toMatchObject({ pending: true });
  });

  it('the comparative is mai + the plain form, and a pending cell stays pending', () => {
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative' }), 'f')).toBe('mai multă');
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative', number: 'pl', case: 'gen' }), 'm')).toBe('mai multor');
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative', case: 'gen' }), 'm')).toMatchObject({ pending: true });
    expect(roQuantifier(q('ligos'), slot({ degree: 'comparative' }), 'f')).toBe('mai puțină');
  });

  it('λίγος: puțin, puțină, puțini, puține; every genitive is pending', () => {
    expect(roQuantifier(q('ligos'), slot(), 'm')).toBe('puțin');
    expect(roQuantifier(q('ligos'), slot(), 'f')).toBe('puțină');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl' }), 'm')).toBe('puțini');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl' }), 'f')).toBe('puține');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl', case: 'gen' }), 'f')).toMatchObject({ pending: true });
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(roQuantifier(q('polys'), slot(), 'n')).toBe('mult');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'n')).toBe('multe');
  });

  it('throws for a number the lexeme does not have', () => {
    expect(() => roQuantifier(q('kanenas'), slot({ number: 'pl' }), 'm')).toThrow(/no Romanian/);
  });
});

describe('English quantifier cells', () => {
  it.each([
    ['merikoi', { number: 'pl' }, 'some'],
    ['merikoi', { number: 'pl', sense: 'few' }, 'a few / several'],
    ['merikoi', { number: 'pl', sense: 'few', use: 'pronoun' }, 'a few'],
    ['kapoios', {}, 'some / any'],
    ['kapoios', { use: 'pronoun' }, 'someone / anyone'],
    ['kanenas', {}, 'no'],
    ['kanenas', { use: 'pronoun' }, 'none / no one'],
    ['polys', {}, 'much / a lot of'],
    ['polys', { number: 'pl' }, 'many / a lot of'],
    ['polys', { degree: 'comparative' }, 'more'],
    ['ligos', {}, 'little / a little'],
    ['ligos', { number: 'pl' }, 'few / a few'],
    ['ligos', { degree: 'comparative' }, 'less'],
    ['ligos', { degree: 'comparative', number: 'pl' }, 'fewer'],
  ] as const)('%s %j -> %s', (id, patch, expected) => {
    expect(enQuantifier(q(id), slot(patch))).toBe(expected);
  });

  it('κανένας names the word it takes after a negative verb', () => {
    expect(q('kanenas').en.negated).toBe('any');
    expect(q('polys').en.negated).toBeUndefined();
  });

  it('throws for a number the lexeme does not have', () => {
    expect(() => enQuantifier(q('kanenas'), slot({ number: 'pl' }))).toThrow(/no English/);
  });
});

describe('roBareNoun', () => {
  it.each([
    ['kafes', 'sg', 'nom', 'cafea'],
    ['kafes', 'pl', 'acc', 'cafele'],
    ['kafes', 'sg', 'gen', 'cafele'],
    ['kafes', 'pl', 'gen', 'cafele'],
    ['psomi', 'sg', 'acc', 'pâine'],
    ['psomi', 'pl', 'nom', 'pâini'],
    ['nero', 'sg', 'acc', 'apă'],
    ['skylos', 'sg', 'nom', 'câine'],
    ['skylos', 'sg', 'gen', 'câine'],
  ] as const)('%s %s %s -> %s', (id, number, c, expected) => {
    expect(roBareNoun(getNoun(id), number, c)).toBe(expected);
  });
});
```

Create `src/validate/quantifier-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekQuantifier, Phrase, Token } from '../types';
import { pendingCells, validate } from './validate';

const polys = LEXEMES.polys as GreekQuantifier;
const real = { lexemes: LEXEMES, phrases: PHRASES };

/** Phrase 1 with its numeral (token 1) replaced by a quantifier token that agrees with καφές. */
const withQuantifier = (lexeme: string, patch: Partial<Token> & { slot?: Token['slot'] } = {}): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) =>
    i === 1
      ? {
          text: 'κανέναν',
          lexeme,
          slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner' },
          agreesWith: 3,
          ...patch,
        }
      : t,
  ),
});
const errorsOf = (phrase: Phrase) => validate({ ...real, phrases: [phrase] });

describe('the pending report', () => {
  it('lists the six pending Romanian genitives', () => {
    expect(pendingCells(LEXEMES)).toEqual([
      'polys Romanian plain determiner m sg gen',
      'polys Romanian plain determiner f sg gen',
      'ligos Romanian plain determiner m sg gen',
      'ligos Romanian plain determiner m pl gen',
      'ligos Romanian plain determiner f sg gen',
      'ligos Romanian plain determiner f pl gen',
    ]);
  });

  it('accepts a pending cell and refuses an empty one', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    const emptied: GreekQuantifier = {
      ...polys,
      ro: {
        ...polys.ro,
        plain: {
          ...polys.ro.plain,
          determiner: {
            ...polys.ro.plain.determiner,
            m: { ...polys.ro.plain.determiner.m, sg: { nom: '', gen: { pending: true } } },
          },
        },
      },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: emptied }, phrases: [] });
    expect(errors.some((e) => e.includes('lexeme polys') && e.includes('empty Romanian m form'))).toBe(true);
  });

  it('refuses a determiner with no genitive, but allows a pronoun with none', () => {
    const noGenitive: GreekQuantifier = {
      ...polys,
      ro: {
        ...polys.ro,
        plain: {
          ...polys.ro.plain,
          determiner: {
            ...polys.ro.plain.determiner,
            m: { ...polys.ro.plain.determiner.m, sg: { nom: 'mult' } },
          },
        },
      },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: noGenitive }, phrases: [] });
    expect(errors.some((e) => e.includes('no Romanian m determiner form in the genitive'))).toBe(true);
  });

  it('refuses a missing English cell', () => {
    const noEnglish: GreekQuantifier = {
      ...polys,
      en: { ...polys.en, plain: { ...polys.en.plain, determiner: { sg: 'much / a lot of' } } },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: noEnglish }, phrases: [] });
    expect(errors.some((e) => e.includes('lexeme polys') && e.includes('no English'))).toBe(true);
  });
});

describe('quantifier tokens', () => {
  it('accepts a quantifier that agrees with its noun', () => {
    expect(errorsOf(withQuantifier('kanenas'))).toEqual([]);
  });

  it('reports a gender that differs from the noun', () => {
    expect(
      errorsOf(withQuantifier('kanenas', { slot: { pos: 'quantifier', gender: 'f', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner' } })),
    ).toContain('ordering-hot-coffee token 1 (κανέναν): slot gender f differs from noun gender m');
  });

  it('reports a number that differs from the noun', () => {
    const errors = errorsOf(
      withQuantifier('polys', {
        text: 'πολλούς',
        slot: { pos: 'quantifier', gender: 'm', number: 'pl', case: 'acc', degree: 'plain', use: 'determiner' },
      }),
    );
    expect(errors).toContain('ordering-hot-coffee token 1 (πολλούς): the quantifier is pl but its noun is sg');
  });

  it('reports a text that is not the form', () => {
    expect(errorsOf(withQuantifier('kanenas', { text: 'κανένα' }))).toContain(
      'ordering-hot-coffee token 1 (κανένα): text differs from the form ("κανέναν")',
    );
  });

  it('reports a missing agreesWith', () => {
    expect(errorsOf(withQuantifier('kanenas', { agreesWith: undefined }))).toContain(
      'ordering-hot-coffee token 1 (κανέναν): quantifier needs agreesWith pointing at a noun',
    );
  });

  it('reports a sense or a degree the lexeme does not have', () => {
    const few = errorsOf(
      withQuantifier('polys', {
        text: 'πολύ',
        slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', sense: 'few', use: 'determiner' },
      }),
    );
    expect(few).toContain('ordering-hot-coffee token 1 (πολύ): polys has no "few" sense');
    const comparative = errorsOf(
      withQuantifier('kapoios', {
        text: 'κάποιον',
        slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'comparative', use: 'determiner' },
      }),
    );
    expect(comparative.some((e) => e.includes('kapoios has no comparative degree'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/quantifier-ro-en.test.ts src/validate/quantifier-validate.test.ts`
Expected: FAIL (`roQuantifier is not a function` and similar).

- [ ] **Step 3: The Romanian generator**

In `src/engine/romanian.ts` extend the type import to include `GreekQuantifier` and `Stored`:

```ts
import type {
  Case, Gender, GreekAdjective, GreekNoun, GreekNumeral, GreekQuantifier, GreekVerb, Num, NumeralValue, SlotOf, Stored,
} from '../types';
```

and append:

```ts
/** The Romanian noun without an article or numeral, as it follows a quantifier: pâine, cafele, vreunei cafele → cafele. */
export function roBareNoun(n: GreekNoun, number: Num, c: Case): string {
  const f = n.ro.forms[number];
  const form = c === 'gen' ? f.genIndefinite : f.indefinite;
  // The singular and the genitive start with an article word (o, un, unei, unor); the plural nominative does not.
  return number === 'sg' || c === 'gen' ? form.split(' ').slice(1).join(' ') : form;
}

/** Neuter nouns follow the masculine in the singular and the feminine in the plural (spec 10). */
const quantifierGender = (g: Gender, number: Num): 'm' | 'f' => (g === 'n' ? (number === 'sg' ? 'm' : 'f') : g);

/**
 * The Romanian cell of a quantifier slot, for a noun of Romanian gender `roGender`. The comparative is `mai` + the
 * plain form (a pending cell stays pending). Returns null where the form is not covered: the stand-alone genitive
 * (spec 6.3, 16).
 */
export function roQuantifier(q: GreekQuantifier, s: SlotOf<'quantifier'>, roGender: Gender): Stored | null {
  const set = s.sense === 'few' && q.ro.few ? q.ro.few : q.ro.plain;
  const cell = set[s.use][quantifierGender(roGender, s.number)][s.number];
  if (!cell) throw new Error(`${q.id} has no Romanian ${s.use} form for the ${s.number}`);
  const value = s.case === 'gen' ? cell.gen : cell.nom;
  if (value === undefined) return null;
  if (typeof value !== 'string' || s.degree !== 'comparative') return value;
  return `mai ${value}`;
}
```

- [ ] **Step 4: The English generator**

In `src/engine/english.ts` add `GreekQuantifier` to the type import and append:

```ts
/** The English word for a quantifier slot ("some / any", "much / a lot of", "fewer"). */
export function enQuantifier(q: GreekQuantifier, s: SlotOf<'quantifier'>): string {
  const set = s.degree === 'comparative' ? q.en.comparative : s.sense === 'few' && q.en.few ? q.en.few : q.en.plain;
  if (!set) throw new Error(`${q.id} has no English ${s.degree} form`);
  const word = set[s.use][s.number];
  if (word === undefined) throw new Error(`${q.id} has no English ${s.use} form for the ${s.number}`);
  return word;
}
```

- [ ] **Step 5: The validator**

In `src/validate/validate.ts`:

a) Imports: add `enQuantifier` to the `../engine/english` import, `roQuantifier` to the `../engine/romanian` import, `formText` from `../engine/segments`, and `GreekQuantifier` is not needed.

b) In `checkLexeme`, after the `if (l.pos === 'particle') { … }` block add:

```ts
  if (l.pos === 'quantifier') {
    for (const slot of quantifierSlots(l)) {
      const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
      for (const roGender of ['m', 'f'] as const) {
        try {
          const cell = roQuantifier(l, slot, roGender);
          if (cell === null) {
            // A stand-alone genitive pronoun is not covered (spec 6.3); a determiner must have one.
            if (slot.use === 'determiner') errors.push(`${where}: no Romanian ${roGender} determiner form in the genitive`);
          } else if (typeof cell === 'string' && isEmpty(cell)) {
            errors.push(`${where}: empty Romanian ${roGender} form`);
          }
        } catch (e) {
          errors.push(`${where}: ${(e as Error).message}`);
        }
      }
      try {
        if (isEmpty(enQuantifier(l, slot))) errors.push(`${where}: empty English form`);
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
```

c) In `checkToken`, change the agreement condition to include quantifiers:

```ts
  if (
    token.slot.pos === 'adjective' ||
    token.slot.pos === 'numeral' ||
    token.slot.pos === 'article' ||
    token.slot.pos === 'quantifier'
  ) {
```

and directly after that whole `if` block add:

```ts
  if (token.slot.pos === 'quantifier' && lexeme.pos === 'quantifier') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    if (target && target.slot.pos === 'noun' && target.slot.number !== token.slot.number) {
      errors.push(`${where}: the quantifier is ${token.slot.number} but its noun is ${target.slot.number}`);
    }
    if (token.slot.sense === 'few' && !lexeme.ro.few) errors.push(`${where}: ${lexeme.id} has no "few" sense`);
    try {
      const form = formText(inflect(lexeme, token.slot));
      if (normalise(form) !== normalise(token.text)) errors.push(`${where}: text differs from the form ("${form}")`);
    } catch {
      // inflect failed: reported above.
    }
  }
```

d) Append the pending report (after `warnings`):

```ts
/** Every stored Romanian cell that is still `pending`, one line each (spec 7). */
export function pendingCells(lexemes: Record<string, GreekLexeme>): string[] {
  const out: string[] = [];
  for (const l of Object.values(lexemes)) {
    if (l.pos !== 'quantifier') continue;
    for (const [setName, set] of [['plain', l.ro.plain], ['few', l.ro.few]] as const) {
      if (!set) continue;
      for (const use of ['determiner', 'pronoun'] as const) {
        for (const g of ['m', 'f'] as const) {
          for (const number of ['sg', 'pl'] as const) {
            const cell = set[use][g][number];
            if (!cell) continue;
            for (const key of ['nom', 'gen'] as const) {
              const value = cell[key];
              if (value !== undefined && typeof value !== 'string') {
                out.push(`${l.id} Romanian ${setName} ${use} ${g} ${number} ${key}`);
              }
            }
          }
        }
      }
    }
  }
  return out;
}
```

- [ ] **Step 6: The script and the review items**

In `scripts/validate.ts` change the import line `import { validate, warnings } from '../src/validate/validate';` to `import { pendingCells, validate, warnings } from '../src/validate/validate';`, and replace the block from `const warned = …` to the end of the file with:

```ts
const pending = pendingCells(LEXEMES);
if (pending.length > 0) {
  console.log(`Pending (${pending.length}), shown as "not yet added":\n  ${pending.join('\n  ')}`);
}

const warned = warnings({ lexemes: LEXEMES, phrases: PHRASES });
if (warned.length > 0) {
  console.log(`Warnings (${warned.length}):\n  ${warned.join('\n  ')}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

if (release && (unverified.length > 0 || pending.length > 0)) {
  console.error(`\n--release: ${unverified.length} record(s) are not verified and ${pending.length} cell(s) are pending.`);
  process.exit(1);
}

console.log('Data is valid.');
```

In `src/data/review.ts` add after the `ending-table:neut-o` line:

```ts
  { id: 'ending-table:quantifier-forms', kind: 'ending-table', verified: false },
```

and after the `auxiliary-table:negation` line:

```ts
  { id: 'auxiliary-table:ro-comparative', kind: 'auxiliary-table', verified: false },
```

- [ ] **Step 7: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Pending (6)` with the six lines of the test; `Data is valid.`; `Unverified (191):`.

Run: `npm run validate -- --release; echo "exit $?"`
Expected: the same report, then `--release: 191 record(s) are not verified and 6 cell(s) are pending.` and `exit 1`.

- [ ] **Step 8: Commit**

```bash
git add src/engine/romanian.ts src/engine/english.ts src/validate/validate.ts scripts/validate.ts src/data/review.ts src/engine/quantifier-ro-en.test.ts src/validate/quantifier-validate.test.ts
git commit -m "feat: Romanian and English quantifier cells, token checks and the pending report

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: The quantifier panel

**Files:**

- Create: `src/panels/quantifier.ts`
- Modify: `src/panels/panels.ts`, `src/panels/types.ts`, `src/engine/labels.ts`, `src/components/WordPanel.tsx`, `src/styles.css`
- Test: `src/panels/quantifier.test.ts`, `src/components/WordPanel.test.tsx`

**Interfaces:**

- Consumes: Tasks 2 and 3; `nounOf`, `nounControl`, `caseControl`, `caseName`, `GENDER_ROW`, `GENDERS`, `CASES` from `panels/shared.ts`; `numeralRich`, `formRich`, `joinRich`, `dim`, `plain`.
- Produces:
  - `quantifierPanel(q, slot, state, level): Panel`: controls `noun`, `case`, and, when the lexeme has them, `kind` (mass or count: the number), `degree` and `sense`; rows "with a noun", "on its own" (dimmed in the genitive) and, for a lexeme with `en.negated`, "with negation"; the Improver table (gender × role for the selected number); a `badge` of "mass reading" or "count reading" when the lexeme has both numbers.
  - `Control['key']` gains `'kind' | 'degree' | 'sense'`; `Panel` gains `badge?: string`; `applyControl` handles the three keys, and the `noun` key for a quantifier (the slot takes the noun's gender).
  - `kindOptions`, `degreeOptions(level)`, `senseOptions` in `labels.ts`.
  - A pending Romanian cell reads "not yet added" in the row; a count word with a mass noun in the plural reads "uncountable: no plural in English" in the English column.

- [ ] **Step 1: Write the failing tests**

Create `src/panels/quantifier.test.ts`:

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
const panelFor = (lexeme: string, slot: SlotOf<'quantifier'>, noun: string, level: Level = 'beginner') =>
  buildPanel(stateOf(slot, noun), { text: '', lexeme, slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);

describe('quantifier panel: the rows', () => {
  it('πολύς with ψωμί: mass reading, with a noun and on its own', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.lemma).toBe('πολύς / πολλή / πολύ');
    expect(cells(p, 0)).toEqual({ el: 'πολύ ψωμί', ro: 'multă pâine', en: 'much / a lot of bread' });
    expect(p.rows[0].label).toBe('with a noun');
    expect(cells(p, 1)).toEqual({ el: 'πολύ', ro: 'multă', en: 'much / a lot' });
    expect(p.rows[1].label).toBe('on its own');
    expect(p.badge).toBe('mass reading');
  });

  it('colours the quantifier like a numeral and the noun like a noun', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['article', 'plain', 'stem', 'ending']);
  });

  it('the singular genitive of πολύς is pending in Romanian, and the stand-alone genitive is not covered', () => {
    const p = panelFor('polys', slotOf({ case: 'gen' }), 'psomi');
    expect(cells(p, 0)).toEqual({ el: 'πολλού ψωμιού', ro: 'not yet added', en: 'of much / a lot of bread' });
    expect(p.rows[1].dimmed).toContain('not covered');
  });

  it('the plural count reading of a mass noun has no English plural', () => {
    const p = panelFor('polys', slotOf({ number: 'pl' }), 'psomi');
    expect(cells(p, 0)).toEqual({ el: 'πολλά ψωμιά', ro: 'multe pâini', en: 'uncountable: no plural in English' });
    expect(p.badge).toBe('count reading');
  });

  it('the comparative: περισσότερο νερό / mai multă apă / more water', () => {
    const p = panelFor('polys', slotOf({ degree: 'comparative' }), 'nero');
    expect(cells(p, 0)).toEqual({ el: 'περισσότερο νερό', ro: 'mai multă apă', en: 'more water' });
  });

  it('λίγος with νερό: λίγο νερό / puțină apă / little / a little water', () => {
    const p = panelFor('ligos', slotOf(), 'nero');
    expect(cells(p, 0)).toEqual({ el: 'λίγο νερό', ro: 'puțină apă', en: 'little / a little water' });
  });

  it('μερικοί with καφές: niște cafele / some coffees; the few sense gives câteva cafele', () => {
    const some = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes');
    expect(cells(some, 0)).toEqual({ el: 'μερικούς καφέδες', ro: 'niște cafele', en: 'some coffees' });
    expect(cells(some, 1)).toEqual({ el: 'μερικούς', ro: 'unele', en: 'some' });
    const few = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl', sense: 'few' }), 'kafes');
    expect(cells(few, 0)).toEqual({ el: 'μερικούς καφέδες', ro: 'câteva cafele', en: 'a few / several coffees' });
  });

  it('κανένας: no coffee, and a row that shows the negative concord', () => {
    const p = panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes');
    expect(cells(p, 0)).toEqual({ el: 'κανέναν καφέ', ro: 'nicio cafea', en: 'no coffee' });
    expect(cells(p, 1)).toEqual({ el: 'κανέναν', ro: 'niciuna', en: 'none / no one' });
    expect(p.rows[2].label).toBe('with negation');
    expect(cells(p, 2)).toEqual({
      el: 'δεν θέλω κανέναν καφέ',
      ro: 'nu vreau nicio cafea',
      en: "I don't want any coffee",
    });
    expect(p.rows[2].el[0]).toEqual({ text: 'δεν θέλω', role: 'neg' });
  });

  it('κανένας with a masculine Romanian noun gives niciun', () => {
    const p = panelFor('kanenas', slotOf({ gender: 'm' }), 'skylos');
    expect(cells(p, 0).ro).toBe('niciun câine');
  });

  it('only κανένας has the negation row', () => {
    expect(panelFor('polys', slotOf(), 'psomi').rows).toHaveLength(2);
    expect(panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes').rows).toHaveLength(2);
  });

  it('κάποιος: some / any beside a noun, someone / anyone on its own', () => {
    const p = panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes');
    expect(cells(p, 0)).toEqual({ el: 'κάποιον καφέ', ro: 'vreo cafea', en: 'some / any coffee' });
    expect(cells(p, 1)).toEqual({ el: 'κάποιον', ro: 'vreuna', en: 'someone / anyone' });
  });
});

describe('quantifier panel: controls and labels', () => {
  it('lists the controls each lexeme has', () => {
    expect(keys(panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes'))).toEqual(['noun', 'case']);
    expect(keys(panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes'))).toEqual(['noun', 'case']);
    expect(keys(panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes'))).toEqual(['noun', 'case', 'sense']);
    expect(keys(panelFor('polys', slotOf(), 'psomi'))).toEqual(['noun', 'case', 'kind', 'degree']);
    expect(keys(panelFor('ligos', slotOf(), 'nero'))).toEqual(['noun', 'case', 'kind', 'degree']);
  });

  it('the kind control follows the number and the sense control shows the Romanian word', () => {
    const polys = panelFor('polys', slotOf({ number: 'pl' }), 'psomi');
    expect(polys.controls.find((c) => c.key === 'kind')?.value).toBe('count');
    const merikoi = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes');
    const sense = merikoi.controls.find((c) => c.key === 'sense');
    expect(sense?.value).toBe('some');
    expect(sense?.options.map((o) => o.label)).toEqual(['some (niște)', 'a few (câțiva)']);
  });

  it('Beginner and Improver labels differ', () => {
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').posLabel).toBe('quantifier: much / a lot of');
    expect(panelFor('polys', slotOf(), 'psomi', 'improver').posLabel).toBe('quantifier · two stems (πολύ-, πολλ-)');
    expect(panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes', 'improver').posLabel).toBe(
      'quantifier · declines like the numeral ένας',
    );
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').controls.find((c) => c.key === 'degree')?.options.map((o) => o.label)).toEqual([
      'a lot / a little',
      'more / less',
    ]);
  });

  it('says what the word means and shows the irregularity of πολύς', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.plain).toContain('mass noun');
    expect(p.irregular).toContain('two stems');
    expect(panelFor('ligos', slotOf(), 'nero').irregular).toBe('');
    expect(p.note).toContain('Neuter in Greek, feminine in Romanian');
  });
});

describe('quantifier panel: the Improver table', () => {
  it('has nine rows, outlines the Greek and the Romanian gender separately, and shows pending cells', () => {
    const p = panelFor('polys', slotOf(), 'psomi', 'improver');
    expect(p.full).toHaveLength(9);
    expect(p.full.find((r) => r.hl?.el)?.label).toBe('neut. accusative');
    expect(p.full.find((r) => r.hl?.ro)?.label).toBe('fem. accusative');
    const genitive = p.full.filter((r) => r.label.endsWith('genitive'));
    expect(genitive.map((r) => richText(r.ro))).toEqual(['not yet added', 'not yet added', 'not yet added']);
    expect(richText(p.full[0].el)).toBe('πολύς');
  });

  it('is empty in Beginner', () => {
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').full).toEqual([]);
  });
});

describe('applyControl for a quantifier', () => {
  const start = stateOf(slotOf(), 'psomi');
  it('kind switches the number', () => {
    expect(applyControl(start, 'kind', 'count').slot).toMatchObject({ number: 'pl' });
    expect(applyControl(applyControl(start, 'kind', 'count'), 'kind', 'mass').slot).toMatchObject({ number: 'sg' });
  });
  it('degree switches to the comparative', () => {
    expect(applyControl(start, 'degree', 'comparative').slot).toMatchObject({ degree: 'comparative' });
  });
  it('sense sets and clears the few sense', () => {
    const few = applyControl(stateOf(slotOf({ gender: 'm', number: 'pl' }), 'kafes'), 'sense', 'few');
    expect(few.slot).toMatchObject({ sense: 'few' });
    const back = applyControl(few, 'sense', 'some');
    expect(back.slot).not.toHaveProperty('sense');
  });
  it('noun takes the noun and its gender', () => {
    const next = applyControl(start, 'noun', 'kafes');
    expect(next.noun).toBe('kafes');
    expect(next.slot).toMatchObject({ gender: 'm' });
  });
  it('case changes the role', () => {
    expect(applyControl(start, 'case', 'gen').slot).toMatchObject({ case: 'gen' });
  });
});
```

Append to `src/components/WordPanel.test.tsx` (inside the `describe('WordPanel', …)` block, before its closing `});`):

```tsx
  it('shows a badge next to the part-of-speech label when the panel has one', () => {
    const panel = { ...panelFor(3), badge: 'mass reading' };
    render(<WordPanel panel={panel} onChange={() => {}} />);
    expect(screen.getByText('mass reading')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/quantifier.test.ts src/components/WordPanel.test.tsx`
Expected: FAIL (`no quantifier panel yet`).

- [ ] **Step 3: Types and labels**

In `src/panels/types.ts` change the `Control` key union to:

```ts
  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense';
```

and add to `Panel`, after `note: string;`:

```ts
  /** A short label shown beside the part of speech: "mass reading", "count reading". */
  badge?: string;
```

In `src/engine/labels.ts` append:

```ts
/** πολύς and λίγος: the number the noun has decides the reading (spec 5.3). */
export const kindOptions: Option[] = [
  { value: 'mass', label: 'a mass (water, bread)' },
  { value: 'count', label: 'separate things (coffees)' },
];

export const degreeOptions = (level: Level): Option[] => [
  { value: 'plain', label: level === 'beginner' ? 'a lot / a little' : 'plain' },
  { value: 'comparative', label: level === 'beginner' ? 'more / less' : 'comparative' },
];

/** μερικοί: the Romanian counterpart is a control (spec 5.2, quantity-vs-sense). */
export const senseOptions: Option[] = [
  { value: 'some', label: 'some (niște)' },
  { value: 'few', label: 'a few (câțiva)' },
];
```

- [ ] **Step 4: The panel**

Create `src/panels/quantifier.ts`:

```ts
import { enQuantifier } from '../engine/english';
import { inflectNoun, inflectQuantifier } from '../engine/greek';
import { degreeOptions, kindOptions, senseOptions } from '../engine/labels';
import { offeredDegrees, offeredSenses } from '../engine/quantifier';
import { roBareNoun, roQuantifier } from '../engine/romanian';
import { dim, formRich, joinRich, numeralRich, plain, richText, type Rich } from '../engine/segments';
import { NOT_YET_ADDED, storedText } from '../engine/stored';
import type { Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
import { CASES, GENDERS, GENDER_ROW, caseControl, caseName, nounControl, nounOf } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** A Romanian quantifier, with the noun that follows it; a pending cell reads "not yet added". */
function roRich(q: GreekQuantifier, slot: SlotOf<'quantifier'>, roGender: Gender, noun?: string): Rich {
  const cell = roQuantifier(q, slot, roGender);
  if (cell === null) return dim('not covered');
  const word = storedText(cell);
  if (word === null) return dim(NOT_YET_ADDED);
  return plain(noun ? `${word} ${noun}` : word);
}

/** The English quantifier and noun; a count word with a mass noun in the plural has no English form. */
function enWithNoun(q: GreekQuantifier, slot: SlotOf<'quantifier'>, noun: GreekNoun): Rich {
  if (noun.mass && slot.number === 'pl') return dim('uncountable: no plural in English');
  const text = `${enQuantifier(q, slot)} ${noun.en[slot.number]}`;
  return plain(slot.case === 'gen' ? `of ${text}` : text);
}

function negationRow(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow | null {
  if (!q.en.negated) return null;
  // The concord is shown in the object role, whatever role the panel is on.
  const object: SlotOf<'quantifier'> = { ...here, case: 'acc', number: 'sg', use: 'determiner' };
  const word = roQuantifier(q, object, noun.ro.gender);
  return {
    label: 'with negation',
    el: joinRich([
      [{ text: 'δεν θέλω', role: 'neg' }],
      numeralRich(inflectQuantifier(q, object)),
      formRich(inflectNoun(noun, { pos: 'noun', number: 'sg', case: 'acc' })),
    ]),
    ro: typeof word === 'string' ? plain(`nu vreau ${word} ${roBareNoun(noun, 'sg', 'acc')}`) : dim(NOT_YET_ADDED),
    en: plain(`I don't want ${q.en.negated} ${noun.en.sg}`),
  };
}

function quantifierFull(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => {
      const s: SlotOf<'quantifier'> = { ...here, gender: g, case: c, use: 'determiner' };
      return {
        label: `${GENDER_ROW[g]} ${caseName(c)}`,
        el: numeralRich(inflectQuantifier(q, s)),
        ro: roRich(q, s, g),
        en: plain(enQuantifier(q, s)),
        hl: { el: g === noun.gender && c === here.case, ro: g === noun.ro.gender && c === here.case, en: false },
      };
    }),
  );
}

function controls(q: GreekQuantifier, slot: SlotOf<'quantifier'>, state: PanelState, level: Level): Control[] {
  const list: Control[] = [nounControl('Noun it goes with', state), caseControl(slot, level)];
  if (q.numbers.length > 1) {
    list.push({ key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' });
  }
  if (offeredDegrees(q).length > 1) {
    list.push({ key: 'degree', label: 'Degree', options: degreeOptions(level), value: slot.degree });
  }
  if (offeredSenses(q).length > 1) {
    list.push({ key: 'sense', label: 'Romanian counterpart', options: senseOptions, value: slot.sense ?? 'some' });
  }
  return list;
}

function improverLabel(q: GreekQuantifier): string {
  const how = q.greek.plain;
  if ('stem' in how) return 'quantifier · declines like an adjective';
  if (how.table === 'kanenas') return 'quantifier · declines like the numeral ένας';
  if (how.table === 'polys') return 'quantifier · two stems (πολύ-, πολλ-)';
  return 'quantifier · singular only';
}

export function quantifierPanel(q: GreekQuantifier, slot: SlotOf<'quantifier'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const here: SlotOf<'quantifier'> = { ...slot, gender: noun.gender };
  const det: SlotOf<'quantifier'> = { ...here, use: 'determiner' };
  const pro: SlotOf<'quantifier'> = { ...here, use: 'pronoun' };

  const forms = GENDERS.map((gender) =>
    richText(
      numeralRich(
        inflectQuantifier(q, { ...here, gender, number: q.numbers[0], case: 'nom', degree: 'plain', use: 'determiner' }),
      ),
    ),
  );

  const withNoun: PanelRow = {
    label: 'with a noun',
    el: joinRich([
      numeralRich(inflectQuantifier(q, det)),
      formRich(inflectNoun(noun, { pos: 'noun', number: det.number, case: det.case })),
    ]),
    ro: roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case)),
    en: enWithNoun(q, det, noun),
  };
  const alone: PanelRow =
    slot.case === 'gen'
      ? {
          label: 'on its own',
          el: plain('—'),
          ro: plain('—'),
          en: plain('—'),
          dimmed: 'On its own, the possessor form is not covered in this prototype.',
        }
      : {
          label: 'on its own',
          el: numeralRich(inflectQuantifier(q, pro)),
          ro: roRich(q, pro, noun.ro.gender),
          en: plain(enQuantifier(q, pro)),
        };
  const negation = negationRow(q, here, noun);

  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel:
      level === 'beginner'
        ? `quantifier: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined })}`
        : improverLabel(q),
    badge: q.numbers.length > 1 ? (slot.number === 'sg' ? 'mass reading' : 'count reading') : undefined,
    controls: controls(q, slot, state, level),
    rows: [withNoun, alone, ...(negation ? [negation] : [])],
    full: level === 'improver' ? quantifierFull(q, here, noun) : [],
    plain:
      q.meaning +
      (q.numbers.length > 1
        ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
        : ''),
    irregular: inflectQuantifier(q, det).irregular?.plain ?? '',
    note: noun.note,
  };
}
```

- [ ] **Step 5: Wire it in**

In `src/panels/panels.ts`:

a) Add `GreekQuantifier` and `QuantifierDegree` to the type imports, and `import { quantifierPanel } from './quantifier';`.

b) Replace the interim case in `buildPanel`

```ts
    case 'quantifier':
      // The quantifier panel arrives in Task 4; no phrase uses a quantifier before then.
      throw new Error('no quantifier panel yet');
```

with:

```ts
    case 'quantifier':
      return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
```

c) In `applyControl`, replace the `noun` branch condition `if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral') {` with

```ts
      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral' || slot.pos === 'quantifier') {
```

and add these cases to the switch, before `case 'noun'`:

```ts
    case 'kind':
      if (slot.pos === 'quantifier') return { ...state, slot: { ...slot, number: value === 'mass' ? 'sg' : 'pl' } };
      break;
    case 'degree':
      if (slot.pos === 'quantifier') return { ...state, slot: { ...slot, degree: value as QuantifierDegree } };
      break;
    case 'sense':
      if (slot.pos === 'quantifier') {
        const next = { ...slot };
        if (value === 'few') next.sense = 'few';
        else delete next.sense;
        return { ...state, slot: next };
      }
      break;
```

In `src/components/WordPanel.tsx` replace `<p className="pos-label">{panel.posLabel}</p>` with:

```tsx
      <p className="pos-label">
        {panel.posLabel}
        {panel.badge && <span className="badge">{panel.badge}</span>}
      </p>
```

In `src/styles.css` append:

```css
.badge { font-size: 11px; padding: 0 8px; margin-left: 8px; border-radius: 99px; background: var(--accent-bg); color: var(--accent-text); }
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (191):` (unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/panels/quantifier.ts src/panels/panels.ts src/panels/types.ts src/engine/labels.ts src/components/WordPanel.tsx src/styles.css src/panels/quantifier.test.ts src/components/WordPanel.test.tsx
git commit -m "feat: the quantifier panel with kind, degree and sense controls

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 5: Phrases 7, 8, 9, 10, 20 and 21, and the quantifier notes

**Files:**

- Modify: `src/data/phrases.ts`, `src/data/divergences.ts`
- Test: `src/data/phrases-quantifiers.test.ts`, `src/data/phrases-verbs.test.ts`, `src/components/PhrasePicker.test.tsx`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 4; Plan 4's phrase helpers (`vslot`, `u`, `seg`, `p`, `rows`) and `verbSlot`.
- Produces:
  - Phrases `want-a-little-water` (7), `want-some-coffees` (8), `dont-want-any-coffee` (9), `want-more-water` (10), `eat-less-bread` (20) and `used-to-eat-bread` (21); `PHRASES` has 31 entries in the spec order.
  - Nine notes with `appliesTo.pos: 'quantifier'`: `quantifier-plural-indefinite`, `quantifier-quantity-vs-sense`, `quantifier-some-vs-any`, `quantifier-negative-concord`, `quantifier-determiner-vs-pronoun`, `quantifier-count-vs-mass-polys`, `quantifier-comparative-polys`, `quantifier-count-vs-mass-ligos`, `quantifier-comparative-ligos` (in this order in `DIVERGENCES`).

- [ ] **Step 1: Write the failing tests**

In `src/data/phrases-verbs.test.ts` replace the whole test `it('the picker lists all 25 phrases in the spec order', …)` with:

```ts
  it('the picker lists all 31 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee', 'want-more-water',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread',
      'eat-less-bread', 'used-to-eat-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'would-have-eaten-the-bread', 'want-not-to-go',
    ]);
  });
```

In `src/components/PhrasePicker.test.tsx` the *Ordering* group now has four more phrases. Replace the expected list in `groups the phrases by theme` (the one with `'Ordering a hot coffee'`) with:

```ts
    expect(within(ordering).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Ordering a hot coffee',
      'Ordering three coffees',
      'I want a little water',
      'I want some coffees',
      "I don't want any coffee",
      'I want more water',
      "I'd like a coffee",
      'I would like a coffee',
    ]);
```

Create `src/data/phrases-quantifiers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { buildPanel, initialState } from '../panels/panels';
import { richText } from '../engine/segments';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES } from './lexemes';
import { PHRASES } from './phrases';

const IDS = [
  'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee',
  'want-more-water', 'eat-less-bread', 'used-to-eat-bread',
];
const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with quantifiers (7, 8, 9, 10, 20, 21)', () => {
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
    ['want-a-little-water', ['Θέλω', 'λίγο', 'νερό']],
    ['want-some-coffees', ['Θέλω', 'μερικούς', 'καφέδες']],
    ['dont-want-any-coffee', ['Δεν θέλω', 'κανέναν', 'καφέ']],
    ['want-more-water', ['Θέλω', 'περισσότερο', 'νερό']],
    ['eat-less-bread', ['Θα τρώω', 'λιγότερο', 'ψωμί']],
    ['used-to-eat-bread', ['Έτρωγα', 'πολύ', 'ψωμί']],
  ])('%s has the tokens %j', (id, texts) => {
    expect(byId(id).tokens.map((t) => t.text)).toEqual(texts);
  });

  it('every quantifier token opens a panel whose first row is the quantifier and its noun', () => {
    for (const id of IDS) {
      const phrase = byId(id);
      const index = phrase.tokens.findIndex((t) => t.slot.pos === 'quantifier');
      const token = phrase.tokens[index];
      const noun = phrase.tokens[token.agreesWith as number];
      const panel = buildPanel(initialState(token, phrase), token, 'beginner');
      expect(richText(panel.rows[0].el)).toBe(`${token.text} ${noun.text}`);
    }
  });

  it('phrase 9 negates the verb and uses κανένας in the object role', () => {
    const phrase = byId('dont-want-any-coffee');
    expect(phrase.tokens[0].slot).toMatchObject({ polarity: 'negative' });
    expect(phrase.tokens[1].slot).toMatchObject({ pos: 'quantifier', case: 'acc', number: 'sg', use: 'determiner' });
  });

  it('the comparatives and the senses are on the slot', () => {
    expect(byId('want-more-water').tokens[1].slot).toMatchObject({ degree: 'comparative' });
    expect(byId('eat-less-bread').tokens[1].slot).toMatchObject({ degree: 'comparative' });
    expect(byId('want-some-coffees').tokens[1].slot).not.toHaveProperty('sense');
  });

  it('phrase 20 is the continuous future: θα + the present form', () => {
    expect(byId('eat-less-bread').tokens[0].slot).toMatchObject({ mood: 'indicative', tense: 'future' });
  });
});

describe('the quantifier notes', () => {
  const ids = (lexeme: string, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'quantifier', lexeme, level).map((d) => d.id);

  it('μερικοί', () => {
    expect(ids('merikoi', 'improver')).toEqual([
      'quantifier-plural-indefinite', 'quantifier-quantity-vs-sense', 'quantifier-determiner-vs-pronoun',
    ]);
    expect(ids('merikoi', 'beginner')).toEqual(['quantifier-plural-indefinite', 'quantifier-determiner-vs-pronoun']);
  });
  it('κάποιος and κανένας', () => {
    expect(ids('kapoios', 'improver')).toEqual(['quantifier-some-vs-any', 'quantifier-determiner-vs-pronoun']);
    expect(ids('kanenas', 'improver')).toEqual(['quantifier-negative-concord', 'quantifier-determiner-vs-pronoun']);
  });
  it('πολύς and λίγος', () => {
    expect(ids('polys', 'improver')).toEqual([
      'quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-polys', 'quantifier-comparative-polys',
    ]);
    expect(ids('ligos', 'improver')).toEqual([
      'quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-ligos', 'quantifier-comparative-ligos',
    ]);
    expect(ids('ligos', 'beginner')).toEqual(['quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-ligos']);
  });
  it('start unverified', () => {
    for (const d of DIVERGENCES.filter((row) => row.id.startsWith('quantifier-'))) expect(d.verified).toBe(false);
  });
});
```

Append to `src/App.test.tsx`, inside the `describe('App', …)` block before its closing `});`:

```tsx
  it('opens a quantifier, shows a pending Romanian form as "not yet added" and switches the degree', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I want a little water');
    await user.click(screen.getByRole('button', { name: 'λίγο' }));
    expect(screen.getByRole('heading', { level: 2, name: 'λίγος / λίγη / λίγο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'λίγο νερό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'puțină apă' })).toBeInTheDocument();
    expect(screen.getByText('mass reading')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getAllByRole('cell', { name: 'not yet added' }).length).toBeGreaterThan(0);
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'acc');
    await user.selectOptions(screen.getByLabelText('Degree'), 'comparative');
    expect(screen.getByRole('cell', { name: 'λιγότερο νερό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'mai puțină apă' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(screen.getByRole('cell', { name: 'λίγο νερό' })).toBeInTheDocument();
  });

  it('κανένας shows the negative concord in its own row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I don't want any coffee");
    await user.click(screen.getByRole('button', { name: 'κανέναν' }));
    expect(screen.getByRole('cell', { name: 'κανέναν καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'δεν θέλω κανέναν καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'nu vreau nicio cafea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "I don't want any coffee" })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-quantifiers.test.ts src/data/phrases-verbs.test.ts src/App.test.tsx`
Expected: FAIL (the new phrase ids are missing).

- [ ] **Step 3: The phrases**

In `src/data/phrases.ts` extend the type import to `import type { Case, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, Slot, SlotOf, Tense, Token, Voice } from '../types';` (add `Case`, `Gender` and `SlotOf` if they are not there yet), and after the `vslot` helper add:

```ts
/** A quantifier slot (beside a noun); `patch` sets the degree or the sense. */
const qslot = (gender: Gender, number: Num, c: Case, patch: Partial<SlotOf<'quantifier'>> = {}): Slot => ({
  pos: 'quantifier',
  gender,
  number,
  case: c,
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
```

Add the six phrases after `sleeping` (7 to 10) and after `ateTheBread` (20, 21) in the file, and place them in the `PHRASES` array in the spec order (the test above gives it):

```ts
const wantALittleWater: Phrase = {
  id: 'want-a-little-water',
  title: 'I want a little water',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'λίγο', lexeme: 'ligos', slot: qslot('n', 'sg', 'acc'), agreesWith: 2 },
    { text: 'νερό', lexeme: 'nero', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('a little', 1), u('water', 2)],
    [u('(I)', null), u('want', 0), u('little', 1), u('water', 2)],
    [u('Vreau', 0), u('puțină', 1), u('apă', 2)],
    [u('(Eu)', null), u('vreau', 0), u('puțină', 1), u('apă', 2)],
  ),
  verified: false,
};

const wantSomeCoffees: Phrase = {
  id: 'want-some-coffees',
  title: 'I want some coffees',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'μερικούς', lexeme: 'merikoi', slot: qslot('m', 'pl', 'acc'), agreesWith: 2 },
    { text: 'καφέδες', lexeme: 'kafes', slot: { pos: 'noun', number: 'pl', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('some', 1), u('coffees', 2)],
    [u('(I)', null), u('want', 0), u('some', 1), u('coffees', 2)],
    [u('Vreau', 0), u('niște', 1), u('cafele', 2)],
    [u('(Eu)', null), u('vreau', 0), u('niște', 1), u('cafele', 2)],
  ),
  verified: false,
};

const dontWantAnyCoffee: Phrase = {
  id: 'dont-want-any-coffee',
  title: "I don't want any coffee",
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Δεν θέλω', lexeme: 'thelo', slot: { ...vslot('indicative', 'present'), polarity: 'negative' } as Slot },
    { text: 'κανέναν', lexeme: 'kanenas', slot: qslot('m', 'sg', 'acc'), agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("I don't", p(0, 0)), u('want', p(0, 1)), u('any', 1), u('coffee', 2)],
    [u('(I)', null), u('not', p(0, 0)), u('want', p(0, 1)), u('no-[acc]', 1), u('coffee', 2)],
    [u('Nu', p(0, 0)), u('vreau', p(0, 1)), u('nicio', 1), u('cafea', 2)],
    [u('(Eu)', null), u('nu', p(0, 0)), u('vreau', p(0, 1)), u('nicio', 1), u('cafea', 2)],
  ),
  verified: false,
};

const wantMoreWater: Phrase = {
  id: 'want-more-water',
  title: 'I want more water',
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'περισσότερο', lexeme: 'polys', slot: qslot('n', 'sg', 'acc', { degree: 'comparative' }), agreesWith: 2 },
    { text: 'νερό', lexeme: 'nero', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('more', 1), u('water', 2)],
    [u('(I)', null), u('want', 0), u('more', 1), u('water', 2)],
    [u('Vreau', 0), u('mai multă', 1), u('apă', 2)],
    [u('(Eu)', null), u('vreau', 0), u('mai multă', 1), u('apă', 2)],
  ),
  verified: false,
};

const eatLessBread: Phrase = {
  id: 'eat-less-bread',
  title: 'I will eat less bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Θα τρώω', lexeme: 'troo', slot: vslot('indicative', 'future') },
    { text: 'λιγότερο', lexeme: 'ligos', slot: qslot('n', 'sg', 'acc', { degree: 'comparative' }), agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I will', p(0, 0)), u('eat', p(0, 1)), u('less', 1), u('bread', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('eat', p(0, 1)), u('less', 1), u('bread', 2)],
    [u('Voi', p(0, 0)), u('mânca', p(0, 1)), u('mai puțină', 1), u('pâine', 2)],
    [u('(Eu)', null), u('voi', p(0, 0)), u('mânca', p(0, 1)), u('mai puțină', 1), u('pâine', 2)],
  ),
  verified: false,
};

const usedToEatBread: Phrase = {
  id: 'used-to-eat-bread',
  title: 'I used to eat a lot of bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Έτρωγα', lexeme: 'troo', slot: vslot('indicative', 'imperfect') },
    { text: 'πολύ', lexeme: 'polys', slot: qslot('n', 'sg', 'acc'), agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I used to eat', 0), u('a lot of', 1), u('bread', 2)],
    [u('(I)', null), u('was eating', 0), u('much', 1), u('bread', 2)],
    [u('Mâncam', 0), u('multă', 1), u('pâine', 2)],
    [u('(Eu)', null), u('mâncam', 0), u('multă', 1), u('pâine', 2)],
  ),
  verified: false,
};
```

In the `PHRASES` array add `wantALittleWater, wantSomeCoffees, dontWantAnyCoffee, wantMoreWater,` after `sleeping,` and `eatLessBread, usedToEatBread,` after `ateTheBread,`.

- [ ] **Step 4: The notes**

Append to `DIVERGENCES` in `src/data/divergences.ts`, before the closing `];`:

```ts
  {
    id: 'quantifier-plural-indefinite',
    appliesTo: { pos: 'quantifier', lexeme: 'merikoi' },
    point: 'Plural "a / an"',
    el: 'no plural indefinite article: μερικοί (some)',
    ro: 'niște (some), câțiva (a few)',
    en: 'some, or nothing: "coffees"',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-quantity-vs-sense',
    appliesTo: { pos: 'quantifier', lexeme: 'merikoi' },
    point: 'One word, two meanings',
    el: 'μερικοί covers both "some" and "a few"',
    ro: 'two words: niște (some) and câțiva (a few); choose with the Romanian counterpart control',
    en: 'some, a few, several',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'quantifier-some-vs-any',
    appliesTo: { pos: 'quantifier', lexeme: 'kapoios' },
    point: 'Some and any',
    el: 'κάποιος covers both',
    ro: 'vreun / vreo covers both',
    en: 'two words: some in statements, any in questions',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-negative-concord',
    appliesTo: { pos: 'quantifier', lexeme: 'kanenas' },
    point: 'Negation',
    el: 'δεν … κανένας: the verb must be negative too',
    ro: 'nu … niciun: the verb must be negative too',
    en: 'only one negative: "don\'t … any", or "no" with a positive verb',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-determiner-vs-pronoun',
    appliesTo: { pos: 'quantifier' },
    point: 'Beside a noun, or on its own',
    el: 'one form for both: κάποιος καφές, κάποιος',
    ro: 'two forms: vreun / vreunul, niciun / niciunul',
    en: 'two words: any / anyone, no / none',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-count-vs-mass-polys',
    appliesTo: { pos: 'quantifier', lexeme: 'polys' },
    point: 'Much and many',
    el: 'one word: πολύ ψωμί (mass), πολλά ψωμιά (count)',
    ro: 'mult / multă (mass), mulți / multe (count)',
    en: 'much (mass), many (count)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-comparative-polys',
    appliesTo: { pos: 'quantifier', lexeme: 'polys' },
    point: 'More',
    el: 'one word: περισσότερος',
    ro: 'mai + the word: mai multă',
    en: 'more',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'quantifier-count-vs-mass-ligos',
    appliesTo: { pos: 'quantifier', lexeme: 'ligos' },
    point: 'Little and few',
    el: 'one word: λίγο νερό (mass), λίγα ψωμιά (count)',
    ro: 'puțin / puțină (mass), puțini / puține (count)',
    en: 'little (mass), few (count)',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'quantifier-comparative-ligos',
    appliesTo: { pos: 'quantifier', lexeme: 'ligos' },
    point: 'Less',
    el: 'one word: λιγότερος',
    ro: 'mai + the word: mai puțină',
    en: 'less (mass), fewer (count)',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
```

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.` with no Warnings block; `Pending (6)`; `Unverified (206):` (191 + 6 phrases + 9 notes).

- [ ] **Step 6: Commit**

```bash
git add src/data/phrases.ts src/data/divergences.ts src/data/phrases-quantifiers.test.ts src/data/phrases-verbs.test.ts src/components/PhrasePicker.test.tsx src/App.test.tsx
git commit -m "feat: phrases 7, 8, 9, 10, 20 and 21 and the quantifier notes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: The conjunction αν and phrase 30

**Files:**

- Create: `src/panels/conjunction.ts`
- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/engine/greek.ts`, `src/validate/validate.ts`, `src/panels/panels.ts`, `src/data/phrases.ts`, `src/data/divergences.ts`
- Test: `src/panels/conjunction.test.ts`, `src/data/phrases-verbs.test.ts`

**Interfaces:**

- Consumes: Task 5.
- Produces:
  - `GreekConjunction` (`pos: 'conjunction'`, `ro`, `en`, `meaning`, `example`), the slot `{ pos: 'conjunction' }`, the lexeme `an` (αν / *dacă* / if), `inflectConjunction`, the validator checks, `conjunctionPanel(conj, level)`.
  - Phrase `if-i-had-bread` (30), after `would-like-a-coffee`; `PHRASES` has 32 entries.
  - The note `if-clause` (`appliesTo: { pos: 'conjunction' }`).

- [ ] **Step 1: Write the failing tests**

Create `src/panels/conjunction.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import { buildPanel } from './panels';

const slot = { pos: 'conjunction' } as const;
const panel = (level: 'beginner' | 'improver' = 'beginner') =>
  buildPanel({ slot, noun: null, nounNumber: 'sg' }, { text: 'Αν', lexeme: 'an', slot }, level);

describe('conjunction panel (αν)', () => {
  it('shows one row with the if-clause in the three languages', () => {
    const p = panel();
    expect(p.lemma).toBe('αν');
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].label).toBe('if-clause');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'αν είχα ψωμί',
      'dacă aș avea pâine',
      'if I had bread',
    ]);
  });

  it('has no controls and no table, and names the construction', () => {
    const p = panel('improver');
    expect(p.controls).toEqual([]);
    expect(p.full).toEqual([]);
    expect(p.plain).toContain('αν');
    expect(p.plain).toContain('dacă');
    expect(p.posLabel).toBe('conjunction');
    expect(panel('beginner').posLabel).toBe('little word: if');
  });
});
```

In `src/data/phrases-verbs.test.ts` add `import type { SlotOf } from '../types';` to the imports, and replace the whole test `it('the picker lists all 31 phrases in the spec order', …)` with:

```ts
  it('the picker lists all 32 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee', 'want-more-water',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread',
      'eat-less-bread', 'used-to-eat-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'if-i-had-bread', 'would-have-eaten-the-bread', 'want-not-to-go',
    ]);
  });
```

Then append to the end of the file:

```ts
describe('phrase 30: the if-clause', () => {
  const phrase = byId('if-i-had-bread');
  it('has an αν token, είχα, the noun and the conditional', () => {
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Αν', 'είχα', 'ψωμί,', 'θα έτρωγα']);
    expect(phrase.tokens[0].slot).toEqual({ pos: 'conjunction' });
    expect(phrase.tokens[1]).toMatchObject({ lexeme: 'echo', slot: { mood: 'indicative', tense: 'imperfect' } });
    expect(phrase.tokens[3].slot).toMatchObject({ mood: 'conditional', tense: 'imperfect' });
  });
  it('validates, starts unverified and is in the Eating theme', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(phrase.verified).toBe(false);
    expect(phrase.theme).toBe('Eating');
  });
  it('θα έτρωγα is a two-piece group, and the glosses link to its pieces', () => {
    expect(compose(getVerb('troo'), phrase.tokens[3].slot as SlotOf<'verb'>).pieces).toHaveLength(2);
    const links = phrase.glosses.flatMap((g) => g.units.flatMap((unit) => linksOf(unit)));
    expect(links).toContainEqual({ token: 3, piece: 0 });
    expect(links).toContainEqual({ token: 3, piece: 1 });
  });
});
```

(The file already imports `compose`, `linksOf`, `validate`, `warnings`, `LEXEMES`, `getVerb` and `PHRASES`, and defines `byId`.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/conjunction.test.ts src/data/phrases-verbs.test.ts`
Expected: FAIL (`unknown lexeme: an`).

- [ ] **Step 3: The types**

In `src/types.ts`: add `| { pos: 'conjunction' }` to the `Slot` union (after `| { pos: 'particle' }`); add after `GreekParticle`:

```ts
export interface GreekConjunction extends LexemeBase {
  pos: 'conjunction';
  ro: string;
  en: string;
  /** One line of meaning for the panel. */
  meaning: string;
  example: { el: string; ro: string; en: string };
}
```

and add `| GreekConjunction` to `GreekLexeme`.

- [ ] **Step 4: The lexeme, the engine and the validator**

In `src/data/lexemes.ts` add `GreekConjunction` to the type imports, and after the `min` particle add:

```ts
const an: GreekConjunction = {
  id: 'an',
  pos: 'conjunction',
  lemma: 'αν',
  verified: { el: false, ro: false, en: false },
  ro: 'dacă',
  en: 'if',
  meaning:
    'Starts a condition. With a past tense it says "if … were": Greek αν + the imperfect, Romanian dacă + the conditional, English if + the past.',
  example: { el: 'αν είχα ψωμί', ro: 'dacă aș avea pâine', en: 'if I had bread' },
};
```

Register `[an.id]: an,` in `LEXEMES`.

In `src/engine/greek.ts` add `GreekConjunction` to the type imports and, after `inflectParticle`:

```ts
export function inflectConjunction(l: GreekConjunction, _s: SlotOf<'conjunction'>): Form {
  return { stem: l.lemma, ending: '' };
}
```

and in `inflect` add before the `'quantifier'` case:

```ts
    case 'conjunction':
      return inflectConjunction(l, s as SlotOf<'conjunction'>);
```

In `src/validate/validate.ts` add to `slotsFor`:

```ts
    case 'conjunction':
      return [{ pos: 'conjunction' }];
```

and in `checkLexeme`, after the `particle` block:

```ts
  if (l.pos === 'conjunction') {
    if (isEmpty(l.ro) || isEmpty(l.en) || isEmpty(l.example.el)) errors.push(`lexeme ${l.id}: empty Romanian, English or example`);
  }
```

- [ ] **Step 5: The panel**

Create `src/panels/conjunction.ts`:

```ts
import { plain } from '../engine/segments';
import type { GreekConjunction, Level } from '../types';
import type { Panel } from './types';

/** αν: one row, the if-clause in each language (spec 5.3). */
export function conjunctionPanel(conj: GreekConjunction, level: Level): Panel {
  return {
    lemma: conj.lemma,
    posLabel: level === 'beginner' ? 'little word: if' : 'conjunction',
    controls: [],
    rows: [
      {
        label: 'if-clause',
        el: plain(conj.example.el),
        ro: plain(conj.example.ro),
        en: plain(conj.example.en),
      },
    ],
    full: [],
    plain: conj.meaning,
    irregular: '',
    note: '',
  };
}
```

In `src/panels/panels.ts` add `GreekConjunction` to the type imports and `import { conjunctionPanel } from './conjunction';`, add this case to `buildPanel` (before `'quantifier'`):

```ts
    case 'conjunction':
      return conjunctionPanel(lexeme as GreekConjunction, level);
```

and in `applyControl` change the `case` branch guard

```ts
      if (slot.pos !== 'verb' && slot.pos !== 'preposition' && slot.pos !== 'particle') return { ...state, slot: { ...slot, case: value as Case } };
```

to

```ts
      if (slot.pos !== 'verb' && slot.pos !== 'preposition' && slot.pos !== 'particle' && slot.pos !== 'conjunction') {
        return { ...state, slot: { ...slot, case: value as Case } };
      }
```

- [ ] **Step 6: Phrase 30 and the note**

In `src/data/phrases.ts` add after `wouldLikeACoffee`:

```ts
const ifIHadBread: Phrase = {
  id: 'if-i-had-bread',
  title: 'If I had bread, I would eat',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Αν', lexeme: 'an', slot: { pos: 'conjunction' } },
    { text: 'είχα', lexeme: 'echo', slot: vslot('indicative', 'imperfect') },
    { text: 'ψωμί,', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
    { text: 'θα έτρωγα', lexeme: 'troo', slot: vslot('conditional', 'imperfect') },
  ],
  glosses: rows(
    [u('If', 0), u('I had', 1), u('bread,', 2), u('I would', p(3, 0)), u('eat', p(3, 1))],
    [u('if', 0), u('(I)', null), u('had', 1), u('bread', 2), u('(I)', null), u('will', p(3, 0)), u('ate', p(3, 1))],
    [u('Dacă', 0), u('aș avea', 1), u('pâine,', 2), u('aș', p(3, 0)), u('mânca', p(3, 1))],
    [u('dacă', 0), u('(eu)', null), u('aveam', 1), u('pâine', 2), u('(eu)', null), u('aș', p(3, 0)), u('mânca', p(3, 1))],
  ),
  verified: false,
};
```

and `ifIHadBread,` in `PHRASES` after `wouldLikeACoffee,`.

In `src/data/divergences.ts` append:

```ts
  {
    id: 'if-clause',
    appliesTo: { pos: 'conjunction' },
    point: 'If-clause',
    el: 'αν + the imperfect: Αν είχα ψωμί',
    ro: 'dacă + the conditional: Dacă aș avea pâine',
    en: 'if + the past: If I had bread',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

- [ ] **Step 7: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.` with no Warnings block; `Unverified (211):` (206 + 3 for the lexeme + 1 phrase + 1 note).

- [ ] **Step 8: Commit**

```bash
git add src/types.ts src/data/lexemes.ts src/engine/greek.ts src/validate/validate.ts src/panels/conjunction.ts src/panels/panels.ts src/data/phrases.ts src/data/divergences.ts src/panels/conjunction.test.ts src/data/phrases-verbs.test.ts
git commit -m "feat: the conjunction αν and phrase 30

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The passive participle

**Files:**

- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/reading.ts`, `src/validate/validate.ts`, `src/panels/adjective.ts`
- Test: `src/engine/participle.test.ts`

**Interfaces:**

- Consumes: Tasks 1 to 6; `inflectAdjective`, `roAdjective`, `nounPhrase`, `ReadingView`.
- Produces:
  - `VerbStems.participle?: string` (πλένω: `πλυ`); `GreekAdjective.derivedFrom?: { verb: string; stem: string }`.
  - The verb `psino` (ψήνω, present indicative only, Romanian *a coace*, English *bake*, participle stem `ψη`) and the adjectives `plymenos` (πλυμένος, *spălat*, washed) and `psimenos` (ψημένος, *copt*, baked), class `adj-unstressed`, stem = participle stem + `μέν`.
  - `participleReading(adj, slot, noun): ReadingLine` in `reading.ts`: the Greek "how to read" line of a derived adjective (spec 5.5, "Πλυμένο").
  - The adjective panel of a derived adjective: a "describing word … (from πλένω)" label and a `reading` block.
  - A validator check that ties a derived adjective to its verb's participle stem.
  - A `ReviewItem` `glossary:participle-reading`.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/participle.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES, getAdjective, getNoun, getVerb } from '../data/lexemes';
import { buildPanel } from '../panels/panels';
import type { Case, Gender, GreekAdjective, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflectAdjective } from './greek';
import { participleReading } from './reading';
import { roAdjective, roVerb } from './romanian';
import { formText, richText } from './segments';

const adjSlot = (gender: Gender, number: Num, c: Case): SlotOf<'adjective'> => ({ pos: 'adjective', gender, number, case: c });
const greek = (id: string, s: SlotOf<'adjective'>) => formText(inflectAdjective(getAdjective(id), s));

describe('the participle stems', () => {
  it('πλένω and ψήνω store the participle stem', () => {
    expect(getVerb('pleno').voices.active?.stems.participle).toBe('πλυ');
    expect(getVerb('psino').voices.active?.stems.participle).toBe('ψη');
  });
  it('ψήνω is a regular -ω verb that offers the present', () => {
    const slot = (person: 1 | 2 | 3): SlotOf<'verb'> => ({ pos: 'verb', person, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' });
    expect([1, 2, 3].map((p) => compose(getVerb('psino'), slot(p as 1 | 2 | 3)).text)).toEqual(['ψήνω', 'ψήνεις', 'ψήνει']);
    expect(roVerb(getVerb('psino'), slot(1))).toBe('coc');
    expect(enVerbText(getVerb('psino'), slot(3), 'he/she')).toBe('he/she bakes');
  });
});

describe('πλυμένος and ψημένος', () => {
  it.each([
    ['plymenos', 'm', 'sg', 'nom', 'πλυμένος'], ['plymenos', 'f', 'sg', 'nom', 'πλυμένη'], ['plymenos', 'n', 'sg', 'nom', 'πλυμένο'],
    ['plymenos', 'm', 'sg', 'acc', 'πλυμένο'], ['plymenos', 'm', 'sg', 'gen', 'πλυμένου'], ['plymenos', 'f', 'sg', 'gen', 'πλυμένης'],
    ['plymenos', 'm', 'pl', 'nom', 'πλυμένοι'], ['plymenos', 'n', 'pl', 'nom', 'πλυμένα'], ['plymenos', 'f', 'pl', 'acc', 'πλυμένες'],
    ['psimenos', 'm', 'sg', 'nom', 'ψημένος'], ['psimenos', 'f', 'sg', 'nom', 'ψημένη'], ['psimenos', 'n', 'sg', 'nom', 'ψημένο'],
    ['psimenos', 'n', 'pl', 'acc', 'ψημένα'],
  ] as const)('%s %s %s %s -> %s', (id, g, n, c, expected) => {
    expect(greek(id, adjSlot(g, n, c))).toBe(expected);
  });

  it('the Romanian participle agrees in gender and number', () => {
    const spalat = getAdjective('plymenos');
    expect(roAdjective(spalat, 'm', 'sg', 'nom')).toBe('spălat');
    expect(roAdjective(spalat, 'f', 'sg', 'nom')).toBe('spălată');
    expect(roAdjective(spalat, 'm', 'pl', 'nom')).toBe('spălați');
    expect(roAdjective(spalat, 'f', 'pl', 'nom')).toBe('spălate');
    expect(roAdjective(spalat, 'f', 'sg', 'gen')).toBe('spălate');
    const copt = getAdjective('psimenos');
    expect(roAdjective(copt, 'm', 'sg', 'nom')).toBe('copt');
    expect(roAdjective(copt, 'f', 'sg', 'nom')).toBe('coaptă');
    expect(roAdjective(copt, 'm', 'pl', 'nom')).toBe('copți');
    expect(roAdjective(copt, 'f', 'pl', 'nom')).toBe('coapte');
  });

  it('is derived from its verb', () => {
    expect(getAdjective('plymenos').derivedFrom).toEqual({ verb: 'pleno', stem: 'πλυ' });
    expect(getAdjective('psimenos').derivedFrom).toEqual({ verb: 'psino', stem: 'ψη' });
  });
});

describe('the validator ties a participle to its verb', () => {
  const adj = getAdjective('plymenos');
  const check = (patch: Partial<GreekAdjective>) =>
    validate({ lexemes: { ...LEXEMES, plymenos: { ...adj, ...patch } as GreekAdjective }, phrases: [] });
  it('accepts the real data', () => {
    expect(check({})).toEqual([]);
  });
  it('refuses a stem that is not the participle stem + μέν', () => {
    expect(check({ stem: 'πλυμεν' })).toContain('lexeme plymenos: the stem πλυμεν is not πλυμέν');
  });
  it('refuses a participle stem the verb does not store', () => {
    expect(check({ derivedFrom: { verb: 'pleno', stem: 'πλυθ' }, stem: 'πλυθμέν' })).toContain(
      'lexeme plymenos: the participle stem πλυθ is not the stem πλυ that pleno stores',
    );
  });
  it('refuses an unknown verb and a class that is not stem-stressed', () => {
    expect(check({ derivedFrom: { verb: 'nope', stem: 'πλυ' } })).toContain('lexeme plymenos: derived from unknown verb "nope"');
    expect(check({ class: 'adj-stressed' })).toContain('lexeme plymenos: a participle in -μένος is stem-stressed');
  });
});

describe('the participle reading', () => {
  const paidi = getNoun('paidi');
  const psomi = getNoun('psomi');
  it('πλυμένο with το παιδί, as in spec 5.5', () => {
    const line = participleReading(getAdjective('plymenos'), adjSlot('n', 'sg', 'nom'), paidi);
    expect(line.parts).toEqual([
      { text: 'πλυ', label: 'πλυ-', role: 'stem', gloss: 'wash', piece: null },
      {
        text: 'μένο',
        label: '-μένο',
        role: 'ending',
        gloss: 'a describing word (washed) that matches το παιδί: neuter, one',
        piece: null,
      },
    ]);
    expect(line.beginner).toBe('πλυμένο: πλυ- = wash, -μένο = a describing word (washed) that matches το παιδί: neuter, one.');
    expect(line.improver).toBe('Passive participle: participle stem πλυ- + -μένος declined in the neuter nominative singular.');
  });
  it('names the gender, number and role of the form', () => {
    const line = participleReading(getAdjective('psimenos'), adjSlot('f', 'pl', 'gen'), getNoun('alepou'));
    expect(line.parts[1].gloss).toBe('a describing word (baked) that matches των αλεπούδων: feminine, many');
    expect(line.improver).toContain('feminine genitive plural');
  });
  it('is not used for an adjective that is not derived', () => {
    expect(() => participleReading(getAdjective('zestos'), adjSlot('m', 'sg', 'nom'), paidi)).toThrow(/not derived/);
  });
  it('works for ψημένο with το ψωμί', () => {
    expect(participleReading(getAdjective('psimenos'), adjSlot('n', 'sg', 'nom'), psomi).beginner).toBe(
      'ψημένο: ψη- = bake, -μένο = a describing word (baked) that matches το ψωμί: neuter, one.',
    );
  });
});

describe('the adjective panel of a participle', () => {
  const panel = (id: string, noun: string, g: Gender, level: 'beginner' | 'improver' = 'beginner') => {
    const slot = adjSlot(g, 'sg', 'nom');
    return buildPanel({ slot, noun, nounNumber: 'sg' }, { text: '', lexeme: id, slot }, level);
  };
  it('πλυμένο: the forms, the label and the reading', () => {
    const p = panel('plymenos', 'paidi', 'n');
    expect(p.lemma).toBe('πλυμένος / πλυμένη / πλυμένο');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'το πλυμένο παιδί', 'copilul spălat', 'the washed child',
    ]);
    expect(p.posLabel).toBe('describing word: washed (from πλένω)');
    expect(p.reading).toHaveLength(1);
    expect(p.reading?.[0]).toMatchObject({ lang: 'el', sentence: expect.stringContaining('πλυ- = wash') });
  });
  it('Improver: the technical label and sentence', () => {
    const p = panel('plymenos', 'paidi', 'n', 'improver');
    expect(p.posLabel).toBe('passive participle · adjective (stem-stressed)');
    expect(p.reading?.[0].sentence).toContain('Passive participle');
  });
  it('ψημένο with ψωμί shows the Romanian feminine', () => {
    const p = panel('psimenos', 'psomi', 'n');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'το ψημένο ψωμί', 'pâinea coaptă', 'the baked bread',
    ]);
  });
  it('an ordinary adjective has no reading and no derived label', () => {
    const p = panel('zestos', 'kafes', 'm');
    expect(p.reading).toBeUndefined();
    expect(p.posLabel).toBe('adjective: hot');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/participle.test.ts`
Expected: FAIL (`unknown lexeme: psino`, `participleReading is not a function`).

- [ ] **Step 3: Types and data**

In `src/types.ts`:

- In `VerbStems` add after `perfective?: string;`:

```ts
  /** The stem of the passive participle, without -μέν (πλένω: πλυ-, ψήνω: ψη-); the derived adjective joins -μένος to it. */
  participle?: string;
```

- In `GreekAdjective` add after `en: string;`:

```ts
  /** A passive participle: the verb it comes from and the participle stem it stores (πλυ-). */
  derivedFrom?: { verb: string; stem: string };
```

In `src/data/lexemes.ts`:

a) In `pleno`'s active voice stems add `participle: 'πλυ',` after `perfective: 'πλύν',` (use this context so the edit lands in πλένω's active voice only):

```ts
        aorist: { strong: { augment: 'έ', stem: 'πλυν' }, weak: { stem: 'πλύν' } },
        perfective: 'πλύν',
        participle: 'πλυ',
```

b) After the `eimai` constant add:

```ts
/** ψήνω is here for its participle (ψημένος); it offers only the present indicative. */
const psino: GreekVerb = {
  id: 'psino',
  pos: 'verb',
  lemma: 'ψήνω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'ψήνω',
      class: 'omega',
      stems: { present: 'ψήν', participle: 'ψη' },
      offers: { indicative: ['present'] },
      ro: {
        lemma: 'a coace',
        infinitive: 'coace',
        participle: 'copt',
        present: ['coc', 'coci', 'coace', 'coacem', 'coaceți', 'coc'],
        subjunctive: NO_CELLS,
        imperfect: NO_CELLS,
        pluperfect: NO_CELLS,
      },
      en: { gloss: 'bake', base: 'bake', third: 'bakes', past: 'baked', pastParticiple: 'baked', ing: 'baking' },
    },
  },
};
```

c) After the `kafeAdj` constant add:

```ts
const plymenos: GreekAdjective = {
  id: 'plymenos',
  pos: 'adjective',
  lemma: 'πλυμένος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'πλυμέν',
  derivedFrom: { verb: 'pleno', stem: 'πλυ' },
  ro: {
    lemma: 'spălat',
    forms: {
      m: { sg: 'spălat', pl: 'spălați' },
      f: { sg: 'spălată', pl: 'spălate', genSg: 'spălate' },
      n: { sg: 'spălat', pl: 'spălate' },
    },
  },
  en: 'washed',
};

const psimenos: GreekAdjective = {
  id: 'psimenos',
  pos: 'adjective',
  lemma: 'ψημένος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'ψημέν',
  derivedFrom: { verb: 'psino', stem: 'ψη' },
  ro: {
    lemma: 'copt',
    forms: {
      m: { sg: 'copt', pl: 'copți' },
      f: { sg: 'coaptă', pl: 'coapte', genSg: 'coapte' },
      n: { sg: 'copt', pl: 'coapte' },
    },
  },
  en: 'baked',
};
```

Register `[plymenos.id]: plymenos,`, `[psimenos.id]: psimenos,` (after `kafeAdj`) and `[psino.id]: psino,` (after `eimai`) in `LEXEMES`.

In `src/data/review.ts` add (after `glossary:ro-en-reading-glosses`):

```ts
  { id: 'glossary:participle-reading', kind: 'glossary', verified: false },
```

- [ ] **Step 4: The validator**

In `src/validate/validate.ts` change `function checkLexeme(l: GreekLexeme): string[] {` to `function checkLexeme(l: GreekLexeme, lexemes: Record<string, GreekLexeme>): string[] {`, change its call in `validate` to `checkLexeme(lexeme, input.lexemes)`, and inside the `if (l.pos === 'adjective') { … }` block add at the end:

```ts
    if (l.derivedFrom) {
      const from = l.derivedFrom;
      const verb = lexemes[from.verb];
      if (!verb || verb.pos !== 'verb') {
        errors.push(`lexeme ${l.id}: derived from unknown verb "${from.verb}"`);
      } else {
        const stored = verb.voices.active?.stems.participle;
        if (stored !== from.stem) {
          errors.push(`lexeme ${l.id}: the participle stem ${from.stem} is not the stem ${stored ?? '(none)'} that ${verb.id} stores`);
        }
      }
      if (l.stem !== `${from.stem}μέν`) errors.push(`lexeme ${l.id}: the stem ${l.stem} is not ${from.stem}μέν`);
      if (l.class !== 'adj-unstressed') errors.push(`lexeme ${l.id}: a participle in -μένος is stem-stressed`);
    }
```

- [ ] **Step 5: The reading**

In `src/engine/reading.ts` replace the whole import block at the top of the file (the eight `import` lines) with:

```ts
import { getVerb } from '../data/lexemes';
import { AUX_GLOSS, EN_FUNCTION, RO_SHAPES, ENDING_GLOSS, KIND_NAME, PARTICLE_GLOSS, READING_TEMPLATES, WHO_GLOSS } from '../data/readings';
import type { EnVerbForms, GreekAdjective, GreekNoun, GreekVerb, Reading, ReadingLine, ReadingPart, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { compose, type Piece } from './compose';
import { enVerb, enVerbText } from './english';
import { inflectAdjective } from './greek';
import { EN_PRONOUNS, GENDER_NAME, caseOptions, moodLabel, tenseLabel } from './labels';
import { voiceOf } from './offers';
import { roVerb } from './romanian';
import { richText } from './segments';
import { lexicalFormKind, whoIndex } from './tenses';
```

and append:

```ts
/**
 * "How to read this" for a passive participle (spec 5.5): the verb's participle stem plus -μένος, declined like a
 * stem-stressed adjective. `noun` is the noun the panel is showing it with.
 */
export function participleReading(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun): ReadingLine {
  const from = adj.derivedFrom;
  if (!from) throw new Error(`${adj.id} is not derived from a verb`);
  const gloss = voiceOf(getVerb(from.verb), 'active').en.gloss;
  const ending = `μέν${inflectAdjective(adj, slot).ending}`;
  const matches = richText(nounPhrase(noun, slot.number, slot.case, { article: 'definite' }).el);
  const parts: ReadingPart[] = [
    { text: from.stem, label: `${from.stem}-`, role: 'stem', gloss, piece: null },
    {
      text: ending,
      label: `-${ending}`,
      role: 'ending',
      gloss: `a describing word (${adj.en}) that matches ${matches}: ${GENDER_NAME[slot.gender]}, ${slot.number === 'sg' ? 'one' : 'many'}`,
      piece: null,
    },
  ];
  const listing = parts.map((p) => `${p.label} = ${p.gloss}`).join(', ');
  const role = caseOptions('improver').find((o) => o.value === slot.case)?.label ?? slot.case;
  return {
    parts,
    beginner: `${from.stem}${ending}: ${listing}.`,
    improver: `Passive participle: participle stem ${from.stem}- + -μένος declined in the ${GENDER_NAME[slot.gender]} ${role} ${slot.number === 'sg' ? 'singular' : 'plural'}.`,
  };
}
```

- [ ] **Step 6: The adjective panel**

In `src/panels/adjective.ts` add the imports `import { getVerb } from '../data/lexemes';`, `import { participleReading } from '../engine/reading';` and `ReadingView` to the `./types` import, and change the returned object of `adjectivePanel`: replace the `posLabel` line with

```ts
    posLabel: derivedLabel(adj, level),
```

and add, after the `note: noun.note,` line:

```ts
    reading: adj.derivedFrom ? [participleView(adj, slot, noun, level)] : undefined,
```

and add these helpers above `adjectivePanel`:

```ts
function derivedLabel(adj: GreekAdjective, level: Level): string {
  if (adj.derivedFrom) {
    return level === 'beginner'
      ? `describing word: ${adj.en} (from ${getVerb(adj.derivedFrom.verb).lemma})`
      : 'passive participle · adjective (stem-stressed)';
  }
  return level === 'beginner' ? `adjective: ${adj.en}` : CLASS_LABEL[adj.class];
}

function participleView(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun, level: Level): ReadingView {
  const line = participleReading(adj, slot, noun);
  return { lang: 'el', parts: line.parts, sentence: level === 'beginner' ? line.beginner : line.improver };
}
```

- [ ] **Step 7: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (221):` (211 + 9 for the three lexemes + 1 review item).

- [ ] **Step 8: Commit**

```bash
git add src/types.ts src/data/lexemes.ts src/data/review.ts src/engine/reading.ts src/validate/validate.ts src/panels/adjective.ts src/engine/participle.test.ts
git commit -m "feat: the passive participle as a derived adjective, with its reading

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Task 8: Related panels: a participle opens its verb, κανένας opens ένας

**Files:**

- Modify: `src/panels/types.ts`, `src/panels/panels.ts`, `src/panels/adjective.ts`, `src/panels/quantifier.ts`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`
- Test: `src/panels/related.test.ts`, `src/components/WordPanel.test.tsx`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Plan 4's `OpenPiece`, `pieceToOpen`, `back` and the `WordPanel` back link; Tasks 4 and 7.
- Produces:
  - `Related { text, button, backLabel, lexeme, slot, noun }` and `Panel.related?: Related` (exported from `panels.ts`).
  - A derived adjective's panel carries `related` (the verb it comes from, opened as the verb's present, first person singular); κανένας carries `related` (the numeral ένας, opened with the quantifier's gender and role and the same noun).
  - `WordPanel` props `backLabel?: string` (default "Back to the verb") and `onRelated?: (related: Related) => void`; the line and its button show only when both the panel and the handler exist.
  - `OpenPiece` gains `backLabel`; `Explorer.openRelated(related)` opens the related panel in place of the current one, working on its own copy, with the way back.

- [ ] **Step 1: Write the failing tests**

Create `src/panels/related.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Gender, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const quantifier = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner', ...patch,
});
const adjective = (gender: Gender): SlotOf<'adjective'> => ({ pos: 'adjective', gender, number: 'sg', case: 'nom' });
const panelOf = (lexeme: string, state: PanelState) => buildPanel(state, { text: '', lexeme, slot: state.slot }, 'beginner');

describe('related panels', () => {
  it('a participle points at its verb', () => {
    const p = panelOf('plymenos', { slot: adjective('n'), noun: 'paidi', nounNumber: 'sg' });
    expect(p.related).toEqual({
      text: 'Derived from πλένω (πλυ- + -μένος).',
      button: 'Open πλένω',
      backLabel: 'Back to the participle',
      lexeme: 'pleno',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
      noun: null,
    });
    expect(panelOf('psimenos', { slot: adjective('n'), noun: 'psomi', nounNumber: 'sg' }).related?.lexeme).toBe('psino');
  });

  it('an ordinary adjective points nowhere', () => {
    expect(panelOf('zestos', { slot: adjective('m'), noun: 'kafes', nounNumber: 'sg' }).related).toBeUndefined();
  });

  it('κανένας points at the numeral ένας, with the same noun, gender and role', () => {
    const state: PanelState = { slot: quantifier(), noun: 'kafes', nounNumber: 'sg' };
    expect(panelOf('kanenas', state).related).toEqual({
      text: 'κανένας follows the numeral ένας.',
      button: 'Open the numeral ένας',
      backLabel: 'Back to κανένας',
      lexeme: 'numeral',
      slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' },
      noun: 'kafes',
    });
    const genitive = applyControl(state, 'case', 'gen');
    expect(panelOf('kanenas', genitive).related?.slot).toMatchObject({ case: 'gen' });
  });

  it('the other quantifiers point nowhere', () => {
    for (const id of ['merikoi', 'kapoios', 'polys', 'ligos']) {
      const slot = quantifier(id === 'merikoi' ? { number: 'pl' } : {});
      expect(panelOf(id, { slot, noun: 'kafes', nounNumber: slot.number }).related).toBeUndefined();
    }
  });
});
```

Append to `src/components/WordPanel.test.tsx` inside the `describe('WordPanel', …)` block:

```tsx
  it('offers a related panel and names the way back', async () => {
    const user = userEvent.setup();
    const onRelated = vi.fn();
    const related = {
      text: 'Derived from πλένω.',
      button: 'Open πλένω',
      backLabel: 'Back to the participle',
      lexeme: 'pleno',
      slot: { pos: 'particle' as const },
      noun: null,
    };
    render(<WordPanel panel={{ ...panelFor(3), related }} onChange={() => {}} onRelated={onRelated} onBack={() => {}} backLabel="Back to the participle" />);
    expect(screen.getByText(/Derived from πλένω/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open πλένω' }));
    expect(onRelated).toHaveBeenCalledWith(related);
    expect(screen.getByRole('button', { name: '← Back to the participle' })).toBeInTheDocument();
  });

  it('shows no related line without a handler, and the default back label is "Back to the verb"', () => {
    const related = { text: 'Derived from πλένω.', button: 'Open πλένω', backLabel: 'x', lexeme: 'pleno', slot: { pos: 'particle' as const }, noun: null };
    render(<WordPanel panel={{ ...panelFor(3), related }} onChange={() => {}} onBack={() => {}} />);
    expect(screen.queryByText(/Derived from/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to the verb' })).toBeInTheDocument();
  });
```

(The file already imports `userEvent`, `vi`, `render` and `screen`.)

Append to `src/App.test.tsx`, inside the `describe('App', …)` block:

```tsx
  it('κανένας links to the numeral ένας and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I don't want any coffee");
    await user.click(screen.getByRole('button', { name: 'κανέναν' }));
    expect(screen.getByText('κανένας follows the numeral ένας.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open the numeral ένας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ένας / μία / ένα' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'έναν' })).toBeInTheDocument();
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to κανένας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'κανένας / καμία / κανένα' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/related.test.ts src/components/WordPanel.test.tsx src/App.test.tsx`
Expected: FAIL (`related` is undefined; no `onRelated` prop).

- [ ] **Step 3: The panel field**

In `src/panels/types.ts` add after `ReadingView`:

```ts
/** A link from a panel to another panel: the verb a participle comes from, the numeral behind κανένας (spec 5.3). */
export interface Related {
  /** The line that introduces it. */
  text: string;
  /** The button label. */
  button: string;
  /** The label of the way back: "Back to the participle". */
  backLabel: string;
  lexeme: string;
  slot: Slot;
  /** The noun the opened panel goes with, when it needs one (the numeral does). */
  noun: string | null;
}
```

and add to `Panel`, after `badge?: string;`:

```ts
  /** A link to another panel (spec 5.3). */
  related?: Related;
```

In `src/panels/panels.ts` change the re-export line to `export type { Control, Panel, PanelRow, PanelState, Related } from './types';`.

In `src/panels/adjective.ts` add `Related` to the `./types` import and, above `adjectivePanel`:

```ts
function participleRelated(adj: GreekAdjective): Related | undefined {
  if (!adj.derivedFrom) return undefined;
  const verb = getVerb(adj.derivedFrom.verb);
  return {
    text: `Derived from ${verb.lemma} (${adj.derivedFrom.stem}- + -μένος).`,
    button: `Open ${verb.lemma}`,
    backLabel: 'Back to the participle',
    lexeme: verb.id,
    slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    noun: null,
  };
}
```

and in the returned panel add `related: participleRelated(adj),` after the `reading:` line.

In `src/panels/quantifier.ts` add `Related` to the `./types` import and, above `quantifierPanel`:

```ts
/** κανένας shares its pattern with the numeral ένας (spec 5.3). */
function numeralRelated(q: GreekQuantifier, here: SlotOf<'quantifier'>, state: PanelState): Related | undefined {
  const how = q.greek.plain;
  if ('stem' in how || how.table !== 'kanenas') return undefined;
  return {
    text: `${q.lemma} follows the numeral ένας.`,
    button: 'Open the numeral ένας',
    backLabel: `Back to ${q.lemma}`,
    lexeme: 'numeral',
    slot: { pos: 'numeral', value: 1, gender: here.gender, case: here.case },
    noun: state.noun,
  };
}
```

and in the returned panel add `related: numeralRelated(q, here, state),` after the `note: noun.note,` line.

- [ ] **Step 4: The word panel**

In `src/components/WordPanel.tsx`:

a) Change the import to `import type { Panel, Related } from '../panels/panels';`.

b) Add to `Props`:

```ts
  /** The label of the way back; defaults to "Back to the verb". */
  backLabel?: string;
  /** Opens the panel's related panel (a participle's verb, ένας for κανένας). */
  onRelated?: (related: Related) => void;
```

c) Change the signature to `export function WordPanel({ panel, onChange, onBack, onPiece, backLabel = 'Back to the verb', onRelated }: Props) {`, add `const { related } = panel;` as the first line of the body, change the back link text from `← Back to the verb` to `← {backLabel}`, and insert after `<p className="plain">{panel.plain}</p>`:

```tsx
      {related && onRelated && (
        <p className="related">
          {related.text}{' '}
          <button type="button" className="back-link" onClick={() => onRelated(related)}>
            {related.button}
          </button>
        </p>
      )}
```

In `src/styles.css` append:

```css
.related { font-size: 13px; color: var(--muted); margin: 8px 0 0; }
.related .back-link { padding: 0; }
```

- [ ] **Step 5: Explorer**

In `src/Explorer.tsx`:

a) Import the type: change `import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';` to `import { applyControl, buildPanel, initialState, sameState, type PanelState, type Related } from './panels/panels';`.

b) Add `backLabel: string;` to `OpenPiece` (after `initial: PanelState;`), and make `pieceToOpen` return it: change its return to

```ts
  return {
    token: { text: pieceText(piece), lexeme: piece.lexeme, slot: piece.slot },
    state,
    initial: state,
    backLabel: 'Back to the verb',
  };
```

c) The fallback `current` (the token itself, when no piece panel is open) needs the new field too. Change

```ts
  const current: OpenPiece = open ?? { token, state: states[selected], initial: initial[selected] };
```

to:

```ts
  const current: OpenPiece = open ?? {
    token,
    state: states[selected],
    initial: initial[selected],
    backLabel: 'Back to the verb',
  };
```

d) Add inside `Explorer`, after `openFromReading`:

```ts
  /** A related panel was asked for: open it in place of this one, on its own copy, with a way back. */
  function openRelated(related: Related) {
    const state: PanelState = { slot: related.slot, noun: related.noun, nounNumber: 'sg' };
    setOpen({
      token: { text: getLexeme(related.lexeme).lemma, lexeme: related.lexeme, slot: related.slot },
      state,
      initial: state,
      backLabel: related.backLabel,
    });
    setPiece(null);
  }
```

(and import `getLexeme` with `getVerb`: `import { getLexeme, getVerb } from './data/lexemes';`).

e) Change the `<WordPanel … />` element to:

```tsx
      <WordPanel
        panel={panel}
        onChange={changeControl}
        onBack={open ? back : undefined}
        backLabel={open?.backLabel}
        onPiece={open ? undefined : openFromReading}
        onRelated={open ? undefined : openRelated}
      />
```

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`; `Unverified (221):` (unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/panels/types.ts src/panels/panels.ts src/panels/adjective.ts src/panels/quantifier.ts src/components/WordPanel.tsx src/Explorer.tsx src/styles.css src/panels/related.test.ts src/components/WordPanel.test.tsx src/App.test.tsx
git commit -m "feat: panels can link to a related panel, with a way back

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Phrases 32 and 33, and the participle notes

**Files:**

- Modify: `src/data/phrases.ts`, `src/data/divergences.ts`
- Test: `src/data/phrases-participles.test.ts`, `src/data/phrases-verbs.test.ts`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 1, 7 and 8.
- Produces:
  - Phrases `child-is-washed` (32) and `bread-is-baked` (33), after `would-have-eaten-the-bread`; `PHRASES` has 34 entries in the spec order.
  - Notes `participle-agreement` and `perfect-vs-participle` (for πλυμένος) and `participle-agreement-gender` (for ψημένος).

- [ ] **Step 1: Write the failing tests**

In `src/data/phrases-verbs.test.ts` replace the whole test `it('the picker lists all 32 phrases in the spec order', …)` with:

```ts
  it('the picker lists all 34 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee', 'want-more-water',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread',
      'eat-less-bread', 'used-to-eat-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'if-i-had-bread', 'would-have-eaten-the-bread',
      'child-is-washed', 'bread-is-baked', 'want-not-to-go',
    ]);
  });
```

Create `src/data/phrases-participles.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { richText } from '../engine/segments';
import { buildPanel, initialState } from '../panels/panels';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES } from './lexemes';
import { PHRASES } from './phrases';

const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};
const rowOf = (id: string, token: number) => {
  const phrase = byId(id);
  const row = buildPanel(initialState(phrase.tokens[token], phrase), phrase.tokens[token], 'beginner').rows[0];
  return [richText(row.el), richText(row.ro), richText(row.en)];
};

describe('phrases with the copula and a participle (32, 33)', () => {
  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('have four tokens each, start unverified and have a theme', () => {
    expect(byId('child-is-washed').tokens.map((t) => t.text)).toEqual(['Το', 'παιδί', 'είναι', 'πλυμένο']);
    expect(byId('bread-is-baked').tokens.map((t) => t.text)).toEqual(['Το', 'ψωμί', 'είναι', 'ψημένο']);
    for (const id of ['child-is-washed', 'bread-is-baked']) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it('είναι is the copula in the third person singular; the participle agrees with the noun', () => {
    for (const id of ['child-is-washed', 'bread-is-baked']) {
      const phrase = byId(id);
      expect(phrase.tokens[2]).toMatchObject({ lexeme: 'eimai', slot: { person: 3, number: 'sg', tense: 'present' } });
      expect(phrase.tokens[3]).toMatchObject({ agreesWith: 1, slot: { gender: 'n', number: 'sg', case: 'nom' } });
    }
  });

  it('the participle panel agrees in Greek and follows the Romanian noun gender', () => {
    expect(rowOf('child-is-washed', 3)).toEqual(['το πλυμένο παιδί', 'copilul spălat', 'the washed child']);
    expect(rowOf('bread-is-baked', 3)).toEqual(['το ψημένο ψωμί', 'pâinea coaptă', 'the baked bread']);
  });

  it('the copula panel reads (αυτός/ή) είναι / (el/ea) este / he/she is', () => {
    expect(rowOf('child-is-washed', 2)).toEqual(['(αυτός/ή) είναι', '(el/ea) este', 'he/she is']);
  });
});

describe('the participle notes', () => {
  const ids = (lexeme: string, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'adjective', lexeme, level).map((d) => d.id);

  it('πλυμένος shows agreement for both levels and the perfect contrast for Improver', () => {
    expect(ids('plymenos', 'beginner')).toContain('participle-agreement');
    expect(ids('plymenos', 'beginner')).not.toContain('perfect-vs-participle');
    expect(ids('plymenos', 'improver')).toContain('perfect-vs-participle');
  });
  it('ψημένος shows the gender contrast', () => {
    expect(ids('psimenos', 'beginner')).toContain('participle-agreement-gender');
  });
  it('an ordinary adjective shows none of them', () => {
    expect(ids('zestos', 'improver').filter((id) => id.startsWith('participle') || id === 'perfect-vs-participle')).toEqual([]);
  });
  it('start unverified', () => {
    for (const id of ['participle-agreement', 'perfect-vs-participle', 'participle-agreement-gender']) {
      expect(DIVERGENCES.find((d) => d.id === id)?.verified).toBe(false);
    }
  });
});
```

Append to `src/App.test.tsx` inside the `describe('App', …)` block:

```tsx
  it('a participle shows how to read it, links to its verb and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child is washed');
    await user.click(screen.getByRole('button', { name: 'πλυμένο' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλυμένος / πλυμένη / πλυμένο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'copilul spălat' })).toBeInTheDocument();
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText('πλυ-')).toBeInTheDocument();
    expect(within(reading).getByText(/a describing word \(washed\) that matches το παιδί/)).toBeInTheDocument();
    expect(screen.getByText('Derived from πλένω (πλυ- + -μένος).')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open πλένω' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλένω' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the participle' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλυμένος / πλυμένη / πλυμένο' })).toBeInTheDocument();
  });

  it('the copula opens its own panel with an irregularity message and reading', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The bread is baked');
    await user.click(screen.getByRole('button', { name: 'είναι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'είμαι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(αυτός/ή) είναι' })).toBeInTheDocument();
    expect(screen.getByText(/learn its six forms together/, { selector: '.warn' })).toBeInTheDocument();
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText(/the verb "to be" is irregular/)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-participles.test.ts src/data/phrases-verbs.test.ts src/App.test.tsx`
Expected: FAIL (the new phrase ids are missing).

- [ ] **Step 3: The phrases**

In `src/data/phrases.ts` add after `wouldHaveEaten`:

```ts
const childIsWashed: Phrase = {
  id: 'child-is-washed',
  title: 'The child is washed',
  theme: 'Daily life',
  level: 'improver',
  tokens: [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'είναι', lexeme: 'eimai', slot: vslot('indicative', 'present', 3) },
    { text: 'πλυμένο', lexeme: 'plymenos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
  ],
  glosses: rows(
    [u('The', 0), u('child', 1), u('is', 2), u('washed', 3)],
    [u('the-[nom]', 0), u('child', 1), u('is', 2), u('washed-[n]', 3)],
    [seg(['copil', 1], ['ul', 0]), u('este', 2), u('spălat', 3)],
    [seg(['copil', 1], ['ul', 0]), u('este', 2), u('spălat', 3)],
  ),
  verified: false,
};

const breadIsBaked: Phrase = {
  id: 'bread-is-baked',
  title: 'The bread is baked',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'είναι', lexeme: 'eimai', slot: vslot('indicative', 'present', 3) },
    { text: 'ψημένο', lexeme: 'psimenos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
  ],
  glosses: rows(
    [u('The', 0), u('bread', 1), u('is', 2), u('baked', 3)],
    [u('the-[nom]', 0), u('bread', 1), u('is', 2), u('baked-[n]', 3)],
    [seg(['pâine', 1], ['a', 0]), u('este', 2), u('coaptă', 3)],
    [seg(['pâine', 1], ['a', 0]), u('este', 2), u('coaptă', 3)],
  ),
  verified: false,
};
```

and in the `PHRASES` array add `childIsWashed, breadIsBaked,` after `wouldHaveEaten,`.

- [ ] **Step 4: The notes**

Append to `DIVERGENCES` in `src/data/divergences.ts`:

```ts
  {
    id: 'participle-agreement',
    appliesTo: { pos: 'adjective', lexeme: 'plymenos' },
    point: 'Agreement',
    el: 'πλυμένος, πλυμένη, πλυμένο: declines like an adjective',
    ro: 'spălat, spălată, spălați, spălate: agrees in gender and number',
    en: 'washed: never changes',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'perfect-vs-participle',
    appliesTo: { pos: 'adjective', lexeme: 'plymenos' },
    point: 'Perfect or participle',
    el: 'the perfect uses one unchanging form (έχω πλυθεί); the participle agrees and describes a state (είναι πλυμένο)',
    ro: 'am spălat (perfect) · este spălat (a state)',
    en: 'has washed (perfect) · is washed (a state)',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'participle-agreement-gender',
    appliesTo: { pos: 'adjective', lexeme: 'psimenos' },
    point: 'Gender',
    el: 'ψημένο: neuter, like το ψωμί',
    ro: 'coaptă: feminine, like pâinea',
    en: 'baked: no gender',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.` with no Warnings block; `Pending (6)`; `Unverified (226):` (221 + 2 phrases + 3 notes).

- [ ] **Step 6: Commit**

```bash
git add src/data/phrases.ts src/data/divergences.ts src/data/phrases-participles.test.ts src/data/phrases-verbs.test.ts src/App.test.tsx
git commit -m "feat: phrases 32 and 33 and the participle notes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The spec update, the validation report and the end-to-end check

**Files:**

- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`, `src/styles.css` (only if the phone-width check below needs it)

**Interfaces:**

- Consumes: everything above.
- Produces: a spec that records Plan 5's decisions and its new review items, a verified build, and the browser check.

- [ ] **Step 1: Run the full gate and read the report**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all green.

Run: `npm run validate`
Expected: `Data is valid.` with no Warnings block, `Pending (6):` and `Unverified (226):`. The count is Plan 4's 165; 11 new lexemes (νερό, είμαι, the five quantifiers, αν, ψήνω, πλυμένος, ψημένος) × 3 languages (33); 9 new phrases; 14 new notes (copula 1, quantifiers 9, if-clause 1, participles 3); 4 new review items (`ending-table:neut-o`, `ending-table:quantifier-forms`, `auxiliary-table:ro-comparative`, `glossary:participle-reading`); 1 reading template (`irregular-be`). If the real count differs, find the difference in the printed list before going on: a missing or extra line means a record was added without its flag, or twice.

Run: `npm run validate -- --release; echo "exit $?"`
Expected: `--release: 226 record(s) are not verified and 6 cell(s) are pending.` and `exit 1`.

- [ ] **Step 2: Update the spec**

In `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`:

a) Change the status line to `Status: revised after review 4, Plan 3 and Plan 5 (changes listed in sections 13 to 18)`.

b) In section 9, after the bullet that starts with "the present imperative of τρώω", add:

```markdown
- Plan 5 additions: νερό and Romanian *apă* (*apei*, *ape*); the quantifier forms (κάποιον, καμία and κανένα, the πολύς and περισσότερος forms, μερικοί, λίγος and λιγότερος); the Romanian forms *unii / unele*, *câteva*, *vreunul / vreuna*, *niciunul / niciuna* and the comparative *mai* + the word; the six pending Romanian genitives (the singular genitive of *mult* and *multă*, and every genitive of *puțin*, *puțină*, *puțini* and *puține*), which must be filled in, or removed from the lexeme's `offers`, before release; είμαι, *a fi* and the English forms of "be" (am not, aren't, isn't); ψήνω and *a coace*; the participles πλυμένος and ψημένος with *spălat / spălată* and *copt / coaptă*; αν and *dacă*; and phrases 7 to 10, 20, 21, 30, 32 and 33.
```

c) Append at the end of the file:

```markdown

## 18. Changes since Plan 5

| Source | Change | Where |
|---|---|---|
| Quantifier `use` | It stays on the slot (a token says which reading the phrase has) but is not a control: the panel always shows "with a noun" and "on its own", as 5.3 says. `sense` is a control | 4.2, 5.3 |
| Quantifier `offers` | `numbers` on the lexeme; the degrees and senses offered are the ones its data has (`greek.comparative`, `ro.few`) | 4.2 |
| `pending` | `Stored` (text or `{ pending: true }`) is used on Romanian quantifier cells; `npm run validate` prints them as `Pending (n)`; `--release` fails while any remains; the panel shows "not yet added" | 4.2, 7 |
| Stand-alone genitive pronouns | Not stored; the "on its own" row is dimmed in the genitive | 6.3 |
| Mass nouns | `GreekNoun.mass` (ψωμί, νερό); a plural count reading of a mass noun has no English cell ("uncountable") | 5.2, 5.3 |
| Copula | είμαι is a verb whose six present forms are overrides with the rule `irregular-be`, with one authored reading; it offers only the present indicative | 4.2, 5.5 |
| Passive participle | A `participle` stem on the verb (πλυ-, ψη-) and `derivedFrom: { verb, stem }` on the adjective; the validator checks that the adjective stem is the participle stem + μέν; the reading line is Greek only | 4.3, 5.5, 6.5 |
| Related panels | `Panel.related`: a participle opens its verb, κανένας opens the numeral ένας, each with a way back and a label | 5.3 |
```

d) Run `git diff --stat docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` and check that only these three places changed.

- [ ] **Step 3: Browser check**

Start the app with `npm run dev -- --port 5199 --strictPort` (via `preview_start` and `.claude/launch.json`) and check each point in the browser pane, reporting the actual text seen:

1. Pick **I want a little water**. Three chips. Click *λίγο*: the heading reads λίγος / λίγη / λίγο, the badge says *mass reading*, the first row reads λίγο νερό / puțină apă / little / a little water, the second row (*on its own*) λίγο / puțină / little / a little. Set **Kind of noun** to *separate things*: λίγα νερά / puține ape, the English cell says *uncountable: no plural in English*, and the badge says *count reading*. Set it back, then set **Role in sentence** to *possessor*: the Romanian cell reads *not yet added* and the second row is dimmed with a reason.
2. Pick **I want some coffees**, click *μερικούς*: μερικούς καφέδες / niște cafele / some coffees. Set **Romanian counterpart** to *a few (câțiva)*: câteva cafele / a few / several coffees.
3. Pick **I don't want any coffee**, click *κανέναν*: three rows, the third labelled *with negation* and reading δεν θέλω κανέναν καφέ / nu vreau nicio cafea / I don't want any coffee. Below the table: "κανένας follows the numeral ένας." with a button. Click it: the numeral panel (ένας / μία / ένα) opens with a **← Back to κανένας** link; click the link: the quantifier panel returns.
4. Pick **I want more water** and **I will eat less bread**: the **Degree** control reads *comparative* and the rows read mai multă apă / mai puțină pâine. In Improver, the table has nine rows, the outlined Greek and Romanian cells are in different rows for *ψωμί* (neuter in Greek, feminine in Romanian), and the genitive rows read *not yet added* in the Romanian column.
5. Pick **I used to eat a lot of bread**, click *πολύ*: the irregularity line says πολύς has two stems; the **Compare** table lists *Much and many*; in Beginner only the core rows show.
6. Pick **If I had bread, I would eat**. Chips: Αν, είχα, ψωμί, and the group «θα έτρωγα» with two pieces. Click *Αν*: the panel reads αν είχα ψωμί / dacă aș avea pâine / if I had bread and the **Compare** table has an *If-clause* row. Click the piece *θα*: the θα panel opens with a **← Back to the verb** link.
7. Pick **The child is washed**. Click *είναι*: the heading is είμαι, the row reads (αυτός/ή) είναι / (el/ea) este / he/she is, the irregularity line says to learn the six forms together, and **How to read this** says the verb is irregular. Click *πλυμένο*: the row reads το πλυμένο παιδί / copilul spălat / the washed child; **How to read this** reads πλυ- and -μένο with the gloss; the line "Derived from πλένω (πλυ- + -μένος)." has a button; click it: the verb panel πλένω opens with **← Back to the participle**; click that.
8. Pick **The bread is baked**, click *ψημένο*: το ψημένο ψωμί / pâinea coaptă / the baked bread, and the **Compare** table shows the *Gender* row (neuter in Greek, feminine in Romanian).
9. At phone width (375 px), in Improver, open a quantifier panel with the nine-row table and the badge, and the participle panel: check that the page has no horizontal scrollbar (`document.documentElement.scrollWidth` equals `clientWidth`) and that the table cells wrap inside the card. If something overflows, fix it in `src/styles.css`, re-check, and run the gate again.
10. Dark mode and keyboard: with the colour scheme set to dark, the badge, the dimmed rows and the "not yet added" cells keep readable contrast. Tab to the **Open the numeral ένας** and **Open πλένω** buttons: each shows a visible focus ring and Enter opens the panel.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record Plan 5's decisions and its review items in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

If Step 3 needed a style change, commit it separately:

```bash
git add src/styles.css
git commit -m "style: keep the quantifier table inside the viewport at phone width

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage** (spec sections that this plan owns, and the task that delivers them):

| Spec | Delivered by |
|---|---|
| 4.2 `Stored` and the `pending` marker; 7 the validator accepts and lists it, release mode refuses it; 5.3 the UI shows "not yet added" | Tasks 2, 3, 4 |
| 4.2 the quantifier slot (`degree`, `sense`, `use`); lexeme `offers` for quantifiers | Tasks 2, 4 (departures 1 and 2) |
| 6.3 the quantifier table: μερικοί (niște, câțiva), κάποιος (vreun, vreunul), κανένας (niciun, niciunul), πολύς, λίγος, the comparatives; 6.6 inventory | Tasks 2, 3 |
| 5.3 quantifier panel: noun, role, sense, kind, degree; rows with a noun, on its own, with negation; Improver table; mass or count badge; the link from κανένας to the numeral panel | Tasks 4, 8 |
| 5.2 notes plural-indefinite, some-vs-any, determiner-vs-pronoun, negative-concord, count-vs-mass, comparative, quantity-vs-sense | Task 5 |
| 6.1 phrases 7, 8, 9, 10, 20, 21 | Task 5 |
| 4.2 `conjunction` slot; 5.3 conjunction panel; 5.2 if-clause; 6.1 phrase 30 | Task 6 |
| 6.6 the copula and νερό, ψήνω; 5.3 copula panel (present only) | Tasks 1, 7 |
| 4.3 the participle stem as a principal part, the derived adjective; 5.3 the "Derived from" line and link; 5.5 the Πλυμένο reading; 5.2 participle-agreement, perfect-vs-participle; 6.1 phrases 32 and 33 | Tasks 7, 8, 9 |
| 7 the validator checks every quantifier cell and token and the participle's tie to its verb | Tasks 3, 7 |
| 9 / 11 every new lexeme, phrase, note, template and table carries `verified: false` or a `ReviewItem` | Tasks 1 to 9; Task 10 lists the new items for the reviewer in section 9 |
| Not here | clitics, shortened forms, form groups, the clitic panel, phrases 34 to 38, the content review, filling the six pending genitives (Plan 6); readings for words that are not verbs or participles; hover highlighting of a reading part |

**Placeholder scan:** no "TBD", "TODO", "fill in" or "similar to Task N" in this plan; every code step shows the code. The one interim state is declared: between Tasks 2 and 4 `buildPanel` throws "no quantifier panel yet", and no phrase or test builds a quantifier panel before Task 4. The conditional edit in Task 10 (a style fix at phone width) says when it applies.

**Type consistency:** `Stored` (Task 2) is read by `roQuantifier`, `pendingCells` and `roRich` (Tasks 3, 4). `QuantifierDegree`, `QuantifierSense` and `QuantifierUse` (Task 2) are the slot fields that `quantifierSlots`, `roQuantifier`, `enQuantifier`, `applyControl` and the panel's controls read. `GreekQuantifier.numbers`, `greek.comparative` and `ro.few` are what `offeredDegrees`, `offeredSenses` and the panel's `kind`, `degree` and `sense` controls test. `Control['key']` gains `kind`, `degree` and `sense` (Task 4); `Panel.badge` (Task 4) and `Panel.related` (Task 8) are rendered by `WordPanel`. `GreekAdjective.derivedFrom` and `VerbStems.participle` (Task 7) are checked by the validator and read by `participleReading`, `derivedLabel` and `participleRelated`. `OpenPiece.backLabel` (Task 8) is set by `pieceToOpen` and `openRelated` and read by `WordPanel`'s `backLabel`. `GreekConjunction` and `{ pos: 'conjunction' }` (Task 6) are handled in `inflect`, `slotsFor`, `buildPanel` and the `case` guard of `applyControl`. `NO_CELLS` (Task 1) is reused by ψήνω (Task 7).

**Counts to check when running** (the plan's arithmetic, not yet run): after Tasks 1 to 9 the unverified count goes 174, 189, 191, 191, 206, 211, 221, 221, 226; the pending count is 6 from Task 3 on. `PHRASES` has 25, 31 (Task 5), 32 (Task 6), 34 (Task 9) entries. `allVerbSlots` for είμαι is 6; `quantifierSlots` is 36, 18, 18, 72 and 72.

**Known soft spots** (decisions the executor should not "fix" silently): the Romanian pronoun forms of *niște* (*unii*, *unele*) and of *câțiva*, the English words chosen for each use ("some / any", "much / a lot of"), and the unverified Romanian genitives are all from memory; `use` is not a control (departure 1); the "on its own" genitive is dimmed rather than filled (departure 4); ψήνω offers the present although only its participle is needed; the Romanian line of a negated simple tense is still missing (a Plan 4 deferred minor, unchanged here).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-04-plan-5-quantifiers-copula-participles-and-if.md`. Execute it with superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.
