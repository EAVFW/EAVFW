/** A choice option represented as a numeric value. */
export type SimpleChoiceOption = number;
/** A choice option with a numeric value, optional nested sub-options, and locale. */
export type ComplexChoiceOption = {
  value: number;
  options?: { [key: string]: ChoiceOption };
  locale?: {
    [key: string]: { displayName: string };
  };
};

/** A single choice option — either a bare number or a detailed object. */
export type ChoiceOption = SimpleChoiceOption | ComplexChoiceOption;

/**
 * Attribute type for single-select choice (enum) attributes. Options map
 * display names to numeric values.
 *
 * @example
 * ```ts
 * const statusType: ChoiceType = {
 *   type: 'choice',
 *   options: { Active: 1, Inactive: 2 },
 * };
 * ```
 */
export type ChoiceType = {
  type: 'choice';
  options?: {
    [key: string]: ChoiceOption;
  };
};
