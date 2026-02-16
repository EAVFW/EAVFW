/** Attribute type for text values with optional format and length constraints. */
export type StringType = {
  type: 'string';
  format?: string;
  minLength?: number;
  maxLength?: number;
};
