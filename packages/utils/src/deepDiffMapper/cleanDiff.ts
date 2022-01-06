export function cleanDiff(updatedValues: object): [boolean, any] {
    try {
        console.group("cleanDiff");
        let a = {} as any;
        let changed = false;
        console.log("cleanDiff: Start: ", updatedValues);
        for (let [key, value] of Object.entries(updatedValues)) {
            console.log("cleanDiff: entry: ", [changed, "__type" in value, key, value]);
            if ("__type" in value) {
                if (value.__type === "updated" || value.__type === "created") {
                    a[key] = value.data;
                    changed = true;
                } else if (key === "id") {
                    a[key] = value.data;
                }
            } else {
                const [_changed, _value] = cleanDiff(value);

                a[key] = _value
                changed ||= _changed;

            }
        }
        console.log("CleanDiff: End: ", [updatedValues, a, changed ? a : undefined]);
        return [changed, changed ? a : undefined]
    } finally {
        console.groupEnd();
    }
}