import { plain } from '../engine/segments';
import type { GreekParticle, Level } from '../types';
import type { Panel } from './types';

/** θα and να: one row, the particle with a verb in each language (spec 5.3). */
export function particlePanel(particle: GreekParticle, level: Level): Panel {
  return {
    lemma: particle.lemma,
    posLabel: level === 'beginner' ? 'little word before a verb' : 'particle',
    controls: [],
    rows: [
      {
        label: 'with a verb',
        el: plain(particle.example.el),
        ro: plain(particle.example.ro),
        en: plain(particle.example.en),
      },
    ],
    full: [],
    plain: particle.meaning,
    irregular: '',
    note: '',
  };
}
