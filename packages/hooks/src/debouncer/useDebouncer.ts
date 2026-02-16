import { useEffect, useMemo } from 'react';

/**
 * A debounced function wrapper. Call it like a regular function; invocation
 * is delayed until the wait period elapses without another call. Returns a
 * `Promise` that resolves with the function's return value.
 *
 * @typeParam T1 - The argument type accepted by the debounced function.
 * @typeParam T - The return type of the wrapped function.
 */
interface IDebounced<T1, T> {
  (this: unknown, arg?: T1): Promise<T>;

  /** Cancel any pending invocation. */
  clear(): void;

  /** Immediately invoke the pending call (if any) and cancel the timer. */
  flush(): void;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce<T1, T>(func: Function, wait: number, immediate: boolean) {
  let timeout: number | null = null,
    args: IArguments | null,
    context: unknown,
    timestamp: number,
    result: T;
  if (null == wait) wait = 100;

  let resolves = [] as Array<Function>;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = window.setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;

        resolves.forEach((r) => r(result));
        resolves = [];
      }
    }
  }

  var debounced = function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = window.setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
      return new Promise((r) => r(result));
    }

    return new Promise((r) => resolves.push(r));
    // return result;
  } as IDebounced<T1, T>;

  debounced.clear = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * React hook that returns a debounced version of `changeHandler`. The
 * debounced function is memoized across renders and automatically cleared
 * on unmount to prevent calling `setState` on an unmounted component.
 *
 * @typeParam T - The argument type of the handler.
 * @typeParam T2 - The return type of the handler.
 * @param changeHandler - The function to debounce.
 * @param wait - Debounce delay in milliseconds.
 * @param deps - Additional dependency list for re-creating the debouncer.
 * @returns A debounced function with `.clear()` and `.flush()` methods.
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncer(
 *   (value: string) => saveToServer(value),
 *   300,
 * );
 * ```
 */
export const useDebouncer = <T, T2>(
  changeHandler: (arg1: T) => T2,
  wait: number,
  deps = [] as unknown[],
) => {
  const debouncedChangeHandler = useMemo(() => debounce<T, T2>(changeHandler, wait, false), deps);

  // Stop the invocation of the debounced function
  // after unmounting
  useEffect(() => {
    return () => {
      debouncedChangeHandler.clear();
    };
  }, deps);

  return debouncedChangeHandler;
};
