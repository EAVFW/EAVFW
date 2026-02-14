
let n = 0;

export function cleanDiff(updatedValues: object, isArray: boolean = false): [boolean, any] {
    let id = n++;
    console.time("cleandiff" + id);
    try {
       
        let a = isArray?[]: { } as any;
        let changed = false;
        for (let [key, value] of Object.entries(updatedValues)) {
            if ("__type" in value) {
                if (value.__type === "updated" || value.__type === "created") {
                    a[key] = value.data;
                    changed = true;
                } else if (value.__type === "deleted") {

                   // if (value.data.id) {
                      //  a[key] = undefined;
                    //}

                    changed = true;                
                } else if (key === "id") {
                    a[key] = value.data;
                }
            } else {
                const [_changed, _value] = cleanDiff(value, key.endsWith("@deleted"));

                if (typeof _value !== "undefined" && _changed)
                    a[key] = _value
                changed ||= _changed;

            }
        }
        return [changed, changed ? a : undefined]
    } finally {
       
        console.timeEnd("cleandiff" + id);
    }
    
}