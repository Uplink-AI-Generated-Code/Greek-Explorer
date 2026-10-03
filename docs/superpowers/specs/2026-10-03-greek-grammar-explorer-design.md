# Greek Grammar Explorer: design spec

Date: 2026-10-03
Status: draft for review

## 1. Purpose

A prototype for learning Greek by understanding how it works, from day one. The learner reads a real phrase, clicks any word, and sees its grammatical attributes (part of speech, tense, person, number, case, gender, voice). They can vary those attributes and watch the form change. Every word is compared with Romanian and English, including where the three languages diverge (articles, dropped pronouns, gender, word order, case).

The target learner does not want to memorise opaque phrases. Absolute beginners and improvers use the same tool. A Beginner/Improver toggle changes the depth shown, not the content.

Interactive mockups made during brainstorming (v1 to v5, plus the quantifier panel mockup) are the visual reference for layout and behaviour. This spec is the authority where they differ.

## 2. Scope

### In scope (prototype)

- Vite + React + TypeScript single-page app, no backend.
- Hand-curated content: about 10 to 15 phrases and the lexemes they use.
- Parts of speech: verb, noun, definite article, indefinite article / numeral, adjective (regular and indeclinable), preposition, quantifier (indefinite and quantity words such as some, any, none, many, few, little), the negation particle, the conjunction αν / *dacă* / if, the weak (clitic) personal pronoun, and the copula είμαι. The passive participle is an adjective derived from a verb (6.5). Strong pronouns appear only as the dropped or required subject pronoun beside verbs, and as the stand-alone ("on its own") use of a quantifier.
- Verb tenses and moods: indicative present, imperfect, aorist (simple past), future (continuous and simple), present perfect, past perfect and future perfect; subjunctive present, aorist and perfect (να + verb); imperative present and aorist (second person only), with its negative and with object clitics; conditional (θα + imperfect, aorist or pluperfect). Voices: active and mediopassive (reflexive and deponent examples). Detail in sections 6.4 and 6.5.
- Languages: Greek (focus), Romanian and English (comparison). The interface language is English.

### Out of scope

- Accounts, progress tracking, spaced repetition, quizzes.
- Audio or pronunciation.
- Runtime AI or any network call.
- Importing a dataset such as Wiktionary.
- Polytonic Greek and dialects.
- The gerund (τρώγοντας), clitic doubling (το είδα τον Γιάννη), and clitics in general beyond the examples in 6.5 (the imperatives, the negative imperative and the subjunctive). These are later work; the engine (4.3) is designed so they can be added as data.
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

## 4. Architecture

The Greek forms come from a hybrid model: stored stems plus shared ending tables, with explicit overrides for irregular cells. The UI can then show every Greek form split into stem and ending and highlight the part that changed, which is the main teaching device.

### 4.1 Layout of the code

```
src/
  data/
    paradigms/        # ending tables per class (greek.ts, verbs.ts, nouns.ts, ...)
    lexemes/          # verbs.ts, nouns.ts, adjectives.ts, function-words.ts
    phrases/          # one file per phrase
    divergences.ts    # comparison notes
    form-groups.ts    # groups of equivalent forms (with noun / with clitic / short form)
  engine/
    slots.ts          # slot dimensions per part of speech
    inflect.ts        # (lexeme, slot) -> Form
    agree.ts          # builds noun phrases: article + numeral + adjective + noun
    romanian.ts       # Romanian forms and article-suffix splitting
    english.ts        # English forms
    clitics.ts        # clitic placement, stress addition and verb shortening
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
type Mood = 'indicative' | 'subjunctive' | 'imperative' | 'conditional';
// Conditional: θα + a past indicative; its tense is the tense of that form
// ('imperfect', 'aorist' or 'pluperfect').
// Indicative: present, imperfect, aorist, future, futureSimple, perfect, pluperfect, futurePerfect.
// Subjunctive: present, aorist, perfect (να έχω φάει).
// Imperative: present, aorist; second person only (singular and plural).
// 'future' is continuous (θα + present); 'futureSimple' is θα + the aorist-subjunctive form.
type Tense = 'present' | 'imperfect' | 'aorist' | 'future' | 'futureSimple'
           | 'perfect' | 'pluperfect' | 'futurePerfect';
type Voice = 'active' | 'mediopassive';

// A form split for display. `ending` is highlighted in the UI. `prefix` holds particles
// and auxiliaries that come before the verb, in order (θα έχω φάει, να μην φάω).
interface Affix { text: string; role: 'particle' | 'auxiliary' | 'negation' }
interface Form { prefix?: Affix[]; stem: string; ending: string; irregular?: IrregularNote; reading: Reading }

// "How to read this": the parts of a form and what each one says (5.5).
interface Reading { parts: ReadingPart[]; beginner: string; improver: string }
interface ReadingPart { text: string; role: 'particle' | 'auxiliary' | 'negation' | 'clitic' | 'stem' | 'ending' | 'article'; gloss: string }
interface IrregularNote { rule: string; plain: string }   // e.g. "stress-shift"

// Slot: the attribute combination a form fills. Dimensions depend on part of speech.
type Slot =
  | { pos: 'verb'; person: Person; number: Num; mood: Mood; tense: Tense; voice: Voice }
  | { pos: 'noun'; number: Num; case: Case }
  | { pos: 'adjective'; gender: Gender; number: Num; case: Case }
  | { pos: 'article'; gender: Gender; number: Num; case: Case }
  | { pos: 'numeral'; value: 1 | 2 | 3 | 4 | 5; gender: Gender; case: Case }
  | { pos: 'quantifier'; gender: Gender; number: Num; case: Case; degree: 'plain' | 'comparative' }
  | { pos: 'clitic'; person: Person; number: Num; gender?: Gender; role: 'object' | 'indirect' };
// The passive participle is an 'adjective' lexeme with `derivedFrom: VerbId`.
```

A quantifier lexeme may also carry a `sense` (for example μερικοί maps to Romanian *niște* or *câțiva*) and a `use` flag (`determiner` or `pronoun`) because Romanian changes form between the two (*vreun* → *vreunul*) while Greek does not. A paradigm class may restrict a lexeme to one number (μερικοί is plural only; κάποιος and κανένας are singular only in the prototype).

### 4.3 Lexemes and paradigm classes

A **paradigm class** is a shared ending table with slot dimensions, for example "-ω verbs", "contracted -άω verbs", "mediopassive -ομαι verbs", "masculine -ος nouns", "feminine -α nouns", "adjective -ος/-η/-ο (stem-stressed)" and "adjective -ός/-ή/-ό (ending-stressed)".

**Compound forms** (the perfects, the future, the subjunctive) are built, not stored. The engine assembles them from three parts: an optional particle (θα, να), an optional auxiliary (έχω, είχα, inflected by the same engine for the same person and number), and a base form of the main verb. Perfect tenses use one invariable base form (the aorist stem plus -ει, or -θεί for the mediopassive: φάει, πηδήξει, πλυθεί), so the auxiliary carries the person. The subjunctive and the simple future use the aorist-subjunctive forms of the verb; the continuous future and the present subjunctive use the present forms. Negation is a prefix (δεν for the indicative, μην after να). The perfect subjunctive is να + the present forms of έχω + the base form (να έχω φάει). The negative imperative is not built from the imperative: it is μην + the subjunctive form of the second person (μην φας), so the builder delegates to the subjunctive. The imperfect is a simple form with an augment (ε- or η-) that is lost when the stress moves in the first and second person plural (ήθελα, but θέλαμε); like the aorist, it uses an imperfect stem and per-cell overrides for the plural. Impersonal verbs (μπορεί, πρέπει) are lexemes with a single third-person slot.

The **conditional** is θα + the indicative form of the chosen past tense; the builder reuses the imperfect, aorist and pluperfect builders. The **passive participle** is a derived adjective: the verb lexeme stores a participle stem as a further principal part (πλένω: πλυ-; ψήνω: ψη-), and the derived lexeme joins it to the stem-stressed adjective class (-μένος, -μένη, -μένο). Participles are not conjugated: they decline like any adjective and link back to their verb.

The **clitic engine** (`clitics.ts`) handles imperatives with weak pronouns. It takes the verb form, the clitic or clitics and the mood, and returns a placed form:

- **Placement.** Affirmative imperative: clitics follow the verb (φάε το). Negative imperative: the subjunctive is used, and the clitics precede the verb (μην το φας).
- **Order.** With two clitics, the genitive (indirect) comes before the accusative (direct): δώσε μου το. English and Romanian orders are stored per example.
- **Stress.** Stress may not go back past the third-last syllable of the verb plus its clitics. When it would, the verb keeps its accent and gains a second accent on its last syllable (τηλεφώνησέ μου).
- **Shortening.** Some verbs shorten before a clitic and have a second, equal form (φάε το ~ φάτο; δώσε μου το ~ δως μου το). The shortening table is data, not a rule. Forms that mean the same are stored as members of one **form group** (4.6). Verbs with irregular perfective stems store them as further principal parts. τρώω has a present stem τρώ-, an indicative-aorist stem φαγ- (έφαγα), and a second perfective stem φα- used by the subjunctive, the imperative and the perfect base form (φάω, φάε, φάει). πάω works the same way (πήγ- in the aorist indicative, πα- in the subjunctive).

A **Greek lexeme** stores the lemma, the paradigm class, one stem (or several principal parts, such as present stem and aorist stem), and optional per-slot overrides for irregular cells. `inflect(lexeme, slot)` returns a `Form`. Where a cell has an override, the override wins and the `Form` carries an `IrregularNote`.

**Romanian and English forms are stored per slot, not generated.** These forms are the comparison content and are few, so explicit data is more reliable than rules. Exception: Romanian nouns store stem and article suffix separately (`câine` + `le`) so that the definite form can be split for highlighting. Romanian lexemes carry their own gender, which may differ from the Greek gender (καφές is masculine, *cafea* is feminine).

Each Greek lexeme links to its Romanian and English counterparts through a `gloss` record: `{ ro: LexemeRef, en: LexemeRef }`.

### 4.4 Phrases and tokens

```ts
interface Phrase {
  id: string; title: string; level: 'beginner' | 'improver';
  tokens: Token[];                 // Greek, in order
  glosses: Gloss[];                // see 4.5
}
interface Token { text: string; lexeme: LexemeId; slot: Slot; agreesWith?: TokenIndex }
```

A token is one clickable Greek unit. A multi-word unit such as πάνω από is one token. `agreesWith` links an article or adjective to its noun so the engine can rebuild noun phrases when the learner changes an attribute.

### 4.5 Glosses (natural and literal, together)

Each phrase has, per comparison language (English, Romanian), two stacked rows: **natural** and **literal**. Both are always shown; there is no toggle. The literal row is for understanding Greek structure and may read oddly.

Rules for the literal row:

- Show words Greek omits as dashed placeholders in brackets: "(I)", "(Eu)", "(she) jumps".
- Mark grammatical roles with bracketed tags: "the-[acc]", "quick-[f]", "brown-[indecl.]".
- Keep the Greek word order, even when that is not the natural order in the target language.

A gloss row is a list of **gloss units**. A unit has either a single link to a Greek token index or a list of **segments**, each linked to its own token. Segments handle suffix articles in Romanian:

```ts
type GlossUnit =
  | { text: string; link: TokenIndex | null }                // null = no Greek counterpart (dashed)
  | { segments: { text: string; link: TokenIndex }[] };      // câine|le -> [σκύλο, τον]
```

Clicking a Greek token highlights every linked unit or segment in all gloss rows. Clicking any gloss unit or segment selects its linked Greek token. In the fox sentence, selecting τον highlights only `le` in *câinele*; selecting σκύλο highlights only `câine`. Romanian segments are generated from the stem and suffix data where possible (4.3).

### 4.6 Form groups (forms that mean the same)

Some different-looking forms express the same command. A **form group** collects them so the UI presents them together:

```ts
interface FormGroup {
  id: string;
  meaning: string;                 // plain-language: "Eat the bread!"
  members: GroupMember[];
}
interface GroupMember {
  kind: 'with-noun' | 'with-clitic' | 'short-form';
  el: string; ro: string; en: string;   // the member in each language
  note?: string;                        // e.g. "the clitic moves before the verb"
}
```

Membership rules:

- **with-noun:** the object is spelled out (Φάε το ψωμί!).
- **with-clitic:** a clitic replaces the noun (Φάε το!). It means the same only when the object is known from context.
- **short-form:** a shortened but equal form (Φάτο!, Δως μου το!).
- A bare verb with an implied object (Φάε!) is **not** a member: the meaning is narrower. It appears in the panel as a separate, labelled row.

Groups are authored as data (`form-groups.ts`) and checked by the validator (7): every member must be a form the engine can produce, and every group needs at least two members. A group can span phrases (the noun version in one phrase, the clitic version in another).

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

Rows are grammatical points, columns are Greek, Romanian, English. Each row has a type tag: `same`, `differs` or `absent`, plus a short explanation. Beginner shows core rows; Improver shows all. Rows come from `divergences.ts` and are attached to a part of speech or a specific lexeme.

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
| politeness | Greek present Θέλω vs Romanian conditional aș vrea vs English "I'd like". |
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
| subjunctive-negation | Greek δεν … να μην, Romanian *să nu*, English "not to". |
| imperfect-vs-aorist | Greek separates the aorist (έφαγα) from the imperfect (έτρωγα). Romanian *imperfectul* (*mâncam*) matches the Greek imperfect, while its compound perfect (*am mâncat*) covers the aorist and the perfect. English uses the simple past for the aorist and for much of the imperfect; "was eating" and "used to eat" mark the imperfect. |
| polite-imperfect | The Greek imperfect softens a request: Ήθελα έναν καφέ = "I'd like a coffee". Romanian uses the conditional (*aș vrea*); English "I'd like" is also conditional. |
| imperative-aspect | Greek chooses between the aorist imperative (φάε, "eat up") and the present imperative (τρώε, "keep eating"). Romanian and English have one form (*mănâncă*, "eat"). |
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
| clitic-order | Two clitics: Greek genitive then accusative (δώσε μου το), Romanian dative then accusative (*dă-mi-l*), English "give it to me". |
| clitic-stress | Greek adds a second accent when clitics push the stress too far back (τηλεφώνησέ μου). Romanian hyphenates and English does nothing. |

### 5.3 Panels per part of speech

| Part of speech | Controls | Current-form rows | Full table (Improver) |
|---|---|---|---|
| Verb | Who (person + number), Mood (indicative / subjunctive / imperative / conditional), When (tense; each mood offers only its own tenses; the imperative offers only "you" singular and plural), Voice (when the lexeme has a mediopassive), Negated (yes / no), Object for imperatives (none / a noun / clitic or clitics) | One row, with subject pronouns in each language; compound forms show particle and auxiliary in their own colours | Six persons for the selected mood, tense and voice; plus a **tense overview** for the selected person (every tense, the three subjunctives, the two imperatives and the three conditionals in three columns; rows with no form for that person, such as the imperative for "I", are shown dimmed with the reason) |
| Noun | How many (1 to 5, or "many"), Role | "the", then "a / an" for one, or "with a number" for 2 to 5 | Case × number, with definite and indefinite forms in each cell |
| Definite article | Noun it goes with, number, role | Article + noun | Gender × case for the selected number; Romanian suffix and English "the" in the other columns |
| Numeral / indefinite article | Number (1 to 5), noun it counts, role | The numeral; then the counted noun phrase | Gender × case |
| Adjective | Noun it describes, number, role | "the" and "a / an" noun phrases (singular); "none in plural" for the second | Gender × case for the selected number |
| Preposition | Noun after it, number | Preposition + noun in the accusative | Other prepositions with the same noun |
| Quantifier | Noun it goes with, role; plus Romanian counterpart (μερικοί), kind of noun (mass or count) and degree (πολύς, λίγος) | "with a noun", then "on its own"; for κανένας also "with negation" | Gender × role for the selected number, in each language |
| Negation particle | none | One row: negated verb in each language | none |
| Clitic pronoun | Person + number, gender (3rd person), role (object / indirect object) | The weak form in each language (με / *mă* / me), plus the strong Greek form (εμένα) as a note | Person × number for the selected role, in each language |
| Conjunction (αν) | none | One row: *if* clause in each language (Greek αν + imperfect, Romanian *dacă* + conditional, English if + past) | none |
| Passive participle (derived adjective) | Noun it describes, number, role (as for adjectives) | As for adjectives, plus a "Derived from" line (πλένω → πλυ- + -μένος) with a link to the verb | Gender × role, as for adjectives |
| Copula (είμαι) | Who (person + number) | One row, with subject pronouns | Six persons |

Nouns have no plural indefinite article. In the plural the panel shows the quantifier "some" (μερικοί καφέδες / niște cafele / some coffees) and, for counts of 2 to 5, the counted form ("with a number": τρεις καφέδες / trei cafele / three coffees). The empty article slot is labelled, not hidden. Clicking the quantifier in a phrase opens the quantifier panel.

Quantifier panel details:

- Rows "with a noun" and "on its own" are always shown. "On its own" uses the pronoun form where Romanian differs.
- A badge marks the mass or count reading for πολύς and λίγος. The "kind of noun" control switches the number; the degree control switches to the comparative (περισσότερος, λιγότερος).
- Romanian cells whose form is not yet reviewed show "not yet added" instead of a guess. The genitive of several Romanian quantifiers is in this state (section 9).
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

- **Generated** from the form's structure (`reading.parts`): particle, auxiliary, negation, clitic, stem, ending, article. The engine fills `gloss` for each part from the lexeme, the slot and a shared glossary of endings ("-εις = you (singular), present"). Regular forms need no authoring.
- **Authored** for irregular forms (stem changes, shortening, stress shifts, suppletion). The irregular note's `rule` selects a template, and an author supplies the lexeme-specific words.
- **Per column.** Greek always has a line. Romanian and English get one when the form has more than one word or a part worth explaining (*aș fi mâncat*: "aș = would, fi = be, mâncat = eaten, never changes").

**Levels.** Beginner gets plain language and no grammar terms. Improver gets the technical description and points out the Romanian or English parallel where there is one. Both are stored (`beginner`, `improver`); the level toggle picks one.

**Highlighting.** The parts in the line use the same colours as the form (blue for articles, auxiliaries and pronouns, amber for endings), and hovering or focusing a part highlights it in the form above.

**Examples**

| Form | Beginner | Improver |
|---|---|---|
| Φάε! | "Eat! (eat up, once). φα- is 'eat', -ε is a command to one person." | "Aorist imperative, 2nd singular: perfective stem φα- + -ε. The present imperative is τρώε (stem τρώ-)." |
| Φάτο! | "Eat it! A short way of saying φάε το: the command and 'it' are joined." | "Aorist imperative φάε + clitic το, with the final -ε dropped: φά(ε) + το. The shortened form is lexical." |
| Μην φας! | "Don't eat! To forbid something, Greek uses μην + the form for 'you eat', not the command form." | "Negative imperative: μην + aorist subjunctive, 2nd singular (φας). The subjunctive replaces the imperative." |
| Δως μου το! | "Give it to me! δως is a short form of δώσε. μου = to me, το = it. 'To me' comes before 'it'." | "Shortened aorist imperative δως + genitive clitic μου + accusative clitic το (genitive before accusative)." |
| Θα έχω φάει | "I will have eaten: θα = will, έχω = I have, φάει = eaten (this part never changes)." | "θα + έχω (present 1sg of έχω) + invariable perfect base form φά-ει (stem φα- + -ει)." |
| Έτρωγα | "I used to eat: έ- = in the past, τρωγ- = eat, -α = I." | "Imperfect 1sg: augment έ- + imperfect stem τρωγ- + -α. In the 1st plural the augment goes: τρώγαμε." |
| Ήθελα | "I wanted / I would like: η- = in the past, θελ- = want, -α = I." | "Imperfect 1sg of θέλω: augment η- (from ε- + θ-, a syllabic augment) + stem θελ- + -α." |
| Πλυμένο | "washed (describing something): πλυ- = wash, -μένο = a describing word that matches το παιδί (neuter, one)." | "Passive participle: participle stem πλυ- + -μένος declined in the neuter nominative singular." |
| *aș fi mâncat* (Romanian column) | "aș = would, fi = be, mâncat = eaten (does not change)." | "Past conditional: *aș fi* + invariable participle; compare Greek θα είχα φάει." |

Rules: the line never repeats the plain-language line from 5.1; where a rule has a Romanian or English parallel, the Improver text names it; a line is at most two sentences.

## 6. Content

### 6.1 Phrase set (initial)

| # | Greek | Natural English | Features exercised |
|---|---|---|---|
| 1 | Θέλω έναν ζεστό καφέ | I'd like a hot coffee | present verb, dropped subject, indefinite article/numeral, adjective agreement, noun case, Romanian adjective position |
| 2 | Θέλω τρεις καφέδες | I'd like three coffees | numeral with gender and case, plural noun |
| 3 | Η γρήγορη καφέ αλεπού πηδάει πάνω από τον τεμπέλικο σκύλο | The quick brown fox jumps over the lazy dog | definite article, two adjective classes, indeclinable adjective (καφέ), contracted verb class, multi-word preposition, accusative after a preposition, Romanian suffix articles |
| 4 | Πλένομαι | I wash (myself) | mediopassive as reflexive |
| 5 | Πλένω το παιδί | I wash the child | active voice, for contrast with phrase 4 |
| 6 | Κοιμάμαι | I sleep | deponent mediopassive (passive form, not reflexive) |
| 7 | Θέλω λίγο νερό | I'd like a little water | mass quantifier (λίγος), neuter in Greek vs feminine in Romanian (puțină apă) |
| 8 | Θέλω μερικούς καφέδες | I'd like some coffees | plural indefinite (μερικοί / *niște*), plural noun |
| 9 | Δεν θέλω κανέναν καφέ | I don't want any coffee | negation particle, negative concord, κανένας / *niciun* / *nicio*, masculine vs feminine noun |
| 10 | Θέλω περισσότερο νερό | I'd like more water | comparative (περισσότερος / *mai multă* / more) |
| 11 | Έχω φάει | I have eaten | present perfect, irregular perfective stem (τρώω → φάγ-) |
| 12 | Είχα φάει | I had eaten | past perfect; Romanian one-word *mâncasem* |
| 13 | Θα έχω φάει | I will have eaten | future perfect (particle + auxiliary + base form) |
| 14 | Θέλω να φάω | I want to eat | aorist subjunctive after θέλω; no infinitive in Greek |
| 15 | Θέλω να τρώω | I want to eat (regularly) | present subjunctive; aspect contrast with phrase 14 |
| 16 | Δεν θέλω να πάω | I don't want to go | negation with subjunctive, irregular πάω / πήγ- |
| 17 | Η αλεπού έχει πηδήξει πάνω από τον σκύλο | The fox has jumped over the dog | perfect in the 3rd person, reusing the fox sentence's vocabulary |
| 18 | Έχω πλυθεί | I have washed (myself) | mediopassive perfect (πλυθεί), reflexive meaning |
| 19 | Έφαγα το ψωμί | I ate the bread | aorist of an irregular verb (τρώω → έφαγα); definite article with a neuter noun (ψωμί) that is feminine in Romanian (*pâinea*); contrast with phrase 11 (aorist vs perfect) |
| 20 | Θα τρώω λιγότερο ψωμί | I will eat less bread | continuous future (θα + present form), comparative quantifier (λιγότερος), mass noun; contrast with the simple future θα φάω |
| 21 | Έτρωγα πολύ ψωμί | I used to eat a lot of bread | imperfect of an irregular verb (τρώω → έτρωγα); quantifier πολύς; Romanian imperfectul (*Mâncam multă pâine*); contrast with phrase 19 |
| 22 | Ήθελα έναν καφέ | I'd like a coffee | imperfect used for politeness; Romanian conditional *Aș vrea*; contrast with Θέλω έναν καφέ (phrase 1) |
| 23 | Η αλεπού πηδούσε πάνω από τον σκύλο | The fox was jumping over the dog | imperfect of a contracted verb (πηδάω → πηδούσε), 3rd person; reuses the fox vocabulary |
| 24 | Φάε το ψωμί! | Eat the bread! | aorist imperative (perfective), 2nd person singular |
| 25 | Μην φας το ψωμί! | Don't eat the bread! | negative imperative built from the subjunctive; Romanian *Nu mânca pâinea!* |
| 26 | Πλύνε το παιδί! | Wash the child! | aorist imperative of a regular verb (πλύνε, plural πλύνετε); reuses phrase 5's vocabulary |
| 27 | Τρώε το ψωμί! | Keep eating the bread! | present imperative (imperfective); aspect contrast with phrase 24 |
| 28 | Μπορεί να έχει φάει | He / she may have eaten | perfect subjunctive after an impersonal modal (μπορεί); Romanian *Poate să fi mâncat* |
| 29 | Θα ήθελα έναν καφέ | I would like a coffee | conditional (θα + imperfect); compare phrases 1 and 22; Romanian *Aș vrea o cafea* |
| 30 | Αν είχα ψωμί, θα έτρωγα | If I had bread, I would eat | conjunction αν; imperfect in the if-clause, conditional in the result; Romanian *Dacă aș avea pâine, aș mânca* |
| 31 | Θα είχα φάει το ψωμί | I would have eaten the bread | past conditional (θα + pluperfect); Romanian *Aș fi mâncat pâinea* |
| 32 | Το παιδί είναι πλυμένο | The child is washed | passive participle, copula είμαι; Romanian *Copilul este spălat* |
| 33 | Το ψωμί είναι ψημένο | The bread is baked | participle agreement: neuter ψημένο, Romanian feminine *coaptă* (*Pâinea este coaptă*) |
| 34 | Φάε το! / Φάτο! | Eat it! | clitic imperative and its short form; same-meaning group with phrase 24 |
| 35 | Πλύνε το! | Wash him / her / it! | clitic imperative of a regular verb; group with phrase 26; Romanian *Spală-l!* |
| 36 | Δώσε μου το! / Δως μου το! | Give it to me! | two clitics (genitive before accusative) and a short form; group with "Give me the bread!"; Romanian *Dă-mi-o!* |
| 37 | Μην το φας! | Don't eat it! | negative imperative with the clitic before the verb; group with phrase 25; Romanian *Nu o mânca!* |
| 38 | Φάε! | Eat! | bare aorist imperative with no object, the "close, not the same" row of the "Eat the bread!" group; Romanian *Mănâncă!*; contrast with phrase 27 (Τρώε!, "keep eating") |

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

Scope limits for the prototype: κάποιος and κανένας are singular only; the Romanian genitive is given only where the form is known (*unor, câtorva, multor, vreunui / vreunei, niciunui / niciunei*); stand-alone genitive pronouns are not covered.

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
| Imperative, present (2sg / 2pl) | present imperative | τρώε / τρώτε | *mănâncă* / *mâncați* | keep eating! |
| Negative imperative (2sg / 2pl) | μην + subjunctive | μην φας / μην φάτε | *nu mânca* / *nu mâncați* | don't eat! |

What this teaches, in plain terms:

- Greek splits "what happened" (έφαγα) from "what I have done" (έχω φάει). Romanian has one tense for both (*am mâncat*), so the panel shows the same Romanian cell next to two different Greek rows and says why.
- The Greek perfect never agrees: only the auxiliary έχω changes with the person. The same shape appears in Romanian (*a avea* + participle) and English (have + participle).
- Greek has two kinds of subjunctive stem. The present stem says "regularly" or "in general" (να τρώω); the aorist stem says "once" (να φάω). Romanian and English use one form for both, so the Romanian and English cells repeat. This is the main aspect lesson.
- Greek has no infinitive: «Θέλω να φάω» is literally "I want that I eat". Romanian has the same structure (*vreau să mănânc*); English uses "to eat".
- The simple future (θα φάω) and the subjunctive (να φάω) share a form; the continuous future (θα τρώω) shares the present form.
- The Greek imperfect is the closest match to the Romanian *imperfectul*. English needs "was eating" or "used to eat". The Greek imperfect also softens requests (Ήθελα έναν καφέ), the way Romanian and English use the conditional.
- Aspect shows up again in the imperative: φάε ("eat up", once) against τρώε ("keep eating").
- The negative imperative is not the imperative with a negation word: Greek switches to the subjunctive (μην φας), Romanian switches to the infinitive in the singular (*nu mânca*), and English adds "don't".
- The perfect subjunctive (να έχει φάει) reaches back with doubt or hope ("may have eaten"). Romanian uses *să fi mâncat*; English uses a modal.

New verbs and irregularities:

- τρώω (eat): two perfective stems. φαγ- gives the aorist indicative (έφαγα, έφαγες, έφαγε, φάγαμε, φάγατε, έφαγαν); φα- gives the base form φάει, the aorist subjunctive (φάω, φας, φάει, φάμε, φάτε, φάνε) and the aorist imperative (φάε, φάτε).
- πάω (go): perfective stem πήγ- in the aorist (πήγα); aorist subjunctive πάω, πας, πάει, πάμε, πάτε, πάνε; base form πάει.
- πηδάω: base form πηδήξει (phrase 17).
- πλένομαι: base form πλυθεί (phrase 18).
- Imperfects: τρώω → έτρωγα, έτρωγες, έτρωγε, τρώγαμε, τρώγατε, έτρωγαν; θέλω → ήθελα, ήθελες, ήθελε, θέλαμε, θέλατε, ήθελαν; πηδάω → πηδούσα, πηδούσες, πηδούσε, πηδούσαμε, πηδούσατε, πηδούσαν. Romanian: *mâncam, mâncai, mânca, mâncam, mâncați, mâncau*; *voiam*; *săream*.
- Imperatives: τρώω → aorist φάε, φάτε; present τρώε, τρώτε. πλένω → aorist πλύνε, πλύνετε; present πλένε, πλένετε. Negative: μην φας, μην φάτε (aorist); μην τρως, μην τρώτε (present).
- Impersonal μπορεί ("it is possible; may"): a single third-person slot; Romanian *poate*, English "may".
- ψωμί (bread): neuter noun, plural ψωμιά; Romanian *pâine* (feminine; *pâinea*, *pâini*), English bread (mass).
- Romanian counterparts: *a mânca*, *a merge*, *a sări*, *a se spăla*. English: eat, go, jump, wash.
- Phrase 19 glosses: natural "I ate the bread" / *Am mâncat pâinea*; literal "(I) ate the-[acc] bread" / *(Eu) am mâncat pâinea*. Phrase 20: natural "I will eat less bread" / *Voi mânca mai puțină pâine*; literal "(I) will eat less bread" / *(Eu) voi mânca mai puțină pâine*. Both are marked for content review.

The verb panel's **tense overview** lists the selected person across all of these, in three columns, with the form in use highlighted. It is the main place a learner sees the whole system at once.

### 6.5 Conditional, passive participle and clitic imperatives

**Conditional.** Greek has no separate conditional forms: it is the particle θα with a past indicative.

| Conditional | Greek construction | Example | Romanian | English |
|---|---|---|---|---|
| Ongoing / polite | θα + imperfect | θα έτρωγα; θα ήθελα | *aș mânca*; *aș vrea* | I would eat; I would like |
| Perfective | θα + aorist | θα έφαγα | *aș fi mâncat* | I would have eaten |
| Past | θα + pluperfect | θα είχα φάει | *aș fi mâncat* | I would have eaten |

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
| Give me the bread! | Δώσε μου το ψωμί! / *Dă-mi pâinea!* / Give me the bread! | Δώσε μου το! / *Dă-mi-o!* / Give it to me! | Δως μου το! |
| Don't eat the bread! | Μην φας το ψωμί! / *Nu mânca pâinea!* / Don't eat the bread! | Μην το φας! / *Nu o mânca!* / Don't eat it! | none |

Each group also lists a **close, not the same** row, the verb with no object: for the first group, Φάε! / *Mănâncă!* / Eat! The meaning is narrower, because it does not say what to eat, so it is not a member of the group. It is shown beneath the strip with one line saying what is missing ("no object: what to eat is not said") and it is the phrase-38 example. The same aspect point applies to it: Φάε! means "eat up", Τρώε! means "keep eating".

Notes: in the first group the Greek clitic is neuter (το) and the Romanian is feminine (*o*). In the third group two clitics appear, in the order genitive then accusative. In the fourth group the clitic moves to the front of the verb. Verbs used: φάω / τρώω, πλένω, δίνω (aorist imperative δώσε / δώστε, short form δως; present imperative δίνε). Shortening is stored per verb, not generated.

The past forms these examples use (είχα, ήθελα, έτρωγα) come from the paradigms in 6.4.

### 6.6 Forms

All Greek forms are monotonic. The paradigms for phrases 1 to 3 come from the data in the v4 and v5 brainstorming mockups, those for phrases 7 to 10 from the quantifier panel mockup; the voice paradigms for phrases 4 to 6 are new. All are written into `data/` as unverified, then checked (section 9).

## 7. Validation and errors

A build-time script (`npm run validate`) fails the build when:

- a token refers to a missing lexeme or an invalid slot;
- a slot has no Greek form, no Romanian form or no English form;
- an override refers to a slot that does not exist;
- a gloss link points at a token index outside the phrase;
- a paradigm class lacks an ending for a slot dimension its lexemes use;
- a divergence note refers to a missing lexeme or part of speech.

The script also fails the build when an irregular form has no authored reading, or a compound form's generated reading has a part with no gloss.

The script also prints a report (not a failure) of Romanian cells marked "not yet added" and of entries not yet `verified`.

At runtime the UI must never throw on a missing cell: it shows "no form" in the cell and logs the slot. Because data is validated at build time, this is a safety net.

## 8. Testing

- **Unit (Vitest):** `inflect` for every paradigm class (regular cells) and each override (irregular cells); the compound-form builder for each tense and mood (particle, auxiliary and base form in order, including negation); `agree` for noun-phrase assembly; Romanian suffix splitting; segment generation for glosses. These tests use the verified forms from section 9 as fixtures.
- **Data validation:** the script from section 7 runs in CI and as a test.
- **Readings:** unit tests generate the reading for a regular form, an irregular form, a compound form and a clitic form, and check the parts, the glosses and that Beginner text contains no grammar terms from a fixed list.
- **Component (Testing Library):** click a Greek token and see its panel; vary an attribute and see the form change; click a gloss segment and select the right Greek token (the `le` / `câine` case from the fox sentence); toggle Beginner / Improver and see the full table appear and disappear.
- **Visual check:** a manual pass at phone width and desktop width, in light and dark colour schemes.
- **Accessibility:** word chips and gloss units are real buttons reachable by keyboard; colour is never the only signal (the dashed border marks optional words and labels carry text); Greek renders with a font that has full Greek and Romanian diacritic coverage.

## 9. Content review (required before release)

The Greek, Romanian and English forms were written from memory during brainstorming and have not been checked against an authoritative source. Before any phrase ships, the user (or a Greek speaker they trust) reviews, at least:

- the aorist πήδηξα and the stress shift to πηδήξαμε (πήδησα is a common alternative);
- the Greek rendering of the fox sentence, including the choice of τεμπέλικος and the indeclinable καφέ before the noun;
- the adjective plurals (ζεστοί, ζεστούς, ζεστές, ζεστά) and the stem-stressed class (γρήγοροι);
- the genitive plural μπυρών and the plural αλεπούδες;
- the numeral forms (τρεις/τρία/τριών, τέσσερις/τέσσερα/τεσσάρων);
- the mediopassive and deponent paradigms (πλένομαι, κοιμάμαι) and their aorists (πλύθηκα, κοιμήθηκα);
- the "how to read this" texts (5.5): every authored reading, both levels, since they are the part a learner reads most closely;
- the conditional, participle and clitic material in 6.5: θα έφαγα as a rendering of "would have eaten" (and how it differs from θα είχα φάει), the participles πλυμένος and ψημένος, the Romanian participles and conditionals, the shortened forms (φάτο, δως μου το), the accent rule for clitics, and every clitic form in the tables;
- phrases 21 to 28: the imperfect paradigms and the stress and augment rules (ήθελα / θέλαμε, έτρωγα / τρώγαμε, πηδούσα), the use of Ήθελα as a polite request, the imperatives (φάε, τρώε, πλύνε and their plurals), the negative imperatives (μην φας …), μπορεί να έχει φάει, and the Romanian counterparts (*Mâncam multă pâine*, *Mănâncă pâinea!*, *Nu mânca pâinea!*, *Spală copilul!*, *Poate să fi mâncat*);
- phrases 19 and 20: the Greek wording (including whether «Θα τρώω λιγότερο ψωμί» sounds natural), the noun ψωμί and its plural, the aorist paradigm of τρώω (έφαγα … έφαγαν), and Romanian *Voi mânca mai puțină pâine*;
- the perfect and subjunctive: the base forms (φάει, πάει, πηδήξει, πλυθεί), the full aorist-subjunctive paradigms of τρώω and πάω (φάω … φάνε, πάω … πάνε), the present subjunctive of τρώω, the simple future, and the negated subjunctive (να μην);
- Romanian perfect and subjunctive: *mâncasem* (and the rest of the pluperfect paradigm), *voi fi mâncat*, the subjunctive of *a mânca*, *a merge* and *a sări*, and the reflexive perfect *m-am spălat*;
- the quantifiers: κάποιον (with the final ν), the πολύς forms (πολύ in the accusative singular masculine, πολλοί, πολλών), whether μερικοί is the right counterpart of *câțiva* and *niște*, the use of κάποιος for *vreun / vreo*, and the comparative forms περισσότερος and λιγότερος;
- Romanian quantifiers: *câteva* and *câtorva*, *multor*, *vreunui / vreunei*, *niciunui / niciunei*, the choice of *niciun* vs *nicio* in phrase 9, and the missing genitives (*mult, multă, puțin, puțină* and the stand-alone pronouns) that are currently marked "not yet added";
- Romanian: the sentence *Vulpea rapidă și maro sare peste câinele leneș*, the adjective forms (*calzi, rapizi, leneși*, feminine genitive *calde*), the numerals, the reflexive forms, and the perfect and future forms of *a vrea* and *a sări*.

Reviewed forms are marked `verified: true` in the data. The app does not show an unverified flag to learners; the build report lists unverified entries.

## 10. Risks

- **Content accuracy.** The main risk. Mitigated by the review in section 9 and fixture-based tests.
- **Overloading beginners.** Mitigated by the level toggle and by showing the full table only in Improver mode. Revisit after trying the prototype.
- **Model fit for irregulars.** The hybrid model handles overrides per cell. If many irregular verbs appear, a second pass may need whole-row overrides; not needed for the prototype set.
- **Clitic rules are intricate.** Placement, stress and shortening interact, and the shortened forms are lexical, not regular. Mitigated by storing shortenings as data, limiting the prototype to the verbs in 6.5, and having a Greek speaker review every group.
- **Form groups can over-promise.** "Same meaning" holds only when the object is known from context. Groups exclude the bare verb, and the strip labels what each member assumes. Revisit the wording after trying it.
- **Verb panel density.** Mood, tense, voice, person and negation make five controls, three moods and thirteen tense and mood combinations, and the tense overview adds a table. Beginner mode shows plain labels and hides the overview; check with the prototype that it does not overwhelm.
- **Aspect is easy to get wrong.** The present and aorist subjunctives are subtle, and Romanian and English give no help. Examples 14 and 15 are the teaching pair, and the text has to be reviewed by a Greek speaker (section 9).
- **Quantifier meanings overlap across languages.** Greek μερικοί covers two Romanian words, and κάποιος / κανένας cut "some / any / none" differently from English. The panel shows these as controls and notes, not as one-to-one translations. Revisit if learners find it confusing.
- **Romanian gaps.** Some Romanian genitive forms are not confirmed. The UI shows "not yet added" for them, and the validation script lists them, so the gaps stay visible and never turn into silent guesses.
- **Romanian gender in tables.** Romanian neuter behaves as masculine in the singular and feminine in the plural. The prototype phrases only use masculine and feminine Romanian nouns; neuter handling is deferred.

## 11. Definition of done for the prototype

1. All thirty-eight phrases render, with the correct token chips and four gloss rows each.
2. Every part of speech in the phrases has a working panel with controls, a current-form table and (Improver) a full table, in all three languages.
3. Clicking between Greek tokens and gloss units, including segments, works in both directions.
4. `npm run validate`, the unit tests and the component tests pass.
5. The content review in section 9 is complete and every shipped entry is verified.
6. The page works at phone width and in light and dark mode.
7. Every form group renders its members together, and the strip's highlighting, notes and Beginner / Improver differences work.

## 12. Sources consulted

- Order of two clitics and clitic placement with imperatives (genitive before accusative; pronouns after an affirmative imperative): [Clitics With the Imperative](https://elon.io/grammar/greek/verbs/imperative/imperative-with-weak-pronouns), [Modern Greek grammar](https://en.wikipedia.org/wiki/Modern_Greek_grammar).
- These support the structure of the clitic rules only. The forms themselves still need the review in section 9.
