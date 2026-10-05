import type { GreekVerb, Mood, ShortForm, SlotOf, Tense, Voice, VerbVoice } from '../types';
import { mainFormKind, MOODS, TENSES_OF_MOOD } from './tenses';

const VOICES: Voice[] = ['active', 'mediopassive'];
const WHO = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

export function voiceOf(verb: GreekVerb, voice: Voice): VerbVoice {
  const data = verb.voices[voice];
  if (!data) throw new Error(`${verb.id} has no ${voice} voice`);
  return data;
}

export const offeredVoices = (verb: GreekVerb): Voice[] => VOICES.filter((v) => verb.voices[v]);

export function offeredMoods(verb: GreekVerb, voice: Voice): Mood[] {
  const offers = voiceOf(verb, voice).offers;
  return MOODS.filter((mood) => (offers[mood]?.length ?? 0) > 0);
}

export function offeredTenses(verb: GreekVerb, voice: Voice, mood: Mood): Tense[] {
  const offered = voiceOf(verb, voice).offers[mood] ?? [];
  return TENSES_OF_MOOD[mood].filter((tense) => offered.includes(tense));
}

/** The persons the panel's Who? control may offer for a mood: '1sg' … '3pl'. */
export function offeredWho(verb: GreekVerb, voice: Voice, mood: Mood): string[] {
  if (voiceOf(verb, voice).thirdSingularOnly) return ['3sg'];
  if (mood === 'imperative') return ['2sg', '2pl'];
  return [...WHO];
}

export function isOffered(verb: GreekVerb, s: SlotOf<'verb'>): boolean {
  const data = verb.voices[s.voice];
  if (!data) return false;
  if (!(data.offers[s.mood] ?? []).includes(s.tense)) return false;
  // A negative command is μην + the subjunctive of the same tense (spec 4.3), so the verb must offer that subjunctive.
  if (s.polarity === 'negative' && s.mood === 'imperative' && !(data.offers.subjunctive ?? []).includes(s.tense)) {
    return false;
  }
  return offeredWho(verb, s.voice, s.mood).includes(`${s.person}${s.number}`);
}

/** Every slot the verb offers, voice by voice, mood by mood, tense by tense, person by person. */
export function allVerbSlots(verb: GreekVerb): SlotOf<'verb'>[] {
  return offeredVoices(verb).flatMap((voice) =>
    offeredMoods(verb, voice).flatMap((mood) =>
      offeredTenses(verb, voice, mood).flatMap((tense) =>
        offeredWho(verb, voice, mood).map(
          (who): SlotOf<'verb'> => ({
            pos: 'verb',
            person: Number(who[0]) as 1 | 2 | 3,
            number: who.slice(1) as 'sg' | 'pl',
            mood,
            tense,
            voice,
          }),
        ),
      ),
    ),
  );
}

/** The stored short form of this command, if the verb has one (spec 4.3). */
export function shortFormOf(verb: GreekVerb, s: SlotOf<'verb'>): ShortForm | undefined {
  const data = verb.voices[s.voice];
  if (!data || s.mood !== 'imperative') return undefined;
  return data.shortForms?.[`${mainFormKind(s.mood, s.tense)}.${s.person}${s.number}`];
}

/** What is wrong with the pronouns or the short form of a slot, or null (spec 2, 4.2, 4.3, 7). */
export function slotProblem(verb: GreekVerb, s: SlotOf<'verb'>): string | null {
  const clitics = s.clitics ?? [];
  if (clitics.length === 0 && !s.shortForm) return null;
  if (s.shortForm && s.mood !== 'imperative') return 'a short form goes only with a command';
  const data = verb.voices[s.voice];
  if (!data) return `${verb.id} has no ${s.voice} voice`;
  // A verb that takes no object, and a reflexive (mediopassive) verb, take no pronouns (spec 4.3).
  if (clitics.length > 0 && (s.voice !== 'active' || data.intransitive)) return `${data.lemma} takes no object`;
  if (clitics.length > 2) return 'a verb form takes at most two pronouns';
  if (clitics.some((c) => c.person === 3 && !c.gender)) return 'a third-person pronoun needs a gender';
  if (clitics.length === 2 && !(clitics[0].role === 'indirect' && clitics[1].role === 'object')) {
    return 'two pronouns are an indirect object and then a direct object';
  }
  if (clitics.some((c) => c.role === 'indirect') && !data.indirect) return `${data.lemma} takes no indirect object`;
  if (s.shortForm) {
    const short = shortFormOf(verb, s);
    if (!short) return `${data.lemma} has no short form here`;
    if (s.polarity === 'negative') return 'a negative command has no short form';
    if (clitics.length === 0) return 'a short form needs a pronoun';
    if (short.fuse && clitics.length !== 1) return 'the joined short form takes one pronoun';
  }
  return null;
}
