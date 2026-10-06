# The Emphatic Possessive and the Noun Possessor Implementation Plan (Plan 11)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the emphatic possessive δικός μου (το δικό μου σπίτι, "my own house"; το σπίτι είναι δικό μου, "the house is mine") with its own panel, a noun as the possessor in the genitive (το σπίτι του παιδιού, *casa copilului*, "the child's house") with an Owned by a noun? control on the noun panel, phrases 69 to 72 and the two comparison notes. This finishes the possessives (spec 24).

**Architecture:** δικός is an ordinary stressed three-ending adjective lexeme flagged `emphatic`; the weak possessive that follows it is a token of its own that points at the same noun, as in Plan 10. A new panel (`dikosPanel`) shows the phrase before the noun and on its own, from two functions in `agree.ts` (`ownPhrase`, `ownAlone`) and a small Romanian table (*propriul / propria / proprii / propriile*, *al / a / ai / ale*). A noun possessor is a genitive singular noun token with its own definite article that points back at the possessed noun with `agreesWith`; `nounPhrase` takes an `owner` noun, and the noun panel gets a second control for it.

**Tech Stack:** Vite, React 19, TypeScript (strict), Vitest, Testing Library. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md` (sections 2, 4.2, 4.3, 4.4, 5.2, 5.3, 6.1, 7, 9 and 24; the repository is at commit dc33860 or later when this plan starts).

## Global Constraints

- TypeScript `strict`, no `any`, no `// @ts-ignore`. Match the surrounding code: single quotes (double quotes where the text contains an apostrophe), two-space indent, trailing commas, named exports, `import type` for types.
- Every Greek, Romanian and English text added here comes from memory and is **unverified** (spec 9): every new lexeme, phrase, divergence row and review item has `verified: false` (a lexeme: `{ el: false, ro: false, en: false }`). Never set a flag to `true`; the content review does that.
- Greek is monotonic. Phrase token text must equal what the data produces, ignoring capitals and trailing punctuation (the validator checks it).
- Colour is never the only signal, and `lang` attributes follow the existing components (this plan adds no new component).
- Never commit `.claude/`, `.superpowers/` or `review/` (untracked or git-ignored). Stage the files named in each task, not `git add -A`.
- Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `sed -i` does not work on macOS; make edits with the Edit tool or a small Python script.
- The commands to run are `npx tsc --noEmit`, `npx vitest run`, `npm run validate` and `npm run build`. `npm run validate -- --release` is expected to fail until the content review is done.

## Decisions made in this plan

These settle what the spec leaves open. Each is a ruling the reviewer may reverse; none changes a spec requirement except where it says so.

1. **δικός is an adjective lexeme with a flag.** `GreekAdjective.emphatic: true` sends it to `dikosPanel` instead of the ordinary adjective panel. Its stored Romanian forms (*propriu, proprie, proprii*) are the ordinary adjective data; the panel shows the articulated forms from `RO_OWN` (*propriul, propria, proprii, propriile*).
2. **Two tokens, as for the weak possessive.** δικό and μου are separate tokens and both point at the noun. The possessive may stand directly after its noun (Plan 10) or directly after a δικός that points at the same noun (το δικό μου σπίτι, είναι δικό μου). δικός without that possessive is an error.
3. **The second accent only when the possessive is next to the noun.** The Plan 10 rule found the possessive anywhere; it now looks at the token directly after the noun, so *η δική μου θάλασσα* takes no accent.
4. **Subject and object only.** The δικός panel offers the nominative and the accusative. Romanian has no short genitive (*propriului meu*, *al celui*), so the genitive is left out rather than stored half-right.
5. **Romanian.** Before the noun: *propriul / propria / proprii / propriile* + the possessive + the noun without its article (*propria mea casă*; the bare noun is the stored indefinite singular without *un* or *o*). On its own: *al / a / ai / ale* + the possessive (*a mea*, *al lui*). A neuter follows the masculine in the singular and the feminine in the plural, as for the possessive.
6. **English.** "my own house" before a noun; "mine", "yours", "his", "hers", "ours", "yours", "theirs" on its own. The table also holds a neuter *its own* / *its* for completeness; the panel offers the seven possessors of Plan 10.
7. **"On its own" keeps the article** (το δικό μου), as the spec's panel row says; in phrase 70 the predicate has none, and the phrase shows that.
8. **Glosses.** In phrase 69 *Propria* is one Romanian unit linked to δικό, because the validator wants a split unit to be a noun plus its article. In phrase 70 *mine* links to δικό.
9. **A noun possessor is the genitive singular with its own definite article**, directly after the possessed noun (token index = the noun's + 2), and its token carries `agreesWith` = the possessed noun. It goes only with the definite article: no adjective, no pronoun possessor, no count. English says "the child's house" (and "of the child's house" in the genitive).
10. **Owned by a noun?** is a second control on the noun panel (`PanelState.owner`, a lexeme id). It excludes the pronoun possessor in both directions, and its row is hidden for a counted plural (τρία σπίτια του παιδιού is not offered).
11. **The Romanian gloss check follows the case.** A segmented gloss unit on a genitive noun (*copil* + *ului*) must make up the stored genitive; the nominative split is not used.
12. **Levels and notes.** Phrases 69 and 70 are Improver; 71 and 72 are Beginner. `emphatic-possessive` shows on δικός at both levels; `noun-possessor` shows on every noun panel.
13. **Delivery.** With this plan the picker lists 72 phrases (the Possession theme runs 63 to 72).

## File Structure

| File | What changes |
|---|---|
| `src/types.ts` | `GreekAdjective.emphatic` |
| `src/data/possessives.ts` | `RO_OWN`, `RO_ALONE`, `EN_OWN` |
| `src/data/{lexemes,review,phrases,divergences}.ts` | the lexeme `dikos`; the review item `ending-table:ro-own`; phrases 69 to 72; the rows `emphatic-possessive` and `noun-possessor` |
| `src/engine/{possessive,agree}.ts` | `roOwn`, `roAlone`, `roAloneFor`, `roBareNoun`, `enOwn`, `enAlone`; `ownPhrase`, `ownAlone`; `NpOptions.owner` |
| `src/panels/{dikos,noun,panels,types}.ts` | the δικός panel; the Owned by a noun? control and row; `PanelState.owner`, the control key `owner`, seeding and controls |
| `src/validate/{validate,reviewSheet}.ts` | the possessive after δικός, δικός's possessive, the noun possessor token, the genitive gloss check; the review sheet sections |
| tests | one new test file per task, plus the expectations the new control and the new phrases change |

---

### Task 1: δικός in the engine and its own panel

**Files:**
- Create: `src/panels/dikos.ts`
- Create (test): `src/engine/own.test.ts`
- Create (test): `src/panels/dikos.test.ts`
- Modify: `src/data/lexemes.ts`
- Modify: `src/data/possessives.ts`
- Modify: `src/data/review.ts`
- Modify: `src/engine/agree.ts`
- Modify: `src/engine/possessive.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `nounPhrase`, `inflectAdjective`, `inflectArticle`, `DEF_ARTICLE`, `POSSESSORS`, `possessorValue`, `roPossessive`, `adjectivePanel`, `buildPanel`, `applyControl` and `initialState`.
- Produces: `GreekAdjective.emphatic`; the lexeme `dikos`; `RO_OWN`, `RO_ALONE`, `EN_OWN` in `src/data/possessives.ts`; `roOwn`, `roAlone`, `roAloneFor`, `roBareNoun`, `enOwn`, `enAlone` in `src/engine/possessive.ts`; `ownPhrase(adj, noun, number, case, possessor)` and `ownAlone(adj, noun, number, case, possessor)` in `src/engine/agree.ts`; `dikosPanel` (controls `noun`, `number`, `case` with no genitive, `possessor`); `applyControl(state, 'possessor', …)` for an adjective; `initialState` takes the possessor from the possessive after δικός; the review item `ending-table:ro-own`.

This task builds everything about δικός that needs no phrase: the forms in three languages and the panel. The phrases and the validator come in Task 2. The expected strings in the tests are worked out by hand from the rules in Decisions 5 and 6.

- [ ] **Step 1: Write the tests**

Create `src/engine/own.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import type { Case, Num, SlotOf } from '../types';
import { ownAlone, ownPhrase } from './agree';
import { POSSESSORS, roAloneFor, roBareNoun } from './possessive';
import { richText } from './segments';

const of = (value: string): SlotOf<'possessive'> => POSSESSORS.find((p) => p.value === value)!.slot;
const dikos = getAdjective('dikos');
const before = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = ownPhrase(dikos, getNoun(noun), number, c, of(who));
  return { el: richText(np.el), ro: np.ro, en: np.en };
};
const alone = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = ownAlone(dikos, getNoun(noun), number, c, of(who));
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('δικός', () => {
  it('is the stressed three-ending adjective δικός, δική, δικό with Romanian propriu', () => {
    expect(dikos.lemma).toBe('δικός');
    expect(dikos.emphatic).toBe(true);
    expect(dikos.ro.lemma).toBe('propriu');
    expect(dikos.verified).toEqual({ el: false, ro: false, en: false });
  });

  it('goes before the noun with the possessive between them', () => {
    expect(before('spiti', '1sg')).toEqual({ el: 'το δικό μου σπίτι', ro: 'propria mea casă', en: 'my own house' });
    expect(before('skylos', '2sg')).toEqual({ el: 'ο δικός σου σκύλος', ro: 'propriul tău câine', en: 'your own dog' });
    expect(before('thalassa', '1pl')).toEqual({ el: 'η δική μας θάλασσα', ro: 'propria noastră mare', en: 'our own sea' });
  });

  it('takes no second accent on the noun', () => {
    expect(before('thalassa', '1sg').el).toBe('η δική μου θάλασσα');
  });

  it('the third person keeps the invariable Romanian word', () => {
    expect(before('paidi', '3sg-f')).toEqual({ el: 'το δικό της παιδί', ro: 'propriul ei copil', en: 'her own child' });
    expect(before('paidi', '3pl')).toEqual({ el: 'το δικό τους παιδί', ro: 'propriul lor copil', en: 'their own child' });
  });

  it('agrees in the plural, and in the accusative', () => {
    expect(before('spiti', '1sg', 'pl')).toEqual({ el: 'τα δικά μου σπίτια', ro: 'propriile mele case', en: 'my own houses' });
    expect(before('skylos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου σκύλοι', ro: 'proprii mei câini', en: 'my own dogs' });
    expect(before('skylos', '1sg', 'sg', 'acc')).toEqual({ el: 'τον δικό μου σκύλο', ro: 'propriul meu câine', en: 'my own dog' });
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(before('dromos', '1sg')).toEqual({ el: 'ο δικός μου δρόμος', ro: 'propriul meu drum', en: 'my own road' });
    expect(before('dromos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου δρόμοι', ro: 'propriile mele drumuri', en: 'my own roads' });
  });

  it('on its own it keeps the article and says al meu, a mea, ai mei, ale mele', () => {
    expect(alone('spiti', '1sg')).toEqual({ el: 'το δικό μου', ro: 'a mea', en: 'mine' });
    expect(alone('skylos', '1pl')).toEqual({ el: 'ο δικός μας', ro: 'al nostru', en: 'ours' });
    expect(alone('skylos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου', ro: 'ai mei', en: 'mine' });
    expect(alone('spiti', '1sg', 'pl')).toEqual({ el: 'τα δικά μου', ro: 'ale mele', en: 'mine' });
    expect(alone('paidi', '3sg-m')).toEqual({ el: 'το δικό του', ro: 'al lui', en: 'his' });
    expect(alone('thalassa', '3sg-f')).toEqual({ el: 'η δική της', ro: 'a ei', en: 'hers' });
    expect(alone('paidi', '3pl', 'pl')).toEqual({ el: 'τα δικά τους', ro: 'ai lor', en: 'theirs' });
  });

  it('gives the Romanian forms by gender for the full table', () => {
    expect(roAloneFor(of('1sg'), 'n', 'sg')).toBe('al meu');
    expect(roAloneFor(of('1sg'), 'n', 'pl')).toBe('ale mele');
    expect(roAloneFor(of('2pl'), 'f', 'sg')).toBe('a voastră');
    expect(roAloneFor(of('3sg-f'), 'm', 'pl')).toBe('ai ei');
  });

  it('the bare Romanian noun has no article', () => {
    expect(roBareNoun(getNoun('spiti'), 'sg')).toBe('casă');
    expect(roBareNoun(getNoun('skylos'), 'sg')).toBe('câine');
    expect(roBareNoun(getNoun('paidi'), 'pl')).toBe('copii');
  });
});
```

Create `src/panels/dikos.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slot: SlotOf<'adjective'> = { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' };
const token: Token = { text: 'δικό', lexeme: 'dikos', slot, agreesWith: 3 };
const stateOf = (patch: Partial<PanelState> = {}): PanelState => ({
  slot,
  possessor: { pos: 'possessive', person: 1, number: 'sg' },
  noun: 'spiti',
  nounNumber: 'sg',
  ...patch,
});
const panelOf = (state: PanelState, level: Level = 'beginner') => buildPanel(state, { ...token, slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the δικός panel', () => {
  it('shows the phrase before the noun and on its own', () => {
    const p = panelOf(stateOf());
    expect(p.lemma).toBe('δικός / δική / δικό');
    expect(p.posLabel).toBe('adjective: own (mine)');
    expect(p.rows.map((r) => r.label)).toEqual(['before the noun', 'on its own']);
    expect(cells(p.rows, 0)).toEqual({ el: 'το δικό μου σπίτι', ro: 'propria mea casă', en: 'my own house' });
    expect(cells(p.rows, 1)).toEqual({ el: 'το δικό μου', ro: 'a mea', en: 'mine' });
  });

  it('starts as "my" when nothing says whose', () => {
    const { possessor: _p, ...bare } = stateOf();
    expect(cells(panelOf(bare).rows, 0).en).toBe('my own house');
    expect(control(panelOf(bare), 'possessor')?.value).toBe('1sg');
  });

  it('offers the noun, how many, the role (no genitive) and Whose?', () => {
    const p = panelOf(stateOf(), 'improver');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case', 'possessor']);
    expect(control(p, 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(control(p, 'possessor')?.options).toHaveLength(7);
  });

  it('changes with Whose?, the noun, the number and the role', () => {
    let s = stateOf();
    s = applyControl(s, 'possessor', '3sg-f');
    expect(cells(panelOf(s).rows, 0)).toEqual({ el: 'το δικό της σπίτι', ro: 'propria ei casă', en: 'her own house' });
    s = applyControl(s, 'noun', 'skylos');
    expect(s.slot).toEqual({ pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' });
    expect(cells(panelOf(s).rows, 0).el).toBe('ο δικός της σκύλος');
    s = applyControl(s, 'number', 'pl');
    expect(cells(panelOf(s).rows, 1)).toEqual({ el: 'οι δικοί της', ro: 'ai ei', en: 'hers' });
    s = applyControl(s, 'case', 'acc');
    expect(cells(panelOf(s).rows, 0).el).toBe('τους δικούς της σκύλους');
  });

  it('Improver: gender by role for the number, with the form in use outlined', () => {
    const p = panelOf(stateOf(), 'improver');
    expect(p.full.map((r) => r.label)).toEqual([
      'masc. nominative', 'masc. accusative', 'fem. nominative', 'fem. accusative', 'neut. nominative', 'neut. accusative',
    ]);
    expect(cells(p.full, 0)).toEqual({ el: 'ο δικός μου', ro: 'al meu', en: 'mine' });
    expect(cells(p.full, 3)).toEqual({ el: 'την δική μου', ro: 'a mea', en: 'mine' });
    expect(cells(p.full, 4)).toEqual({ el: 'το δικό μου', ro: 'al meu', en: 'mine' });
    expect(p.full.map((r) => r.hl?.el)).toEqual([false, false, false, false, true, false]);
    expect(p.full.map((r) => r.hl?.ro)).toEqual([false, false, true, false, false, false]);
    expect(panelOf(stateOf(), 'beginner').full).toEqual([]);
  });

  it('is the ordinary adjective panel for any other adjective', () => {
    const zestos: Token = { text: 'ζεστός', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' } };
    const p = buildPanel({ slot: zestos.slot, noun: 'kafes', nounNumber: 'sg' }, zestos, 'beginner');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
  });
});

describe('seeding the δικός panel from a phrase', () => {
  const phrase = {
    tokens: [
      { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 3 },
      { text: 'δικό', lexeme: 'dikos', slot, agreesWith: 3 },
      { text: 'της', lexeme: 'possessive', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'f' }, agreesWith: 3 },
      { text: 'σπίτι', lexeme: 'spiti', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    ],
  } as unknown as Phrase;

  it('takes the possessor of the possessive that follows it', () => {
    const state = initialState(phrase.tokens[1], phrase);
    expect(state.possessor).toEqual({ pos: 'possessive', person: 3, number: 'sg', gender: 'f' });
    expect(state.noun).toBe('spiti');
    expect(cells(panelOf(state).rows, 0).en).toBe('her own house');
  });

  it('choosing the phrase’s own possessor again is no change', () => {
    const state = initialState(phrase.tokens[1], phrase);
    expect(sameState(applyControl(applyControl(state, 'possessor', '1sg'), 'possessor', '3sg-f'), state)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/engine/own.test.ts src/panels/dikos.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Create `src/panels/dikos.ts`:

```ts
import { ownAlone, ownPhrase } from '../engine/agree';
import { inflectAdjective, inflectArticle } from '../engine/greek';
import { DEF_ARTICLE } from '../data/lexemes';
import { caseOptions } from '../engine/labels';
import { POSSESSORS, enAlone, greekPossessive, possessorValue, roAloneFor } from '../engine/possessive';
import { articleRich, formRich, joinRich, plain, richText } from '../engine/segments';
import type { Case, GreekAdjective, GreekNoun, Level, SlotOf } from '../types';
import { GENDERS, GENDER_ROW, caseName, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** δικός offers the nominative and the accusative only: Romanian has no short form of the genitive (propriului meu, al celui …). */
const ROLES: Case[] = ['nom', 'acc'];

function dikosFull(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun, possessor: SlotOf<'possessive'>): PanelRow[] {
  return GENDERS.flatMap((g) =>
    ROLES.map((c) => ({
      label: `${GENDER_ROW[g]} ${caseName(c)}`,
      el: joinRich([
        articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: g, number: slot.number, case: c })),
        formRich(inflectAdjective(adj, { pos: 'adjective', gender: g, number: slot.number, case: c })),
        [{ text: greekPossessive(possessor), role: 'clitic' as const }],
      ]),
      ro: plain(roAloneFor(possessor, g, slot.number)),
      en: plain(enAlone(possessor)),
      hl: { el: g === noun.gender && c === slot.case, ro: g === noun.ro.gender && c === slot.case, en: false },
    })),
  );
}

/** δικός (δική, δικό): "own" beside a noun, "mine" on its own, always followed by the weak possessive (spec 5.3, 24). */
export function dikosPanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const possessor = state.possessor ?? POSSESSORS[0].slot;
  const forms = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  );
  const roleControl: Control = {
    key: 'case',
    label: 'Role in sentence',
    options: caseOptions(level).filter((o) => ROLES.includes(o.value as Case)),
    value: slot.case,
  };
  return {
    lemma: forms.join(' / '),
    posLabel: level === 'beginner' ? 'adjective: own (mine)' : 'adjective · 3-ending (stressed) · emphatic possessive',
    controls: [
      nounControl('Noun it describes', state),
      numberControl(slot.number),
      roleControl,
      { key: 'possessor', label: 'Whose?', options: POSSESSORS.map(({ value, label }) => ({ value, label })), value: possessorValue(possessor) },
    ],
    rows: [
      npRow('before the noun', ownPhrase(adj, noun, slot.number, slot.case, possessor)),
      npRow('on its own', ownAlone(adj, noun, slot.number, slot.case, possessor)),
    ],
    full: level === 'improver' ? dikosFull(adj, slot, noun, possessor) : [],
    plain:
      'Greek δικός copies gender, number and role from the thing possessed, and the weak possessive follows it: το δικό μου σπίτι. Romanian puts propriu after the article and before the noun (propria mea casă) and says al meu, a mea, ai mei, ale mele on its own. English says "my own" beside a noun and "mine" on its own.',
    irregular: inflectAdjective(adj, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
```

Change `src/data/lexemes.ts` (unified diff):

```diff
@@ -271,4 +271,23 @@
 };
 
+const dikos: GreekAdjective = {
+  id: 'dikos',
+  pos: 'adjective',
+  lemma: 'δικός',
+  verified: { el: false, ro: false, en: false },
+  class: 'adj-stressed',
+  stem: 'δικ',
+  emphatic: true,
+  ro: {
+    lemma: 'propriu',
+    forms: {
+      m: { sg: 'propriu', pl: 'proprii' },
+      f: { sg: 'proprie', pl: 'proprii', genSg: 'proprii' },
+      n: { sg: 'propriu', pl: 'proprii' },
+    },
+  },
+  en: 'own',
+};
+
 const grigoros: GreekAdjective = {
   id: 'grigoros',
@@ -1282,4 +1301,5 @@
   [thalassa.id]: thalassa,
   [zestos.id]: zestos,
+  [dikos.id]: dikos,
   [grigoros.id]: grigoros,
   [tembelikos.id]: tembelikos,
```

Change `src/data/possessives.ts` (unified diff):

```diff
@@ -33,2 +33,29 @@
   '3pl': 'their',
 };
+
+/**
+ * Romanian *propriu* with its suffix article, by the gender and number of the possessed noun: *propriul meu câine*,
+ * *propria mea casă*, *proprii mei copii*, *propriile mele case*. Nominative and accusative only (spec 24).
+ */
+export const RO_OWN: Record<'m' | 'f', Record<Num, string>> = {
+  m: { sg: 'propriul', pl: 'proprii' },
+  f: { sg: 'propria', pl: 'propriile' },
+};
+
+/** The Romanian word before the possessive when it stands on its own: *al meu*, *a mea*, *ai mei*, *ale mele*. */
+export const RO_ALONE: Record<'m' | 'f', Record<Num, string>> = {
+  m: { sg: 'al', pl: 'ai' },
+  f: { sg: 'a', pl: 'ale' },
+};
+
+/** English "my own" beside a noun and "mine" on its own, by possessor. */
+export const EN_OWN: Record<PossessorKey, { own: string; alone: string }> = {
+  '1sg': { own: 'my own', alone: 'mine' },
+  '2sg': { own: 'your own', alone: 'yours' },
+  '3sg.m': { own: 'his own', alone: 'his' },
+  '3sg.f': { own: 'her own', alone: 'hers' },
+  '3sg.n': { own: 'its own', alone: 'its' },
+  '1pl': { own: 'our own', alone: 'ours' },
+  '2pl': { own: 'your own', alone: 'yours' },
+  '3pl': { own: 'their own', alone: 'theirs' },
+};
```

Change `src/data/review.ts` (unified diff):

```diff
@@ -12,4 +12,5 @@
   { id: 'ending-table:se-contractions', kind: 'ending-table', verified: false },
   { id: 'ending-table:ro-possessives', kind: 'ending-table', verified: false },
+  { id: 'ending-table:ro-own', kind: 'ending-table', verified: false },
   { id: 'ending-table:neut-o', kind: 'ending-table', verified: false },
   { id: 'ending-table:clitic-forms', kind: 'ending-table', verified: false },
```

Change `src/engine/agree.ts` (unified diff):

```diff
@@ -4,5 +4,5 @@
 import { enIndefiniteArticle, enNoun, enNumeral } from './english';
 import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
-import { enPossessive, greekPossessive, roPossessive } from './possessive';
+import { enAlone, enOwn, enPossessive, greekPossessive, roAlone, roBareNoun, roOwn, roPossessive } from './possessive';
 import { roAdjective, roNoun, roNumeral } from './romanian';
 import { articleRich, formRich, formText, joinRich, numeralRich, type Rich } from './segments';
@@ -81,2 +81,29 @@
   return { el: joinRich(el), ro: roText.filter(Boolean).join(' '), en: c === 'gen' ? `of ${enText}` : enText };
 }
+
+/**
+ * δικός before the noun: το δικό μου σπίτι, *propria mea casă*, "my own house". The possessive stands between the
+ * adjective and the noun, which takes no second accent. Nominative and accusative only (spec 24).
+ */
+export function ownPhrase(adj: GreekAdjective, noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): NounPhrase {
+  const gender = noun.gender;
+  const el = joinRich([
+    articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })),
+    formRich(inflectAdjective(adj, { pos: 'adjective', gender, number, case: c })),
+    [{ text: greekPossessive(possessor), role: 'clitic' }],
+    formRich(inflectNoun(noun, { pos: 'noun', number, case: c })),
+  ]);
+  const ro = [roOwn(noun, number), roPossessive(possessor, noun, number, c), roBareNoun(noun, number)].join(' ');
+  return { el, ro, en: `${enOwn(possessor)} ${enNoun(noun, number)}` };
+}
+
+/** δικός on its own, with the article: το δικό μου (*al meu*, *a mea*, "mine"). */
+export function ownAlone(adj: GreekAdjective, noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): NounPhrase {
+  const gender = noun.gender;
+  const el = joinRich([
+    articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })),
+    formRich(inflectAdjective(adj, { pos: 'adjective', gender, number, case: c })),
+    [{ text: greekPossessive(possessor), role: 'clitic' }],
+  ]);
+  return { el, ro: roAlone(possessor, noun, number), en: enAlone(possessor) };
+}
```

Change `src/engine/possessive.ts` (unified diff):

```diff
@@ -1,4 +1,4 @@
-import { EN_POSSESSIVES, RO_POSSESSIVES, type PossessorKey } from '../data/possessives';
-import type { Case, Clitic, GreekNoun, Num, SlotOf } from '../types';
+import { EN_OWN, EN_POSSESSIVES, RO_ALONE, RO_OWN, RO_POSSESSIVES, type PossessorKey } from '../data/possessives';
+import type { Case, Clitic, Gender, GreekNoun, Num, SlotOf } from '../types';
 import { greekClitic } from './clitics';
 
@@ -29,11 +29,34 @@
   const entry = RO_POSSESSIVES[possessorKey(s)];
   if (typeof entry === 'string') return entry;
-  const ro = noun.ro.gender;
-  const gender = ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro;
+  const gender = roAgreement(noun, number);
   return entry[gender][c === 'gen' && gender === 'f' && number === 'sg' ? 'pl' : number];
 }
 
+/** The Romanian gender a possessive or *propriu* agrees in: a neuter follows the masculine in the singular and the feminine in the plural. */
+const agreeGender = (ro: Gender, number: Num): 'm' | 'f' => (ro === 'n' ? (number === 'sg' ? 'm' : 'f') : ro);
+const roAgreement = (noun: GreekNoun, number: Num): 'm' | 'f' => agreeGender(noun.ro.gender, number);
+
+/** Romanian *propriu* with its article, agreeing with the possessed noun: propria (mea casă). */
+export const roOwn = (noun: GreekNoun, number: Num): string => RO_OWN[roAgreement(noun, number)][number];
+
+/** The Romanian possessive on its own: *al meu*, *a mea*, *ai mei*, *ale mele*, *a lui*. */
+export const roAlone = (s: Possessor, noun: GreekNoun, number: Num): string => roAloneFor(s, noun.ro.gender, number);
+
+/** The same for a Romanian gender given on its own (the rows of the full table). */
+export function roAloneFor(s: Possessor, roGender: Gender, number: Num): string {
+  const entry = RO_POSSESSIVES[possessorKey(s)];
+  const gender = agreeGender(roGender, number);
+  return `${RO_ALONE[gender][number]} ${typeof entry === 'string' ? entry : entry[gender][number]}`;
+}
+
+/** The Romanian noun without its article (the form after *propria mea*): casă, câine, copii. */
+export const roBareNoun = (noun: GreekNoun, number: Num): string => noun.ro.forms[number].indefinite.replace(/^(un|o) /, '');
+
 export const enPossessive = (s: Possessor): string => EN_POSSESSIVES[possessorKey(s)];
 
+/** English "my own" (beside a noun) and "mine" (on its own). */
+export const enOwn = (s: Possessor): string => EN_OWN[possessorKey(s)].own;
+export const enAlone = (s: Possessor): string => EN_OWN[possessorKey(s)].alone;
+
 /** The seven possessors the panel offers, with the label of the Whose? control. */
 export const POSSESSORS: { value: string; label: string; slot: Possessor }[] = [
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -28,4 +28,5 @@
 } from '../types';
 import { adjectivePanel } from './adjective';
+import { dikosPanel } from './dikos';
 import { articlePanel } from './article';
 import { nounPanel } from './noun';
@@ -46,4 +47,9 @@
 const DEFAULT_NOUN: Record<Gender, string> = { m: 'skylos', f: 'alepou', n: 'paidi' };
 
+const lexemeIsEmphatic = (token: Token): boolean => {
+  const l = getLexeme(token.lexeme);
+  return l.pos === 'adjective' && l.emphatic === true;
+};
+
 /** The state a word's panel starts in: the token's own slot and the noun it goes with in the phrase. */
 export function initialState(token: Token, phrase: Phrase): PanelState {
@@ -57,8 +63,13 @@
   if (!noun && token.slot.pos === 'quantifier') noun = DEFAULT_NOUN[token.slot.gender];
   // A noun that a possessive points at shows it: το σπίτι μου.
-  const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === phrase.tokens.indexOf(token)) : undefined;
+  const at = phrase.tokens.indexOf(token);
+  const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === at) : undefined;
+  // δικός shows the possessive that follows it: το δικό μου σπίτι.
+  const after = phrase.tokens[at + 1];
+  const own = lexemeIsEmphatic(token) && after?.slot.pos === 'possessive' ? after : undefined;
   return {
     slot: token.slot,
     ...(possessive && possessive.slot.pos === 'possessive' ? { possessor: possessive.slot } : {}),
+    ...(own && own.slot.pos === 'possessive' ? { possessor: own.slot } : {}),
     ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
     noun,
@@ -79,5 +90,7 @@
       return nounPanel(lexeme as GreekNoun, slot, level, state);
     case 'adjective':
-      return adjectivePanel(lexeme as GreekAdjective, slot, state, level);
+      return (lexeme as GreekAdjective).emphatic
+        ? dikosPanel(lexeme as GreekAdjective, slot, state, level)
+        : adjectivePanel(lexeme as GreekAdjective, slot, state, level);
     case 'numeral':
       return numeralPanel(lexeme as GreekNumeral, slot, state, level);
@@ -211,5 +224,5 @@
       break;
     case 'possessor':
-      if (slot.pos === 'noun') {
+      if (slot.pos === 'noun' || slot.pos === 'adjective') {
         const to = POSSESSORS.find((p) => p.value === value);
         const { possessor: _old, slot: _slot, ...rest } = state;
```

Change `src/types.ts` (unified diff):

```diff
@@ -150,4 +150,6 @@
   /** A passive participle: the verb it comes from and the participle stem it stores (πλυ-). */
   derivedFrom?: { verb: string; stem: string };
+  /** δικός: it is always followed by the weak possessive (το δικό μου σπίτι) and has a panel of its own (spec 24). */
+  emphatic?: true;
 }
 
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1251 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/engine/own.test.ts src/panels/dikos.test.ts src/panels/dikos.ts src/data/lexemes.ts src/data/possessives.ts src/data/review.ts src/engine/agree.ts src/engine/possessive.ts src/panels/panels.ts src/types.ts
git commit -m "feat: the adjective δικός (το δικό μου σπίτι, "mine") with its panel

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: δικός in phrases: the validator and phrases 69 and 70

**Files:**
- Create (test): `src/App.own.test.tsx`
- Create (test): `src/data/phrases-own.test.ts`
- Create (test): `src/validate/own-validate.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/divergences-possessive.test.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`

**Interfaces:**
- Consumes: The helpers `rows`, `u`, `seg`, `present`, `article`, `possessive` and `nomSg` in `src/data/phrases.ts`, and the lexeme `dikos`.
- Produces: Validator rules: the possessive may follow δικός (before its noun or after the verb), δικός needs the possessive of the same noun directly after it, and a noun is checked for the second accent only when the possessive is next to it; the phrases `my-own-house` and `the-house-is-mine`; the divergence row `emphatic-possessive` on δικός; the picker lists 70 phrases.

Phrase 70 puts δικό μου after the verb (Το σπίτι είναι δικό μου), where the possessive is not next to its noun.

- [ ] **Step 1: Write the tests**

Create `src/App.own.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('δικός in the app', () => {
  it('opens from its chip with the possessor of the phrase and shows both uses in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My own house');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'δικός / δική / δικό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'το δικό μου σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'propria mea casă' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'my own house' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'a mea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'mine' })).toBeInTheDocument();
  });

  it('Whose? changes the possessor in all three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The house is mine');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    await user.selectOptions(screen.getByLabelText('Whose?'), '1pl');
    expect(screen.getByRole('cell', { name: 'το δικό μας σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'a noastră' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ours' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('offers the subject and the object roles, not the possessor role', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My own house');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    const options = screen.getByLabelText('Role in sentence').querySelectorAll('option');
    expect([...options].map((o) => o.getAttribute('value'))).toEqual(['nom', 'acc']);
  });
});
```

Create `src/data/phrases-own.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['my-own-house', 'the-house-is-mine'];
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

describe('phrases 69 and 70', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Possession theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(['Possession', 'Possession']);
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('my-own-house')).toEqual(['Το δικό μου σπίτι', 'My own house', 'Propria mea casă']);
    expect(read('the-house-is-mine')).toEqual(['Το σπίτι είναι δικό μου', 'The house is mine', 'Casa este a mea']);
  });

  it('the literal English keeps the Greek order', () => {
    expect(gloss('my-own-house', 'en', 'literal')).toBe('the own my house');
    expect(gloss('the-house-is-mine', 'en', 'literal')).toBe('the house is own my');
  });

  it('δικός and the possessive both point at the noun', () => {
    const own = phrase('my-own-house').tokens;
    expect([own[1].agreesWith, own[2].agreesWith]).toEqual([3, 3]);
    const mine = phrase('the-house-is-mine').tokens;
    expect([mine[3].agreesWith, mine[4].agreesWith]).toEqual([1, 1]);
  });

  it('the noun takes no second accent when the possessive is not next to it', () => {
    expect(phrase('my-own-house').tokens[3].text).toBe('σπίτι');
  });
});
```

Create `src/validate/own-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const own = PHRASES.find((p) => p.id === 'my-own-house')!;
const mine = PHRASES.find((p) => p.id === 'the-house-is-mine')!;
const withTokens = (base: Phrase, change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('δικός in the validator', () => {
  it('accepts both real phrases', () => {
    expect(errorsOf(own)).toEqual([]);
    expect(errorsOf(mine)).toEqual([]);
  });

  it('wants the possessive of the same noun directly after δικός', () => {
    const gone = withTokens(own, (t) => [t[0], t[1], t[3]].map((x, i) => (i === 2 ? { ...x } : x)).map((x) => ({ ...x, agreesWith: x.agreesWith === 3 ? 2 : x.agreesWith })));
    expect(errorsOf(gone).some((e) => e.includes('δικός needs the possessive of the same noun directly after it'))).toBe(true);
    const other = withTokens(mine, (t) => t.map((x, i) => (i === 4 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(other).some((e) => e.includes('δικός needs the possessive'))).toBe(true);
  });

  it('a possessive before its noun is wrong unless δικός comes just before it', () => {
    const swapped = withTokens(own, (t) => [t[0], t[2], t[1], t[3]]);
    expect(errorsOf(swapped).some((e) => e.includes('comes after its noun'))).toBe(true);
  });

  it('wants the noun’s agreement, the gender of δικός and the form of its text', () => {
    const gender = withTokens(own, (t) => t.map((x, i) => (i === 1 ? { ...x, slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(gender).some((e) => e.includes('slot gender m differs from noun gender n'))).toBe(true);
  });

  it('asks for no second accent on a noun with a possessive that is not next to it', () => {
    const sea = withTokens(own, (t) => t.map((x, i) => (i === 3 ? { ...x, text: 'θάλασσα', lexeme: 'thalassa' } : i === 0 ? { ...x, slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' } as Token['slot'] } : i === 1 ? { ...x, text: 'δική', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(sea).filter((e) => e.includes('before the possessive'))).toEqual([]);
  });
});
```

Change `src/data/divergences-possessive.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -26,2 +26,17 @@
   });
 });
+
+describe('the comparison note for δικός', () => {
+  const dikos = (level: Level = 'improver') =>
+    selectDivergences(DIVERGENCES, 'adjective', 'dikos', level, { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }).map((d) => d.id);
+
+  it('shows on δικός at both levels, and on no other adjective', () => {
+    expect(dikos()).toContain('emphatic-possessive');
+    expect(dikos('beginner')).toContain('emphatic-possessive');
+    expect(selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'improver').map((d) => d.id)).not.toContain('emphatic-possessive');
+  });
+
+  it('is unverified', () => {
+    expect(DIVERGENCES.find((d) => d.id === 'emphatic-possessive')?.verified).toBe(false);
+  });
+});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 68 phrases in the spec order', () => {
+  it('the picker lists all 70 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -101,4 +101,5 @@
       'going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water',
       'my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee',
+      'my-own-house', 'the-house-is-mine',
     ]);
   });
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.own.test.tsx src/data/phrases-own.test.ts src/validate/own-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -845,3 +845,14 @@
     verified: false,
   },
+  {
+    id: 'emphatic-possessive',
+    appliesTo: { pos: 'adjective', lexeme: 'dikos' },
+    point: 'My own, mine',
+    el: 'δικός + μου: an adjective that agrees with the thing possessed (το δικό μου σπίτι; το δικό μου on its own)',
+    ro: '*propriu* beside the noun (propria mea casă); *al meu / a mea / ai mei / ale mele* on its own',
+    en: '"my own" beside a noun, "mine" on its own',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1493,4 +1493,45 @@
 };
 
+const myOwnHouse: Phrase = {
+  id: 'my-own-house',
+  title: 'My own house',
+  theme: 'Possession',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 3), text: 'Το' },
+    { text: 'δικό', lexeme: 'dikos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 3 },
+    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 3 },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+  ],
+  glosses: rows(
+    [u('My', 2), u('own', 1), u('house', 3)],
+    [u('the', 0), u('own', 1), u('my', 2), u('house', 3)],
+    [u('Propria', 1), u('mea', 2), u('casă', 3)],
+    [u('propria', 1), u('mea', 2), u('casă', 3)],
+  ),
+  verified: false,
+};
+
+const theHouseIsMine: Phrase = {
+  id: 'the-house-is-mine',
+  title: 'The house is mine',
+  theme: 'Possession',
+  level: 'improver',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
+    { text: 'δικό', lexeme: 'dikos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
+    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('The', 0), u('house', 1), u('is', 2), u('mine', 3)],
+    [u('the', 0), u('house', 1), u('is', 2), u('own', 3), u('my', 4)],
+    [seg(['Cas', 1], ['a', 0]), u('este', 2), u('a', 3), u('mea', 4)],
+    [seg(['cas', 1], ['a', 0]), u('este', 2), u('a', 3), u('mea', 4)],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1558,3 +1599,5 @@
   whereIsYourHouse,
   myHotCoffee,
+  myOwnHouse,
+  theHouseIsMine,
 ];
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -404,5 +404,11 @@
       const at = token.agreesWith as number;
       const between = phrase.tokens.slice(at + 1, index);
-      if (at >= index) {
+      // After δικός it may stand before its noun (το δικό μου σπίτι) or after the verb (είναι δικό μου).
+      const before = phrase.tokens[index - 1];
+      const beforeLexeme = before ? lexemes[before.lexeme] : undefined;
+      const afterOwn = beforeLexeme?.pos === 'adjective' && beforeLexeme.emphatic === true && before?.agreesWith === at;
+      if (afterOwn) {
+        // nothing more to check about its place
+      } else if (at >= index) {
         errors.push(`${where}: a possessive comes after its noun`);
       } else if (between.length > 0) {
@@ -416,8 +422,15 @@
     }
   }
+  if (token.slot.pos === 'adjective' && lexeme.pos === 'adjective' && lexeme.emphatic) {
+    // δικός is always followed by the possessive of the same noun: το δικό μου σπίτι.
+    const next = phrase.tokens[index + 1];
+    if (!next || next.slot.pos !== 'possessive' || next.agreesWith !== token.agreesWith) {
+      errors.push(`${where}: δικός needs the possessive of the same noun directly after it`);
+    }
+  }
   if (token.slot.pos === 'noun' && lexeme.pos === 'noun') {
     // A noun with a possessive after it is written with the second accent where the stress rule asks for it (θάλασσά μου).
-    const possessive = phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === index);
-    if (possessive && possessive.slot.pos === 'possessive') {
+    const possessive = phrase.tokens[index + 1];
+    if (possessive && possessive.slot.pos === 'possessive' && possessive.agreesWith === index) {
       try {
         const expected = formText(possessedNounForm(lexeme, token.slot.number, token.slot.case, possessive.slot));
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1267 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.own.test.tsx src/data/phrases-own.test.ts src/validate/own-validate.test.ts src/data/divergences-possessive.test.ts src/data/divergences.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/validate/validate.ts
git commit -m "feat: δικός in phrases 69 and 70

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: A noun possessor in the genitive: phrases 71 and 72

**Files:**
- Create (test): `src/App.owner.test.tsx`
- Create (test): `src/data/phrases-owner.test.ts`
- Create (test): `src/engine/owner.test.ts`
- Create (test): `src/panels/owner.test.ts`
- Create (test): `src/validate/owner-validate.test.ts`
- Modify: `src/data/divergences.ts`
- Modify: `src/data/phrases.ts`
- Modify: `src/engine/agree.ts`
- Modify: `src/panels/noun.ts`
- Modify: `src/panels/panels.ts`
- Modify: `src/panels/types.ts`
- Modify: `src/validate/validate.ts`
- Modify (test): `src/data/divergences-possessive.test.ts`
- Modify (test): `src/data/phrases-verbs.test.ts`
- Modify (test): `src/panels/panels.test.ts`

**Interfaces:**
- Consumes: `nounPhrase`, `NpOptions`, `nounPanel`, `nounOptions`, `PanelState`, the Romanian `genDefinite` forms and the helpers of `src/data/phrases.ts`.
- Produces: `NpOptions.owner` (a noun in the genitive singular, with the definite article alone); `PanelState.owner` and the control key `owner`; the Owned by a noun? control and the row "with a noun possessor" in the noun panel; seeding from a phrase; the validator rule for a noun possessor token (genitive singular, at the possessed noun's index + 2, with its own definite article, `agreesWith` the possessed noun) and the case-aware Romanian gloss check; the phrases `the-childs-house` and `the-childs-dog`; the divergence row `noun-possessor`; the picker lists 72 phrases.

One existing test lists the noun panel's controls and changes to include `owner`. The English text uses a straight apostrophe, like the rest of the data.

- [ ] **Step 1: Write the tests**

Create `src/App.owner.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('a noun possessor in the app', () => {
  it('the possessed noun shows its owner, and the owner control can change it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "The child's house");
    await user.click(screen.getByRole('button', { name: 'σπίτι' }));
    expect(screen.getByRole('cell', { name: 'το σπίτι του παιδιού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa copilului' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "the child's house" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'thalassa');
    expect(screen.getByRole('cell', { name: 'το σπίτι της θάλασσας' })).toBeInTheDocument();
  });

  it('nobody, then the phrase’s own owner again, is the phrase again', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "The child's dog");
    await user.click(screen.getByRole('button', { name: 'σκύλος' }));
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'none');
    expect(screen.queryByRole('cell', { name: 'ο σκύλος του παιδιού' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'paidi');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });
});
```

Create `src/data/phrases-owner.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['the-childs-house', 'the-childs-dog'];
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

describe('phrases 71 and 72', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Possession theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(['Possession', 'Possession']);
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('the-childs-house')).toEqual(['Το σπίτι του παιδιού', "The child's house", 'Casa copilului']);
    expect(read('the-childs-dog')).toEqual(['Ο σκύλος του παιδιού', "The child's dog", 'Câinele copilului']);
  });

  it('the literal English says "of the": the house of the child', () => {
    expect(gloss('the-childs-house', 'en', 'literal')).toBe('the house of the child');
    expect(gloss('the-childs-dog', 'en', 'literal')).toBe('the dog of the child');
  });

  it('the possessor noun points back at the noun it belongs to', () => {
    expect(phrase('the-childs-house').tokens[3].agreesWith).toBe(1);
    expect(phrase('the-childs-dog').tokens[3].agreesWith).toBe(1);
  });
});
```

Create `src/engine/owner.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import type { Case, Num } from '../types';
import { nounPhrase } from './agree';
import { richText } from './segments';

const owned = (noun: string, owner: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = nounPhrase(getNoun(noun), number, c, { article: 'definite', owner: getNoun(owner) });
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('a noun possessor in the genitive', () => {
  it('goes after the noun with its own article', () => {
    expect(owned('spiti', 'paidi')).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(owned('skylos', 'paidi')).toEqual({ el: 'ο σκύλος του παιδιού', ro: 'câinele copilului', en: "the child's dog" });
  });

  it("takes the article of the possessor's own gender", () => {
    expect(owned('spiti', 'skylos')).toEqual({ el: 'το σπίτι του σκύλου', ro: 'casa câinelui', en: "the dog's house" });
    expect(owned('paidi', 'thalassa')).toEqual({ el: 'το παιδί της θάλασσας', ro: 'copilul mării', en: "the sea's child" });
    expect(owned('skylos', 'alepou')).toEqual({ el: 'ο σκύλος της αλεπούς', ro: 'câinele vulpii', en: "the fox's dog" });
  });

  it('follows the possessed noun in number and role', () => {
    expect(owned('spiti', 'paidi', 'pl')).toEqual({ el: 'τα σπίτια του παιδιού', ro: 'casele copilului', en: "the child's houses" });
    expect(owned('spiti', 'paidi', 'sg', 'acc')).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(owned('spiti', 'paidi', 'sg', 'gen')).toEqual({ el: 'του σπιτιού του παιδιού', ro: 'casei copilului', en: "of the child's house" });
  });

  it('goes with the definite article alone', () => {
    const paidi = getNoun('paidi');
    const spiti = getNoun('spiti');
    expect(() => nounPhrase(spiti, 'sg', 'nom', { owner: paidi })).toThrow(/definite article alone/);
    expect(() => nounPhrase(spiti, 'sg', 'nom', { article: 'definite', owner: paidi, adjective: getAdjective('zestos') })).toThrow(/definite article alone/);
  });
});
```

Create `src/panels/owner.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level, Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slot = (patch: Partial<SlotOf<'noun'>> = {}): SlotOf<'noun'> => ({ pos: 'noun', number: 'sg', case: 'nom', ...patch });
const stateOf = (patch: Partial<PanelState> = {}, s: SlotOf<'noun'> = slot()): PanelState => ({ slot: s, noun: null, nounNumber: 'sg', ...patch });
const panelOf = (state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: 'σπίτι', lexeme: 'spiti', slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const phrase = (id: string): Phrase => PHRASES.find((p) => p.id === id)!;

describe('the noun panel with a noun possessor', () => {
  it('has no such row until a noun owns it', () => {
    const p = panelOf(stateOf());
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(p.controls.find((c) => c.key === 'owner')?.value).toBe('none');
  });

  it('shows the phrase with the owner in the genitive', () => {
    const p = panelOf(stateOf({ owner: 'paidi' }));
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an', 'with a noun possessor']);
    expect(cells(p.rows, 2)).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(p.controls.find((c) => c.key === 'owner')?.value).toBe('paidi');
  });

  it('offers nobody and every noun', () => {
    const options = panelOf(stateOf()).controls.find((c) => c.key === 'owner')!.options;
    expect(options[0]).toEqual({ value: 'none', label: 'nobody' });
    expect(options.map((o) => o.value)).toContain('skylos');
    expect(options.map((o) => o.value)).toContain('thalassa');
  });

  it('follows the number and the role of the noun, and goes with "many" but not with a count', () => {
    const many = panelOf(stateOf({ owner: 'paidi' }, slot({ number: 'pl' })));
    expect(cells(many.rows, 2).el).toBe('τα σπίτια του παιδιού');
    const three = panelOf(stateOf({ owner: 'paidi' }, slot({ number: 'pl', count: 3 })));
    expect(three.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    const genitive = panelOf(stateOf({ owner: 'paidi' }, slot({ case: 'gen' })));
    expect(cells(genitive.rows, 2)).toEqual({ el: 'του σπιτιού του παιδιού', ro: 'casei copilului', en: "of the child's house" });
  });

  it('a noun owner and a pronoun possessor do not go together: choosing one drops the other', () => {
    let s = applyControl(stateOf({ possessor: { pos: 'possessive', person: 1, number: 'sg' } }), 'owner', 'paidi');
    expect(s.owner).toBe('paidi');
    expect(s.possessor).toBeUndefined();
    s = applyControl(s, 'possessor', '2sg');
    expect(s.possessor).toMatchObject({ person: 2 });
    expect(s.owner).toBeUndefined();
    s = applyControl(applyControl(s, 'owner', 'skylos'), 'owner', 'none');
    expect(s.owner).toBeUndefined();
  });

  it('does not apply to other parts of speech', () => {
    const adj: PanelState = { slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, noun: 'spiti', nounNumber: 'sg' };
    expect(applyControl(adj, 'owner', 'paidi')).toBe(adj);
  });
});

describe('seeding the noun panel from a phrase with a noun possessor', () => {
  const house = phrase('the-childs-house');

  it('starts the possessed noun with its owner', () => {
    const state = initialState(house.tokens[1], house);
    expect(state.owner).toBe('paidi');
    expect(cells(panelOf(state).rows, 2).en).toBe("the child's house");
  });

  it('does not seed the owner noun itself', () => {
    expect(initialState(house.tokens[3], house).owner).toBeUndefined();
  });

  it('nobody, then the phrase’s own owner again, is the phrase again', () => {
    const start = initialState(house.tokens[1], house);
    const back = applyControl(applyControl(start, 'owner', 'none'), 'owner', 'paidi');
    expect(sameState(back, start)).toBe(true);
  });

  it('a possessive phrase seeds no owner', () => {
    const mine = phrase('my-house');
    expect(initialState(mine.tokens[1], mine).owner).toBeUndefined();
  });
});
```

Create `src/validate/owner-validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate, warnings } from './validate';

const house = PHRASES.find((p) => p.id === 'the-childs-house')!;
const withTokens = (change: (tokens: Token[]) => Token[]): Phrase => ({ ...house, tokens: change(house.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a noun possessor in the validator', () => {
  it('accepts both real phrases', () => {
    expect(errorsOf(house)).toEqual([]);
    expect(errorsOf(PHRASES.find((p) => p.id === 'the-childs-dog')!)).toEqual([]);
  });

  it('wants the genitive singular', () => {
    const acc = withTokens((t) => t.map((x, i) => (i === 3 ? { ...x, slot: { pos: 'noun', number: 'sg', case: 'acc' } as Token['slot'] } : x)));
    expect(errorsOf(acc)).toContain('the-childs-house token 3 (παιδιού): a noun possessor is the genitive singular');
  });

  it('wants it right after the possessed noun and its own article', () => {
    const far = withTokens((t) => [t[0], t[1], t[0], t[2], t[3]].map((x, i) => (i === 4 ? { ...x, agreesWith: 1 } : x)).map((x, i) => (i === 3 ? { ...x, agreesWith: 4 } : x)));
    expect(errorsOf(far).some((e) => e.includes('comes after its noun and its own article'))).toBe(true);
  });

  it('wants the definite article just before it', () => {
    const none = withTokens((t) => [t[0], t[1], { ...t[3], agreesWith: 1 }]);
    expect(errorsOf(none).some((e) => e.includes('needs the definite article just before it'))).toBe(true);
  });

  it('wants the possessed noun to have its definite article too', () => {
    const noArticle = withTokens((t) => t.slice(1).map((x) => ({ ...x, agreesWith: x.agreesWith === undefined ? undefined : x.agreesWith - 1 })));
    expect(errorsOf(noArticle).some((e) => e.includes('the noun of a noun possessor needs the definite article'))).toBe(true);
  });

  it('wants agreesWith to point at a noun', () => {
    const pointing = withTokens((t) => t.map((x, i) => (i === 3 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(pointing)).toContain('the-childs-house token 3 (παιδιού): a noun possessor needs agreesWith pointing at the noun it belongs to');
  });

  it('checks the Romanian genitive split against the noun data', () => {
    const bad: Phrase = {
      ...house,
      glosses: house.glosses.map((g) =>
        g.language === 'ro' && g.kind === 'natural'
          ? { ...g, units: [g.units[0], { segments: [{ text: 'copil', link: 3 }, { text: 'ul', link: 2 }] }] }
          : g,
      ),
    };
    expect(warnings({ lexemes: LEXEMES, phrases: [bad] })).toEqual([
      'the-childs-house gloss ro/natural: "copilul" is split copil + ul, the noun data has the genitive copilului',
    ]);
    expect(warnings({ lexemes: LEXEMES, phrases: [house] })).toEqual([]);
  });
});
```

Change `src/data/divergences-possessive.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -41,2 +41,14 @@
   });
 });
+
+describe('the comparison note for a noun possessor', () => {
+  it('shows on a noun at both levels', () => {
+    for (const level of ['beginner', 'improver'] as const) {
+      expect(selectDivergences(DIVERGENCES, 'noun', 'spiti', level).map((d) => d.id)).toContain('noun-possessor');
+    }
+  });
+
+  it('is unverified', () => {
+    expect(DIVERGENCES.find((d) => d.id === 'noun-possessor')?.verified).toBe(false);
+  });
+});
```

Change `src/data/phrases-verbs.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -82,5 +82,5 @@
   });
 
-  it('the picker lists all 70 phrases in the spec order', () => {
+  it('the picker lists all 72 phrases in the spec order', () => {
     expect(PHRASES.map((p) => p.id)).toEqual([
       'ordering-hot-coffee', 'ordering-three-coffees', 'fox-sentence',
@@ -101,5 +101,5 @@
       'going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water',
       'my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee',
-      'my-own-house', 'the-house-is-mine',
+      'my-own-house', 'the-house-is-mine', 'the-childs-house', 'the-childs-dog',
     ]);
   });
```

Change `src/panels/panels.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -64,5 +64,5 @@
     expect(panel.lemma).toBe('καφές');
     expect(panel.posLabel).toBe('noun: coffee (masculine)');
-    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case', 'possessor']);
+    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case', 'possessor', 'owner']);
     expect(panel.controls[0].value).toBe('1');
     expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run src/App.owner.test.tsx src/data/phrases-owner.test.ts src/engine/owner.test.ts src/panels/owner.test.ts src/validate/owner-validate.test.ts`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/data/divergences.ts` (unified diff):

```diff
@@ -856,3 +856,14 @@
     verified: false,
   },
+  {
+    id: 'noun-possessor',
+    appliesTo: { pos: 'noun' },
+    point: 'A noun as the possessor',
+    el: 'the genitive after the noun, with its own article: το σπίτι του παιδιού',
+    ro: 'the genitive-dative after the noun, with the suffix article: casa copilului',
+    en: '"the child\'s house" or "the house of the child"',
+    tag: 'differs',
+    level: 'core',
+    verified: false,
+  },
 ];
```

Change `src/data/phrases.ts` (unified diff):

```diff
@@ -1534,4 +1534,46 @@
 };
 
+const genSg = (gender: Gender): Slot => ({ pos: 'article', gender, number: 'sg', case: 'gen' });
+
+const theChildsHouse: Phrase = {
+  id: 'the-childs-house',
+  title: "The child's house",
+  theme: 'Possession',
+  level: 'beginner',
+  tokens: [
+    { ...article('n', 'nom', 1), text: 'Το' },
+    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
+    { text: 'του', lexeme: 'def', slot: genSg('n'), agreesWith: 3 },
+    { text: 'παιδιού', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'gen' }, agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('The', 2), u("child's", 3), u('house', 1)],
+    [u('the', 0), u('house', 1), u('of the', 2), u('child', 3)],
+    [seg(['Cas', 1], ['a', 0]), seg(['copil', 3], ['ului', 2])],
+    [seg(['cas', 1], ['a', 0]), seg(['copil', 3], ['ului', 2])],
+  ),
+  verified: false,
+};
+
+const theChildsDog: Phrase = {
+  id: 'the-childs-dog',
+  title: "The child's dog",
+  theme: 'Possession',
+  level: 'beginner',
+  tokens: [
+    { ...article('m', 'nom', 1), text: 'Ο' },
+    { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
+    { text: 'του', lexeme: 'def', slot: genSg('n'), agreesWith: 3 },
+    { text: 'παιδιού', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'gen' }, agreesWith: 1 },
+  ],
+  glosses: rows(
+    [u('The', 2), u("child's", 3), u('dog', 1)],
+    [u('the', 0), u('dog', 1), u('of the', 2), u('child', 3)],
+    [seg(['Câine', 1], ['le', 0]), seg(['copil', 3], ['ului', 2])],
+    [seg(['câine', 1], ['le', 0]), seg(['copil', 3], ['ului', 2])],
+  ),
+  verified: false,
+};
+
 export const PHRASES: Phrase[] = [
   orderingHotCoffee,
@@ -1601,3 +1643,5 @@
   myOwnHouse,
   theHouseIsMine,
+  theChildsHouse,
+  theChildsDog,
 ];
```

Change `src/engine/agree.ts` (unified diff):

```diff
@@ -16,4 +16,6 @@
   count?: Exclude<NumeralValue, 1>;
   adjective?: GreekAdjective;
+  /** A noun possessor in the genitive after the noun (το σπίτι του παιδιού); the possessor is singular and definite. */
+  owner?: GreekNoun;
 }
 
@@ -38,4 +40,7 @@
   if (opts.article && opts.count) throw new Error('A noun phrase has an article or a count, not both');
   if (opts.possessor && opts.article !== 'definite') throw new Error('A possessive goes with the definite article');
+  if (opts.owner && (opts.article !== 'definite' || opts.possessor || opts.adjective)) {
+    throw new Error('A noun possessor goes with the definite article alone, with no possessive or adjective');
+  }
   if (opts.article === 'one' && number === 'pl') throw new Error('Greek has no plural indefinite article');
   if (opts.count && number !== 'pl') throw new Error('A counted noun phrase is plural');
@@ -57,4 +62,8 @@
   el.push(formRich(opts.possessor ? possessedNounForm(noun, number, c, opts.possessor) : inflectNoun(noun, { pos: 'noun', number, case: c })));
   if (opts.possessor) el.push([{ text: greekPossessive(opts.possessor), role: 'clitic' }]);
+  if (opts.owner) {
+    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: opts.owner.gender, number: 'sg', case: 'gen' })));
+    el.push(formRich(inflectNoun(opts.owner, { pos: 'noun', number: 'sg', case: 'gen' })));
+  }
 
   const roAdj = opts.adjective ? roAdjective(opts.adjective, noun.ro.gender, number, c) : '';
@@ -64,4 +73,5 @@
         roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'),
         opts.possessor ? roPossessive(opts.possessor, noun, number, c) : '',
+        opts.owner ? roNoun(opts.owner, 'sg', 'gen', 'definite') : '',
         roAdj,
       ];
@@ -77,5 +87,6 @@
           ? enIndefiniteArticle(core)
           : '';
-  const enText = [word, core].filter(Boolean).join(' ');
+  // The child's house: the possessor takes the place of the article.
+  const enText = opts.owner ? `the ${opts.owner.en.sg}'s ${core}` : [word, core].filter(Boolean).join(' ');
 
   return { el: joinRich(el), ro: roText.filter(Boolean).join(' '), en: c === 'gen' ? `of ${enText}` : enText };
```

Change `src/panels/noun.ts` (unified diff):

```diff
@@ -4,6 +4,7 @@
 import { POSSESSORS, possessorValue } from '../engine/possessive';
 import { plain, richText } from '../engine/segments';
+import { getNoun } from '../data/lexemes';
 import type { GreekNoun, Level, SlotOf } from '../types';
-import { ALL, CASES, NUMS, caseControl, caseName, noPluralArticleRow, npRow } from './shared';
+import { ALL, CASES, NUMS, caseControl, caseName, noPluralArticleRow, nounOptions, npRow } from './shared';
 import type { Panel, PanelRow, PanelState } from './types';
 
@@ -41,4 +42,5 @@
 export function nounPanel(noun: GreekNoun, slot: SlotOf<'noun'>, level: Level, state?: PanelState): Panel {
   const possessor = state?.possessor;
+  const owner = state?.owner ? getNoun(state.owner) : undefined;
   const second =
     slot.number === 'sg'
@@ -62,4 +64,10 @@
         value: possessor ? possessorValue(possessor) : 'none',
       },
+      {
+        key: 'owner',
+        label: 'Owned by a noun?',
+        options: [{ value: 'none', label: 'nobody' }, ...nounOptions()],
+        value: state?.owner ?? 'none',
+      },
     ],
     rows: [
@@ -69,4 +77,7 @@
         ? [npRow('with a possessive', nounPhrase(noun, slot.number, slot.case, { article: 'definite', possessor }))]
         : []),
+      ...(owner && slot.count === undefined
+        ? [npRow('with a noun possessor', nounPhrase(noun, slot.number, slot.case, { article: 'definite', owner }))]
+        : []),
     ],
     full: level === 'improver' ? nounFull(noun, slot) : [],
```

Change `src/panels/panels.ts` (unified diff):

```diff
@@ -65,4 +65,6 @@
   const at = phrase.tokens.indexOf(token);
   const possessive = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'possessive' && t.agreesWith === at) : undefined;
+  // A noun shows the noun that owns it: the genitive noun that points back at it (το σπίτι του παιδιού).
+  const owner = token.slot.pos === 'noun' ? phrase.tokens.find((t) => t.slot.pos === 'noun' && t.slot.case === 'gen' && t.agreesWith === at) : undefined;
   // δικός shows the possessive that follows it: το δικό μου σπίτι.
   const after = phrase.tokens[at + 1];
@@ -72,4 +74,5 @@
     ...(possessive && possessive.slot.pos === 'possessive' ? { possessor: possessive.slot } : {}),
     ...(own && own.slot.pos === 'possessive' ? { possessor: own.slot } : {}),
+    ...(owner ? { owner: owner.lexeme } : {}),
     ...(token.slot.pos === 'possessive' && nounToken?.slot.pos === 'noun' ? { nounCase: nounToken.slot.case } : {}),
     noun,
@@ -226,5 +229,5 @@
       if (slot.pos === 'noun' || slot.pos === 'adjective') {
         const to = POSSESSORS.find((p) => p.value === value);
-        const { possessor: _old, slot: _slot, ...rest } = state;
+        const { possessor: _old, owner: _owner, slot: _slot, ...rest } = state;
         // A fixed key order, so that sameState (which compares JSON) is true after nobody → the phrase's own possessor.
         return { slot: state.slot, ...(to ? { possessor: { ...to.slot } } : {}), ...rest };
@@ -235,4 +238,12 @@
       }
       break;
+    case 'owner':
+      if (slot.pos === 'noun') {
+        const { possessor: _old, owner: _owner, slot: _slot, ...rest } = state;
+        const to = value !== 'none' && getLexeme(value).pos === 'noun' ? value : undefined;
+        // A fixed key order, as for the possessor.
+        return { slot: state.slot, ...(to ? { owner: to } : {}), ...rest };
+      }
+      break;
     case 'recipient':
       if (slot.pos === 'verb' && indirectOf(slot)) {
```

Change `src/panels/types.ts` (unified diff):

```diff
@@ -4,5 +4,5 @@
 
 export interface Control {
-  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor';
+  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor' | 'owner';
   label: string;
   options: Option[];
@@ -99,3 +99,5 @@
   /** The noun panel's Whose? control: the possessor shown after the noun (absent: nobody). */
   possessor?: SlotOf<'possessive'>;
+  /** The noun panel's second Whose? control: a noun that owns it, in the genitive (το σπίτι του παιδιού); a lexeme id. */
+  owner?: string;
 }
```

Change `src/validate/validate.ts` (unified diff):

```diff
@@ -429,4 +429,20 @@
     }
   }
+  if (token.slot.pos === 'noun' && token.agreesWith !== undefined) {
+    // A noun possessor: the genitive singular noun after the possessed noun and its own definite article (το σπίτι του παιδιού).
+    const owned = phrase.tokens[token.agreesWith];
+    if (!owned || owned.slot.pos !== 'noun') {
+      errors.push(`${where}: a noun possessor needs agreesWith pointing at the noun it belongs to`);
+    } else {
+      if (token.slot.case !== 'gen' || token.slot.number !== 'sg') errors.push(`${where}: a noun possessor is the genitive singular`);
+      if (index !== token.agreesWith + 2) errors.push(`${where}: a noun possessor comes after its noun and its own article`);
+      const article = phrase.tokens[index - 1];
+      if (!article || article.slot.pos !== 'article' || article.lexeme !== 'def' || article.agreesWith !== index) {
+        errors.push(`${where}: a noun possessor needs the definite article just before it`);
+      }
+      const hasArticle = phrase.tokens.some((t) => t.slot.pos === 'article' && t.lexeme === 'def' && t.agreesWith === token.agreesWith);
+      if (!hasArticle) errors.push(`${where}: the noun of a noun possessor needs the definite article`);
+    }
+  }
   if (token.slot.pos === 'noun' && lexeme.pos === 'noun') {
     // A noun with a possessive after it is written with the second accent where the stress rule asks for it (θάλασσά μου).
@@ -609,6 +625,14 @@
           continue;
         }
-        const expected = noun.ro.split[nounToken.slot.number];
         const actual = unit.segments.map((s) => s.text.replace(/[!?.,;]+$/u, ''));
+        if (nounToken.slot.case === 'gen') {
+          // The genitive is not a split of the nominative: the two parts must make up the stored genitive (copil + ului).
+          const whole = noun.ro.forms[nounToken.slot.number].genDefinite;
+          if (actual.length !== 2 || actual.join('').toLowerCase() !== whole.toLowerCase()) {
+            out.push(`${where}: "${unitText(unit)}" is split ${actual.join(' + ')}, the noun data has the genitive ${whole}`);
+          }
+          continue;
+        }
+        const expected = noun.ro.split[nounToken.slot.number];
         if (actual.length !== 2 || actual[0].toLowerCase() !== expected[0].toLowerCase() || actual[1] !== expected[1]) {
           out.push(
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1297 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/App.owner.test.tsx src/data/phrases-owner.test.ts src/engine/owner.test.ts src/panels/owner.test.ts src/validate/owner-validate.test.ts src/data/divergences-possessive.test.ts src/data/divergences.ts src/data/phrases-verbs.test.ts src/data/phrases.ts src/engine/agree.ts src/panels/noun.ts src/panels/panels.test.ts src/panels/panels.ts src/panels/types.ts src/validate/validate.ts
git commit -m "feat: a noun as the possessor (το σπίτι του παιδιού) and phrases 71 and 72

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: The review sheet

**Files:**
- Modify: `src/validate/reviewSheet.ts`
- Modify (test): `src/validate/reviewSheet.test.ts`

**Interfaces:**
- Consumes: `lexemeSection`, `possessiveLines` and `LANG_NAME` in `src/validate/reviewSheet.ts`; `ownPhrase`, `ownAlone` and `nounPhrase` with an owner.
- Produces: A δικός section (the Romanian words and every noun with every possessor, before the noun and on its own) and a section "Noun possessors (generated)" (every noun owned by every noun).

The review sheet is written to `review/content-review.md`, which is git-ignored.

- [ ] **Step 1: Write the tests**

Change `src/validate/reviewSheet.test.ts` (a unified diff: lines starting with `-` go, lines starting with `+` come in, `@@` marks the place):

```diff
@@ -111,4 +111,22 @@
   });
 
+  it('shows δικός: the Romanian words and the noun phrases with every possessor', () => {
+    expect(sheet).toContain('- Romanian propriu with its article (nominative and accusative): masc. sg propriul · masc. pl proprii · fem. sg propria · fem. pl propriile');
+    expect(sheet).toContain('- Romanian word before the possessive on its own: masc. sg al · masc. pl ai · fem. sg a · fem. pl ale');
+    expect(sheet).toContain('το δικό μου σπίτι · το δικό σου σπίτι · το δικό του σπίτι · το δικό της σπίτι · το δικό μας σπίτι · το δικό σας σπίτι · το δικό τους σπίτι');
+    expect(sheet).toContain('propria mea casă · propria ta casă · propria lui casă · propria ei casă · propria noastră casă · propria voastră casă · propria lor casă');
+    expect(sheet).toContain('my own house · your own house · his own house · her own house · our own house · your own house · their own house');
+    expect(sheet).toContain('a mea · a ta · a lui · a ei · a noastră · a voastră · a lor');
+    expect(sheet).toContain('mine · yours · his · hers · ours · yours · theirs');
+  });
+
+  it('shows every noun owned by every noun', () => {
+    expect(sheet).toContain('## Noun possessors (generated)');
+    expect(sheet).toContain('το σπίτι του παιδιού');
+    expect(sheet).toContain('casa copilului');
+    expect(sheet).toContain("the child's house");
+    expect(sheet).toContain('ο σκύλος της θάλασσας');
+  });
+
   it('says how many records are unverified', () => {
     expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run`

Expected: FAIL (the code the tests ask for is not written yet).

- [ ] **Step 3: Write the code**

Change `src/validate/reviewSheet.ts` (unified diff):

```diff
@@ -10,8 +10,8 @@
 import { unitText } from '../glossLinks';
 import { RECIPIENTS } from '../engine/objects';
-import { nounPhrase } from '../engine/agree';
+import { nounPhrase, ownAlone, ownPhrase } from '../engine/agree';
 import { POSSESSORS } from '../engine/possessive';
-import { RO_POSSESSIVES } from '../data/possessives';
-import type { Clitic, GreekInterrogative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
+import { RO_ALONE, RO_OWN, RO_POSSESSIVES } from '../data/possessives';
+import type { Clitic, GreekAdjective, GreekInterrogative, GreekLexeme, GreekNoun, GreekPreposition, GreekVerb, SlotOf } from '../types';
 import { type RecordSets, unverifiedRecords } from './unverified';
 import { EN_CLITICS, GREEK_STRONG, RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
@@ -189,4 +189,45 @@
 }
 
+/** δικός: the Romanian *propriu* and *al meu* words, and every noun with every possessor before the noun and on its own (spec 9, 24). */
+function ownLines(adj: GreekAdjective, lexemes: Record<string, GreekLexeme>): string[] {
+  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
+  const table = (words: typeof RO_OWN) => `masc. sg ${words.m.sg} · masc. pl ${words.m.pl} · fem. sg ${words.f.sg} · fem. pl ${words.f.pl}`;
+  const phrases = nouns.flatMap((noun) =>
+    (['sg', 'pl'] as const).flatMap((number) => {
+      const before = POSSESSORS.map((p) => ownPhrase(adj, noun, number, 'nom', p.slot));
+      const alone = POSSESSORS.map((p) => ownAlone(adj, noun, number, 'nom', p.slot));
+      return [
+        `- ${noun.lemma} (${number === 'sg' ? 'singular' : 'plural'}):`,
+        `  - ${LANG_NAME.el}, before the noun: ${before.map((n) => richText(n.el)).join(' · ')}`,
+        `  - ${LANG_NAME.ro}, before the noun: ${before.map((n) => n.ro).join(' · ')}`,
+        `  - ${LANG_NAME.en}, before the noun: ${before.map((n) => n.en).join(' · ')}`,
+        `  - ${LANG_NAME.el}, on its own: ${alone.map((n) => richText(n.el)).join(' · ')}`,
+        `  - ${LANG_NAME.ro}, on its own: ${alone.map((n) => n.ro).join(' · ')}`,
+        `  - ${LANG_NAME.en}, on its own: ${alone.map((n) => n.en).join(' · ')}`,
+      ];
+    }),
+  );
+  return [
+    `- Romanian propriu with its article (nominative and accusative): ${table(RO_OWN)}`,
+    `- Romanian word before the possessive on its own: ${table(RO_ALONE)}`,
+    '- Noun phrases with each possessor (generated):',
+    ...phrases,
+  ];
+}
+
+/** Every noun owned by every noun, in the three languages (spec 9, 24). */
+function ownerLines(lexemes: Record<string, GreekLexeme>): string[] {
+  const nouns = Object.values(lexemes).filter((l): l is GreekNoun => l.pos === 'noun');
+  return nouns.flatMap((noun) => {
+    const all = nouns.map((owner) => nounPhrase(noun, 'sg', 'nom', { article: 'definite', owner }));
+    return [
+      `- ${noun.lemma}:`,
+      `  - ${LANG_NAME.el}: ${all.map((n) => richText(n.el)).join(' · ')}`,
+      `  - ${LANG_NAME.ro}: ${all.map((n) => n.ro).join(' · ')}`,
+      `  - ${LANG_NAME.en}: ${all.map((n) => n.en).join(' · ')}`,
+    ];
+  });
+}
+
 function lexemeSection(l: GreekLexeme, lexemes: Record<string, GreekLexeme>): string[] {
   const missing = (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]);
@@ -201,4 +242,5 @@
       ...(l.pos === 'preposition' && l.fused ? prepositionLines(l) : []),
       ...(l.pos === 'possessive' ? possessiveLines(lexemes) : []),
+      ...(l.pos === 'adjective' && l.emphatic ? ownLines(l, lexemes) : []),
     ]),
     '',
@@ -229,4 +271,10 @@
     '',
     ...Object.values(sets.lexemes).flatMap((l) => lexemeSection(l, sets.lexemes)),
+    '## Noun possessors (generated)',
+    '',
+    'Each noun in the singular nominative, owned by each noun in the genitive (the owners in the order of the nouns listed here).',
+    '',
+    ...ownerLines(sets.lexemes),
+    '',
     '## Phrases',
     '',
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit && npx vitest run && npm run validate`

Expected: no type errors; 1299 tests pass; the validator ends with "Data is valid."

- [ ] **Step 5: Commit**

```bash
git add src/validate/reviewSheet.test.ts src/validate/reviewSheet.ts
git commit -m "feat: review-sheet sections for δικός and the noun possessor

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Update the spec and check the whole branch

**Files:**
- Modify: `docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces: a spec that matches what was built (δικός, the noun possessor, the validator and gloss checks) and records it in section 24.

- [ ] **Step 1: Apply the spec edits**

Save this script as `spec_edit.py` in the repository root (do not commit it), run it with `python3 spec_edit.py` and delete it. It asserts that each old text is present, so it fails loudly if the spec has drifted.

```python
path = 'docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md'
s = open(path).read()


def sub(old, new):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, 1)


sub('Whose? (nobody, or a possessor) | "the", then "a / an" for one, or "with a number" for 2 to 5; "with a possessive" when Whose? is set |',
    'Whose? (nobody, or a possessor), Owned by a noun? (nobody, or a noun) | "the", then "a / an" for one, or "with a number" for 2 to 5; "with a possessive" when Whose? is set; "with a noun possessor" when a noun owns it |')
sub('| Adjective δικός (Plan 11) | Noun it describes, number, role, possessor |',
    '| Adjective δικός | Noun it describes, number, role (subject or object), Whose? |')
sub('δικός + μου before the noun (Plan 11);', 'δικός + μου before the noun;')
sub('δικό μου on its own (Plan 11);', 'δικό μου on its own;')
sub('a noun possessor in the genitive (Plan 11);', 'a noun possessor in the genitive;')
sub('a genitive possessor, masculine (Plan 11);', 'a genitive possessor, masculine;')
s = s.rstrip() + """
| δικός | An adjective lexeme flagged `emphatic` with its own panel: before the noun (το δικό μου σπίτι, *propria mea casă*, "my own house") and on its own (το δικό μου, *a mea*, "mine"); the role control offers the subject and the object only, because Romanian has no short genitive (*propriului meu*, *al celui*) | 5.3 |
| δικός token | δικός is a token of its own and the possessive that follows it points at the same noun; the possessive may stand after the noun or directly after δικός, and the noun takes the second accent only when the possessive is next to it | 4.4, 7 |
| Noun possessor | The owning noun is the genitive singular with its own definite article, after the possessed noun (το σπίτι του παιδιού); its token points back at the possessed noun with `agreesWith`; the noun panel has an Owned by a noun? control, which excludes a pronoun possessor; English says "the child's house" | 4.2, 5.3 |
| Gloss check | A Romanian gloss unit split at the genitive (*copil* + *ului*) is checked against the stored genitive, not against the nominative split | 7 |
| Plan 11 built | δικός, the noun possessor, phrases 69 to 72 (72 in all), the notes emphatic-possessive and noun-possessor, and the review sheet; the Romanian genitive of δικός and a plural or counted noun possessor are not covered | 24 |
"""
open(path, 'w').write(s)
```

- [ ] **Step 2: Check the edits**

Run: `grep -c "Plan 11 built" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "Owned by a noun?" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md && grep -c "δικός + μου before the noun;" docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md`
Expected: three numbers, each at least `1`, one per line.

- [ ] **Step 3: Check the whole branch**

Run: `npx tsc --noEmit && npx vitest run && npm run validate && npm run build && npm run review-sheet`
Expected: no type errors; every test passes; "Data is valid."; the build succeeds; the review sheet is written to `review/content-review.md` (git-ignored, do not commit). `npm run validate -- --release` must still fail, and only on unverified records.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-greek-grammar-explorer-design.md
git commit -m "docs: record the decisions of Plan 11 in the spec

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| 4.2, 4.3: the adjective δικός, the Romanian *propriu* and *al meu*, "my own" and "mine" | 1 |
| 5.3: the δικός panel (noun, number, role, Whose?; "before the noun" and "on its own"; gender × role in Improver) | 1 |
| 4.4, 7: δικός and its possessive as tokens that point at the same noun; the accent only next to the noun | 2 |
| 6.1: phrases 69 and 70; 5.2: the note emphatic-possessive | 2 |
| 4.2, 5.3: a noun possessor in the genitive, the Owned by a noun? control and its row | 3 |
| 6.1: phrases 71 and 72; 5.2: the note noun-possessor | 3 |
| 9: the review additions (the δικός tables and phrases, every noun owned by every noun) | 4 |
| 24: the decisions | 5 |
| Not covered: the Romanian genitive of δικός; a plural or counted noun possessor; the formal *său* | |
