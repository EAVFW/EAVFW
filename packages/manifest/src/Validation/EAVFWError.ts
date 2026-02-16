import { EAVFWErrorDefinitionMap } from './EAVFWErrorDefinitionMap';

/** A single validation error with an error message and code. */
export type EAVFWError = {
  error: string;
  code: string;
  visible?: boolean;
  [key: string]: unknown;
};

/**
 * Type guard that checks whether a validation result is a single
 * {@link EAVFWError} (as opposed to an {@link EAVFWErrorDefinitionMap}).
 *
 * @param errors - The validation result to check.
 * @returns `true` if the value is a single error.
 */
export function isEAVFWError(errors: EAVFWError | EAVFWErrorDefinitionMap): errors is EAVFWError {
  return typeof errors === 'object' && 'error' in errors && 'code' in errors;
}
