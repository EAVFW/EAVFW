import { describe, it, expect } from 'vitest';
import { throwIfNotDefined } from './throwIfNotDefined';

describe('throwIfNotDefined', () => {
  it('returns the value when it is defined', () => {
    expect(throwIfNotDefined('hello')).toBe('hello');
  });

  it('returns the value for numbers', () => {
    expect(throwIfNotDefined(42)).toBe(42);
  });

  it('returns the value for objects', () => {
    const obj = { a: 1 };
    expect(throwIfNotDefined(obj)).toBe(obj);
  });

  it('throws for null (?? treats null as nullish)', () => {
    expect(() => throwIfNotDefined(null)).toThrow();
  });

  it('returns 0 (falsy but defined)', () => {
    expect(throwIfNotDefined(0)).toBe(0);
  });

  it('returns empty string (falsy but defined)', () => {
    expect(throwIfNotDefined('')).toBe('');
  });

  it('throws when value is undefined', () => {
    expect(() => throwIfNotDefined(undefined)).toThrow();
  });

  it('throws with custom message when value is undefined', () => {
    expect(() => throwIfNotDefined(undefined, 'missing!')).toThrow('missing!');
  });

  it('throws when called with no arguments', () => {
    expect(() => throwIfNotDefined()).toThrow();
  });
});
