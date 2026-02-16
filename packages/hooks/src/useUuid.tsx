import { useMemo } from 'react';

/** Generates a random RFC 4122 v4 UUID using `crypto.getRandomValues`. */
function uuidv4() {
  // @ts-expect-error - arithmetic on number literals to build UUID template string
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

/**
 * Returns a stable UUID (v4) that is generated once on mount and remains
 * constant for the lifetime of the component. Useful for assigning unique
 * identifiers to dynamically rendered form controls or expression bindings.
 *
 * @returns A random UUID string.
 *
 * @example
 * ```tsx
 * const id = useUuid();
 * return <input id={id} />;
 * ```
 */
export const useUuid = () => useMemo(() => uuidv4(), []);
