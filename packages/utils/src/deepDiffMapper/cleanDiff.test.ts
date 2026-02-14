import { describe, it, expect } from 'vitest';
import { cleanDiff } from './cleanDiff';

describe('cleanDiff', () => {
  it('returns [false, undefined] when all values are unchanged', () => {
    const input = {
      a: { __type: 'unchanged', data: 1 },
      b: { __type: 'unchanged', data: 'hello' },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(false);
    expect(value).toBeUndefined();
  });

  it('includes created values in the result', () => {
    const input = {
      a: { __type: 'created', data: 'new' },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value).toEqual({ a: 'new' });
  });

  it('includes updated values with new data', () => {
    const input = {
      a: { __type: 'updated', data: 'updated-val' },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value).toEqual({ a: 'updated-val' });
  });

  it('marks deleted as changed but does not include the value', () => {
    const input = {
      a: { __type: 'deleted', data: 'old' },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value).toEqual({});
  });

  it('preserves unchanged id field', () => {
    const input = {
      id: { __type: 'unchanged', data: '123' },
      name: { __type: 'updated', data: 'new-name' },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value.id).toBe('123');
    expect(value.name).toBe('new-name');
  });

  it('handles nested objects without __type (recursive)', () => {
    const input = {
      nested: {
        a: { __type: 'updated', data: 42 },
      },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value.nested).toEqual({ a: 42 });
  });

  it('returns [false, undefined] for empty input', () => {
    const [changed, value] = cleanDiff({});
    expect(changed).toBe(false);
    expect(value).toBeUndefined();
  });

  it('handles mix of changed and unchanged', () => {
    const input = {
      a: { __type: 'unchanged', data: 1 },
      b: { __type: 'updated', data: 2 },
    };
    const [changed, value] = cleanDiff(input);
    expect(changed).toBe(true);
    expect(value).toEqual({ b: 2 });
  });
});
