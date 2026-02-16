import { useEffect, useMemo, useRef, useState } from 'react';
import { useBlazor, useUuid } from '@eavfw/hooks';
import {
  useExpressionParserAttributeContext,
  useExpressionParserLoadingContext,
} from './ExpressionParserAttributeContext';
import { useExpressionParserContext } from './useExpressionParserContext';

/**
 * Controls the evaluation order of an expression relative to other
 * registered expressions.
 *
 * - `first` — evaluated before ordered expressions.
 * - `ordered` — evaluated in registration order among other ordered expressions.
 * - `last` — evaluated after all ordered expressions (e.g. visibility).
 */
export enum ExpressionOrder {
  first = 'first',
  ordered = 'ordered',
  last = 'last',
}

/**
 * The return value of {@link useExpressionParser}, representing the
 * current state of an expression evaluation.
 *
 * @typeParam T - The expected result type of the expression.
 */
export type useExpressionParserValue<T> = {
  /** The evaluated result, the raw expression string, or `undefined` while loading. */
  data: T | string | undefined;
  /** `true` while the expression is being evaluated by the Blazor runtime. */
  isLoading: boolean;
  /** Error message if evaluation failed. */
  error?: string;
};

/**
 * React hook that registers a manifest expression for evaluation and
 * returns its current result. Expressions containing `@` are sent to the
 * Blazor runtime; plain strings are returned as-is.
 *
 * @typeParam T - The expected result type (defaults to `string`).
 * @param expression - The expression string (e.g. `"@currentUser.name"`),
 *   or `undefined` to skip evaluation.
 * @param expressionOrder - Controls evaluation priority relative to other
 *   expressions.
 * @returns An object with `data`, `isLoading`, and optional `error`.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useExpressionParser<boolean>('@canEdit');
 * if (isLoading) return <Spinner />;
 * if (data) return <EditButton />;
 * ```
 */
export function useExpressionParser<T = string>(
  expression?: string,
  expressionOrder?: ExpressionOrder,
) {
  const { variables, formValues, addExpresssion, removeExpression } = useExpressionParserContext();
  const { attributeKey, entityKey, arrayIdx } = useExpressionParserAttributeContext();
  //  const blazor = useBlazor();
  const id = useUuid();

  var [evaluated, setEvaluated] = useState<useExpressionParserValue<T>>(
    expression && expression.indexOf('@') !== -1
      ? { data: undefined, isLoading: true, error: undefined }
      : { data: expression, isLoading: false, error: undefined },
  );
  var etag = useRef(new Date().getTime());
  var oldvalue = useRef(evaluated?.data);

  useExpressionParserLoadingContext(evaluated?.isLoading, id);

  useEffect(() => {
    const etagLocal = (etag.current = new Date().getTime());

    //const vars = { ...variables };

    //if ("manifest" in vars)
    //    delete vars["manifest"];

    const context = {
      // formValues,
      // variables,
      fieldInfo: {
        attributeKey,
        entityKey,
        arrayIdx,
      },
      expressionOrder: expressionOrder,
    };

    if (expression && expression.indexOf('@') !== -1) {
      addExpresssion(id, expression, context, (result: unknown, error: unknown) => {
        //

        if (error) {
          setEvaluated({ data: undefined, isLoading: false });
          //  setExpressionResult(id, undefined, error);
          return;
        }

        if (oldvalue.current !== result) {
          //Using an timeout to make sure the render loop is completed beforethe value is changes. If not the value can change back after the new value is placed
          setTimeout(() => {
            setEvaluated({ data: result as T | string | undefined, isLoading: false });
            //     setExpressionResult(id, result, undefined);
            oldvalue.current = result as T | string | undefined;
          }, 0);
        }
      });

      return () => {
        removeExpression(id);
      };
    } else if (expression !== evaluated?.data) {
      setEvaluated({ data: expression, isLoading: false });
    }
  }, [expression]);

  return evaluated;
}
