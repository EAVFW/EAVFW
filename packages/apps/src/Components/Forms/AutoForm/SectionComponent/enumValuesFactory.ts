
export function enumValuesFactory(data: [string, any], locale: string) {
    if (typeof data[1] === "object") {

        return data[1].value;
    }
    return data[1];

}