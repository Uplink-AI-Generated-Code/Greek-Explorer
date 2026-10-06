# Greek Grammar Explorer: design spec

Date: 2026-10-03
Status: revised after review 4 and Plans 3, 5 and 6; extended with question words, ας and pronouns in every form, σε with the article contractions and possessives (changes listed in sections 13 to 24)

## 1. Purpose

A prototype for learning Greek by understanding how it works, from day one. The learner reads a real phrase, clicks any word, and sees its grammatical attributes (part of speech, tense, person, number, case, gender, voice). They can vary those attributes and watch the form change. Every word is compared with Romanian and English, including where the three languages diverge (articles, dropped pronouns, gender, word order, case).

The target learner does not want to memorise opaque phrases. Absolute beginners and improvers use the same tool. A Beginner/Improver toggle changes the depth shown, not the content.

Interactive mockups made during brainstorming (v1 to v5, plus the quantifier panel mockup) are the visual reference for layout and behaviour. This spec is the authority where they differ.

## 2. Scope

### In scope (prototype)

- Vite + React + TypeScript single-page app, no backend.
- Hand-curated content: 72 phrases (section 6.1) and the lexemes they use (section 6.6).
- Parts of speech: verb, noun, definite article, indefinite article / numeral, adjective (regular and indeclinable), preposition (σε also as the six forms fused with the article: στον, στην, στο, στους, στις, στα), quantifier (indefinite and quantity words such as some, any, none, many, few, little), the particles δεν, μην, να, θα and ας, the conjunction αν / *dacă* / if, the weak (clitic) personal pronoun, the possessive (the same pronoun after a noun: το σπίτι μου; and the adjective δικός: το δικό μου σπίτι), the copula είμαι, and the question words (τι, πού, πότε, γιατί, πώς, which never change, and ποιος and πόσος, which decline), the demonstratives (αυτός, εκείνος, τέτοιος, τόσος, which decline like the quantifiers) the place words (εδώ, εκεί, which never change) and the relative pronouns (που, ο οποίος) and the free relatives (ό,τι and όπου, which never change, and όποιος, which declines). The passive participle is an adjective derived from a verb (6.5). Strong pronouns appear only as the dropped or required subject pronoun beside verbs, and as the stand-alone ("on its own") use of a quantifier.
- Verb tenses and moods: indicative present, imperfect, aorist (simple past), future (continuous and simple), present perfect, past perfect and future perfect; subjunctive present, aorist and perfect (να + verb); imperative present and aorist (second person only), with its negative and with object clitics; the hortative present and aorist (ας + the subjunctive form, every person, with its negative); conditional (θα + imperfect or θα + pluperfect). Object clitics also go with every indicative, subjunctive, conditional and hortative form (4.3). Voices: active and mediopassive (reflexive and deponent examples). Detail in sections 6.4 and 6.5.
- Languages: Greek (focus), Romanian and English (comparison). The interface language is English.

### Out of scope

- Accounts, progress tracking, spaced repetition, quizzes.
- Audio or pronunciation.
- Runtime AI or any network call.
- Importing a dataset such as Wiktionary.
- Polytonic Greek and dialects.
- The gerund (τρώγοντας) and clitic doubling (το είδα τον Γιάννη).
- Clitics with non-finite forms (the participle) and in questions about the pronoun itself. Weak pronouns are covered with commands (after the verb, or before it in the negative) and with every indicative, subjunctive, conditional and hortative form (before the verb group's verb or auxiliary, 4.3).
- θα + aorist as a guess about the past (θα έφαγε, "he must have eaten"; Romanian presumptive *o fi mâncat*). It is not a conditional and is left for later.
- All of these are later work; the engine (4.3) is designed so they can be added as data.
- Free-text analysis of arbitrary phrases.

## 3. Users and levels

Beginner and Improver share one data set. The toggle changes presentation only:

| | Beginner | Improver |
|---|---|---|
| Attribute names | Plain: "now", "past", "have done", "had done", "will have done", "to (do)", "was doing", "may have done", "do it!", "would do", "would have done", "done" (the participle), "object", "possessor" | Technical: present, imperfect, aorist, present perfect, past perfect, future perfect, subjunctive, perfect subjunctive, imperative, accusative, genitive |
| Current-form table | Shown | Shown |
| Full paradigm table | Hidden | Shown, with the form in use highlighted |
| Divergence notes | Core notes | All notes |
| Irregularity messages | Shown | Shown, with the rule name |

The choice persists in `localStorage` (wrapped in try/catch; the app works without it).

A phrase's `level` is a badge and a sort key for the phrase picker. The toggle never hides phrases: a Beginner can open any phrase and gets the Beginner presentation of it.

## 4. Architecture

The Greek forms come from a hybrid model: stored stems plus shared ending tables, with explicit overrides for irregular cells. The UI can then show every Greek form split into stem and ending and highlight the part that changed, which is the main teaching device.

### 4.1 Layout of the code

```
src/
  data/
    paradigms/        # ending tables per class (greek.ts, verbs.ts, nouns.ts, ...)
    lexemes/          # verbs.ts, nouns.ts, adjectives.ts, function-words.ts
    phrases/          # one file per phrase
    readings.ts       # authored "how to read this" texts for irregular forms
    divergences.ts    # comparison notes
    form-groups.ts    # groups of equivalent forms (with noun / with clitic / short form)
  engine/
    slots.ts          # slot dimensions per part of speech
    inflect.ts        # (lexeme, slot) -> Form: one Greek word
    compose.ts        # (verb lexeme, slot) -> Composed: particles, auxiliary, verb, clitics, accents
    readings.ts       # readingFor(form | composed) -> Reading
    agree.ts          # builds noun phrases: article + numeral + adjective + noun
    romanian.ts       # Romanian forms and article-suffix splitting
    english.ts        # English forms
    clitics.ts        # the pronoun forms in the three languages (Greek, Romanian, English)
    stress.ts         # syllables and the second accent
    (compose.ts also places the pronouns and applies the short forms)
  components/
    PhraseBar, GlossGrid, WordPanel, AttributeControls,
    FormTable, ComparisonTable, FormGroupStrip, LevelToggle
  validate/           # build-time data checks
  main.tsx
```

Each unit has one job and talks through typed interfaces. `data/` holds no logic. `engine/` holds no UI. `components/` never reads `data/` directly: it takes the engine's output.

### 4.2 Core types

```ts
type Lang = 'el' | 'ro' | 'en';
type Gender = 'm' | 'f' | 'n';
type Case = 'nom' | 'acc' | 'gen';
type Num = 'sg' | 'pl';
type Person = 1 | 2 | 3;
type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional' | 'hortative';
// Indicative (8): present, imperfect, aorist, future, futureSimple, perfect, pluperfect, futurePerfect.
// Subjunctive (3): present, aorist, perfect (να έχω φάει).
// Imperative (2): present, aorist; second person only (singular and plural).
// Conditional (2): θα + imperfect (tense 'imperfect') and θα + pluperfect (tense 'pluperfect').
//   θα + aorist is not a conditional (it is a guess about the past) and is out of scope (section 2).
// 'future' is continuous (θα + present); 'futureSimple' is θα + the aorist-subjunctive form.
// Hortative (2): present and aorist; ας + the subjunctive form, every person (ας φάμε, ας φάει).
// That makes 17 mood and tense combinations in all.
type Tense = 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple'
           | 'perfect' | 'pluperfect' | 'futurePerfect';
type Voice = 'active' | 'mediopassive';

// One Greek word, split for display. `ending` is highlighted in the UI.
// `augment` is the past-tense prefix (έ- in έτρωγα, η- in ήθελα).
interface Form { augment?: string; stem: string; ending: string; irregular?: IrregularNote }
interface IrregularNote { rule: string; plain: string }   // e.g. "stress-shift"

// A written verb form made of several pieces, in written order: θα έχω φάει, μην το φας,
// δώσε μού το, φάτο. Built by compose() (4.3).
type Piece =
  | { kind: 'particle' | 'negation' | 'auxiliary' | 'clitic'; text: string;
      lexeme: LexemeId; slot: Slot }                         // clicking the piece opens this lexeme's panel with this slot
  | { kind: 'verb'; form: Form }
  | { kind: 'fused'; text: string; of: string[] };          // short forms: φάτο = φά(ε) + το; opens the verb panel
interface Composed {
  pieces: Piece[];
  text: string;                                             // written form with spaces and accents: "δώσε μού το"
  extraAccent?: { pieceIndex: number };                     // the second accent added by the stress rule
  irregular?: IrregularNote;
}

// "How to read this" (5.5). readingFor(form | composed) returns it;
// authored texts for irregular forms live in data/readings.ts, and each carries verified: boolean.
interface Reading { parts: ReadingPart[]; beginner: string; improver: string }
interface ReadingPart {
  text: string;
  role: 'particle' | 'auxiliary' | 'negation' | 'clitic' | 'fused' | 'augment' | 'stem' | 'ending' | 'article';
  gloss: string;
}

// A stored Romanian or English cell. `pending` marks a form that is not yet confirmed (7);
// a release build refuses it.
type Stored = string | { pending: true; note?: string };

// Checked data that is not a lexeme and not a record with its own flag: ending tables,
// auxiliary tables, the Romanian clitic-cluster table and the shared glossary of endings
// that generated readings draw their part glosses from (section 9).
interface ReviewItem { id: string; kind: 'ending-table' | 'auxiliary-table' | 'clitic-table' | 'glossary'; verified: boolean }

// Slot: the attribute combination a form fills. Dimensions depend on part of speech.
interface Clitic {
  person: Person; number: Num;
  gender?: Gender;      // the Greek gender of a third-person pronoun
  roGender?: Gender;    // the Romanian gender of the noun it stands for (ψωμί n: το; pâine f: o)
  role: 'object' | 'indirect';
}

type Slot =
  | { pos: 'verb'; person: Person; number: Num; mood: Mood; tense: Tense; voice: Voice;
      polarity: 'affirmative' | 'negative';
      clitics?: Clitic[];           // object pronouns, indirect before direct; any mood
      shortForm?: boolean }         // use the lexical short form (φάτο) when the verb has one; optional: absent means none
  | { pos: 'noun'; number: Num; case: Case }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: 1 | 2 | 3 | 4 | 5; gender: Gender; case: Case }
  | { pos: 'quantifier'; gender: Gender; number: Num; case: Case; degree: 'plain' | 'comparative';
      sense?: 'some' | 'few';                 // μερικοί: Romanian niște or câțiva
      use: 'determiner' | 'pronoun' }         // Romanian changes form between the two; Greek does not
  | { pos: 'clitic' } & Clitic                // the weak pronoun as a word of its own
  | { pos: 'possessive'; person: Person; number: Num; gender?: Gender }   // the possessor; the weak genitive pronoun after a noun (4.3)
  | { pos: 'preposition'; sense?: 'to' | 'at' | 'in' | 'on' | 'person' }   // only σε has senses (below)
  | { pos: 'particle' } | { pos: 'conjunction' } | { pos: 'interrogative' };   // no dimensions
// 'interrogative' is the slot of the question words that never change (τι, πού, πότε, γιατί, πώς). ποιος and πόσος are
// 'quantifier' lexemes flagged as question words (6.3); their panel offers the subject and object roles only.
// 'particle' is the slot of the particle panel (δεν, μην, να, θα, ας), opened from a piece of a verb
// group (4.4). Phrase tokens do not use it directly.
// The passive participle is an 'adjective' lexeme with `derivedFrom: { verb: VerbId; stem: string }`; the verb stores a `participle` stem.
```

Sense and use are slot dimensions, not lexeme fields: one lexeme (κάποιος, μερικοί) appears both as a determiner and on its own, and the panel offers the sense as a control. `use` stays on the slot (a token says which reading the phrase has), and the panel always shows both rows ("with a noun", "on its own"), as 5.3 says. Prepositions, particles and conjunctions have a slot with no dimensions, so every token has a slot.

σε is the only preposition with senses: **to** (direction: πάω στο σπίτι), **at** (place: είμαι στο σπίτι), **in** (inside or into: πηδάει στο νερό), **on** (a surface: στον δρόμο) and **person** (the indirect object: δίνω στο παιδί). The slot carries the sense a phrase uses, and the panel offers it as the Meaning control. Each sense has its Romanian and English word (*la*, *la*, *în*, *pe*, and the dative case for a person; to, at, in, on, to). The panel works out the article that fuses with σε from the noun.

Each lexeme declares `offers`: the slots its panel may offer. For a quantifier, `offers` is the `numbers` the panel may offer; the degrees and senses offered are the ones the lexeme's data has. A paradigm class may restrict a lexeme to one number (μερικοί is plural only; κάποιος and κανένας are singular only in the prototype). The copula είμαι offers only the present indicative, the impersonal μπορεί only the third person singular, and so on. The validator rejects a token whose slot lies outside its lexeme's `offers`, and the panel builds its controls from `offers`.

### 4.3 Lexemes and paradigm classes

A **paradigm class** is a shared ending table with slot dimensions, for example "-ω verbs", "contracted -άω verbs", "mediopassive -ομαι verbs", "masculine -ος nouns", "feminine -α nouns", "adjective -ος/-η/-ο (stem-stressed)" and "adjective -ός/-ή/-ό (ending-stressed)".

**Compound forms** (the perfects, the future, the subjunctive) are built, not stored. The engine assembles them from three parts: an optional particle (θα, να, or ας for the hortative), an optional auxiliary (έχω, είχα, inflected by the same engine for the same person and number), and a base form of the main verb. Perfect tenses use one invariable base form (the aorist stem plus -ει, or -θεί for the mediopassive: φάει, πηδήξει, πλυθεί), so the auxiliary carries the person. The subjunctive and the simple future use the aorist-subjunctive forms of the verb; the continuous future and the present subjunctive use the present forms. Negation is a piece: δεν goes before θα and before the verb (δεν θα φάω, δεν θέλω), and μην goes after να (να μην φάω). The perfect subjunctive is να + the present forms of έχω + the base form (να έχω φάει). The negative imperative is not built from the imperative: it is μην + the subjunctive form of the second person (μην φας), so the builder delegates to the subjunctive. The imperfect is a simple form with an augment (ε- or η-) that is lost when the stress moves in the first and second person plural (ήθελα, but θέλαμε); like the aorist, it uses an imperfect stem and per-cell overrides for the plural. Impersonal verbs (μπορεί, πρέπει) are lexemes with a single third-person slot.

**Two entry points.** `inflect(lexeme, slot)` returns one `Form` for every single-word form (nouns, adjectives, articles, numerals and the simple verb forms). `compose(verb, slot)` returns a `Composed` for any verb slot: it calls `inflect` for the verb and the auxiliary, adds the particle and the negation, hands the clitics to the clitic engine, and returns the pieces in written order together with the written text. The verb panel, the form groups and the readings all use `compose`, so negation, clitics and short forms (the `polarity`, `clitics` and `shortForm` fields of the verb slot) have one place to go.

The **conditional** is θα + the imperfect or the pluperfect; the builder reuses those two builders. θα + aorist is not a conditional (it expresses a guess about the past) and is out of scope. The **passive participle** is a derived adjective: the verb lexeme stores a participle stem as a further principal part (πλένω: πλυ-; ψήνω: ψη-), and the derived lexeme joins it to the stem-stressed adjective class (-μένος, -μένη, -μένο). Participles are not conjugated: they decline like any adjective and link back to their verb.

The **hortative** is ας + the present or aorist subjunctive form (ας τρώμε, ας φάμε), in every person; the negation follows ας (ας μην φάμε). The builder reuses the subjunctive builders with the particle ας in place of να. A verb offers the hortative when it offers the subjunctive present and aorist.

The **clitic engine** (`clitics.ts`, with the stress rule in `stress.ts` and the placement in `compose`) handles weak pronouns with commands and with every other finite form. It takes the verb form, the clitic or clitics and the mood, and returns a placed form:

- **Placement.** Affirmative imperative: clitics follow the verb (φάε το). Negative imperative: the subjunctive is used, and the clitics precede the verb (μην το φας).
- **Other moods.** The pronouns stand before the verb group's auxiliary or lexical verb, after the particle and the negation: [δεν] [θα / να / ας] [μην] [pronouns] [έχω] [verb], as in το τρώω, δεν το τρώω, θα το φάω, να μην το φάω, το έχω φάει, ας το φάμε. No stress rule applies. Romanian fuses the pronoun with the auxiliary or the particle (*l-am mâncat*, *l-aș mânca*, *să-l mănânc*, *nu l-am mâncat*) and puts *o* and the dative-accusative pairs after the participle or the infinitive where Romanian does (*am mâncat-o*, *aș mânca-o*); every fusion is stored in the Romanian clitic table, for every pronoun, not derived: each of the fourteen pronouns and each of the twenty-four pairs (every dative with the four third-person accusatives) has six positions (free, attached to a command, after *nu*, after *să*, fused with a vowel-initial auxiliary, behind the participle or the infinitive), and one function builds the form for each tense from them. English puts the pronoun after the verb, or after the participle ("has eaten it").
- **Order.** With two clitics, the genitive (indirect) comes before the accusative (direct): δώσε μού το. English and Romanian orders are stored per example.
- **Stress.** Greek stress may not fall further back than the third-last syllable of the whole unit (verb plus clitics). When the original stress would fall on the fourth-last syllable or further back, a second accent is written **two syllables after the original stress**: δώσε μού το (δώ-σε-μού), τηλεφώνησέ μου (φώ-νη-σέ), διάβασέ μου το (διά-βα-σέ). The prototype exercises the rule through phrase 36; the other two cases are unit tests only, because no phrase uses a verb of that shape. A Greek speaker must confirm the rule (section 9).
- **Shortening.** Some verbs shorten before a clitic and have a second, equal form (φάε το ~ φάτο; δώσε μού το ~ δως μου το). The shortening table is data, not a rule. It is applied when the verb slot has `shortForm: true`. Forms that mean the same are stored as members of one **form group** (4.6).

**The possessive** is the genitive weak pronoun (μου, σου, του / της, μας, σας, τους) placed after the noun it belongs to: το σπίτι μου, ο ζεστός καφές σου. The noun keeps its article. The stress rule of commands applies to the noun and the pronoun together: when the noun's stress would fall on the fourth-last syllable of the unit, the noun takes a second accent two syllables after its own (η θάλασσα → η θάλασσά μου; ο δάσκαλος → ο δάσκαλός μου; the plural too: οι θάλασσές μας). Romanian puts the possessive after the definite noun and makes it agree with the *possessed* noun in gender and number, not with the possessor (*casa mea*, *câinele meu*, *copiii mei*, *mările mele*); the third person is the invariable *lui*, *ei* and *lor*. English changes with the possessor and goes before the noun with no article (my, your, his, her, its, our, their). A table by possessor and by the Romanian gender and number of the noun stores the Romanian forms. The emphatic *δικός μου* and a possessor noun in the genitive (*το σπίτι του παιδιού*) come in a second step (section 24).

**Irregular perfective stems.** Verbs with irregular perfective stems store them as further principal parts. τρώω has a present stem τρώ-, an indicative-aorist stem φαγ- (έφαγα), and a second perfective stem φα- used by the subjunctive, the imperative and the perfect base form (φάω, φάε, φάει). πάω works the same way (πήγ- in the aorist indicative, πα- in the subjunctive).

A **Greek lexeme** stores the lemma, the paradigm class, one stem (or several principal parts, such as present stem and aorist stem), and optional per-slot overrides for irregular cells, and its `offers` (4.2). `inflect(lexeme, slot)` returns a `Form`. Where a cell has an override, the override wins and the `Form` carries an `IrregularNote`. **Verification** has one meaning everywhere: a flag covers the content of the record it sits on. A lexeme carries `verified: { el: boolean; ro: boolean; en: boolean }`; each flag is set when a speaker has checked that language's forms of the lexeme. Verification is per language of a lexeme, not per cell. Other checked data carries its own flag: phrases (`verified: boolean`, covering the Greek tokens and every gloss row), divergence notes, authored readings and form groups have a `verified` field (a form group's flag covers its `meaning`, its member notes, its `closeNotSame.reason` and the claim that its members mean the same), and the ending tables, auxiliary tables, the Romanian clitic-cluster table and the shared glossary of endings are listed as `ReviewItem`s in `data/review.ts`. A `pending` cell leaves its language's flag false. The release check (7) requires every flag to be true and no `pending` cell to remain.

**What is stored and what is generated in Romanian and English.** The Greek forms are generated (above). For Romanian and English, each lexeme stores only its *lexical* forms, and compound forms are generated from shared tables. Stored cells are `Stored` values and may be marked `pending`.

- **Romanian verb, stored:** infinitive, participle, present (6), subjunctive (6), imperfect (6), pluperfect (6), imperative singular and plural; about 30 cells per verb. **Generated:** perfect (a avea + participle), future (*voi, vei, va, vom, veți, vor* + infinitive), conditional (*aș, ai, ar, am, ați, ar* + infinitive), past conditional (*aș fi* + participle), future perfect (*voi fi* + participle), perfect subjunctive (*să fi* + participle), the particles *să* and *nu*, and the clitics. Romanian clitics change shape next to their neighbours (*îmi + o → mi-o*, *îl → -l*, *nu + îl → nu-l*, *mă + am → m-am*), so clusters and fusions are stored in a small table keyed by the clitic sequence and its position, not derived by rules.
- **English verb, stored:** base, third singular, past, past participle, present participle (-ing). **Generated:** will, would, have / has / had, don't / doesn't, "to", and the progressive (am / is / are / was / were + -ing). The copula "be" stores its own forms (am, are, is, was, were, been, being). A pronoun direct object is reordered after the indirect object: "give me the bread", but "give it to me" (a small rule in the English generator).
- **Nouns, adjectives, numerals and quantifiers, Romanian and English:** stored, as in the mockups. Romanian nouns store stem and article suffix separately (`câine` + `le`) so that the validator can check the authored gloss segments and the panel can split the definite form for highlighting.
- **Gender:** Romanian lexemes carry their own gender, which may differ from the Greek gender (καφές is masculine, *cafea* is feminine).
- **Volume:** the verb panel's full table shows one mood and tense at a time (six persons, three languages). The tense overview shows one person across all moods and tenses. Neither needs a stored cell per tense, mood and person.

Each Greek lexeme links to its Romanian and English counterparts through a `gloss` record: `{ ro: LexemeRef, en: LexemeRef }`.

### 4.4 Phrases and tokens

```ts
interface Phrase {
  id: string; title: string;
  theme: string;                   // the picker groups by theme (list in 6.1)
  level: 'beginner' | 'improver';  // a badge and sort key; the level toggle never hides phrases
  tokens: Token[];                 // Greek, in order
  glosses: Gloss[];                // see 4.5
  verified: boolean;               // covers the Greek tokens and every gloss row (section 9)
}
interface Token { text: string; lexeme: LexemeId; slot: Slot; agreesWith?: TokenIndex }
```

**One token per verb group.** A verb token holds everything `compose` returns, so «Δεν θέλω», «να φάω», «έχω φάει», «θα έτρωγα» and «Δώσε μού το!» are each one chip. Inside the chip the pieces keep their colours (particle, negation, auxiliary, verb, clitic). Clicking a non-verb piece (a particle, the negation, the auxiliary or a clitic), in the chip or in the "how to read this" line, opens that piece's own panel (particle, verb panel of the auxiliary, or clitic panel) in place of the verb panel, with a "Back to the verb" link. Every such piece carries the lexeme and slot to open (4.2), so the panel has what it needs; phrase tokens never use the `particle` or `clitic` slots directly. A fused short form (φάτο) opens the verb panel. Prepositions and conjunctions (αν) are ordinary tokens, except that a fused preposition (στον) is one token with two parts. Phrase 9, for example, has three tokens (Δεν θέλω, κανέναν, καφέ) and phrase 14 has two (Θέλω, να φάω).

**The phrase is fixed; the panel works on a copy.** The phrase chips, the Greek text and the glosses are authored and never change when the learner varies an attribute. The word panel works on a working copy of the token's slot. A "Reset to phrase" control restores it, and a label says when the panel differs from the phrase. Selecting a form-group member (4.6) also changes only the working copy. Because the glosses never change, the Romanian and English glosses are authored, not generated; only the panel rows are generated.

Every token has a slot. A token's `text` is what the phrase shows. For a verb token it is the written text that `compose` produces for the authored slot, so the phrase and the panel start in agreement. The validator compares them ignoring capitals and trailing punctuation («Δώσε μού το!» matches `δώσε μού το`).

A token is one clickable Greek unit. A multi-word unit such as πάνω από is one token. `agreesWith` links an article, numeral or adjective to its noun so the panel can show the whole noun phrase in the selected state. A preposition's `agreesWith` may point at a noun or at a question word (από πού), and a quantifier used on its own (Ποιος είναι;) needs none.

**A fused preposition is one token with two parts.** σε and the article after it are written as one word (στον), so the phrase has one token `{ text: 'στον', lexeme: 'se', slot: { pos: 'preposition', sense }, agreesWith: <the noun> }`. The article is not a token of its own: its gender and number come from the noun, and its case is the accusative that σε governs. The chip shows two parts, like the pieces of a verb group: the first opens the σε panel, the second the article panel for that noun, the article part with a "Back" link, and a gloss unit may link to either part (`{ token, piece }`: piece 0 is σε, piece 1 is the article). The six fused forms (σε + τον = στον, and so on) are stored data, not built by a rule; a ReviewItem covers them. The feminine singular στην loses its final ν in front of most consonants (στη θάλασσα) and keeps it in front of a vowel and κ π τ ξ ψ γκ μπ ντ τσ τζ (στην αλεπού, στην κουζίνα): the σε panel and the validator apply this rule to the word that follows σε, while the article panel keeps the full την. σε before a vowel can lose its ε (σ' αυτόν) and από and με do not fuse with the article; both are notes only.

**A possessive is a token of its own.** It points at the noun it belongs to with `agreesWith`, like an article or an adjective: *το σπίτι μου* has three tokens, the article, the noun and the possessive. Its slot is `{ pos: 'possessive', person, number, gender? }` (the possessor; the gender is for the third person singular). The noun's token carries the second accent when the rule asks for it (*θάλασσά*), and the validator compares the noun's text with the accented form. The validator's rule that a pronoun is not a token of its own is for the weak pronouns of a verb group; a possessive is a different part of speech.

### 4.5 Glosses (natural and literal, together)

Each phrase has, per comparison language (English, Romanian), two stacked rows: **natural** and **literal**. Both are always shown; there is no toggle. The literal row is for understanding Greek structure and may read oddly.

Rules for the literal row:

- Show words Greek omits as dashed placeholders in brackets: "(I)", "(Eu)", "(she) jumps".
- Mark grammatical roles with bracketed tags: "the-[acc]", "quick-[f]", "brown-[indecl.]".
- Keep the Greek word order, even when that is not the natural order in the target language.

A gloss row is a list of **gloss units**. A unit has either a single link to a Greek token index or a list of **segments**, each linked to its own token. Segments handle suffix articles in Romanian:

```ts
// A link points at a whole token, or at one piece of a verb group (Δεν θέλω: piece 0 is δεν) or one part of a fused preposition (στον: piece 0 is σε, piece 1 the article).
type Link = TokenIndex | { token: TokenIndex; piece: number };
type GlossUnit =
  | { text: string; link: Link | null }                       // null = no Greek counterpart (dashed)
  | { segments: { text: string; link: Link }[] };             // câine|le -> [σκύλο, τον]
```

Clicking a Greek token highlights every linked unit or segment in all gloss rows, including units linked to one of its pieces. Clicking a piece inside a verb chip, or a part of a fused preposition, highlights only the units linked to that piece ("don't" for δεν, "want" for θέλω). Clicking any gloss unit or segment selects its linked Greek token (and, for a piece link, that piece). In the fox sentence, selecting τον highlights only `le` in *câinele*; selecting σκύλο highlights only `câine`. Gloss segments are authored. The Romanian stem and suffix data (4.3) are used only to check them: where an authored split disagrees with the one the data gives, the authored gloss wins and the validator prints a warning.

### 4.6 Form groups (forms that mean the same)

Some different-looking forms express the same command. A **form group** collects them so the UI presents them together:

```ts
interface FormGroup {
  id: string;
  meaning: string;                 // plain-language: "Eat the bread!"
  members: GroupMember[];
  // The verb with no object: shown under the strip as "close, not the same" (5.4).
  closeNotSame?: { verb: GroupMember['verb']; reason: string };   // Φάε!, "no object: what to eat is not said"
  verified: boolean;     // covers meaning, member notes, closeNotSame.reason and the claim that the members mean the same
}
interface GroupMember {
  verb: { lexeme: LexemeId; slot: Extract<Slot, { pos: 'verb' }> };   // slot includes polarity, clitics, shortForm
  object?: { noun: LexemeId; number: Num; case: Case };               // a spelled-out object (the with-noun member)
  note?: string;                                                      // e.g. "the clitic moves before the verb"
}
```

A member holds the lexeme and slot, never the strings. The Greek, Romanian and English text is generated from them (`compose`, the Romanian and English generators, and `nounPhrase` for the object), so the validator can check every member and the panel can map a click back to its controls.

The kind of a member is derived, not stored, and the rules are checked in this order (the first that applies wins):

- **with-noun:** `object` is set (Φάε το ψωμί!). This wins over the other two: Δώσε μου το ψωμί! has a clitic (μου) and an object, and is a with-noun member.
- **short-form:** `slot.shortForm` is true (Φάτο!, Δως μου το!).
- **with-clitic:** `slot.clitics` is non-empty and `shortForm` is not set (Φάε το!). It means the same only when the object is known from context.
A group is about "me" (Δώσε μου το ψωμί! means "Give me the bread!"), so it is hidden for any other recipient chosen in the To whom? control.

- A bare verb with an implied object (Φάε!) is **not** a member: the meaning is narrower. It appears in the panel as a separate, labelled row.

Groups are authored as data (`form-groups.ts`) and checked by the validator (7): every member must compose, every member must use the same verb lexeme and mood, and every group needs at least two members. Selecting a member copies its slot into the working copy of the verb token's slot (4.4; or, for the with-noun member, switches the object control to the noun), so "clicking a member updates the panel's controls" has a direct meaning. A group can span phrases (the noun version in one phrase, the clitic version in another).

## 5. Interface

One page, three zones, stacked on a narrow screen.

1. **Phrase bar.** Phrase picker (grouped by theme and level), the Greek tokens as clickable chips, and the gloss grid (English natural and literal, Romanian natural and literal).
2. **Word panel** for the selected token (5.1).
3. **Comparison table** (5.2).

### 5.1 Word panel

- **Header:** lemma, part-of-speech label, Romanian counterpart.
- **Attribute controls:** one dropdown per varying attribute. Changing one re-renders everything below. The controls per part of speech are in the table in 5.3.
- **Current-form table:** three columns (Ελληνικά, Română, English). Greek shows stem + ending, with the ending highlighted. Articles, numerals and the English subject pronoun are highlighted in a second colour. Dropped or optional words (the Greek and Romanian subject pronoun) are dashed.
- **Plain-language line:** a sentence describing the slot.
- **How to read this:** a line under each form that takes it apart, part by part (5.5).
- **Irregularity message:** a one-line reason when the selected cell is irregular.
- **Gender note:** where the Greek, Romanian and English genders differ.
- **Full paradigm table (Improver only):** three columns, with the form in use highlighted in each column. Highlighting is per column: the Greek cell follows the Greek gender, the Romanian cell follows the Romanian gender.

### 5.2 Comparison table

Rows are grammatical points, columns are Greek, Romanian, English. Each row has a type tag: `same`, `differs` or `absent`, plus a short explanation. Beginner shows core rows; Improver shows all. Rows come from `divergences.ts` and are attached to a part of speech or a specific lexeme:

```ts
interface Divergence {
  id: string;
  appliesTo: { pos: Slot['pos']; lexeme?: LexemeId };
  point: string;                          // "Subject", "Position", ...
  el: string; ro: string; en: string;
  tag: 'same' | 'differs' | 'absent';     // the type tag shown on the row
  level: 'core' | 'extra';                // core rows show in Beginner and Improver; extra rows only in Improver
  verified: boolean;
}
```

Divergence types the prototype must cover:

| Type | Example |
|---|---|
| article-position | Greek: τον καφέ (free, before). Romanian: cafeaua (attached). English: the coffee. |
| article-presence | Greek and Romanian have gendered indefinite forms; English has a/an only. |
| subject-dropped | Greek θέλω and Romanian vreau drop the pronoun; English "I want" does not. |
| gender-mismatch | καφές (m) / cafea (f) / coffee (none). νερό (n) / apă (f). |
| case | Greek marks nom/acc/gen on article, noun and adjective; Romanian mostly on the article suffix; English not at all. |
| word-order | Adjective before the noun in Greek and English, after it in Romanian. |
| agreement | Greek adjective copies gender, number and case; Romanian copies gender and number; English never changes. |
| tense-form | Greek aorist (one word) vs Romanian compound past vs English -ed. |
| politeness | Greek Θέλω is a plain "I want"; a polite request uses the imperfect (Ήθελα) or the conditional (Θα ήθελα). Romanian *aș vrea* and English "I'd like" are both conditional. |
| reflexive | See 6.2. |
| indeclinable | Greek καφέ and Romanian maro never change; English adjectives never change. |
| numeral-agreement | Greek 1, 3, 4 change with gender; Romanian 1 and 2; English never. |
| plural-indefinite | Greek has no plural indefinite article (μερικοί is a quantifier); Romanian has *niște*; English has "some" or nothing. |
| some-vs-any | Greek κάποιος and Romanian *vreun / vreo* cover "some" and "any"; English splits them (some in statements, any in questions). |
| determiner-vs-pronoun | Greek κάποιος / κανένας keep one form; Romanian changes (*vreun* → *vreunul*, *niciun* → *niciunul*); English changes (any → anyone, no → none). |
| negative-concord | Greek *δεν … κανένας* and Romanian *nu … niciun* need a negative verb; English allows only one negative (*don't … any*). |
| count-vs-mass | Greek: one word, agreeing in number. Romanian: *mult / puțin* (mass) vs *mulți, multe / puțini, puține* (count). English: much / many, little / few, less / fewer. |
| comparative | Romanian *mai* + word; Greek one word (περισσότερος, λιγότερος); English more / less / fewer. |
| quantity-vs-sense | One Greek word can cover two Romanian ones (μερικοί → *niște* and *câțiva*); the panel shows the Romanian counterpart as a control. |
| perfect-vs-aorist | Greek separates the aorist (έφαγα) from the perfect (έχω φάει). Romanian *perfectul compus* (*am mâncat*) covers both. English separates them like Greek (ate / have eaten). |
| invariable-participle | Greek perfect: έχω + one invariable form (φάει), so the auxiliary carries the person. Romanian: a avea + invariable participle. English: have + past participle. |
| pluperfect-form | Greek είχα φάει (two words), Romanian *mâncasem* (one word, synthetic), English "had eaten". |
| subjunctive-for-infinitive | Greek has no infinitive: θέλω να φάω. Romanian uses *să* + subjunctive (*vreau să mănânc*). English uses "to eat". |
| aspect | Greek chooses between present-stem (να τρώω, habitual) and aorist-stem (να φάω, once) subjunctives. Romanian and English have one form for both. |
| subjunctive-negation | Negating the subjunctive clause: Greek να μην (Θέλω να μην πάω), Romanian *să nu*, English "not to". Negating the main verb is a different structure (Δεν θέλω να πάω, phrase 16). |
| imperfect-vs-aorist | Greek separates the aorist (έφαγα) from the imperfect (έτρωγα). Romanian *imperfectul* (*mâncam*) matches the Greek imperfect, while its compound perfect (*am mâncat*) covers the aorist and the perfect. English uses the simple past for the aorist and for much of the imperfect; "was eating" and "used to eat" mark the imperfect. |
| polite-imperfect | The Greek imperfect softens a request: Ήθελα έναν καφέ ("I wanted a coffee", polite "I'd like one"). Romanian uses the conditional (*aș vrea*); English "I'd like" is also conditional. The literal rows show the imperfect (*voiam*, "wanted"). |
| imperative-aspect | Greek chooses between the aorist imperative (φάε, "eat up") and the present imperative (τρώγε, "keep eating"). Romanian and English have one form (*mănâncă*, "eat"). |
| imperative-forms | Greek and Romanian have 2nd-person singular and plural forms (φάε / φάτε, *mănâncă* / *mâncați*); English has one form. |
| negative-imperative | Greek μην + subjunctive (μην φας). Romanian *nu* + the infinitive for the singular (*nu mânca*) and *nu* + the plural imperative (*nu mâncați*). English "don't" + base form. |
| perfect-subjunctive | Greek να έχει φάει, Romanian *să fi mâncat*, English "may have eaten". The three structures are different. |
| impersonal-modal | Greek μπορεί να …, Romanian *poate să …*, English "may …". |
| conditional-construction | Greek has no conditional forms: θα + a past tense (θα έτρωγα). Romanian has its own forms (*aș mânca*, *aș fi mâncat*). English: would + verb. |
| if-clause | Greek αν + imperfect (Αν είχα ψωμί). Romanian *dacă* + conditional (*Dacă aș avea pâine*). English if + past (If I had bread). |
| participle-agreement | The Greek passive participle declines like an adjective (πλυμένο). The Romanian participle agrees in gender and number (*spălat, spălată*). The English participle never changes (washed). |
| perfect-vs-participle | The Greek perfect uses one invariable form (έχω πλυθεί). The participle (πλυμένος) agrees and describes a state (είναι πλυμένο). |
| clitic-position | Greek and Romanian move the pronoun after an affirmative imperative (φάε το, *mănâncă-l*) and before a negative one (μην το φας, *nu-l mânca*). English keeps it after the verb both times. |
| clitic-gender | The clitic follows the noun's gender, which can differ: ψωμί (n) → το, *pâine* (f) → *o*. |
| clitic-order | Two clitics: Greek genitive then accusative (δώσε μού το), Romanian dative then accusative (*dă-mi-l*), English "give it to me". |
| clitic-stress | Greek adds a second accent when clitics push the stress to the fourth-last syllable (δώσε μού το). Romanian hyphenates and English does nothing. |
| question-order | Greek and Romanian keep the statement word order after the question word (Τι θέλεις; / *Ce vrei?*); English adds "do" and inverts ("What do you want?"). |
| question-mark | The Greek question mark is the semicolon (;); Romanian and English use ?. |
| question-words | Greek ποιος (who, which) and τι (what); Romanian *cine* (who), *care* (which), *ce* (what); English who, which, what. |
| why-because | Greek γιατί means both "why" and "because"; Romanian has *de ce* and *pentru că*; English why and because. |
| question-declension | ποιος and πόσος decline (ποιος, ποια, ποιο; πόσος, πόση, πόσο); Romanian *cât, câtă, câți, câte* changes too, English "how much / how many" does not. τι, πού, πότε, γιατί and πώς never change. |
| question-compounds | από πού, μέχρι πότε, τι ώρα: Greek and English build them from parts ("from where", "until when", "what hour"); Romanian has fused words (*de unde*, *până când*) and *ce oră*. |
| price-idiom | Greek Πόσο κάνει; (literally "how much does it do") is Romanian *Cât costă?* and English "How much is it?". |
| hortative-construction | Greek ας + subjunctive (ας φάμε); Romanian *să* + subjunctive (*Să mâncăm!*); English "let's eat / let him eat". |
| hortative-vs-subjunctive | ας suggests or allows (ας φάμε, "let's eat") where να gives a wish or a purpose (θέλω να φάω). |
| hortative-negation | Greek ας μην φάμε, Romanian *Să nu mâncăm*, English "let's not eat": the negation follows the particle, as it follows να. |
| hortative-persons | English changes with the person (let me, let's, let him / her, let them); Greek and Romanian change only the verb ending. |
| pronoun-position-finite | Greek puts the pronoun before the verb group (το τρώω, δεν το τρώω, θα το φάω, το έχω φάει); Romanian too (*îl mănânc*) and fuses it with the auxiliary (*l-am mâncat*); English keeps it after the verb ("eat it", "has eaten it"). |
| pronoun-before-auxiliary | In Greek the pronoun stands before the auxiliary έχω (το έχω φάει); in Romanian it fuses with the auxiliary (*l-am mâncat*), except *o*, which follows the participle (*am mâncat-o*). |
| preposition-meaning | Greek σε covers "to", "at", "in" and "on"; Romanian splits it into *la*, *în* and *pe* (and the dative case for a person); English into to, at, in and on. |
| preposition-article-fusion | Greek writes σε and the article as one word (στο, στον, στην); Romanian and English keep them apart (*la câinele*, "to the dog"). |
| direction-and-place | Greek uses σε + the accusative for both direction and place (πάω στο σπίτι, είμαι στο σπίτι); English separates "to" from "at", and Romanian *acasă* covers both. |
| indirect-object-dative | Greek marks the indirect object with σε + the accusative (δίνω το ψωμί στο παιδί); Romanian uses the dative case and no preposition (*dau pâinea copilului*); English says "to the child" or "the child the bread". |
| possessor-agreement | Greek and English change with the possessor (μου, σου; my, your); Romanian changes with the thing possessed (*casa mea*, *câinele meu*, *copiii mei*), not with the possessor. |
| possessive-position | Greek puts the pronoun after the noun and keeps the article (το σπίτι μου); Romanian also puts it after the noun, which carries the suffix article (*casa mea*); English puts it before the noun and drops the article (my house). |
| possessive-accent | Greek adds a second accent to a noun whose stress is too far back (η θάλασσά μου); Romanian and English do nothing. |
| possessive-third-person | Greek has του (his) and της (her); Romanian uses the invariable *lui* and *ei* (*copilul lui*); English his, her, its. |
| emphatic-possessive | Greek δικός μου (the adjective δικός + the pronoun) says "my own" or "mine" and agrees with the thing possessed; Romanian uses *propriu* beside the noun and *al meu / a mea / ai mei / ale mele* on its own; English "my own" and "mine". |
| noun-possessor | A noun possessor goes in the genitive after the noun (το σπίτι του παιδιού); Romanian also uses the genitive-dative form (*casa copilului*); English says "the child's house" or "the house of the child". |
| demonstrative-article | Greek keeps the article after the demonstrative (αυτό το σπίτι); Romanian drops it before the noun (*această casă*) and keeps it after the noun (*casa aceasta*); English has no article (this house). |
| demonstrative-placement | Romanian puts the demonstrative before the noun (*acest copil*) or after the noun, which then carries its article (*copilul acesta*); Greek and English always put it before the noun. |
| demonstrative-neuter | Greek says *αυτό* (neuter) for "this" of any thing (Αυτό είναι το σπίτι μου); Romanian agrees with the thing (*Aceasta este casa mea*, *Acesta este câinele meu*). |
| demonstrative-he | Greek *αυτός* is also "he" (the strong pronoun); Romanian *acesta* can mean "he" in formal speech, and *el* is the ordinary pronoun; English "this" is never "he". |
| demonstrative-spoken | Romanian has spoken forms *ăsta / asta, ăla / aia* after the noun (*casa asta*); Greek has no register pair. |
| such-so | Greek τέτοιος and τόσος decline; Romanian *asemenea* does not change, and *atâta, atâția, atâtea* agree; English "such" and "so" do not change (so much, so many). |
| place-words | Greek εδώ and εκεί, Romanian *aici* and *acolo*, English "here" and "there" never change; Greek and Romanian can add a preposition (από εδώ, *de aici*; μέχρι εκεί, *până acolo*). |
| relative-invariable | Greek που never changes, while ο οποίος agrees with the noun it refers to (ο οποίος, τον οποίο, της οποίας); Romanian *care* does not change in the nominative and accusative and has *căruia, căreia, cărora* in the genitive-dative; English chooses who, which or that. |
| relative-resumptive | Greek που needs a pronoun inside the clause when its job is not subject or object (το παιδί που του το έδωσα); Romanian has a clitic too (*copilul căruia i l-am dat*); English has no pronoun ("the child I gave it to"). |
| relative-object | Romanian marks a direct object with *pe care* and puts a clitic on the verb (*pâinea pe care am mâncat-o*); Greek που takes the verb alone (το ψωμί που έφαγα); English says "that", or nothing. |
| relative-whose | Greek του οποίου (or που + a possessive: που το σπίτι του), Romanian *al cărui* (the first word agrees with the owned thing, the second with the owner), English "whose". |
| relative-preposition | Greek puts the preposition before ο οποίος (με το οποίο) or after the clause with a pronoun (που … με αυτό); Romanian puts it first (*cu care*); English puts it first ("with whom") or at the end ("the child I go with"). |
| relative-omitted | English can leave the relative pronoun out of an object clause (the bread I ate); Greek and Romanian cannot. |
| free-relative-ever | Greek has one word where Romanian and English have two: ό,τι is "what" and "whatever" (*ce*, *orice*), όπου is "where" and "wherever" (*unde*, *oriunde*). |
| free-relative-who | Greek όποιος declines and means "whoever" and "whichever" (όποιος θέλει, όποιο ψωμί θέλεις); Romanian has two words that do not change as subject or object, *oricine* and *orice*; English *whoever* and *whichever*. |

### 5.3 Panels per part of speech

| Part of speech | Controls | Current-form rows | Full table (Improver) |
|---|---|---|---|
| Verb | Who (person + number), Mood (indicative / subjunctive / imperative / conditional / hortative), When (tense; each mood offers only its own tenses; the imperative offers only "you" singular and plural; the hortative offers present and aorist), Voice (when the lexeme has a mediopassive), Negated (yes / no), Object (none / a noun / one pronoun / two pronouns; offered in every mood for a verb that takes an object, with a spelled-out noun for commands only), with an Object noun select when there is an object, and a To whom? control (to me, to you, to him, to her, to us, to you pl., to them) that appears once the form has an indirect pronoun. These are up to seven controls (who, mood, tense, negated, object, to whom, object noun; the voice control is absent for a verb with one voice, such as δίνω); the short form (φάτο) is chosen only through the `member` control of the "Same meaning" strip (5.4). Controls are built from the lexeme's `offers` | One row, with subject pronouns in each language; compound forms show particle and auxiliary in their own colours | Six persons for the selected mood, tense and voice; plus a **tense overview** for the selected person (every tense, the three subjunctives, the two imperatives, the two conditionals and the two hortatives in three columns; rows with no form for that person, such as the imperative for "I", are shown dimmed with the reason) |
| Noun | How many (1 to 5, or "many"), Role, Whose? (nobody, or a possessor), Owned by a noun? (nobody, or a noun) | "the", then "a / an" for one, or "with a number" for 2 to 5; "with a possessive" when Whose? is set; "with a noun possessor" when a noun owns it | Case × number, with definite and indefinite forms in each cell |
| Definite article | Noun it goes with, number, role | Article + noun | Gender × case for the selected number; Romanian suffix and English "the" in the other columns |
| Numeral / indefinite article | Number (1 to 5), noun it counts, role | The numeral; then the counted noun phrase | Gender × case |
| Adjective | Noun it describes, number, role | "the" and "a / an" noun phrases (singular); "none in plural" for the second | Gender × case for the selected number |
| Possessive (μου, σου, του …) | Noun it goes with, number and role of the noun; person and number of the possessor, and the gender of a third-person possessor | "with a noun": the noun phrase with the possessive (το σπίτι μου / *casa mea* / my house) | Person × number of the possessor, in each language |
| Adjective δικός | Noun it describes, number, role (subject or object), Whose? | "before the noun" (το δικό μου σπίτι) and "on its own" (το δικό μου: mine) | Gender × case for the selected number |
| Preposition | Noun, question word or place word after it, number; for σε also Meaning (to / at / in / on / to a person) | Preposition + noun in the accusative (σε fused with the article: στον σκύλο; or + the question word: από πού); for σε, the Romanian and English word of the chosen meaning | Other prepositions with the same noun; for σε, the six fused forms for the noun and number, with the one in use outlined; σε takes only nouns, never a question word, and has an example row for the chosen meaning |
| Quantifier | Noun it goes with, role; plus Romanian counterpart (μερικοί), kind of noun (mass or count) and degree (πολύς, λίγος) | "with a noun", then "on its own"; for κανένας also "with negation" | Gender × role for the selected number, in each language |
| Question word (τι, πού, πότε, γιατί, πώς) | none | "on its own" (the word in three languages) and "in a question" (an example question in three languages); γιατί also "as an answer" (because) | none |
| Question word that declines (ποιος, πόσος) | As a quantifier: noun it goes with, role (subject or object only), number (one or many, for ποιος only; mass or count, for πόσος only); the badge reads "question word" | "with a noun", "on its own" | Gender × role for the selected number |
| Demonstrative (αυτός, εκείνος, τέτοιος, τόσος) | As a quantifier: noun it goes with, role, number; plus Romanian form (formal or spoken); the badge reads "demonstrative" | "with a noun" (αυτό το σπίτι: the article is kept; Romanian *această casă / casa aceasta*, or *casa asta* when spoken), then "on its own" (αυτό / *aceasta* / this); τέτοιος has no "on its own" row | Gender × role for the selected number, in each language |
| Place word (εδώ, εκεί) | none | "on its own" (the word in three languages) and "in a sentence" (an example in three languages); the preposition panel offers it after από and μέχρι | none |
| Relative pronoun (που, ο οποίος) | Noun it refers to (the antecedent), how many, Role in the clause (subject, object, to whom, whose, after a preposition), Preposition (after a preposition only), Noun owned (whose only) | The pronoun group with the pattern its clause needs (που του …, που … με αυτόν, στον οποίο), in three languages; a second row with the other Greek word (ο οποίος on the που panel, που on the ο οποίος panel) | All five jobs for the chosen noun, in each language |
| Free relative (ό,τι, όπου) | none | The word in each reading (whatever / what, wherever / where) with its Romanian and English words, and an example of each | none |
| Free relative that declines (όποιος) | As a quantifier: noun it goes with, role (subject or object only), how many; the badge reads "free relative" | "with a noun" (όποιο ψωμί / *orice pâine* / whichever bread) and "on its own" (όποιος / *oricine* / whoever) | Gender × role for the selected number |
| Particle (δεν, μην, να, θα, ας) | none | One row: the particle with a verb in each language. Its own panel, opened by clicking the particle piece in a verb chip or in its reading (in place of the verb panel, with a "Back to the verb" link) | none |
| Clitic pronoun (opened by clicking a clitic piece in a verb chip, like the particle panel) | Person + number, gender (3rd person), role (object / indirect object) | The weak form in each language (με / *mă* / me), plus the strong Greek form (εμένα) as a note | Person × number for the selected role, in each language |
| Conjunction (αν) | none | One row: *if* clause in each language (Greek αν + imperfect, Romanian *dacă* + conditional, English if + past) | none |
| Passive participle (derived adjective) | Noun it describes, number, role (as for adjectives) | As for adjectives, plus a "Derived from" line (πλένω → πλυ- + -μένος) with a link to the verb | Gender × role, as for adjectives |
| Copula (είμαι) | Who (person + number); the lexeme offers only the present indicative | One row, with subject pronouns | Six persons |

Nouns have no plural indefinite article. In the plural the panel shows the quantifier "some" (μερικοί καφέδες / niște cafele / some coffees) and, for counts of 2 to 5, the counted form ("with a number": τρεις καφέδες / trei cafele / three coffees). The empty article slot is labelled, not hidden. Clicking the quantifier in a phrase opens the quantifier panel.

Quantifier panel details:

- Rows "with a noun" and "on its own" are always shown. "On its own" uses the pronoun form where Romanian differs.
- A badge marks the mass or count reading for πολύς and λίγος. The "kind of noun" control switches the number; the degree control switches to the comparative (περισσότερος, λιγότερος).
- Romanian cells marked `pending` (7) show "not yet added" instead of a guess. No Romanian cell is pending at present: the six genitives that were (the singular genitive of *mult* and *multă*, and every genitive of *puțin*, *puțină*, *puțini* and *puține*) are filled in (*multului, multei; puținului, puținei, puținilor*) and wait for review (section 9). These forms carry the article (*multului* is "of the much"; *multor* is a plain "of many"): a quantifier lists the numbers where this holds in `ro.genitiveWithArticle`, and the panel says so in its explanation. A speaker reviewing these cells found *puținor* unnatural and so it is not stored; the indefinite alternative they would say is the periphrasis *a puțini* (*votul a puțini deputați*), which is not stored either because it is *a* + the plain form, not a genitive. The same speaker says *votul multor deputați* and *votul a mulți deputați* are both natural and mean the same, so for the indefinite plural genitive Romanian has two routes, the inflected form (*multor*) and *a* + the plain plural (*a mulți*, *a puțini*), and for *puțini* the second is the one in use. The panel's explanation says so for the plural genitive of πολύς and λίγος (`ro.genitiveWithA`). The marker stays for future gaps. Pending cells are a development aid: a release build refuses them (7). Per-case `offers` on quantifiers is not built, so a quantifier's `offers` lists numbers only.
- κανένας shares its pattern with the numeral ένας; the panel says so and links to the numeral panel.

Numerals follow their own rules: 1 (ένας/μία/ένα), 3 (τρεις/τρία) and 4 (τέσσερις/τέσσερα) change with gender and case; 2 and 5 never change. Romanian changes 1 (un/o) and 2 (doi/două) by gender; English never changes.

### 5.4 Forms that mean the same

When the selected word is an imperative (or the verb of a command), the word panel shows a **"Same meaning" strip** under the current-form table, built from the form group (4.6). Each member is a row in the usual three columns, with a tag: `with noun`, `with clitic` or `short form`. The member in use is highlighted. Example for Φάε το ψωμί!:

| | Ελληνικά | Română | English |
|---|---|---|---|
| with noun | Φάε το ψωμί! | Mănâncă pâinea! | Eat the bread! |
| with clitic | Φάε το! | Mănâncă-o! | Eat it! |
| short form | Φάτο! | none | none |

Rules for the strip:

- Members that mean the same thing sit together. A form with a narrower meaning (the bare Φάε!) is shown below the strip under "Close, not the same", with one line saying what is missing.
- Where the clitic moves (the negative imperative), the strip highlights the pronoun and carries the member note ("the clitic moves before the verb").
- Where the Greek and Romanian clitics differ in gender, a note says so (το for the neuter ψωμί, *o* for the feminine *pâine*).
- Beginner mode shows `with noun` and `with clitic` only; Improver adds `short form` rows, stress notes and the order note for two clitics.
- Clicking a member updates the panel's controls to match it.

### 5.5 "How to read this" lines

Under the current-form table, each form has a line that takes it apart and says what each part contributes. The aim is that a learner can build the form themselves next time, not just recognise it.

**Where the text comes from**

- **Generated** from the form's structure (`reading.parts`): particle, auxiliary, negation, clitic, augment, stem, ending, article. The engine fills `gloss` for each part from the lexeme, the slot and a shared glossary of endings ("-εις = you (singular), present"). Regular forms need no authoring.
- **Authored** for irregular forms (stem changes, shortening, stress shifts, suppletion). The irregular note's `rule` selects a template, and an author supplies the lexeme-specific words.
- **Per column.** Greek always has a line. Romanian and English get one when the form has more than one word or a part worth explaining (*aș fi mâncat*: "aș = would, fi = be, mâncat = eaten, never changes").

**Levels.** Beginner gets plain language and no grammar terms. Improver gets the technical description and points out the Romanian or English parallel where there is one. Both are stored (`beginner`, `improver`); the level toggle picks one.

**Highlighting.** The parts in the line use the same colours as the form (blue for articles, auxiliaries and pronouns, amber for endings), and hovering or focusing a part highlights it in the form above. Clicking a particle or clitic part opens that piece's panel (5.3).

**Examples**

| Form | Beginner | Improver |
|---|---|---|
| Φάε! | "Eat! (eat up, once). φα- is 'eat', -ε is a command to one person." | "Aorist imperative, 2nd singular: perfective stem φα- + -ε. The present imperative is τρώγε (stem τρώγ-, which keeps the older -γ-)." |
| Φάτο! | "Eat it! A short way of saying φάε το: the command and 'it' are joined." | "Aorist imperative φάε + clitic το, with the final -ε dropped: φά(ε) + το. The shortened form is lexical." |
| Μην φας! | "Don't eat! To forbid something, Greek uses μην + the form for 'you eat', not the command form." | "Negative imperative: μην + aorist subjunctive, 2nd singular (φας). The subjunctive replaces the imperative." |
| Δως μου το! | "Give it to me! δως is a short form of δώσε. μου = to me, το = it. 'To me' comes before 'it'." | "Shortened aorist imperative δως + genitive clitic μου + accusative clitic το (genitive before accusative)." |
| Δώσε μού το! | "Give it to me! Two small words follow the command. Greek adds a second accent (μού) so the stress is not too far back." | "Aorist imperative δώσε + genitive clitic μου + accusative clitic το. Stress would fall on the fourth-last syllable, so a second accent is written two syllables after the original stress." |
| Θα έχω φάει | "I will have eaten: θα = will, έχω = I have, φάει = eaten (this part never changes)." | "θα + έχω (present 1sg of έχω) + invariable perfect base form φά-ει (stem φα- + -ει)." |
| Έτρωγα | "I used to eat: έ- = in the past, τρωγ- = eat, -α = I." | "Imperfect 1sg: augment έ- + imperfect stem τρωγ- + -α. In the 1st plural the augment goes: τρώγαμε." |
| Ήθελα | "I wanted / I would like: η- = in the past, θελ- = want, -α = I." | "Imperfect 1sg of θέλω: augment η- (from ε- + θ-, a syllabic augment) + stem θελ- + -α." |
| Πλυμένο | "πλυμένο: πλυ- = wash, -μένο = a describing word (washed) that matches το παιδί: neuter, one." | "Passive participle: participle stem πλυ- + -μένος declined in the neuter nominative singular." |
| *aș fi mâncat* (Romanian column) | "aș = would, fi = be, mâncat = eaten (does not change)." | "Past conditional: *aș fi* + invariable participle; compare Greek θα είχα φάει." |

Rules: the line never repeats the plain-language line from 5.1; where a rule has a Romanian or English parallel, the Improver text names it; a line is at most two sentences.

## 6. Content

### 6.1 Phrase set (initial)

| # | Greek | Natural English | Features exercised |
|---|---|---|---|
| 1 | Θέλω έναν ζεστό καφέ | I want a hot coffee | present verb, dropped subject, indefinite article/numeral, adjective agreement, noun case, Romanian adjective position |
| 2 | Θέλω τρεις καφέδες | I want three coffees | numeral with gender and case, plural noun |
| 3 | Η γρήγορη καφέ αλεπού πηδάει πάνω από τον τεμπέλικο σκύλο | The quick brown fox jumps over the lazy dog | definite article, two adjective classes, indeclinable adjective (καφέ), contracted verb class, multi-word preposition, accusative after a preposition, Romanian suffix articles |
| 4 | Πλένομαι | I wash (myself) | mediopassive as reflexive |
| 5 | Πλένω το παιδί | I wash the child | active voice, for contrast with phrase 4 |
| 6 | Κοιμάμαι | I sleep | deponent mediopassive (passive form, not reflexive) |
| 7 | Θέλω λίγο νερό | I want a little water | mass quantifier (λίγος), neuter in Greek vs feminine in Romanian (puțină apă) |
| 8 | Θέλω μερικούς καφέδες | I want some coffees | plural indefinite (μερικοί / *niște*), plural noun |
| 9 | Δεν θέλω κανέναν καφέ | I don't want any coffee | negation particle, negative concord, κανένας / *niciun* / *nicio*, masculine vs feminine noun |
| 10 | Θέλω περισσότερο νερό | I want more water | comparative (περισσότερος / *mai multă* / more) |
| 11 | Έχω φάει | I have eaten | present perfect, irregular perfective stem (τρώω → φα-, base form φάει) |
| 12 | Είχα φάει | I had eaten | past perfect; Romanian one-word *mâncasem* |
| 13 | Θα έχω φάει | I will have eaten | future perfect (particle + auxiliary + base form) |
| 14 | Θέλω να φάω | I want to eat | aorist subjunctive after θέλω; no infinitive in Greek |
| 15 | Θέλω να τρώω | I want to eat (regularly) | present subjunctive; aspect contrast with phrase 14 |
| 16 | Δεν θέλω να πάω | I don't want to go | negation of the main verb before a subjunctive; the perfective subjunctive stem of πάω (πα-). The aorist stem πήγ- appears only if the learner switches the tense |
| 17 | Η αλεπού έχει πηδήξει πάνω από τον σκύλο | The fox has jumped over the dog | perfect in the 3rd person, reusing the fox sentence's vocabulary |
| 18 | Έχω πλυθεί | I have washed (myself) | mediopassive perfect (πλυθεί), reflexive meaning |
| 19 | Έφαγα το ψωμί | I ate the bread | aorist of an irregular verb (τρώω → έφαγα); definite article with a neuter noun (ψωμί) that is feminine in Romanian (*pâinea*); contrast with phrase 11 (aorist vs perfect) |
| 20 | Θα τρώω λιγότερο ψωμί | I will eat less bread | continuous future (θα + present form), comparative quantifier (λιγότερος), mass noun; contrast with the simple future θα φάω |
| 21 | Έτρωγα πολύ ψωμί | I used to eat a lot of bread | imperfect of an irregular verb (τρώω → έτρωγα); quantifier πολύς; Romanian imperfectul (*Mâncam multă pâine*); contrast with phrase 19 |
| 22 | Ήθελα έναν καφέ | I wanted a coffee (polite: I'd like one) | imperfect used for politeness; natural Romanian *Aș vrea o cafea*, literal *(Eu) voiam o cafea*; contrast with phrases 1 and 29 |
| 23 | Η αλεπού πηδούσε πάνω από τον σκύλο | The fox was jumping over the dog | imperfect of a contracted verb (πηδάω → πηδούσε), 3rd person; reuses the fox vocabulary |
| 24 | Φάε το ψωμί! | Eat the bread! | aorist imperative (perfective), 2nd person singular |
| 25 | Μην φας το ψωμί! | Don't eat the bread! | negative imperative built from the subjunctive; Romanian *Nu mânca pâinea!* |
| 26 | Πλύνε το παιδί! | Wash the child! | aorist imperative of a regular verb (πλύνε, plural πλύνετε); reuses phrase 5's vocabulary |
| 27 | Τρώγε το ψωμί! | Keep eating the bread! | present imperative (imperfective); aspect contrast with phrase 24 |
| 28 | Μπορεί να έχει φάει | He / she may have eaten | perfect subjunctive after an impersonal modal (μπορεί); Romanian *Poate să fi mâncat* |
| 29 | Θα ήθελα έναν καφέ | I would like a coffee | conditional (θα + imperfect); compare phrases 1 and 22; Romanian *Aș vrea o cafea* |
| 30 | Αν είχα ψωμί, θα έτρωγα | If I had bread, I would eat | conjunction αν; imperfect in the if-clause, conditional in the result; Romanian *Dacă aș avea pâine, aș mânca* |
| 31 | Θα είχα φάει το ψωμί | I would have eaten the bread | past conditional (θα + pluperfect); Romanian *Aș fi mâncat pâinea* |
| 32 | Το παιδί είναι πλυμένο | The child is washed | passive participle, copula είμαι; Romanian *Copilul este spălat* |
| 33 | Το ψωμί είναι ψημένο | The bread is baked | participle agreement: neuter ψημένο, Romanian feminine *coaptă* (*Pâinea este coaptă*) |
| 34 | Φάε το! | Eat it! | clitic imperative; its short form Φάτο! is reached through the form group (the `shortForm` slot field); group with phrase 24 |
| 35 | Πλύνε το! | Wash him / her / it! | clitic imperative of a regular verb; group with phrase 26; Romanian *Spală-l!* |
| 36 | Δώσε μού το! | Give it to me! | two clitics (genitive before accusative) and the stress rule (extra accent on μού); its short form Δως μου το! is reached through the form group; group with "Give me the bread!"; Romanian *Dă-mi-o!* |
| 37 | Μην το φας! | Don't eat it! | negative imperative with the clitic before the verb; group with phrase 25; Romanian *Nu o mânca!* |
| 38 | Φάε! | Eat! | bare aorist imperative with no object, the "close, not the same" row of the "Eat the bread!" group; Romanian *Mănâncă!*; contrast with phrase 27 (Τρώγε!, "keep eating") |
| 39 | Θέλω να μην πάω | I want not to go (I'd rather not go) | negated subjunctive (να μην), against the main-verb negation of phrase 16; Romanian *Vreau să nu merg* |
| 40 | Τι θέλεις; | What do you want? | question word τι; the question keeps the statement order in Greek and Romanian (*Ce vrei?*); English adds "do" |
| 41 | Πού πας; | Where are you going? | πού; second person of πάω (πας); Romanian *Unde mergi?* |
| 42 | Πότε θα φας; | When will you eat? | πότε; the simple future; Romanian *Când vei mânca?* |
| 43 | Γιατί δεν τρως; | Why aren't you eating? | γιατί (also "because"); negation; Romanian *De ce nu mănânci?* |
| 44 | Πώς είσαι; | How are you? | πώς; the copula; Romanian *Cum ești?* |
| 45 | Ποιος είναι; | Who is it? | ποιος on its own (pronoun use, no noun); Romanian *Cine este?* |
| 46 | Πόσο ψωμί θέλεις; | How much bread do you want? | πόσος beside a mass noun; Romanian *Câtă pâine vrei?*; contrast with phrase 7 |
| 47 | Από πού είσαι; | Where are you from? | a preposition before a question word (από πού); Romanian *De unde ești?* |
| 48 | Μέχρι πότε θα πας; | Until when will you go? | μέχρι πότε; Romanian *Până când vei merge?* |
| 49 | Τι ώρα είναι; | What time is it? | τι before a noun (ώρα); literal "what hour is"; Romanian *Ce oră este?* |
| 50 | Πόσο κάνει; | How much is it? | πόσο on its own; the price idiom (κάνει, "does"); Romanian *Cât costă?*, literal *cât face* |
| 51 | Ας φάμε! | Let's eat! | hortative, first person plural; Romanian *Să mâncăm!* |
| 52 | Ας φάει. | Let him / her eat. | hortative, third person; Romanian *Să mănânce.* |
| 53 | Ας μην πάμε. | Let's not go. | negated hortative; Romanian *Să nu mergem.* |
| 54 | Πώς το λένε; | What is it called? | a pronoun with an indicative verb (το λένε), verb λέω; Romanian natural *Cum se numește?*, literal *cum îl zic* |
| 55 | Ας το φάμε! | Let's eat it! | a pronoun with the hortative; Romanian *Să o mâncăm!* (pâine is feminine) |
| 56 | Θα μου το δώσεις; | Will you give it to me? | two pronouns with the simple future; Romanian *Mi-o vei da?* |
| 57 | Πάω στο σπίτι | I'm going home | σε + το fused into στο (one chip, two parts), meaning "to"; Romanian *Merg acasă.*, literal *merg la casa* |
| 58 | Είμαι στο σπίτι | I'm at home | the same στο with the meaning "at"; Romanian *Sunt acasă.* |
| 59 | Πάμε στη θάλασσα; | Shall we go to the sea? | the feminine fusion στη; Romanian *Mergem la mare?* |
| 60 | Ο σκύλος είναι στον δρόμο | The dog is on the road | the masculine fusion στον, meaning "on"; Romanian *Câinele este pe drum.* |
| 61 | Δίνω το ψωμί στο παιδί | I give the bread to the child | σε marks the indirect object; Romanian uses the dative, *Dau pâinea copilului.* |
| 62 | Ο σκύλος πηδάει στο νερό | The dog jumps into the water | meaning "in" (into); Romanian *Câinele sare în apă.* |
| 63 | Το σπίτι μου | My house | the weak possessive after the noun, article kept; Romanian *casa mea* (agrees with *casă*, feminine) |
| 64 | Η θάλασσά μας | Our sea | the second accent (θάλασσα → θάλασσά); Romanian *marea noastră* |
| 65 | Ο σκύλος σου | Your dog | second person; Romanian *câinele tău* |
| 66 | Το παιδί του | His child | third person (του / της); Romanian *copilul lui* |
| 67 | Πού είναι το σπίτι σου; | Where is your house? | a possessive in a question; Romanian *Unde este casa ta?* |
| 68 | Ο ζεστός καφές μου | My hot coffee | an adjective between the article and the noun, the possessive last; Romanian *cafeaua mea caldă* |
| 69 | Το δικό μου σπίτι | My own house | δικός + μου before the noun; Romanian *propria mea casă* |
| 70 | Το σπίτι είναι δικό μου | The house is mine | δικό μου on its own; Romanian *Casa este a mea* |
| 71 | Το σπίτι του παιδιού | The child's house | a noun possessor in the genitive; Romanian *casa copilului* |
| 72 | Ο σκύλος του παιδιού | The child's dog | a genitive possessor, masculine; Romanian *câinele copilului* |
| 73 | Αυτό το σπίτι | This house | the near demonstrative with the article; Romanian *această casă* (before the noun, no article) |
| 74 | Εκείνος ο σκύλος | That dog | the far demonstrative; Romanian *acel câine* |
| 75 | Αυτά τα σπίτια | These houses | plural; Romanian *casele acestea* (after the noun, with its article) |
| 76 | Αυτό είναι το σπίτι μου | This is my house | *αυτό* on its own, neuter whatever the thing; Romanian agrees: *Aceasta este casa mea* |
| 77 | Εδώ είναι το σπίτι | Here is the house | the place word; Romanian *Aici este casa* |
| 78 | Μέχρι εκεί | Until there | μέχρι + a place word; Romanian *Până acolo* |
| 79 | Ένα τέτοιο σπίτι | Such a house | τέτοιος after the indefinite article; Romanian *O asemenea casă* |
| 80 | Έχω τόσο ψωμί | I have so much bread | τόσος with a mass noun; Romanian *Am atâta pâine* |
| 81 | Ο σκύλος που πηδάει | The dog that jumps | που as the subject; Romanian *Câinele care sare* |
| 82 | Το ψωμί που έφαγα | The bread that I ate | που as the object; Romanian *Pâinea pe care am mâncat-o* (*pe care* and a clitic) |
| 83 | Ο καφές που θέλω | The coffee I want | English leaves the pronoun out; Romanian *Cafeaua pe care o vreau* |
| 84 | Το παιδί που του το έδωσα | The child I gave it to | που and the pronouns inside the clause, both on the verb; Romanian *Copilul căruia i l-am dat* |
| 85 | Το παιδί του οποίου ο σκύλος πηδάει | The child whose dog jumps | whose; Romanian *Copilul al cărui câine sare* |
| 86 | Το σπίτι στο οποίο πάω | The house I am going to | σε fused with the article of ο οποίος; Romanian *Casa la care merg* |
| 87 | Το παιδί με το οποίο πάω | The child I am going with | a preposition before ο οποίος; Romanian *Copilul cu care merg* |
| 88 | Ο σκύλος που είναι εκεί | The dog that is there | που with the copula and a place word; Romanian *Câinele care este acolo* |
| 89 | Αυτό είναι το σπίτι που έχω | This is the house that I have | a demonstrative, then που; Romanian *Aceasta este casa pe care o am* |
| 90 | Ό,τι θέλεις | Whatever you want | the free relative ό,τι; Romanian *Orice vrei* |
| 91 | Όπου πας | Wherever you go | όπου; Romanian *Oriunde mergi* |
| 92 | Όποιος θέλει | Whoever wants | όποιος on its own; Romanian *Oricine vrea* |
| 93 | Ό,τι έχω | What I have | the plain reading of ό,τι; Romanian *Ce am* |
| 94 | Εκεί όπου είναι το σπίτι | There where the house is | the plain reading of όπου; Romanian *Acolo unde este casa* |

**Themes** (for the phrase picker): *Ordering* (1, 2, 7 to 10, 22, 29); *Daily life* (4 to 6, 18, 26, 32, 35, 36, 54, 56, 61); *Eating* (11 to 13, 19 to 21, 24, 25, 27, 30, 31, 33, 34, 37, 38); *Wishes and possibility* (14 to 16, 28, 39, 51 to 53, 55); *Questions* (40 to 50); *Places* (57 to 60, 62); *Possession* (63 to 72); *Pointing* (73 to 80); *Relative clauses* (81 to 94); *The fox sentence* (3, 17, 23).

Further phrases (greetings, introductions, directions, past and future in context) are added after the prototype validates the model. The set includes the aorist (phrase 19), the continuous future (phrase 20) and the future perfect (phrase 13). The simple future (θα φάω) is reachable through the verb panel's tense control on phrases 11, 14 and 19, and is written out with its Romanian and English counterparts in section 6.4.

Phrase 3 is the fixed requirement «The quick brown fox jumps over the lazy dog». The Greek translation is one reasonable rendering and must pass the content review in section 9.

### 6.2 Reflexive and mediopassive verbs

Greek reflexive meaning is usually carried by the mediopassive voice, with its own ending table (πλένομαι, πλένεσαι, πλένεται, …). Voice is a slot dimension on verbs. Lexemes that have both voices are linked so the panel can switch between πλένω and πλένομαι, with the active form shown alongside.

Divergence notes of type `reflexive`:

- Greek marks reflexivity on the verb ending.
- Romanian uses the clitic *mă / te / se …* (*mă spăl*).
- English often has no marker ("I wash") and uses *myself* for emphasis. Greek has a periphrastic emphatic form (τον εαυτό μου) that maps onto it.
- Deponent verbs (κοιμάμαι) have mediopassive form but no reflexive meaning. A note warns the learner not to over-generalise, and the Romanian counterpart *dorm* (no clitic) shows the contrast.

### 6.3 Quantifiers

The prototype covers these Romanian words and their Greek and English counterparts:

| Romanian | Greek | English | Notes |
|---|---|---|---|
| niște | μερικοί / μερικές / μερικά | some | Plural indefinite. Genitive *unor*. |
| câțiva, câteva | μερικοί / μερικές / μερικά | a few, several | Same Greek word as *niște*; selected by the sense control. |
| vreun, vreo | κάποιος / κάποια / κάποιο | any, some | Used in questions and conditionals. |
| vreunul, vreuna | κάποιος / κάποια / κάποιο | anyone, someone | Pronoun use. |
| niciun, nicio; niciunul, niciuna | κανένας / καμία / κανένα | no; none, no one | Needs negation. Declines like ένας. |
| mult, multă, mulți, multe; mai + each | πολύς / πολλή / πολύ, πολλοί / πολλές / πολλά; περισσότερος | much, many; more | Irregular stem (πολύ- / πολλ-). |
| puțin, puțină, puțini, puține; mai + each | λίγος / λίγη / λίγο; λιγότερος | little, a little, few; less, fewer | Regular. |

Scope limits for the prototype: κάποιος and κανένας are singular only; the Romanian genitive is given only where the form is known (*unor, câtorva, multor, multului / multei, puținului / puținei / puținilor, vreunui / vreunei, niciunui / niciunei*); stand-alone genitive pronouns are not covered.

**Demonstratives** (section 25) are four more quantifier lexemes flagged `demonstrative`:

| Greek | Romanian | English | Notes |
|---|---|---|---|
| αυτός / αυτή / αυτό | *acest, această, acești, aceste* before the noun; *acesta, aceasta, aceștia, acestea* after the noun or on its own; spoken *ăsta, asta, ăștia, astea* | this, these | Near. Genitive *acestui, acestei, acestor* (before the noun) and *acestuia, acesteia, acestora*; none for the spoken forms. |
| εκείνος / εκείνη / εκείνο | *acel, acea, acei, acele*; *acela, aceea, aceia, acelea*; spoken *ăla, aia, ăia, alea* | that, those | Far. Genitive *acelui, acelei, acelor*; *aceluia, aceleia, acelora*. |
| τέτοιος / τέτοια / τέτοιο | *un / o asemenea*, plural *asemenea* | such (a) | Beside a noun only. Genitive *unui / unei / unor asemenea*. |
| τόσος / τόση / τόσο | *atâta, atâta, atâția, atâtea*; on its own *atât* | so much, so many | Subject and object only, like πόσος. |


### 6.4 Perfect, subjunctive, imperfect and imperative

Constructions (shown for τρώω, "I eat"; the first-person singular unless noted):

| Tense / mood | Greek construction | Example | Romanian | English |
|---|---|---|---|---|
| Aorist (for contrast) | aorist indicative | έφαγα | *am mâncat* | I ate |
| Present perfect | έχω + invariable base form | έχω φάει | *am mâncat* | I have eaten |
| Past perfect | είχα + invariable base form | είχα φάει | *mâncasem* | I had eaten |
| Future perfect | θα έχω + invariable base form | θα έχω φάει | *voi fi mâncat* | I will have eaten |
| Present subjunctive | να + present form (imperfective) | να τρώω | *să mănânc* | to eat; that I eat (regularly) |
| Aorist subjunctive | να + aorist-subjunctive form (perfective) | να φάω | *să mănânc* | to eat; that I eat (once) |
| Simple future | θα + aorist-subjunctive form | θα φάω | *voi mânca* | I will eat |
| Negated subjunctive | να μην + verb | να μην φάω | *să nu mănânc* | not to eat |
| Imperfect | augment + imperfect stem + past endings | έτρωγα | *mâncam* | I used to eat; I was eating |
| Perfect subjunctive | να + έχω + invariable base form | να έχω φάει | *să fi mâncat* | to have eaten; may have eaten |
| Imperative, aorist (2sg / 2pl) | aorist imperative | φάε / φάτε | *mănâncă* / *mâncați* | eat! (and finish) |
| Imperative, present (2sg / 2pl) | present imperative | τρώγε / τρώγετε | *mănâncă* / *mâncați* | keep eating! |
| Negative imperative (2sg / 2pl) | μην + subjunctive | μην φας / μην φάτε | *nu mânca* / *nu mâncați* | don't eat! |
| Hortative, present | ας + present form | ας τρώμε | *să mâncăm* | let's eat (regularly) |
| Hortative, aorist | ας + aorist-subjunctive form | ας φάμε | *să mâncăm* | let's eat |

What this teaches, in plain terms:

- Greek splits "what happened" (έφαγα) from "what I have done" (έχω φάει). Romanian has one tense for both (*am mâncat*), so the panel shows the same Romanian cell next to two different Greek rows and says why.
- The Greek perfect never agrees: only the auxiliary έχω changes with the person. The same shape appears in Romanian (*a avea* + participle) and English (have + participle).
- Greek has two kinds of subjunctive stem. The present stem says "regularly" or "in general" (να τρώω); the aorist stem says "once" (να φάω). Romanian and English use one form for both, so the Romanian and English cells repeat. This is the main aspect lesson.
- Greek has no infinitive: «Θέλω να φάω» is literally "I want that I eat". Romanian has the same structure (*vreau să mănânc*); English uses "to eat".
- The simple future (θα φάω) and the subjunctive (να φάω) share a form; the continuous future (θα τρώω) shares the present form.
- The Greek imperfect is the closest match to the Romanian *imperfectul*. English needs "was eating" or "used to eat". The Greek imperfect also softens requests (Ήθελα έναν καφέ), the way Romanian and English use the conditional.
- Aspect shows up again in the imperative: φάε ("eat up", once) against τρώγε ("keep eating").
- The hortative ας + subjunctive suggests or allows: ας φάμε "let's eat", ας φάει "let him eat", ας μην πάμε "let's not go". Romanian uses *să* + the subjunctive; English changes with the person (let's, let him, let them), while Greek and Romanian change only the ending.
- The negative imperative is not the imperative with a negation word: Greek switches to the subjunctive (μην φας), Romanian switches to the infinitive in the singular (*nu mânca*), and English adds "don't".
- The perfect subjunctive (να έχει φάει) reaches back with doubt or hope ("may have eaten"). Romanian uses *să fi mâncat*; English uses a modal.

New verbs and irregularities:

- τρώω (eat): two perfective stems. φαγ- gives the aorist indicative (έφαγα, έφαγες, έφαγε, φάγαμε, φάγατε, έφαγαν); φα- gives the base form φάει, the aorist subjunctive (φάω, φας, φάει, φάμε, φάτε, φάνε) and the aorist imperative (φάε, φάτε).
- πάω (go): perfective stem πήγ- in the aorist (πήγα); aorist subjunctive πάω, πας, πάει, πάμε, πάτε, πάνε; base form πάει.
- πηδάω: base form πηδήξει (phrase 17).
- πλένομαι: base form πλυθεί (phrase 18).
- Imperfects: τρώω → έτρωγα, έτρωγες, έτρωγε, τρώγαμε, τρώγατε, έτρωγαν; θέλω → ήθελα, ήθελες, ήθελε, θέλαμε, θέλατε, ήθελαν; πηδάω → πηδούσα, πηδούσες, πηδούσε, πηδούσαμε, πηδούσατε, πηδούσαν. Romanian: *mâncam, mâncai, mânca, mâncam, mâncați, mâncau*; *voiam*; *săream*.
- Imperatives: τρώω → aorist φάε, φάτε; present τρώγε, τρώγετε. πλένω → aorist πλύνε, πλύνετε; present πλένε, πλένετε. Negative: μην φας, μην φάτε (aorist); μην τρως, μην τρώτε (present).
- Impersonal μπορεί ("it is possible; may"): a single third-person slot; Romanian *poate*, English "may".
- ψωμί (bread): neuter noun, plural ψωμιά; Romanian *pâine* (feminine; *pâinea*, *pâini*), English bread (mass).
- The Romanian and English counterparts of every verb are listed in 6.6.
- Phrase 19 glosses: natural "I ate the bread" / *Am mâncat pâinea*; literal "(I) ate the-[acc] bread" / *(Eu) am mâncat pâinea*. Phrase 20: natural "I will eat less bread" / *Voi mânca mai puțină pâine*; literal "(I) will eat less bread" / *(Eu) voi mânca mai puțină pâine*. Both are marked for content review.

The verb panel's **tense overview** lists the selected person across all of these, in three columns, with the form in use highlighted. It is the main place a learner sees the whole system at once.

### 6.5 Conditional, passive participle and clitic imperatives

**Conditional.** Greek has no separate conditional forms: it is the particle θα with the imperfect or the pluperfect.

| Conditional | Greek construction | Example | Romanian | English |
|---|---|---|---|---|
| Present / polite | θα + imperfect | θα έτρωγα; θα ήθελα | *aș mânca*; *aș vrea* | I would eat; I would like |
| Past | θα + pluperfect | θα είχα φάει | *aș fi mâncat* | I would have eaten |

θα + aorist (θα έφαγε) is deliberately not listed: it normally expresses a guess about the past ("he must have eaten"), not a conditional, and it is out of scope (section 2).

If-clauses: Αν είχα ψωμί, θα έτρωγα / *Dacă aș avea pâine, aș mânca* / If I had bread, I would eat. Greek and English both use a past tense in the if-clause; Romanian uses the conditional there too. Romanian conditional: *aș, ai, ar, am, ați, ar* + infinitive (*aș fi* + participle for the past). English: would + base verb (would have + participle for the past). New words: αν / *dacă* / if; είμαι (am, are, is: είμαι, είσαι, είναι, είμαστε, είστε, είναι / *sunt, ești, este, suntem, sunteți, sunt*).

**Passive participle.** A derived adjective in -μένος, -μένη, -μένο (stem-stressed class). Examples: πλένω → πλυμένος (*spălat*, washed); ψήνω → ψημένος (*copt*, baked). It describes a state (Το παιδί είναι πλυμένο, "The child is washed") and agrees with its noun. Do not confuse it with the perfect (Έχω πλυθεί), whose base form never changes.

**Clitic pronouns.** Greek weak forms: accusative με, σε, τον / την / το, μας, σας, τους / τις / τα; genitive μου, σου, του / της / του, μας, σας, τους. Romanian: accusative *mă, te, îl / o, ne, vă, îi / le*; dative *îmi, îți, îi, ne, vă, le*. English: me, you, him / her / it, us, you, them. The strong Greek forms (εμένα, εσένα) are shown as notes only.

**Where they go**

| | Greek | Romanian | English |
|---|---|---|---|
| Affirmative imperative | after the verb: Φάε το!, Φάτο! | after, hyphenated: *Mănâncă-l!* | Eat it! |
| Negative imperative | before the verb: Μην το φας! | before: *Nu-l mânca!* | Don't eat it! |
| Indicative and subjunctive | before: το τρώω, να το φάω | before: *îl mănânc*, *să-l mănânc* | after: I eat it |

**Same-meaning groups** (presented together as in 5.4):

| Group | With noun | With clitic | Short form |
|---|---|---|---|
| Eat the bread! | Φάε το ψωμί! / *Mănâncă pâinea!* / Eat the bread! | Φάε το! / *Mănâncă-o!* / Eat it! | Φάτο! |
| Wash the child! | Πλύνε το παιδί! / *Spală copilul!* / Wash the child! | Πλύνε το! / *Spală-l!* / Wash him! | none |
| Give me the bread! | Δώσε μου το ψωμί! / *Dă-mi pâinea!* / Give me the bread! | Δώσε μού το! / *Dă-mi-o!* / Give it to me! | Δως μου το! |
| Don't eat the bread! | Μην φας το ψωμί! / *Nu mânca pâinea!* / Don't eat the bread! | Μην το φας! / *Nu o mânca!* / Don't eat it! | none |

Each group also lists a **close, not the same** row, the verb with no object: for the first group, Φάε! / *Mănâncă!* / Eat! The meaning is narrower, because it does not say what to eat, so it is not a member of the group. It is shown beneath the strip with one line saying what is missing ("no object: what to eat is not said") and it is the phrase-38 example. The same aspect point applies to it: Φάε! means "eat up", Τρώγε! means "keep eating".

Notes: in the first group the Greek clitic is neuter (το) and the Romanian is feminine (*o*). In the third group two clitics appear, in the order genitive then accusative, and the stress rule adds the second accent (μού); the short form Δως μου το needs none because its stress is on the third-last syllable. In the fourth group the clitic moves to the front of the verb. Verbs used: φάω / τρώω, πλένω, δίνω (aorist imperative δώσε / δώστε, short form δως; present imperative δίνε). Shortening is stored per verb, not generated.

The past forms these examples use (είχα, ήθελα, έτρωγα) come from the paradigms in 6.4.

### 6.6 Forms and where they come from

All Greek forms are monotonic. Every form in the prototype comes from the tables in sections 6.3 to 6.5 and the lexeme inventory below. These are the single source for the files in `data/`. The brainstorming mockups were used only to draft those tables; where a mockup and this section disagree, this section wins. All entries start unverified and are checked in section 9.

**Lexeme inventory** (the lexemes the 72 phrases need):

- **Verbs:** θέλω, πηδάω, πλένω and πλένομαι, κοιμάμαι, τρώω, πάω, δίνω, έχω (also the auxiliary), είμαι (copula), μπορεί (impersonal), ψήνω (needed only for its participle). Added for the question words and pronouns: κάνω (Plan 7) and λέω (Plan 8; present, imperfect and subjunctive present).
- **Nouns:** καφές, νερό, ψωμί, παιδί, αλεπού, σκύλος. Added: ώρα (a feminine noun in -α; Plan 7). Added for σε (Plan 9): σπίτι (neuter in -ι with the stress on the stem, a class of its own: σπίτι, σπιτιού, σπίτια, σπιτιών), δρόμος (masculine in -ος; neuter in Romanian, *drum*) and θάλασσα (feminine in -α, genitive plural θαλασσών).
- **Adjectives:** ζεστός, γρήγορος, τεμπέλικος, καφέ (indeclinable); the participles πλυμένος and ψημένος.
- **Determiners and quantifiers:** the definite article; ένας / μία / ένα and the numerals 2 to 5; μερικοί, κάποιος, κανένας, πολύς, λίγος and the comparatives περισσότερος and λιγότερος. Added: the question words ποιος (own forms, like κάποιος, with a plural) and πόσος (the adjective endings); both singular and plural, subject and object roles.
- **Function words:** πάνω από (with κάτω από, με, για for the preposition table), δεν, μην, να, θα, αν, and the clitic pronouns. Added: από and μέχρι (prepositions that may govern a question word), the particle ας, and the question words τι, πού, πότε, γιατί, πώς (a new part of speech, "interrogative"). Added for σε (Plan 9): σε itself, with its senses and the six fused forms. Added for possessives: the possessive (μου, σου, του, της, μας, σας, τους after a noun; Plan 10) and the adjective δικός (Plan 11).
- **Strong subject pronouns** (shown as dropped or optional beside verbs): εγώ, εσύ, αυτός / αυτή / αυτό, εμείς, εσείς, αυτοί / αυτές / αυτά.

**Romanian lexemes:** verbs *a vrea, a sări, a spăla* (and *a se spăla*), *a dormi, a mânca, a merge, a da, a avea* (also the auxiliary), *a fi* (copula and auxiliary), *a putea* (*poate*), *a coace*; nouns *cafea, apă, pâine, copil, vulpe, câine*; adjectives *cald, rapid, leneș, maro* and the participles *spălat, copt*; numerals *un / o, doi / două, trei, patru, cinci*; quantifiers *niște, câțiva, vreun / vreo, niciun / nicio, mult, puțin, mai*; function words *peste, sub, cu, pentru, nu, să, dacă*; the clitic table; the subject pronouns *eu, tu, el / ea, noi, voi, ei / ele*. Added: *a face* (κάνω), *a zice* (λέω), *oră*, *a costa* (in the gloss), *cine, care, ce, cât, unde, când, de ce, cum*, *de la, până la*, and *să* as the hortative particle. Added for σε: *casă* and *acasă*, *drum*, *mare*, and the prepositions *la*, *în*, *pe*. Added for possessives: the possessive adjectives *meu / mea / mei / mele, tău / ta / tăi / tale, nostru / noastră / noștri / noastre, vostru / voastră / voștri / voastre* and the invariable *lui, ei, lor*; and, for Plan 11, *propriu* and *al / a / ai / ale*.

**English lexemes:** verbs *want, jump, wash, sleep, eat, go, give, keep, have* (also the auxiliary), *be* (copula and auxiliary), *do* (for "don't"), *used to*, *may, bake*; nouns *coffee, water, bread, child, fox, dog*; adjectives *hot, quick, lazy, brown* and the participles *washed, baked*; numerals one to five; quantifiers *some, a few, several, any, anyone, someone, no, none, no one, much, many, a lot of, little, a little, few, more, less, fewer*; function words *over, above, under, with, for, not, if, to, will, would, the, a / an*; the pronouns *I, you, he / she / it, we, they, me, him, her, us, them, myself*. Added: do / make (κάνω), say (λέω), hour / time, who, which, what, where, when, why, how, how much, how many, from, until, let / let's. Added for σε: house / home, road, sea, and the prepositions to, at, in, on. Added for possessives: my, your, his, her, its, our, their, and, for Plan 11, "my own" and mine.

**Test fixtures only:** τηλεφωνώ and διαβάζω appear only in the stress unit tests (4.3). They live in the test fixtures, not in `data/`, so the inventory and the validator never see them.

No phrase uses μπύρα, so it is not in the prototype.

## 7. Validation and errors

A build-time script (`npm run validate`) fails the build when:

- a token refers to a missing lexeme, or its slot is invalid or outside the lexeme's `offers`;
- a verb token's `text` differs from the text `compose` produces for its authored slot (compared ignoring capitals and trailing punctuation), or its slot asks for pronouns with a reflexive (mediopassive) voice or a verb that takes no object (`intransitive`: πάω, πηδάω, είμαι, μπορεί), or for a short form outside a command, or for negation or a short form that the mood or the lexeme does not allow;
- a slot has no Greek form;
- a stored Romanian or English cell is missing or empty and is **not** marked `pending` (a `pending` cell is accepted and reported, see below);
- an override refers to a slot that does not exist;
- a gloss link points at a token, or at a piece of a token, that does not exist;
- a paradigm class lacks an ending for a slot dimension its lexemes use;
- a divergence note refers to a missing lexeme or part of speech;
- a form group has fewer than two members, its members use different verb lexemes or moods, a member does not compose, or its `closeNotSame` verb has clitics;
- a phrase has no `theme`, or any record that needs a `verified` flag lacks one.
- a question-word quantifier (`question`) that does not offer exactly the subject and object roles, or a quantifier token outside the roles its lexeme offers; a quantifier token with no `agreesWith` unless it is used on its own; a preposition token whose `agreesWith` is neither a noun nor an interrogative (τι, πού, πότε, γιατί, πώς); an interrogative whose `roAfter` names something that is not a preposition; a hortative slot of a verb that does not offer the subjunctive present and aorist; a pronoun that the Romanian clitic table cannot place (for every offered slot and every pronoun the panel can build);
- a σε token whose slot sense is not one of σε's senses, a fused preposition token with no noun in `agreesWith`, a gloss link to a part (piece) of a fused token other than 0 or 1, and a σε token whose text is not the fused form of its noun's article (στον for a masculine singular noun; στη or στην for a feminine singular noun, by the word that follows);
- a possessive token with no noun in `agreesWith`, a possessor that is not a person and number the pronoun table has, and a noun token whose text differs from the form the possessive after it asks for (θάλασσά before μου);

The script also fails the build when an irregular form has no authored reading, or a compound form's generated reading has a part with no gloss.

**Release mode.** `npm run validate -- --release` additionally fails when any `pending` cell remains or any record is not verified: a language of a lexeme, an ending table, an auxiliary table, the Romanian clitic-cluster table, an authored reading, the shared glossary of endings, a form group, a phrase (its tokens and glosses) or a divergence note. A lexeme slot that cannot be confirmed before release is removed from the lexeme's `offers`, so the panel never shows it.

The script also prints a report (not a failure) of every `pending` cell, of entries not yet `verified`, and of authored glosses that disagree with the generated Romanian split (4.5).

At runtime a `pending` cell shows "not yet added" in the cell. A cell that is genuinely missing (which the build should have caught) shows "no form" and logs the slot; the UI never throws on either.

## 8. Testing

- **Unit (Vitest):** `inflect` for every paradigm class (regular cells) and each override (irregular cells); `compose` for each tense and mood (particle, auxiliary and base form in order, including negation), for clitic placement, order and the stress rule (δώσε μού το, with τηλεφώνησέ μου and διάβασέ μου το as pure unit tests), and for short forms; the Romanian and English compound generators, including the Romanian clitic clusters and fusions (*mi-o*, *nu-l*, *m-am*) and the English object reordering ("give it to me"); `agree` for noun-phrase assembly; Romanian suffix splitting; checking of authored gloss segments against the stem and suffix data. These tests use the verified forms from section 9 as fixtures.
- **Data validation:** the script from section 7 runs in CI and as a test. Tests check that a `pending` cell passes and is reported, that an empty cell that is not `pending` fails, that a token outside its lexeme's `offers` fails, and that a form-group member that does not compose fails.
- **Readings:** unit tests generate the reading for a regular form, an irregular form, a compound form and a clitic form, and check the parts, the glosses and that Beginner text contains no grammar terms from a fixed list.
- **Component (Testing Library):** click a Greek token and see its panel; vary an attribute and see the panel change while the phrase chips and glosses stay as authored, then Reset to phrase restores it; click a piece of a verb chip and see only its linked gloss units highlight; click a gloss segment and select the right Greek token (the `le` / `câine` case from the fox sentence); toggle Beginner / Improver and see the full table appear and disappear.
- **Visual check:** a manual pass at phone width and desktop width, in light and dark colour schemes.
- **Accessibility:** word chips and gloss units are real buttons reachable by keyboard; colour is never the only signal (the dashed border marks optional words and labels carry text); Greek renders with a font that has full Greek and Romanian diacritic coverage.

## 9. Content review (required before release)

The Greek, Romanian and English forms were written from memory during brainstorming and have not been checked against an authoritative source. Before any phrase ships, the user (or a Greek speaker they trust) reviews, at least:

- the aorist πήδηξα and the stress shift to πηδήξαμε (πήδησα is a common alternative);
- the Greek rendering of the fox sentence, including the choice of τεμπέλικος and the indeclinable καφέ before the noun;
- the adjective plurals (ζεστοί, ζεστούς, ζεστές, ζεστά) and the stem-stressed class (γρήγοροι);
- the plural αλεπούδες and the plural ψωμιά;
- the numeral forms (τρεις/τρία/τριών, τέσσερις/τέσσερα/τεσσάρων);
- the mediopassive and deponent paradigms (πλένομαι, κοιμάμαι) and their aorists (πλύθηκα, κοιμήθηκα);
- every form group (4.6): the claim that its members mean the same, the `meaning` text, the member notes and the close-not-the-same reasons;
- the shared glossary of endings (5.5), which every generated "how to read this" line draws on ("-εις = you (singular), present" and the rest);
- the "how to read this" texts (5.5): every authored reading, both levels, since they are the part a learner reads most closely;
- the conditional, participle and clitic material in 6.5: the conditional forms θα έτρωγα, θα ήθελα and θα είχα φάει, the exclusion of θα + aorist from the conditional (and whether a speaker agrees it means a guess about the past), the participles πλυμένος and ψημένος, the Romanian participles and conditionals, the shortened forms (φάτο, δως μου το), the accent rule for clitics (an extra accent two syllables after the original stress: δώσε μού το, τηλεφώνησέ μου, διάβασέ μου το), the Romanian clitic clusters (*mi-o*, *nu-l*, *m-am*), and every clitic form in the tables; the English forms stored for the verbs in 6.6, including the present participles and the forms of "be"; phrase 39 (Θέλω να μην πάω) and its Romanian *Vreau să nu merg*; the English naturals now chosen for phrases 1, 22 and 29 ("I want", "I wanted / I'd like", "I would like");
- phrases 21 to 28: the imperfect paradigms and the stress and augment rules (ήθελα / θέλαμε, έτρωγα / τρώγαμε, πηδούσα), the use of Ήθελα as a polite request, the imperatives (φάε, τρώγε, πλύνε and their plurals), the negative imperatives (μην φας …), μπορεί να έχει φάει, and the Romanian counterparts (*Mâncam multă pâine*, *Mănâncă pâinea!*, *Nu mânca pâinea!*, *Spală copilul!*, *Poate să fi mâncat*);
- phrases 19 and 20: the Greek wording (including whether «Θα τρώω λιγότερο ψωμί» sounds natural), the noun ψωμί and its plural, the aorist paradigm of τρώω (έφαγα … έφαγαν), and Romanian *Voi mânca mai puțină pâine*;
- the perfect and subjunctive: the base forms (φάει, πάει, πηδήξει, πλυθεί), the full aorist-subjunctive paradigms of τρώω and πάω (φάω … φάνε, πάω … πάνε), the present subjunctive of τρώω, the simple future, and the negated subjunctive (να μην);
- Romanian perfect and subjunctive: *mâncasem* (and the rest of the pluperfect paradigm), *voi fi mâncat*, the subjunctive of *a mânca*, *a merge* and *a sări*, and the reflexive perfect *m-am spălat*;
- the quantifiers: κάποιον (with the final ν), the πολύς forms (πολύ in the accusative singular masculine, πολλοί, πολλών), whether μερικοί is the right counterpart of *câțiva* and *niște*, the use of κάποιος for *vreun / vreo*, and the comparative forms περισσότερος and λιγότερος;
- Romanian quantifiers: *câteva* and *câtorva*, *multor*, *multului / multei*, *puținului / puținei / puținilor / puținelor*, *vreunui / vreunei*, *niciunui / niciunei* and the choice of *niciun* vs *nicio* in phrase 9;
- Romanian: the sentence *Vulpea rapidă și maro sare peste câinele leneș*, the adjective forms (*calzi, rapizi, leneși*, feminine genitive *calde*), the numerals, the reflexive forms, and the perfect and future forms of *a vrea* and *a sări*.
- the present imperative of τρώω: a search by the user found **τρώγε** (plural τρώγετε), not τρώε / τρώτε, because the present imperative keeps the older stem with -γ-. The spec (5.2, 5.5, 6.1, 6.4, 6.5) and the data now use τρώγε / τρώγετε. The reviewer confirms the form, the plural τρώγετε (extrapolated, not yet checked) and the "keep eating" meaning.
- Plan 5 additions: νερό and Romanian *apă* (*apei*, *ape*); the quantifier forms (κάποιον, καμία and κανένα, the πολύς and περισσότερος forms, μερικοί, λίγος and λιγότερος); the Romanian forms *unii / unele*, *câteva*, *vreunul / vreuna*, *niciunul / niciuna* and the comparative *mai* + the word; the six Romanian genitives *multului, multei, puținului, puținei, puținilor, puținelor* (formerly pending); είμαι, *a fi* and the English forms of "be" (am not, aren't, isn't); ψήνω and *a coace*; the participles πλυμένος and ψημένος with *spălat / spălată* and *copt / coaptă*; αν and *dacă*; and phrases 7 to 10, 20, 21, 30, 32 and 33.
- Plan 6 additions: the Greek weak pronouns and the strong forms; the Romanian pronoun table (free, attached after a command, after *nu*) and the four clusters (*mi-l, mi-o, mi-i, mi-le*); the English pronoun order ("give it to me"); the verb δίνω and its forms (δώσε, δώστε, δίνε, δως) with *a da* and "give"; the short forms φάτο and δως μου το; the second-accent rule (δώσε μού το, and the two unit-test cases); phrases 34 to 38; the four form groups (the claim that their members mean the same, the member notes, the close-not-the-same reasons); and the two authored readings `clitic-stress` and `short-imperative`. `npm run review-sheet` writes a sheet of every unverified record for the reviewer.
  - Review item M7: μην is written throughout (μην το φας); standard spelling drops the -ν before most consonants (μη φας, μη μου το δώσεις). The reviewer decides.
  - The pronoun panel's English cell for the indirect role reads "me" where the reading says "to me". The reviewer decides whether the cell should say "to me".

- Plan 7 and 8 additions: the question words and their Romanian and English counterparts (*cine / care / ce*, *de unde*, *până când*, *de la ce*, *ce oră*, *cât costă*); whether the Romanian object role of *cine* and *care* needs *pe* (*pe cine*), which the cells do not show; the Romanian forms *cât, câtă, câți, câte*; the forms of ποιος and πόσος; whether γιατί, πώς and the compounds are used as written; ώρα, κάνω (the price idiom Πόσο κάνει) and λέω; the hortative ας (every person, the English renderings "let me / let's / let him / let them", and the second person "may you eat / go ahead and eat"); phrases 40 to 56; and, for Plan 8, every Romanian pronoun fusion (*l-am mâncat*, *am mâncat-o*, *l-aș mânca*, *să-l mănânc*, *nu l-am mâncat*, the dative-accusative pairs), the Greek placement of the pronouns, and the natural Romanian *Cum se numește?* for Πώς το λένε.

- Plan 9 additions: the six fused forms (στον, στην, στο, στους, στις, στα) and the rule that drops the ν of στην (στη θάλασσα, στην αλεπού); the senses of σε with their Romanian and English words (*la*, *în*, *pe*, the dative for a person; to, at, in, on) and their examples; the nouns σπίτι, δρόμος, θάλασσα and *casă / acasă*, *drum*, *mare*; whether the article panel should show την under a chip that reads τη (the panel keeps the full form); whether στο σπίτι should read "at home" or "in the house" in English; and phrases 57 to 62 (*Merg acasă*, *Sunt acasă*, *Mergem la mare?*, *Câinele este pe drum*, *Dau pâinea copilului*, *Câinele sare în apă*).

- Plan 10 and 11 additions: the possessive forms (μου, σου, του, της, μας, σας, τους after a noun) and the second accent (θάλασσά μου, δάσκαλός μου); the Romanian possessive table by possessor and by the gender and number of the noun (*meu, mea, mei, mele* and the rest), and the invariable third person (*lui, ei, lor* against *său*); the English my, your, his, her, its, our, their; phrases 63 to 68; and, for Plan 11, δικός (*propriu*, *al meu / a mea / ai mei / ale mele*, "my own" and "mine"), the genitive possessor (*casa copilului*) and phrases 69 to 72.

- Plan 12 additions: the forms of αυτός, εκείνος, τέτοιος and τόσος in every gender, number and role; the Romanian demonstratives (*acest / acel* and the after-noun and pronoun forms *acesta / acela*, the spoken *ăsta / ăla* and the genitives); *asemenea*, *atâta / atâția / atâtea* and *atât*; the place words εδώ, εκεί, *aici*, *acolo*; and phrases 73 to 80. For the content reviewer: does the feminine accusative keep its ν (αυτήν την αλεπού, as stored) or drop it before a consonant (αυτή τη θάλασσα)?

- Plan 13 additions: the Greek relative pronouns που and ο οποίος (every gender, number and role), the Romanian *care* in every role (*care, pe care, căruia / căreia / cărora, cărui / cărei / căror, al cărui / a cărei / ai căror / ale căror*, and a preposition + *care*), the English who, whom, which, that and whose, and phrases 81 to 89. For the content reviewer: whether *pe care* is right for every direct object, a thing as well as a person; whether *al cărui* takes its first word from the owned thing; the Greek pronoun inside the clause (που του …, που … με αυτό).

- Plan 14 additions: the free relatives ό,τι, όπου and όποιος in every gender, number and role, the Romanian *orice / ce*, *oriunde / unde*, *oricine / orice*, the English whatever / what, wherever / where, whoever / whichever, and phrases 90 to 94. Reviewer question: whether the "on its own" row of όποιος (*oricine* / whoever) should read "whichever (one)" (*orice* / *oricare*) for a non-living noun, as for ποιος.

Reviewed content is marked verified in the data, on the record that holds it (4.3): the language flags of a lexeme, the flag on a phrase, a divergence note, an authored reading or a form group, and the `ReviewItem`s for the ending, auxiliary and clitic tables and the glossary of endings. The app does not show an unverified flag to learners; the build report lists unverified entries, and the release check (7) refuses them.

## 10. Risks

- **Content accuracy.** The main risk. Mitigated by the review in section 9 and fixture-based tests.
- **Overloading beginners.** Mitigated by the level toggle and by showing the full table only in Improver mode. Revisit after trying the prototype.
- **Model fit for irregulars.** The hybrid model handles overrides per cell. If many irregular verbs appear, a second pass may need whole-row overrides; not needed for the prototype set.
- **Clitic rules are intricate.** Placement, stress and shortening interact, and the shortened forms are lexical, not regular. Mitigated by storing shortenings as data, limiting the prototype to the verbs in 6.5, and having a Greek speaker review every group.
- **Form groups can over-promise.** "Same meaning" holds only when the object is known from context. Groups exclude the bare verb, and the strip labels what each member assumes. Revisit the wording after trying it.
- **Verb panel density.** Who, mood, tense, voice, negation, object and recipient make up to seven controls, over five moods and seventeen mood and tense combinations, and the tense overview adds a table. Beginner mode shows plain labels and hides the overview; check with the prototype that it does not overwhelm.
- **Aspect is easy to get wrong.** The present and aorist subjunctives are subtle, and Romanian and English give no help. Examples 14 and 15 are the teaching pair, and the text has to be reviewed by a Greek speaker (section 9).
- **Quantifier meanings overlap across languages.** Greek μερικοί covers two Romanian words, and κάποιος / κανένας cut "some / any / none" differently from English. The panel shows these as controls and notes, not as one-to-one translations. Revisit if learners find it confusing.
- **Romanian gaps.** Some Romanian forms (several genitives) are not confirmed. They are marked `pending` (none at present): the UI shows "not yet added", the validator accepts them and lists them, and a cell that is empty without `pending` fails the build. The gaps stay visible and never turn into silent guesses. `pending` is a development marker only: a release build refuses it.
- **Generated Romanian and English compounds.** Generating the compounds from shared tables (4.3) cuts the stored data, but the generators must handle irregular auxiliaries and participles correctly. The irregular verbs that stress the generators are the Romanian and English ones: *a vrea* (*voiam*, *aș vrea*), *a da* (*dădusem*, *dă-mi*), *a fi*, *a avea* and the clitic fusions (*m-am spălat*); and eat / ate / eaten, go / went / gone, give / gave / given, be. Mitigated by per-verb flags for irregular cells and by unit tests on every tense for those verbs.
- **Romanian gender in tables.** Romanian neuter behaves as masculine in the singular and feminine in the plural. The prototype phrases only use masculine and feminine Romanian nouns; neuter handling is deferred.

- **Pronouns in every form.** Romanian fuses the pronoun with the auxiliary, the particle and the conditional, differently for *o*, for the plural and for the dative-accusative pairs, and the fusions are stored for every person (fourteen pronouns and twenty-four pairs with six positions each, about 230 strings), each one a chance of a wrong form. Mitigated by storing them as one reviewed table keyed by pronoun and position, by unit tests on every pronoun and every auxiliary, and by the review sheet.
- **The hortative and the subjunctive look alike.** ας φάμε and να φάμε share the verb form; the difference is the meaning. The panel and the notes state it, and a speaker must confirm the English renderings per person.

## 11. Definition of done for the prototype

1. All seventy-two phrases render, with the correct token chips and four gloss rows each.
2. Every part of speech in the phrases has a working panel with controls, a current-form table and (Improver) a full table, in all three languages.
3. Clicking between Greek tokens and gloss units, including segments, works in both directions.
4. `npm run validate`, the unit tests and the component tests pass.
5. The content review in section 9 is complete, and `npm run validate -- --release` passes: no `pending` cell remains, and every lexeme language, ending table, auxiliary table, clitic table, glossary of endings, authored reading, form group, phrase (tokens and glosses) and divergence note is verified.
6. The page works at phone width and in light and dark mode.
7. Every form group renders its members together, and the strip's highlighting, notes and Beginner / Improver differences work.

## 12. Sources consulted

- Order of two clitics and clitic placement with imperatives (genitive before accusative; pronouns after an affirmative imperative): [Clitics With the Imperative](https://elon.io/grammar/greek/verbs/imperative/imperative-with-weak-pronouns), [Modern Greek grammar](https://en.wikipedia.org/wiki/Modern_Greek_grammar).
- These support the structure of the clitic rules only. The forms themselves still need the review in section 9.

## 13. Changes since the first review

Review 1 raised numbered points 1 to 8 and 10 to 20 (the review has no point 9: the reviewer retracted their original point 2 and renumbered the old points 3 to 9 as 2 to 8, but left points 10 to 20 as they were) and a few smaller ones. This section records what changed and where. The numbers below are the review's own.

| Review point | Change | Where |
|---|---|---|
| 1 Phrase count | Scope now says 39 phrases, matching 6.1 and the definition of done | 2, 6.1, 11 |
| 2 Phrase 11 stem | Corrected to φα- (base form φάει) | 6.1 |
| 3 Risk counts | Six controls, four moods, fifteen combinations (8 + 3 + 2 + 2) | 10 |
| 4 Validation vs "not yet added" | New `pending` marker on stored cells; validator accepts and reports it, fails on an empty cell without it | 4.2, 7, 10 |
| 5 Stress rule | Rule restated (superseded again in review 2, see section 14); phrase 36 now reads Δώσε μού το | 4.3, 5.2, 5.5, 6.1, 6.5 |
| 6 No clitic-stress phrase | Phrase 36 is the example; the one-clitic case (τηλεφώνησέ μου) is a unit test only | 4.3, 8 |
| 7 Unused μπύρα | Removed from the review list; noted as not in the prototype | 6.6, 9 |
| 8 Paradigm sources | Lexeme inventory added; the 6.x tables are the single source for `data/` | 6.6 |
| 10 Negation and objects in the slot | Verb slot gains `polarity`, `clitics`, `shortForm`; new `compose()` entry point | 4.2, 4.3 |
| 11 `Form` and clitics | `Form` stays one word (with `augment`); new `Piece` and `Composed` types; `augment` added to reading roles | 4.2, 5.5 |
| 12 Sense and use | Moved from the lexeme to the quantifier slot | 4.2 |
| 13 Slotless parts of speech | Slot variants for preposition, particle and conjunction; lexemes declare `offers` (copula, impersonal verbs) | 4.2, 5.3 |
| 14 Form-group members | Members hold lexeme and slot (plus an optional object); text is generated; kind is derived | 4.6 |
| 15 Volume of Romanian and English data | Lexical forms stored, compounds generated from shared tables | 4.3, 10 |
| 16 Theme and core marker | `Phrase.theme` with a theme list; `Divergence` type with `tag` and `level` | 4.4, 5.2, 6.1 |
| 17 θα + aorist | Removed from the conditional (now two tenses) and moved to out of scope | 2, 4.2, 6.5 |
| 18 "I'd like" repeated | Phrase 1, 2, 7, 8, 10 now read "I want"; 22 is "I wanted (polite: I'd like)"; 29 stays "I would like" | 5.2, 6.1 |
| 19 Subjunctive negation | Divergence restated as να μην; new phrase 39 exercises it; phrase 16 is the main-verb negation | 5.2, 6.1 |
| 20 Two alternatives in one phrase | Phrases 34 and 36 are single forms; short forms are reached through the form group | 6.1, 4.6 |
| Smaller: clitic scope sentence | Out-of-scope list now says the indicative placement is comparison only | 2 |
| Smaller: phrase 16 and πήγ- | Feature text corrected | 6.1 |
| Smaller: authored vs generated glosses | Authored gloss wins; the validator warns | 4.5 |
| Smaller: phrase level vs toggle | The level is a badge and sort key; the toggle never hides phrases | 3 |

## 14. Changes since the second review

| Review 2 point | Change | Where |
|---|---|---|
| 1 Compound verbs and tokens | One token per verb group (`compose` output). Particles are pieces of the chip; clicking one opens the particle section of the verb panel. Gloss links can name a piece (`Link`). Phrase 9 has three tokens, phrase 14 has two | 4.2, 4.4, 4.5, 5.3, 5.5 |
| 2 Stress rule | Restated: the second accent falls two syllables after the original stress, when the stress would reach the fourth-last syllable or further back (δώσε μού το, τηλεφώνησέ μου, διάβασέ μου το); the last two are unit tests | 4.3, 8, 9 |
| 3 Do panel edits change the phrase | No. The phrase and glosses are authored and fixed; the panel works on a working copy with a Reset control and a "differs from the phrase" label; form-group selection changes the copy only | 4.4, 4.6, 8 |
| 4 English -ing and "be" | Present participle stored; "be" has its own stored forms; progressive generated | 4.3 |
| 5 Generator risk verbs | The risk now names the irregular Romanian and English verbs | 10 |
| 6 Romanian clitic clusters, English reordering | Clusters and fusions stored in a table keyed by sequence and position; English object reordering is a rule in the generator | 4.3, 8, 9 |
| 7 "Close, not the same" field | `FormGroup.closeNotSame` | 4.6 |
| 8 Overlapping member kinds | Order of precedence stated; with-noun wins | 4.6 |
| 9 Where `verified` lives | A `verified: boolean` on every lexeme in all three languages; per lexeme, not per cell; validator checks it exists (superseded in review 3, see section 15) | 4.3, 7 |
| 10 Missing lexemes | Romanian and English lexeme inventories added | 6.6 |
| 11 Subjunctive clitic scope | Clitics only in imperative slots; subjunctive placement is comparison only; validator enforces | 2, 4.2, 7 |
| Negation placement | δεν before θα and the verb; μην after να | 4.3 |
| Token text comparison | Ignores capitals and trailing punctuation | 4.4, 7 |
| §13 numbering | Explained in section 13 | 13 |
| Strong subject pronouns | Added to the Greek inventory | 6.6 |

## 15. Changes since the third review

| Review 3 point | Change | Where |
|---|---|---|
| 1 `pending` vs "every entry verified" | `pending` is a development marker; a release build refuses it. A slot that cannot be confirmed is removed from the lexeme's `offers`, so the panel never shows it | 4.2, 5.3, 7, 10, 11 |
| 2 Nowhere to record checks | Phrases, divergence notes and authored readings carry `verified`; ending tables, auxiliary tables and the clitic-cluster table are `ReviewItem`s; the release check covers all of them | 4.2, 4.3, 5.2, 7, 9, 11 |
| 3 Two meanings of `verified` | One meaning: a flag covers the record it sits on. A lexeme has `verified: { el, ro, en }`, one flag per language | 4.3 |
| 4 A clicked piece has no lexeme | Non-verb pieces carry `lexeme` and `slot` | 4.2, 4.4 |
| 5 Nothing opens the clitic panel | Clicking a clitic piece opens it, like the particle panel | 4.4, 5.3, 5.5 |
| Particle panel: section or panel | A panel in place of the verb panel, with a link back; the part of speech is "the particles δεν, μην, να and θα" | 2, 4.4, 5.3 |
| Glosses: authored or generated | Authored. The stem and suffix data only check them | 4.3, 4.5, 8 |
| English inventory gaps | Added keep, do, used to, myself, several, anyone, someone, no one, a lot of, a little | 6.6 |
| Unit-test-only verbs | τηλεφωνώ and διαβάζω are test fixtures, outside `data/` | 6.6 |

## 16. Changes since the fourth review

| Review 4 point | Change | Where |
|---|---|---|
| 1 Form groups unreviewed | `FormGroup.verified`; added to the release check, the §9 list and the definition of done | 4.3, 4.6, 7, 9, 11 |
| 2 Glossary of endings unreviewed | A fourth `ReviewItem` kind, `glossary`; added to the release check, the §9 list and the definition of done | 4.2, 4.3, 7, 9, 11 |
| 3 `offers` hides confirmed Greek forms | Stated as an accepted trade-off, with the πολλού / *multor* example | 5.3 |
| 4 Genitive stand-alone pronouns | Dropped from the §9 pending line; they are out of scope (6.3) | 9 |
| 5 Stale row in §14 | Row 9 marked superseded, pointing to §15 | 14 |

## 17. Changes since Plan 3

| Source | Change | Where |
|---|---|---|
| User's search: the present imperative of τρώω keeps the older -γ- | τρώε / τρώτε replaced by τρώγε / τρώγετε for the imperative (phrases 27 and 38, the tables, the readings and the divergence note); the present subjunctive μην τρως / μην τρώτε is unchanged. The plural is extrapolated and listed for the reviewer | 5.2, 5.5, 6.1, 6.4, 6.5, 9 |

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
| Main text aligned | The main text of 4.2, 5.3 and 9 now says what the rows above say: the `derivedFrom` shape, `use` on the slot, quantifier `offers` as numbers, and the six pending Romanian genitives filled in before release (no per-case removal) | 4.2, 5.3, 9 |

## 19. Changes since Plan 6

| Source | Change | Where |
|---|---|---|
| `clitics` and `shortForm` | Optional on the verb slot (absent means none), as `polarity` is | 4.2 |
| Pronoun gender in two languages | `Clitic.roGender` carries the Romanian gender of the noun the pronoun stands for (clitic-gender) | 4.2, 5.2 |
| Short forms | Stored on the verb voice (`shortForms`, keyed `impAorist.2sg`, with a `fuse` flag); `VerbVoice.indirect` marks a verb with an indirect object (δίνω) | 4.3 |
| Stress rule | `engine/stress.ts` counts syllables of the whole unit (a diphthong and an unaccented ι before a vowel are one syllable) and adds the second accent to a pronoun or to the verb; the short forms need none | 4.3 |
| Object control | Four kinds (none, a noun, a pronoun, two pronouns) and an "Object noun" select; the noun is held in the panel state; the verb tokens of phrases 24, 25 and 26 point at their noun | 5.3 |
| Romanian pronouns | Singles for every person; clusters only for the first-person dative with a third-person accusative | 4.3 |
| Readings | Forms with pronouns have a Greek reading line only; Romanian and English lines are not produced for them | 5.5 |
| Same-meaning strip | Rows are buttons; a short form's Romanian and English cells read "none"; Beginner shows *with noun* and *with clitic* | 5.4 |
| Content review | `npm run review-sheet` writes the sheet; the review itself remains; the six Romanian genitives are now filled in (*multului, multei, puținului, puținei, puținilor, puținelor*) | 9, 11 |
| `member` control | The Same-meaning strip changes the panel through the control key `member` (a member's index, or `close`); the strip is hidden when the panel is in a group's family but on none of its members | 5.4 |
| `fused` piece | A short form that joins the pronoun into one word (φάτο) is a `fused` piece; it opens the verb panel and is a `fused` role in the reading | 4.2, 5.5 |
| English pronoun | `Clitic.enPronoun` and `GreekNoun.enPronoun` (default "it"; παιδί is "him / her / it"): the English pronoun follows the noun, not the Greek gender. The Gender control of the pronoun panel drops it | 4.2, 6.5 |
| Object noun select | Held in the panel state; it is kept while a pronoun remains and cleared otherwise (for example when the Object control is set to none, or when the verb takes no object); a group is shown only for the pronoun of the held noun | 5.3 |
| Verb piece | The lexical verb is the piece of kind `verb` (first in a command with pronouns, last elsewhere); `lexicalPiece(composed)` finds it for the panel, the reading and the validator | 4.3 |
| Validator | A group's close verb must exist, be the members' verb and compose; members share person, number, tense and polarity; a phrase token with the clitic slot is an error | 7 |
| Main text aligned (Plan 6) | The main text of 4.2, 4.3, 5.3 and 5.5 now says what the rows above say: seven controls, the `fused` piece and role, and where stress and shortening live | 4.2, 4.3, 5.3, 5.5 |

## 20. Changes for question words, ας and pronouns in every form

| Source | Change | Where |
|---|---|---|
| New request: the question words | A new part of speech, the interrogative (τι, πού, πότε, γιατί, πώς), with its own slot and panel; ποιος and πόσος are quantifier lexemes flagged as question words, offering the subject and object roles only (no Romanian genitives are guessed) | 2, 4.2, 5.3, 6.6 |
| New request: ας | A fifth mood, the hortative (present and aorist, ας + the subjunctive form, every person, with negation); the particle ας opens its own panel; 17 mood and tense combinations | 2, 4.2, 4.3, 6.4 |
| Compound questions | από πού, μέχρι πότε, τι ώρα and πόσο κάνει are separate tokens (preposition + question word, question word + noun, question word + verb), so each literal unit links to its own word; a preposition may govern a question word; new words ώρα, κάνω, από, μέχρι | 4.4, 5.3, 6.6 |
| New request: Πώς το λένε | Weak pronouns are allowed in every indicative, subjunctive, conditional and hortative form, not only in commands; Romanian fusions are stored for every person; new verb λέω | 2, 4.3, 5.2, 6.6 |
| Delivery | Plan 7: question words, ας, the new words, phrases 40 to 53. Plan 8: pronouns in every form, λέω, phrases 54 to 56 | 6.1 |

## 21. Decisions made in Plan 7

| Source | Decision | Where |
|---|---|---|
| Delivery | Plan 7 delivers the question words, ας, the hortative, ώρα, κάνω, από, μέχρι and phrases 40 to 53, so the picker lists 53 phrases; phrases 54 to 56 follow in Plan 8 | 6.1, 11 |
| English hortative | One rendering per person (*let me*, *may you* for both second persons, *let him / her*, *let's*, *let them*); the English cell takes the pronoun word from `EnParts.pronoun`; there is no English reading line for the hortative | 5.2, 5.5 |
| A preposition and a question word | A preposition governs a noun or an interrogative; `roAfter` stores the fused Romanian word (*de unde*, *până când*); ποιος and πόσος after a preposition are out of scope | 4.4, 5.3 |
| ποιος and πόσος | `question: 'who' \| 'amount'` and `cases: ['nom', 'acc']` on the quantifier lexeme; ποιος uses the "How many?" control, πόσος the mass / count control; Romanian *care* before a noun and *cine* on its own | 4.2, 5.3, 6.6 |
| A quantifier with no noun token | The panel starts with σκύλος (m), αλεπού (f) or παιδί (n) as its noun, so Romanian shows *cine* and *cât* | 5.3 |
| Nouns | `GreekNoun.overrides` stores a whole irregular cell; ώρα is class `fem-a` with the genitive plural ωρών | 4.3, 6.6 |
| Comparison notes | Thirteen rows for the eleven notes of 5.2: question-order, question-mark, question-words (two rows), why-because, question-declension, question-compounds (two rows), price-idiom and four hortative rows; a row may name several lexemes | 5.2 |
| Counts | 17 mood and tense combinations; every verb with the subjunctive present and aorist offers the hortative | 4.2, 4.3 |

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

## 23. Changes for σε and the article contractions

| Source | Change | Where |
|---|---|---|
| New request: σε | σε is a preposition that fuses with the article in the six forms στον, στην, στο, στους, στις, στα; the fusion is stored data and a ReviewItem covers it | 2, 4.4 |
| Token model | A fused preposition is one token with two parts (σε and the article): one chip with two clickable parts, each opening its own panel, and gloss units that link to either part | 4.4, 5.3 |
| Meaning control | σε has five senses (to, at, in, on, person) carried on the slot (`sense`) and offered as the Meaning control; the person sense is the indirect object, which Romanian renders with the dative | 4.2, 5.3 |
| Panels | The σε panel shows the fused form with the noun, the Romanian and English word of the chosen meaning, and the six fused forms in the Improver table; the other prepositions are unchanged except that their Improver table gains a σε row when the governed thing is a noun | 5.3 |
| Notes | Four rows: preposition-meaning, preposition-article-fusion, direction-and-place, indirect-object-dative | 5.2 |
| Content | Nouns σπίτι, δρόμος, θάλασσα; phrases 57 to 62 in a new *Places* theme (61 is *Daily life*) | 6.1, 6.6 |
| Delivery | Plan 9: σε, the contractions, the meaning control, the new nouns and phrases 57 to 62 | 6.1 |
| Movable ν | στην becomes στη in front of most consonants; the σε panel and the validator apply it to the word after σε; the article panel keeps the full την | 4.4 |
| σπίτι | A class of its own, `neut-i-stem` (σπίτι, σπίτια; the genitive moves the accent: σπιτιού, σπιτιών, stored as overrides) | 6.6 |
| Gloss check | The check on a split Romanian noun ignores capitals (Câine + le at the start of a sentence) | 7 |

## 24. Changes for possessives

| Source | Change | Where |
|---|---|---|
| New request: possessives | The weak possessive (μου, σου, του / της, μας, σας, τους after a noun), the emphatic δικός μου and a possessor noun in the genitive | 2, 4.3 |
| Token model | A possessive is a token of its own that points at its noun (`agreesWith`), with the slot `{ pos: 'possessive', person, number, gender? }`; the noun's token carries the second accent when the stress rule asks for it | 4.2, 4.4 |
| Noun panel | A Whose? control (nobody, or a possessor) and a row "with a possessive"; the possessive has its own panel with the person × number table | 5.3 |
| Languages | Greek and English change with the possessor; Romanian changes with the possessed noun (a stored table by possessor and by gender and number); the third person is the invariable *lui, ei, lor* | 4.3, 5.2 |
| Notes | Six rows: possessor-agreement, possessive-position, possessive-accent, possessive-third-person (Plan 10); emphatic-possessive, noun-possessor (Plan 11) | 5.2 |
| Phrases | 63 to 68 in Plan 10; 69 to 72 in Plan 11; a new *Possession* theme | 6.1 |
| Delivery | Plan 10: the weak possessive, the Whose? control, the Romanian table, the second accent, phrases 63 to 68. Plan 11: δικός, the genitive possessor, phrases 69 to 72 | 6.1 |
| Panel state | `PanelState` gains `nounCase` (the role of the noun a possessive goes with, since the possessive's own slot holds only the possessor) and `possessor` (the noun panel's Whose? control); a noun that a possessive points at starts with that possessor | 5.3 |
| δρόμος | Its Romanian gender is neuter (*un drum, două drumuri*), so the possessive reads *drumurile mele* in the plural; the earlier data said masculine | 6.6 |
| Validator | A noun followed by a possessive is written with the second accent where the stress rule asks for it; a possessive points at a noun and carries the pronoun its possessor says | 7 |
| Plan 10 built | The weak possessive: the lexeme, the engine (`nounPhrase` with a possessor, `possessedNounForm`), the possessive panel, Whose? in the noun panel, phrases 63 to 68, four notes, the review sheet; Plan 11 (δικός and the genitive possessor) is still to do | 24 |
| δικός | An adjective lexeme flagged `emphatic` with its own panel: before the noun (το δικό μου σπίτι, *propria mea casă*, "my own house") and on its own (το δικό μου, *a mea*, "mine"); the role control offers the subject and the object only, because Romanian has no short genitive (*propriului meu*, *al celui*) | 5.3 |
| δικός token | δικός is a token of its own and the possessive that follows it points at the same noun; the possessive may stand after the noun or directly after δικός, and the noun takes the second accent only when the possessive is next to it | 4.4, 7 |
| Noun possessor | The owning noun is the genitive singular with its own definite article, after the possessed noun (το σπίτι του παιδιού); its token points back at the possessed noun with `agreesWith`; the noun panel has an Owned by a noun? control, which excludes a pronoun possessor; English says "the child's house" | 4.2, 5.3 |
| Gloss check | A Romanian gloss unit split at the genitive (*copil* + *ului*) is checked against the stored genitive, not against the nominative split | 7 |
| Plan 11 built | δικός, the noun possessor, phrases 69 to 72 (72 in all), the notes emphatic-possessive and noun-possessor, and the review sheet; the Romanian genitive of δικός and a plural or counted noun possessor are not covered | 24 |

## 25. Changes for demonstratives and place words

| Source | Change | Where |
|---|---|---|
| New request: demonstratives | The declining demonstratives αυτός, εκείνος, τέτοιος and τόσος, and the place words εδώ and εκεί | 2, 4.3 |
| Model | The four declining words are quantifier lexemes flagged `demonstrative` (the quantifier engine, panel, validator and review sheet are shared); εδώ and εκεί are a new invariable part of speech, the adverb, with the slot `{ pos: 'adverb' }`, its own lexeme type and panel (like the question words) | 4.2 |
| Tokens | A demonstrative and the article after it are separate tokens that point at the noun (αυτό, το, σπίτι); the validator wants the definite article beside αυτός and εκείνος, and a numeral or nothing beside τέτοιος and τόσος. On its own (Αυτό είναι …) it has no `agreesWith`, except that a stand-alone αυτό carries `agreesWith` when its phrase has the noun it stands for (phrase 76, Αυτό είναι το σπίτι μου) | 4.4 |
| Greek | Whole forms in the usual -ος / -η / -ο pattern (τέτοιος has the feminine τέτοια): αυτός is stressed on the ending, εκείνος, τέτοιος and τόσος on the stem; the final ν is kept (αυτόν) | 4.3 |
| Romanian | Three sets of cells for αυτός and εκείνος: before the noun, after the noun or on its own, and spoken (after the noun only); a Romanian form control picks formal or spoken, and the "with a noun" row shows both formal placements (*acest copil / copilul acesta*). τέτοιος is *asemenea* with the article before it, with no stand-alone use. The genitive is stored for the formal sets and not for the spoken one | 4.3, 6.3 |
| English | this / these, that / those, such (a), so much / so many; the English cell follows the number | 4.3 |
| Panel | As the quantifier panel: noun, role and number controls plus the Romanian form control; rows "with a noun" and "on its own"; Gender × role in the Improver view. The place-word panel is the question-word panel's shape | 5.3 |
| Prepositions | από and μέχρι may govern a place word, as they may govern a question word (από εδώ, μέχρι εκεί); `roAfter` stores the Romanian words where they fuse (*de aici*, *până acolo*) | 5.3 |
| Notes | Seven rows: demonstrative-article, demonstrative-placement, demonstrative-neuter, demonstrative-he, demonstrative-spoken, such-so, place-words | 5.2 |
| Phrases | 73 to 80 in a new theme *Pointing* | 6.1 |
| Scope | Not covered: τούτος, the three-way near / far / by-you distinction, the manner adverbs (έτσι), *același* and *cel*, the spoken genitive, a stand-alone τέτοιος | 2 |
| Delivery | Plan 12, one plan for everything; if the dry run grows too large it is split into a plan for the declining words and a plan for the place words | 6.1 |
| Slot and data | A quantifier slot gains `register` (the spoken Romanian forms); a quantifier lexeme gains `demonstrative` (near, far, such or amount), `uses` and `ro.spoken`; the `pronoun` cells of the Romanian and English data are optional, because τέτοιος has no stand-alone use | 4.2 |
| τόσος and τέτοιος | τόσος offers the subject and object only, like πόσος; τέτοιος with a mass noun takes no ένα and, in Romanian, no article word (τέτοιο ψωμί, *asemenea pâine*, "such bread") | 5.3 |
| Prepositions | από and μέχρι govern a place word as they govern a question word; `roAfter` stores *de aici*, *de acolo*, *până aici* and *până acolo*; σε takes nouns only | 5.3 |
| Validator | αυτός and εκείνος beside a noun need the definite article of that noun; τέτοιος in the singular needs ένα unless the noun is mass; a Greek token never carries the spoken register; a preposition may name a place word | 7 |
| Plan 12 built | αυτός, εκείνος, τέτοιος and τόσος, the Romanian form control, the adverb part of speech (εδώ, εκεί), phrases 73 to 80 (80 in all), seven notes, and the review-sheet sections; the manner adverbs and the other demonstratives listed above are not covered | 25 |

## 26. Changes for relative pronouns

| Source | Change | Where |
|---|---|---|
| New request: relative pronouns | που, ο οποίος / η οποία / το οποίο in five roles (subject, object, to whom, whose, after a preposition), and the free relatives ό,τι, όπου and όποιος | 2, 4.3 |
| Delivery | Plan 13: που and ο οποίος in every role, the Romanian *care* and the English who / which / that / whose, phrases 81 to 89. Plan 14: the free relatives (ό,τι: *orice*, "whatever"; όπου: *oriunde*, "wherever"; όποιος: *oricine*, "whoever"), phrases 90 to 94 (*Ό,τι θέλεις / Orice vrei*, *Όπου πας / Oriunde mergi*, *Όποιος θέλει / Oricine vrea*, *Ό,τι έχω / Ce am*, *Εκεί όπου είναι το σπίτι / Acolo unde este casa*) | 6.1 |
| Model | A new part of speech, the relative pronoun, with the slot `{ pos: 'relative', role, preposition?, gender, number }` and two lexemes (που, ο οποίος); the antecedent is the noun it points at (`agreesWith`); nouns gain an `animate` flag, which decides English who or which (Romanian *pe care* marks every direct object, a thing as well as a person) | 4.2 |
| Tokens | ο οποίος is one chip that includes its article and, for the jobs that need one, its preposition (τον οποίο, στον οποίο, με το οποίο; σε is written as one word with the article); που is a token of its own, and the pronoun inside its clause is a piece of the verb group (του το έδωσα). The relative token points at its noun, which comes directly before it; for "whose" the article and the noun owned follow it | 4.4 |
| Roles | subject: που, ο οποίος, *care*, who; object: που, τον οποίο, *pe care* + a clitic on the verb, whom / that / nothing; to whom: που του …, στον οποίο, *căruia / căreia / cărora*, "to whom"; whose: του οποίου or που το σπίτι του …, *al cărui*, "whose"; after a preposition: με το οποίο or που … με αυτό, *cu care*, "with whom" or "the child I go with" | 4.3, 5.3 |
| Whose | Two nouns take part: the antecedent decides the Greek του οποίου / της οποίας and the Romanian *cărui / cărei / căror*; the owned noun decides *al / a / ai / ale* (the table of the emphatic possessive) | 4.3 |
| Panel | Controls: antecedent noun, how many, role, preposition (after a preposition), owned noun (whose); rows: the pronoun group with its pattern in three languages and the other Greek word; Improver: all five jobs for the noun | 5.3 |
| Notes | Six rows: relative-invariable, relative-resumptive, relative-object, relative-whose, relative-preposition, relative-omitted | 5.2 |
| Phrases | 81 to 89 in the new theme *Relative clauses*, using the verbs already stored | 6.1 |
| Scope | Not covered: *cel care*, *ceea ce*, "the one who", the relative που of place and time (το σπίτι που μένω), a relative clause after a pronoun, and a relative pronoun with a verb in the passive | 2 |
| Panel state | `PanelState` gains `owned` (the Noun owned control of the job "whose", a noun lexeme id); a "whose" token starts with the noun that follows its article | 5.3 |
| Validator | A relative token points at the noun directly before it and agrees with it in gender and number; its text is που or the chip of ο οποίος for its job; only the job after a preposition names a preposition, from the list (πάνω από, κάτω από, με, για, από, μέχρι, σε); "whose" is followed by the article and the noun owned; που is a token for the subject, the object and "to whom" only | 7 |
| Plan 13 built | The relative pronouns που and ο οποίος: the part of speech, the panel with the five jobs and the preposition and noun-owned controls, the Romanian *care* tables, the `animate` flag, phrases 81 to 89 (89 in all), six notes and the review-sheet section; Plan 14 (ό,τι, όπου, όποιος) is still to do | 26 |
| Free relatives, model | ό,τι and όπου are a new part of speech, the free relative, with the slot `{ pos: 'freeRelative' }` and a lexeme that stores both readings (Romanian *orice / ce*, *oriunde / unde*; English whatever / what, wherever / where) and an example of each; όποιος is a quantifier lexeme flagged `free`, with the Greek table of ποιος, the subject and object only, Romanian *orice* beside a noun and *oricine* on its own, and English whichever and whoever | 4.2 |
| Plan 14 built | The free relatives ό,τι, όπου and όποιος, their panels, phrases 90 to 94 (94 in all), two notes and the review-sheet sections; the "-ever" relatives in the genitive and the construction with an auxiliary (όπου κι αν πας) are not covered | 26 |
| Validator (free relatives) | όποιος offers the subject and object only, takes no article, and stands alone without a noun to agree with; ό,τι and όπου are never governed by a preposition | 4.2 |

## 27. Changes to the review sheet

| Source | Change | Where |
|---|---|---|
| New request: review one feature at a time | `npm run review-sheet` writes a folder `review/sheets/` (git-ignored) instead of one file: `index.md` (every file with the number of records not verified), one file per topic (nouns and the article, adjectives, the verb tables, weak pronouns, quantifiers, the particles and the conjunction, prepositions, question words and place words, possessives, demonstratives, relative pronouns) and one file per verb in `verbs/`. Each file has the layout of the old sheet, limited to its topic: checklist, ending tables, lexemes, phrases, comparison notes, readings, form groups and pending cells | 9 |
| The feature map | `src/data/review-features.ts` names the records of each file; a test checks that every lexeme, ending table, phrase, comparison note, authored reading and form group is named exactly once. A record that no file names goes to `general.md`, which exists only then | 9 |
| Unchanged | The records and their `verified` flags, and `npm run validate -- --release`, which counts every record in every file | 9 |

