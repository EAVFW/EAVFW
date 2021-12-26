
export type FormTabDefinition = {
    title: string;
    locale?: {
        [localeKey: string]: {
            title: string;
        };
    };
    columns: {
        [columnName: string]: {
            sections: {
                [sectionName: string]: any;
            };
        };
    };
};