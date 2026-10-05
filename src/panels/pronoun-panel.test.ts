import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Mood, Person, SlotOf, Tense } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const verbSlot = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: 'sg' | 'pl' = 'sg',
  patch: Partial<SlotOf<'verb'>> = {},
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice: 'active', ...patch });
const stateOf = (slot: SlotOf<'verb'>, noun: string | null = null): PanelState => ({ slot, noun, nounNumber: 'sg' });
const panelOf = (lexeme: string, state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, level);
const row = (p: ReturnType<typeof panelOf>) => ({
  el: richText(p.rows[0].el),
  ro: richText(p.rows[0].ro),
  en: richText(p.rows[0].en),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the Object control in every mood', () => {
  it('turns a plain present into one with a pronoun: το θέλω / o vreau / I want it', () => {
    const start = stateOf(verbSlot('indicative', 'present'));
    const next = applyControl(start, 'object', 'pronoun', 'thelo');
    expect(next.noun).toBe('psomi');
    const p = panelOf('thelo', next);
    expect(row(p)).toEqual({ el: '(εγώ) το θέλω', ro: '(eu) o vreau', en: 'I want it' });
    expect(control(p, 'object')?.value).toBe('pronoun');
    expect(control(p, 'noun')?.value).toBe('psomi');
    expect(p.plain).toContain('in front of the verb group');
  });

  it('offers none, a pronoun and, for δίνω, two pronouns; a spelled-out noun only for a command', () => {
    const p = panelOf('dino', stateOf(verbSlot('indicative', 'present')));
    expect(control(p, 'object')?.options.map((o) => o.value)).toEqual(['none', 'pronoun', 'two']);
    const command = panelOf('dino', stateOf(verbSlot('imperative', 'aorist', 2)));
    expect(control(command, 'object')?.options.map((o) => o.value)).toEqual(['none', 'noun', 'pronoun', 'two']);
  });

  it('two pronouns in the simple future: θα μου το δώσεις / mi-o vei da / you will give it to me', () => {
    const start = stateOf(verbSlot('indicative', 'futureSimple', 2));
    const next = applyControl(start, 'object', 'two', 'dino');
    expect(row(panelOf('dino', next))).toEqual({
      el: '(εσύ) θα μου το δώσεις',
      ro: '(tu) mi-o vei da',
      en: 'you will give it to me',
    });
  });

  it('a negated hortative with a pronoun: ας μην το φάμε / să nu o mâncăm / let\'s not eat it', () => {
    const start = stateOf(verbSlot('hortative', 'aorist', 1, 'pl', { polarity: 'negative' }));
    const next = applyControl(start, 'object', 'pronoun', 'troo');
    expect(row(panelOf('troo', next))).toEqual({ el: '(εμείς) ας μην το φάμε', ro: '(noi) să nu o mâncăm', en: "let's not eat it" });
  });

  it('gives no spelled-out noun outside a command (the form stays without an object)', () => {
    const start = stateOf(verbSlot('indicative', 'present'));
    expect(applyControl(start, 'object', 'noun', 'troo').slot).not.toHaveProperty('clitics');
    // Current behaviour: from a form with a pronoun, choosing a noun leaves neither a noun nor a pronoun.
    const withPronoun = applyControl(start, 'object', 'pronoun', 'troo');
    const next = applyControl(withPronoun, 'object', 'noun', 'troo');
    expect(next.noun).toBeNull();
    expect(next.slot).not.toHaveProperty('clitics');
  });

  it('a verb that takes no object has no Object control', () => {
    expect(control(panelOf('pao', stateOf(verbSlot('indicative', 'present'))), 'object')).toBeUndefined();
    expect(control(panelOf('eimai', stateOf(verbSlot('indicative', 'present'))), 'object')).toBeUndefined();
    expect(control(panelOf('mporei', stateOf(verbSlot('indicative', 'present', 3, 'sg'))), 'object')).toBeUndefined();
  });
});

describe('the pronoun survives the other controls when it can', () => {
  const withPronoun = applyControl(stateOf(verbSlot('indicative', 'present')), 'object', 'pronoun', 'troo');

  it('keeps the pronoun and its noun when the mood, the tense, the person or the negation changes', () => {
    for (const [key, value] of [['mood', 'subjunctive'], ['tense', 'aorist'], ['who', '3pl'], ['polarity', 'negative']] as const) {
      const next = applyControl(withPronoun, key, value, 'troo');
      expect(next.slot.pos === 'verb' && next.slot.clitics?.length, key).toBe(1);
      expect(next.noun, key).toBe('psomi');
    }
  });

  it('keeps it going into a command, where the short form can be chosen again', () => {
    const next = applyControl(withPronoun, 'mood', 'imperative', 'troo');
    expect(next.slot).toMatchObject({ mood: 'imperative', person: 2 });
    expect(next.slot.pos === 'verb' && next.slot.clitics?.length).toBe(1);
  });

  it('drops the pronoun, and the noun, when the voice cannot take one', () => {
    const wash = applyControl(stateOf(verbSlot('indicative', 'present')), 'object', 'pronoun', 'pleno');
    const reflexive = applyControl(wash, 'voice', 'mediopassive', 'pleno');
    expect(reflexive.slot).not.toHaveProperty('clitics');
    expect(reflexive.noun).toBeNull();
  });

  it('reads as a Greek reading with the pronoun as its own part', () => {
    const perfect = applyControl(withPronoun, 'tense', 'perfect', 'troo');
    const p = panelOf('troo', perfect);
    expect(row(p).el).toBe('(εγώ) το έχω φάει');
    expect(p.reading?.[0].parts.map((part) => part.role)).toEqual(['clitic', 'auxiliary', 'stem', 'ending']);
  });
});

describe('leaving a command with an indirect object', () => {
  const command = stateOf(verbSlot('imperative', 'aorist', 2));

  it('drops an indirect-only pronoun, and the noun, when the spelled-out noun cannot stay', () => {
    const spelled = applyControl(command, 'object', 'noun', 'dino');
    expect(spelled.slot).toHaveProperty('clitics');
    const next = applyControl(spelled, 'mood', 'indicative', 'dino');
    expect(next.slot).not.toHaveProperty('clitics');
    expect(next.noun).toBeNull();
    expect(control(panelOf('dino', next), 'object')?.value).toBe('none');
  });

  it('keeps both pronouns when the object is two pronouns', () => {
    const two = applyControl(command, 'object', 'two', 'dino');
    const next = applyControl(two, 'mood', 'indicative', 'dino');
    expect(next.slot.pos === 'verb' && next.slot.clitics?.length).toBe(2);
    expect(control(panelOf('dino', next), 'object')?.value).toBe('two');
  });
});

describe('the "To whom?" control (the indirect pronoun of δίνω)', () => {
  const two = (patch: Partial<SlotOf<'verb'>> = {}) =>
    applyControl(stateOf(verbSlot('indicative', 'futureSimple', 2, 'sg', patch)), 'object', 'two', 'dino');

  it('appears once there is an indirect pronoun, and starts with "to me"', () => {
    const none = panelOf('dino', stateOf(verbSlot('indicative', 'futureSimple', 2)));
    expect(control(none, 'recipient')).toBeUndefined();
    const p = panelOf('dino', two());
    expect(control(p, 'recipient')?.value).toBe('1sg');
    expect(control(p, 'recipient')?.options.map((o) => o.label)).toEqual([
      'to me', 'to you', 'to him', 'to her', 'to us', 'to you (all)', 'to them',
    ]);
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity', 'object', 'recipient', 'noun']);
  });

  it('builds the pair for the chosen person in the three languages', () => {
    const expected: Record<string, { el: string; ro: string; en: string }> = {
      '2sg': { el: '(εσύ) θα σου το δώσεις', ro: '(tu) ți-o vei da', en: 'you will give it to you' },
      '3sg-f': { el: '(εσύ) θα της το δώσεις', ro: '(tu) i-o vei da', en: 'you will give it to her' },
      '1pl': { el: '(εσύ) θα μας το δώσεις', ro: '(tu) ni-o vei da', en: 'you will give it to us' },
      '2pl': { el: '(εσύ) θα σας το δώσεις', ro: '(tu) vi-o vei da', en: 'you will give it to you' },
      '3pl': { el: '(εσύ) θα τους το δώσεις', ro: '(tu) li-o vei da', en: 'you will give it to them' },
    };
    for (const [value, cells] of Object.entries(expected)) {
      expect(row(panelOf('dino', applyControl(two(), 'recipient', value, 'dino'))), value).toEqual(cells);
    }
  });

  it('keeps the recipient when the tense, the noun or the negation changes, and drops it with the pronoun', () => {
    const toHer = applyControl(two(), 'recipient', '3sg-f', 'dino');
    const perfect = applyControl(toHer, 'tense', 'perfect', 'dino');
    expect(row(panelOf('dino', perfect)).en).toBe('you have given it to her');
    const other = applyControl(toHer, 'noun', 'kafes', 'dino');
    expect(control(panelOf('dino', other), 'recipient')?.value).toBe('3sg-f');
    const single = applyControl(toHer, 'object', 'pronoun', 'dino');
    expect(control(panelOf('dino', single), 'recipient')).toBeUndefined();
  });

  it('also chooses the person of "give me the bread", and the Same-meaning strip is only about "me"', () => {
    const command = applyControl(stateOf(verbSlot('imperative', 'aorist', 2)), 'object', 'noun', 'dino');
    expect(control(panelOf('dino', command), 'recipient')?.value).toBe('1sg');
    expect(panelOf('dino', command).sameMeaning).toBeDefined();
    const toUs = applyControl(command, 'recipient', '1pl', 'dino');
    expect(row(panelOf('dino', toUs)).el).toContain('δώσε μας');
    expect(panelOf('dino', toUs).sameMeaning).toBeUndefined();
  });

  it('ignores a recipient it does not know, and does nothing without an indirect pronoun', () => {
    const start = two();
    expect(applyControl(start, 'recipient', 'nobody', 'dino')).toBe(start);
    const bare = stateOf(verbSlot('indicative', 'present'));
    expect(applyControl(bare, 'recipient', '2sg', 'dino')).toBe(bare);
  });
});
