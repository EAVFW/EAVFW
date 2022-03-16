import React, { useCallback, useMemo, useState,useRef, ReactNode } from "react";
import { ExpressionParserAttributeContext, ExpressionParserAttributeContextType, useExpressionParserAttributeContext } from "./ExpressionParserAttributeContext";
import { ExpressionParserVisibilityHost } from "./ExpressionParserVisibilityHost";


const StyleInjector: React.FC<{ isLoading: boolean }> = ({ children, isLoading }) => {
    const StyledChildren = () =>
        React.Children.map(children, (child:any) =>
            React.cloneElement(child, {
                style: { ...child.props.style, display: isLoading ? 'none' : 'block' },
                ["data-loading"]: isLoading
               // className: `${child.props.className} isLoading`
            })
        );
    //@ts-ignore
    return <StyledChildren />;
};


export const ExpressionParserFieldProvider: React.FC<Omit<ExpressionParserAttributeContextType, "setIsLoading"|"isLoading"> & {
    visible?: string | boolean,
    onVisibilityCalculated?: (visiblity: boolean) => void
}> = ({ onVisibilityCalculated, children, attributeKey, entityKey, visible, arrayIdx }) => {

    const loadingInfo = useRef({});
     
    const [loadingInfoTime, setIsLoadingTime] = useState({});


    const _setIsLoading = useCallback((id, isLoading) => {
        console.log("ExpressionParserFieldProvider Loading: " + attributeKey,[id,isLoading]);
       loadingInfo.current = { ...loadingInfo.current, [id]: isLoading };
        setIsLoadingTime(new Date().getTime());
    }, [loadingInfo]);

    const isLoading = useMemo(() => {
        console.log("ExpressionParserFieldProvider Loading: " + attributeKey, [JSON.stringify( loadingInfo.current), Object.values(loadingInfo.current).filter(v => v).length !== 0])
        return Object.values(loadingInfo.current).filter(v => v).length !== 0;
    }, [loadingInfoTime]);
    const { attributeKey: parentAttributeKey, entityKey: parentEntityKey, arrayIdx: parentArrayIdx } = useExpressionParserAttributeContext();
     

    return (
        <ExpressionParserAttributeContext.Provider value={{ setIsLoading: _setIsLoading, isLoading: isLoading, attributeKey: attributeKey ?? parentAttributeKey, entityKey: entityKey ?? parentEntityKey, arrayIdx: (arrayIdx === -1 || arrayIdx === undefined) ? parentArrayIdx : arrayIdx }}>
            <ExpressionParserVisibilityHost visible={visible} attributeKey={attributeKey} onVisibilityCalculated={onVisibilityCalculated}>
               {children}                
            </ExpressionParserVisibilityHost>
        </ExpressionParserAttributeContext.Provider>
    );
}
