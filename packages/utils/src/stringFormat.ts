
"use strict";
export function stringFormat(format: string, ...params: any[]): string {
    if (params.length) {
        let key;

        for (key in params) {
            format = format.replace(new RegExp("\\{" + key + "\\}", "gi"), params[key]);
        }
    }

    return format;
}
