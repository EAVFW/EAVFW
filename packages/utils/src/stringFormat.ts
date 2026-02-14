'use strict';

/**
 * Replaces positional `{0}`, `{1}`, ... placeholders in a format string with
 * the corresponding values from `params`.
 *
 * @param format - The template string containing `{n}` placeholders.
 * @param params - Values to substitute for each placeholder.
 * @returns The formatted string with all placeholders replaced.
 *
 * @example
 * ```ts
 * stringFormat('Entity {0} has {1} attributes', 'Account', 5);
 * // 'Entity Account has 5 attributes'
 * ```
 */
export function stringFormat(format: string, ...params: any[]): string {
  if (params.length) {
    let key;

    for (key in params) {
      format = format.replace(new RegExp('\\{' + key + '\\}', 'gi'), params[key]);
    }
  }

  return format;
}
