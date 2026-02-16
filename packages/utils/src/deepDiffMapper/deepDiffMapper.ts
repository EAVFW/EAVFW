/**
 * Singleton that recursively compares two objects and produces a diff tree.
 *
 * Each leaf in the returned tree has the shape
 * `{ __type: 'created' | 'updated' | 'deleted' | 'unchanged', data: unknown }`.
 *
 * @example
 * ```ts
 * const oldEntity = { name: 'Account', status: 1 };
 * const newEntity = { name: 'Account', status: 2, active: true };
 * const diff = deepDiffMapper.map(oldEntity, newEntity);
 * // diff.status.__type === 'updated'
 * // diff.active.__type === 'created'
 * ```
 *
 * @see {@link cleanDiff} to extract only the changed values from a diff tree.
 */
export const deepDiffMapper = (function () {
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function (oldValue: unknown, newValue: unknown) {
      if (this.isFunction(oldValue) || this.isFunction(newValue)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(oldValue) || this.isValue(newValue)) {
        return {
          __type: this.compareValues(oldValue, newValue),
          data: newValue === undefined ? oldValue : newValue,
        };
      }

      var diff = {} as Record<string, unknown>;
      for (var key in oldValue as Record<string, unknown>) {
        if (this.isFunction((oldValue as Record<string, unknown>)[key])) {
          continue;
        }

        var value2 = undefined;
        if ((newValue as Record<string, unknown>)[key] !== undefined) {
          value2 = (newValue as Record<string, unknown>)[key];
        }

        diff[key] = this.map((oldValue as Record<string, unknown>)[key], value2);
      }
      for (var key in newValue as Record<string, unknown>) {
        if (
          this.isFunction((newValue as Record<string, unknown>)[key]) ||
          diff[key] !== undefined
        ) {
          continue;
        }

        diff[key] = this.map(undefined, (newValue as Record<string, unknown>)[key]);
      }

      return diff;
    },
    compareValues: function (value1: unknown, value2: unknown) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (
        this.isDate(value1) &&
        this.isDate(value2) &&
        (value1 as Date).getTime() === (value2 as Date).getTime()
      ) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction: function (x: unknown): x is Function {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x: unknown): x is unknown[] {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x: unknown): x is Date {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x: unknown): x is Record<string, unknown> {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x: unknown) {
      return !this.isObject(x) && !this.isArray(x);
    },
  };
})();
