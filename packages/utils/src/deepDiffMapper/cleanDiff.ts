export function cleanDiff(updatedValues: object): [boolean, any] {
    try {
       // console.group("cleanDiff");
        let a = {} as any;
        let changed = false;
       // console.log("cleanDiff: Start: ", updatedValues);
        for (let [key, value] of Object.entries(updatedValues)) {
       //     console.log("cleanDiff: entry: ", [changed, "__type" in value, key, value]);
            if ("__type" in value) {
                if (value.__type === "updated" || value.__type === "created") {
                    a[key] = value.data;
                    changed = true;
                } else if (value.__type === "list_changes") {

                    let l = []
                    for (let change of value.changed) {

                        
                        const [_changed, _value] = cleanDiff(change.data);
                        console.log("Running clean diff on change", [key,change, _changed, _value])
                        if (_changed)
                            changed = true;

                        l.push(_value);
                    }

                    if (l.length) {
                        a[key] = l;
                         
                    }

                    if (value.removed && value.removed.length) {
                        a[key + "@deleted"] = value.removed;
                        changed = true;
                    }
                
                } else if (key === "id") {
                    a[key] = value.data;
                }
            } else {
                const [_changed, _value] = cleanDiff(value);

                if (typeof _value !== "undefined" && _changed)
                    a[key] = _value

                changed ||= _changed;

            }
        }
      //  console.log("CleanDiff: End: ", [updatedValues, a, changed ? a : undefined]);
        return [changed, a]
    } finally {
      //  console.groupEnd();
    }
}