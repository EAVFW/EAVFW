

export type ExpressionParserContextType = {
    appendVariables: (variables: any) => void;
    addExpresssion: (id: string, expression: string, context: any, oncallback:(data:any,error:any)=>void) => void;
    removeExpression: (id: string) => void;
    setFormValues: (values: any) => void;
    variables: any;
    allExpressionEvaluated: boolean,
    isVariablesUpToDate: boolean;
    formValues: any;
    isInitialized: boolean,
    expressionsResults: any;
};