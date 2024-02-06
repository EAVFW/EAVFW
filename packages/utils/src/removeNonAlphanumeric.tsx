export function removeNonAlphanumeric(inputString:string) {
    return inputString.replace(/[^a-zA-Z0-9]/g, '');
};