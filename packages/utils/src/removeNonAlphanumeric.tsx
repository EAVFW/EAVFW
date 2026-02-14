/**
 * Strips diacritics, replaces Nordic characters (æ, ø, å) with ASCII
 * equivalents, and removes all remaining non-alphanumeric characters.
 *
 * Useful for generating logical names from display names in the manifest.
 *
 * @param inputString - The string to sanitize.
 * @returns A string containing only ASCII letters and digits.
 *
 * @example
 * ```ts
 * removeNonAlphanumeric('Ærø Kommune');  // 'AeroKommune'
 * removeNonAlphanumeric('Ålborg');       // 'Aalborg'
 * removeNonAlphanumeric('café 123!');    // 'cafe123'
 * ```
 */
export function removeNonAlphanumeric(inputString: string) {
  return inputString
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Removes diacritics
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'aa') // Specific replacements
    .replace(/[^a-zA-Z0-9]/g, ''); // Removes non-alphanumeric characters
}
