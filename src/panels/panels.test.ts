import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const phrase = PHRASES[0];
const stateFor = (i: number): PanelState => initialState(phrase.tokens[i], phrase);
const panelFor = (i: number, level: Level = 'beginner', state: PanelState = stateFor(i)) =>
  buildPanel(state, phrase.tokens[i], level);
const text = (rows: ReturnType<typeof panelFor>['rows'], i: number) => ({
  el: richText(rows[i].el),
  ro: richText(rows[i].ro),
  en: richText(rows[i].en),
});

describe('initialState', () => {
  it('takes the slot from the token and the noun from agreesWith', () => {
    expect(stateFor(2)).toEqual({ slot: phrase.tokens[2].slot, noun: 'kafes', nounNumber: 'sg' });
  });
  it('has no noun for a verb or a noun', () => {
    expect(stateFor(0).noun).toBeNull();
    expect(stateFor(3).noun).toBeNull();
  });
});

describe('verb panel (θέλω)', () => {
  const panel = panelFor(0);
  it('has lemma, label and the Who?, Mood and When? controls', () => {
    expect(panel.lemma).toBe('θέλω');
    expect(panel.posLabel).toBe('verb: to want');
    expect(panel.controls.map((c) => c.key)).toEqual(['who', 'mood', 'tense', 'polarity']);
    expect(panel.controls[0]).toMatchObject({ key: 'who', label: 'Who?', value: '1sg' });
  });
  it('shows the dropped Greek and Romanian pronouns and the required English one', () => {
    expect(text(panel.rows, 0)).toEqual({ el: '(εγώ) θέλω', ro: '(eu) vreau', en: 'I want' });
    expect(panel.rows[0].el[0].role).toBe('dim');
    expect(panel.rows[0].en[0].role).toBe('pronoun');
  });
  it('follows the person: 3sg', () => {
    const p = panelFor(0, 'beginner', applyControl(stateFor(0), 'who', '3sg'));
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) θέλει', ro: '(el/ea) vrea', en: 'he/she wants' });
  });
  it('uses the technical label for Improver', () => {
    expect(panelFor(0, 'improver').posLabel).toBe('verb · -ω class · active');
  });
  it('names the class of a contracted verb and explains it', () => {
    const token: Token = {
      text: 'πηδάει',
      lexeme: 'pidao',
      slot: { pos: 'verb', person: 3, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    };
    const state: PanelState = { slot: token.slot, noun: null, nounNumber: 'sg' };
    const p = buildPanel(state, token, 'improver');
    expect(p.posLabel).toBe('verb · contracted -άω class · active');
    expect(p.irregular).toContain('Contracted');
    expect(text(p.rows, 0)).toEqual({ el: '(αυτός/ή) πηδάει', ro: '(el/ea) sare', en: 'he/she jumps' });
  });
});

describe('noun panel (καφές)', () => {
  it('shows the definite and indefinite phrases in three languages', () => {
    const panel = panelFor(3);
    expect(panel.lemma).toBe('καφές');
    expect(panel.posLabel).toBe('noun: coffee (masculine)');
    expect(panel.controls.map((c) => c.key)).toEqual(['count', 'case']);
    expect(panel.controls[0].value).toBe('1');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον καφέ', ro: 'cafeaua', en: 'the coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.note).toContain('feminine in Romanian');
  });
  it('explains the dropped ς in the accusative', () => {
    expect(panelFor(3).irregular).toContain('final ς drops');
    expect(panelFor(3, 'beginner', applyControl(stateFor(3), 'case', 'nom')).irregular).toBe('');
  });
  it('"many" shows no plural a / an', () => {
    const panel = panelFor(3, 'beginner', applyControl(stateFor(3), 'count', 'many'));
    expect(text(panel.rows, 0)).toEqual({ el: 'τους καφέδες', ro: 'cafelele', en: 'the coffees' });
    expect(panel.rows[1].label).toBe('a / an');
    expect(richText(panel.rows[1].el)).toBe('none in plural');
    expect(panel.rows[1].el[0].role).toBe('dim');
    expect(panel.controls[0].value).toBe('many');
  });
  it('a number from 2 to 5 shows the counted phrase', () => {
    const panel = panelFor(3, 'beginner', applyControl(stateFor(3), 'count', '3'));
    expect(panel.controls[0].value).toBe('3');
    expect(panel.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    expect(text(panel.rows, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
  });
  it('going back to one clears the count', () => {
    const three = applyControl(stateFor(3), 'count', '3');
    expect(applyControl(three, 'count', '1').slot).toEqual({ pos: 'noun', number: 'sg', case: 'acc' });
  });
  it('describes the Improver label with the Romanian gender', () => {
    expect(panelFor(3, 'improver').posLabel).toBe('noun · masculine · Romanian: cafea (feminine)');
  });
});

describe('adjective panel (ζεστός)', () => {
  it('lists the lemma in three genders and builds noun phrases with the noun it goes with', () => {
    const panel = panelFor(2);
    expect(panel.lemma).toBe('ζεστός / ζεστή / ζεστό');
    expect(panel.posLabel).toBe('adjective: hot');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
    expect(panel.controls[0].value).toBe('kafes');
    expect(text(panel.rows, 0)).toEqual({ el: 'τον ζεστό καφέ', ro: 'cafeaua caldă', en: 'the hot coffee' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν ζεστό καφέ', ro: 'o cafea caldă', en: 'a hot coffee' });
    expect(panel.irregular).toBe('');
  });
  it('follows the genitive', () => {
    const panel = panelFor(2, 'beginner', applyControl(stateFor(2), 'case', 'gen'));
    expect(text(panel.rows, 0)).toEqual({ el: 'του ζεστού καφέ', ro: 'cafelei calde', en: 'of the hot coffee' });
  });
  it('changing the noun changes the gender, in Greek and in Romanian separately', () => {
    const neuter = applyControl(stateFor(2), 'noun', 'paidi');
    expect(neuter.noun).toBe('paidi');
    expect(neuter.slot).toMatchObject({ pos: 'adjective', gender: 'n' });
    expect(text(panelFor(2, 'beginner', neuter).rows, 0)).toEqual({
      el: 'το ζεστό παιδί',
      ro: 'copilul cald',
      en: 'the hot child',
    });
    const feminine = applyControl(stateFor(2), 'noun', 'alepou');
    expect(text(panelFor(2, 'beginner', feminine).rows, 0)).toEqual({
      el: 'την ζεστή αλεπού',
      ro: 'vulpea caldă',
      en: 'the hot fox',
    });
  });
  it('uses the technical class label for Improver', () => {
    expect(panelFor(2, 'improver').posLabel).toBe('adjective · 3-ending (stressed)');
  });
});

describe('numeral panel (ένας … πέντε)', () => {
  it('one: the numeral and the counted noun phrase', () => {
    const panel = panelFor(1);
    expect(panel.lemma).toBe('ένας / μία / ένα');
    expect(panel.posLabel).toBe('article: a / an');
    expect(panel.controls.map((c) => c.key)).toEqual(['value', 'noun', 'case']);
    expect(panel.rows.map((r) => r.label)).toEqual(['number', 'counting']);
    expect(text(panel.rows, 0)).toEqual({ el: 'έναν', ro: 'o', en: 'a / an (one)' });
    expect(text(panel.rows, 1)).toEqual({ el: 'έναν καφέ', ro: 'o cafea', en: 'a coffee' });
    expect(panel.irregular).toContain('changes with gender');
  });
  it('three counts a plural noun and only the neuter differs', () => {
    const panel = panelFor(1, 'beginner', applyControl(stateFor(1), 'value', '3'));
    expect(panel.lemma).toBe('τρεις / τρία');
    expect(panel.posLabel).toBe('number: three');
    expect(text(panel.rows, 0)).toEqual({ el: 'τρεις', ro: 'trei', en: 'three' });
    expect(text(panel.rows, 1)).toEqual({ el: 'τρεις καφέδες', ro: 'trei cafele', en: 'three coffees' });
    expect(panel.irregular).toContain('neuter');
  });
  it('two never changes in Greek, but Romanian follows its own gender', () => {
    const state = applyControl(applyControl(stateFor(1), 'noun', 'alepou'), 'value', '2');
    const panel = panelFor(1, 'beginner', state);
    expect(panel.lemma).toBe('δύο');
    expect(text(panel.rows, 0)).toEqual({ el: 'δύο', ro: 'două', en: 'two' });
    expect(text(panel.rows, 1)).toEqual({ el: 'δύο αλεπούδες', ro: 'două vulpi', en: 'two foxes' });
    expect(panel.irregular).toBe('Does not change at all.');
  });
});

describe('article panel (ο, η, το)', () => {
  const token: Token = {
    text: 'τον',
    lexeme: 'def',
    slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' },
    agreesWith: 0,
  };
  const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };
  it('shows the article with its noun', () => {
    const panel = buildPanel(state, token, 'beginner');
    expect(panel.lemma).toBe('ο / η / το');
    expect(panel.posLabel).toBe('article: the');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
    expect(text(panel.rows, 0)).toEqual({ el: 'τον σκύλο', ro: 'câinele', en: 'the dog' });
  });
});

describe('applyControl and sameState', () => {
  it('sets person and number from a who value', () => {
    expect(applyControl(stateFor(0), 'who', '2pl').slot).toMatchObject({ person: 2, number: 'pl' });
  });
  it('sets the case', () => {
    expect(applyControl(stateFor(3), 'case', 'gen').slot).toMatchObject({ pos: 'noun', case: 'gen' });
  });
  it('sets the value of a numeral', () => {
    expect(applyControl(stateFor(1), 'value', '5').slot).toMatchObject({ pos: 'numeral', value: 5 });
  });
  it('ignores a control that does not apply and returns the same state', () => {
    const state = stateFor(1);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
    expect(applyControl(stateFor(0), 'noun', 'paidi')).toEqual(stateFor(0));
    expect(applyControl(state, 'nonsense', 'x')).toBe(state);
  });
  it('sameState compares by value', () => {
    expect(sameState(stateFor(2), stateFor(2))).toBe(true);
    expect(sameState(stateFor(2), applyControl(stateFor(2), 'case', 'gen'))).toBe(false);
  });
});

describe('preposition panel (πάνω από)', () => {
  const token: Token = { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 0 };
  const state: PanelState = { slot: token.slot, noun: 'skylos', nounNumber: 'sg' };

  it('shows the preposition with the article and noun in the accusative', () => {
    const panel = buildPanel(state, token, 'beginner');
    expect(panel.lemma).toBe('πάνω από');
    expect(panel.posLabel).toBe('preposition: over');
    expect(panel.controls.map((c) => c.key)).toEqual(['noun', 'number']);
    expect(panel.controls[0].label).toBe('Noun after it');
    expect(panel.rows.map((r) => r.label)).toEqual(['prep. + noun']);
    expect(text(panel.rows, 0)).toEqual({ el: 'πάνω από τον σκύλο', ro: 'peste câinele', en: 'over the dog' });
    expect(panel.note).toBe('Masculine in Greek and Romanian.');
  });

  it('follows the noun and its number', () => {
    const feminine = applyControl(state, 'noun', 'alepou');
    expect(feminine.noun).toBe('alepou');
    expect(feminine.slot).toEqual({ pos: 'preposition' });
    expect(text(buildPanel(feminine, token, 'beginner').rows, 0)).toEqual({
      el: 'πάνω από την αλεπού',
      ro: 'peste vulpea',
      en: 'over the fox',
    });
    const plural = applyControl(state, 'number', 'pl');
    expect(plural.nounNumber).toBe('pl');
    expect(text(buildPanel(plural, token, 'beginner').rows, 0)).toEqual({
      el: 'πάνω από τους σκύλους',
      ro: 'peste câinii',
      en: 'over the dogs',
    });
  });

  it('uses the technical label for Improver', () => {
    expect(buildPanel(state, token, 'improver').posLabel).toBe('preposition · governs the accusative');
  });

  it('initialState takes the governed noun and its number from the phrase', () => {
    const governed: Token = {
      text: 'σκύλο',
      lexeme: 'skylos',
      slot: { pos: 'noun', number: 'sg', case: 'acc' },
    };
    const mini = { ...PHRASES[0], tokens: [governed, token] };
    expect(initialState(token, mini)).toEqual({ slot: token.slot, noun: 'skylos', nounNumber: 'sg' });
  });
});
