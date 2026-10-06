import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
import type { Case, Form, GreekAdjective, GreekNoun, Num, NumeralValue, SlotOf } from '../types';
import { accentForm } from './compose';
import { enIndefiniteArticle, enNoun, enNumeral } from './english';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';
import { enAlone, enOwn, enPossessive, greekPossessive, roAlone, roBareNoun, roOwn, roPossessive } from './possessive';
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
  /** A noun possessor in the genitive after the noun (το σπίτι του παιδιού); the possessor is singular and definite. */
  owner?: GreekNoun;
}

export interface NounPhrase {
  el: Rich;
  ro: string;
  en: string;
}

/**
 * The noun as it is written before a possessive. The stress rule of commands applies to the noun and the pronoun
 * together: θάλασσα μου → θάλασσά μου (spec 4.3).
 */
export function possessedNounForm(noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): Form {
  const form = inflectNoun(noun, { pos: 'noun', number, case: c });
  const accent = secondAccent([formText(form), greekPossessive(possessor)]);
  return accent && accent.word === 0 ? accentForm(form, accent.at) : form;
}

/** Builds article or count + adjective + noun in all three languages, agreeing in gender, number and case. */
export function nounPhrase(noun: GreekNoun, number: Num, c: Case, opts: NpOptions = {}): NounPhrase {
  if (opts.article && opts.count) throw new Error('A noun phrase has an article or a count, not both');
  if (opts.possessor && opts.article !== 'definite') throw new Error('A possessive goes with the definite article');
  if (opts.owner && (opts.article !== 'definite' || opts.possessor || opts.adjective)) {
    throw new Error('A noun possessor goes with the definite article alone, with no possessive or adjective');
  }
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
  el.push(formRich(opts.possessor ? possessedNounForm(noun, number, c, opts.possessor) : inflectNoun(noun, { pos: 'noun', number, case: c })));
  if (opts.possessor) el.push([{ text: greekPossessive(opts.possessor), role: 'clitic' }]);
  if (opts.owner) {
    el.push(articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: opts.owner.gender, number: 'sg', case: 'gen' })));
    el.push(formRich(inflectNoun(opts.owner, { pos: 'noun', number: 'sg', case: 'gen' })));
  }

  const roAdj = opts.adjective ? roAdjective(opts.adjective, noun.ro.gender, number, c) : '';
  const roText = opts.count
    ? [roNumeral(NUMERAL, opts.count, noun.ro.gender, c), noun.ro.forms.pl.indefinite, roAdj]
    : [
        roNoun(noun, number, c, opts.article === 'definite' ? 'definite' : 'indefinite'),
        opts.possessor ? roPossessive(opts.possessor, noun, number, c) : '',
        opts.owner ? roNoun(opts.owner, 'sg', 'gen', 'definite') : '',
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
  // The child's house: the possessor takes the place of the article.
  const enText = opts.owner ? `the ${opts.owner.en.sg}'s ${core}` : [word, core].filter(Boolean).join(' ');

  return { el: joinRich(el), ro: roText.filter(Boolean).join(' '), en: c === 'gen' ? `of ${enText}` : enText };
}

/**
 * δικός before the noun: το δικό μου σπίτι, *propria mea casă*, "my own house". The possessive stands between the
 * adjective and the noun, which takes no second accent. Nominative and accusative only (spec 24).
 */
export function ownPhrase(adj: GreekAdjective, noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): NounPhrase {
  const gender = noun.gender;
  const el = joinRich([
    articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })),
    formRich(inflectAdjective(adj, { pos: 'adjective', gender, number, case: c })),
    [{ text: greekPossessive(possessor), role: 'clitic' }],
    formRich(inflectNoun(noun, { pos: 'noun', number, case: c })),
  ]);
  const ro = [roOwn(noun, number), roPossessive(possessor, noun, number, c), roBareNoun(noun, number)].join(' ');
  return { el, ro, en: `${enOwn(possessor)} ${enNoun(noun, number)}` };
}

/** δικός on its own, with the article: το δικό μου (*al meu*, *a mea*, "mine"). */
export function ownAlone(adj: GreekAdjective, noun: GreekNoun, number: Num, c: Case, possessor: SlotOf<'possessive'>): NounPhrase {
  const gender = noun.gender;
  const el = joinRich([
    articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender, number, case: c })),
    formRich(inflectAdjective(adj, { pos: 'adjective', gender, number, case: c })),
    [{ text: greekPossessive(possessor), role: 'clitic' }],
  ]);
  return { el, ro: roAlone(possessor, noun, number), en: enAlone(possessor) };
}
