import React from "react";
import { ExpressionParserAttributeContext, ExpressionParserAttributeContextType, useExpressionParserAttributeContext } from "./ExpressionParserAttributeContext";
import { ExpressionParserVisibilityHost } from "./ExpressionParserVisibilityHost";



export const ExpressionParserFieldProvider: React.FC<ExpressionParserAttributeContextType & { visible?: string | boolean }> = ({ children, attributeKey, entityKey, visible, arrayIdx }) => {

    const { attributeKey: parentAttributeKey, entityKey: parentEntityKey, arrayIdx: parentArrayIdx } = useExpressionParserAttributeContext();

    return <ExpressionParserAttributeContext.Provider value={{ attributeKey: attributeKey ?? parentAttributeKey, entityKey: entityKey ?? parentEntityKey, arrayIdx: (arrayIdx === -1 || arrayIdx === undefined) ? parentArrayIdx : arrayIdx }}>
        <ExpressionParserVisibilityHost visible={visible} attributeKey={attributeKey}>
            {children}
        </ExpressionParserVisibilityHost>
    </ExpressionParserAttributeContext.Provider>;
}
