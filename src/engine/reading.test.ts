import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Mood, Num, Person, SlotOf, Tense, Voice } from '../types';
import { readingFor } from './reading';

const vs = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): SlotOf<'verb'> => ({ pos: 'verb', person, number, mood, tense, voice });
const neg = (slot: SlotOf<'verb'>): SlotOf<'verb'> => ({ ...slot, polarity: 'negative' });
const greek = (id: string, slot: SlotOf<'verb'>) => readingFor(getVerb(id), slot).el;

describe('readingFor: the parts', () => {
  it('takes έχω φάει apart: the auxiliary, the stem and the ending that never changes', () => {
    const { parts } = greek('troo', vs('indicative', 'perfect'));
    expect(parts).toEqual([
      { text: 'έχω', label: 'έχω', role: 'auxiliary', gloss: 'I have', piece: 0 },
      { text: 'φά', label: 'φά-', role: 'stem', gloss: 'eat', piece: 1 },
      { text: 'ει', label: '-ει', role: 'ending', gloss: 'never changes after έχω', piece: 1 },
    ]);
  });

  it('separates the augment: έτρωγα', () => {
    const { parts } = greek('troo', vs('indicative', 'imperfect'));
    expect(parts.map((p) => [p.label, p.role, p.gloss])).toEqual([
      ['έ-', 'augment', 'in the past'],
      ['τρωγ-', 'stem', 'eat'],
      ['-α', 'ending', 'I, in the past (was doing)'],
    ]);
  });

  it('names the particle and the negation, and the person of the auxiliary', () => {
    const { parts } = greek('troo', neg(vs('indicative', 'futurePerfect', 3)));
    expect(parts.slice(0, 3).map((p) => [p.text, p.role, p.gloss, p.piece])).toEqual([
      ['δεν', 'negation', 'not', 0],
      ['θα', 'particle', 'will', 1],
      ['έχει', 'auxiliary', 'he/she has', 2],
    ]);
  });

  it('θα with a past tense means "would"', () => {
    expect(greek('thelo', vs('conditional', 'imperfect')).parts[0]).toMatchObject({ text: 'θα', gloss: 'would' });
  });

  it('every part has a gloss, for every offered slot of every verb, in both polarities', () => {
    for (const id of ['thelo', 'pidao', 'troo', 'pao', 'echo', 'pleno', 'koimamai', 'mporei']) {
      const verb = getVerb(id);
      for (const voice of Object.keys(verb.voices) as Voice[]) {
        const offers = verb.voices[voice]?.offers ?? {};
        for (const mood of Object.keys(offers) as Mood[]) {
          for (const tense of offers[mood] ?? []) {
            // The imperative is for the second person; every other slot is tried in the third person singular.
            const slot = vs(mood, tense, mood === 'imperative' ? 2 : 3, 'sg', voice);
            for (const s of [slot, neg(slot)]) {
              if (s.polarity === 'negative' && mood === 'imperative' && !(verb.voices[voice]?.offers.subjunctive ?? []).includes(tense)) {
                continue;
              }
              for (const part of greek(id, s).parts) expect(part.gloss, `${id} ${mood} ${tense} ${part.text}`).not.toBe('');
            }
          }
        }
      }
    }
  });
});

describe('readingFor: the sentences', () => {
  it('Beginner and Improver for a compound form', () => {
    const line = greek('troo', vs('indicative', 'futurePerfect'));
    expect(line.beginner).toBe(
      'θα έχω φάει: θα = will, έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
    );
    expect(line.improver).toBe(
      'Future perfect: θα + έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
    );
  });

  it('a single word with an augment', () => {
    const line = greek('troo', vs('indicative', 'imperfect'));
    expect(line.beginner).toBe('έτρωγα: έ- = in the past, τρωγ- = eat, -α = I, in the past (was doing).');
    expect(line.improver).toBe('Imperfect: imperfect form (augment έ- + stem τρωγ- + ending -α).');
  });

  it('the Beginner text has no grammar terms from the fixed list', () => {
    const terms = /aorist|subjunctive|imperfect|pluperfect|accusative|genitive|nominative|augment|perfective/i;
    for (const [mood, tense] of [
      ['indicative', 'present'], ['indicative', 'imperfect'], ['indicative', 'aorist'], ['indicative', 'futureSimple'],
      ['indicative', 'perfect'], ['indicative', 'futurePerfect'], ['subjunctive', 'aorist'], ['subjunctive', 'perfect'],
      ['conditional', 'pluperfect'],
    ] as const) {
      expect(greek('troo', vs(mood, tense)).beginner, `${mood} ${tense}`).not.toMatch(terms);
    }
  });

  it('a negated form: δεν goes in front, in the sentence too', () => {
    const line = greek('troo', neg(vs('indicative', 'perfect')));
    expect(line.beginner.startsWith('δεν έχω φάει: δεν = not, έχω = I have')).toBe(true);
    expect(line.improver.startsWith('Negative present perfect: δεν + έχω (present 1sg of έχω)')).toBe(true);
  });

  it('a negative command says that Greek leaves the imperative', () => {
    const line = greek('troo', neg(vs('imperative', 'aorist', 2, 'pl')));
    expect(line.beginner).toBe(
      'μην φάτε: μην = not, φά- = eat, -τε = you (pl.), once. To forbid something, Greek uses μην + the "you" form of the να-verb, not the command form.',
    );
    expect(line.improver).toBe(
      'Negative imperative aorist (do it once): μην + aorist-subjunctive form (stem φά- + ending -τε). The subjunctive replaces the imperative.',
    );
  });
});

describe('readingFor: irregular forms use the authored template of their rule', () => {
  it('stress-shift: τρώγαμε', () => {
    const line = greek('troo', vs('indicative', 'imperfect', 1, 'pl'));
    expect(line.beginner).toBe(
      'τρώγαμε: τρώγ- = eat, -αμε = we, in the past (was doing). In the "we" and "you (pl.)" forms the stress moves toward the end of the word, so the past-tense prefix drops out and the stem takes the accent.',
    );
    expect(line.improver).toContain('the stem takes the accent.');
  });

  it('stress-shift: πλένονταν keeps the stress on the stem', () => {
    const line = greek('pleno', vs('indicative', 'imperfect', 3, 'pl', 'mediopassive'));
    expect(line.beginner).toContain('the stress stays on the stem');
    expect(line.beginner).not.toContain('moves toward the end');
  });

  it('stress-shift: πλενόμαστε is not described as a past form', () => {
    const line = greek('pleno', vs('indicative', 'present', 1, 'pl', 'mediopassive'));
    expect(line.beginner).not.toContain('past forms');
    expect(line.improver).not.toContain('past forms');
  });

  it('monosyllable: τρως', () => {
    const line = greek('troo', vs('indicative', 'present', 2));
    expect(line.beginner).toBe('τρως: τρω- = eat, -ς = you, present form. A word of one syllable loses its accent mark.');
  });

  it('old stem: τρώγε', () => {
    const line = greek('troo', vs('imperative', 'present', 2));
    expect(line.beginner).toBe(
      'τρώγε: τρώγ- = eat, -ε = a command to you: keep doing. This command keeps the older stem τρώγ- (with γ).',
    );
  });

  it('a template and the negative-command sentence combine: μην φας', () => {
    const line = greek('troo', neg(vs('imperative', 'aorist', 2, 'sg')));
    const sentences = line.beginner.split('. ');
    expect(sentences).toHaveLength(2);
    expect(line.beginner).toContain('To forbid something');
    expect(line.improver.startsWith('Negative imperative aorist')).toBe(true);
  });

  it('a negative irregular form names the tense in the Improver wording', () => {
    const line = greek('troo', neg(vs('indicative', 'imperfect', 1, 'pl')));
    expect(line.improver.startsWith('Negative imperfect')).toBe(true);
  });

  it('English glosses the last word of the group as the lexical verb', () => {
    const { en } = readingFor(getVerb('echo'), vs('indicative', 'future'));
    expect(en?.beginner).toContain('I will have: ');
    expect(en?.beginner).toContain('have = have (the verb)');
    expect(en?.beginner).toContain('will = will (the future)');
  });
});

const lines = (id: string, slot: SlotOf<'verb'>) => readingFor(getVerb(id), slot);

describe('readingFor: the Romanian line', () => {
  it('takes aș fi mâncat apart', () => {
    const { ro } = lines('troo', vs('conditional', 'pluperfect'));
    expect(ro?.parts.map((p) => [p.text, p.gloss, p.role, p.piece])).toEqual([
      ['aș', 'would', 'word', null],
      ['fi', 'be', 'word', null],
      ['mâncat', 'eaten (never changes)', 'word', null],
    ]);
    expect(ro?.beginner).toBe('aș fi mâncat: aș = would, fi = be, mâncat = eaten (never changes).');
    expect(ro?.improver).toBe(
      'aș fi mâncat: aș = would, fi = be, mâncat = eaten (never changes). Compare Greek θα είχα φάει.',
    );
  });

  it('the perfect, the future and the subjunctive', () => {
    expect(lines('troo', vs('indicative', 'perfect')).ro?.beginner).toBe(
      'am mâncat: am = have (auxiliary), mâncat = eaten (never changes).',
    );
    expect(lines('troo', vs('indicative', 'futureSimple')).ro?.beginner).toBe('voi mânca: voi = will, mânca = eat.');
    expect(lines('troo', vs('subjunctive', 'aorist')).ro?.beginner).toBe(
      'să mănânc: să = that / to, mănânc = eat.',
    );
  });

  it('negation adds nu', () => {
    expect(lines('troo', neg(vs('indicative', 'perfect'))).ro?.beginner).toBe(
      'nu am mâncat: nu = not, am = have (auxiliary), mâncat = eaten (never changes).',
    );
    expect(lines('troo', neg(vs('subjunctive', 'aorist'))).ro?.beginner).toBe(
      'să nu mănânc: să = that / to, nu = not, mănânc = eat.',
    );
    expect(lines('troo', neg(vs('imperative', 'aorist', 2, 'sg'))).ro?.beginner).toBe('nu mânca: nu = not, mânca = eat.');
    expect(lines('troo', neg(vs('imperative', 'aorist', 2, 'pl'))).ro?.beginner).toBe(
      'nu mâncați: nu = not, mâncați = eat (you, pl.).',
    );
  });

  it('a reflexive perfect is two words: m-am spălat', () => {
    expect(lines('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive')).ro?.beginner).toBe(
      'm-am spălat: m-am = have (auxiliary), spălat = washed (never changes).',
    );
  });

  it('has no line for a form of one word', () => {
    expect(lines('troo', vs('indicative', 'present')).ro).toBeUndefined();
    expect(lines('troo', vs('indicative', 'pluperfect')).ro).toBeUndefined();
    expect(lines('troo', vs('imperative', 'aorist', 2)).ro).toBeUndefined();
  });
});

describe('readingFor: the English line', () => {
  it('takes I will have eaten apart', () => {
    const { en } = lines('troo', vs('indicative', 'futurePerfect'));
    expect(en?.beginner).toBe(
      'I will have eaten: will = will (the future), have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
    expect(en?.improver).toBe(
      'I will have eaten: will = will (the future), have = have (auxiliary), eaten = eaten (past participle: never changes). Compare Greek θα έχω φάει.',
    );
  });

  it('negative forms: the contraction carries the "not"', () => {
    expect(lines('troo', neg(vs('indicative', 'present'))).en?.beginner).toBe(
      "I don't eat: don't = do (auxiliary), not, eat = eat (the verb).",
    );
    expect(lines('troo', neg(vs('imperative', 'aorist', 2))).en?.beginner).toBe(
      "don't eat: don't = do (auxiliary), not, eat = eat (the verb).",
    );
  });

  it('the subjunctive keeps its "that"; the reflexive "self" word stays out of the parts', () => {
    expect(lines('troo', vs('subjunctive', 'aorist')).en?.beginner).toBe('that I eat: that = that, eat = eat (the verb).');
    expect(lines('troo', vs('subjunctive', 'perfect')).en?.beginner).toBe(
      'I may have eaten: may = may (a possibility), have = have (auxiliary), eaten = eaten (past participle: never changes).',
    );
    expect(lines('pleno', vs('indicative', 'perfect', 1, 'sg', 'mediopassive')).en?.beginner).toBe(
      'I have washed (myself): have = have (auxiliary), washed = washed (past participle: never changes).',
    );
  });

  it('has no line for a form of one word', () => {
    expect(lines('troo', vs('indicative', 'present')).en).toBeUndefined();
    expect(lines('troo', vs('indicative', 'aorist')).en).toBeUndefined();
  });
});
