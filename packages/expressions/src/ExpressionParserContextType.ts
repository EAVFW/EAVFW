

export type ExpressionParserContextType = {
    appendVariables: (variables: any) => void;
    addExpresssion: (id: string, expression: string, context: any) => void;
    setExpressionResult: (id: string, result: any, error: any) => void,
    removeExpression: (id: string) => void;
    setFormValues: (values: any) => void;
    variables: any;
    allExpressionEvaluated: boolean,
    isVariablesUpToDate: boolean;
    formValues: any;
    isInitialized: boolean
};