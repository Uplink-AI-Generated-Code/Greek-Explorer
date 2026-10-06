import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, sameState, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'n',
  number: 'sg',
  case: 'nom',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
const stateOf = (slot: SlotOf<'quantifier'>, noun: string): PanelState => ({ slot, noun, nounNumber: slot.number });
const panelFor = (lexeme: string, state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);
const near = (noun: string, patch: Partial<SlotOf<'quantifier'>> = {}, lexeme = 'autos', level: Level = 'beginner') =>
  panelFor(lexeme, stateOf(slotOf(patch), noun), level);

describe('the demonstrative panel: αυτός and εκείνος', () => {
  it('shows the article after the demonstrative, and both Romanian placements', () => {
    const p = near('spiti');
    expect(p.lemma).toBe('αυτός / αυτή / αυτό');
    expect(p.posLabel).toBe('demonstrative: this');
    expect(p.badge).toBe('demonstrative');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p, 0)).toEqual({ el: 'αυτό το σπίτι', ro: 'această casă / casa aceasta', en: 'this house' });
    expect(cells(p, 1)).toEqual({ el: 'αυτό', ro: 'aceasta', en: 'this' });
  });

  it('εκείνος is the far demonstrative', () => {
    const p = near('skylos', { gender: 'm' }, 'ekeinos');
    expect(p.posLabel).toBe('demonstrative: that');
    expect(cells(p, 0)).toEqual({ el: 'εκείνος ο σκύλος', ro: 'acel câine / câinele acela', en: 'that dog' });
    expect(cells(p, 1)).toEqual({ el: 'εκείνος', ro: 'acela', en: 'that' });
  });

  it('follows the number and the role', () => {
    expect(cells(near('spiti', { number: 'pl' }), 0)).toEqual({
      el: 'αυτά τα σπίτια',
      ro: 'aceste case / casele acestea',
      en: 'these houses',
    });
    expect(cells(near('spiti', { case: 'gen' }), 0)).toEqual({
      el: 'αυτού του σπιτιού',
      ro: 'acestei case / casei acesteia',
      en: 'of this house',
    });
    expect(cells(near('skylos', { gender: 'm', case: 'acc' }), 0).el).toBe('αυτόν τον σκύλο');
  });

  it('the spoken Romanian forms go after the noun, and have no genitive', () => {
    const spoken = near('spiti', { register: 'spoken' });
    expect(cells(spoken, 0)).toEqual({ el: 'αυτό το σπίτι', ro: 'casa asta', en: 'this house' });
    expect(cells(spoken, 1).ro).toBe('asta');
    expect(cells(near('skylos', { gender: 'm', register: 'spoken' }, 'ekeinos'), 0).ro).toBe('câinele ăla');
    expect(cells(near('spiti', { register: 'spoken', case: 'gen' }), 0).ro).toBe('not covered');
  });

  it('offers the noun, the role, how many and the Romanian form', () => {
    const p = near('spiti', {}, 'autos', 'improver');
    expect(keys(p)).toEqual(['noun', 'case', 'number', 'register']);
    expect(p.controls.find((c) => c.key === 'register')?.value).toBe('formal');
    expect(p.controls.find((c) => c.key === 'register')?.options.map((o) => o.value)).toEqual(['formal', 'spoken']);
    expect(near('spiti', { register: 'spoken' }).controls.find((c) => c.key === 'register')?.value).toBe('spoken');
  });

  it('Improver: gender by role, with the noun’s forms outlined', () => {
    const p = near('spiti', {}, 'autos', 'improver');
    expect(p.posLabel).toBe('demonstrative · near ("this")');
    expect(p.full).toHaveLength(9);
    expect(p.full[0].label).toBe('masc. nominative');
    expect(richText(p.full[0].el)).toBe('αυτός');
    expect(richText(p.full[0].ro)).toBe('acest');
    expect(p.full.filter((r) => r.hl?.el).map((r) => r.label)).toEqual(['neut. nominative']);
    expect(p.full.filter((r) => r.hl?.ro).map((r) => r.label)).toEqual(['fem. nominative']);
    expect(near('spiti').full).toEqual([]);
  });

  it('the Romanian form control switches the register, and it is part of the state', () => {
    const start = stateOf(slotOf(), 'spiti');
    const spoken = applyControl(start, 'register', 'spoken');
    expect(spoken.slot).toMatchObject({ register: 'spoken' });
    const back = applyControl(spoken, 'register', 'formal');
    expect('register' in back.slot).toBe(false);
    expect(sameState(back, start)).toBe(true);
    expect(applyControl(stateOf({ ...slotOf(), pos: 'quantifier' }, 'spiti'), 'noun', 'skylos').slot).toMatchObject({ gender: 'm' });
  });

  it('explains the spoken forms in the plain text', () => {
    expect(near('spiti', { register: 'spoken' }).plain).toContain('ăsta, ăla');
    expect(near('spiti').plain).not.toContain('ăsta, ăla');
    expect(near('spiti').plain).not.toContain('mass reading');
  });
});

describe('the demonstrative panel: τέτοιος and τόσος', () => {
  it('τέτοιος takes ένα in the singular and has no stand-alone row', () => {
    const p = panelFor('tetoios', stateOf(slotOf(), 'spiti'));
    expect(p.lemma).toBe('τέτοιος / τέτοια / τέτοιο');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun']);
    expect(cells(p, 0)).toEqual({ el: 'ένα τέτοιο σπίτι', ro: 'o asemenea casă', en: 'such a house' });
    expect(keys(p)).toEqual(['noun', 'case', 'number']);
  });

  it('τέτοιος in the plural takes no article, and with a mass noun no ένα', () => {
    expect(cells(panelFor('tetoios', stateOf(slotOf({ number: 'pl' }), 'spiti')), 0)).toEqual({
      el: 'τέτοια σπίτια',
      ro: 'asemenea case',
      en: 'such houses',
    });
    expect(cells(panelFor('tetoios', stateOf(slotOf(), 'psomi')), 0)).toEqual({ el: 'τέτοιο ψωμί', ro: 'asemenea pâine', en: 'such bread' });
  });

  it('τέτοιος takes its English article from the noun, in the label and the table too', () => {
    const hour = panelFor('tetoios', stateOf(slotOf({ gender: 'f' }), 'ora'), 'improver');
    expect(cells(hour, 0).en).toBe('such an hour');
    expect(richText(hour.full[0].en)).toBe('such an');
    expect(panelFor('tetoios', stateOf(slotOf({ gender: 'f' }), 'ora')).posLabel).toBe('demonstrative: such an');
    const bread = panelFor('tetoios', stateOf(slotOf(), 'psomi'), 'improver');
    expect(bread.posLabel).toBe('demonstrative · "such", beside a noun only');
    expect(richText(bread.full[0].ro)).toBe('asemenea');
    expect(richText(bread.full[0].en)).toBe('such');
    expect(panelFor('tetoios', stateOf(slotOf(), 'psomi')).posLabel).toBe('demonstrative: such');
  });

  it('τέτοιος with a mass noun keeps the article word in the genitive only, and has no plural', () => {
    expect(cells(panelFor('tetoios', stateOf(slotOf({ case: 'gen' }), 'psomi')), 0).en).toBe('of such bread');
    expect(cells(panelFor('tetoios', stateOf(slotOf({ case: 'gen' }), 'psomi')), 0).ro).toMatch(/^unei asemenea/);
    expect(cells(panelFor('tetoios', stateOf(slotOf({ number: 'pl' }), 'psomi')), 0).en).toBe('uncountable: no plural in English');
  });

  it('the stand-alone genitive reads "of this", "of those", "of so much"', () => {
    expect(cells(near('spiti', { case: 'gen' }), 1).en).toBe('of this');
    expect(cells(near('spiti', { case: 'gen', number: 'pl' }, 'ekeinos'), 1).en).toBe('of those');
    expect(cells(panelFor('tosos', stateOf(slotOf({ case: 'nom' }), 'psomi')), 1).en).toBe('so much');
  });

  it('the Romanian form options carry no Romanian words', () => {
    const labels = near('spiti').controls.find((c) => c.key === 'register')?.options.map((o) => o.label);
    expect(labels).toEqual(['formal', 'spoken']);
  });

  it('τόσος is the answer to πόσος: so much with a mass noun, so many with a count noun', () => {
    const mass = panelFor('tosos', stateOf(slotOf({ case: 'acc' }), 'psomi'));
    expect(cells(mass, 0)).toEqual({ el: 'τόσο ψωμί', ro: 'atâta pâine', en: 'so much bread' });
    expect(cells(mass, 1)).toEqual({ el: 'τόσο', ro: 'atâta', en: 'so much' });
    expect(cells(panelFor('tosos', stateOf(slotOf({ gender: 'm', case: 'acc' }), 'skylos')), 1).ro).toBe('atât');
    expect(mass.badge).toBe('demonstrative');
    expect(keys(mass)).toEqual(['noun', 'case', 'kind']);
    expect(mass.plain).toContain('mass reading');
    expect(mass.controls.find((c) => c.key === 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    const count = panelFor('tosos', stateOf(slotOf({ case: 'acc', number: 'pl' }), 'spiti'));
    expect(cells(count, 0)).toEqual({ el: 'τόσα σπίτια', ro: 'atâtea case', en: 'so many houses' });
  });
});

describe('the other quantifier panels are unchanged', () => {
  it('πολύς has no Romanian form control and keeps its badge', () => {
    const p = panelFor('polys', stateOf(slotOf({ case: 'acc' }), 'psomi'));
    expect(keys(p)).toEqual(['noun', 'case', 'kind', 'degree']);
    expect(p.badge).toBe('mass reading');
    expect(cells(p, 0).el).toBe('πολύ ψωμί');
  });
});
