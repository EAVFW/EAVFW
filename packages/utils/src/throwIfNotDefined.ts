/**
 * Asserts that a value is defined (not `undefined` or `null`) and returns it.
 * Throws an {@link Error} if the value is nullish.
 *
 * Useful for extracting required configuration or manifest values that may be
 * typed as optional.
 *
 * @typeParam T - The expected type of the value.
 * @param value - The value to check.
 * @param message - Optional error message when the value is not defined.
 * @returns The value, guaranteed to be non-nullish.
 * @throws {Error} When `value` is `undefined` or `null`.
 *
 * @example
 * ```ts
 * const apiUrl = throwIfNotDefined(process.env.API_URL, 'API_URL is required');
 * ```
 */
export function throwIfNotDefined<T>(value?: T, message?: string): T {
  return (
    value ??
    (() => {
      throw new Error(message);
    })()
  );
}
