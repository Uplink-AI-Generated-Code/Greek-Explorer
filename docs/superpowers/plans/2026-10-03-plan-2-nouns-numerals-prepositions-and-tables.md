# Greek Grammar Explorer, Plan 2: Nouns, Numerals, Prepositions, Improver Tables and the Fox Sentence

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the app from one phrase to three: add phrase 2 («Θέλω τρεις καφέδες») and the fixed phrase 3 («Η γρήγορη καφέ αλεπού πηδάει πάνω από τον τεμπέλικο σκύλο»), with a phrase picker, noun and numeral controls, a preposition panel, gloss segments (*câine|le*), and the full Improver paradigm tables with per-column highlighting.

**Architecture:** Same hybrid engine as Plan 1 (stored stems plus shared ending tables), extended with more classes. The word panel now works on a `PanelState` (a copy of the token's slot plus the noun the word goes with), and the panel code is split into one module per part of speech.

**Tech Stack:** Unchanged from Plan 1 (Vite, React, TypeScript strict, Vitest, Testing Library, tsx).

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Builds on:** `docs/superpowers/plans/2026-10-03-plan-1-foundation-and-first-slice.md` (merged). Plan 1's roadmap table is still the roadmap for Plans 3 to 5.

## Scope boundaries for Plan 2

In scope: numerals 1 to 5; nouns σκύλος, αλεπού, παιδί; the adjectives γρήγορος, τεμπέλικος and the indeclinable καφέ; the contracted verb πηδάω (present only); the prepositions πάνω από, κάτω από, με, για; phrases 2 and 3; gloss segments; the phrase picker; the "noun it goes with" control; the count control on nouns; irregularity messages; the Improver full tables.

Not in scope (later plans, see Plan 1's roadmap):
- Tenses and moods other than the present indicative, `compose()`, verb groups, readings (Plan 3).
- Quantifiers, negation, the `pending` marker, the copula and participles (Plan 4).
- Clitics and form groups (Plan 5).
- The plural "some" row in the noun panel: with "many" selected the second row stays "none in plural" until Plan 4 adds quantifiers.
- Romanian numerals above 1 have no genitive of their own (they reuse the nominative); the panel does not pretend otherwise.

## Global Constraints

Plan 1's Global Constraints all still apply. In particular:

- Vite + React + TypeScript single-page app; no backend; no network calls; no runtime AI. TypeScript `strict: true`. All Greek text is monotonic. The interface language is English.
- Greek forms come from stored stems plus shared ending tables, with explicit overrides for irregular cells. Romanian and English forms are stored per slot, not generated (until Plan 3 introduces generated compounds).
- Beginner and Improver share one data set; the toggle changes presentation only. A phrase's `level` is a badge: the toggle never hides phrases.
- Colour is never the only signal; word chips and gloss units are real `<button>` elements; the page works at phone width and in light and dark mode.
- The phrase and its glosses are authored and fixed; the word panel works on a copy of the token's slot, with a "Reset to phrase" control (spec 4.4).
- Every lexeme has `verified: { el, ro, en }`; phrases and divergence notes have `verified: boolean`; ending tables are `ReviewItem`s in `src/data/review.ts`. All start `false` (spec 4.3, 9).
- Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (add it as a second `-m` argument).

Working rules learned in Plan 1:

- **Run the gate before every commit, and commit only if it is green:** `npx vitest run && npm run typecheck`. Chain the commit with `&&`.
- **Edit files with the Edit tool or Python, not `sed -i`** (macOS `sed` needs a backup suffix and fails silently in a chain).
- **Whitespace in rich text:** keep spaces as their own plain segments, never inside a coloured span (accessible names drop trailing spaces).
- **Work on a feature branch:** `git checkout -b feat/plan-2-nouns-and-tables` before Task 1.

## File Structure (changes only)

```
src/
  types.ts                            # modify: NumeralValue, classes, preposition, glossary segments
  glossLinks.ts                       # modify: isSegmented(), unitText()
  App.tsx                             # modify: PanelState, phrase picker (keyed explorer)
  data/
    paradigms.ts                      # modify: numerals 1-5, more classes, notes, Romanian article suffixes
    lexemes.ts                        # modify: numeral, nouns, adjectives, verb, prepositions
    phrases.ts                        # modify: phrases 2 and 3
    divergences.ts                    # modify: rows for the new words
    review.ts                         # modify: new ending tables
  engine/
    segments.ts                       # modify: 'sub' role
    greek.ts                          # modify: classes, numerals, prepositions
    romanian.ts, english.ts           # modify: numeral accessors
    agree.ts                          # modify: counted noun phrases
  panels/
    panels.ts                         # rewrite: buildPanel / applyControl / initialState (small dispatcher)
    types.ts                          # new: Control, PanelRow, Panel, PanelState
    shared.ts                         # new: helpers shared by the panel modules
    verb.ts, noun.ts, adjective.ts,   # new: one module per part of speech
    numeral.ts, article.ts, preposition.ts
  validate/validate.ts                # modify: new slots, segments, warnings()
  components/
    PhrasePicker.tsx                  # new
    GlossGrid.tsx                     # modify: segmented units
    FormTable.tsx, WordPanel.tsx      # modify: per-column highlight, full paradigm, irregular line
scripts/validate.ts                   # modify: print warnings
```

---

### Task 1: Numerals 1 to 5

**Files:**
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/phrases.ts`, `src/data/review.ts`
- Modify: `src/engine/greek.ts`, `src/engine/romanian.ts`, `src/engine/english.ts`, `src/engine/agree.ts`
- Modify: `src/panels/panels.ts`, `src/validate/validate.ts`
- Test: `src/engine/greek.test.ts`, `src/engine/agree.test.ts`

**Interfaces:**
- Produces (types): `NumeralValue = 1 | 2 | 3 | 4 | 5`; `SlotOf<'numeral'>` now has `value: NumeralValue`; `GreekNumeral` holds Romanian and English forms for every value.
- Produces (data): `NUMERAL_FORMS: Record<NumeralValue, Record<Gender, Record<Case, Pair>>>`; the numeral lexeme id is now `'numeral'` (was `'one'`); `NUMERAL: GreekNumeral` replaces `ONE`.
- Produces (engine): `inflectNumeral(l, s)` handles all five values; `roNumeral(n: GreekNumeral, value: NumeralValue, roGender: Gender, c: Case): string`; `enNumeral(n: GreekNumeral, value: NumeralValue): string`; `NpOptions.count?: 2 | 3 | 4 | 5` (a counted plural phrase).

- [ ] **Step 0: Create the feature branch**

Run: `cd /Users/radu/Code/Claude/learn-greek && git checkout -b feat/plan-2-nouns-and-tables`
Expected: `Switched to a new branch 'feat/plan-2-nouns-and-tables'`.

- [ ] **Step 1: Write the failing tests**

In `src/engine/greek.test.ts`, change the lexeme import to use `NUMERAL` instead of `ONE`, and replace every `ONE` in the file with `NUMERAL`:

```ts
import { DEF_ARTICLE, NUMERAL, getAdjective, getLexeme, getNoun } from '../data/lexemes';
```

Then append this block at the end of the file:

```ts
describe('inflectNumeral (2 to 5)', () => {
  const cases = [
    { value: 2, gender: 'f', case: 'gen', stem: 'δύο' },
    { value: 2, gender: 'm', case: 'nom', stem: 'δύο' },
    { value: 3, gender: 'm', case: 'acc', stem: 'τρεις' },
    { value: 3, gender: 'f', case: 'nom', stem: 'τρεις' },
    { value: 3, gender: 'n', case: 'nom', stem: 'τρία' },
    { value: 3, gender: 'f', case: 'gen', stem: 'τριών' },
    { value: 4, gender: 'f', case: 'nom', stem: 'τέσσερις' },
    { value: 4, gender: 'n', case: 'acc', stem: 'τέσσερα' },
    { value: 4, gender: 'm', case: 'gen', stem: 'τεσσάρων' },
    { value: 5, gender: 'n', case: 'gen', stem: 'πέντε' },
  ] as const;
  for (const c of cases) {
    it(`${c.value} ${c.gender} ${c.case} -> ${c.stem}`, () => {
      expect(
        inflectNumeral(NUMERAL, { pos: 'numeral', value: c.value, gender: c.gender, case: c.case }),
      ).toEqual({ stem: c.stem, ending: '' });
    });
  }
});
```

In `src/engine/agree.test.ts`, add the imports `getAdjective` is already there; append:

```ts
describe('nounPhrase with a count', () => {
  it('counts a plural noun: three coffees', () => {
    const np = nounPhrase(kafes, 'pl', 'acc', { count: 3 });
    expect(richText(np.el)).toBe('τρεις καφέδες');
    expect(np.ro).toBe('trei cafele');
    expect(np.en).toBe('three coffees');
  });

  it('two does not change in Greek but Romanian follows its own noun gender', () => {
    const np = nounPhrase(kafes, 'pl', 'nom', { count: 2 });
    expect(richText(np.el)).toBe('δύο καφέδες');
    expect(np.ro).toBe('două cafele');
    expect(np.en).toBe('two coffees');
  });

  it('puts the adjective between the numeral and the noun in Greek, after the noun in Romanian', () => {
    const np = nounPhrase(kafes, 'pl', 'acc', { count: 3, adjective: zestos });
    expect(richText(np.el)).toBe('τρεις ζεστούς καφέδες');
    expect(np.ro).toBe('trei cafele calde');
    expect(np.en).toBe('three hot coffees');
  });

  it('rejects a count together with an article', () => {
    expect(() => nounPhrase(kafes, 'pl', 'nom', { count: 3, article: 'definite' })).toThrow(
      'A noun phrase has an article or a count, not both',
    );
  });

  it('rejects a count in the singular', () => {
    expect(() => nounPhrase(kafes, 'sg', 'nom', { count: 3 })).toThrow('A counted noun phrase is plural');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine`
Expected: FAIL (`NUMERAL` is not exported from the lexemes module; `count` is not a known option).

- [ ] **Step 3: Update `src/types.ts`**

After `export type Level = 'beginner' | 'improver';` add:

```ts
export type NumeralValue = 1 | 2 | 3 | 4 | 5;
```

In the `Slot` union, replace the numeral line with:

```ts
  | { pos: 'numeral'; value: NumeralValue; gender: Gender; case: Case };
```

Replace the `GreekNumeral` interface with:

```ts
export interface GreekNumeral extends LexemeBase {
  pos: 'numeral';
  /** Romanian forms for every value; values above 1 have no genitive of their own, so `gen` repeats `nom`. */
  ro: Record<NumeralValue, Record<Gender, { nom: string; gen: string }>>;
  en: Record<NumeralValue, string>;
}
```

- [ ] **Step 4: Update `src/data/paradigms.ts`**

Change the first import line to `import type { Case, Gender, Num, NumeralValue } from '../types';`. Keep `NUMERAL_ONE` as it is, and append:

```ts
const invariable = (word: string): Record<Gender, Record<Case, Pair>> => {
  const row: Record<Case, Pair> = { nom: [word, ''], acc: [word, ''], gen: [word, ''] };
  return { m: row, f: row, n: row };
};

const mfRow = (nomAcc: string, gen: string): Record<Case, Pair> => ({
  nom: [nomAcc, ''],
  acc: [nomAcc, ''],
  gen: [gen, ''],
});

/** The numerals 1 to 5. 1, 3 and 4 change with gender and case; 2 and 5 never change. */
export const NUMERAL_FORMS: Record<NumeralValue, Record<Gender, Record<Case, Pair>>> = {
  1: NUMERAL_ONE,
  2: invariable('δύο'),
  3: { m: mfRow('τρεις', 'τριών'), f: mfRow('τρεις', 'τριών'), n: mfRow('τρία', 'τριών') },
  4: { m: mfRow('τέσσερις', 'τεσσάρων'), f: mfRow('τέσσερις', 'τεσσάρων'), n: mfRow('τέσσερα', 'τεσσάρων') },
  5: invariable('πέντε'),
};
```

- [ ] **Step 5: Update `src/data/lexemes.ts`**

Replace the `GreekNumeral` import usage as needed (the import list already has it). Replace the whole `const one: GreekNumeral = { ... };` declaration with:

```ts
const same = (nom: string, gen: string = nom) => ({ nom, gen });

const numeral: GreekNumeral = {
  id: 'numeral',
  pos: 'numeral',
  lemma: 'ένας',
  verified: { el: false, ro: false, en: false },
  ro: {
    1: { m: same('un', 'unui'), f: same('o', 'unei'), n: same('un', 'unui') },
    2: { m: same('doi'), f: same('două'), n: same('două') },
    3: { m: same('trei'), f: same('trei'), n: same('trei') },
    4: { m: same('patru'), f: same('patru'), n: same('patru') },
    5: { m: same('cinci'), f: same('cinci'), n: same('cinci') },
  },
  en: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' },
};
```

In the `LEXEMES` map replace `[one.id]: one,` with `[numeral.id]: numeral,`. Replace `export const ONE: GreekNumeral = one;` with `export const NUMERAL: GreekNumeral = numeral;`.

In `src/data/phrases.ts`, in the second token change `lexeme: 'one'` to `lexeme: 'numeral'`.

In `src/data/review.ts`, change the id `'ending-table:numeral-one'` to `'ending-table:numeral-forms'`.

- [ ] **Step 6: Update the engine**

In `src/engine/greek.ts`: replace `NUMERAL_ONE` in the paradigms import with `NUMERAL_FORMS`, and replace the body of `inflectNumeral`:

```ts
export function inflectNumeral(_l: GreekNumeral, s: SlotOf<'numeral'>): Form {
  const [stem, ending] = NUMERAL_FORMS[s.value][s.gender][s.case];
  return { stem, ending };
}
```

In `src/engine/romanian.ts`: add `NumeralValue` to the type import and replace `roNumeral`:

```ts
export function roNumeral(n: GreekNumeral, value: NumeralValue, roGender: Gender, c: Case): string {
  return n.ro[value][roGender][c === 'gen' ? 'gen' : 'nom'];
}
```

In `src/engine/english.ts`: add `GreekNumeral` and `NumeralValue` to the type import and append:

```ts
export const enNumeral = (n: GreekNumeral, value: NumeralValue): string => n.en[value];
```

Replace the whole of `src/engine/agree.ts` with:

```ts
import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
import type { Case, GreekAdjective, GreekNoun, Num, NumeralValue } from '../types';
import { enIndefiniteArticle, enNoun, enNumeral } from './english';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
import { roAdjective, roNoun, roNumeral } from './romanian';
import { articleRich, formRich, joinRich, numeralRich, type Rich } from './segments';

export interface NpOptions {
  article?: 'definite' | 'one';
  /** A counted plural: τρεις καφέδες. Cannot be combined with `article`. */
  count?: Exclude<NumeralValue, 1>;
  adjective?: GreekAdjective;
}

export interface NounPhrase {
  el: Rich;
  ro: string;
  en: string;
}

/** Builds article or count + adjective + noun in all three languages, agreeing in gender, number and case. */
export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
  if (opts.article && opts.count) throw new Error('A noun phrase has an article or a count, not both');
  if (opts.article === 'one' && number === 'pl') throw new Error('Greek has no plural indefinite article');
  if (opts.count && number !== 'pl') throw new Error('A counted noun phrase is plural');
  const gender = noun.gender;

  const el: Rich[] = [];
  if (opts.article === 'definite') {
    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })));
  }
  if (opts.article === 'one') {
    el.push(numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: 1, gender, case: c })));
  }
  if (opts.count) {
    el.push(numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: opts.count, gender, case: c })));
  }
  if (opts.adjective) {
    el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
  }
  el.push(formRich(inflectNoun(noun, { pos: 'noun', number, case: c })));

  const roAdj = opts.adjective ? roAdjective(opts.adjective, noun.ro.gender, number, c) : '';
  const roText = opts.count
    ? [roNumeral(NUMERAL, opts.count, noun.ro.gender, c), noun.ro.forms.pl.indefinite, roAdj]
    : [roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'), roAdj];

  const core = [opts.adjective?.en, enNoun(noun, number)].filter(Boolean).join(' ');
  const word = opts.count
    ? enNumeral(NUMERAL, opts.count)
    : opts.article === 'definite'
      ? 'the'
      : opts.article === 'one'
        ? enIndefiniteArticle(core)
        : '';
  const enText = [word, core].filter(Boolean).join(' ');

  return { el: joinRich(el), ro: roText.filter(Boolean).join(' '), en: c === 'gen' ? `of ${enText}` : enText };
}
```

- [ ] **Step 7: Update the panel and the validator for the new numeral shape**

In `src/panels/panels.ts`, in `numeralPanel`, change the Romanian cell to pass the value:

```ts
        ro: plain(roNumeral(numeral, 1, noun.ro.gender, slot.case)),
```

In `src/validate/validate.ts`: add `NumeralValue` to the type import, add `const VALUES: NumeralValue[] = [1, 2, 3, 4, 5];` after the `PERSONS` constant, replace the `case 'numeral':` branch of `slotsFor` with:

```ts
    case 'numeral':
      return VALUES.flatMap((value) =>
        GENDERS.flatMap((gender) => CASES.map((c): Slot => ({ pos: 'numeral', value, gender, case: c }))),
      );
```

and replace the `if (l.pos === 'numeral') { ... }` block in `checkLexeme` with:

```ts
  if (l.pos === 'numeral') {
    for (const v of VALUES) {
      for (const g of GENDERS) {
        if (isEmpty(l.ro[v][g].nom) || isEmpty(l.ro[v][g].gen)) {
          errors.push(`lexeme ${l.id}: empty Romanian form ${v}.${g}`);
        }
      }
      if (isEmpty(l.en[v])) errors.push(`lexeme ${l.id}: empty English form ${v}`);
    }
  }
```

- [ ] **Step 8: Run the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all tests PASS (the original 99 plus the new ones), no type errors, `Data is valid.`

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: numerals 1 to 5 and counted noun phrases" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Nouns σκύλος, αλεπού and παιδί

**Files:**
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`, `src/engine/agree.test.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces: `NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i'`; `GreekNoun.ro.split: Record<Num, readonly [stem: string, suffix: string]>`; `NOUN_NOTES`; lexeme ids `'skylos'`, `'alepou'`, `'paidi'`; `inflectNoun` returns an `irregular` note for the cells in `NOUN_NOTES`.

- [ ] **Step 1: Write the failing tests**

In `src/engine/greek.test.ts`, change the expectation in the existing `inflectNoun (καφές, class masc-es)` describe from `toEqual({ stem: c.stem, ending: c.ending })` to `toMatchObject({ stem: c.stem, ending: c.ending })` (the accusative and genitive now carry a note). Append:

```ts
describe('inflectNoun (more classes)', () => {
  const noun = (id: string) => getNoun(id);
  const forms = (id: string, number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') => inflectNoun(noun(id), { pos: 'noun', number, case: c });

  it('σκύλος (masc-os)', () => {
    expect(forms('skylos', 'sg', 'nom')).toMatchObject({ stem: 'σκύλ', ending: 'ος' });
    expect(forms('skylos', 'sg', 'acc')).toMatchObject({ stem: 'σκύλ', ending: 'ο' });
    expect(forms('skylos', 'sg', 'gen')).toMatchObject({ stem: 'σκύλ', ending: 'ου' });
    expect(forms('skylos', 'pl', 'nom')).toMatchObject({ stem: 'σκύλ', ending: 'οι' });
    expect(forms('skylos', 'pl', 'acc')).toMatchObject({ stem: 'σκύλ', ending: 'ους' });
    expect(forms('skylos', 'pl', 'gen')).toMatchObject({ stem: 'σκύλ', ending: 'ων' });
  });

  it('αλεπού (fem-ou): the singular is invariable and the plural adds -δ-', () => {
    expect(forms('alepou', 'sg', 'nom')).toMatchObject({ stem: 'αλεπού', ending: '' });
    expect(forms('alepou', 'sg', 'acc')).toMatchObject({ stem: 'αλεπού', ending: '' });
    expect(forms('alepou', 'sg', 'gen')).toMatchObject({ stem: 'αλεπού', ending: 'ς' });
    expect(forms('alepou', 'pl', 'nom')).toMatchObject({ stem: 'αλεπούδ', ending: 'ες' });
    expect(forms('alepou', 'pl', 'gen')).toMatchObject({ stem: 'αλεπούδ', ending: 'ων' });
  });

  it('παιδί (neut-i)', () => {
    expect(forms('paidi', 'sg', 'nom')).toMatchObject({ stem: 'παιδ', ending: 'ί' });
    expect(forms('paidi', 'sg', 'gen')).toMatchObject({ stem: 'παιδ', ending: 'ιού' });
    expect(forms('paidi', 'pl', 'nom')).toMatchObject({ stem: 'παιδ', ending: 'ιά' });
    expect(forms('paidi', 'pl', 'gen')).toMatchObject({ stem: 'παιδ', ending: 'ιών' });
  });

  it('attaches an irregularity note only where the class has one', () => {
    expect(forms('kafes', 'sg', 'acc').irregular?.rule).toBe('drop-final-s');
    expect(forms('kafes', 'sg', 'nom').irregular).toBeUndefined();
    expect(forms('alepou', 'sg', 'nom').irregular?.rule).toBe('invariable-singular');
    expect(forms('alepou', 'pl', 'nom').irregular?.rule).toBe('plural-delta');
    expect(forms('paidi', 'pl', 'nom').irregular).toBeUndefined();
  });
});
```

In `src/engine/agree.test.ts` append:

```ts
describe('nounPhrase with the other nouns', () => {
  const np = (id: string, ...args: [Parameters<typeof nounPhrase>[1], Parameters<typeof nounPhrase>[2], Parameters<typeof nounPhrase>[3]?]) =>
    nounPhrase(getNoun(id), ...args);

  it('σκύλος: definite accusative', () => {
    const r = np('skylos', 'sg', 'acc', { article: 'definite' });
    expect(richText(r.el)).toBe('τον σκύλο');
    expect(r.ro).toBe('câinele');
    expect(r.en).toBe('the dog');
  });

  it('αλεπού: indefinite nominative uses the feminine numeral', () => {
    const r = np('alepou', 'sg', 'nom', { article: 'one' });
    expect(richText(r.el)).toBe('μία αλεπού');
    expect(r.ro).toBe('o vulpe');
    expect(r.en).toBe('a fox');
  });

  it('παιδί: definite plural nominative, neuter in Greek and masculine in Romanian', () => {
    const r = np('paidi', 'pl', 'nom', { article: 'definite' });
    expect(richText(r.el)).toBe('τα παιδιά');
    expect(r.ro).toBe('copiii');
    expect(r.en).toBe('the children');
  });

  it('counts each noun with the numeral that agrees with it', () => {
    expect(richText(np('alepou', 'pl', 'acc', { count: 2 }).el)).toBe('δύο αλεπούδες');
    expect(np('alepou', 'pl', 'acc', { count: 2 }).ro).toBe('două vulpi');
    expect(richText(np('skylos', 'pl', 'acc', { count: 4 }).el)).toBe('τέσσερις σκύλους');
    expect(np('skylos', 'pl', 'acc', { count: 4 }).ro).toBe('patru câini');
    expect(richText(np('paidi', 'pl', 'nom', { count: 3 }).el)).toBe('τρία παιδιά');
    expect(np('paidi', 'pl', 'nom', { count: 3 }).en).toBe('three children');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine`
Expected: FAIL (`unknown lexeme: skylos`).

- [ ] **Step 3: Update `src/types.ts`**

Above `GreekNoun` add `export type NounClass = 'masc-es' | 'masc-os' | 'fem-ou' | 'neut-i';` and replace the `GreekNoun` interface with:

```ts
export interface GreekNoun extends LexemeBase {
  pos: 'noun';
  gender: Gender;
  class: NounClass;
  stems: Record<Num, string>;
  ro: {
    lemma: string;
    gender: Gender;
    forms: Record<Num, RoNounForms>;
    /** Stem and article suffix of the nominative/accusative definite form (câine + le), used to check gloss segments. */
    split: Record<Num, readonly [stem: string, suffix: string]>;
  };
  en: Record<Num, string>;
  /** One line comparing gender and form across the three languages. */
  note: string;
}
```

- [ ] **Step 4: Update `src/data/paradigms.ts`**

Change the first import to `import type { Case, Gender, IrregularNote, Num, NounClass, NumeralValue } from '../types';`. Replace the `NOUN_CLASSES` declaration with:

```ts
export const NOUN_CLASSES: Record<NounClass, EndingTable> = {
  'masc-es': {
    sg: { nom: 'ές', acc: 'έ', gen: 'έ' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
  'masc-os': {
    sg: { nom: 'ος', acc: 'ο', gen: 'ου' },
    pl: { nom: 'οι', acc: 'ους', gen: 'ων' },
  },
  /** Feminine nouns in -ού: the singular does not change except in the genitive, and the plural adds -δ-. */
  'fem-ou': {
    sg: { nom: '', acc: '', gen: 'ς' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
  'neut-i': {
    sg: { nom: 'ί', acc: 'ί', gen: 'ιού' },
    pl: { nom: 'ιά', acc: 'ιά', gen: 'ιών' },
  },
};

type NoteKey = `${Num}-${Case}`;

/** One-line explanations for cells that surprise a learner. Cells not listed have no note. */
export const NOUN_NOTES: Partial<Record<NounClass, Partial<Record<NoteKey, IrregularNote>>>> = {
  'masc-es': {
    'sg-acc': {
      rule: 'drop-final-s',
      plain: 'The final ς drops in the singular accusative and genitive (ο καφές → τον καφέ).',
    },
    'sg-gen': {
      rule: 'drop-final-s',
      plain: 'The final ς drops in the singular accusative and genitive (ο καφές → του καφέ).',
    },
  },
  'masc-os': {
    'sg-acc': { rule: 'drop-final-s', plain: 'In the singular accusative the final ς drops (ο σκύλος → τον σκύλο).' },
  },
  'fem-ou': {
    'sg-nom': {
      rule: 'invariable-singular',
      plain: 'The singular does not change between subject and object: only the article shows the role.',
    },
    'sg-acc': {
      rule: 'invariable-singular',
      plain: 'The singular does not change between subject and object: only the article shows the role.',
    },
    'pl-nom': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδες.' },
    'pl-acc': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδες.' },
    'pl-gen': { rule: 'plural-delta', plain: 'The plural adds -δ-: αλεπού → αλεπούδων.' },
  },
};
```

- [ ] **Step 5: Update `src/data/lexemes.ts`**

In the `kafes` constant, inside `ro`, add after the `forms` property:

```ts
    split: { sg: ['cafea', 'ua'], pl: ['cafele', 'le'] },
```

After the `kafes` constant add:

```ts
const skylos: GreekNoun = {
  id: 'skylos',
  pos: 'noun',
  lemma: 'σκύλος',
  verified: { el: false, ro: false, en: false },
  gender: 'm',
  class: 'masc-os',
  stems: { sg: 'σκύλ', pl: 'σκύλ' },
  ro: {
    lemma: 'câine',
    gender: 'm',
    forms: {
      sg: { definite: 'câinele', indefinite: 'un câine', genDefinite: 'câinelui', genIndefinite: 'unui câine' },
      pl: { definite: 'câinii', indefinite: 'câini', genDefinite: 'câinilor', genIndefinite: 'unor câini' },
    },
    split: { sg: ['câine', 'le'], pl: ['câini', 'i'] },
  },
  en: { sg: 'dog', pl: 'dogs' },
  note: 'Masculine in Greek and Romanian.',
};

const alepou: GreekNoun = {
  id: 'alepou',
  pos: 'noun',
  lemma: 'αλεπού',
  verified: { el: false, ro: false, en: false },
  gender: 'f',
  class: 'fem-ou',
  stems: { sg: 'αλεπού', pl: 'αλεπούδ' },
  ro: {
    lemma: 'vulpe',
    gender: 'f',
    forms: {
      sg: { definite: 'vulpea', indefinite: 'o vulpe', genDefinite: 'vulpii', genIndefinite: 'unei vulpi' },
      pl: { definite: 'vulpile', indefinite: 'vulpi', genDefinite: 'vulpilor', genIndefinite: 'unor vulpi' },
    },
    split: { sg: ['vulpe', 'a'], pl: ['vulpi', 'le'] },
  },
  en: { sg: 'fox', pl: 'foxes' },
  note: 'Feminine in Greek and Romanian.',
};

const paidi: GreekNoun = {
  id: 'paidi',
  pos: 'noun',
  lemma: 'παιδί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  stems: { sg: 'παιδ', pl: 'παιδ' },
  ro: {
    lemma: 'copil',
    gender: 'm',
    forms: {
      sg: { definite: 'copilul', indefinite: 'un copil', genDefinite: 'copilului', genIndefinite: 'unui copil' },
      pl: { definite: 'copiii', indefinite: 'copii', genDefinite: 'copiilor', genIndefinite: 'unor copii' },
    },
    split: { sg: ['copil', 'ul'], pl: ['copii', 'i'] },
  },
  en: { sg: 'child', pl: 'children' },
  note: 'Neuter in Greek, masculine in Romanian (copil), no gender in English.',
};
```

In the `LEXEMES` map add `[skylos.id]: skylos, [alepou.id]: alepou, [paidi.id]: paidi,`.

In `src/data/review.ts`, add to `REVIEW_ITEMS`:

```ts
  { id: 'ending-table:masc-os', kind: 'ending-table', verified: false },
  { id: 'ending-table:fem-ou', kind: 'ending-table', verified: false },
  { id: 'ending-table:neut-i', kind: 'ending-table', verified: false },
```

- [ ] **Step 6: Update `inflectNoun` in `src/engine/greek.ts`**

Add `NOUN_NOTES` to the paradigms import and replace `inflectNoun`:

```ts
export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
  const form: Form = { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
  const note = NOUN_NOTES[l.class]?.[`${s.number}-${s.case}` as const];
  return note ? { ...form, irregular: note } : form;
}
```

- [ ] **Step 7: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: add the nouns σκύλος, αλεπού and παιδί with irregularity notes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Adjectives γρήγορος, τεμπέλικος and the indeclinable καφέ

**Files:**
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`, `src/engine/agree.test.ts`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: `AdjectiveClass = 'adj-stressed' | 'adj-unstressed' | 'adj-indeclinable'`; `ADJ_UNSTRESSED`; lexeme ids `'grigoros'`, `'tembelikos'`, `'kafe-adj'`; `inflectAdjective` returns `{ stem: lemma, ending: '', irregular: { rule: 'indeclinable', ... } }` for the indeclinable class.

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/greek.test.ts`:

```ts
describe('inflectAdjective (more classes)', () => {
  const adj = (id: string, gender: 'm' | 'f' | 'n', number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') =>
    inflectAdjective(getAdjective(id), { pos: 'adjective', gender, number, case: c });

  it('γρήγορος (stem-stressed): endings carry no accent', () => {
    expect(adj('grigoros', 'm', 'sg', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'ος' });
    expect(adj('grigoros', 'f', 'sg', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'η' });
    expect(adj('grigoros', 'n', 'pl', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'α' });
    expect(adj('grigoros', 'm', 'pl', 'acc')).toEqual({ stem: 'γρήγορ', ending: 'ους' });
    expect(adj('grigoros', 'f', 'sg', 'gen')).toEqual({ stem: 'γρήγορ', ending: 'ης' });
  });

  it('τεμπέλικος uses the same stem-stressed class', () => {
    expect(adj('tembelikos', 'm', 'sg', 'acc')).toEqual({ stem: 'τεμπέλικ', ending: 'ο' });
    expect(adj('tembelikos', 'm', 'pl', 'gen')).toEqual({ stem: 'τεμπέλικ', ending: 'ων' });
  });

  it('καφέ never changes, and says so', () => {
    for (const gender of ['m', 'f', 'n'] as const) {
      for (const number of ['sg', 'pl'] as const) {
        for (const c of ['nom', 'acc', 'gen'] as const) {
          expect(adj('kafe-adj', gender, number, c)).toMatchObject({ stem: 'καφέ', ending: '' });
        }
      }
    }
    expect(adj('kafe-adj', 'f', 'sg', 'nom').irregular?.rule).toBe('indeclinable');
    expect(adj('zestos', 'f', 'sg', 'nom').irregular).toBeUndefined();
  });
});
```

Append to `src/engine/agree.test.ts`:

```ts
describe('nounPhrase with the other adjectives', () => {
  const alepou = getNoun('alepou');
  const skylos = getNoun('skylos');

  it('a stem-stressed adjective agrees with a feminine noun', () => {
    const r = nounPhrase(alepou, 'sg', 'nom', { article: 'definite', adjective: getAdjective('grigoros') });
    expect(richText(r.el)).toBe('η γρήγορη αλεπού');
    expect(r.ro).toBe('vulpea rapidă');
    expect(r.en).toBe('the quick fox');
  });

  it('the indeclinable adjective stays the same, in Romanian too', () => {
    const r = nounPhrase(alepou, 'sg', 'nom', { article: 'definite', adjective: getAdjective('kafe-adj') });
    expect(richText(r.el)).toBe('η καφέ αλεπού');
    expect(r.ro).toBe('vulpea maro');
    expect(r.en).toBe('the brown fox');
  });

  it('plural agreement with a masculine noun', () => {
    const r = nounPhrase(skylos, 'pl', 'acc', { article: 'definite', adjective: getAdjective('tembelikos') });
    expect(richText(r.el)).toBe('τους τεμπέλικους σκύλους');
    expect(r.ro).toBe('câinii leneși');
    expect(r.en).toBe('the lazy dogs');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine`
Expected: FAIL (`unknown lexeme: grigoros`).

- [ ] **Step 3: Update `src/types.ts`**

Above `GreekAdjective` add `export type AdjectiveClass = 'adj-stressed' | 'adj-unstressed' | 'adj-indeclinable';` and in `GreekAdjective` change `class: 'adj-stressed';` to `class: AdjectiveClass;`. Update the `stem` doc comment above the `stem: string;` line:

```ts
  /** The stem; for an indeclinable adjective, the whole word. */
  stem: string;
```

- [ ] **Step 4: Update `src/data/paradigms.ts`**

Append:

```ts
/** Adjectives with the stress inside the stem: γρήγορος, γρήγορη, γρήγορο. */
export const ADJ_UNSTRESSED: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ος', f: 'η', n: 'ο' },
    acc: { m: 'ο', f: 'η', n: 'ο' },
    gen: { m: 'ου', f: 'ης', n: 'ου' },
  },
  pl: {
    nom: { m: 'οι', f: 'ες', n: 'α' },
    acc: { m: 'ους', f: 'ες', n: 'α' },
    gen: { m: 'ων', f: 'ων', n: 'ων' },
  },
};
```

- [ ] **Step 5: Update `src/data/lexemes.ts`**

After the `zestos` constant add:

```ts
const grigoros: GreekAdjective = {
  id: 'grigoros',
  pos: 'adjective',
  lemma: 'γρήγορος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'γρήγορ',
  ro: {
    lemma: 'rapid',
    forms: {
      m: { sg: 'rapid', pl: 'rapizi' },
      f: { sg: 'rapidă', pl: 'rapide', genSg: 'rapide' },
      n: { sg: 'rapid', pl: 'rapide' },
    },
  },
  en: 'quick',
};

const tembelikos: GreekAdjective = {
  id: 'tembelikos',
  pos: 'adjective',
  lemma: 'τεμπέλικος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'τεμπέλικ',
  ro: {
    lemma: 'leneș',
    forms: {
      m: { sg: 'leneș', pl: 'leneși' },
      f: { sg: 'leneșă', pl: 'leneșe', genSg: 'leneșe' },
      n: { sg: 'leneș', pl: 'leneșe' },
    },
  },
  en: 'lazy',
};

const kafeAdj: GreekAdjective = {
  id: 'kafe-adj',
  pos: 'adjective',
  lemma: 'καφέ',
  verified: { el: false, ro: false, en: false },
  class: 'adj-indeclinable',
  stem: 'καφέ',
  ro: {
    lemma: 'maro',
    forms: {
      m: { sg: 'maro', pl: 'maro' },
      f: { sg: 'maro', pl: 'maro' },
      n: { sg: 'maro', pl: 'maro' },
    },
  },
  en: 'brown',
};
```

In `LEXEMES` add `[grigoros.id]: grigoros, [tembelikos.id]: tembelikos, [kafeAdj.id]: kafeAdj,`.

In `src/data/review.ts` add `{ id: 'ending-table:adj-unstressed', kind: 'ending-table', verified: false },`.

- [ ] **Step 6: Update `inflectAdjective` in `src/engine/greek.ts`**

Add `ADJ_UNSTRESSED` to the paradigms import. Replace `inflectAdjective` with:

```ts
const INDECLINABLE: IrregularNote = {
  rule: 'indeclinable',
  plain: 'This adjective never changes, whatever the noun, number or role.',
};

export function inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form {
  if (l.class === 'adj-indeclinable') return { stem: l.stem, ending: '', irregular: INDECLINABLE };
  const table = l.class === 'adj-stressed' ? ADJ_STRESSED : ADJ_UNSTRESSED;
  return { stem: l.stem, ending: table[s.number][s.case][s.gender] };
}
```

and add `IrregularNote` to the type import of that file.

- [ ] **Step 7: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: add stem-stressed and indeclinable adjectives" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: The contracted verb πηδάω

**Files:**
- Modify: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`

**Interfaces:**
- Produces: `VerbClass = 'omega' | 'contracted-ao'`; `VERB_PRESENT: Record<VerbClass, readonly string[]>` (replaces `VERB_OMEGA_PRESENT`); lexeme id `'pidao'`.

- [ ] **Step 1: Write the failing test**

Append to `src/engine/greek.test.ts`:

```ts
describe('inflectVerb (πηδάω, contracted -άω class)', () => {
  const pidao = getLexeme('pidao');
  const slot = (person: 1 | 2 | 3, number: 'sg' | 'pl') =>
    ({ pos: 'verb', person, number, mood: 'indicative', tense: 'present', voice: 'active' }) as const;

  it.each([
    [1, 'sg', 'άω'],
    [2, 'sg', 'άς'],
    [3, 'sg', 'άει'],
    [1, 'pl', 'άμε'],
    [2, 'pl', 'άτε'],
    [3, 'pl', 'άνε'],
  ] as const)('person %i %s -> πηδ + %s', (person, number, ending) => {
    expect(inflect(pidao, slot(person, number))).toEqual({ stem: 'πηδ', ending });
  });

  it('θέλω still uses the -ω endings', () => {
    expect(inflect(getLexeme('thelo'), slot(3, 'sg'))).toEqual({ stem: 'θέλ', ending: 'ει' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: FAIL (`unknown lexeme: pidao`).

- [ ] **Step 3: Update `src/types.ts`**

Above `GreekVerb` add `export type VerbClass = 'omega' | 'contracted-ao';` and change `class: 'omega';` in `GreekVerb` to `class: VerbClass;`.

- [ ] **Step 4: Update `src/data/paradigms.ts`**

Change the import to include `VerbClass`: `import type { Case, Gender, IrregularNote, Num, NounClass, NumeralValue, VerbClass } from '../types';`. Replace the `VERB_OMEGA_PRESENT` declaration with:

```ts
/** Present active endings in the order 1sg 2sg 3sg 1pl 2pl 3pl. */
export const VERB_PRESENT: Record<VerbClass, readonly string[]> = {
  omega: ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'],
  /** Contracted verbs: the stressed ending replaces the -ω endings (πηδάω, πηδάς, πηδάει …). */
  'contracted-ao': ['άω', 'άς', 'άει', 'άμε', 'άτε', 'άνε'],
};
```

- [ ] **Step 5: Update `src/data/lexemes.ts` and `src/data/review.ts`**

After the `thelo` constant add:

```ts
const pidao: GreekVerb = {
  id: 'pidao',
  pos: 'verb',
  lemma: 'πηδάω',
  verified: { el: false, ro: false, en: false },
  class: 'contracted-ao',
  stems: { present: 'πηδ' },
  ro: { lemma: 'a sări', present: ['sar', 'sari', 'sare', 'sărim', 'săriți', 'sar'] },
  en: { gloss: 'jump', base: 'jump', third: 'jumps' },
};
```

Add `[pidao.id]: pidao,` to `LEXEMES`. In `review.ts` replace the id `'ending-table:verb-omega-present'` with `'ending-table:verb-present'` and add `{ id: 'ending-table:verb-contracted-ao-present', kind: 'ending-table', verified: false },`.

- [ ] **Step 6: Update `inflectVerb` in `src/engine/greek.ts`**

Replace `VERB_OMEGA_PRESENT` in the paradigms import with `VERB_PRESENT`, and replace the function body:

```ts
export function inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form {
  const index = s.person - 1 + (s.number === 'pl' ? 3 : 0);
  return { stem: l.stems.present, ending: VERB_PRESENT[l.class][index] };
}
```

- [ ] **Step 7: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: add the contracted verb class and πηδάω" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Panel state, the noun and value controls, and one module per part of speech

**Files:**
- Create: `src/panels/types.ts`, `src/panels/shared.ts`, `src/panels/verb.ts`, `src/panels/noun.ts`, `src/panels/adjective.ts`, `src/panels/numeral.ts`, `src/panels/article.ts`
- Rewrite: `src/panels/panels.ts`, `src/panels/panels.test.ts`
- Modify: `src/types.ts`, `src/App.tsx`, `src/App.test.tsx`, `src/components/WordPanel.tsx`, `src/components/WordPanel.test.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: Tasks 1 to 4.
- Produces:
  - `PanelState = { slot: Slot; noun: string | null; nounNumber: Num }`.
  - `initialState(token: Token, phrase: Phrase): PanelState`; `sameState(a: PanelState, b: PanelState): boolean`; `buildPanel(state: PanelState, token: Token, level: Level): Panel` (no `phrase` argument any more); `applyControl(state: PanelState, key: string, value: string): PanelState`.
  - `Panel` gains `full: PanelRow[]` (empty until Task 8) and `irregular: string`; `PanelRow` gains an optional `hl` (per-column highlight); `Control.key` is `'who' | 'noun' | 'number' | 'count' | 'value' | 'case'`.
  - Noun slot: `{ pos: 'noun'; number: Num; case: Case; count?: 2 | 3 | 4 | 5 }`. Control `count` values are `'1'`, `'2'` to `'5'`, `'many'`.
  - Controls: noun panel `count` and `case`; adjective `noun`, `number`, `case`; numeral `value`, `noun`, `case`; article `noun`, `number`, `case`; verb `who`.

- [ ] **Step 1: Write the failing tests**

Replace the whole of `src/panels/panels.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const phrase = PHRASES[0];
const stateFor = (i: number): PanelState => initialState(phrase.tokens[i], phrase);
const panelFor = (i: number, level: Level = 'beginner', state: PanelState = stateFor(i)) =>
  buildPanel(state, phrase.tokens[i], level);
const text = (rows: ReturnType<typeof panelFor>['rows'], i: number) => ({
  el: richText(rows[i].el),
  ro: richText(rows[i].ro),
  en: richText(rows[i].en),
});

describe('initialState', () => {
  it('takes the slot from the token and the noun from agreesWith', () => {
    expect(stateFor(2)).toEqual({ slot: phrase.tokens[2].slot, noun: 'kafes', nounNumber: 'sg' });
  });
  it('has no noun for a verb or a noun', () => {
    expect(stateFor(0).noun).toBeNull();
    expect(stateFor(3).noun).toBeNull();
  });
});

describe('verb panel (θέλω)', () => {
  const panel = panelFor(0);
  it('has lemma, label and a Who? control', () => {
    expect(panel.lemma).toBe('θέλω');
    expect(panel.posLabel).toBe('verb: to want');
    expect(panel.controls).toHaveLength(1);
    expect(panel.controls[0]).toMatchObject({ key: 'who', label: 'Who?', value: '1sg' });
  });
  it('shows the dropped Greek and Romanian pronouns and the required English one', () => {
    expect(text(panel.rows, 0)).toEqual({ el: '(εγώ) θέλω', ro: '(eu) vreau', en: 'I want' });
    expect(panel.rows[0].el[0].role).toBe('dim');
    expect(panel.rows[0].en[0].role).toBe('pronoun');
  });
  it('follows the person: 3sg', () => {
    const p = panelFor(0, 'beginner', applyControl(stateFor(0), 'who', '3sg'));
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) θέλει', ro: '(el/ea) vrea', en: 'he/she wants' });
  });
  it('uses the technical label for Improver', () => {
    expect(panelFor(0, 'improver').posLabel).toBe('verb · -ω class · active');
  });
  it('names the class of a contracted verb and explains it', () => {
    const token: Token = {
      text: 'πηδάει',
      lexeme: 'pidao',
      slot: { pos: 'verb', person: 3, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    };
    const state: PanelState = { slot: token.slot, noun: null, nounNumber: 'sg' };
    const p = buildPanel(state, token, 'improver');
    expect(p.posLabel).toBe('verb · contracted -άω class · active');
    expect(p.irregular).toContain('Contracted');
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) πηδάει', ro: '(el/ea) sare', en: 'he/she jumps' });
  });
});

describe('noun panel (καφές)', () => {
  it('shows the definite and indefinite phrases in three languages', () => {
    const panel = panelFor(3);
    expect(panel.lemma).toBe('καφές');
    expect(panel.posLabel).toBe('noun: coffee (masculine)');
    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case']);
    expect(panel.controls[0].value).toBe('1');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον καφέ', ro: 'cafeaua', en: 'the coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.note).toContain('feminine in Romanian');
  });
  it('explains the dropped ς in the accusative', () => {
    expect(panelFor(3).irregular).toContain('final ς drops');
    expect(panelFor(3, 'beginner', applyControl(stateFor(3), 'case', 'nom')).irregular).toBe('');
  });
  it('"many" shows no plural a / an', () => {
    const panel = panelFor(3, 'beginner', applyControl(stateFor(3), 'count', 'many'));
    expect(text(panel.rows, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(panel.rows[1].label).toBe('a / an');
    expect(richText(panel.rows[1].el)).toBe('none in plural');
    expect(panel.rows[1].el[0].role).toBe('dim');
    expect(panel.controls[0].value).toBe('many');
  });
  it('a number from 2 to 5 shows the counted phrase', () => {
    const panel = panelFor(3, 'beginner', applyControl(stateFor(3), 'count', '3'));
    expect(panel.controls[0].value).toBe('3');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    expect(text(panel.rows, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
  it('going back to one clears the count', () => {
    const three = applyControl(stateFor(3), 'count', '3');
    expect(applyControl(three, 'count', '1').slot).toEqual({ pos: 'noun', number: 'sg', case: 'acc' });
  });
  it('describes the Improver label with the Romanian gender', () => {
    expect(panelFor(3, 'improver').posLabel).toBe('noun · masculine · Romanian: cafea (feminine)');
  });
});

describe('adjective panel (ζεστός)', () => {
  it('lists the lemma in three genders and builds noun phrases with the noun it goes with', () => {
    const panel = panelFor(2);
    expect(panel.lemma).toBe('ζεστός / ζεστή / ζεστό');
    expect(panel.posLabel).toBe('adjective: hot');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
    expect(panel.controls[0].value).toBe('kafes');
    expect(text(panel.rows, 0)).toEqual({ el: 'τον ζεστό καφέ', ro: 'cafeaua caldă', en: 'the hot coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν ζεστό καφέ', ro: 'o cafea caldă', en: 'a hot coffee' });
    expect(panel.irregular).toBe('');
  });
  it('follows the genitive', () => {
    const panel = panelFor(2, 'beginner', applyControl(stateFor(2), 'case', 'gen'));
    expect(text(panel.rows, 0)).toEqual({ el: 'του ζεστού καφέ', ro: 'cafelei calde', en: 'of the hot coffee' });
  });
  it('changing the noun changes the gender, in Greek and in Romanian separately', () => {
    const neuter = applyControl(stateFor(2), 'noun', 'paidi');
    expect(neuter.noun).toBe('paidi');
    expect(neuter.slot).toMatchObject({ pos: 'adjective', gender: 'n' });
    expect(text(panelFor(2, 'beginner', neuter).rows, 0)).toEqual({
      el: 'το ζεστό παιδί',
      ro: 'copilul cald',
      en: 'the hot child',
    });
    const feminine = applyControl(stateFor(2), 'noun', 'alepou');
    expect(text(panelFor(2, 'beginner', feminine).rows, 0)).toEqual({
      el: 'την ζεστή αλεπού',
      ro: 'vulpea caldă',
      en: 'the hot fox',
    });
  });
  it('uses the technical class label for Improver', () => {
    expect(panelFor(2, 'improver').posLabel).toBe('adjective · 3-ending (stressed)');
  });
});

describe('numeral panel (ένας … πέντε)', () => {
  it('one: the numeral and the counted noun phrase', () => {
    const panel = panelFor(1);
    expect(panel.lemma).toBe('ένας / μία / ένα');
    expect(panel.posLabel).toBe('article: a / an');
    expect(panel.controls.map((c) => c.key)).toEqual(['value', 'noun', 'case']);
    expect(panel.rows.map((r) => r.label)).toEqual(['number', 'counting']);
    expect(text(panel.rows, 0)).toEqual({ el: 'έναν', ro: 'o', en: 'a / an (one)' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.irregular).toContain('changes with gender');
  });
  it('three counts a plural noun and only the neuter differs', () => {
    const panel = panelFor(1, 'beginner', applyControl(stateFor(1), 'value', '3'));
    expect(panel.lemma).toBe('τρεις / τρία');
    expect(panel.posLabel).toBe('number: three');
    expect(text(panel.rows, 0)).toEqual({ el: 'τρεις', ro: 'trei', en: 'three' });
    expect(text(panel.rows, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
    expect(panel.irregular).toContain('neuter');
  });
  it('two never changes in Greek, but Romanian follows its own gender', () => {
    const state = applyControl(applyControl(stateFor(1), 'noun', 'alepou'), 'value', '2');
    const panel = panelFor(1, 'beginner', state);
    expect(panel.lemma).toBe('δύο');
    expect(text(panel.rows, 0)).toEqual({ el: 'δύο', ro: 'două', en: 'two' });
    expect(text(panel.rows, 1)).toEqual({ el: 'δύο αλεπούδες', ro: 'două vulpi', en: 'two foxes' });
    expect(panel.irregular).toBe('Does not change at all.');
  });
});

describe('article panel (ο, η, το)', () => {
  const token: Token = {
    text: 'τον',
    lexeme: 'def',
    slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' },
    agreesWith: 0,
  };
  const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
  it('shows the article with its noun', () => {
    const panel = buildPanel(state, token, 'beginner');
    expect(panel.lemma).toBe('ο / η / το');
    expect(panel.posLabel).toBe('article: the');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
  });
});

describe('applyControl and sameState', () => {
  it('sets person and number from a who value', () => {
    expect(applyControl(stateFor(0), 'who', '2pl').slot).toMatchObject({ person: 2, number: 'pl' });
  });
  it('sets the case', () => {
    expect(applyControl(stateFor(3), 'case', 'gen').slot).toMatchObject({ pos: 'noun', case: 'gen' });
  });
  it('sets the value of a numeral', () => {
    expect(applyControl(stateFor(1), 'value', '5').slot).toMatchObject({ pos: 'numeral', value: 5 });
  });
  it('ignores a control that does not apply and returns the same state', () => {
    const state = stateFor(1);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
    expect(applyControl(stateFor(0), 'noun', 'paidi')).toEqual(stateFor(0));
    expect(applyControl(state, 'nonsense', 'x')).toBe(state);
  });
  it('sameState compares by value', () => {
    expect(sameState(stateFor(2), stateFor(2))).toBe(true);
    expect(sameState(stateFor(2), applyControl(stateFor(2), 'case', 'gen'))).toBe(false);
  });
});
```

In `src/components/WordPanel.test.tsx`: change the import to `import { buildPanel, initialState } from '../panels/panels';` and replace the `panelFor` helper with:

```tsx
const panelFor = (i: number) => buildPanel(initialState(phrase.tokens[i], phrase), phrase.tokens[i], 'beginner');
```

In the first test change `expect(screen.getByLabelText('How many?')).toHaveValue('sg');` to `.toHaveValue('1')`, and add this test inside the `describe`:

```tsx
  it('shows the irregularity message when there is one', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getByText(/final ς drops/)).toBeInTheDocument();
  });
```

In `src/App.test.tsx`, in the test `keeps each word’s own choices when switching between words` change `'pl'` to `'many'` in both places (`selectOptions(screen.getByLabelText('How many?'), 'many')` and `.toHaveValue('many')`).

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/panels src/components src/App.test.tsx`
Expected: FAIL (`initialState` is not exported from `./panels`).

- [ ] **Step 3: Update `src/types.ts`**

In the `Slot` union replace the noun line with:

```ts
  | { pos: 'noun'; number: Num; case: Case; count?: Exclude<NumeralValue, 1> }
```

- [ ] **Step 4: Create `src/panels/types.ts`**

```ts
import type { Option } from '../engine/labels';
import type { Rich } from '../engine/segments';
import type { Num, Slot } from '../types';

export interface Control {
  key: 'who' | 'noun' | 'number' | 'count' | 'value' | 'case';
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
}

export interface Panel {
  lemma: string;
  posLabel: string;
  controls: Control[];
  rows: PanelRow[];
  /** The full paradigm; filled only at the Improver level. */
  full: PanelRow[];
  plain: string;
  /** A one-line reason when the form in use is irregular, or ''. */
  irregular: string;
  note: string;
}

/** What the word panel works on: a copy of the token's slot plus the noun the word goes with. */
export interface PanelState {
  slot: Slot;
  /** Lexeme id of the noun an article, numeral, adjective or preposition goes with; null for other words. */
  noun: string | null;
  /** Number of that noun, used by the preposition panel (other words carry it in their slot). */
  nounNumber: Num;
}
```

- [ ] **Step 5: Create `src/panels/shared.ts`**

```ts
import { LEXEMES, getLexeme } from '../data/lexemes';
import type { NounPhrase } from '../engine/agree';
import { GENDER_NAME, caseOptions, numberOptions, type Option } from '../engine/labels';
import { dim, plain } from '../engine/segments';
import type { Case, Gender, GreekNoun, Level, Num } from '../types';
import type { Control, PanelRow, PanelState } from './types';

export const GENDERS: Gender[] = ['m', 'f', 'n'];
export const CASES: Case[] = ['nom', 'acc', 'gen'];
export const NUMS: Num[] = ['sg', 'pl'];

export const npRow = (label: string, np: NounPhrase): PanelRow => ({
  label,
  el: np.el,
  ro: plain(np.ro),
  en: plain(np.en),
});

export const noPluralArticleRow = (): PanelRow => ({
  label: 'a / an',
  el: dim('none in plural'),
  ro: dim('none in plural'),
  en: dim('none in plural'),
});

export const caseControl = (slot: { case: Case }, level: Level): Control => ({
  key: 'case',
  label: 'Role in sentence',
  options: caseOptions(level),
  value: slot.case,
});

export const numberControl = (value: Num): Control => ({
  key: 'number',
  label: 'How many?',
  options: numberOptions,
  value,
});

export function nounOptions(): Option[] {
  return Object.values(LEXEMES).flatMap((l) =>
    l.pos === 'noun' ? [{ value: l.id, label: `${l.lemma} (${GENDER_NAME[l.gender]})` }] : [],
  );
}

export const nounControl = (label: string, state: PanelState): Control => ({
  key: 'noun',
  label,
  options: nounOptions(),
  value: state.noun ?? '',
});

/** The noun an article, numeral, adjective or preposition goes with. */
export function nounOf(state: PanelState): GreekNoun {
  if (!state.noun) throw new Error('this word needs a noun to go with');
  const lexeme = getLexeme(state.noun);
  if (lexeme.pos !== 'noun') throw new Error(`lexeme ${state.noun} is not a noun`);
  return lexeme;
}
```

- [ ] **Step 6: Create `src/panels/verb.ts`**

```ts
import { enVerb } from '../engine/english';
import { inflectVerb } from '../engine/greek';
import { EN_PRONOUNS, GREEK_PRONOUNS, RO_PRONOUNS, whoOptions } from '../engine/labels';
import { roVerb } from '../engine/romanian';
import { formRich } from '../engine/segments';
import type { GreekVerb, Level, SlotOf, VerbClass } from '../types';
import type { Panel, PanelRow } from './types';

const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
};

export const whoIndex = (slot: SlotOf<'verb'>): number => slot.person - 1 + (slot.number === 'pl' ? 3 : 0);

export function verbRow(verb: GreekVerb, slot: SlotOf<'verb'>): PanelRow {
  const index = whoIndex(slot);
  return {
    label: whoOptions[index].label,
    el: [
      { text: `(${GREEK_PRONOUNS[index]})`, role: 'dim' },
      { text: ' ', role: 'plain' },
      ...formRich(inflectVerb(verb, slot)),
    ],
    ro: [
      { text: `(${RO_PRONOUNS[index]})`, role: 'dim' },
      { text: ' ', role: 'plain' },
      { text: roVerb(verb, slot), role: 'plain' },
    ],
    en: [
      { text: EN_PRONOUNS[index], role: 'pronoun' },
      { text: ' ', role: 'plain' },
      { text: enVerb(verb, slot), role: 'plain' },
    ],
  };
}

export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  return {
    lemma: verb.lemma,
    posLabel: level === 'beginner' ? `verb: to ${verb.en.gloss}` : `verb · ${CLASS_LABEL[verb.class]} · active`,
    controls: [{ key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` }],
    rows: [verbRow(verb, slot)],
    full: [],
    plain:
      'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
    irregular:
      verb.class === 'contracted-ao'
        ? 'Contracted -άω verbs: the stressed ending (-άς, -άει) replaces the -ω endings.'
        : '',
    note: '',
  };
}
```

- [ ] **Step 7: Create `src/panels/noun.ts`**

```ts
import { nounPhrase } from '../engine/agree';
import { inflectNoun } from '../engine/greek';
import { GENDER_NAME, type Option } from '../engine/labels';
import type { GreekNoun, Level, SlotOf } from '../types';
import { caseControl, noPluralArticleRow, npRow } from './shared';
import type { Panel } from './types';

export const countOptions: Option[] = [
  { value: '1', label: 'one' },
  { value: '2', label: 'two' },
  { value: '3', label: 'three' },
  { value: '4', label: 'four' },
  { value: '5', label: 'five' },
  { value: 'many', label: 'many' },
];

export const countValue = (slot: SlotOf<'noun'>): string =>
  slot.number === 'sg' ? '1' : slot.count ? String(slot.count) : 'many';

export function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level): Panel {
  const second =
    slot.number === 'sg'
      ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one' }))
      : slot.count
        ? npRow('with a number', nounPhrase(noun, 'pl', slot.case, { count: slot.count }))
        : noPluralArticleRow();
  return {
    lemma: noun.lemma,
    posLabel:
      level === 'beginner'
        ? `noun: ${noun.en.sg} (${GENDER_NAME[noun.gender]})`
        : `noun · ${GENDER_NAME[noun.gender]} · Romanian: ${noun.ro.lemma} (${GENDER_NAME[noun.ro.gender]})`,
    controls: [
      { key: 'count', label: 'How many?', options: countOptions, value: countValue(slot) },
      caseControl(slot, level),
    ],
    rows: [npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite' })), second],
    full: [],
    plain: 'The article agrees with the noun in gender, number and role.',
    irregular: inflectNoun(noun, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
```

- [ ] **Step 8: Create `src/panels/adjective.ts`**

```ts
import { nounPhrase } from '../engine/agree';
import { inflectAdjective } from '../engine/greek';
import { formRich, richText } from '../engine/segments';
import type { AdjectiveClass, GreekAdjective, Level, SlotOf } from '../types';
import { GENDERS, caseControl, noPluralArticleRow, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Panel, PanelState } from './types';

const CLASS_LABEL: Record<AdjectiveClass, string> = {
  'adj-stressed': 'adjective · 3-ending (stressed)',
  'adj-unstressed': 'adjective · 3-ending (stem-stressed)',
  'adj-indeclinable': 'adjective · indeclinable',
};

export function adjectivePanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const forms = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  );
  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel: level === 'beginner' ? `adjective: ${adj.en}` : CLASS_LABEL[adj.class],
    controls: [nounControl('Noun it describes', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [
      npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite', adjective: adj })),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one', adjective: adj }))
        : noPluralArticleRow(),
    ],
    full: [],
    plain:
      'The Greek adjective copies gender, number and role from the noun. Romanian copies gender and number and goes after the noun. English never changes.',
    irregular: inflectAdjective(adj, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
```

- [ ] **Step 9: Create `src/panels/numeral.ts`**

```ts
import { nounPhrase } from '../engine/agree';
import { enNumeral } from '../engine/english';
import { inflectNumeral } from '../engine/greek';
import { roNumeral } from '../engine/romanian';
import { numeralRich, plain, richText } from '../engine/segments';
import type { GreekNumeral, Level, NumeralValue, SlotOf } from '../types';
import { GENDERS, caseControl, nounControl, nounOf, npRow } from './shared';
import type { Panel, PanelState } from './types';

const VALUES: NumeralValue[] = [1, 2, 3, 4, 5];

function irregularText(value: NumeralValue): string {
  if (value === 1) return 'One declines like a noun and also changes with gender.';
  if (value === 3 || value === 4) return 'Only the neuter differs (τρία, τέσσερα), and the genitive is τριών / τεσσάρων.';
  return 'Does not change at all.';
}

export function numeralPanel(numeral: GreekNumeral, slot: SlotOf<'numeral'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const forms = GENDERS.map((gender) =>
    richText(numeralRich(inflectNumeral(numeral, { pos: 'numeral', value: slot.value, gender, case: 'nom' }))),
  );
  const form = inflectNumeral(numeral, { pos: 'numeral', value: slot.value, gender: noun.gender, case: slot.case });
  const counting =
    slot.value === 1
      ? nounPhrase(noun, 'sg', slot.case, { article: 'one' })
      : nounPhrase(noun, 'pl', slot.case, { count: slot.value });
  const word = enNumeral(numeral, slot.value);
  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel:
      slot.value === 1
        ? level === 'beginner'
          ? 'article: a / an'
          : 'numeral · doubles as the indefinite article'
        : level === 'beginner'
          ? `number: ${word}`
          : `numeral · ${slot.value === 2 || slot.value === 5 ? 'invariable' : 'agrees in gender and case'}`,
    controls: [
      {
        key: 'value',
        label: 'Number',
        options: VALUES.map((v) => ({ value: String(v), label: `${v} (${enNumeral(numeral, v)})` })),
        value: String(slot.value),
      },
      nounControl('Noun it counts', state),
      caseControl(slot, level),
    ],
    rows: [
      {
        label: 'number',
        el: numeralRich(form),
        ro: plain(roNumeral(numeral, slot.value, noun.ro.gender, slot.case)),
        en: plain(slot.value === 1 ? 'a / an (one)' : word),
      },
      npRow('counting', counting),
    ],
    full: [],
    plain:
      'The numeral agrees with the noun it counts; the noun is plural for 2 and up. Romanian changes 1 and 2 by gender; English never changes.',
    irregular: irregularText(slot.value),
    note: noun.note,
  };
}
```

- [ ] **Step 10: Create `src/panels/article.ts`**

```ts
import { nounPhrase } from '../engine/agree';
import type { Level, SlotOf } from '../types';
import { caseControl, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Panel, PanelState } from './types';

export function articlePanel(slot: SlotOf<'article'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [nounControl('Noun it goes with', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    full: [],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    irregular: '',
    note: noun.note,
  };
}
```

- [ ] **Step 11: Rewrite `src/panels/panels.ts`**

```ts
import { getLexeme } from '../data/lexemes';
import type {
  Case,
  GreekAdjective,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
  Level,
  Num,
  NumeralValue,
  Person,
  Phrase,
  Token,
} from '../types';
import { adjectivePanel } from './adjective';
import { articlePanel } from './article';
import { nounPanel } from './noun';
import { numeralPanel } from './numeral';
import type { Panel, PanelState } from './types';
import { verbPanel } from './verb';

export type { Control, Panel, PanelRow, PanelState } from './types';

/** The state a word's panel starts in: the token's own slot and the noun it goes with in the phrase. */
export function initialState(token: Token, phrase: Phrase): PanelState {
  const nounToken = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
  return {
    slot: token.slot,
    noun: nounToken ? nounToken.lexeme : null,
    nounNumber: nounToken && nounToken.slot.pos === 'noun' ? nounToken.slot.number : 'sg',
  };
}

export const sameState = (a: PanelState, b: PanelState): boolean => JSON.stringify(a) === JSON.stringify(b);

export function buildPanel(state: PanelState, token: Token, level: Level): Panel {
  const lexeme = getLexeme(token.lexeme);
  const slot = state.slot;
  if (lexeme.pos !== slot.pos) throw new Error(`slot ${slot.pos} does not fit lexeme ${lexeme.id}`);
  switch (slot.pos) {
    case 'verb':
      return verbPanel(lexeme as GreekVerb, slot, level);
    case 'noun':
      return nounPanel(lexeme as GreekNoun, slot, level);
    case 'adjective':
      return adjectivePanel(lexeme as GreekAdjective, slot, state, level);
    case 'numeral':
      return numeralPanel(lexeme as GreekNumeral, slot, state, level);
    case 'article':
      return articlePanel(slot, state, level);
  }
}

/** Returns a new state with one control applied; a control that does not apply returns the same state. */
export function applyControl(state: PanelState, key: string, value: string): PanelState {
  const { slot } = state;
  switch (key) {
    case 'who':
      if (slot.pos === 'verb') {
        return { ...state, slot: { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num } };
      }
      break;
    case 'case':
      if (slot.pos !== 'verb') return { ...state, slot: { ...slot, case: value as Case } };
      break;
    case 'number':
      if (slot.pos === 'adjective' || slot.pos === 'article') {
        return { ...state, slot: { ...slot, number: value as Num } };
      }
      break;
    case 'count':
      if (slot.pos === 'noun') {
        if (value === '1') return { ...state, slot: { pos: 'noun', number: 'sg', case: slot.case } };
        if (value === 'many') return { ...state, slot: { pos: 'noun', number: 'pl', case: slot.case } };
        return {
          ...state,
          slot: { pos: 'noun', number: 'pl', case: slot.case, count: Number(value) as Exclude<NumeralValue, 1> },
        };
      }
      break;
    case 'value':
      if (slot.pos === 'numeral') return { ...state, slot: { ...slot, value: Number(value) as NumeralValue } };
      break;
    case 'noun': {
      const noun = getLexeme(value);
      if (noun.pos !== 'noun') break;
      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral') {
        return { ...state, noun: value, slot: { ...slot, gender: noun.gender } };
      }
      break;
    }
  }
  return state;
}
```

- [ ] **Step 12: Update `WordPanel`, the app and the styles**

In `src/components/WordPanel.tsx`, add this line directly after the `<p className="plain">{panel.plain}</p>` line:

```tsx
      {panel.irregular && <p className="warn">{panel.irregular}</p>}
```

Replace the whole of `src/App.tsx` with:

```tsx
import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { LevelToggle } from './components/LevelToggle';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { PHRASES } from './data/phrases';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';
import { readLevel, writeLevel } from './storage';
import type { Level } from './types';

export function App() {
  const phrase = PHRASES[0];
  const initial = phrase.tokens.map((t) => initialState(t, phrase));
  const [states, setStates] = useState<PanelState[]>(initial);
  const [selected, setSelected] = useState(0);
  const [level, setLevel] = useState<Level>(readLevel);

  const token = phrase.tokens[selected];
  const state = states[selected];
  const panel = buildPanel(state, token, level);
  const divergences = selectDivergences(DIVERGENCES, state.slot.pos, token.lexeme, level);
  const differsFromPhrase = !sameState(state, initial[selected]);

  function changeLevel(next: Level) {
    setLevel(next);
    writeLevel(next);
  }

  function changeControl(key: string, value: string) {
    setStates((current) => current.map((s, i) => (i === selected ? applyControl(s, key, value) : s)));
  }

  function resetToPhrase() {
    setStates((current) => current.map((s, i) => (i === selected ? initial[selected] : s)));
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Greek Grammar Explorer</h1>
        <LevelToggle value={level} onChange={changeLevel} />
      </header>
      <section className="card" aria-label={phrase.title}>
        <PhraseBar tokens={phrase.tokens} selected={selected} onSelect={setSelected} />
        <GlossGrid glosses={phrase.glosses} selected={selected} onSelect={setSelected} />
      </section>
      {differsFromPhrase && (
        <div className="phrase-status" role="status">
          <span>Differs from the phrase.</span>
          <button type="button" onClick={resetToPhrase}>
            Reset to phrase
          </button>
        </div>
      )}
      <WordPanel panel={panel} onChange={changeControl} />
      <ComparisonTable rows={divergences} word={token.text} />
    </main>
  );
}
```

Append to `src/styles.css`:

```css
.warn { font-size: 13px; color: var(--warn-text); margin: 8px 0 0; }
```

- [ ] **Step 13: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "refactor: panel state and one module per part of speech, with noun, count and value controls" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Prepositions

**Files:**
- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/data/review.ts` (no change), `src/engine/greek.ts`, `src/validate/validate.ts`, `src/panels/panels.ts`
- Create: `src/panels/preposition.ts`
- Test: `src/engine/greek.test.ts`, `src/validate/validate.test.ts`, `src/panels/panels.test.ts`

**Interfaces:**
- Produces: `GreekPreposition` (`lemma`, `ro`, `en`, `meaning`); `Slot` variant `{ pos: 'preposition' }`; lexeme ids `'pano'`, `'kato'`, `'me'`, `'gia'`; `PREPOSITIONS: GreekPreposition[]` (the four, in that order); `inflectPreposition(l, s): Form` (`{ stem: l.lemma, ending: '' }`); `prepositionRow(prep, noun, number): PanelRow` and `prepositionPanel(prep, state, level)`.
- Controls on the preposition panel: `noun` ("Noun after it") and `number` ("How many?", applied to `state.nounNumber`).

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/greek.test.ts` (and add `inflectPreposition` to the import from `./greek`):

```ts
describe('inflectPreposition', () => {
  it('never changes: the whole word is the stem', () => {
    expect(inflect(getLexeme('pano'), { pos: 'preposition' })).toEqual({ stem: 'πάνω από', ending: '' });
    expect(inflect(getLexeme('me'), { pos: 'preposition' })).toEqual({ stem: 'με', ending: '' });
  });
});
```

Append to `src/validate/validate.test.ts` (inside the `describe('validate', ...)` block, before its closing `});`):

```ts
  it('reports an empty Romanian or English form on a preposition', () => {
    const lexemes = {
      ...LEXEMES,
      pano: { ...LEXEMES.pano, ro: '' },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme pano: empty Romanian form');
  });
```

Append to `src/panels/panels.test.ts`:

```ts
describe('preposition panel (πάνω από)', () => {
  const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
  const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };

  it('shows the preposition with the article and noun in the accusative', () => {
    const panel = buildPanel(state, token, 'beginner');
    expect(panel.lemma).toBe('πάνω από');
    expect(panel.posLabel).toBe('preposition: over');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
    expect(panel.controls[0].label).toBe('Noun after it');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + noun']);
    expect(text(panel.rows, 0)).toEqual({ el: 'πάνω από τον σκύλο', ro: 'peste câinele', en: 'over the dog' });
    expect(panel.note).toBe('Masculine in Greek and Romanian.');
  });

  it('follows the noun and its number', () => {
    const feminine = applyControl(state, 'noun', 'alepou');
    expect(feminine.noun).toBe('alepou');
    expect(feminine.slot).toEqual({ pos: 'preposition' });
    expect(text(buildPanel(feminine, token, 'beginner').rows, 0)).toEqual({
      el: 'πάνω από την αλεπού',
      ro: 'peste vulpea',
      en: 'over the fox',
    });
    const plural = applyControl(state, 'number', 'pl');
    expect(plural.nounNumber).toBe('pl');
    expect(text(buildPanel(plural, token, 'beginner').rows, 0)).toEqual({
      el: 'πάνω από τους σκύλους',
      ro: 'peste câinii',
      en: 'over the dogs',
    });
  });

  it('uses the technical label for Improver', () => {
    expect(buildPanel(state, token, 'improver').posLabel).toBe('preposition · governs the accusative');
  });

  it('initialState takes the governed noun and its number from the phrase', () => {
    const governed: Token = {
      text: 'σκύλο',
      lexeme: 'skylos',
      slot: { pos: 'noun', number: 'sg', case: 'acc' },
    };
    const mini = { ...PHRASES[0], tokens: [governed, token] };
    expect(initialState(token, mini)).toEqual({ slot: token.slot, noun: 'skylos', nounNumber: 'sg' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run`
Expected: FAIL (`unknown lexeme: pano`; TypeScript errors do not stop Vitest).

- [ ] **Step 3: Update `src/types.ts`**

In the `Slot` union add as the last member:

```ts
  | { pos: 'preposition' }
```

(keep the closing `;` on the last member, so the numeral line loses its `;` and the new line ends with it). Add above `GreekLexeme`:

```ts
export interface GreekPreposition extends LexemeBase {
  pos: 'preposition';
  ro: string;
  en: string;
  /** A short plain meaning, used to label rows in the preposition table. */
  meaning: string;
}
```

and change the union to `export type GreekLexeme = GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition;`. Update the doc comment of `Token.agreesWith` to: `/** Index of the noun this article, numeral, adjective or preposition goes with. */`.

- [ ] **Step 4: Update `src/data/lexemes.ts`**

Add `GreekPreposition` to the type import. After the `pidao` constant add:

```ts
const preposition = (id: string, lemma: string, ro: string, en: string, meaning: string): GreekPreposition => ({
  id,
  pos: 'preposition',
  lemma,
  verified: { el: false, ro: false, en: false },
  ro,
  en,
  meaning,
});

const pano = preposition('pano', 'πάνω από', 'peste', 'over', 'above');
const kato = preposition('kato', 'κάτω από', 'sub', 'under', 'below');
const me = preposition('me', 'με', 'cu', 'with', 'with');
const gia = preposition('gia', 'για', 'pentru', 'for', 'for');
```

Add `[pano.id]: pano, [kato.id]: kato, [me.id]: me, [gia.id]: gia,` to `LEXEMES`, and after `NUMERAL` add:

```ts
/** The prepositions shown together in the Improver table, in display order. */
export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia];
```

- [ ] **Step 5: Update the engine, the validator and the dispatcher**

In `src/engine/greek.ts`: add `GreekPreposition` to the type import, and before `inflect` add:

```ts
export function inflectPreposition(l: GreekPreposition, _s: SlotOf<'preposition'>): Form {
  return { stem: l.lemma, ending: '' };
}
```

then add to the `switch` in `inflect`:

```ts
    case 'preposition':
      return inflectPreposition(l, s as SlotOf<'preposition'>);
```

In `src/validate/validate.ts`:

1. In `slotsFor` add the branch `case 'preposition': return [{ pos: 'preposition' }];`.
2. In `checkLexeme` add (before `return errors;`):

```ts
  if (l.pos === 'preposition') {
    if (isEmpty(l.ro)) errors.push(`lexeme ${l.id}: empty Romanian form`);
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
  }
```

3. In `checkToken` add, after the block that checks adjectives, numerals and articles:

```ts
  if (token.slot.pos === 'preposition') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const noun = target ? lexemes[target.lexeme] : undefined;
    if (!noun || noun.pos !== 'noun') {
      errors.push(`${where}: preposition needs agreesWith pointing at the noun it governs`);
    }
  }
```

- [ ] **Step 6: Create `src/panels/preposition.ts`**

```ts
import { nounPhrase } from '../engine/agree';
import { numberOptions } from '../engine/labels';
import { plain } from '../engine/segments';
import type { GreekNoun, GreekPreposition, Level, Num } from '../types';
import { nounControl, nounOf } from './shared';
import type { Panel, PanelRow, PanelState } from './types';

/** One preposition followed by the definite noun phrase in the accusative, in three languages. */
export function prepositionRow(prep: GreekPreposition, noun: GreekNoun, number: Num, label: string): PanelRow {
  const np = nounPhrase(noun, number, 'acc', { article: 'definite' });
  return {
    label,
    el: [{ text: prep.lemma, role: 'plain' }, { text: ' ', role: 'plain' }, ...np.el],
    ro: plain(`${prep.ro} ${np.ro}`),
    en: plain(`${prep.en} ${np.en}`),
  };
}

export function prepositionPanel(prep: GreekPreposition, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: prep.lemma,
    posLabel: level === 'beginner' ? `preposition: ${prep.en}` : 'preposition · governs the accusative',
    controls: [
      nounControl('Noun after it', state),
      { key: 'number', label: 'How many?', options: numberOptions, value: state.nounNumber },
    ],
    rows: [prepositionRow(prep, noun, state.nounNumber, 'prep. + noun')],
    full: [],
    plain:
      'Greek prepositions are followed by the accusative, so the article and noun switch to accusative (τον σκύλο). The preposition itself never changes.',
    irregular: '',
    note: noun.note,
  };
}
```

- [ ] **Step 7: Wire the preposition into `src/panels/panels.ts`**

Add `GreekPreposition` to the type import and `import { prepositionPanel } from './preposition';`. In `buildPanel` add:

```ts
    case 'preposition':
      return prepositionPanel(lexeme as GreekPreposition, state, level);
```

In `applyControl`:
- change the `'case'` branch to `if (slot.pos !== 'verb' && slot.pos !== 'preposition') return { ...state, slot: { ...slot, case: value as Case } };`
- in the `'number'` branch, after the adjective/article `if`, add `if (slot.pos === 'preposition') return { ...state, nounNumber: value as Num };`
- in the `'noun'` branch, after the existing `if`, add `if (slot.pos === 'preposition') return { ...state, noun: value };`

- [ ] **Step 8: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: add prepositions and their panel" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Phrases 2 and 3, glosses with segments

**Files:**
- Modify: `src/types.ts`, `src/glossLinks.ts`, `src/data/phrases.ts`, `src/data/divergences.ts`, `src/validate/validate.ts`, `src/components/GlossGrid.tsx`, `scripts/validate.ts`
- Test: `src/glossLinks.test.ts`, `src/validate/validate.test.ts`, `src/components/GlossGrid.test.tsx`, `src/panels/phrase3.test.ts` (new)

**Interfaces:**
- Consumes: Tasks 1 to 6.
- Produces:
  - `GlossUnit = { text: string; link: Link | null } | { segments: { text: string; link: Link }[] }`.
  - `isSegmented(unit): boolean` (type guard), `unitText(unit): string`, `linksOf(unit): Link[]` in `src/glossLinks.ts`.
  - `PHRASES` has three phrases: `ordering-hot-coffee` (index 0), `ordering-three-coffees` (1), `fox-sentence` (2).
  - `warnings(input: ValidationInput): string[]` in `validate.ts`: authored gloss segments that disagree with the noun's `ro.split`.

- [ ] **Step 1: Write the failing tests**

In `src/glossLinks.test.ts` change the import to `import { isSegmented, linkedPiece, linkedToken, linksOf, unitText } from './glossLinks';` and append:

```ts
describe('segmented gloss units', () => {
  const plainUnit = { text: 'cafea', link: 3 };
  const segmented = {
    segments: [
      { text: 'câine', link: 8 },
      { text: 'le', link: 6 },
    ],
  };

  it('tells the two kinds apart', () => {
    expect(isSegmented(segmented)).toBe(true);
    expect(isSegmented(plainUnit)).toBe(false);
  });
  it('joins the segments into the text of the unit', () => {
    expect(unitText(segmented)).toBe('câinele');
    expect(unitText(plainUnit)).toBe('cafea');
  });
  it('lists every link of a unit', () => {
    expect(linksOf(segmented)).toEqual([8, 6]);
    expect(linksOf(plainUnit)).toEqual([3]);
    expect(linksOf({ text: '(I)', link: null })).toEqual([]);
  });
});
```

In `src/validate/validate.test.ts` change the import to `import { validate, warnings } from './validate';`, add `import { isSegmented, unitText } from '../glossLinks';` and `import type { GlossUnit } from '../types';` (extend the existing types import), and append this block at the end of the file:

```ts
describe('segmented gloss units', () => {
  const fox = PHRASES.find((p) => p.id === 'fox-sentence') as Phrase;

  /** The fox sentence with its Romanian "câinele" unit replaced by the given segments. */
  const withDogUnit = (segments: { text: string; link: number }[]): Phrase => ({
    ...fox,
    glosses: fox.glosses.map((g) =>
      g.language === 'ro' && g.kind === 'natural'
        ? {
            ...g,
            units: g.units.map((u): GlossUnit => (isSegmented(u) && unitText(u) === 'câinele' ? { segments } : u)),
          }
        : g,
    ),
  });

  it('the real data has no errors and no warnings', () => {
    expect(validate(real)).toEqual([]);
    expect(warnings(real)).toEqual([]);
  });

  it('reports a segment that links to a missing token', () => {
    const bad = withDogUnit([
      { text: 'câine', link: 99 },
      { text: 'le', link: 6 },
    ]);
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: unit "câinele" links to missing token 99',
    );
  });

  it('warns when the authored split disagrees with the noun data', () => {
    const bad = withDogUnit([
      { text: 'câin', link: 8 },
      { text: 'ele', link: 6 },
    ]);
    expect(warnings({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: "câinele" is split câin + ele, the noun data splits it câine + le',
    );
  });

  it('warns when a segmented unit is not linked to a noun', () => {
    const bad = withDogUnit([
      { text: 'câine', link: 6 },
      { text: 'le', link: 7 },
    ]);
    expect(warnings({ ...real, phrases: [bad] })).toContain(
      'fox-sentence gloss ro/natural: segmented unit "câinele" is not linked to a noun',
    );
  });
});
```

Append to `src/components/GlossGrid.test.tsx` (the file already imports `PHRASES`, `userEvent`, `vi`, `render`, `screen`):

```tsx
describe('GlossGrid with segmented units (the fox sentence)', () => {
  const fox = PHRASES[2].glosses;
  const pressed = (name: string) => screen.getAllByRole('button', { name }).map((b) => b.getAttribute('aria-pressed'));

  it('shows each segment as its own button, in both Romanian rows', () => {
    render(<GlossGrid glosses={fox} selected={0} onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { name: 'câine' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'le' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'câinele' })).not.toBeInTheDocument();
  });

  it('selecting the article highlights only the suffix', () => {
    render(<GlossGrid glosses={fox} selected={6} onSelect={() => {}} />);
    expect(pressed('le')).toEqual(['true', 'true']);
    expect(pressed('câine')).toEqual(['false', 'false']);
  });

  it('selecting the noun highlights only the stem', () => {
    render(<GlossGrid glosses={fox} selected={8} onSelect={() => {}} />);
    expect(pressed('câine')).toEqual(['true', 'true']);
    expect(pressed('le')).toEqual(['false', 'false']);
  });

  it('clicking a segment selects the token it is linked to', async () => {
    const onSelect = vi.fn();
    render(<GlossGrid glosses={fox} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'le' })[0]);
    expect(onSelect).toHaveBeenLastCalledWith(6);
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'vulpe' })[0]);
    expect(onSelect).toHaveBeenLastCalledWith(3);
  });
});
```

Create `src/panels/phrase3.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level } from '../types';
import { buildPanel, initialState, type PanelState } from './panels';

const fox = PHRASES[2];
const three = PHRASES[1];
const panelFor = (phrase = fox, i: number, level: Level = 'beginner', state?: PanelState) =>
  buildPanel(state ?? initialState(phrase.tokens[i], phrase), phrase.tokens[i], level);
const row = (panel: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(panel.rows[i].el),
  ro: richText(panel.rows[i].ro),
  en: richText(panel.rows[i].en),
});

describe('the fox sentence', () => {
  it('has nine tokens in the right order', () => {
    expect(fox.tokens.map((t) => t.text)).toEqual([
      'Η', 'γρήγορη', 'καφέ', 'αλεπού', 'πηδάει', 'πάνω από', 'τον', 'τεμπέλικο', 'σκύλο',
    ]);
  });
  it('Η: the article with the fox', () => {
    const p = panelFor(fox, 0);
    expect(p.controls[0].value).toBe('alepou');
    expect(row(p, 0)).toEqual({ el: 'η αλεπού', ro: 'vulpea', en: 'the fox' });
  });
  it('γρήγορη: the stem-stressed adjective', () => {
    const p = panelFor(fox, 1);
    expect(p.lemma).toBe('γρήγορος / γρήγορη / γρήγορο');
    expect(row(p, 0)).toEqual({ el: 'η γρήγορη αλεπού', ro: 'vulpea rapidă', en: 'the quick fox' });
  });
  it('καφέ: the indeclinable adjective says it never changes', () => {
    const p = panelFor(fox, 2);
    expect(p.lemma).toBe('καφέ');
    expect(row(p, 0)).toEqual({ el: 'η καφέ αλεπού', ro: 'vulpea maro', en: 'the brown fox' });
    expect(p.irregular).toContain('never changes');
  });
  it('αλεπού: the invariable singular', () => {
    const p = panelFor(fox, 3);
    expect(row(p, 0)).toEqual({ el: 'η αλεπού', ro: 'vulpea', en: 'the fox' });
    expect(row(p, 1)).toEqual({ el: 'μία αλεπού', ro: 'o vulpe', en: 'a fox' });
    expect(p.irregular).toContain('does not change');
  });
  it('πηδάει: the contracted verb in the third person', () => {
    expect(row(panelFor(fox, 4), 0)).toEqual({
      el: '(αυτός/ή) πηδάει',
      ro: '(el/ea) sare',
      en: 'he/she jumps',
    });
  });
  it('πάνω από: the preposition with the dog in the accusative', () => {
    expect(row(panelFor(fox, 5), 0)).toEqual({
      el: 'πάνω από τον σκύλο',
      ro: 'peste câinele',
      en: 'over the dog',
    });
  });
  it('τον and τεμπέλικο and σκύλο go with the dog', () => {
    expect(row(panelFor(fox, 6), 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
    expect(row(panelFor(fox, 7), 0)).toEqual({ el: 'τον τεμπέλικο σκύλο', ro: 'câinele leneș', en: 'the lazy dog' });
    expect(row(panelFor(fox, 8), 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
    expect(panelFor(fox, 8).irregular).toContain('final ς drops');
  });
});

describe('ordering three coffees', () => {
  it('τρεις: the numeral three counting the coffees', () => {
    const p = panelFor(three, 1);
    expect(p.lemma).toBe('τρεις / τρία');
    expect(row(p, 0)).toEqual({ el: 'τρεις', ro: 'trei', en: 'three' });
    expect(row(p, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
  it('καφέδες: the noun starts at the count three', () => {
    const p = panelFor(three, 2);
    expect(p.controls[0].value).toBe('3');
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    expect(row(p, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(row(p, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run`
Expected: FAIL (`isSegmented` is not exported; `fox-sentence` is not found).

- [ ] **Step 3: Update `src/types.ts` and `src/glossLinks.ts`**

In `src/types.ts` replace the `GlossUnit` interface with:

```ts
export type GlossUnit =
  | { text: string; link: Link | null }
  /** A unit made of parts that link to different Greek tokens (Romanian câine|le). */
  | { segments: { text: string; link: Link }[] };
```

Replace the whole of `src/glossLinks.ts` with:

```ts
import type { GlossUnit, Link, TokenIndex } from './types';

export type SegmentedUnit = Extract<GlossUnit, { segments: unknown }>;

/** The token a gloss link points at (the whole link, or the token of a piece link). */
export function linkedToken(link: Link): TokenIndex {
  return typeof link === 'number' ? link : link.token;
}

/** The piece of the token the link points at, or null when it points at the whole token. */
export function linkedPiece(link: Link): number | null {
  return typeof link === 'number' ? null : link.piece;
}

export const isSegmented = (unit: GlossUnit): unit is SegmentedUnit => 'segments' in unit;

/** The text of a unit; for a segmented unit, its segments joined (câine + le = câinele). */
export function unitText(unit: GlossUnit): string {
  return isSegmented(unit) ? unit.segments.map((s) => s.text).join('') : unit.text;
}

/** Every Greek link a unit carries. A unit with no Greek counterpart has none. */
export function linksOf(unit: GlossUnit): Link[] {
  if (isSegmented(unit)) return unit.segments.map((s) => s.link);
  return unit.link === null ? [] : [unit.link];
}
```

- [ ] **Step 4: Replace `src/data/phrases.ts`**

```ts
import type { GlossRow, Phrase, Slot, Token } from '../types';

const verbSlot = (person: 1 | 2 | 3): Slot => ({
  pos: 'verb',
  person,
  number: 'sg',
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
});

const orderingHotCoffee: Phrase = {
  id: 'ordering-hot-coffee',
  title: 'Ordering a hot coffee',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 3 },
    { text: 'ζεστό', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 3 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: [
    {
      language: 'en',
      kind: 'natural',
      units: [
        { text: 'I want', link: 0 },
        { text: 'a', link: 1 },
        { text: 'hot', link: 2 },
        { text: 'coffee', link: 3 },
      ],
    },
    {
      language: 'en',
      kind: 'literal',
      units: [
        { text: '(I)', link: null },
        { text: 'want', link: 0 },
        { text: 'a-one', link: 1 },
        { text: 'hot', link: 2 },
        { text: 'coffee', link: 3 },
      ],
    },
    {
      language: 'ro',
      kind: 'natural',
      units: [
        { text: 'Vreau', link: 0 },
        { text: 'o', link: 1 },
        { text: 'cafea', link: 3 },
        { text: 'caldă', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'literal',
      units: [
        { text: '(Eu)', link: null },
        { text: 'vreau', link: 0 },
        { text: 'o', link: 1 },
        { text: 'cafea', link: 3 },
        { text: 'caldă', link: 2 },
      ],
    },
  ],
  verified: false,
};

const orderingThreeCoffees: Phrase = {
  id: 'ordering-three-coffees',
  title: 'Ordering three coffees',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'τρεις', lexeme: 'numeral', slot: { pos: 'numeral', value: 3, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέδες', lexeme: 'kafes', slot: { pos: 'noun', number: 'pl', case: 'acc', count: 3 } },
  ],
  glosses: [
    {
      language: 'en',
      kind: 'natural',
      units: [
        { text: 'I want', link: 0 },
        { text: 'three', link: 1 },
        { text: 'coffees', link: 2 },
      ],
    },
    {
      language: 'en',
      kind: 'literal',
      units: [
        { text: '(I)', link: null },
        { text: 'want', link: 0 },
        { text: 'three', link: 1 },
        { text: 'coffees', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'natural',
      units: [
        { text: 'Vreau', link: 0 },
        { text: 'trei', link: 1 },
        { text: 'cafele', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'literal',
      units: [
        { text: '(Eu)', link: null },
        { text: 'vreau', link: 0 },
        { text: 'trei', link: 1 },
        { text: 'cafele', link: 2 },
      ],
    },
  ],
  verified: false,
};

const foxTokens: Token[] = [
  { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'γρήγορη', lexeme: 'grigoros', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'καφέ', lexeme: 'kafe-adj', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
  { text: 'πηδάει', lexeme: 'pidao', slot: verbSlot(3) },
  { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 8 },
  { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 8 },
  { text: 'τεμπέλικο', lexeme: 'tembelikos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 8 },
  { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];

const foxGlosses: GlossRow[] = [
  {
    language: 'en',
    kind: 'natural',
    units: [
      { text: 'The', link: 0 },
      { text: 'quick', link: 1 },
      { text: 'brown', link: 2 },
      { text: 'fox', link: 3 },
      { text: 'jumps', link: 4 },
      { text: 'over', link: 5 },
      { text: 'the', link: 6 },
      { text: 'lazy', link: 7 },
      { text: 'dog', link: 8 },
    ],
  },
  {
    language: 'en',
    kind: 'literal',
    units: [
      { text: 'The', link: 0 },
      { text: 'quick-[f]', link: 1 },
      { text: 'brown-[indecl.]', link: 2 },
      { text: 'fox', link: 3 },
      { text: '(she) jumps', link: 4 },
      { text: 'above-from', link: 5 },
      { text: 'the-[acc]', link: 6 },
      { text: 'lazy-[acc]', link: 7 },
      { text: 'dog-[acc]', link: 8 },
    ],
  },
  {
    language: 'ro',
    kind: 'natural',
    units: [
      {
        segments: [
          { text: 'vulpe', link: 3 },
          { text: 'a', link: 0 },
        ],
      },
      { text: 'rapidă', link: 1 },
      { text: 'și', link: null },
      { text: 'maro', link: 2 },
      { text: 'sare', link: 4 },
      { text: 'peste', link: 5 },
      {
        segments: [
          { text: 'câine', link: 8 },
          { text: 'le', link: 6 },
        ],
      },
      { text: 'leneș', link: 7 },
    ],
  },
  {
    language: 'ro',
    kind: 'literal',
    units: [
      {
        segments: [
          { text: 'vulpe', link: 3 },
          { text: 'a', link: 0 },
        ],
      },
      { text: 'rapidă', link: 1 },
      { text: 'maro', link: 2 },
      { text: '(ea) sare', link: 4 },
      { text: 'peste', link: 5 },
      {
        segments: [
          { text: 'câine', link: 8 },
          { text: 'le', link: 6 },
        ],
      },
      { text: 'leneș', link: 7 },
    ],
  },
];

const foxSentence: Phrase = {
  id: 'fox-sentence',
  title: 'The quick brown fox jumps over the lazy dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: foxTokens,
  glosses: foxGlosses,
  verified: false,
};

export const PHRASES: Phrase[] = [orderingHotCoffee, orderingThreeCoffees, foxSentence];
```

- [ ] **Step 5: Add the divergence rows**

In `src/data/divergences.ts`, add these entries at the end of the `DIVERGENCES` array (before the closing `];`):

```ts
  {
    id: 'numeral-noun',
    appliesTo: { pos: 'numeral' },
    point: 'Noun after it',
    el: 'plural, same role: τρεις καφέδες',
    ro: 'plural: trei cafele',
    en: 'plural: three coffees',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'numeral-agreement-3-4',
    appliesTo: { pos: 'numeral' },
    point: 'Which numbers change',
    el: '1, 3 and 4 change with gender; 2 and 5 never do',
    ro: 'only 1 and 2 change (un / o, doi / două)',
    en: 'none: never changes',
    tag: 'differs',
    level: 'extra',
    verified: false,
  },
  {
    id: 'indeclinable-changes',
    appliesTo: { pos: 'adjective', lexeme: 'kafe-adj' },
    point: 'Changes?',
    el: 'never: καφέ is indeclinable',
    ro: 'never: maro is invariable',
    en: 'never',
    tag: 'same',
    level: 'core',
    verified: false,
  },
  {
    id: 'indeclinable-position',
    appliesTo: { pos: 'adjective', lexeme: 'kafe-adj' },
    point: 'Position',
    el: 'before the noun',
    ro: 'after the noun: vulpea maro',
    en: 'before the noun',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'preposition-case',
    appliesTo: { pos: 'preposition' },
    point: 'Case after it',
    el: 'accusative: τον σκύλο',
    ro: 'accusative (peste câinele)',
    en: 'no case on nouns',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'preposition-article',
    appliesTo: { pos: 'preposition' },
    point: 'Article',
    el: 'stays before the noun',
    ro: 'attached to the noun',
    en: 'the dog',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'pidao-third-person',
    appliesTo: { pos: 'verb', lexeme: 'pidao' },
    point: '3rd person',
    el: '-άει: the ending changes with the person',
    ro: 'sare: the ending changes with the person',
    en: 'jumps: only the 3rd singular adds -s',
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

- [ ] **Step 6: Update the validator**

In `src/validate/validate.ts`:

1. Replace `import { linkedToken } from '../glossLinks';` with `import { isSegmented, linkedToken, linksOf, unitText } from '../glossLinks';`.
2. Replace the whole `for (const unit of row.units) { ... }` loop in `checkPhrase` with:

```ts
      for (const unit of row.units) {
        for (const link of linksOf(unit)) {
          const token = linkedToken(link);
          if (token < 0 || token >= phrase.tokens.length) {
            errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" links to missing token ${token}`);
          }
          if (typeof link === 'object' && (!Number.isInteger(link.piece) || link.piece < 0)) {
            errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" has an invalid piece ${link.piece}`);
          }
        }
      }
```

3. Append at the end of the file:

```ts
/** Problems that do not fail the build: authored gloss segments that disagree with the noun data (spec 4.5). */
export function warnings(input: ValidationInput): string[] {
  const out: string[] = [];
  for (const phrase of input.phrases) {
    for (const row of phrase.glosses) {
      if (row.language !== 'ro') continue;
      for (const unit of row.units) {
        if (!isSegmented(unit)) continue;
        const where = `${phrase.id} gloss ro/${row.kind}`;
        const nounToken = unit.segments
          .map((s) => phrase.tokens[linkedToken(s.link)])
          .find((t) => t !== undefined && t.slot.pos === 'noun');
        const noun = nounToken ? input.lexemes[nounToken.lexeme] : undefined;
        if (!nounToken || nounToken.slot.pos !== 'noun' || !noun || noun.pos !== 'noun') {
          out.push(`${where}: segmented unit "${unitText(unit)}" is not linked to a noun`);
          continue;
        }
        const expected = noun.ro.split[nounToken.slot.number];
        const actual = unit.segments.map((s) => s.text);
        if (actual.length !== 2 || actual[0] !== expected[0] || actual[1] !== expected[1]) {
          out.push(
            `${where}: "${unitText(unit)}" is split ${actual.join(' + ')}, the noun data splits it ${expected.join(' + ')}`,
          );
        }
      }
    }
  }
  return out;
}
```

In `scripts/validate.ts` change the import to `import { validate, warnings } from '../src/validate/validate';` and, after the `unverified` report block and before the `if (errors.length > 0)` block, add:

```ts
const warned = warnings({ lexemes: LEXEMES, phrases: PHRASES });
if (warned.length > 0) {
  console.log(`Warnings (${warned.length}):\n  ${warned.join('\n  ')}`);
}
```

- [ ] **Step 7: Replace `src/components/GlossGrid.tsx`**

```tsx
import { isSegmented, linkedToken } from '../glossLinks';
import type { GlossRow } from '../types';

interface Props {
  glosses: GlossRow[];
  selected: number;
  onSelect: (index: number) => void;
}

const LANGUAGE_NAME = { en: 'English', ro: 'Română' } as const;

export function GlossGrid({ glosses, selected, onSelect }: Props) {
  return (
    <div className="gloss-grid">
      {glosses.map((row, i) => {
        const firstOfLanguage = i === 0 || glosses[i - 1].language !== row.language;
        return (
          <div className="gloss-row" key={`${row.language}-${row.kind}`} lang={row.language}>
            <span className="gloss-language">{firstOfLanguage ? LANGUAGE_NAME[row.language] : ''}</span>
            <span className="gloss-kind">{row.kind}</span>
            <span className="gloss-units">
              {row.units.map((unit, j) => {
                if (isSegmented(unit)) {
                  return (
                    <span key={j} className="gloss-unit gloss-segmented">
                      {unit.segments.map((segment, k) => (
                        <button
                          key={k}
                          type="button"
                          className="gloss-segment"
                          aria-pressed={linkedToken(segment.link) === selected}
                          onClick={() => onSelect(linkedToken(segment.link))}
                        >
                          {segment.text}
                        </button>
                      ))}
                    </span>
                  );
                }
                const link = unit.link;
                if (link === null) {
                  return (
                    <span key={j} className="gloss-unit is-gap">
                      {unit.text}
                    </span>
                  );
                }
                return (
                  <button
                    key={j}
                    type="button"
                    className="gloss-unit"
                    aria-pressed={linkedToken(link) === selected}
                    onClick={() => onSelect(linkedToken(link))}
                  >
                    {unit.text}
                  </button>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.` and no `Warnings` block.

```bash
git add -A && git commit -m "feat: add phrases 2 and 3 with gloss segments, and validate them" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Improver full paradigm tables

**Files:**
- Modify: `src/engine/segments.ts`, `src/data/paradigms.ts`, `src/data/review.ts`, `src/panels/shared.ts`, `src/panels/verb.ts`, `src/panels/noun.ts`, `src/panels/adjective.ts`, `src/panels/numeral.ts`, `src/panels/article.ts`, `src/panels/preposition.ts`, `src/components/FormTable.tsx`, `src/components/WordPanel.tsx`
- Test: `src/panels/full.test.ts` (new), `src/components/WordPanel.test.tsx`

**Interfaces:**
- Consumes: Tasks 5 to 7.
- Produces: `Role` gains `'sub'`; `RO_ARTICLE_SUFFIX: Record<Num, Record<Gender, { direct: string; genitive: string }>>`; `ALL`, `caseName(c)`, `GENDER_ROW` in `panels/shared.ts`; `Panel.full` filled when `level === 'improver'`; a `PanelRow.hl` makes `FormTable` mark the cell with the class `cur`.
- Row labels in the full tables: verb `I`/`you`/…; noun `nominative sg` … `genitive pl`; adjective, numeral and article `masc. nominative` … `neut. genitive`; preposition: the preposition's `meaning`.

- [ ] **Step 1: Write the failing tests**

Create `src/panels/full.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';
import type { PanelRow } from './types';

const hot = PHRASES[0];
const improver = (i: number, state: PanelState = initialState(hot.tokens[i], hot)) =>
  buildPanel(state, hot.tokens[i], 'improver').full;
const cells = (r: PanelRow) => ({ el: richText(r.el), ro: richText(r.ro), en: richText(r.en) });
const find = (rows: PanelRow[], label: string) => rows.find((r) => r.label === label) as PanelRow;

describe('full paradigm tables', () => {
  it('are empty at the Beginner level', () => {
    for (let i = 0; i < hot.tokens.length; i++) {
      expect(buildPanel(initialState(hot.tokens[i], hot), hot.tokens[i], 'beginner').full).toEqual([]);
    }
  });

  it('verb: six persons, the current one highlighted in every column', () => {
    const full = improver(0);
    expect(full.map((r) => r.label)).toEqual(['I', 'you', 'he / she', 'we', 'you (pl.)', 'they']);
    expect(cells(full[0])).toEqual({ el: '(εγώ) θέλω', ro: '(eu) vreau', en: 'I want' });
    expect(cells(full[5])).toEqual({ el: '(αυτοί/ές) θέλουν', ro: '(ei/ele) vor', en: 'they want' });
    expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
    expect(full.filter((r) => r.hl).length).toBe(1);
  });

  it('noun: case × number with the indefinite form underneath', () => {
    const full = improver(3);
    expect(full.map((r) => r.label)).toEqual([
      'nominative sg', 'nominative pl', 'accusative sg', 'accusative pl', 'genitive sg', 'genitive pl',
    ]);
    const accSg = cells(find(full, 'accusative sg'));
    expect(accSg.el).toContain('τον καφέ');
    expect(accSg.el).toContain('έναν καφέ');
    expect(accSg.ro).toContain('cafeaua');
    expect(accSg.ro).toContain('o cafea');
    expect(accSg.en).toContain('the coffee');
    expect(accSg.en).toContain('a coffee');
    expect(cells(find(full, 'accusative pl')).el).toContain('no plural a / an');
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['accusative sg']);
  });

  it('noun: a counted plural highlights the plural row', () => {
    const state = applyControl(initialState(hot.tokens[3], hot), 'count', '3');
    expect(improver(3, state).filter((r) => r.hl).map((r) => r.label)).toEqual(['accusative pl']);
  });

  it('adjective: the Greek and Romanian columns highlight different genders', () => {
    const full = improver(2);
    expect(full).toHaveLength(9);
    const mAcc = find(full, 'masc. accusative');
    expect(cells(mAcc)).toEqual({ el: 'ζεστό', ro: 'cald', en: 'hot' });
    expect(mAcc.hl).toEqual({ el: true, ro: false, en: false });
    const fAcc = find(full, 'fem. accusative');
    expect(cells(fAcc)).toEqual({ el: 'ζεστή', ro: 'caldă', en: 'hot' });
    expect(fAcc.hl).toEqual({ el: false, ro: true, en: false });
  });

  it('numeral: gender × case, the same highlighting rule', () => {
    const full = improver(1);
    expect(full).toHaveLength(9);
    expect(cells(find(full, 'neut. nominative'))).toEqual({ el: 'ένα', ro: 'un', en: 'one' });
    expect(cells(find(full, 'fem. genitive'))).toEqual({ el: 'μίας', ro: 'unei', en: 'one' });
    expect(find(full, 'masc. accusative').hl).toEqual({ el: true, ro: false, en: false });
    expect(find(full, 'fem. accusative').hl).toEqual({ el: false, ro: true, en: false });
  });

  it('article: the Romanian suffixes and the English "the"', () => {
    const token: Token = {
      text: 'τον',
      lexeme: 'def',
      slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' },
      agreesWith: 0,
    };
    const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
    const full = buildPanel(state, token, 'improver').full;
    expect(full).toHaveLength(9);
    const mAcc = find(full, 'masc. accusative');
    expect(cells(mAcc)).toEqual({ el: 'τον', ro: '-ul / -le', en: 'the' });
    expect(mAcc.hl).toEqual({ el: true, ro: true, en: true });
    expect(cells(find(full, 'masc. genitive'))).toEqual({ el: 'του', ro: '-ului / -lui', en: 'of the' });
    expect(find(full, 'fem. accusative').hl).toEqual({ el: false, ro: false, en: true });
  });

  it('preposition: the four prepositions with the same noun, the current one highlighted', () => {
    const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
    const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
    const full = buildPanel(state, token, 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['above', 'below', 'with', 'for']);
    expect(cells(full[1])).toEqual({ el: 'κάτω από τον σκύλο', ro: 'sub câinele', en: 'under the dog' });
    expect(full[0].hl).toEqual({ el: true, ro: true, en: true });
    expect(full.filter((r) => r.hl).length).toBe(1);
  });
});
```

In `src/components/WordPanel.test.tsx` (it already imports `buildPanel` and `initialState`) append inside the `describe`:

```tsx
  it('shows the full paradigm table in Improver, with the form in use outlined', () => {
    const improver = buildPanel(initialState(phrase.tokens[3], phrase), phrase.tokens[3], 'improver');
    render(<WordPanel panel={improver} onChange={() => {}} />);
    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getByText(/Full paradigm/)).toBeInTheDocument();
    expect(document.querySelectorAll('td.cur')).toHaveLength(3);
  });

  it('shows no full paradigm table in Beginner', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.queryByText(/Full paradigm/)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/panels/full.test.ts src/components/WordPanel.test.tsx`
Expected: FAIL (the `full` arrays are empty).

- [ ] **Step 3: Update the data and the segment roles**

In `src/engine/segments.ts` change the `Role` type to:

```ts
export type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim' | 'sub';
```

Append to `src/data/paradigms.ts`:

```ts
/** The Romanian definite article as a suffix, by the noun's Romanian gender (spec 5.1). */
export const RO_ARTICLE_SUFFIX: Record<Num, Record<Gender, { direct: string; genitive: string }>> = {
  sg: {
    m: { direct: '-ul / -le', genitive: '-ului / -lui' },
    f: { direct: '-a / -ea', genitive: '-ei' },
    n: { direct: '-ul', genitive: '-ului' },
  },
  pl: {
    m: { direct: '-i', genitive: '-lor' },
    f: { direct: '-le', genitive: '-lor' },
    n: { direct: '-le', genitive: '-lor' },
  },
};
```

In `src/data/review.ts` add `{ id: 'ending-table:ro-article-suffix', kind: 'ending-table', verified: false },`.

Append to `src/panels/shared.ts`:

```ts
/** Highlight a cell in every column. */
export const ALL = { el: true, ro: true, en: true };

export const GENDER_ROW: Record<Gender, string> = { m: 'masc.', f: 'fem.', n: 'neut.' };

export const caseName = (c: Case): string => caseOptions('improver').find((o) => o.value === c)?.label ?? c;
```

- [ ] **Step 4: Build the full tables, one module at a time**

`src/panels/verb.ts`: add `Person` to the type import, `ALL` import `import { ALL } from './shared';`, and add before `verbPanel`:

```ts
const whoSlot = (slot: SlotOf<'verb'>, i: number): SlotOf<'verb'> => ({
  ...slot,
  person: ((i % 3) + 1) as Person,
  number: i < 3 ? 'sg' : 'pl',
});
```

Change `verbPanel` to build the rows from `verbRow` and set `full`:

```ts
    full:
      level === 'improver'
        ? [0, 1, 2, 3, 4, 5].map((i) => ({
            ...verbRow(verb, whoSlot(slot, i)),
            hl: i === whoIndex(slot) ? ALL : undefined,
          }))
        : [],
```

`src/panels/noun.ts`: add the imports `import { richText, plain } from '../engine/segments';`, `ALL, CASES, NUMS, caseName` from `./shared`, `PanelRow` from `./types`, and add before `nounPanel`:

```ts
function nounFull(noun: GreekNoun, slot: SlotOf<'noun'>): PanelRow[] {
  const rows: PanelRow[] = [];
  for (const c of CASES) {
    for (const n of NUMS) {
      const def = nounPhrase(noun, n, c, { article: 'definite' });
      const one = n === 'sg' ? nounPhrase(noun, 'sg', c, { article: 'one' }) : null;
      const none = 'no plural a / an';
      rows.push({
        label: `${caseName(c)} ${n}`,
        el: [...def.el, { text: one ? richText(one.el) : none, role: 'sub' }],
        ro: [...plain(def.ro), { text: one ? one.ro : none, role: 'sub' }],
        en: [...plain(def.en), { text: one ? one.en : none, role: 'sub' }],
        hl: n === slot.number && c === slot.case ? ALL : undefined,
      });
    }
  }
  return rows;
}
```

and in `nounPanel` replace `full: [],` with `full: level === 'improver' ? nounFull(noun, slot) : [],`.

`src/panels/adjective.ts`: add imports `import { plain } from '../engine/segments';` (extend the existing import), `import { roAdjective } from '../engine/romanian';`, `CASES, GENDER_ROW, caseName` from `./shared`, `PanelRow` from `./types`, and before `adjectivePanel`:

```ts
function adjectiveFull(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => ({
      label: `${GENDER_ROW[g]} ${caseName(c)}`,
      el: formRich(inflectAdjective(adj, { pos: 'adjective', gender: g, number: slot.number, case: c })),
      ro: plain(roAdjective(adj, g, slot.number, c)),
      en: plain(adj.en),
      hl: { el: g === noun.gender && c === slot.case, ro: g === noun.ro.gender && c === slot.case, en: false },
    })),
  );
}
```

(add `GreekNoun` to the type import) and replace `full: [],` with `full: level === 'improver' ? adjectiveFull(adj, slot, noun) : [],`.

`src/panels/numeral.ts`: add `CASES, GENDER_ROW, caseName` to the `./shared` import and `PanelRow` to the `./types` import, and before `numeralPanel`:

```ts
function numeralFull(numeral: GreekNumeral, slot: SlotOf<'numeral'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => ({
      label: `${GENDER_ROW[g]} ${caseName(c)}`,
      el: numeralRich(inflectNumeral(numeral, { pos: 'numeral', value: slot.value, gender: g, case: c })),
      ro: plain(roNumeral(numeral, slot.value, g, c)),
      en: plain(enNumeral(numeral, slot.value)),
      hl: { el: g === noun.gender && c === slot.case, ro: g === noun.ro.gender && c === slot.case, en: false },
    })),
  );
}
```

(add `GreekNoun` to the type import) and replace `full: [],` with `full: level === 'improver' ? numeralFull(numeral, slot, noun) : [],`.

`src/panels/article.ts`: replace the file with:

```ts
import { DEF_ARTICLE } from '../data/lexemes';
import { RO_ARTICLE_SUFFIX } from '../data/paradigms';
import { nounPhrase } from '../engine/agree';
import { inflectArticle } from '../engine/greek';
import { articleRich, plain } from '../engine/segments';
import type { GreekNoun, Level, SlotOf } from '../types';
import {
  CASES,
  GENDERS,
  GENDER_ROW,
  caseControl,
  caseName,
  nounControl,
  nounOf,
  npRow,
  numberControl,
} from './shared';
import type { Panel, PanelRow, PanelState } from './types';

function articleFull(slot: SlotOf<'article'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    CASES.map((c) => {
      const suffix = RO_ARTICLE_SUFFIX[slot.number][g];
      return {
        label: `${GENDER_ROW[g]} ${caseName(c)}`,
        el: articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: g, number: slot.number, case: c })),
        ro: plain(c === 'gen' ? suffix.genitive : suffix.direct),
        en: plain(c === 'gen' ? 'of the' : 'the'),
        hl: {
          el: g === noun.gender && c === slot.case,
          ro: g === noun.ro.gender && c === slot.case,
          en: c === slot.case,
        },
      };
    }),
  );
}

export function articlePanel(slot: SlotOf<'article'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [nounControl('Noun it goes with', state), numberControl(slot.number), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    full: level === 'improver' ? articleFull(slot, noun) : [],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    irregular: '',
    note: noun.note,
  };
}
```

`src/panels/preposition.ts`: add `import { PREPOSITIONS } from '../data/lexemes';` and `import { ALL } from './shared';` (extend the existing shared import), change `prepositionRow`'s signature use unchanged, and replace `full: [],` with:

```ts
    full:
      level === 'improver'
        ? PREPOSITIONS.map((p) => ({
            ...prepositionRow(p, noun, state.nounNumber, p.meaning),
            hl: p.id === prep.id ? ALL : undefined,
          }))
        : [],
```

- [ ] **Step 5: Update `FormTable` and `WordPanel`**

In `src/components/FormTable.tsx` replace the three `<td ...>` openings in the body row with:

```tsx
            <td lang="el" className={row.hl?.el ? 'cur' : undefined}>
```

(and the same with `lang="ro"` / `row.hl?.ro` and `lang="en"` / `row.hl?.en` for the other two cells).

In `src/components/WordPanel.tsx` add this block directly before the closing `</section>`:

```tsx
      {panel.full.length > 0 && (
        <>
          <p className="full-title">Full paradigm: the outlined cell is the form in use</p>
          <FormTable rows={panel.full} />
        </>
      )}
```

- [ ] **Step 6: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: full paradigm tables for the Improver level, highlighted per column" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The phrase picker

**Files:**
- Create: `src/components/PhrasePicker.tsx`, `src/components/PhrasePicker.test.tsx`, `src/Explorer.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`

**Interfaces:**
- Consumes: Tasks 5 to 8.
- Produces: `PhrasePicker({ phrases, value, onChange })` (a labelled `<select>` named "Phrase", options grouped by `theme` in `<optgroup>`s, `onChange(index)`); `Explorer({ phrase, level })` (the phrase bar, gloss grid, panel and comparison for one phrase; `App` renders it with `key={phrase.id}` so choices reset when the phrase changes).

- [ ] **Step 1: Write the failing tests**

Create `src/components/PhrasePicker.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { PhrasePicker } from './PhrasePicker';

describe('PhrasePicker', () => {
  it('groups the phrases by theme', () => {
    render(<PhrasePicker phrases={PHRASES} value={0} onChange={() => {}} />);
    const ordering = screen.getByRole('group', { name: 'Ordering' });
    expect(within(ordering).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Ordering a hot coffee',
      'Ordering three coffees',
    ]);
    const fox = screen.getByRole('group', { name: 'The fox sentence' });
    expect(within(fox).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'The quick brown fox jumps over the lazy dog',
    ]);
  });

  it('shows the selected phrase and reports a change with its index', async () => {
    const onChange = vi.fn();
    render(<PhrasePicker phrases={PHRASES} value={1} onChange={onChange} />);
    const select = screen.getByLabelText('Phrase');
    expect(select).toHaveValue('1');
    await userEvent.setup().selectOptions(select, 'The quick brown fox jumps over the lazy dog');
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
```

In `src/App.test.tsx`, append inside the `describe('App', ...)`:

```tsx
  it('switches phrase from the picker', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    expect(screen.getByRole('button', { name: 'πηδάει' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering three coffees');
    expect(screen.getByRole('button', { name: 'τρεις' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'πηδάει' })).not.toBeInTheDocument();
  });

  it('forgets the learner’s choices when the phrase changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering three coffees');
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering a hot coffee');
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
  });

  it('in the fox sentence, selecting the article highlights only the Romanian suffix', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    for (const b of screen.getAllByRole('button', { name: 'le' })) expect(b).toHaveAttribute('aria-pressed', 'true');
    for (const b of screen.getAllByRole('button', { name: 'câine' })) {
      expect(b).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('opens the preposition panel and follows the noun after it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    await user.click(screen.getByRole('button', { name: 'πάνω από' }));
    expect(screen.getByRole('cell', { name: 'πάνω από τον σκύλο' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun after it'), 'alepou');
    expect(screen.getByRole('cell', { name: 'πάνω από την αλεπού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'peste vulpea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'over the fox' })).toBeInTheDocument();
  });

  it('shows the full paradigm in Improver', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    await user.click(screen.getByLabelText('Improver'));
    expect(screen.getByText(/Full paradigm/)).toBeInTheDocument();
    expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(3);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/PhrasePicker.test.tsx src/App.test.tsx`
Expected: FAIL (`./PhrasePicker` not found; the App has no picker).

- [ ] **Step 3: Create `src/components/PhrasePicker.tsx`**

```tsx
import type { Phrase } from '../types';

interface Props {
  phrases: Phrase[];
  value: number;
  onChange: (index: number) => void;
}

export function PhrasePicker({ phrases, value, onChange }: Props) {
  const themes = [...new Set(phrases.map((p) => p.theme))];
  return (
    <div className="phrase-picker">
      <label htmlFor="phrase-select">Phrase</label>
      <select id="phrase-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {themes.map((theme) => (
          <optgroup key={theme} label={theme}>
            {phrases.map((p, i) =>
              p.theme === theme ? (
                <option key={p.id} value={i}>
                  {p.title}
                </option>
              ) : null,
            )}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/Explorer.tsx`**

```tsx
import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';
import type { Level, Phrase } from './types';

/** One phrase: the phrase bar, the gloss rows, the word panel and the comparison. */
export function Explorer({ phrase, level }: { phrase: Phrase; level: Level }) {
  const initial = phrase.tokens.map((t) => initialState(t, phrase));
  const [states, setStates] = useState<PanelState[]>(initial);
  const [selected, setSelected] = useState(0);

  const token = phrase.tokens[selected];
  const state = states[selected];
  const panel = buildPanel(state, token, level);
  const divergences = selectDivergences(DIVERGENCES, state.slot.pos, token.lexeme, level);
  const differsFromPhrase = !sameState(state, initial[selected]);

  function changeControl(key: string, value: string) {
    setStates((current) => current.map((s, i) => (i === selected ? applyControl(s, key, value) : s)));
  }

  function resetToPhrase() {
    setStates((current) => current.map((s, i) => (i === selected ? initial[selected] : s)));
  }

  return (
    <>
      <section className="card" aria-label={phrase.title}>
        <PhraseBar tokens={phrase.tokens} selected={selected} onSelect={setSelected} />
        <GlossGrid glosses={phrase.glosses} selected={selected} onSelect={setSelected} />
      </section>
      {differsFromPhrase && (
        <div className="phrase-status" role="status">
          <span>Differs from the phrase.</span>
          <button type="button" onClick={resetToPhrase}>
            Reset to phrase
          </button>
        </div>
      )}
      <WordPanel panel={panel} onChange={changeControl} />
      <ComparisonTable rows={divergences} word={token.text} />
    </>
  );
}
```

- [ ] **Step 5: Replace `src/App.tsx`**

```tsx
import { useState } from 'react';
import { LevelToggle } from './components/LevelToggle';
import { PhrasePicker } from './components/PhrasePicker';
import { PHRASES } from './data/phrases';
import { Explorer } from './Explorer';
import { readLevel, writeLevel } from './storage';
import type { Level } from './types';

export function App() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [level, setLevel] = useState<Level>(readLevel);
  const phrase = PHRASES[phraseIndex];

  function changeLevel(next: Level) {
    setLevel(next);
    writeLevel(next);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Greek Grammar Explorer</h1>
        <LevelToggle value={level} onChange={changeLevel} />
      </header>
      <div className="toolbar">
        <PhrasePicker phrases={PHRASES} value={phraseIndex} onChange={setPhraseIndex} />
      </div>
      <Explorer key={phrase.id} phrase={phrase} level={level} />
    </main>
  );
}
```

- [ ] **Step 6: Run the gate and commit**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all PASS, no type errors, `Data is valid.`

```bash
git add -A && git commit -m "feat: phrase picker grouped by theme, with the explorer keyed by phrase" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Styles, the validation report and the end-to-end check

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append the styles**

Append to `src/styles.css`:

```css
.toolbar { margin-top: 12px; }
.phrase-picker { display: flex; gap: 8px; align-items: center; font-size: 13px; }
.phrase-picker select { font: inherit; font-size: 14px; height: 32px; max-width: 100%; background: var(--surface); color: var(--text); border: 0.5px solid var(--border); border-radius: 8px; }

.gloss-segmented { display: inline-flex; padding: 0; overflow: hidden; margin: 0 4px 4px 0; cursor: default; }
.gloss-segment { font: inherit; font-size: 14px; color: var(--text); background: var(--surface); border: 0; padding: 2px 4px; cursor: pointer; }
.gloss-segment:first-child { padding-left: 10px; }
.gloss-segment:last-child { padding-right: 10px; }
.gloss-segment[aria-pressed='true'] { background: var(--accent-bg); color: var(--accent-text); }
.gloss-segment:focus-visible { outline: 2px solid var(--accent-border); outline-offset: -2px; }

.role-sub { display: block; font-size: 12px; color: var(--muted); }
.form-table td.cur { outline: 2px solid var(--accent-border); outline-offset: -2px; }
.full-title { font-size: 12px; color: var(--muted); margin: 16px 0 4px; }
```

- [ ] **Step 2: Run the full gate**

Run: `npx vitest run && npm run typecheck && npm run validate && npm run build`
Expected: all tests PASS, no type errors, the build completes. The validator prints `Unverified (79):` followed by 48 lexeme-language entries (16 lexemes × 3), 11 ending tables, 3 phrases and 17 divergence notes, then `Data is valid.` with no `Warnings` block.

Run: `npm run validate -- --release`
Expected: the same list, then `--release: 79 record(s) are not verified.` and a non-zero exit code.

- [ ] **Step 3: Check the app in a browser**

Run the dev server (the `dev` entry in `.claude/launch.json`, port 5199) and open the printed local URL. Confirm each item and report any that fail instead of editing around it:

1. The phrase picker shows two groups, "Ordering" (two phrases) and "The fox sentence" (one).
2. Phrase 2: click **τρεις**: the heading reads `τρεις / τρία`; the "counting" row reads `τρεις καφέδες / trei cafele / three coffees`. Change "Number" to 2: Greek stays `δύο`, Romanian reads `două`.
3. Phrase 2: click **καφέδες**: "How many?" reads three, and the second row is "with a number".
4. Fox sentence: nine chips. Click **τον**: only the **le** of *câinele* lights up in both Romanian rows. Click **σκύλο**: only **câine**. Click **Η**: only the **a** of *vulpea*.
5. Fox sentence: click **καφέ**: the panel says the adjective never changes, and the row reads `η καφέ αλεπού / vulpea maro / the brown fox`.
6. Fox sentence: click **πάνω από**, set "Noun after it" to αλεπού: `πάνω από την αλεπού / peste vulpea / over the fox`.
7. Switch to Improver and click **ζεστό** in phrase 1: the adjective table outlines `ζεστό` in the Greek column at "masc. accusative" and `caldă` in the Romanian column at "fem. accusative" (two different rows). Click **καφέ**: the noun table shows each case with the indefinite form underneath.
8. Phone width (about 375 px): no horizontal scroll; the tables stay readable.
9. Dark colour scheme: all text readable, outlines visible.
10. Keyboard: Tab reaches the picker, the chips, the gloss segments and the selects, each with a focus ring.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "style: segments, outlines, picker and full-paradigm styles" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage (Plan 2's share):**

| Spec requirement | Task |
|---|---|
| Numerals 1 to 5, agreeing in gender and case; Romanian changes 1 and 2 (5.3) | 1, 5 |
| Noun count control "1 to 5, or many"; "with a number" row; empty plural article labelled (5.3) | 1, 5 |
| Counted noun phrases in three languages (6.1 phrase 2) | 1, 7 |
| New noun classes, Romanian gender mismatch notes (5.3, 6.6) | 2 |
| Irregularity messages (5.1) | 2, 3, 4, 5 |
| Stem-stressed and indeclinable adjectives (6.1 phrase 3) | 3 |
| Contracted verb class (6.1 phrase 3) | 4 |
| "Noun it goes with / describes / counts / after it" controls (5.3) | 5, 6 |
| Panel works on a copy of the slot (4.4) | 5 (`PanelState`) |
| Preposition panel and table (5.3) | 6, 8 |
| Gloss segments, authored; stem/suffix data only check them (4.5) | 2, 7 |
| Phrases 2 and 3, fixed fox sentence (6.1) | 7 |
| Full paradigm tables, per-column highlighting (5.1, 5.3) | 8 |
| Phrase picker grouped by theme (5, 6.1) | 9 |
| Divergence rows for the new words (5.2) | 7 |
| Build-time validation of new slots, segments and warnings (7) | 1, 5, 6, 7 |

Not in Plan 2 by design (Plans 3 to 5): tenses and moods, `compose()`, readings, quantifiers, negation and the `pending` marker, the copula and participles, clitics and form groups, phrases 4 to 39 except 1 to 3, the content review.

**Placeholder scan:** no `TBD`, `TODO` or "similar to Task N" remain; every step has the code or the exact edit.

**Type consistency:** `PanelState`, `initialState`, `buildPanel(state, token, level)`, `applyControl(state, key, value)` and `sameState` are defined in Task 5 and used unchanged in Tasks 6 to 9. `NpOptions.count` is `Exclude<NumeralValue, 1>` in Task 1, and the noun slot's `count` has the same type in Task 5. `GlossUnit`'s two shapes are handled through `isSegmented`, `unitText` and `linksOf` everywhere it is read (GlossGrid, validator). The numeral lexeme id is `'numeral'` from Task 1 on.

**Risk notes for the executor:**
- Tasks 1 to 4 widen types that the old Plan 1 panel code still compiles against; Task 5 replaces that code. Run the typecheck at the end of every task.
- The Greek, Romanian and English forms are unverified (see the spec, section 9). The tests encode them as written; they check the engine, not the language.
- If a test in this plan disagrees with the data you typed, check the data against the spec's tables (6.3 to 6.6) before changing either.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-03-plan-2-nouns-numerals-prepositions-and-tables.md`.
