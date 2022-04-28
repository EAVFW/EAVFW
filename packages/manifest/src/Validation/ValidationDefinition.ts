export type ValidationDefinitionV1 = {
    expression: string,
    error: {
        error: string
        [key: string]: any;
    }
}

export type ValidationDefinitionV2 = {
    isValid: string,
    message?: string,
    messageCode?: string,
    messageArgs?: any[],
    type?: "info"|"warning"|"error"
}