# Greek Grammar Explorer, Plan 1: Foundation and First Slice

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working Vite + React + TypeScript app that shows phrase 1 («Θέλω έναν ζεστό καφέ») with clickable Greek words, four gloss rows (English and Romanian, natural and literal), and a word panel in which the learner varies attributes and sees Greek, Romanian and English forms side by side.

**Architecture:** A hybrid inflection engine (stored stems plus shared ending tables) produces Greek forms split into stem and ending. Romanian and English forms are stored on the lexemes. Pure functions build "panels" from a token and its slot; React components only render panels. Build-time validation checks the data.

**Tech Stack:** Vite, React 18+, TypeScript (strict), Vitest, Testing Library (React, user-event, jest-dom), jsdom, tsx.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

## Roadmap (this is Plan 1 of 5)

| Plan | Delivers | Spec sections |
|---|---|---|
| **1 (this plan)** | Scaffold, types, inflection for noun / adjective / definite article / numeral "one" / verb (present), Romanian and English forms, noun-phrase builder, validator, UI shell, phrase 1 | 1, 2 (subset), 3 (labels only), 4.1 to 4.5, 5.1 to 5.3 (subset), 7, 8 (subset) |
| 2 | Full paradigm tables with per-column highlighting (Improver), numerals 2 to 5, prepositions, indeclinable and stem-stressed adjectives, more nouns, glosses with segments, phrases 2 and 3 (the fox sentence) | 5.1, 5.3, 4.5, 6.1 |
| 3 | Verb system: tenses, moods, voice, compound forms, imperfect, imperative, subjunctive, conditional; "how to read this" lines; tense overview; phrases 4 to 6, 11 to 19, 22 to 27, 29, 31, 39; one token per verb group with piece-level gloss links, the particle panel, and the working-copy Reset control extended to verb pieces | 4.2, 4.3, 4.4, 5.5, 6.2, 6.4 |
| 4 | Quantifiers, negation, conjunction, copula, passive participle; phrases 7 to 10, 20, 21, 28, 30, 32, 33; the `pending` marker for unconfirmed Romanian and English cells | 5.3, 6.3, 6.5, 7 |
| 5 | Clitics, form groups, "Same meaning" strip, clitic phrases (34 to 38), content review pass, polish | 4.6, 5.4, 6.5, 9 |

Each later plan is written after the previous one ships, so it can use what was learned.

## Scope boundaries for Plan 1

- Slot types are the narrow subset in Task 1 (`mood: 'indicative'`, `tense: 'present'`, `voice: 'active'`, numeral `value: 1`). Plan 3 widens them.
- `Form` has no `reading` or `prefix` yet. Plan 3 adds them.
- The Improver level changes labels only (technical grammar names). Full paradigm tables arrive in Plan 2.
- One phrase. The phrase picker arrives with Plan 2.
- Romanian and English cells are plain strings in Plan 1. The `pending` marker (spec 4.2 and 7) arrives in Plan 4, where the first unconfirmed cells appear; until then an empty cell fails validation.
- The verb slot has no `polarity`, `clitics` or `shortForm` yet, and there is no `compose()`. Plan 3 adds them, with the English past, participle and -ing forms and the stored Romanian verb paradigms. Plan 1 has no verb groups, so every token is one word.
- Gloss links already use the spec's `Link` type (a token index, or `{ token, piece }`), so Plan 3 can link to the pieces of a verb group without changing the data format. Plan 1 checks that a link names an existing token and a non-negative piece; the upper bound on `piece` arrives with `compose`.
- The phrase and its glosses are fixed (spec 4.4). The word panel works on a copy of the token's slot, with a "Reset to phrase" control. Plan 1 implements this.

## Global Constraints

- Vite + React + TypeScript single-page app; no backend; no network calls; no runtime AI.
- TypeScript `strict: true`.
- All Greek text is monotonic.
- Greek forms come from stored stems plus shared ending tables, with explicit overrides for irregular cells. Romanian and English forms are stored per slot, not generated.
- The interface language is English.
- Beginner and Improver share one data set; the toggle changes presentation only. The choice persists in `localStorage`, every access wrapped in try/catch, and the app works without it.
- Colour is never the only signal: dropped or optional words are dashed and labelled; roles have text labels.
- Word chips and gloss units are real `<button>` elements reachable by keyboard.
- The page works at phone width and in light and dark colour schemes.
- Data is validated at build time with `npm run validate`; unverified lexemes are reported, not failed.
- Every lexeme has `verified: boolean`. All start as `false` until the content review (spec section 9).
- Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (add it as a second `-m` argument).

## File Structure

```
package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
scripts/validate.ts                  # CLI wrapper around validate()
src/
  main.tsx                           # React entry
  App.tsx                            # state: slots, selection, level; wires components
  styles.css                         # tokens (light/dark), layout, role colours
  test-setup.ts                      # jest-dom matchers
  types.ts                           # all shared types
  data/
    paradigms.ts                     # ending tables
    lexemes.ts                       # lexemes + lookup helpers
    phrases.ts                       # phrase 1 with glosses
    divergences.ts                   # comparison notes
  engine/
    segments.ts                      # Rich text (coloured segments) helpers
    greek.ts                         # inflect(lexeme, slot) -> Form
    romanian.ts                      # stored Romanian forms
    english.ts                       # stored English forms
    agree.ts                         # nounPhrase(): article + adjective + noun in 3 languages
    labels.ts                        # level-dependent labels and pronouns
  panels/
    panels.ts                        # buildPanel(), applyControl(): pure
  validate/
    validate.ts                      # validate(): string[]
  storage.ts                         # level persistence (try/catch)
  glossLinks.ts                      # linkedToken(), linkedPiece(): gloss links to tokens and pieces
  components/
    LevelToggle.tsx, PhraseBar.tsx, GlossGrid.tsx,
    RichText.tsx, FormTable.tsx, WordPanel.tsx, ComparisonTable.tsx
```

Tests live next to their module (`*.test.ts` / `*.test.tsx`).

---

### Task 1: Scaffold, shared types, lexemes and noun inflection

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx` (placeholder), `src/test-setup.ts`
- Create: `src/types.ts`, `src/data/paradigms.ts`, `src/data/lexemes.ts`
- Create: `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`

**Interfaces:**
- Produces (types): `Gender`, `Case`, `Num`, `Person`, `Level`, `Form`, `Slot`, `SlotOf<P>`, `GreekNoun`, `GreekAdjective`, `GreekNumeral`, `GreekArticle`, `GreekVerb`, `GreekLexeme`, `Token`, `GlossUnit`, `GlossRow`, `Phrase`, `Divergence`.
- Produces (data): `NOUN_CLASSES`, `ADJ_STRESSED`, `ARTICLE_DEF`, `NUMERAL_ONE`, `VERB_OMEGA_PRESENT`; `LEXEMES`, `getLexeme(id)`, `getNoun(id)`, `getAdjective(id)`, `DEF_ARTICLE`, `ONE`.
- Produces (engine): `inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form`.

- [ ] **Step 1: Create the project files**

`package.json`:

```json
{
  "name": "learn-greek",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate": "tsx scripts/validate.ts"
  }
}
```

`.gitignore`:

```
node_modules
dist
*.local
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "scripts", "vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Greek Grammar Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (placeholder, replaced in Task 8):

```tsx
export function App() {
  return <h1>Greek Grammar Explorer</h1>;
}
```

`src/styles.css` (placeholder, replaced in Task 8):

```css
body { font-family: system-ui, sans-serif; }
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
cd /Users/radu/Code/Claude/learn-greek
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom tsx
```

Expected: both commands finish with "added N packages" and no errors.

- [ ] **Step 3: Write `src/types.ts`**

```ts
export type Gender = 'm' | 'f' | 'n';
export type Case = 'nom' | 'acc' | 'gen';
export type Num = 'sg' | 'pl';
export type Person = 1 | 2 | 3;
export type Level = 'beginner' | 'improver';

export interface IrregularNote {
  rule: string;
  plain: string;
}

/** A Greek form split for display. The ending is highlighted in the UI. */
export interface Form {
  stem: string;
  ending: string;
  irregular?: IrregularNote;
}

export type Slot =
  | { pos: 'verb'; person: Person; number: Num; mood: 'indicative'; tense: 'present'; voice: 'active' }
  | { pos: 'noun'; number: Num; case: Case }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: 1; gender: Gender; case: Case };

export type Pos = Slot['pos'];
export type SlotOf<P extends Pos> = Extract<Slot, { pos: P }>;

interface LexemeBase {
  id: string;
  lemma: string;
  /** True once a speaker has checked every form of this lexeme (spec section 9). */
  verified: boolean;
}

export interface RoNounForms {
  definite: string;
  indefinite: string;
  genDefinite: string;
  genIndefinite: string;
}

export interface GreekNoun extends LexemeBase {
  pos: 'noun';
  gender: Gender;
  class: 'masc-es';
  stems: Record<Num, string>;
  ro: { lemma: string; gender: Gender; forms: Record<Num, RoNounForms> };
  en: Record<Num, string>;
  /** One line comparing gender and form across the three languages. */
  note: string;
}

export interface RoAdjectiveForms {
  sg: string;
  pl: string;
  /** Genitive-dative singular, when it differs from `sg` (feminine only). */
  genSg?: string;
}

export interface GreekAdjective extends LexemeBase {
  pos: 'adjective';
  class: 'adj-stressed';
  stem: string;
  ro: { lemma: string; forms: Record<Gender, RoAdjectiveForms> };
  en: string;
}

export interface GreekNumeral extends LexemeBase {
  pos: 'numeral';
  value: 1;
  ro: Record<Gender, { nom: string; gen: string }>;
  en: string;
}

export interface GreekArticle extends LexemeBase {
  pos: 'article';
}

export interface GreekVerb extends LexemeBase {
  pos: 'verb';
  class: 'omega';
  stems: { present: string };
  ro: { lemma: string; present: string[] };
  en: { gloss: string; base: string; third: string };
}

export type GreekLexeme = GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb;

export type TokenIndex = number;

export interface Token {
  text: string;
  lexeme: string;
  slot: Slot;
  /** Index of the noun this article, numeral or adjective agrees with. */
  agreesWith?: TokenIndex;
}

/** A link points at a whole token, or at one piece of a verb group (Δεν θέλω: piece 0 is δεν). */
export type Link = TokenIndex | { token: TokenIndex; piece: number };

export interface GlossUnit {
  text: string;
  /** The linked Greek token (or piece of one), or null when Greek has no counterpart. */
  link: Link | null;
}

export interface GlossRow {
  language: 'en' | 'ro';
  kind: 'natural' | 'literal';
  units: GlossUnit[];
}

export interface Phrase {
  id: string;
  title: string;
  /** The phrase picker groups by theme. */
  theme: string;
  /** A badge and sort key; the level toggle never hides phrases. */
  level: Level;
  tokens: Token[];
  glosses: GlossRow[];
}

export interface Divergence {
  id: string;
  appliesTo: { pos: Pos; lexeme?: string };
  point: string;
  el: string;
  ro: string;
  en: string;
  /** The type tag shown on the row. */
  tag: 'same' | 'differs' | 'absent';
  /** `core` rows show in both levels; `extra` rows only in Improver. */
  level: 'core' | 'extra';
}
```

- [ ] **Step 4: Write `src/data/paradigms.ts`**

```ts
import type { Case, Gender, Num } from '../types';

export type EndingTable = Record<Num, Record<Case, string>>;
export type Pair = readonly [stem: string, ending: string];

export const NOUN_CLASSES: Record<'masc-es', EndingTable> = {
  'masc-es': {
    sg: { nom: 'ές', acc: 'έ', gen: 'έ' },
    pl: { nom: 'ες', acc: 'ες', gen: 'ων' },
  },
};

/** Adjectives with the stress on the ending: ζεστός, ζεστή, ζεστό. */
export const ADJ_STRESSED: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ός', f: 'ή', n: 'ό' },
    acc: { m: 'ό', f: 'ή', n: 'ό' },
    gen: { m: 'ού', f: 'ής', n: 'ού' },
  },
  pl: {
    nom: { m: 'οί', f: 'ές', n: 'ά' },
    acc: { m: 'ούς', f: 'ές', n: 'ά' },
    gen: { m: 'ών', f: 'ών', n: 'ών' },
  },
};

export const ARTICLE_DEF: Record<Gender, Record<Num, Record<Case, string>>> = {
  m: { sg: { nom: 'ο', acc: 'τον', gen: 'του' }, pl: { nom: 'οι', acc: 'τους', gen: 'των' } },
  f: { sg: { nom: 'η', acc: 'την', gen: 'της' }, pl: { nom: 'οι', acc: 'τις', gen: 'των' } },
  n: { sg: { nom: 'το', acc: 'το', gen: 'του' }, pl: { nom: 'τα', acc: 'τα', gen: 'των' } },
};

/** The numeral "one", which doubles as the indefinite article. */
export const NUMERAL_ONE: Record<Gender, Record<Case, Pair>> = {
  m: { nom: ['ένα', 'ς'], acc: ['ένα', 'ν'], gen: ['ενό', 'ς'] },
  f: { nom: ['μία', ''], acc: ['μία', ''], gen: ['μία', 'ς'] },
  n: { nom: ['ένα', ''], acc: ['ένα', ''], gen: ['ενό', 'ς'] },
};

/** Present active endings of -ω verbs, in the order 1sg 2sg 3sg 1pl 2pl 3pl. */
export const VERB_OMEGA_PRESENT: readonly string[] = ['ω', 'εις', 'ει', 'ουμε', 'ετε', 'ουν'];
```

- [ ] **Step 5: Write `src/data/lexemes.ts`**

```ts
import type {
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
} from '../types';

const kafes: GreekNoun = {
  id: 'kafes',
  pos: 'noun',
  lemma: 'καφές',
  verified: false,
  gender: 'm',
  class: 'masc-es',
  stems: { sg: 'καφ', pl: 'καφέδ' },
  ro: {
    lemma: 'cafea',
    gender: 'f',
    forms: {
      sg: { definite: 'cafeaua', indefinite: 'o cafea', genDefinite: 'cafelei', genIndefinite: 'unei cafele' },
      pl: { definite: 'cafelele', indefinite: 'cafele', genDefinite: 'cafelelor', genIndefinite: 'unor cafele' },
    },
  },
  en: { sg: 'coffee', pl: 'coffees' },
  note: 'Masculine in Greek, feminine in Romanian (o cafea), no gender in English.',
};

const zestos: GreekAdjective = {
  id: 'zestos',
  pos: 'adjective',
  lemma: 'ζεστός',
  verified: false,
  class: 'adj-stressed',
  stem: 'ζεστ',
  ro: {
    lemma: 'cald',
    forms: {
      m: { sg: 'cald', pl: 'calzi' },
      f: { sg: 'caldă', pl: 'calde', genSg: 'calde' },
      n: { sg: 'cald', pl: 'calde' },
    },
  },
  en: 'hot',
};

const one: GreekNumeral = {
  id: 'one',
  pos: 'numeral',
  lemma: 'ένας',
  verified: false,
  value: 1,
  ro: {
    m: { nom: 'un', gen: 'unui' },
    f: { nom: 'o', gen: 'unei' },
    n: { nom: 'un', gen: 'unui' },
  },
  en: 'a',
};

const def: GreekArticle = { id: 'def', pos: 'article', lemma: 'ο', verified: false };

const thelo: GreekVerb = {
  id: 'thelo',
  pos: 'verb',
  lemma: 'θέλω',
  verified: false,
  class: 'omega',
  stems: { present: 'θέλ' },
  ro: { lemma: 'a vrea', present: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vor'] },
  en: { gloss: 'want', base: 'want', third: 'wants' },
};

export const LEXEMES: Record<string, GreekLexeme> = {
  [kafes.id]: kafes,
  [zestos.id]: zestos,
  [one.id]: one,
  [def.id]: def,
  [thelo.id]: thelo,
};

export const DEF_ARTICLE: GreekArticle = def;
export const ONE: GreekNumeral = one;

export function getLexeme(id: string): GreekLexeme {
  const lexeme = LEXEMES[id];
  if (!lexeme) throw new Error(`unknown lexeme: ${id}`);
  return lexeme;
}

export function getNoun(id: string): GreekNoun {
  const l = getLexeme(id);
  if (l.pos !== 'noun') throw new Error(`lexeme ${id} is a ${l.pos}, not a noun`);
  return l;
}

export function getAdjective(id: string): GreekAdjective {
  const l = getLexeme(id);
  if (l.pos !== 'adjective') throw new Error(`lexeme ${id} is a ${l.pos}, not an adjective`);
  return l;
}
```

- [ ] **Step 6: Write the failing test `src/engine/greek.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import { inflectNoun } from './greek';

describe('inflectNoun (καφές, class masc-es)', () => {
  const kafes = getNoun('kafes');
  const cases = [
    { number: 'sg', case: 'nom', stem: 'καφ', ending: 'ές' },
    { number: 'sg', case: 'acc', stem: 'καφ', ending: 'έ' },
    { number: 'sg', case: 'gen', stem: 'καφ', ending: 'έ' },
    { number: 'pl', case: 'nom', stem: 'καφέδ', ending: 'ες' },
    { number: 'pl', case: 'acc', stem: 'καφέδ', ending: 'ες' },
    { number: 'pl', case: 'gen', stem: 'καφέδ', ending: 'ων' },
  ] as const;

  for (const c of cases) {
    it(`${c.number} ${c.case} -> ${c.stem}${c.ending}`, () => {
      expect(inflectNoun(kafes, { pos: 'noun', number: c.number, case: c.case })).toEqual({
        stem: c.stem,
        ending: c.ending,
      });
    });
  }
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: FAIL (cannot resolve `./greek` or `inflectNoun` is not exported).

- [ ] **Step 8: Write `src/engine/greek.ts`**

```ts
import {
  ADJ_STRESSED,
  ARTICLE_DEF,
  NOUN_CLASSES,
  NUMERAL_ONE,
  VERB_OMEGA_PRESENT,
} from '../data/paradigms';
import type {
  Form,
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
  Slot,
  SlotOf,
} from '../types';

export function inflectNoun(l: GreekNoun, s: SlotOf<'noun'>): Form {
  return { stem: l.stems[s.number], ending: NOUN_CLASSES[l.class][s.number][s.case] };
}
```

- [ ] **Step 9: Run it to verify it passes**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 10: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors.

```bash
git add package.json package-lock.json .gitignore tsconfig.json vite.config.ts index.html src
git commit -m "feat: scaffold app, shared types, lexemes and noun inflection" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Article, numeral and adjective inflection

**Files:**
- Modify: `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`

**Interfaces:**
- Consumes: `NUMERAL_ONE`, `ARTICLE_DEF`, `ADJ_STRESSED`, `getAdjective`, `DEF_ARTICLE`, `ONE` from Task 1.
- Produces: `inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form`, `inflectArticle(l: GreekArticle, s: SlotOf<'article'>): Form`, `inflectNumeral(l: GreekNumeral, s: SlotOf<'numeral'>): Form`. For an article the whole word is in `stem` and `ending` is `''`.

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/greek.test.ts` and update its imports to:

```ts
import { describe, expect, it } from 'vitest';
import { DEF_ARTICLE, ONE, getAdjective, getNoun } from '../data/lexemes';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
```

```ts
describe('inflectArticle (definite)', () => {
  const cases = [
    { gender: 'm', number: 'sg', case: 'acc', text: 'τον' },
    { gender: 'f', number: 'pl', case: 'acc', text: 'τις' },
    { gender: 'n', number: 'pl', case: 'nom', text: 'τα' },
    { gender: 'm', number: 'sg', case: 'gen', text: 'του' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.number} ${c.case} -> ${c.text}`, () => {
      expect(
        inflectArticle(DEF_ARTICLE, { pos: 'article', gender: c.gender, number: c.number, case: c.case }),
      ).toEqual({ stem: c.text, ending: '' });
    });
  }
});

describe('inflectNumeral (one)', () => {
  const cases = [
    { gender: 'm', case: 'acc', stem: 'ένα', ending: 'ν' },
    { gender: 'f', case: 'gen', stem: 'μία', ending: 'ς' },
    { gender: 'n', case: 'gen', stem: 'ενό', ending: 'ς' },
    { gender: 'f', case: 'nom', stem: 'μία', ending: '' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.case} -> ${c.stem}${c.ending}`, () => {
      expect(inflectNumeral(ONE, { pos: 'numeral', value: 1, gender: c.gender, case: c.case })).toEqual({
        stem: c.stem,
        ending: c.ending,
      });
    });
  }
});

describe('inflectAdjective (ζεστός, stressed class)', () => {
  const zestos = getAdjective('zestos');
  const cases = [
    { gender: 'm', number: 'sg', case: 'acc', ending: 'ό' },
    { gender: 'f', number: 'sg', case: 'nom', ending: 'ή' },
    { gender: 'm', number: 'pl', case: 'nom', ending: 'οί' },
    { gender: 'n', number: 'pl', case: 'gen', ending: 'ών' },
    { gender: 'f', number: 'sg', case: 'gen', ending: 'ής' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.number} ${c.case} -> ζεστ${c.ending}`, () => {
      expect(
        inflectAdjective(zestos, { pos: 'adjective', gender: c.gender, number: c.number, case: c.case }),
      ).toEqual({ stem: 'ζεστ', ending: c.ending });
    });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: FAIL (`inflectAdjective`, `inflectArticle`, `inflectNumeral` are not exported).

- [ ] **Step 3: Implement**

Append to `src/engine/greek.ts`:

```ts
export function inflectAdjective(l: GreekAdjective, s: SlotOf<'adjective'>): Form {
  return { stem: l.stem, ending: ADJ_STRESSED[s.number][s.case][s.gender] };
}

export function inflectArticle(_l: GreekArticle, s: SlotOf<'article'>): Form {
  return { stem: ARTICLE_DEF[s.gender][s.number][s.case], ending: '' };
}

export function inflectNumeral(_l: GreekNumeral, s: SlotOf<'numeral'>): Form {
  const [stem, ending] = NUMERAL_ONE[s.gender][s.case];
  return { stem, ending };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: inflect definite article, numeral one and stressed adjectives" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Verb inflection and the `inflect` dispatcher

**Files:**
- Modify: `src/engine/greek.ts`
- Test: `src/engine/greek.test.ts`

**Interfaces:**
- Consumes: `VERB_OMEGA_PRESENT`, `getLexeme` from earlier tasks.
- Produces: `inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form`; `inflect(l: GreekLexeme, s: Slot): Form` (throws `Error` with the message `slot <pos> does not fit lexeme <id> (<pos>)` when the part of speech differs).

- [ ] **Step 1: Write the failing tests**

Add `getLexeme` to the data import and `inflect, inflectVerb` to the engine import in `src/engine/greek.test.ts`, then append:

```ts
describe('inflectVerb (θέλω, -ω class, present active)', () => {
  const thelo = getLexeme('thelo');
  const verbSlot = (person: 1 | 2 | 3, number: 'sg' | 'pl') =>
    ({ pos: 'verb', person, number, mood: 'indicative', tense: 'present', voice: 'active' }) as const;

  it('1sg -> θέλω', () => {
    expect(inflect(thelo, verbSlot(1, 'sg'))).toEqual({ stem: 'θέλ', ending: 'ω' });
  });
  it('2sg -> θέλεις', () => {
    expect(inflect(thelo, verbSlot(2, 'sg'))).toEqual({ stem: 'θέλ', ending: 'εις' });
  });
  it('3sg -> θέλει', () => {
    expect(inflect(thelo, verbSlot(3, 'sg'))).toEqual({ stem: 'θέλ', ending: 'ει' });
  });
  it('1pl -> θέλουμε', () => {
    expect(inflect(thelo, verbSlot(1, 'pl'))).toEqual({ stem: 'θέλ', ending: 'ουμε' });
  });
  it('3pl -> θέλουν', () => {
    expect(inflect(thelo, verbSlot(3, 'pl'))).toEqual({ stem: 'θέλ', ending: 'ουν' });
  });
});

describe('inflect dispatcher', () => {
  it('routes a noun slot to the noun engine', () => {
    expect(inflect(getNoun('kafes'), { pos: 'noun', number: 'sg', case: 'acc' })).toEqual({
      stem: 'καφ',
      ending: 'έ',
    });
  });
  it('rejects a slot of the wrong part of speech', () => {
    expect(() => inflect(getNoun('kafes'), { pos: 'article', gender: 'm', number: 'sg', case: 'nom' })).toThrow(
      'slot article does not fit lexeme kafes (noun)',
    );
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine/greek.test.ts`
Expected: FAIL (`inflect` is not exported).

- [ ] **Step 3: Implement**

Append to `src/engine/greek.ts`:

```ts
export function inflectVerb(l: GreekVerb, s: SlotOf<'verb'>): Form {
  const index = s.person - 1 + (s.number === 'pl' ? 3 : 0);
  return { stem: l.stems.present, ending: VERB_OMEGA_PRESENT[index] };
}

export function inflect(l: GreekLexeme, s: Slot): Form {
  if (l.pos !== s.pos) throw new Error(`slot ${s.pos} does not fit lexeme ${l.id} (${l.pos})`);
  switch (l.pos) {
    case 'noun':
      return inflectNoun(l, s as SlotOf<'noun'>);
    case 'adjective':
      return inflectAdjective(l, s as SlotOf<'adjective'>);
    case 'article':
      return inflectArticle(l, s as SlotOf<'article'>);
    case 'numeral':
      return inflectNumeral(l, s as SlotOf<'numeral'>);
    case 'verb':
      return inflectVerb(l, s as SlotOf<'verb'>);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/engine/greek.test.ts && npm run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: inflect present-tense verbs and add the inflect dispatcher" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Rich text, Romanian and English forms, noun-phrase builder

**Files:**
- Create: `src/engine/segments.ts`, `src/engine/romanian.ts`, `src/engine/english.ts`, `src/engine/agree.ts`
- Test: `src/engine/segments.test.ts`, `src/engine/agree.test.ts`

**Interfaces:**
- Consumes: `inflectNoun`, `inflectAdjective`, `inflectArticle`, `inflectNumeral` (Tasks 1 to 3); `DEF_ARTICLE`, `ONE` (Task 1).
- Produces:
  - `type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim'`; `interface Segment { text: string; role: Role }`; `type Rich = Segment[]`.
  - `plain(text): Rich`, `dim(text): Rich`, `richText(r): string`, `joinRich(parts: Rich[]): Rich` (single plain space between parts), `formRich(f: Form): Rich` (stem role `stem`, ending role `ending`, omit empty ending), `articleRich(f: Form): Rich` (one `article` segment), `numeralRich(f: Form): Rich` (stem `article`, ending `ending`).
  - `roNoun(n: GreekNoun, number: Num, c: Case, kind: 'definite' | 'indefinite'): string`; `roAdjective(a: GreekAdjective, roGender: Gender, number: Num, c: Case): string`; `roNumeral(n: GreekNumeral, roGender: Gender, c: Case): string`; `roVerb(v: GreekVerb, s: SlotOf<'verb'>): string`.
  - `enNoun(n: GreekNoun, number: Num): string`; `enIndefiniteArticle(nextWord: string): 'a' | 'an'`; `enVerb(v: GreekVerb, s: SlotOf<'verb'>): string`.
  - `interface NpOptions { article?: 'definite' | 'one'; adjective?: GreekAdjective }`; `interface NounPhrase { el: Rich; ro: string; en: string }`; `nounPhrase(noun: GreekNoun, number: Num, c: Case, opts?: NpOptions): NounPhrase`. Throws `Greek has no plural indefinite article` for `article: 'one'` with `number: 'pl'`. With no article, Romanian uses the indefinite form and English adds no article.

- [ ] **Step 1: Write the failing test `src/engine/segments.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { articleRich, dim, formRich, joinRich, numeralRich, plain, richText } from './segments';

describe('segments', () => {
  it('formRich splits stem and ending', () => {
    expect(formRich({ stem: 'καφ', ending: 'έ' })).toEqual([
      { text: 'καφ', role: 'stem' },
      { text: 'έ', role: 'ending' },
    ]);
  });
  it('formRich omits an empty ending', () => {
    expect(formRich({ stem: 'μία', ending: '' })).toEqual([{ text: 'μία', role: 'stem' }]);
  });
  it('articleRich marks the whole word as an article', () => {
    expect(articleRich({ stem: 'τον', ending: '' })).toEqual([{ text: 'τον', role: 'article' }]);
  });
  it('numeralRich marks the stem as article and the ending as ending', () => {
    expect(numeralRich({ stem: 'ένα', ending: 'ν' })).toEqual([
      { text: 'ένα', role: 'article' },
      { text: 'ν', role: 'ending' },
    ]);
  });
  it('joinRich puts one plain space between parts', () => {
    const joined = joinRich([plain('a'), dim('b'), plain('c')]);
    expect(richText(joined)).toBe('a b c');
    expect(joined[1]).toEqual({ text: ' ', role: 'plain' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine/segments.test.ts`
Expected: FAIL (module `./segments` not found).

- [ ] **Step 3: Write `src/engine/segments.ts`**

```ts
import type { Form } from '../types';

export type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim';
export interface Segment {
  text: string;
  role: Role;
}
export type Rich = Segment[];

export const plain = (text: string): Rich => [{ text, role: 'plain' }];
export const dim = (text: string): Rich => [{ text, role: 'dim' }];
export const richText = (r: Rich): string => r.map((s) => s.text).join('');

export function joinRich(parts: Rich[]): Rich {
  return parts.flatMap((part, i) => (i === 0 ? part : [{ text: ' ', role: 'plain' as const }, ...part]));
}

export function formRich(f: Form): Rich {
  const out: Rich = [{ text: f.stem, role: 'stem' }];
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}

export const articleRich = (f: Form): Rich => [{ text: f.stem, role: 'article' }];

export function numeralRich(f: Form): Rich {
  const out: Rich = [{ text: f.stem, role: 'article' }];
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/engine/segments.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test `src/engine/agree.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import { nounPhrase } from './agree';
import { richText } from './segments';

const kafes = getNoun('kafes');
const zestos = getAdjective('zestos');

describe('nounPhrase', () => {
  it('indefinite singular accusative with an adjective, in three languages', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'one', adjective: zestos });
    expect(richText(np.el)).toBe('έναν ζεστό καφέ');
    expect(np.ro).toBe('o cafea caldă');
    expect(np.en).toBe('a hot coffee');
  });

  it('definite singular accusative with an adjective', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('τον ζεστό καφέ');
    expect(np.ro).toBe('cafeaua caldă');
    expect(np.en).toBe('the hot coffee');
  });

  it('definite plural nominative, no adjective', () => {
    const np = nounPhrase(kafes, 'pl', 'nom', { article: 'definite' });
    expect(richText(np.el)).toBe('οι καφέδες');
    expect(np.ro).toBe('cafelele');
    expect(np.en).toBe('the coffees');
  });

  it('definite singular genitive with an adjective uses the Romanian feminine genitive', () => {
    const np = nounPhrase(kafes, 'sg', 'gen', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('του ζεστού καφέ');
    expect(np.ro).toBe('cafelei calde');
    expect(np.en).toBe('of the hot coffee');
  });

  it('plural adjective agrees: Romanian pl forms', () => {
    const np = nounPhrase(kafes, 'pl', 'acc', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('τους ζεστούς καφέδες');
    expect(np.ro).toBe('cafelele calde');
    expect(np.en).toBe('the hot coffees');
  });

  it('rejects an indefinite article in the plural', () => {
    expect(() => nounPhrase(kafes, 'pl', 'nom', { article: 'one' })).toThrow(
      'Greek has no plural indefinite article',
    );
  });

  it('marks the article and ending roles for the Greek side', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'definite' });
    expect(np.el).toEqual([
      { text: 'τον', role: 'article' },
      { text: ' ', role: 'plain' },
      { text: 'καφ', role: 'stem' },
      { text: 'έ', role: 'ending' },
    ]);
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/engine/agree.test.ts`
Expected: FAIL (module `./agree` not found).

- [ ] **Step 7: Write `src/engine/romanian.ts`**

```ts
import type { Case, Gender, GreekAdjective, GreekNoun, GreekNumeral, GreekVerb, Num, SlotOf } from '../types';

export function roNoun(n: GreekNoun, number: Num, c: Case, kind: 'definite' | 'indefinite'): string {
  const f = n.ro.forms[number];
  const gen = c === 'gen';
  if (kind === 'definite') return gen ? f.genDefinite : f.definite;
  return gen ? f.genIndefinite : f.indefinite;
}

/** Romanian adjectives agree with the Romanian noun's gender, which can differ from the Greek one. */
export function roAdjective(a: GreekAdjective, roGender: Gender, number: Num, c: Case): string {
  const f = a.ro.forms[roGender];
  if (c === 'gen' && number === 'sg' && f.genSg) return f.genSg;
  return f[number];
}

export function roNumeral(n: GreekNumeral, roGender: Gender, c: Case): string {
  return n.ro[roGender][c === 'gen' ? 'gen' : 'nom'];
}

export function roVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  return v.ro.present[s.person - 1 + (s.number === 'pl' ? 3 : 0)];
}
```

- [ ] **Step 8: Write `src/engine/english.ts`**

```ts
import type { GreekNoun, GreekVerb, Num, SlotOf } from '../types';

export const enNoun = (n: GreekNoun, number: Num): string => n.en[number];

export const enIndefiniteArticle = (nextWord: string): 'a' | 'an' =>
  /^[aeiou]/i.test(nextWord) ? 'an' : 'a';

export function enVerb(v: GreekVerb, s: SlotOf<'verb'>): string {
  return s.person === 3 && s.number === 'sg' ? v.en.third : v.en.base;
}
```

- [ ] **Step 9: Write `src/engine/agree.ts`**

```ts
import { DEF_ARTICLE, ONE } from '../data/lexemes';
import type { Case, GreekAdjective, GreekNoun, Num } from '../types';
import { enIndefiniteArticle, enNoun } from './english';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
import { roAdjective, roNoun } from './romanian';
import { articleRich, formRich, joinRich, numeralRich, type Rich } from './segments';

export interface NpOptions {
  article?: 'definite' | 'one';
  adjective?: GreekAdjective;
}

export interface NounPhrase {
  el: Rich;
  ro: string;
  en: string;
}

/** Builds article + adjective + noun in all three languages, agreeing in gender, number and case. */
export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
  if (opts.article === 'one' && number === 'pl') {
    throw new Error('Greek has no plural indefinite article');
  }
  const gender = noun.gender;

  const el: Rich[] = [];
  if (opts.article === 'definite') {
    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })));
  }
  if (opts.article === 'one') {
    el.push(numeralRich(inflectNumeral(ONE, { pos: 'numeral', value: 1, gender, case: c })));
  }
  if (opts.adjective) {
    el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
  }
  el.push(formRich(inflectNoun(noun, { pos: 'noun', number, case: c })));

  const roNounText = roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite');
  const ro = opts.adjective
    ? `${roNounText} ${roAdjective(opts.adjective, noun.ro.gender, number, c)}`
    : roNounText;

  const core = [opts.adjective?.en, enNoun(noun, number)].filter(Boolean).join(' ');
  const article =
    opts.article === 'definite' ? 'the' : opts.article === 'one' ? enIndefiniteArticle(core) : '';
  const enText = [article, core].filter(Boolean).join(' ');

  return { el: joinRich(el), ro, en: c === 'gen' ? `of ${enText}` : enText };
}
```

- [ ] **Step 10: Run to verify it passes**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS for all engine tests; no type errors.

- [ ] **Step 11: Commit**

```bash
git add src/engine
git commit -m "feat: add rich-text helpers, Romanian and English forms, and the noun-phrase builder" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Phrase 1 data, divergences and the validator

**Files:**
- Create: `src/glossLinks.ts`, `src/data/phrases.ts`, `src/data/divergences.ts`, `src/validate/validate.ts`, `scripts/validate.ts`
- Test: `src/glossLinks.test.ts`, `src/validate/validate.test.ts`

**Interfaces:**
- Consumes: `LEXEMES`, `inflect`, types from earlier tasks.
- Produces: `linkedToken(link: Link): TokenIndex` and `linkedPiece(link: Link): number | null`; `PHRASES: Phrase[]` (one phrase, id `ordering-hot-coffee`, theme `Ordering`); `DIVERGENCES: Divergence[]`; `interface ValidationInput { lexemes: Record<string, GreekLexeme>; phrases: Phrase[] }`; `validate(input: ValidationInput): string[]` (empty array means valid).

- [ ] **Step 0a: Write the failing test `src/glossLinks.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { linkedPiece, linkedToken } from './glossLinks';

describe('gloss links', () => {
  it('a whole-token link is the token index', () => {
    expect(linkedToken(3)).toBe(3);
    expect(linkedPiece(3)).toBeNull();
  });
  it('a piece link names its token and its piece', () => {
    expect(linkedToken({ token: 2, piece: 1 })).toBe(2);
    expect(linkedPiece({ token: 2, piece: 1 })).toBe(1);
  });
  it('token 0 and piece 0 are valid links, not "no link"', () => {
    expect(linkedToken(0)).toBe(0);
    expect(linkedToken({ token: 0, piece: 0 })).toBe(0);
    expect(linkedPiece({ token: 0, piece: 0 })).toBe(0);
  });
});
```

- [ ] **Step 0b: Run to verify it fails**

Run: `npx vitest run src/glossLinks.test.ts`
Expected: FAIL (module `./glossLinks` not found).

- [ ] **Step 0c: Write `src/glossLinks.ts`**

```ts
import type { Link, TokenIndex } from './types';

/** The token a gloss link points at (the whole link, or the token of a piece link). */
export function linkedToken(link: Link): TokenIndex {
  return typeof link === 'number' ? link : link.token;
}

/** The piece of the token the link points at, or null when it points at the whole token. */
export function linkedPiece(link: Link): number | null {
  return typeof link === 'number' ? null : link.piece;
}
```

- [ ] **Step 0d: Run to verify it passes**

Run: `npx vitest run src/glossLinks.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 1: Write `src/data/phrases.ts`**

```ts
import type { GlossRow, Phrase, Token } from '../types';

const tokens: Token[] = [
  {
    text: 'Θέλω',
    lexeme: 'thelo',
    slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
  },
  {
    text: 'έναν',
    lexeme: 'one',
    slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' },
    agreesWith: 3,
  },
  {
    text: 'ζεστό',
    lexeme: 'zestos',
    slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' },
    agreesWith: 3,
  },
  { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];

const glosses: GlossRow[] = [
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
];

export const PHRASES: Phrase[] = [
  {
    id: 'ordering-hot-coffee',
    title: 'Ordering a hot coffee',
    theme: 'Ordering',
    level: 'beginner',
    tokens,
    glosses,
  },
];
```

- [ ] **Step 2: Write `src/data/divergences.ts`**

```ts
import type { Divergence } from '../types';

export const DIVERGENCES: Divergence[] = [
  {
    id: 'verb-subject',
    appliesTo: { pos: 'verb' },
    point: 'Subject',
    el: 'dropped: the ending shows the person',
    ro: 'dropped: the ending shows the person',
    en: 'required: I / you / he …',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'thelo-politeness',
    appliesTo: { pos: 'verb', lexeme: 'thelo' },
    point: 'Politeness',
    el: 'present Θέλω is a normal request',
    ro: 'conditional aș vrea is softer',
    en: '"I\'d like" (conditional)',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'numeral-gender',
    appliesTo: { pos: 'numeral' },
    point: 'Gender',
    el: 'ένας / μία / ένα change with the noun',
    ro: 'un / o change with the noun',
    en: 'a / an never changes',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'numeral-case',
    appliesTo: { pos: 'numeral' },
    point: 'Case',
    el: 'accusative έναν, genitive ενός',
    ro: 'only the genitive changes (unui, unei)',
    en: 'never changes',
    tag: 'differs',
    level: 'extra',
  },
  {
    id: 'adjective-position',
    appliesTo: { pos: 'adjective' },
    point: 'Position',
    el: 'before the noun (usually)',
    ro: 'after the noun: cafea caldă',
    en: 'before the noun',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'adjective-agreement',
    appliesTo: { pos: 'adjective' },
    point: 'Agreement',
    el: 'gender, number and role',
    ro: 'gender and number',
    en: 'none: hot never changes',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'adjective-with-the',
    appliesTo: { pos: 'adjective' },
    point: 'With "the"',
    el: 'article before the adjective: τον ζεστό καφέ',
    ro: 'article on the noun: cafeaua caldă',
    en: 'the hot coffee',
    tag: 'differs',
    level: 'extra',
  },
  {
    id: 'noun-case',
    appliesTo: { pos: 'noun' },
    point: 'Case marking',
    el: 'article and noun both change',
    ro: 'mainly the article suffix changes',
    en: 'none',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'noun-article',
    appliesTo: { pos: 'noun' },
    point: 'Definite article',
    el: 'free-standing: τον καφέ',
    ro: 'attached: cafeaua',
    en: 'separate: the coffee',
    tag: 'differs',
    level: 'core',
  },
  {
    id: 'article-position',
    appliesTo: { pos: 'article' },
    point: 'Position',
    el: 'free-standing, before the noun',
    ro: 'attached to the end of the noun',
    en: 'free-standing, before the noun',
    tag: 'differs',
    level: 'core',
  },
];
```

- [ ] **Step 3: Write the failing test `src/validate/validate.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Link, Phrase, Token } from '../types';
import { validate } from './validate';

const real = { lexemes: LEXEMES, phrases: PHRASES };

/** A copy of phrase 1 with one token changed. */
const withToken = (index: number, patch: Partial<Token>): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) => (i === index ? { ...t, ...patch } : t)),
});

describe('validate', () => {
  it('accepts the real data', () => {
    expect(validate(real)).toEqual([]);
  });

  it('reports an unknown lexeme', () => {
    expect(validate({ ...real, phrases: [withToken(3, { lexeme: 'nope' })] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): unknown lexeme "nope"',
    );
  });

  it('reports a slot of the wrong part of speech', () => {
    const bad = withToken(3, { slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): slot is article but lexeme kafes is noun',
    );
  });

  it('reports a gloss link outside the phrase', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: 9 }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports an adjective that does not agree with its noun in gender', () => {
    const bad = withToken(2, { slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): slot gender f differs from noun gender m',
    );
  });

  it('reports a missing agreesWith on an adjective', () => {
    const bad = withToken(2, { agreesWith: undefined });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): adjective needs agreesWith pointing at a noun',
    );
  });

  it('reports an empty Romanian form on a lexeme', () => {
    const lexemes = {
      ...LEXEMES,
      kafes: {
        ...LEXEMES.kafes,
        ro: {
          lemma: 'cafea',
          gender: 'f',
          forms: {
            sg: { definite: '', indefinite: 'o cafea', genDefinite: 'cafelei', genIndefinite: 'unei cafele' },
            pl: { definite: 'cafelele', indefinite: 'cafele', genDefinite: 'cafelelor', genIndefinite: 'unor cafele' },
          },
        },
      },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme kafes: empty Romanian form sg.definite');
  });

  const withExtraUnit = (link: Link): Phrase => ({
    ...PHRASES[0],
    glosses: PHRASES[0].glosses.map((g, i) =>
      i === 0 ? { ...g, units: [...g.units, { text: 'extra', link }] } : g,
    ),
  });

  it('accepts a gloss link to a piece of an existing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: 0 })] })).toEqual([]);
  });

  it('reports a piece link to a missing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 9, piece: 0 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports a negative piece number', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: -1 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" has an invalid piece -1',
    );
  });

  it('reports a phrase with no theme', () => {
    expect(validate({ ...real, phrases: [{ ...PHRASES[0], theme: '' }] })).toContain(
      'ordering-hot-coffee: missing theme',
    );
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `npx vitest run src/validate/validate.test.ts`
Expected: FAIL (module `./validate` not found).

- [ ] **Step 5: Write `src/validate/validate.ts`**

```ts
import { inflect } from '../engine/greek';
import { linkedToken } from '../glossLinks';
import type { Case, Gender, GreekLexeme, Num, Person, Phrase, Slot, Token } from '../types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const CASES: Case[] = ['nom', 'acc', 'gen'];
const NUMS: Num[] = ['sg', 'pl'];
const PERSONS: Person[] = [1, 2, 3];

export interface ValidationInput {
  lexemes: Record<string, GreekLexeme>;
  phrases: Phrase[];
}

const isEmpty = (s: string | undefined): boolean => !s || s.trim() === '';

function slotsFor(l: GreekLexeme): Slot[] {
  switch (l.pos) {
    case 'noun':
      return NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'noun', number, case: c })));
    case 'adjective':
      return GENDERS.flatMap((gender) =>
        NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'adjective', gender, number, case: c }))),
      );
    case 'article':
      return GENDERS.flatMap((gender) =>
        NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'article', gender, number, case: c }))),
      );
    case 'numeral':
      return GENDERS.flatMap((gender) => CASES.map((c): Slot => ({ pos: 'numeral', value: 1, gender, case: c })));
    case 'verb':
      return PERSONS.flatMap((person) =>
        NUMS.map((number): Slot => ({
          pos: 'verb',
          person,
          number,
          mood: 'indicative',
          tense: 'present',
          voice: 'active',
        })),
      );
  }
}

function checkLexeme(l: GreekLexeme): string[] {
  const errors: string[] = [];
  for (const slot of slotsFor(l)) {
    try {
      const form = inflect(l, slot);
      if (isEmpty(form.stem)) errors.push(`lexeme ${l.id}: empty Greek form for ${JSON.stringify(slot)}`);
    } catch (e) {
      errors.push(`lexeme ${l.id}: cannot inflect ${JSON.stringify(slot)}: ${(e as Error).message}`);
    }
  }
  if (l.pos === 'noun') {
    for (const n of NUMS) {
      for (const [key, value] of Object.entries(l.ro.forms[n])) {
        if (isEmpty(value)) errors.push(`lexeme ${l.id}: empty Romanian form ${n}.${key}`);
      }
      if (isEmpty(l.en[n])) errors.push(`lexeme ${l.id}: empty English form ${n}`);
    }
  }
  if (l.pos === 'adjective') {
    for (const g of GENDERS) {
      for (const n of NUMS) {
        if (isEmpty(l.ro.forms[g][n])) errors.push(`lexeme ${l.id}: empty Romanian form ${g}.${n}`);
      }
    }
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
  }
  if (l.pos === 'numeral') {
    for (const g of GENDERS) {
      if (isEmpty(l.ro[g].nom) || isEmpty(l.ro[g].gen)) errors.push(`lexeme ${l.id}: empty Romanian form ${g}`);
    }
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
  }
  if (l.pos === 'verb') {
    if (l.ro.present.length !== 6 || l.ro.present.some(isEmpty)) {
      errors.push(`lexeme ${l.id}: Romanian present needs six non-empty forms`);
    }
    if (isEmpty(l.en.base) || isEmpty(l.en.third)) errors.push(`lexeme ${l.id}: empty English form`);
  }
  return errors;
}

function checkToken(phraseId: string, phrase: Phrase, index: number, token: Token, lexemes: Record<string, GreekLexeme>): string[] {
  const where = `${phraseId} token ${index} (${token.text})`;
  const lexeme = lexemes[token.lexeme];
  if (!lexeme) return [`${where}: unknown lexeme "${token.lexeme}"`];
  if (token.slot.pos !== lexeme.pos) {
    return [`${where}: slot is ${token.slot.pos} but lexeme ${lexeme.id} is ${lexeme.pos}`];
  }
  const errors: string[] = [];
  try {
    inflect(lexeme, token.slot);
  } catch (e) {
    errors.push(`${where}: ${(e as Error).message}`);
  }
  if (token.slot.pos === 'adjective' || token.slot.pos === 'numeral' || token.slot.pos === 'article') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const noun = target ? lexemes[target.lexeme] : undefined;
    if (!noun || noun.pos !== 'noun') {
      errors.push(`${where}: ${token.slot.pos} needs agreesWith pointing at a noun`);
    } else if (token.slot.gender !== noun.gender) {
      errors.push(`${where}: slot gender ${token.slot.gender} differs from noun gender ${noun.gender}`);
    }
  }
  return errors;
}

function checkPhrase(phrase: Phrase, lexemes: Record<string, GreekLexeme>): string[] {
  const errors: string[] = [];
  if (isEmpty(phrase.theme)) errors.push(`${phrase.id}: missing theme`);
  phrase.tokens.forEach((token, i) => errors.push(...checkToken(phrase.id, phrase, i, token, lexemes)));
  for (const language of ['en', 'ro'] as const) {
    for (const kind of ['natural', 'literal'] as const) {
      const row = phrase.glosses.find((g) => g.language === language && g.kind === kind);
      if (!row || row.units.length === 0) {
        errors.push(`${phrase.id} gloss ${language}/${kind}: missing or empty`);
        continue;
      }
      for (const unit of row.units) {
        if (unit.link === null) continue;
        const token = linkedToken(unit.link);
        if (token < 0 || token >= phrase.tokens.length) {
          errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unit.text}" links to missing token ${token}`);
        }
        if (typeof unit.link === 'object' && (!Number.isInteger(unit.link.piece) || unit.link.piece < 0)) {
          errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unit.text}" has an invalid piece ${unit.link.piece}`);
        }
      }
    }
  }
  return errors;
}

/** Returns a list of problems; an empty list means the data is valid. */
export function validate(input: ValidationInput): string[] {
  const errors: string[] = [];
  for (const lexeme of Object.values(input.lexemes)) errors.push(...checkLexeme(lexeme));
  for (const phrase of input.phrases) errors.push(...checkPhrase(phrase, input.lexemes));
  return errors;
}
```

- [ ] **Step 6: Write `scripts/validate.ts`**

```ts
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { validate } from '../src/validate/validate';

const errors = validate({ lexemes: LEXEMES, phrases: PHRASES });
const unverified = Object.values(LEXEMES).filter((l) => !l.verified);

if (unverified.length > 0) {
  console.log(`Unverified lexemes (${unverified.length}): ${unverified.map((l) => l.id).join(', ')}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('Data is valid.');
```

- [ ] **Step 7: Run to verify it passes**

Run: `npx vitest run src/validate && npm run validate`
Expected: tests PASS; the script prints `Unverified lexemes (5): kafes, zestos, one, def, thelo` and `Data is valid.`

- [ ] **Step 8: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors.

```bash
git add src/data src/validate src/glossLinks.ts src/glossLinks.test.ts scripts
git commit -m "feat: add phrase 1 data, divergence notes and the data validator" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Labels, level storage, level toggle, phrase bar and gloss grid

**Files:**
- Create: `src/engine/labels.ts`, `src/storage.ts`, `src/components/LevelToggle.tsx`, `src/components/PhraseBar.tsx`, `src/components/GlossGrid.tsx`
- Test: `src/engine/labels.test.ts`, `src/storage.test.ts`, `src/components/GlossGrid.test.tsx`, `src/components/PhraseBar.test.tsx`

**Interfaces:**
- Consumes: `Level`, `Token`, `GlossRow` from Task 1.
- Produces:
  - `interface Option { value: string; label: string }`
  - `caseOptions(level: Level): Option[]` (values `nom` `acc` `gen`; Beginner labels `subject` `object` `possessor`; Improver `nominative` `accusative` `genitive`), `numberOptions: Option[]` (`sg` "one", `pl` "many"), `whoOptions: Option[]` (values `1sg 2sg 3sg 1pl 2pl 3pl`, labels `I`, `you`, `he / she`, `we`, `you (pl.)`, `they`), `GENDER_NAME: Record<Gender, string>` (`masculine` `feminine` `neuter`), `GREEK_PRONOUNS`, `RO_PRONOUNS`, `EN_PRONOUNS` (string arrays in the order `1sg 2sg 3sg 1pl 2pl 3pl`).
  - `readLevel(): Level`, `writeLevel(level: Level): void`.
  - `LevelToggle({ value, onChange })`; `PhraseBar({ tokens, selected, onSelect })`; `GlossGrid({ glosses, selected, onSelect })` where `onSelect(index: number)`.

- [ ] **Step 1: Write the failing test `src/engine/labels.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { EN_PRONOUNS, GENDER_NAME, GREEK_PRONOUNS, RO_PRONOUNS, caseOptions, numberOptions, whoOptions } from './labels';

describe('labels', () => {
  it('uses plain case names for Beginner', () => {
    expect(caseOptions('beginner')).toEqual([
      { value: 'nom', label: 'subject' },
      { value: 'acc', label: 'object' },
      { value: 'gen', label: 'possessor' },
    ]);
  });
  it('uses technical case names for Improver', () => {
    expect(caseOptions('improver').map((o) => o.label)).toEqual(['nominative', 'accusative', 'genitive']);
  });
  it('has number options with plain labels', () => {
    expect(numberOptions).toEqual([
      { value: 'sg', label: 'one' },
      { value: 'pl', label: 'many' },
    ]);
  });
  it('has six who-options in person order', () => {
    expect(whoOptions.map((o) => o.value)).toEqual(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']);
    expect(whoOptions[2].label).toBe('he / she');
  });
  it('has six pronouns per language and gender names', () => {
    expect(GREEK_PRONOUNS).toHaveLength(6);
    expect(RO_PRONOUNS).toHaveLength(6);
    expect(EN_PRONOUNS).toHaveLength(6);
    expect(GREEK_PRONOUNS[0]).toBe('εγώ');
    expect(RO_PRONOUNS[0]).toBe('eu');
    expect(EN_PRONOUNS[0]).toBe('I');
    expect(GENDER_NAME.n).toBe('neuter');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/engine/labels.test.ts`
Expected: FAIL (module `./labels` not found).

- [ ] **Step 3: Write `src/engine/labels.ts`**

```ts
import type { Gender, Level } from '../types';

export interface Option {
  value: string;
  label: string;
}

export function caseOptions(level: Level): Option[] {
  return level === 'beginner'
    ? [
        { value: 'nom', label: 'subject' },
        { value: 'acc', label: 'object' },
        { value: 'gen', label: 'possessor' },
      ]
    : [
        { value: 'nom', label: 'nominative' },
        { value: 'acc', label: 'accusative' },
        { value: 'gen', label: 'genitive' },
      ];
}

export const numberOptions: Option[] = [
  { value: 'sg', label: 'one' },
  { value: 'pl', label: 'many' },
];

export const whoOptions: Option[] = [
  { value: '1sg', label: 'I' },
  { value: '2sg', label: 'you' },
  { value: '3sg', label: 'he / she' },
  { value: '1pl', label: 'we' },
  { value: '2pl', label: 'you (pl.)' },
  { value: '3pl', label: 'they' },
];

export const GENDER_NAME: Record<Gender, string> = { m: 'masculine', f: 'feminine', n: 'neuter' };

export const GREEK_PRONOUNS = ['εγώ', 'εσύ', 'αυτός/ή', 'εμείς', 'εσείς', 'αυτοί/ές'];
export const RO_PRONOUNS = ['eu', 'tu', 'el/ea', 'noi', 'voi', 'ei/ele'];
export const EN_PRONOUNS = ['I', 'you', 'he/she', 'we', 'you', 'they'];
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/engine/labels.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test `src/storage.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readLevel, writeLevel } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('level storage', () => {
  it('defaults to beginner', () => {
    expect(readLevel()).toBe('beginner');
  });
  it('round-trips improver', () => {
    writeLevel('improver');
    expect(readLevel()).toBe('improver');
  });
  it('falls back to beginner for an unknown stored value', () => {
    window.localStorage.setItem('greek-explorer.level', 'expert');
    expect(readLevel()).toBe('beginner');
  });
  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readLevel()).toBe('beginner');
    expect(() => writeLevel('improver')).not.toThrow();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/storage.test.ts`
Expected: FAIL (module `./storage` not found).

- [ ] **Step 7: Write `src/storage.ts`**

```ts
import type { Level } from './types';

const KEY = 'greek-explorer.level';

export function readLevel(): Level {
  try {
    return window.localStorage.getItem(KEY) === 'improver' ? 'improver' : 'beginner';
  } catch {
    return 'beginner';
  }
}

export function writeLevel(level: Level): void {
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    // Storage can be blocked or full; the app works without remembering the level.
  }
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src/storage.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 9: Write the failing component tests**

`src/components/PhraseBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { PhraseBar } from './PhraseBar';

describe('PhraseBar', () => {
  it('renders one button per token and marks the selected one', () => {
    render(<PhraseBar tokens={PHRASES[0].tokens} selected={2} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'ζεστό' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Θέλω' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the token index', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={PHRASES[0].tokens} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'καφέ' }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
```

`src/components/GlossGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import type { GlossRow } from '../types';
import { GlossGrid } from './GlossGrid';

const glosses = PHRASES[0].glosses;

describe('GlossGrid', () => {
  it('shows all four rows with language and kind labels', () => {
    render(<GlossGrid glosses={glosses} selected={0} onSelect={() => {}} />);
    expect(screen.getAllByText('natural')).toHaveLength(2);
    expect(screen.getAllByText('literal')).toHaveLength(2);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Română')).toBeInTheDocument();
  });

  it('highlights every unit linked to the selected token', () => {
    render(<GlossGrid glosses={glosses} selected={2} onSelect={() => {}} />);
    const hot = screen.getAllByRole('button', { name: 'hot' });
    expect(hot).toHaveLength(2);
    for (const b of hot) expect(b).toHaveAttribute('aria-pressed', 'true');
    const calda = screen.getAllByRole('button', { name: 'caldă' });
    expect(calda).toHaveLength(2);
    for (const b of calda) expect(b).toHaveAttribute('aria-pressed', 'true');
    const coffee = screen.getAllByRole('button', { name: 'coffee' });
    expect(coffee).toHaveLength(2);
    for (const b of coffee) expect(b).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects the linked token when a unit is clicked', async () => {
    const onSelect = vi.fn();
    render(<GlossGrid glosses={glosses} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'cafea' })[0]);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('highlights and selects through a link that names a piece of a token', async () => {
    const pieceGlosses: GlossRow[] = [
      {
        language: 'en',
        kind: 'natural',
        units: [
          { text: "don't", link: { token: 1, piece: 0 } },
          { text: 'want', link: { token: 1, piece: 1 } },
        ],
      },
    ];
    const onSelect = vi.fn();
    render(<GlossGrid glosses={pieceGlosses} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: "don't" })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'want' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('shows units with no Greek counterpart as dashed, non-interactive text', () => {
    render(<GlossGrid glosses={glosses} selected={0} onSelect={() => {}} />);
    expect(screen.queryByRole('button', { name: '(I)' })).not.toBeInTheDocument();
    expect(screen.getByText('(I)')).toHaveClass('gloss-unit', 'is-gap');
  });
});
```

- [ ] **Step 10: Run to verify they fail**

Run: `npx vitest run src/components`
Expected: FAIL (modules not found).

- [ ] **Step 11: Write the components**

`src/components/LevelToggle.tsx`:

```tsx
import type { Level } from '../types';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'improver', label: 'Improver' },
];

export function LevelToggle({ value, onChange }: { value: Level; onChange: (level: Level) => void }) {
  return (
    <fieldset className="level-toggle">
      <legend className="sr-only">Level</legend>
      {LEVELS.map((l) => (
        <label key={l.value}>
          <input
            type="radio"
            name="level"
            value={l.value}
            checked={value === l.value}
            onChange={() => onChange(l.value)}
          />
          {l.label}
        </label>
      ))}
    </fieldset>
  );
}
```

`src/components/PhraseBar.tsx`:

```tsx
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  selected: number;
  onSelect: (index: number) => void;
}

export function PhraseBar({ tokens, selected, onSelect }: Props) {
  return (
    <div role="group" aria-label="Greek phrase" lang="el" className="phrase-bar">
      {tokens.map((token, i) => (
        <button
          key={i}
          type="button"
          className="chip"
          aria-pressed={i === selected}
          onClick={() => onSelect(i)}
        >
          {token.text}
        </button>
      ))}
    </div>
  );
}
```

`src/components/GlossGrid.tsx`:

```tsx
import { linkedToken } from '../glossLinks';
import type { GlossRow, Link } from '../types';

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
              {row.units.map((unit, j) =>
                unit.link === null ? (
                  <span key={j} className="gloss-unit is-gap">
                    {unit.text}
                  </span>
                ) : (
                  <button
                    key={j}
                    type="button"
                    className="gloss-unit"
                    aria-pressed={linkedToken(unit.link) === selected}
                    onClick={() => onSelect(linkedToken(unit.link as Link))}
                  >
                    {unit.text}
                  </button>
                ),
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 12: Run to verify they pass**

Run: `npx vitest run src && npm run typecheck`
Expected: PASS for all tests; no type errors.

- [ ] **Step 13: Commit**

```bash
git add src
git commit -m "feat: add labels, level storage, level toggle, phrase bar and gloss grid" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Panels (pure logic), form table and word panel

**Files:**
- Create: `src/panels/panels.ts`, `src/components/RichText.tsx`, `src/components/FormTable.tsx`, `src/components/WordPanel.tsx`
- Test: `src/panels/panels.test.ts`, `src/components/WordPanel.test.tsx`

**Interfaces:**
- Consumes: `getLexeme`, `LEXEMES`, `nounPhrase`, `inflect`, `inflectAdjective`, `inflectNumeral`, rich-text helpers, `roVerb`, `roNumeral`, `enVerb`, labels (Task 6), `PHRASES[0]` (Task 5).
- Produces:
  - `interface Control { key: 'who' | 'number' | 'case'; label: string; options: Option[]; value: string }`
  - `interface PanelRow { label: string; el: Rich; ro: Rich; en: Rich }`
  - `interface Panel { lemma: string; posLabel: string; controls: Control[]; rows: PanelRow[]; plain: string; note: string }`
  - `buildPanel(slot: Slot, token: Token, phrase: Phrase, level: Level): Panel`
  - `applyControl(slot: Slot, key: string, value: string): Slot`
  - `RichText({ rich })`, `FormTable({ rows })`, `WordPanel({ panel, onChange })` where `onChange(key: string, value: string)`.
- Control labels (exact): verb `Who?`; number `How many?`; case `Role in sentence`.

- [ ] **Step 1: Write the failing test `src/panels/panels.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import { applyControl, buildPanel } from './panels';

const phrase = PHRASES[0];
const panelFor = (index: number, level: 'beginner' | 'improver' = 'beginner', slot = phrase.tokens[index].slot) =>
  buildPanel(slot, phrase.tokens[index], phrase, level);
const text = (rows: ReturnType<typeof panelFor>['rows'], i: number) => ({
  el: richText(rows[i].el),
  ro: richText(rows[i].ro),
  en: richText(rows[i].en),
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
    const p = panelFor(0, 'beginner', applyControl(phrase.tokens[0].slot, 'who', '3sg'));
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) θέλει', ro: '(el/ea) vrea', en: 'he/she wants' });
  });
  it('uses the technical label for Improver', () => {
    expect(panelFor(0, 'improver').posLabel).toBe('verb · -ω class · active');
  });
});

describe('noun panel (καφές)', () => {
  it('shows the definite and indefinite phrases in three languages', () => {
    const panel = panelFor(3);
    expect(panel.lemma).toBe('καφές');
    expect(panel.posLabel).toBe('noun: coffee (masculine)');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον καφέ', ro: 'cafeaua', en: 'the coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.note).toContain('feminine in Romanian');
  });
  it('shows no plural a / an', () => {
    const slot = applyControl(phrase.tokens[3].slot, 'number', 'pl');
    const panel = panelFor(3, 'beginner', slot);
    expect(text(panel.rows, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(panel.rows[1].label).toBe('a / an');
    expect(richText(panel.rows[1].el)).toBe('none in plural');
    expect(panel.rows[1].el[0].role).toBe('dim');
  });
  it('describes the Improver label with the Romanian gender', () => {
    expect(panelFor(3, 'improver').posLabel).toBe('noun · masculine · Romanian: cafea (feminine)');
  });
});

describe('adjective panel (ζεστός)', () => {
  it('lists the lemma in three genders and builds noun phrases with the noun it agrees with', () => {
    const panel = panelFor(2);
    expect(panel.lemma).toBe('ζεστός / ζεστή / ζεστό');
    expect(panel.posLabel).toBe('adjective: hot');
    expect(text(panel.rows, 0)).toEqual({ el: 'τον ζεστό καφέ', ro: 'cafeaua caldă', en: 'the hot coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν ζεστό καφέ', ro: 'o cafea caldă', en: 'a hot coffee' });
  });
  it('follows the genitive', () => {
    const panel = panelFor(2, 'beginner', applyControl(phrase.tokens[2].slot, 'case', 'gen'));
    expect(text(panel.rows, 0)).toEqual({ el: 'του ζεστού καφέ', ro: 'cafelei calde', en: 'of the hot coffee' });
  });
  it('has number and case controls only (gender comes from the noun)', () => {
    expect(panelFor(2).controls.map((c) => c.key)).toEqual(['number', 'case']);
  });
});

describe('numeral panel (ένας)', () => {
  it('shows the numeral and the counted noun phrase', () => {
    const panel = panelFor(1);
    expect(panel.lemma).toBe('ένας / μία / ένα');
    expect(panel.posLabel).toBe('article: a / an');
    expect(panel.rows.map((r) => r.label)).toEqual(['number', 'counting']);
    expect(text(panel.rows, 0)).toEqual({ el: 'έναν', ro: 'o', en: 'a / an (one)' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
  });
  it('has a case control only', () => {
    expect(panelFor(1).controls.map((c) => c.key)).toEqual(['case']);
  });
});

describe('applyControl', () => {
  it('sets person and number from a who value', () => {
    expect(applyControl(phrase.tokens[0].slot, 'who', '2pl')).toMatchObject({ person: 2, number: 'pl' });
  });
  it('sets the case', () => {
    expect(applyControl(phrase.tokens[3].slot, 'case', 'gen')).toMatchObject({ pos: 'noun', case: 'gen' });
  });
  it('ignores a control that does not apply', () => {
    const slot = phrase.tokens[1].slot;
    expect(applyControl(slot, 'number', 'pl')).toBe(slot);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/panels`
Expected: FAIL (module `./panels` not found).

- [ ] **Step 3: Write `src/panels/panels.ts`**

```ts
import { getLexeme } from '../data/lexemes';
import { nounPhrase, type NounPhrase } from '../engine/agree';
import { enVerb } from '../engine/english';
import { inflectAdjective, inflectNumeral, inflectVerb } from '../engine/greek';
import {
  EN_PRONOUNS,
  GENDER_NAME,
  GREEK_PRONOUNS,
  RO_PRONOUNS,
  caseOptions,
  numberOptions,
  whoOptions,
  type Option,
} from '../engine/labels';
import { roNumeral, roVerb } from '../engine/romanian';
import { dim, formRich, numeralRich, plain, richText, type Rich } from '../engine/segments';
import type {
  Case,
  Gender,
  GreekAdjective,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
  Level,
  Num,
  Person,
  Phrase,
  Slot,
  SlotOf,
  Token,
} from '../types';

export interface Control {
  key: 'who' | 'number' | 'case';
  label: string;
  options: Option[];
  value: string;
}

export interface PanelRow {
  label: string;
  el: Rich;
  ro: Rich;
  en: Rich;
}

export interface Panel {
  lemma: string;
  posLabel: string;
  controls: Control[];
  rows: PanelRow[];
  plain: string;
  note: string;
}

const GENDERS: Gender[] = ['m', 'f', 'n'];

function nounFor(token: Token, phrase: Phrase): GreekNoun {
  if (token.agreesWith === undefined) throw new Error(`token ${token.text} has no agreesWith`);
  const lexeme = getLexeme(phrase.tokens[token.agreesWith].lexeme);
  if (lexeme.pos !== 'noun') throw new Error(`token ${token.text} must agree with a noun`);
  return lexeme;
}

const npRow = (label: string, np: NounPhrase): PanelRow => ({
  label,
  el: np.el,
  ro: plain(np.ro),
  en: plain(np.en),
});

const noPluralArticleRow = (): PanelRow => ({
  label: 'a / an',
  el: dim('none in plural'),
  ro: dim('none in plural'),
  en: dim('none in plural'),
});

const caseControl = (slot: { case: Case }, level: Level): Control => ({
  key: 'case',
  label: 'Role in sentence',
  options: caseOptions(level),
  value: slot.case,
});

const numberControl = (slot: { number: Num }): Control => ({
  key: 'number',
  label: 'How many?',
  options: numberOptions,
  value: slot.number,
});

function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  const index = slot.person - 1 + (slot.number === 'pl' ? 3 : 0);
  return {
    lemma: verb.lemma,
    posLabel: level === 'beginner' ? `verb: to ${verb.en.gloss}` : 'verb · -ω class · active',
    controls: [
      { key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` },
    ],
    rows: [
      {
        label: whoOptions[index].label,
        el: [{ text: `(${GREEK_PRONOUNS[index]}) `, role: 'dim' }, ...formRich(inflectVerb(verb, slot))],
        ro: [
          { text: `(${RO_PRONOUNS[index]}) `, role: 'dim' },
          { text: roVerb(verb, slot), role: 'plain' },
        ],
        en: [
          { text: `${EN_PRONOUNS[index]} `, role: 'pronoun' },
          { text: enVerb(verb, slot), role: 'plain' },
        ],
      },
    ],
    plain:
      'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
    note: '',
  };
}

function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level): Panel {
  const the = nounPhrase(noun, slot.number, slot.case, { article: 'definite' });
  return {
    lemma: noun.lemma,
    posLabel:
      level === 'beginner'
        ? `noun: ${noun.en.sg} (${GENDER_NAME[noun.gender]})`
        : `noun · ${GENDER_NAME[noun.gender]} · Romanian: ${noun.ro.lemma} (${GENDER_NAME[noun.ro.gender]})`,
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [
      npRow('the', the),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one' }))
        : noPluralArticleRow(),
    ],
    plain: 'The article agrees with the noun in gender, number and role.',
    note: noun.note,
  };
}

function adjectivePanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun, level: Level): Panel {
  const lemma = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  ).join(' / ');
  return {
    lemma,
    posLabel: level === 'beginner' ? `adjective: ${adj.en}` : 'adjective · 3-ending (stressed)',
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [
      npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite', adjective: adj })),
      slot.number === 'sg'
        ? npRow('a / an', nounPhrase(noun, 'sg', slot.case, { article: 'one', adjective: adj }))
        : noPluralArticleRow(),
    ],
    plain:
      'The Greek adjective copies gender, number and role from the noun. Romanian copies gender and number and goes after the noun. English never changes.',
    note: noun.note,
  };
}

function numeralPanel(numeral: GreekNumeral, slot: SlotOf<'numeral'>, noun: GreekNoun, level: Level): Panel {
  const lemma = GENDERS.map((gender) =>
    richText(numeralRich(inflectNumeral(numeral, { pos: 'numeral', value: 1, gender, case: 'nom' }))),
  ).join(' / ');
  const form = inflectNumeral(numeral, { pos: 'numeral', value: 1, gender: noun.gender, case: slot.case });
  return {
    lemma,
    posLabel: level === 'beginner' ? 'article: a / an' : 'numeral · doubles as the indefinite article',
    controls: [caseControl(slot, level)],
    rows: [
      {
        label: 'number',
        el: numeralRich(form),
        ro: plain(roNumeral(numeral, noun.ro.gender, slot.case)),
        en: plain('a / an (one)'),
      },
      npRow('counting', nounPhrase(noun, 'sg', slot.case, { article: 'one' })),
    ],
    plain:
      'The numeral agrees with the noun it counts. Romanian changes by gender too (un / o); English never changes.',
    note: noun.note,
  };
}

function articlePanel(slot: SlotOf<'article'>, noun: GreekNoun, level: Level): Panel {
  return {
    lemma: 'ο / η / το',
    posLabel: level === 'beginner' ? 'article: the' : 'definite article · 3 genders × 3 cases × 2 numbers',
    controls: [numberControl(slot), caseControl(slot, level)],
    rows: [npRow('article + noun', nounPhrase(noun, slot.number, slot.case, { article: 'definite' }))],
    plain:
      'Greek puts the article before the noun and changes it with gender, number and role. Romanian attaches it to the end of the noun. English has one word, "the".',
    note: noun.note,
  };
}

export function buildPanel(slot: Slot, token: Token, phrase: Phrase, level: Level): Panel {
  const lexeme = getLexeme(token.lexeme);
  if (lexeme.pos !== slot.pos) throw new Error(`slot ${slot.pos} does not fit lexeme ${lexeme.id}`);
  switch (slot.pos) {
    case 'verb':
      return verbPanel(lexeme as GreekVerb, slot, level);
    case 'noun':
      return nounPanel(lexeme as GreekNoun, slot, level);
    case 'adjective':
      return adjectivePanel(lexeme as GreekAdjective, slot, nounFor(token, phrase), level);
    case 'numeral':
      return numeralPanel(lexeme as GreekNumeral, slot, nounFor(token, phrase), level);
    case 'article':
      return articlePanel(slot, nounFor(token, phrase), level);
  }
}

/** Returns a new slot with one control applied; a control that does not apply returns the same slot. */
export function applyControl(slot: Slot, key: string, value: string): Slot {
  if (key === 'who' && slot.pos === 'verb') {
    return { ...slot, person: Number(value[0]) as Person, number: value.slice(1) as Num };
  }
  if (key === 'case' && slot.pos !== 'verb') {
    return { ...slot, case: value as Case };
  }
  if (key === 'number' && (slot.pos === 'noun' || slot.pos === 'adjective' || slot.pos === 'article')) {
    return { ...slot, number: value as Num };
  }
  return slot;
}
```

- [ ] **Step 4: Run to verify the panel tests pass**

Run: `npx vitest run src/panels && npm run typecheck`
Expected: PASS; no type errors.

- [ ] **Step 5: Write the failing component test `src/components/WordPanel.test.tsx`**

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { buildPanel } from '../panels/panels';
import { WordPanel } from './WordPanel';

const phrase = PHRASES[0];
const panelFor = (i: number) => buildPanel(phrase.tokens[i].slot, phrase.tokens[i], phrase, 'beginner');

describe('WordPanel', () => {
  it('renders the lemma, part-of-speech label and a labelled control', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'καφές' })).toBeInTheDocument();
    expect(screen.getByText('noun: coffee (masculine)')).toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
    expect(screen.getByLabelText('How many?')).toHaveValue('sg');
  });

  it('renders the three-language form table', () => {
    render(<WordPanel panel={panelFor(2)} onChange={() => {}} />);
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Ελληνικά' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Română' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'English' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'cafeaua caldă' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'the hot coffee' })).toBeInTheDocument();
  });

  it('reports a control change with its key and value', async () => {
    const onChange = vi.fn();
    render(<WordPanel panel={panelFor(3)} onChange={onChange} />);
    await userEvent.setup().selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(onChange).toHaveBeenCalledWith('case', 'gen');
  });

  it('marks roles with classes so colours can be styled and labelled', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    const cell = screen.getByRole('cell', { name: 'τον καφέ' });
    expect(cell.querySelector('.role-article')).toHaveTextContent('τον');
    expect(cell.querySelector('.role-ending')).toHaveTextContent('έ');
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/components/WordPanel.test.tsx`
Expected: FAIL (module `./WordPanel` not found).

- [ ] **Step 7: Write the components**

`src/components/RichText.tsx`:

```tsx
import type { Rich } from '../engine/segments';

export function RichText({ rich }: { rich: Rich }) {
  return (
    <>
      {rich.map((segment, i) => (
        <span key={i} className={`role-${segment.role}`}>
          {segment.text}
        </span>
      ))}
    </>
  );
}
```

`src/components/FormTable.tsx`:

```tsx
import type { PanelRow } from '../panels/panels';
import { RichText } from './RichText';

export function FormTable({ rows }: { rows: PanelRow[] }) {
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
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td lang="el">
              <RichText rich={row.el} />
            </td>
            <td lang="ro">
              <RichText rich={row.ro} />
            </td>
            <td lang="en">
              <RichText rich={row.en} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`src/components/WordPanel.tsx`:

```tsx
import type { Panel } from '../panels/panels';
import { FormTable } from './FormTable';

interface Props {
  panel: Panel;
  onChange: (key: string, value: string) => void;
}

export function WordPanel({ panel, onChange }: Props) {
  return (
    <section className="card word-panel" aria-label="Word panel">
      <h2 lang="el">{panel.lemma}</h2>
      <p className="pos-label">{panel.posLabel}</p>
      <div className="controls">
        {panel.controls.map((control) => {
          const id = `control-${control.key}`;
          return (
            <div className="control" key={control.key}>
              <label htmlFor={id}>{control.label}</label>
              <select id={id} value={control.value} onChange={(e) => onChange(control.key, e.target.value)}>
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <FormTable rows={panel.rows} />
      <p className="legend">
        <span className="role-article">blue</span> article, numeral or English pronoun ·{' '}
        <span className="role-ending">amber</span> ending · <span className="role-dim">dashed</span> optional or dropped
      </p>
      <p className="plain">{panel.plain}</p>
      {panel.note && <p className="note">Gender and form: {panel.note}</p>}
    </section>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src && npm run typecheck`
Expected: PASS for all tests; no type errors.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: add panel builder, form table and word panel" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Comparison table, App wiring, styles and end-to-end check

**Files:**
- Create: `src/components/ComparisonTable.tsx`
- Modify: `src/App.tsx`, `src/styles.css`
- Test: `src/components/ComparisonTable.test.tsx`, `src/App.test.tsx`

**Interfaces:**
- Consumes: everything above. `DIVERGENCES`, `Divergence`, `Level`, `Pos`.
- Produces: `ComparisonTable({ rows, word })` with `rows: Divergence[]`; `selectDivergences(all: Divergence[], pos: Pos, lexemeId: string, level: Level): Divergence[]` exported from `ComparisonTable.tsx`; the full `App`.

- [ ] **Step 1: Write the failing test `src/components/ComparisonTable.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { ComparisonTable, selectDivergences } from './ComparisonTable';

describe('selectDivergences', () => {
  it('selects rows for the part of speech', () => {
    const ids = selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'improver').map((d) => d.id);
    expect(ids).toEqual(['adjective-position', 'adjective-agreement', 'adjective-with-the']);
  });
  it('hides extra rows for Beginner', () => {
    const ids = selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'beginner').map((d) => d.id);
    expect(ids).toEqual(['adjective-position', 'adjective-agreement']);
  });
  it('includes lexeme-specific rows only for that lexeme', () => {
    expect(selectDivergences(DIVERGENCES, 'verb', 'thelo', 'beginner').map((d) => d.id)).toEqual([
      'verb-subject',
      'thelo-politeness',
    ]);
    expect(selectDivergences(DIVERGENCES, 'verb', 'other', 'beginner').map((d) => d.id)).toEqual(['verb-subject']);
  });
});

describe('ComparisonTable', () => {
  it('renders one row per divergence with three language columns', () => {
    const rows = selectDivergences(DIVERGENCES, 'verb', 'thelo', 'beginner');
    render(<ComparisonTable rows={rows} word="Θέλω" />);
    expect(screen.getByText(/Compare:/)).toHaveTextContent('Compare: Θέλω');
    expect(screen.getAllByRole('cell', { name: 'dropped: the ending shows the person' })).toHaveLength(2);
    expect(screen.getAllByText('differs')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/ComparisonTable.test.tsx`
Expected: FAIL (module `./ComparisonTable` not found).

- [ ] **Step 3: Write `src/components/ComparisonTable.tsx`**

```tsx
import type { Divergence, Level, Pos } from '../types';

export function selectDivergences(all: Divergence[], pos: Pos, lexemeId: string, level: Level): Divergence[] {
  return all.filter(
    (d) =>
      d.appliesTo.pos === pos &&
      (d.appliesTo.lexeme === undefined || d.appliesTo.lexeme === lexemeId) &&
      (level === 'improver' || d.level === 'core'),
  );
}

export function ComparisonTable({ rows, word }: { rows: Divergence[]; word: string }) {
  return (
    <section className="card" aria-label="Comparison">
      <p className="compare-title">
        Compare: <span lang="el">{word}</span>
      </p>
      <table className="form-table">
        <thead>
          <tr>
            <th scope="col">Point</th>
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
          {rows.map((d) => (
            <tr key={d.id}>
              <th scope="row">
                {d.point} <span className={`tag tag-${d.tag}`}>{d.tag}</span>
              </th>
              <td lang="el">{d.el}</td>
              <td lang="ro">{d.ro}</td>
              <td lang="en">{d.en}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/ComparisonTable.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write the failing integration test `src/App.test.tsx`**

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('App', () => {
  it('opens on the first word of phrase 1 with its panel', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Greek Grammar Explorer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'θέλω' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(εγώ) θέλω' })).toBeInTheDocument();
  });

  it('shows the adjective panel after clicking the Greek word', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ζεστός / ζεστή / ζεστό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
  });

  it('changing the role updates the forms in all three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByRole('cell', { name: 'του ζεστού καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'cafelei calde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'of the hot coffee' })).toBeInTheDocument();
  });

  it('leaves the phrase unchanged, flags the difference, and resets on request', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ζεστό' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'hot' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
    expect(screen.getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
  });

  it('clicking a gloss unit selects the linked Greek word', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'cafea' })[0]);
    expect(screen.getByRole('heading', { level: 2, name: 'καφές' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'καφέ' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps each word’s own choices when switching between words', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    await user.selectOptions(screen.getByLabelText('How many?'), 'pl');
    await user.click(screen.getByRole('button', { name: 'Θέλω' }));
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.getByLabelText('How many?')).toHaveValue('pl');
  });

  it('switches to technical labels in Improver and remembers the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.getByRole('option', { name: 'object' })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Improver'));
    expect(screen.getByRole('option', { name: 'accusative' })).toBeInTheDocument();
    unmount();
    render(<App />);
    expect(screen.getByLabelText('Improver')).toBeChecked();
  });

  it('shows comparison rows for the selected word and more of them in Improver', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    const comparison = screen.getByRole('region', { name: 'Comparison' });
    expect(within(comparison).getAllByRole('row')).toHaveLength(3);
    await user.click(screen.getByLabelText('Improver'));
    expect(within(screen.getByRole('region', { name: 'Comparison' })).getAllByRole('row')).toHaveLength(4);
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (the placeholder App has no phrase bar).

- [ ] **Step 7: Write `src/App.tsx`**

```tsx
import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { LevelToggle } from './components/LevelToggle';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { PHRASES } from './data/phrases';
import { applyControl, buildPanel } from './panels/panels';
import { readLevel, writeLevel } from './storage';
import type { Level, Slot } from './types';

export function App() {
  const phrase = PHRASES[0];
  const [slots, setSlots] = useState<Slot[]>(() => phrase.tokens.map((t) => t.slot));
  const [selected, setSelected] = useState(0);
  const [level, setLevel] = useState<Level>(readLevel);

  const token = phrase.tokens[selected];
  const panel = buildPanel(slots[selected], token, phrase, level);
  const divergences = selectDivergences(DIVERGENCES, slots[selected].pos, token.lexeme, level);
  const differsFromPhrase = JSON.stringify(slots[selected]) !== JSON.stringify(token.slot);

  function changeLevel(next: Level) {
    setLevel(next);
    writeLevel(next);
  }

  function changeControl(key: string, value: string) {
    setSlots((current) => current.map((slot, i) => (i === selected ? applyControl(slot, key, value) : slot)));
  }

  function resetToPhrase() {
    setSlots((current) => current.map((slot, i) => (i === selected ? token.slot : slot)));
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

- [ ] **Step 8: Replace `src/styles.css`**

```css
:root {
  --bg: #fafaf8;
  --surface: #ffffff;
  --text: #1a1a18;
  --muted: #5f5e5a;
  --border: #d3d1c7;
  --accent-bg: #e6f1fb;
  --accent-text: #0c447c;
  --accent-border: #85b7eb;
  --warn-bg: #faeeda;
  --warn-text: #633806;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a18;
    --surface: #242422;
    --text: #f1efe8;
    --muted: #b4b2a9;
    --border: #444441;
    --accent-bg: #0c447c;
    --accent-text: #b5d4f4;
    --accent-border: #378add;
    --warn-bg: #633806;
    --warn-text: #fac775;
  }
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; line-height: 1.5; }
.app { max-width: 760px; margin: 0 auto; padding: 16px; }
.app-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
h1 { font-size: 20px; font-weight: 500; margin: 0; }
h2 { font-size: 20px; font-weight: 500; margin: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.card { background: var(--surface); border: 0.5px solid var(--border); border-radius: 12px; padding: 16px; margin-top: 12px; }

.level-toggle { border: 0; padding: 0; margin: 0; display: flex; gap: 12px; }
.level-toggle label { font-size: 14px; display: flex; gap: 4px; align-items: center; }

.phrase-bar { display: flex; flex-wrap: wrap; gap: 6px; }
.chip, .gloss-unit { font: inherit; color: var(--text); background: var(--surface); border: 0.5px solid var(--border); border-radius: 8px; cursor: pointer; }
.chip { font-size: 20px; padding: 6px 12px; }
.chip[aria-pressed='true'], .gloss-unit[aria-pressed='true'] { background: var(--accent-bg); color: var(--accent-text); border-color: var(--accent-border); }
.chip:focus-visible, .gloss-unit:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--accent-border); outline-offset: 2px; }

.gloss-grid { margin-top: 12px; display: grid; gap: 4px; }
.gloss-row { display: grid; grid-template-columns: 64px 56px minmax(0, 1fr); gap: 8px; align-items: start; }
.gloss-language { font-size: 13px; font-weight: 500; }
.gloss-kind { font-size: 12px; color: var(--muted); padding-top: 3px; }
.gloss-unit { font-size: 14px; padding: 2px 10px; margin: 0 4px 4px 0; display: inline-block; }
.gloss-unit.is-gap { border-style: dashed; color: var(--muted); cursor: default; background: transparent; }

.pos-label { color: var(--muted); font-size: 13px; margin: 2px 0 8px; }
.controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
.control label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 2px; }
.control select { font: inherit; font-size: 14px; height: 32px; background: var(--surface); color: var(--text); border: 0.5px solid var(--border); border-radius: 8px; }

.form-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 14px; }
.form-table th, .form-table td { padding: 6px 8px; text-align: left; vertical-align: top; border-top: 0.5px solid var(--border); overflow-wrap: anywhere; }
.form-table thead th { font-size: 12px; font-weight: 500; color: var(--muted); border-top: 0; }
.form-table tbody th { font-size: 12px; font-weight: 400; color: var(--muted); }
.form-table td[lang='el'] { font-size: 16px; }

.role-article, .role-pronoun { background: var(--accent-bg); color: var(--accent-text); border-radius: 4px; padding: 0 3px; }
.role-ending { background: var(--warn-bg); color: var(--warn-text); border-radius: 4px; padding: 0 3px; }
.role-dim { color: var(--muted); border-bottom: 1px dashed var(--muted); }

.phrase-status { margin-top: 12px; font-size: 13px; color: var(--muted); display: flex; gap: 8px; align-items: center; }
.phrase-status button { font: inherit; font-size: 13px; background: var(--surface); color: var(--text); border: 0.5px solid var(--border); border-radius: 8px; padding: 2px 10px; cursor: pointer; }
.tag { font-size: 11px; padding: 0 8px; border-radius: 99px; background: var(--warn-bg); color: var(--warn-text); }
.legend, .plain, .note, .compare-title { font-size: 13px; color: var(--muted); margin: 8px 0 0; }

@media (max-width: 480px) {
  .gloss-row { grid-template-columns: 56px minmax(0, 1fr); }
  .gloss-kind { grid-column: 2; padding-top: 0; }
  .gloss-units { grid-column: 1 / -1; }
}
```

- [ ] **Step 9: Run the full suite, typecheck, validate and build**

Run: `npx vitest run && npm run typecheck && npm run validate && npm run build`
Expected: all tests PASS; no type errors; `Data is valid.`; build completes with a `dist/` folder.

- [ ] **Step 10: Check the app in a browser**

Run: `npm run dev` and open the printed local URL (use the Browser pane or any browser).

Check by hand and confirm each item:
1. The page shows four Greek chips and four gloss rows; Θέλω is selected.
2. Click **ζεστό**: the panel heading reads `ζεστός / ζεστή / ζεστό`; the "the" row reads `τον ζεστό καφέ / cafeaua caldă / the hot coffee`.
3. Change "Role in sentence" to **possessor**: the row reads `του ζεστού καφέ / cafelei calde / of the hot coffee`.
4. Click the gloss unit **cafea**: the noun panel opens and the chip **καφέ** is selected.
5. Change a role on any word: the chips and gloss rows do not change, "Differs from the phrase." appears with a "Reset to phrase" button, and the button restores the phrase's form.
6. Switch to **Improver**: the options read nominative, accusative, genitive; more comparison rows appear.
7. Resize to phone width (about 375 px): there is no horizontal page scroll.
8. Switch the OS colour scheme to dark: text stays readable.
9. Tab through the page: every chip, gloss unit, select and radio is reachable and shows a focus ring.

Report anything that fails instead of editing around it.

- [ ] **Step 11: Commit**

```bash
git add src
git commit -m "feat: add comparison table, wire up the app and style it" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage (against the scope set in "Scope boundaries for Plan 1")**

| Spec requirement in Plan 1's slice | Task |
|---|---|
| Vite + React + TS app, strict, no backend (2, 4.1) | 1 |
| Core types, slots, form split into stem and ending (4.2) | 1 |
| Hybrid engine: stems plus shared ending tables (4.3) | 1, 2, 3 |
| Romanian and English forms stored per slot (4.3) | 1 (data), 4 (accessors) |
| Phrases, tokens, `agreesWith` (4.4) | 1, 5 |
| Natural and literal glosses together, with dashed placeholders (4.5) | 5, 6 |
| Phrase bar, gloss grid, word panel, comparison table (5, 5.1, 5.2) | 6, 7, 8 |
| Controls per part of speech: verb, noun, article, numeral, adjective (5.3) | 7 |
| Plural "a / an" shown as empty, not hidden (5.3) | 7 |
| Beginner and Improver: labels, divergence depth, persisted choice (3) | 6, 8 |
| Gloss links to a token or to a piece of one; authored glosses; `theme` on phrases (4.4, 4.5) | 1, 5, 6 |
| The phrase is fixed; the panel works on a copy with Reset (4.4) | 8 |
| Divergence rows carry a type tag and a core/extra level (5.2) | 1, 5, 8 |
| Divergence rows with core/extra levels (5.2) | 5, 8 |
| Build-time validation and unverified report (7) | 5 |
| Unit, component and integration tests (8) | all tasks |
| Phone width, light and dark, keyboard, colour not the only signal (8) | 6, 8 |

Not in Plan 1 by design (listed in the roadmap and in the scope boundaries): full paradigm tables, per-column highlighting, segments in glosses, all other parts of speech, tenses and moods, `compose()`, verb groups and piece-level highlighting, the `pending` marker, readings, form groups, phrases 2 to 39, content review.

**Placeholder scan:** no `TBD`, `TODO` or "similar to" references remain. Every code step contains the full code.

**Type consistency:** `inflect*` signatures in Task 1 to 3 match their use in `agree.ts` (Task 4), `panels.ts` (Task 7) and `validate.ts` (Task 5). `Panel`, `PanelRow`, `Control` are defined in Task 7 and used unchanged in `WordPanel` and `App`. `Option` is defined in `labels.ts` (Task 6) and imported in `panels.ts`. `selectDivergences` argument order `(all, pos, lexemeId, level)` is the same in its test and in `App`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-03-plan-1-foundation-and-first-slice.md`.
