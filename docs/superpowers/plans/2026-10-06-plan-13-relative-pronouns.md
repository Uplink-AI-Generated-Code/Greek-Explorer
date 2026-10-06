# Relative Pronouns Implementation Plan (Plan 13)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the relative pronouns που and ο οποίος / η οποία / το οποίο in five jobs (subject, object, to whom, whose, after a preposition) with their Romanian counterpart *care* (*pe care*, *căruia*, *al cărui*, *cu care*) and the English who, whom, which and whose, a panel for each, six comparison notes and phrases 81 to 89 in a new theme *Relative clauses*. The free relatives ό,τι, όπου and όποιος are Plan 14.

**Architecture:** A new part of speech, the relative pronoun, with the slot `{ pos: 'relative', role, gender, number, preposition? }` (the antecedent's gender and number and the pronoun's job in its clause) and two lexemes. The Greek chip of ο οποίος (article, case and any preposition, σε fused: *στον οποίο*) is built in `engine/relative.ts`; `engine/relativeGroup.ts` builds the pronoun group in three languages from small shared tables (`data/relatives.ts`). The panel shows the group for the job with the pattern the clause needs (*που του …*, *που … με αυτό*, *στον οποίο*) and the other Greek word; it has controls for the noun, the number, the job, the preposition and, for "whose", the noun owned. A relative token points at the noun directly before it.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 4.4, 5.2, 5.3, 6.1, 7, 9 and 26; the repository is at commit cac476d or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes (double quotes where the text contains an apostrophe), two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase, divergence row and review item has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what the data produces, ignoring capitals and trailing punctuation (the validator checks it).
- Colour is never the only signal, and `lang` attributes follow the existing components (this plan adds no new component).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.
- An App test can time out (the default is 5 seconds) on a heavily loaded machine. If a test fails only with a timeout, run `npx vitest run --testTimeout=60000` before concluding anything.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement except where it says so.

1. **One part of speech, two lexemes.** `GreekRelative.kind` is `'pou'` (id `rel-pou`) or `'opoios'` (id `rel-opoios`). The Romanian and English words are shared tables, not stored per lexeme.
2. **The chip of ο οποίος includes its preposition.** *με το οποίο* and *στον οποίο* are one token (spec 26 said the preposition would be a token of its own; Task 5 corrects the spec). σε is written as one word with the article (*στον οποίο*); the job "to whom" always uses σε, and the job after a preposition may use any of πάνω από, κάτω από, με, για, από, μέχρι and σε (σε with its direction sense, *la*, "to").
3. **που is shown with the pattern its clause needs:** *που* (subject, object), *που του …* (to whom: the 3rd person weak pronoun of the antecedent's gender and number), *που το σπίτι του …* (whose: the noun owned with its article, then the pronoun), *που … με αυτό* (after a preposition: the strong pronoun after the preposition). The panel shows these; a phrase token is just *που*, with the pronoun inside the verb token (*του έδωσα*).
4. **Romanian.** *care* (subject), *pe care* (object: every direct object, a thing as well as a person), the dative *căruia / căreia / cărora*, the genitive *cărui / cărei / căror* with *al / a / ai / ale* before it agreeing with the noun owned (the table of the emphatic possessive, singular), and the preposition + *care* (*cu care*). A neuter follows the masculine in the singular and the feminine in the plural.
5. **English.** The `animate` flag on a noun (σκύλος, αλεπού, παιδί) decides who or whom against which: *who*, *whom*, *to whom*, *with whom*; *which*, *to which*, *with which*; *whose house*. The panel does not offer "that"; the note `relative-omitted` and the phrases show it.
6. **Controls and defaults.** Noun it refers to, how many, Role in its clause; the Preposition control appears for the job after a preposition and starts at με; the Noun owned control appears for "whose" and starts at σπίτι (σκύλος when the antecedent is the house). The own word's row comes first, the other Greek word second. The Improver table lists all five jobs for the noun, the one in use outlined.
7. **State.** `PanelState.owned` (a noun lexeme id). A "whose" token starts with the noun that follows its article; `applyControl` rebuilds the state in a fixed key order so that `sameState` is true after choosing the phrase's own noun again.
8. **Tokens.** A relative token points at the noun directly before it; its slot gender and number equal the noun's; only the job after a preposition has a `preposition`; "whose" is followed by the article and the noun owned (and ο οποίος only: a που token may be the subject, the object or "to whom"). The pronoun inside a relative clause is part of the verb token.
9. **Modules.** `engine/relative.ts` (the chip, `inflectRelative`) imports only data, so `greek.ts` can use it without an import cycle; `engine/relativeGroup.ts` (the group in three languages) imports `agree.ts`, the clitics and the possessive engine.
10. **Phrases.** 81 and 88 are Beginner, the others Improver. In "The coffee I want" the natural English row has no *that* and the literal row keeps it. The Romanian clitic stays inside the verb gloss (*am mâncat-o*, *o vreau*), as in the earlier phrases.
11. **Tests.** The Romanian and English cells are the same in the που and the ο οποίος rows, so an App test may find a cell twice and uses `getAllByRole(...)[0]`.
12. **Delivery.** With this plan the picker lists 89 phrases.

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `RelativeRole`; the slot `{ pos: 'relative' }`; `GreekRelative`; `GreekNoun.animate` |
| `src/data/{relatives,lexemes,review,phrases,divergences}.ts` | the roles, the preposition list, the ο οποίος endings and the Romanian *care* tables (new `relatives.ts`); the lexemes `rel-pou`, `rel-opoios` and the `animate` flags; a review item; phrases 81 to 89; six comparison rows |
| `src/engine/{relative,relativeGroup,possessive,greek}.ts` | the chip and the group; `agreeGender` and `roAgreement` exported; the `inflect` case |
| `src/panels/{relative,panels,types}.ts` | the relative pronoun panel; `buildPanel`, `applyControl` and `initialState`; the control keys `preposition` and `owned`; `PanelState.owned` |
| `src/validate/{validate,reviewSheet}.ts` | the relative lexeme and slots, the relative token rules; the review-sheet section |
| tests | one new test file per task, plus the picker order test |

---

### Task 1: The relative pronoun in the engine and its panel

**Files:**
- Create: `src/data/relatives.ts`
- Create: `src/engine/relative.ts`
- Create: `src/engine/relativeGroup.ts`
- Create: `src/panels/relative.ts`
- Create (test): `src/engine/relative.test.ts`
- Create (test): `src/panels/relative.test.ts`
- Create (test): `src/validate/relative-validate.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/review.ts`
- Modify: `src/engine/greek.ts`
- Modify: `src/engine/possessive.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/types.ts`
- Modify: `src/types.ts`
- Modify: `src/validate/validate.ts`

**Interfaces:**
- Consumes: `GreekNoun`, `inflect`, `buildPanel`, `nounControl`, `numberControl`, `nounOf`, `nounOptions`, `nounPhrase`, `greekClitic`, `GREEK_STRONG`, `RO_ALONE`, `roBareNoun` (possessive engine), `ARTICLE_DEF`, `PREPOSITIONS`, `validate` and `slotsFor`.
- Produces: `RelativeRole`, the slot `{ pos: 'relative', role, gender, number, preposition? }`, `GreekRelative`, `GreekNoun.animate`; `src/data/relatives.ts` (`RELATIVE_ROLES`, `RELATIVE_PREPOSITIONS`, `OPOIOS_STEM`, `OPOIOS_ENDINGS`, `RO_CARE_DATIVE`, `RO_CARE_GENITIVE`); `greekOpoios`, `opoiosParts`, `opoiosWord`, `relativeCase`, `relativePreposition`, `inflectRelative` in `src/engine/relative.ts`; `relativeGroup(kind, slot, antecedent, owned)` in `src/engine/relativeGroup.ts`; the lexemes `rel-pou` and `rel-opoios`; `relativePanel`; the control keys `preposition` and `owned` and `PanelState.owned`; the review item `ending-table:ro-relatives`; the validator's relative lexeme checks and slots.

This task builds the forms and the panel for the default state; the controls that change the state and the seeding from a phrase come in Task 2, the phrases in Task 3. The expected strings in the tests are worked out by hand from the rules in Decisions 2 to 5. `engine/relative.ts` must not import `agree.ts` (Decision 9).

- [ ] **Step 1: Write the tests**

Create `src/engine/relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { Gender, GreekRelative, Num, RelativeRole, SlotOf } from '../types';
import { inflect } from './greek';
import { greekOpoios, opoiosWord } from './relative';
import { relativeGroup } from './relativeGroup';
import { formText, richText } from './segments';

const slot = (role: RelativeRole, gender: Gender, number: Num, preposition?: string): SlotOf<'relative'> => ({
  pos: 'relative',
  role,
  gender,
  number,
  ...(preposition ? { preposition } : {}),
});
const group = (kind: 'pou' | 'opoios', s: SlotOf<'relative'>, antecedent: string, owned = 'spiti') => {
  const g = relativeGroup(kind, s, getNoun(antecedent), getNoun(owned));
  return { el: richText(g.el), ro: g.ro, en: g.en };
};

describe('the relative lexemes', () => {
  it('που and ο οποίος are unverified', () => {
    for (const id of ['rel-pou', 'rel-opoios']) {
      expect(getLexeme(id).pos).toBe('relative');
      expect(getLexeme(id).verified).toEqual({ el: false, ro: false, en: false });
    }
  });

  it('the token text of που never changes, and ο οποίος is a chip with its article', () => {
    const pou = getLexeme('rel-pou') as GreekRelative;
    const opoios = getLexeme('rel-opoios') as GreekRelative;
    expect(formText(inflect(pou, slot('whose', 'f', 'pl')))).toBe('που');
    expect(formText(inflect(opoios, slot('subject', 'm', 'sg')))).toBe('ο οποίος');
  });

  it('the animals and the child are animate; the house, the sea and the bread are not', () => {
    expect(['skylos', 'alepou', 'paidi'].every((id) => getNoun(id).animate === true)).toBe(true);
    expect(['spiti', 'thalassa', 'psomi', 'kafes'].every((id) => getNoun(id).animate === undefined)).toBe(true);
  });
});

describe('ο οποίος', () => {
  it('takes the case of its job and the gender and number of its noun', () => {
    const cell = (role: RelativeRole, gender: Gender, number: Num) => greekOpoios(slot(role, gender, number));
    expect([cell('subject', 'm', 'sg'), cell('subject', 'f', 'sg'), cell('subject', 'n', 'sg'), cell('subject', 'm', 'pl'), cell('subject', 'f', 'pl'), cell('subject', 'n', 'pl')]).toEqual([
      'ο οποίος', 'η οποία', 'το οποίο', 'οι οποίοι', 'οι οποίες', 'τα οποία',
    ]);
    expect([cell('object', 'm', 'sg'), cell('object', 'f', 'sg'), cell('object', 'n', 'sg'), cell('object', 'm', 'pl'), cell('object', 'f', 'pl')]).toEqual([
      'τον οποίο', 'την οποία', 'το οποίο', 'τους οποίους', 'τις οποίες',
    ]);
    expect([cell('whose', 'm', 'sg'), cell('whose', 'f', 'sg'), cell('whose', 'n', 'sg'), cell('whose', 'm', 'pl')]).toEqual([
      'του οποίου', 'της οποίας', 'του οποίου', 'των οποίων',
    ]);
    expect(opoiosWord(slot('object', 'm', 'sg'))).toBe('οποίο');
  });

  it('σε fuses with the article for "to whom", and the other prepositions stand apart', () => {
    expect(greekOpoios(slot('indirect', 'm', 'sg'))).toBe('στον οποίο');
    expect(greekOpoios(slot('indirect', 'f', 'sg'))).toBe('στην οποία');
    expect(greekOpoios(slot('indirect', 'n', 'pl'))).toBe('στα οποία');
    expect(greekOpoios(slot('preposition', 'n', 'sg', 'se'))).toBe('στο οποίο');
    expect(greekOpoios(slot('preposition', 'n', 'sg', 'me'))).toBe('με το οποίο');
    expect(greekOpoios(slot('preposition', 'f', 'sg', 'pano'))).toBe('πάνω από την οποία');
    expect(greekOpoios(slot('preposition', 'm', 'pl', 'gia'))).toBe('για τους οποίους');
  });

  it('a job after a preposition needs the preposition', () => {
    expect(() => greekOpoios(slot('preposition', 'n', 'sg'))).toThrow(/needs the preposition/);
  });
});

describe('the pronoun group in three languages', () => {
  it('subject and object: που stands alone; Romanian care and pe care; English who, whom, which', () => {
    expect(group('pou', slot('subject', 'n', 'sg'), 'paidi')).toEqual({ el: 'που', ro: 'care', en: 'who' });
    expect(group('opoios', slot('subject', 'n', 'sg'), 'paidi')).toEqual({ el: 'το οποίο', ro: 'care', en: 'who' });
    expect(group('pou', slot('subject', 'n', 'sg'), 'spiti').en).toBe('which');
    expect(group('opoios', slot('object', 'm', 'sg'), 'skylos')).toEqual({ el: 'τον οποίο', ro: 'pe care', en: 'whom' });
    expect(group('pou', slot('object', 'n', 'sg'), 'psomi')).toEqual({ el: 'που', ro: 'pe care', en: 'which' });
  });

  it('to whom: που with a pronoun, the dative of care, "to whom"', () => {
    expect(group('pou', slot('indirect', 'n', 'sg'), 'paidi')).toEqual({ el: 'που του …', ro: 'căruia', en: 'to whom' });
    expect(group('opoios', slot('indirect', 'n', 'sg'), 'paidi').el).toBe('στο οποίο');
    expect(group('pou', slot('indirect', 'f', 'sg'), 'alepou')).toEqual({ el: 'που της …', ro: 'căreia', en: 'to whom' });
    expect(group('pou', slot('indirect', 'n', 'pl'), 'paidi')).toEqual({ el: 'που τους …', ro: 'cărora', en: 'to whom' });
    expect(group('pou', slot('indirect', 'n', 'sg'), 'spiti').en).toBe('to which');
  });

  it('whose: the first Romanian word follows the owned thing, the second the antecedent', () => {
    expect(group('opoios', slot('whose', 'm', 'sg'), 'skylos', 'spiti')).toEqual({ el: 'του οποίου το σπίτι', ro: 'a cărui casă', en: 'whose house' });
    expect(group('pou', slot('whose', 'm', 'sg'), 'skylos', 'spiti').el).toBe('που το σπίτι του …');
    expect(group('opoios', slot('whose', 'f', 'sg'), 'thalassa', 'skylos')).toEqual({ el: 'της οποίας ο σκύλος', ro: 'al cărei câine', en: 'whose dog' });
    expect(group('pou', slot('whose', 'f', 'sg'), 'thalassa', 'skylos').el).toBe('που ο σκύλος της …');
    expect(group('opoios', slot('whose', 'n', 'pl'), 'paidi', 'skylos')).toEqual({ el: 'των οποίων ο σκύλος', ro: 'al căror câine', en: 'whose dog' });
  });

  it('after a preposition: ο οποίος with it, που with the strong pronoun after the clause', () => {
    expect(group('opoios', slot('preposition', 'n', 'sg', 'me'), 'paidi')).toEqual({ el: 'με το οποίο', ro: 'cu care', en: 'with whom' });
    expect(group('pou', slot('preposition', 'n', 'sg', 'me'), 'spiti')).toEqual({ el: 'που … με αυτό', ro: 'cu care', en: 'with which' });
    expect(group('pou', slot('preposition', 'm', 'sg', 'gia'), 'skylos')).toEqual({ el: 'που … για αυτόν', ro: 'pentru care', en: 'for whom' });
    expect(group('opoios', slot('preposition', 'n', 'sg', 'se'), 'spiti')).toEqual({ el: 'στο οποίο', ro: 'la care', en: 'to which' });
    expect(group('pou', slot('preposition', 'n', 'pl', 'apo'), 'paidi').el).toBe('που … από αυτά');
  });
});
```

Create `src/panels/relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, RelativeRole, SlotOf } from '../types';
import { buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'relative'>> = {}): SlotOf<'relative'> => ({
  pos: 'relative',
  role: 'subject',
  gender: 'n',
  number: 'sg',
  ...patch,
});
const stateOf = (slot: SlotOf<'relative'>, noun: string, patch: Partial<PanelState> = {}): PanelState => ({ slot, noun, nounNumber: slot.number, ...patch });
const panelFor = (lexeme: string, state: PanelState, level: Level = 'beginner') => buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);

describe('the relative pronoun panel', () => {
  it('που shows its own pattern first and ο οποίος second, with the same Romanian and English', () => {
    const p = panelFor('rel-pou', stateOf(slotOf(), 'paidi'));
    expect(p.lemma).toBe('που');
    expect(p.posLabel).toBe('relative: who / which / that');
    expect(p.rows.map((r) => r.label)).toEqual(['with που', 'with ο οποίος']);
    expect(cells(p, 0)).toEqual({ el: 'που', ro: 'care', en: 'who' });
    expect(cells(p, 1)).toEqual({ el: 'το οποίο', ro: 'care', en: 'who' });
  });

  it('ο οποίος puts its own row first', () => {
    const p = panelFor('rel-opoios', stateOf(slotOf({ role: 'object', gender: 'm' }), 'skylos'));
    expect(p.lemma).toBe('ο οποίος / η οποία / το οποίο');
    expect(p.rows.map((r) => r.label)).toEqual(['with ο οποίος', 'with που']);
    expect(cells(p, 0)).toEqual({ el: 'τον οποίο', ro: 'pe care', en: 'whom' });
    expect(cells(p, 1)).toEqual({ el: 'που', ro: 'pe care', en: 'whom' });
  });

  it('the Improver label says whether the word changes', () => {
    expect(panelFor('rel-pou', stateOf(slotOf(), 'paidi'), 'improver').posLabel).toBe('relative pronoun · never changes');
    expect(panelFor('rel-opoios', stateOf(slotOf(), 'paidi'), 'improver').posLabel).toBe('relative pronoun · agrees with its noun');
  });

  it('offers the noun, how many and the role, and the preposition only after a preposition', () => {
    expect(keys(panelFor('rel-pou', stateOf(slotOf(), 'paidi')))).toEqual(['noun', 'number', 'role']);
    const withPreposition = panelFor('rel-pou', stateOf(slotOf({ role: 'preposition', preposition: 'me' }), 'paidi'));
    expect(keys(withPreposition)).toEqual(['noun', 'number', 'role', 'preposition']);
    expect(withPreposition.controls[3].value).toBe('me');
    expect(withPreposition.controls[3].options.map((o) => o.value)).toEqual(['pano', 'kato', 'me', 'gia', 'apo', 'mexri', 'se']);
    expect(cells(withPreposition, 0)).toEqual({ el: 'που … με αυτό', ro: 'cu care', en: 'with whom' });
  });

  it('the role control lists the five jobs', () => {
    const role = panelFor('rel-pou', stateOf(slotOf(), 'paidi')).controls[2];
    expect(role.options.map((o) => o.value)).toEqual(['subject', 'object', 'indirect', 'whose', 'preposition']);
    expect(role.value).toBe('subject');
  });

  it('whose has a Noun owned control, a house by default and a dog when the antecedent is the house', () => {
    const p = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose', gender: 'm' }), 'skylos'));
    expect(keys(p)).toEqual(['noun', 'number', 'role', 'owned']);
    expect(p.controls[3].value).toBe('spiti');
    expect(cells(p, 0)).toEqual({ el: 'του οποίου το σπίτι', ro: 'a cărui casă', en: 'whose house' });
    const house = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose' }), 'spiti'));
    expect(house.controls[3].value).toBe('skylos');
    const chosen = panelFor('rel-opoios', stateOf(slotOf({ role: 'whose', gender: 'f' }), 'thalassa', { owned: 'paidi' }));
    expect(cells(chosen, 0)).toEqual({ el: 'της οποίας το παιδί', ro: 'al cărei copil', en: 'whose child' });
  });

  it('Improver: all five jobs for the noun, with the one in use outlined', () => {
    const p = panelFor('rel-pou', stateOf(slotOf({ role: 'indirect' }), 'paidi'), 'improver');
    expect(p.full.map((r) => r.label)).toEqual(['subject', 'object', 'to whom', 'whose', 'after a preposition']);
    expect(richText(p.full[2].el)).toBe('που του … · στο οποίο');
    expect(p.full[2].ro).toEqual([{ text: 'căruia', role: 'plain' }]);
    expect(p.full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['to whom']);
    expect(richText(p.full[4].el)).toBe('που … με αυτό · με το οποίο');
    expect(panelFor('rel-pou', stateOf(slotOf(), 'paidi')).full).toEqual([]);
  });

  it('follows the number of the noun: τα παιδιά …', () => {
    const roles: RelativeRole[] = ['indirect', 'whose'];
    const p = panelFor('rel-pou', stateOf(slotOf({ role: roles[0], number: 'pl' }), 'paidi'));
    expect(cells(p, 0)).toEqual({ el: 'που τους …', ro: 'cărora', en: 'to whom' });
    expect(cells(p, 1).el).toBe('στα οποία');
  });
});
```

Create `src/validate/relative-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekRelative } from '../types';
import { slotsFor, validate } from './validate';

const pou = LEXEMES['rel-pou'] as GreekRelative;

describe('the relative lexemes in the validator', () => {
  it('are valid', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });

  it('offer every job, with every preposition for the job after a preposition', () => {
    const slots = slotsFor(pou);
    // 3 genders × 2 numbers × (4 jobs + 7 prepositions)
    expect(slots).toHaveLength(66);
    expect(slots.filter((s) => s.pos === 'relative' && s.role === 'preposition')).toHaveLength(42);
    expect(slots.filter((s) => s.pos === 'relative' && s.role !== 'preposition').every((s) => s.pos === 'relative' && s.preposition === undefined)).toBe(true);
  });

  it('wants a meaning', () => {
    expect(validate({ lexemes: { ...LEXEMES, 'rel-pou': { ...pou, meaning: '' } }, phrases: [] })).toContain('lexeme rel-pou: an empty meaning');
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/relative.test.ts src/panels/relative.test.ts src/validate/relative-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/data/relatives.ts`:

```ts
import type { Case, Gender, Num, RelativeRole } from '../types';

/** The jobs a relative pronoun does in its clause, with the label of the Role control. */
export const RELATIVE_ROLES: { value: RelativeRole; label: string }[] = [
  { value: 'subject', label: 'subject (the man who came)' },
  { value: 'object', label: 'object (the bread that I ate)' },
  { value: 'indirect', label: 'to whom (the child I gave it to)' },
  { value: 'whose', label: 'whose (the child whose dog)' },
  { value: 'preposition', label: 'after a preposition (the child I go with)' },
];

/** The prepositions the relative pronoun may follow; σε is the direction "to" (la). */
export const RELATIVE_PREPOSITIONS = ['pano', 'kato', 'me', 'gia', 'apo', 'mexri', 'se'] as const;

/** ο οποίος: the stem and the endings (the accusative masculine has no ν: τον οποίο). */
export const OPOIOS_STEM = 'οποί';
export const OPOIOS_ENDINGS: Record<Num, Record<Case, Record<Gender, string>>> = {
  sg: {
    nom: { m: 'ος', f: 'α', n: 'ο' },
    acc: { m: 'ο', f: 'α', n: 'ο' },
    gen: { m: 'ου', f: 'ας', n: 'ου' },
  },
  pl: {
    nom: { m: 'οι', f: 'ες', n: 'α' },
    acc: { m: 'ους', f: 'ες', n: 'α' },
    gen: { m: 'ων', f: 'ων', n: 'ων' },
  },
};

/**
 * Romanian *care* in the dative (căruia, căreia, cărora) and the genitive (cărui, cărei, căror), by the Romanian gender of the
 * antecedent (a neuter follows the masculine in the singular and the feminine in the plural). A ReviewItem covers both tables.
 */
export const RO_CARE_DATIVE: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'căruia', pl: 'cărora' },
  f: { sg: 'căreia', pl: 'cărora' },
};
export const RO_CARE_GENITIVE: Record<'m' | 'f', Record<Num, string>> = {
  m: { sg: 'cărui', pl: 'căror' },
  f: { sg: 'cărei', pl: 'căror' },
};
```

Create `src/engine/relative.ts`:

```ts
import { getLexeme } from '../data/lexemes';
import { OPOIOS_ENDINGS, OPOIOS_STEM } from '../data/relatives';
import { ARTICLE_DEF } from '../data/paradigms';
import type { Case, Form, GreekPreposition, GreekRelative, RelativeRole, SlotOf } from '../types';

type RelativeSlot = SlotOf<'relative'>;

/** The case of the pronoun in its own clause: the subject is nominative, whose genitive, the rest accusative. */
export const relativeCase = (role: RelativeRole): Case => (role === 'subject' ? 'nom' : role === 'whose' ? 'gen' : 'acc');

/** The preposition before ο οποίος: σε for "to whom", the chosen one after a preposition; none for the other roles. */
export function relativePreposition(slot: RelativeSlot): GreekPreposition | undefined {
  const id = slot.role === 'indirect' ? 'se' : slot.role === 'preposition' ? slot.preposition : undefined;
  if (slot.role === 'preposition' && !id) throw new Error('a relative pronoun after a preposition needs the preposition');
  if (!id) return undefined;
  const prep = getLexeme(id);
  if (prep.pos !== 'preposition') throw new Error(`${id} is not a preposition`);
  return prep;
}

/** The word οποίος in the form its role needs: οποίος, οποίο, οποίου. */
export const opoiosWord = (slot: RelativeSlot): string => OPOIOS_STEM + OPOIOS_ENDINGS[slot.number][relativeCase(slot.role)][slot.gender];

/** The parts of the chip: an optional preposition (στον, with the article inside), the article, the word. */
export function opoiosParts(slot: RelativeSlot): { preposition?: string; article?: string; word: string } {
  const prep = relativePreposition(slot);
  const article = ARTICLE_DEF[slot.gender][slot.number][relativeCase(slot.role)];
  const word = opoiosWord(slot);
  if (!prep) return { article, word };
  // σε is written as one word with the article (στον οποίο); the other prepositions stand apart (με τον οποίο).
  return prep.fused ? { preposition: prep.fused[slot.gender][slot.number], word } : { preposition: prep.lemma, article, word };
}

/** The whole chip of ο οποίος: ο οποίος, τον οποίο, στον οποίο, του οποίου, με τον οποίο. */
export function greekOpoios(slot: RelativeSlot): string {
  const { preposition, article, word } = opoiosParts(slot);
  return [preposition, article, word].filter(Boolean).join(' ');
}

/** The text of a relative token: που, or the chip of ο οποίος. */
export function inflectRelative(l: GreekRelative, s: RelativeSlot): Form {
  return { stem: l.kind === 'pou' ? 'που' : greekOpoios(s), ending: '' };
}
```

Create `src/engine/relativeGroup.ts`:

```ts
import { RO_ALONE } from '../data/possessives';
import { GREEK_STRONG } from '../data/clitics';
import { RO_CARE_DATIVE, RO_CARE_GENITIVE } from '../data/relatives';
import type { GreekNoun, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { greekClitic } from './clitics';
import { roAgreement, roBareNoun } from './possessive';
import { opoiosParts, relativePreposition } from './relative';
import { joinRich, type Rich } from './segments';

type RelativeSlot = SlotOf<'relative'>;

export interface RelativeGroup {
  el: Rich;
  ro: string;
  en: string;
}

/** The pronoun the clause needs for the antecedent, in the form of the 3rd person: του, της, τους. */
const resumptive = (slot: RelativeSlot): string =>
  greekClitic({ role: 'indirect', person: 3, number: slot.number, gender: slot.gender });

/** The Greek strong pronoun after a preposition: με αυτόν, σε αυτό. */
const strong = (slot: RelativeSlot): string => GREEK_STRONG[`3${slot.number}`][slot.gender];

const ownedPhrase = (owned: GreekNoun): Rich => nounPhrase(owned, 'sg', 'nom', { article: 'definite' }).el;

/**
 * Greek που and the pronoun the clause needs for the job it does: που, που του …, που το σπίτι του …, που … με αυτόν.
 * The dots stand where the rest of the clause goes (spec 26).
 */
function pouGreek(slot: RelativeSlot, owned: GreekNoun): Rich {
  const word = (text: string): Rich => [{ text, role: 'plain' }];
  switch (slot.role) {
    case 'subject':
    case 'object':
      return word('που');
    case 'indirect':
      return joinRich([word('που'), [{ text: resumptive(slot), role: 'clitic' }], word('…')]);
    case 'whose':
      return joinRich([word('που'), ownedPhrase(owned), [{ text: resumptive(slot), role: 'clitic' }], word('…')]);
    case 'preposition': {
      const prep = relativePreposition(slot);
      return joinRich([word('που'), word('…'), word(prep?.lemma ?? ''), [{ text: strong(slot), role: 'pronoun' }]]);
    }
  }
}

/** ο οποίος with its job: ο οποίος, τον οποίο, στον οποίο, του οποίου + the owned noun, με τον οποίο. */
function opoiosGreek(slot: RelativeSlot, owned: GreekNoun): Rich {
  const { preposition, article, word } = opoiosParts(slot);
  const chip = joinRich([
    ...(preposition ? [[{ text: preposition, role: 'plain' as const }]] : []),
    ...(article ? [[{ text: article, role: 'article' as const }]] : []),
    [{ text: word, role: 'stem' as const }],
  ]);
  return slot.role === 'whose' ? joinRich([chip, ownedPhrase(owned)]) : chip;
}

/** Romanian care in the job: care, pe care, căruia, al cărui + the owned noun, cu care. */
function roGroup(slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): string {
  const gender = roAgreement(antecedent, slot.number);
  switch (slot.role) {
    case 'subject':
      return 'care';
    case 'object':
      return 'pe care';
    case 'indirect':
      return RO_CARE_DATIVE[gender][slot.number];
    case 'whose': {
      // The first word agrees with the owned thing, the second with the antecedent.
      const first = RO_ALONE[roAgreement(owned, 'sg')].sg;
      return `${first} ${RO_CARE_GENITIVE[gender][slot.number]} ${roBareNoun(owned, 'sg')}`;
    }
    case 'preposition':
      return `${relativePreposition(slot)?.ro ?? ''} care`;
  }
}

/** English who, whom, which, to whom, whose + the owned noun, with whom. */
function enGroup(slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): string {
  const person = antecedent.animate === true;
  switch (slot.role) {
    case 'subject':
      return person ? 'who' : 'which';
    case 'object':
      return person ? 'whom' : 'which';
    case 'indirect':
      return `to ${person ? 'whom' : 'which'}`;
    case 'whose':
      return `whose ${owned.en.sg}`;
    case 'preposition':
      return `${relativePreposition(slot)?.en ?? ''} ${person ? 'whom' : 'which'}`;
  }
}

/**
 * The relative pronoun with the job it does, in three languages: `kind` is the Greek word shown (που or ο οποίος); the
 * Romanian and English words are the same for both.
 */
export function relativeGroup(kind: 'pou' | 'opoios', slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): RelativeGroup {
  return {
    el: kind === 'pou' ? pouGreek(slot, owned) : opoiosGreek(slot, owned),
    ro: roGroup(slot, antecedent, owned),
    en: enGroup(slot, antecedent, owned),
  };
}
```

Create `src/panels/relative.ts`:

```ts
import { PREPOSITIONS, getNoun } from '../data/lexemes';
import { RELATIVE_PREPOSITIONS, RELATIVE_ROLES } from '../data/relatives';
import { relativeGroup } from '../engine/relativeGroup';
import { joinRich, plain } from '../engine/segments';
import type { GreekRelative, Level, RelativeRole, SlotOf } from '../types';
import { ALL, nounControl, nounOf, nounOptions, numberControl } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** The noun a "whose" shows when the learner has not chosen one: a house, or a dog when the antecedent is the house. */
const defaultOwned = (antecedent: string): string => (antecedent === 'spiti' ? 'skylos' : 'spiti');

const ROLE_ROW: Record<RelativeRole, string> = {
  subject: 'subject',
  object: 'object',
  indirect: 'to whom',
  whose: 'whose',
  preposition: 'after a preposition',
};

/** The relative pronoun as a word of its own: the pronoun group for the job, in three languages (spec 5.3, 26). */
export function relativePanel(word: GreekRelative, slot: SlotOf<'relative'>, state: PanelState, level: Level): Panel {
  const antecedent = nounOf(state);
  const owned = getNoun(state.owned ?? defaultOwned(antecedent.id));
  const preposition = slot.preposition ?? 'me';
  const withPreposition = (role: RelativeRole): SlotOf<'relative'> => {
    const { preposition: _gone, ...rest } = slot;
    return role === 'preposition' ? { ...rest, role, preposition } : { ...rest, role };
  };
  const row = (kind: 'pou' | 'opoios', label: string, role: RelativeRole = slot.role): PanelRow => {
    const g = relativeGroup(kind, withPreposition(role), antecedent, owned);
    return { label, el: g.el, ro: plain(g.ro), en: plain(g.en) };
  };
  const rows = word.kind === 'pou' ? [row('pou', 'with που'), row('opoios', 'with ο οποίος')] : [row('opoios', 'with ο οποίος'), row('pou', 'with που')];

  const controls: Control[] = [
    nounControl('Noun it refers to', state),
    numberControl(slot.number),
    { key: 'role', label: 'Role in its clause', options: RELATIVE_ROLES, value: slot.role },
  ];
  if (slot.role === 'preposition') {
    controls.push({
      key: 'preposition',
      label: 'Preposition',
      options: PREPOSITIONS.filter((p) => (RELATIVE_PREPOSITIONS as readonly string[]).includes(p.id)).map((p) => ({ value: p.id, label: `${p.lemma} (${p.en})` })),
      value: preposition,
    });
  }
  if (slot.role === 'whose') {
    controls.push({ key: 'owned', label: 'Noun owned', options: nounOptions(), value: owned.id });
  }

  const separator = [{ text: '·', role: 'plain' as const }];
  const full: PanelRow[] =
    level === 'improver'
      ? RELATIVE_ROLES.map(({ value: role }) => {
          const pou = relativeGroup('pou', withPreposition(role), antecedent, owned);
          const opoios = relativeGroup('opoios', withPreposition(role), antecedent, owned);
          return {
            label: ROLE_ROW[role],
            el: joinRich([pou.el, separator, opoios.el]),
            ro: plain(pou.ro),
            en: plain(pou.en),
            hl: role === slot.role ? ALL : undefined,
          };
        })
      : [];

  return {
    lemma: word.kind === 'pou' ? 'που' : 'ο οποίος / η οποία / το οποίο',
    posLabel:
      level === 'beginner'
        ? 'relative: who / which / that'
        : word.kind === 'pou'
          ? 'relative pronoun · never changes'
          : 'relative pronoun · agrees with its noun',
    controls,
    rows,
    full,
    plain: word.meaning,
    irregular: '',
    note: antecedent.note,
  };
}
```

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -1,3 +1,4 @@
 import type {
+  GreekRelative,
   GreekAdverb,
   CellOverride,
@@ -45,4 +46,5 @@
   id: 'skylos',
   pos: 'noun',
+  animate: true,
   lemma: 'σκύλος',
   verified: { el: false, ro: false, en: false },
@@ -66,4 +68,5 @@
   id: 'alepou',
   pos: 'noun',
+  animate: true,
   lemma: 'αλεπού',
   verified: { el: false, ro: false, en: false },
@@ -87,4 +90,5 @@
   id: 'paidi',
   pos: 'noun',
+  animate: true,
   lemma: 'παιδί',
   verified: { el: false, ro: false, en: false },
@@ -1392,4 +1396,24 @@
 );
 
+const relPou: GreekRelative = {
+  id: 'rel-pou',
+  pos: 'relative',
+  lemma: 'που',
+  verified: { el: false, ro: false, en: false },
+  kind: 'pou',
+  meaning:
+    'που never changes. As the subject or the object it stands alone (το ψωμί που έφαγα); for any other job the clause needs a pronoun (που του έδωσα) or a preposition with a pronoun (που … με αυτόν). Romanian care and English who, which or that do the same work.',
+};
+
+const relOpoios: GreekRelative = {
+  id: 'rel-opoios',
+  pos: 'relative',
+  lemma: 'ο οποίος',
+  verified: { el: false, ro: false, en: false },
+  kind: 'opoios',
+  meaning:
+    'ο οποίος agrees with the noun it refers to in gender and number and takes the case of its job in the clause (τον οποίο, του οποίου). It can follow a preposition (με τον οποίο, στον οποίο). It is more formal than που.',
+};
+
 const ti = interrogative(
   'ti',
@@ -1505,4 +1529,6 @@
   [posHow.id]: posHow,
   [edo.id]: edo,
+  [relPou.id]: relPou,
+  [relOpoios.id]: relOpoios,
   [ekei.id]: ekei,
 };
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -13,4 +13,5 @@
   { id: 'ending-table:ro-possessives', kind: 'ending-table', verified: false },
   { id: 'ending-table:ro-own', kind: 'ending-table', verified: false },
+  { id: 'ending-table:ro-relatives', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
   { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
```

Change `src/engine/greek.ts` (unified diff):

```diff
@@ -1,2 +1,3 @@
+import { inflectRelative } from './relative';
 import {
   ADJ_STRESSED,
@@ -29,4 +30,5 @@
   GreekQuantifier,
   GreekAdverb,
+  GreekRelative,
   GreekVerb,
   IrregularNote,
@@ -221,4 +223,6 @@
     case 'adverb':
       return inflectAdverb(l, s as SlotOf<'adverb'>);
+    case 'relative':
+      return inflectRelative(l as GreekRelative, s as SlotOf<'relative'>);
   }
 }
```

Change `src/engine/possessive.ts` (unified diff):

```diff
@@ -34,6 +34,6 @@
 
 /** The Romanian gender a possessive or *propriu* agrees in: a neuter follows the masculine in the singular and the feminine in the plural. */
-const agreeGender = (ro: Gender, number: Num): 'm' | 'f' => (ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro);
-const roAgreement = (noun: GreekNoun, number: Num): 'm' | 'f' => agreeGender(noun.ro.gender, number);
+export const agreeGender = (ro: Gender, number: Num): 'm' | 'f' => (ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro);
+export const roAgreement = (noun: GreekNoun, number: Num): 'm' | 'f' => agreeGender(noun.ro.gender, number);
 
 /** Romanian *propriu* with its article, agreeing with the possessed noun: propria (mea casă). */
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -9,4 +9,5 @@
   GreekAdjective,
   GreekAdverb,
+  GreekRelative,
   GreekConjunction,
   GreekInterrogative,
@@ -39,4 +40,5 @@
 import { possessivePanel } from './possessive';
 import { adverbPanel } from './adverb';
+import { relativePanel } from './relative';
 import { interrogativePanel } from './interrogative';
 import { quantifierPanel } from './quantifier';
@@ -117,4 +119,6 @@
     case 'adverb':
       return adverbPanel(lexeme as GreekAdverb, level);
+    case 'relative':
+      return relativePanel(lexeme as GreekRelative, slot, state, level);
     case 'quantifier':
       return quantifierPanel(lexeme as GreekQuantifier, slot, state, level);
@@ -164,4 +168,5 @@
         slot.pos !== 'interrogative' &&
         slot.pos !== 'adverb' &&
+        slot.pos !== 'relative' &&
         slot.pos !== 'clitic'
       ) {
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -4,5 +4,5 @@
 
 export interface Control {
-  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor' | 'owner' | 'register';
+  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor' | 'owner' | 'register' | 'preposition' | 'owned';
   label: string;
   options: Option[];
@@ -101,3 +101,5 @@
   /** The noun panel's second Whose? control: a noun that owns it, in the genitive (το σπίτι του παιδιού); a lexeme id. */
   owner?: string;
+  /** The relative pronoun's Noun owned control, for the job "whose": a noun lexeme id. */
+  owned?: string;
 }
```

Change `src/types.ts` (unified diff):

```diff
@@ -15,4 +15,6 @@
 export type QuantifierSense = 'some' | 'few';
 export type QuantifierUse = 'determiner' | 'pronoun';
+/** The job a relative pronoun does in its own clause (spec 26). */
+export type RelativeRole = 'subject' | 'object' | 'indirect' | 'whose' | 'preposition';
 /** Romanian only: the spoken forms (ăsta, ăla), which go after the noun (spec 25). */
 export type QuantifierRegister = 'spoken';
@@ -94,4 +96,5 @@
   | { pos: 'interrogative' }
   | { pos: 'adverb' }
+  | { pos: 'relative'; role: RelativeRole; gender: Gender; number: Num; preposition?: string }
   | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }
   | ({ pos: 'clitic' } & Clitic);
@@ -118,4 +121,6 @@
 export interface GreekNoun extends LexemeBase {
   pos: 'noun';
+  /** A person or an animal: English says who or whom, not which (spec 26). */
+  animate?: true;
   gender: Gender;
   class: NounClass;
@@ -350,4 +355,15 @@
 }
 
+/**
+ * A relative pronoun: που never changes, ο οποίος agrees with the noun it refers to (spec 26). Their Romanian and English
+ * words are shared tables (`src/data/relatives.ts`); the slot holds the antecedent's gender and number and the job in the clause.
+ */
+export interface GreekRelative extends LexemeBase {
+  pos: 'relative';
+  kind: 'pou' | 'opoios';
+  /** One line of meaning for the panel. */
+  meaning: string;
+}
+
 /** A place word that never changes: εδώ and εκεί (spec 25). A preposition may govern one (μέχρι εκεί). */
 export interface GreekAdverb extends LexemeBase {
@@ -417,5 +433,5 @@
 
 export type GreekLexeme =
-  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb;
+  | GreekNoun | GreekAdjective | GreekNumeral | GreekArticle | GreekVerb | GreekPreposition | GreekParticle | GreekConjunction | GreekClitic | GreekPossessive | GreekQuantifier | GreekInterrogative | GreekAdverb | GreekRelative;
 
 export type TokenIndex = number;
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -7,4 +7,5 @@
 import { possessedNounForm } from '../engine/agree';
 import { enPossessive, greekPossessive, POSSESSORS } from '../engine/possessive';
+import { RELATIVE_PREPOSITIONS, RELATIVE_ROLES } from '../data/relatives';
 import { EN_POSSESSIVES, RO_POSSESSIVES } from '../data/possessives';
 import { compose, lexicalPiece } from '../engine/compose';
@@ -86,4 +87,14 @@
     case 'adverb':
       return [{ pos: 'adverb' }];
+    case 'relative':
+      return GENDERS.flatMap((gender) =>
+        NUMS.flatMap((number) =>
+          RELATIVE_ROLES.flatMap(({ value: role }): Slot[] =>
+            role === 'preposition'
+              ? RELATIVE_PREPOSITIONS.map((preposition): Slot => ({ pos: 'relative', role, gender, number, preposition }))
+              : [{ pos: 'relative', role, gender, number }],
+          ),
+        ),
+      );
     case 'clitic':
       return cliticSlots();
@@ -233,4 +244,10 @@
     }
   }
+  if (l.pos === 'relative') {
+    if (isEmpty(l.meaning)) errors.push(`lexeme ${l.id}: an empty meaning`);
+    for (const id of RELATIVE_PREPOSITIONS) {
+      if (lexemes[id]?.pos !== 'preposition') errors.push(`lexeme ${l.id}: ${id} is not a preposition`);
+    }
+  }
   if (l.pos === 'adverb') {
     const texts = [l.ro, l.en, l.meaning, ...Object.values(l.example)];
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1398 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/relatives.ts src/engine/relative.test.ts src/engine/relative.ts src/engine/relativeGroup.ts src/panels/relative.test.ts src/panels/relative.ts src/validate/relative-validate.test.ts src/data/lexemes.ts src/data/review.ts src/engine/greek.ts src/engine/possessive.ts src/panels/panels.ts src/panels/types.ts src/types.ts src/validate/validate.ts
git commit -m "feat: the relative pronouns που and ο οποίος (forms, group in three languages, panel)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: The controls: role, preposition and noun owned

**Files:**
- Create (test): `src/panels/relative-state.test.ts`
- Modify: `src/panels/panels.ts`

**Interfaces:**
- Consumes: `applyControl`, `initialState`, `sameState`, `PanelState`, `RELATIVE_PREPOSITIONS` and `relativePanel`.
- Produces: `applyControl` for the role (the preposition comes and goes with it and starts at με), the preposition, the noun owned (fixed key order), the number and the noun of a relative slot; `initialState` seeds `owned` from the article and noun after a "whose" token.

The other parts of speech must ignore the new controls (a test checks it).

- [ ] **Step 1: Write the tests**

Create `src/panels/relative-state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'relative'>> = {}): SlotOf<'relative'> => ({ pos: 'relative', role: 'subject', gender: 'n', number: 'sg', ...patch });
const state = (slot = slotOf(), noun = 'paidi', patch: Partial<PanelState> = {}): PanelState => ({ slot, noun, nounNumber: slot.number, ...patch });
const first = (s: PanelState) => richText(buildPanel(s, { text: '', lexeme: 'rel-opoios', slot: s.slot }, 'beginner').rows[0].el);

describe('the relative pronoun controls', () => {
  it('the role control changes the job, and the preposition comes and goes with it', () => {
    const toPreposition = applyControl(state(), 'role', 'preposition');
    expect(toPreposition.slot).toEqual({ pos: 'relative', role: 'preposition', gender: 'n', number: 'sg', preposition: 'me' });
    const back = applyControl(toPreposition, 'role', 'object');
    expect(back.slot).toEqual({ pos: 'relative', role: 'object', gender: 'n', number: 'sg' });
    expect('preposition' in back.slot).toBe(false);
    expect(applyControl(applyControl(state(slotOf({ role: 'preposition', preposition: 'gia' })), 'role', 'whose'), 'role', 'preposition').slot).toMatchObject({ preposition: 'me' });
  });

  it('the preposition control changes the preposition, only after a preposition and only from the list', () => {
    const at = state(slotOf({ role: 'preposition', preposition: 'me' }));
    expect(applyControl(at, 'preposition', 'gia').slot).toMatchObject({ preposition: 'gia' });
    expect(first(applyControl(at, 'preposition', 'se'))).toBe('στο οποίο');
    expect(applyControl(at, 'preposition', 'thelo')).toBe(at);
    const subject = state();
    expect(applyControl(subject, 'preposition', 'gia')).toBe(subject);
  });

  it('the number and the noun change the slot: the noun brings its gender', () => {
    const plural = applyControl(state(slotOf({ role: 'indirect' })), 'number', 'pl');
    expect(plural.slot).toMatchObject({ number: 'pl' });
    expect(first(plural)).toBe('στα οποία');
    const dog = applyControl(state(slotOf({ role: 'object' })), 'noun', 'skylos');
    expect(dog).toMatchObject({ noun: 'skylos', slot: { gender: 'm' } });
    expect(first(dog)).toBe('τον οποίο');
  });

  it('the Noun owned control sets the noun owned, and choosing nothing new changes nothing', () => {
    const whose = state(slotOf({ role: 'whose', gender: 'm' }), 'skylos');
    const chosen = applyControl(whose, 'owned', 'paidi');
    expect(chosen.owned).toBe('paidi');
    expect(first(chosen)).toBe('του οποίου το παιδί');
    expect(applyControl(whose, 'owned', 'thelo')).toBe(whose);
  });

  it('the other parts of speech ignore the new controls', () => {
    const noun: PanelState = { slot: { pos: 'noun', number: 'sg', case: 'nom' }, noun: null, nounNumber: 'sg' };
    expect(applyControl(noun, 'owned', 'paidi')).toBe(noun);
    expect(applyControl(noun, 'preposition', 'me')).toBe(noun);
  });
});

describe('seeding the relative pronoun panel from a phrase', () => {
  const tokens: Token[] = [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'του οποίου', lexeme: 'rel-opoios', slot: slotOf({ role: 'whose' }), agreesWith: 1 },
    { text: 'ο', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 4 },
    { text: 'σκύλος', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
  ];
  const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens, glosses: [], verified: false } satisfies Phrase;

  it('starts with the antecedent and, for "whose", the noun that follows', () => {
    const s = initialState(tokens[2], phrase);
    expect(s.noun).toBe('paidi');
    expect(s.owned).toBe('skylos');
    expect(first(s)).toBe('του οποίου ο σκύλος');
  });

  it('does not seed an owned noun for another job', () => {
    const object = { ...tokens[2], slot: slotOf({ role: 'object' }) };
    expect(initialState(object, { ...phrase, tokens: [tokens[0], tokens[1], object, tokens[3], tokens[4]] }).owned).toBeUndefined();
  });

  it('choosing the phrase’s own owned noun again is no change', () => {
    const start = initialState(tokens[2], phrase);
    expect(sameState(applyControl(applyControl(start, 'owned', 'spiti'), 'owned', 'skylos'), start)).toBe(true);
  });

  it('a role round trip returns the same state', () => {
    const start = initialState({ ...tokens[2], slot: slotOf({ role: 'object' }) }, phrase);
    expect(sameState(applyControl(applyControl(start, 'role', 'preposition'), 'role', 'object'), start)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/panels/relative-state.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -2,4 +2,5 @@
 import { groupFor } from '../engine/groups';
 import { POSSESSORS } from '../engine/possessive';
+import { RELATIVE_PREPOSITIONS } from '../data/relatives';
 import { DEFAULT_OBJECT, RECIPIENTS, cliticsFor, indirectOf, nounForClitic, objectKind, type ObjectKind } from '../engine/objects';
 import { voiceOf } from '../engine/offers';
@@ -25,4 +26,5 @@
   Phrase,
   PrepSense,
+  RelativeRole,
   QuantifierDegree,
   SlotOf,
@@ -71,4 +73,9 @@
   const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === at && phrase.tokens.indexOf(t) === at + 1) : undefined;
   // A noun shows the noun that owns it: the genitive noun that points back at it (το σπίτι του παιδιού).
+  // A relative pronoun for "whose" shows the noun owned: the article and noun that follow it (του οποίου το σπίτι).
+  const ownedToken =
+    token.slot.pos === 'relative' && token.slot.role === 'whose' && phrase.tokens[at + 1]?.lexeme === 'def' && phrase.tokens[at + 2]?.slot.pos === 'noun'
+      ? phrase.tokens[at + 2]
+      : undefined;
   const owner = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'noun' && t.slot.case === 'gen' && t.agreesWith === at) : undefined;
   // δικός shows the possessive that follows it: το δικό μου σπίτι.
@@ -80,4 +87,5 @@
     ...(own && own.slot.pos === 'possessive' ? { possessor: own.slot } : {}),
     ...(owner ? { owner: owner.lexeme } : {}),
+    ...(ownedToken ? { owned: ownedToken.lexeme } : {}),
     ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
     noun,
@@ -158,4 +166,10 @@
     case 'role':
       if (slot.pos === 'clitic') return { ...state, slot: { ...slot, role: value as 'object' | 'indirect' } };
+      if (slot.pos === 'relative') {
+        // The preposition belongs to the job after a preposition only; it starts as με.
+        const { preposition: _kept, ...rest } = slot;
+        const role = value as RelativeRole;
+        return { ...state, slot: role === 'preposition' ? { ...rest, role, preposition: slot.preposition ?? 'me' } : { ...rest, role } };
+      }
       break;
     case 'case':
@@ -175,5 +189,5 @@
       break;
     case 'number':
-      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'quantifier') {
+      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'quantifier' || slot.pos === 'relative') {
         return { ...state, slot: { ...slot, number: value as Num } };
       }
@@ -259,4 +273,16 @@
       }
       break;
+    case 'preposition':
+      if (slot.pos === 'relative' && slot.role === 'preposition' && (RELATIVE_PREPOSITIONS as readonly string[]).includes(value)) {
+        return { ...state, slot: { ...slot, preposition: value } };
+      }
+      break;
+    case 'owned':
+      if (slot.pos === 'relative' && getLexeme(value).pos === 'noun') {
+        const { owned: _old, slot: _slot, ...rest } = state;
+        // A fixed key order, so that sameState (which compares JSON) is true after choosing the phrase's own noun again.
+        return { slot: state.slot, owned: value, ...rest };
+      }
+      break;
     case 'register':
       if (slot.pos === 'quantifier') {
@@ -295,5 +321,5 @@
         return { ...state, slot: next, noun: value };
       }
-      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral' || slot.pos === 'quantifier') {
+      if (slot.pos === 'adjective' || slot.pos === 'article' || slot.pos === 'numeral' || slot.pos === 'quantifier' || slot.pos === 'relative') {
         return { ...state, noun: value, slot: { ...slot, gender: noun.gender } };
       }
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1407 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/panels/relative-state.test.ts src/panels/panels.ts
git commit -m "feat: the relative pronoun controls (job, preposition, noun owned)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Relative clauses in phrases: the validator and phrases 81 to 89

**Files:**
- Create (test): `src/App.relative.test.tsx`
- Create (test): `src/data/phrases-relative.test.ts`
- Create (test): `src/validate/relative-token-validate.test.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The helpers `rows`, `u`, `seg`, `present`, `vslot`, `verbSlot`, `qslot`, `article`, `theDog`, `adverb`, `nomSg` and `accSg` in `src/data/phrases.ts`, and the lexemes of Tasks 1 and 2.
- Produces: Validator rules for a relative token (its noun, directly before it, agreeing; its text; the preposition; "whose"; που's three jobs); the phrases `the-dog-that-jumps`, `the-bread-that-i-ate`, `the-coffee-i-want`, `the-child-i-gave-the-bread-to`, `the-child-whose-dog-jumps`, `the-house-i-am-going-to`, `the-child-i-am-going-with`, `the-dog-that-is-there`, `this-is-the-house-i-have` in the new theme *Relative clauses*; the picker lists 89 phrases.

Phrase 84 puts the weak pronoun inside the verb token (*του έδωσα*): the verb slot carries one indirect clitic of the 3rd person neuter singular. The English natural row of phrase 83 has no *that*.

- [ ] **Step 1: Write the tests**

Create `src/App.relative.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

/** The Romanian and English cells are the same in both rows (που and ο οποίος), so a cell may appear twice. */
const cell = (name: string) => screen.getAllByRole('cell', { name })[0];

describe('relative pronouns in the app', () => {
  it('opens που from its chip with the pronoun in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The dog that jumps');
    await user.click(screen.getByRole('button', { name: 'που' }));
    expect(screen.getByRole('heading', { level: 2, name: 'που' })).toBeInTheDocument();
    expect(cell('care')).toBeInTheDocument();
    expect(cell('who')).toBeInTheDocument();
    expect(cell('ο οποίος')).toBeInTheDocument();
  });

  it('the role control changes the job in all three languages, and choosing the phrase’s own job again is no change', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child I gave the bread to');
    await user.click(screen.getByRole('button', { name: 'που' }));
    expect(cell('που του …')).toBeInTheDocument();
    expect(cell('căruia')).toBeInTheDocument();
    expect(cell('to whom')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in its clause'), 'object');
    expect(cell('pe care')).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in its clause'), 'indirect');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('"whose" has a Noun owned control', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child whose dog jumps');
    await user.click(screen.getByRole('button', { name: 'του οποίου' }));
    expect(cell('του οποίου ο σκύλος')).toBeInTheDocument();
    expect(cell('al cărui câine')).toBeInTheDocument();
    expect(cell('whose dog')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun owned'), 'spiti');
    expect(cell('του οποίου το σπίτι')).toBeInTheDocument();
    expect(cell('a cărui casă')).toBeInTheDocument();
  });

  it('after a preposition, the Preposition control changes the chip', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The house I am going to');
    await user.click(screen.getByRole('button', { name: 'στο οποίο' }));
    expect(cell('la care')).toBeInTheDocument();
    expect(cell('to which')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Preposition'), 'me');
    expect(cell('με το οποίο')).toBeInTheDocument();
    expect(cell('cu care')).toBeInTheDocument();
  });
});
```

Create `src/data/phrases-relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = [
  'the-dog-that-jumps', 'the-bread-that-i-ate', 'the-coffee-i-want', 'the-child-i-gave-the-bread-to', 'the-child-whose-dog-jumps',
  'the-house-i-am-going-to', 'the-child-i-am-going-with', 'the-dog-that-is-there', 'this-is-the-house-i-have',
];
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

describe('phrases 81 to 89', () => {
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
    expect(read('the-dog-that-jumps')).toEqual(['Ο σκύλος που πηδάει', 'The dog that jumps', 'Câinele care sare']);
    expect(read('the-bread-that-i-ate')).toEqual(['Το ψωμί που έφαγα', 'The bread that I ate', 'Pâinea pe care am mâncat-o']);
    expect(read('the-coffee-i-want')).toEqual(['Ο καφές που θέλω', 'The coffee I want', 'Cafeaua pe care o vreau']);
    expect(read('the-child-i-gave-the-bread-to')).toEqual(['Το παιδί που του έδωσα το ψωμί', 'The child I gave the bread to', 'Copilul căruia i-am dat pâinea']);
    expect(read('the-child-whose-dog-jumps')).toEqual(['Το παιδί του οποίου ο σκύλος πηδάει', 'The child whose dog jumps', 'Copilul al cărui câine sare']);
    expect(read('the-house-i-am-going-to')).toEqual(['Το σπίτι στο οποίο πάω', 'The house I am going to', 'Casa la care merg']);
    expect(read('the-child-i-am-going-with')).toEqual(['Το παιδί με το οποίο πάω', 'The child I am going with', 'Copilul cu care merg']);
    expect(read('the-dog-that-is-there')).toEqual(['Ο σκύλος που είναι εκεί', 'The dog that is there', 'Câinele care este acolo']);
    expect(read('this-is-the-house-i-have')).toEqual(['Αυτό είναι το σπίτι που έχω', 'This is the house that I have', 'Aceasta este casa pe care o am']);
  });

  it('English leaves the pronoun out of "the coffee I want", and the literal row keeps it', () => {
    expect(gloss('the-coffee-i-want', 'en', 'natural')).not.toContain('that');
    expect(gloss('the-coffee-i-want', 'en', 'literal')).toContain('that');
  });

  it('the relative pronoun points at its noun, and "whose" is followed by the article and the noun owned', () => {
    expect(phrase('the-dog-that-jumps').tokens[2].agreesWith).toBe(1);
    expect(phrase('this-is-the-house-i-have').tokens[4].agreesWith).toBe(3);
    const whose = phrase('the-child-whose-dog-jumps').tokens;
    expect(whose[2].slot).toMatchObject({ pos: 'relative', role: 'whose' });
    expect([whose[3].lexeme, whose[4].lexeme]).toEqual(['def', 'skylos']);
  });
});
```

Create `src/validate/relative-token-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const find = (id: string) => PHRASES.find((p) => p.id === id)!;
const withToken = (base: Phrase, i: number, change: (t: Token) => Token): Phrase => ({ ...base, tokens: base.tokens.map((t, k) => (k === i ? change({ ...t }) : { ...t })) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });
const rel = (patch: Record<string, unknown>) => (t: Token) => ({ ...t, slot: { ...(t.slot as object), ...patch } as Token['slot'] });

describe('a relative pronoun in the validator', () => {
  it('accepts the real phrases', () => {
    for (const id of ['the-dog-that-jumps', 'the-bread-that-i-ate', 'the-child-i-gave-the-bread-to', 'the-child-whose-dog-jumps', 'the-house-i-am-going-to', 'the-child-i-am-going-with', 'this-is-the-house-i-have']) {
      expect(errorsOf(find(id))).toEqual([]);
    }
  });

  it('wants agreesWith to point at a noun, directly before it, with the same gender and number', () => {
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, (t) => ({ ...t, agreesWith: undefined })))).toContain('the-dog-that-jumps token 2 (που): a relative pronoun needs agreesWith pointing at the noun it refers to');
    expect(errorsOf(withToken(dog, 2, (t) => ({ ...t, agreesWith: 0 })))).toContain('the-dog-that-jumps token 2 (που): a relative pronoun needs agreesWith pointing at the noun it refers to');
    expect(errorsOf(withToken(dog, 2, rel({ gender: 'f' })))).toContain('the-dog-that-jumps token 2 (που): slot gender f differs from noun gender m');
    expect(errorsOf(withToken(dog, 2, rel({ number: 'pl' })))).toContain('the-dog-that-jumps token 2 (που): the relative pronoun is pl but its noun is sg');
    const apart = { ...dog, tokens: [dog.tokens[0], dog.tokens[1], dog.tokens[3], dog.tokens[2]].map((t, i) => (i === 3 ? { ...t, agreesWith: 1 } : t)) };
    expect(errorsOf(apart).some((e) => e.includes('comes directly after its noun'))).toBe(true);
  });

  it('wants the text the form gives', () => {
    const house = find('the-house-i-am-going-to');
    expect(errorsOf(withToken(house, 2, (t) => ({ ...t, text: 'με το οποίο' })))).toContain('the-house-i-am-going-to token 2 (με το οποίο): text differs from the form ("στο οποίο")');
    expect(errorsOf(withToken(find('the-dog-that-jumps'), 2, (t) => ({ ...t, text: 'οποίος' })))).toContain('the-dog-that-jumps token 2 (οποίος): text differs from the form ("που")');
  });

  it('only the job after a preposition takes a preposition, and only one from the list', () => {
    const house = find('the-house-i-am-going-to');
    expect(errorsOf(withToken(house, 2, rel({ preposition: undefined })))).toContain('the-house-i-am-going-to token 2 (στο οποίο): only the job after a preposition takes a preposition');
    expect(errorsOf(withToken(house, 2, rel({ preposition: 'thelo' })))).toContain('the-house-i-am-going-to token 2 (στο οποίο): thelo is not a preposition a relative pronoun may follow');
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, rel({ preposition: 'me' }))).some((e) => e.includes('only the job after a preposition takes a preposition'))).toBe(true);
  });

  it('wants "whose" to be followed by the article and the noun owned', () => {
    const whose = find('the-child-whose-dog-jumps');
    const noArticle = { ...whose, tokens: [whose.tokens[0], whose.tokens[1], whose.tokens[2], whose.tokens[4], whose.tokens[5]].map((t, i) => (i === 3 ? { ...t, agreesWith: undefined } : t)) };
    expect(errorsOf(noArticle).some((e) => e.includes('"whose" is followed by the article and the noun owned'))).toBe(true);
  });

  it('που is a token for the subject, the object and "to whom" only', () => {
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, rel({ role: 'whose' }))).some((e) => e.includes('που is a token for the subject, the object and "to whom"'))).toBe(true);
    expect(errorsOf(withToken(dog, 2, rel({ role: 'preposition', preposition: 'me' }))).some((e) => e.includes('που is a token for the subject'))).toBe(true);
  });
});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 80 phrases in the spec order', () => {
+  it('the picker lists all 89 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -103,4 +103,6 @@
       'my-own-house', 'the-house-is-mine', 'the-childs-house', 'the-childs-dog',
       'this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'here-is-the-house', 'as-far-as-there', 'such-a-house', 'so-much-bread',
+      'the-dog-that-jumps', 'the-bread-that-i-ate', 'the-coffee-i-want', 'the-child-i-gave-the-bread-to', 'the-child-whose-dog-jumps',
+      'the-house-i-am-going-to', 'the-child-i-am-going-with', 'the-dog-that-is-there', 'this-is-the-house-i-have',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.relative.test.tsx src/data/phrases-relative.test.ts src/validate/relative-token-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1,3 +1,3 @@
-import type { Case, Clitic, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, PrepSense, Slot, SlotOf, Tense, Token, Voice } from '../types';
+import type { Case, Clitic, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, PrepSense, RelativeRole, Slot, SlotOf, Tense, Token, Voice } from '../types';
 
 const verbSlot = (person: 1 | 2 | 3): Slot => ({
@@ -1732,4 +1732,200 @@
 };
 
+/** A relative pronoun: the job it does in its clause, and the gender and number of the noun it refers to. */
+const relative = (role: RelativeRole, gender: Gender, number: Num = 'sg', preposition?: string): Slot => ({
+  pos: 'relative',
+  role,
+  gender,
+  number,
+  ...(preposition ? { preposition } : {}),
+});
+/** The weak pronoun "to him / to it" of the neuter singular (του). */
+const TO_IT: Clitic = { role: 'indirect', person: 3, number: 'sg', gender: 'n' };
+
+const theDogThatJumps: Phrase = {
+  id: 'the-dog-that-jumps',
+  title: 'The dog that jumps',
+  theme: 'Relative clauses',
+  level: 'beginner',
+  tokens: [
+    ...theDog,
+    { text: 'που', lexeme: 'rel-pou', slot: relative('subject', 'm'), agreesWith: 1 },
+    { text: 'πηδάει', lexeme: 'pidao', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('The', 0), u('dog', 1), u('that', 2), u('jumps', 3)],
+    [u('the', 0), u('dog', 1), u('that', 2), u('jumps', 3)],
+    [seg(['Câine', 1], ['le', 0]), u('care', 2), u('sare', 3)],
+    [seg(['câine', 1], ['le', 0]), u('care', 2), u('sare', 3)],
+  ),
+  verified: false,
+};
+
+const theBreadThatIAte: Phrase = {
+  id: 'the-bread-that-i-ate',
+  title: 'The bread that I ate',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'ψωμί', lexeme: 'psomi', slot: nomSg },
+    { text: 'που', lexeme: 'rel-pou', slot: relative('object', 'n'), agreesWith: 1 },
+    { text: 'έφαγα', lexeme: 'troo', slot: vslot('indicative', 'aorist') },
+  ],
+  glosses: rows(
+    [u('The', 0), u('bread', 1), u('that', 2), u('I ate', 3)],
+    [u('the', 0), u('bread', 1), u('that', 2), u('(I)', null), u('ate', 3)],
+    [seg(['Pâine', 1], ['a', 0]), u('pe care', 2), u('am mâncat-o', 3)],
+    [seg(['pâine', 1], ['a', 0]), u('pe care', 2), u('(eu)', null), u('am mâncat-o', 3)],
+  ),
+  verified: false,
+};
+
+const theCoffeeIWant: Phrase = {
+  id: 'the-coffee-i-want',
+  title: 'The coffee I want',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('m', 'nom', 1), text: 'Ο' },
+    { text: 'καφές', lexeme: 'kafes', slot: nomSg },
+    { text: 'που', lexeme: 'rel-pou', slot: relative('object', 'm'), agreesWith: 1 },
+    { text: 'θέλω', lexeme: 'thelo', slot: verbSlot(1) },
+  ],
+  glosses: rows(
+    [u('The', 0), u('coffee', 1), u('I want', 3)],
+    [u('the', 0), u('coffee', 1), u('that', 2), u('(I)', null), u('want', 3)],
+    [seg(['Cafea', 1], ['ua', 0]), u('pe care', 2), u('o vreau', 3)],
+    [seg(['cafea', 1], ['ua', 0]), u('pe care', 2), u('(eu)', null), u('o vreau', 3)],
+  ),
+  verified: false,
+};
+
+const theChildIGaveTheBreadTo: Phrase = {
+  id: 'the-child-i-gave-the-bread-to',
+  title: 'The child I gave the bread to',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'παιδί', lexeme: 'paidi', slot: nomSg },
+    { text: 'που', lexeme: 'rel-pou', slot: relative('indirect', 'n'), agreesWith: 1 },
+    { text: 'του έδωσα', lexeme: 'dino', slot: { ...vslot('indicative', 'aorist'), clitics: [TO_IT] } as Slot },
+    { ...article('n', 'acc', 5), text: 'το' },
+    { text: 'ψωμί', lexeme: 'psomi', slot: accSg },
+  ],
+  glosses: rows(
+    [u('The', 0), u('child', 1), u('I gave', 3), u('the', 4), u('bread', 5), u('to', 2)],
+    [u('the', 0), u('child', 1), u('that', 2), u('to-him gave (I)', 3), u('the', 4), u('bread', 5)],
+    [seg(['Copil', 1], ['ul', 0]), u('căruia', 2), u('i-am dat', 3), seg(['pâine', 5], ['a', 4])],
+    [seg(['copil', 1], ['ul', 0]), u('căruia', 2), u('(eu)', null), u('i-am dat', 3), seg(['pâine', 5], ['a', 4])],
+  ),
+  verified: false,
+};
+
+const theChildWhoseDogJumps: Phrase = {
+  id: 'the-child-whose-dog-jumps',
+  title: 'The child whose dog jumps',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'παιδί', lexeme: 'paidi', slot: nomSg },
+    { text: 'του οποίου', lexeme: 'rel-opoios', slot: relative('whose', 'n'), agreesWith: 1 },
+    { ...article('m', 'nom', 4), text: 'ο' },
+    { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
+    { text: 'πηδάει', lexeme: 'pidao', slot: present(3) },
+  ],
+  glosses: rows(
+    [u('The', 0), u('child', 1), u('whose', 2), u('dog', 4), u('jumps', 5)],
+    [u('the', 0), u('child', 1), u('of-which', 2), u('the', 3), u('dog', 4), u('jumps', 5)],
+    [seg(['Copil', 1], ['ul', 0]), u('al cărui', 2), u('câine', 4), u('sare', 5)],
+    [seg(['copil', 1], ['ul', 0]), u('al cărui', 2), u('câine', 4), u('sare', 5)],
+  ),
+  verified: false,
+};
+
+const theHouseIAmGoingTo: Phrase = {
+  id: 'the-house-i-am-going-to',
+  title: 'The house I am going to',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'στο οποίο', lexeme: 'rel-opoios', slot: relative('preposition', 'n', 'sg', 'se'), agreesWith: 1 },
+    { text: 'πάω', lexeme: 'pao', slot: present(1) },
+  ],
+  glosses: rows(
+    [u('The', 0), u('house', 1), u('I am going', 3), u('to', 2)],
+    [u('the', 0), u('house', 1), u('to-the which', 2), u('(I)', null), u('go', 3)],
+    [seg(['Cas', 1], ['a', 0]), u('la care', 2), u('merg', 3)],
+    [seg(['cas', 1], ['a', 0]), u('la care', 2), u('(eu)', null), u('merg', 3)],
+  ),
+  verified: false,
+};
+
+const theChildIAmGoingWith: Phrase = {
+  id: 'the-child-i-am-going-with',
+  title: 'The child I am going with',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'παιδί', lexeme: 'paidi', slot: nomSg },
+    { text: 'με το οποίο', lexeme: 'rel-opoios', slot: relative('preposition', 'n', 'sg', 'me'), agreesWith: 1 },
+    { text: 'πάω', lexeme: 'pao', slot: present(1) },
+  ],
+  glosses: rows(
+    [u('The', 0), u('child', 1), u('I am going', 3), u('with', 2)],
+    [u('the', 0), u('child', 1), u('with the which', 2), u('(I)', null), u('go', 3)],
+    [seg(['Copil', 1], ['ul', 0]), u('cu care', 2), u('merg', 3)],
+    [seg(['copil', 1], ['ul', 0]), u('cu care', 2), u('(eu)', null), u('merg', 3)],
+  ),
+  verified: false,
+};
+
+const theDogThatIsThere: Phrase = {
+  id: 'the-dog-that-is-there',
+  title: 'The dog that is there',
+  theme: 'Relative clauses',
+  level: 'beginner',
+  tokens: [
+    ...theDog,
+    { text: 'που', lexeme: 'rel-pou', slot: relative('subject', 'm'), agreesWith: 1 },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { text: 'εκεί', lexeme: 'ekei', slot: adverb },
+  ],
+  glosses: rows(
+    [u('The', 0), u('dog', 1), u('that', 2), u('is', 3), u('there', 4)],
+    [u('the', 0), u('dog', 1), u('that', 2), u('is', 3), u('there', 4)],
+    [seg(['Câine', 1], ['le', 0]), u('care', 2), u('este', 3), u('acolo', 4)],
+    [seg(['câine', 1], ['le', 0]), u('care', 2), u('este', 3), u('acolo', 4)],
+  ),
+  verified: false,
+};
+
+const thisIsTheHouseIHave: Phrase = {
+  id: 'this-is-the-house-i-have',
+  title: 'This is the house that I have',
+  theme: 'Relative clauses',
+  level: 'improver',
+  tokens: [
+    { text: 'Αυτό', lexeme: 'autos', slot: qslot('n', 'sg', 'nom', { use: 'pronoun' }), agreesWith: 3 },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { ...article('n', 'nom', 3), text: 'το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'που', lexeme: 'rel-pou', slot: relative('object', 'n'), agreesWith: 3 },
+    { text: 'έχω', lexeme: 'echo', slot: verbSlot(1) },
+  ],
+  glosses: rows(
+    [u('This', 0), u('is', 1), u('the', 2), u('house', 3), u('that', 4), u('I have', 5)],
+    [u('this', 0), u('is', 1), u('the', 2), u('house', 3), u('that', 4), u('(I)', null), u('have', 5)],
+    [u('Aceasta', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('pe care', 4), u('o am', 5)],
+    [u('aceasta', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('pe care', 4), u('(eu)', null), u('o am', 5)],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1809,3 +2005,12 @@
   suchAHouse,
   soMuchBread,
+  theDogThatJumps,
+  theBreadThatIAte,
+  theCoffeeIWant,
+  theChildIGaveTheBreadTo,
+  theChildWhoseDogJumps,
+  theHouseIAmGoingTo,
+  theChildIAmGoingWith,
+  theDogThatIsThere,
+  thisIsTheHouseIHave,
 ];
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -504,4 +504,36 @@
     }
   }
+  if (token.slot.pos === 'relative' && lexeme.pos === 'relative') {
+    const slot = token.slot;
+    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
+    if (!target || target.slot.pos !== 'noun' || lexemes[target.lexeme]?.pos !== 'noun') {
+      errors.push(`${where}: a relative pronoun needs agreesWith pointing at the noun it refers to`);
+    } else {
+      const noun = lexemes[target.lexeme];
+      if (noun.pos === 'noun' && slot.gender !== noun.gender) errors.push(`${where}: slot gender ${slot.gender} differs from noun gender ${noun.gender}`);
+      if (slot.number !== target.slot.number) errors.push(`${where}: the relative pronoun is ${slot.number} but its noun is ${target.slot.number}`);
+      if (token.agreesWith !== index - 1) errors.push(`${where}: a relative pronoun comes directly after its noun`);
+    }
+    if ((slot.role === 'preposition') !== (slot.preposition !== undefined)) {
+      errors.push(`${where}: only the job after a preposition takes a preposition`);
+    }
+    if (slot.preposition !== undefined && !(RELATIVE_PREPOSITIONS as readonly string[]).includes(slot.preposition)) {
+      errors.push(`${where}: ${slot.preposition} is not a preposition a relative pronoun may follow`);
+    }
+    if (lexeme.kind === 'pou' && (slot.role === 'whose' || slot.role === 'preposition')) {
+      errors.push(`${where}: που is a token for the subject, the object and "to whom"; the other jobs need pronoun tokens and are shown in the panel only`);
+    }
+    if (slot.role === 'whose') {
+      const owner = phrase.tokens[index + 1];
+      const owned = phrase.tokens[index + 2];
+      if (owner?.lexeme !== 'def' || owner.agreesWith !== index + 2 || owned?.slot.pos !== 'noun') {
+        errors.push(`${where}: "whose" is followed by the article and the noun owned`);
+      }
+    }
+    if (inflected) {
+      const form = formText(inflect(lexeme, slot));
+      if (normalise(form) !== normalise(token.text)) errors.push(`${where}: text differs from the form ("${form}")`);
+    }
+  }
   if (token.slot.pos === 'noun' && token.agreesWith !== undefined) {
     // A noun possessor: the genitive singular noun after the possessed noun and its own definite article (το σπίτι του παιδιού).
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1422 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.relative.test.tsx src/data/phrases-relative.test.ts src/validate/relative-token-validate.test.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/validate/validate.ts
git commit -m "feat: phrases 81 to 89 (relative clauses)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Comparison notes and the review sheet

**Files:**
- Create (test): `src/data/divergences-relative.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `DIVERGENCES`, `selectDivergences`, `lexemeSection` and `LANG_NAME` in `src/validate/reviewSheet.ts`, and `relativeGroup`.
- Produces: The divergence rows `relative-invariable`, `relative-resumptive`, `relative-object`, `relative-whose`, `relative-preposition`, `relative-omitted`; a review-sheet section for each relative lexeme with the Romanian *care* tables, every noun in every job and the job after every preposition.

`relative-omitted` is an Improver row; the others show at Beginner too. The review sheet is written to `review/content-review.md`, which is git-ignored.

- [ ] **Step 1: Write the tests**

Create `src/data/divergences-relative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (lexeme: string, level: Level = 'improver') => selectDivergences(DIVERGENCES, 'relative', lexeme, level).map((d) => d.id);
const ALL = ['relative-invariable', 'relative-resumptive', 'relative-object', 'relative-whose', 'relative-preposition', 'relative-omitted'];

describe('the comparison notes for the relative pronouns', () => {
  it('both words show the six notes in Improver and five in Beginner', () => {
    for (const lexeme of ['rel-pou', 'rel-opoios']) {
      expect(ids(lexeme)).toEqual(ALL);
      expect(ids(lexeme, 'beginner')).toEqual(ALL.filter((id) => id !== 'relative-omitted'));
    }
  });

  it('no other part of speech shows them', () => {
    expect(selectDivergences(DIVERGENCES, 'noun', 'spiti', 'improver').map((d) => d.id).filter((id) => id.startsWith('relative-'))).toEqual([]);
    expect(selectDivergences(DIVERGENCES, 'quantifier', 'autos', 'improver').map((d) => d.id).filter((id) => id.startsWith('relative-'))).toEqual([]);
  });

  it('every new row is unverified', () => {
    const rows = DIVERGENCES.filter((d) => ALL.includes(d.id));
    expect(rows).toHaveLength(6);
    expect(rows.every((d) => !d.verified)).toBe(true);
  });
});
```

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -146,4 +146,24 @@
   });
 
+  it('shows the relative pronouns: the Romanian care tables and every noun in every job', () => {
+    expect(sheet).toContain('- Romanian care, dative: căruia (masc. sg) · căreia (fem. sg) · cărora (pl)');
+    expect(sheet).toContain('- Romanian care, genitive: cărui (masc. sg) · cărei (fem. sg) · căror (pl)');
+    expect(sheet).toContain('subject: που · care · who');
+    expect(sheet).toContain('subject: το οποίο · care · who');
+    expect(sheet).toContain('to whom: που του … · căruia · to whom');
+    expect(sheet).toContain('to whom: στο οποίο · căruia · to whom');
+    expect(sheet).toContain('whose (noun owned: σπίτι): του οποίου το σπίτι · a cărui casă · whose house');
+    expect(sheet).toContain('whose (noun owned: σκύλος): του οποίου ο σκύλος · al cărei câine · whose dog');
+  });
+
+  it('shows the relative pronoun after every preposition', () => {
+    expect(sheet).toContain('- after a preposition (παιδί, singular):');
+    expect(sheet).toContain('με: με το οποίο · cu care · with whom');
+    expect(sheet).toContain('με: που … με αυτό · cu care · with whom');
+    expect(sheet).toContain('πάνω από: πάνω από το οποίο · peste care · over whom');
+    expect(sheet).toContain('σε: στο οποίο · la care · to whom');
+    expect(sheet).toContain('για: που … για αυτό · pentru care · for which');
+  });
+
   it('says how many records are unverified', () => {
     expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/data/divergences-relative.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -948,3 +948,69 @@
     verified: false,
   },
+  {
+    id: 'relative-invariable',
+    appliesTo: { pos: 'relative' },
+    point: 'Does the relative pronoun change?',
+    el: 'που never changes; ο οποίος agrees with its noun: ο οποίος, τον οποίο, της οποίας',
+    ro: 'care does not change as the subject or the object; it has căruia, căreia, cărora in the dative and cărui, cărei, căror in the genitive',
+    en: 'who, whom, which or that, chosen by the noun (a person or a thing)',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'relative-resumptive',
+    appliesTo: { pos: 'relative' },
+    point: 'A pronoun inside the clause',
+    el: 'που needs a pronoun in the clause when its job is not subject or object: το παιδί που του έδωσα',
+    ro: 'a clitic on the verb as well: copilul căruia i-am dat',
+    en: 'no pronoun: the child I gave it to',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'relative-object',
+    appliesTo: { pos: 'relative' },
+    point: 'The object',
+    el: 'που and the verb alone: το ψωμί που έφαγα',
+    ro: 'pe care and a clitic on the verb: pâinea pe care am mâncat-o',
+    en: '"that", or nothing: the bread that I ate, the bread I ate',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'relative-whose',
+    appliesTo: { pos: 'relative' },
+    point: 'Whose',
+    el: 'του οποίου, or που + a possessive: που το σπίτι του',
+    ro: 'al cărui: the first word agrees with the thing owned, the second with the owner',
+    en: 'whose',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'relative-preposition',
+    appliesTo: { pos: 'relative' },
+    point: 'After a preposition',
+    el: 'before ο οποίος (με το οποίο), or after the clause with a pronoun (που … με αυτό)',
+    ro: 'the preposition first: cu care',
+    en: 'first ("with whom") or at the end ("the child I go with")',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
+  {
+    id: 'relative-omitted',
+    appliesTo: { pos: 'relative' },
+    point: 'Leaving the pronoun out',
+    el: 'not possible: το ψωμί που έφαγα',
+    ro: 'not possible: pâinea pe care am mâncat-o',
+    en: 'possible in an object clause: the bread I ate',
+    tag: 'absent',
+    level: 'extra',
+    verified: false,
+  },
 ];
```

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -16,5 +16,7 @@
 import { POSSESSORS } from '../engine/possessive';
 import { RO_ALONE, RO_OWN, RO_POSSESSIVES } from '../data/possessives';
-import type { Clitic, GreekAdjective, GreekAdverb, GreekInterrogative, GreekQuantifier, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
+import { RELATIVE_PREPOSITIONS, RELATIVE_ROLES, RO_CARE_DATIVE, RO_CARE_GENITIVE } from '../data/relatives';
+import { relativeGroup } from '../engine/relativeGroup';
+import type { Clitic, GreekAdjective, GreekAdverb, GreekInterrogative, GreekQuantifier, GreekRelative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
 import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
@@ -142,4 +144,36 @@
 }
 
+/**
+ * A relative pronoun: the Romanian care tables, then every noun in every job in the three languages (spec 9, 26). The
+ * Greek word printed is the lexeme's own; the Romanian and English words are the same for both.
+ */
+function relativeLines(l: GreekRelative, lexemes: Record<string, GreekLexeme>): string[] {
+  const nouns = Object.values(lexemes).filter((n): n is GreekNoun => n.pos === 'noun');
+  const ownedFor = (noun: GreekNoun): GreekNoun => (nouns.find((n) => n.id === (noun.id === 'spiti' ? 'skylos' : 'spiti')) ?? noun);
+  const line = (slot: SlotOf<'relative'>, noun: GreekNoun) => {
+    const g = relativeGroup(l.kind, slot, noun, ownedFor(noun));
+    return `${richText(g.el)} · ${g.ro} · ${g.en}`;
+  };
+  const table = (words: typeof RO_CARE_DATIVE) => `${words.m.sg} (masc. sg) · ${words.f.sg} (fem. sg) · ${words.m.pl} (pl)`;
+  const jobs = nouns.flatMap((noun) =>
+    (['sg', 'pl'] as const).flatMap((number) => [
+      `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}${noun.animate ? ', animate' : ''}):`,
+      ...RELATIVE_ROLES.filter((r) => r.value !== 'preposition').map(({ value: role }) =>
+        `  - ${role === 'indirect' ? 'to whom' : role}${role === 'whose' ? ` (noun owned: ${ownedFor(noun).lemma})` : ''}: ${line({ pos: 'relative', role, gender: noun.gender, number }, noun)}`,
+      ),
+    ]),
+  );
+  const prepositions = nouns
+    .filter((n) => n.id === 'paidi' || n.id === 'spiti')
+    .flatMap((noun) => [
+      `- after a preposition (${noun.lemma}, singular):`,
+      ...RELATIVE_PREPOSITIONS.map((id) => {
+        const lemma = (lexemes[id] as { lemma: string }).lemma;
+        return `  - ${lemma}: ${line({ pos: 'relative', role: 'preposition', gender: noun.gender, number: 'sg', preposition: id }, noun)}`;
+      }),
+    ]);
+  return [`- Romanian care, dative: ${table(RO_CARE_DATIVE)}`, `- Romanian care, genitive: ${table(RO_CARE_GENITIVE)}`, ...jobs, ...prepositions];
+}
+
 /** A place word: its example and the Romanian words after each preposition. */
 function adverbLines(l: GreekAdverb, lexemes: Record<string, GreekLexeme>): string[] {
@@ -280,4 +314,5 @@
       ...(l.pos === 'interrogative' ? interrogativeLines(l, lexemes) : []),
       ...(l.pos === 'adverb' ? adverbLines(l, lexemes) : []),
+      ...(l.pos === 'relative' ? relativeLines(l, lexemes) : []),
       ...(l.pos === 'quantifier' && l.demonstrative ? demonstrativeLines(l, lexemes) : []),
       ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1427 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/data/divergences-relative.test.ts src/data/divergences.ts src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: comparison notes and a review-sheet section for the relative pronouns

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces: a spec that matches what was built (the preposition is inside the chip of ο οποίος; the pattern after a preposition is *που … με αυτό*; the Improver table lists the five jobs; the panel state and the validator) and records it in section 26.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:70])
    s = s.replace(old, new)


sub('που … μαζί του', 'που … με αυτό', 3)
sub('after a preposition: με τον οποίο or', 'after a preposition: με το οποίο or')
sub('ο οποίος is one chip that includes its article (τον οποίο); a preposition before it is a token of its own that points at it, and σε fuses with the article of ο οποίος (στον οποίο); που is a token of its own, and the pronoun inside its clause is a piece of the verb group or a token after it',
    'ο οποίος is one chip that includes its article and, for the jobs that need one, its preposition (τον οποίο, στον οποίο, με το οποίο; σε is written as one word with the article); που is a token of its own, and the pronoun inside its clause is a piece of the verb group (του έδωσα). The relative token points at its noun, which comes directly before it; for "whose" the article and the noun owned follow it')
sub('Improver: gender × number for the role', 'Improver: all five jobs for the noun')
sub('Gender × number of the antecedent for the chosen role, in each language', 'All five jobs for the chosen noun, in each language')
s = s.rstrip() + """
| Panel state | `PanelState` gains `owned` (the Noun owned control of the job "whose", a noun lexeme id); a "whose" token starts with the noun that follows its article | 5.3 |
| Validator | A relative token points at the noun directly before it and agrees with it in gender and number; its text is που or the chip of ο οποίος for its job; only the job after a preposition names a preposition, from the list (πάνω από, κάτω από, με, για, από, μέχρι, σε); "whose" is followed by the article and the noun owned; που is a token for the subject, the object and "to whom" only | 7 |
| Plan 13 built | The relative pronouns που and ο οποίος: the part of speech, the panel with the five jobs and the preposition and noun-owned controls, the Romanian *care* tables, the `animate` flag, phrases 81 to 89 (89 in all), six notes and the review-sheet section; Plan 14 (ό,τι, όπου, όποιος) is still to do | 26 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "Plan 13 built" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "που … με αυτό" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: `1`, then a number of at least `3`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 13 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.2, 4.3: the relative pronoun part of speech, the Greek που and ο οποίος in every job, the Romanian *care* and the English who, whom, which, whose | 1 |
| 5.3: the panel (rows with the pattern for the job, the other Greek word; the Improver table) | 1 |
| 5.3: the controls (noun, how many, role, preposition, noun owned) and the panel state | 2 |
| 4.4, 7: a relative token points at its noun; the job after a preposition; "whose" and the noun owned | 3 |
| 6.1: phrases 81 to 89 and the theme *Relative clauses* | 3 |
| 5.2: relative-invariable, relative-resumptive, relative-object, relative-whose, relative-preposition, relative-omitted | 4 |
| 9: the review additions (the Romanian *care* tables; every noun in every job; every preposition) | 4 |
| 26: the decisions, and the corrections (the preposition is inside the chip; the Improver table; the pattern with a preposition) | 5 |
| Not in this plan (Plan 14): ό,τι, όπου, όποιος and phrases 90 to 92 | |
