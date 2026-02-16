import { createContext, useContext } from 'react';
import { ExpressionParserContextType } from './ExpressionParserContextType';

/**
 * React context that carries the expression parser state and methods.
 * Provided by {@link ExpressionParserContextProvider} and consumed via
 * {@link useExpressionParserContext}.
 */
export const ExpressionParserContext = createContext<ExpressionParserContextType>({
  appendVariables: (variables) => undefined,
  addExpresssion: (expression) => undefined,
  removeExpression: (id) => undefined,
  allExpressionEvaluated: false,
  formValues: {},
  variables: {},
  expressionsResults: {},
  isVariablesUpToDate: false,
  isInitialized: false,
  setFormValues: (values) => undefined,
});
