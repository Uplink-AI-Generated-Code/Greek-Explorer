import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import { getVerb } from '../data/lexemes';
import type { GreekVerb, Level, Mood, Num, Person, SlotOf, Tense, Token, Voice } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';
import { changeVerbSlot } from './verb';

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
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);
    expect(control(p, 'mood')?.options.map((o) => o.value)).toEqual(['indicative', 'subjunctive', 'conditional', 'hortative']);
    expect(control(p, 'tense')?.options.map((o) => o.value)).toHaveLength(8);
    expect(control(p, 'mood')?.label).toBe('Mood');
    expect(control(p, 'tense')?.label).toBe('When?');
  });
  it('πλένω has a Voice control', () => {
    const p = panel('pleno', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity']);
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
    expect(overview).toHaveLength(17);
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
    expect(thelo.find((r) => r.label === 'imperative · present (keep doing)')?.dimmed).toBe('θέλω has no imperative');
    const thelo1 = panel('thelo', vs('indicative', 'present', 1), 'improver').overview ?? [];
    expect(thelo1.find((r) => r.label === 'imperative · present (keep doing)')?.dimmed).toBe('θέλω has no imperative');
  });
  it('names the voice lemma and the missing tense', () => {
    const overview = panel('pleno', vs('indicative', 'present', 1, 'sg', 'mediopassive'), 'improver').overview ?? [];
    const reason = overview.find((r) => r.label === 'indicative · future (continuous)')?.dimmed ?? '';
    expect(reason).toContain('πλένομαι');
    expect(reason).toContain('future (continuous)');
  });
  it('a verb with only the third person gives a plain reason', () => {
    const overview = panel('mporei', vs('indicative', 'present', 3), 'improver').overview ?? [];
    const rows = overview.filter((r) => r.label.startsWith('indicative · future'));
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      if (r.dimmed === undefined) continue;
      expect(r.dimmed.startsWith('μπορεί has no')).toBe(true);
      expect(r.dimmed).not.toContain('has no indicative here');
    }
    expect(rows.some((r) => r.dimmed !== undefined)).toBe(true);
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

const negative = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });

describe('verb panel: negation', () => {
  it('shows the negative forms in the three languages', () => {
    const p = panel('troo', negative(vs('indicative', 'perfect')));
    expect(cells(p)).toEqual({ el: '(εγώ) δεν έχω φάει', ro: '(eu) nu am mâncat', en: "I haven't eaten" });
    expect(p.rows[0].el.map((s) => s.role)).toEqual(['dim', 'plain', 'neg', 'plain', 'aux', 'plain', 'stem', 'ending']);
  });

  it('a negative command is μην + the subjunctive, with no subject pronoun', () => {
    const p = panel('troo', negative(vs('imperative', 'aorist', 2, 'sg')));
    expect(cells(p)).toEqual({ el: 'μην φας', ro: 'nu mânca', en: "don't eat" });
    const plural = panel('troo', negative(vs('imperative', 'aorist', 2, 'pl')));
    expect(cells(plural)).toEqual({ el: 'μην φάτε', ro: 'nu mâncați', en: "don't eat" });
  });

  it('offers a Negated? control last, with plain Yes and No', () => {
    const p = panel('pleno', vs('indicative', 'present'));
    expect(p.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'voice', 'polarity']);
    expect(control(p, 'polarity')).toMatchObject({ label: 'Negated?', value: 'affirmative' });
    expect(control(p, 'polarity')?.options.map((o) => o.label)).toEqual(['No', 'Yes']);
    expect(control(panel('troo', negative(vs('indicative', 'present'))), 'polarity')?.value).toBe('negative');
  });

  it('explains where the negation goes', () => {
    expect(panel('troo', negative(vs('indicative', 'futureSimple'))).plain).toContain('δεν goes in front of the whole group');
    expect(panel('troo', negative(vs('subjunctive', 'aorist'))).plain).toContain('μην goes after να');
    expect(panel('troo', negative(vs('imperative', 'aorist', 2))).plain).toContain('not the imperative');
    expect(panel('troo', vs('indicative', 'present')).plain).not.toContain('δεν goes');
  });

  it('the full table and the overview follow the polarity', () => {
    const p = panel('troo', negative(vs('indicative', 'perfect')), 'improver');
    expect(richText(p.full[0].el)).toBe('(εγώ) δεν έχω φάει');
    expect((p.overview ?? [])[5].label).toBe('indicative · present perfect');
    expect(richText((p.overview ?? [])[5].el)).toBe('(εγώ) δεν έχω φάει');
    expect(richText((p.overview ?? [])[0].en)).toBe("I don't eat");
  });
});

describe('verb panel: the polarity control', () => {
  const change = (slot: SlotOf<'verb'>, value: string) =>
    applyControl(stateOf(slot), 'polarity', value, 'troo').slot as SlotOf<'verb'>;

  it('yes sets negative; no removes the field, so the slot equals the authored one again', () => {
    const on = change(vs('indicative', 'present'), 'negative');
    expect(on.polarity).toBe('negative');
    const off = change(on, 'affirmative');
    expect('polarity' in off).toBe(false);
    expect(off).toEqual(vs('indicative', 'present'));
  });

  it('keeps the polarity when the mood changes', () => {
    const slot = applyControl(stateOf(negative(vs('indicative', 'aorist', 2))), 'mood', 'imperative', 'troo').slot;
    expect(slot).toMatchObject({ mood: 'imperative', tense: 'aorist', polarity: 'negative' });
  });

  it('falls back to affirmative when the negative command is not offered', () => {
    const troo = getVerb('troo');
    const noSubjunctive: GreekVerb = {
      ...troo,
      voices: {
        active: {
          ...(troo.voices.active as NonNullable<GreekVerb['voices']['active']>),
          offers: { indicative: ['present'], imperative: ['aorist'] },
        },
      },
    };
    const next = changeVerbSlot(noSubjunctive, negative(vs('indicative', 'present', 2)), 'mood', 'imperative');
    expect(next.mood).toBe('imperative');
    expect('polarity' in next).toBe(false);
  });
});

describe('verb panel: how to read this', () => {
  it('gives the Greek line, and the Romanian and English lines of a compound form', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'beginner');
    expect(p.reading?.map((l) => l.lang)).toEqual(['el', 'ro', 'en']);
    expect(p.reading?.[0].sentence).toBe(
      'έχω φάει: έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
    );
    expect(p.reading?.[1].sentence).toBe('am mâncat: am = have (auxiliary), mâncat = eaten (never changes).');
    expect(p.reading?.[2].sentence).toBe(
      'I have eaten: have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
  });

  it('uses the technical text in Improver', () => {
    const p = panel('troo', vs('indicative', 'perfect'), 'improver');
    expect(p.reading?.[0].sentence).toBe(
      'Present perfect: έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
    );
    expect(p.reading?.[1].sentence).toContain('Compare Greek έχω φάει.');
  });

  it('a single word has a Greek line only', () => {
    expect(panel('troo', vs('indicative', 'present')).reading?.map((l) => l.lang)).toEqual(['el']);
  });

  it('follows the working slot, not the phrase', () => {
    const p = panel('troo', negative(vs('subjunctive', 'aorist')));
    expect(p.reading?.[0].sentence.startsWith('να μην φάω: να = to / that, μην = not')).toBe(true);
  });
});
