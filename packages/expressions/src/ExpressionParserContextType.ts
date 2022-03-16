
export type ExpressionParserContextType = {
    appendVariables: (variables: any) => void;
    addExpresssion: (id: string, expression: string, context: any) => void;
    removeExpression: (id: string) => void;
    setFormValues: (values: any) => void;
    variables: any;
    formValues: any;
};