import {
  EAVFWError,
  EAVFWErrorDefinition,
  EAVFWErrorDefinitionMap,
  isEAVFWError,
  ValidationDefinitionV1,
  ValidationDefinitionV2,
} from '@eavfw/manifest';
import isEqual from 'react-fast-compare';

/**
 * Window global callback registry for Blazor form value updates.
 * Keyed by form ID, each callback receives etag, validations, and optional log.
 */
export const callbacks: { [key: string]: Function } = {};

declare global {
  interface Window {
    formValuesUpdate: (
      id: string,
      etag: string,
      validations: EAVFWErrorDefinition,
      log?: string,
    ) => void;
  }
}

if (typeof global.window !== 'undefined') {
  window['formValuesUpdate'] = function (
    id: string,
    etag: string,
    validations: EAVFWErrorDefinition,
    log?: string,
  ) {
    if (id in callbacks) {
      callbacks[id](etag, validations, log);
    }
  };
}

/**
 * Generate a UUID v4 string using crypto.getRandomValues.
 */
export function uuidv4() {
  // @ts-expect-error - arithmetic on number literals to build UUID template string
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

/**
 * Check whether a value is neither null nor undefined.
 */
export function isDefined(v: unknown) {
  return !(v === null || typeof v === 'undefined');
}

/**
 * Recursively merge `updatedFields` into `data`, handling arrays, objects,
 * and the special `@deleted` suffix convention for soft-deletes.
 */
export function mergeAndUpdate<T extends object>(
  data: Record<string, unknown>,
  updatedFields: T,
): T {
  if (updatedFields) {
    for (let [k, v] of Object.entries(updatedFields) as [string, unknown][]) {
      if (k.endsWith('@deleted') && data[k] && isDefined(v)) {
        const vArr = v as string[];
        const dkArr = (data[k] ?? []) as string[];
        data[k] = vArr
          .filter((c: string) => c)
          .concat(
            dkArr.filter((vvv: string) => vArr.filter((vv: string) => vv === vvv).length == 0),
          );
        (data[k.slice(0, -8)] as Record<string, unknown>[]) = (
          data[k.slice(0, -8)] as Record<string, unknown>[]
        ).filter(
          (n: Record<string, unknown>) =>
            n && (data[k] as string[]).filter((nn: string) => nn === n.id).length === 0,
        );
      } else if (Array.isArray(v)) {
        let a = (data[k] ?? []) as unknown[];

        v.forEach((value: unknown, index: number) => {
          let va = mergeAndUpdate(
            (a[index] ?? value) as Record<string, unknown>,
            value as Record<string, unknown>,
          );
          if (isDefined(va)) a[index] = va;
        });

        data[k] = a;
      } else if (typeof v === 'object' && v !== null) {
        data[k] = mergeAndUpdate(
          (data[k] ?? {}) as Record<string, unknown>,
          v as Record<string, unknown>,
        );
      } else if ((isDefined(data[k]) || isDefined(v)) && !isEqual(data[k], v)) {
        //Dont consider null and undefined a difference
        if (Array.isArray(data)) {
          (data as unknown[]).splice(parseInt(k), 1);
        } else {
          if (isDefined(data[k]) && !isDefined(v)) delete data[k];
          else data[k] = v;
        }
      }
    }
  }

  return data as unknown as T;
}

export type VisitedFieldElement = {
  [key: string]: VisitedFieldElementValue;
};
export type VisitedFieldElementValue = VisitedFieldElement | boolean | Array<VisitedFieldElement>;

/**
 * Walk through a diff tree and delete errors for any attribute
 * whose diff type is not 'unchanged'.
 */
export function clearErrorsFromDiff(
  errors: Record<string, unknown> | undefined,
  diffs: Record<string, unknown>,
) {
  if (!errors) return;

  for (let [k, v] of Object.entries(diffs)) {
    if (typeof v === 'object' && v) {
      if ('__type' in v) {
        if (v['__type'] !== 'unchanged') {
          delete errors[k];
        }
      } else {
        clearErrorsFromDiff(
          errors[k] as Record<string, unknown> | undefined,
          v as Record<string, unknown>,
        );
      }
    }
  }
}

/**
 * Recursively remove error entries that correspond to changed values.
 */
export function clearErrors(errors: Record<string, unknown>, changes: Record<string, unknown>) {
  if (!changes) return;
  if (!errors) return;

  for (let [k, v] of Object.entries(changes)) {
    if (Array.isArray(v)) {
      if (!Array.isArray(errors[k])) {
        errors[k] = [];
      }

      if (errors[k]) {
        const errArr = errors[k] as Record<string, unknown>[];
        for (let [idx, av] of Object.entries(v)) {
          clearErrors(
            errArr[idx as unknown as number] as Record<string, unknown>,
            av as Record<string, unknown>,
          );
        }
      }
    } else if (typeof v === 'object') {
      if (isEAVFWError(errors[k] as EAVFWError | EAVFWErrorDefinitionMap)) delete errors[k];
      else clearErrors(errors[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      delete errors[k];
    }
  }
}

export type validationRulesType = {
  field: string;
  rules: { [validationKey: string]: ValidationDefinitionV1 | ValidationDefinitionV2 };
};

export type validationResponse = {
  field: string;
  validationKey: string;
  message?: string;
  messageCode?: string;
  type: 'info' | 'warning' | 'error';
};

/**
 * Deep-merge two error definition maps, preserving array structure
 * and recursing into nested error objects.
 */
export function mergeErrors(
  err1: EAVFWErrorDefinitionMap,
  err2: EAVFWErrorDefinitionMap,
): EAVFWErrorDefinitionMap {
  if (!err2) return err1;

  for (let [k, e] of Object.entries(err2)) {
    if (Array.isArray(e)) {
      err1[k] = e.map((ee, ii) => {
        if (isEAVFWError(ee)) {
          return ee;
        } else {
          let left = err1[k] as EAVFWErrorDefinitionMap[];
          return mergeErrors(left?.[ii] ?? {}, ee);
        }
      });
    } else if (isEAVFWError(e)) {
      err1[k] = e;
    } else {
      err1[k] = mergeErrors((err1[k] as EAVFWErrorDefinitionMap) ?? {}, e);
    }
  }

  return err1;
}
