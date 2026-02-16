import {
  EAVFWError,
  EAVFWErrorDefinition,
  isEAVFWError,
  ManifestDefinition,
} from '@eavfw/manifest';

export type JsonSchemaErrorObject = {
  __errors: Array<string>;
};
export type JsonSchemaErrorObjectWrap = {
  [key: string]: JsonSchemaError;
};
export type JsonSchemaError =
  | JsonSchemaErrorObjectWrap
  | JsonSchemaErrorObject
  | Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;

export const rjsfErrors: (
  arg: EAVFWErrorDefinition,
  state?: Record<string, unknown>,
  fx?: (n: EAVFWError, state: Record<string, unknown>) => JsonSchemaErrorObject,
) => JsonSchemaError = (errors, state = {}, fx) => {
  if (typeof errors === 'undefined') return {} as JsonSchemaErrorObjectWrap;

  if (Array.isArray(errors)) {
    //Either its schema array or its array of errors
    errors = errors.filter((e) => !isEAVFWError(e) || e.visible !== false);

    if (errors.filter((c) => isEAVFWError(c)).length === errors.length) {
      return {
        __errors: ([] as string[]).concat(
          ...(
            errors.map((e, i) =>
              rjsfErrors(e, Array.isArray(state) ? state[i] : state, fx),
            ) as Array<JsonSchemaErrorObject>
          ).map((c) => c.__errors),
        ),
      };
    } else {
      //The stateobject is not a real array, object with "0" "1" ect. no good way to detect if shold use state[i] or state
      return errors.map((e, i) =>
        rjsfErrors(e, (state?.[i] ?? state) as Record<string, unknown>, fx),
      ) as Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;
    }
  }

  if (isEAVFWError(errors)) {
    if (fx) return fx(errors, state) as JsonSchemaErrorObject;
    return { __errors: [errors.error] } as JsonSchemaErrorObject;
  }

  const entries = Object.entries(errors).map(([k, v]) => [
    k,
    rjsfErrors(v, state[k] as Record<string, unknown> | undefined, fx),
  ]);
  return Object.fromEntries(entries) as JsonSchemaErrorObjectWrap;
};
