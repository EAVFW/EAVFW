/**
 * @module @eavfw/expressions
 *
 * Expression parsing and evaluation for EAVFW manifests. Expressions use
 * `@`-prefixed syntax (e.g., `@currentUser.name`) and are evaluated via a
 * Blazor WebAssembly bridge. This package provides the React context
 * providers, hooks, and visibility host needed to wire expression evaluation
 * into form controls.
 */

export * from './useExpressionParser';
export * from './useExpressionParserContext';
export * from './ExpressionParserContextProvider';
export * from './ExpressionParserFieldProvider';
export * from './ExpressionParserVisibilityHost';
export * from './ExpressionParserAttributeContext';
