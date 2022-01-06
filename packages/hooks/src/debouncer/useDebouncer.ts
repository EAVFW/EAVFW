import {useEffect, useMemo } from "react"



interface IDebounced<T1,T> {
    (this: any, arg?:T1): Promise<T>;

    clear(): void;

    flush(): void;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce<T1,T>(func: Function, wait: number, immediate: boolean) {
    let timeout: number | null = null, args: IArguments | null, context: any, timestamp: number, result: any;
    if (null == wait) wait = 100;

    let resolves = [] as Array<Function>;

    function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = window.setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                context = args = null;

                resolves.forEach(r => r(result));
                resolves = [];
            }
        }
    };

    var debounced = function () {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = window.setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args= null;
            return new Promise(r => r(result));
        }

        return new Promise(r => resolves.push(r));
        // return result;
    } as IDebounced<T1,T>;

    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    debounced.flush = function () {
        if (timeout) {
            result = func.apply(context, args);
            context = args = null;

            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
};

export const useDebouncer = <T, T2>(changeHandler: (arg1: T) => T2, wait: number, deps = [] as any[]) => {

    const debouncedChangeHandler = useMemo(
        () => debounce<T,T2>(changeHandler, wait, false)
        , deps);

    // Stop the invocation of the debounced function
    // after unmounting
    useEffect(() => {
        return () => {
            debouncedChangeHandler.clear();
        }
    }, deps);

    return debouncedChangeHandler;
}

