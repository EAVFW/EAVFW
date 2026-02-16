import { useMemo } from 'react';

function isDefined(n: unknown) {
  return typeof n !== 'undefined' && n !== null;
}
export function usePick(obj: Record<string, unknown>, field: string[]) {
  return useMemo(() => {
    return Object.fromEntries(field.map((n) => [n, obj[n]]).filter((n) => isDefined(n[1])));
  }, [field.map((f) => obj[f]).join('')]);
}
