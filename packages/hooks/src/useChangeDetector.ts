import { useEffect, useRef } from "react";

export const useChangeDetector = (name: string, data: any, renderId: React.MutableRefObject<string>) => {
    const ref = useRef<Boolean>(true);

    useEffect(() => {
        if (ref.current) {
            ref.current = false;
            return
        }
        console.debug(`${renderId.current}: ${name} changed:`, data)
    }, [data])
};