import type { GreekAdverb, GreekInterrogative, GreekNoun, GreekPreposition, Num, PrepSense, PrepositionSense } from '../types';

/** The meaning in use for a preposition that has meanings (σε): the one asked for, else the first; undefined for any other preposition. */
export function senseOf(prep: GreekPreposition, sense?: PrepSense): PrepositionSense | undefined {
  if (!prep.senses) return undefined;
  return prep.senses.find((s) => s.value === sense) ?? prep.senses[0];
}

/** The feminine singular keeps its final ν (στην) in front of a vowel and κ π τ ξ ψ γκ μπ ντ τσ τζ, and drops it in front of any other consonant (στη θάλασσα). */
export const KEEPS_FINAL_N = /^(?:[αεηιουωάέήίόύώ]|[κπτξψ]|γκ|μπ|ντ|τσ|τζ)/;

/**
 * The preposition and the article of the noun, written as one word (σε + το = στο); undefined for a preposition that
 * does not fuse. Given the word that follows, the feminine singular loses its ν where Greek drops it (στη θάλασσα).
 */
export function fusedForm(prep: GreekPreposition, noun: GreekNoun, number: Num, next?: string): string | undefined {
  const form = prep.fused?.[noun.gender][number];
  if (!form || next === undefined || noun.gender !== 'f' || number !== 'sg' || !form.endsWith('ν')) return form;
  return KEEPS_FINAL_N.test(next.toLowerCase()) ? form : form.slice(0, -1);
}

/** The two parts of a fused word, as the phrase bar shows them: the preposition's σ and the article (στον → σ + τον). */
export const splitFused = (text: string): [preposition: string, article: string] => [text.slice(0, 1), text.slice(1)];

/**
 * Whether a preposition may stand before a question word or a place word: only the prepositions the word's `roAfter`
 * names, with the Romanian words they make (από πού, μέχρι πότε, από τι: de unde, până când, din ce; not με πώς).
 */
export const governsWord = (prep: GreekPreposition, word: GreekInterrogative | GreekAdverb): boolean =>
  !prep.fused && word.roAfter?.[prep.id] !== undefined;
