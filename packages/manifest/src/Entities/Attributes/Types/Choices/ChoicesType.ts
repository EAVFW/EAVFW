export type ChoicesType = {
    type: "choices";
    name: string;
    pluralName: string;
    logicalName: string;
    options?: {
        [key: string]: number;
    };
};
