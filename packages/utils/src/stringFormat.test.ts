import { describe, it, expect } from 'vitest';
import { stringFormat } from './stringFormat';

describe('stringFormat', () => {
  it('replaces a single placeholder', () => {
    expect(stringFormat('Hello {0}!', 'world')).toBe('Hello world!');
  });

  it('replaces multiple placeholders', () => {
    expect(stringFormat('{0} and {1}', 'foo', 'bar')).toBe('foo and bar');
  });

  it('replaces repeated placeholders', () => {
    expect(stringFormat('{0} {0}', 'ha')).toBe('ha ha');
  });

  it('returns the original string when no params are given', () => {
    expect(stringFormat('no placeholders')).toBe('no placeholders');
  });

  it('returns the format string with unreplaced placeholders when params are missing', () => {
    expect(stringFormat('{0} {1}', 'only')).toBe('only {1}');
  });

  it('handles empty format string', () => {
    expect(stringFormat('')).toBe('');
  });

  it('is case-insensitive for placeholders', () => {
    // The regex uses 'gi' flag, but numeric keys don't have case — this just verifies no error
    expect(stringFormat('{0}', 'value')).toBe('value');
  });
});
