import { useContext } from 'react';
import { ExpressionParserContext } from './ExpressionParserContext';

/**
 * Convenience hook that returns the current {@link ExpressionParserContextType}.
 * Must be used inside an {@link ExpressionParserContextProvider}.
 *
 * @returns The expression parser context value.
 *
 * @example
 * ```tsx
 * const { variables, appendVariables } = useExpressionParserContext();
 * ```
 */
export const useExpressionParserContext = () => useContext(ExpressionParserContext);
