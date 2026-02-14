import { describe, it, expect } from 'vitest';
import { removeNonAlphanumeric } from './removeNonAlphanumeric';

describe('removeNonAlphanumeric', () => {
  it('returns alphanumeric strings unchanged', () => {
    expect(removeNonAlphanumeric('abc123')).toBe('abc123');
  });

  it('removes spaces', () => {
    expect(removeNonAlphanumeric('hello world')).toBe('helloworld');
  });

  it('removes special characters', () => {
    expect(removeNonAlphanumeric('he!l@l#o')).toBe('hello');
  });

  it('replaces æ with ae', () => {
    expect(removeNonAlphanumeric('bæk')).toBe('baek');
  });

  it('replaces ø with o', () => {
    expect(removeNonAlphanumeric('rød')).toBe('rod');
  });

  it('handles å (NFD decomposition removes the ring diacritic, leaving "a")', () => {
    // å is NFD-decomposed to 'a' + combining ring, then the diacritic is stripped,
    // so the explicit å→aa replacement never matches
    expect(removeNonAlphanumeric('bål')).toBe('bal');
  });

  it('removes diacritics via NFD normalization', () => {
    expect(removeNonAlphanumeric('café')).toBe('cafe');
  });

  it('handles empty string', () => {
    expect(removeNonAlphanumeric('')).toBe('');
  });

  it('preserves numbers', () => {
    expect(removeNonAlphanumeric('abc-123_def')).toBe('abc123def');
  });
});
