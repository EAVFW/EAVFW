let n = 0;

/**
 * Extracts only the created and updated values from a diff tree produced by
 * {@link deepDiffMapper.map}. Recursively walks the tree and returns a flat
 * object (or array) containing just the changed attribute values.
 *
 * @param updatedValues - The diff tree object produced by
 *   `deepDiffMapper.map()`.
 * @param isArray - When `true`, the result is built as an array instead of
 *   a plain object.
 * @returns A tuple of `[changed, values]` where `changed` is `true` if any
 *   attribute was created, updated, or deleted, and `values` is the cleaned
 *   object (or `undefined` when nothing changed).
 *
 * @example
 * ```ts
 * const diff = deepDiffMapper.map(
 *   { name: 'Account', status: 1 },
 *   { name: 'Account', status: 2 },
 * );
 * const [changed, values] = cleanDiff(diff);
 * // changed === true
 * // values  === { status: 2 }
 * ```
 *
 * @see {@link deepDiffMapper}
 */
export function cleanDiff(
  updatedValues: object,
  isArray: boolean = false,
): [boolean, Record<string, unknown> | unknown[] | undefined] {
  let id = n++;
  console.time('cleandiff' + id);
  try {
    let a: Record<string, unknown> = isArray ? ([] as unknown as Record<string, unknown>) : {};
    let changed = false;
    for (let [key, value] of Object.entries(updatedValues)) {
      if ('__type' in value) {
        if (value.__type === 'updated' || value.__type === 'created') {
          a[key] = value.data;
          changed = true;
        } else if (value.__type === 'deleted') {
          // if (value.data.id) {
          //  a[key] = undefined;
          //}

          changed = true;
        } else if (key === 'id') {
          a[key] = value.data;
        }
      } else {
        const [_changed, _value] = cleanDiff(value, key.endsWith('@deleted'));

        if (typeof _value !== 'undefined' && _changed) a[key] = _value;
        changed ||= _changed;
      }
    }
    return [changed, changed ? a : undefined];
  } finally {
    console.timeEnd('cleandiff' + id);
  }
}
