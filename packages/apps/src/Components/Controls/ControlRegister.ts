
export const Controls: { [key: string]: any } = {};

export function RegistereControl(name: string, control: any) {
    Controls[name] = control;
}   