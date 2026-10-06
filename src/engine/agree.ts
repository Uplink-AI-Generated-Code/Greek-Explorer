import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
import type { Case, GreekAdjective, GreekNoun, Num, NumeralValue, SlotOf } from '../types';
import { accentForm } from './compose';
import { enIndefiniteArticle, enNoun, enNumeral } from './english';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
import { enPossessive, greekPossessive, roPossessive } from './possessive';
import { roAdjective, roNoun, roNumeral } from './romanian';
import { articleRich, formRich, formText, joinRich, numeralRich, type Rich } from './segments';
import { secondAccent } from './stress';

export interface NpOptions {
  /** The possessor after the noun (το σπίτι μου); the article is the definite one. */
  possessor?: SlotOf<'possessive'>;
  article?: 'definite' | 'one';
  /** A counted plural: τρεις καφέδες. Cannot be combined with `article`. */
  count?: Exclude<NumeralValue, 1>;
  adjective?: GreekAdjective;
}

export interface NounPhrase {
  el: Rich;
  ro: string;
  en: string;
}

/** Builds article or count + adjective + noun in all three languages, agreeing in gender, number and case. */
export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
  if (opts.article && opts.count) throw new Error('A noun phrase has an article or a count, not both');
  if (opts.possessor && opts.article !== 'definite') throw new Error('A possessive goes with the definite article');
  if (opts.article === 'one' && number === 'pl') throw new Error('Greek has no plural indefinite article');
  if (opts.count && number !== 'pl') throw new Error('A counted noun phrase is plural');
  const gender = noun.gender;

  const el: Rich[] = [];
  if (opts.article === 'definite') {
    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })));
  }
  if (opts.article === 'one') {
    el.push(numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: 1, gender, case: c })));
  }
  if (opts.count) {
    el.push(numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: opts.count, gender, case: c })));
  }
  if (opts.adjective) {
    el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
  }
  // The stress rule of commands applies to the noun and the pronoun together: θάλασσα μου → θάλασσά μου.
  let nounForm = inflectNoun(noun, { pos: 'noun', number, case: c });
  if (opts.possessor) {
    const accent = secondAccent([formText(nounForm), greekPossessive(opts.possessor)]);
    if (accent && accent.word === 0) nounForm = accentForm(nounForm, accent.at);
  }
  el.push(formRich(nounForm));
  if (opts.possessor) el.push([{ text: greekPossessive(opts.possessor), role: 'clitic' }]);

  const roAdj = opts.adjective ? roAdjective(opts.adjective, noun.ro.gender, number, c) : '';
  const roText = opts.count
    ? [roNumeral(NUMERAL, opts.count, noun.ro.gender, c), noun.ro.forms.pl.indefinite, roAdj]
    : [
        roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'),
        opts.possessor ? roPossessive(opts.possessor, noun, number, c) : '',
        roAdj,
      ];

  const core = [opts.adjective?.en, enNoun(noun, number)].filter(Boolean).join(' ');
  const word = opts.count
    ? enNumeral(NUMERAL, opts.count)
    : opts.possessor
      ? enPossessive(opts.possessor)
      : opts.article === 'definite'
        ? 'the'
        : opts.article === 'one'
          ? enIndefiniteArticle(core)
          : '';
  const enText = [word, core].filter(Boolean).join(' ');

  return { el: joinRich(el), ro: roText.filter(Boolean).join(' '), en: c === 'gen' ? `of ${enText}` : enText };
}
