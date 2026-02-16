/** Attribute type for decimal (floating-point) numeric values with optional range and precision. */
export type DecimalType = {
  type: 'decimal';
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  decimals?: number;
};
