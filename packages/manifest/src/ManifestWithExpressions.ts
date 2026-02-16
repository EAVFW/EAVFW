import { ManifestDefinition } from './ManifestDefinition';

/**
 * Recursive utility type that allows every property to also be a string
 * expression (e.g. `"@currentUser.name"`).
 */
type TypeOrString<T> = {
  [P in keyof T]: T[P] | TypeOrString<T[P]> | string;
};

/**
 * A {@link ManifestDefinition} where every property may alternatively be
 * an expression string. Used as the input type before expression evaluation
 * resolves all values to their concrete types.
 */
export type ManifestWithExpressions = TypeOrString<ManifestDefinition>;
