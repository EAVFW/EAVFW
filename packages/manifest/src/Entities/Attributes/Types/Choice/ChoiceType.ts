
export type ChoiceOption = number | { value: number; options?: { [key:string]: ChoiceOption} };

export type ChoiceType = {
    type: "choice";
    options?: {
        [key: string]: ChoiceOption;
    };
};