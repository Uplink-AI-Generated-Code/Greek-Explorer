import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Clitic, Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const panelOf = (lexeme: string, slot: SlotOf<'verb'>, noun: string | null, level: Level = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: 'sg' };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const texts = (r: { el: Parameters<typeof richText>[0]; ro: Parameters<typeof richText>[0]; en: Parameters<typeof richText>[0] }) => [
  richText(r.el), richText(r.ro), richText(r.en),
];

describe('the Same-meaning strip (spec 5.4)', () => {
  it('Beginner: with a noun and with a pronoun, the form in use pressed, and the close row', () => {
    const strip = panelOf('troo', command(), 'psomi').sameMeaning;
    expect(strip?.meaning).toBe('Eat the bread!');
    expect(strip?.rows.map((r) => [r.tag, r.current])).toEqual([['with noun', true], ['with clitic', false]]);
    expect(strip && texts(strip.rows[0])).toEqual(['φάε το ψωμί', 'mănâncă pâinea', 'eat the bread']);
    expect(strip && texts(strip.rows[1])).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(strip?.rows[1].note).toContain('feminine (pâine)');
    expect(strip?.close && texts(strip.close)).toEqual(['φάε', 'mănâncă', 'eat']);
    expect(strip?.close?.reason).toBe('no object: what to eat is not said');
    expect(strip?.close?.current).toBe(false);
    expect(strip?.notes).toEqual([]);
  });

  it('Improver adds the short-form row, whose Romanian and English cells read "none"', () => {
    const strip = panelOf('troo', command({ clitics: [IT], shortForm: true }), 'psomi', 'improver').sameMeaning;
    expect(strip?.rows.map((r) => [r.tag, r.current])).toEqual([
      ['with noun', false], ['with clitic', false], ['short form', true],
    ]);
    expect(strip && texts(strip.rows[2])).toEqual(['φάτο', 'none', 'none']);
    expect(strip?.notes).toEqual(['short form: A short way of saying φάε το: the final -ε drops and the pronoun joins the verb.']);
  });

  it('the bare verb with no object is the close row', () => {
    const strip = panelOf('troo', command(), null).sameMeaning;
    expect(strip?.rows.every((r) => !r.current)).toBe(true);
    expect(strip?.close?.current).toBe(true);
  });

  it('two pronouns: the stress sentence and the order note are for Improver', () => {
    const improver = panelOf('dino', command({ clitics: [ME, IT] }), 'psomi', 'improver').sameMeaning;
    expect(improver && texts(improver.rows[1])).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(improver?.notes).toContain('with clitic: The pronouns push the stress to the fourth-last syllable or further back, which Greek does not allow, so a second accent is written two syllables after the original stress.');
    expect(improver?.notes).toContain('Two pronouns: the genitive comes before the accusative.');
    expect(improver?.rows[2].tag).toBe('short form');
    expect(panelOf('dino', command({ clitics: [ME, IT] }), 'psomi', 'beginner').sameMeaning?.notes).toEqual([]);
  });

  it("Don't eat the bread!: the negative group, with the note that the pronoun moves", () => {
    const strip = panelOf('troo', command({ clitics: [IT], polarity: 'negative' }), 'psomi').sameMeaning;
    expect(strip?.meaning).toBe("Don't eat the bread!");
    expect(strip?.rows.map((r) => r.current)).toEqual([false, true]);
    expect(strip && texts(strip.rows[1])).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(strip?.rows[1].note).toContain('in front of the verb');
  });

  it('Wash the child!: the Romanian pronoun is -l', () => {
    const strip = panelOf('pleno', command({ clitics: [IT_CHILD] }), 'paidi').sameMeaning;
    expect(strip?.meaning).toBe('Wash the child!');
    expect(strip && texts(strip.rows[1])).toEqual(['πλύνε το', 'spală-l', 'wash it']);
    expect(strip?.rows).toHaveLength(2);
  });

  it('there is no strip outside a command, or for a command with no group', () => {
    expect(panelOf('troo', command({ mood: 'indicative', tense: 'present' }), null).sameMeaning).toBeUndefined();
    expect(panelOf('troo', command({ tense: 'present' }), null).sameMeaning).toBeUndefined();
  });
});

describe('applyControl: choosing a member', () => {
  const start: PanelState = { slot: command(), noun: 'psomi', nounNumber: 'sg' };
  it('with a pronoun, then the short form, then the noun again, then the bare verb', () => {
    const clitic = applyControl(start, 'member', '1', 'troo');
    expect(clitic.slot).toMatchObject({ clitics: [IT] });
    expect(clitic.slot).not.toHaveProperty('shortForm');
    expect(clitic.noun).toBe('psomi');
    const short = applyControl(clitic, 'member', '2', 'troo');
    expect(short.slot).toMatchObject({ clitics: [IT], shortForm: true });
    const noun = applyControl(short, 'member', '0', 'troo');
    expect(noun.slot).not.toHaveProperty('clitics');
    expect(noun.slot).not.toHaveProperty('shortForm');
    expect(noun.noun).toBe('psomi');
    const close = applyControl(noun, 'member', 'close', 'troo');
    expect(close.noun).toBeNull();
    expect(close.slot).not.toHaveProperty('clitics');
  });
  it("the child's pronoun brings the child with it", () => {
    const wash: PanelState = { slot: command(), noun: 'paidi', nounNumber: 'sg' };
    const next = applyControl(wash, 'member', '1', 'pleno');
    expect(next.noun).toBe('paidi');
    expect(next.slot).toMatchObject({ clitics: [IT_CHILD] });
  });
  it('a panel on no group changes nothing', () => {
    const none: PanelState = { slot: command({ tense: 'present' }), noun: null, nounNumber: 'sg' };
    expect(applyControl(none, 'member', '0', 'troo')).toBe(none);
  });
});
