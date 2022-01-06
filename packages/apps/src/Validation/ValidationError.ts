export type ValidationError = {
    Error: string;
    Code: string;
    ErrorArgs: object[];
    AttributeSchemaName: string;
    EntityCollectionSchemaName: string;
}