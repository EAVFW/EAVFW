/**
 * Shape of the value provided by {@link ExpressionParserContext}. Holds the
 * current variable state, registered expressions and their results, and
 * methods for adding/removing expressions at runtime.
 *
 * @example
 * ```ts
 * const ctx: ExpressionParserContextType = useExpressionParserContext();
 * ctx.appendVariables({ currentUser: { name: 'Admin' } });
 * ```
 */
export type ExpressionParserContextType = {
  /** Merge additional variables into the expression evaluation scope. */
  appendVariables: (variables: Record<string, unknown>) => void;
  /** Register an expression to be evaluated by the Blazor runtime. */
  addExpresssion: (
    id: string,
    expression: string,
    context: Record<string, unknown>,
    oncallback: (data: unknown, error: unknown, id?: string) => void,
  ) => void;
  /** Remove a previously registered expression by its unique id. */
  removeExpression: (id: string) => void;
  /** Update the form values used as input for expression evaluation. */
  setFormValues: (values: Record<string, unknown>) => void;
  /** Current variable scope available to all expressions. */
  variables: Record<string, unknown>;
  /** `true` when every registered expression has finished evaluating. */
  allExpressionEvaluated: boolean;
  /** `true` when the Blazor runtime has received the latest variable snapshot. */
  isVariablesUpToDate: boolean;
  /** Current form values passed to the expression engine. */
  formValues: Record<string, unknown>;
  /** `true` once both variables and expressions have been sent to Blazor. */
  isInitialized: boolean;
  /** Map of expression id to its latest evaluation result. */
  expressionsResults: Record<string, unknown>;
};
