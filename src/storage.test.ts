import { afterEach, describe, expect, it, vi } from 'vitest';
import { readLevel, writeLevel } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('level storage', () => {
  it('defaults to beginner', () => {
    expect(readLevel()).toBe('beginner');
  });
  it('round-trips improver', () => {
    writeLevel('improver');
    expect(readLevel()).toBe('improver');
  });
  it('falls back to beginner for an unknown stored value', () => {
    window.localStorage.setItem('greek-explorer.level', 'expert');
    expect(readLevel()).toBe('beginner');
  });
  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readLevel()).toBe('beginner');
    expect(() => writeLevel('improver')).not.toThrow();
  });
});
