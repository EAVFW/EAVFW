import { useEffect, useRef } from 'react';

/**
 * Development-only hook that logs when `data` changes between renders.
 * Intended for debugging unnecessary re-renders; has no effect in
 * production builds (guarded by `#!if ENVIRONMENT === 'LOCAL'`).
 *
 * @param name - A label printed alongside the change log entry.
 * @param data - The value to watch for changes.
 * @param renderId - Optional ref for correlating logs across hooks.
 *
 * @example
 * ```tsx
 * useChangeDetector('formValues', formValues);
 * ```
 */
export const useChangeDetector = (
  name: string,
  data: unknown,
  renderId?: React.MutableRefObject<string>,
) => {
  // #!if ENVIRONMENT === 'LOCAL'
  const ref = useRef<Boolean>(true);

  useEffect(() => {
    if (ref.current) {
      ref.current = false;
      return;
    }
  }, [data]);

  // #!endif
};
