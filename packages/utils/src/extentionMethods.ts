export class ExtensionMethods {
    static capitalizeFirstLetter(input: any): string {
        if (typeof input !== 'string') {
            console.error('Input must be a string.');
            return "";
        }

        const string = input.trim();
        if (string && string.charAt(0) === string.charAt(0).toUpperCase()) {
            return string;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static isPrimitiveType(value: any): boolean {
        return (value !== Object(value));
    }

    static isComplexType(value: any): boolean {
        return (value === Object(value));
    }

}