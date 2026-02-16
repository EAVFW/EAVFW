import { DependencyList, useEffect, useState } from 'react';

/**
 * Like `useMemo`, but accepts an async factory. Resolves the promise returned
 * by `factory` and stores its result in state. The value is re-fetched whenever
 * `deps` change. Stale results from earlier invocations are discarded.
 *
 * @typeParam T - The resolved value type.
 * @param factory - Async function (or one returning `undefined`/`null` to skip).
 * @param deps - Dependency list that triggers re-evaluation.
 * @param initial - Optional initial value returned before the first resolution.
 * @returns The most recently resolved value, or `initial` while pending.
 *
 * @example
 * ```tsx
 * const user = useAsyncMemo(
 *   () => fetchUser(userId),
 *   [userId],
 *   undefined,
 * );
 * ```
 */
export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T,
): T;
export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial?: T,
): T | undefined {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;
    promise.then((val) => {
      if (!cancel) {
        setVal(val);
      }
    });
    return () => {
      cancel = true;
    };
  }, deps);

  return val;
}
