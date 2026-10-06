import { RO_ALONE } from '../data/possessives';
import { GREEK_STRONG } from '../data/clitics';
import { RELATIVE_PREPOSITION_EN, RO_CARE_DATIVE, RO_CARE_GENITIVE } from '../data/relatives';
import type { GreekNoun, GreekPreposition, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { greekClitic } from './clitics';
import { roAgreement, roBareNoun } from './possessive';
import { opoiosParts, relativePreposition } from './relative';
import { joinRich, type Rich } from './segments';

type RelativeSlot = SlotOf<'relative'>;

export interface RelativeGroup {
  el: Rich;
  ro: string;
  en: string;
}

/** The pronoun the clause needs for the antecedent, in the form of the 3rd person: του, της, τους. */
const resumptive = (slot: RelativeSlot): string =>
  greekClitic({ role: 'indirect', person: 3, number: slot.number, gender: slot.gender });

/** The Greek strong pronoun after a preposition: με αυτόν, σε αυτό. */
const strong = (slot: RelativeSlot): string => GREEK_STRONG[`3${slot.number}`][slot.gender];

/** The preposition of the job after a preposition (the slot always names one). */
function prepositionOf(slot: RelativeSlot): GreekPreposition {
  const prep = relativePreposition(slot);
  if (!prep) throw new Error('a relative pronoun after a preposition needs the preposition');
  return prep;
}

const ownedPhrase = (owned: GreekNoun): Rich => nounPhrase(owned, 'sg', 'nom', { article: 'definite' }).el;

/**
 * Greek που and the pronoun the clause needs for the job it does: που, που του …, που το σπίτι του …, που … με αυτόν.
 * The dots stand where the rest of the clause goes (spec 26).
 */
function pouGreek(slot: RelativeSlot, owned: GreekNoun): Rich {
  const word = (text: string): Rich => [{ text, role: 'plain' }];
  switch (slot.role) {
    case 'subject':
    case 'object':
      return word('που');
    case 'indirect':
      return joinRich([word('που'), [{ text: resumptive(slot), role: 'clitic' }], word('…')]);
    case 'whose':
      return joinRich([word('που'), ownedPhrase(owned), [{ text: resumptive(slot), role: 'clitic' }], word('…')]);
    case 'preposition': {
      return joinRich([word('που'), word('…'), word(prepositionOf(slot).lemma), [{ text: strong(slot), role: 'pronoun' }]]);
    }
  }
}

/** ο οποίος with its job: ο οποίος, τον οποίο, στον οποίο, του οποίου + the owned noun, με τον οποίο. */
function opoiosGreek(slot: RelativeSlot, owned: GreekNoun): Rich {
  const { preposition, article, word } = opoiosParts(slot);
  const chip = joinRich([
    ...(preposition ? [[{ text: preposition, role: 'plain' as const }]] : []),
    ...(article ? [[{ text: article, role: 'article' as const }]] : []),
    [{ text: word, role: 'stem' as const }],
  ]);
  return slot.role === 'whose' ? joinRich([chip, ownedPhrase(owned)]) : chip;
}

/** Romanian care in the job: care, pe care, căruia, al cărui + the owned noun, cu care. */
function roGroup(slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): string {
  const gender = roAgreement(antecedent, slot.number);
  switch (slot.role) {
    case 'subject':
      return 'care';
    case 'object':
      return 'pe care';
    case 'indirect':
      return RO_CARE_DATIVE[gender][slot.number];
    case 'whose': {
      // The first word agrees with the owned thing, the second with the antecedent.
      const first = RO_ALONE[roAgreement(owned, 'sg')].sg;
      return `${first} ${RO_CARE_GENITIVE[gender][slot.number]} ${roBareNoun(owned, 'sg')}`;
    }
    case 'preposition':
      return `${prepositionOf(slot).ro} care`;
  }
}

/** English who, whom, which, to whom, whose + the owned noun, with whom. */
function enGroup(slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): string {
  const person = antecedent.animate === true;
  switch (slot.role) {
    case 'subject':
      return person ? 'who' : 'which';
    case 'object':
      return person ? 'whom' : 'which';
    case 'indirect':
      return `to ${person ? 'whom' : 'which'}`;
    case 'whose':
      return `whose ${owned.en.sg}`;
    case 'preposition':
      return `${RELATIVE_PREPOSITION_EN[slot.preposition ?? ''] ?? prepositionOf(slot).en} ${person ? 'whom' : 'which'}`;
  }
}

/**
 * The relative pronoun with the job it does, in three languages: `kind` is the Greek word shown (που or ο οποίος); the
 * Romanian and English words are the same for both.
 */
export function relativeGroup(kind: 'pou' | 'opoios', slot: RelativeSlot, antecedent: GreekNoun, owned: GreekNoun): RelativeGroup {
  return {
    el: kind === 'pou' ? pouGreek(slot, owned) : opoiosGreek(slot, owned),
    ro: roGroup(slot, antecedent, owned),
    en: enGroup(slot, antecedent, owned),
  };
}
