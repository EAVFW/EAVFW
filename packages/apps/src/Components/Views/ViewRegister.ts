import { ComponentType } from 'react';

export const Views: { [key: string]: ComponentType<Record<string, unknown>> } = {};

export function RegistereView(name: string, view: ComponentType<Record<string, unknown>>) {
  Views[name] = view;
}
