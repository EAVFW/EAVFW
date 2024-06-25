export function removeNonAlphanumeric(inputString:string) {
    return inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, '') // Removes diacritics
        .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'aa') // Specific replacements
        .replace(/[^a-zA-Z0-9]/g, ''); // Removes non-alphanumeric characters
}