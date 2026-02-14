import { describe, it, expect } from 'vitest';
import { isObject, mergeDeep } from './mergeDeep';

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2])).toBe(false);
  });

  it('returns falsy for null', () => {
    expect(isObject(null)).toBeFalsy();
  });

  it('returns falsy for undefined', () => {
    expect(isObject(undefined)).toBeFalsy();
  });

  it('returns false for primitives', () => {
    expect(isObject(42)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

describe('mergeDeep', () => {
  it('merges flat objects', () => {
    const target = { a: 1 };
    const result = mergeDeep(target, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('mutates the target object', () => {
    const target = { a: 1 };
    mergeDeep(target, { b: 2 });
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('merges nested objects recursively', () => {
    const target = { a: { x: 1 } };
    const result = mergeDeep(target, { a: { y: 2 } });
    expect(result).toEqual({ a: { x: 1, y: 2 } });
  });

  it('overwrites primitive values', () => {
    const target = { a: 1 };
    const result = mergeDeep(target, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it('replaces arrays (does not concatenate)', () => {
    const target = { a: [1, 2] };
    const result = mergeDeep(target, { a: [3, 4] });
    expect(result).toEqual({ a: [3, 4] });
  });

  it('applies multiple sources in order', () => {
    const target = { a: 1 };
    const result = mergeDeep(target, { b: 2 }, { c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('later sources override earlier ones', () => {
    const target = { a: 1 };
    const result = mergeDeep(target, { a: 2 }, { a: 3 });
    expect(result).toEqual({ a: 3 });
  });

  it('creates nested target keys that do not exist', () => {
    const target = {};
    const result = mergeDeep(target, { a: { b: 1 } });
    expect(result).toEqual({ a: { b: 1 } });
  });

  it('returns target when no sources are given', () => {
    const target = { a: 1 };
    expect(mergeDeep(target)).toBe(target);
  });
});
