/**
 * Checks whether a value is a plain object (not an array or `null`).
 *
 * @param item - The value to check.
 * @returns `true` if `item` is a non-array object, `false` otherwise.
 *
 * @example
 * ```ts
 * isObject({ name: 'Account' }); // true
 * isObject([1, 2, 3]);           // false
 * isObject(null);                // false
 * ```
 *
 * @see {@link mergeDeep} which uses this helper internally.
 */
export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Recursively merges one or more source objects into `target`.
 *
 * **Note:** This function **mutates** `target` in place. If you need an
 * immutable merge, pass an empty object as the first argument.
 *
 * @param target - The object to merge into (will be mutated).
 * @param sources - One or more source objects whose properties are merged
 *   into `target`. Later sources take precedence.
 * @returns The mutated `target` object with all source properties merged.
 *
 * @example
 * ```ts
 * const base = { ribbon: { commands: {} } };
 * const overrides = { ribbon: { commands: { save: true } }, views: {} };
 * mergeDeep(base, overrides);
 * // base is now { ribbon: { commands: { save: true } }, views: {} }
 * ```
 *
 * @see {@link isObject}
 */
export function mergeDeep(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
