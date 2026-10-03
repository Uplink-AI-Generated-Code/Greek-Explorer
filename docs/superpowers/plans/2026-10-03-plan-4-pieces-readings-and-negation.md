# Pieces, Readings and Negation Implementation Plan (Plan 4 of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Negation (δεν, μην, να μην and the negative imperative) in all three languages with a "Negated" control; verb chips whose pieces can be clicked, so θα, δεν, μην and the auxiliary έχω open their own panels with a "Back to the verb" link; gloss highlighting by piece; and the "how to read this" lines (Greek, plus Romanian and English for compound forms) in Beginner and Improver wording. Three more phrases: 16, 25 and 39.

**Architecture:** `compose()` learns a `polarity` and a `negation` piece kind. The Romanian and English generators learn the negative forms. A verb group renders as a group of piece buttons; `Explorer` keeps, besides the per-token panel state, an optional *open piece* (a panel for a particle or the auxiliary, working on its own copy of the slot). `readingFor(verb, slot)` builds the reading from the composed pieces, a shared glossary of endings and, for irregular cells, authored templates selected by the irregularity rule.

**Tech Stack:** Vite, React, TypeScript (strict), Vitest, Testing Library, tsx (all as in Plans 1 to 3).

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (4.2 to 4.5, 5.1, 5.3, 5.5, 6.1, 6.4, 7, 8 and section 17).

## Global Constraints

- The spec is the authority; the plan argues from it. Departures are listed under "Departures from the spec".
- TypeScript strict. No `any`. No `sed -i` (macOS): use the Edit tool or a short Python script.
- Before every commit run `npx vitest run && npm run typecheck` (and `npm run validate` whenever the task touches data or the validator) and commit only when green. Stage files by explicit path (never `git add -A`; the untracked `.claude/` folder must not be committed). Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Every new lexeme starts with `verified: { el: false, ro: false, en: false }`; every new phrase, divergence note and reading template starts with `verified: false`; every new table or glossary gets a `ReviewItem` with `verified: false`. All Greek, Romanian and English text in this plan was written from memory and is unverified (spec section 9).
- Whitespace-only rich-text segments are plain segments (`RichText` renders them as text nodes). Colour is never the only signal: pressed pieces carry `aria-pressed`, the current cell carries `aria-current`, dimmed rows carry a text reason.
- The phrase and its glosses are fixed and authored; the panel works on a copy. A piece panel opened from a chip or a gloss unit works on the piece of the *authored* token; a piece panel opened from a reading line works on the pieces of the panel's current slot.
- Greek forms are monotonic. The present imperative of τρώω is τρώγε / τρώγετε (section 17 of the spec).

## Scope of this plan

In:

- `polarity?: 'affirmative' | 'negative'` on the verb slot; the negation pieces δεν and μην (two particle lexemes); `compose` placing them (δεν before θα and before the verb; μην after να; the negative imperative as μην + the subjunctive form); Romanian and English negative forms; the validator checking every offered slot in both polarities; the "Negated" control; phrases 16, 25 and 39; the notes subjunctive-negation, negative-imperative and negation-position.
- Verb groups as groups of piece buttons; clicking a piece selects it; clicking θα, δεν, μην or έχω opens that piece's panel (the particle panel, or the verb panel of έχω) with "Back to the verb"; gloss units linked to a piece highlight and select that piece.
- `readingFor`, the shared glossary of endings, authored templates per irregularity rule, and the "How to read this" block in the word panel with clickable particle, negation and auxiliary parts.

Out (later plans):

- Quantifiers, the copula, αν, the passive participle, the `pending` marker; phrases 7 to 10, 20, 21, 30, 32 and 33 (Plan 5).
- Clitics, shortened forms, form groups, the Same-meaning strip; phrases 34 to 38; the content review of all unverified records (Plan 6).
- Readings for words that are not verbs (the spec's examples are all verbs except the participle, which arrives in Plan 5).
- Hovering or focusing a reading part to highlight it in the form above (spec 5.5): the parts are shown in the same colours as the form, and the particle, negation and auxiliary parts are buttons, but there is no cross-highlight yet.

## Departures from the spec

1. **`polarity` is optional** on the verb slot (absent means affirmative), so every Plan 3 slot literal stays valid and a working copy that is affirmative equals the authored slot (`sameState` compares JSON).
2. **A reading is per column.** `Reading` is `{ el, ro?, en? }` and each line is `{ parts, beginner, improver }`; the spec's `Reading` is one such line. The Romanian and English lines exist only for compound forms (more than one word).
3. **Templates per irregularity rule, not per cell.** The spec has an author write the lexeme-specific words for each irregular form; here an irregular note's `rule` (`stress-shift`, `monosyllable`, `old-stem`) selects one authored template with `{text}`, `{parts}`, `{technical}` placeholders filled from the form. The validator fails a build when a rule has no template.
4. **Whole-token gloss units stay highlighted when a piece is selected.** The spec says a selected piece highlights "only the units linked to that piece"; a unit linked to the whole token (Romanian *mâncasem*) covers every piece, so it stays highlighted too.
5. **Verb groups are groups of buttons.** The spec's "chip" for a verb group becomes a `role="group"` named by the written words, with one button per piece (the single-word verb stays one button). This replaces Plan 3's single button with spans.

## File structure

New:

- `src/data/readings.ts`: the glossary of endings, the particle and auxiliary glosses, the authored templates.
- `src/engine/reading.ts`: `readingFor`.
- Tests: `src/engine/reading.test.ts`, `src/data/readings.test.ts`, additions to existing test files.

Modified: `src/types.ts`, `src/data/lexemes.ts`, `phrases.ts`, `divergences.ts`, `review.ts`, `src/engine/tenses.ts`, `offers.ts`, `compose.ts`, `segments.ts`, `romanian.ts`, `english.ts`, `src/validate/validate.ts`, `scripts/validate.ts`, `src/panels/verb.ts`, `panels.ts`, `types.ts`, `src/components/PhraseBar.tsx`, `GlossGrid.tsx`, `WordPanel.tsx`, `ComparisonTable.tsx`, `src/Explorer.tsx`, `src/styles.css`, and the tests named in each task.

---

### Task 1: Negation in the Greek engine

**Files:**

- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/engine/segments.ts`, `src/engine/offers.ts`, `src/engine/compose.ts`, `src/styles.css`
- Test: `src/engine/compose.test.ts`, `src/engine/offers.test.ts`

**Interfaces:**

- Consumes: Plan 3's `compose`, `Piece`, `structureOf`, `inflectVerb`, `isOffered`.
- Produces:
  - `type Polarity = 'affirmative' | 'negative'`; the verb slot gains `polarity?: Polarity`.
  - Lexemes `den` (δεν) and `min` (μην), both `pos: 'particle'`.
  - `Piece` gains the kind `'negation'` (same fields as a particle piece).
  - `compose(verb, slot)` with `polarity: 'negative'`: indicative and conditional put δεν first (before θα); the subjunctive puts μην after να; the imperative is μην + the subjunctive form of the same tense (μην φας), and refuses any person but the second.
  - `Role` gains `'neg'`; `composedRich` colours negation pieces with it.
  - `isOffered` refuses a negative imperative when the voice does not offer the subjunctive tense of the same name.

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/compose.test.ts`:

```ts
const neg = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('compose: negation (τρώω, 1st person singular)', () => {
  it.each([
    ['indicative', 'present', 'δεν τρώω'],
    ['indicative', 'imperfect', 'δεν έτρωγα'],
    ['indicative', 'aorist', 'δεν έφαγα'],
    ['indicative', 'future', 'δεν θα τρώω'],
    ['indicative', 'futureSimple', 'δεν θα φάω'],
    ['indicative', 'perfect', 'δεν έχω φάει'],
    ['indicative', 'pluperfect', 'δεν είχα φάει'],
    ['indicative', 'futurePerfect', 'δεν θα έχω φάει'],
    ['subjunctive', 'present', 'να μην τρώω'],
    ['subjunctive', 'aorist', 'να μην φάω'],
    ['subjunctive', 'perfect', 'να μην έχω φάει'],
    ['conditional', 'imperfect', 'δεν θα έτρωγα'],
    ['conditional', 'pluperfect', 'δεν θα είχα φάει'],
  ] as const)('%s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', neg(vs(mood, tense)))).toBe(expected);
  });

  it('δεν goes before θα and before the verb; μην goes after να', () => {
    const pieces = (slot: SlotOf<'verb'>) => compose(getVerb('troo'), slot).pieces.map((p) => p.kind);
    expect(pieces(neg(vs('indicative', 'futurePerfect')))).toEqual(['negation', 'particle', 'auxiliary', 'verb']);
    expect(pieces(neg(vs('subjunctive', 'perfect')))).toEqual(['particle', 'negation', 'auxiliary', 'verb']);
    expect(pieces(neg(vs('indicative', 'present')))).toEqual(['negation', 'verb']);
  });

  it('the negation pieces carry the lexeme and slot a panel would open', () => {
    const [first] = compose(getVerb('troo'), neg(vs('indicative', 'present'))).pieces;
    expect(first).toMatchObject({ kind: 'negation', text: 'δεν', lexeme: 'den', slot: { pos: 'particle' } });
    const [, second] = compose(getVerb('troo'), neg(vs('subjunctive', 'aorist'))).pieces;
    expect(second).toMatchObject({ kind: 'negation', text: 'μην', lexeme: 'min' });
  });

  it('the negative imperative is μην + the subjunctive form, not the imperative', () => {
    expect(text('troo', neg(vs('imperative', 'aorist', 2, 'sg')))).toBe('μην φας');
    expect(text('troo', neg(vs('imperative', 'aorist', 2, 'pl')))).toBe('μην φάτε');
    expect(text('troo', neg(vs('imperative', 'present', 2, 'sg')))).toBe('μην τρως');
    expect(text('troo', neg(vs('imperative', 'present', 2, 'pl')))).toBe('μην τρώτε');
    expect(text('pleno', neg(vs('imperative', 'aorist', 2, 'sg')))).toBe('μην πλύνεις');
    expect(text('pleno', neg(vs('imperative', 'aorist', 2, 'pl')))).toBe('μην πλύνετε');
  });

  it('a negative command is for "you" only', () => {
    expect(() => compose(getVerb('troo'), neg(vs('imperative', 'aorist', 1)))).toThrow('commands are for "you" only');
  });

  it('other verbs, voices and persons', () => {
    expect(text('thelo', neg(vs('indicative', 'present')))).toBe('δεν θέλω');
    expect(text('pao', neg(vs('subjunctive', 'aorist')))).toBe('να μην πάω');
    expect(text('pleno', neg(vs('indicative', 'perfect', 1, 'sg', 'mediopassive')))).toBe('δεν έχω πλυθεί');
    expect(text('troo', neg(vs('indicative', 'perfect', 3, 'sg')))).toBe('δεν έχει φάει');
  });

  it('colours the negation in its own role', () => {
    const rich = composedRich(compose(getVerb('troo'), neg(vs('indicative', 'future'))));
    expect(richText(rich)).toBe('δεν θα τρώω');
    expect(rich.map((s) => s.role)).toEqual(['neg', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });

  it('an affirmative slot without a polarity is unchanged', () => {
    expect(text('troo', vs('indicative', 'future'))).toBe('θα τρώω');
    expect(text('troo', { ...vs('indicative', 'future'), polarity: 'affirmative' })).toBe('θα τρώω');
  });
});
```

Append to `src/engine/offers.test.ts`:

```ts
describe('offers: negation', () => {
  const troo = getVerb('troo');
  const negative = (mood: SlotOf<'verb'>['mood'], tense: Tense, person: Person = 2, number: 'sg' | 'pl' = 'sg') =>
    ({ ...slot(mood, tense, person, number), polarity: 'negative' }) as SlotOf<'verb'>;

  it('every affirmative slot can be negated', () => {
    expect(isOffered(troo, negative('indicative', 'perfect', 1))).toBe(true);
    expect(isOffered(troo, negative('subjunctive', 'aorist', 1))).toBe(true);
  });

  it('a negative imperative needs the subjunctive tense of the same name', () => {
    expect(isOffered(troo, negative('imperative', 'aorist'))).toBe(true);
    const noSubjunctive = withVoice({ offers: { indicative: ['present'], imperative: ['aorist'] } });
    expect(isOffered(noSubjunctive, slot('imperative', 'aorist', 2))).toBe(true);
    expect(isOffered(noSubjunctive, negative('imperative', 'aorist'))).toBe(false);
  });
});
```

(`withVoice` and `slot` are the helpers already defined at the top of `offers.test.ts`; `getVerb`, `Person`, `Tense` and `SlotOf` are already imported there. `withVoice` spreads θέλω, which offers no imperative of its own, so the fixture sets `offers` explicitly.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/compose.test.ts src/engine/offers.test.ts`
Expected: FAIL (no `negation` kind, no `den` lexeme, `polarity` ignored).

- [ ] **Step 3: Widen the types and add the two lexemes**

In `src/types.ts` add after the `Voice` type:

```ts
export type Polarity = 'affirmative' | 'negative';
```

and change the verb line of the `Slot` union to:

```ts
  | { pos: 'verb'; person: Person; number: Num; mood: Mood; tense: Tense; voice: Voice; polarity?: Polarity }
```

In `src/data/lexemes.ts` add after the `na` declaration:

```ts
const den: GreekParticle = {
  id: 'den',
  pos: 'particle',
  lemma: 'δεν',
  verified: { el: false, ro: false, en: false },
  ro: 'nu',
  en: "not (don't, won't …)",
  meaning: 'Says "not". It goes in front of the whole verb group, even in front of θα: δεν θέλω, δεν θα φάω.',
  example: { el: 'δεν θέλω', ro: 'nu vreau', en: "don't want" },
};

const min: GreekParticle = {
  id: 'min',
  pos: 'particle',
  lemma: 'μην',
  verified: { el: false, ro: false, en: false },
  ro: 'nu / să nu',
  en: "don't / not",
  meaning: 'Says "not" after να and in a command: να μην φάω, μην φας.',
  example: { el: 'μην φας', ro: 'nu mânca', en: "don't eat" },
};
```

and add `[den.id]: den,` and `[min.id]: min,` to the `LEXEMES` record after `[na.id]: na,`.

In `src/engine/segments.ts` add `'neg'` to the `Role` union (`… | 'augment' | 'aux' | 'neg'`).

In `src/styles.css` add after the `.role-augment` rule, and extend the piece rules:

```css
.role-neg { font-weight: 600; border-bottom: 2px solid var(--muted); }
.chip .piece-negation { font-weight: 600; }
```

- [ ] **Step 4: `isOffered` and `compose`**

In `src/engine/offers.ts` replace `isOffered` with:

```ts
export function isOffered(verb: GreekVerb, s: SlotOf<'verb'>): boolean {
  const data = verb.voices[s.voice];
  if (!data) return false;
  if (!(data.offers[s.mood] ?? []).includes(s.tense)) return false;
  // A negative command is μην + the subjunctive of the same tense (spec 4.3), so the verb must offer that subjunctive.
  if (s.polarity === 'negative' && s.mood === 'imperative' && !(data.offers.subjunctive ?? []).includes(s.tense)) {
    return false;
  }
  return offeredWho(verb, s.voice, s.mood).includes(`${s.person}${s.number}`);
}
```

Replace the whole of `src/engine/compose.ts` with:

```ts
import { getLexeme, getVerb } from '../data/lexemes';
import type { Form, GreekVerb, Slot, SlotOf } from '../types';
import { inflectVerb } from './greek';
import { formRich, formText, type Rich } from './segments';
import { structureOf } from './tenses';

/**
 * One word of a written verb group. A particle, negation or auxiliary piece carries the lexeme and slot a
 * panel would open for it (spec 4.2); the lexical verb carries its Form.
 */
export type Piece =
  | { kind: 'particle' | 'negation' | 'auxiliary'; text: string; lexeme: string; slot: Slot }
  | { kind: 'verb'; form: Form };

export interface Composed {
  pieces: Piece[];
  /** The written form, pieces joined by spaces: "θα έχω φάει". */
  text: string;
}

export const pieceText = (piece: Piece): string => (piece.kind === 'verb' ? formText(piece.form) : piece.text);

const joined = (pieces: Piece[]): Composed => ({ pieces, text: pieces.map(pieceText).join(' ') });

function wordPiece(kind: 'particle' | 'negation', id: string): Piece {
  const lexeme = getLexeme(id);
  return { kind, text: lexeme.lemma, lexeme: lexeme.id, slot: { pos: 'particle' } };
}

/**
 * Builds a verb group in written order: the negation (δεν before θα; μην after να), the particle (θα, να),
 * the auxiliary (έχω) and the lexical verb. A negative command is μην + the subjunctive form (spec 4.3).
 */
export function compose(verb: GreekVerb, slot: SlotOf<'verb'>): Composed {
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
    return joined([wordPiece('negation', 'min'), { kind: 'verb', form: inflectVerb(verb, subjunctive) }]);
  }

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

/** The group as coloured segments: negation in `neg`, particle and auxiliary in `aux`, the verb as augment, stem and ending. */
export function composedRich(composed: Composed): Rich {
  return composed.pieces.flatMap((piece, i): Rich => {
    const body: Rich =
      piece.kind === 'verb'
        ? formRich(piece.form)
        : [{ text: piece.text, role: piece.kind === 'negation' ? 'neg' : 'aux' }];
    return i === 0 ? body : [{ text: ' ', role: 'plain' }, ...body];
  });
}
```

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `npm run validate` now lists `lexeme den (el)` … `lexeme min (en)` among the unverified records.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/data/lexemes.ts src/engine/segments.ts src/engine/offers.ts src/engine/compose.ts src/engine/compose.test.ts src/engine/offers.test.ts src/styles.css
git commit -m "feat: negation pieces δεν and μην, and the negative imperative, in compose

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Negation in the Romanian and English generators, and in the validator

**Files:**

- Modify: `src/types.ts`, `src/data/lexemes.ts`, `src/data/review.ts`, `src/engine/romanian.ts`, `src/engine/english.ts`, `src/validate/validate.ts`
- Test: `src/engine/verbs-ro-en.test.ts`, `src/validate/validate.test.ts`

**Interfaces:**

- Consumes: Task 1's `polarity` and `isOffered`; Plan 3's `roVerb`, `enVerb`, `allVerbSlots`.
- Produces:
  - `roVerb(verb, slot)` handles `polarity: 'negative'`: *nu* in front of the verb group (*nu vreau*, *nu am mâncat*, *nu voi mânca*, *nu aș mânca*), *să nu* in the subjunctive (*să nu mănânc*, *să nu fi mâncat*), and the negative imperative *nu* + the infinitive (singular, *nu mânca*) or *nu* + the plural imperative (*nu mâncați*).
  - `enVerb(verb, slot)` handles negation with the contracted forms: don't / doesn't, wasn't / weren't, didn't, won't, haven't / hasn't, hadn't, wouldn't, "may not", and "don't eat" for the imperative.
  - `EnVerbForms.modal?: boolean`: a modal verb is negated with "not" after it ("may not"); μπορεί sets it.
  - The validator checks every offered slot in both polarities.

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/verbs-ro-en.test.ts`:

```ts
const negative = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('Romanian negation (τρώω → a mânca)', () => {
  it.each([
    ['indicative', 'present', 'nu mănânc'],
    ['indicative', 'imperfect', 'nu mâncam'],
    ['indicative', 'aorist', 'nu am mâncat'],
    ['indicative', 'perfect', 'nu am mâncat'],
    ['indicative', 'pluperfect', 'nu mâncasem'],
    ['indicative', 'future', 'nu voi mânca'],
    ['indicative', 'futureSimple', 'nu voi mânca'],
    ['indicative', 'futurePerfect', 'nu voi fi mâncat'],
    ['subjunctive', 'present', 'să nu mănânc'],
    ['subjunctive', 'aorist', 'să nu mănânc'],
    ['subjunctive', 'perfect', 'să nu fi mâncat'],
    ['conditional', 'imperfect', 'nu aș mânca'],
    ['conditional', 'pluperfect', 'nu aș fi mâncat'],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(roVerb(getVerb('troo'), negative(vs(mood, tense)))).toBe(expected);
  });

  it('the negative imperative is nu + the infinitive in the singular and nu + the plural imperative', () => {
    expect(roVerb(getVerb('troo'), negative(vs('imperative', 'aorist', 2, 'sg')))).toBe('nu mânca');
    expect(roVerb(getVerb('troo'), negative(vs('imperative', 'present', 2, 'pl')))).toBe('nu mâncați');
  });

  it('a reflexive verb keeps its clitic: nu mă spăl, nu m-am spălat, să nu mă spăl', () => {
    const m = 'mediopassive';
    expect(roVerb(getVerb('pleno'), negative(vs('indicative', 'present', 1, 'sg', m)))).toBe('nu mă spăl');
    expect(roVerb(getVerb('pleno'), negative(vs('indicative', 'perfect', 1, 'sg', m)))).toBe('nu m-am spălat');
    expect(roVerb(getVerb('pleno'), negative(vs('subjunctive', 'present', 1, 'sg', m)))).toBe('să nu mă spăl');
  });

  it('other persons and verbs: nu a mâncat, nu au mâncat, nu vreau, să nu merg', () => {
    expect(roVerb(getVerb('troo'), negative(vs('indicative', 'perfect', 3, 'sg')))).toBe('nu a mâncat');
    expect(roVerb(getVerb('troo'), negative(vs('indicative', 'perfect', 3, 'pl')))).toBe('nu au mâncat');
    expect(roVerb(getVerb('thelo'), negative(vs('indicative', 'present')))).toBe('nu vreau');
    expect(roVerb(getVerb('pao'), negative(vs('subjunctive', 'aorist')))).toBe('să nu merg');
  });
});

describe('English negation (eat / ate / eaten)', () => {
  const text = (id: string, slot: SlotOf<'verb'>, pronoun = 'I') => enVerbText(getVerb(id), negative(slot), pronoun);

  it.each([
    ['indicative', 'present', "I don't eat"],
    ['indicative', 'imperfect', "I wasn't eating"],
    ['indicative', 'aorist', "I didn't eat"],
    ['indicative', 'future', "I won't eat"],
    ['indicative', 'futureSimple', "I won't eat"],
    ['indicative', 'perfect', "I haven't eaten"],
    ['indicative', 'pluperfect', "I hadn't eaten"],
    ['indicative', 'futurePerfect', "I won't have eaten"],
    ['subjunctive', 'present', "that I don't eat"],
    ['subjunctive', 'aorist', "that I don't eat"],
    ['subjunctive', 'perfect', 'I may not have eaten'],
    ['conditional', 'imperfect', "I wouldn't eat"],
    ['conditional', 'pluperfect', "I wouldn't have eaten"],
  ] as const)('1sg %s %s -> %s', (mood, tense, expected) => {
    expect(text('troo', vs(mood, tense))).toBe(expected);
  });

  it('agrees with the person', () => {
    expect(text('troo', vs('indicative', 'present', 3), 'he/she')).toBe("he/she doesn't eat");
    expect(text('troo', vs('indicative', 'perfect', 3), 'he/she')).toBe("he/she hasn't eaten");
    expect(text('troo', vs('indicative', 'imperfect', 2), 'you')).toBe("you weren't eating");
  });

  it("the negative imperative is don't + the base verb, with no subject", () => {
    expect(enVerb(getVerb('troo'), negative(vs('imperative', 'aorist', 2, 'sg')))).toEqual({
      lead: '',
      subject: false,
      verb: "don't eat",
    });
  });

  it('a modal is negated with "not": he/she may not', () => {
    expect(text('mporei', vs('indicative', 'present', 3), 'he/she')).toBe('he/she may not');
  });

  it('the reflexive voice keeps its "self" word: I don\'t wash (myself)', () => {
    expect(text('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'))).toBe("I don't wash (myself)");
  });
});
```

Append to `src/validate/validate.test.ts` (inside the existing `describe('verb lexemes', …)` block, which defines `modifiedTroo`):

```ts
  it('checks the negative forms too: a missing infinitive breaks the negative imperative', () => {
    const errors = validate(modifiedTroo((v) => { v.ro.infinitive = ''; }));
    expect(errors.some((e) => e.startsWith('lexeme troo: cannot build') && e.includes('"polarity":"negative"'))).toBe(true);
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/verbs-ro-en.test.ts src/validate/validate.test.ts`
Expected: FAIL (the generators ignore `polarity`).

- [ ] **Step 3: Add `modal` to the English forms and mark μπορεί**

In `src/types.ts` add to `EnVerbForms`, after `reflexive?: boolean;`:

```ts
  /** A modal verb (may) is negated with "not" after it, not with "do". */
  modal?: boolean;
```

In `src/data/lexemes.ts`, in the `mporei` declaration, add `modal: true,` to its `en` object (after `ing: 'being able to',`).

- [ ] **Step 4: The Romanian generator**

In `src/engine/romanian.ts` replace `roVerb` with:

```ts
/** The Romanian cell for a verb slot: stored forms for the simple tenses, generated for the compound ones. */
export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  const ro = voiceOf(v, s.voice).ro;
  const i = whoIndex(s);
  // Negation: nu in front of the verb group; să nu in the subjunctive (spec 6.4).
  const nu = s.polarity === 'negative' ? 'nu ' : '';
  const key = `${s.mood}.${s.tense}`;
  switch (key) {
    case 'indicative.present':
      return `${nu}${ro.present[i]}`;
    case 'indicative.imperfect':
      return `${nu}${ro.imperfect[i]}`;
    case 'indicative.aorist':
    case 'indicative.perfect':
      // Romanian has one tense for both; a reflexive verb stores it (m-am spălat).
      return `${nu}${ro.perfect?.[i] ?? `${RO_AUXILIARIES.have[i]} ${ro.participle}`}`;
    case 'indicative.pluperfect':
      return `${nu}${ro.pluperfect[i]}`;
    case 'indicative.future':
    case 'indicative.futureSimple':
      return `${nu}${RO_AUXILIARIES.will[i]} ${ro.infinitive}`;
    case 'indicative.futurePerfect':
      return `${nu}${RO_AUXILIARIES.will[i]} fi ${ro.participle}`;
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return `să ${nu}${ro.subjunctive[i]}`;
    case 'subjunctive.perfect':
      return `să ${nu}fi ${ro.participle}`;
    case 'imperative.present':
    case 'imperative.aorist': {
      if (s.polarity === 'negative' && s.number === 'sg') return `nu ${ro.infinitive}`;
      if (!ro.imperative) throw new Error(`${v.id} has no Romanian imperative`);
      const form = ro.imperative[s.number === 'sg' ? 0 : 1];
      return `${nu}${form}`;
    }
    case 'conditional.imperfect':
      return `${nu}${RO_AUXILIARIES.would[i]} ${ro.infinitive}`;
    case 'conditional.pluperfect':
      return `${nu}${RO_AUXILIARIES.would[i]} fi ${ro.participle}`;
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}
```

- [ ] **Step 5: The English generator**

In `src/engine/english.ts` add after the `SELF` constant:

```ts
const DONT = ["don't", "don't", "doesn't", "don't", "don't", "don't"];
const WASNT = ["wasn't", "weren't", "wasn't", "weren't", "weren't", "weren't"];
const HAVENT = ["haven't", "haven't", "hasn't", "haven't", "haven't", "haven't"];
```

and replace the body of `enVerb` (keep its signature, the `EnParts` interface and `enVerbText`) with:

```ts
export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): EnParts {
  const en = voiceOf(v, s.voice).en;
  const i = whoIndex(s);
  const negative = s.polarity === 'negative';
  const present = i === 2 ? en.third : en.base;
  // "do"-support, or "not" after a modal.
  const presentNot = en.modal ? `${present} not` : `${DONT[i]} ${en.base}`;
  const self = en.reflexive ? ` (${SELF[i]})` : '';
  const parts = (verb: string, lead = '', subject = true): EnParts => ({ lead, subject, verb: `${verb}${self}` });
  switch (`${s.mood}.${s.tense}`) {
    case 'indicative.present':
      return parts(negative ? presentNot : present);
    case 'indicative.imperfect':
      return parts(`${negative ? WASNT[i] : WAS[i]} ${en.ing}`);
    case 'indicative.aorist':
      return parts(negative ? `didn't ${en.base}` : en.past);
    case 'indicative.future':
    case 'indicative.futureSimple':
      return parts(`${negative ? "won't" : 'will'} ${en.base}`);
    case 'indicative.perfect':
      return parts(`${negative ? HAVENT[i] : HAVE[i]} ${en.pastParticiple}`);
    case 'indicative.pluperfect':
      return parts(`${negative ? "hadn't" : 'had'} ${en.pastParticiple}`);
    case 'indicative.futurePerfect':
      return parts(`${negative ? "won't" : 'will'} have ${en.pastParticiple}`);
    case 'subjunctive.present':
    case 'subjunctive.aorist':
      return parts(negative ? presentNot : present, 'that');
    case 'subjunctive.perfect':
      return parts(`may${negative ? ' not' : ''} have ${en.pastParticiple}`);
    case 'imperative.present':
    case 'imperative.aorist':
      return parts(negative ? `don't ${en.base}` : en.base, '', false);
    case 'conditional.imperfect':
      return parts(`${negative ? "wouldn't" : 'would'} ${en.base}`);
    case 'conditional.pluperfect':
      return parts(`${negative ? "wouldn't" : 'would'} have ${en.pastParticiple}`);
    default:
      throw new Error(`${s.mood} ${s.tense} is not a Greek tense`);
  }
}
```

- [ ] **Step 6: The validator checks both polarities**

In `src/validate/validate.ts`, in the verb block of `checkLexeme`, replace the line `for (const slot of allVerbSlots(l)) {` with:

```ts
    const slots = allVerbSlots(l).flatMap((s): SlotOf<'verb'>[] => [s, { ...s, polarity: 'negative' }]);
    for (const slot of slots.filter((s) => isOffered(l, s))) {
```

(the body of the loop is unchanged), and make sure `isOffered` is imported from `'../engine/offers'` (it is already imported for the token check) and `SlotOf` from `'../types'`.

- [ ] **Step 7: Review item**

Add to `src/data/review.ts`:

```ts
  { id: 'auxiliary-table:negation', kind: 'auxiliary-table', verified: false },
```

(It covers the place of δεν and μην, the Romanian *nu* / *să nu* rules and the English contracted negatives.)

- [ ] **Step 8: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `Data is valid.`

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/data/lexemes.ts src/data/review.ts src/engine/romanian.ts src/engine/english.ts src/engine/verbs-ro-en.test.ts src/validate/validate.ts src/validate/validate.test.ts
git commit -m "feat: negative forms in Romanian and English, and validation of both polarities

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The "Negated" control and negation in the verb panel

**Files:**

- Modify: `src/panels/types.ts`, `src/panels/verb.ts`, `src/panels/panels.ts`
- Test: `src/panels/verb.test.ts`, `src/panels/panels.test.ts`

**Interfaces:**

- Consumes: Tasks 1 and 2 (`polarity`, negative forms), Plan 3's verb panel.
- Produces:
  - `Control.key` gains `'polarity'`; the verb panel's last control is `Negated?` with the options `No` (`affirmative`) and `Yes` (`negative`).
  - `changeVerbSlot(verb, slot, 'polarity', value)`: `negative` sets the field, anything else removes it (an affirmative slot never carries `polarity`, so it equals the authored slot); if the negative slot is not offered (a negative command with no matching subjunctive) the slot falls back to affirmative.
  - `applyControl(state, 'polarity', value, lexemeId)`.
  - The full table and the tense overview follow the polarity; the plain-language line explains where the negation goes.

- [ ] **Step 1: Write the failing tests**

In `src/panels/verb.test.ts` add to the imports `import { getVerb } from '../data/lexemes';`, `import { changeVerbSlot } from './verb';` and `GreekVerb` to the type import, then append:

```ts
const negative = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('verb panel: negation', () => {
  it('shows the negative forms in the three languages', () => {
    const p = panel('troo', negative(vs('indicative', 'perfect')));
    expect(cells(p)).toEqual({ el: '(εγώ) δεν έχω φάει', ro: '(eu) nu am mâncat', en: "I haven't eaten" });
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['dim', 'plain', 'neg', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });

  it('a negative command is μην + the subjunctive, with no subject pronoun', () => {
    const p = panel('troo', negative(vs('imperative', 'aorist', 2, 'sg')));
    expect(cells(p)).toEqual({ el: 'μην φας', ro: 'nu mânca', en: "don't eat" });
    const plural = panel('troo', negative(vs('imperative', 'aorist', 2, 'pl')));
    expect(cells(plural)).toEqual({ el: 'μην φάτε', ro: 'nu mâncați', en: "don't eat" });
  });

  it('offers a Negated? control last, with plain Yes and No', () => {
    const p = panel('pleno', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity']);
    expect(control(p, 'polarity')).toMatchObject({ label: 'Negated?', value: 'affirmative' });
    expect(control(p, 'polarity')?.options.map((o) => o.label)).toEqual(['No', 'Yes']);
    expect(control(panel('troo', negative(vs('indicative', 'present'))), 'polarity')?.value).toBe('negative');
  });

  it('explains where the negation goes', () => {
    expect(panel('troo', negative(vs('indicative', 'futureSimple'))).plain).toContain('δεν goes in front of the whole group');
    expect(panel('troo', negative(vs('subjunctive', 'aorist'))).plain).toContain('μην goes after να');
    expect(panel('troo', negative(vs('imperative', 'aorist', 2))).plain).toContain('not the imperative');
    expect(panel('troo', vs('indicative', 'present')).plain).not.toContain('δεν goes');
  });

  it('the full table and the overview follow the polarity', () => {
    const p = panel('troo', negative(vs('indicative', 'perfect')), 'improver');
    expect(richText(p.full[0].el)).toBe('(εγώ) δεν έχω φάει');
    expect((p.overview ?? [])[5].label).toBe('indicative · present perfect');
    expect(richText((p.overview ?? [])[5].el)).toBe('(εγώ) δεν έχω φάει');
    expect(richText((p.overview ?? [])[0].en)).toBe("I don't eat");
  });
});

describe('verb panel: the polarity control', () => {
  const change = (slot: SlotOf<'verb'>, value: string) =>
    applyControl(stateOf(slot), 'polarity', value, 'troo').slot as SlotOf<'verb'>;

  it('yes sets negative; no removes the field, so the slot equals the authored one again', () => {
    const on = change(vs('indicative', 'present'), 'negative');
    expect(on.polarity).toBe('negative');
    const off = change(on, 'affirmative');
    expect('polarity' in off).toBe(false);
    expect(off).toEqual(vs('indicative', 'present'));
  });

  it('keeps the polarity when the mood changes', () => {
    const slot = applyControl(stateOf(negative(vs('indicative', 'aorist', 2))), 'mood', 'imperative', 'troo').slot;
    expect(slot).toMatchObject({ mood: 'imperative', tense: 'aorist', polarity: 'negative' });
  });

  it('falls back to affirmative when the negative command is not offered', () => {
    const troo = getVerb('troo');
    const noSubjunctive: GreekVerb = {
      ...troo,
      voices: {
        active: {
          ...(troo.voices.active as NonNullable<GreekVerb['voices']['active']>),
          offers: { indicative: ['present'], imperative: ['aorist'] },
        },
      },
    };
    const next = changeVerbSlot(noSubjunctive, negative(vs('indicative', 'present', 2)), 'mood', 'imperative');
    expect(next.mood).toBe('imperative');
    expect('polarity' in next).toBe(false);
  });
});
```

In `src/panels/verb.test.ts` also update the two earlier control-list expectations to include the new control: `expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);` (θέλω) and `['who', 'mood', 'tense', 'voice', 'polarity']` (πλένω). In `src/panels/panels.test.ts` change the θέλω controls expectation to `['who', 'mood', 'tense', 'polarity']`.

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels`
Expected: FAIL (no polarity control, `changeVerbSlot` rejects the key).

- [ ] **Step 3: The control key and `applyControl`**

In `src/panels/types.ts` change `Control.key` to:

```ts
  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case';
```

In `src/panels/panels.ts` extend the verb case of `applyControl`:

```ts
    case 'mood':
    case 'tense':
    case 'voice':
    case 'polarity':
```

(the body of the case is unchanged: it calls `changeVerbSlot(getVerb(lexemeId), slot, key, value)`).

- [ ] **Step 4: The verb panel**

In `src/panels/verb.ts` add after the `PLAIN` table:

```ts
/** Where the negation goes, added to the plain-language line of a negated slot (spec 4.3, 6.4). */
const NEGATION_PLAIN: Record<Mood, string> = {
  indicative: 'δεν goes in front of the whole group, even in front of θα: δεν θα φάω.',
  conditional: 'δεν goes in front of the whole group, even in front of θα: δεν θα έτρωγα.',
  subjunctive: 'μην goes after να: να μην φάω.',
  imperative: 'A negative command is not the imperative: Greek uses μην + the subjunctive form, as in μην φας.',
};
```

Change the signature and body of `changeVerbSlot`:

```ts
export function changeVerbSlot(
  verb: GreekVerb,
  slot: SlotOf<'verb'>,
  key: 'mood' | 'tense' | 'voice' | 'polarity',
  value: string,
): SlotOf<'verb'> {
  const next = { ...slot };
  if (key === 'voice') next.voice = value as Voice;
  if (key === 'mood') next.mood = value as Mood;
  if (key === 'tense') next.tense = value as Tense;
  if (key === 'polarity') {
    if (value === 'negative') next.polarity = 'negative';
    else delete next.polarity;
  }
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
  // A negative command needs the verb to offer the matching subjunctive; if it does not, drop the negation.
  if (next.polarity === 'negative' && !isOffered(verb, next)) delete next.polarity;
  return next;
}
```

In `controls()`, after the block that pushes the `voice` control, add:

```ts
  list.push({
    key: 'polarity',
    label: 'Negated?',
    options: [
      { value: 'affirmative', label: 'No' },
      { value: 'negative', label: 'Yes' },
    ],
    value: slot.polarity ?? 'affirmative',
  });
```

In `verbPanel`, change the `plain` line to:

```ts
    plain:
      PLAIN[`${slot.mood}.${slot.tense}`] +
      (slot.polarity === 'negative' ? ` ${NEGATION_PLAIN[slot.mood]}` : ''),
```

(`whoSlot` and `overviewRow` already spread the slot, so the full table and the overview keep the polarity.)

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/panels/types.ts src/panels/verb.ts src/panels/panels.ts src/panels/verb.test.ts src/panels/panels.test.ts
git commit -m "feat: Negated control and negation in the verb panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Phrases 16, 25 and 39, and the negation notes

**Files:**

- Modify: `src/types.ts`, `src/data/phrases.ts`, `src/data/divergences.ts`, `src/components/ComparisonTable.tsx`
- Test: `src/data/phrases-verbs.test.ts`, `src/components/ComparisonTable.test.tsx`

**Interfaces:**

- Consumes: Tasks 1 to 3; Plan 3's phrase helpers (`vslot`, `u`, `seg`, `p`, `rows`).
- Produces:
  - `Divergence.appliesTo.when.polarity?: Polarity` (a row with it shows only for that polarity; an absent slot polarity counts as affirmative).
  - Phrases `dont-want-to-go` (16), `dont-eat-the-bread` (25) and `want-not-to-go` (39); `PHRASES` has 25 entries in the spec order.
  - Notes `subjunctive-negation`, `negative-imperative` and `negation-position`.

- [ ] **Step 1: Write the failing tests**

In `src/data/phrases-verbs.test.ts` replace the whole test `it('the picker lists all 22 phrases in the spec order', …)` with:

```ts
  it('the picker lists all 25 phrases in the spec order', () => {
    expect(PHRASES.map((p) => p.id)).toEqual([
      'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
      'washing-myself', 'washing-the-child', 'sleeping',
      'present-perfect', 'past-perfect', 'future-perfect', 'want-to-eat', 'want-to-eat-regularly',
      'dont-want-to-go', 'fox-has-jumped', 'have-washed-myself', 'ate-the-bread', 'wanted-a-coffee',
      'fox-was-jumping', 'eat-the-bread', 'dont-eat-the-bread', 'wash-the-child', 'keep-eating-the-bread',
      'may-have-eaten', 'would-like-a-coffee', 'would-have-eaten-the-bread', 'want-not-to-go',
    ]);
  });
```

and append at the end of the file:

```ts
describe('phrases with negation', () => {
  it('phrase 16 negates the main verb before a subjunctive', () => {
    const phrase = byId('dont-want-to-go');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Δεν θέλω', 'να πάω']);
    expect(phrase.tokens[0].slot).toMatchObject({ polarity: 'negative' });
    expect(phrase.tokens[1].slot).not.toHaveProperty('polarity');
  });

  it('phrase 25 is a negative command built from the subjunctive', () => {
    const phrase = byId('dont-eat-the-bread');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Μην φας', 'το', 'ψωμί!']);
    expect(phrase.tokens[0].slot).toMatchObject({ mood: 'imperative', tense: 'aorist', person: 2, polarity: 'negative' });
  });

  it('phrase 39 negates the subjunctive clause, not the main verb', () => {
    const phrase = byId('want-not-to-go');
    expect(phrase.tokens.map((t) => t.text)).toEqual(['Θέλω', 'να μην πάω']);
    expect(phrase.tokens[0].slot).not.toHaveProperty('polarity');
    expect(phrase.tokens[1].slot).toMatchObject({ mood: 'subjunctive', polarity: 'negative' });
    const roNatural = phrase.glosses.find((g) => g.language === 'ro' && g.kind === 'natural');
    expect(roNatural?.units.map((u) => ('text' in u ? u.text : '')).join(' ')).toBe('Vreau să nu merg');
  });

  it('the English literal rows of 16 and 39 differ in where "not" sits', () => {
    const literal = (id: string) =>
      byId(id).glosses.find((g) => g.language === 'en' && g.kind === 'literal')?.units.map((u) => ('text' in u ? u.text : ''));
    expect(literal('dont-want-to-go')).toEqual(['(I)', 'not', 'want', 'that', '(I)', 'go']);
    expect(literal('want-not-to-go')).toEqual(['(I)', 'want', 'that', 'not', '(I)', 'go']);
  });

  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });
});
```

Append to `src/components/ComparisonTable.test.tsx`:

```tsx
describe('selectDivergences by polarity', () => {
  const verb = (mood: string, tense: string, polarity?: 'negative'): Slot =>
    ({ pos: 'verb', person: 2, number: 'sg', mood, tense, voice: 'active', ...(polarity ? { polarity } : {}) }) as Slot;
  const ids = (slot: Slot) => selectDivergences(DIVERGENCES, 'verb', 'troo', 'improver', slot).map((d) => d.id);

  it('the negated subjunctive shows its note; the affirmative does not', () => {
    expect(ids(verb('subjunctive', 'aorist', 'negative'))).toContain('subjunctive-negation');
    expect(ids(verb('subjunctive', 'aorist'))).not.toContain('subjunctive-negation');
  });

  it('the negative command shows its note', () => {
    expect(ids(verb('imperative', 'aorist', 'negative'))).toContain('negative-imperative');
    expect(ids(verb('imperative', 'aorist'))).not.toContain('negative-imperative');
  });

  it('the position of the negation is explained for indicative and conditional forms', () => {
    expect(ids(verb('indicative', 'futureSimple', 'negative'))).toContain('negation-position');
    expect(ids(verb('conditional', 'imperfect', 'negative'))).toContain('negation-position');
    expect(ids(verb('indicative', 'futureSimple'))).not.toContain('negation-position');
    expect(ids(verb('subjunctive', 'aorist', 'negative'))).not.toContain('negation-position');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/phrases-verbs.test.ts src/components/ComparisonTable.test.tsx`
Expected: FAIL (the phrases and the notes do not exist).

- [ ] **Step 3: Widen the condition and the selector**

In `src/types.ts` change the `when` line of `Divergence.appliesTo` to:

```ts
    when?: { moods?: Mood[]; tenses?: Tense[]; voices?: Voice[]; polarity?: Polarity };
```

In `src/components/ComparisonTable.tsx` change the return expression of `matchesWhen` to:

```ts
  return (
    (!when.moods || when.moods.includes(slot.mood)) &&
    (!when.tenses || when.tenses.includes(slot.tense)) &&
    (!when.voices || when.voices.includes(slot.voice)) &&
    (!when.polarity || (slot.polarity ?? 'affirmative') === when.polarity)
  );
```

- [ ] **Step 4: The notes**

Append inside the `DIVERGENCES` array in `src/data/divergences.ts`:

```ts
  {
    id: 'negation-position',
    appliesTo: { pos: 'verb', when: { moods: ['indicative', 'conditional'], polarity: 'negative' } },
    point: 'Where "not" goes',
    el: 'δεν goes in front of the whole group, even in front of θα: δεν θα φάω',
    ro: 'nu goes in front of the group: nu voi mânca',
    en: "n't joins the first auxiliary: won't eat, haven't eaten",
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'subjunctive-negation',
    appliesTo: { pos: 'verb', when: { moods: ['subjunctive'], polarity: 'negative' } },
    point: 'Negating "to …"',
    el: 'να μην φάω (μην after να)',
    ro: 'să nu mănânc',
    en: "not to eat, or that I don't eat",
    tag: 'differs',
    level: 'core',
    verified: false,
  },
  {
    id: 'negative-imperative',
    appliesTo: { pos: 'verb', when: { moods: ['imperative'], polarity: 'negative' } },
    point: 'A negative command',
    el: 'μην + the subjunctive form: μην φας',
    ro: 'nu + the infinitive (nu mânca) or nu + the plural imperative (nu mâncați)',
    en: "don't + the base verb: don't eat",
    tag: 'differs',
    level: 'core',
    verified: false,
  },
```

- [ ] **Step 5: The phrases**

In `src/data/phrases.ts` insert before `export const PHRASES`:

```ts
const dontWantToGo: Phrase = {
  id: 'dont-want-to-go',
  title: "I don't want to go",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Δεν θέλω', lexeme: 'thelo', slot: { ...vslot('indicative', 'present'), polarity: 'negative' } as Slot },
    { text: 'να πάω', lexeme: 'pao', slot: vslot('subjunctive', 'aorist') },
  ],
  glosses: rows(
    [u("I don't", p(0, 0)), u('want', p(0, 1)), u('to', p(1, 0)), u('go', p(1, 1))],
    [u('(I)', null), u('not', p(0, 0)), u('want', p(0, 1)), u('that', p(1, 0)), u('(I)', null), u('go', p(1, 1))],
    [u('Nu', p(0, 0)), u('vreau', p(0, 1)), u('să', p(1, 0)), u('merg', p(1, 1))],
    [u('(Eu)', null), u('nu', p(0, 0)), u('vreau', p(0, 1)), u('să', p(1, 0)), u('(eu)', null), u('merg', p(1, 1))],
  ),
  verified: false,
};

const dontEatTheBread: Phrase = {
  id: 'dont-eat-the-bread',
  title: "Don't eat the bread!",
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Μην φας', lexeme: 'troo', slot: { ...vslot('imperative', 'aorist', 2), polarity: 'negative' } as Slot },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("Don't", p(0, 0)), u('eat', p(0, 1)), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('not', p(0, 0)), u('eat', p(0, 1)), u('the-[acc]', 1), u('bread', 2)],
    [u('Nu', p(0, 0)), u('mânca', p(0, 1)), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('nu', p(0, 0)), u('mânca', p(0, 1)), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const wantNotToGo: Phrase = {
  id: 'want-not-to-go',
  title: "I'd rather not go",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να μην πάω', lexeme: 'pao', slot: { ...vslot('subjunctive', 'aorist'), polarity: 'negative' } as Slot },
  ],
  glosses: rows(
    [u("I'd rather", 0), u('not', p(1, 1)), u('go', p(1, 2))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('not', p(1, 1)), u('(I)', null), u('go', p(1, 2))],
    [u('Vreau', 0), u('să', p(1, 0)), u('nu', p(1, 1)), u('merg', p(1, 2))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('nu', p(1, 1)), u('(eu)', null), u('merg', p(1, 2))],
  ),
  verified: false,
};
```

Replace the `PHRASES` export with the spec order (1, 2, 3, 4, 5, 6, 11 to 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 31, 39):

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
  dontWantToGo,
  foxHasJumped,
  haveWashedMyself,
  ateTheBread,
  wantedACoffee,
  foxWasJumping,
  eatTheBread,
  dontEatTheBread,
  washTheChild,
  keepEatingTheBread,
  mayHaveEaten,
  wouldLikeACoffee,
  wouldHaveEaten,
  wantNotToGo,
];
```

- [ ] **Step 6: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; no warnings. If `PhrasePicker.test.tsx` hard-codes the theme groups, update it to the real groups (themes in order of first appearance: Ordering, The fox sentence, Daily life, Eating, Wishes and possibility).

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/data/phrases.ts src/data/divergences.ts src/components/ComparisonTable.tsx src/components/ComparisonTable.test.tsx src/data/phrases-verbs.test.ts
git commit -m "feat: phrases 16, 25 and 39, and the notes on where the negation goes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Verb groups as groups of piece buttons, and gloss highlighting by piece

**Files:**

- Modify: `src/components/PhraseBar.tsx`, `src/components/PhraseBar.test.tsx`, `src/components/GlossGrid.tsx`, `src/components/GlossGrid.test.tsx`, `src/App.test.tsx`, `src/styles.css`

**Interfaces:**

- Consumes: Plan 3's `compose`; `linkedToken`, `linkedPiece` from `glossLinks.ts`.
- Produces:
  - `PhraseBar` props `{ tokens, selected, selectedPiece?: number | null, onSelect(index, piece?) }`. A verb token of two or more pieces renders as `<span role="group" aria-label={token.text}>` holding one `<button class="chip piece piece-<kind>">` per piece, `aria-pressed` on the selected piece (the verb piece when `selectedPiece` is null). A single-word token is one button as before. `onSelect(i, j)` reports the piece.
  - `GlossGrid` props `{ glosses, selected, selectedPiece?: number | null, onSelect(index, piece?) }`. A unit is pressed when its link names the selected token and (no piece is selected, or the link has no piece, or the pieces are equal). Clicking a unit with a piece link calls `onSelect(token, piece)`; a whole-token link calls `onSelect(token)`.

- [ ] **Step 1: Write the failing tests**

In `src/components/PhraseBar.test.tsx` add `within` to the first import (`import { render, screen, within } from '@testing-library/react';`) and replace the whole `describe('PhraseBar: verb groups', …)` block with:

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

  it('is one group named by its written words, with a button for each piece', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.textContent)).toEqual(['Θα', 'έχω', 'φάει']);
    expect(pieces.map((b) => b.className)).toEqual([
      'chip piece piece-particle',
      'chip piece piece-auxiliary',
      'chip piece piece-verb',
    ]);
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('presses the verb piece by default', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
  });

  it('presses only the selected piece when one is selected', () => {
    render(<PhraseBar tokens={group} selected={0} selectedPiece={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
  });

  it('presses nothing in a group that is not selected', () => {
    render(<PhraseBar tokens={group} selected={1} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false']);
  });

  it('reports the token and the piece that was clicked', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={group} selected={1} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'έχω' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });

  it('a single-word verb is a plain button', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={group} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'Θέλω' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Θέλω' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

In `src/components/GlossGrid.test.tsx` replace the existing test `it('highlights and selects through a link that names a piece of a token', …)` with these three:

```tsx
  const pieceGlosses: GlossRow[] = [
    {
      language: 'en',
      kind: 'natural',
      units: [
        { text: "don't", link: { token: 1, piece: 0 } },
        { text: 'want', link: { token: 1, piece: 1 } },
        { text: 'now', link: 1 },
      ],
    },
  ];

  it('highlights every unit of the selected token, pieces included, when no piece is selected', () => {
    render(<GlossGrid glosses={pieceGlosses} selected={1} onSelect={() => {}} />);
    for (const name of ["don't", 'want', 'now']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('highlights only the units of the selected piece, and the units that cover the whole token', () => {
    render(<GlossGrid glosses={pieceGlosses} selected={1} selectedPiece={1} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: "don't" })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'want' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'now' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('selects the token and the piece when a unit with a piece link is clicked', async () => {
    const onSelect = vi.fn();
    render(<GlossGrid glosses={pieceGlosses} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'want' }));
    expect(onSelect).toHaveBeenCalledWith(1, 1);
    await userEvent.setup().click(screen.getByRole('button', { name: 'now' }));
    expect(onSelect).toHaveBeenLastCalledWith(1);
  });
```

In `src/App.test.tsx`, in the first test of `describe('verb groups in the app', …)` replace these lines:

```tsx
    const chip = screen.getByRole('button', { name: 'Έχω φάει' });
    expect(chip.querySelectorAll('.piece')).toHaveLength(2);
    await user.click(chip);
```

with:

```tsx
    const group = screen.getByRole('group', { name: 'Έχω φάει' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    await user.click(within(group).getByRole('button', { name: 'φάει' }));
```

and the later line `expect(screen.getByRole('button', { name: 'Έχω φάει' })).toBeInTheDocument();` with `expect(screen.getByRole('group', { name: 'Έχω φάει' })).toBeInTheDocument();`.

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/components src/App.test.tsx`
Expected: FAIL (no groups, no piece selection).

- [ ] **Step 3: The phrase bar**

Replace `src/components/PhraseBar.tsx` with:

```tsx
import { getLexeme } from '../data/lexemes';
import { compose } from '../engine/compose';
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  /** The piece of the selected verb group that is pressed; null presses the verb itself. */
  selectedPiece?: number | null;
  onSelect: (index: number, piece?: number) => void;
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

export function PhraseBar({ tokens, selected, selectedPiece = null, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => {
        const pieces = groupPieces(token);
        if (!pieces) {
          return (
            <button key={i} type="button" className="chip" aria-pressed={i === selected} onClick={() => onSelect(i)}>
              {token.text}
            </button>
          );
        }
        const verbPiece = pieces.length - 1;
        return (
          <span
            key={i}
            role="group"
            aria-label={token.text}
            className={`chip-group${i === selected ? ' is-selected' : ''}`}
          >
            {pieces.map((piece, j) => (
              <button
                key={j}
                type="button"
                className={`chip piece piece-${piece.kind}`}
                aria-pressed={i === selected && (selectedPiece ?? verbPiece) === j}
                onClick={() => onSelect(i, j)}
              >
                {piece.word}
              </button>
            ))}
          </span>
        );
      })}
    </div>
  );
}
```

In `src/styles.css` replace the two Plan 3 piece lines (`.chip .piece-particle, .chip .piece-auxiliary { … }` and the `[aria-pressed='true']` override) with:

```css
.chip-group { display: inline-flex; gap: 2px; padding: 2px; border: 0.5px solid var(--border); border-radius: 10px; }
.chip-group.is-selected { border-color: var(--accent-border); }
.chip.piece { padding: 4px 10px; }
.chip.piece-particle, .chip.piece-auxiliary { color: var(--accent-text); }
.chip.piece-negation { font-weight: 600; }
.chip.piece[aria-pressed='true'] { color: var(--accent-text); }
```

(the earlier `.chip .piece-negation { font-weight: 600; }` rule from Task 1 can stay or be removed; the new rule replaces it.)

- [ ] **Step 4: The gloss grid**

Replace `src/components/GlossGrid.tsx` with:

```tsx
import { isSegmented, linkedPiece, linkedToken } from '../glossLinks';
import type { GlossRow, Link } from '../types';

interface Props {
  glosses: GlossRow[];
  selected: number;
  /** The selected piece of the selected verb group; null means the token as a whole. */
  selectedPiece?: number | null;
  onSelect: (index: number, piece?: number) => void;
}

const LANGUAGE_NAME = { en: 'English', ro: 'Română' } as const;

/**
 * A unit is lit when it links to the selected token and, with a piece selected, to that piece or to the whole
 * token (a unit that covers the whole token, like Romanian mâncasem, covers every piece).
 */
function isPressed(link: Link, selected: number, piece: number | null): boolean {
  if (linkedToken(link) !== selected) return false;
  const linked = linkedPiece(link);
  return piece === null || linked === null || linked === piece;
}

const choose = (link: Link, onSelect: Props['onSelect']): void =>
  typeof link === 'number' ? onSelect(link) : onSelect(link.token, link.piece);

export function GlossGrid({ glosses, selected, selectedPiece = null, onSelect }: Props) {
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
                          aria-pressed={isPressed(segment.link, selected, selectedPiece)}
                          onClick={() => choose(segment.link, onSelect)}
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
                    aria-pressed={isPressed(link, selected, selectedPiece)}
                    onClick={() => choose(link, onSelect)}
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

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green. `Explorer` still passes `onSelect={setSelected}`, which accepts the extra `piece` argument; clicking a piece now selects its token and nothing more (Task 6 wires the pieces).

- [ ] **Step 6: Commit**

```bash
git add src/components/PhraseBar.tsx src/components/PhraseBar.test.tsx src/components/GlossGrid.tsx src/components/GlossGrid.test.tsx src/App.test.tsx src/styles.css
git commit -m "feat: verb groups as groups of piece buttons, and gloss highlighting by piece

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Piece panels: θα, δεν, μην and έχω open their own panels

**Files:**

- Modify: `src/Explorer.tsx`, `src/components/WordPanel.tsx`, `src/styles.css`
- Test: `src/App.test.tsx`

**Interfaces:**

- Consumes: Task 5's `PhraseBar` / `GlossGrid` (`onSelect(index, piece?)`, `selectedPiece`); Plan 3's `compose`, `buildPanel`, `applyControl`; Plan 3's particle panel and the verb panel of έχω.
- Produces:
  - `Explorer` keeps `selected` (token), `piece` (the highlighted piece or null) and `open` (an `OpenPiece`: the pseudo-token of the piece, its `PanelState`, its initial state). Selecting a particle, negation or auxiliary piece, from a chip or a gloss unit, opens that piece's panel on the piece of the *authored* token; selecting the verb piece, or a whole token, shows the verb panel. The piece panel has its own working copy: its controls, "Differs from the phrase." and "Reset to phrase" act on it.
  - `WordPanel` takes `onBack?: () => void` and shows a "← Back to the verb" button when it is given.
  - The comparison table is hidden when the selected panel has no notes (the particle panels have none).

- [ ] **Step 1: Write the failing tests**

Append to `src/App.test.tsx`:

```tsx
describe('pieces of a verb group', () => {
  async function openPhrase(title: string) {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), title);
    return user;
  }

  it('opens the panel of θα from its chip, and goes back to the verb', async () => {
    const user = await openPhrase('I will have eaten');
    const group = screen.getByRole('group', { name: 'Θα έχω φάει' });
    await user.click(within(group).getByRole('button', { name: 'Θα' }));

    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θα');
    expect(within(panel).getByRole('cell', { name: 'θα φάω' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'Θα' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'φάει' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(within(group).getByRole('button', { name: 'φάει' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(panel).queryByRole('button', { name: /Back to the verb/ })).not.toBeInTheDocument();
  });

  it('opens the verb panel of the auxiliary, with its own controls and its own copy', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'έχω' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('έχω');
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω' })).toBeInTheDocument();

    await user.selectOptions(within(panel).getByLabelText('Who?'), 'we');
    expect(within(panel).getByRole('cell', { name: '(εμείς) έχουμε' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Θα έχω φάει' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω' })).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('opens the panel of the negation', async () => {
    const user = await openPhrase("I don't want to go");
    await user.click(within(screen.getByRole('group', { name: 'Δεν θέλω' })).getByRole('button', { name: 'Δεν' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('δεν');
    expect(within(panel).getByRole('cell', { name: 'δεν θέλω' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'nu vreau' })).toBeInTheDocument();
  });

  it('the verb piece shows the verb panel', async () => {
    const user = await openPhrase("I don't want to go");
    await user.click(within(screen.getByRole('group', { name: 'Δεν θέλω' })).getByRole('button', { name: 'θέλω' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θέλω');
    expect(within(panel).getByRole('cell', { name: "(εγώ) δεν θέλω" })).toBeInTheDocument();
  });

  it('a gloss unit linked to a piece selects that piece and opens its panel', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(screen.getByRole('button', { name: 'I will' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θα');
    expect(
      within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'Θα' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('a gloss unit linked to the whole token shows the verb panel', async () => {
    const user = await openPhrase('I had eaten');
    await user.click(screen.getAllByRole('button', { name: 'Mâncasem' })[0]);
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(
      within(screen.getByRole('group', { name: 'Είχα φάει' })).getByRole('button', { name: 'φάει' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights only the units of the selected piece in the gloss rows', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'έχω' }));
    // "have" is in the natural and the literal row; "eaten" too; "I will" only in the natural row.
    for (const unit of screen.getAllByRole('button', { name: 'have' })) expect(unit).toHaveAttribute('aria-pressed', 'true');
    for (const unit of screen.getAllByRole('button', { name: 'eaten' })) expect(unit).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'I will' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'will' })).toHaveAttribute('aria-pressed', 'false');
  });
});
```

(`render`, `screen`, `within`, `userEvent` and `App` are imported at the top of the file.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (clicking a piece only selects the token).

- [ ] **Step 3: The explorer**

Replace `src/Explorer.tsx` with:

```tsx
import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { getVerb } from './data/lexemes';
import { compose, pieceText } from './engine/compose';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';
import type { Level, Phrase, Slot, Token } from './types';

/** A panel for one piece of a verb group (a particle, a negation or the auxiliary), working on its own copy. */
interface OpenPiece {
  token: Token;
  state: PanelState;
  initial: PanelState;
}

/** The panel to open for piece `index` of the group that `slot` of verb `lexemeId` composes; null for the verb itself. */
function pieceToOpen(lexemeId: string, slot: Slot, index: number): OpenPiece | null {
  if (slot.pos !== 'verb') return null;
  const piece = compose(getVerb(lexemeId), slot).pieces[index];
  if (!piece || piece.kind === 'verb') return null;
  const state: PanelState = { slot: piece.slot, noun: null, nounNumber: 'sg' };
  return { token: { text: pieceText(piece), lexeme: piece.lexeme, slot: piece.slot }, state, initial: state };
}

/** One phrase: the phrase bar, the gloss rows, the word panel and the comparison. */
export function Explorer({ phrase, level }: { phrase: Phrase; level: Level }) {
  const initial = phrase.tokens.map((t) => initialState(t, phrase));
  const [states, setStates] = useState<PanelState[]>(initial);
  const [selected, setSelected] = useState(0);
  const [piece, setPiece] = useState<number | null>(null);
  const [open, setOpen] = useState<OpenPiece | null>(null);

  const token = phrase.tokens[selected];
  const current: OpenPiece = open ?? { token, state: states[selected], initial: initial[selected] };
  const panel = buildPanel(current.state, current.token, level);
  const divergences = selectDivergences(
    DIVERGENCES,
    current.state.slot.pos,
    current.token.lexeme,
    level,
    current.state.slot,
  );
  const differsFromPhrase = !sameState(current.state, current.initial);

  /** A chip piece or a gloss unit was clicked: select the token and piece; open the piece's own panel unless it is the verb. */
  function select(index: number, pieceIndex?: number) {
    const target = phrase.tokens[index];
    setSelected(index);
    setPiece(pieceIndex ?? null);
    setOpen(pieceIndex === undefined ? null : pieceToOpen(target.lexeme, target.slot, pieceIndex));
  }

  function back() {
    setOpen(null);
    setPiece(null);
  }

  function changeControl(key: string, value: string) {
    if (open) {
      setOpen({ ...open, state: applyControl(open.state, key, value, open.token.lexeme) });
      return;
    }
    setStates((all) => all.map((s, i) => (i === selected ? applyControl(s, key, value, token.lexeme) : s)));
  }

  function resetToPhrase() {
    if (open) {
      setOpen({ ...open, state: open.initial });
      return;
    }
    setStates((all) => all.map((s, i) => (i === selected ? initial[selected] : s)));
  }

  return (
    <>
      <section className="card" aria-label={phrase.title}>
        <PhraseBar tokens={phrase.tokens} selected={selected} selectedPiece={piece} onSelect={select} />
        <GlossGrid glosses={phrase.glosses} selected={selected} selectedPiece={piece} onSelect={select} />
      </section>
      {differsFromPhrase && (
        <div className="phrase-status" role="status">
          <span>Differs from the phrase.</span>
          <button type="button" onClick={resetToPhrase}>
            Reset to phrase
          </button>
        </div>
      )}
      <WordPanel panel={panel} onChange={changeControl} onBack={open ? back : undefined} />
      {divergences.length > 0 && <ComparisonTable rows={divergences} word={current.token.text} />}
    </>
  );
}
```

- [ ] **Step 4: The back link**

In `src/components/WordPanel.tsx` change the props and the start of the component:

```tsx
interface Props {
  panel: Panel;
  onChange: (key: string, value: string) => void;
  /** Given while a piece panel is open: returns to the verb's own panel. */
  onBack?: () => void;
}

export function WordPanel({ panel, onChange, onBack }: Props) {
  return (
    <section className="card word-panel" aria-label="Word panel">
      {onBack && (
        <button type="button" className="back-link" onClick={onBack}>
          ← Back to the verb
        </button>
      )}
      <h2 lang="el">{panel.lemma}</h2>
```

(the rest of the component is unchanged). In `src/styles.css` add:

```css
.back-link { font: inherit; font-size: 13px; color: var(--accent-text); background: none; border: 0; padding: 0 0 6px; cursor: pointer; text-decoration: underline; }
.back-link:focus-visible { outline: 2px solid var(--accent-border); outline-offset: 2px; }
```

and add `.back-link:focus-visible` to nothing else (it has its own rule above).

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green. If an earlier App test expects the "Comparison" region for a token that has no notes, check that the token really has notes; the particle panels are the only ones without.

- [ ] **Step 6: Commit**

```bash
git add src/Explorer.tsx src/components/WordPanel.tsx src/App.test.tsx src/styles.css
git commit -m "feat: clicking θα, δεν, μην or έχω opens that piece's panel, with a way back to the verb

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The reading engine: the Greek "how to read this" line

**Files:**

- Create: `src/data/readings.ts`, `src/engine/reading.ts`, `src/engine/reading.test.ts`, `src/data/readings.test.ts`
- Modify: `src/types.ts`, `src/engine/tenses.ts`, `src/data/review.ts`, `src/validate/validate.ts`, `src/validate/validate.test.ts`, `scripts/validate.ts`

**Interfaces:**

- Consumes: Plan 3's `compose`, `Form.irregular`, `labels.ts`; Task 1's pieces.
- Produces:
  - Types: `ReadingTemplate { rule, beginner, improver, verified }`, `ReadingPart { text, label, role, gloss, piece }` (role `'particle' | 'negation' | 'auxiliary' | 'augment' | 'stem' | 'ending' | 'word'`, `piece` the index in `compose(...).pieces` or `null`), `ReadingLine { parts, beginner, improver }`, `Reading { el: ReadingLine; ro?: ReadingLine; en?: ReadingLine }`.
  - `lexicalFormKind(slot)` in `tenses.ts`: the stored form the lexical verb contributes, taking the negative imperative (which uses the subjunctive form) into account.
  - `data/readings.ts`: `WHO_GLOSS`, `ENDING_GLOSS` (the shared glossary of endings), `PARTICLE_GLOSS`, `AUX_GLOSS`, `KIND_NAME`, `READING_TEMPLATES` (`stress-shift`, `monosyllable`, `old-stem`).
  - `readingFor(verb, slot): Reading` with the Greek line `el`.
  - The validator fails a build when a reading part has no gloss, or an irregular form's rule has no template. `scripts/validate.ts` lists unverified templates.

- [ ] **Step 1: Write the failing tests**

Create `src/engine/reading.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { readingFor } from './reading';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });
const neg = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });
const greek = (id: string, slot: SlotOf<'verb'>) => readingFor(getVerb(id), slot).el;

describe('readingFor: the parts', () => {
  it('takes έχω φάει apart: the auxiliary, the stem and the ending that never changes', () => {
    const { parts } = greek('troo', vs('indicative', 'perfect'));
    expect(parts).toEqual([
      { text: 'έχω', label: 'έχω', role: 'auxiliary', gloss: 'I have', piece: 0 },
      { text: 'φά', label: 'φά-', role: 'stem', gloss: 'eat', piece: 1 },
      { text: 'ει', label: '-ει', role: 'ending', gloss: 'never changes after έχω', piece: 1 },
    ]);
  });

  it('separates the augment: έτρωγα', () => {
    const { parts } = greek('troo', vs('indicative', 'imperfect'));
    expect(parts.map((p) => [p.label, p.role, p.gloss])).toEqual([
      ['έ-', 'augment', 'in the past'],
      ['τρωγ-', 'stem', 'eat'],
      ['-α', 'ending', 'I, in the past (was doing)'],
    ]);
  });

  it('names the particle and the negation, and the person of the auxiliary', () => {
    const { parts } = greek('troo', neg(vs('indicative', 'futurePerfect', 3)));
    expect(parts.slice(0, 3).map((p) => [p.text, p.role, p.gloss, p.piece])).toEqual([
      ['δεν', 'negation', 'not', 0],
      ['θα', 'particle', 'will', 1],
      ['έχει', 'auxiliary', 'he/she has', 2],
    ]);
  });

  it('θα with a past tense means "would"', () => {
    expect(greek('thelo', vs('conditional', 'imperfect')).parts[0]).toMatchObject({ text: 'θα', gloss: 'would' });
  });

  it('every part has a gloss, for every offered slot of every verb, in both polarities', () => {
    for (const id of ['thelo', 'pidao', 'troo', 'pao', 'echo', 'pleno', 'koimamai', 'mporei']) {
      const verb = getVerb(id);
      for (const voice of Object.keys(verb.voices) as Voice[]) {
        const offers = verb.voices[voice]?.offers ?? {};
        for (const mood of Object.keys(offers) as Mood[]) {
          for (const tense of offers[mood] ?? []) {
            // The imperative is for the second person; every other slot is tried in the third person singular.
            const slot = vs(mood, tense, mood === 'imperative' ? 2 : 3, 'sg', voice);
            for (const s of [slot, neg(slot)]) {
              if (s.polarity === 'negative' && mood === 'imperative' && !(verb.voices[voice]?.offers.subjunctive ?? []).includes(tense)) {
                continue;
              }
              for (const part of greek(id, s).parts) expect(part.gloss, `${id} ${mood} ${tense} ${part.text}`).not.toBe('');
            }
          }
        }
      }
    }
  });
});

describe('readingFor: the sentences', () => {
  it('Beginner and Improver for a compound form', () => {
    const line = greek('troo', vs('indicative', 'futurePerfect'));
    expect(line.beginner).toBe(
      'θα έχω φάει: θα = will, έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
    );
    expect(line.improver).toBe(
      'Future perfect: θα + έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
    );
  });

  it('a single word with an augment', () => {
    const line = greek('troo', vs('indicative', 'imperfect'));
    expect(line.beginner).toBe('έτρωγα: έ- = in the past, τρωγ- = eat, -α = I, in the past (was doing).');
    expect(line.improver).toBe('Imperfect: imperfect form (augment έ- + stem τρωγ- + ending -α).');
  });

  it('the Beginner text has no grammar terms from the fixed list', () => {
    const terms = /aorist|subjunctive|imperfect|pluperfect|accusative|genitive|nominative|augment|perfective/i;
    for (const [mood, tense] of [
      ['indicative', 'present'], ['indicative', 'imperfect'], ['indicative', 'aorist'], ['indicative', 'futureSimple'],
      ['indicative', 'perfect'], ['indicative', 'futurePerfect'], ['subjunctive', 'aorist'], ['subjunctive', 'perfect'],
      ['conditional', 'pluperfect'],
    ] as const) {
      expect(greek('troo', vs(mood, tense)).beginner, `${mood} ${tense}`).not.toMatch(terms);
    }
  });

  it('a negated form: δεν goes in front, in the sentence too', () => {
    const line = greek('troo', neg(vs('indicative', 'perfect')));
    expect(line.beginner.startsWith('δεν έχω φάει: δεν = not, έχω = I have')).toBe(true);
    expect(line.improver.startsWith('Negative present perfect: δεν + έχω (present 1sg of έχω)')).toBe(true);
  });

  it('a negative command says that Greek leaves the imperative', () => {
    const line = greek('troo', neg(vs('imperative', 'aorist', 2, 'pl')));
    expect(line.beginner).toBe(
      'μην φάτε: μην = not, φά- = eat, -τε = you (pl.), once. To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.',
    );
    expect(line.improver).toBe(
      'Negative imperative aorist (do it once): μην + aorist-subjunctive form (stem φά- + ending -τε). The subjunctive replaces the imperative.',
    );
  });
});

describe('readingFor: irregular forms use the authored template of their rule', () => {
  it('stress-shift: τρώγαμε', () => {
    const line = greek('troo', vs('indicative', 'imperfect', 1, 'pl'));
    expect(line.beginner).toBe(
      'τρώγαμε: τρώγ- = eat, -αμε = we, in the past (was doing). In the "we" and "you (pl.)" forms the stress moves toward the end, so the word looks different from the other past forms.',
    );
    expect(line.improver).toContain('The stress moves forward in the plural');
  });

  it('monosyllable: τρως', () => {
    const line = greek('troo', vs('indicative', 'present', 2));
    expect(line.beginner).toBe('τρως: τρω- = eat, -ς = you, present form. A word of one syllable loses its accent mark.');
  });

  it('old stem: τρώγε', () => {
    const line = greek('troo', vs('imperative', 'present', 2));
    expect(line.beginner).toBe(
      'τρώγε: τρώγ- = eat, -ε = a command to you: keep doing. This command keeps the older stem τρώγ- (with γ).',
    );
  });

  it('a template and the negative-command sentence combine: μην φας', () => {
    const line = greek('troo', neg(vs('imperative', 'aorist', 2, 'sg')));
    expect(line.beginner).toContain('A word of one syllable loses its accent mark.');
    expect(line.beginner).toContain('To forbid something');
  });
});
```

Create `src/data/readings.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ENDING_GLOSS, READING_TEMPLATES } from './readings';

describe('reading data', () => {
  it('has a gloss for every kind of ending', () => {
    expect(Object.keys(ENDING_GLOSS).sort()).toEqual(
      ['aorist', 'base', 'impAorist', 'impPresent', 'imperfect', 'present', 'subjAorist'].sort(),
    );
  });
  it('has one template per irregularity rule, all unverified, with both levels written', () => {
    expect(READING_TEMPLATES.map((t) => t.rule).sort()).toEqual(['monosyllable', 'old-stem', 'stress-shift']);
    for (const t of READING_TEMPLATES) {
      expect(t.verified).toBe(false);
      expect(t.beginner).toContain('{text}');
      expect(t.improver).toContain('{text}');
    }
  });
});
```

Append to `src/validate/validate.test.ts`, inside the `describe('verb lexemes', …)` block:

```ts
  it('reports an irregularity rule that has no authored reading', () => {
    const errors = validate(
      modifiedTroo((v) => {
        const cell = v.overrides?.['present.2sg'];
        if (cell?.note) cell.note = { rule: 'no-such-rule', plain: 'x' };
      }),
    );
    expect(errors).toContain(
      'lexeme troo: the irregular rule "no-such-rule" has no authored reading',
    );
  });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/reading.test.ts src/data/readings.test.ts src/validate/validate.test.ts`
Expected: FAIL (modules missing).

- [ ] **Step 3: The types and the lexical form kind**

Append to `src/types.ts`:

```ts
/** An authored reading for one irregularity rule (spec 5.5); {text}, {parts}, {technical}, {stem} and {ending} are filled from the form. */
export interface ReadingTemplate {
  rule: string;
  beginner: string;
  improver: string;
  verified: boolean;
}

/** One part of a form taken apart: a particle, a negation, the auxiliary, or the augment, stem or ending of the verb. */
export interface ReadingPart {
  text: string;
  /** The part as shown: φά-, -ει, θα. */
  label: string;
  role: 'particle' | 'negation' | 'auxiliary' | 'augment' | 'stem' | 'ending' | 'word';
  gloss: string;
  /** The index of the piece in compose(...).pieces, or null for a Romanian or English word. */
  piece: number | null;
}

export interface ReadingLine {
  parts: ReadingPart[];
  beginner: string;
  improver: string;
}

/** "How to read this" for one form: always a Greek line; Romanian and English lines for compound forms (spec 5.5). */
export interface Reading {
  el: ReadingLine;
  ro?: ReadingLine;
  en?: ReadingLine;
}
```

Append to `src/engine/tenses.ts`:

```ts
/** The stored form the lexical verb contributes: a negative command takes the subjunctive form (μην φας). */
export function lexicalFormKind(slot: { mood: Mood; tense: Tense; polarity?: 'affirmative' | 'negative' }): FormKind {
  return slot.polarity === 'negative' && slot.mood === 'imperative'
    ? mainFormKind('subjunctive', slot.tense)
    : mainFormKind(slot.mood, slot.tense);
}
```

- [ ] **Step 4: The reading data**

Create `src/data/readings.ts`:

```ts
import type { FormKind } from '../engine/tenses';
import type { ReadingTemplate } from '../types';

/** The persons as an English learner would say them. */
export const WHO_GLOSS = ['I', 'you', 'he/she', 'we', 'you (pl.)', 'they'] as const;

/**
 * The shared glossary of endings (spec 5.5, 9): what an ending adds, by the kind of form.
 * {who} is replaced by the person. A ReviewItem covers this table.
 */
export const ENDING_GLOSS: Record<FormKind, string> = {
  present: '{who}, present form',
  imperfect: '{who}, in the past (was doing)',
  aorist: '{who}, in the past (once)',
  subjAorist: '{who}, once',
  impPresent: 'a command to {who}: keep doing',
  impAorist: 'a command to {who}: do it once',
  base: 'never changes after έχω',
};

/** What each particle and negation means, by lexeme id. */
export const PARTICLE_GLOSS: Record<string, string> = {
  theta: 'will',
  na: 'to / that',
  den: 'not',
  min: 'not',
};

/** The auxiliary έχω as it reads in English, by tense and person. */
export const AUX_GLOSS = {
  present: ['I have', 'you have', 'he/she has', 'we have', 'you (pl.) have', 'they have'],
  imperfect: ['I had', 'you had', 'he/she had', 'we had', 'you (pl.) had', 'they had'],
} as const;

/** The technical name of the form the lexical verb contributes (Improver). */
export const KIND_NAME: Record<FormKind, string> = {
  present: 'present form',
  imperfect: 'imperfect form',
  aorist: 'aorist form',
  subjAorist: 'aorist-subjunctive form',
  impPresent: 'present imperative',
  impAorist: 'aorist imperative',
  base: 'invariable base form',
};

/**
 * Authored readings for irregular forms, one per irregularity rule (spec 5.5, plan departure 3).
 * {text} the written form, {parts} the parts and their glosses, {technical} the technical description,
 * {stem} and {ending} the verb's own stem and ending.
 */
export const READING_TEMPLATES: ReadingTemplate[] = [
  {
    rule: 'stress-shift',
    beginner:
      '{text}: {parts}. In the "we" and "you (pl.)" forms the stress moves toward the end, so the word looks different from the other past forms.',
    improver:
      '{text}: {technical}. The stress moves forward in the plural, so the stem takes a different accent and any augment is dropped.',
    verified: false,
  },
  {
    rule: 'monosyllable',
    beginner: '{text}: {parts}. A word of one syllable loses its accent mark.',
    improver: '{text}: {technical}. A monosyllable is written without an accent mark.',
    verified: false,
  },
  {
    rule: 'old-stem',
    beginner: '{text}: {parts}. This command keeps the older stem {stem}- (with γ).',
    improver: '{text}: {technical}. The present imperative keeps the older stem {stem}-, unlike the rest of the present.',
    verified: false,
  },
];
```

- [ ] **Step 5: The reading engine**

Create `src/engine/reading.ts`:

```ts
import { AUX_GLOSS, ENDING_GLOSS, KIND_NAME, PARTICLE_GLOSS, READING_TEMPLATES, WHO_GLOSS } from '../data/readings';
import type { GreekVerb, Reading, ReadingPart, SlotOf } from '../types';
import { compose, type Piece } from './compose';
import { moodLabel, tenseLabel } from './labels';
import { voiceOf } from './offers';
import { lexicalFormKind, whoIndex } from './tenses';

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

function wordGloss(piece: Exclude<Piece, { kind: 'verb' }>, slot: SlotOf<'verb'>): string {
  if (piece.kind === 'auxiliary') {
    const aux = piece.slot;
    return aux.pos === 'verb' ? AUX_GLOSS[aux.tense === 'imperfect' ? 'imperfect' : 'present'][whoIndex(aux)] : piece.text;
  }
  if (piece.lexeme === 'theta' && slot.mood === 'conditional') return 'would';
  return PARTICLE_GLOSS[piece.lexeme] ?? piece.text;
}

/** The technical description of one piece (Improver). */
function describe(piece: Piece, kind: ReturnType<typeof lexicalFormKind>): string {
  if (piece.kind === 'verb') {
    const { augment, stem, ending } = piece.form;
    const bits = [augment ? `augment ${augment}-` : '', `stem ${stem}-`, ending ? `ending -${ending}` : '']
      .filter((bit) => bit !== '')
      .join(' + ');
    return `${KIND_NAME[kind]} (${bits})`;
  }
  if (piece.kind === 'auxiliary' && piece.slot.pos === 'verb') {
    return `${piece.text} (${piece.slot.tense} ${piece.slot.person}${piece.slot.number} of έχω)`;
  }
  return piece.text;
}

/**
 * Takes a verb form apart (spec 5.5): the Greek line is generated from the composed pieces, the glossary of
 * endings and, for an irregular form, the authored template of its rule.
 */
export function readingFor(verb: GreekVerb, slot: SlotOf<'verb'>): Reading {
  const composed = compose(verb, slot);
  const data = voiceOf(verb, slot.voice);
  const kind = lexicalFormKind(slot);
  const who = WHO_GLOSS[whoIndex(slot)];
  const negative = slot.polarity === 'negative';

  const parts: ReadingPart[] = [];
  composed.pieces.forEach((piece, index) => {
    if (piece.kind === 'verb') {
      const { augment, stem, ending } = piece.form;
      if (augment) parts.push({ text: augment, label: `${augment}-`, role: 'augment', gloss: 'in the past', piece: index });
      parts.push({ text: stem, label: `${stem}-`, role: 'stem', gloss: data.en.gloss, piece: index });
      if (ending) {
        parts.push({
          text: ending,
          label: `-${ending}`,
          role: 'ending',
          gloss: ENDING_GLOSS[kind].replace('{who}', who),
          piece: index,
        });
      }
      return;
    }
    parts.push({ text: piece.text, label: piece.text, role: piece.kind, gloss: wordGloss(piece, slot), piece: index });
  });

  const lexical = composed.pieces[composed.pieces.length - 1];
  const form = lexical.kind === 'verb' ? lexical.form : undefined;
  const template = form?.irregular ? READING_TEMPLATES.find((t) => t.rule === form.irregular?.rule) : undefined;

  const listing = parts.map((p) => `${p.label} = ${p.gloss}`).join(', ');
  const technical = composed.pieces.map((piece) => describe(piece, kind)).join(' + ');
  const moodTense =
    slot.mood === 'indicative'
      ? tenseLabel('improver', slot.mood, slot.tense)
      : `${moodLabel('improver', slot.mood)} ${tenseLabel('improver', slot.mood, slot.tense)}`;
  const name = capitalise(`${negative ? 'negative ' : ''}${moodTense}`);
  const vars = {
    text: composed.text,
    parts: listing,
    technical,
    stem: form?.stem ?? '',
    ending: form?.ending ?? '',
  };

  const negativeCommand = negative && slot.mood === 'imperative';
  const beginnerTail =
    kind === 'base'
      ? ' Only έχω changes with the person.'
      : negativeCommand
        ? ' To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.'
        : '';
  const improverTail =
    kind === 'base' ? ' The auxiliary carries the person.' : negativeCommand ? ' The subjunctive replaces the imperative.' : '';

  const beginner = (template ? fill(template.beginner, vars) : `${composed.text}: ${listing}.`) + beginnerTail;
  const improver = (template ? fill(template.improver, vars) : `${name}: ${technical}.`) + improverTail;

  return { el: { parts, beginner, improver } };
}
```

- [ ] **Step 6: The validator and the release report**

In `src/validate/validate.ts` add the imports

```ts
import { READING_TEMPLATES } from '../data/readings';
import { readingFor } from '../engine/reading';
```

and in the verb block of `checkLexeme` replace the line

```ts
        if (isEmpty(compose(l, slot).text)) errors.push(`${where}: empty Greek group`);
```

with

```ts
        const composed = compose(l, slot);
        if (isEmpty(composed.text)) errors.push(`${where}: empty Greek group`);
        for (const part of readingFor(l, slot).el.parts) {
          if (isEmpty(part.gloss)) errors.push(`${where}: reading part "${part.text}" has no gloss`);
        }
        const lexical = composed.pieces[composed.pieces.length - 1];
        const rule = lexical.kind === 'verb' ? lexical.form.irregular?.rule : undefined;
        if (rule && !READING_TEMPLATES.some((t) => t.rule === rule)) {
          errors.push(`lexeme ${l.id}: the irregular rule "${rule}" has no authored reading`);
        }
```

In `scripts/validate.ts` add `import { READING_TEMPLATES } from '../src/data/readings';` and, in the `unverified` array after the divergence line:

```ts
  ...READING_TEMPLATES.filter((t) => !t.verified).map((t) => `reading ${t.rule}`),
```

In `src/data/review.ts` add:

```ts
  { id: 'glossary:ending-glosses', kind: 'glossary', verified: false },
```

- [ ] **Step 7: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green; `npm run validate` lists `reading stress-shift`, `reading monosyllable`, `reading old-stem` and `glossary:ending-glosses`. If an expected sentence in `reading.test.ts` differs from the generator's output only in punctuation or spacing, compare it with the templates above: the templates and the glossary are the source of truth, the test strings were derived from them by hand.

- [ ] **Step 8: Commit**

```bash
git add src/types.ts src/engine/tenses.ts src/data/readings.ts src/data/readings.test.ts src/engine/reading.ts src/engine/reading.test.ts src/data/review.ts src/validate/validate.ts src/validate/validate.test.ts scripts/validate.ts
git commit -m "feat: the Greek reading line, with a glossary of endings and templates for irregular forms

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Romanian and English reading lines for compound forms

**Files:**

- Modify: `src/engine/reading.ts`, `src/data/readings.ts`, `src/data/review.ts`
- Test: `src/engine/reading.test.ts`

**Interfaces:**

- Consumes: Task 7's `readingFor`, `ReadingLine`; Plan 3 and Task 2's `roVerb`, `enVerb`, `enVerbText`.
- Produces: `readingFor(...).ro` and `.en`, present only when the Romanian or English form has more than one word (and, for Romanian, has a known shape). Parts have `role: 'word'` and `piece: null`. Beginner: `<form>: <word> = <gloss>, ….`; Improver: the same plus ` Compare Greek <greek form>.`.

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/reading.test.ts`:

```ts
const lines = (id: string, slot: SlotOf<'verb'>) => readingFor(getVerb(id), slot);

describe('readingFor: the Romanian line', () => {
  it('takes aș fi mâncat apart', () => {
    const { ro } = lines('troo', vs('conditional', 'pluperfect'));
    expect(ro?.parts.map((p) => [p.text, p.gloss, p.role, p.piece])).toEqual([
      ['aș', 'would', 'word', null],
      ['fi', 'be', 'word', null],
      ['mâncat', 'eaten (never changes)', 'word', null],
    ]);
    expect(ro?.beginner).toBe('aș fi mâncat: aș = would, fi = be, mâncat = eaten (never changes).');
    expect(ro?.improver).toBe(
      'aș fi mâncat: aș = would, fi = be, mâncat = eaten (never changes). Compare Greek θα είχα φάει.',
    );
  });

  it('the perfect, the future and the subjunctive', () => {
    expect(lines('troo', vs('indicative', 'perfect')).ro?.beginner).toBe(
      'am mâncat: am = have (auxiliary), mâncat = eaten (never changes).',
    );
    expect(lines('troo', vs('indicative', 'futureSimple')).ro?.beginner).toBe('voi mânca: voi = will, mânca = eat.');
    expect(lines('troo', vs('subjunctive', 'aorist')).ro?.beginner).toBe(
      'să mănânc: să = that / to, mănânc = eat.',
    );
  });

  it('negation adds nu', () => {
    expect(lines('troo', neg(vs('indicative', 'perfect'))).ro?.beginner).toBe(
      'nu am mâncat: nu = not, am = have (auxiliary), mâncat = eaten (never changes).',
    );
    expect(lines('troo', neg(vs('subjunctive', 'aorist'))).ro?.beginner).toBe(
      'să nu mănânc: să = that / to, nu = not, mănânc = eat.',
    );
    expect(lines('troo', neg(vs('imperative', 'aorist', 2, 'sg'))).ro?.beginner).toBe('nu mânca: nu = not, mânca = eat.');
    expect(lines('troo', neg(vs('imperative', 'aorist', 2, 'pl'))).ro?.beginner).toBe(
      'nu mâncați: nu = not, mâncați = eat (you, pl.).',
    );
  });

  it('a reflexive perfect is two words: m-am spălat', () => {
    expect(lines('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive')).ro?.beginner).toBe(
      'm-am spălat: m-am = have (auxiliary), spălat = washed (never changes).',
    );
  });

  it('has no line for a form of one word', () => {
    expect(lines('troo', vs('indicative', 'present')).ro).toBeUndefined();
    expect(lines('troo', vs('indicative', 'pluperfect')).ro).toBeUndefined();
    expect(lines('troo', vs('imperative', 'aorist', 2)).ro).toBeUndefined();
  });
});

describe('readingFor: the English line', () => {
  it('takes I will have eaten apart', () => {
    const { en } = lines('troo', vs('indicative', 'futurePerfect'));
    expect(en?.beginner).toBe(
      'I will have eaten: will = will (the future), have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
    expect(en?.improver).toBe(
      'I will have eaten: will = will (the future), have = have (auxiliary), eaten = eaten (past participle: never changes). Compare Greek θα έχω φάει.',
    );
  });

  it('negative forms: the contraction carries the "not"', () => {
    expect(lines('troo', neg(vs('indicative', 'present'))).en?.beginner).toBe(
      "I don't eat: don't = do (auxiliary), not, eat = eat (the verb).",
    );
    expect(lines('troo', neg(vs('imperative', 'aorist', 2))).en?.beginner).toBe(
      "don't eat: don't = do (auxiliary), not, eat = eat (the verb).",
    );
  });

  it('the subjunctive keeps its "that"; the reflexive "self" word stays out of the parts', () => {
    expect(lines('troo', vs('subjunctive', 'aorist')).en?.beginner).toBe('that I eat: that = that, eat = eat (the verb).');
    expect(lines('troo', vs('subjunctive', 'perfect')).en?.beginner).toBe(
      'I may have eaten: may = may (a possibility), have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
    expect(lines('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive')).en?.beginner).toBe(
      'I have washed (myself): have = have (auxiliary), washed = washed (past participle: never changes).',
    );
  });

  it('has no line for a form of one word', () => {
    expect(lines('troo', vs('indicative', 'present')).en).toBeUndefined();
    expect(lines('troo', vs('indicative', 'aorist')).en).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/reading.test.ts`
Expected: FAIL (`ro` and `en` are never set).

- [ ] **Step 3: The shapes and glosses**

Append to `src/data/readings.ts`:

```ts
/**
 * The words of a compound Romanian form, in order, by mood and tense (affirmative). Keys: have, will, would, be,
 * to (să), INF (the infinitive), VERB (the subjunctive verb), PART (the participle). A ReviewItem covers these.
 */
export const RO_SHAPES: Record<string, readonly string[]> = {
  'indicative.aorist': ['have', 'PART'],
  'indicative.perfect': ['have', 'PART'],
  'indicative.future': ['will', 'INF'],
  'indicative.futureSimple': ['will', 'INF'],
  'indicative.futurePerfect': ['will', 'be', 'PART'],
  'subjunctive.present': ['to', 'VERB'],
  'subjunctive.aorist': ['to', 'VERB'],
  'subjunctive.perfect': ['to', 'be', 'PART'],
  'conditional.imperfect': ['would', 'INF'],
  'conditional.pluperfect': ['would', 'be', 'PART'],
};

/** What the English function words of a compound form mean. */
export const EN_FUNCTION: Record<string, string> = {
  will: 'will (the future)',
  "won't": 'will, not',
  would: 'would',
  "wouldn't": 'would, not',
  have: 'have (auxiliary)',
  has: 'have (auxiliary)',
  had: 'had (auxiliary)',
  "haven't": 'have (auxiliary), not',
  "hasn't": 'have (auxiliary), not',
  "hadn't": 'had (auxiliary), not',
  was: 'was (a form of "be")',
  were: 'were (a form of "be")',
  "wasn't": 'was, not',
  "weren't": 'were, not',
  may: 'may (a possibility)',
  not: 'not',
  "don't": 'do (auxiliary), not',
  "doesn't": 'do (auxiliary), not',
  "didn't": 'did (auxiliary), not',
  that: 'that',
};
```

In `src/data/review.ts` add:

```ts
  { id: 'glossary:ro-en-reading-glosses', kind: 'glossary', verified: false },
```

- [ ] **Step 4: The Romanian and English lines**

In `src/engine/reading.ts` add the imports

```ts
import { EN_FUNCTION, RO_SHAPES } from '../data/readings';
import type { EnVerbForms, ReadingLine } from '../types';
import { enVerb, enVerbText } from './english';
import { EN_PRONOUNS } from './labels';
import { roVerb } from './romanian';
```

(merge `EN_FUNCTION`, `RO_SHAPES` into the existing `../data/readings` import, `EnVerbForms` and `ReadingLine` into the existing `../types` import, and `EN_PRONOUNS` into the existing `./labels` import), add above `readingFor`:

```ts
/** A line made of Romanian or English words, each with a gloss. */
function wordsLine(text: string, words: { word: string; gloss: string }[], greekText: string): ReadingLine {
  const parts: ReadingPart[] = words.map(({ word, gloss }) => ({ text: word, label: word, role: 'word', gloss, piece: null }));
  const listing = words.map(({ word, gloss }) => `${word} = ${gloss}`).join(', ');
  return {
    parts,
    beginner: `${text}: ${listing}.`,
    improver: `${text}: ${listing}. Compare Greek ${greekText}.`,
  };
}

function roGloss(key: string, en: EnVerbForms): string {
  switch (key) {
    case 'have':
      return 'have (auxiliary)';
    case 'will':
    case 'would':
    case 'be':
      return key;
    case 'to':
      return 'that / to';
    case 'NOT':
      return 'not';
    case 'INF':
      return en.base;
    case 'VERB':
      return en.gloss;
    case 'VERBPL':
      return `${en.gloss} (you, pl.)`;
    default:
      return `${en.pastParticiple} (never changes)`;
  }
}

function romanianLine(verb: GreekVerb, slot: SlotOf<'verb'>, greekText: string): ReadingLine | undefined {
  const en = voiceOf(verb, slot.voice).en;
  const negative = slot.polarity === 'negative';
  let shape: readonly string[] | undefined;
  if (slot.mood === 'imperative') {
    shape = negative ? ['NOT', slot.number === 'sg' ? 'INF' : 'VERBPL'] : undefined;
  } else {
    const base = RO_SHAPES[`${slot.mood}.${slot.tense}`];
    if (base) shape = !negative ? base : slot.mood === 'subjunctive' ? [base[0], 'NOT', ...base.slice(1)] : ['NOT', ...base];
  }
  const text = roVerb(verb, slot);
  const words = text.split(' ');
  if (!shape || shape.length !== words.length) return undefined;
  return wordsLine(text, words.map((word, i) => ({ word, gloss: roGloss(shape[i], en) })), greekText);
}

function englishLine(verb: GreekVerb, slot: SlotOf<'verb'>, greekText: string): ReadingLine | undefined {
  const en = voiceOf(verb, slot.voice).en;
  const parts = enVerb(verb, slot);
  // The parenthetical "(myself)" of a reflexive verb and the subject pronoun are not parts of the verb group.
  const core = parts.verb.replace(/\s*\(.*\)$/, '');
  const words = [parts.lead, core].join(' ').split(' ').filter((word) => word !== '');
  if (words.length < 2) return undefined;
  const gloss = (word: string): string => {
    if (EN_FUNCTION[word]) return EN_FUNCTION[word];
    if (word === en.ing) return `${word} (in progress)`;
    if (word === en.pastParticiple) return `${word} (past participle: never changes)`;
    if (word === en.base) return `${word} (the verb)`;
    if (word === en.past) return `${word} (past)`;
    return word;
  };
  const text = enVerbText(verb, slot, EN_PRONOUNS[whoIndex(slot)]);
  return wordsLine(text, words.map((word) => ({ word, gloss: gloss(word) })), greekText);
}
```

and change the last line of `readingFor` to:

```ts
  const ro = romanianLine(verb, slot, composed.text);
  const en = englishLine(verb, slot, composed.text);
  return { el: { parts, beginner, improver }, ...(ro ? { ro } : {}), ...(en ? { en } : {}) };
```

- [ ] **Step 5: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/engine/reading.ts src/engine/reading.test.ts src/data/readings.ts src/data/review.ts
git commit -m "feat: Romanian and English reading lines for compound forms

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The "How to read this" block in the word panel

**Files:**

- Modify: `src/panels/types.ts`, `src/panels/verb.ts`, `src/components/WordPanel.tsx`, `src/Explorer.tsx`, `src/styles.css`
- Test: `src/panels/verb.test.ts`, `src/App.test.tsx`

**Interfaces:**

- Consumes: Tasks 7 and 8 (`readingFor`), Task 6 (`pieceToOpen`, `back`, `onBack`).
- Produces:
  - `ReadingView { lang: 'el' | 'ro' | 'en'; parts: ReadingPart[]; sentence: string }` and `Panel.reading?: ReadingView[]`: the Greek line always, then the Romanian and English lines when they exist; `sentence` is the Beginner or the Improver text for the learner's level.
  - `WordPanel` props `onPiece?: (piece: number) => void`. It renders `<section aria-label="How to read this">` under the plain-language line: for each line the parts (the Greek particle, negation and auxiliary parts are buttons named `<text>: <gloss>` when `onPiece` is given) and the sentence.
  - `Explorer` passes `onPiece` while the verb's own panel is showing: clicking a part opens that piece's panel on the pieces of the panel's *current* slot.

- [ ] **Step 1: Write the failing tests**

Append to `src/panels/verb.test.ts`:

```ts
describe('verb panel: how to read this', () => {
  it('gives the Greek line, and the Romanian and English lines of a compound form', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'beginner');
    expect(p.reading?.map((l) => l.lang)).toEqual(['el', 'ro', 'en']);
    expect(p.reading?.[0].sentence).toBe(
      'έχω φάει: έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
    );
    expect(p.reading?.[1].sentence).toBe('am mâncat: am = have (auxiliary), mâncat = eaten (never changes).');
    expect(p.reading?.[2].sentence).toBe(
      'I have eaten: have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
  });

  it('uses the technical text in Improver', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'improver');
    expect(p.reading?.[0].sentence).toBe(
      'Present perfect: έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
    );
    expect(p.reading?.[1].sentence).toContain('Compare Greek έχω φάει.');
  });

  it('a single word has a Greek line only', () => {
    expect(panel('troo', vs('indicative', 'present')).reading?.map((l) => l.lang)).toEqual(['el']);
  });

  it('follows the working slot, not the phrase', () => {
    const p = panel('troo', negative(vs('subjunctive', 'aorist')));
    expect(p.reading?.[0].sentence.startsWith('να μην φάω: να = to / that, μην = not')).toBe(true);
  });
});
```

Append to `src/App.test.tsx`:

```tsx
describe('how to read this', () => {
  it('shows the reading under the form, in Beginner and then Improver wording', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(
      within(reading).getByText(
        'θα έχω φάει: θα = will, έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
      ),
    ).toBeInTheDocument();
    expect(within(reading).getByText(/^voi fi mâncat: voi = will, fi = be/)).toBeInTheDocument();
    expect(within(reading).getByText(/^I will have eaten: will = will \(the future\)/)).toBeInTheDocument();

    await user.click(screen.getByLabelText('Improver'));
    expect(
      within(screen.getByRole('region', { name: 'How to read this' })).getByText(
        'Future perfect: θα + έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
      ),
    ).toBeInTheDocument();
  });

  it('a particle part opens that piece\'s panel, and the way back returns to the verb', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    await user.click(within(reading).getByRole('button', { name: 'έχω: I have' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('έχω');
    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
  });

  it('the reading follows the learner\'s variation, not the phrase', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I have eaten');
    await user.selectOptions(screen.getByLabelText('Negated?'), 'Yes');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText(/^δεν έχω φάει: δεν = not, έχω = I have/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Έχω φάει' })).toBeInTheDocument();
  });

  it('an irregular form uses its authored reading', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Keep eating the bread!');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(
      within(reading).getByText(
        'τρώγε: τρώγ- = eat, -ε = a command to you: keep doing. This command keeps the older stem τρώγ- (with γ).',
      ),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/verb.test.ts src/App.test.tsx`
Expected: FAIL (no `reading` on the panel, no block in the word panel).

- [ ] **Step 3: The panel type and the verb panel**

In `src/panels/types.ts` add `import type { Num, ReadingPart, Slot } from '../types';` (replacing the existing `../types` import), and add before `Panel`:

```ts
/** One line of "how to read this" for the learner's level (spec 5.5). */
export interface ReadingView {
  lang: 'el' | 'ro' | 'en';
  parts: ReadingPart[];
  sentence: string;
}
```

and add to `Panel`, after `overview?`:

```ts
  /** Verbs: the parts of the form and what each contributes. */
  reading?: ReadingView[];
```

In `src/panels/verb.ts` add the imports

```ts
import { readingFor } from '../engine/reading';
import type { Reading } from '../types';
import type { ReadingView } from './types';
```

(merge `Reading` into the existing `../types` import and `ReadingView` into the existing `./types` import), add above `verbPanel`:

```ts
function readingViews(reading: Reading, level: Level): ReadingView[] {
  const view = (lang: ReadingView['lang'], line: Reading['el']): ReadingView => ({
    lang,
    parts: line.parts,
    sentence: level === 'beginner' ? line.beginner : line.improver,
  });
  return [view('el', reading.el), ...(reading.ro ? [view('ro', reading.ro)] : []), ...(reading.en ? [view('en', reading.en)] : [])];
}
```

and add to the object `verbPanel` returns, after `overview`:

```ts
    reading: readingViews(readingFor(verb, slot), level),
```

- [ ] **Step 4: The word panel**

In `src/components/WordPanel.tsx` add to `Props`:

```tsx
  /** Given while the verb's own panel is showing: opens the particle, negation or auxiliary named by a reading part. */
  onPiece?: (piece: number) => void;
```

change the component signature to `export function WordPanel({ panel, onChange, onBack, onPiece }: Props) {` and insert after the line `<p className="plain">{panel.plain}</p>`:

```tsx
      {panel.reading && panel.reading.length > 0 && (
        <section className="reading" aria-label="How to read this">
          <p className="full-title">How to read this</p>
          {panel.reading.map((line) => (
            <div className="reading-line" lang={line.lang} key={line.lang}>
              <p className="reading-parts">
                {line.parts.map((part, i) => {
                  const className = `reading-part reading-${part.role}`;
                  const opens =
                    onPiece !== undefined &&
                    line.lang === 'el' &&
                    part.piece !== null &&
                    (part.role === 'particle' || part.role === 'negation' || part.role === 'auxiliary');
                  return opens ? (
                    <button
                      key={i}
                      type="button"
                      className={className}
                      aria-label={`${part.text}: ${part.gloss}`}
                      onClick={() => onPiece(part.piece as number)}
                    >
                      {part.label}
                    </button>
                  ) : (
                    <span key={i} className={className}>
                      {part.label}
                    </span>
                  );
                })}
              </p>
              <p className="reading-text">{line.sentence}</p>
            </div>
          ))}
        </section>
      )}
```

In `src/styles.css` add:

```css
.reading { margin-top: 10px; }
.reading-line { margin: 6px 0; }
.reading-parts { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 2px; }
.reading-part { font: inherit; font-size: 16px; padding: 1px 6px; border: 0.5px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); }
button.reading-part { cursor: pointer; }
button.reading-part:focus-visible { outline: 2px solid var(--accent-border); outline-offset: 2px; }
.reading-particle, .reading-auxiliary { color: var(--accent-text); }
.reading-negation { font-weight: 600; }
.reading-augment, .reading-ending { background: var(--warn-bg); color: var(--warn-text); border-color: transparent; }
.reading-text { margin: 0; font-size: 14px; color: var(--muted); }
```

- [ ] **Step 5: The explorer passes the way into a piece**

In `src/Explorer.tsx` add above `function back()`:

```tsx
  /** A reading part was clicked: open that piece of the form the panel is showing (its current slot, not the phrase's). */
  function openFromReading(pieceIndex: number) {
    setOpen(pieceToOpen(current.token.lexeme, current.state.slot, pieceIndex));
    setPiece(null);
  }
```

and change the `WordPanel` element to:

```tsx
      <WordPanel
        panel={panel}
        onChange={changeControl}
        onBack={open ? back : undefined}
        onPiece={open ? undefined : openFromReading}
      />
```

- [ ] **Step 6: Run the tests and the gate**

Run: `npx vitest run && npm run typecheck && npm run validate`
Expected: all green. If a `WordPanel` or `App` test counts `region` or `table` elements, the new "How to read this" section is a `region`; update such counts to include it.

- [ ] **Step 7: Commit**

```bash
git add src/panels/types.ts src/panels/verb.ts src/components/WordPanel.tsx src/Explorer.tsx src/styles.css src/panels/verb.test.ts src/App.test.tsx
git commit -m "feat: the How to read this block, with parts that open their piece's panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The validation report and the end-to-end check

**Files:**

- Modify: `src/styles.css` (only if the phone-width check below needs it)

**Interfaces:**

- Consumes: everything above.
- Produces: a verified build, the unverified-record report, and the browser check.

- [ ] **Step 1: Run the full gate and read the report**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: all green.

Run: `npm run validate`
Expected: `Data is valid.` with no Warnings block and `Unverified (165):`. The count is Plan 3's 147; 2 new lexemes (δεν, μην) × 3 languages (6); 3 new review items (`auxiliary-table:negation`, `glossary:ending-glosses`, `glossary:ro-en-reading-glosses`); 3 new phrases (16, 25, 39); 3 new divergence notes; 3 reading templates. If the real count differs, find the difference in the printed list before going on: a missing or extra line means a record was added without its flag, or twice.

Run: `npm run validate -- --release`
Expected: `--release: 165 record(s) are not verified.` and a non-zero exit code.

- [ ] **Step 2: Browser check**

Start the app with `npm run dev -- --port 5199 --strictPort` (via `preview_start` and `.claude/launch.json`) and check each point in the browser pane, reporting the actual text seen:

1. Pick **I don't want to go**. The chips are two groups: «Δεν θέλω» (two piece buttons, δεν in bold) and «να πάω» (two). Open θέλω: the Greek cell reads (εγώ) δεν θέλω, Romanian (eu) nu vreau, English I don't want, and the **Negated?** control reads *Yes*.
2. Set **Negated?** to *No*: (εγώ) θέλω / (eu) vreau / I want, "Differs from the phrase." appears; **Reset to phrase** restores the negation.
3. Pick **Don't eat the bread!** and open Μην φας. The cells read μην φας / nu mânca / don't eat, with no subject pronoun. **Who?** offers only *you* and *you (pl.)*; choose *you (pl.)*: μην φάτε / nu mâncați. Choose **When?** *keep doing!*: μην τρώτε. The plain-language line says a negative command is not the imperative.
4. Pick **I'd rather not go**. The group «να μην πάω» has three pieces. Click *μην*: the panel is μην, with the row μην φας / nu mânca / don't eat and a **← Back to the verb** link; the piece button is pressed. Click the link: the verb panel (πάω) returns.
5. Pick **I will have eaten**. Click the piece *έχω*: a verb panel for έχω opens with Who?, Mood and When? controls. Choose *we*: (εμείς) έχουμε, with "Differs from the phrase."; **Reset to phrase** restores (εγώ) έχω; the chip is unchanged. Go back to the verb.
6. In the same phrase click the English gloss unit *I will*: the θα panel opens and the chip piece *Θα* is pressed. Click the English *have*: the έχω panel opens and only the units for that piece are lit in the gloss rows. Click *eaten*: the verb panel returns.
7. Open the verb of **I will have eaten**. The **How to read this** block shows a Greek line (θα έχω φάει: θα = will, έχω = I have, …), a Romanian line (voi fi mâncat: …) and an English line (I will have eaten: …). Click the part *θα* in the Greek line: the θα panel opens. Switch to Improver: the Greek line reads "Future perfect: θα + έχω (present 1sg of έχω) + …". For a one-word form (**I wash (myself)**) only the Greek line shows.
8. Pick **I ate the bread**, open Έφαγα and choose *we* in **Who?**: φάγαμε, with the irregularity line and a reading that mentions the stress moving. Pick **Keep eating the bread!**: the reading says the command keeps the older stem τρώγ-.
9. At phone width (375 px), in Improver, open **I would have eaten the bread** (a three-piece verb group) and check that the page has no horizontal scrollbar (`document.documentElement.scrollWidth` equals `clientWidth`) and that the piece buttons wrap inside the card. If something overflows, fix it in `src/styles.css` (for example `flex-wrap: wrap` on `.chip-group`), re-check, and run the gate again.
10. Dark mode and keyboard: with the colour scheme set to dark, the bold negation, the blue piece buttons and the reading parts keep readable contrast. Tab through a verb group: every piece button shows a visible focus ring, and pressing Enter on a particle piece opens its panel; the **Back to the verb** link and the reading-part buttons are reachable and show a focus ring.

- [ ] **Step 3: Commit (only if Step 2 needed a style change)**

```bash
git add src/styles.css
git commit -m "style: keep the piece buttons inside the viewport at phone width

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage** (spec sections that this plan owns, and the task that delivers them):

| Spec | Delivered by |
|---|---|
| 4.2 `Piece` kinds `negation`; the verb slot's `polarity` (optional here, departure 1) | Task 1 |
| 4.3 negation as a piece: δεν before θα and before the verb; μην after να; the negative imperative as μην + the subjunctive of the second person | Task 1 |
| 4.3 Romanian *nu* / *să nu* and English don't / n't forms generated from the lexical forms | Task 2 |
| 7 validator: negation allowed only where the lexeme allows it (negative command needs the subjunctive), every offered slot in both polarities | Tasks 1, 2 |
| 5.3 verb panel: the "Negated" control | Task 3 |
| 6.1 phrases 16, 25, 39 | Task 4 |
| 5.2 notes subjunctive-negation, negative-imperative (and the position of the negation) | Task 4 |
| 4.4 a verb group is one token; clicking a non-verb piece opens that piece's panel in place of the verb panel, with "Back to the verb"; every such piece carries lexeme and slot | Tasks 5, 6 |
| 4.5 clicking a piece highlights only the units linked to that piece; clicking a gloss unit selects its token and, for a piece link, that piece (departure 4 on whole-token units) | Tasks 5, 6 |
| 5.3 particle panel reached from a chip | Task 6 |
| 5.5 "How to read this": generated parts, the shared glossary of endings, authored templates per irregular rule, Beginner and Improver text, per-column lines for compound forms, clicking a particle part opens its panel | Tasks 7, 8, 9 |
| 7 the script fails when an irregular form has no authored reading or a generated part has no gloss | Task 7 |
| 9 / 11 every reading template and the two glossaries carry `verified: false` and are listed for the review | Tasks 7, 8 |
| Not here | hover or focus highlighting of a reading part (5.5); readings for non-verbs; quantifiers, copula, participles, αν, `pending` (Plan 5); clitics, form groups, the content review (Plan 6) |

**Placeholder scan:** no "TBD", "TODO", "fill in" or "similar to Task N" in this plan; every code step shows the code. The one conditional edit (the `flex-wrap` rule in Task 10) says when it applies and gives the code.

**Type consistency:** `Polarity` and `polarity?` (Task 1) are read by `isOffered`, `compose`, `roVerb`, `enVerb`, `changeVerbSlot`, `lexicalFormKind` and `matchesWhen`. `Piece` gains `'negation'` (Task 1) and `Role` gains `'neg'`; `composedRich` and `PhraseBar` (`piece-negation`) use them. `PhraseBar` / `GlossGrid` `onSelect(index, piece?)` (Task 5) is what `Explorer.select` (Task 6) receives. `OpenPiece` and `pieceToOpen` (Task 6) are used again by `openFromReading` (Task 9). `ReadingPart.piece` (Task 7) is an index into `compose(...).pieces`, which is what `pieceToOpen` expects. `Panel.reading` / `ReadingView` (Task 9) come from `readingFor` (Tasks 7, 8). `READING_TEMPLATES` is read by `readingFor`, the validator and `scripts/validate.ts`.

**Counts to check when running** (the plan's arithmetic, not yet run): the unverified count is 165 after Task 10. `allVerbSlots` is unchanged (affirmative only); the validator doubles it with the negative polarity and keeps what `isOffered` allows.

**Known soft spots** (decisions the executor should not "fix" silently): `polarity` is optional; the reading templates are per rule, not per cell; the Romanian reading shapes and the English function-word glosses are tables a reviewer must check; the old-stem template mentions `{stem}-` so it works for any verb that ever gets the rule.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-03-plan-4-pieces-readings-and-negation.md`. Execute it with superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.
