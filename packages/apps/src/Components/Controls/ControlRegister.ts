
export const Controls: { [key: string]: any } = {};


/**
 * Deprecated - will be removed in future update. Use RegisterControl instead.
 * @param name
 * @param control
 */
export function RegistereControl(name: string, control: any) {
    Controls[name] = control;
}   


export function RegisterControl(name: string, control: any) {
    Controls[name] = control;
}   