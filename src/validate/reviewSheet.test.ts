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
    expect(sheet).toContain('- ind.1sg+obj.3sg.f: attached -mi-o · after nu nu mi-o');
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

  it('says how many records are unverified', () => {
    expect(sheet).toContain(`${unverifiedRecords(sets).length} records are not verified`);
  });

  it('shows what a reviewer needs for the question words', () => {
    expect(sheet).toContain('Ελληνικά: Τι θέλεις;');
    expect(sheet).toContain('de unde');
    expect(sheet).toContain('până când');
    expect(sheet).toContain('από τι: de la ce');
  });
});
