export type ChoiceType = {
    type: "choice";
    options?: {
        [key: string]: number;
    };
};