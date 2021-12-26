export type ValidationDefinition = {
    expression: string,
    error: {
        error: string
        [key: string]: any;
    }
}