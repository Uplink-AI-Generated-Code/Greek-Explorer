import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate } from '../validate/validate';
import { PHRASES } from './phrases';

const phrase = (id: string) => {
  const found = PHRASES.find((p) => p.id === id);
  if (!found) throw new Error(`no phrase ${id}`);
  return found;
};
const gloss = (id: string, language: 'en' | 'ro', kind: 'natural' | 'literal') =>
  phrase(id)
    .glosses.find((g) => g.language === language && g.kind === kind)!
    .units.map(unitText)
    .join(' ');

const QUESTIONS = [
  'what-do-you-want', 'where-are-you-going', 'when-will-you-eat', 'why-arent-you-eating', 'how-are-you', 'who-is-it',
  'how-much-bread', 'where-are-you-from', 'until-when-will-you-go', 'what-time-is-it', 'how-much-is-it',
];
const HORTATIVES = ['lets-eat', 'let-him-eat', 'lets-not-go'];

describe('phrases 40 to 53', () => {
  it('validate against the data', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are in the Questions theme (40 to 50) and Wishes and possibility (51 to 53)', () => {
    expect(QUESTIONS.map((id) => phrase(id).theme)).toEqual(QUESTIONS.map(() => 'Questions'));
    expect(HORTATIVES.map((id) => phrase(id).theme)).toEqual(HORTATIVES.map(() => 'Wishes and possibility'));
  });

  it('the questions read as the spec says, in the three languages', () => {
    const read = (id: string) => [
      phrase(id).tokens.map((t) => t.text).join(' '),
      gloss(id, 'en', 'natural'),
      gloss(id, 'ro', 'natural'),
    ];
    expect(read('what-do-you-want')).toEqual(['Τι θέλεις;', 'What do you want?', 'Ce vrei?']);
    expect(read('where-are-you-going')).toEqual(['Πού πας;', 'Where are you going?', 'Unde mergi?']);
    expect(read('when-will-you-eat')).toEqual(['Πότε θα φας;', 'When will you eat?', 'Când vei mânca?']);
    expect(read('why-arent-you-eating')).toEqual(['Γιατί δεν τρως;', "Why aren't you eating?", 'De ce nu mănânci?']);
    expect(read('how-are-you')).toEqual(['Πώς είσαι;', 'How are you?', 'Cum ești?']);
    expect(read('who-is-it')).toEqual(['Ποιος είναι;', 'Who is it?', 'Cine este?']);
    expect(read('how-much-bread')).toEqual(['Πόσο ψωμί θέλεις;', 'How much bread do you want?', 'Câtă pâine vrei?']);
    expect(read('where-are-you-from')).toEqual(['Από πού είσαι;', 'Where are you from?', 'De unde ești?']);
    expect(read('until-when-will-you-go')).toEqual(['Μέχρι πότε θα πας;', 'Until when will you go?', 'Până când vei merge?']);
    expect(read('what-time-is-it')).toEqual(['Τι ώρα είναι;', 'What time is it?', 'Ce oră este?']);
    expect(read('how-much-is-it')).toEqual(['Πόσο κάνει;', 'How much is it?', 'Cât costă?']);
  });

  it('the hortatives read as the spec says', () => {
    const read = (id: string) => [phrase(id).tokens[0].text, gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('lets-eat')).toEqual(['Ας φάμε!', "Let's eat!", 'Să mâncăm!']);
    expect(read('let-him-eat')).toEqual(['Ας φάει.', 'Let him / her eat.', 'Să mănânce.']);
    expect(read('lets-not-go')).toEqual(['Ας μην πάμε.', "Let's not go.", 'Să nu mergem.']);
  });

  it('the literal rows show what each language builds from', () => {
    expect(gloss('where-are-you-from', 'en', 'literal')).toBe('from where (you) are');
    expect(gloss('what-time-is-it', 'en', 'literal')).toBe('what hour is');
    expect(gloss('how-much-is-it', 'en', 'literal')).toBe('how-much (it) does');
    expect(gloss('how-much-is-it', 'ro', 'literal')).toBe('cât (el) face');
    expect(gloss('lets-not-go', 'en', 'literal')).toBe('let not (we) go');
  });

  it('keep the compound questions as separate tokens, each with its own gloss link', () => {
    const from = phrase('where-are-you-from');
    expect(from.tokens.map((t) => t.lexeme)).toEqual(['apo', 'pou', 'eimai']);
    const linked = from.glosses[1].units.flatMap((u) => ('link' in u && u.link !== null ? [u.link] : []));
    expect(linked).toEqual([0, 1, 2]);
    expect(phrase('what-time-is-it').tokens.map((t) => t.lexeme)).toEqual(['ti', 'ora', 'eimai']);
  });

  it('show the unlinked "do" of an English question as a dropped word', () => {
    const units = phrase('what-do-you-want').glosses[0].units;
    expect(units.find((u) => 'text' in u && u.text === 'do')).toEqual({ text: 'do', link: null });
  });

  it('Ποιος είναι; has no noun token and Πόσο κάνει; is the price idiom', () => {
    expect(phrase('who-is-it').tokens[0].agreesWith).toBeUndefined();
    expect(phrase('how-much-is-it').tokens.map((t) => t.lexeme)).toEqual(['posos', 'kano']);
  });
});
