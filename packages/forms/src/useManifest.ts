import { useMemo, useRef } from 'react';
import { isLookup, ManifestDefinition } from '@eavfw/manifest';
import { useEAVForm } from './useEAVForm';
import { EAVFormContextState } from './EAVFormContextState';
import { gzip, ungzip } from 'pako';
import { defaultManifestDefinition } from './defaultManifest';

// Lazy import to break circular dependency: @eavfw/forms ↔ @eavfw/apps.
// Only accessed at render time when all modules are fully initialized.
type AppsModule = typeof import('@eavfw/apps');
let _appsModule: AppsModule | undefined;
function lazyApps(): AppsModule {
  if (!_appsModule) _appsModule = require('@eavfw/apps') as AppsModule;
  return _appsModule;
}
import { addValidation, mergeDeep, ValidationExpression } from './manifestUtils';

export type { ValidationExpression } from './manifestUtils';

/**
 * Props for the {@link useManifest} hook.
 */
export type useManifestProps = {
  entityName: string;
  attributeKey: string;
};

/**
 * React hook that reads, parses, and manages a compressed manifest stored
 * on an entity attribute.
 *
 * Returns a tuple of:
 * - The current manifest definition
 * - A setter that gzips and writes the manifest back to form state
 * - A convenience setter for applying a single validation expression
 *
 * @param props - The entity name and attribute key identifying where the manifest is stored
 * @returns A tuple of [manifest, setManifest, setValidation]
 *
 * @example
 * ```tsx
 * const [manifest, setManifest, setValidation] = useManifest({
 *   entityName: 'Form Template',
 *   attributeKey: 'manifest',
 * });
 * ```
 */
export const useManifest: (
  props: useManifestProps,
) => [
  ManifestDefinition,
  (manifest: ManifestDefinition, merge?: boolean) => void,
  (expression: ValidationExpression) => void,
] = ({ attributeKey, entityName }) => {
  const [data, { onChange: onFormDataChange }] = useEAVForm<
    Record<string, unknown>,
    Record<string, unknown>,
    EAVFormContextState<Record<string, unknown>>
  >((state) => state.formValues);

  const app = lazyApps().useModelDrivenApp();
  const entity = app.getEntity(entityName);
  const column = entity.attributes[attributeKey];

  const _manifest: ManifestDefinition = useMemo(() => {
    const value = isLookup(column.type)
      ? (data[column.logicalName.slice(0, -2)] as Record<string, unknown> | undefined)?.data
      : data[column.logicalName];

    if (value) {
      const manifest = JSON.parse(
        ungzip(
          new Uint8Array(
            atob(value as string)
              .split('')
              .map(function (c) {
                return c.charCodeAt(0);
              }),
          ),
          { to: 'string' },
        ) as string,
      );
      return manifest;
    }
    //TODO - design here to set schema from context
    return defaultManifestDefinition;
  }, [data.manifest, column.logicalName]);

  //    const _manifestmerger = useRef(_manifest);
  const _manifestmerger = useRef<ManifestDefinition>({} as ManifestDefinition);

  const setManifest = (manifest: ManifestDefinition, merge = true) => {
    const content: Record<string, unknown> = {
      ...((data[column.logicalName.slice(0, -2)] as Record<string, unknown> | undefined) ?? {
        path: `/${data.id}/manifest.json`,
        container: 'manifests',
        contenttype: 'application/json',
      }),
    };

    _manifestmerger.current = merge
      ? (mergeDeep(
          _manifestmerger.current as Record<string, unknown>,
          manifest as Record<string, unknown>,
        ) as ManifestDefinition)
      : manifest;

    content.data = btoa(
      String.fromCharCode.apply(null, Array.from(gzip(JSON.stringify(_manifestmerger.current)))),
    );

    onFormDataChange((props) => {
      props[isLookup(column.type) ? column.logicalName.slice(0, -2) : column.logicalName] =
        isLookup(column.type) ? content : content.data;
    });
  };

  return [
    _manifest,
    setManifest,
    (validationExpression: ValidationExpression) =>
      setManifest(addValidation(_manifest, validationExpression)),
  ];
};
