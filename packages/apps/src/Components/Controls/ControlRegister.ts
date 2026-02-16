import { ComponentType } from 'react';

export const Controls: { [key: string]: ComponentType<Record<string, unknown>> } = {};

/**
 * Deprecated - will be removed in future update. Use RegisterControl instead.
 * @param name
 * @param control
 */
export function RegistereControl(name: string, control: ComponentType<Record<string, unknown>>) {
  Controls[name] = control;
}

export function RegisterControl(name: string, control: ComponentType<Record<string, unknown>>) {
  Controls[name] = control;
}
