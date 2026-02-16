import { DependencyList, useMemo, useRef } from 'react';
import isEqual from 'react-fast-compare';

/**
 * A memoization hook that only emits a new reference when the factory's
 * return value has structurally changed (deep equality via
 * `react-fast-compare`). Useful for preventing unnecessary re-renders when
 * a derived value is an object or array that is reconstructed on every render.
 *
 * @typeParam T - The memoized value type.
 * @param factory - Function that computes the value.
 * @param deps - Dependency list passed to the underlying `useMemo`.
 * @returns The memoized value; the same reference is returned as long as the
 *   value is deeply equal to the previous one.
 *
 * @example
 * ```tsx
 * const filters = useLazyMemo(
 *   () => buildFilters(entity, view),
 *   [entity, view],
 * );
 * ```
 */
export function useLazyMemo<T>(factory: () => T, deps: DependencyList | undefined): T {
  const old = useRef<T>();
  const data = useMemo(() => {
    let nested = factory();

    if (!isEqual(nested, old.current)) {
      old.current = nested;
      return nested;
    }
    return old.current!;
  }, deps);

  return data;
}
