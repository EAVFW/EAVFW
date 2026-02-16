import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useExpressionParserLoadingContext } from './ExpressionParserAttributeContext';
import { ExpressionOrder, useExpressionParser } from './useExpressionParser';
import { useUuid } from '@eavfw/hooks';

/**
 * Conditionally renders its children based on a `visible` prop that can be
 * either a static boolean or an `@`-prefixed expression string. When an
 * expression is provided it is evaluated via {@link useExpressionParser};
 * children are hidden while the result is loading.
 *
 * @param props.visible - Static `boolean` or expression string (e.g. `"@isAdmin"`).
 * @param props.attributeKey - Optional attribute key for logging / debugging.
 * @param props.onVisibilityCalculated - Callback invoked with the resolved boolean.
 *
 * @example
 * ```tsx
 * <ExpressionParserVisibilityHost visible="@canEdit">
 *   <EditButton />
 * </ExpressionParserVisibilityHost>
 * ```
 */
export const ExpressionParserVisibilityHost = ({
  children,
  visible,
  attributeKey,
  onVisibilityCalculated,
}: PropsWithChildren<{
  onVisibilityCalculated?: (visiblity: boolean) => void;
  visible?: string | boolean;
  attributeKey?: string;
}>) => {
  const { data, isLoading, error } = useExpressionParser<boolean>(
    typeof visible === 'string' ? visible : undefined,
    ExpressionOrder.last,
  );

  const showShow = useMemo(() => {
    if (typeof visible === 'boolean' && visible === false) {
      return false;
    }

    if (isLoading) {
      return undefined;
    }

    if (typeof data === 'boolean' && data === false) {
      return false;
    }

    if (error) {
      return undefined;
    }

    if (typeof data === 'undefined') return undefined;

    return true;
  }, [visible, data, isLoading, error]);

  useEffect(() => {
    if (onVisibilityCalculated && typeof showShow === 'boolean') onVisibilityCalculated(showShow);
  }, [showShow]);

  if (showShow) return <>{children}</>;

  return null;
};
