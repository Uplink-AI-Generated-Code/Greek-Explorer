# The Weak Possessive Implementation Plan (Plan 10)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the weak possessive (το σπίτι μου, ο σκύλος σου, η θάλασσά μας): a possessive part of speech and panel, a Whose? control on the noun panel, the Romanian possessive table and the English possessives, the second accent, four comparison notes and phrases 63 to 68. The emphatic δικός μου and the possessor noun are Plan 11.

**Architecture:** The Greek possessive is the genitive weak pronoun we already store (μου, σου, του, της, μας, σας, τους), placed after the noun. A new lexeme `possessive` with the slot `{ pos: 'possessive', person, number, gender? }` (the possessor) is a token of its own that points at its noun with `agreesWith`. `nounPhrase` takes an optional `possessor` and builds the Greek noun with its second accent (`possessedNounForm`, using the stress rule of commands), the Romanian noun + possessive (a stored table by possessor, agreeing with the possessed noun) and the English possessive before the noun. The possessive has its own panel (Whose?, noun, number, role), the noun panel gets a Whose? control, and the validator compares a noun's text with the accented form when a possessive follows it.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 4.4, 5.2, 5.3, 6.1, 6.6, 7, 9 and 24; the repository is at commit 125ba72 or later when this plan starts).

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

1. **The Greek form is the existing clitic table.** `greekPossessive(slot)` is `greekClitic` for the indirect (genitive) role, so μου, σου … are not stored twice. The Romanian and English tables are new (`src/data/possessives.ts`).
2. **The third person.** The slot's `gender` is required for the third person singular (του his, της her; Romanian *lui*, *ei*; English his, her, its). The panel offers seven possessors (no neuter "its"); the table also has a `3sg.n` entry (*lui*, *its*) for a token that needs it. The formal Romanian *său* is not stored; it is a content-review question.
3. **Romanian agreement.** The possessive agrees with the Romanian gender and number of the possessed noun: a neuter noun follows the masculine in the singular and the feminine in the plural (*drumul meu*, *drumurile mele*). The genitive-dative singular of a feminine noun uses the plural form (*casei mele*).
4. **δρόμος is neuter in Romanian.** The data from Plan 9 said masculine, which would give *drumurile mei*; it becomes neuter (*un drum, două drumuri*) in Task 1.
5. **The second accent lives in one function.** `possessedNounForm(noun, number, case, possessor)` in `src/engine/agree.ts` applies the stress rule of commands (`secondAccent`) to the noun and the pronoun together; `nounPhrase` and the validator both use it. The noun token in a phrase carries the accent (θάλασσά).
6. **The possessive panel needs the role of its noun.** A possessive's own slot holds only the possessor, so `PanelState` gains `nounCase`. The noun panel's Whose? control is `PanelState.possessor` (absent means nobody); a noun that a possessive points at starts with that possessor.
7. **Delivery.** With this plan the picker lists 68 phrases (63 to 68, theme *Possession*). Phrases 69 to 72 arrive with Plan 11.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `GreekPossessive`; `Slot` `possessive`; `GreekLexeme` |
| `src/data/possessives.ts` (new) | the Romanian and English possessive tables |
| `src/data/{lexemes,review,phrases,divergences}.ts` | the lexeme `possessive`; δρόμος neuter in Romanian; a review item; phrases 63 to 68; four comparison rows |
| `src/engine/possessive.ts` (new) | `possessorKey`, `greekPossessive`, `roPossessive`, `enPossessive`, `POSSESSORS`, `possessorValue` |
| `src/engine/{agree,compose,greek}.ts` | `nounPhrase` with a possessor, `possessedNounForm`; `accentForm` exported; `inflectPossessive` |
| `src/panels/{possessive,noun,panels,types}.ts` | the possessive panel; Whose? in the noun panel; the state, `initialState` and `applyControl` for both |
| `src/validate/{validate,reviewSheet}.ts` | possessive lexeme and token rules; the review sheet section |
| tests | one new test file per task, plus the expectations the new control changes |

---

### Task 1: The possessive in the engine and its own panel

**Files:**
- Create: `src/data/possessives.ts`
- Create: `src/engine/possessive.ts`
- Create: `src/panels/possessive.ts`
- Create (test): `src/engine/possessive.test.ts`
- Create (test): `src/panels/possessive.test.ts`
- Create (test): `src/validate/possessive-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/review.ts`
- Modify: `src/engine/agree.ts`
- Modify: `src/engine/compose.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/types.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `nounPhrase`, `greekClitic`, `secondAccent` and `accentAt` (the stress rule of commands), `GreekLexeme`, `buildPanel`, `applyControl`, `initialState`, `validate` and `slotsFor`.
- Produces: `Slot` `possessive` and `GreekPossessive`; the lexeme `possessive`; `src/data/possessives.ts` (`RO_POSSESSIVES`, `EN_POSSESSIVES`); `src/engine/possessive.ts` (`possessorKey`, `greekPossessive`, `roPossessive`, `enPossessive`, `POSSESSORS`, `possessorValue`); `nounPhrase(noun, number, case, { article: 'definite', possessor })`; `accentForm` exported from `compose.ts`; `possessivePanel`; `PanelState.nounCase`; the control key `possessor`; δρόμος neuter in Romanian; the review item `ending-table:ro-possessives`; the validator's possessive lexeme checks.

This task builds everything about the possessive that needs no phrase: the forms, the second accent (η θάλασσά μου), the three-language noun phrase and the possessive's own panel. A possessive token in a phrase and its noun's accent check come in Task 3.

- [ ] **Step 1: Write the tests**

Create `src/engine/possessive.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import { RO_POSSESSIVES } from '../data/possessives';
import type { Case, Num, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { enPossessive, greekPossessive, POSSESSORS, possessorKey, possessorValue, roPossessive } from './possessive';
import { richText } from './segments';

const of = (value: string): SlotOf<'possessive'> => POSSESSORS.find((p) => p.value === value)!.slot;
const phrase = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = nounPhrase(getNoun(noun), number, c, { article: 'definite', possessor: of(who) });
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('the possessors', () => {
  it('Greek is the weak genitive pronoun, English the possessive adjective', () => {
    expect(POSSESSORS.map((p) => greekPossessive(p.slot))).toEqual(['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους']);
    expect(POSSESSORS.map((p) => enPossessive(p.slot))).toEqual(['my', 'your', 'his', 'her', 'our', 'your', 'their']);
  });

  it('a third-person singular possessor needs a gender', () => {
    expect(() => possessorKey({ pos: 'possessive', person: 3, number: 'sg' })).toThrow(/needs a gender/);
    expect(possessorKey(of('3sg-f'))).toBe('3sg.f');
    expect(possessorKey(of('3pl'))).toBe('3pl');
  });

  it('knows which of the seven a slot is', () => {
    expect(POSSESSORS.map((p) => possessorValue(p.slot))).toEqual(POSSESSORS.map((p) => p.value));
    expect(possessorValue(null)).toBe('1sg');
  });

  it('Romanian agrees with the possessed noun: meu, mea, mei, mele; the third person never changes', () => {
    const forms = (who: string) =>
      ['skylos', 'spiti', 'dromos'].flatMap((id) => (['sg', 'pl'] as const).map((n) => roPossessive(of(who), getNoun(id), n)));
    // câinele (m), casa (f), drumul (neuter: masculine singular, feminine plural)
    expect(forms('1sg')).toEqual(['meu', 'mei', 'mea', 'mele', 'meu', 'mele']);
    expect(forms('2sg')).toEqual(['tău', 'tăi', 'ta', 'tale', 'tău', 'tale']);
    expect(forms('1pl')).toEqual(['nostru', 'noștri', 'noastră', 'noastre', 'nostru', 'noastre']);
    expect(forms('2pl')).toEqual(['vostru', 'voștri', 'voastră', 'voastre', 'vostru', 'voastre']);
    expect(['3sg-m', '3sg-f', '3pl'].map((w) => forms(w)[0])).toEqual(['lui', 'ei', 'lor']);
    expect(new Set(forms('3pl'))).toEqual(new Set(['lor']));
  });

  it('the genitive of a feminine singular uses the plural form: casei mele', () => {
    expect(roPossessive(of('1sg'), getNoun('spiti'), 'sg', 'gen')).toBe('mele');
    expect(roPossessive(of('1sg'), getNoun('skylos'), 'sg', 'gen')).toBe('meu');
  });

  it('stores every Romanian form', () => {
    for (const entry of Object.values(RO_POSSESSIVES)) {
      const forms = typeof entry === 'string' ? [entry] : [entry.m.sg, entry.m.pl, entry.f.sg, entry.f.pl];
      expect(forms.every((f) => f !== '')).toBe(true);
    }
  });
});

describe('a noun phrase with a possessive', () => {
  it('keeps the article and puts the pronoun after the noun: το σπίτι μου, casa mea, my house', () => {
    expect(phrase('spiti', '1sg')).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
    expect(phrase('skylos', '2sg')).toEqual({ el: 'ο σκύλος σου', ro: 'câinele tău', en: 'your dog' });
    expect(phrase('paidi', '3sg-m')).toEqual({ el: 'το παιδί του', ro: 'copilul lui', en: 'his child' });
    expect(phrase('paidi', '3sg-f')).toEqual({ el: 'το παιδί της', ro: 'copilul ei', en: 'her child' });
  });

  it('the plural and the other cases follow the noun', () => {
    expect(phrase('skylos', '1pl', 'pl')).toEqual({ el: 'οι σκύλοι μας', ro: 'câinii noștri', en: 'our dogs' });
    expect(phrase('dromos', '1sg', 'pl')).toEqual({ el: 'οι δρόμοι μου', ro: 'drumurile mele', en: 'my roads' });
    expect(phrase('spiti', '1sg', 'sg', 'gen')).toEqual({ el: 'του σπιτιού μου', ro: 'casei mele', en: 'of my house' });
    expect(phrase('skylos', '3pl', 'sg', 'acc')).toEqual({ el: 'τον σκύλο τους', ro: 'câinele lor', en: 'their dog' });
  });

  it('adds the second accent when the stress is too far back: η θάλασσά μου', () => {
    expect(phrase('thalassa', '1sg')).toEqual({ el: 'η θάλασσά μου', ro: 'marea mea', en: 'my sea' });
    expect(phrase('thalassa', '1pl', 'pl')).toEqual({ el: 'οι θάλασσές μας', ro: 'mările noastre', en: 'our seas' });
    expect(phrase('thalassa', '2sg', 'sg', 'gen').el).toBe('της θάλασσάς σου');
  });

  it('adds none when the stress is close enough, or on the ending', () => {
    for (const [noun, who] of [['spiti', '1sg'], ['skylos', '1sg'], ['paidi', '1sg'], ['alepou', '1sg'], ['ora', '1sg']] as const) {
      const el = phrase(noun, who).el;
      expect(el.replace(/ μου$/, '')).toBe(richText(nounPhrase(getNoun(noun), 'sg', 'nom', { article: 'definite' }).el));
    }
  });

  it('the pronoun comes after the adjective and the noun: ο ζεστός καφές μου, cafeaua mea caldă', () => {
    const np = nounPhrase(getNoun('kafes'), 'sg', 'nom', { article: 'definite', possessor: of('1sg'), adjective: getAdjective('zestos') });
    expect({ el: richText(np.el), ro: np.ro, en: np.en }).toEqual({
      el: 'ο ζεστός καφές μου',
      ro: 'cafeaua mea caldă',
      en: 'my hot coffee',
    });
  });

  it('wants the definite article', () => {
    expect(() => nounPhrase(getNoun('spiti'), 'sg', 'nom', { article: 'one', possessor: of('1sg') })).toThrow(/definite article/);
    expect(() => nounPhrase(getNoun('spiti'), 'sg', 'nom', { possessor: of('1sg') })).toThrow(/definite article/);
  });
});
```

Create `src/panels/possessive.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const mine: SlotOf<'possessive'> = { pos: 'possessive', person: 1, number: 'sg' };
const stateOf = (noun: string, slot: SlotOf<'possessive'> = mine, patch: Partial<PanelState> = {}): PanelState => ({
  slot,
  noun,
  nounNumber: 'sg',
  nounCase: 'nom',
  ...patch,
});
const panelOf = (state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: 'μου', lexeme: 'possessive', slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the possessive panel', () => {
  it('shows the noun phrase with the possessive, and the pronoun on its own', () => {
    const p = panelOf(stateOf('spiti'));
    expect(p.lemma).toBe('μου, σου, του / της, μας, σας, τους');
    expect(p.posLabel).toBe('possessive: my');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p.rows, 0)).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
    expect(cells(p.rows, 1)).toEqual({ el: 'μου', ro: 'meu / mea / mei / mele', en: 'my' });
  });

  it('the third person has one Romanian word for the pronoun on its own', () => {
    const her: SlotOf<'possessive'> = { pos: 'possessive', person: 3, number: 'sg', gender: 'f' };
    const p = panelOf(stateOf('paidi', her));
    expect(cells(p.rows, 0)).toEqual({ el: 'το παιδί της', ro: 'copilul ei', en: 'her child' });
    expect(cells(p.rows, 1)).toEqual({ el: 'της', ro: 'ei', en: 'her' });
  });

  it('offers Whose?, the noun, how many and the role', () => {
    const p = panelOf(stateOf('spiti'));
    expect(p.controls.map((c) => c.key)).toEqual(['possessor', 'noun', 'number', 'case']);
    expect(control(p, 'possessor')?.options.map((o) => o.label)).toEqual([
      'my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their',
    ]);
    expect(control(p, 'possessor')?.value).toBe('1sg');
    expect(control(p, 'case')?.value).toBe('nom');
  });

  it('the controls change the possessor, the noun, its number and its role', () => {
    const start = stateOf('spiti');
    const toUs = applyControl(start, 'possessor', '1pl');
    expect(toUs.slot).toEqual({ pos: 'possessive', person: 1, number: 'pl' });
    expect(cells(panelOf(toUs).rows, 0)).toEqual({ el: 'το σπίτι μας', ro: 'casa noastră', en: 'our house' });
    const dog = applyControl(toUs, 'noun', 'skylos');
    expect(cells(panelOf(dog).rows, 0)).toEqual({ el: 'ο σκύλος μας', ro: 'câinele nostru', en: 'our dog' });
    const many = applyControl(dog, 'number', 'pl');
    expect(cells(panelOf(many).rows, 0)).toEqual({ el: 'οι σκύλοι μας', ro: 'câinii noștri', en: 'our dogs' });
    const gen = applyControl(start, 'case', 'gen');
    expect(cells(panelOf(gen).rows, 0)).toEqual({ el: 'του σπιτιού μου', ro: 'casei mele', en: 'of my house' });
    expect(applyControl(start, 'possessor', 'nobody')).toBe(start);
  });

  it('says why the noun takes a second accent, and only then', () => {
    const sea = panelOf(stateOf('thalassa'));
    expect(cells(sea.rows, 0)).toEqual({ el: 'η θάλασσά μου', ro: 'marea mea', en: 'my sea' });
    expect(sea.irregular).toContain('second accent');
    expect(panelOf(stateOf('spiti')).irregular).toBe('');
  });

  it('Improver lists the seven possessors for the noun, with the one in use outlined', () => {
    const full = panelOf(stateOf('spiti', { pos: 'possessive', person: 1, number: 'pl' }), 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their']);
    expect(full.map((r) => richText(r.ro as never))).toEqual(['mea', 'ta', 'lui', 'ei', 'noastră', 'voastră', 'lor']);
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['our']);
  });
});

describe('the possessive token in a phrase', () => {
  const tokens: Token[] = [
    { text: 'η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'pl', case: 'acc' }, agreesWith: 1 },
    { text: 'θάλασσές', lexeme: 'thalassa', slot: { pos: 'noun', number: 'pl', case: 'acc' } },
    { text: 'μας', lexeme: 'possessive', slot: { pos: 'possessive', person: 1, number: 'pl' }, agreesWith: 1 },
  ];
  const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens, glosses: [], verified: false };

  it('starts with the noun, its number and its role from the phrase', () => {
    expect(initialState(tokens[2], phrase)).toMatchObject({ noun: 'thalassa', nounNumber: 'pl', nounCase: 'acc' });
    expect(cells(panelOf(initialState(tokens[2], phrase)).rows, 0)).toEqual({
      el: 'τις θάλασσές μας',
      ro: 'mările noastre',
      en: 'our seas',
    });
  });

  it('does not add a role to the state of any other token', () => {
    expect(initialState(tokens[1], phrase)).not.toHaveProperty('nounCase');
  });
});
```

Create `src/validate/possessive-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { formText } from '../engine/segments';
import { slotsFor, validate } from './validate';

describe('the possessive in the validator', () => {
  it('has the seven possessors as slots, each with a Greek form', () => {
    const slots = slotsFor(LEXEMES.possessive);
    expect(slots).toHaveLength(7);
    expect(slots.map((s) => formText(inflect(LEXEMES.possessive, s)))).toEqual(['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους']);
  });

  it('accepts the real data, and the possessive is unverified like every new lexeme', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    expect(LEXEMES.possessive.verified).toEqual({ el: false, ro: false, en: false });
  });

  it('a slot of another part of speech does not fit the lexeme', () => {
    expect(() => inflect(LEXEMES.possessive, { pos: 'clitic', role: 'object', person: 1, number: 'sg' })).toThrow(/does not fit/);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/possessive.test.ts src/panels/possessive.test.ts src/validate/possessive-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/data/possessives.ts`:

```ts
import type { Num } from '../types';

/** The possessor: person and number, and for the third person singular the gender. */
export type PossessorKey = '1sg' | '2sg' | '3sg.m' | '3sg.f' | '3sg.n' | '1pl' | '2pl' | '3pl';

/** A Romanian possessive: one invariable word (*lui*), or four forms by the gender and number of the possessed noun. */
export type RoPossessive = string | Record<'m' | 'f', Record<Num, string>>;

/**
 * The Romanian possessives by possessor (spec 4.3). They agree with the possessed noun, not with the possessor:
 * *casa mea*, *câinele meu*, *copiii mei*, *mările mele*. The third person is invariable. A ReviewItem covers this table.
 */
export const RO_POSSESSIVES: Record<PossessorKey, RoPossessive> = {
  '1sg': { m: { sg: 'meu', pl: 'mei' }, f: { sg: 'mea', pl: 'mele' } },
  '2sg': { m: { sg: 'tău', pl: 'tăi' }, f: { sg: 'ta', pl: 'tale' } },
  '3sg.m': 'lui',
  '3sg.f': 'ei',
  '3sg.n': 'lui',
  '1pl': { m: { sg: 'nostru', pl: 'noștri' }, f: { sg: 'noastră', pl: 'noastre' } },
  '2pl': { m: { sg: 'vostru', pl: 'voștri' }, f: { sg: 'voastră', pl: 'voastre' } },
  '3pl': 'lor',
};

/** The English possessives, which go before the noun and change with the possessor. */
export const EN_POSSESSIVES: Record<PossessorKey, string> = {
  '1sg': 'my',
  '2sg': 'your',
  '3sg.m': 'his',
  '3sg.f': 'her',
  '3sg.n': 'its',
  '1pl': 'our',
  '2pl': 'your',
  '3pl': 'their',
};
```

Create `src/engine/possessive.ts`:

```ts
import { EN_POSSESSIVES, RO_POSSESSIVES, type PossessorKey } from '../data/possessives';
import type { Case, Clitic, GreekNoun, Num, SlotOf } from '../types';
import { greekClitic } from './clitics';

type Possessor = SlotOf<'possessive'>;

/** The possessor as the key of the Romanian and English tables: '1sg', '3sg.f', '3pl'. */
export function possessorKey(s: Possessor): PossessorKey {
  if (s.person === 3 && s.number === 'sg') {
    if (!s.gender) throw new Error('a third-person singular possessor needs a gender');
    return `3sg.${s.gender}`;
  }
  return `${s.person}${s.number}` as PossessorKey;
}

/** The Greek possessive is the genitive weak pronoun: μου, σου, του, της, μας, σας, τους. */
export function greekPossessive(s: Possessor): string {
  possessorKey(s);
  const clitic: Clitic = { role: 'indirect', person: s.person, number: s.number, gender: s.gender ?? 'm' };
  return greekClitic(clitic);
}

/**
 * The Romanian possessive for a noun: it agrees with the possessed noun in gender and number, a neuter following the
 * masculine in the singular and the feminine in the plural. The genitive-dative singular of a feminine noun uses the
 * plural form (casei mele). The third person never changes.
 */
export function roPossessive(s: Possessor, noun: GreekNoun, number: Num, c: Case = 'nom'): string {
  const entry = RO_POSSESSIVES[possessorKey(s)];
  if (typeof entry === 'string') return entry;
  const ro = noun.ro.gender;
  const gender = ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro;
  return entry[gender][c === 'gen' && gender === 'f' && number === 'sg' ? 'pl' : number];
}

export const enPossessive = (s: Possessor): string => EN_POSSESSIVES[possessorKey(s)];

/** The seven possessors the panel offers, with the label of the Whose? control. */
export const POSSESSORS: { value: string; label: string; slot: Possessor }[] = [
  { value: '1sg', label: 'my', slot: { pos: 'possessive', person: 1, number: 'sg' } },
  { value: '2sg', label: 'your', slot: { pos: 'possessive', person: 2, number: 'sg' } },
  { value: '3sg-m', label: 'his', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'm' } },
  { value: '3sg-f', label: 'her', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'f' } },
  { value: '1pl', label: 'our', slot: { pos: 'possessive', person: 1, number: 'pl' } },
  { value: '2pl', label: 'your (pl.)', slot: { pos: 'possessive', person: 2, number: 'pl' } },
  { value: '3pl', label: 'their', slot: { pos: 'possessive', person: 3, number: 'pl' } },
];

/** Which of the seven a possessive slot is; "my" when it is none of them. */
export function possessorValue(s: Possessor | null | undefined): string {
  if (!s) return POSSESSORS[0].value;
  const match = POSSESSORS.find(
    (p) => p.slot.person === s.person && p.slot.number === s.number && (s.person !== 3 || s.number === 'pl' || p.slot.gender === s.gender),
  );
  return (match ?? POSSESSORS[0]).value;
}
```

Create `src/panels/possessive.ts`:

```ts
import { nounPhrase } from '../engine/agree';
import { RO_POSSESSIVES } from '../data/possessives';
import { greekPossessive, enPossessive, possessorValue, POSSESSORS, roPossessive, possessorKey } from '../engine/possessive';
import { secondAccent } from '../engine/stress';
import { formText, plain } from '../engine/segments';
import { inflectNoun } from '../engine/greek';
import type { GreekPossessive, Level, SlotOf } from '../types';
import { ALL, caseControl, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Panel, PanelRow, PanelState } from './types';

/** All the Romanian forms of a possessor, for the "on its own" row: meu / mea / mei / mele, or the one invariable word. */
function roForms(slot: SlotOf<'possessive'>): string {
  const entry = RO_POSSESSIVES[possessorKey(slot)];
  return typeof entry === 'string' ? entry : `${entry.m.sg} / ${entry.f.sg} / ${entry.m.pl} / ${entry.f.pl}`;
}

/** μου, σου, του …: the weak genitive pronoun after a noun; the Romanian possessive agrees with the possessed noun (spec 4.3, 5.3). */
export function possessivePanel(_l: GreekPossessive, slot: SlotOf<'possessive'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const number = state.nounNumber;
  const c = state.nounCase ?? 'nom';
  const here = nounPhrase(noun, number, c, { article: 'definite', possessor: slot });
  const pronoun = greekPossessive(slot);
  const accent = secondAccent([formText(inflectNoun(noun, { pos: 'noun', number, case: c })), pronoun]);
  const alone: PanelRow = {
    label: 'on its own',
    el: [{ text: pronoun, role: 'clitic' }],
    ro: plain(roForms(slot)),
    en: plain(enPossessive(slot)),
  };
  return {
    lemma: 'μου, σου, του / της, μας, σας, τους',
    posLabel:
      level === 'beginner' ? `possessive: ${enPossessive(slot)}` : 'possessive · weak genitive pronoun after the noun',
    controls: [
      {
        key: 'possessor',
        label: 'Whose?',
        options: POSSESSORS.map(({ value, label }) => ({ value, label })),
        value: possessorValue(slot),
      },
      nounControl('Noun it goes with', state),
      numberControl(number),
      caseControl({ case: c }, level),
    ],
    rows: [npRow('with a noun', here), alone],
    full:
      level === 'improver'
        ? POSSESSORS.map(({ value, label, slot: p }) => ({
            label,
            el: [{ text: greekPossessive(p), role: 'clitic' as const }],
            ro: plain(roPossessive(p, noun, number, c)),
            en: plain(enPossessive(p)),
            hl: value === possessorValue(slot) ? ALL : undefined,
          }))
        : [],
    plain:
      'Greek puts the weak genitive pronoun after the noun and keeps the article (το σπίτι μου); it changes with the possessor. English puts it before the noun and drops the article (my house). Romanian puts it after the noun and changes it with the possessed noun, not with the possessor (casa mea, câinele meu).',
    irregular: accent
      ? 'The noun’s stress is too far back for the whole unit, so it takes a second accent two syllables after its own: θάλασσα → θάλασσά μου.'
      : '',
    note: noun.note,
  };
}
```

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -10,4 +10,5 @@
   GreekNumeral,
   GreekParticle,
+  GreekPossessive,
   GreekPreposition,
   GreekQuantifier,
@@ -213,5 +214,5 @@
   ro: {
     lemma: 'drum',
-    gender: 'm',
+    gender: 'n',
     forms: {
       sg: { definite: 'drumul', indefinite: 'un drum', genDefinite: 'drumului', genIndefinite: 'unui drum' },
@@ -221,5 +222,5 @@
   },
   en: { sg: 'road', pl: 'roads' },
-  note: 'Masculine in Greek and Romanian. δρόμος is the road or the street.',
+  note: 'Masculine in Greek, neuter in Romanian (un drum, două drumuri). δρόμος is the road or the street.',
 };
 
@@ -1265,4 +1266,6 @@
 );
 
+const possessive: GreekPossessive = { id: 'possessive', pos: 'possessive', lemma: 'μου', verified: { el: false, ro: false, en: false } };
+
 const clitic: GreekClitic = { id: 'clitic', pos: 'clitic', lemma: 'το', verified: { el: false, ro: false, en: false } };
 
@@ -1320,4 +1323,5 @@
   [an.id]: an,
   [clitic.id]: clitic,
+  [possessive.id]: possessive,
   [ti.id]: ti,
   [pou.id]: pou,
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -11,4 +11,5 @@
   { id: 'ending-table:neut-i-stem', kind: 'ending-table', verified: false },
   { id: 'ending-table:se-contractions', kind: 'ending-table', verified: false },
+  { id: 'ending-table:ro-possessives', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
   { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
```

Change `src/engine/agree.ts` (unified diff):

```diff
@@ -1,10 +1,15 @@
 import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
-import type { Case, GreekAdjective, GreekNoun, Num, NumeralValue } from '../types';
+import type { Case, GreekAdjective, GreekNoun, Num, NumeralValue, SlotOf } from '../types';
+import { accentForm } from './compose';
 import { enIndefiniteArticle, enNoun, enNumeral } from './english';
 import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
+import { enPossessive, greekPossessive, roPossessive } from './possessive';
 import { roAdjective, roNoun, roNumeral } from './romanian';
-import { articleRich, formRich, joinRich, numeralRich, type Rich } from './segments';
+import { articleRich, formRich, formText, joinRich, numeralRich, type Rich } from './segments';
+import { secondAccent } from './stress';
 
 export interface NpOptions {
+  /** The possessor after the noun (το σπίτι μου); the article is the definite one. */
+  possessor?: SlotOf<'possessive'>;
   article?: 'definite' | 'one';
   /** A counted plural: τρεις καφέδες. Cannot be combined with `article`. */
@@ -22,4 +27,5 @@
 export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
   if (opts.article && opts.count) throw new Error('A noun phrase has an article or a count, not both');
+  if (opts.possessor && opts.article !== 'definite') throw new Error('A possessive goes with the definite article');
   if (opts.article === 'one' && number === 'pl') throw new Error('Greek has no plural indefinite article');
   if (opts.count && number !== 'pl') throw new Error('A counted noun phrase is plural');
@@ -39,19 +45,32 @@
     el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
   }
-  el.push(formRich(inflectNoun(noun, { pos: 'noun', number, case: c })));
+  // The stress rule of commands applies to the noun and the pronoun together: θάλασσα μου → θάλασσά μου.
+  let nounForm = inflectNoun(noun, { pos: 'noun', number, case: c });
+  if (opts.possessor) {
+    const accent = secondAccent([formText(nounForm), greekPossessive(opts.possessor)]);
+    if (accent && accent.word === 0) nounForm = accentForm(nounForm, accent.at);
+  }
+  el.push(formRich(nounForm));
+  if (opts.possessor) el.push([{ text: greekPossessive(opts.possessor), role: 'clitic' }]);
 
   const roAdj = opts.adjective ? roAdjective(opts.adjective, noun.ro.gender, number, c) : '';
   const roText = opts.count
     ? [roNumeral(NUMERAL, opts.count, noun.ro.gender, c), noun.ro.forms.pl.indefinite, roAdj]
-    : [roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'), roAdj];
+    : [
+        roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'),
+        opts.possessor ? roPossessive(opts.possessor, noun, number, c) : '',
+        roAdj,
+      ];
 
   const core = [opts.adjective?.en, enNoun(noun, number)].filter(Boolean).join(' ');
   const word = opts.count
     ? enNumeral(NUMERAL, opts.count)
-    : opts.article === 'definite'
-      ? 'the'
-      : opts.article === 'one'
-        ? enIndefiniteArticle(core)
-        : '';
+    : opts.possessor
+      ? enPossessive(opts.possessor)
+      : opts.article === 'definite'
+        ? 'the'
+        : opts.article === 'one'
+          ? enIndefiniteArticle(core)
+          : '';
   const enText = [word, core].filter(Boolean).join(' ');
 
```

Change `src/engine/compose.ts` (unified diff):

```diff
@@ -58,5 +58,5 @@
 
 /** The form with an acute accent on the letter at `at` of its written text. */
-function accentForm(form: Form, at: number): Form {
+export function accentForm(form: Form, at: number): Form {
   const parts = [form.augment ?? '', form.stem, form.ending];
   let offset = 0;
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -25,4 +25,5 @@
   GreekInterrogative,
   GreekParticle,
+  GreekPossessive,
   GreekPreposition,
   GreekQuantifier,
@@ -36,4 +37,5 @@
 import { greekClitic } from './clitics';
 import { voiceOf } from './offers';
+import { greekPossessive } from './possessive';
 import { mainFormKind, whoIndex } from './tenses';
 
@@ -165,4 +167,8 @@
 }
 
+export function inflectPossessive(_l: GreekPossessive, s: SlotOf<'possessive'>): Form {
+  return { stem: greekPossessive(s), ending: '' };
+}
+
 export function inflectPreposition(l: GreekPreposition, _s: SlotOf<'preposition'>): Form {
   return { stem: l.lemma, ending: '' };
@@ -196,4 +202,6 @@
     case 'clitic':
       return inflectClitic(l, s as SlotOf<'clitic'>);
+    case 'possessive':
+      return inflectPossessive(l, s as SlotOf<'possessive'>);
     case 'conjunction':
       return inflectConjunction(l, s as SlotOf<'conjunction'>);
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -1,4 +1,5 @@
 import { getLexeme, getNoun, getVerb } from '../data/lexemes';
 import { groupFor } from '../engine/groups';
+import { POSSESSORS } from '../engine/possessive';
 import { DEFAULT_OBJECT, RECIPIENTS, cliticsFor, indirectOf, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';
 import { voiceOf } from '../engine/offers';
@@ -12,4 +13,5 @@
   GreekNumeral,
   GreekParticle,
+  GreekPossessive,
   GreekPreposition,
   GreekQuantifier,
@@ -32,4 +34,5 @@
 import { cliticPanel, withWho } from './clitic';
 import { conjunctionPanel } from './conjunction';
+import { possessivePanel } from './possessive';
 import { interrogativePanel } from './interrogative';
 import { quantifierPanel } from './quantifier';
@@ -55,4 +58,5 @@
   return {
     slot: token.slot,
+    ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
     noun,
     nounNumber: nounToken && nounToken.slot.pos === 'noun' ? nounToken.slot.number : 'sg',
@@ -83,4 +87,6 @@
     case 'clitic':
       return cliticPanel(slot, level);
+    case 'possessive':
+      return possessivePanel(lexeme as GreekPossessive, slot, state, level);
     case 'conjunction':
       return conjunctionPanel(lexeme as GreekConjunction, level);
@@ -126,4 +132,5 @@
       break;
     case 'case':
+      if (slot.pos === 'possessive') return { ...state, nounCase: value as Case };
       if (
         slot.pos !== 'verb' &&
@@ -141,4 +148,5 @@
         return { ...state, slot: { ...slot, number: value as Num } };
       }
+      if (slot.pos === 'possessive') return { ...state, nounNumber: value as Num };
       if (slot.pos === 'preposition') return { ...state, nounNumber: value as Num };
       break;
@@ -199,4 +207,10 @@
       }
       break;
+    case 'possessor':
+      if (slot.pos === 'possessive') {
+        const to = POSSESSORS.find((p) => p.value === value);
+        if (to) return { ...state, slot: { ...to.slot } };
+      }
+      break;
     case 'recipient':
       if (slot.pos === 'verb' && indirectOf(slot)) {
@@ -212,4 +226,5 @@
       if (noun.pos !== 'noun') break;
       if (slot.pos === 'preposition') return { ...state, noun: value };
+      if (slot.pos === 'possessive') return { ...state, noun: value };
       // Without the lexeme the verb's indirect object is unknown: the control does not apply.
       if (slot.pos === 'verb' && lexemeId) {
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -1,8 +1,8 @@
 import type { Option } from '../engine/labels';
 import type { Rich } from '../engine/segments';
-import type { Num, ReadingPart, Slot } from '../types';
+import type { Case, Num, ReadingPart, Slot } from '../types';
 
 export interface Control {
-  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient';
+  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor';
   label: string;
   options: Option[];
@@ -93,5 +93,7 @@
   /** Lexeme id of the noun an article, numeral, adjective or preposition goes with; null for other words. */
   noun: string | null;
-  /** Number of that noun, used by the preposition panel (other words carry it in their slot). */
+  /** Number of that noun, used by the preposition and possessive panels (other words carry it in their slot). */
   nounNumber: Num;
+  /** The role of that noun, for the possessive panel (the slot of a possessive holds only the possessor). */
+  nounCase?: Case;
 }
```

Change `src/types.ts` (unified diff):

```diff
@@ -87,4 +87,5 @@
   | { pos: 'conjunction' }
   | { pos: 'interrogative' }
+  | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }
   | ({ pos: 'clitic' } & Clitic);
 
@@ -348,4 +349,12 @@
 }
 
+/**
+ * The weak genitive pronoun after a noun: το σπίτι μου (spec 4.3). The slot holds the possessor; the possessed noun
+ * is the token's `agreesWith`.
+ */
+export interface GreekPossessive extends LexemeBase {
+  pos: 'possessive';
+}
+
 /** The weak pronoun as a word of its own: the panel a clitic piece of a verb group opens (spec 5.3). */
 export interface GreekClitic extends LexemeBase {
@@ -379,5 +388,5 @@
 
 export type GreekLexeme =
-  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekQuantifier | GreekInterrogative;
+  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative;
 
 export type TokenIndex = number;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -5,4 +5,6 @@
 import { RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
 import { RECIPIENTS } from '../engine/objects';
+import { enPossessive, POSSESSORS } from '../engine/possessive';
+import { EN_POSSESSIVES, RO_POSSESSIVES } from '../data/possessives';
 import { compose, lexicalPiece } from '../engine/compose';
 import { memberKind, memberText } from '../engine/groups';
@@ -83,4 +85,6 @@
     case 'clitic':
       return cliticSlots();
+    case 'possessive':
+      return POSSESSORS.map((p): Slot => ({ ...p.slot }));
     case 'quantifier':
       return quantifierSlots(l);
@@ -226,4 +230,16 @@
     }
   }
+  if (l.pos === 'possessive') {
+    for (const [key, entry] of Object.entries(RO_POSSESSIVES)) {
+      const forms = typeof entry === 'string' ? [entry] : [entry.m.sg, entry.m.pl, entry.f.sg, entry.f.pl];
+      if (forms.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian possessive for ${key}`);
+    }
+    for (const [key, word] of Object.entries(EN_POSSESSIVES)) {
+      if (isEmpty(word)) errors.push(`lexeme ${l.id}: an empty English possessive for ${key}`);
+    }
+    for (const p of POSSESSORS) {
+      if (isEmpty(enPossessive(p.slot))) errors.push(`lexeme ${l.id}: no English possessive for ${p.value}`);
+    }
+  }
   if (l.pos === 'clitic') {
     errors.push(...roTableProblems(RO_CLITICS, RO_CLUSTERS));
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1205 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/possessives.ts src/engine/possessive.test.ts src/engine/possessive.ts src/panels/possessive.test.ts src/panels/possessive.ts src/validate/possessive-validate.test.ts src/data/lexemes.ts src/data/review.ts src/engine/agree.ts src/engine/compose.ts src/engine/greek.ts src/panels/panels.ts src/panels/types.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the weak possessive (μου, σου …) with its panel and the second accent

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Whose? in the noun panel

**Files:**
- Create (test): `src/panels/noun-whose.test.ts`
- Modify: `src/panels/noun.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/types.ts`
- Modify (test): `src/panels/panels.test.ts`

**Interfaces:**
- Consumes: `nounPanel`, `PanelState`, `initialState`, `applyControl` and `POSSESSORS`.
- Produces: `PanelState.possessor`; a Whose? control (nobody, then the seven possessors) and a row "with a possessive" in the noun panel; `applyControl(state, 'possessor', …)` for a noun; a noun that a possessive points at starts with that possessor.

One existing test lists the noun panel's controls and changes to include `possessor`.

- [ ] **Step 1: Write the tests**

Create `src/panels/noun-whose.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const kafes = (patch: Partial<PanelState> = {}): PanelState => ({
  slot: { pos: 'noun', number: 'sg', case: 'acc' },
  noun: null,
  nounNumber: 'sg',
  ...patch,
});
const panelOf = (lexeme: string, state: PanelState) =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, 'beginner');
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const whose = (p: ReturnType<typeof panelOf>) => p.controls.find((c) => c.key === 'possessor');

describe('the noun panel: Whose?', () => {
  it('starts with nobody and offers the seven possessors', () => {
    const p = panelOf('kafes', kafes());
    expect(whose(p)?.value).toBe('none');
    expect(whose(p)?.options.map((o) => o.label)).toEqual(['nobody', 'my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their']);
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
  });

  it('adds a row "with a possessive" when someone is chosen, and takes it away again', () => {
    const mine = applyControl(kafes(), 'possessor', '1sg');
    const p = panelOf('kafes', mine);
    expect(whose(p)?.value).toBe('1sg');
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an', 'with a possessive']);
    expect(cells(p.rows, 2)).toEqual({ el: 'τον καφέ μου', ro: 'cafeaua mea', en: 'my coffee' });
    const none = applyControl(mine, 'possessor', 'none');
    expect(none).not.toHaveProperty('possessor');
    expect(panelOf('kafes', none).rows).toHaveLength(2);
  });

  it('follows the role and the number of the noun, and the second accent', () => {
    const sea = applyControl(kafes({ slot: { pos: 'noun', number: 'pl', case: 'nom' } }), 'possessor', '1pl');
    expect(cells(panelOf('thalassa', sea).rows, 2)).toEqual({ el: 'οι θάλασσές μας', ro: 'mările noastre', en: 'our seas' });
    const gen = applyControl(kafes({ slot: { pos: 'noun', number: 'sg', case: 'gen' } }), 'possessor', '2sg');
    expect(cells(panelOf('spiti', gen).rows, 2)).toEqual({ el: 'του σπιτιού σου', ro: 'casei tale', en: 'of your house' });
  });

  it('the state differs from the phrase while someone is chosen', () => {
    expect(sameState(kafes(), applyControl(kafes(), 'possessor', '3pl'))).toBe(false);
  });
});

describe('the noun a possessive points at', () => {
  const tokens: Token[] = [
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'σπίτι', lexeme: 'spiti', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'μου', lexeme: 'possessive', slot: { pos: 'possessive', person: 1, number: 'sg' }, agreesWith: 1 },
  ];
  const phrase: Phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner', tokens, glosses: [], verified: false };

  it('starts with that possessor, so the panel already shows το σπίτι μου', () => {
    const state = initialState(tokens[1], phrase);
    expect(state.possessor).toEqual({ pos: 'possessive', person: 1, number: 'sg' });
    expect(cells(panelOf('spiti', state).rows, 2)).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
  });

  it('gives the article and the possessive no possessor of their own', () => {
    expect(initialState(tokens[0], phrase)).not.toHaveProperty('possessor');
    expect(initialState(tokens[2], phrase)).not.toHaveProperty('possessor');
  });
});
```

Change `src/panels/panels.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -64,5 +64,5 @@
     expect(panel.lemma).toBe('καφές');
     expect(panel.posLabel).toBe('noun: coffee (masculine)');
-    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case']);
+    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case', 'possessor']);
     expect(panel.controls[0].value).toBe('1');
     expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/noun-whose.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/panels/noun.ts` (unified diff):

```diff
@@ -2,8 +2,9 @@
 import { inflectNoun } from '../engine/greek';
 import { GENDER_NAME, type Option } from '../engine/labels';
+import { POSSESSORS, possessorValue } from '../engine/possessive';
 import { plain, richText } from '../engine/segments';
 import type { GreekNoun, Level, SlotOf } from '../types';
 import { ALL, CASES, NUMS, caseControl, caseName, noPluralArticleRow, npRow } from './shared';
-import type { Panel, PanelRow } from './types';
+import type { Panel, PanelRow, PanelState } from './types';
 
 export const countOptions: Option[] = [
@@ -38,5 +39,6 @@
 }
 
-export function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level): Panel {
+export function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level, state?: PanelState): Panel {
+  const possessor = state?.possessor;
   const second =
     slot.number === 'sg'
@@ -54,6 +56,18 @@
       { key: 'count', label: 'How many?', options: countOptions, value: countValue(slot) },
       caseControl(slot, level),
+      {
+        key: 'possessor',
+        label: 'Whose?',
+        options: [{ value: 'none', label: 'nobody' }, ...POSSESSORS.map(({ value, label }) => ({ value, label }))],
+        value: possessor ? possessorValue(possessor) : 'none',
+      },
+    ],
+    rows: [
+      npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite' })),
+      second,
+      ...(possessor
+        ? [npRow('with a possessive', nounPhrase(noun, slot.number, slot.case, { article: 'definite', possessor }))]
+        : []),
     ],
-    rows: [npRow('the', nounPhrase(noun, slot.number, slot.case, { article: 'definite' })), second],
     full: level === 'improver' ? nounFull(noun, slot) : [],
     plain: 'The article agrees with the noun in gender, number and role.',
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -56,6 +56,9 @@
   }
   if (!noun && token.slot.pos === 'quantifier') noun = DEFAULT_NOUN[token.slot.gender];
+  // A noun that a possessive points at shows it: το σπίτι μου.
+  const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === phrase.tokens.indexOf(token)) : undefined;
   return {
     slot: token.slot,
+    ...(possessive && possessive.slot.pos === 'possessive' ? { possessor: possessive.slot } : {}),
     ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
     noun,
@@ -74,5 +77,5 @@
       return verbPanel(lexeme as GreekVerb, slot, state, level);
     case 'noun':
-      return nounPanel(lexeme as GreekNoun, slot, level);
+      return nounPanel(lexeme as GreekNoun, slot, level, state);
     case 'adjective':
       return adjectivePanel(lexeme as GreekAdjective, slot, state, level);
@@ -208,4 +211,11 @@
       break;
     case 'possessor':
+      if (slot.pos === 'noun') {
+        const next = { ...state };
+        const to = POSSESSORS.find((p) => p.value === value);
+        if (to) next.possessor = { ...to.slot };
+        else delete next.possessor;
+        return next;
+      }
       if (slot.pos === 'possessive') {
         const to = POSSESSORS.find((p) => p.value === value);
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -1,5 +1,5 @@
 import type { Option } from '../engine/labels';
 import type { Rich } from '../engine/segments';
-import type { Case, Num, ReadingPart, Slot } from '../types';
+import type { Case, Num, ReadingPart, Slot, SlotOf } from '../types';
 
 export interface Control {
@@ -97,3 +97,5 @@
   /** The role of that noun, for the possessive panel (the slot of a possessive holds only the possessor). */
   nounCase?: Case;
+  /** The noun panel's Whose? control: the possessor shown after the noun (absent: nobody). */
+  possessor?: SlotOf<'possessive'>;
 }
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1211 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/noun-whose.test.ts src/panels/noun.ts src/panels/panels.test.ts src/panels/panels.ts src/panels/types.ts
git commit -m "feat: Whose? in the noun panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Possessives in phrases: the validator and phrases 63 to 68

**Files:**
- Create (test): `src/App.possessives.test.tsx`
- Create (test): `src/data/phrases-possessives.test.ts`
- Create (test): `src/validate/possessive-token-validate.test.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/engine/agree.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The helpers `rows`, `u`, `seg`, `present`, `iq` and `nomSg` in `src/data/phrases.ts`, `possessedNounForm` and the lexemes of Tasks 1 and 2.
- Produces: `possessedNounForm(noun, number, case, possessor)` in `src/engine/agree.ts`; validator rules for a possessive token (it points at a noun and carries its possessor's pronoun) and for a noun with a possessive after it (its text has the second accent); six phrases `my-house`, `our-sea`, `your-dog`, `his-child`, `where-is-your-house`, `my-hot-coffee` in the new theme *Possession*; the picker lists 68 phrases.

The noun's token carries the accent (θάλασσά in phrase 64): that is the form `possessedNounForm` gives, and the validator compares them.

- [ ] **Step 1: Write the tests**

Create `src/App.possessives.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('possessives in the app', () => {
  it('opens the possessive from its chip and shows the noun phrase in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My house');
    await user.click(screen.getByRole('button', { name: 'μου' }));
    expect(screen.getByRole('heading', { level: 2, name: 'μου, σου, του / της, μας, σας, τους' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'το σπίτι μου' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa mea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'my house' })).toBeInTheDocument();
  });

  it('Whose? changes the possessor in all three languages, and the noun follows', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My house');
    await user.click(screen.getByRole('button', { name: 'μου' }));
    await user.selectOptions(screen.getByLabelText('Whose?'), '3sg-f');
    expect(screen.getByRole('cell', { name: 'το σπίτι της' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa ei' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'her house' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'thalassa');
    expect(screen.getByRole('cell', { name: 'η θάλασσά της' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('the noun of the phrase shows the possessive too, and has its own Whose? control', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Our sea');
    await user.click(screen.getByRole('button', { name: 'θάλασσά' }));
    expect(screen.getByRole('cell', { name: 'η θάλασσά μας' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Whose?'), 'none');
    expect(screen.queryByRole('cell', { name: 'η θάλασσά μας' })).not.toBeInTheDocument();
  });

  it('explains the second accent in the possessive panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Our sea');
    await user.click(screen.getByRole('button', { name: 'μας' }));
    expect(screen.getByText(/second accent/)).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-possessives.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee'];
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

describe('phrases 63 to 68', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Possession theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Possession'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('my-house')).toEqual(['Το σπίτι μου', 'My house', 'Casa mea']);
    expect(read('our-sea')).toEqual(['Η θάλασσά μας', 'Our sea', 'Marea noastră']);
    expect(read('your-dog')).toEqual(['Ο σκύλος σου', 'Your dog', 'Câinele tău']);
    expect(read('his-child')).toEqual(['Το παιδί του', 'His child', 'Copilul lui']);
    expect(read('where-is-your-house')).toEqual(['Πού είναι το σπίτι σου;', 'Where is your house?', 'Unde este casa ta?']);
    expect(read('my-hot-coffee')).toEqual(['Ο ζεστός καφές μου', 'My hot coffee', 'Cafeaua mea caldă']);
  });

  it('the literal English follows the Greek order: the house my', () => {
    expect(gloss('my-house', 'en', 'literal')).toBe('the house my');
    expect(gloss('my-hot-coffee', 'en', 'literal')).toBe('the hot coffee my');
  });

  it('every possessive token points at the noun it belongs to, and the noun carries the second accent', () => {
    for (const id of IDS) {
      const tokens = phrase(id).tokens;
      const index = tokens.findIndex((t) => t.lexeme === 'possessive');
      expect(tokens[tokens[index].agreesWith!].slot.pos).toBe('noun');
    }
    expect(phrase('our-sea').tokens[1].text).toBe('θάλασσά');
  });
});
```

Create `src/validate/possessive-token-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const base = PHRASES.find((p) => p.id === 'our-sea')!;
const withTokens = (change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a possessive in the validator', () => {
  it('accepts the real phrase', () => {
    expect(errorsOf(base)).toEqual([]);
  });

  it('wants the second accent on the noun before the possessive', () => {
    const plain = withTokens((t) => t.map((x, i) => (i === 1 ? { ...x, text: 'θάλασσα' } : x)));
    expect(errorsOf(plain)).toContain('our-sea token 1 (θάλασσα): text differs from the form before the possessive ("θάλασσά")');
  });

  it('wants the pronoun that the possessor says', () => {
    const wrong = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, text: 'μου' } : x)));
    expect(errorsOf(wrong)).toContain('our-sea token 2 (μου): text differs from the possessive ("μας")');
  });

  it('wants a noun in agreesWith', () => {
    const none = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, agreesWith: undefined } : x)));
    expect(errorsOf(none)).toContain('our-sea token 2 (μας): a possessive needs agreesWith pointing at the noun it belongs to');
    const article = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(article)).toContain('our-sea token 2 (μας): a possessive needs agreesWith pointing at the noun it belongs to');
  });

  it('leaves a noun with no possessive alone, whatever its accent', () => {
    const alone = withTokens((t) => t.slice(0, 2).map((x, i) => (i === 1 ? { ...x, text: 'θάλασσα' } : x)));
    expect(errorsOf(alone).filter((e) => e.includes('before the possessive'))).toEqual([]);
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 62 phrases in the spec order', () => {
+  it('the picker lists all 68 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -100,4 +100,5 @@
       'what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me',
       'going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water',
+      'my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.possessives.test.tsx src/data/phrases-possessives.test.ts src/validate/possessive-token-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1362,4 +1362,135 @@
 };
 
+/** The weak possessive after a noun (μου, σου …); `gender` is for a third-person singular possessor. */
+const possessive = (person: Person, number: Num, gender?: Gender): Slot => ({
+  pos: 'possessive',
+  person,
+  number,
+  ...(gender ? { gender } : {}),
+});
+const article = (gender: Gender, c: Case, agreesWith: number): Token => ({
+  text: '',
+  lexeme: 'def',
+  slot: { pos: 'article', gender, number: 'sg', case: c },
+  agreesWith,
+});
+
+const myHouse: Phrase = {
+  id: 'my-house',
+  title: 'My house',
+  theme: 'Possession',
+  level: 'beginner',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('My', 2), u('house', 1)],
+    [u('the', 0), u('house', 1), u('my', 2)],
+    [seg(['Cas', 1], ['a', 0]), u('mea', 2)],
+    [seg(['cas', 1], ['a', 0]), u('mea', 2)],
+  ),
+  verified: false,
+};
+
+const ourSea: Phrase = {
+  id: 'our-sea',
+  title: 'Our sea',
+  theme: 'Possession',
+  level: 'improver',
+  tokens: [
+    { ...article('f', 'nom', 1), text: 'Η' },
+    { text: 'θάλασσά', lexeme: 'thalassa', slot: nomSg },
+    { text: 'μας', lexeme: 'possessive', slot: possessive(1, 'pl'), agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('Our', 2), u('sea', 1)],
+    [u('the', 0), u('sea', 1), u('our', 2)],
+    [seg(['Mare', 1], ['a', 0]), u('noastră', 2)],
+    [seg(['mare', 1], ['a', 0]), u('noastră', 2)],
+  ),
+  verified: false,
+};
+
+const yourDog: Phrase = {
+  id: 'your-dog',
+  title: 'Your dog',
+  theme: 'Possession',
+  level: 'beginner',
+  tokens: [
+    { ...article('m', 'nom', 1), text: 'Ο' },
+    { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
+    { text: 'σου', lexeme: 'possessive', slot: possessive(2, 'sg'), agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('Your', 2), u('dog', 1)],
+    [u('the', 0), u('dog', 1), u('your', 2)],
+    [seg(['Câine', 1], ['le', 0]), u('tău', 2)],
+    [seg(['câine', 1], ['le', 0]), u('tău', 2)],
+  ),
+  verified: false,
+};
+
+const hisChild: Phrase = {
+  id: 'his-child',
+  title: 'His child',
+  theme: 'Possession',
+  level: 'beginner',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'παιδί', lexeme: 'paidi', slot: nomSg },
+    { text: 'του', lexeme: 'possessive', slot: possessive(3, 'sg', 'm'), agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('His', 2), u('child', 1)],
+    [u('the', 0), u('child', 1), u('his', 2)],
+    [seg(['Copil', 1], ['ul', 0]), u('lui', 2)],
+    [seg(['copil', 1], ['ul', 0]), u('lui', 2)],
+  ),
+  verified: false,
+};
+
+const whereIsYourHouse: Phrase = {
+  id: 'where-is-your-house',
+  title: 'Where is your house?',
+  theme: 'Possession',
+  level: 'improver',
+  tokens: [
+    { text: 'Πού', lexeme: 'pou', slot: iq },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { ...article('n', 'nom', 3), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'σου;', lexeme: 'possessive', slot: possessive(2, 'sg'), agreesWith: 3 },
+  ],
+  glosses: rows(
+    [u('Where', 0), u('is', 1), u('your', 4), u('house?', 3)],
+    [u('where', 0), u('is', 1), u('the', 2), u('house', 3), u('your', 4)],
+    [u('Unde', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('ta?', 4)],
+    [u('unde', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('ta', 4)],
+  ),
+  verified: false,
+};
+
+const myHotCoffee: Phrase = {
+  id: 'my-hot-coffee',
+  title: 'My hot coffee',
+  theme: 'Possession',
+  level: 'improver',
+  tokens: [
+    { ...article('m', 'nom', 2), text: 'Ο' },
+    { text: 'ζεστός', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 2 },
+    { text: 'καφές', lexeme: 'kafes', slot: nomSg },
+    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 2 },
+  ],
+  glosses: rows(
+    [u('My', 3), u('hot', 1), u('coffee', 2)],
+    [u('the', 0), u('hot', 1), u('coffee', 2), u('my', 3)],
+    [seg(['Cafea', 2], ['ua', 0]), u('mea', 3), u('caldă', 1)],
+    [seg(['cafea', 2], ['ua', 0]), u('mea', 3), u('caldă', 1)],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1421,3 +1552,9 @@
   giveBreadToTheChild,
   dogJumpsIntoTheWater,
+  myHouse,
+  ourSea,
+  yourDog,
+  hisChild,
+  whereIsYourHouse,
+  myHotCoffee,
 ];
```

Change `src/engine/agree.ts` (unified diff):

```diff
@@ -1,4 +1,4 @@
 import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
-import type { Case, GreekAdjective, GreekNoun, Num, NumeralValue, SlotOf } from '../types';
+import type { Case, Form, GreekAdjective, GreekNoun, Num, NumeralValue, SlotOf } from '../types';
 import { accentForm } from './compose';
 import { enIndefiniteArticle, enNoun, enNumeral } from './english';
@@ -24,4 +24,14 @@
 }
 
+/**
+ * The noun as it is written before a possessive. The stress rule of commands applies to the noun and the pronoun
+ * together: θάλασσα μου → θάλασσά μου (spec 4.3).
+ */
+export function possessedNounForm(noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): Form {
+  const form = inflectNoun(noun, { pos: 'noun', number, case: c });
+  const accent = secondAccent([formText(form), greekPossessive(possessor)]);
+  return accent && accent.word === 0 ? accentForm(form, accent.at) : form;
+}
+
 /** Builds article or count + adjective + noun in all three languages, agreeing in gender, number and case. */
 export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
@@ -45,11 +55,5 @@
     el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
   }
-  // The stress rule of commands applies to the noun and the pronoun together: θάλασσα μου → θάλασσά μου.
-  let nounForm = inflectNoun(noun, { pos: 'noun', number, case: c });
-  if (opts.possessor) {
-    const accent = secondAccent([formText(nounForm), greekPossessive(opts.possessor)]);
-    if (accent && accent.word === 0) nounForm = accentForm(nounForm, accent.at);
-  }
-  el.push(formRich(nounForm));
+  el.push(formRich(opts.possessor ? possessedNounForm(noun, number, c, opts.possessor) : inflectNoun(noun, { pos: 'noun', number, case: c })));
   if (opts.possessor) el.push([{ text: greekPossessive(opts.possessor), role: 'clitic' }]);
 
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -5,5 +5,6 @@
 import { RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
 import { RECIPIENTS } from '../engine/objects';
-import { enPossessive, POSSESSORS } from '../engine/possessive';
+import { possessedNounForm } from '../engine/agree';
+import { enPossessive, greekPossessive, POSSESSORS } from '../engine/possessive';
 import { EN_POSSESSIVES, RO_POSSESSIVES } from '../data/possessives';
 import { compose, lexicalPiece } from '../engine/compose';
@@ -390,4 +391,22 @@
     }
   }
+  if (token.slot.pos === 'possessive') {
+    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
+    if (!target || lexemes[target.lexeme]?.pos !== 'noun') {
+      errors.push(`${where}: a possessive needs agreesWith pointing at the noun it belongs to`);
+    } else if (normalise(greekPossessive(token.slot)) !== normalise(token.text)) {
+      errors.push(`${where}: text differs from the possessive ("${greekPossessive(token.slot)}")`);
+    }
+  }
+  if (token.slot.pos === 'noun' && lexeme.pos === 'noun') {
+    // A noun with a possessive after it is written with the second accent where the stress rule asks for it (θάλασσά μου).
+    const possessive = phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === index);
+    if (possessive && possessive.slot.pos === 'possessive') {
+      const expected = formText(possessedNounForm(lexeme, token.slot.number, token.slot.case, possessive.slot));
+      if (normalise(expected) !== normalise(token.text)) {
+        errors.push(`${where}: text differs from the form before the possessive ("${expected}")`);
+      }
+    }
+  }
   if (token.slot.pos === 'preposition') {
     const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1225 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.possessives.test.tsx src/data/phrases-possessives.test.ts src/validate/possessive-token-validate.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/engine/agree.ts src/validate/validate.ts
git commit -m "feat: possessives in phrases 63 to 68

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Comparison notes and the review sheet

**Files:**
- Create (test): `src/data/divergences-possessive.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences`, `lexemeSection` and `otherLines` in `src/validate/reviewSheet.ts`.
- Produces: The divergence rows `possessor-agreement`, `possessive-position`, `possessive-accent` and `possessive-third-person` on the possessive; a review-sheet section with the Romanian possessive table and every noun with every possessor in the three languages.

The second-accent note is an Improver row; the others show at Beginner too.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-possessive.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, 'possessive', 'possessive', level, { pos: 'possessive', person: 1, number: 'sg' }).map((d) => d.id);

describe('the comparison notes for the possessive', () => {
  it('Improver shows the four notes', () => {
    expect(ids()).toEqual(['possessor-agreement', 'possessive-position', 'possessive-accent', 'possessive-third-person']);
  });

  it('Beginner leaves out the second accent', () => {
    expect(ids('beginner')).toEqual(['possessor-agreement', 'possessive-position', 'possessive-third-person']);
  });

  it('no other part of speech shows them', () => {
    expect(selectDivergences(DIVERGENCES, 'noun', 'kafes', 'improver').map((d) => d.id)).not.toContain('possessor-agreement');
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => d.appliesTo.pos === 'possessive');
    expect(rows).toHaveLength(4);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
```

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -100,4 +100,13 @@
   });
 
+  it('shows the possessive: the Romanian table and the noun phrases with every possessor', () => {
+    expect(sheet).toContain('- 1sg: meu · mei · mea · mele');
+    expect(sheet).toContain('- 3sg.f: ei');
+    expect(sheet).toContain('το σπίτι μου · το σπίτι σου · το σπίτι του · το σπίτι της · το σπίτι μας · το σπίτι σας · το σπίτι τους');
+    expect(sheet).toContain('η θάλασσά μου');
+    expect(sheet).toContain('casa mea · casa ta · casa lui · casa ei · casa noastră · casa voastră · casa lor');
+    expect(sheet).toContain('my house · your house · his house · her house · our house · your house · their house');
+  });
+
   it('says how many records are unverified', () => {
     expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-possessive.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -801,3 +801,47 @@
     verified: false,
   },
+  {
+    id: 'possessor-agreement',
+    appliesTo: { pos: 'possessive', lexeme: 'possessive' },
+    point: 'What the possessive agrees with',
+    el: 'the possessor: μου, σου, του, της, μας, σας, τους',
+    ro: 'the possessed noun, not the possessor: casa mea, câinele meu, copiii mei, mările mele',
+    en: 'the possessor: my, your, his, her, our, their',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'possessive-position',
+    appliesTo: { pos: 'possessive', lexeme: 'possessive' },
+    point: 'Where the possessive goes',
+    el: 'after the noun, with the article kept: το σπίτι μου',
+    ro: 'after the noun, which carries the suffix article: casa mea',
+    en: 'before the noun, with no article: my house',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'possessive-accent',
+    appliesTo: { pos: 'possessive', lexeme: 'possessive' },
+    point: 'The second accent',
+    el: 'a noun whose stress is too far back takes a second accent: η θάλασσά μου, ο δάσκαλός μου',
+    ro: 'nothing changes',
+    en: 'nothing changes',
+    tag: 'differs',
+    level: 'extra',
+    verified: false,
+  },
+  {
+    id: 'possessive-third-person',
+    appliesTo: { pos: 'possessive', lexeme: 'possessive' },
+    point: 'His and her',
+    el: 'του (his) and της (her); τους for "their"',
+    ro: 'the invariable lui, ei and lor: copilul lui',
+    en: 'his, her, its and their',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -10,5 +10,8 @@
 import { unitText } from '../glossLinks';
 import { RECIPIENTS } from '../engine/objects';
-import type { Clitic, GreekInterrogative, GreekLexeme, GreekPreposition, GreekVerb, SlotOf } from '../types';
+import { nounPhrase } from '../engine/agree';
+import { POSSESSORS } from '../engine/possessive';
+import { RO_POSSESSIVES } from '../data/possessives';
+import type { Clitic, GreekInterrogative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
 import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
@@ -161,4 +164,25 @@
 }
 
+/** The Romanian possessives by possessor, and every noun with every possessor in the three languages (spec 9). */
+function possessiveLines(lexemes: Record<string, GreekLexeme>): string[] {
+  const table = Object.entries(RO_POSSESSIVES).map(
+    ([key, entry]) =>
+      `- ${key}: ${typeof entry === 'string' ? entry : `${entry.m.sg} · ${entry.m.pl} · ${entry.f.sg} · ${entry.f.pl} (masculine singular, masculine plural, feminine singular, feminine plural)`}`,
+  );
+  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
+  const phrases = nouns.flatMap((noun) =>
+    (['sg', 'pl'] as const).flatMap((number) => {
+      const all = POSSESSORS.map((p) => nounPhrase(noun, number, 'nom', { article: 'definite', possessor: p.slot }));
+      return [
+        `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}):`,
+        `  - ${LANG_NAME.el}: ${all.map((n) => richText(n.el)).join(' · ')}`,
+        `  - ${LANG_NAME.ro}: ${all.map((n) => n.ro).join(' · ')}`,
+        `  - ${LANG_NAME.en}: ${all.map((n) => n.en).join(' · ')}`,
+      ];
+    }),
+  );
+  return ['- Romanian possessives (they agree with the possessed noun):', ...table, '- Noun phrases with each possessor, nominative (generated):', ...phrases];
+}
+
 function lexemeSection(l: GreekLexeme, lexemes: Record<string, GreekLexeme>): string[] {
   const missing = (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]);
@@ -172,4 +196,5 @@
       ...(l.pos === 'interrogative' ? interrogativeLines(l, lexemes) : []),
       ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
+      ...(l.pos === 'possessive' ? possessiveLines(lexemes) : []),
     ]),
     '',
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1230 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-possessive.test.ts src/data/divergences.ts src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: comparison notes and a review-sheet section for the possessive

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces: a spec that matches what was built (the panel state, δρόμος in Romanian, the validator rule) and records it in section 24.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, 1)


sub("δρόμος (masculine in -ος) and θάλασσα", "δρόμος (masculine in -ος; neuter in Romanian, *drum*) and θάλασσα")
s = s.rstrip() + """
| Panel state | `PanelState` gains `nounCase` (the role of the noun a possessive goes with, since the possessive's own slot holds only the possessor) and `possessor` (the noun panel's Whose? control); a noun that a possessive points at starts with that possessor | 5.3 |
| δρόμος | Its Romanian gender is neuter (*un drum, două drumuri*), so the possessive reads *drumurile mele* in the plural; the earlier data said masculine | 6.6 |
| Validator | A noun followed by a possessive is written with the second accent where the stress rule asks for it; a possessive points at a noun and carries the pronoun its possessor says | 7 |
| Plan 10 built | The weak possessive: the lexeme, the engine (`nounPhrase` with a possessor, `possessedNounForm`), the possessive panel, Whose? in the noun panel, phrases 63 to 68, four notes, the review sheet; Plan 11 (δικός and the genitive possessor) is still to do | 24 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "neuter in Romanian, \*drum\*" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "nounCase" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Plan 10 built" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: three numbers, each at least `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 10 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.2, 4.3: the `possessive` slot, the Greek pronoun after the noun, the second accent, the Romanian table by possessor and possessed noun, the English possessives | 1 |
| 5.3: the possessive panel (Whose?, noun, number, role, "with a noun", the pronoun on its own, the person table in Improver) | 1 |
| 5.3: Whose? on the noun panel and the row "with a possessive" | 2 |
| 4.4, 7: a possessive is a token of its own that points at its noun; the noun's text carries the accent | 3 |
| 6.1: phrases 63 to 68 and the *Possession* theme | 3 |
| 5.2: possessor-agreement, possessive-position, possessive-accent, possessive-third-person | 4 |
| 9: the review additions (the Romanian table and the generated noun phrases on the review sheet) | 4 |
| 24: the decisions | 5 |
| Not in this plan (Plan 11): δικός μου, the possessor noun in the genitive, phrases 69 to 72 and their two notes | |
