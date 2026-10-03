import { DEF_ARTICLE, ONE } from '../data/lexemes';
import type { Case, GreekAdjective, GreekNoun, Num } from '../types';
import { enIndefiniteArticle, enNoun } from './english';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
import { roAdjective, roNoun } from './romanian';
import { articleRich, formRich, joinRich, numeralRich, type Rich } from './segments';

export interface NpOptions {
  article?: 'definite' | 'one';
  adjective?: GreekAdjective;
}

export interface NounPhrase {
  el: Rich;
  ro: string;
  en: string;
}

/** Builds article + adjective + noun in all three languages, agreeing in gender, number and case. */
export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
  if (opts.article === 'one' && number === 'pl') {
    throw new Error('Greek has no plural indefinite article');
  }
  const gender = noun.gender;

  const el: Rich[] = [];
  if (opts.article === 'definite') {
    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })));
  }
  if (opts.article === 'one') {
    el.push(numeralRich(inflectNumeral(ONE, { pos: 'numeral', value: 1, gender, case: c })));
  }
  if (opts.adjective) {
    el.push(formRich(inflectAdjective(opts.adjective, { pos: 'adjective', gender, number, case: c })));
  }
  el.push(formRich(inflectNoun(noun, { pos: 'noun', number, case: c })));

  const roNounText = roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite');
  const ro = opts.adjective
    ? `${roNounText} ${roAdjective(opts.adjective, noun.ro.gender, number, c)}`
    : roNounText;

  const core = [opts.adjective?.en, enNoun(noun, number)].filter(Boolean).join(' ');
  const article =
    opts.article === 'definite' ? 'the' : opts.article === 'one' ? enIndefiniteArticle(core) : '';
  const enText = [article, core].filter(Boolean).join(' ');

  return { el: joinRich(el), ro, en: c === 'gen' ? `of ${enText}` : enText };
}
