/**
 * Static helper methods for common type checks and string transformations.
 *
 * @see {@link capitalize} for a standalone capitalize function.
 */
export class ExtensionMethods {
  /**
   * Capitalizes the first letter of a trimmed string. Returns the string
   * unchanged if its first character is already uppercase.
   *
   * @param input - The value to capitalize. Non-string values return `''`.
   * @returns The string with its first character uppercased.
   *
   * @example
   * ```ts
   * ExtensionMethods.capitalizeFirstLetter('entity'); // 'Entity'
   * ExtensionMethods.capitalizeFirstLetter('Entity'); // 'Entity'
   * ExtensionMethods.capitalizeFirstLetter(42);       // ''
   * ```
   */
  static capitalizeFirstLetter(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    const string = input.trim();
    if (string && string.charAt(0) === string.charAt(0).toUpperCase()) {
      return string;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Checks whether a value is a primitive type (string, number, boolean, etc.).
   *
   * @param value - The value to check.
   * @returns `true` if the value is a primitive, `false` for objects and arrays.
   *
   * @example
   * ```ts
   * ExtensionMethods.isPrimitiveType('hello'); // true
   * ExtensionMethods.isPrimitiveType({});      // false
   * ```
   *
   * @see {@link ExtensionMethods.isComplexType}
   */
  static isPrimitiveType(value: unknown): boolean {
    return value !== Object(value);
  }

  /**
   * Checks whether a value is a complex (non-primitive) type such as an
   * object or array.
   *
   * @param value - The value to check.
   * @returns `true` if the value is an object or array, `false` for primitives.
   *
   * @example
   * ```ts
   * ExtensionMethods.isComplexType({ id: 1 }); // true
   * ExtensionMethods.isComplexType(42);         // false
   * ```
   *
   * @see {@link ExtensionMethods.isPrimitiveType}
   */
  static isComplexType(value: unknown): boolean {
    return value === Object(value);
  }
}
