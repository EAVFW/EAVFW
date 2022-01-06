
export function enumDisplayNameFactory(data: [string, any], locale: string) {
    if (typeof data[1] === "object") {

        if (typeof data[1].locale === "object" && locale in data[1].locale) {
            return data[1].locale[locale].displayName ?? data[1].text ?? data[0]
        }

        return data[1].text;
    }
    return data[0];
}
