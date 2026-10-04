import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Clitic, Level, SlotOf } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';
import { changeVerbSlot } from './verb';
import { getVerb } from '../data/lexemes';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const panelOf = (lexeme: string, slot: SlotOf<'verb'>, noun: string | null, level: Level = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: 'sg' };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const row = (p: ReturnType<typeof panelOf>) => ({ el: richText(p.rows[0].el), ro: richText(p.rows[0].ro), en: richText(p.rows[0].en) });
const keys = (p: ReturnType<typeof panelOf>) => p.controls.map((c) => c.key);

describe('the verb panel of a command and its object', () => {
  it('no object: a command offers the Object control set to none', () => {
    const p = panelOf('troo', command(), null);
    expect(keys(p)).toEqual(['who', 'mood', 'tense', 'polarity', 'object']);
    expect(p.controls.find((c) => c.key === 'object')?.value).toBe('none');
    expect(row(p)).toEqual({ el: 'φάε', ro: 'mănâncă', en: 'eat' });
  });

  it('a noun is spelled out: φάε το ψωμί / mănâncă pâinea / eat the bread', () => {
    const p = panelOf('troo', command(), 'psomi');
    expect(keys(p)).toEqual(['who', 'mood', 'tense', 'polarity', 'object', 'noun']);
    expect(p.controls.find((c) => c.key === 'object')?.value).toBe('noun');
    expect(row(p)).toEqual({ el: 'φάε το ψωμί', ro: 'mănâncă pâinea', en: 'eat the bread' });
  });

  it('a verb with an indirect object: δώσε μου το ψωμί / dă-mi pâinea / give me the bread', () => {
    const p = panelOf('dino', command({ clitics: [ME] }), 'psomi');
    expect(row(p)).toEqual({ el: 'δώσε μου το ψωμί', ro: 'dă-mi pâinea', en: 'give me the bread' });
  });

  it('a pronoun: φάε το / mănâncă-o / eat it; two pronouns: δώσε μού το / dă-mi-o / give it to me', () => {
    expect(row(panelOf('troo', command({ clitics: [IT] }), 'psomi'))).toEqual({ el: 'φάε το', ro: 'mănâncă-o', en: 'eat it' });
    expect(row(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi'))).toEqual({
      el: 'δώσε μού το', ro: 'dă-mi-o', en: 'give it to me',
    });
  });

  it('a negative command: μην το φας / nu o mânca / don\'t eat it', () => {
    expect(row(panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi'))).toEqual({
      el: 'μην το φας', ro: 'nu o mânca', en: "don't eat it",
    });
  });

  it('the Object options: three, and four for a verb with an indirect object', () => {
    const options = (id: string) => panelOf(id, command(), null).controls.find((c) => c.key === 'object')?.options.map((o) => o.value);
    expect(options('troo')).toEqual(['none', 'noun', 'pronoun']);
    expect(options('dino')).toEqual(['none', 'noun', 'pronoun', 'two']);
  });

  it('outside a command there is no Object control and the full table has no pronouns', () => {
    const present = panelOf('troo', command({ mood: 'indicative', tense: 'present' }), null);
    expect(keys(present)).toEqual(['who', 'mood', 'tense', 'polarity']);
    const improver = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver');
    expect(improver.full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
    expect(improver.overview).toHaveLength(15);
  });

  it('the plain-language line says where the pronoun goes', () => {
    expect(panelOf('troo', command({ clitics: [IT] }), 'psomi').plain).toContain('follows an affirmative command');
    expect(panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi').plain).toContain('in front of the verb');
  });

  it('the stress rule shows as an irregularity message', () => {
    expect(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi').irregular).toContain('second accent');
  });
});

describe('applyControl: object and object noun', () => {
  const bare: PanelState = { slot: command(), noun: null, nounNumber: 'sg' };

  it('a pronoun for the default noun, then none again', () => {
    const next = applyControl(bare, 'object', 'pronoun', 'troo');
    expect(next.noun).toBe('psomi');
    expect(next.slot).toMatchObject({ clitics: [IT] });
    const none = applyControl(next, 'object', 'none', 'troo');
    expect(none.noun).toBeNull();
    expect(none.slot).not.toHaveProperty('clitics');
  });

  it('a noun for a verb with an indirect object adds "me"; two adds both pronouns', () => {
    expect(applyControl(bare, 'object', 'noun', 'dino').slot).toMatchObject({ clitics: [ME] });
    expect(applyControl(bare, 'object', 'noun', 'troo').slot).not.toHaveProperty('clitics');
    expect(applyControl(bare, 'object', 'two', 'dino').slot).toMatchObject({ clitics: [ME, IT] });
  });

  it('changing the object noun changes the pronoun: the child is το in Greek and -l in Romanian', () => {
    const pronoun = applyControl(bare, 'object', 'pronoun', 'troo');
    const child = applyControl(pronoun, 'noun', 'paidi', 'troo');
    expect(child.noun).toBe('paidi');
    expect(child.slot).toMatchObject({ clitics: [{ role: 'object', gender: 'n', roGender: 'm' }] });
    expect(richText(buildPanel(child, { text: '', lexeme: 'troo', slot: child.slot }, 'beginner').rows[0].ro)).toBe('mănâncă-l');
  });

  it('changing the object drops the short form', () => {
    const short: PanelState = { slot: command({ clitics: [IT], shortForm: true }), noun: 'psomi', nounNumber: 'sg' };
    expect(applyControl(short, 'object', 'two', 'dino').slot).not.toHaveProperty('shortForm');
  });
});

describe('changeVerbSlot keeps pronouns and short forms valid', () => {
  const troo = getVerb('troo');
  const short = command({ clitics: [IT], shortForm: true });
  it('leaving the command drops both', () => {
    const next = changeVerbSlot(troo, short, 'mood', 'indicative');
    expect(next).not.toHaveProperty('clitics');
    expect(next).not.toHaveProperty('shortForm');
  });
  it('the plural, the present and a negative command drop the short form but keep the pronoun', () => {
    const plural = { ...short, number: 'pl' as const };
    expect(changeVerbSlot(troo, plural, 'tense', 'aorist')).not.toHaveProperty('shortForm');
    expect(changeVerbSlot(troo, plural, 'tense', 'aorist')).toHaveProperty('clitics');
    expect(changeVerbSlot(troo, short, 'tense', 'present')).not.toHaveProperty('shortForm');
    const negative = changeVerbSlot(troo, short, 'polarity', 'negative');
    expect(negative).not.toHaveProperty('shortForm');
    expect(negative).toHaveProperty('clitics');
  });
});

describe('initialState for a command', () => {
  it('a command with a pronoun and no noun token gets the noun that fits the pronoun', () => {
    const phrase = { ...PHRASES[0], tokens: [{ text: 'Φάε το', lexeme: 'troo', slot: command({ clitics: [IT] }) }] };
    expect(initialState(phrase.tokens[0], phrase).noun).toBe('psomi');
  });
});
