import React, { PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';

declare global {
  interface Window {
    Blazor: { start: (config: Record<string, unknown>) => Promise<void> };
  }
}

const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const addValidationRulesFunction = process.env['NEXT_PUBLIC_BLAZOR_ADD_VALIDATION_RULES'];
const validateValidationRulesFunction = process.env['NEXT_PUBLIC_BLAZOR_VALIDATE_VALIDATION_RULES'];
const validateFormFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];
const updateFormDataFunction = process.env['NEXT_PUBLIC_BLAZOR_UPDATE_FORM_DATA'];
/**
 * Context value when Blazor WebAssembly is not available or not configured.
 *
 * @example
 * ```ts
 * const blazor = useBlazor();
 * if (!blazor.isEnabled) {
 *   // Blazor is not available
 * }
 * ```
 */
export type DisabledBlazorContextType = {
  isEnabled: false;
  isInitialized: false;
  namespace: undefined;
  startTime: number;
};
/**
 * Context value when Blazor WebAssembly is enabled and its namespace is
 * configured via `NEXT_PUBLIC_BLAZOR_NAMESPACE`. Contains the function
 * names used to invoke .NET validation and form-data methods.
 */
export type EnabledBlazorContextType = {
  isInitialized: boolean;
  isEnabled: true;
  namespace: string;
  init_time?: string;
  startTime: number;
  addValidationRulesFunction?: string;
  validateValidationRulesFunction?: string;
  validateFormFunction?: string;
  updateFormDataFunction?: string;
};

const blazorContext = React.createContext<DisabledBlazorContextType | EnabledBlazorContextType>({
  isInitialized: false,
  isEnabled: false,
} as DisabledBlazorContextType);
/**
 * Returns the current Blazor interop context. Check `isEnabled` before
 * calling any .NET interop functions.
 *
 * @returns The Blazor context — either {@link DisabledBlazorContextType}
 *   or {@link EnabledBlazorContextType}.
 *
 * @example
 * ```tsx
 * const blazor = useBlazor();
 * if (blazor.isEnabled && blazor.isInitialized) {
 *   DotNet.invokeMethodAsync(blazor.namespace, 'MyMethod');
 * }
 * ```
 */
export const useBlazor = () => useContext(blazorContext);
/**
 * Provider component that bootstraps the Blazor WebAssembly runtime and
 * exposes its state via {@link useBlazor}. When `NEXT_PUBLIC_BLAZOR_NAMESPACE`
 * is set and `window.Blazor` exists, the runtime is started and resources are
 * loaded. Otherwise a disabled context is provided.
 *
 * @example
 * ```tsx
 * <BlazorProvider>
 *   <App />
 * </BlazorProvider>
 * ```
 */
export const BlazorProvider = ({ children }: PropsWithChildren) => {
  const [isInitialized, setInitialized] = useState(false);
  const [initTime, setInitTime] = useState<string>();
  const startTime = useMemo(() => new Date().getTime(), []);

  if (typeof namespace !== 'undefined' && typeof window !== 'undefined' && window.Blazor) {
    useEffect(() => {
      let loadedCount = 0;
      const resourcesToLoad = [];

      window.Blazor.start({
        loadBootResource: function (
          type: string,
          name: string,
          defaultUri: string,
          integrity: string,
        ) {
          switch (type) {
            case 'dotnetjs':
              return defaultUri;
            default:
              let fetchResources = fetch(defaultUri, {
                cache: 'no-cache',
                integrity: integrity,
                headers: { 'Custom-Header': 'Custom Value' },
              });

              resourcesToLoad.push(fetchResources);

              fetchResources.then((rsp) => {
                loadedCount += 1;
                if (name == 'blazor.boot.json') return;
                const totalCount = resourcesToLoad.length;
                const percentLoaded = 10 + Math.floor((loadedCount * 90.0) / totalCount);
                const elapsed = new Date().getTime() - startTime;
                const expectedTotal = (elapsed / percentLoaded) * 100;
                const remaining = expectedTotal - elapsed;
              });

              return fetchResources;
          }

          //switch (type) {
          //    case 'dotnetjs':
          //    case 'dotnetwasm':
          //    case 'timezonedata':
          //        return `https://cdn.example.com/blazorwebassembly/5.0.0/${name}`;
          //}
        },
      }).then(() => {
        DotNet.invokeMethodAsync(namespace, 'GetSystemInfo').then((result: unknown) => {
          const info = result as { init_time: string };
          setInitTime(info.init_time);
          setInitialized(true);
        });
      });
    }, []);

    return (
      <blazorContext.Provider
        value={
          {
            addValidationRulesFunction,
            updateFormDataFunction,
            validateValidationRulesFunction,
            validateFormFunction,
            startTime: startTime,
            isInitialized: isInitialized,
            namespace: namespace,
            init_time: initTime,
            isEnabled: typeof namespace !== 'undefined' && !!window.Blazor,
          } as EnabledBlazorContextType
        }
      >
        {children}
      </blazorContext.Provider>
    );
  }

  return (
    <blazorContext.Provider
      value={{ startTime, isEnabled: false, isInitialized: false, namespace: undefined }}
    >
      {children}
    </blazorContext.Provider>
  );
};
