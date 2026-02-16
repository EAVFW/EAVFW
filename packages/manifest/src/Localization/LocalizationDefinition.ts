/**
 * A localizable string entry in the manifest. Contains the default value
 * and its plural form, with optional per-locale overrides.
 *
 * @example
 * ```ts
 * const loc: LocalizationDefinition = {
 *   value: 'Account',
 *   plural: 'Accounts',
 *   locale: { '1030': { value: 'Konto', plural: 'Konti' } },
 * };
 * ```
 */
export type LocalizationDefinition = {
  value: string;
  plural: string;
  locale?: {
    [locale: string]: Omit<LocalizationDefinition, 'locale'>;
  };
};
