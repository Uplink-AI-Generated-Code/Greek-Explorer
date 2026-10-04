import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'n',
  number: 'sg',
  case: 'acc',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});
const stateOf = (slot: SlotOf<'quantifier'>, noun: string): PanelState => ({ slot, noun, nounNumber: slot.number });
const panelFor = (lexeme: string, slot: SlotOf<'quantifier'>, noun: string, level: Level = 'beginner') =>
  buildPanel(stateOf(slot, noun), { text: '', lexeme, slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const keys = (p: ReturnType<typeof panelFor>) => p.controls.map((c) => c.key);

describe('quantifier panel: the rows', () => {
  it('πολύς with ψωμί: mass reading, with a noun and on its own', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.lemma).toBe('πολύς / πολλή / πολύ');
    expect(cells(p, 0)).toEqual({ el: 'πολύ ψωμί', ro: 'multă pâine', en: 'much / a lot of bread' });
    expect(p.rows[0].label).toBe('with a noun');
    expect(cells(p, 1)).toEqual({ el: 'πολύ', ro: 'multă', en: 'much / a lot' });
    expect(p.rows[1].label).toBe('on its own');
    expect(p.badge).toBe('mass reading');
  });

  it('colours the quantifier like a numeral and the noun like a noun', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['article', 'plain', 'stem', 'ending']);
  });

  it('the singular genitive of πολύς is filled in for Romanian, and the stand-alone genitive is not covered', () => {
    const p = panelFor('polys', slotOf({ case: 'gen' }), 'psomi');
    expect(cells(p, 0)).toEqual({ el: 'πολλού ψωμιού', ro: 'multei pâini', en: 'of much / a lot of bread' });
    expect(p.rows[1].dimmed).toContain('not covered');
  });

  it('the English notices are notice segments, not plain dim', () => {
    const count = panelFor('polys', slotOf({ number: 'pl' }), 'psomi');
    expect(count.rows[0].en.map((s) => s.role)).toEqual(['notice']);
  });

  it('the plural count reading of a mass noun has no English plural', () => {
    const p = panelFor('polys', slotOf({ number: 'pl' }), 'psomi');
    expect(cells(p, 0)).toEqual({ el: 'πολλά ψωμιά', ro: 'multe pâini', en: 'uncountable: no plural in English' });
    expect(p.badge).toBe('count reading');
  });

  it('the comparative: περισσότερο νερό / mai multă apă / more water', () => {
    const p = panelFor('polys', slotOf({ degree: 'comparative' }), 'nero');
    expect(cells(p, 0)).toEqual({ el: 'περισσότερο νερό', ro: 'mai multă apă', en: 'more water' });
  });

  it('λίγος with νερό: λίγο νερό / puțină apă / little / a little water', () => {
    const p = panelFor('ligos', slotOf(), 'nero');
    expect(cells(p, 0)).toEqual({ el: 'λίγο νερό', ro: 'puțină apă', en: 'little / a little water' });
  });

  it('μερικοί with καφές: niște cafele / some coffees; the few sense gives câteva cafele', () => {
    const some = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes');
    expect(cells(some, 0)).toEqual({ el: 'μερικούς καφέδες', ro: 'niște cafele', en: 'some coffees' });
    expect(cells(some, 1)).toEqual({ el: 'μερικούς', ro: 'unele', en: 'some' });
    const few = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl', sense: 'few' }), 'kafes');
    expect(cells(few, 0)).toEqual({ el: 'μερικούς καφέδες', ro: 'câteva cafele', en: 'a few / several coffees' });
  });

  it('κανένας: no coffee, and a row that shows the negative concord', () => {
    const p = panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes');
    expect(cells(p, 0)).toEqual({ el: 'κανέναν καφέ', ro: 'nicio cafea', en: 'no coffee' });
    expect(cells(p, 1)).toEqual({ el: 'κανέναν', ro: 'niciuna', en: 'none / no one' });
    expect(p.rows[2].label).toBe('with negation');
    expect(cells(p, 2)).toEqual({
      el: 'δεν θέλω κανέναν καφέ',
      ro: 'nu vreau nicio cafea',
      en: "I don't want any coffee",
    });
    expect(p.rows[2].el[0]).toEqual({ text: 'δεν θέλω', role: 'neg' });
  });

  it('κανένας with a masculine Romanian noun gives niciun', () => {
    const p = panelFor('kanenas', slotOf({ gender: 'm' }), 'skylos');
    expect(cells(p, 0).ro).toBe('niciun câine');
  });

  it('only κανένας has the negation row', () => {
    expect(panelFor('polys', slotOf(), 'psomi').rows).toHaveLength(2);
    expect(panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes').rows).toHaveLength(2);
  });

  it('κάποιος: some / any beside a noun, someone / anyone on its own', () => {
    const p = panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes');
    expect(cells(p, 0)).toEqual({ el: 'κάποιον καφέ', ro: 'vreo cafea', en: 'some / any coffee' });
    expect(cells(p, 1)).toEqual({ el: 'κάποιον', ro: 'vreuna', en: 'someone / anyone' });
  });
});

describe('quantifier panel: controls and labels', () => {
  it('lists the controls each lexeme has', () => {
    expect(keys(panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes'))).toEqual(['noun', 'case']);
    expect(keys(panelFor('kapoios', slotOf({ gender: 'm' }), 'kafes'))).toEqual(['noun', 'case']);
    expect(keys(panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes'))).toEqual(['noun', 'case', 'sense']);
    expect(keys(panelFor('polys', slotOf(), 'psomi'))).toEqual(['noun', 'case', 'kind', 'degree']);
    expect(keys(panelFor('ligos', slotOf(), 'nero'))).toEqual(['noun', 'case', 'kind', 'degree']);
  });

  it('the kind control follows the number and the sense control shows the Romanian word', () => {
    const polys = panelFor('polys', slotOf({ number: 'pl' }), 'psomi');
    expect(polys.controls.find((c) => c.key === 'kind')?.value).toBe('count');
    const merikoi = panelFor('merikoi', slotOf({ gender: 'm', number: 'pl' }), 'kafes');
    const sense = merikoi.controls.find((c) => c.key === 'sense');
    expect(sense?.value).toBe('some');
    expect(sense?.options.map((o) => o.label)).toEqual(['some (niște)', 'a few (câțiva)']);
  });

  it('Beginner and Improver labels differ', () => {
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').posLabel).toBe('quantifier: much / a lot of');
    expect(panelFor('polys', slotOf(), 'psomi', 'improver').posLabel).toBe('quantifier · two stems (πολύ-, πολλ-)');
    expect(panelFor('kanenas', slotOf({ gender: 'm' }), 'kafes', 'improver').posLabel).toBe(
      'quantifier · declines like the numeral ένας',
    );
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').controls.find((c) => c.key === 'degree')?.options.map((o) => o.label)).toEqual([
      'a lot / a little',
      'more / less',
    ]);
  });

  it('says what the word means and shows the irregularity of πολύς', () => {
    const p = panelFor('polys', slotOf(), 'psomi');
    expect(p.plain).toContain('mass noun');
    expect(p.irregular).toContain('two stems');
    expect(panelFor('ligos', slotOf(), 'nero').irregular).toBe('');
    expect(p.note).toContain('Neuter in Greek, feminine in Romanian');
  });
});

describe('quantifier panel: the Improver table', () => {
  it('has nine rows, outlines the Greek and the Romanian gender separately, and shows the genitives', () => {
    const p = panelFor('polys', slotOf(), 'psomi', 'improver');
    expect(p.full).toHaveLength(9);
    expect(p.full.find((r) => r.hl?.el)?.label).toBe('neut. accusative');
    expect(p.full.find((r) => r.hl?.ro)?.label).toBe('fem. accusative');
    const genitive = p.full.filter((r) => r.label.endsWith('genitive'));
    expect(genitive.map((r) => richText(r.ro))).toEqual(['multului', 'multei', 'multului']);
    expect(richText(p.full[0].el)).toBe('πολύς');
  });

  it('is empty in Beginner', () => {
    expect(panelFor('polys', slotOf(), 'psomi', 'beginner').full).toEqual([]);
  });
});

describe('applyControl for a quantifier', () => {
  const start = stateOf(slotOf(), 'psomi');
  it('kind switches the number', () => {
    expect(applyControl(start, 'kind', 'count').slot).toMatchObject({ number: 'pl' });
    expect(applyControl(applyControl(start, 'kind', 'count'), 'kind', 'mass').slot).toMatchObject({ number: 'sg' });
  });
  it('degree switches to the comparative', () => {
    expect(applyControl(start, 'degree', 'comparative').slot).toMatchObject({ degree: 'comparative' });
  });
  it('sense sets and clears the few sense', () => {
    const few = applyControl(stateOf(slotOf({ gender: 'm', number: 'pl' }), 'kafes'), 'sense', 'few');
    expect(few.slot).toMatchObject({ sense: 'few' });
    const back = applyControl(few, 'sense', 'some');
    expect(back.slot).not.toHaveProperty('sense');
  });
  it('noun takes the noun and its gender', () => {
    const next = applyControl(start, 'noun', 'kafes');
    expect(next.noun).toBe('kafes');
    expect(next.slot).toMatchObject({ gender: 'm' });
  });
  it('case changes the role', () => {
    expect(applyControl(start, 'case', 'gen').slot).toMatchObject({ case: 'gen' });
  });
});
