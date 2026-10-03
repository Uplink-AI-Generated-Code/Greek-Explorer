import { useState } from 'react';
import { ComparisonTable, selectDivergences } from './components/ComparisonTable';
import { GlossGrid } from './components/GlossGrid';
import { LevelToggle } from './components/LevelToggle';
import { PhraseBar } from './components/PhraseBar';
import { WordPanel } from './components/WordPanel';
import { DIVERGENCES } from './data/divergences';
import { PHRASES } from './data/phrases';
import { applyControl, buildPanel } from './panels/panels';
import { readLevel, writeLevel } from './storage';
import type { Level, Slot } from './types';

export function App() {
  const phrase = PHRASES[0];
  const [slots, setSlots] = useState<Slot[]>(() => phrase.tokens.map((t) => t.slot));
  const [selected, setSelected] = useState(0);
  const [level, setLevel] = useState<Level>(readLevel);

  const token = phrase.tokens[selected];
  const panel = buildPanel(slots[selected], token, phrase, level);
  const divergences = selectDivergences(DIVERGENCES, slots[selected].pos, token.lexeme, level);
  const differsFromPhrase = JSON.stringify(slots[selected]) !== JSON.stringify(token.slot);

  function changeLevel(next: Level) {
    setLevel(next);
    writeLevel(next);
  }

  function changeControl(key: string, value: string) {
    setSlots((current) => current.map((slot, i) => (i === selected ? applyControl(slot, key, value) : slot)));
  }

  function resetToPhrase() {
    setSlots((current) => current.map((slot, i) => (i === selected ? token.slot : slot)));
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Greek Grammar Explorer</h1>
        <LevelToggle value={level} onChange={changeLevel} />
      </header>
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
    </main>
  );
}
