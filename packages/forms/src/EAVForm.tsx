import { EAVFWErrorDefinition, EAVFWErrorDefinitionMap, ManifestDefinition } from '@eavfw/manifest';
import {
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import isEqual from 'react-fast-compare';
import { EAVFormContext } from './EAVFormContext';

import cloneDeep from 'clone-deep';

import { cleanDiff, deepDiffMapper } from '@eavfw/utils';
import { EAVFormContextState } from './EAVFormContextState';
import {
  EAVCollectContext,
  EAVFormCollectorRegistration,
  EAVFormContextActions,
  EAVFormOnChangeCallbackContext,
} from './EAVFormContextActions';

import { useBlazor, useUuid } from '@eavfw/hooks';

// Lazy import to break circular dependency: @eavfw/forms ↔ @eavfw/apps.
// Only accessed at render time when all modules are fully initialized.
type AppsModule = typeof import('@eavfw/apps');
let _appsModule: AppsModule | undefined;
function lazyApps(): AppsModule {
  if (!_appsModule) _appsModule = require('@eavfw/apps') as AppsModule;
  return _appsModule;
}

import {
  callbacks,
  uuidv4,
  mergeAndUpdate,
  clearErrorsFromDiff,
  mergeErrors,
  VisitedFieldElement,
  validationResponse,
  validationRulesType,
} from './eavFormUtils';

import { useEAVForm } from './useEAVForm';
import { DirtyContainer } from './DirtyContext';
import { VisitedContainer } from './VisitedContext';

// Re-export everything from split modules so consumers importing from
// './EAVForm' or '@eavfw/forms' still see the same public API.
export type { VisitedFieldElement } from './eavFormUtils';
export {
  type SetVisitedFieldsFunction,
  type VisitedContextType,
  useVisitedContext,
  VisitedContainer,
} from './VisitedContext';

export const EAVFormValidation = ({
  children,
  initialVisitedFields,
}: PropsWithChildren<{ initialVisitedFields?: VisitedFieldElement }>) => {
  const { useModelDrivenApp, useAppInfo, WarningContextProvider } = lazyApps();
  const app = useModelDrivenApp();
  const appInfo = useAppInfo();
  const [warnings, setWarnings] = useState<Array<{ logicalName: string; warning: string }>>([]);
  const attributes = useMemo(
    () => (appInfo.currentEntityName ? app.getAttributes(appInfo.currentEntityName) : {}),
    [appInfo.currentEntityName],
  );
  const blazor = useBlazor();
  const validationRules = useMemo(
    () =>
      Object.entries(attributes)
        .filter(([key, attr]) => attr.validation)
        .map(([key, attr]) => {
          return { field: key, rules: { ...attr.validation } } as validationRulesType;
        }),
    [attributes],
  );

  const [{ localFromValues }] = useEAVForm((state) => {
    return { localFromValues: state.formValues };
  }, 100);

  if (blazor.isEnabled && blazor.addValidationRulesFunction) {
    useEffect(() => {
      setTimeout(() => {
        if (blazor.addValidationRulesFunction) {
          DotNet.invokeMethodAsync(
            blazor.namespace,
            blazor.addValidationRulesFunction,
            validationRules,
          )
            .then((_) => console.log('Validation Rules Added'))
            .catch((err) => console.error('Error when loading validation rules', [err]));
        }
      });
    }, [validationRules]);
  }

  const currentTime = useRef(new Date().getTime());
  useEffect(() => {
    const start = (currentTime.current = new Date().getTime());
    if (blazor.isEnabled) {
      setTimeout(() => {
        if (blazor.validateValidationRulesFunction) {
          DotNet.invokeMethodAsync(
            blazor.namespace,
            blazor.validateValidationRulesFunction,
            localFromValues,
          )
            .then((res) => {
              if (start !== currentTime.current) return;
              const validationResponses = res as validationResponse[];
              for (let validationResponse of validationResponses) {
                if (validationResponse.messageCode) {
                  validationResponse.message = app.getLocaleErrorMessage(
                    validationResponse.messageCode,
                    app.locale,
                  );
                }
              }
              const warnings = validationResponses
                .filter((x) => x.type === 'warning')
                .map((w) => ({
                  logicalName: attributes[w.field].logicalName,
                  warning: w.message!,
                }));
              setWarnings(warnings);
            })
            .catch((err) => console.error('Error occured in validation:', [err]));
        }
      });
    }
  }, [localFromValues]);

  return (
    <VisitedContainer id="root" initialdata={initialVisitedFields}>
      <DirtyContainer id="root">
        <WarningContextProvider value={warnings}>{children}</WarningContextProvider>
      </DirtyContainer>
    </VisitedContainer>
  );
};

export type EAVFormProps<T extends {}, TState extends EAVFormContextState<T>> = {
  purpose?: string;
  formDefinition?: ManifestDefinition;
  defaultData?: T;
  initialErrors?: EAVFWErrorDefinitionMap;
  initialVisitedFields?: VisitedFieldElement;
  onChange?: (data: T, ctx?: EAVFormOnChangeCallbackContext) => void;
  state?: Omit<TState, keyof EAVFormContextState<T>>;
  onValidationResult?: (result: {
    errors: EAVFWErrorDefinition;
    actions: EAVFormContextActions<T, TState>;
    state: TState;
  }) => void;
  stripForValidation?: (data: T) => T;
};

export const EAVForm = <T extends {}, TState extends EAVFormContextState<T>>({
  stripForValidation = (a) => a,
  purpose,
  formDefinition,
  defaultData,
  onChange,
  initialErrors,
  initialVisitedFields,
  children,
  onValidationResult,
  state: initialState,
}: PropsWithChildren<EAVFormProps<T, TState>>) => {
  const { current: state } = useRef({
    formValues: cloneDeep(defaultData) ?? {},
    formDefinition,
    errors: initialErrors ?? {},
    fieldMetadata: {},
    isErrorsUpdated: typeof initialErrors !== 'undefined',
    ...(initialState ?? {}),
  } as TState);

  const formId = useUuid();
  const blazor = useBlazor();
  const global_etag = useRef<string>(new Date().toISOString());
  const [etag, setEtag] = useState(new Date().toISOString());

  useEffect(() => {
    if (defaultData && state.formValues !== defaultData) {
      state.formValues = cloneDeep(defaultData);
      setEtag((global_etag.current = new Date().toISOString()));
    }
  }, [defaultData]);

  useEffect(() => {
    if (blazor.isEnabled) {
      setTimeout(() => {
        if (blazor.updateFormDataFunction) {
          DotNet.invokeMethodAsync<{
            errors: EAVFWErrorDefinition;
            updatedFields: Record<string, unknown>;
          }>(
            blazor.namespace,
            blazor.updateFormDataFunction,
            formId,
            etag,
            stripForValidation(state.formValues),
            typeof initialErrors === 'undefined',
            true,
            true,
          ).finally(() => {});
        }
      });
    }
  }, []);

  const runValidation = (
    complete?: () => void,
    manipulateResult?: (errors: EAVFWErrorDefinition) => EAVFWErrorDefinition,
  ) => {
    if (blazor.isEnabled) {
      const local = (global_etag.current = new Date().toISOString());
      const formValuesForValidation = stripForValidation(state.formValues);
      const id = uuidv4();

      setTimeout(() => {
        if (blazor.validateFormFunction) {
          DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition }>(
            blazor.namespace,
            blazor.validateFormFunction,
            formDefinition,
            formValuesForValidation,
            true,
          )
            .then(({ errors: results }) => {
              if (local === global_etag.current) {
                if (manipulateResult) results = manipulateResult(results);
                state.errors = results;
                state.isErrorsUpdated = true;
                if (onValidationResult)
                  onValidationResult({ errors: results, actions: actions.current, state: state });
              }
            })
            .catch((_error) => {
              /* Silently ignore: Blazor validation interop may fail during teardown */
            })
            .finally(() => {
              if (local === global_etag.current) {
                if (onChange) onChange(cloneDeep(state.formValues));
                setEtag(global_etag.current);
                if (complete) complete();
              }
            });
        }
      });
      return true;
    }
    return false;
  };

  const collectors = useRef<{ [key: string]: EAVFormCollectorRegistration }>({});

  const actions: MutableRefObject<EAVFormContextActions<T, TState>> = useRef({
    useCollector: (collector) => {
      const [collected, setCollected] = useState<
        EAVCollectContext<T, TState, ReturnType<typeof collector>>
      >([collector(state), actions.current, etag]);

      useEffect(() => {
        let id = uuidv4();
        collectors.current[id] = {
          oldValue: collected[0],
          trigger: (localstate: EAVFormContextState<unknown>, etag: string) => {
            let newValue = collector(localstate as TState);
            if (!isEqual(collectors.current[id].oldValue, newValue)) {
              collectors.current[id].oldValue = cloneDeep(newValue);
              setCollected([collector(localstate as TState), actions.current, etag]);
            }
          },
        };
        return () => {
          delete collectors.current[id];
        };
      }, []);
      return collected;
    },
    runValidation: runValidation,
    updateState: (
      cb: (props: TState, ctx: { replaceState: boolean }) => void,
    ): { changedProp: boolean; changedValues: Record<string, unknown> } | undefined => {
      try {
        console.time('Callings Calback');
        const updatedProps = cloneDeep(state);
        const ctx = { replaceState: false };
        cb(updatedProps, ctx);
        console.timeEnd('Callings Calback');
        console.time('Computing Diff');
        const a = deepDiffMapper.map(state, updatedProps);
        console.timeEnd('Computing Diff');
        console.time('Running Diff');
        const [changedProp, changedValues] = cleanDiff(a);
        console.timeEnd('Running Diff');
        if (changedProp) {
          if (ctx.replaceState) {
            for (let [k, v] of Object.entries(updatedProps)) {
              (state as Record<string, unknown>)[k] = v;
            }
          } else {
            if (changedValues) mergeAndUpdate(state, changedValues);
          }
          let newetag = new Date().toISOString();
          for (let collector of Object.values(collectors.current)) {
            collector.trigger(state, newetag);
          }
          setEtag((global_etag.current = newetag));
        }
        return { changedProp, changedValues: changedValues as Record<string, unknown> };
      } finally {
      }
    },
    addVisited: (id: string) => {},
    onChange: (cb) => {
      const updatedProps = cloneDeep(state.formValues);
      const ctx: EAVFormOnChangeCallbackContext = { skipValidation: false };
      cb(updatedProps, ctx);
      const changed = !isEqual(state.formValues, updatedProps);
      const a = deepDiffMapper.map(state.formValues, updatedProps);
      const [_, changedValues] = cleanDiff(a);

      if (changed) {
        const local = (global_etag.current = new Date().toISOString());
        state.formValues = updatedProps;
        let cloneerrors = cloneDeep(state.errors);
        clearErrorsFromDiff(
          state.errors as unknown as Record<string, unknown>,
          a as Record<string, unknown>,
        );
        if (blazor.isEnabled) {
          state.isErrorsUpdated = false;
          setTimeout(() => {
            if (blazor.updateFormDataFunction && local === global_etag.current) {
              DotNet.invokeMethodAsync<{
                errors: EAVFWErrorDefinition;
                updatedFields: Record<string, unknown>;
              }>(
                blazor.namespace,
                blazor.updateFormDataFunction,
                formId,
                local,
                stripForValidation(state.formValues),
                true,
                true,
                true,
              ).finally(() => {});
            }
          });
        }
        for (let collector of Object.values(collectors.current)) {
          collector.trigger(state, local);
        }
        setEtag(local);
        if (onChange) onChange(state.formValues, ctx);
      }
      return state;
    },
  } as EAVFormContextActions<T, TState>);

  useEffect(() => {
    callbacks[formId] = (etag: string, errors: EAVFWErrorDefinition, log?: string) => {
      if (etag === global_etag.current) {
        const clone = cloneDeep(state.errors);
        var test = mergeErrors(
          state.errors as EAVFWErrorDefinitionMap,
          errors as EAVFWErrorDefinitionMap,
        );
        state.isErrorsUpdated = true;
        if (onValidationResult)
          onValidationResult({ errors: errors, actions: actions.current, state: state });
        setEtag((global_etag.current = new Date().toISOString()));
      }
    };
    return () => {
      delete callbacks[formId];
    };
  }, []);

  return (
    <EAVFormContext.Provider
      value={{ purpose: purpose ?? 'default', actions: actions.current, state: state, etag }}
    >
      <EAVFormValidation initialVisitedFields={initialVisitedFields}>{children}</EAVFormValidation>
    </EAVFormContext.Provider>
  );
};
