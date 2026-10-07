import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { FORM_GROUPS } from '../data/form-groups';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import { READING_TEMPLATES } from '../data/readings';
import { REVIEW_ITEMS } from '../data/review';
import { reviewSheet } from './reviewSheet';
import { unverifiedRecords, type RecordSets } from './unverified';
import { pendingCells } from './validate';

const sets: RecordSets = {
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
};
const sheet = reviewSheet({ ...sets, pending: [...pendingCells(LEXEMES), 'polys Romanian plain determiner m sg gen'] });

describe('the Romanian forms with pronouns', () => {
  it('are printed after the pronoun table', () => {
    expect(sheet).toContain('Romanian forms with pronouns (generated)');
    for (const form of ['l-am mâncat', 'am mâncat-o', 'mi-o vei da', 'ni-o vei da']) expect(sheet).toContain(form);
  });
});

describe('the σε section', () => {
  it('prints the fused forms, the senses and no question-word pairs', () => {
    for (const text of ['masc. singular: στον', 'στους', 'στη θάλασσα', 'to a person', 'the dative case', 'dau pâinea copilului']) {
      expect(sheet).toContain(text);
    }
    expect(sheet).not.toContain('σε γιατί');
  });
});

describe('unverifiedRecords', () => {
  it('lists a language of a lexeme, a review item, a phrase, a note, a template and a group', () => {
    const records = unverifiedRecords(sets);
    expect(records).toContain('lexeme thelo (el)');
    expect(records).toContain('glossary:ending-glosses');
    expect(records).toContain('phrase eat-it');
    expect(records).toContain('divergence clitic-position');
    expect(records).toContain('reading clitic-stress');
    expect(records).toContain('group eat-the-bread');
  });
  it('skips what is verified', () => {
    const verified = { ...LEXEMES, thelo: { ...LEXEMES.thelo, verified: { el: true, ro: true, en: false } } };
    const records = unverifiedRecords({ ...sets, lexemes: verified });
    expect(records).not.toContain('lexeme thelo (el)');
    expect(records).toContain('lexeme thelo (en)');
  });
});

describe('the review sheet', () => {
  it('has one checklist line per unverified record', () => {
    const lines = sheet.match(/^- \[ \] /gm) ?? [];
    expect(lines).toHaveLength(unverifiedRecords(sets).length);
  });

  it('shows the pronoun tables a reviewer needs for clitic-table:ro-clitics', () => {
    expect(sheet).toContain('### το (clitic)');
    expect(sheet).toContain('- obj.3sg.m: free îl · attached -l · after nu nu-l');
    expect(sheet).toContain('- ind.1sg+obj.3sg.f: free mi-o · attached -mi-o · after nu nu mi-o · after să să mi-o · fused mi- · behind the participle -o');
    expect(sheet).toContain('- obj.3sg.m: free îl · attached -l · after nu nu-l · after să să-l · fused l- · behind the participle —');
    expect(sheet).toContain('- 3sg: him / her / it');
    expect(sheet).toContain('- 3sg: αυτόν / αυτήν / αυτό');
    const section = sheet.slice(sheet.indexOf('### το (clitic)')).split('\n### ')[0];
    expect(section).not.toContain('(stored)');
  });

  it('shows the commands with pronouns of a verb in the three languages', () => {
    expect(sheet).toContain('Română: dați-mi-o');
    expect(sheet).toContain('nu mi-o');
    expect(sheet).toContain('Ελληνικά: δώσε μού το');
    expect(sheet).toContain('Ελληνικά: δως μου το');
    expect(sheet).toContain('English: give it to me');
    expect(sheet).toContain('Ελληνικά: φάτο');
  });

  it('shows the forms of a verb in the three languages', () => {
    expect(sheet).toContain('### θέλω (thelo)');
    expect(sheet).toContain('Ελληνικά: θέλω · θέλεις · θέλει · θέλουμε · θέλετε · θέλουν');
    expect(sheet).toContain('Română: vreau · vrei · vrea · vrem · vreți · vor');
    expect(sheet).toContain('English: I want · you want · he/she wants · we want · you want · they want');
  });

  it('shows a noun, a phrase with its gloss rows, a note, a reading, a group and the pending cells', () => {
    expect(sheet).toContain('ζεστός');
    expect(sheet).toContain('### eat-it: Eat it!');
    expect(sheet).toContain('English natural: Eat it!');
    expect(sheet).toContain('Română natural: Mănâncă-o!');
    expect(sheet).toContain('- clitic-position');
    expect(sheet).toContain('clitic-stress');
    expect(sheet).toContain('### Eat the bread!');
    expect(sheet).toContain('φάε το ψωμί · mănâncă pâinea · eat the bread');
    expect(sheet).toContain('## Pending Romanian cells');
    expect(sheet).toContain('polys Romanian plain determiner m sg gen');
  });

  it('shows the possessive: the Romanian table and the noun phrases with every possessor', () => {
    expect(sheet).toContain('- 1sg: meu · mei · mea · mele');
    expect(sheet).toContain('- 3sg.f: ei');
    expect(sheet).toContain('το σπίτι μου · το σπίτι σου · το σπίτι του · το σπίτι της · το σπίτι μας · το σπίτι σας · το σπίτι τους');
    expect(sheet).toContain('η θάλασσά μου');
    expect(sheet).toContain('της θάλασσάς μου');
    expect(sheet).toContain('casei mele');
    expect(sheet).toContain('casa mea · casa ta · casa lui · casa ei · casa noastră · casa voastră · casa lor');
    expect(sheet).toContain('my house · your house · his house · her house · our house · your house · their house');
  });

  it('shows δικός: the Romanian words and the noun phrases with every possessor', () => {
    expect(sheet).toContain('- Romanian propriu with its article (nominative): masc. sg propriul · masc. pl propriii · fem. sg propria · fem. pl propriile');
    expect(sheet).toContain('- Romanian word before the possessive on its own: masc. sg al · masc. pl ai · fem. sg a · fem. pl ale');
    expect(sheet).toContain('το δικό μου σπίτι · το δικό σου σπίτι · το δικό του σπίτι · το δικό της σπίτι · το δικό μας σπίτι · το δικό σας σπίτι · το δικό τους σπίτι');
    expect(sheet).toContain('propria mea casă · propria ta casă · propria lui casă · propria ei casă · propria noastră casă · propria voastră casă · propria lor casă');
    expect(sheet).toContain('my own house · your own house · his own house · her own house · our own house · your own house · their own house');
    expect(sheet).toContain('a mea · a ta · a lui · a ei · a noastră · a voastră · a lor');
    expect(sheet).toContain('mine · yours · his · hers · ours · yours · theirs');
  });

  it('shows every noun owned by every noun', () => {
    expect(sheet).toContain('## Noun possessors (generated)');
    expect(sheet).toContain('το σπίτι του παιδιού');
    expect(sheet).toContain('casa copilului');
    expect(sheet).toContain("the child's house");
    expect(sheet).toContain('ο σκύλος της θάλασσας');
  });

  it('shows the demonstratives with every noun, in both Romanian registers', () => {
    expect(sheet).toContain('αυτό το σπίτι · această casă / casa aceasta · this house');
    expect(sheet).toContain('αυτού του σπιτιού · acestei case / casei acesteia · of this house');
    expect(sheet).toContain('αυτό το σπίτι · casa asta · this house');
    expect(sheet).toContain('εκείνος ο σκύλος · acel câine / câinele acela · that dog');
    expect(sheet).toContain('ένα τέτοιο σπίτι · o asemenea casă · such a house');
    expect(sheet).toContain('τέτοιο ψωμί · asemenea pâine · such bread');
    expect(sheet).toContain('τόσο ψωμί · atâta pâine · so much bread');
  });

  it('shows the place words: the example and the Romanian words after each preposition', () => {
    expect(sheet).toContain('Example: Ελληνικά: Εδώ είναι το σπίτι; Română: Aici este casa; English: Here is the house');
    expect(sheet).toContain('after από (stored): από εδώ: de aici');
    expect(sheet).toContain('after μέχρι (stored): μέχρι εκεί: până acolo');
    expect(sheet).not.toContain('με εδώ');
  });

  it('shows the relative pronouns: the Romanian care tables and every noun in every job', () => {
    expect(sheet).toContain('- Romanian care, dative: căruia (masc. sg) · căreia (fem. sg) · cărora (pl)');
    expect(sheet).toContain('- Romanian care, genitive: cărui (masc. sg) · cărei (fem. sg) · căror (pl)');
    expect(sheet).toContain('subject: που · care · who');
    expect(sheet).toContain('subject: το οποίο · care · who');
    expect(sheet).toContain('to whom: που του … · căruia · to whom');
    expect(sheet).toContain('to whom: στο οποίο · căruia · to whom');
    expect(sheet).toContain('whose (noun owned: σπίτι): του οποίου το σπίτι · a cărui casă · whose house');
    expect(sheet).toContain('whose (noun owned: σκύλος): του οποίου ο σκύλος · al cărei câine · whose dog');
  });

  it('shows the relative pronoun after every preposition', () => {
    expect(sheet).toContain('- after a preposition (παιδί, singular):');
    expect(sheet).toContain('με: με το οποίο · cu care · with whom');
    expect(sheet).toContain('με: που … με αυτό · cu care · with whom');
    expect(sheet).toContain('πάνω από: πάνω από το οποίο · peste care · over whom');
    expect(sheet).toContain('σε: στο οποίο · la care · to whom');
    expect(sheet).toContain('για: που … για αυτό · pentru care · for which');
  });

  it('shows the free relatives: both readings and an example of each', () => {
    expect(sheet).toContain('- whatever: ό,τι · orice · whatever');
    expect(sheet).toContain('- what: ό,τι · ce · what');
    expect(sheet).toContain('- Example (whatever): Ελληνικά: Ό,τι θέλεις; Română: Orice vrei; English: Whatever you want');
    expect(sheet).toContain('- Example (what): Ελληνικά: Ό,τι έχω; Română: Ce am; English: What I have');
    expect(sheet).toContain('- wherever: όπου · oriunde · wherever');
    expect(sheet).toContain('- where: όπου · unde · where');
  });

  it('shows όποιος with every noun', () => {
    expect(sheet).toContain('όποιο ψωμί · orice pâine · whichever bread');
    expect(sheet).toContain('όποιος σκύλος · orice câine · whichever dog');
  });

  it('the whole sheet lists every unverified record once, under all its sections', () => {
    const listed = [...sheet.matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
    expect(listed).toEqual(unverifiedRecords(sets));
    for (const heading of ['## Checklist', '## Review items', '## Lexemes', '## Noun possessors (generated)', '## Phrases', '## Comparison notes', '## Authored readings', '## Form groups', '## Pending Romanian cells']) {
      expect(sheet).toContain(heading);
    }
    expect(sheet).toContain('# Content review sheet');
    expect(sheet).not.toContain('One file of the split review sheet');
  });

  it('says how many records are unverified', () => {
    expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
  });

  it('shows what a reviewer needs for the question words', () => {
    expect(sheet).toContain('Ελληνικά: Τι θέλεις;');
    expect(sheet).toContain('de unde');
    expect(sheet).toContain('până când');
    expect(sheet).toContain('από τι: din ce');
  });
});

describe('the relative pronoun sections of the review sheet', () => {
  it('print the Romanian care tables once, and no generic per-slot lines under που', () => {
    expect(sheet.split('- Romanian care, dative:').length - 1).toBe(1);
    expect(sheet).toContain('up to whom');
  });
});
