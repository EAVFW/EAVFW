
export type ExpressionParserContextType = {
    appendVariables: (variables: any) => void;
    setFormValues: (values: any) => void;
    variables: any;
    formValues: any;
};