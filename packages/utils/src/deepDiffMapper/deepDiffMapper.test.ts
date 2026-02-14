import { describe, it, expect } from 'vitest';
import { deepDiffMapper } from './deepDiffMapper';

describe('deepDiffMapper', () => {
  it('marks identical values as unchanged', () => {
    const result = deepDiffMapper.map({ a: 1 }, { a: 1 });
    expect(result.a).toEqual({ __type: 'unchanged', data: 1 });
  });

  it('marks added properties as created', () => {
    const result = deepDiffMapper.map({}, { a: 1 });
    expect(result.a).toEqual({ __type: 'created', data: 1 });
  });

  it('marks removed properties as deleted', () => {
    const result = deepDiffMapper.map({ a: 1 }, {});
    expect(result.a).toEqual({ __type: 'deleted', data: 1 });
  });

  it('marks changed values as updated', () => {
    const result = deepDiffMapper.map({ a: 1 }, { a: 2 });
    expect(result.a).toEqual({ __type: 'updated', data: 2 });
  });

  it('handles nested object diffing recursively', () => {
    const oldObj = { a: { b: 1, c: 2 } };
    const newObj = { a: { b: 1, c: 3 } };
    const result = deepDiffMapper.map(oldObj, newObj);
    expect(result.a.b).toEqual({ __type: 'unchanged', data: 1 });
    expect(result.a.c).toEqual({ __type: 'updated', data: 3 });
  });

  it('handles identical dates as unchanged', () => {
    const date = new Date('2024-01-01');
    const date2 = new Date('2024-01-01');
    const result = deepDiffMapper.map({ d: date }, { d: date2 });
    expect(result.d.__type).toBe('unchanged');
  });

  it('handles different dates as updated', () => {
    const result = deepDiffMapper.map({ d: new Date('2024-01-01') }, { d: new Date('2024-06-01') });
    expect(result.d.__type).toBe('updated');
  });

  it('handles type changes (string to number)', () => {
    const result = deepDiffMapper.map({ a: 'hello' }, { a: 42 });
    expect(result.a).toEqual({ __type: 'updated', data: 42 });
  });

  it('throws for function arguments', () => {
    expect(() => deepDiffMapper.map(() => {}, {})).toThrow();
  });

  it('handles comparing two identical empty objects', () => {
    const result = deepDiffMapper.map({}, {});
    expect(result).toEqual({});
  });

  it('uses oldValue as data when newValue is undefined (deleted)', () => {
    const result = deepDiffMapper.map({ a: 'kept' }, {});
    expect(result.a.data).toBe('kept');
  });
});
