import { useEffect, useState } from 'react';

/**
 * Performs heuristic checks to determine if the current device is mobile.
 *
 * Checks are applied in order of reliability:
 * 1. **Device width** — screen widths <= 768 px are considered mobile.
 * 2. **User agent** — matches known mobile device patterns.
 * 3. **Touch events** — presence of `ontouchstart` on `window`.
 *
 * Returns `false` during SSR (when `window` is not available).
 *
 * @returns `true` if the device is likely mobile, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isMobileDevice()) {
 *   // render compact layout
 * }
 * ```
 *
 * @see {@link useIsMobileDevice} for a reactive React hook.
 */
export const isMobileDevice = () => {
  if (typeof window !== 'undefined' && window) {
    /* 1. Device Width*/
    const maxMobileWidth = 768;
    if (window.innerWidth <= maxMobileWidth) return true;

    /* 2. User Agent */
    const mobileDevices = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];

    for (const device of mobileDevices) {
      if (navigator.userAgent.match(device)) return true;
    }

    /* 3. Touch Events */
    if ('ontouchstart' in window) return true;
  }

  return false;
};

//TODO, this should be in a context such its not registering the event listeren everyplace used.

/**
 * React hook that reactively tracks whether the current device is mobile.
 * Re-evaluates on window resize events.
 *
 * @returns `true` if the device is currently considered mobile.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isMobile = useIsMobileDevice();
 *   return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
 * };
 * ```
 *
 * @see {@link isMobileDevice} for the underlying detection logic.
 */
export const useIsMobileDevice = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  /* Handles when screen-size is modified */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    if (typeof window !== 'undefined' && window) {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return isMobile;
};
