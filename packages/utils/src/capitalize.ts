
declare global {
    interface String {
        /**
         * Returns a string where the first character
         * (if it is an alphabetic character) has been converted to uppercase,
         * taking into account the host environment's current locale.
         */
        capitalize(): string;
    }
}

// Checks function does not already exist on String prototype to avoid overriding.
if (String.prototype.capitalize === undefined) {
    String.prototype.capitalize = function () {
        if (this.length === 0) return "";
        const [first, ...rest] = this;
        return first.toLocaleUpperCase() + rest.join("");
    };
}

/**
 * Returns a string where the first character
 * (if it is an alphabetic character) has been converted to uppercase,
 * taking into account the host environment's current locale.
 */
export const capitalize = (str: string) => {
    if (str.length === 0) return str;
    const [first, ...rest] = str;
    return first.toLocaleUpperCase() + rest.join("");
};
