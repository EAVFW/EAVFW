/**
 * Performs various checks to determine if the current device is a mobile device.
 * The checks are performed in the order of which they are most likely to be accurate.
 * 1. Device width: Typically, mobile devices have smaller screen widths.
 * 2. User Agent: Detects known mobile device patterns in the user agent string.
 * 3. Touch Events: Presence of touch events which are common in mobile devices.
 * 
 * Note: No client-side detection method is 100% accurate. User Agents can be spoofed,
 * devices evolve, and some non-mobile devices support touch events. This utility 
 * function is based on educated guesses and may require updates as device patterns change.
 */
export const isMobileDevice = () => {
    if (typeof window !== "undefined" && window) {
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
            /Windows Phone/i
        ];

        for (const device of mobileDevices) {
            if (navigator.userAgent.match(device)) return true;
        }

        /* 3. Touch Events */
        if ('ontouchstart' in window) return true;
    }

    return false;
}
