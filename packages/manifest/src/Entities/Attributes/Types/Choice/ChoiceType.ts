export type SimpleChoiceOption = number
export type ComplexChoiceOption =
    {
        value: number;
        options?: { [key: string]: ChoiceOption }
        locale?: {
            [key: string]: { displayName: string }
        }
    }
    
export type ChoiceOption = SimpleChoiceOption | ComplexChoiceOption 

export type ChoiceType = {
    type: "choice";
    options?: {
        [key: string]: ChoiceOption;
    };
};