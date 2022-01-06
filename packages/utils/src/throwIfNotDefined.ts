


export function throwIfNotDefined<T>(value?:T, message?:string): T {
    return value ?? (() => { throw new Error(message) })();
}