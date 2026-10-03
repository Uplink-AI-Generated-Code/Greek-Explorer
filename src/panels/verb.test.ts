import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Mood, Num, Person, SlotOf, Tense, Token, Voice } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });

const stateOf = (slot: SlotOf<'verb'>): PanelState => ({ slot, noun: null, nounNumber: 'sg' });
const panel = (id: string, slot: SlotOf<'verb'>, level: Level = 'beginner', state = stateOf(slot)) => {
  const token: Token = { text: '', lexeme: id, slot };
  return buildPanel(state, token, level);
};
const cells = (p: ReturnType<typeof panel>, i = 0) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const control = (p: ReturnType<typeof panel>, key: string) => p.controls.find((c) => c.key === key);

describe('verb panel: the row', () => {
  it('shows a compound form with its pieces, the dropped pronouns and the English subject', () => {
    const p = panel('troo', vs('indicative', 'perfect'));
    expect(cells(p)).toEqual({ el: '(εγώ) έχω φάει', ro: '(eu) am mâncat', en: 'I have eaten' });
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['dim', 'plain', 'aux', 'plain', 'stem', 'ending']);
    expect(p.rows[0].en[0].role).toBe('pronoun');
  });
  it('shows the augment as its own part', () => {
    const p = panel('troo', vs('indicative', 'imperfect'));
    expect(p.rows[0].el.map((s) => [s.text, s.role]).slice(2)).toEqual([['έ', 'augment'], ['τρωγ', 'stem'], ['α', 'ending']]);
  });
  it('puts the English lead before the subject: that I eat', () => {
    expect(cells(panel('troo', vs('subjunctive', 'aorist'))).en).toBe('that I eat');
  });
  it('an imperative has no subject pronouns in any language', () => {
    const p = panel('troo', vs('imperative', 'aorist', 2, 'sg'));
    expect(cells(p)).toEqual({ el: 'φάε', ro: 'mănâncă', en: 'eat' });
    expect(p.rows[0].label).toBe('you');
  });
  it('an impersonal verb has no pronoun in Greek or Romanian and "it" in English', () => {
    const p = panel('mporei', vs('indicative', 'present', 3));
    expect(cells(p)).toEqual({ el: 'μπορεί', ro: 'poate', en: 'it may' });
  });
});

describe('verb panel: controls', () => {
  it('θέλω: Who, Mood and When, no Voice', () => {
    const p = panel('thelo', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense']);
    expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toHaveLength(8);
    expect(control(p, 'mood')?.label).toBe('Mood');
    expect(control(p, 'tense')?.label).toBe('When?');
  });
  it('πλένω has a Voice control', () => {
    const p = panel('pleno', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice']);
    expect(control(p, 'voice')?.options.map((o) => o.value)).toEqual(['active', 'mediopassive']);
  });
  it('the imperative offers only "you" and "you (pl.)"', () => {
    const p = panel('troo', vs('imperative', 'aorist', 2, 'sg'));
    expect(control(p, 'who')?.options.map((o) => o.value)).toEqual(['2sg', '2pl']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toEqual(['present', 'aorist']);
  });
  it('μπορεί offers one person and one tense', () => {
    const p = panel('mporei', vs('indicative', 'present', 3));
    expect(control(p, 'who')?.options.map((o) => o.value)).toEqual(['3sg']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toEqual(['present']);
  });
  it('Beginner uses plain labels, Improver the technical ones', () => {
    const b = panel('troo', vs('indicative', 'perfect'), 'beginner');
    const i = panel('troo', vs('indicative', 'perfect'), 'improver');
    expect(control(b, 'tense')?.options.find((o) => o.value === 'perfect')?.label).toBe('have done');
    expect(control(i, 'tense')?.options.find((o) => o.value === 'perfect')?.label).toBe('present perfect');
    expect(control(b, 'mood')?.options.find((o) => o.value === 'imperative')?.label).toBe('a command');
    expect(control(i, 'mood')?.options.find((o) => o.value === 'imperative')?.label).toBe('imperative');
  });
  it('labels the panel for the learner level', () => {
    expect(panel('troo', vs('indicative', 'present'), 'beginner').posLabel).toBe('verb: to eat');
    expect(panel('troo', vs('indicative', 'present'), 'improver').posLabel).toBe('verb · athematic class · active');
    expect(panel('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'), 'improver').posLabel).toBe(
      'verb · mediopassive -ομαι class · mediopassive',
    );
    expect(panel('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'), 'improver').lemma).toBe('πλένομαι');
  });
});

describe('verb panel: applyControl', () => {
  const change = (slot: SlotOf<'verb'>, key: string, value: string, id = 'troo') =>
    applyControl(stateOf(slot), key, value, id).slot as SlotOf<'verb'>;

  it('mood: moving to the imperative makes the person "you" and keeps an offered tense', () => {
    expect(change(vs('indicative', 'aorist', 3, 'pl'), 'mood', 'imperative')).toMatchObject({
      mood: 'imperative', tense: 'aorist', person: 2, number: 'pl',
    });
  });
  it('mood: a tense the new mood does not offer falls back to its first tense', () => {
    expect(change(vs('indicative', 'futurePerfect'), 'mood', 'subjunctive')).toMatchObject({
      mood: 'subjunctive', tense: 'present',
    });
  });
  it('tense: sets the tense', () => {
    expect(change(vs('indicative', 'present'), 'tense', 'pluperfect')).toMatchObject({ tense: 'pluperfect' });
  });
  it('voice: a tense the other voice does not offer falls back to its first tense', () => {
    expect(change(vs('indicative', 'futurePerfect'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', mood: 'indicative', tense: 'present',
    });
    expect(change(vs('indicative', 'perfect'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', tense: 'perfect',
    });
  });
  it('voice: a mood the other voice does not offer falls back to its first mood', () => {
    expect(change(vs('imperative', 'aorist', 2, 'sg'), 'voice', 'mediopassive', 'pleno')).toMatchObject({
      voice: 'mediopassive', mood: 'indicative',
    });
  });
  it('who: still works without the lexeme', () => {
    expect(applyControl(stateOf(vs('indicative', 'present')), 'who', '3pl').slot).toMatchObject({ person: 3, number: 'pl' });
  });
  it('mood, tense and voice need the lexeme', () => {
    expect(() => applyControl(stateOf(vs('indicative', 'present')), 'mood', 'subjunctive')).toThrow(
      'the mood control needs the lexeme',
    );
  });
});

describe('verb panel: full table and tense overview (Improver)', () => {
  it('Beginner shows neither', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'beginner');
    expect(p.full).toEqual([]);
    expect(p.overview ?? []).toEqual([]);
  });
  it('the full table lists the six persons of the selected mood, tense and voice', () => {
    const p = panel('troo', vs('indicative', 'perfect', 3), 'improver');
    expect(p.full.map((r) => richText(r.el))).toEqual([
      '(εγώ) έχω φάει', '(εσύ) έχεις φάει', '(αυτός/ή) έχει φάει', '(εμείς) έχουμε φάει', '(εσείς) έχετε φάει', '(αυτοί/ές) έχουν φάει',
    ]);
    expect(p.full.map((r) => Boolean(r.hl))).toEqual([false, false, true, false, false, false]);
  });
  it('the imperative table has two rows', () => {
    expect(panel('troo', vs('imperative', 'aorist', 2, 'sg'), 'improver').full.map((r) => richText(r.el))).toEqual(['φάε', 'φάτε']);
  });
  it('the overview lists every mood and tense for the selected person, with the form in use highlighted', () => {
    const p = panel('troo', vs('indicative', 'perfect', 1), 'improver');
    const overview = p.overview ?? [];
    expect(overview).toHaveLength(15);
    expect(overview[0].label).toBe('indicative · present');
    expect(richText(overview[0].el)).toBe('(εγώ) τρώω');
    expect(richText(overview[5].el)).toBe('(εγώ) έχω φάει');
    expect(overview.filter((r) => r.hl).map((r) => r.label)).toEqual(['indicative · present perfect']);
    expect(overview.find((r) => r.label === 'subjunctive · perfect')?.dimmed).toBeUndefined();
  });
  it('rows with no form are dimmed with a reason', () => {
    const overview = panel('troo', vs('indicative', 'present', 1), 'improver').overview ?? [];
    const imperative = overview.find((r) => r.label === 'imperative · aorist (do it once)');
    expect(imperative?.dimmed).toBe('commands are for "you" only');
    const thelo = panel('thelo', vs('indicative', 'present', 2), 'improver').overview ?? [];
    expect(thelo.find((r) => r.label === 'imperative · present (keep doing)')?.dimmed).toBe('θέλω has no imperative here');
  });
  it('the two futures show the same English cell', () => {
    const overview = panel('troo', vs('indicative', 'future', 1), 'improver').overview ?? [];
    const en = (label: string) => richText(overview.find((r) => r.label === label)!.en);
    expect(en('indicative · future (continuous)')).toBe(en('indicative · future (simple)'));
  });
});

describe('verb panel: plain-language line and irregularity', () => {
  it('describes the perfect: only the auxiliary changes with the person', () => {
    expect(panel('troo', vs('indicative', 'perfect')).plain).toContain('only έχω changes');
  });
  it('explains the aspect choice of the subjunctive', () => {
    expect(panel('troo', vs('subjunctive', 'aorist')).plain).toContain('once');
    expect(panel('troo', vs('subjunctive', 'present')).plain).toContain('regularly');
  });
  it('shows the irregularity of the lexical verb', () => {
    expect(panel('troo', vs('indicative', 'imperfect', 1, 'pl')).irregular).toContain('stress moves');
    expect(panel('troo', vs('indicative', 'present', 2)).irregular).toContain('τρως');
    expect(panel('troo', vs('indicative', 'present', 1)).irregular).toBe('');
  });
  it('keeps the explanation of the contracted class', () => {
    expect(panel('pidao', vs('indicative', 'present', 3)).irregular).toContain('Contracted');
  });
});

describe('particle panel', () => {
  it('shows the particle with a verb in each language', () => {
    const token: Token = { text: 'θα', lexeme: 'theta', slot: { pos: 'particle' } };
    const p = buildPanel({ slot: token.slot, noun: null, nounNumber: 'sg' }, token, 'beginner');
    expect(p.lemma).toBe('θα');
    expect(p.controls).toEqual([]);
    expect(richText(p.rows[0].el)).toBe('θα φάω');
    expect(richText(p.rows[0].ro)).toBe('voi mânca');
    expect(richText(p.rows[0].en)).toBe('will eat');
    expect(p.plain).toContain('future');
  });
});
