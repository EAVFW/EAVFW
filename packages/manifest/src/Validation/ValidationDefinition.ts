/** Legacy (v1) validation rule using a raw expression and inline error object. */
export type ValidationDefinitionV1 = {
  /** The expression to evaluate for validation. */
  expression: string;
  /** Error details shown when validation fails. */
  error: {
    error: string;
    [key: string]: unknown;
  };
};

/**
 * Modern (v2) validation rule with an `isValid` expression and structured
 * message support including locale-aware message codes.
 */
export type ValidationDefinitionV2 = {
  isValid: string;
  message?: string;
  messageCode?: string;
  messageArgs?: unknown[];
  type?: 'info' | 'warning' | 'error';
};
