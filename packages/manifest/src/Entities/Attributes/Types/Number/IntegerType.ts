/** Attribute type for whole-number integer values with optional range constraints. */
export type IntegerType = {
  type: 'integer';
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
};
