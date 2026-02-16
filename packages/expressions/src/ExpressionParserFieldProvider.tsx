import React, { useCallback, useMemo, useState, useRef, ReactNode, PropsWithChildren } from 'react';
import {
  ExpressionParserAttributeContext,
  ExpressionParserAttributeContextType,
  useExpressionParserAttributeContext,
} from './ExpressionParserAttributeContext';
import { ExpressionParserVisibilityHost } from './ExpressionParserVisibilityHost';

const StyleInjector = ({ children, isLoading }: PropsWithChildren<{ isLoading: boolean }>) => {
  const StyledChildren = () =>
    React.Children.map(children, (child) =>
      React.isValidElement<{ style?: React.CSSProperties; className?: string }>(child)
        ? React.cloneElement(child, {
            style: { ...child.props.style, display: isLoading ? 'none' : 'block' },
            ['data-loading' as string]: isLoading,
          })
        : child,
    );
  return <StyledChildren />;
};

/**
 * Provides per-attribute expression context and visibility evaluation for a
 * single form control. Wraps its children in an
 * {@link ExpressionParserAttributeContext} and an
 * {@link ExpressionParserVisibilityHost}.
 *
 * @param props.attributeKey - The logical name of the attribute.
 * @param props.entityKey - The logical name of the owning entity.
 * @param props.visible - A boolean or expression string controlling visibility.
 * @param props.arrayIdx - Index for array-type attributes.
 * @param props.onVisibilityCalculated - Callback fired when visibility resolves.
 *
 * @example
 * ```tsx
 * <ExpressionParserFieldProvider
 *   attributeKey="status"
 *   entityKey="account"
 *   visible="@isAdmin"
 * >
 *   <StatusControl />
 * </ExpressionParserFieldProvider>
 * ```
 */
export const ExpressionParserFieldProvider = ({
  onVisibilityCalculated,
  children,
  attributeKey,
  entityKey,
  visible,
  arrayIdx,
}: PropsWithChildren<
  Omit<ExpressionParserAttributeContextType, 'setIsLoading' | 'isLoading' | 'ids'> & {
    visible?: string | boolean;
    onVisibilityCalculated?: (visiblity: boolean) => void;
  }
>) => {
  const loadingInfo = useRef({});

  const [loadingInfoTime, setIsLoadingTime] = useState({});

  const _setIsLoading = useCallback(
    (id: string, isLoading: boolean) => {
      loadingInfo.current = { ...loadingInfo.current, [id]: isLoading };
      setIsLoadingTime(new Date().getTime());
    },
    [loadingInfo],
  );

  const isLoading = useMemo(() => {
    return Object.values(loadingInfo.current).filter((v) => v).length !== 0;
  }, [loadingInfoTime]);
  const {
    attributeKey: parentAttributeKey,
    entityKey: parentEntityKey,
    arrayIdx: parentArrayIdx,
  } = useExpressionParserAttributeContext();

  return (
    <ExpressionParserAttributeContext.Provider
      value={{
        ids: Object.keys(loadingInfo.current).join(','),
        setIsLoading: _setIsLoading,
        isLoading: isLoading,
        attributeKey: attributeKey ?? parentAttributeKey,
        entityKey: entityKey ?? parentEntityKey,
        arrayIdx: arrayIdx === -1 || arrayIdx === undefined ? parentArrayIdx : arrayIdx,
      }}
    >
      <ExpressionParserVisibilityHost
        visible={visible}
        attributeKey={attributeKey}
        onVisibilityCalculated={onVisibilityCalculated}
      >
        {children}
      </ExpressionParserVisibilityHost>
    </ExpressionParserAttributeContext.Provider>
  );
};
