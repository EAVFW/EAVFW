import { describe, it, expect } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('capitalizes a single lowercase character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('capitalizes the first character of a lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('leaves an already-capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('only capitalizes the first character, not the rest', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('handles a string starting with a number', () => {
    expect(capitalize('123abc')).toBe('123abc');
  });

  it('handles a string starting with a special character', () => {
    expect(capitalize('!hello')).toBe('!hello');
  });
});
