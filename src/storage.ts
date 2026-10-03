import type { Level } from './types';

const KEY = 'greek-explorer.level';

export function readLevel(): Level {
  try {
    return window.localStorage.getItem(KEY) === 'improver' ? 'improver' : 'beginner';
  } catch {
    return 'beginner';
  }
}

export function writeLevel(level: Level): void {
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    // Storage can be blocked or full; the app works without remembering the level.
  }
}
