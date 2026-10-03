import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels/panels';
import type { Level, Phrase } from './types';

/** One phrase: the phrase bar, the gloss rows, the word panel and the comparison. */
export function Explorer({ phrase, level }: { phrase: Phrase; level: Level }) {
  const initial = phrase.tokens.map((t) => initialState(t, phrase));
  const [states, setStates] = useState<PanelState[]>(initial);
  const [selected, setSelected] = useState(0);

  const token = phrase.tokens[selected];
  const state = states[selected];
  const panel = buildPanel(state, token, level);
  const divergences = selectDivergences(DIVERGENCES, state.slot.pos, token.lexeme, level);
  const differsFromPhrase = !sameState(state, initial[selected]);

  function changeControl(key: string, value: string) {
    setStates((current) => current.map((s, i) => (i === selected ? applyControl(s, key, value) : s)));
  }

  function resetToPhrase() {
    setStates((current) => current.map((s, i) => (i === selected ? initial[selected] : s)));
  }

  return (
    <>
      <section className="card" aria-label={phrase.title}>
        <PhraseBar tokens={phrase.tokens} selected={selected} onSelect={setSelected} />
        <GlossGrid glosses={phrase.glosses} selected={selected} onSelect={setSelected} />
      </section>
      {differsFromPhrase && (
        <div className="phrase-status" role="status">
          <span>Differs from the phrase.</span>
          <button type="button" onClick={resetToPhrase}>
            Reset to phrase
          </button>
        </div>
      )}
      <WordPanel panel={panel} onChange={changeControl} />
      <ComparisonTable rows={divergences} word={token.text} />
    </>
  );
}
