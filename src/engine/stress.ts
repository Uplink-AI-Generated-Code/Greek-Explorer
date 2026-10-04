/** Greek stress for the clitic rule (spec 4.3): syllables, the stressed syllable, and the second accent. */

const ACUTE: Record<string, string> = { α: 'ά', ε: 'έ', η: 'ή', ι: 'ί', ο: 'ό', υ: 'ύ', ω: 'ώ' };
const ACCENTED = new Set(['ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ΐ', 'ΰ']);
const DIAERESIS = new Set(['ϊ', 'ϋ', 'ΐ', 'ΰ']);
const BASE: Record<string, string> = {
  ά: 'α', έ: 'ε', ή: 'η', ί: 'ι', ό: 'ο', ύ: 'υ', ώ: 'ω', ϊ: 'ι', ϋ: 'υ', ΐ: 'ι', ΰ: 'υ',
};
const VOWELS = new Set(['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']);

const baseOf = (ch: string): string => BASE[ch] ?? ch;
const isVowel = (ch: string): boolean => VOWELS.has(baseOf(ch));

/** Do two neighbouring vowels make one syllable? A diphthong (αι ει οι υι, αυ ευ ου), or an unaccented ι before a vowel. */
function merges(prev: string, next: string): boolean {
  if (DIAERESIS.has(next) || ACCENTED.has(prev)) return false;
  const a = baseOf(prev);
  const b = baseOf(next);
  if (a === 'ι') return true;
  if (b === 'υ') return a === 'α' || a === 'ε' || a === 'η' || a === 'ο';
  if (b === 'ι') return a === 'α' || a === 'ε' || a === 'ο' || a === 'υ';
  return false;
}

export interface Syllable {
  /** Which word of the unit (0 is the verb). */
  word: number;
  /** The index of the letter that takes an accent in that word (the last vowel of the syllable). */
  at: number;
  /** Whether the syllable carries an accent mark. */
  stressed: boolean;
}

/** The syllables of a unit written as words (the verb, then its pronouns). */
export function syllables(words: readonly string[]): Syllable[] {
  const out: Syllable[] = [];
  words.forEach((word, w) => {
    let last = -1;
    const chars = [...word.toLowerCase()];
    chars.forEach((ch, i) => {
      if (!isVowel(ch)) {
        last = -1;
        return;
      }
      const current = out[out.length - 1];
      if (last >= 0 && current && merges(chars[last], ch)) {
        current.at = i;
        current.stressed = current.stressed || ACCENTED.has(ch);
      } else {
        out.push({ word: w, at: i, stressed: ACCENTED.has(ch) });
      }
      last = i;
    });
  });
  return out;
}

/**
 * Greek stress may not fall further back than the third-last syllable of the whole unit. When the verb's stress
 * would be on the fourth-last syllable or further back, a second accent is written two syllables after it. Returns
 * the word and the letter that take it, or null when no second accent is needed.
 */
export function secondAccent(words: readonly string[]): { word: number; at: number } | null {
  const all = syllables(words);
  let stressed = all.findIndex((s) => s.word === 0 && s.stressed);
  // A one-syllable verb is written without an accent mark but is stressed.
  if (stressed < 0 && all.filter((s) => s.word === 0).length === 1) stressed = 0;
  if (stressed < 0 || all.length - stressed < 4) return null;
  const target = all[stressed + 2];
  return { word: target.word, at: target.at };
}

/** The word with an acute accent on the letter at `at`. */
export function accentAt(word: string, at: number): string {
  const chars = [...word];
  chars[at] = ACUTE[chars[at]] ?? chars[at];
  return chars.join('');
}
