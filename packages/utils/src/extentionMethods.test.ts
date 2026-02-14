import { describe, it, expect } from 'vitest';
import { ExtensionMethods } from './extentionMethods';

describe('ExtensionMethods.capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a lowercase string', () => {
    expect(ExtensionMethods.capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('returns the string unchanged if already capitalized', () => {
    expect(ExtensionMethods.capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('trims whitespace before processing', () => {
    expect(ExtensionMethods.capitalizeFirstLetter('  hello')).toBe('Hello');
  });

  it('returns empty string for non-string input', () => {
    expect(ExtensionMethods.capitalizeFirstLetter(42)).toBe('');
    expect(ExtensionMethods.capitalizeFirstLetter(null)).toBe('');
    expect(ExtensionMethods.capitalizeFirstLetter(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(ExtensionMethods.capitalizeFirstLetter('')).toBe('');
  });
});

describe('ExtensionMethods.isPrimitiveType', () => {
  it('returns true for primitives', () => {
    expect(ExtensionMethods.isPrimitiveType(42)).toBe(true);
    expect(ExtensionMethods.isPrimitiveType('hello')).toBe(true);
    expect(ExtensionMethods.isPrimitiveType(true)).toBe(true);
    expect(ExtensionMethods.isPrimitiveType(null)).toBe(true);
    expect(ExtensionMethods.isPrimitiveType(undefined)).toBe(true);
  });

  it('returns false for objects and arrays', () => {
    expect(ExtensionMethods.isPrimitiveType({})).toBe(false);
    expect(ExtensionMethods.isPrimitiveType([])).toBe(false);
    expect(ExtensionMethods.isPrimitiveType(new Date())).toBe(false);
  });
});

describe('ExtensionMethods.isComplexType', () => {
  it('returns true for objects and arrays', () => {
    expect(ExtensionMethods.isComplexType({})).toBe(true);
    expect(ExtensionMethods.isComplexType([])).toBe(true);
    expect(ExtensionMethods.isComplexType(new Date())).toBe(true);
  });

  it('returns false for primitives', () => {
    expect(ExtensionMethods.isComplexType(42)).toBe(false);
    expect(ExtensionMethods.isComplexType('hello')).toBe(false);
    expect(ExtensionMethods.isComplexType(null)).toBe(false);
    expect(ExtensionMethods.isComplexType(undefined)).toBe(false);
  });
});
