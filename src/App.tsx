import { useState } from 'react';
import { LevelToggle } from './components/LevelToggle';
import { PhrasePicker } from './components/PhrasePicker';
import { PHRASES } from './data/phrases';
import { Explorer } from './Explorer';
import { readLevel, writeLevel } from './storage';
import type { Level } from './types';

export function App() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [level, setLevel] = useState<Level>(readLevel);
  const phrase = PHRASES[phraseIndex];

  function changeLevel(next: Level) {
    setLevel(next);
    writeLevel(next);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Greek Grammar Explorer</h1>
        <LevelToggle value={level} onChange={changeLevel} />
      </header>
      <div className="toolbar">
        <PhrasePicker phrases={PHRASES} value={phraseIndex} onChange={setPhraseIndex} />
      </div>
      <Explorer key={phrase.id} phrase={phrase} level={level} />
    </main>
  );
}
