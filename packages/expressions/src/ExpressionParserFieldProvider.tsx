import React from "react";
import { ExpressionParserAttributeContext, ExpressionParserAttributeContextType, useExpressionParserAttributeContext } from "./ExpressionParserAttributeContext";
import { ExpressionParserVisibilityHost } from "./ExpressionParserVisibilityHost";



export const ExpressionParserFieldProvider: React.FC<ExpressionParserAttributeContextType & {
    visible?: string | boolean,
    onVisibilityCalculated?: (visiblity: boolean) => void
    onLoading?: React.FC<any>
}> = ({ onVisibilityCalculated, children, attributeKey, entityKey, visible, arrayIdx, onLoading }) => {

    const { attributeKey: parentAttributeKey, entityKey: parentEntityKey, arrayIdx: parentArrayIdx } = useExpressionParserAttributeContext();

    return (
        <ExpressionParserAttributeContext.Provider value={{ attributeKey: attributeKey ?? parentAttributeKey, entityKey: entityKey ?? parentEntityKey, arrayIdx: (arrayIdx === -1 || arrayIdx === undefined) ? parentArrayIdx : arrayIdx }}>
            <ExpressionParserVisibilityHost onLoading={onLoading } visible={visible} attributeKey={attributeKey} onVisibilityCalculated={onVisibilityCalculated}>
                {children}
            </ExpressionParserVisibilityHost>
        </ExpressionParserAttributeContext.Provider>
    );
}
