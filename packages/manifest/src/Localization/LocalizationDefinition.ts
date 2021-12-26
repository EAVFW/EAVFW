
/**
 * LocalizationDefinition
 * 
 * Defines Localized values and its default value
 * 
 * */
export type LocalizationDefinition = {
    value: string;
    plural: string;
    locale?: {
        [locale: string]: Omit<LocalizationDefinition, "locale">;
    };
};
