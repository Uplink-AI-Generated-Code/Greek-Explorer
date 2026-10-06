import type { GreekNoun, GreekPreposition, Num, PrepSense, PrepositionSense } from '../types';

/** The meaning in use for a preposition that has meanings (σε): the one asked for, else the first; undefined for any other preposition. */
export function senseOf(prep: GreekPreposition, sense?: PrepSense): PrepositionSense | undefined {
  if (!prep.senses) return undefined;
  return prep.senses.find((s) => s.value === sense) ?? prep.senses[0];
}

/** The preposition and the article of the noun, written as one word (σε + το = στο); undefined for a preposition that does not fuse. */
export const fusedForm = (prep: GreekPreposition, noun: GreekNoun, number: Num): string | undefined =>
  prep.fused?.[noun.gender][number];

/** The two parts of a fused word, as the phrase bar shows them: the preposition's σ and the article (στον → σ + τον). */
export const splitFused = (text: string): [preposition: string, article: string] => [text.slice(0, 1), text.slice(1)];
