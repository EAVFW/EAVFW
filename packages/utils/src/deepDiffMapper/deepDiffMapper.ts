/**
 * Singleton that recursively compares two objects and produces a diff tree.
 *
 * Each leaf in the returned tree has the shape
 * `{ __type: 'created' | 'updated' | 'deleted' | 'unchanged', data: any }`.
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
    map: function (oldValue: any, newValue: any) {
      if (this.isFunction(oldValue) || this.isFunction(newValue)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(oldValue) || this.isValue(newValue)) {
        return {
          __type: this.compareValues(oldValue, newValue),
          data: newValue === undefined ? oldValue : newValue,
        };
      }

      var diff = {} as any;
      for (var key in oldValue) {
        if (this.isFunction(oldValue[key])) {
          continue;
        }

        var value2 = undefined;
        if (newValue[key] !== undefined) {
          value2 = newValue[key];
        }

        diff[key] = this.map(oldValue[key], value2);
      }
      for (var key in newValue) {
        if (this.isFunction(newValue[key]) || diff[key] !== undefined) {
          continue;
        }

        diff[key] = this.map(undefined, newValue[key]);
      }

      return diff;
    },
    compareValues: function (value1: any, value2: any) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
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
    isFunction: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x: any) {
      return !this.isObject(x) && !this.isArray(x);
    },
  };
})();
