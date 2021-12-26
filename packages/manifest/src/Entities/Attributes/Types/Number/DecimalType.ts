export type DecimalType = {
    type: "decimal";
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    decimals?: number;
}