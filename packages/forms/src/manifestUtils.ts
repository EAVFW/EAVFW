import { EntityDefinition, ManifestDefinition } from '@eavfw/manifest';

/**
 * Simple object check.
 * @param item - The value to check
 * @returns True if item is a non-null, non-array object
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return item != null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 *
 * This is a local copy specific to manifest handling, NOT the one from @eavfw/utils.
 *
 * @param target - The target object to merge into
 * @param sources - Source objects to merge from
 * @returns The merged target object
 */
export function mergeDeep(
  target: Record<string, unknown>,
  ...sources: Record<string, unknown>[]
): Record<string, unknown> {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Represents a validation expression to apply to a manifest entity or attribute.
 */
export type ValidationExpression = {
  validationexpression: Record<string, unknown> | undefined;
  isEntity: boolean; //wether multiplefiles or not
  attributeKey: string;
};

/**
 * Applies a validation expression to a manifest, returning a new manifest with the validation set.
 *
 * @param manifest - The current manifest definition
 * @param expression - The validation expression to apply
 * @returns A new manifest with the validation expression applied
 *
 * @example
 * ```ts
 * const updated = addValidation(manifest, {
 *   validationexpression: { required: true },
 *   isEntity: false,
 *   attributeKey: 'email',
 * });
 * ```
 */
export const addValidation = (
  manifest: ManifestDefinition,
  expression: ValidationExpression,
): ManifestDefinition => {
  let newmanifest: ManifestDefinition = {} as ManifestDefinition;
  if (expression.isEntity) {
    newmanifest = {
      ...manifest,
      entities: {
        ...manifest.entities,
        [expression.attributeKey]: {
          ...manifest.entities[expression.attributeKey],
          validation: (expression.validationexpression ||
            undefined) as EntityDefinition['validation'],
        },
      },
    };
  } else {
    newmanifest = {
      ...manifest,
      entities: {
        ...manifest.entities,
        ['Form Submission']: {
          ...manifest.entities['Form Submission'],
          attributes: {
            ...manifest.entities['Form Submission'].attributes,
            [expression.attributeKey]: {
              ...manifest.entities['Form Submission'].attributes[expression.attributeKey],
              validation: (expression.validationexpression ||
                undefined) as EntityDefinition['validation'],
            },
          },
        },
      },
    };
  }

  return newmanifest;
};
