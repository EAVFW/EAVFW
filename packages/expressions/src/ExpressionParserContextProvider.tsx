import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExpressionParserContext } from './ExpressionParserContext';
import { EnabledBlazorContextType, useBlazor, useDebouncer } from '@eavfw/hooks';

//const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const setVariablesFunction = process.env['NEXT_PUBLIC_BLAZOR_SET_VARIABLES'];

declare global {
  interface Window {
    expressionUpdated: (id: string, result: unknown) => void;
    expressionError: (id: string, error: unknown) => void;
    multipleExpressionsUpdated: (
      valuesToUpdate: { id: string; result?: unknown; error?: unknown }[],
    ) => void;
  }
}

const expressionResults: Record<string, (result?: unknown, error?: unknown) => void> = {};
if (typeof global.window !== 'undefined') {
  window['multipleExpressionsUpdated'] = function (
    valuesToUpdate: { id: string; result?: unknown; error?: unknown }[],
  ) {
    if (valuesToUpdate != undefined && valuesToUpdate.length != 0) {
      setTimeout(() => {
        valuesToUpdate.forEach((elem) => {
          expressionResults[elem.id](elem.result, elem.error);
        });
      });
    }
  };

  window['expressionUpdated'] = function (id: string, result: unknown) {
    setTimeout(() => {
      expressionResults[id](result);
    });
  };

  window['expressionError'] = function (id: string, error: unknown) {
    setTimeout(() => {
      expressionResults[id](undefined, error);
    });
  };
}

/**
 * Top-level provider that manages expression registration, variable state,
 * and communication with the Blazor WebAssembly expression engine. Wrap
 * your form tree with this provider so that child controls can register
 * expressions via {@link useExpressionParser}.
 *
 * Variables and expressions are debounced (250 ms) before being sent to the
 * Blazor runtime to avoid excessive interop calls during rapid form edits.
 *
 * @example
 * ```tsx
 * <ExpressionParserContextProvider>
 *   <MyForm />
 * </ExpressionParserContextProvider>
 * ```
 */
export const ExpressionParserContextProvider = ({ children }: PropsWithChildren) => {
  const _variables = useRef<Record<string, unknown>>({});
  const _expresssions = useRef<Record<string, unknown>>({});
  const _results = useRef<Record<string, { isLoading: boolean; data?: unknown; error?: unknown }>>(
    {},
  );
  const [variables, setVariables] = useState(_variables.current);
  const [formValues, setFormValues] = useState({});
  const [expressions, setExpressions] = useState({});
  const [results, setResults] = useState({});

  const blazor = useBlazor();
  const [isVariablesUpToDate, setIsVariablesUpToDate] = useState(true);
  const [isParserContextVariablesInitialized, setisParserContextVariablesInitialized] =
    useState(false);
  const [isParserContextExpressionsInitialized, setisParserContextExpressionsInitialized] =
    useState(false);

  //Using a ref to store variables to avoid triggering changes on the appendVariables method
  const _appendVariables = useCallback((obj: Record<string, unknown>) => {
    _variables.current = {
      ..._variables.current,
      ...obj,
    };
    setIsVariablesUpToDate(false);
    setVariables(_variables.current);
  }, []);

  const [_resultetag, set_resultetag] = useState(new Date().getTime());
  const t = useRef(0);

  const _appendExpression = useCallback(
    (
      id: string,
      expresssion: string,
      context: Record<string, unknown>,
      oncallback: (data: unknown, error: unknown, id?: string) => void,
    ) => {
      _results.current[id] = { isLoading: false };

      expressionResults[id] = (result?: unknown, error?: unknown) => {
        oncallback(result, error, id);
        _results.current[id].data = result;
        _results.current[id].isLoading = false;
        _results.current[id].error = error;

        window.clearTimeout(t.current);
        t.current = window.setTimeout(() => {
          set_resultetag(new Date().getTime());
        }, 400);
      };

      setExpressions(
        (_expresssions.current = {
          ..._expresssions.current,
          [id]: {
            expression: expresssion,
            context: context,
          },
        }),
      );

      //setResults(_results.current = {
      //    ..._results.current,
      //    [id]: {
      //        data: undefined, isLoading: true, error: undefined
      //    }
      //});
    },
    [],
  );

  const allEvaluated = useMemo(
    () => Object.values(_results.current).filter((x) => x.isLoading === true).length === 0,
    [_resultetag],
  );

  const _removeExpresssion = useCallback((id: string) => {
    let expr = { ..._expresssions.current };
    delete expr[id];
    setExpressions((_expresssions.current = expr));
  }, []);

  useEffect(() => {}, [formValues]);

  const _ti = useRef(new Date().getTime());
  const _d = useDebouncer(
    () => {
      if (
        blazor.isEnabled &&
        setVariablesFunction &&
        blazor.isInitialized &&
        !isVariablesUpToDate
      ) {
        const localtime = (_ti.current = new Date().getTime());
        DotNet.invokeMethodAsync(blazor.namespace, setVariablesFunction, _variables.current)
          .then(() => {
            if (localtime === _ti.current) {
              setIsVariablesUpToDate(true);
              setisParserContextVariablesInitialized(true);
            }
          })
          .catch((_error) => {
            /* Silently ignore: Blazor interop may fail during hot-reload or teardown */
          })
          .finally(() => {
            //   alert("variables set in " + (new Date().getTime() - time));
          });
      }
    },
    250,
    [isVariablesUpToDate, variables, blazor.isInitialized],
  );

  useEffect(() => {
    _d();
  }, [isVariablesUpToDate, variables, blazor.isInitialized]);
  const _tii = useRef(new Date().getTime());
  const _dd = useDebouncer(
    () => {
      if (blazor.isEnabled && setVariablesFunction && blazor.isInitialized) {
        const localtime = (_tii.current = new Date().getTime());
        DotNet.invokeMethodAsync(blazor.namespace, 'SetExpresssions', _expresssions.current)
          .then(() => {
            if (localtime === _tii.current) {
              setisParserContextExpressionsInitialized(true);
            }
          })
          .catch((_error) => {
            /* Silently ignore: Blazor interop may fail during hot-reload or teardown */
          })
          .finally(() => {
            //   alert("variables set in " + (new Date().getTime() - time));
          });
      }
    },
    250,
    [expressions, blazor.isInitialized],
  );

  useEffect(() => {
    _dd();
  }, [expressions, blazor.isInitialized]);

  return (
    <ExpressionParserContext.Provider
      value={{
        isInitialized: isParserContextExpressionsInitialized && isParserContextVariablesInitialized,
        formValues,
        setFormValues,
        allExpressionEvaluated: allEvaluated,
        appendVariables: _appendVariables,
        expressionsResults: _results.current,
        addExpresssion: _appendExpression,
        removeExpression: _removeExpresssion,
        variables,
        isVariablesUpToDate: isVariablesUpToDate,
      }}
    >
      {children}
    </ExpressionParserContext.Provider>
  );
};
