import type { Case, Gender, GreekQuantifier, QuantifierDegree, QuantifierSense, QuantifierUse, SlotOf } from '../types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const CASES: Case[] = ['nom', 'acc', 'gen'];
const USES: QuantifierUse[] = ['determiner', 'pronoun'];

/** The roles a quantifier offers: all three, or the few its data names (the question words). */
export const offeredCases = (q: GreekQuantifier): Case[] => q.cases ?? CASES;

/** The degrees a quantifier has: the comparative only where its data has one. */
export const offeredDegrees = (q: GreekQuantifier): QuantifierDegree[] =>
  q.greek.comparative ? ['plain', 'comparative'] : ['plain'];

/** The senses a quantifier has: the second only where its Romanian data has one (μερικοί). */
export const offeredSenses = (q: GreekQuantifier): QuantifierSense[] => (q.ro.few ? ['some', 'few'] : ['some']);

/** Every slot a quantifier offers; the `few` sense is the only one written on the slot. */
export function quantifierSlots(q: GreekQuantifier): SlotOf<'quantifier'>[] {
  return GENDERS.flatMap((gender) =>
    q.numbers.flatMap((number) =>
      offeredCases(q).flatMap((c) =>
        offeredDegrees(q).flatMap((degree) =>
          offeredSenses(q).flatMap((sense) =>
            USES.map(
              (use): SlotOf<'quantifier'> => ({
                pos: 'quantifier',
                gender,
                number,
                case: c,
                degree,
                ...(sense === 'few' ? { sense } : {}),
                use,
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
