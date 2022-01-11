
export const deepDiffMapper = function () {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function (oldValue: any, newValue: any, doArrayIdDiff =false) {
            if (this.isFunction(oldValue) || this.isFunction(newValue)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(oldValue) || this.isValue(newValue)) {
                return {
                    __type: this.compareValues(oldValue, newValue),
                    data: newValue === undefined ? oldValue : newValue
                };
            }

            const isArray = Array.isArray(oldValue) || Array.isArray(newValue);

            if (isArray && doArrayIdDiff) {
                console.log("Array Diff" ,[ oldValue, newValue])
                let newhash = Object.fromEntries(newValue.filter((n: any) => n.id ?? n["__id"]).map((n: any) => [n.id ?? n["__id"], n]));
                let oldhash = Object.fromEntries(oldValue.filter((n: any) => n.id ?? n["__id"]).map((n: any) => [n.id ?? n["__id"], n]));
                let ids = Object.keys(newhash).filter((n: string) => n in oldhash);
                let diff = {
                    __type: "list_changes",
                    data: newValue,
                    changed: ids.map(id => ({ prev_idx: oldValue.map((n: any) => n.id).indexOf(id), new_idx: newValue.map((n: any) => n.id).indexOf(id), data: this.map(oldhash[id], newhash[id]) })),
                    added: newValue.filter((n: any) => !("id" in n || "__id" in n)),
                    removed: oldValue.map((n: any) => n.id ?? n["__id"]).filter((id: any) => !(id in newhash))
                } as any;

                return diff;
            }

            let diff = {} as any;
            for (var key in oldValue) {
                if (this.isFunction(oldValue[key])) {
                    continue;
                }

                var value2 = undefined;
                if (newValue[key] !== undefined) {
                    value2 = newValue[key];
                }

                diff[key] = this.map(oldValue[key], value2, doArrayIdDiff);
            }
            for (var key in newValue) {
                if (this.isFunction(newValue[key]) || diff[key] !== undefined) {
                    continue;
                }

                diff[key] = this.map(undefined, newValue[key], doArrayIdDiff);
            }

            return diff;

        },
        compareValues: function (value1: any, value2: any) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if (value1 === undefined) {
                return this.VALUE_CREATED;
            }
            if (value2 === undefined) {
                return this.VALUE_DELETED;
            }
            return this.VALUE_UPDATED;
        },
        isFunction: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Function]';
        },
        isArray: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Array]';
        },
        isDate: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Date]';
        },
        isObject: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Object]';
        },
        isValue: function (x: any) {
            return !this.isObject(x) && !this.isArray(x);
        }
    }
}();