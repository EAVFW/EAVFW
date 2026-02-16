/**
 * String literal union of primitive attribute type names. When an attribute's
 * `type` is a bare string (not an object), it must be one of these values.
 */
export type PrimitiveType = Lowercase<
  | 'string'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'Text'
  | 'MultilineText'
  | 'datetime'
  | 'guid'
  | 'number'
  | 'date'
  | string
>;
