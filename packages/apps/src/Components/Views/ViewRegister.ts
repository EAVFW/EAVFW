
export const Views: { [key: string]: any } = {};



export function RegistereView(name: string, view: any) {
    Views[name] = view;
}
