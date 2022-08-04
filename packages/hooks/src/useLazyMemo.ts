import { DependencyList, useMemo, useRef } from "react";
import isEqual from "react-fast-compare";

export function useLazyMemo<T>(factory: () => T, deps: DependencyList | undefined): T {
	const old = useRef<T>();
	const data = useMemo(() => {
		let nested = factory();

		if (!isEqual(nested, old.current)) {
			old.current = nested;
			return nested;
		}
		return old.current!;
}, deps);


	return data;
}