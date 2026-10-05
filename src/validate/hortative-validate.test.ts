import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekVerb } from '../types';
import { validate } from './validate';

const echo = LEXEMES.echo as GreekVerb;

describe('the hortative in the validator', () => {
  it('accepts the real data', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });

  it('refuses a hortative on a verb that does not offer the subjunctive present and aorist', () => {
    const bad: GreekVerb = {
      ...echo,
      voices: { active: { ...echo.voices.active!, offers: { ...echo.voices.active!.offers, hortative: ['present', 'aorist'] } } },
    };
    const errors = validate({ lexemes: { ...LEXEMES, echo: bad }, phrases: [] });
    expect(errors).toContain('lexeme echo: the active voice offers the hortative but not the subjunctive present and aorist');
  });
});
