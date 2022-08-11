
export type ChoiceOption = number | {
    value: number;
    options?: { [key: string]: ChoiceOption }
    locale?: {
        [key: string]: { displayName: string }
}
};

export type ChoiceType = {
    type: "choice";
    options?: {
        [key: string]: ChoiceOption;
    };
};