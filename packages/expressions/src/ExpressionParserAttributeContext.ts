import { createContext, Dispatch, SetStateAction, useContext, useEffect } from 'react';
import { useUuid } from '@eavfw/hooks';

/**
 * Describes the attribute-level context available during expression
 * evaluation. Tracks which entity attribute the expression belongs to and
 * whether the expression is still loading.
 */
export type ExpressionParserAttributeContextType = {
  /** The logical name of the attribute being evaluated. */
  attributeKey: string;
  /** The logical name of the entity that owns the attribute. */
  entityKey: string;
  /** Index within an array-type attribute, if applicable. */
  arrayIdx?: number;
  /** `true` while any expression for this attribute is still loading. */
  isLoading: boolean;
  /** Comma-separated list of expression ids registered for this attribute. */
  ids: string;
  /** Report loading state for a specific expression id. */
  setIsLoading: (id: string, isLoading: boolean) => void;
};

/**
 * React context providing per-attribute expression metadata. Consumed by
 * {@link useExpressionParserAttributeContext}.
 */
export const ExpressionParserAttributeContext = createContext<ExpressionParserAttributeContextType>(
  {
    ids: '',
    isLoading: false,
    attributeKey: '',
    entityKey: '',
    arrayIdx: -1,
    setIsLoading: () => {},
  },
);

/**
 * Returns the current {@link ExpressionParserAttributeContextType} for the
 * nearest attribute scope.
 *
 * @returns The attribute-level expression context.
 */
export const useExpressionParserAttributeContext = () =>
  useContext(ExpressionParserAttributeContext);
/**
 * Hook that synchronises a component's loading state with the attribute
 * expression context. Call this from any component that performs async
 * expression evaluation so parent components can track overall loading.
 *
 * @param isLoading - Whether the expression is currently loading.
 * @param id - A unique identifier for this expression instance.
 */
export const useExpressionParserLoadingContext = (isLoading: boolean, id: string) => {
  const { setIsLoading, attributeKey } = useExpressionParserAttributeContext();
  // const id = useUuid();

  useEffect(() => {
    setIsLoading(id, isLoading);
  }, [isLoading]);
};
