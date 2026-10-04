import type { Clitic, FormGroup, SlotOf } from '../types';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'him / her / it' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const object = (noun: string) => ({ noun, number: 'sg' as const, case: 'acc' as const });

/** The four groups of spec 6.5. A speaker must confirm that each group's members mean the same (spec 9). */
export const FORM_GROUPS: FormGroup[] = [
  {
    id: 'eat-the-bread',
    meaning: 'Eat the bread!',
    members: [
      { verb: { lexeme: 'troo', slot: command() }, object: object('psomi') },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT] }) },
        note: 'το is neuter (ψωμί); the Romanian pronoun o is feminine (pâine).',
      },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT], shortForm: true }) },
        note: 'The final -ε drops and the pronoun joins: φά(ε) + το.',
      },
    ],
    closeNotSame: { verb: { lexeme: 'troo', slot: command() }, reason: 'no object: what to eat is not said' },
    verified: false,
  },
  {
    id: 'wash-the-child',
    meaning: 'Wash the child!',
    members: [
      { verb: { lexeme: 'pleno', slot: command() }, object: object('paidi') },
      {
        verb: { lexeme: 'pleno', slot: command({ clitics: [IT_CHILD] }) },
        note: 'το is neuter (παιδί); the Romanian pronoun -l is masculine (copil).',
      },
    ],
    closeNotSame: { verb: { lexeme: 'pleno', slot: command() }, reason: 'no object: whom to wash is not said' },
    verified: false,
  },
  {
    id: 'give-me-the-bread',
    meaning: 'Give me the bread!',
    members: [
      { verb: { lexeme: 'dino', slot: command({ clitics: [ME] }) }, object: object('psomi') },
      {
        verb: { lexeme: 'dino', slot: command({ clitics: [ME, IT] }) },
        note: 'Two pronouns: the genitive μου comes before the accusative το.',
      },
      {
        verb: { lexeme: 'dino', slot: command({ clitics: [ME, IT], shortForm: true }) },
        note: 'δως needs no second accent.',
      },
    ],
    closeNotSame: { verb: { lexeme: 'dino', slot: command() }, reason: 'no object: what to give is not said' },
    verified: false,
  },
  {
    id: 'dont-eat-the-bread',
    meaning: "Don't eat the bread!",
    members: [
      { verb: { lexeme: 'troo', slot: command({ polarity: 'negative' }) }, object: object('psomi') },
      {
        verb: { lexeme: 'troo', slot: command({ clitics: [IT], polarity: 'negative' }) },
        note: 'The pronoun moves in front of the verb: μην το φας.',
      },
    ],
    closeNotSame: {
      verb: { lexeme: 'troo', slot: command({ polarity: 'negative' }) },
      reason: 'no object: what not to eat is not said',
    },
    verified: false,
  },
];
