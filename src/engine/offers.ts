import type { GreekVerb, Mood, SlotOf, Tense, Voice, VerbVoice } from '../types';
import { MOODS, TENSES_OF_MOOD } from './tenses';

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
