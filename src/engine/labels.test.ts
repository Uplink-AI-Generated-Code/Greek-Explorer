import { describe, expect, it } from 'vitest';
import { EN_PRONOUNS, GENDER_NAME, GREEK_PRONOUNS, RO_PRONOUNS, caseOptions, moodLabel, moodOptions, numberOptions, tenseLabel, tenseOptions, voiceOptions, whoOptions, whoOptionsFor } from './labels';

describe('labels', () => {
  it('uses plain case names for Beginner', () => {
    expect(caseOptions('beginner')).toEqual([
      { value: 'nom', label: 'subject' },
      { value: 'acc', label: 'object' },
      { value: 'gen', label: 'possessor' },
    ]);
  });
  it('uses technical case names for Improver', () => {
    expect(caseOptions('improver').map((o) => o.label)).toEqual(['nominative', 'accusative', 'genitive']);
  });
  it('has number options with plain labels', () => {
    expect(numberOptions).toEqual([
      { value: 'sg', label: 'one' },
      { value: 'pl', label: 'many' },
    ]);
  });
  it('has six who-options in person order', () => {
    expect(whoOptions.map((o) => o.value)).toEqual(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']);
    expect(whoOptions[2].label).toBe('he / she');
  });
  it('has six pronouns per language and gender names', () => {
    expect(GREEK_PRONOUNS).toHaveLength(6);
    expect(RO_PRONOUNS).toHaveLength(6);
    expect(EN_PRONOUNS).toHaveLength(6);
    expect(GREEK_PRONOUNS[0]).toBe('εγώ');
    expect(RO_PRONOUNS[0]).toBe('eu');
    expect(EN_PRONOUNS[0]).toBe('I');
    expect(GENDER_NAME.n).toBe('neuter');
  });
});

describe('verb labels', () => {
  it('names moods for each level', () => {
    expect(moodLabel('beginner', 'subjunctive')).toBe('wish or possibility');
    expect(moodLabel('improver', 'subjunctive')).toBe('subjunctive');
    expect(moodOptions('beginner', ['indicative', 'conditional']).map((o) => o.label)).toEqual(['a fact', 'would']);
  });
  it('names tenses for each level', () => {
    expect(tenseLabel('beginner', 'indicative', 'aorist')).toBe('did (once)');
    expect(tenseLabel('improver', 'indicative', 'aorist')).toBe('aorist');
    expect(tenseLabel('improver', 'indicative', 'future')).toBe('future (continuous)');
    expect(tenseOptions('improver', 'imperative', ['present', 'aorist']).map((o) => o.label)).toEqual([
      'present (keep doing)', 'aorist (do it once)',
    ]);
  });
  it('names voices and persons', () => {
    expect(voiceOptions('beginner', ['active', 'mediopassive']).map((o) => o.label)).toEqual(['doing it', 'done to oneself']);
    expect(whoOptionsFor(['2sg', '2pl']).map((o) => o.label)).toEqual(['you', 'you (pl.)']);
  });
});
